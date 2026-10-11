"""
Entry points for the page (main.js on Qollab) and for tools/run_local.py.

  info()                         static geography, roads, storms, destinations (JSON)
  backend_info(backend)          what kind of backend Qollab created (JSON)
  prepare(params, dem)           hazard model, risk, evacuation problems, circuit training (JSON)
  run_quantum(backend, shots)    ONE backend.run() with every circuit of every decision time (JSON)
  personal(backend, params)      ONE job for the place a person picks: the route-selection QAOA
                                 (portfolio.py) and amplitude estimation of the flood chance (JSON)
  qae_point(backend, params)     amplitude estimation alone for one spot (JSON; kept for tools)

Every function returns a JSON string: that is what crosses from Python to JavaScript.
"""
import json
import math
import time

import numpy as np

from . import evac, geo, places, portfolio, qae, qaoa, shapes, storm
from .network import NEVER, Network

LAYERS = 2                 # QAOA depth p
CVAR_ALPHA = 0.10
MAX_QAOA_PER_STAGE = 4     # clusters sent to the backend per decision time (the rest are solved exactly)
QAE_SITES_PER_STAGE = 3
_STATE = {}
_NET = {}
# Jobs sent during this page run. NOT reset by prepare(): IonQ backends on Qollab accept one
# job per run, so re-planning in the same run must not send a second one.
_JOBS = {"sent": 0}
CLS_CODE = {"interstate": 0, "expressway": 1, "us_major": 2, "us": 3, "state": 4}


def _log(msg):
    print("[FloodQ] " + msg)


def _net():
    if "net" not in _NET:
        _NET["net"] = Network()
    return _NET["net"]


def shots_for(p, confidence=0.95):
    """Shots needed to see an outcome of probability p at least once with this confidence."""
    if p <= 0:
        return None
    if p >= 1:
        return 1
    return int(math.ceil(math.log(1 - confidence) / math.log(1 - p)))


def _r(x, d=3):
    return round(float(x), d)


# ---------------------------------------------------------------------------
# info
# ---------------------------------------------------------------------------
def info():
    net = _net()
    edges = []
    for e in net.edges:
        flat = []
        for la, lo in e["geom"]:
            flat += [round(la, 3), round(lo, 3)]
        edges.append([e["u"], e["v"], CLS_CODE[e["cls"]], e["ref"], e["km"], e["kmh"], e["cap"],
                      1 if e["bridge"] else 0, flat])
    presets = []
    for p in places.PRESETS:
        presets.append({k: p[k] for k in ("id", "short", "name", "like", "landfall_place", "landfall_clock",
                                          "approach", "tag")} |
                       {"track": [[r[0], r[1], r[2], r[3]] for r in p["track"]]})
    return json.dumps({
        "grid": {"bbox": geo.BBOX, "nx": geo.NX, "ny": geo.NY, "d": geo.D},
        "coarse": {"nx": storm.CNX, "ny": storm.CNY, "d": storm.COARSE},
        "hours": places.HOURS, "stages": places.STAGES, "presets": presets,
        "default_preset": places.DEFAULT_PRESET, "weekdays": places.WEEKDAYS,
        "shapes": json.loads(shapes.SHAPES_JSON),
        "cities": geo.CITIES, "counties": geo.COUNTIES,
        "roads": {"nodes": [[round(a, 4), round(b, 4)] for a, b in net.nodes.tolist()], "edges": edges},
        "hosts": [{"id": h[0], "name": h[1], "lat": h[2], "lon": h[3], "cap": h[4]} for h in places.HOSTS],
        "segments": [[_r(s[0], 3), _r(s[1], 3)] for s in geo.SEG],
        "grids": {
            "landfrac": geo.b64z(np.round(geo.LANDFRAC * 100).astype(np.uint8)),
            "ocean": geo.b64z(geo.OCEAN.astype(np.uint8)),
            "county": geo.b64z(geo.COUNTY.astype(np.uint8)),
            "pop": geo.b64z(np.clip(np.round(geo.POP), 0, 65535).astype("<u2")),
            "elev_cm": geo.b64z(np.round(geo.ELEV * 100).astype("<i2")),
            "dist_dm": geo.b64z(np.clip(np.round(geo.DIST * 10), 0, 65535).astype("<u2")),
            "seg_of": geo.b64z(geo.SEG_OF.astype("<u2")),
            "sea_depth_m": geo.b64z(np.clip(geo.DEPTH, 0, 4000).astype("<i2")),
        },
        "model": {"inland_loss_m_per_km": storm.INLAND_LOSS, "red_p": evac.RED_P, "orange_p": evac.ORANGE_P,
                  "level_offset": LEVEL_OFFSET, "level_step": LEVEL_STEP},
        "assumptions": {"leave_in_zone": places.LEAVE_IN_ZONE, "shadow": places.SHADOW,
                        "mobile_home_share": places.MOBILE_HOME_SHARE,
                        "vehicles_per_person": places.VEHICLES_PER_PERSON,
                        "departure_window_h": places.DEPARTURE_WINDOW_H, "local_share": places.LOCAL_SHARE},
    })


def backend_info(backend):
    return json.dumps(describe_backend(backend))


def describe_backend(backend):
    try:
        name = backend.name if isinstance(backend.name, str) else backend.name()
    except Exception:
        name = type(backend).__name__
    src = (str(name) + " " + type(backend).__name__ + " " + type(backend).__module__).lower()
    if "ionq" in src:
        kind = "ionq"
    elif "basic" in src:
        kind = "builtin"
    elif "fake" in src or "ibm" in src:
        kind = "ibm-noise"
    elif "braket" in src:
        kind = "braket"
    elif "aer" in src:
        kind = "aer"
    else:
        kind = "other"
    return {"name": str(name), "kind": kind, "one_job_per_run": kind == "ionq"}


# ---------------------------------------------------------------------------
# prepare
# ---------------------------------------------------------------------------
LEVEL_OFFSET, LEVEL_STEP = 2.0, 0.05     # water levels sent as uint8: (level + 2) / 0.05


def _q_level(a):
    return np.clip(np.round((np.asarray(a) + LEVEL_OFFSET) / LEVEL_STEP), 0, 255).astype(np.uint8)


def _scenario(params):
    p = dict(params or {})
    ids = [x["id"] for x in places.PRESETS]
    pid = p.get("preset") if p.get("preset") in ids else places.DEFAULT_PRESET
    return {"preset": pid,
            "slr": float(np.clip(float(p.get("slr", 0.0)), 0.0, 1.0)),
            "tide": bool(p.get("tide", True)),
            "shift_km": float(np.clip(float(p.get("shift_km", 0.0)), -150.0, 150.0)),
            "intensity": float(np.clip(float(p.get("intensity", 1.0)), 0.6, 1.3))}


def _measured_elevation(dem):
    """Measured elevation (m) on the model grid from the page, or None if unusable."""
    if not dem:
        return None
    vals = np.array([np.nan if v is None else float(v) for v in json.loads(dem)], float)
    if vals.size != geo.NX * geo.NY or np.isnan(vals).mean() > 0.1:
        return None
    z = vals.reshape(geo.NY, geo.NX)
    z = np.where(np.isnan(z), geo.ELEV, z)
    z = np.where(geo.LAND, np.clip(z, 0.1, None), 0.0)
    return z


def prepare(params="", dem=""):
    t0 = time.time()
    scen = _scenario(json.loads(params) if params else {})
    preset = next(p for p in places.PRESETS if p["id"] == scen["preset"])
    elev = _measured_elevation(dem)
    terrain = "measured" if elev is not None else "illustrative"
    run = storm.StormRun(preset, scen, elev=elev)
    net = _net()
    status, close_h, ts_h = net.statuses(run)
    _log("{}: storm model and road status for {} hours in {:.1f}s ({} terrain)".format(
        preset["name"], len(run.hours), time.time() - t0, terrain))
    stages = []
    for sh in places.STAGES:
        t1 = time.time()
        sp = evac.StagePlan(run, net, (status, close_h, ts_h), sh)
        st = {"plan": sp, "hour": sh}
        G = len(sp.groups)
        plans = {"fastest": sp.plan_fastest(), "greedy": sp.plan_greedy(), "anneal": sp.plan_anneal()}
        ex = sp.plan_exact()
        if ex is not None:
            plans["exact"] = ex
        dec, cls = sp.plan_decomposed(start=plans["anneal"])
        plans["decomposed"] = dec
        st["plans"] = plans
        st["clusters"] = cls
        # circuits for the largest clusters with a real choice to make
        qcl = [c for c in cls if len(c) >= 2 and sum(sp.n_opts[g] for g in c) >= 4][:MAX_QAOA_PER_STAGE]
        st["qclusters"] = []
        for members in qcl:
            lin, quad, options = sp.cluster_problem(members, dec)
            pb = qaoa.AssignmentProblem(len(members), sp.S, lin, quad, options)
            if len(pb.plans) < 2:
                continue
            tr = qaoa.SubspaceQAOA(pb).train(layers=LAYERS, alpha=CVAR_ALPHA)
            ver = qaoa.statevector_check(pb, tr["gammas"], tr["betas"], tr["probs"]) if pb.nq <= 14 else None
            st["qclusters"].append({"members": members, "problem": pb, "train": tr, "verify": ver})
        # amplitude estimation sites: the largest groups' most exposed populous places
        st["qae"] = _qae_sites(run, sp)
        stages.append(st)
        late = int(sum(g["people"] for g in sp.stranded))
        _log("order at H{:+d}: {} groups, {:,} people told to leave{}, {} circuits to run, {:.1f}s".format(
            sh, G, int(sum(g["people"] for g in sp.groups)) + late,
            " ({:,} of them too late to get out)".format(late) if late else "",
            len(st["qclusters"]) + 4 * len(st["qae"]), time.time() - t1))
    _STATE.clear()
    _STATE.update({"scenario": scen, "preset": preset, "run": run, "net": net, "status": status,
                   "close_h": close_h, "ts_h": ts_h, "stages": stages, "terrain": terrain})
    payload = _prepare_payload()
    _log("prepare finished in {:.1f}s".format(time.time() - t0))
    return json.dumps(payload)


def _flood_flags(run, ens, i, j):
    """Per track, 1 if it brings 0.5 m of water or more to cell (i, j), else 0, and the depths.
    This is the rule that draws the red zone (evac.StagePlan._risk), so the weighted sum of the
    flags is exactly the flood chance on the map and on the card."""
    z = float(run.z_eff[i, j])
    reachable = bool(geo.LAND[i, j] and z < 98 and not run.normally_wet[i, j])
    depth = ens["seg_peak"][:, int(geo.SEG_OF[i, j])] - z
    return ((depth >= 0.5) & reachable).astype(float), depth


def _qae_sites(run, sp):
    ens = sp.ens
    out, seen = [], set()
    for g in sp.groups:
        if len(out) >= QAE_SITES_PER_STAGE:
            break
        if g["county"] in seen:
            continue
        i, j = g["site"]
        f, depth = _flood_flags(run, ens, i, j)
        a = float(np.dot(ens["weights"], f))
        seen.add(g["county"])
        lat, lon = float(geo.LAT2[i, j]), float(geo.LON2[i, j])
        near = _nearest_city(lat, lon)
        out.append({"group": g["name"], "place": near, "lat": lat, "lon": lon, "cell": [i, j],
                    "w": ens["weights"].tolist(), "f": f.tolist(), "depth": depth.tolist(), "exact": a})
    return out


def _nearest_city(lat, lon):
    best, bd = None, 1e9
    for name, la, lo, popn, _ in geo.CITIES:
        d = float(geo.km(lat, lon, la, lo))
        if d < bd:
            best, bd = name, d
    if bd < 40:
        return best
    return "the coast at {:.1f}N {:.1f}W".format(lat, -lon)


def _option_json(sp, g, o):
    h = sp.hosts[o["host"]]
    return {"host": o["host"], "edges": [int(e) for e in o["edges"]], "km": _r(o["km"], 1),
            "hours": _r(o["t0"], 2), "local_streets": bool(o.get("local_streets")),
            "legs": sp.net.summarize(g["node"], o["edges"]) if o["edges"] else
            [{"ref": "local streets", "km": _r(o["km"], 1), "dir": ""}]}


def _top_plans(pb, probs, k=8):
    """The k valid plans the trained circuit makes most likely (flat indices and plan tuples)."""
    feas = np.flatnonzero(pb.feasible.ravel())
    order = feas[np.argsort(probs.ravel()[feas])[::-1]][:k]
    return order, [tuple(int(x) for x in np.unravel_index(i, probs.shape)) for i in order]


def _plan_json(sp, plan):
    ev = sp.evaluate(plan)
    vc = ev.pop("link_vc")
    loads = ev.pop("loads")
    links = [[int(e), _r(vc[e], 2)] for e in np.flatnonzero(vc > 0.02)]
    ev["choice"] = [int(x) for x in plan]
    ev["links"] = links
    ev["host_loads"] = [[int(h), int(round(v))] for h, v in loads.items()]
    return ev


def _prepare_payload():
    run, net, scen, preset = _STATE["run"], _STATE["net"], _STATE["scenario"], _STATE["preset"]
    tr = run.track
    k = run.kidx
    track = {"hours": run.hours, "lat": [_r(tr.lat[i], 4) for i in k], "lon": [_r(tr.lon[i], 4) for i in k],
             "vmax": [_r(tr.vmax_kt[i], 0) for i in k], "pc": [_r(tr.pc_hpa[i], 0) for i in k],
             "rmax_km": [_r(tr.rmax_km[i], 1) for i in k], "cat": [storm.category(tr.vmax_kt[i]) for i in k],
             "land": [bool(tr.over_land[i]) for i in k], "radii": run.radii,
             "speed_kt": [_r(tr.speed_kmh[i] / 1.852, 1) for i in k], "holland_b": tr.B}
    stages = []
    for st in _STATE["stages"]:
        sp = st["plan"]
        ens = sp.ens
        hours_after = [h for h in run.hours if h >= st["hour"]]
        members = []
        for mt in ens["tracks"]:
            members.append([[_r(mt.lat[mt.index(h)], 3), _r(mt.lon[mt.index(h)], 3)] for h in hours_after[::3]])
        cone = [[h, _r(tr.lat[tr.index(h)], 3), _r(tr.lon[tr.index(h)], 3),
                 _r(storm.cone_sigma_km(h - st["hour"]) * 1.482, 1)] for h in hours_after[::3]]
        zones = (sp.red * 2 + sp.orange * 1).astype(np.uint8)
        groups = []
        for g in sp.groups:
            groups.append({"name": g["name"], "county": g["county"], "people": int(round(g["people"])),
                           "vehicles": int(round(g["vehicles"])), "window": g["window"],
                           "lat": _r(g["lat"], 4), "lon": _r(g["lon"], 4), "node": g["node"],
                           "ts_hour": g["ts_hour"], "people_red": int(round(g["people_red"])),
                           "options": [_option_json(sp, g, o) for o in g["options"]]})
        hosts = [{"id": h["id"], "name": h["name"], "lat": _r(h["lat"], 4), "lon": _r(h["lon"], 4),
                  "cap": int(h["cap"]), "p_hu": _r(h["p_hu"], 3), "p_ts": _r(h["p_ts"], 3),
                  "safe": bool(h["safe"]), "local": h["local_for"] is not None, "node": h["node"],
                  "ts_first": h["ts_first"]} for h in sp.hosts]
        plans = {name: _plan_json(sp, pl) for name, pl in st["plans"].items()}
        clusters = []
        for qc in st["qclusters"]:
            pb, trn = qc["problem"], qc["train"]
            V = len(pb.plans)
            probs = trn["probs"]
            order, _ = _top_plans(pb, probs)
            # the same plans after 0, 1, ... p layers (0 = the W states: every valid plan equally
            # likely), from the exact subspace emulation, so the page can replay the circuit
            sub = qaoa.SubspaceQAOA(pb)
            g_, b_ = list(trn["gammas"]), list(trn["betas"])
            layer_probs, layer_p_opt = [], []
            for k in range(len(g_) + 1):
                pk = sub.probs(g_[:k], b_[:k])
                layer_probs.append([_r(pk.ravel()[i], 4) for i in order])
                layer_p_opt.append(_r(pk[pb.optimum], 4))
            clusters.append({
                "groups": qc["members"], "qubits": pb.nq, "valid_plans": V, "hilbert_dim": 2 ** pb.nq,
                "gammas": [_r(x, 4) for x in trn["gammas"]], "betas": [_r(x, 4) for x in trn["betas"]],
                "train_evals": trn["evals"], "p_opt": _r(trn["p_opt"], 4), "p_random": _r(1.0 / V, 4),
                "shots95_qaoa": shots_for(trn["p_opt"]), "shots95_random": shots_for(1.0 / V),
                "optimum": [int(x) for x in pb.optimum], "verify": qc["verify"],
                "predicted_top": [{"plan": [int(x) for x in np.unravel_index(i, probs.shape)],
                                   "p": _r(probs.ravel()[i], 4),
                                   "cost": _r(pb.cost_tensor.ravel()[i], 1)} for i in order],
                "cost_range": [_r(pb.cmin, 1), _r(pb.cmax, 1)],
                "layer_probs": layer_probs, "layer_p_opt": layer_p_opt,
            })
        qsites = [{k2: v for k2, v in s.items() if k2 != "cell"} for s in st["qae"]]
        stages.append({
            "hour": st["hour"], "sigma_km": _r(ens["sigma_km_landfall"], 1),
            "offsets_km": [_r(x, 1) for x in ens["offsets_km"]], "weights": [_r(x, 4) for x in ens["weights"]],
            "members": members, "member_hours": hours_after[::3], "cone": cone,
            "seg_peak": geo.b64(_q_level(ens["seg_peak"])),
            "p_hu": geo.b64(np.clip(np.round(sp.p_hu_coarse * 250), 0, 250).astype(np.uint8)),
            "p_ts": geo.b64(np.clip(np.round(sp.p_ts_coarse * 250), 0, 250).astype(np.uint8)),
            "p_surge": geo.b64z(np.clip(np.round(sp.p_surge * 250), 0, 250).astype(np.uint8)),
            "zones": geo.b64z(zones),
            "people_red": int(sp.people_red), "people_orange": int(sp.people_orange),
            "mobile_by_county": {k2: int(v) for k2, v in sp.mobile_by_county.items()},
            "groups": groups, "hosts": hosts,
            "stranded": [{"name": g["name"], "people": int(g["people"]), "lat": _r(g["lat"], 3),
                          "lon": _r(g["lon"], 3)} for g in sp.stranded],
            "plans": plans, "clusters": clusters, "qae": qsites,
            "all_clusters": [[int(g) for g in c] for c in st["clusters"]],
        })
    roads = {"status": ["".join(row) for row in _STATE["status"]],
             "close_h": [int(x) if x < NEVER else None for x in _STATE["close_h"]],
             "ts_h": [int(x) if x < NEVER else None for x in _STATE["ts_h"]]}
    rain = np.array(run.rain_frames)
    return {
        "scenario": scen, "preset": {"id": preset["id"], "name": preset["name"], "like": preset["like"],
                                     "landfall_place": preset["landfall_place"],
                                     "landfall_clock": preset["landfall_clock"]},
        "terrain": _STATE["terrain"],
        "elev_cm": geo.b64z(np.round(run.elev * 100).astype("<i2")) if _STATE["terrain"] == "measured" else None,
        "track": track, "hours": run.hours,
        "levels": geo.b64(_q_level(run.level)),
        "normally_wet": geo.b64z(run.normally_wet.astype(np.uint8)),
        "rain_mm5": geo.b64z(np.clip(np.round(rain / 5.0), 0, 255).astype(np.uint8)),
        "rain_every_h": 3,
        "ts_arrival": geo.b64(np.clip(run.ts_arrival, 0, 255).astype(np.uint8)),
        "hu_arrival": geo.b64(np.clip(run.hu_arrival, 0, 255).astype(np.uint8)),
        "max_wind_kt": geo.b64(np.clip(np.round(run.max_wind_kt), 0, 255).astype(np.uint8)),
        "roads": roads, "stages": stages,
        "summary": {"peak_surge_m": _r(run.surge.max(), 2),
                    "peak_surge_at": _nearest_city(*geo.SEG[int(np.argmax(run.surge.max(0))), :2]),
                    "max_rain_mm": int(run.rain_total.max()),
                    "landfall_vmax_kt": int(round(tr.vmax_kt[tr.index(0)])),
                    "landfall_pc_hpa": int(round(tr.pc_hpa[tr.index(0)])),
                    "landfall_cat": storm.category(tr.vmax_kt[tr.index(0)])},
    }


# ---------------------------------------------------------------------------
# run_quantum: ONE job with every circuit
# ---------------------------------------------------------------------------
def _needs_transpile(backend, circuits):
    """Transpile only when the backend cannot run the circuits as written (a gate it lacks, or
    a device coupling map). IonQ and Qiskit's BasicSimulator take them as written."""
    ops = {name for qc in circuits for name in qc.count_ops()} - {"measure", "barrier"}
    supported, coupled = None, False
    target = getattr(backend, "target", None)
    if target is not None:
        try:
            supported = set(target.operation_names)
        except Exception:
            supported = None
        try:
            cmap = target.build_coupling_map()
            n = int(target.num_qubits or 0)
            # restricted only if some pair of qubits cannot interact directly. CouplingMap.size()
            # counts qubits, not connections, so count the edges (IonQ: every pair is connected)
            coupled = cmap is not None and n > 1 and len(set(cmap.get_edges())) < n * (n - 1)
        except Exception:
            coupled = False
    if supported is None:
        try:
            cfg = backend.configuration()
            supported = set(cfg.basis_gates)
            coupled = bool(getattr(cfg, "coupling_map", None))
        except Exception:
            return True
    return coupled or not ops <= supported


def _gate_stats(qc):
    ops = qc.count_ops()
    two = sum(v for k, v in ops.items() if k in ("cx", "rzz", "rxx", "ryy", "cz", "ecr", "swap"))
    three = sum(v for k, v in ops.items() if k in ("ccx", "ccz"))
    return {"depth": qc.depth(), "two_qubit": int(two), "three_qubit": int(three),
            "ops": {k: int(v) for k, v in ops.items()}}


def _run_on_backend(backend, be, circuits, shots, what="ONE job"):
    to_run = circuits
    if _needs_transpile(backend, circuits):
        try:
            from qiskit import transpile
            to_run = transpile(circuits, backend, optimization_level=1)
            _log("transpiled for {}".format(be["name"]))
        except Exception as exc:
            _log("transpile skipped: {}".format(exc))
    _log("submitting {}: {} circuits x {} shots to {}".format(what, len(to_run), shots, be["name"]))
    job = backend.run(to_run, shots=shots)
    try:
        job_id = str(job.job_id())
    except Exception:
        job_id = None
    result = job.result()
    out = []
    for i, qc in enumerate(to_run):
        try:
            out.append(result.get_counts(i))
        except Exception:
            out.append(result.get_counts(qc))
    return out, job_id


def run_quantum(backend=None, shots=1024, force_emulation=False):
    if not _STATE:
        raise RuntimeError("call prepare() first")
    shots = int(shots)
    be = describe_backend(backend) if backend is not None else {"name": "none", "kind": "none",
                                                                 "one_job_per_run": False}
    circuits, tags = [], []
    for si, st in enumerate(_STATE["stages"]):
        for ci, qc in enumerate(st["qclusters"]):
            circuits.append(qaoa.build_circuit(qc["problem"], qc["train"]["gammas"], qc["train"]["betas"],
                                               name="evac_H{:+d}_c{}".format(st["hour"], ci)))
            tags.append(("qaoa", si, ci, None))
        for qi, s in enumerate(st["qae"]):
            for m, c in zip(qae.SCHEDULE, qae.circuits(s["w"], s["f"], name="risk_H{:+d}_s{}".format(st["hour"], qi))):
                circuits.append(c)
                tags.append(("qae", si, qi, m))
    stats = [_gate_stats(c) for c in circuits]
    use = (backend is not None and not force_emulation and bool(circuits) and
           not (be["one_job_per_run"] and _JOBS["sent"] >= 1))
    t0 = time.time()
    job_id = error = None
    source = "emulation"
    if use:
        try:
            _JOBS["sent"] += 1   # count the attempt: a failed IonQ submission may still use the run's job
            counts, job_id = _run_on_backend(backend, be, circuits, shots)
            source = "backend"
        except Exception as exc:
            error = "{}: {}".format(type(exc).__name__, exc)
            _log("backend job failed ({}); sampling the exact emulation instead".format(error))
            use = False
    if not use:
        rng = np.random.default_rng(11)
        counts = []
        for tag in tags:
            kind, si, ci, m = tag
            st = _STATE["stages"][si]
            if kind == "qaoa":
                qc = st["qclusters"][ci]
                counts.append(qaoa.emulate_counts(qc["problem"], qc["train"]["probs"], shots, seed=11 + len(counts)))
            else:
                s = st["qae"][ci]
                counts.append(qae.emulate_counts(np.array(s["w"]), np.array(s["f"]), m, shots, rng))
    elapsed = time.time() - t0
    out_stages = []
    for si, st in enumerate(_STATE["stages"]):
        sp = st["plan"]
        plan = list(st["plans"]["decomposed"])
        clusters_out = []
        for ci, qc in enumerate(st["qclusters"]):
            k = tags.index(("qaoa", si, ci, None))
            pb, tr = qc["problem"], qc["train"]
            plans_m, invalid, total = qaoa.decode_counts(pb, counts[k], shots=shots)
            valid = total - invalid
            ranked = sorted(plans_m.items(), key=lambda kv: (pb.cost(kv[0]), -kv[1]))
            best = ranked[0][0] if ranked else tuple(plan[g] for g in qc["members"])
            for g, o in zip(qc["members"], best):
                plan[g] = int(o)
            V = len(pb.plans)
            p_meas = plans_m.get(pb.optimum, 0) / total if total else 0.0
            top = sorted(plans_m.items(), key=lambda kv: -kv[1])[:8]
            _, predicted = _top_plans(pb, tr["probs"])
            clusters_out.append({
                "groups": qc["members"], "qubits": pb.nq, "circuit": stats[k], "shots": total,
                "valid_fraction": _r(valid / total, 4) if total else 0.0,
                "p_opt_measured": _r(p_meas, 4), "p_opt_predicted": _r(tr["p_opt"], 4),
                "p_random": _r(1.0 / V, 4), "found_optimum": best == pb.optimum,
                "best": [int(x) for x in best], "optimum": [int(x) for x in pb.optimum],
                "random_finds_optimum": _r(1 - (1 - 1.0 / V) ** valid, 4) if valid else 0.0,
                "measured_top": [{"plan": [int(x) for x in pl], "count": int(c), "cost": _r(pb.cost(pl), 1)}
                                 for pl, c in top],
                # shots for the circuit's own top plans (same order as predicted_top), for the replay
                "predicted_counts": [int(plans_m.get(pl, 0)) for pl in predicted],
            })
        qplan = _plan_json(sp, tuple(plan))
        qae_out = []
        for qi, s in enumerate(st["qae"]):
            hits, totals, member_hist = [], [], np.zeros(8)
            circ = []
            for m in qae.SCHEDULE:
                k = tags.index(("qae", si, qi, m))
                h, n, mem = qae.hits_from_counts(counts[k], shots=shots)
                hits.append(h)
                totals.append(n)
                circ.append(stats[k])
                if m == 0:
                    member_hist = mem
            est = qae.mle(hits, totals)
            calls = qae.oracle_calls(totals)
            a = s["exact"]
            qae_out.append({"place": s["place"], "group": s["group"], "lat": s["lat"], "lon": s["lon"],
                            "exact": _r(a, 4), "estimate": _r(est["a"], 4),
                            "ci95": [_r(x, 4) for x in est["ci95"]], "hits": hits, "shots": totals,
                            "schedule": list(qae.SCHEDULE), "oracle_calls": calls,
                            "mc_sd_same_calls": _r(math.sqrt(max(a * (1 - a), 1e-9) / calls), 4),
                            "mlae_sd": _r(est["sd"], 4),
                            "member_hist": [int(x) for x in member_hist], "circuits": circ})
        out_stages.append({"hour": st["hour"], "clusters": clusters_out, "quantum_plan": qplan, "qae": qae_out})
        _log("order at H{:+d}: quantum plan {} vehicle-hours, {} caught by the storm".format(
            st["hour"], qplan["vehicle_hours"], qplan["caught_vehicles"]))
    return json.dumps({"backend": be, "source": source, "job_id": job_id, "seconds": _r(elapsed, 2),
                       "error": error, "circuits": len(circuits), "stages": out_stages,
                       "runs_used": _JOBS["sent"]})


# ---------------------------------------------------------------------------
# qae_point: amplitude estimation for the spot the user taps
# ---------------------------------------------------------------------------
def spot_problem(lat, lon, stage_index):
    """Track weights w and, per track, whether it brings 0.5 m of water to this spot (f = 0 or 1).
    The same rule draws the red zone, so the exact sum here is the number the zone map uses."""
    cell = geo.cell_of(float(lat), float(lon))
    if cell is None:
        return None
    i, j = cell
    st = _STATE["stages"][stage_index]
    run, ens = _STATE["run"], st["plan"].ens
    f, depth = _flood_flags(run, ens, i, j)
    w = np.asarray(ens["weights"], float)
    return {"cell": [i, j], "w": w, "f": f, "depth": depth, "exact": float(np.dot(w, f)),
            "place": _nearest_city(lat, lon)}


def qae_point(backend=None, params="", shots=1024):
    """Chance of 0.5 m+ of water at one spot over the order time's eight tracks, estimated with
    maximum-likelihood amplitude estimation (four circuits: 0, 1, 2 and 4 Grover steps).

    Local simulators (the built-in one, AWS, IBM noise models) run the four circuits as their own
    job. IonQ backends take one job per run, and the plan's circuits already used it, so there the
    exact output distribution of the same circuits is sampled instead and the result says so."""
    if not _STATE:
        raise RuntimeError("call prepare() first")
    p = json.loads(params) if isinstance(params, str) and params else dict(params or {})
    shots = int(p.get("shots", shots))
    si = int(np.clip(int(p.get("stage", 1)), 0, len(_STATE["stages"]) - 1))
    prob = spot_problem(p["lat"], p["lon"], si)
    if prob is None:
        return json.dumps({"ok": False, "reason": "outside the model area"})
    w, f = prob["w"], prob["f"]
    circuits = qae.circuits(w, f, name="spot_H{:+d}".format(_STATE["stages"][si]["hour"]))
    stats = [_gate_stats(c) for c in circuits]
    be = describe_backend(backend) if backend is not None else {"name": "none", "kind": "none",
                                                                 "one_job_per_run": False}
    use = backend is not None and not be["one_job_per_run"]
    source, error, job_id, counts = "emulation", None, None, None
    t0 = time.time()
    if use:
        try:
            counts, job_id = _run_on_backend(backend, be, circuits, shots, what="a job for your spot")
            source = "backend"
        except Exception as exc:
            error = "{}: {}".format(type(exc).__name__, exc)
            _log("spot job failed ({}); sampling the exact emulation instead".format(error))
    if counts is None:
        i, j = prob["cell"]
        rng = np.random.default_rng(1000 + i * geo.NX + j)
        counts = [qae.emulate_counts(w, f, m, shots, rng) for m in qae.SCHEDULE]
    hits, totals = [], []
    for c in counts:
        h, n, _ = qae.hits_from_counts(c, shots=shots)
        hits.append(h)
        totals.append(n)
    est = qae.mle(hits, totals)
    calls = qae.oracle_calls(totals)
    a = prob["exact"]
    why = None
    if source == "emulation" and backend is not None and be["one_job_per_run"]:
        why = "IonQ takes one job per run, and this run's job carried the plan's circuits"
    elif source == "emulation" and backend is None:
        why = "no backend in this run"
    elif error:
        why = "the job failed: " + error
    return json.dumps({
        "ok": True, "place": prob["place"], "stage_hour": _STATE["stages"][si]["hour"],
        "exact": _r(a, 4), "estimate": _r(est["a"], 4), "ci95": [_r(x, 4) for x in est["ci95"]],
        "mlae_sd": _r(est["sd"], 4), "mc_sd_same_calls": _r(math.sqrt(max(a * (1 - a), 1e-9) / calls), 4),
        "hits": hits, "shots": totals, "schedule": list(qae.SCHEDULE), "oracle_calls": calls,
        "tracks_flooding": int(f.sum()), "weights": [_r(x, 4) for x in w], "f": [int(x) for x in f],
        "source": source, "backend": be["name"], "why_emulated": why, "job_id": job_id,
        "seconds": _r(time.time() - t0, 2), "circuits": stats,
    })


# ---------------------------------------------------------------------------
# personal: the place a person picks, in ONE job
# ---------------------------------------------------------------------------
MAX_ROUTE_QUBITS = 12   # the page sends at most 9 candidates; this bounds the work a request can ask for


def _route_problem(spec):
    n = int(spec["n"])
    if not 2 <= n <= MAX_ROUTE_QUBITS:
        raise ValueError("route problem with {} candidates (2 to {} allowed)".format(n, MAX_ROUTE_QUBITS))
    quad = {(int(a), int(b)): float(v) for a, b, v in spec.get("quad", [])}
    return portfolio.SelectionProblem(n, int(spec["k"]), [float(x) for x in spec["lin"]], quad)


def _members(mask, n):
    return tuple(i for i in range(n) if (mask >> i) & 1)


def personal(backend=None, params="", shots=1024):
    """Everything quantum about the place a person picks, as ONE job on local simulators:

    * route selection (portfolio.py): one circuit, with the angles the page trained, that picks
      exactly K of the N candidate routes the page found for this place; and
    * amplitude estimation (qae.py) of the chance of 0.5 m of water there: four circuits, sent
      when the page asks (when at least one of the order time's tracks can flood the spot).

    IonQ backends take one job per run and the statewide plan's circuits used it, so there the
    exact output of the same circuits is sampled instead, and the result says so. Before anything
    runs, the route circuit is checked against two independent exact emulations: numpy here
    (and Qiskit's Statevector) and the page's own, whose probabilities come in `predicted`."""
    if not _STATE:
        raise RuntimeError("call prepare() first")
    p = json.loads(params) if isinstance(params, str) and params else dict(params or {})
    shots = int(p.get("shots", shots))
    si = int(np.clip(int(p.get("stage", 1)), 0, len(_STATE["stages"]) - 1))
    hour = _STATE["stages"][si]["hour"]
    circuits, tags = [], []
    spot = None
    if p.get("qae") and "lat" in p:
        spot = spot_problem(p["lat"], p["lon"], si)
        if spot is not None:
            for m, c in zip(qae.SCHEDULE, qae.circuits(spot["w"], spot["f"], name="spot_H{:+d}".format(hour))):
                circuits.append(c)
                tags.append(("qae", m))
    pb, exact, check = None, None, None
    spec = p.get("route")
    if spec:
        pb = _route_problem(spec)
        g, b = [float(x) for x in spec["gammas"]], [float(x) for x in spec["betas"]]
        exact = portfolio.subspace_probs(pb, g, b)
        check = portfolio.statevector_check(pb, g, b, exact)
        pred = spec.get("predicted")
        if pred:
            pm = {int(m): float(v) for m, v in pred}
            check["page_vs_numpy"] = float(max(abs(pm.get(m, 0.0) - exact[t]) for t, m in enumerate(pb.masks)))
        circuits.append(portfolio.build_circuit(pb, g, b, name="routes_H{:+d}".format(hour)))
        tags.append(("route", None))
    if not circuits:
        return json.dumps({"ok": False, "reason": "nothing to run for this place"})
    stats = [_gate_stats(c) for c in circuits]
    be = describe_backend(backend) if backend is not None else {"name": "none", "kind": "none",
                                                                 "one_job_per_run": False}
    use = backend is not None and not be["one_job_per_run"]
    source, error, job_id, counts = "emulation", None, None, None
    t0 = time.time()
    if use:
        try:
            counts, job_id = _run_on_backend(backend, be, circuits, shots, what="ONE job for your place")
            source = "backend"
        except Exception as exc:
            error = "{}: {}".format(type(exc).__name__, exc)
            _log("job for your place failed ({}); sampling the exact emulation instead".format(error))
    if counts is None:
        seed = 1000
        if spot is not None:
            seed += spot["cell"][0] * geo.NX + spot["cell"][1]
        rng = np.random.default_rng(seed)
        counts = []
        for kind, m in tags:
            if kind == "qae":
                counts.append(qae.emulate_counts(spot["w"], spot["f"], m, shots, rng))
            else:
                counts.append(portfolio.emulate_counts(pb, exact, shots, seed=seed + 7))
    why = None
    if source == "emulation" and backend is not None and be["one_job_per_run"]:
        why = "IonQ takes one job per run, and this run's job carried the statewide plan's circuits"
    elif source == "emulation" and backend is None:
        why = "no backend in this run"
    elif error:
        why = "the job failed: " + error
    out = {"ok": True, "source": source, "backend": be["name"], "why_emulated": why, "job_id": job_id,
           "seconds": _r(time.time() - t0, 2), "stage_hour": hour, "qae": None, "route": None}
    if spot is not None:
        hits, totals, circ = [], [], []
        for (kind, m), c, st in zip(tags, counts, stats):
            if kind != "qae":
                continue
            h, n, _ = qae.hits_from_counts(c, shots=shots)
            hits.append(h)
            totals.append(n)
            circ.append(st)
        est = qae.mle(hits, totals)
        calls = qae.oracle_calls(totals)
        a = spot["exact"]
        out["qae"] = {
            "ok": True, "place": spot["place"], "stage_hour": hour, "exact": _r(a, 4), "estimate": _r(est["a"], 4),
            "ci95": [_r(x, 4) for x in est["ci95"]], "mlae_sd": _r(est["sd"], 4),
            "mc_sd_same_calls": _r(math.sqrt(max(a * (1 - a), 1e-9) / calls), 4),
            "hits": hits, "shots": totals, "schedule": list(qae.SCHEDULE), "oracle_calls": calls,
            "tracks_flooding": int(spot["f"].sum()), "weights": [_r(x, 4) for x in spot["w"]],
            "f": [int(x) for x in spot["f"]], "source": source, "backend": be["name"], "why_emulated": why,
            "circuits": circ}
    if pb is not None:
        k = tags.index(("route", None))
        sets, invalid, total = portfolio.decode_counts(pb, counts[k], shots=shots)
        ranked = sorted(sets.items(), key=lambda kv: (pb.cost(_members(kv[0], pb.n)), -kv[1]))
        best = int(ranked[0][0]) if ranked else None
        opt = sum(1 << i for i in pb.optimum)
        out["route"] = {
            "n": pb.n, "k": pb.k, "valid_choices": len(pb.sets), "shots": total, "invalid": invalid,
            "valid_fraction": _r((total - invalid) / total, 4) if total else 0.0,
            "counts": [[int(m), int(c)] for m, c in sorted(sets.items(), key=lambda kv: -kv[1])],
            "best": best, "optimum": int(opt), "found_optimum": best == opt,
            "p_opt_exact": _r(exact[pb.masks.index(opt)], 4), "circuit": stats[k], "check": check}
    return json.dumps(out)
