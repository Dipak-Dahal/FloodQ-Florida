"""
Constraint-preserving QAOA (the Quantum Alternating Operator Ansatz of Hadfield et al.,
Algorithms 12, 34 (2019)) for "give each evacuation group exactly one of its options".

Encoding: one qubit per (group g, option o); x[g,o] = 1 means "group g takes option o".
Each group's qubits form a one-hot register; an option that does not exist gets no qubit.

* Initial state: a W state on every register, i.e. an equal superposition of all valid
  plans and nothing else.
* Phase separator: exp(-i gamma C) of the cost (travel + risk + Neukart congestion and
  crowding squares), with RZ and RZZ gates.
* Mixer: the XY ring mixer of Wang, Rubin, Dominy and Rieffel (Phys. Rev. A 101, 012320,
  2020), RXX(beta) RYY(beta) between neighbouring options of a group. It moves the group's
  single excitation between options and never leaves the valid subspace.

On an ideal simulator every shot is therefore a valid plan; with noise some shots break the
one-hot rule and are discarded.

Because the ideal dynamics stay in the valid subspace, the circuit can be emulated exactly
in (number of valid plans) dimensions instead of 2^qubits (81 instead of 4,096 for four groups
with three options). That emulation trains the angles (CVaR objective, Barkoutsos et al.,
Quantum 4, 256, 2020; layer-by-layer INTERP start, Zhou et al., PRX 10, 021067, 2020; then a
Gibbs-objective sharpening step, Li et al., Phys. Rev. Research 2, 023074, 2020, kept only if
CVaR does not get worse), and every run checks it against Qiskit's Statevector of the circuit.
"""
import itertools
import math

import numpy as np
from scipy.optimize import minimize
from qiskit import QuantumCircuit


# --------------------------------------------------------------------------
# Problem container
# --------------------------------------------------------------------------
class AssignmentProblem:
    """C(x) = sum_f a_f x_f + sum_{f<g} b_fg x_f x_g with one-hot groups.

    Terms are keyed by flat ids f = n * S + s. Only allowed (n, s) pairs get a
    qubit; terms that touch a disallowed pair are dropped (that x is always 0).
    """

    def __init__(self, n_groups, n_options, linear, quadratic, options=None):
        self.N, self.S = n_groups, n_options
        if options is None:
            options = [range(n_options)] * n_groups
        self.options = [sorted(int(s) for s in opts) for opts in options]
        if len(self.options) != n_groups or any(not o for o in self.options):
            raise ValueError("every group needs at least one allowed option")
        self.flat = [n * n_options + s for n in range(n_groups) for s in self.options[n]]
        self.qidx = {f: i for i, f in enumerate(self.flat)}
        self.nq = len(self.flat)
        lin = np.asarray(linear, float).reshape(n_groups * n_options)
        self.a = {f: float(lin[f]) for f in self.flat}
        self.b = {}
        for key, v in quadratic.items():
            i, j = sorted(key)
            if i in self.qidx and j in self.qidx and abs(v) > 0:
                self.b[(i, j)] = self.b.get((i, j), 0.0) + float(v)

        self.plans = list(itertools.product(*self.options))
        shape = (n_options,) * n_groups
        self.feasible = np.zeros(shape, dtype=bool)
        self.cost_tensor = np.full(shape, np.nan)
        for plan in self.plans:
            self.feasible[plan] = True
            self.cost_tensor[plan] = self.cost(plan)
        vals = self.cost_tensor[self.feasible]
        self.cmin, self.cmax = float(vals.min()), float(vals.max())
        self.span = max(self.cmax - self.cmin, 1e-9)
        self.norm_tensor = np.where(self.feasible, (self.cost_tensor - self.cmin) / self.span, 0.0)
        self.optimum = min(self.plans, key=lambda p: self.cost_tensor[p])

    def qubit(self, n, s):
        return self.qidx[n * self.S + s]

    def cost(self, plan):
        on = [n * self.S + s for n, s in enumerate(plan)]
        c = sum(self.a[f] for f in on)
        on_set = set(on)
        c += sum(v for (i, j), v in self.b.items() if i in on_set and j in on_set)
        return float(c)

    def partial_cost(self, assign):
        """Cost of a partial plan {group: option} (used by the greedy baseline)."""
        on = [n * self.S + s for n, s in assign.items()]
        on_set = set(on)
        return float(sum(self.a[f] for f in on) +
                     sum(v for (i, j), v in self.b.items() if i in on_set and j in on_set))

    def ising(self):
        """Scaled Ising fields on qubits so that exp(-i g H) == exp(-i g C_norm) up to a global phase."""
        h = np.zeros(self.nq)
        for f, v in self.a.items():
            h[self.qidx[f]] -= v / 2.0
        J = {}
        for (i, j), v in self.b.items():
            qi, qj = sorted((self.qidx[i], self.qidx[j]))
            h[qi] -= v / 4.0
            h[qj] -= v / 4.0
            J[(qi, qj)] = J.get((qi, qj), 0.0) + v / 4.0
        h = h / self.span
        J = {k: v / self.span for k, v in J.items()}
        return h, J


# --------------------------------------------------------------------------
# Exact emulation in the valid subspace
# --------------------------------------------------------------------------
def ring_pairs(k):
    """Neighbouring positions of a ring of k options (a single pair for k = 2)."""
    if k < 2:
        return []
    if k == 2:
        return [(0, 1)]
    return [(i, (i + 1) % k) for i in range(k)]


def ring_mixer(S, beta, opts=None):
    """S x S unitary of the XY ring mixer over the allowed options, restricted to one excitation."""
    opts = list(range(S)) if opts is None else list(opts)
    M = np.eye(S, dtype=complex)
    c, s = math.cos(beta), math.sin(beta)
    for a, b in ring_pairs(len(opts)):
        ia, ib = opts[a], opts[b]
        G = np.eye(S, dtype=complex)
        G[ia, ia] = G[ib, ib] = c
        G[ia, ib] = G[ib, ia] = -1j * s
        M = G @ M
    return M


class SubspaceQAOA:
    """Exact emulation of the circuit in the space of valid plans (S^N amplitudes, with the
    disallowed options of each group fixed at zero)."""

    def __init__(self, problem):
        self.pb = problem
        self.c = problem.norm_tensor
        N, S = problem.N, problem.S
        self.c_flat = self.c.ravel()
        psi0 = np.ones(1)
        for opts in problem.options:
            w = np.zeros(S)
            w[opts] = 1.0 / math.sqrt(len(opts))
            psi0 = np.kron(psi0, w)
        self.psi0 = psi0.astype(complex)
        # the ring mixer of a group is a product of two-level rotations
        # G = I + (cos b - 1) P - i sin b X on each neighbouring pair of allowed options
        self.pairs = []
        for opts in problem.options:
            lst = []
            for a, b in ring_pairs(len(opts)):
                ia, ib = opts[a], opts[b]
                P = np.zeros((S, S))
                X = np.zeros((S, S))
                P[ia, ia] = P[ib, ib] = 1.0
                X[ia, ib] = X[ib, ia] = 1.0
                lst.append((P, X))
            self.pairs.append(lst)
        self.keys = [tuple(o) for o in problem.options]
        self.eye = np.eye(S, dtype=complex)
        self.order = np.argsort(self.c_flat)
        self.c_sorted = self.c_flat[self.order]

    def mixers(self, beta):
        """Each group's S x S mixer for this beta (groups with the same options share one)."""
        c, s = math.cos(beta), math.sin(beta)
        cache, out = {}, []
        for key, lst in zip(self.keys, self.pairs):
            if key not in cache:
                M = self.eye
                for P, X in lst:
                    M = (self.eye + (c - 1.0) * P - 1j * s * X) @ M
                cache[key] = M
            out.append(cache[key])
        return out

    def state_flat(self, gammas, betas):
        S = self.pb.S
        psi = self.psi0
        for g, b in zip(gammas, betas):
            psi = psi * np.exp(-1j * g * self.c_flat)
            for n, M in enumerate(self.mixers(b)):
                # apply M to group n's index: (S^n, S, rest) with a broadcast matmul
                psi = (M @ psi.reshape(S ** n, S, -1)).reshape(-1)
        return psi

    def state(self, gammas, betas):
        return self.state_flat(gammas, betas).reshape((self.pb.S,) * self.pb.N)

    def probs(self, gammas, betas):
        return np.abs(self.state(gammas, betas)) ** 2

    def objective(self, theta, alpha):
        p = len(theta) // 2
        pr = np.abs(self.state_flat(theta[:p], theta[p:])) ** 2
        if alpha >= 1.0:
            return float(pr @ self.c_flat)
        # CVaR_alpha (Barkoutsos et al. 2020): mean cost of the best alpha probability mass
        p_sorted = pr[self.order]
        before = np.cumsum(p_sorted) - p_sorted
        w = np.minimum(p_sorted, np.maximum(alpha - before, 0.0))
        return float(w @ self.c_sorted / alpha)

    def gibbs(self, theta, eta):
        """Gibbs objective -log <exp(-eta * cost)> (Li et al., Phys. Rev. Research 2, 023074, 2020),
        cost scaled to [0, 1] over the valid plans. Unlike CVaR it keeps rewarding probability
        moved onto the cheapest plans after the best alpha of the mass is already there."""
        p = len(theta) // 2
        pr = np.abs(self.state_flat(theta[:p], theta[p:])) ** 2
        span = max(self.c_sorted[-1] - self.c_sorted[0], 1e-12)
        return float(-np.log(pr @ np.exp(-eta * (self.c_flat - self.c_sorted[0]) / span) + 1e-300))

    def train(self, layers=2, alpha=0.1, seed=7, restarts=2, eta=20.0):
        """p=1 grid search, then layer-wise INTERP starts + Nelder-Mead on CVaR, then a Gibbs
        sharpening step that is kept only if it does not make CVaR worse. Nothing here looks at
        which plan is optimal; the optimum is only used afterwards to report how often it comes up."""
        gs = np.linspace(0.05, 3 * math.pi, 30)
        bs = np.linspace(0.05, math.pi - 0.05, 16)
        best = (math.inf, None)
        for g in gs:
            for b in bs:
                v = self.objective(np.array([g, b]), alpha)
                if v < best[0]:
                    best = (v, np.array([g, b]))
        theta = best[1]
        evals = len(gs) * len(bs)
        for p in range(1, layers + 1):
            if p > 1:
                g_old, b_old = theta[:p - 1], theta[p - 1:]
                xs_old = np.linspace(0, 1, p - 1) if p > 2 else np.array([0.5])
                xs = np.linspace(0, 1, p)
                theta = np.concatenate([np.interp(xs, xs_old, g_old), np.interp(xs, xs_old, b_old)])
            rng = np.random.default_rng(seed + p)
            starts = [theta] + [theta + rng.normal(0, 0.15, theta.shape) for _ in range(restarts if p > 1 else 0)]
            best_res = None
            for th0 in starts:
                res = minimize(lambda th: self.objective(th, alpha), th0, method="Nelder-Mead",
                               options={"maxiter": 250 * p, "xatol": 1e-4, "fatol": 1e-6})
                evals += res.nfev
                if best_res is None or res.fun < best_res.fun:
                    best_res = res
            theta = best_res.x
        sharpened = False
        if eta:
            base = self.objective(theta, alpha)
            res = minimize(lambda th: self.gibbs(th, eta), theta, method="Nelder-Mead",
                           options={"maxiter": 400 * layers, "xatol": 1e-4, "fatol": 1e-8})
            evals += res.nfev
            if self.objective(res.x, alpha) <= base + 1e-9 * max(1.0, abs(base)):
                theta, sharpened = res.x, True
        p = layers
        pr = self.probs(theta[:p], theta[p:])
        return {"gammas": theta[:p].tolist(), "betas": theta[p:].tolist(), "evals": int(evals),
                "p_opt": float(pr[self.pb.optimum]), "sharpened": sharpened,
                "expected_norm_cost": float((pr * self.c).sum()), "probs": pr}


# --------------------------------------------------------------------------
# Qiskit circuit
# --------------------------------------------------------------------------
def _cry(qc, theta, c, t):
    """Controlled-RY from RY + CX only (gates every Qollab backend accepts)."""
    qc.ry(theta / 2, t)
    qc.cx(c, t)
    qc.ry(-theta / 2, t)
    qc.cx(c, t)


def w_state(qc, qubits):
    """Uniform superposition of the len(qubits) one-hot states (just X for one qubit)."""
    k = len(qubits)
    qc.x(qubits[0])
    for i in range(k - 1):
        _cry(qc, 2 * math.acos(math.sqrt(1.0 / (k - i))), qubits[i], qubits[i + 1])
        qc.cx(qubits[i + 1], qubits[i])


def build_circuit(problem, gammas, betas, measure=True, name="xy_qaoa"):
    h, J = problem.ising()
    qc = QuantumCircuit(problem.nq, name=name)
    groups = [[problem.qubit(n, s) for s in problem.options[n]] for n in range(problem.N)]
    for qubits in groups:
        w_state(qc, qubits)
    for g, b in zip(gammas, betas):
        for i, hi in enumerate(h):
            if abs(hi) > 1e-12:
                qc.rz(2 * g * hi, i)
        for (i, j), Jij in sorted(J.items()):
            if abs(Jij) > 1e-12:
                qc.rzz(2 * g * Jij, i, j)
        for qubits in groups:
            for a, c in ring_pairs(len(qubits)):
                qc.rxx(b, qubits[a], qubits[c])
                qc.ryy(b, qubits[a], qubits[c])
    if measure:
        qc.measure_all()
    return qc


def statevector_check(problem, gammas, betas, sub_probs):
    """Max |p_subspace - p_qiskit| over valid plans, and leakage outside them."""
    from qiskit.quantum_info import Statevector
    qc = build_circuit(problem, gammas, betas, measure=False)
    amps = Statevector.from_instruction(qc).data
    worst, inside = 0.0, 0.0
    for plan in problem.plans:
        idx = sum(1 << problem.qubit(n, s) for n, s in enumerate(plan))
        p = abs(amps[idx]) ** 2
        inside += p
        worst = max(worst, abs(p - sub_probs[plan]))
    return {"max_abs_diff": float(worst), "leakage": float(max(0.0, 1.0 - inside))}


# --------------------------------------------------------------------------
# Decoding
# --------------------------------------------------------------------------
def _bits(key, nq):
    k = str(key).replace(" ", "")
    if k.startswith("0x"):
        k = bin(int(k, 16))[2:]
    return k.zfill(nq)[-nq:]


def decode_counts(problem, counts, shots=None):
    """Turn backend counts into {plan: shots}. Accepts integer counts, fractional
    counts, or probabilities summing to 1 (scaled by `shots`, as IonQ's ideal
    simulator reports). Shots that are not one-hot per group count as invalid."""
    nq = problem.nq
    raw = {k: float(v) for k, v in counts.items()}
    total_raw = sum(raw.values())
    if shots and 0 < total_raw <= 1.0 + 1e-6:
        raw = {k: v * shots for k, v in raw.items()}
    plans, invalid, total = {}, 0, 0
    for key, c in raw.items():
        c = int(round(c))
        if c <= 0:
            continue
        total += c
        b = _bits(key, nq)
        plan = []
        for n in range(problem.N):
            on = [s for s in problem.options[n] if b[nq - 1 - problem.qubit(n, s)] == "1"]
            if len(on) != 1:
                plan = None
                break
            plan.append(on[0])
        if plan is None:
            invalid += c
        else:
            plans[tuple(plan)] = plans.get(tuple(plan), 0) + c
    return plans, invalid, total


def emulate_counts(problem, probs, shots, seed=11):
    """Sample bitstrings from the exact distribution (labelled as emulation)."""
    rng = np.random.default_rng(seed)
    flat = probs.ravel() / probs.sum()
    draws = rng.multinomial(shots, flat)
    counts = {}
    for idx in np.flatnonzero(draws):
        plan = np.unravel_index(idx, probs.shape)
        v = sum(1 << problem.qubit(n, int(s)) for n, s in enumerate(plan))
        counts[format(v, "0{}b".format(problem.nq))] = int(draws[idx])
    return counts
