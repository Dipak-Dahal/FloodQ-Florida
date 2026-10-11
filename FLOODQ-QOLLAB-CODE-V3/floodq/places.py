"""
Hand-written inputs: storm scenarios, safe destinations and planning assumptions.

Every number here is an assumption or an approximation, and is labelled as such
in the app. Storm tracks are simplified from the National Hurricane Center's
Tropical Cyclone Reports, read by eye; they are not reanalysis data.
"""

# ---------------------------------------------------------------------------
# Storm scenarios
# track rows: (hour relative to landfall, lat, lon, max sustained wind kt, radius of max wind nm)
# Intensity over land after landfall is computed with Kaplan & DeMaria (1995) decay,
# so rows after landfall only fix the path.
# ---------------------------------------------------------------------------
PRESETS = [
    {
        "id": "ian", "short": "SW Florida", "name": "Southwest Florida, Category 4",
        "like": "Track modeled on Hurricane Ian (2022)", "approach": "gulf", "tag": "like Ian (2022)",
        "landfall_place": "Cayo Costa, Lee County", "landfall_clock": [3, 15],   # Wed 3 PM
        "holland_b": 1.40,
        "track": [(-72, 18.0, -81.6, 65, 25), (-60, 19.4, -82.4, 80, 22), (-48, 20.8, -83.1, 95, 20),
                  (-36, 22.3, -83.5, 105, 18), (-24, 23.9, -83.4, 105, 22), (-18, 24.7, -83.2, 120, 20),
                  (-12, 25.4, -82.9, 135, 18), (-6, 26.0, -82.6, 140, 18), (0, 26.70, -82.25, 130, 20),
                  (6, 27.1, -81.95, 0, 24), (12, 27.6, -81.6, 0, 28), (18, 28.1, -81.2, 0, 30),
                  (24, 28.6, -80.8, 0, 32)],
    },
    {
        "id": "michael", "short": "Panhandle", "name": "Panhandle, Category 5",
        "like": "Track modeled on Hurricane Michael (2018)", "approach": "gulf", "tag": "like Michael (2018)",
        "landfall_place": "Mexico Beach, Bay County", "landfall_clock": [3, 13],  # Wed 1 PM
        "holland_b": 1.40,
        "track": [(-72, 18.2, -86.2, 45, 30), (-60, 19.4, -86.0, 55, 28), (-48, 20.9, -85.7, 70, 24),
                  (-36, 22.6, -85.8, 80, 20), (-24, 24.6, -86.3, 100, 16), (-18, 25.8, -86.4, 110, 15),
                  (-12, 27.1, -86.4, 120, 14), (-6, 28.5, -86.0, 135, 12), (0, 29.95, -85.42, 140, 12),
                  (6, 31.3, -84.7, 0, 16), (12, 32.5, -83.8, 0, 20), (18, 33.6, -82.6, 0, 24),
                  (24, 34.8, -81.0, 0, 28)],
    },
    {
        "id": "andrew", "short": "SE Florida", "name": "Southeast Florida, Category 5",
        "like": "Track modeled on Hurricane Andrew (1992)", "approach": "atlantic", "tag": "like Andrew (1992)",
        "landfall_place": "Homestead, Miami-Dade County", "landfall_clock": [1, 5],  # Mon 5 AM
        "holland_b": 1.60,
        "track": [(-72, 24.4, -66.2, 50, 25), (-60, 24.9, -67.9, 65, 20), (-48, 25.3, -69.8, 90, 15),
                  (-36, 25.5, -72.0, 125, 10), (-24, 25.5, -74.4, 145, 10), (-18, 25.5, -75.8, 135, 10),
                  (-12, 25.5, -77.3, 135, 10), (-6, 25.5, -78.8, 140, 10), (0, 25.50, -80.30, 145, 10),
                  (6, 25.7, -81.9, 0, 12), (12, 26.0, -83.5, 110, 14), (18, 26.4, -85.0, 105, 15),
                  (24, 26.9, -86.4, 100, 16)],
    },
    {
        "id": "irma", "short": "Keys", "name": "Keys and peninsula, Category 4",
        "like": "Track modeled on Hurricane Irma (2017)", "approach": "south", "tag": "like Irma (2017)",
        "landfall_place": "Cudjoe Key, Monroe County", "landfall_clock": [0, 9],  # Sun 9 AM
        "holland_b": 1.05,
        "track": [(-72, 20.9, -70.5, 150, 15), (-60, 21.4, -72.7, 145, 15), (-48, 21.9, -74.9, 140, 15),
                  (-36, 22.3, -77.1, 145, 15), (-24, 22.9, -79.0, 110, 20), (-18, 23.2, -80.2, 105, 20),
                  (-12, 23.6, -80.9, 115, 18), (-6, 24.1, -81.3, 115, 17), (0, 24.70, -81.50, 115, 17),
                  (6, 25.6, -81.7, 105, 20), (12, 26.6, -81.8, 0, 26), (18, 27.9, -82.0, 0, 32),
                  (24, 29.1, -82.3, 0, 38)],
    },
    {
        "id": "tampa", "short": "Tampa Bay", "name": "Tampa Bay direct hit, Category 4",
        "like": "Hypothetical worst case, like the 1921 Tarpon Springs hurricane", "approach": "gulf",
        "tag": "worst case, like the 1921 Tarpon Springs storm",
        "landfall_place": "Tarpon Springs, Pinellas County", "landfall_clock": [4, 14],  # Thu 2 PM
        "holland_b": 1.35,
        "track": [(-72, 22.8, -88.2, 90, 25), (-60, 23.6, -87.3, 100, 22), (-48, 24.5, -86.4, 110, 20),
                  (-36, 25.4, -85.5, 120, 20), (-24, 26.3, -84.6, 125, 20), (-18, 26.8, -84.1, 125, 20),
                  (-12, 27.3, -83.6, 125, 20), (-6, 27.75, -83.15, 120, 20), (0, 28.15, -82.75, 115, 20),
                  (6, 28.5, -82.25, 0, 24), (12, 28.85, -81.7, 0, 28), (18, 29.2, -81.1, 0, 30),
                  (24, 29.6, -80.4, 0, 32)],
    },
    {
        "id": "helene", "short": "Big Bend", "name": "Big Bend, Category 4",
        "like": "Track modeled on Hurricane Helene (2024)", "approach": "gulf", "tag": "like Helene (2024)",
        "landfall_place": "Keaton Beach, Taylor County", "landfall_clock": [4, 23],  # Thu 11 PM
        "holland_b": 1.15,
        "track": [(-72, 17.8, -84.5, 35, 40), (-60, 18.6, -85.4, 45, 40), (-48, 19.8, -86.0, 60, 35),
                  (-36, 21.3, -86.4, 70, 35), (-24, 23.6, -86.6, 85, 30), (-18, 25.0, -86.3, 95, 30),
                  (-12, 26.6, -85.7, 105, 30), (-6, 28.3, -84.8, 115, 30), (0, 29.85, -83.65, 120, 30),
                  (6, 31.6, -83.1, 0, 36), (12, 33.3, -82.8, 0, 42), (18, 35.0, -83.0, 0, 48),
                  (24, 36.5, -84.0, 0, 52)],
    },
    {
        "id": "jeanne", "short": "East-central", "name": "East-central Florida, Category 4",
        "like": "Hypothetical worst case on the track of Hurricane Jeanne (2004)", "approach": "atlantic",
        "tag": "worst case on Jeanne's 2004 track",
        "landfall_place": "Hutchinson Island, Martin County", "landfall_clock": [6, 23],  # Sat 11 PM
        "holland_b": 1.30,
        "track": [(-72, 25.35, -68.6, 115, 25), (-60, 25.65, -70.5, 120, 25), (-48, 25.95, -72.4, 120, 25),
                  (-36, 26.25, -74.3, 125, 25), (-24, 26.55, -76.2, 125, 25), (-18, 26.70, -77.2, 125, 25),
                  (-12, 26.85, -78.2, 125, 25), (-6, 27.00, -79.2, 125, 25), (0, 27.20, -80.20, 125, 25),
                  (6, 27.55, -81.00, 0, 28), (12, 28.05, -81.65, 0, 30), (18, 28.70, -82.15, 0, 34),
                  (24, 29.55, -82.50, 0, 38)],
    },
    {
        "id": "dora", "short": "Northeast", "name": "Northeast Florida, Category 4",
        "like": "Hypothetical worst case on the track of Hurricane Dora (1964)", "approach": "atlantic",
        "tag": "worst case on Dora's 1964 track",
        "landfall_place": "St. Augustine, St. Johns County", "landfall_clock": [4, 1],  # Thu 1 AM
        "holland_b": 1.30,
        "track": [(-72, 29.20, -69.7, 125, 20), (-60, 29.40, -71.6, 130, 20), (-48, 29.60, -73.5, 135, 20),
                  (-36, 29.75, -75.4, 135, 20), (-24, 29.85, -77.3, 135, 22), (-18, 29.88, -78.3, 135, 22),
                  (-12, 29.90, -79.3, 130, 22), (-6, 29.92, -80.3, 130, 22), (0, 29.90, -81.28, 130, 22),
                  (6, 30.05, -82.30, 0, 26), (12, 30.25, -83.20, 0, 30), (18, 30.55, -84.00, 0, 34),
                  (24, 30.90, -84.70, 0, 38)],
    },
]
DEFAULT_PRESET = "ian"
WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

HOURS = list(range(-72, 25))        # model clock, hours relative to landfall
STAGES = [-48, -36, -24]            # when the evacuation order could go out
DEPARTURE_WINDOW_H = 12             # departures spread over 12 h after the order

# NHC cone of uncertainty: radius (n mi) of the circle that holds the storm centre
# two-thirds of the time, Atlantic basin, by forecast lead time (h). NHC publishes these
# each season from the previous five years' errors; these are approximate recent values.
CONE_NM = [(0, 0.0), (12, 26.0), (24, 39.0), (36, 53.0), (48, 66.0), (60, 84.0), (72, 97.0)]

# ---------------------------------------------------------------------------
# Safe destinations: shelters plus hotel rooms, ASSUMED capacities in people.
# A destination only counts as safe for a storm if the model gives it little
# chance of hurricane-force wind and no surge.
# ---------------------------------------------------------------------------
HOSTS = [
    ("orlando", "Orlando", 28.540, -81.380, 200000),
    ("kissimmee", "Kissimmee", 28.300, -81.410, 40000),
    ("lakeland", "Lakeland", 28.040, -81.950, 25000),
    ("sebring", "Sebring", 27.500, -81.440, 8000),
    ("ocala", "Ocala", 29.190, -82.140, 25000),
    ("gainesville", "Gainesville", 29.650, -82.330, 40000),
    ("lakecity", "Lake City", 30.190, -82.640, 10000),
    ("tallahassee", "Tallahassee", 30.440, -84.280, 50000),
    ("jacksonville", "Jacksonville (west)", 30.300, -81.780, 60000),
    ("leesburg", "Leesburg / The Villages", 28.810, -81.880, 12000),
    ("palatka", "Palatka", 29.650, -81.640, 5000),
    ("arcadia", "Arcadia", 27.220, -81.860, 4000),
    ("okeechobee", "Okeechobee", 27.240, -80.830, 4000),
    ("immokalee", "Immokalee", 26.420, -81.420, 5000),
    ("tampa", "Tampa (inland)", 28.050, -82.400, 60000),
    ("sarasota", "Sarasota (inland)", 27.330, -82.400, 20000),
    ("fortmyers", "Fort Myers (inland)", 26.620, -81.780, 30000),
    ("naples", "Naples (inland)", 26.190, -81.700, 15000),
    ("miami", "Miami-Dade (west)", 25.800, -80.380, 120000),
    ("broward", "Broward (west)", 26.140, -80.300, 80000),
    ("palmbeach", "Palm Beach (west)", 26.660, -80.240, 50000),
    ("stlucie", "Port St. Lucie", 27.290, -80.400, 15000),
    ("melbourne", "Melbourne / Palm Bay", 28.030, -80.680, 20000),
    ("deland", "DeLand", 29.030, -81.300, 12000),
    ("pensacola", "Pensacola (north)", 30.530, -87.250, 30000),
    ("crestview", "Crestview", 30.760, -86.570, 8000),
    ("marianna", "Marianna", 30.770, -85.230, 5000),
    ("panamacity", "Panama City (north)", 30.270, -85.620, 15000),
    ("atlanta", "Atlanta, GA", 33.750, -84.390, 250000),
    ("macon", "Macon, GA", 32.840, -83.630, 20000),
    ("valdosta", "Valdosta, GA", 30.830, -83.280, 12000),
    ("albany", "Albany, GA", 31.580, -84.160, 10000),
    ("savannah", "Savannah, GA", 32.080, -81.090, 30000),
    ("columbus", "Columbus, GA", 32.460, -84.990, 15000),
    ("montgomery", "Montgomery, AL", 32.370, -86.300, 30000),
    ("dothan", "Dothan, AL", 31.220, -85.390, 12000),
    ("birmingham", "Birmingham, AL", 33.520, -86.800, 50000),
    ("mobile", "Mobile, AL", 30.690, -88.040, 30000),
]

# ---------------------------------------------------------------------------
# Behaviour assumptions (rounded from Florida's Statewide Regional Evacuation Study
# behavioural surveys; treat as illustrative)
# ---------------------------------------------------------------------------
LEAVE_IN_ZONE = 0.75          # share of people in the modelled surge zone who leave
MOBILE_HOME_SHARE = 0.08      # share of people living in mobile or manufactured homes
LEAVE_MOBILE_HOME = 0.65      # share of them who leave when hurricane winds are likely
SHADOW = 0.10                 # share of people just outside the zone who leave anyway
VEHICLES_PER_PERSON = 0.45    # about 1.15 vehicles per evacuating household
LOCAL_SHARE = 0.08            # local refuge capacity: shelters + friends, share of county population
