"""
Statewide road network (Natural Earth 1:10m highways, about 1,600 links) and what the
storm does to it hour by hour.

Status codes per link and hour (the map colours them):
  o  open
  r  rain ponding near the road: slow (15 cm+ of water nearby)
  w  tropical-storm winds (34 kt+): too dangerous to start driving through
  x  bridge or causeway shut: sustained wind 35 kt (40 mph) or more
  c  closed: 30 cm+ of storm-surge water on the road

Planning rule (Florida's clearance-time definition): every evacuating vehicle must be
through a link before it closes or tropical-storm winds reach it.
"""
import heapq
import math

import numpy as np

from . import geo, storm

KT = storm.KT
NEVER = 10 ** 6


class Network:
    def __init__(self):
        self.nodes = geo.NODES
        self.edges = geo.EDGES
        self.n = len(self.nodes)
        self.m = len(self.edges)
        self.km = np.array([e["km"] for e in self.edges])
        self.kmh = np.array([e["kmh"] for e in self.edges])
        self.cap = np.array([e["cap"] for e in self.edges], float)
        self.t0 = self.km / self.kmh                       # free-flow hours
        self.bridge = np.array([e["bridge"] for e in self.edges])
        self.adj = [[] for _ in range(self.n)]
        for i, e in enumerate(self.edges):
            self.adj[e["u"]].append((e["v"], i))
            self.adj[e["v"]].append((e["u"], i))
        # sample points every ~2 km along each link (for water and wind checks)
        pts, owner = [], []
        for i, e in enumerate(self.edges):
            g = np.asarray(e["geom"], float)
            seg = np.hypot(np.diff(g[:, 0]) * geo.KM_LAT,
                           np.diff(g[:, 1]) * geo.KM_LAT * np.cos(np.radians(g[:-1, 0])))
            cum = np.concatenate([[0.0], np.cumsum(seg)])
            n = max(2, int(math.ceil(cum[-1] / 2.0)) + 1)
            for s in np.linspace(0, cum[-1], n):
                k = min(int(np.searchsorted(cum, s, side="right")) - 1, len(g) - 2)
                t = 0.0 if seg[k] == 0 else (s - cum[k]) / seg[k]
                pts.append(g[k] + t * (g[k + 1] - g[k]))
                owner.append(i)
        self.spts = np.array(pts)
        self.sowner = np.array(owner)
        ij = [geo.cell_of(la, lo) for la, lo in self.spts]
        self.sin = np.array([c is not None for c in ij])
        self.si = np.array([c[0] if c else 0 for c in ij])
        self.sj = np.array([c[1] if c else 0 for c in ij])
        self.sland = self.sin & geo.LAND[self.si, self.sj]
        self.mid = np.array([np.asarray(e["geom"])[len(e["geom"]) // 2] for e in self.edges])

    # -------------------------------------------------------------------------
    def nearest_node(self, lat, lon, usable=None):
        d = geo.km(lat, lon, self.nodes[:, 0], self.nodes[:, 1])
        if usable is not None:
            d = np.where(usable, d, np.inf)
        return int(np.argmin(d))

    def statuses(self, run):
        """Status letter per link per model hour, the hour each link closes (water or
        bridge wind) and the hour tropical-storm winds reach it (NEVER if they don't)."""
        tr = run.track
        H = len(run.hours)
        z_eff = run.z_eff[self.si, self.sj]
        segs = geo.SEG_OF[self.si, self.sj]
        wet_ok = self.sland & (z_eff < 98) & ~run.normally_wet[self.si, self.sj]
        # rain ponding near the road, from the 3-hourly rain totals
        rain_idx = np.array([storm.coarse_cell(la, lo) if storm.coarse_cell(la, lo) is not None else -1
                             for la, lo in self.spts])
        status = np.empty((H, self.m), dtype="<U1")
        close_h = np.full(self.m, NEVER)
        ts_h = np.full(self.m, NEVER)
        water = ~storm.is_land(self.spts[:, 0], self.spts[:, 1]).astype(bool)
        for t in range(H):
            depth = np.where(wet_ok, run.level[t][segs] - z_eff, 0.0)
            spd = tr.wind(run.kidx[t], self.spts[:, 0], self.spts[:, 1], over_water=water)[0] / KT
            rain = run.rain_frames[min(t // 3, len(run.rain_frames) - 1)]
            pond = np.where(rain_idx >= 0, np.maximum(rain[rain_idx] * 0.5 - 120.0, 0.0) / 1000.0, 0.0)
            e_depth = np.zeros(self.m)
            np.maximum.at(e_depth, self.sowner, depth)
            e_wind = np.zeros(self.m)
            np.maximum.at(e_wind, self.sowner, spd)
            e_pond = np.zeros(self.m)
            np.maximum.at(e_pond, self.sowner, pond)
            st = np.full(self.m, "o")
            st[e_pond >= 0.15] = "r"
            st[e_wind >= 34] = "w"
            st[self.bridge & (e_wind >= 35)] = "x"
            st[e_depth >= 0.30] = "c"
            status[t] = st
            h = run.hours[t]
            closing = ((st == "c") | (st == "x")) & (close_h == NEVER)
            close_h[closing] = h
            windy = (e_wind >= 34) & (ts_h == NEVER)
            ts_h[windy] = h
        return status, close_h, ts_h

    # -------------------------------------------------------------------------
    def dijkstra(self, src, t_start, open_until, cost_mult=None, extra=None):
        """Earliest arrival (hours) from src leaving at t_start. A link can be entered only
        before its open_until hour. cost_mult scales link times (congestion); extra adds a
        per-link penalty in hours (used to find alternative corridors)."""
        mult = np.ones(self.m) if cost_mult is None else cost_mult
        pen = np.zeros(self.m) if extra is None else extra
        dist = np.full(self.n, np.inf)
        score = np.full(self.n, np.inf)
        prev = np.full(self.n, -1, int)
        dist[src] = t_start
        score[src] = 0.0
        heap = [(0.0, src)]
        while heap:
            sc, u = heapq.heappop(heap)
            if sc > score[u]:
                continue
            tu = dist[u]
            for v, ei in self.adj[u]:
                if tu >= open_until[ei]:
                    continue
                tv = tu + self.t0[ei] * mult[ei]
                sv = sc + self.t0[ei] * mult[ei] + pen[ei]
                if sv < score[v]:
                    score[v] = sv
                    dist[v] = tv
                    prev[v] = ei
                    heapq.heappush(heap, (sv, v))
        return dist, prev

    def path_edges(self, prev, src, dst):
        if dst == src:
            return []
        if prev[dst] < 0:
            return None
        out, v = [], dst
        while v != src:
            ei = prev[v]
            out.append(ei)
            e = self.edges[ei]
            v = e["u"] if e["v"] == v else e["v"]
        return out[::-1]

    def path_nodes(self, src, edges):
        seq, v = [src], src
        for ei in edges:
            e = self.edges[ei]
            v = e["v"] if e["u"] == v else e["u"]
            seq.append(v)
        return seq

    def summarize(self, src, edges):
        """Route as highway legs: [(ref, km, compass heading)]."""
        nodes = self.path_nodes(src, edges)
        legs = []
        for ei, a, b in zip(edges, nodes[:-1], nodes[1:]):
            e = self.edges[ei]
            ref = e["ref"] if e["ref"] not in ("connector", "link") else None
            la1, lo1 = self.nodes[a]
            la2, lo2 = self.nodes[b]
            if legs and (ref is None or legs[-1]["ref"] == ref):
                legs[-1]["km"] += e["km"]
                legs[-1]["to"] = (la2, lo2)
                continue
            legs.append({"ref": ref or "local roads", "km": e["km"], "from": (la1, lo1), "to": (la2, lo2)})
        for L in legs:
            (a1, o1), (a2, o2) = L["from"], L["to"]
            ang = math.degrees(math.atan2((o2 - o1) * math.cos(math.radians(a1)), a2 - a1)) % 360
            L["dir"] = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"][int((ang + 22.5) // 45) % 8]
            L["km"] = round(L["km"], 1)
            del L["from"], L["to"]
        # drop tiny legs, then join neighbours that are the same road again
        legs = [L for L in legs if L["km"] >= 1.0 or len(legs) == 1]
        out = []
        for L in legs:
            if out and out[-1]["ref"] == L["ref"]:
                out[-1]["km"] = round(out[-1]["km"] + L["km"], 1)
            else:
                out.append(L)
        return out
