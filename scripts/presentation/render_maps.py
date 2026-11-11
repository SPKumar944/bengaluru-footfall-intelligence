#!/usr/bin/env python3
"""
Render presentation-grade maps and charts from the dashboard datasets.

All figures are drawn directly from frontend/public/data (the same files the
live dashboard reads), on an Esri Light Gray Canvas basemap, so the report matches the product.

Output: reports/presentation/figures/*.png
Default scenario mirrors the dashboard default: Saturday, 20:00 (multiplier 1.38).
"""

import io
import json
import math
import os
import time

import geopandas as gpd
import matplotlib
import numpy as np
import requests
from PIL import Image
from shapely.geometry import Point

matplotlib.use("Agg")
import matplotlib.pyplot as plt  # noqa: E402
from matplotlib.lines import Line2D  # noqa: E402
from matplotlib.patches import Patch  # noqa: E402

DATA = "frontend/public/data"
OUT = "reports/presentation/figures"
TILE_CACHE = "cache/tiles"
os.makedirs(OUT, exist_ok=True)
os.makedirs(TILE_CACHE, exist_ok=True)

INK = "#0F172A"
MUTED = "#64748B"
ACCENT = "#0A2540"
APSARA = "#E11D48"

SCENARIO_HOUR = 20
SCENARIO_MULT = 1.38  # Saturday
SCENARIO_LABEL = "Saturday 20:00"

TIERS = [  # (min_flow, hex, label) — identical to footfallFormatters.js
    (0, "#001f4d", "< 50"), (50, "#0a3d8f", "50–120"), (120, "#1565c0", "120–250"),
    (250, "#1e88e5", "250–400"), (400, "#29b6f6", "400–650"), (650, "#80deea", "650–900"),
    (900, "#a5d6a7", "900–1,200"), (1200, "#ffee58", "1,200–1,550"), (1550, "#ff7043", "1,550–1,950"),
    (1950, "#d32f2f", "1,950–2,350"), (2350, "#7b0000", "> 2,350"),
]
TIER_WIDTH = [0.6, 0.7, 0.9, 1.1, 1.4, 1.7, 2.0, 2.4, 2.8, 3.2, 3.6]

plt.rcParams.update({
    "font.family": "DejaVu Sans",
    "font.size": 10,
    "axes.edgecolor": "#CBD5E1",
    "axes.labelcolor": INK,
    "xtick.color": MUTED,
    "ytick.color": MUTED,
})


def tier_index(flow):
    idx = 0
    for i, (mn, _, _) in enumerate(TIERS):
        if flow >= mn:
            idx = i
    return idx


# ----------------------------------------------------------------------------------
# Basemap tiles (CARTO Positron, Web Mercator)
# ----------------------------------------------------------------------------------
R = 6378137.0


def merc(lon, lat):
    x = math.radians(lon) * R
    y = math.log(math.tan(math.pi / 4 + math.radians(lat) / 2)) * R
    return x, y


def tile_xy(lon, lat, z):
    n = 2 ** z
    x = int((lon + 180.0) / 360.0 * n)
    y = int((1.0 - math.asinh(math.tan(math.radians(lat))) / math.pi) / 2.0 * n)
    return x, y


def tile_bounds_merc(x, y, z):
    n = 2 ** z
    size = 2 * math.pi * R / n
    minx = -math.pi * R + x * size
    maxy = math.pi * R - y * size
    return minx, maxy - size, minx + size, maxy


ESRI = "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/{layer}/MapServer/tile/{z}/{y}/{x}"
TILE = 256


def fetch_tile(z, x, y, layer="World_Light_Gray_Base"):
    ext = "png" if "Reference" in layer else "jpg"
    path = os.path.join(TILE_CACHE, f"{layer}_{z}_{x}_{y}.{ext}")
    mode = "RGBA" if ext == "png" else "RGB"
    if os.path.exists(path):
        return Image.open(path).convert(mode)
    url = ESRI.format(layer=layer, z=z, x=x, y=y)
    for attempt in range(3):
        try:
            r = requests.get(url, headers={"User-Agent": "BLR-Footfall-Report/1.0"}, timeout=20)
            if r.status_code == 200 and r.headers.get("content-type", "").startswith("image"):
                with open(path, "wb") as f:
                    f.write(r.content)
                return Image.open(io.BytesIO(r.content)).convert(mode)
        except Exception:
            pass
        time.sleep(1 + attempt)
    return Image.new(mode, (TILE, TILE), (0, 0, 0, 0) if mode == "RGBA" else (236, 236, 236))


def add_basemap(ax, lon_min, lat_min, lon_max, lat_max, z, labels=True):
    x0, y0 = tile_xy(lon_min, lat_max, z)
    x1, y1 = tile_xy(lon_max, lat_min, z)
    w, h = (x1 - x0 + 1), (y1 - y0 + 1)
    mosaic = Image.new("RGB", (w * TILE, h * TILE), (236, 236, 236))
    for tx in range(x0, x1 + 1):
        for ty in range(y0, y1 + 1):
            mosaic.paste(fetch_tile(z, tx, ty), ((tx - x0) * TILE, (ty - y0) * TILE))
    ref = None
    if labels:
        ref = Image.new("RGBA", (w * TILE, h * TILE), (0, 0, 0, 0))
        for tx in range(x0, x1 + 1):
            for ty in range(y0, y1 + 1):
                ref.paste(fetch_tile(z, tx, ty, "World_Light_Gray_Reference"), ((tx - x0) * TILE, (ty - y0) * TILE))
    minx, _, _, maxy = tile_bounds_merc(x0, y0, z)
    _, miny, maxx, _ = tile_bounds_merc(x1, y1, z)
    ext = (minx, maxx, miny, maxy)
    ax.imshow(mosaic, extent=ext, zorder=0, interpolation="lanczos")
    if ref is not None:
        ax.imshow(ref, extent=ext, zorder=7, interpolation="lanczos", alpha=0.85)
    bx0, by0 = merc(lon_min, lat_min)
    bx1, by1 = merc(lon_max, lat_max)
    ax.set_xlim(bx0, bx1)
    ax.set_ylim(by0, by1)
    ax.set_axis_off()


def attribution(ax):
    ax.text(0.995, 0.005, "Basemap: Esri, HERE, Garmin, © OpenStreetMap contributors · Streets: OpenStreetMap",
            transform=ax.transAxes, ha="right", va="bottom", fontsize=6.5, color=MUTED,
            bbox=dict(facecolor="white", edgecolor="none", alpha=0.7, pad=1.5), zorder=20)


def save(fig, name):
    for a in fig.axes:
        lg = a.get_legend()
        if lg is not None:
            lg.set_zorder(30)
    path = os.path.join(OUT, name)
    fig.savefig(path, dpi=220, bbox_inches="tight", pad_inches=0.05, facecolor="white")
    plt.close(fig)
    print("  saved", path)


# ----------------------------------------------------------------------------------
# Data
# ----------------------------------------------------------------------------------
print("Loading datasets ...")
stores = json.load(open(f"{DATA}/apsara_ice_cream_bangalore_footfall.json"))
g_stores = gpd.GeoDataFrame(
    stores,
    geometry=[Point(s["coordinates"]["lng"], s["coordinates"]["lat"]) for s in stores],
    crs=4326,
)
g_stores["num"] = g_stores["serial_no"].str[-2:].astype(int)
g_streets = gpd.read_file(f"{DATA}/all_stores_street_footfall.geojson")
g_catch = gpd.read_file(f"{DATA}/apsara_store_footfall_catchments.geojson")
g_comp = gpd.read_file(f"{DATA}/layer5_competitors.geojson")
g_synergy = gpd.read_file(f"{DATA}/layer6_complementary_brands.geojson")
g_edu = gpd.read_file(f"{DATA}/education_youth_pois.geojson")
g_kids = gpd.read_file(f"{DATA}/kids_family_attractions.geojson")
g_tech = gpd.read_file(f"{DATA}/mapped_tech_parks.geojson")
g_wards = gpd.read_file(f"{DATA}/wards_demographics.geojson")

def hourly(h):
    if isinstance(h, str):
        return list(json.loads(h))
    return list(h)


g_streets["hourly_footfall"] = g_streets["hourly_footfall"].apply(hourly)
g_streets["flow"] = g_streets["hourly_footfall"].apply(lambda h: h[SCENARIO_HOUR] * SCENARIO_MULT)
g_streets["tier"] = g_streets["flow"].apply(tier_index)

M = 3857
city_bbox = (77.45, 12.80, 77.82, 13.14)


def m(gdf):
    return gdf.to_crs(M)


# ----------------------------------------------------------------------------------
# Figure 1 — Network overview over ward population density
# ----------------------------------------------------------------------------------
def fig_network_overview():
    print("Figure 1: network overview")
    w = g_wards.copy()
    w["pop"] = w["population_2011"].astype(float)
    w["area_km2"] = w.to_crs(32643).area / 1e6
    w["density"] = w["pop"] / w["area_km2"].replace(0, np.nan)
    fig, ax = plt.subplots(figsize=(11, 11))
    add_basemap(ax, *city_bbox, z=12)
    m(w).plot(ax=ax, column="density", cmap="Blues", alpha=0.45, edgecolor="white",
              linewidth=0.3, zorder=1, scheme=None, vmin=0, vmax=np.nanpercentile(w["density"], 95))
    region_colors = {"North": "#059669", "South": "#7C3AED", "East": "#F59E0B", "West": "#DB2777"}
    gs = m(g_stores)
    gs["region"] = gs["zone"].str.split().str[0]
    for rname, col in region_colors.items():
        sub = gs[gs["region"] == rname]
        ax.scatter(sub.geometry.x, sub.geometry.y, s=190, c=col, edgecolor="white", linewidth=1.6, zorder=8)
    for _, r in gs.iterrows():
        ax.text(r.geometry.x, r.geometry.y, str(r["num"]), ha="center", va="center",
                fontsize=7, color="white", fontweight="bold", zorder=9)
    handles = [Line2D([0], [0], marker="o", color="w", markerfacecolor=c, markersize=10,
                      label=f"{z} Bengaluru ({(gs['region'] == z).sum()} stores)")
               for z, c in region_colors.items()]
    handles.append(Patch(facecolor="#3B82F6", alpha=0.45, label="Ward population density (Census 2011)"))
    ax.legend(handles=handles, loc="upper left", frameon=True, fontsize=8.5, title="Apsara network by region",
              title_fontsize=9).get_frame().set_edgecolor("#CBD5E1")
    attribution(ax)
    save(fig, "01_network_overview.png")


# ----------------------------------------------------------------------------------
# Figure 2 — Competitive landscape
# ----------------------------------------------------------------------------------
def fig_competition():
    print("Figure 2: competitive landscape")
    fig, ax = plt.subplots(figsize=(11, 11))
    add_basemap(ax, *city_bbox, z=12)
    comp = m(g_comp)
    top = comp["brand"].value_counts().index[:6].tolist()
    palette = ["#2563EB", "#F59E0B", "#10B981", "#8B5CF6", "#0EA5E9", "#F97316"]
    for b, c in zip(top, palette):
        sub = comp[comp["brand"] == b]
        ax.scatter(sub.geometry.x, sub.geometry.y, s=38, c=c, edgecolor="white", linewidth=0.7,
                   zorder=6, label=f"{b} ({len(sub)})")
    other = comp[~comp["brand"].isin(top)]
    if len(other):
        ax.scatter(other.geometry.x, other.geometry.y, s=26, c="#94A3B8", edgecolor="white",
                   linewidth=0.6, zorder=6, label=f"Other brands ({len(other)})")
    gs = m(g_stores)
    ax.scatter(gs.geometry.x, gs.geometry.y, s=170, marker="*", c=APSARA, edgecolor="white",
               linewidth=1.0, zorder=8, label=f"Apsara Ice Creams ({len(gs)})")
    ax.legend(loc="upper left", fontsize=8.5, title="Ice cream & dessert retail", title_fontsize=9) \
        .get_frame().set_edgecolor("#CBD5E1")
    attribution(ax)
    save(fig, "02_competitive_landscape.png")


# ----------------------------------------------------------------------------------
# Figure 3 — Demand magnets (synergy POIs)
# ----------------------------------------------------------------------------------
def fig_magnets():
    print("Figure 3: demand magnets")
    fig, ax = plt.subplots(figsize=(11, 11))
    add_basemap(ax, *city_bbox, z=12)
    layers = [
        (g_synergy, "#F59E0B", "o", f"Complementary F&B brands ({len(g_synergy)})"),
        (g_edu, "#7C3AED", "s", f"Schools, colleges & coaching ({len(g_edu)})"),
        (g_kids, "#10B981", "D", f"Kids & family attractions ({len(g_kids)})"),
        (g_tech, "#0EA5E9", "^", f"Tech parks & office campuses ({len(g_tech)})"),
    ]
    for gdf, col, mk, lab in layers:
        pts = m(gdf[gdf.geometry.type == "Point"])
        ax.scatter(pts.geometry.x, pts.geometry.y, s=26, c=col, marker=mk, edgecolor="white",
                   linewidth=0.5, zorder=6, alpha=0.9, label=lab)
    gs = m(g_stores)
    ax.scatter(gs.geometry.x, gs.geometry.y, s=170, marker="*", c=APSARA, edgecolor="white",
               linewidth=1.0, zorder=8, label="Apsara Ice Creams (31)")
    ax.legend(loc="upper left", fontsize=8.5, title="Footfall magnets", title_fontsize=9) \
        .get_frame().set_edgecolor("#CBD5E1")
    attribution(ax)
    save(fig, "03_demand_magnets.png")


# ----------------------------------------------------------------------------------
# Figure 4 — Store-level street footfall (the core product view)
# ----------------------------------------------------------------------------------
def fig_store_footfall(serial, half_m=520):
    s = g_stores[g_stores["serial_no"] == serial].iloc[0]
    print(f"Figure 4: street footfall {serial} {s['locality']}")
    lon, lat = s.geometry.x, s.geometry.y
    dlat = half_m / 111320.0
    dlon = half_m / (111320.0 * math.cos(math.radians(lat)))
    bbox = (lon - dlon, lat - dlat, lon + dlon, lat + dlat)
    fig, ax = plt.subplots(figsize=(9, 9))
    add_basemap(ax, *bbox, z=17)
    st = m(g_streets[g_streets["serial_no"] == serial]).sort_values("tier")
    for t in range(len(TIERS)):
        sub = st[st["tier"] == t]
        if len(sub):
            sub.plot(ax=ax, color=TIERS[t][1], linewidth=TIER_WIDTH[t] * 1.5, zorder=2 + t * 0.1,
                     capstyle="round")
    c = m(g_catch[g_catch["serial_no"] == serial])
    c.boundary.plot(ax=ax, color=ACCENT, linewidth=1.4, linestyle=(0, (5, 3)), zorder=8)
    px, py = merc(lon, lat)
    ax.scatter([px], [py], s=320, marker="*", c=APSARA, edgecolor="white", linewidth=1.4, zorder=9)
    present = sorted(st["tier"].unique())
    handles = [Line2D([0], [0], color=TIERS[t][1], lw=4, label=f"Index {t + 1}: {TIERS[t][2]} /hr")
               for t in present]
    handles.append(Line2D([0], [0], color=ACCENT, lw=1.4, ls="--", label="350 m walkshed"))
    leg = ax.legend(handles=handles, loc="lower left", fontsize=7.5,
                    title=f"Pedestrians / hour · {SCENARIO_LABEL}", title_fontsize=8)
    leg.get_frame().set_edgecolor("#CBD5E1")
    ax.set_title(f"{s['store_name']}  ·  {s['corridor_name']}", fontsize=10.5, color=INK, loc="left", pad=6)
    attribution(ax)
    save(fig, f"04_street_footfall_{serial}.png")


# ----------------------------------------------------------------------------------
# Charts
# ----------------------------------------------------------------------------------
def fig_diurnal():
    print("Chart: diurnal curves")
    st = g_streets[g_streets["serial_no"] == "APSARA_BLR_01"]
    prof = {}
    for label, cond in [
        ("High-street commercial spine", st["corridor_tier"].str.contains("High-Street", na=False)),
        ("Secondary / collector avenue", st["highway_type"].isin(["secondary", "tertiary"])
         & ~st["corridor_tier"].str.contains("High-Street", na=False)),
        ("Residential lane", st["highway_type"] == "residential"),
    ]:
        sub = st[cond]
        if len(sub):
            arr = np.array(list(sub["hourly_footfall"]))
            prof[label] = arr.mean(axis=0)
    fig, ax = plt.subplots(figsize=(10, 4.6))
    cols = ["#d32f2f", "#29b6f6", "#0a3d8f"]
    hrs = np.arange(24)
    for (lab, vals), c in zip(prof.items(), cols):
        ax.plot(hrs, vals * SCENARIO_MULT, color=c, lw=2.4, label=lab)
        ax.fill_between(hrs, 0, vals * SCENARIO_MULT, color=c, alpha=0.07)
    ax.axvspan(19, 23, color="#FDE68A", alpha=0.35, zorder=0)
    ax.text(21, ax.get_ylim()[1] * 0.93, "Dessert peak\n19:00–23:00", ha="center", fontsize=8.5, color="#92400E")
    ax.set_xticks(range(0, 24, 2))
    ax.set_xticklabels([f"{h:02d}:00" for h in range(0, 24, 2)], fontsize=8)
    ax.set_ylabel("Avg pedestrians / hour (Saturday)")
    ax.spines[["top", "right"]].set_visible(False)
    ax.grid(axis="y", color="#E2E8F0")
    ax.legend(frameon=False, fontsize=9, loc="upper left")
    save(fig, "05_diurnal_profile.png")

    days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    mult = [0.88, 0.88, 0.92, 0.96, 1.18, 1.38, 1.35]
    fig, ax = plt.subplots(figsize=(6, 4.2))
    bars = ax.bar(days, mult, color=["#94A3B8"] * 4 + ["#F59E0B", "#E11D48", "#E11D48"], width=0.6)
    for b, v in zip(bars, mult):
        ax.text(b.get_x() + b.get_width() / 2, v + 0.02, f"{v:.2f}×", ha="center", fontsize=9, color=INK)
    ax.axhline(1.0, color=MUTED, lw=0.8, ls="--")
    ax.set_ylim(0, 1.6)
    ax.set_ylabel("Footfall multiplier")
    ax.spines[["top", "right"]].set_visible(False)
    save(fig, "06_day_of_week.png")


def fig_store_benchmark():
    print("Chart: store benchmark")
    df = g_stores.copy()
    df["monthly"] = df["store_footfall"].apply(lambda x: x["est_monthly_customers"])
    df["peak"] = df["regional_footfall"].apply(lambda x: x["peak_evening_hourly_flow"])
    df = df.sort_values("monthly")
    fig, ax = plt.subplots(figsize=(10, 9))
    colors = ["#E11D48" if v >= df["monthly"].quantile(0.75) else "#0A2540" if v >= df["monthly"].median()
              else "#94A3B8" for v in df["monthly"]]
    ax.barh(df["locality"], df["monthly"], color=colors, height=0.7)
    for i, v in enumerate(df["monthly"]):
        ax.text(v + 30, i, f"{v:,}", va="center", fontsize=7.5, color=INK)
    ax.set_xlabel("Estimated monthly customers (model estimate)")
    ax.tick_params(axis="y", labelsize=8)
    ax.spines[["top", "right"]].set_visible(False)
    ax.grid(axis="x", color="#E2E8F0")
    ax.legend(handles=[Patch(color="#E11D48", label="Top quartile"), Patch(color="#0A2540", label="Above median"),
                       Patch(color="#94A3B8", label="Below median")], frameon=False, fontsize=8, loc="lower right")
    save(fig, "07_store_benchmark.png")


def fig_tier_mix():
    print("Chart: walkshed tier mix")
    near = g_streets[g_streets["dist_to_store_m"] <= 350]
    order = g_stores.sort_values("num")
    mat = []
    for _, s in order.iterrows():
        sub = near[near["serial_no"] == s["serial_no"]]
        cnt = np.bincount(sub["tier"], minlength=len(TIERS)).astype(float)
        mat.append(cnt / cnt.sum() * 100 if cnt.sum() else cnt)
    mat = np.array(mat)
    fig, ax = plt.subplots(figsize=(11, 8.5))
    left = np.zeros(len(order))
    labels = [f"{r['num']:02d} {r['locality']}" for _, r in order.iterrows()]
    for t in range(len(TIERS)):
        ax.barh(labels, mat[:, t], left=left, color=TIERS[t][1], height=0.75,
                label=f"{t + 1}: {TIERS[t][2]}")
        left += mat[:, t]
    ax.invert_yaxis()
    ax.set_xlim(0, 100)
    ax.set_xlabel(f"% of street segments within 350 m walkshed · {SCENARIO_LABEL}")
    ax.tick_params(axis="y", labelsize=8)
    ax.spines[["top", "right"]].set_visible(False)
    ax.legend(ncol=6, fontsize=7, frameon=False, loc="upper center", bbox_to_anchor=(0.5, -0.07),
              title="Footfall index (pedestrians / hour)", title_fontsize=8)
    save(fig, "08_walkshed_tier_mix.png")


def magnet_counts():
    """Counts of competitors and magnets within 1 km of each store (for the report tables)."""
    print("Table: magnet counts within 1 km")
    gs = g_stores.to_crs(32643)
    layers = {"competitors": g_comp, "fnb_synergy": g_synergy, "education": g_edu,
              "kids_family": g_kids, "tech_parks": g_tech}
    rows = []
    for _, s in gs.iterrows():
        buf = s.geometry.buffer(1000)
        row = {"serial_no": s["serial_no"], "locality": s["locality"]}
        for k, g in layers.items():
            row[k] = int(g.to_crs(32643).within(buf).sum())
        near = g_streets[(g_streets["serial_no"] == s["serial_no"]) & (g_streets["dist_to_store_m"] <= 350)]
        row["walkshed_peak_flow"] = int(near["flow"].max()) if len(near) else 0
        row["walkshed_segments"] = int(len(near))
        row["high_street_share_pct"] = round(float((near["tier"] >= 7).mean() * 100), 1) if len(near) else 0
        row["monthly_customers"] = s["store_footfall"]["est_monthly_customers"]
        rows.append(row)
    path = os.path.join(OUT, "store_magnet_counts.json")
    json.dump(rows, open(path, "w"), indent=2)
    print("  saved", path)


if __name__ == "__main__":
    fig_network_overview()
    fig_competition()
    fig_magnets()
    for sn in ["APSARA_BLR_01", "APSARA_BLR_02", "APSARA_BLR_13", "APSARA_BLR_28"]:
        fig_store_footfall(sn)
    fig_diurnal()
    fig_store_benchmark()
    fig_tier_mix()
    magnet_counts()
    print("Done.")
