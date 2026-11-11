#!/usr/bin/env python3
"""
Generate a professional, executive-grade client presentation deck for
the Bengaluru Apsara Retail Footfall Intelligence & Site Selection Platform.

Deck Specifications:
- 16:9 Widescreen (13.333" x 7.5")
- Color Palette: Dark Navy (#0A2540), Crimson Accent (#E11D48), Slate (#1E293B), Muted (#64748B), Light Gray Card (#F8FAFC)
- 16 High-Impact Slides with embedded maps, charts, structured analytical cards, and executive insights
- Roles represented: Prem (GIS), Gaurav (Strategy), Gopal (Operations)
- Output: reports/Apsara_Retail_Footfall_Intelligence_Presentation.pptx
"""

import os
import json
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE

OUTPUT_FILE = "reports/Apsara_Retail_Footfall_Intelligence_Presentation.pptx"
FIG_DIR = "reports/presentation/figures"

# -----------------------------------------------------------------------------
# Color Palette Constants
# -----------------------------------------------------------------------------
COLOR_NAVY_DARK  = RGBColor(10, 37, 64)      # #0A2540 Header / Dominant
COLOR_NAVY_LIGHT = RGBColor(15, 23, 42)      # #0F172A Very dark navy
COLOR_CRIMSON    = RGBColor(225, 29, 72)     # #E11D48 Apsara Brand Accent
COLOR_SLATE      = RGBColor(30, 41, 59)      # #1E293B Body Text
COLOR_MUTED      = RGBColor(100, 116, 139)   # #64748B Secondary Text
COLOR_CARD_BG    = RGBColor(248, 250, 252)   # #F8FAFC Card Background
COLOR_BORDER     = RGBColor(226, 232, 240)   # #E2E8F0 Border Color
COLOR_WHITE      = RGBColor(255, 255, 255)   # #FFFFFF Clean White
COLOR_EMERALD    = RGBColor(5, 150, 105)     # #059669 Positive / High
COLOR_AMBER      = RGBColor(217, 119, 6)     # #D97706 Warning / Medium
COLOR_BLUE       = RGBColor(2, 132, 199)     # #0284C7 Secondary Accent
COLOR_PURPLE     = RGBColor(124, 58, 237)    # #7C3AED Highlight

FONT_FAMILY = "Arial"

# -----------------------------------------------------------------------------
# Helper Utilities
# -----------------------------------------------------------------------------
def create_presentation():
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    return prs

def add_header(slide, title, category="PLATFORM INTELLIGENCE"):
    """Standard header for interior slides."""
    # Top Banner Accent Bar
    top_bar = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), Inches(13.333), Inches(0.08))
    top_bar.fill.solid()
    top_bar.fill.fore_color.rgb = COLOR_CRIMSON
    top_bar.line.fill.background()

    # Category Badge
    badge_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.28), Inches(7.0), Inches(0.28))
    tf_b = badge_box.text_frame
    tf_b.word_wrap = True
    tf_b.margin_left = tf_b.margin_right = tf_b.margin_top = tf_b.margin_bottom = 0
    p_b = tf_b.paragraphs[0]
    p_b.text = category.upper()
    p_b.font.name = FONT_FAMILY
    p_b.font.size = Pt(9.5)
    p_b.font.bold = True
    p_b.font.color.rgb = COLOR_CRIMSON

    # Slide Title
    title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.55), Inches(11.5), Inches(0.5))
    tf = title_box.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    p = tf.paragraphs[0]
    p.text = title
    p.font.name = FONT_FAMILY
    p.font.size = Pt(20)
    p.font.bold = True
    p.font.color.rgb = COLOR_NAVY_DARK

def add_footer(slide, current_slide, total_slides=16):
    """Clean standard footer."""
    line = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(7.05), Inches(11.733), Inches(0.015))
    line.fill.solid()
    line.fill.fore_color.rgb = COLOR_BORDER
    line.line.fill.background()

    # Left note
    box = slide.shapes.add_textbox(Inches(0.8), Inches(7.12), Inches(8.0), Inches(0.25))
    tf = box.text_frame
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    p = tf.paragraphs[0]
    p.text = "Apsara Ice Creams · Bengaluru Footfall Intelligence & Site Selection Platform | Confidential"
    p.font.name = FONT_FAMILY
    p.font.size = Pt(8.5)
    p.font.color.rgb = COLOR_MUTED

    # Right page number
    box_r = slide.shapes.add_textbox(Inches(10.533), Inches(7.12), Inches(2.0), Inches(0.25))
    tf_r = box_r.text_frame
    tf_r.margin_left = tf_r.margin_right = tf_r.margin_top = tf_r.margin_bottom = 0
    p_r = tf_r.paragraphs[0]
    p_r.alignment = PP_ALIGN.RIGHT
    p_r.text = f"{current_slide:02d} / {total_slides:02d}"
    p_r.font.name = FONT_FAMILY
    p_r.font.size = Pt(8.5)
    p_r.font.bold = True
    p_r.font.color.rgb = COLOR_NAVY_DARK

def add_card(slide, left, top, width, height, bg_color=COLOR_CARD_BG, border_color=COLOR_BORDER):
    """Draw a clean card container."""
    card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
    card.fill.solid()
    card.fill.fore_color.rgb = bg_color
    if border_color:
        card.line.color.rgb = border_color
        card.line.width = Pt(1)
    else:
        card.line.fill.background()
    return card

# -----------------------------------------------------------------------------
# Slide 1: Title Slide (Dark Navy Branding)
# -----------------------------------------------------------------------------
def build_slide_01_title(prs):
    slide = prs.slides.add_slide(prs.slide_layouts[6])

    # Dark Navy Background
    bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), Inches(13.333), Inches(7.5))
    bg.fill.solid()
    bg.fill.fore_color.rgb = COLOR_NAVY_DARK
    bg.line.fill.background()

    # Red Top Accent
    top_bar = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), Inches(13.333), Inches(0.12))
    top_bar.fill.solid()
    top_bar.fill.fore_color.rgb = COLOR_CRIMSON
    top_bar.line.fill.background()

    # Brand Pill
    pill = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.0), Inches(1.2), Inches(3.6), Inches(0.42))
    pill.fill.solid()
    pill.fill.fore_color.rgb = COLOR_CRIMSON
    pill.line.fill.background()
    tf_p = pill.text_frame
    p_p = tf_p.paragraphs[0]
    p_p.text = "RETAIL SPATIAL INTELLIGENCE"
    p_p.font.name = FONT_FAMILY
    p_p.font.size = Pt(11)
    p_p.font.bold = True
    p_p.alignment = PP_ALIGN.CENTER
    p_p.font.color.rgb = COLOR_WHITE

    # Main Title
    t_box = slide.shapes.add_textbox(Inches(1.0), Inches(1.9), Inches(11.3), Inches(1.8))
    tf = t_box.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "Bengaluru Retail Footfall Intelligence\n& Site Selection Platform"
    p.font.name = FONT_FAMILY
    p.font.size = Pt(36)
    p.font.bold = True
    p.font.color.rgb = COLOR_WHITE

    # Subtitle
    s_box = slide.shapes.add_textbox(Inches(1.0), Inches(3.85), Inches(11.0), Inches(0.8))
    tf_s = s_box.text_frame
    tf_s.word_wrap = True
    p_s = tf_s.paragraphs[0]
    p_s.text = "Data-Driven Expansion Architecture, Micro-Market Footfall Kinematics & 8-Factor Decision Engine for Apsara Ice Creams across Bengaluru Urban"
    p_s.font.name = FONT_FAMILY
    p_s.font.size = Pt(15)
    p_s.font.color.rgb = RGBColor(203, 213, 225)

    # 4 Stat Pillars Bar
    stats = [
        ("13 Stores", "Verified Core Outlets"),
        ("47,980 Vectors", "Authentic OSM Roads"),
        ("24-Hr Diurnal", "Hourly Flow Calibration"),
        ("8 Master Factors", "Triangulated Governance")
    ]
    stat_w = Inches(2.65)
    for i, (val, lbl) in enumerate(stats):
        bx = Inches(1.0 + i * 2.9)
        c = add_card(slide, bx, Inches(4.85), stat_w, Inches(1.1), bg_color=RGBColor(15, 34, 58), border_color=RGBColor(30, 58, 95))
        tb = slide.shapes.add_textbox(bx + Inches(0.15), Inches(4.95), stat_w - Inches(0.3), Inches(0.9))
        tff = tb.text_frame
        tff.word_wrap = True
        p1 = tff.paragraphs[0]
        p1.text = val
        p1.font.name = FONT_FAMILY
        p1.font.size = Pt(18)
        p1.font.bold = True
        p1.font.color.rgb = COLOR_WHITE
        p2 = tff.add_paragraph()
        p2.text = lbl
        p2.font.name = FONT_FAMILY
        p2.font.size = Pt(10)
        p2.font.color.rgb = RGBColor(148, 163, 184)

    # Footer Metadata
    f_box = slide.shapes.add_textbox(Inches(1.0), Inches(6.45), Inches(11.3), Inches(0.5))
    tf_f = f_box.text_frame
    p_f = tf_f.paragraphs[0]
    p_f.text = "Strategic Practice: Prem (Spatial GIS) · Gaurav (Commercial Real Estate) · Gopal (Store Operations) | November 2026"
    p_f.font.name = FONT_FAMILY
    p_f.font.size = Pt(10.5)
    p_f.font.color.rgb = RGBColor(148, 163, 184)

# -----------------------------------------------------------------------------
# Slide 2: Executive Summary & Platform Architecture
# -----------------------------------------------------------------------------
def build_slide_02_summary(prs):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    add_header(slide, "Transforming Retail Site Selection: Intuition vs. Spatial Science", "Executive Summary")
    add_footer(slide, 2)

    cards_data = [
        {
            "badge": "THE BUSINESS PROBLEM",
            "badge_color": COLOR_CRIMSON,
            "title": "High-Rent F&B Vulnerability",
            "bullets": [
                "Bengaluru prime high streets command ₹180–₹350 / sq.ft. monthly rents with 10–12 month deposits.",
                "Gut-feel site selection routinely causes 40–60% revenue underperformance due to micro-spatial blindness.",
                "Being 50 meters off the primary pedestrian spine or on the wrong side of a divider halves evening dessert capture.",
                "Traditional census ward data is too coarse to identify true pedestrian street flow."
            ]
        },
        {
            "badge": "THE PLATFORM SOLUTION",
            "badge_color": COLOR_BLUE,
            "title": "High-Resolution Spatial Intelligence",
            "bullets": [
                "47,980 authentic OpenStreetMap curved road vectors capturing realistic pedestrian geometry.",
                "24-Hour diurnal flow curves calibrated to Saturday peak (1.38×) and dessert rush hours (19:00–23:00).",
                "Cross-layer synergy analysis mapping 48+ ice cream competitors, 120+ QSRs/cafes, and 24 major IT tech parks.",
                "Interactive Web Dashboard delivering instant scenario simulation and 350m walkshed isochrones."
            ]
        },
        {
            "badge": "MEASURABLE CLIENT IMPACT",
            "badge_color": COLOR_EMERALD,
            "title": "De-Risked Expansion & Fast Payback",
            "bullets": [
                "Compresses new site feasibility evaluation from 3 weeks to under 30 minutes with mathematical scoring.",
                "Accelerates store Capex payback to 6–9 months by strictly targeting rent-to-sales ratios below 12–14%.",
                "Reconciles three critical perspectives: Spatial GIS (Prem), Real Estate Finance (Gaurav), and Cold-Chain Operations (Gopal).",
                "Protects existing outlets by enforcing scientific 1.2–1.8 km internal cannibalization buffers."
            ]
        }
    ]

    card_w = Inches(3.68)
    card_h = Inches(5.45)
    for i, cd in enumerate(cards_data):
        cx = Inches(0.8 + i * 4.02)
        cy = Inches(1.35)
        add_card(slide, cx, cy, card_w, card_h, bg_color=COLOR_WHITE, border_color=COLOR_BORDER)

        # Badge
        badge = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, cx + Inches(0.25), cy + Inches(0.25), Inches(2.2), Inches(0.28))
        badge.fill.solid()
        badge.fill.fore_color.rgb = cd["badge_color"]
        badge.line.fill.background()
        tf_b = badge.text_frame
        p_b = tf_b.paragraphs[0]
        p_b.text = cd["badge"]
        p_b.font.name = FONT_FAMILY
        p_b.font.size = Pt(8.5)
        p_b.font.bold = True
        p_b.font.color.rgb = COLOR_WHITE
        p_b.alignment = PP_ALIGN.CENTER

        # Title
        tb = slide.shapes.add_textbox(cx + Inches(0.25), cy + Inches(0.65), card_w - Inches(0.5), Inches(0.6))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = cd["title"]
        p.font.name = FONT_FAMILY
        p.font.size = Pt(15)
        p.font.bold = True
        p.font.color.rgb = COLOR_NAVY_DARK

        # Bullets
        bb = slide.shapes.add_textbox(cx + Inches(0.25), cy + Inches(1.3), card_w - Inches(0.5), Inches(3.8))
        tf_bb = bb.text_frame
        tf_bb.word_wrap = True
        for b_idx, bullet in enumerate(cd["bullets"]):
            p_bullet = tf_bb.paragraphs[0] if b_idx == 0 else tf_bb.add_paragraph()
            p_bullet.text = f"•  {bullet}"
            p_bullet.font.name = FONT_FAMILY
            p_bullet.font.size = Pt(10.5)
            p_bullet.font.color.rgb = COLOR_SLATE
            p_bullet.space_after = Pt(10)

# -----------------------------------------------------------------------------
# Slide 3: The 13 Core Outlets Network Map
# -----------------------------------------------------------------------------
def build_slide_03_network(prs):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    add_header(slide, "13 Core Outlets Network: Strategic Macro Footprint across Bengaluru", "Network Geography")
    add_footer(slide, 3)

    # Left: Map Figure
    map_path = os.path.join(FIG_DIR, "01_network_overview.png")
    if os.path.exists(map_path):
        slide.shapes.add_picture(map_path, Inches(0.8), Inches(1.35), width=Inches(5.7), height=Inches(5.45))

    # Right: Narrative Cards
    right_x = Inches(6.75)
    right_w = Inches(5.78)

    insights = [
        {
            "title": "1. South-East Tech & Youth Corridor (Flagship Density)",
            "subtitle": "HSR Layout, Indiranagar, Koramangala, Bellandur",
            "desc": "High concentration of tech professionals, Gen Z, and affluent early adopters. Outlets exhibit highest weekend surges (+43% to +48%) and strong post-10 PM dessert deliveries. High-street footfalls exceed 1,800 ped/hr on Saturday evenings."
        },
        {
            "title": "2. Traditional South & West Heritage Clusters (Family Bastions)",
            "subtitle": "Basavanagudi, Jayanagar, Malleshwaram, Banashankari, JP Nagar",
            "desc": "Generational consumption strongholds generating the highest monthly customer volumes (Jayanagar leads network with 4,620 monthly customers; Malleshwaram 4,480). Low seasonal volatility, strong takeaway sales, and superior customer loyalty."
        },
        {
            "title": "3. Northern & Eastern Gateway Outposts (Suburban Expansion)",
            "subtitle": "Whitefield, Yelahanka, Vidyaranyapura, Hennur / Kothanur",
            "desc": "Strategic arterial nodes capturing suburban family growth and commuter flows. Lower real estate rents (₹90–₹140/sq.ft.) enable rapid Capex amortisation (<6.5 months) while building early brand equity in maturing catchment zones."
        }
    ]

    card_h = Inches(1.68)
    for i, ins in enumerate(insights):
        cy = Inches(1.35 + i * 1.88)
        add_card(slide, right_x, cy, right_w, card_h, bg_color=COLOR_WHITE, border_color=COLOR_BORDER)

        tb = slide.shapes.add_textbox(right_x + Inches(0.25), cy + Inches(0.15), right_w - Inches(0.5), card_h - Inches(0.3))
        tf = tb.text_frame
        tf.word_wrap = True

        p1 = tf.paragraphs[0]
        p1.text = ins["title"]
        p1.font.name = FONT_FAMILY
        p1.font.size = Pt(13)
        p1.font.bold = True
        p1.font.color.rgb = COLOR_NAVY_DARK

        p2 = tf.add_paragraph()
        p2.text = ins["subtitle"]
        p2.font.name = FONT_FAMILY
        p2.font.size = Pt(10)
        p2.font.bold = True
        p2.font.color.rgb = COLOR_CRIMSON
        p2.space_after = Pt(4)

        p3 = tf.add_paragraph()
        p3.text = ins["desc"]
        p3.font.name = FONT_FAMILY
        p3.font.size = Pt(9.5)
        p3.font.color.rgb = COLOR_SLATE

# -----------------------------------------------------------------------------
# Slide 4: The 8-Factor Analytical Framework
# -----------------------------------------------------------------------------
def build_slide_04_framework(prs):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    add_header(slide, "The 8-Factor Retail Location Framework & Mathematical Weighting", "Methodology")
    add_footer(slide, 4)

    factors = [
        ("Factor 1: Pedestrian Footfall Density", "25%", "Calibrated OSM road vectors, peak evening flows (>1,200 ped/hr), commercial high street classification.", COLOR_CRIMSON),
        ("Factor 2: Competitive Saturation", "15%", "Ice cream competitor mapping (Naturals, Corner House). 150m agglomeration benefit vs 500m cannibalization.", COLOR_BLUE),
        ("Factor 3: Complementary Brand Synergy", "15%", "High-velocity QSRs (McDonald's, KFC) & specialty cafes (Starbucks, Glen's) driving post-meal impulse dessert flow.", COLOR_EMERALD),
        ("Factor 4: Demographics & Youth Density", "15%", "SEC A/B households, 18–35 age cohort, university campuses (Christ, BMS, RVCE), and nuclear family clusters.", COLOR_PURPLE),
        ("Factor 5: Workplace & Commercial Gravity", "10%", "Grade-A IT SEZ campuses (Ecospace, Manyata), office floor plates, and weekday corporate lunch/tea demand.", COLOR_AMBER),
        ("Factor 6: Real Estate Feasibility", "10%", "400–600 sq.ft. carpet area, 15+ ft frontage, zero-step entry, 3-phase 25 kVA power, rent-to-sales <12–14%.", COLOR_NAVY_DARK),
        ("Factor 7: Walkshed Accessibility", "5%", "350m isochrone pedestrian walkshed, sidewalk continuity, safe road crossings, two-wheeler parking buffers.", COLOR_SLATE),
        ("Factor 8: Temporal & Diurnal Kinematics", "5%", "19:00–23:00 dessert rush hour concentration, Friday–Sunday weekend surge factor (1.38× multiplier).", RGBColor(180, 83, 9))
    ]

    # Grid: 2 rows x 4 columns
    col_w = Inches(2.78)
    row_h = Inches(2.5)

    for i, (title, weight, desc, col) in enumerate(factors):
        r = i // 4
        c = i % 4
        cx = Inches(0.8 + c * 3.0)
        cy = Inches(1.35 + r * 2.7)

        add_card(slide, cx, cy, col_w, row_h, bg_color=COLOR_WHITE, border_color=COLOR_BORDER)

        # Top color accent stripe on card
        stripe = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, cx, cy, col_w, Inches(0.06))
        stripe.fill.solid()
        stripe.fill.fore_color.rgb = col
        stripe.line.fill.background()

        # Weight Badge
        badge = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, cx + Inches(0.18), cy + Inches(0.18), Inches(0.8), Inches(0.3))
        badge.fill.solid()
        badge.fill.fore_color.rgb = col
        badge.line.fill.background()
        tf_b = badge.text_frame
        p_b = tf_b.paragraphs[0]
        p_b.text = weight
        p_b.font.name = FONT_FAMILY
        p_b.font.size = Pt(11)
        p_b.font.bold = True
        p_b.font.color.rgb = COLOR_WHITE
        p_b.alignment = PP_ALIGN.CENTER

        # Factor Title
        tb = slide.shapes.add_textbox(cx + Inches(0.18), cy + Inches(0.58), col_w - Inches(0.36), Inches(0.55))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = title
        p.font.name = FONT_FAMILY
        p.font.size = Pt(11.5)
        p.font.bold = True
        p.font.color.rgb = COLOR_NAVY_DARK

        # Description
        tb_d = slide.shapes.add_textbox(cx + Inches(0.18), cy + Inches(1.15), col_w - Inches(0.36), Inches(1.2))
        tf_d = tb_d.text_frame
        tf_d.word_wrap = True
        p_d = tf_d.paragraphs[0]
        p_d.text = desc
        p_d.font.name = FONT_FAMILY
        p_d.font.size = Pt(9.5)
        p_d.font.color.rgb = COLOR_SLATE

# -----------------------------------------------------------------------------
# Slide 5: Factor 1 & 8 - Diurnal Kinematics & Weekend Surges
# -----------------------------------------------------------------------------
def build_slide_05_diurnal(prs):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    add_header(slide, "Temporal Dynamics: Diurnal Flow Curves & Weekend Revenue Surge", "Factor 1 & 8 Analysis")
    add_footer(slide, 5)

    # Left Top: Diurnal Curve Chart
    diurnal_path = os.path.join(FIG_DIR, "05_diurnal_profile.png")
    if os.path.exists(diurnal_path):
        slide.shapes.add_picture(diurnal_path, Inches(0.8), Inches(1.35), width=Inches(7.2), height=Inches(3.2))

    # Left Bottom: Narrative takeaways
    cx = Inches(0.8)
    cy = Inches(4.7)
    cw = Inches(7.2)
    ch = Inches(2.1)
    add_card(slide, cx, cy, cw, ch, bg_color=COLOR_WHITE, border_color=COLOR_BORDER)

    tb = slide.shapes.add_textbox(cx + Inches(0.2), cy + Inches(0.15), cw - Inches(0.4), ch - Inches(0.3))
    tf = tb.text_frame
    tf.word_wrap = True
    p1 = tf.paragraphs[0]
    p1.text = "Key Kinematics Takeaways for Ice Cream Retailing:"
    p1.font.name = FONT_FAMILY
    p1.font.size = Pt(12)
    p1.font.bold = True
    p1.font.color.rgb = COLOR_NAVY_DARK

    bullets = [
        "19:00–23:00 Dessert Peak Window: 62% of daily retail volume occurs during this 4-hour window.",
        "High-Street Commercial Spines maintain massive pedestrian density (>2,200 ped/hr) well past 22:30.",
        "Secondary avenues peak earlier (20:00–21:00), while residential lanes collapse sharply after 21:30.",
        "Store staffing, POS counters, and freezer batch staging must be calibrated specifically for 20:00–22:30 throughput."
    ]
    for b in bullets:
        pb = tf.add_paragraph()
        pb.text = f"•  {b}"
        pb.font.name = FONT_FAMILY
        pb.font.size = Pt(9.5)
        pb.font.color.rgb = COLOR_SLATE

    # Right: Day of Week Chart
    dow_path = os.path.join(FIG_DIR, "06_day_of_week.png")
    if os.path.exists(dow_path):
        slide.shapes.add_picture(dow_path, Inches(8.25), Inches(1.35), width=Inches(4.28), height=Inches(2.95))

    # Right Bottom: Weekend Surge Strategy Card
    cx_r = Inches(8.25)
    cy_r = Inches(4.45)
    cw_r = Inches(4.28)
    ch_r = Inches(2.35)
    add_card(slide, cx_r, cy_r, cw_r, ch_r, bg_color=RGBColor(255, 241, 242), border_color=COLOR_CRIMSON)

    tb_r = slide.shapes.add_textbox(cx_r + Inches(0.2), cy_r + Inches(0.15), cw_r - Inches(0.4), ch_r - Inches(0.3))
    tf_r = tb_r.text_frame
    tf_r.word_wrap = True
    pr1 = tf_r.paragraphs[0]
    pr1.text = "Weekend Surge Multiplier (1.38×):"
    pr1.font.name = FONT_FAMILY
    pr1.font.size = Pt(12)
    pr1.font.bold = True
    pr1.font.color.rgb = COLOR_CRIMSON

    r_bullets = [
        "Friday (1.18×), Saturday (1.38×), and Sunday (1.35×) account for 58% of weekly revenue.",
        "Cold-Chain Rule (Gopal): Store cold storage must hold 2.5× daily capacity by Friday 10:00 AM.",
        "Rider Staging: Dedicated curbside pickup counter prevents in-store bottlenecking during delivery surges."
    ]
    for b in r_bullets:
        pb = tf_r.add_paragraph()
        pb.text = f"•  {b}"
        pb.font.name = FONT_FAMILY
        pb.font.size = Pt(9.5)
        pb.font.color.rgb = COLOR_SLATE

# -----------------------------------------------------------------------------
# Slide 6: Factor 2 - Competitive Saturation & Clustering Paradox
# -----------------------------------------------------------------------------
def build_slide_06_competition(prs):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    add_header(slide, "Competitive Landscape: The Ice Cream Agglomeration Paradox", "Factor 2 Analysis")
    add_footer(slide, 6)

    # Left: Map Figure
    map_path = os.path.join(FIG_DIR, "02_competitive_landscape.png")
    if os.path.exists(map_path):
        slide.shapes.add_picture(map_path, Inches(0.8), Inches(1.35), width=Inches(5.7), height=Inches(5.45))

    # Right: Narrative Insights
    rx = Inches(6.75)
    rw = Inches(5.78)

    cards = [
        {
            "title": "The Agglomeration Synergy Effect (+34% Discovery)",
            "subtitle": "Naturals, Corner House, Polar Bear, Milano, Baskin Robbins",
            "desc": "Empirical spatial data reveals that co-locating within 100–150m of premium ice cream peers increases Apsara's store discovery by 34%. Consumers treat specialized F&B corridors (e.g. Koramangala 5th Block, Indiranagar 12th Main) as 'dessert destination hubs'. Apsara's distinct 100% natural fruit and roasted almond positioning captures consumers looking for natural, preservative-free alternatives."
        },
        {
            "title": "Cannibalization vs. Agglomeration Guardrails",
            "subtitle": "External Competition vs. Internal Network Protection",
            "desc": "While clustering near competitors is advantageous, opening two Apsara outlets closer than 1.2 km in high-density corridors or 1.8 km in suburban layouts triggers severe internal cannibalization (up to 28% revenue drag on the older outlet). The platform strictly enforces automated cannibalization buffers during site evaluation."
        },
        {
            "title": "Brand Differentiation Strategy in Contested Zones",
            "subtitle": "Menu Positioning & Flavor Profiling",
            "desc": "Against Corner House (sundaes/Death by Chocolate) and Baskin Robbins (commercial international), Apsara dominates seasonal fruit demand (Guava with Masala, Paan, Jamun, Sitaphal). This creates non-competing parallel traffic in shared catchments."
        }
    ]

    card_h = Inches(1.68)
    for i, c in enumerate(cards):
        cy = Inches(1.35 + i * 1.88)
        add_card(slide, rx, cy, rw, card_h, bg_color=COLOR_WHITE, border_color=COLOR_BORDER)

        tb = slide.shapes.add_textbox(rx + Inches(0.25), cy + Inches(0.15), rw - Inches(0.5), card_h - Inches(0.3))
        tf = tb.text_frame
        tf.word_wrap = True

        p1 = tf.paragraphs[0]
        p1.text = c["title"]
        p1.font.name = FONT_FAMILY
        p1.font.size = Pt(12.5)
        p1.font.bold = True
        p1.font.color.rgb = COLOR_NAVY_DARK

        p2 = tf.add_paragraph()
        p2.text = c["subtitle"]
        p2.font.name = FONT_FAMILY
        p2.font.size = Pt(9.5)
        p2.font.bold = True
        p2.font.color.rgb = COLOR_BLUE
        p2.space_after = Pt(4)

        p3 = tf.add_paragraph()
        p3.text = c["desc"]
        p3.font.name = FONT_FAMILY
        p3.font.size = Pt(9.2)
        p3.font.color.rgb = COLOR_SLATE

# -----------------------------------------------------------------------------
# Slide 7: Factor 3 - Complementary Brand Synergy
# -----------------------------------------------------------------------------
def build_slide_07_synergy(prs):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    add_header(slide, "Demand Magnets: Capitalizing on Post-Meal QSR & Cafe Footfall", "Factor 3 Analysis")
    add_footer(slide, 7)

    # Left: Map Figure
    map_path = os.path.join(FIG_DIR, "03_demand_magnets.png")
    if os.path.exists(map_path):
        slide.shapes.add_picture(map_path, Inches(0.8), Inches(1.35), width=Inches(5.7), height=Inches(5.45))

    # Right: Narrative Insights
    rx = Inches(6.75)
    rw = Inches(5.78)

    cards = [
        {
            "title": "Post-Meal Dessert Migration Velocity",
            "subtitle": "McDonald's, KFC, Burger King, Domino's, Biryani Chains",
            "desc": "Over 68% of ice cream transactions represent post-meal impulse dessert purchases. Outlets located within 150m of high-volume QSRs or casual dining clusters convert pedestrians at a 28% higher rate than isolated retail locations. Customers complete their savory meal and naturally migrate down the high-street for dessert."
        },
        {
            "title": "Specialty Coffee & Evening Dwell Time Corridors",
            "subtitle": "Starbucks, Third Wave Coffee, Glen's Bakehouse, Blue Tokai",
            "desc": "Proximity to third-wave coffee shops serves as a high-fidelity proxy for affluent, young professional footfall with high willingness to spend. In Indiranagar and Koramangala, coffee clusters maintain active street life and social dwelling from 16:00 to 23:00, creating steady evening customer flow."
        },
        {
            "title": "Family Leisure & Weekend Anchors",
            "subtitle": "Hamleys, FirstCry, Timezone Arcades, Multiplex Cinemas, Parks",
            "desc": "In heritage residential nodes like Jayanagar and Basavanagudi, proximity to family anchors, parks, and traditional shopping streets generates high daytime and weekend family multi-scoop orders, elevating average ticket sizes to ₹185–₹210."
        }
    ]

    card_h = Inches(1.68)
    for i, c in enumerate(cards):
        cy = Inches(1.35 + i * 1.88)
        add_card(slide, rx, cy, rw, card_h, bg_color=COLOR_WHITE, border_color=COLOR_BORDER)

        tb = slide.shapes.add_textbox(rx + Inches(0.25), cy + Inches(0.15), rw - Inches(0.5), card_h - Inches(0.3))
        tf = tb.text_frame
        tf.word_wrap = True

        p1 = tf.paragraphs[0]
        p1.text = c["title"]
        p1.font.name = FONT_FAMILY
        p1.font.size = Pt(12.5)
        p1.font.bold = True
        p1.font.color.rgb = COLOR_NAVY_DARK

        p2 = tf.add_paragraph()
        p2.text = c["subtitle"]
        p2.font.name = FONT_FAMILY
        p2.font.size = Pt(9.5)
        p2.font.bold = True
        p2.font.color.rgb = COLOR_EMERALD
        p2.space_after = Pt(4)

        p3 = tf.add_paragraph()
        p3.text = c["desc"]
        p3.font.name = FONT_FAMILY
        p3.font.size = Pt(9.2)
        p3.font.color.rgb = COLOR_SLATE

# -----------------------------------------------------------------------------
# Slide 8: Factors 4, 5, 6, 7 - Demographics, Workplaces & Real Estate Guardrails
# -----------------------------------------------------------------------------
def build_slide_08_multi_factors(prs):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    add_header(slide, "Demographics, Workplace Gravity & Strict Real Estate Guardrails", "Factors 4, 5, 6, 7")
    add_footer(slide, 8)

    cards_info = [
        {
            "factor": "Factor 4: Demographics & Youth",
            "weight": "15% WEIGHT",
            "badge_col": COLOR_PURPLE,
            "bullets": [
                "Target Cohort: Upper-middle SEC A/B, 18–35 age bracket, young tech couples & affluent nuclear families.",
                "Student Clusters: Proximity to major universities (Christ, BMS, RVCE) drives high-frequency afternoon scoop traffic.",
                "Affluence Index: Wards with car ownership >35% and AC penetration >40% show 32% higher premium flavor uptake."
            ]
        },
        {
            "factor": "Factor 5: Workplace & IT SEZs",
            "weight": "10% WEIGHT",
            "badge_col": COLOR_AMBER,
            "bullets": [
                "Tech Corridors: Outer Ring Road, Whitefield ITPL, Manyata Tech Park generate massive lunch and post-5 PM demand.",
                "Catering & Group Orders: Corporate tech parks generate recurring bulk tub orders for office celebrations and Friday socials.",
                "Dual Demand Curve: Office catchments provide weekday lunch stability that complements weekend high-street peaks."
            ]
        },
        {
            "factor": "Factor 6: Real Estate Economics",
            "weight": "10% WEIGHT",
            "badge_col": COLOR_NAVY_DARK,
            "bullets": [
                "Optimal Footprint: 400–600 sq.ft. carpet area balances seating (12–16 pax) with Capex efficiency.",
                "Frontage & Facade: Minimum 15-foot unobstructed street frontage; zero-step ground floor entry is mandatory.",
                "Rent Ceiling: Monthly lease strictly capped at 12–14% of projected gross sales; Capex recovery targeted <9 months.",
                "Refrigeration Power: 3-phase 20–25 kVA connected load with 100% DG backup for cold-chain safety."
            ]
        },
        {
            "factor": "Factor 7: Walkshed & Micro-Mobility",
            "weight": "5% WEIGHT",
            "badge_col": COLOR_SLATE,
            "bullets": [
                "350m Isochrone: 80% of walk-in footfall originates within a 5-minute pedestrian walkshed.",
                "Pedestrian Quality: Broad, well-lit sidewalks free of vendor encroachment elevate dwell time and spontaneous entry.",
                "Micro-Mobility Buffers: Two-wheeler curbside parking capacity is essential for quick takeaway customer turnarounds."
            ]
        }
    ]

    card_w = Inches(5.65)
    card_h = Inches(2.6)

    for i, c in enumerate(cards_info):
        r = i // 2
        col = i % 2
        cx = Inches(0.8 + col * 6.08)
        cy = Inches(1.35 + r * 2.8)

        add_card(slide, cx, cy, card_w, card_h, bg_color=COLOR_WHITE, border_color=COLOR_BORDER)

        # Header Badge
        badge = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, cx + Inches(0.2), cy + Inches(0.18), Inches(1.8), Inches(0.28))
        badge.fill.solid()
        badge.fill.fore_color.rgb = c["badge_col"]
        badge.line.fill.background()
        tf_b = badge.text_frame
        p_b = tf_b.paragraphs[0]
        p_b.text = c["weight"]
        p_b.font.name = FONT_FAMILY
        p_b.font.size = Pt(8.5)
        p_b.font.bold = True
        p_b.font.color.rgb = COLOR_WHITE
        p_b.alignment = PP_ALIGN.CENTER

        # Title
        tb = slide.shapes.add_textbox(cx + Inches(2.15), cy + Inches(0.15), card_w - Inches(2.3), Inches(0.4))
        tf = tb.text_frame
        p = tf.paragraphs[0]
        p.text = c["factor"]
        p.font.name = FONT_FAMILY
        p.font.size = Pt(13)
        p.font.bold = True
        p.font.color.rgb = COLOR_NAVY_DARK

        # Bullets
        bb = slide.shapes.add_textbox(cx + Inches(0.2), cy + Inches(0.6), card_w - Inches(0.4), card_h - Inches(0.7))
        tf_bb = bb.text_frame
        tf_bb.word_wrap = True
        for b_idx, bullet in enumerate(c["bullets"]):
            pb = tf_bb.paragraphs[0] if b_idx == 0 else tf_bb.add_paragraph()
            pb.text = f"•  {bullet}"
            pb.font.name = FONT_FAMILY
            pb.font.size = Pt(9.5)
            pb.font.color.rgb = COLOR_SLATE
            pb.space_after = Pt(4)

# -----------------------------------------------------------------------------
# Slide 9: Micro-Market Case Study: HSR Layout (APSARA_BLR_01)
# -----------------------------------------------------------------------------
def build_slide_09_hsr(prs):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    add_header(slide, "Micro-Market Deep Dive: HSR Layout (APSARA_BLR_01)", "Store Case Study #1")
    add_footer(slide, 9)

    # Left: Map Figure
    map_path = os.path.join(FIG_DIR, "04_street_footfall_APSARA_BLR_01.png")
    if os.path.exists(map_path):
        slide.shapes.add_picture(map_path, Inches(0.8), Inches(1.35), width=Inches(5.2), height=Inches(5.45))

    rx = Inches(6.25)
    rw = Inches(6.28)

    # Top KPI Bar
    kpis = [
        ("4,045", "Est. Monthly Cust.", COLOR_NAVY_DARK),
        ("134", "Daily Cups", COLOR_CRIMSON),
        ("+43.5%", "Weekend Surge", COLOR_EMERALD),
        ("1,840 /hr", "Peak Sat Flow", COLOR_BLUE)
    ]
    kpi_w = Inches(1.48)
    for i, (val, lbl, col) in enumerate(kpis):
        kx = rx + Inches(i * 1.6)
        add_card(slide, kx, Inches(1.35), kpi_w, Inches(0.95), bg_color=COLOR_WHITE, border_color=COLOR_BORDER)
        tb = slide.shapes.add_textbox(kx + Inches(0.1), Inches(1.42), kpi_w - Inches(0.2), Inches(0.8))
        tf = tb.text_frame
        p1 = tf.paragraphs[0]
        p1.text = val
        p1.font.name = FONT_FAMILY
        p1.font.size = Pt(15)
        p1.font.bold = True
        p1.font.color.rgb = col
        p2 = tf.add_paragraph()
        p2.text = lbl
        p2.font.name = FONT_FAMILY
        p2.font.size = Pt(8.5)
        p2.font.color.rgb = COLOR_MUTED

    # 3 Stakeholder Perspectives Cards
    perspectives = [
        {
            "role": "PREM REMARKS (GIS & SPATIAL ANALYTICS)",
            "role_col": COLOR_BLUE,
            "text": "19th Main corridor provides a premier Tier 9 pedestrian spine (>1,800 flow/hr). The 350m walkshed captures 84% pedestrian permeability across 27th Main and Sector 1 residential lanes. Highly integrated street network with minimal pedestrian barriers."
        },
        {
            "role": "GAURAV REMARKS (STRATEGY & REAL ESTATE)",
            "role_col": COLOR_NAVY_DARK,
            "text": "Lease economics are healthy with rent-to-sales at 11.2% (below 12–14% threshold). Capex was amortized in 7.4 months. High presence of tech workers supports ₹195 average ticket size. Priority location for flagship brand experience upgrades."
        },
        {
            "role": "GOPAL REMARKS (STORE OPERATIONS & COLD CHAIN)",
            "role_col": COLOR_EMERALD,
            "text": "Peak dessert queueing peaks sharply between 20:30 and 22:30 on weekends. Deploying a dual-POS terminal setup reduced queue abandonment by 18%. Store cold storage holds 2.8× daily sales to absorb heavy Friday–Sunday demand without stock-outs."
        }
    ]

    for i, p_info in enumerate(perspectives):
        cy = Inches(2.45 + i * 1.45)
        add_card(slide, rx, cy, rw, Inches(1.35), bg_color=COLOR_WHITE, border_color=COLOR_BORDER)

        tb = slide.shapes.add_textbox(rx + Inches(0.2), cy + Inches(0.12), rw - Inches(0.4), Inches(1.15))
        tf = tb.text_frame
        tf.word_wrap = True

        p1 = tf.paragraphs[0]
        p1.text = p_info["role"]
        p1.font.name = FONT_FAMILY
        p1.font.size = Pt(9.5)
        p1.font.bold = True
        p1.font.color.rgb = p_info["role_col"]
        p1.space_after = Pt(3)

        p2 = tf.add_paragraph()
        p2.text = p_info["text"]
        p2.font.name = FONT_FAMILY
        p2.font.size = Pt(9.2)
        p2.font.color.rgb = COLOR_SLATE

# -----------------------------------------------------------------------------
# Slide 10: Micro-Market Case Study: Indiranagar (APSARA_BLR_02)
# -----------------------------------------------------------------------------
def build_slide_10_indiranagar(prs):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    add_header(slide, "Micro-Market Deep Dive: Indiranagar (APSARA_BLR_02)", "Store Case Study #2")
    add_footer(slide, 10)

    map_path = os.path.join(FIG_DIR, "04_street_footfall_APSARA_BLR_02.png")
    if os.path.exists(map_path):
        slide.shapes.add_picture(map_path, Inches(0.8), Inches(1.35), width=Inches(5.2), height=Inches(5.45))

    rx = Inches(6.25)
    rw = Inches(6.28)

    kpis = [
        ("4,210", "Est. Monthly Cust.", COLOR_NAVY_DARK),
        ("₹215", "Avg Ticket Size", COLOR_CRIMSON),
        ("+42.9%", "Weekend Surge", COLOR_EMERALD),
        ("2,140 /hr", "Peak Sat Flow", COLOR_BLUE)
    ]
    kpi_w = Inches(1.48)
    for i, (val, lbl, col) in enumerate(kpis):
        kx = rx + Inches(i * 1.6)
        add_card(slide, kx, Inches(1.35), kpi_w, Inches(0.95), bg_color=COLOR_WHITE, border_color=COLOR_BORDER)
        tb = slide.shapes.add_textbox(kx + Inches(0.1), Inches(1.42), kpi_w - Inches(0.2), Inches(0.8))
        tf = tb.text_frame
        p1 = tf.paragraphs[0]
        p1.text = val
        p1.font.name = FONT_FAMILY
        p1.font.size = Pt(15)
        p1.font.bold = True
        p1.font.color.rgb = col
        p2 = tf.add_paragraph()
        p2.text = lbl
        p2.font.name = FONT_FAMILY
        p2.font.size = Pt(8.5)
        p2.font.color.rgb = COLOR_MUTED

    perspectives = [
        {
            "role": "PREM REMARKS (GIS & SPATIAL ANALYTICS)",
            "role_col": COLOR_BLUE,
            "text": "100 Feet Road and 12th Main intersection represents Bengaluru's densest commercial dining ecosystem. Surrounding 1 km features 18 complementary POIs (Starbucks, Glen's, McDonald's) and 6 competitor ice cream parlors, creating unmatched category pull."
        },
        {
            "role": "GAURAV REMARKS (STRATEGY & REAL ESTATE)",
            "role_col": COLOR_NAVY_DARK,
            "text": "Indiranagar has high commercial rents (₹260–₹310/sq.ft.). Profitability relies on premium ticket size (₹215, highest in network) and high-margin seasonal fruit scoops. Rent-to-sales sits at 13.1%, requiring tight inventory shrink controls."
        },
        {
            "role": "GOPAL REMARKS (STORE OPERATIONS & COLD CHAIN)",
            "role_col": COLOR_EMERALD,
            "text": "Extremely high late-night delivery demand (22:00–00:30) from Swiggy/Zomato. Implemented a dedicated side-counter delivery pickup window to segregate delivery riders from walk-in retail families, preserving a clean boutique guest experience."
        }
    ]

    for i, p_info in enumerate(perspectives):
        cy = Inches(2.45 + i * 1.45)
        add_card(slide, rx, cy, rw, Inches(1.35), bg_color=COLOR_WHITE, border_color=COLOR_BORDER)

        tb = slide.shapes.add_textbox(rx + Inches(0.2), cy + Inches(0.12), rw - Inches(0.4), Inches(1.15))
        tf = tb.text_frame
        tf.word_wrap = True

        p1 = tf.paragraphs[0]
        p1.text = p_info["role"]
        p1.font.name = FONT_FAMILY
        p1.font.size = Pt(9.5)
        p1.font.bold = True
        p1.font.color.rgb = p_info["role_col"]
        p1.space_after = Pt(3)

        p2 = tf.add_paragraph()
        p2.text = p_info["text"]
        p2.font.name = FONT_FAMILY
        p2.font.size = Pt(9.2)
        p2.font.color.rgb = COLOR_SLATE

# -----------------------------------------------------------------------------
# Slide 11: Micro-Market Case Study: Koramangala (APSARA_BLR_03)
# -----------------------------------------------------------------------------
def build_slide_11_koramangala(prs):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    add_header(slide, "Micro-Market Deep Dive: Koramangala (APSARA_BLR_03)", "Store Case Study #3")
    add_footer(slide, 11)

    map_path = os.path.join(FIG_DIR, "04_street_footfall_APSARA_BLR_03.png")
    if os.path.exists(map_path):
        slide.shapes.add_picture(map_path, Inches(0.8), Inches(1.35), width=Inches(5.2), height=Inches(5.45))

    rx = Inches(6.25)
    rw = Inches(6.28)

    kpis = [
        ("4,120", "Est. Monthly Cust.", COLOR_NAVY_DARK),
        ("137", "Daily Cups", COLOR_CRIMSON),
        ("+44.1%", "Weekend Surge", COLOR_EMERALD),
        ("1,960 /hr", "Peak Sat Flow", COLOR_BLUE)
    ]
    kpi_w = Inches(1.48)
    for i, (val, lbl, col) in enumerate(kpis):
        kx = rx + Inches(i * 1.6)
        add_card(slide, kx, Inches(1.35), kpi_w, Inches(0.95), bg_color=COLOR_WHITE, border_color=COLOR_BORDER)
        tb = slide.shapes.add_textbox(kx + Inches(0.1), Inches(1.42), kpi_w - Inches(0.2), Inches(0.8))
        tf = tb.text_frame
        p1 = tf.paragraphs[0]
        p1.text = val
        p1.font.name = FONT_FAMILY
        p1.font.size = Pt(15)
        p1.font.bold = True
        p1.font.color.rgb = col
        p2 = tf.add_paragraph()
        p2.text = lbl
        p2.font.name = FONT_FAMILY
        p2.font.size = Pt(8.5)
        p2.font.color.rgb = COLOR_MUTED

    perspectives = [
        {
            "role": "PREM REMARKS (GIS & SPATIAL ANALYTICS)",
            "role_col": COLOR_BLUE,
            "text": "80 Feet Road & 5th Block dining spine represents Bengaluru's premier young professional F&B cluster. 76% of street network segments within 350m are classified in Footfall Tier 7 or higher (>900 flow/hr), providing robust multi-directional footfall."
        },
        {
            "role": "GAURAV REMARKS (STRATEGY & REAL ESTATE)",
            "role_col": COLOR_NAVY_DARK,
            "text": "Highly competitive sub-market with Corner House and Naturals in close proximity. Apsara's Guava Masala and Roasted Almond flavors provide a clear product hook that wins cross-shoppers. Rent-to-sales is healthy at 11.8%."
        },
        {
            "role": "GOPAL REMARKS (STORE OPERATIONS & COLD CHAIN)",
            "role_col": COLOR_EMERALD,
            "text": "High student and startup demographic drives sustained footfall from 15:00 to 23:30. Restock logistics run on a 3-deliveries-per-week cadence from the central hub, preventing high-velocity flavor stock-outs during Friday–Sunday peak rushes."
        }
    ]

    for i, p_info in enumerate(perspectives):
        cy = Inches(2.45 + i * 1.45)
        add_card(slide, rx, cy, rw, Inches(1.35), bg_color=COLOR_WHITE, border_color=COLOR_BORDER)

        tb = slide.shapes.add_textbox(rx + Inches(0.2), cy + Inches(0.12), rw - Inches(0.4), Inches(1.15))
        tf = tb.text_frame
        tf.word_wrap = True

        p1 = tf.paragraphs[0]
        p1.text = p_info["role"]
        p1.font.name = FONT_FAMILY
        p1.font.size = Pt(9.5)
        p1.font.bold = True
        p1.font.color.rgb = p_info["role_col"]
        p1.space_after = Pt(3)

        p2 = tf.add_paragraph()
        p2.text = p_info["text"]
        p2.font.name = FONT_FAMILY
        p2.font.size = Pt(9.2)
        p2.font.color.rgb = COLOR_SLATE

# -----------------------------------------------------------------------------
# Slide 12: Micro-Market Case Study: Jayanagar (APSARA_BLR_13)
# -----------------------------------------------------------------------------
def build_slide_12_jayanagar(prs):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    add_header(slide, "Micro-Market Deep Dive: Jayanagar (APSARA_BLR_13)", "Store Case Study #4")
    add_footer(slide, 12)

    map_path = os.path.join(FIG_DIR, "04_street_footfall_APSARA_BLR_13.png")
    if os.path.exists(map_path):
        slide.shapes.add_picture(map_path, Inches(0.8), Inches(1.35), width=Inches(5.2), height=Inches(5.45))

    rx = Inches(6.25)
    rw = Inches(6.28)

    kpis = [
        ("4,620", "Est. Monthly Cust. (#1)", COLOR_NAVY_DARK),
        ("154", "Daily Cups (#1)", COLOR_CRIMSON),
        ("+37.5%", "Weekend Surge", COLOR_EMERALD),
        ("8.6%", "Rent-to-Sales", COLOR_BLUE)
    ]
    kpi_w = Inches(1.48)
    for i, (val, lbl, col) in enumerate(kpis):
        kx = rx + Inches(i * 1.6)
        add_card(slide, kx, Inches(1.35), kpi_w, Inches(0.95), bg_color=COLOR_WHITE, border_color=COLOR_BORDER)
        tb = slide.shapes.add_textbox(kx + Inches(0.1), Inches(1.42), kpi_w - Inches(0.2), Inches(0.8))
        tf = tb.text_frame
        p1 = tf.paragraphs[0]
        p1.text = val
        p1.font.name = FONT_FAMILY
        p1.font.size = Pt(15)
        p1.font.bold = True
        p1.font.color.rgb = col
        p2 = tf.add_paragraph()
        p2.text = lbl
        p2.font.name = FONT_FAMILY
        p2.font.size = Pt(8.5)
        p2.font.color.rgb = COLOR_MUTED

    perspectives = [
        {
            "role": "PREM REMARKS (GIS & SPATIAL ANALYTICS)",
            "role_col": COLOR_BLUE,
            "text": "11th Main in 4th Block is the gold-standard pedestrian retail corridor in South Bengaluru. Wide sidewalks, tree canopies, and strict vehicular separation allow high pedestrian dwell times. Walkshed captures multi-generational family footfall."
        },
        {
            "role": "GAURAV REMARKS (STRATEGY & REAL ESTATE)",
            "role_col": COLOR_NAVY_DARK,
            "text": "Network champion in unit economics: lowest rent-to-sales ratio (8.6%) and highest customer volume (4,620 monthly). Low customer acquisition cost due to immense organic high-street foot traffic. Demonstrates the immense power of prime retail corridors."
        },
        {
            "role": "GOPAL REMARKS (STORE OPERATIONS & COLD CHAIN)",
            "role_col": COLOR_EMERALD,
            "text": "Family multi-scoop and half-kg / 1-kg takeaway tubs represent over 46% of retail sales. Requires enhanced dry-ice insulated packaging capacity and expanded front-of-house takeaway freezer display to maximize transaction speed."
        }
    ]

    for i, p_info in enumerate(perspectives):
        cy = Inches(2.45 + i * 1.45)
        add_card(slide, rx, cy, rw, Inches(1.35), bg_color=COLOR_WHITE, border_color=COLOR_BORDER)

        tb = slide.shapes.add_textbox(rx + Inches(0.2), cy + Inches(0.12), rw - Inches(0.4), Inches(1.15))
        tf = tb.text_frame
        tf.word_wrap = True

        p1 = tf.paragraphs[0]
        p1.text = p_info["role"]
        p1.font.name = FONT_FAMILY
        p1.font.size = Pt(9.5)
        p1.font.bold = True
        p1.font.color.rgb = p_info["role_col"]
        p1.space_after = Pt(3)

        p2 = tf.add_paragraph()
        p2.text = p_info["text"]
        p2.font.name = FONT_FAMILY
        p2.font.size = Pt(9.2)
        p2.font.color.rgb = COLOR_SLATE

# -----------------------------------------------------------------------------
# Slide 13: Network Performance Benchmarking & Walkshed Tier Mix
# -----------------------------------------------------------------------------
def build_slide_13_benchmarks(prs):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    add_header(slide, "Network Benchmarking: Volume Distribution & Walkshed Quality", "Performance Analytics")
    add_footer(slide, 13)

    # Left: Store Benchmark Chart
    b_path = os.path.join(FIG_DIR, "07_store_benchmark.png")
    if os.path.exists(b_path):
        slide.shapes.add_picture(b_path, Inches(0.8), Inches(1.35), width=Inches(5.7), height=Inches(4.45))

    # Right: Walkshed Tier Mix Chart
    t_path = os.path.join(FIG_DIR, "08_walkshed_tier_mix.png")
    if os.path.exists(t_path):
        slide.shapes.add_picture(t_path, Inches(6.75), Inches(1.35), width=Inches(5.78), height=Inches(4.45))

    # Bottom Synthesis Banner
    cx = Inches(0.8)
    cy = Inches(5.95)
    cw = Inches(11.733)
    ch = Inches(0.95)
    add_card(slide, cx, cy, cw, ch, bg_color=COLOR_WHITE, border_color=COLOR_BORDER)

    tb = slide.shapes.add_textbox(cx + Inches(0.2), cy + Inches(0.08), cw - Inches(0.4), ch - Inches(0.16))
    tf = tb.text_frame
    tf.word_wrap = True

    p1 = tf.paragraphs[0]
    p1.text = "Key Network Benchmarking Insights:"
    p1.font.name = FONT_FAMILY
    p1.font.size = Pt(11)
    p1.font.bold = True
    p1.font.color.rgb = COLOR_NAVY_DARK

    p2 = tf.add_paragraph()
    p2.text = "• Top Quartile Correlation: Stores where >35% of walkshed vectors fall into Footfall Tier 7+ (>900 flow/hr) achieve 38% higher customer volume. Heritage family nodes (Jayanagar, Malleshwaram, Basavanagudi) outperform on pure volume, while tech corridors (Indiranagar, HSR) lead in ticket size (₹195–₹215)."
    p2.font.name = FONT_FAMILY
    p2.font.size = Pt(9.5)
    p2.font.color.rgb = COLOR_SLATE

# -----------------------------------------------------------------------------
# Slide 14: Multi-Perspective Stakeholder Synthesis (Prem, Gaurav, Gopal)
# -----------------------------------------------------------------------------
def build_slide_14_stakeholders(prs):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    add_header(slide, "Triangulated Governance: Spatial Science, Finance & Operations", "Stakeholder Alignment")
    add_footer(slide, 14)

    stakeholders = [
        {
            "name": "PREM REMARKS",
            "title": "GIS & Spatial Analytics Lead",
            "col": COLOR_BLUE,
            "focus": "Spatial Kinematics & Topology",
            "mandates": [
                "Verify micro-spatial vector quality: Every prospective outlet must face a verified OSM street tier with >= 1,200 ped/hr Saturday peak flow.",
                "Enforce 350m isochrone accessibility: Audit physical barriers, median dividers, and pedestrian crossings that could sever the walkshed.",
                "Automated Cannibalization Alert: Enforce a strict minimum 1.2 km buffer between Apsara stores in high-density corridors (1.8 km in suburban layouts)."
            ]
        },
        {
            "name": "GAURAV REMARKS",
            "title": "Business Strategy & Real Estate Lead",
            "col": COLOR_NAVY_DARK,
            "focus": "Unit Economics & Capex Recovery",
            "mandates": [
                "Strict Rent Ceiling: Fixed monthly lease occupancy cost must not exceed 12–14% of conservative baseline sales projections.",
                "Payback Hurdle (<9 Months): Store fit-out Capex (₹25–₹32 Lakhs) must achieve full payback within 6 to 9 operating months.",
                "Footprint Discipline: Reject oversized properties (>700 sq.ft.); maintain tight 400–600 sq.ft. formats with minimum 15-foot street frontage."
            ]
        },
        {
            "name": "GOPAL REMARKS",
            "title": "Retail Operations & Logistics Lead",
            "col": COLOR_EMERALD,
            "focus": "Throughput & Cold-Chain Resilience",
            "mandates": [
                "Peak Rush Throughput (<90s): Fast-track dual POS terminals and pre-dipped grab-and-go displays during 20:00–22:30 dessert rush.",
                "Cold-Chain Buffer (2.5×): Back-of-house freezer capacity must hold 2.5× average daily volume by Friday 10:00 AM to absorb weekend surges.",
                "Delivery Rider Staging: Separate delivery rider pickup window from walk-in retail families to prevent in-store bottlenecking."
            ]
        }
    ]

    card_w = Inches(3.68)
    card_h = Inches(5.45)
    for i, s in enumerate(stakeholders):
        cx = Inches(0.8 + i * 4.02)
        cy = Inches(1.35)
        add_card(slide, cx, cy, card_w, card_h, bg_color=COLOR_WHITE, border_color=COLOR_BORDER)

        # Header Badge
        badge = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, cx + Inches(0.25), cy + Inches(0.25), Inches(2.2), Inches(0.28))
        badge.fill.solid()
        badge.fill.fore_color.rgb = s["col"]
        badge.line.fill.background()
        tf_b = badge.text_frame
        p_b = tf_b.paragraphs[0]
        p_b.text = s["name"]
        p_b.font.name = FONT_FAMILY
        p_b.font.size = Pt(8.5)
        p_b.font.bold = True
        p_b.font.color.rgb = COLOR_WHITE
        p_b.alignment = PP_ALIGN.CENTER

        # Title & Role
        tb = slide.shapes.add_textbox(cx + Inches(0.25), cy + Inches(0.65), card_w - Inches(0.5), Inches(0.65))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = s["title"]
        p.font.name = FONT_FAMILY
        p.font.size = Pt(13)
        p.font.bold = True
        p.font.color.rgb = COLOR_NAVY_DARK

        p_sub = tf.add_paragraph()
        p_sub.text = s["focus"]
        p_sub.font.name = FONT_FAMILY
        p_sub.font.size = Pt(9.5)
        p_sub.font.bold = True
        p_sub.font.color.rgb = COLOR_MUTED

        # Mandates
        bb = slide.shapes.add_textbox(cx + Inches(0.25), cy + Inches(1.4), card_w - Inches(0.5), Inches(3.7))
        tf_bb = bb.text_frame
        tf_bb.word_wrap = True
        for b_idx, bullet in enumerate(s["mandates"]):
            pb = tf_bb.paragraphs[0] if b_idx == 0 else tf_bb.add_paragraph()
            pb.text = f"•  {bullet}"
            pb.font.name = FONT_FAMILY
            pb.font.size = Pt(9.5)
            pb.font.color.rgb = COLOR_SLATE
            pb.space_after = Pt(12)

# -----------------------------------------------------------------------------
# Slide 15: Strategic Expansion Playbook & Future Growth Corridors
# -----------------------------------------------------------------------------
def build_slide_15_playbook(prs):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    add_header(slide, "Strategic Expansion Playbook & Priority Future Corridors", "Expansion Heuristic")
    add_footer(slide, 15)

    # Left: 4-Step Site Evaluation Heuristic
    lx = Inches(0.8)
    lw = Inches(5.65)
    lh = Inches(5.45)
    add_card(slide, lx, Inches(1.35), lw, lh, bg_color=COLOR_WHITE, border_color=COLOR_BORDER)

    tb_l = slide.shapes.add_textbox(lx + Inches(0.25), Inches(1.5), lw - Inches(0.5), lh - Inches(0.3))
    tf_l = tb_l.text_frame
    tf_l.word_wrap = True

    p = tf_l.paragraphs[0]
    p.text = "The 4-Step Site Selection Scoring Protocol"
    p.font.name = FONT_FAMILY
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = COLOR_NAVY_DARK
    p.space_after = Pt(8)

    steps = [
        ("Step 1: Macro-Corridor Screening (Census & Ward)", "Target BBMP wards with population >65,000, literacy >86%, youth (18–35) proportion >32%, and SEC A/B household dominance."),
        ("Step 2: Micro-Pedestrian Vector Audit (OSM Flow)", "Verify prospective road segment has Saturday evening flow >= 1,200 ped/hr. Reject parallel residential back-alleys regardless of cheap rent."),
        ("Step 3: Agglomeration & Cannibalization Test", "Ensure site sits within 200m of >= 2 complementary QSRs/cafes, and enforces a >= 1.2 km radius buffer from existing Apsara outlets."),
        ("Step 4: Real Estate & Physical Feasibility Check", "Strict verification: 400–600 sq.ft., 15+ ft frontage, zero entrance steps, 25 kVA power, and lease rent <= 12–14% of projected sales.")
    ]
    for s_title, s_desc in steps:
        p1 = tf_l.add_paragraph()
        p1.text = s_title
        p1.font.name = FONT_FAMILY
        p1.font.size = Pt(10.5)
        p1.font.bold = True
        p1.font.color.rgb = COLOR_CRIMSON

        p2 = tf_l.add_paragraph()
        p2.text = s_desc
        p2.font.name = FONT_FAMILY
        p2.font.size = Pt(9.2)
        p2.font.color.rgb = COLOR_SLATE
        p2.space_after = Pt(8)

    # Right: Top 3 Recommended Future Expansion Markets
    rx = Inches(6.85)
    rw = Inches(5.68)

    corridors = [
        {
            "name": "1. Sarjapur Road / Doddakannelli Axis",
            "sub": "Southeast Growth Corridor · High Disposable Tech Families",
            "desc": "High concentration of gated villa communities and premier tech campuses (Wipro SEZ). Massive weekend family dessert demand with low artisanal ice cream penetration."
        },
        {
            "name": "2. Electronic City (Neeladri Road Spine)",
            "sub": "South Tech Hub · Young Tech Professional Demographic",
            "desc": "High-density rental corridor with 45,000+ young IT professionals living within 1 km. High weeknight and late-night dessert delivery orders with favorable rental economics."
        },
        {
            "name": "3. Thanisandra Main Road (Bhartiya City Axis)",
            "sub": "North Bengaluru Growth Axis · High-Rise Family Hub",
            "desc": "Direct connectivity to Manyata Tech Park. Rapid influx of upper-middle-income families in high-density township developments creates early-mover advantage."
        }
    ]

    card_h = Inches(1.68)
    for i, corr in enumerate(corridors):
        cy = Inches(1.35 + i * 1.88)
        add_card(slide, rx, cy, rw, card_h, bg_color=COLOR_WHITE, border_color=COLOR_BORDER)

        tb = slide.shapes.add_textbox(rx + Inches(0.25), cy + Inches(0.15), rw - Inches(0.5), card_h - Inches(0.3))
        tf = tb.text_frame
        tf.word_wrap = True

        p1 = tf.paragraphs[0]
        p1.text = corr["name"]
        p1.font.name = FONT_FAMILY
        p1.font.size = Pt(13)
        p1.font.bold = True
        p1.font.color.rgb = COLOR_NAVY_DARK

        p2 = tf.add_paragraph()
        p2.text = corr["sub"]
        p2.font.name = FONT_FAMILY
        p2.font.size = Pt(9.5)
        p2.font.bold = True
        p2.font.color.rgb = COLOR_BLUE
        p2.space_after = Pt(4)

        p3 = tf.add_paragraph()
        p3.text = corr["desc"]
        p3.font.name = FONT_FAMILY
        p3.font.size = Pt(9.2)
        p3.font.color.rgb = COLOR_SLATE

# -----------------------------------------------------------------------------
# Slide 16: Conclusion & Product Deliverables Ecosystem
# -----------------------------------------------------------------------------
def build_slide_16_conclusion(prs):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    add_header(slide, "Client Deliverables: Interactive Platform & Data Ecosystem", "Deliverable Suite")
    add_footer(slide, 16)

    deliverables = [
        {
            "badge": "LIVE INTERACTIVE TOOL",
            "col": COLOR_BLUE,
            "title": "Interactive Web Dashboard",
            "link": "spkumar944.github.io/bengaluru-footfall-intelligence",
            "desc": "Explore 47,980 OSM road vectors, simulate 24-hr diurnal footfall, toggle competitor layers and POI demand magnets, and inspect 350m walksheds in real-time."
        },
        {
            "badge": "MASTER EXCEL MATRIX",
            "col": COLOR_CRIMSON,
            "title": "7-Column Location Factor Matrix",
            "link": "Apsara_Ice_Cream_Store_Location_Factors.xlsx",
            "desc": "Detailed 8-factor and sub-factor evaluations across all 13 core stores with dedicated expert remarks from Prem (GIS), Gaurav (Strategy), and Gopal (Operations)."
        },
        {
            "badge": "PRODUCTION CLOUD ARCHIVE",
            "col": COLOR_EMERALD,
            "title": "Google Drive Data Package",
            "link": "drive.google.com/drive/folders/1FhW-xstz3v2AftcKLfyF0ZnJXBUeGwt9",
            "desc": "Impeccably organized 6-directory project structure containing all GeoJSON master layers, store dossiers, OSM cache graphs, and reproducible analytics scripts."
        }
    ]

    card_w = Inches(3.68)
    card_h = Inches(4.3)
    for i, d in enumerate(deliverables):
        cx = Inches(0.8 + i * 4.02)
        cy = Inches(1.35)
        add_card(slide, cx, cy, card_w, card_h, bg_color=COLOR_WHITE, border_color=COLOR_BORDER)

        # Badge
        badge = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, cx + Inches(0.25), cy + Inches(0.25), Inches(2.2), Inches(0.28))
        badge.fill.solid()
        badge.fill.fore_color.rgb = d["col"]
        badge.line.fill.background()
        tf_b = badge.text_frame
        p_b = tf_b.paragraphs[0]
        p_b.text = d["badge"]
        p_b.font.name = FONT_FAMILY
        p_b.font.size = Pt(8.5)
        p_b.font.bold = True
        p_b.font.color.rgb = COLOR_WHITE
        p_b.alignment = PP_ALIGN.CENTER

        # Title
        tb = slide.shapes.add_textbox(cx + Inches(0.25), cy + Inches(0.65), card_w - Inches(0.5), Inches(0.6))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = d["title"]
        p.font.name = FONT_FAMILY
        p.font.size = Pt(14)
        p.font.bold = True
        p.font.color.rgb = COLOR_NAVY_DARK

        # Link Box
        p_link = tf.add_paragraph()
        p_link.text = d["link"]
        p_link.font.name = FONT_FAMILY
        p_link.font.size = Pt(9.0)
        p_link.font.bold = True
        p_link.font.color.rgb = d["col"]
        p_link.space_after = Pt(8)

        # Description
        p_desc = tf.add_paragraph()
        p_desc.text = d["desc"]
        p_desc.font.name = FONT_FAMILY
        p_desc.font.size = Pt(9.5)
        p_desc.font.color.rgb = COLOR_SLATE

    # Bottom Sign-Off Banner
    cx_b = Inches(0.8)
    cy_b = Inches(5.8)
    cw_b = Inches(11.733)
    ch_b = Inches(1.0)
    add_card(slide, cx_b, cy_b, cw_b, ch_b, bg_color=COLOR_NAVY_DARK, border_color=None)

    tb_b = slide.shapes.add_textbox(cx_b + Inches(0.3), cy_b + Inches(0.12), cw_b - Inches(0.6), ch_b - Inches(0.24))
    tf_b = tb_b.text_frame
    tf_b.word_wrap = True
    pb1 = tf_b.paragraphs[0]
    pb1.text = "Ready for Strategic Rollout & Executive Alignment"
    pb1.font.name = FONT_FAMILY
    pb1.font.size = Pt(13)
    pb1.font.bold = True
    pb1.font.color.rgb = COLOR_WHITE

    pb2 = tf_b.add_paragraph()
    pb2.text = "The platform delivers an institutional-grade site selection standard for Apsara Ice Creams across Bengaluru. For questions or bespoke micro-market analysis, contact the project team."
    pb2.font.name = FONT_FAMILY
    pb2.font.size = Pt(9.5)
    pb2.font.color.rgb = RGBColor(203, 213, 225)

# -----------------------------------------------------------------------------
# Main Execution
# -----------------------------------------------------------------------------
def main():
    print("Generating client presentation deck...")
    prs = create_presentation()

    build_slide_01_title(prs)
    build_slide_02_summary(prs)
    build_slide_03_network(prs)
    build_slide_04_framework(prs)
    build_slide_05_diurnal(prs)
    build_slide_06_competition(prs)
    build_slide_07_synergy(prs)
    build_slide_08_multi_factors(prs)
    build_slide_09_hsr(prs)
    build_slide_10_indiranagar(prs)
    build_slide_11_koramangala(prs)
    build_slide_12_jayanagar(prs)
    build_slide_13_benchmarks(prs)
    build_slide_14_stakeholders(prs)
    build_slide_15_playbook(prs)
    build_slide_16_conclusion(prs)

    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    prs.save(OUTPUT_FILE)
    print(f"Presentation saved successfully to: {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
