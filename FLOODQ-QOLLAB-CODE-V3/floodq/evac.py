"""
Who has to leave, where they can go, and the statewide assignment problem.

For each decision time (when the evacuation order goes out):

1. Risk. From the eight-member track ensemble (storm.StormRun.ensemble) every cell gets the
   chance of 0.5 m+ of storm-surge water and of hurricane-force wind. Red zone (evacuate):
   0.5 m+ water has a 10 %+ chance. Orange (shadow evacuation): 15 cm+ has a 5 %+ chance.
   Mobile homes empty where hurricane-force wind has a 10 %+ chance; those people go to
   local shelters and are counted, not routed.
2. Groups. Surge-zone evacuees form one group per county; counties with more than 80,000
   evacuees are split into areas (weighted k-means) so one county is not one choice.
   Each group leaves over a departure window of up to 12 h that must end 2 h before
   tropical-storm winds reach it.
3. Destinations. Inland shelters and hotels the ensemble keeps out of hurricane-force wind
   and surge, plus a "local refuge" on high, dry, populated ground in the group's county.
4. Options. Up to three (destination, route) pairs per group: the local refuge, the best
   regional destination, and an alternative that avoids the best route's highways. A route
   only counts if every link is passed before it closes or tropical-storm winds arrive
   (Florida's clearance-time rule).
5. Problem: choose one option per group to minimise
     travel (vehicle-hours) + RISK_H x vehicles x chance of hurricane winds at the destination
     + congestion on highways: sum over links of K t0 W (flow)^2 / capacity  (Neukart et al. 2017)
     + crowding: CROWD_H x vehicles-per-person x (people)^2 / capacity
     + LATE_H x vehicles x share of departures that could not clear every road in time.
   The squares couple groups that share a highway or a destination.
6. Clusters. Interacting groups form clusters of at most four groups (12 qubits) so each fits a
   circuit; clusters see the rest of the state through the current best plan (block coordinate
   descent, as in divide-and-conquer QAOA).
Every plan is then scored without the surrogate: highway links get BPR delay up to capacity
and a deterministic queue beyond it, and each group's clearance is checked.
"""
import itertools
import math

import numpy as np

from . import geo, places, storm

W_MAX = places.DEPARTURE_WINDOW_H
BPR_K = 0.15              # delay below capacity: 15 % of free-flow time at full load (BPR)
QUEUE_K = 0.5             # shared-bottleneck queue (cross term of the deterministic queue)
CROWD_H = 3.0
RISK_H = 6.0
LATE_H = 48.0             # hours per vehicle for the share of departures that could not clear in time
MAX_GROUPS_PER_CLUSTER = 4
MAX_QUBITS = 12
MIN_GROUP_PEOPLE = 2000
SPLIT_PEOPLE = 80000
RED_P, ORANGE_P = 0.10, 0.05
TRUNK = ("interstate", "expressway", "us_major", "us")
LOCAL_KM = 10.0           # first km of every trip run on local streets (not modelled)
LOCAL_DETOUR, LOCAL_KMH = 1.35, 45.0   # local-street trips: 35 % longer than straight, 45 km/h


def _coarse_to_fine():
    i = np.clip(((geo.BBOX["lat_max"] - geo.LAT2) // storm.COARSE).astype(int), 0, storm.CNY - 1)
    j = np.clip(((geo.LON2 - geo.BBOX["lon_min"]) // storm.COARSE).astype(int), 0, storm.CNX - 1)
    return i * storm.CNX + j


C2F = _coarse_to_fine()


def host_wind_probability(run, ens, lats, lons):
    """Chance of hurricane-force (64 kt) and tropical-storm (34 kt) wind at points, and the
    earliest hour any member brings 34 kt there (None if none does)."""
    lats = np.asarray(lats, float)
    lons = np.asarray(lons, float)
    water = ~storm.is_land(lats, lons).astype(bool)
    w = ens["weights"]
    hu = np.zeros(len(lats))
    ts = np.zeros(len(lats))
    first = np.full(len(lats), np.inf)
    t0 = run.hours.index(ens["stage"])
    for m, mt in enumerate(ens["tracks"]):
        peak = np.zeros(len(lats))
        for t in range(t0, len(run.hours), 2):
            kt = mt.wind(run.kidx[t], lats, lons, over_water=water)[0] / storm.KT
            first = np.where((kt >= 34) & (run.hours[t] < first), run.hours[t], first)
            peak = np.maximum(peak, kt)
        hu += w[m] * (peak >= 64)
        ts += w[m] * (peak >= 34)
    return hu, ts, [None if not math.isfinite(f) else int(f) for f in first]


def _kmeans(points, weights, k, iters=12, seed=1):
    rng = np.random.default_rng(seed)
    p = points
    w = weights / weights.sum()
    idx = rng.choice(len(p), size=k, replace=False, p=w)
    c = p[idx].copy()
    for _ in range(iters):
        d = ((p[:, None, :] - c[None, :, :]) ** 2).sum(-1)
        lab = d.argmin(1)
        for j in range(k):
            m = lab == j
            if m.any():
                c[j] = (p[m] * w[m, None]).sum(0) / w[m].sum()
    return lab, c


class StagePlan:
    def __init__(self, run, net, status_info, stage_hour):
        self.run, self.net, self.stage = run, net, stage_hour
        self.status, self.close_h, self.ts_h = status_info
        self.open_until = np.minimum(self.close_h, self.ts_h).astype(float)
        self.ens = run.ensemble(stage_hour)
        self.trunk = np.array([e["cls"] in TRUNK for e in net.edges])
        self._risk()
        self._groups()
        self._hosts()
        self._options()
        self._problem()

    # ---------------------------------------------------------------------------
    def _risk(self):
        run, ens = self.run, self.ens
        z = run.z_eff
        ok = geo.LAND & (z < 98) & ~run.normally_wet
        p05 = np.zeros((geo.NY, geo.NX))
        p015 = np.zeros((geo.NY, geo.NX))
        for m, wm in enumerate(ens["weights"]):
            d = ens["seg_peak"][m][geo.SEG_OF] - z
            p05 += wm * ((d >= 0.5) & ok)
            p015 += wm * ((d >= 0.15) & ok)
        self.p_surge = p05
        self.p_wet = p015
        self.p_hu_coarse = (ens["weights"][:, None] * (ens["wind_peak"] >= 64)).sum(0)
        self.p_ts_coarse = (ens["weights"][:, None] * (ens["wind_peak"] >= 34)).sum(0)
        p_hu = self.p_hu_coarse[C2F]
        self.red = (p05 >= RED_P) & geo.LAND
        self.orange = (~self.red) & (p015 >= ORANGE_P) & geo.LAND
        self.mobile = (p_hu >= 0.10) & geo.LAND & ~self.red
        pop = geo.POP
        self.leave = pop * self.red * places.LEAVE_IN_ZONE + pop * self.orange * places.SHADOW
        self.mobile_people = pop * self.mobile * places.MOBILE_HOME_SHARE * places.LEAVE_MOBILE_HOME
        self.people_red = float((pop * self.red).sum())
        self.people_orange = float((pop * self.orange).sum())

    def _area_name(self, ci, lat, lon, taken):
        """Name a part of a county after its most prominent nearby town not used yet."""
        fips = geo.COUNTIES[ci]["fips"]
        ranked = []
        for name, la, lo, popn, cf in geo.CITIES:
            if cf != fips:
                continue
            d = float(geo.km(lat, lon, la, lo))
            ranked.append((d / math.sqrt(max(popn, 1000) / 1000.0), name))
        for _, name in sorted(ranked):
            if name not in taken:
                return name
        return None

    def _groups(self):
        leave, pop, run = self.leave, geo.POP, self.run
        groups = []
        for ci, c in enumerate(geo.COUNTIES):
            mask = (geo.COUNTY == ci) & (leave > 0)
            people = float(leave[mask].sum())
            if people < MIN_GROUP_PEOPLE:
                continue
            ii, jj = np.nonzero(mask)
            wts = leave[ii, jj]
            k = int(min(4, math.ceil(people / SPLIT_PEOPLE)))
            if k > 1:
                pts = np.column_stack([geo.LAT2[ii, jj] * geo.KM_LAT, geo.LON2[ii, jj] * geo.KM_LON])
                lab, _ = _kmeans(pts, wts, k)
            else:
                lab = np.zeros(len(ii), int)
            taken = set()
            for part in range(k):
                sel = lab == part
                pp = float(wts[sel].sum())
                if pp < MIN_GROUP_PEOPLE * 0.5:
                    continue
                lat = float((geo.LAT2[ii[sel], jj[sel]] * wts[sel]).sum() / pp)
                lon = float((geo.LON2[ii[sel], jj[sel]] * wts[sel]).sum() / pp)
                rp = np.where(self.red[ii[sel], jj[sel]], pop[ii[sel], jj[sel]], 0)
                kk = int(np.argmax(rp)) if rp.max() > 0 else int(np.argmax(wts[sel]))
                site = (int(ii[sel][kk]), int(jj[sel][kk]))
                name = c["name"]
                if k > 1:
                    area = self._area_name(ci, lat, lon, taken)
                    taken.add(area)
                    name = "{}: {}".format(c["name"], area) if area else "{} ({}/{})".format(c["name"], part + 1, k)
                cc = storm.coarse_cell(lat, lon)
                ts_t = int(run.ts_arrival[cc]) if cc is not None else 255
                ts_hour = run.hours[ts_t] if ts_t != 255 else None
                window = W_MAX if ts_hour is None else float(np.clip(ts_hour - 2 - self.stage, 4, W_MAX))
                groups.append({
                    "county": ci, "name": name, "people": pp,
                    "vehicles": pp * places.VEHICLES_PER_PERSON, "window": window,
                    "people_red": float((pop[ii[sel], jj[sel]] * self.red[ii[sel], jj[sel]]).sum()),
                    "lat": lat, "lon": lon, "site": site, "ts_hour": ts_hour,
                    "node": self.net.nearest_node(lat, lon),
                })
        groups.sort(key=lambda g: -g["people"])
        self.groups = groups
        self.mobile_by_county = {}
        for ci, c in enumerate(geo.COUNTIES):
            v = float(self.mobile_people[geo.COUNTY == ci].sum())
            if v >= 200:
                self.mobile_by_county[c["name"]] = v

    def _hosts(self):
        run, ens = self.run, self.ens
        hosts = []
        H = places.HOSTS
        hu_all, ts_all, first_all = host_wind_probability(run, ens, [h[2] for h in H], [h[3] for h in H])
        for k, (hid, name, lat, lon, cap) in enumerate(H):
            cell = geo.cell_of(lat, lon)
            ps = float(self.p_wet[cell]) if cell else 0.0
            hu, ts = float(hu_all[k]), float(ts_all[k])
            hosts.append({"id": hid, "name": name, "lat": lat, "lon": lon, "cap": float(cap),
                          "node": self.net.nearest_node(lat, lon), "p_hu": hu, "p_ts": ts,
                          "p_surge": ps, "safe": hu < 0.10 and ps < 0.02, "local_for": None,
                          "ts_first": first_all[k]})
        # one local refuge per county with groups: high, dry, populated ground
        made = {}
        for gi, g in enumerate(self.groups):
            ci = g["county"]
            if ci in made:
                g["local_host"] = made[ci]
                continue
            cand = ((geo.COUNTY == ci) & geo.LAND & ~self.red & ~self.orange & (self.p_wet < 0.02) &
                    (run.elev >= 2.5) & (geo.POP > 50))
            d = geo.km(g["lat"], g["lon"], geo.LAT2, geo.LON2)
            cand &= d <= 50
            if not cand.any():
                made[ci] = None
                g["local_host"] = None
                continue
            w = geo.POP * cand
            lat = float((geo.LAT2 * w).sum() / w.sum())
            lon = float((geo.LON2 * w).sum() / w.sum())
            cell = geo.cell_of(lat, lon)
            if cell is None or not cand[cell]:
                i, j = np.unravel_index(int(np.argmax(w)), w.shape)
                lat, lon = float(geo.LAT2[i, j]), float(geo.LON2[i, j])
            cc = storm.coarse_cell(lat, lon)
            hu = float(self.p_hu_coarse[cc]) if cc is not None else 0.0
            ts = float(self.p_ts_coarse[cc]) if cc is not None else 0.0
            hosts.append({"id": "local-" + geo.COUNTIES[ci]["fips"],
                          "name": "High ground, " + geo.COUNTIES[ci]["name"] + " County",
                          "lat": lat, "lon": lon, "cap": float(places.LOCAL_SHARE * geo.COUNTIES[ci]["pop"]),
                          "node": self.net.nearest_node(lat, lon), "p_hu": hu, "p_ts": ts,
                          "p_surge": 0.0, "safe": True, "local_for": ci, "ts_first": None})
            made[ci] = len(hosts) - 1
            g["local_host"] = made[ci]
        self.hosts = hosts

    # ---------------------------------------------------------------------------
    def _route(self, src, t_dep, extra=None):
        return self.net.dijkstra(src, t_dep, self.open_until, extra=extra)

    def _options(self):
        net = self.net
        for gi, g in enumerate(self.groups):
            t_dep = self.stage + g["window"] / 2.0
            dist, prev = self._route(g["node"], t_dep)
            cands = []
            for hi, h in enumerate(self.hosts):
                if not h["safe"]:
                    continue
                if h["local_for"] is not None and hi != g.get("local_host"):
                    continue
                if not math.isfinite(dist[h["node"]]):
                    continue
                edges = net.path_edges(prev, g["node"], h["node"])
                if edges is None:
                    continue
                t = float(dist[h["node"]] - t_dep)
                score = t + RISK_H * h["p_hu"]
                cands.append({"host": hi, "edges": edges, "hours": t, "score": score})
            opts = []
            local = [c for c in cands if self.hosts[c["host"]]["local_for"] is not None]
            lh = g.get("local_host")
            if not local and lh is not None:
                # no highway path in time: high ground in the county may still be reachable on local streets
                h = self.hosts[lh]
                crow = float(geo.km(g["lat"], g["lon"], h["lat"], h["lon"]))
                t_local = LOCAL_DETOUR * crow / LOCAL_KMH
                if crow <= 50 and (g["ts_hour"] is None or t_dep + t_local <= g["ts_hour"]):
                    local = [{"host": lh, "edges": [], "hours": t_local, "score": t_local}]
            regional = sorted([c for c in cands if self.hosts[c["host"]]["local_for"] is None],
                              key=lambda c: c["score"])
            regional = [c for c in regional if self.hosts[c["host"]]["cap"] >= 0.2 * g["people"]] or regional
            if local:
                opts.append(local[0])
            if regional:
                opts.append(regional[0])
                pen = np.zeros(net.m)
                pen[regional[0]["edges"]] = 0.5 * net.t0[regional[0]["edges"]] + 0.15
                d2, p2 = self._route(g["node"], t_dep, extra=pen)
                base = set(regional[0]["edges"])
                best_alt = None
                for c in regional:
                    h = self.hosts[c["host"]]
                    if not math.isfinite(d2[h["node"]]):
                        continue
                    e2 = net.path_edges(p2, g["node"], h["node"])
                    if not e2:
                        continue
                    shared = sum(net.km[e] for e in e2 if e in base) / max(sum(net.km[e] for e in e2), 1e-6)
                    if shared > 0.6 and c["host"] == regional[0]["host"]:
                        continue
                    t = float(d2[h["node"]] - t_dep)
                    sc = t + RISK_H * h["p_hu"] + 0.5 * shared
                    if best_alt is None or sc < best_alt["score"]:
                        best_alt = {"host": c["host"], "edges": e2, "hours": t, "score": sc}
                if best_alt is not None:
                    opts.append(best_alt)
                if len(opts) < 3:
                    for c in regional[1:]:
                        if all(c["host"] != o["host"] for o in opts):
                            opts.append(c)
                            break
            for o in opts:
                o["km"] = float(sum(net.km[e] for e in o["edges"]))
                o["t0"] = float(sum(net.t0[e] for e in o["edges"]))
                o["local_streets"] = False
                h = self.hosts[o["host"]]
                if h["local_for"] is not None:
                    # A move to high ground in the same county spreads over the local street grid
                    # (which the highway graph lacks), so it is not loaded onto one highway.
                    crow = float(geo.km(g["lat"], g["lon"], h["lat"], h["lon"]))
                    if crow <= 50:
                        t_local = LOCAL_DETOUR * crow / LOCAL_KMH
                        o.update({"edges": [], "km": LOCAL_DETOUR * crow, "t0": t_local, "local_streets": True})
                # highway links past the first LOCAL_KM carry the group's flow (congestion)
                cum = np.cumsum([net.km[e] for e in o["edges"]]) if o["edges"] else np.array([])
                o["loaded"] = [e for e, c in zip(o["edges"], cum) if self.trunk[e] and c > LOCAL_KM]
                # share of the departure window too late to clear every road at free-flow speed
                if o["edges"]:
                    t_in = np.concatenate([[0.0], np.cumsum(net.t0[o["edges"]])[:-1]])
                    latest = float((self.open_until[o["edges"]] - t_in).min())
                else:
                    latest = (g["ts_hour"] - o["t0"]) if g["ts_hour"] is not None else 1e9
                o["late_free"] = float(np.clip((self.stage + g["window"] - latest) / g["window"], 0.0, 1.0))
            g["options"] = opts[:3]
        self.stranded = [g for g in self.groups if not g["options"]]
        self.groups = [g for g in self.groups if g["options"]]

    # ---------------------------------------------------------------------------
    def _problem(self):
        """Linear and pairwise costs on flat ids f = g * 3 + o, all in vehicle-hours.

        Congestion has two parts. Below capacity, a BPR-like delay on every highway link
        (Neukart et al.'s squared load, weighted by the link's free-flow time). At capacity,
        a deterministic queue at the route's bottleneck (Vickrey's bottleneck model): a group
        sending f vehicles/h for W hours through capacity C queues max(0, f/C - 1) W/2 hours
        on average, and two groups sharing a bottleneck add about W^2 f_a f_b / (2 C) to the
        total, which is the cross term of that queue's square."""
        net, hosts = self.net, self.hosts
        G, S = len(self.groups), 3
        lin = np.zeros(G * S)
        quad = {}
        uses, at_host, info = {}, {}, {}
        for gi, g in enumerate(self.groups):
            v = g["vehicles"]
            W = g["window"]
            rate = v / W
            for oi, o in enumerate(g["options"]):
                f = gi * S + oi
                h = hosts[o["host"]]
                cb = float(net.cap[o["loaded"]].min()) if o["loaded"] else float("inf")
                q_self = max(0.0, rate / cb - 1.0) * W / 2.0
                # lateness including the group's own queue at its bottleneck
                late = o["late_free"]
                if q_self > 0:
                    late = max(late, min(1.0, q_self / W + late))
                o["queue_self"] = q_self
                lin[f] += (v * o["t0"] + RISK_H * v * h["p_hu"] + LATE_H * v * late + v * q_self)
                for e in o["loaded"]:
                    uses.setdefault(e, []).append((f, rate, W))
                at_host.setdefault(o["host"], []).append((f, g["people"]))
                info[f] = (rate, W, set(o["loaded"]))

        def add(a, b, val):
            key = (min(a, b), max(a, b))
            quad[key] = quad.get(key, 0.0) + val
        for e, lst in uses.items():
            k = BPR_K * net.t0[e] / net.cap[e]
            for a in range(len(lst)):
                fa, ra, wa = lst[a]
                lin[fa] += k * wa * ra * ra
                for b in range(a + 1, len(lst)):
                    fb, rb, wb = lst[b]
                    if fa // S != fb // S:
                        add(fa, fb, 2 * k * 0.5 * (wa + wb) * ra * rb)
        # shared bottlenecks: one queue term per pair of options, at their tightest shared link
        keys = sorted(info)
        for i, fa in enumerate(keys):
            ra, wa, la = info[fa]
            if not la:
                continue
            for fb in keys[i + 1:]:
                if fa // S == fb // S:
                    continue
                rb, wb, lb = info[fb]
                shared = la & lb
                if not shared:
                    continue
                cmin = float(min(net.cap[e] for e in shared))
                w = 0.5 * (wa + wb)
                add(fa, fb, QUEUE_K * w * w * ra * rb / cmin)
        for hi, lst in at_host.items():
            k = CROWD_H * places.VEHICLES_PER_PERSON / hosts[hi]["cap"]
            for a in range(len(lst)):
                fa, pa = lst[a]
                lin[fa] += k * pa * pa
                for b in range(a + 1, len(lst)):
                    fb, pb = lst[b]
                    if fa // S != fb // S:
                        add(fa, fb, 2 * k * pa * pb)
        self.S, self.lin, self.quad = S, lin, quad
        self.n_opts = [len(g["options"]) for g in self.groups]

    def cost(self, plan):
        S = self.S
        on = [gi * S + o for gi, o in enumerate(plan)]
        s = set(on)
        return float(sum(self.lin[f] for f in on) + sum(v for (a, b), v in self.quad.items() if a in s and b in s))

    # ---------------------------------------------------------------------------
    def evaluate(self, plan):
        """Honest score: BPR delay up to capacity plus a deterministic queue beyond it (the
        worst bottleneck on a route), clearance before closure or tropical-storm winds,
        destination overload and wind exposure."""
        net, hosts = self.net, self.hosts
        vol = np.zeros(net.m)
        for gi, o in enumerate(plan):
            g = self.groups[gi]
            for e in g["options"][o]["loaded"]:
                vol[e] += g["vehicles"] / g["window"]
        vc = vol / net.cap
        bpr = 1.0 + 0.15 * np.minimum(vc, 1.0) ** 4
        loads = {}
        veh_hours = caught = exposure = 0.0
        per_group = []
        for gi, o in enumerate(plan):
            g = self.groups[gi]
            opt = g["options"][o]
            h = hosts[opt["host"]]
            e = np.asarray(opt["edges"], int)
            drive = net.t0[e] * bpr[e] if len(e) else np.array([opt["t0"]])   # local streets: t0 is the trip
            queue = float(max([0.0] + [(vc[x] - 1.0) * g["window"] / 2.0 for x in opt["loaded"] if vc[x] > 1.0]))
            T = float(drive.sum()) + queue
            veh_hours += g["vehicles"] * T
            loads[opt["host"]] = loads.get(opt["host"], 0.0) + g["people"]
            exposure += g["people"] * h["p_hu"]
            entry = np.concatenate([[0.0], np.cumsum(drive)[:-1]]) + queue * 0.5
            if len(e):
                limit = self.open_until[e] - entry
            else:   # local streets: must arrive before tropical-storm winds reach the area
                limit = np.array([(g["ts_hour"] - T) if g["ts_hour"] is not None else 1e9])
            latest = float(limit.min())
            late = float(np.clip((self.stage + g["window"] - latest) / g["window"], 0.0, 1.0))
            caught += g["vehicles"] * late
            per_group.append({"hours": round(T, 2), "queue_hours": round(queue, 2),
                              "latest_departure": round(latest, 1) if latest < 1e8 else None,
                              "late_share": round(late, 3)})
        over = sum(max(0.0, load - hosts[hi]["cap"]) for hi, load in loads.items())
        return {"vehicle_hours": int(round(veh_hours)), "max_vc": round(float(vc.max()), 2) if len(vc) else 0.0,
                "busiest_link": int(np.argmax(vc)) if len(vc) else 0,
                "overload_people": int(round(over)), "caught_vehicles": int(round(caught)),
                "wind_exposed_people": int(round(exposure)), "surrogate": int(round(self.cost(plan))),
                "groups": per_group, "link_vc": vc, "loads": loads}

    # ---------------------------------------------------------------------------
    def plan_fastest(self):
        """Every group takes its own quickest option, ignoring everyone else."""
        return tuple(int(np.argmin([o["t0"] for o in g["options"]])) for g in self.groups)

    def plan_greedy(self):
        """Largest groups first, each taking the option that adds the least cost so far."""
        S, chosen = self.S, {}
        for gi in sorted(range(len(self.groups)), key=lambda x: -self.groups[x]["vehicles"]):
            best, bv = 0, math.inf
            for o in range(self.n_opts[gi]):
                f = gi * S + o
                c = self.lin[f] + sum(self.quad.get((min(f, gj * S + oj), max(f, gj * S + oj)), 0.0)
                                      for gj, oj in chosen.items())
                if c < bv:
                    best, bv = o, c
            chosen[gi] = best
        return tuple(chosen[gi] for gi in range(len(self.groups)))

    def plan_anneal(self, sweeps=300, seed=3):
        rng = np.random.default_rng(seed)
        plan = list(self.plan_greedy())
        if not plan:
            return tuple()
        cur = self.cost(plan)
        best, bc = list(plan), cur
        T0 = max(abs(cur) * 0.02, 1.0)
        for s in range(sweeps):
            T = T0 * (1 - s / sweeps) + 1e-6
            for gi in rng.permutation(len(plan)):
                if self.n_opts[gi] < 2:
                    continue
                o = int(rng.integers(self.n_opts[gi]))
                if o == plan[gi]:
                    continue
                old = plan[gi]
                plan[gi] = o
                c = self.cost(plan)
                if c <= cur or rng.random() < math.exp(-(c - cur) / T):
                    cur = c
                    if c < bc:
                        best, bc = list(plan), c
                else:
                    plan[gi] = old
        return tuple(best)

    def plan_exact(self, limit=600000):
        """Exhaustive optimum of the surrogate when the number of plans is small enough."""
        total = int(np.prod([float(n) for n in self.n_opts])) if self.n_opts else 1
        if total > limit or not self.n_opts:
            return None
        S, G = self.S, len(self.groups)
        grids = np.array(list(itertools.product(*[range(n) for n in self.n_opts])), dtype=np.int16)
        cost = np.zeros(len(grids))
        for gi in range(G):
            cost += self.lin[gi * S + grids[:, gi]]
        for (a, b), v in self.quad.items():
            cost += v * ((grids[:, a // S] == a % S) & (grids[:, b // S] == b % S))
        return tuple(int(x) for x in grids[int(np.argmin(cost))])

    # ---------------------------------------------------------------------------
    def clusters(self):
        S, G = self.S, len(self.groups)
        wgt = {}
        for (a, b), v in self.quad.items():
            key = (min(a // S, b // S), max(a // S, b // S))
            wgt[key] = wgt.get(key, 0.0) + abs(v)
        cl = [[g] for g in range(G)]
        while True:
            best, bv = None, 0.0
            for x in range(len(cl)):
                for y in range(x + 1, len(cl)):
                    merged = cl[x] + cl[y]
                    if (len(merged) > MAX_GROUPS_PER_CLUSTER or
                            sum(self.n_opts[g] for g in merged) > MAX_QUBITS):
                        continue
                    w = sum(wgt.get((min(a, b), max(a, b)), 0.0) for a in cl[x] for b in cl[y])
                    if w > bv:
                        best, bv = (x, y), w
            if best is None:
                break
            x, y = best
            cl[x] = cl[x] + cl[y]
            del cl[y]
        cl = [sorted(c) for c in cl]
        cl.sort(key=lambda c: -sum(self.groups[g]["vehicles"] for g in c))
        return cl

    def cluster_problem(self, members, incumbent):
        """One cluster's linear and pairwise terms with every other group fixed at the incumbent."""
        S = self.S
        idx = {g: k for k, g in enumerate(members)}
        lin = np.zeros(len(members) * S)
        quad = {}
        for g in members:
            for o in range(self.n_opts[g]):
                lin[idx[g] * S + o] = self.lin[g * S + o]
        for (a, b), v in self.quad.items():
            ga, gb = a // S, b // S
            if ga in idx and gb in idx:
                quad[(idx[ga] * S + a % S, idx[gb] * S + b % S)] = v
            elif ga in idx and incumbent[gb] == b % S:
                lin[idx[ga] * S + a % S] += v
            elif gb in idx and incumbent[ga] == a % S:
                lin[idx[gb] * S + b % S] += v
        return lin, quad, [list(range(self.n_opts[g])) for g in members]

    def plan_decomposed(self, start=None, sweeps=4):
        """Block coordinate descent over clusters, each solved exactly."""
        plan = list(start if start is not None else self.plan_greedy())
        cls = self.clusters()
        for _ in range(sweeps):
            changed = False
            for members in cls:
                lin, quad, options = self.cluster_problem(members, plan)
                best, bv = None, math.inf
                for combo in itertools.product(*options):
                    on = [k * self.S + o for k, o in enumerate(combo)]
                    s = set(on)
                    c = sum(lin[f] for f in on) + sum(v for (a, b), v in quad.items() if a in s and b in s)
                    if c < bv - 1e-9:
                        best, bv = combo, c
                for k, g in enumerate(members):
                    if plan[g] != best[k]:
                        plan[g] = best[k]
                        changed = True
            if not changed:
                break
        return tuple(plan), cls
