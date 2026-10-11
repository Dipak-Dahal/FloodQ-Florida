"""
Quantum amplitude estimation of flood risk under forecast-track uncertainty.

Question for one place: "what is the chance of 0.5 m or more of storm-surge water here?"
The forecast is uncertain. Like NWS P-Surge, the model runs an ensemble of tracks shifted
sideways (eight members, spread like the NHC cone), and the answer is
    a = sum_m  w_m * f_m
with w_m the probability of member m and f_m = 1 if member m brings 0.5 m+ of water to the
place, else 0: the rule that draws the red zone, so `a` is exactly the flood chance on the map.
The circuits accept any f_m in [0, 1] (smooth_step below gives a softer rule for experiments).

Circuit (Woerner & Egger, "Quantum risk analysis", npj Quantum Information 5, 15 (2019)):
  A = load the member distribution on 3 qubits (uniformly controlled RY rotations,
      Mottonen et al. 2004, Grover & Rudolph 2002), then rotate one objective qubit by
      RY(2 arcsin sqrt(f_m)) controlled on the member index, so P(objective = 1) = a.
  Q = A S0 A^dagger S_chi  (amplitude amplification; S0 uses one ancilla and Toffolis).
Measured after m Grover steps, P(1) = sin^2((2m+1) theta) with a = sin^2 theta.

Estimation: Maximum-Likelihood Amplitude Estimation (Suzuki et al., Quantum Inf. Process.
19, 75 (2020)): run m = 0, 1, 2, 4 (four circuits, no phase estimation) and maximise the
joint likelihood over theta. Its error falls like 1/N in the number N of calls to A,
against 1/sqrt(N) for classical sampling (Montanaro, Proc. R. Soc. A 471, 2015).

Honest scope: with eight members a laptop sums the eight terms exactly (that is the
"exact" number shown next to every estimate). The speed-up matters only when each
oracle call is an expensive surge simulation over a large uncertainty space, and it
needs fault-tolerant hardware; Kirke (arXiv:2603.15664, 2026) reaches the same
conclusion for catastrophe-insurance tail risk.
"""
import math

import numpy as np
from qiskit import QuantumCircuit

N_INDEX = 3                       # 8 ensemble members
SCHEDULE = (0, 1, 2, 4)           # Grover powers, one circuit each


def smooth_step(depth_m, threshold=0.5, width=0.25):
    """Chance that real water reaches the threshold given a modelled depth, allowing for errors in
    intensity and size. Not used by the page, which keeps the zone's 0/1 rule; for experiments."""
    return 1.0 / (1.0 + np.exp(-(np.asarray(depth_m, float) - threshold) / width))


# ---------------------------------------------------------------------------
# Uniformly controlled RY (Mottonen et al. 2004), CX + RY only
# ---------------------------------------------------------------------------
def _gray(i):
    return i ^ (i >> 1)


def ucry(qc, alphas, controls, target):
    """Apply RY(alphas[c]) to target for each basis state c of the control register
    (controls[0] = least significant bit)."""
    k = len(controls)
    n = 1 << k
    alphas = np.asarray(alphas, float)
    if k == 0:
        qc.ry(float(alphas[0]), target)
        return
    # Control state c sees angle sum_i (-1)^(c . gray(i)) theta_i, so theta = M^-1 alpha with
    # M[c, i] = (-1)^(c . gray(i)); M's columns are Walsh functions, M^-1 = M^T / 2^k.
    M = np.array([[(-1) ** bin(c & _gray(i)).count("1") for i in range(n)] for c in range(n)], float)
    thetas = M.T @ alphas / n
    for i in range(n):
        qc.ry(float(thetas[i]), target)
        # control whose bit flips between Gray codes g_i and g_{i+1} (wrapping)
        flip = _gray(i) ^ _gray((i + 1) % n)
        ctrl = flip.bit_length() - 1
        qc.cx(controls[ctrl], target)


def load_distribution(qc, probs, qubits):
    """Amplitudes sqrt(probs) on the register (qubits[0] = least significant)."""
    probs = np.asarray(probs, float)
    probs = probs / probs.sum()
    n = len(qubits)
    for level in range(n):
        # qubit for this level is the most significant not yet set: qubits[n-1-level]
        target = qubits[n - 1 - level]
        controls = list(qubits[n - level:])          # already-set, more significant qubits
        block = 1 << (n - level)
        angles = []
        for c in range(1 << level):
            # prefix value c, read with controls[0] as least significant
            lo = c * block
            p_all = probs[lo:lo + block].sum()
            p_one = probs[lo + block // 2:lo + block].sum()
            angles.append(2 * math.asin(math.sqrt(p_one / p_all)) if p_all > 1e-15 else 0.0)
        # ucry expects controls[0] least significant; the prefix c uses the more significant
        # qubits with the lowest of them as its least significant bit
        ucry(qc, angles, controls, target)


def a_operator(probs, f):
    """A on 3 index qubits (0-2), objective (3) and one ancilla (4) left in |0>."""
    qc = QuantumCircuit(N_INDEX + 2, name="A")
    idx = list(range(N_INDEX))
    load_distribution(qc, probs, idx)
    betas = [2 * math.asin(math.sqrt(min(max(x, 0.0), 1.0))) for x in f]
    ucry(qc, betas, idx, N_INDEX)
    return qc


def _mcz_all(qc, idx, obj, anc):
    """Phase -1 on |111>|1>: Toffoli into the ancilla, controlled-controlled-Z, undo."""
    qc.ccx(idx[0], idx[1], anc)
    qc.h(obj)
    qc.ccx(anc, idx[2], obj)
    qc.h(obj)
    qc.ccx(idx[0], idx[1], anc)


def grover_operator(A):
    n = A.num_qubits
    idx, obj, anc = list(range(N_INDEX)), N_INDEX, N_INDEX + 1
    q = QuantumCircuit(n, name="Q")
    q.z(obj)                                   # S_chi: mark objective = 1
    q.compose(A.inverse(), inplace=True)
    for b in idx + [obj]:                      # S0: reflect about |0000> (ancilla stays |0>)
        q.x(b)
    _mcz_all(q, idx, obj, anc)
    for b in idx + [obj]:
        q.x(b)
    q.compose(A, inplace=True)
    return q


def circuits(probs, f, schedule=SCHEDULE, name="qae"):
    A = a_operator(probs, f)
    Q = grover_operator(A)
    out = []
    for m in schedule:
        qc = QuantumCircuit(A.num_qubits, name="{}_m{}".format(name, m))
        qc.compose(A, inplace=True)
        for _ in range(m):
            qc.compose(Q, inplace=True)
        qc.measure_all()
        out.append(qc)
    return out


def exact_probability_one(probs, f, m):
    a = float(np.dot(probs, f))
    th = math.asin(math.sqrt(min(max(a, 0.0), 1.0)))
    return math.sin((2 * m + 1) * th) ** 2


# ---------------------------------------------------------------------------
# Maximum-likelihood estimation
# ---------------------------------------------------------------------------
def mle(hits, shots, schedule=SCHEDULE, grid=6000):
    """Maximum-likelihood a from (hits, shots) per Grover power, with a Fisher-information
    95 % interval."""
    th = (np.arange(grid) + 0.5) / grid * (math.pi / 2)
    ll = np.zeros(grid)
    for h, n, m in zip(hits, shots, schedule):
        s = np.sin((2 * m + 1) * th) ** 2
        s = np.clip(s, 1e-12, 1 - 1e-12)
        ll += h * np.log(s) + (n - h) * np.log(1 - s)
    k = int(np.argmax(ll))
    # refine around the best grid point
    lo, hi = th[max(k - 1, 0)], th[min(k + 1, grid - 1)]
    fine = np.linspace(lo, hi, 400)
    llf = np.zeros(len(fine))
    for h, n, m in zip(hits, shots, schedule):
        s = np.clip(np.sin((2 * m + 1) * fine) ** 2, 1e-12, 1 - 1e-12)
        llf += h * np.log(s) + (n - h) * np.log(1 - s)
    t = float(fine[int(np.argmax(llf))])
    a = math.sin(t) ** 2
    fisher = sum(4.0 * n * (2 * m + 1) ** 2 for n, m in zip(shots, schedule))
    sd_t = 1.0 / math.sqrt(fisher)
    sd_a = abs(math.sin(2 * t)) * sd_t
    return {"a": a, "ci95": [max(0.0, a - 1.96 * sd_a), min(1.0, a + 1.96 * sd_a)], "sd": sd_a}


def oracle_calls(shots, schedule=SCHEDULE):
    """Calls to A: each shot of the circuit with m Grover steps uses A (2m + 1) times."""
    return int(sum(n * (2 * m + 1) for n, m in zip(shots, schedule)))


def hits_from_counts(counts, shots=None, obj_bit=N_INDEX):
    """Shots with the objective qubit measured as 1. Accepts integer counts or
    probabilities (IonQ's ideal simulator), scaled by shots."""
    raw = {k: float(v) for k, v in counts.items()}
    tot = sum(raw.values())
    if shots and 0 < tot <= 1.0 + 1e-6:
        raw = {k: v * shots for k, v in raw.items()}
        tot = shots
    hit = 0.0
    members = np.zeros(1 << N_INDEX)
    nbits = N_INDEX + 2
    for key, c in raw.items():
        b = str(key).replace(" ", "")
        if b.startswith("0x"):
            b = bin(int(b, 16))[2:]
        b = b.zfill(nbits)[-nbits:]
        if b[nbits - 1 - obj_bit] == "1":
            hit += c
        members[int(b[nbits - N_INDEX:], 2)] += c
    return int(round(hit)), int(round(tot)), members


def emulate_counts(probs, f, m, shots, rng):
    """Sample the ideal circuit's outcome distribution without running it (labelled emulation)."""
    p1 = exact_probability_one(probs, f, m)
    h = int(rng.binomial(shots, p1))
    # member index marginal after m steps: computed exactly from the amplitudes
    a = float(np.dot(probs, f))
    th = math.asin(math.sqrt(min(max(a, 0.0), 1.0)))
    good = np.asarray(probs) * np.asarray(f)
    bad = np.asarray(probs) * (1 - np.asarray(f))
    g = good / good.sum() if good.sum() > 0 else good
    b = bad / bad.sum() if bad.sum() > 0 else bad
    marg = math.sin((2 * m + 1) * th) ** 2 * g + math.cos((2 * m + 1) * th) ** 2 * b
    members = rng.multinomial(shots, marg / marg.sum())
    counts = {}
    for k in range(len(members)):
        n_good = int(rng.binomial(members[k], (math.sin((2 * m + 1) * th) ** 2 * g[k]) / max(marg[k], 1e-15)))
        if n_good:
            counts[format((1 << N_INDEX) | k, "05b")] = counts.get(format((1 << N_INDEX) | k, "05b"), 0) + n_good
        if members[k] - n_good:
            counts[format(k, "05b")] = counts.get(format(k, "05b"), 0) + int(members[k] - n_good)
    return counts


def scaling_curves(a, repeats=300, seed=7, max_power=6):
    """Root-mean-square error against oracle calls for MLAE (schedule 0, 1, 2, 4, ... 2^k with
    100 shots each) and for classical sampling with the same number of calls. Ideal, sampled
    from the exact probabilities. Not used by the page; kept for experiments in a terminal."""
    rng = np.random.default_rng(seed)
    out = {"calls": [], "qae_rmse": [], "mc_rmse": []}
    th = math.asin(math.sqrt(min(max(a, 1e-6), 1 - 1e-6)))
    for k in range(1, max_power + 1):
        sched = [0] + [2 ** j for j in range(k)]
        shots = [100] * len(sched)
        calls = oracle_calls(shots, sched)
        errs = []
        for _ in range(repeats):
            hits = [rng.binomial(100, math.sin((2 * m + 1) * th) ** 2) for m in sched]
            errs.append(mle(hits, shots, sched, grid=3000)["a"] - a)
        mc = rng.binomial(calls, a, size=repeats) / calls - a
        out["calls"].append(calls)
        out["qae_rmse"].append(float(np.sqrt(np.mean(np.square(errs)))))
        out["mc_rmse"].append(float(np.sqrt(np.mean(np.square(mc)))))
    return out
