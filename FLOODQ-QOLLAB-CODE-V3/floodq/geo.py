"""
Statewide geography: the model grid, coastal segments, counties, cities and the
road graph, decoded once from the generated modules (geodata.py, roads.py).

Grid cells are 0.02 degrees (about 2 km); row 0 is the northern edge.
"""
import base64
import math
import zlib

import numpy as np

from . import geodata as _g
from . import roads as _r

BBOX = dict(_g.BBOX)
D, NX, NY = _g.D, _g.NX, _g.NY
KM_LAT, KM_LON = _g.KM_LAT, _g.KM_LON
DX_KM, DY_KM = D * KM_LON, D * KM_LAT
CELL_KM2 = DX_KM * DY_KM


def _arr(spec):
    dtype, b64 = spec
    return np.frombuffer(zlib.decompress(base64.b64decode(b64)), dtype=dtype).reshape(NY, NX).copy()


LANDFRAC = _arr(_g.LANDFRAC) / 100.0
OCEAN = _arr(_g.OCEAN).astype(bool)
LAKE = _arr(_g.LAKE).astype(bool)
LAND = ~OCEAN & ~LAKE
COUNTY = _arr(_g.COUNTY)                 # index into COUNTIES, 255 = none
POP = _arr(_g.POP).astype(float)         # people per cell
ELEV = _arr(_g.ELEV_CM) / 100.0          # m, ILLUSTRATIVE (replaced by measured elevation when available)
DEPTH = _arr(_g.DEPTH_M).astype(float)   # sea depth m (ETOPO1 10')
DIST = _arr(_g.DIST_DM) / 10.0           # km to the open sea
SEG_OF = _arr(_g.SEG_OF).astype(np.int32)

SEG = np.array([s[:6] for s in _g.SEGMENTS], float)   # lat, lon, n_east, n_north, K, fetch_km
SEG_COUNTY = np.array([s[6] for s in _g.SEGMENTS], int)
NSEG = len(SEG)
COUNTIES = _g.COUNTIES
CITIES = _g.CITIES

NODES = np.array(_r.NODES, float)        # lat, lon
EDGES = _r.EDGES

LON_C = BBOX["lon_min"] + (np.arange(NX) + 0.5) * D
LAT_C = BBOX["lat_max"] - (np.arange(NY) + 0.5) * D
LON2, LAT2 = np.meshgrid(LON_C, LAT_C)


def cell_of(lat, lon):
    """(row, col) of the cell holding a point, or None outside the grid."""
    i = int(math.floor((BBOX["lat_max"] - lat) / D))
    j = int(math.floor((lon - BBOX["lon_min"]) / D))
    if 0 <= i < NY and 0 <= j < NX:
        return i, j
    return None


def km(lat1, lon1, lat2, lon2):
    """Distance in km (equirectangular; fine at state scale)."""
    x = (np.asarray(lon2) - lon1) * KM_LAT * np.cos(np.radians((np.asarray(lat2) + lat1) / 2))
    y = (np.asarray(lat2) - lat1) * KM_LAT
    return np.hypot(x, y)


def county_name(ci):
    return COUNTIES[ci]["name"] if 0 <= ci < len(COUNTIES) else None


def b64(arr):
    return base64.b64encode(np.ascontiguousarray(arr).tobytes()).decode("ascii")


def b64z(arr):
    return base64.b64encode(zlib.compress(np.ascontiguousarray(arr).tobytes(), 6)).decode("ascii")
