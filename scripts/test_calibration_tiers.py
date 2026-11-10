import json

tiers = [
    (0, 50, '1: #001f4d'),
    (50, 120, '2: #0a3d8f'),
    (120, 250, '3: #1565c0'),
    (250, 400, '4: #1e88e5'),
    (400, 650, '5: #29b6f6'),
    (650, 900, '6: #80deea'),
    (900, 1200, '7: #a5d6a7'),
    (1200, 1550, '8: #ffee58'),
    (1550, 1950, '9: #ff7043'),
    (1950, 2350, '10: #d32f2f'),
    (2350, 99999, '10+: #7b0000')
]

def get_tier(val):
    for mn, mx, label in tiers:
        if mn <= val < mx:
            return label
    return tiers[-1][2]

# Test sample flows:
sample_flows = [35, 85, 180, 320, 510, 750, 1050, 1380, 1750, 2150, 2600]
for fl in sample_flows:
    print(f"Flow {fl} -> Tier {get_tier(fl)}")
