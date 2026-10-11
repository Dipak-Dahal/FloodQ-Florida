"""
Pick K of N candidate evacuation routes with a constraint-preserving QAOA.

For the place a person types in, the page finds up to N candidate routes to safe destinations
(classical time-dependent shortest paths over the statewide highway graph, with the storm's road
closures and the statewide plan's traffic). It then has to choose the K routes it shows. Each
should be fast and safe, and together they should not lean on the same roads, so that one jammed
or closed highway cannot take out every option. That is a quadratic problem with a cardinality
rule:

    C(x) = sum_i c_i x_i + sum_{i<j} J_ij x_i x_j,   subject to  sum_i x_i = K

c_i is a route's own cost (travel time, chance of hurricane wind at the destination, shelter
crowding left by the statewide plan, how close the trip runs to a road closure) and J_ij grows
with the share of road two routes have in common (app.js).

Encoding: one qubit per candidate route; x_i = 1 means "route i is shown".
* Initial state: the Dicke state |D^N_K>, an equal superposition of every way to pick exactly K
  routes and nothing else, made with the split-and-cyclic-shift circuit of A. Baertschi and
  S. Eidenbenz, "Deterministic preparation of Dicke states", FCT 2019 (arXiv:1904.07358), from RY
  and CX gates only. When K > N/2 the circuit prepares |D^N_{N-K}> and flips every qubit, which
  needs fewer gates.
* Phase separator: exp(-i gamma C) with RZ and RZZ (the Ising mapping of qaoa.py).
* Mixer: the XY ring mixer, RXX(beta) RYY(beta) between neighbouring qubits. It swaps a chosen
  and an unchosen route, so it never changes how many routes are chosen (Hadfield et al.,
  Algorithms 12, 34, 2019; Wang et al., Phys. Rev. A 101, 012320, 2020).
On an ideal simulator every shot therefore picks exactly K routes; with noise, other shots are
counted as invalid and dropped.

The angles are trained on an exact emulation of the circuit in the C(N, K)-dimensional subspace.
The page does that in JavaScript (routes.js), so the double-click view and Qollab show the same
angles; this module builds the Qiskit circuit from them, checks it against an independent numpy
emulation and Qiskit's Statevector, and decodes the shots.
"""
import itertools
import math

import numpy as np
from qiskit import QuantumCircuit

from .qaoa import _bits, _cry, ring_pairs


class SelectionProblem:
    """C(x) = sum_i a_i x_i + sum_{i<j} b_ij x_i x_j over the choices with exactly k ones."""

    def __init__(self, n, k, linear, quadratic):
        self.n, self.k = int(n), int(k)
        if not 0 < self.k < self.n:
            raise ValueError("need 0 < k < n")
        self.a = [float(x) for x in linear]
        if len(self.a) != self.n:
            raise ValueError("one linear cost per candidate")
        self.b = {}
        for (i, j), v in quadratic.items():
            i, j = sorted((int(i), int(j)))
            if i != j and abs(v) > 0:
                self.b[(i, j)] = self.b.get((i, j), 0.0) + float(v)
        self.sets = list(itertools.combinations(range(self.n), self.k))
        self.masks = [sum(1 << i for i in s) for s in self.sets]
        self.costs = np.array([self.cost(s) for s in self.sets])
        self.cmin, self.cmax = float(self.costs.min()), float(self.costs.max())
        self.span = max(self.cmax - self.cmin, 1e-9)
        self.norm = (self.costs - self.cmin) / self.span
        self.optimum = self.sets[int(np.argmin(self.costs))]

    def cost(self, chosen):
        s = set(chosen)
        return float(sum(self.a[i] for i in s) + sum(v for (i, j), v in self.b.items() if i in s and j in s))

    def greedy(self):
        """The k candidates with the lowest cost of their own, ignoring shared roads."""
        return tuple(sorted(sorted(range(self.n), key=lambda i: (self.a[i], i))[:self.k]))

    def ising(self):
        """Fields h and couplings J with exp(-i g H) == exp(-i g C / span) up to a global phase."""
        h = np.zeros(self.n)
        for i, v in enumerate(self.a):
            h[i] -= v / 2.0
        J = {}
        for (i, j), v in self.b.items():
            h[i] -= v / 4.0
            h[j] -= v / 4.0
            J[(i, j)] = J.get((i, j), 0.0) + v / 4.0
        return h / self.span, {key: v / self.span for key, v in J.items()}


# ---------------------------------------------------------------------------
# Exact emulation in the subspace of "exactly k chosen" (an independent port of routes.js)
# ---------------------------------------------------------------------------
def subspace_probs(pb, gammas, betas):
    """Probabilities of pb.sets after the Dicke state and the QAOA layers."""
    index = {m: t for t, m in enumerate(pb.masks)}
    psi = np.full(len(pb.sets), 1.0 / math.sqrt(len(pb.sets)), dtype=complex)
    rings = []
    for a, b in ring_pairs(pb.n):
        us, vs = [], []
        for t, m in enumerate(pb.masks):
            if (m >> a) & 1 and not (m >> b) & 1:
                us.append(t)
                vs.append(index[m ^ (1 << a) ^ (1 << b)])
        rings.append((np.array(us, int), np.array(vs, int)))
    for g, beta in zip(gammas, betas):
        psi = psi * np.exp(-1j * g * pb.norm)
        c, s = math.cos(beta), math.sin(beta)
        for us, vs in rings:
            pu, pv = psi[us].copy(), psi[vs].copy()
            psi[us] = c * pu - 1j * s * pv
            psi[vs] = -1j * s * pu + c * pv
    return np.abs(psi) ** 2


def grid_angles(pb, alpha=0.1, n_gamma=30, n_beta=16):
    """p = 1 angles from a CVaR grid search (for the self-test and the terminal; the page trains
    p = 2 angles in routes.js)."""
    order = np.argsort(pb.norm)
    best = (math.inf, None)
    for g in np.linspace(0.05, 3 * math.pi, n_gamma):
        for b in np.linspace(0.05, math.pi - 0.05, n_beta):
            p = subspace_probs(pb, [g], [b])[order]
            before = np.cumsum(p) - p
            w = np.minimum(p, np.maximum(alpha - before, 0.0))
            v = float(w @ pb.norm[order] / alpha)
            if v < best[0]:
                best = (v, ([float(g)], [float(b)]))
    return best[1]


# ---------------------------------------------------------------------------
# Qiskit circuit
# ---------------------------------------------------------------------------
def _ccry(qc, theta, c1, c2, t):
    """RY(theta) on t when c1 and c2 are both 1, from RY and CX only (V = RY(theta / 2))."""
    _cry(qc, theta / 2, c2, t)
    qc.cx(c1, c2)
    _cry(qc, -theta / 2, c2, t)
    qc.cx(c1, c2)
    _cry(qc, theta / 2, c1, t)


def dicke_state(qc, qubits, k):
    """Equal superposition of every bit string with k ones on `qubits` (Baertschi and Eidenbenz
    2019). Position p = 1..n is qubits[p - 1]. Start from |0..01..1>; each split-and-cyclic-shift
    step SCS_m decides, for the m first positions, whether the last of them keeps a 1 (amplitude
    sqrt(l/m) when they hold l ones) or hands it one place to the left."""
    n = len(qubits)
    kk = min(k, n - k)
    pos = lambda p: qubits[p - 1]
    for p in range(n - kk + 1, n + 1):
        qc.x(pos(p))
    for m in range(n, 1, -1):
        top = min(kk, m - 1)
        if top < 1:
            continue
        qc.cx(pos(m - 1), pos(m))
        _cry(qc, 2 * math.acos(math.sqrt(1.0 / m)), pos(m), pos(m - 1))
        qc.cx(pos(m - 1), pos(m))
        for l in range(2, top + 1):
            qc.cx(pos(m - l), pos(m))
            _ccry(qc, 2 * math.acos(math.sqrt(l / m)), pos(m), pos(m - l + 1), pos(m - l))
            qc.cx(pos(m - l), pos(m))
    if kk != k:
        for q in qubits:
            qc.x(q)


def build_circuit(pb, gammas, betas, measure=True, name="routes"):
    h, J = pb.ising()
    qc = QuantumCircuit(pb.n, name=name)
    qubits = list(range(pb.n))
    dicke_state(qc, qubits, pb.k)
    for g, b in zip(gammas, betas):
        for i, hi in enumerate(h):
            if abs(hi) > 1e-12:
                qc.rz(2 * g * hi, i)
        for (i, j), Jij in sorted(J.items()):
            if abs(Jij) > 1e-12:
                qc.rzz(2 * g * Jij, i, j)
        for a, c in ring_pairs(pb.n):
            qc.rxx(b, qubits[a], qubits[c])
            qc.ryy(b, qubits[a], qubits[c])
    if measure:
        qc.measure_all()
    return qc


def statevector_check(pb, gammas, betas, probs):
    """Max |p_emulation - p_qiskit| over the valid choices, and the probability outside them."""
    from qiskit.quantum_info import Statevector
    qc = build_circuit(pb, gammas, betas, measure=False)
    amps = Statevector.from_instruction(qc).data
    worst, inside = 0.0, 0.0
    for t, m in enumerate(pb.masks):
        p = abs(amps[m]) ** 2
        inside += p
        worst = max(worst, abs(p - float(probs[t])))
    return {"max_abs_diff": float(worst), "leakage": float(max(0.0, 1.0 - inside))}


# ---------------------------------------------------------------------------
# Decoding
# ---------------------------------------------------------------------------
def decode_counts(pb, counts, shots=None):
    """Backend counts to {mask: shots} over the valid choices (exactly k ones). Accepts integer
    counts, fractional counts, or probabilities summing to 1 (scaled by `shots`, as IonQ's ideal
    simulator reports). Shots with another number of ones count as invalid."""
    raw = {k: float(v) for k, v in counts.items()}
    total_raw = sum(raw.values())
    if shots and 0 < total_raw <= 1.0 + 1e-6:
        raw = {k: v * shots for k, v in raw.items()}
    out, invalid, total = {}, 0, 0
    for key, c in raw.items():
        c = int(round(c))
        if c <= 0:
            continue
        total += c
        m = int(_bits(key, pb.n), 2)
        if bin(m).count("1") != pb.k:
            invalid += c
        else:
            out[m] = out.get(m, 0) + c
    return out, invalid, total


def emulate_counts(pb, probs, shots, seed=11):
    """Sample bit strings from the exact distribution (labelled as emulation)."""
    rng = np.random.default_rng(seed)
    p = np.asarray(probs, float)
    draws = rng.multinomial(int(shots), p / p.sum())
    return {format(pb.masks[t], "0{}b".format(pb.n)): int(c) for t, c in enumerate(draws) if c}
