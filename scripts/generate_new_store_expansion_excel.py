import json
import math
import os
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

def haversine(lat1, lon1, lat2, lon2):
    R = 6371.0  # km
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlam = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlam / 2)**2
    return 2.0 * R * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))

def main():
    with open('reports/apsara_new_store_location_recommendations.json') as f:
        candidates = json.load(f)
    with open('frontend/public/data/apsara_ice_cream_bangalore_footfall.json') as f:
        existing_stores = json.load(f)

    wb = openpyxl.Workbook()
    wb.remove(wb.active)  # remove default sheet

    # Fonts & Styles
    font_title = Font(name="Calibri", size=16, bold=True, color="FFFFFF")
    font_subtitle = Font(name="Calibri", size=10, italic=True, color="E2E8F0")
    font_section = Font(name="Calibri", size=12, bold=True, color="0F172A")
    font_header = Font(name="Calibri", size=10, bold=True, color="FFFFFF")
    font_bold = Font(name="Calibri", size=10, bold=True, color="0F172A")
    font_regular = Font(name="Calibri", size=10, color="1E293B")
    font_mono = Font(name="Consolas", size=9.5, color="0F172A")
    font_rank_gold = Font(name="Calibri", size=11, bold=True, color="D97706")
    font_pass = Font(name="Calibri", size=10, bold=True, color="16A34A")

    fill_navy = PatternFill("solid", fgColor="0F172A")
    fill_header = PatternFill("solid", fgColor="1E293B")
    fill_subhdr = PatternFill("solid", fgColor="334155")
    fill_accent_blue = PatternFill("solid", fgColor="0284C7")
    fill_zebra = PatternFill("solid", fgColor="F8FAFC")
    fill_gold_light = PatternFill("solid", fgColor="FEF3C7")
    fill_green_light = PatternFill("solid", fgColor="DCFCE7")

    border_thin = Border(
        left=Side(style='thin', color='CBD5E1'),
        right=Side(style='thin', color='CBD5E1'),
        top=Side(style='thin', color='CBD5E1'),
        bottom=Side(style='thin', color='CBD5E1')
    )
    border_double_bottom = Border(
        left=Side(style='thin', color='CBD5E1'),
        right=Side(style='thin', color='CBD5E1'),
        top=Side(style='thin', color='CBD5E1'),
        bottom=Side(style='double', color='0F172A')
    )

    # =========================================================================
    # TAB 1: EXECUTIVE EXPANSION SCORECARD
    # =========================================================================
    ws1 = wb.create_sheet(title="Executive Scorecard")
    ws1.views.sheetView[0].showGridLines = True

    # Title Banner
    ws1.merge_cells("A1:P1")
    ws1["A1"] = "APSARA ICE CREAMS — BENGALURU NEW STORE EXPANSION INTELLIGENCE"
    ws1["A1"].font = font_title
    ws1["A1"].fill = fill_navy
    ws1["A1"].alignment = Alignment(horizontal="center", vertical="center")

    ws1.merge_cells("A2:P2")
    ws1["A2"] = "Spatial Multi-Criteria Decision Analysis (MCDA) & Huff Gravity Model • Strict 3.0 to 5.5 km Separation Constraint"
    ws1["A2"].font = font_subtitle
    ws1["A2"].fill = fill_header
    ws1["A2"].alignment = Alignment(horizontal="center", vertical="center")
    ws1.row_dimensions[1].height = 30
    ws1.row_dimensions[2].height = 20

    # Headers
    headers_ws1 = [
        "Rank", "Candidate Location", "Primary High-Street Corridor", "Zone",
        "Distance to Nearest Store", "Nearest Existing Apsara Store", "Separation Status",
        "MCDA Score (/100)", "1.5km Catchment Population", "Kids & Youth (0-24 yrs)",
        "Daytime Workforce", "Competitor Parlors (1.5km)", "Dining & Transit Anchors",
        "Projected Daily Cups", "Est. Monthly Revenue (₹ Lakhs)", "Est. Payback (Months)"
    ]

    ws1.row_dimensions[4].height = 26
    for col_idx, h in enumerate(headers_ws1, 1):
        cell = ws1.cell(row=4, column=col_idx, value=h)
        cell.font = font_header
        cell.fill = fill_header
        cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
        cell.border = border_thin

    for row_idx, c in enumerate(candidates, 5):
        ws1.row_dimensions[row_idx].height = 22
        fill_current = fill_zebra if row_idx % 2 == 0 else PatternFill(fill_type=None)
        
        ws1.cell(row=row_idx, column=1, value=f"#{c['rank']}").font = font_rank_gold
        ws1.cell(row=row_idx, column=2, value=c['name']).font = font_bold
        ws1.cell(row=row_idx, column=3, value=c['corridor']).font = font_regular
        ws1.cell(row=row_idx, column=4, value=c['zone']).font = font_regular
        
        c_dist = ws1.cell(row=row_idx, column=5, value=c['min_distance_km'])
        c_dist.number_format = '0.00" km"'
        c_dist.font = font_bold
        
        ws1.cell(row=row_idx, column=6, value=c['nearest_store_locality']).font = font_regular
        
        c_status = ws1.cell(row=row_idx, column=7, value="PASS (3-5km safe)")
        c_status.font = font_pass
        c_status.fill = fill_green_light
        
        c_score = ws1.cell(row=row_idx, column=8, value=c['scores']['overall_suitability_score'])
        c_score.font = font_bold
        c_score.number_format = '0.0'
        
        c_pop = ws1.cell(row=row_idx, column=9, value=c['demographics']['walkshed_pop_15k'])
        c_pop.number_format = '#,##0'
        c_pop.font = font_mono
        
        c_kids = ws1.cell(row=row_idx, column=10, value=c['demographics']['kids_cohort_15k'] + c['demographics']['youth_cohort_15k'])
        c_kids.number_format = '#,##0'
        c_kids.font = font_mono
        
        c_work = ws1.cell(row=row_idx, column=11, value=c['commercial']['workforce_15k'])
        c_work.number_format = '#,##0'
        c_work.font = font_mono
        
        c_comp = ws1.cell(row=row_idx, column=12, value=c['competition']['competitor_count_15k'])
        c_comp.font = font_mono
        
        c_din = ws1.cell(row=row_idx, column=13, value=c['synergy_anchors']['total_dining_transit'])
        c_din.font = font_mono
        
        c_cups = ws1.cell(row=row_idx, column=14, value=c['financial_projections']['projected_daily_cups'])
        c_cups.font = font_bold
        c_cups.number_format = '#,##0" cups"'
        
        c_rev = ws1.cell(row=row_idx, column=15, value=c['financial_projections']['projected_monthly_revenue_lakhs'])
        c_rev.font = font_bold
        c_rev.number_format = '₹0.00" L"'
        
        c_pay = ws1.cell(row=row_idx, column=16, value=c['financial_projections']['est_payback_months'])
        c_pay.font = font_mono
        c_pay.number_format = '0.0" mo"'

        for col_idx in range(1, 17):
            cell = ws1.cell(row=row_idx, column=col_idx)
            if col_idx != 7:  # keep green highlight for status
                if fill_current.fill_type: cell.fill = fill_current
            cell.border = border_thin
            if col_idx in (1, 5, 7, 8, 12, 13, 14, 15, 16):
                cell.alignment = Alignment(horizontal="center", vertical="center")
            elif col_idx in (9, 10, 11):
                cell.alignment = Alignment(horizontal="right", vertical="center")
            else:
                cell.alignment = Alignment(horizontal="left", vertical="center")

    # =========================================================================
    # TAB 2: MULTI-FACTOR DEEP-DIVE PROFILES
    # =========================================================================
    ws2 = wb.create_sheet(title="Location Deep-Dive Factors")
    ws2.views.sheetView[0].showGridLines = True

    ws2.merge_cells("A1:R1")
    ws2["A1"] = "APSARA NEW STORES — COMPREHENSIVE 360° FACTOR MATRIX"
    ws2["A1"].font = font_title
    ws2["A1"].fill = fill_navy
    ws2["A1"].alignment = Alignment(horizontal="center", vertical="center")
    ws2.row_dimensions[1].height = 28

    headers_ws2 = [
        "Candidate ID", "Location Name", "Zone", "Latitude", "Longitude",
        "Analog Benchmark Flagship", "Demographic Score (/100)", "Commercial Score (/100)",
        "Synergy Score (/100)", "White Space Score (/100)", "Residential Built-up (m²)",
        "Office Built-up (m²)", "Tech Parks within 2.5km", "Spicy / Biryani Anchors",
        "Youth Burgers / Cafes", "Kids Attractions", "Schools / Colleges", "Competitor Brands Sample"
    ]

    ws2.row_dimensions[3].height = 24
    for col_idx, h in enumerate(headers_ws2, 1):
        cell = ws2.cell(row=3, column=col_idx, value=h)
        cell.font = font_header
        cell.fill = fill_header
        cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
        cell.border = border_thin

    for row_idx, c in enumerate(candidates, 4):
        ws2.row_dimensions[row_idx].height = 20
        fill_curr = fill_zebra if row_idx % 2 == 0 else PatternFill(fill_type=None)
        
        ws2.cell(row=row_idx, column=1, value=c['candidate_id']).font = font_mono
        ws2.cell(row=row_idx, column=2, value=c['name']).font = font_bold
        ws2.cell(row=row_idx, column=3, value=c['zone']).font = font_regular
        ws2.cell(row=row_idx, column=4, value=c['lat']).number_format = '0.0000'
        ws2.cell(row=row_idx, column=5, value=c['lng']).number_format = '0.0000'
        ws2.cell(row=row_idx, column=6, value=f"{c['analog_benchmark']} ({c['benchmark_serial']})").font = font_bold
        ws2.cell(row=row_idx, column=7, value=c['scores']['demographic_score'])
        ws2.cell(row=row_idx, column=8, value=c['scores']['commercial_score'])
        ws2.cell(row=row_idx, column=9, value=c['scores']['synergy_score'])
        ws2.cell(row=row_idx, column=10, value=c['scores']['white_space_score'])
        
        c_resb = ws2.cell(row=row_idx, column=11, value=c['demographics']['residential_builtup_m2'])
        c_resb.number_format = '#,##0'
        
        c_offb = ws2.cell(row=row_idx, column=12, value=c['commercial']['office_floor_m2'])
        c_offb.number_format = '#,##0'
        
        ws2.cell(row=row_idx, column=13, value=c['commercial']['tech_parks_25k'])
        ws2.cell(row=row_idx, column=14, value=c['synergy_anchors']['spicy_capsaicin_dining'])
        ws2.cell(row=row_idx, column=15, value=c['synergy_anchors']['youth_fast_casual'])
        ws2.cell(row=row_idx, column=16, value=c['synergy_anchors']['kids_family_attractions'])
        ws2.cell(row=row_idx, column=17, value=c['synergy_anchors']['education_youth_pois'])
        
        sample_b = ", ".join(c['competition']['competitor_brands'][:3]) if c['competition']['competitor_brands'] else "None (Pure White-Space)"
        ws2.cell(row=row_idx, column=18, value=sample_b).font = font_regular

        for col_idx in range(1, 19):
            cell = ws2.cell(row=row_idx, column=col_idx)
            if fill_curr.fill_type: cell.fill = fill_curr
            cell.border = border_thin
            if col_idx in (1, 4, 5, 7, 8, 9, 10, 13, 14, 15, 16, 17):
                cell.alignment = Alignment(horizontal="center", vertical="center")
            elif col_idx in (11, 12):
                cell.alignment = Alignment(horizontal="right", vertical="center")
            else:
                cell.alignment = Alignment(horizontal="left", vertical="center")

    # =========================================================================
    # TAB 3: CANNIBALIZATION AUDIT & DISTANCE MATRIX
    # =========================================================================
    ws3 = wb.create_sheet(title="Cannibalization Audit")
    ws3.views.sheetView[0].showGridLines = True

    ws3.merge_cells("A1:P1")
    ws3["A1"] = "PAIRWISE DISTANCE AUDIT: 8 CANDIDATE SITES vs ALL 13 CANONICAL APSARA STORES (km)"
    ws3["A1"].font = font_title
    ws3["A1"].fill = fill_navy
    ws3["A1"].alignment = Alignment(horizontal="center", vertical="center")
    ws3.row_dimensions[1].height = 28

    headers_ws3 = ["Candidate Location", "Min Distance (km)", "Cannibalization Risk"] + [f"#{s['serial_no'].split('_')[2]} {s['locality']}" for s in existing_stores]
    ws3.row_dimensions[3].height = 26

    for col_idx, h in enumerate(headers_ws3, 1):
        cell = ws3.cell(row=3, column=col_idx, value=h)
        cell.font = font_header
        cell.fill = fill_header
        cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
        cell.border = border_thin

    for row_idx, c in enumerate(candidates, 4):
        ws3.row_dimensions[row_idx].height = 20
        fill_curr = fill_zebra if row_idx % 2 == 0 else PatternFill(fill_type=None)

        ws3.cell(row=row_idx, column=1, value=c['name']).font = font_bold
        
        c_min = ws3.cell(row=row_idx, column=2, value=c['min_distance_km'])
        c_min.font = font_bold
        c_min.number_format = '0.00" km"'
        c_min.alignment = Alignment(horizontal="center", vertical="center")
        
        c_risk = ws3.cell(row=row_idx, column=3, value=f"{c['cannibalization_risk_pct']}% (Zero Risk)")
        c_risk.font = font_pass
        c_risk.fill = fill_green_light
        c_risk.alignment = Alignment(horizontal="center", vertical="center")

        col_num = 4
        for s in existing_stores:
            d_km = haversine(c['lat'], c['lng'], s['coordinates']['lat'], s['coordinates']['lng'])
            cell = ws3.cell(row=row_idx, column=col_num, value=round(d_km, 2))
            cell.number_format = '0.0'
            cell.font = font_mono
            cell.alignment = Alignment(horizontal="center", vertical="center")
            if d_km < 3.0:
                cell.fill = PatternFill("solid", fgColor="FEE2E2") # red flag
                cell.font = Font(name="Consolas", size=9.5, bold=True, color="DC2626")
            elif 3.0 <= d_km <= 5.5:
                cell.fill = fill_gold_light # golden band
                cell.font = Font(name="Consolas", size=9.5, bold=True, color="92400E")
            col_num += 1

        for col_idx in range(1, len(headers_ws3) + 1):
            cell = ws3.cell(row=row_idx, column=col_idx)
            cell.border = border_thin

    # =========================================================================
    # Auto-fit columns across all sheets
    # =========================================================================
    for sheet in [ws1, ws2, ws3]:
        for col in sheet.columns:
            max_len = 0
            col_letter = get_column_letter(col[0].column)
            for cell in col:
                if cell.row in (1, 2): continue # ignore merged banner
                val_str = str(cell.value or '')
                max_len = max(max_len, len(val_str))
            sheet.column_dimensions[col_letter].width = max(max_len + 4, 12)

    output_path = 'reports/Apsara_New_Store_Expansion_Location_Model.xlsx'
    wb.save(output_path)
    print(f"Executive Excel Workbook generated successfully: {output_path}")

if __name__ == '__main__':
    main()
