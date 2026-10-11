"""
Hurricane hazard model for the whole state, hour by hour.

* Track: Akima spline in time through the scenario points.
* Intensity over land: Kaplan & DeMaria (1995) inland decay,
  V(t) = Vb + (V0 - Vb) exp(-alpha t), Vb = 26.7 kt, alpha = 0.095 /h (their R factor
  is left to the wind field's land roughness term).
* Wind: Holland (1980) gradient-wind profile, 0.9 to surface, 20 deg inflow,
  0.85 over land for roughness, plus the forward-motion asymmetry of
  Jelesnianski (1966). Pressure deficit from Holland's Vmax-B relation.
* Storm surge, per coastal segment (about every 5 km): the steady 1-D wind set-up
  over the continental shelf, eta = (rho_air Cd / rho_water g) * U|U| * integral(ds / h),
  with the shelf integral precomputed from ETOPO1 depths along rays out to sea
  (tools/build_geodata.py) and saturated so that very wide shelves do not run away.
  Cd follows Garratt (1977), capped at 2.5e-3 (Powell et al. 2003). Onshore wind
  piles water up and offshore wind drains it (negative surge); alongshore wind with
  the coast on its right adds Ekman set-up. Plus the inverse barometer (1 cm per hPa)
  and the astronomical tide. Highest modelled surge within 12 km of the worst-hit place
  against the NHC storm reports (depths above ground, so only roughly comparable): Ian,
  Fort Myers Beach 5.2 m (3 to 4.6 m observed); Helene 4.2 m at Horseshoe Beach but 2.6 m
  at Keaton Beach (3.7 to 4.9 m observed there); Irma, Lower Keys 3.5 m (1.5 to 2.4 m);
  Michael, Mexico Beach 2.1 m (up to about 4.3 m); Andrew, Biscayne Bay 1.8 m (5.2 m
  storm tide). It is a screening model, not SLOSH.
* Inland water: depth = water level at the nearest coast - (ground + 0.10 m per km
  inland), the inland term standing in for friction over land.
* Rain: a rain-rate profile that peaks near the eyewall, scaled so a storm's total
  matches the Kraft rule (about 100 / forward speed in knots, inches).
* Track uncertainty: eight cross-track members whose spread grows like the NHC
  cone (two-thirds circle radius / 1.482 = one standard deviation), so the model
  can give the chance of surge or hurricane winds anywhere (like NWS P-Surge).
"""
import math

import numpy as np
from scipy.interpolate import Akima1DInterpolator

from . import geo, places

KT = 0.514444            # m/s per knot
NM = 1.852               # km per nautical mile
RHO_AIR = 1.15
RHO_SEA = 1025.0
G = 9.81
OMEGA = 7.292e-5

K_MIN, K0 = 900.0, 3800.0     # saturation of the shelf integral (see module docstring)
LAND_FACTOR = 0.85            # surface wind over land / over open water
SURGE_GAIN = 1.0              # global calibration factor
ALONGSHORE = 0.35
INLAND_LOSS = 0.10            # m of water level lost per km inland
TIDE_PERIOD = 12.42

COARSE = 0.1                  # degrees, grid for wind and rain products
CNX = int(round((geo.BBOX["lon_max"] - geo.BBOX["lon_min"]) / COARSE))
CNY = int(round((geo.BBOX["lat_max"] - geo.BBOX["lat_min"]) / COARSE))
C_LON = geo.BBOX["lon_min"] + (np.arange(CNX) + 0.5) * COARSE
C_LAT = geo.BBOX["lat_max"] - (np.arange(CNY) + 0.5) * COARSE
C_LON2, C_LAT2 = np.meshgrid(C_LON, C_LAT)


def category(v_kt):
    """Saffir-Simpson category (0 = tropical storm, -1 = depression)."""
    for c, lim in ((5, 137), (4, 113), (3, 96), (2, 83), (1, 64), (0, 34)):
        if v_kt >= lim:
            return c
    return -1


def cone_sigma_km(lead_h):
    """1-sigma cross-track error (km) at a forecast lead time, from the NHC cone radii."""
    pts = places.CONE_NM
    lead = max(0.0, float(lead_h))
    if lead >= pts[-1][0]:
        r = pts[-1][1] + (lead - pts[-1][0]) * (pts[-1][1] - pts[-2][1]) / (pts[-1][0] - pts[-2][0])
    else:
        for (h0, r0), (h1, r1) in zip(pts[:-1], pts[1:]):
            if h0 <= lead <= h1:
                r = r0 + (r1 - r0) * (lead - h0) / (h1 - h0)
                break
    return r * NM / 1.482


def is_land(lat, lon):
    lat = np.asarray(lat, float)
    lon = np.asarray(lon, float)
    i = np.floor((geo.BBOX["lat_max"] - lat) / geo.D).astype(int)
    j = np.floor((lon - geo.BBOX["lon_min"]) / geo.D).astype(int)
    inside = (i >= 0) & (i < geo.NY) & (j >= 0) & (j < geo.NX)
    out = lat > 31.0                       # north of the grid: Georgia and Alabama
    ii, jj = np.clip(i, 0, geo.NY - 1), np.clip(j, 0, geo.NX - 1)
    return np.where(inside, geo.LAND[ii, jj], out)


class Track:
    """Hourly storm track for one scenario, optionally shifted sideways and scaled."""

    def __init__(self, preset, shift_km=0.0, intensity=1.0, offsets_km=None):
        rows = preset["track"]
        hrs = [r[0] for r in rows]
        self.hours = np.arange(hrs[0], hrs[-1] + 1)
        # Akima spline in time: smooth, without the overshoot of a plain cubic
        self.lat = Akima1DInterpolator(hrs, [r[1] for r in rows])(self.hours)
        self.lon = Akima1DInterpolator(hrs, [r[2] for r in rows])(self.hours)
        # motion (finite differences), km/h and heading
        dy = np.gradient(self.lat) * geo.KM_LAT
        dx = np.gradient(self.lon) * geo.KM_LAT * np.cos(np.radians(self.lat))
        self.speed_kmh = np.hypot(dx, dy)
        self.dir_e = dx / np.maximum(self.speed_kmh, 1e-6)
        self.dir_n = dy / np.maximum(self.speed_kmh, 1e-6)
        # sideways shift (right of motion = positive), constant or per hour
        off = np.zeros(len(self.hours)) + shift_km
        if offsets_km is not None:
            off = off + np.asarray(offsets_km, float)
        if np.any(off != 0):
            re, rn = self.dir_n, -self.dir_e          # unit vector to the right of motion
            self.lat = self.lat + rn * off / geo.KM_LAT
            self.lon = self.lon + re * off / (geo.KM_LAT * np.cos(np.radians(self.lat)))
        self.rmax_km = np.interp(self.hours, hrs, [r[4] for r in rows]) * NM
        self.B = float(preset.get("holland_b", 1.4))
        # intensity: given over water; Kaplan-DeMaria decay over land (the surface-roughness
        # drop at the coast is applied by the wind field itself, so R = 1 here)
        given = {r[0]: r[3] for r in rows}
        land = is_land(self.lat, self.lon)
        self.over_land = land.astype(bool)
        v = np.zeros(len(self.hours))
        known_h = [h for h in hrs if given[h] > 0]
        v_given = np.interp(self.hours, known_h, [given[h] for h in known_h])
        t_land, v0, been_on_land = None, None, False
        for k, h in enumerate(self.hours):
            if land[k]:
                if k == 0 or not land[k - 1]:
                    t_land, v0 = h, (v[k - 1] if k else v_given[k])
                v[k] = 26.7 + (v0 - 26.7) * math.exp(-0.095 * (h - t_land))
                been_on_land = True
            else:
                later = any(kh >= h for kh in known_h)
                target = v_given[k] if (later or k == 0) else v[k - 1]
                # back over water after landfall: re-intensify no faster than 2 kt/h
                v[k] = min(target, v[k - 1] + 2.0) if (been_on_land and k) else target
        self.vmax_kt = np.maximum(v * intensity, 20.0)
        # Holland's pressure deficit (Pa) that gives this Vmax at gradient level with this B:
        # it sets the SHAPE of the wind profile.
        vg = self.vmax_kt * KT / 0.9
        self.dp_pa = RHO_AIR * math.e * vg ** 2 / self.B
        # The central pressure shown and used for the inverse-barometer rise comes from the
        # Atkinson-Holliday wind-pressure relation, scaled by 0.75 to match recent
        # large Atlantic storms (Ian 2022: 130 kt, about 940 hPa).
        self.deficit_hpa_c = 0.75 * (np.maximum(self.vmax_kt, 20.0) / 6.7) ** (1 / 0.644)
        self.pc_hpa = 1010.0 - self.deficit_hpa_c

    def index(self, hour):
        return int(round(hour - self.hours[0]))

    # ---------------------------------------------------------------------------
    def wind(self, k, lat, lon, over_water=None):
        """Surface wind (m/s) at points for hour index k: speed, east and north components."""
        lat = np.asarray(lat, float)
        lon = np.asarray(lon, float)
        clat, clon = self.lat[k], self.lon[k]
        dx = (lon - clon) * geo.KM_LAT * math.cos(math.radians(clat))
        dy = (lat - clat) * geo.KM_LAT
        r_km = np.maximum(np.hypot(dx, dy), 0.5)
        R = self.rmax_km[k]
        B = self.B
        f = 2 * OMEGA * math.sin(math.radians(clat))
        r_m = r_km * 1000.0
        x = (R / r_km) ** B
        vg = np.sqrt(B * self.dp_pa[k] / RHO_AIR * x * np.exp(-x) + (r_m * f / 2) ** 2) - r_m * f / 2
        vs = 0.9 * vg
        if over_water is None:
            over_water = ~is_land(lat, lon).astype(bool)
        vs = vs * np.where(over_water, 1.0, LAND_FACTOR)
        er_e, er_n = dx / r_km, dy / r_km               # radial outward
        et_e, et_n = -er_n, er_e                         # counter-clockwise tangent
        a = math.radians(20.0)
        we = vs * (math.cos(a) * et_e - math.sin(a) * er_e)
        wn = vs * (math.cos(a) * et_n - math.sin(a) * er_n)
        vt = self.speed_kmh[k] / 3.6
        asym = 0.5 * vt * (R * r_km) / (R * R + r_km * r_km)
        we = we + asym * self.dir_e[k]
        wn = wn + asym * self.dir_n[k]
        return np.hypot(we, wn), we, wn

    def deficit_hpa(self, k, lat, lon):
        lat = np.asarray(lat, float)
        lon = np.asarray(lon, float)
        dx = (lon - self.lon[k]) * geo.KM_LAT * math.cos(math.radians(self.lat[k]))
        dy = (lat - self.lat[k]) * geo.KM_LAT
        r_km = np.maximum(np.hypot(dx, dy), 0.5)
        return self.deficit_hpa_c[k] * (1.0 - np.exp(-(self.rmax_km[k] / r_km) ** self.B))

    def rain_rate(self, k, lat, lon):
        """mm/h. Peaks just outside the eyewall, tails off over about 250 km."""
        lat = np.asarray(lat, float)
        lon = np.asarray(lon, float)
        dx = (lon - self.lon[k]) * geo.KM_LAT * math.cos(math.radians(self.lat[k]))
        dy = (lat - self.lat[k]) * geo.KM_LAT
        r = np.hypot(dx, dy)
        rm = 1.4 * self.rmax_km[k] + 10.0
        peak = 6.0 + 0.16 * max(self.vmax_kt[k] - 34.0, 0.0)
        inner = 0.35 + 0.65 * r / rm
        outer = np.exp(-(r - rm) / 110.0)
        return RAIN_GAIN * peak * np.where(r < rm, inner, outer) * (r < 600)

    def radii_nm(self, k, thresholds=(34, 50, 64)):
        """Wind radii (n mi) in the NE, SE, SW, NW quadrants, 0 where the threshold is not reached."""
        out = []
        rs = np.linspace(2, 450, 300) * NM
        for q, ang in enumerate((45, 135, 225, 315)):
            th = math.radians(ang)
            lat = self.lat[k] + rs * math.cos(th) / geo.KM_LAT
            lon = self.lon[k] + rs * math.sin(th) / (geo.KM_LAT * math.cos(math.radians(self.lat[k])))
            spd, _, _ = self.wind(k, lat, lon, over_water=np.ones(len(rs), bool))
            kt = spd / KT
            row = []
            for t in thresholds:
                idx = np.flatnonzero(kt >= t)
                row.append(round(float(rs[idx[-1]] / NM), 0) if len(idx) else 0.0)
            out.append(row)
        return out


RAIN_GAIN = 1.0


# ---------------------------------------------------------------------------
# Surge along the coast
# ---------------------------------------------------------------------------
_SEG_LAT, _SEG_LON = geo.SEG[:, 0], geo.SEG[:, 1]
_NE, _NN = geo.SEG[:, 2], geo.SEG[:, 3]
_K = geo.SEG[:, 4]
_K_EFF = K_MIN + K0 * (1.0 - np.exp(-_K / K0))
_TE, _TN = _NN, -_NE                                   # along-coast direction, land on the right
# Wind is sampled over the near-shore shelf, where the set-up integral is dominated by the
# shallowest water: 4 points out along the normal and 2 to the sides, with fixed weights.
_SAMPLES = [(2.0, 0.0, 0.28), (8.0, 0.0, 0.24), (16.0, 0.0, 0.16), (28.0, 0.0, 0.10),
            (8.0, -12.0, 0.11), (8.0, 12.0, 0.11)]
_COSLAT = np.cos(np.radians(_SEG_LAT))
_S_LAT = np.concatenate([_SEG_LAT + (_NN * a + _TN * b) / geo.KM_LAT for a, b, _ in _SAMPLES])
_S_LON = np.concatenate([_SEG_LON + (_NE * a + _TE * b) / (geo.KM_LAT * _COSLAT) for a, b, _ in _SAMPLES])
_S_W = np.array([w for _, _, w in _SAMPLES])



def _tide_amp():
    lat, lon = _SEG_LAT, _SEG_LON
    amp = np.full(len(lat), 0.40)
    east = lon > -81.6
    amp[east & (lat > 29.0)] = 0.65
    amp[east & (lat > 27.0) & (lat <= 29.0)] = 0.45
    amp[east & (lat <= 27.0)] = 0.35
    amp[(lat < 25.3) & (lon > -82.0)] = 0.25           # Keys
    amp[(lon < -82.8) & (lon > -84.6) & (lat > 29.0)] = 0.55   # Big Bend
    return amp


TIDE_AMP = _tide_amp()


def tide(hours, high_at_landfall=True):
    """Tide (m) per segment and hour: semidiurnal, high tide at hour 0 if asked, else zero."""
    if not high_at_landfall:
        return np.zeros((len(hours), geo.NSEG))
    return TIDE_AMP[None, :] * np.cos(2 * math.pi * np.asarray(hours, float)[:, None] / TIDE_PERIOD)


def surge_series(track, hours_idx, tau_h=1.5):
    """Storm surge (m, no tide) for every coastal segment at the given hour indices (consecutive)."""
    out = np.zeros((len(hours_idx), geo.NSEG))
    level = np.zeros(geo.NSEG)
    keep = math.exp(-1.0 / tau_h)
    ns = len(_SAMPLES)
    ones = np.ones(ns * geo.NSEG, bool)
    for n, k in enumerate(hours_idx):
        spd, we, wn = track.wind(k, _S_LAT, _S_LON, over_water=ones)
        cd = np.minimum(2.5e-3, (0.75 + 0.067 * spd) * 1e-3)
        c = RHO_AIR * cd / (RHO_SEA * G)
        ne, nn = np.tile(_NE, ns), np.tile(_NN, ns)
        te, tn = np.tile(_TE, ns), np.tile(_TN, ns)
        u_on = -(we * ne + wn * nn)
        u_al = we * te + wn * tn
        stress = (c * (u_on * np.abs(u_on) + ALONGSHORE * u_al * np.abs(u_al))).reshape(ns, geo.NSEG)
        setup = _K_EFF * (_S_W[:, None] * stress).sum(0)
        # Offshore wind drains bays (Tampa Bay emptied in Irma 2017 and Milton 2024), but
        # the water that can leave is limited: 40 % of the set-up rate, floored at -1.8 m.
        setup = np.where(setup < 0, np.maximum(0.4 * setup, -1.8), setup)
        ib = track.deficit_hpa(k, _SEG_LAT, _SEG_LON) * 0.0101
        target = SURGE_GAIN * setup + ib
        level = keep * level + (1 - keep) * target if n else target
        out[n] = level
    return out


def ground_effective(elev):
    """Ground height plus the inland friction allowance; cells beyond 60 km never see surge."""
    z = elev + INLAND_LOSS * geo.DIST
    z = np.where(geo.LAND & (geo.DIST < 60), z, 99.0)
    return z


def depth_from_levels(level_by_seg, z_eff):
    """Inundation depth (m) on the grid for one hour's water level per segment."""
    return np.maximum(level_by_seg[geo.SEG_OF] - z_eff, 0.0)


# ---------------------------------------------------------------------------
# Whole-storm run (deterministic track) and the uncertainty ensemble
# ---------------------------------------------------------------------------
N_MEMBERS = 8
MEMBER_Q = (np.arange(N_MEMBERS) - (N_MEMBERS - 1) / 2) * 0.75    # offsets in sigmas (+-2.6)
_w = np.exp(-MEMBER_Q ** 2 / 2)
MEMBER_W = _w / _w.sum()


class StormRun:
    def __init__(self, preset, scen, elev=None):
        self.preset = preset
        self.scen = scen
        self.track = Track(preset, shift_km=scen.get("shift_km", 0.0), intensity=scen.get("intensity", 1.0))
        tr = self.track
        self.hours = [int(h) for h in places.HOURS]
        self.kidx = [tr.index(h) for h in self.hours]
        self.elev = geo.ELEV if elev is None else elev
        self.z_eff = ground_effective(self.elev)
        slr = float(scen.get("slr", 0.0))
        tides = tide(self.hours, scen.get("tide", True))
        self.surge = surge_series(tr, self.kidx)
        self.level = self.surge + tides + slr                   # hours x segments
        # what is wet with tide (and sea-level rise) but no storm
        base = (TIDE_AMP if scen.get("tide", True) else 0.0) + slr
        self.normally_wet = (geo.LAND & (self.z_eff < 98) &
                             (np.broadcast_to(base, (geo.NSEG,))[geo.SEG_OF] - self.z_eff > 0.05))
        self.max_level = self.level.max(0)
        self.max_depth = np.where(self.normally_wet, 0.0, depth_from_levels(self.max_level, self.z_eff))
        self._wind_products()
        self._rain()

    # ---- coarse wind products: tropical-storm arrival, max wind
    def _wind_products(self):
        tr = self.track
        n = CNX * CNY
        lat, lon = C_LAT2.ravel(), C_LON2.ravel()
        water = ~is_land(lat, lon).astype(bool)
        self.ts_arrival = np.full(n, 255, np.int16)      # hour index of first 34 kt, 255 = never
        self.hu_arrival = np.full(n, 255, np.int16)
        self.max_wind_kt = np.zeros(n)
        for t, k in enumerate(self.kidx):
            spd, _, _ = tr.wind(k, lat, lon, over_water=water)
            kt = spd / KT
            new_ts = (kt >= 34) & (self.ts_arrival == 255)
            self.ts_arrival[new_ts] = t
            new_hu = (kt >= 64) & (self.hu_arrival == 255)
            self.hu_arrival[new_hu] = t
            self.max_wind_kt = np.maximum(self.max_wind_kt, kt)
        self.radii = [tr.radii_nm(k) for k in self.kidx]

    def wind_at(self, t, lat, lon):
        spd, we, wn = self.track.wind(self.kidx[t], lat, lon)
        return spd / KT

    # ---- rain, 3-hourly cumulative on the coarse grid
    def _rain(self):
        tr = self.track
        lat, lon = C_LAT2.ravel(), C_LON2.ravel()
        acc = np.zeros(CNX * CNY)
        self.rain_frames = []          # cumulative mm at hours 0, 3, 6 ... (index into self.hours)
        for t, k in enumerate(self.kidx):
            acc = acc + tr.rain_rate(k, lat, lon)
            if t % 3 == 0:
                self.rain_frames.append(acc.copy())
        self.rain_total = acc

    # ---- ensemble for a decision made at stage hour
    def ensemble(self, stage_hour):
        """Eight cross-track members whose spread grows from zero at the stage hour, like the
        NHC cone. Returns member weights, offsets at landfall, per-member peak water level at
        each coast segment and per-member peak wind (kt) on the coarse grid."""
        tr = self.track
        hours = np.asarray(self.hours)
        sig = np.array([cone_sigma_km(h - stage_hour) for h in tr.hours])
        lat, lon = C_LAT2.ravel(), C_LON2.ravel()
        water = ~is_land(lat, lon).astype(bool)
        tides = tide(self.hours, self.scen.get("tide", True))
        slr = float(self.scen.get("slr", 0.0))
        t0 = self.hours.index(stage_hour)
        seg_peak = np.zeros((N_MEMBERS, geo.NSEG))
        wind_peak = np.zeros((N_MEMBERS, CNX * CNY))
        ts_first = np.full((N_MEMBERS, CNX * CNY), 255, np.int16)
        tracks = []
        for m, q in enumerate(MEMBER_Q):
            mt = Track(self.preset, shift_km=self.scen.get("shift_km", 0.0),
                       intensity=self.scen.get("intensity", 1.0), offsets_km=q * sig)
            tracks.append(mt)
            ks = self.kidx[t0:]
            lev = surge_series(mt, ks) + tides[t0:] + slr
            seg_peak[m] = lev.max(0)
            for n_, k in enumerate(ks[::2]):
                spd, _, _ = mt.wind(k, lat, lon, over_water=water)
                kt = spd / KT
                wind_peak[m] = np.maximum(wind_peak[m], kt)
                first = (kt >= 34) & (ts_first[m] == 255)
                ts_first[m][first] = t0 + 2 * n_
        landfall_k = tr.index(0)
        return {"stage": stage_hour, "weights": MEMBER_W.copy(), "q": MEMBER_Q.copy(),
                "sigma_km_landfall": float(sig[landfall_k]),
                "offsets_km": (MEMBER_Q * sig[landfall_k]).tolist(),
                "seg_peak": seg_peak, "wind_peak": wind_peak, "ts_first": ts_first,
                "tracks": tracks}


def coarse_cell(lat, lon):
    i = int(math.floor((geo.BBOX["lat_max"] - lat) / COARSE))
    j = int(math.floor((lon - geo.BBOX["lon_min"]) / COARSE))
    if 0 <= i < CNY and 0 <= j < CNX:
        return i * CNX + j
    return None
