"""The DGCA-weighted 24-route basket shared by every source connector."""

ADVANCE_WINDOWS = [1, 7, 15, 30, 45]

PRIORITY_ROUTES = [
    ("DELHI", "MUMBAI", "DEL", "BOM", 4029444),
    ("BENGALURU", "DELHI", "BLR", "DEL", 2885936),
    ("BENGALURU", "MUMBAI", "BLR", "BOM", 2476421),
    ("DELHI", "HYDERABAD", "DEL", "HYD", 1862287),
    ("DELHI", "KOLKATA", "DEL", "CCU", 1778985),
    ("DELHI", "PUNE", "DEL", "PNQ", 1704284),
    ("GOA", "MUMBAI", "GOX", "BOM", 1495328),
    ("AHMEDABAD", "DELHI", "AMD", "DEL", 1402813),
    ("DELHI", "GOA", "DEL", "GOX", 1352032),
    ("CHENNAI", "MUMBAI", "MAA", "BOM", 1312448),
    ("HYDERABAD", "MUMBAI", "HYD", "BOM", 1285881),
    ("KOLKATA", "MUMBAI", "CCU", "BOM", 1281897),
    ("CHENNAI", "DELHI", "MAA", "DEL", 1277274),
    ("BENGALURU", "HYDERABAD", "BLR", "HYD", 1217734),
    ("AHMEDABAD", "MUMBAI", "AMD", "BOM", 1215086),
    ("BENGALURU", "KOLKATA", "BLR", "CCU", 1204113),
    ("DELHI", "SRINAGAR", "DEL", "SXR", 1141145),
    ("BENGALURU", "PUNE", "BLR", "PNQ", 1079353),
    ("DELHI", "GUWAHATI", "DEL", "GAU", 938099),
    ("DELHI", "PATNA", "DEL", "PAT", 908354),
    ("BENGALURU", "GOA", "BLR", "GOX", 875214),
    ("BENGALURU", "CHENNAI", "BLR", "MAA", 872523),
    ("DELHI", "LUCKNOW", "DEL", "LKO", 854555),
    ("KOCHI", "MUMBAI", "COK", "BOM", 805813),
]

