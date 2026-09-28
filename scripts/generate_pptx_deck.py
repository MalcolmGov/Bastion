#!/usr/bin/env python3
"""
Gold Fields Limited — Digital Flagship & Studio OS Executive Presentation Deck
Prepared by BastionGroup (Benjamin)
"""

import os
import shutil
import pptx
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

# Paths
PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSETS_DIR = os.path.join(PROJECT_DIR, 'public', 'assets')
OUTPUT_DIR = os.path.join(PROJECT_DIR, 'public', 'proposal')
DOCUMENTS_DIR = '/Users/malcolmgovender/Documents'
DOCS_ARTIFACTS_DIR = os.path.join(DOCUMENTS_DIR, 'Goldfields-BastionGroup-Artifacts')

os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(DOCS_ARTIFACTS_DIR, exist_ok=True)

# Colors
NAVY_DARK = RGBColor(6, 29, 50)       # #061D32 (Deepest Midnight Navy)
NAVY_PRIMARY = RGBColor(8, 43, 73)    # #082B49 (Corporate Deep Navy)
NAVY_CARD = RGBColor(11, 48, 82)      # #0B3052 (Slide Card Background)
NAVY_SURFACE = RGBColor(16, 58, 98)   # #103A62 (Lighter Surface)
BORDER_BLUE = RGBColor(26, 75, 117)   # #1A4B75 (Card Border)
BORDER_GOLD = RGBColor(200, 160, 100) # #C8A064 (Accent Border)

GOLD_ACCENT = RGBColor(200, 160, 100) # #C8A064 (Primary Gold)
GOLD_MINERAL = RGBColor(183, 152, 85) # #B79855 (Mineral Gold)
TURQUOISE = RGBColor(0, 229, 192)     # #00E5C0 (Electric Tech/Clean Energy)
GREEN_ESG = RGBColor(31, 110, 67)     # #1F6E43 (Forest Sustainability Green)

TEXT_WHITE = RGBColor(255, 255, 255)
TEXT_MUTED = RGBColor(165, 185, 205)
TEXT_GOLD = RGBColor(240, 228, 206)

# Asset Paths
BASTION_LOGO_WHITE = os.path.join(ASSETS_DIR, 'bastion-logo-white.png')
GOLDFIELDS_EMBLEM = os.path.join(ASSETS_DIR, 'goldfields-emblem.png')
GOLDFIELDS_LOGO = os.path.join(ASSETS_DIR, 'gold-fields-logo.png')
OG_SHARE_CARD = os.path.join(ASSETS_DIR, 'goldfields-og-share.png')
DESIGN_TOKENS_CARD = os.path.join(ASSETS_DIR, 'design-system-tokens.png')
GOVERNANCE_CARD = os.path.join(ASSETS_DIR, 'governance-audit-card.png')

SCREENSHOT_HERO = '/Users/malcolmgovender/.gemini/antigravity/brain/8d5736b7-122d-4e9c-95b8-96b414fb7dfa/.user_uploaded/media_1790576282836.png'
SCREENSHOT_GLOBE = '/Users/malcolmgovender/.gemini/antigravity/brain/8d5736b7-122d-4e9c-95b8-96b414fb7dfa/.user_uploaded/media_1790528693970.png'
SCREENSHOT_CMS = '/Users/malcolmgovender/.gemini/antigravity/brain/8d5736b7-122d-4e9c-95b8-96b414fb7dfa/.user_uploaded/media_1790567902942.png'
SCREENSHOT_H1_CARD = '/Users/malcolmgovender/.gemini/antigravity/brain/8d5736b7-122d-4e9c-95b8-96b414fb7dfa/.user_uploaded/media_1790562287284.png'
SCREENSHOT_LOGIN = '/Users/malcolmgovender/.gemini/antigravity/brain/8d5736b7-122d-4e9c-95b8-96b414fb7dfa/.user_uploaded/media_1790576120565.png'
MINING_HERO = '/Users/malcolmgovender/.gemini/antigravity/brain/8d5736b7-122d-4e9c-95b8-96b414fb7dfa/.user_uploaded/media_1790571551705.png'

TOTAL_SLIDES = 14

def create_deck():
    prs = pptx.Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    def set_bg(slide):
        bg = slide.background
        fill = bg.fill
        fill.solid()
        fill.fore_color.rgb = NAVY_DARK

    def add_header(slide, title_text, category_text):
        # Bastion Logo top left
        if os.path.exists(BASTION_LOGO_WHITE):
            slide.shapes.add_picture(BASTION_LOGO_WHITE, Inches(0.8), Inches(0.4), height=Inches(0.38))
        
        # Divider line
        div = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(2.2), Inches(0.4), Inches(0.02), Inches(0.38))
        div.fill.solid()
        div.fill.fore_color.rgb = BORDER_BLUE
        div.line.fill.background()

        # Partner text
        tx = slide.shapes.add_textbox(Inches(2.35), Inches(0.4), Inches(4.5), Inches(0.38))
        tf = tx.text_frame
        tf.margin_left = tf.margin_top = tf.margin_bottom = tf.margin_right = 0
        p = tf.paragraphs[0]
        p.text = "GOLDFIELDS DIGITAL FLAGSHIP • EXECUTIVE PRESENTATION"
        p.font.name = "Arial"
        p.font.size = Pt(8.5)
        p.font.bold = True
        p.font.color.rgb = TEXT_MUTED

        # Category pill on right
        pill = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(9.8), Inches(0.36), Inches(2.733), Inches(0.42))
        pill.fill.solid()
        pill.fill.fore_color.rgb = NAVY_CARD
        pill.line.color.rgb = GOLD_ACCENT
        pill.line.width = Pt(1)
        ptf = pill.text_frame
        ptf.word_wrap = True
        ptf.margin_top = Inches(0.06)
        pp = ptf.paragraphs[0]
        pp.text = category_text.upper()
        pp.alignment = PP_ALIGN.CENTER
        pp.font.name = "Arial"
        pp.font.size = Pt(8.5)
        pp.font.bold = True
        pp.font.color.rgb = TURQUOISE

        # Main slide title
        tx_title = slide.shapes.add_textbox(Inches(0.8), Inches(0.95), Inches(11.733), Inches(0.65))
        tt = tx_title.text_frame
        tt.margin_left = tt.margin_top = tt.margin_bottom = tt.margin_right = 0
        p_title = tt.paragraphs[0]
        p_title.text = title_text
        p_title.font.name = "Georgia"
        p_title.font.size = Pt(22)
        p_title.font.bold = True
        p_title.font.color.rgb = TEXT_WHITE

    def add_footer(slide, current_idx):
        # Footer line
        line = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(7.0), Inches(11.733), Inches(0.015))
        line.fill.solid()
        line.fill.fore_color.rgb = BORDER_BLUE
        line.line.fill.background()

        # Left metadata - Strictly Benjamin with NO title
        tx_left = slide.shapes.add_textbox(Inches(0.8), Inches(7.05), Inches(9.0), Inches(0.35))
        tl = tx_left.text_frame
        tl.margin_left = tl.margin_top = tl.margin_bottom = tl.margin_right = 0
        pl = tl.paragraphs[0]
        pl.text = "BastionGroup  •  https://bastiongroup.co.za  •  +27 11 778 5800  •  Benjamin"
        pl.font.name = "Arial"
        pl.font.size = Pt(9)
        pl.font.color.rgb = TEXT_MUTED

        # Right page number
        tx_right = slide.shapes.add_textbox(Inches(10.5), Inches(7.05), Inches(2.033), Inches(0.35))
        tr = tx_right.text_frame
        tr.margin_left = tr.margin_top = tr.margin_bottom = tr.margin_right = 0
        pr = tr.paragraphs[0]
        pr.alignment = PP_ALIGN.RIGHT
        pr.text = f"Slide {current_idx:02d} / {TOTAL_SLIDES:02d}"
        pr.font.name = "Arial"
        pr.font.size = Pt(9)
        pr.font.bold = True
        pr.font.color.rgb = GOLD_ACCENT

    def add_card(slide, left, top, width, height, bg=NAVY_CARD, border=BORDER_BLUE, border_width=1):
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        card.fill.solid()
        card.fill.fore_color.rgb = bg
        card.line.color.rgb = border
        card.line.width = Pt(border_width)
        return card

    # =========================================================================
    # SLIDE 1: COVER
    # =========================================================================
    slide1 = prs.slides.add_slide(blank_layout)
    set_bg(slide1)

    # Top brand lockup
    if os.path.exists(BASTION_LOGO_WHITE):
        slide1.shapes.add_picture(BASTION_LOGO_WHITE, Inches(0.8), Inches(0.8), height=Inches(0.65))

    div_c = slide1.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(3.2), Inches(0.85), Inches(0.02), Inches(0.55))
    div_c.fill.solid()
    div_c.fill.fore_color.rgb = BORDER_GOLD
    div_c.line.fill.background()

    if os.path.exists(GOLDFIELDS_EMBLEM):
        slide1.shapes.add_picture(GOLDFIELDS_EMBLEM, Inches(3.45), Inches(0.8), height=Inches(0.65))

    # Pill tag
    pill1 = slide1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.8), Inches(4.8), Inches(0.38))
    pill1.fill.solid()
    pill1.fill.fore_color.rgb = NAVY_CARD
    pill1.line.color.rgb = TURQUOISE
    pill1.line.width = Pt(1)
    p1_tf = pill1.text_frame
    p1_tf.margin_top = Inches(0.05)
    p1_p = p1_tf.paragraphs[0]
    p1_p.text = "CORPORATE COMMUNICATIONS & STAKEHOLDER REPORTING"
    p1_p.alignment = PP_ALIGN.CENTER
    p1_p.font.name = "Arial"
    p1_p.font.size = Pt(8.5)
    p1_p.font.bold = True
    p1_p.font.color.rgb = TURQUOISE

    # Main Title
    tx_t1 = slide1.shapes.add_textbox(Inches(0.8), Inches(2.35), Inches(11.733), Inches(1.8))
    tt1 = tx_t1.text_frame
    tt1.word_wrap = True
    tt1.margin_left = tt1.margin_top = tt1.margin_bottom = tt1.margin_right = 0
    pt1_1 = tt1.paragraphs[0]
    pt1_1.text = "Gold Fields Limited"
    pt1_1.font.name = "Georgia"
    pt1_1.font.size = Pt(40)
    pt1_1.font.bold = True
    pt1_1.font.color.rgb = TEXT_WHITE

    pt1_2 = tt1.add_paragraph()
    pt1_2.text = "Next-Generation Digital Flagship & Studio OS Platform"
    pt1_2.font.name = "Arial"
    pt1_2.font.size = Pt(22)
    pt1_2.font.bold = True
    pt1_2.font.color.rgb = GOLD_ACCENT
    pt1_2.space_before = Pt(8)

    pt1_3 = tt1.add_paragraph()
    pt1_3.text = "Executive Proposal: Engineering Content Autonomy, Live Operational Telemetry, and Next-Generation Stakeholder Experience across Six Global Mining Jurisdictions."
    pt1_3.font.name = "Arial"
    pt1_3.font.size = Pt(12)
    pt1_3.font.color.rgb = TEXT_MUTED
    pt1_3.space_before = Pt(10)

    # Executive Details Card
    add_card(slide1, Inches(0.8), Inches(4.45), Inches(11.733), Inches(1.85), bg=NAVY_CARD, border=BORDER_GOLD, border_width=1.5)
    tx_det = slide1.shapes.add_textbox(Inches(1.1), Inches(4.6), Inches(11.133), Inches(1.55))
    td = tx_det.text_frame
    td.word_wrap = True
    td.margin_left = td.margin_top = td.margin_bottom = td.margin_right = 0
    
    p_meta = td.paragraphs[0]
    p_meta.text = "PARTNERSHIP ENGAGEMENT SPECIFICATION"
    p_meta.font.name = "Arial"
    p_meta.font.size = Pt(9.5)
    p_meta.font.bold = True
    p_meta.font.color.rgb = TURQUOISE

    cols_y = Inches(5.0)
    # Strictly Benjamin with NO title
    items = [
        ("Prepared By", "BastionGroup", "bastiongroup.co.za  |  +27 11 778 5800"),
        ("Presented By", "Benjamin", "BastionGroup"),
        ("Client Recipient", "Gold Fields Limited", "Executive Committee & Corporate Affairs"),
        ("Delivery & Status", "September 2026", "Live Production Verified (goldfields-bay.vercel.app)")
    ]
    col_w = Inches(2.7)
    for idx, (label, val1, val2) in enumerate(items):
        cx = Inches(1.1) + (idx * col_w)
        tx_col = slide1.shapes.add_textbox(cx, cols_y, col_w - Inches(0.2), Inches(1.1))
        tcf = tx_col.text_frame
        tcf.word_wrap = True
        tcf.margin_left = tcf.margin_top = tcf.margin_bottom = tcf.margin_right = 0
        
        plab = tcf.paragraphs[0]
        plab.text = label.upper()
        plab.font.name = "Arial"
        plab.font.size = Pt(8.5)
        plab.font.bold = True
        plab.font.color.rgb = TEXT_MUTED
        
        pv1 = tcf.add_paragraph()
        pv1.text = val1
        pv1.font.name = "Arial"
        pv1.font.size = Pt(13)
        pv1.font.bold = True
        pv1.font.color.rgb = TEXT_WHITE
        pv1.space_before = Pt(3)

        pv2 = tcf.add_paragraph()
        pv2.text = val2
        pv2.font.name = "Arial"
        pv2.font.size = Pt(8.5)
        pv2.font.color.rgb = GOLD_ACCENT
        pv2.space_before = Pt(2)

    # Cover Footer
    tx_cf = slide1.shapes.add_textbox(Inches(0.8), Inches(6.85), Inches(11.733), Inches(0.35))
    tcf_p = tx_cf.text_frame.paragraphs[0]
    tcf_p.text = "STRICTLY CONFIDENTIAL  •  BASTION GROUP EXECUTIVE PRESENTATION  •  GOLDFIELDS 2026"
    tcf_p.font.name = "Arial"
    tcf_p.font.size = Pt(8.5)
    tcf_p.font.bold = True
    tcf_p.font.color.rgb = TEXT_MUTED

    # =========================================================================
    # SLIDE 2: STRATEGIC EXECUTIVE SUMMARY
    # =========================================================================
    slide2 = prs.slides.add_slide(blank_layout)
    set_bg(slide2)
    add_header(slide2, "Strategic Vision: Real-Time Content Autonomy & Investor Intelligence", "Strategic Vision")

    card_l2 = add_card(slide2, Inches(0.8), Inches(1.65), Inches(6.8), Inches(5.15))
    tx_l2 = slide2.shapes.add_textbox(Inches(1.05), Inches(1.85), Inches(6.3), Inches(4.75))
    tl2 = tx_l2.text_frame
    tl2.word_wrap = True
    tl2.margin_left = tl2.margin_top = tl2.margin_bottom = tl2.margin_right = 0

    p = tl2.paragraphs[0]
    p.text = "THE TRANSFORMATION MANDATE"
    p.font.name = "Arial"
    p.font.size = Pt(9.5)
    p.font.bold = True
    p.font.color.rgb = TURQUOISE

    p2 = tl2.add_paragraph()
    p2.text = "Gold Fields Limited operates ten premier mining assets across six sovereign jurisdictions. Yet, corporate communications have historically been throttled by legacy agency turnaround times, static PDF disclosures, and rigid web infrastructure."
    p2.font.name = "Arial"
    p2.font.size = Pt(10)
    p2.font.color.rgb = TEXT_WHITE
    p2.space_before = Pt(4)

    p3 = tl2.add_paragraph()
    p3.text = "BastionGroup has engineered an enterprise-grade digital flagship coupled with the proprietary Studio OS Content Management Engine. This platform equips Gold Fields with four transformative capabilities:"
    p3.font.name = "Arial"
    p3.font.size = Pt(10)
    p3.font.color.rgb = TEXT_MUTED
    p3.space_before = Pt(4)

    pillars = [
        ("01. Content Autonomy Without Code", "Corporate Affairs, PR, and IR teams can compose, update, and publish modular flagship sections in under 60 seconds with zero developer dependency."),
        ("02. Real-Time Operational & Market Telemetry", "Live stock tracking (JSE & NYSE: GFI), operational cost benchmarks (AISC $1,385/oz), and renewable power metrics (54%) streamed dynamically to stakeholders."),
        ("03. Institutional Capital Markets Experience", "Interactive H1 2026 earnings booklets, automated SENS/SEC regulatory feeds, and an AI Knowledge Copilot providing instant, cited answers to analyst queries."),
        ("04. 2030 ESG Accountability & Geospatial Tracking", "Transparent tracking of all six 2030 ESG targets paired with a photorealistic 3D WebGL Earth Globe mapping all 10 operations.")
    ]

    for p_title, p_desc in pillars:
        pt = tl2.add_paragraph()
        pt.text = p_title
        pt.font.name = "Arial"
        pt.font.size = Pt(10.5)
        pt.font.bold = True
        pt.font.color.rgb = GOLD_ACCENT
        pt.space_before = Pt(8)

        pd = tl2.add_paragraph()
        pd.text = p_desc
        pd.font.name = "Arial"
        pd.font.size = Pt(9)
        pd.font.color.rgb = TEXT_WHITE
        pd.space_before = Pt(1)

    stats = [
        ("< 60s", "PUBLISHING VELOCITY", "From editorial draft to global edge CDN propagation"),
        ("0.8s", "GLOBAL PAGE SPEED", "Sub-second LCP benchmark across Johannesburg, London & NY"),
        ("10 Mines", "GEOSPATIAL ASSETS", "Interactive 3D WebGL mapping across 6 sovereign nations"),
        ("100%", "REGULATORY READY", "SENS / SEC compliance with SHA-256 cryptographic audit logs")
    ]
    card_w = Inches(2.22)
    card_h = Inches(1.5)
    for idx, (val, title_s, desc_s) in enumerate(stats):
        col = idx % 2
        row = idx // 2
        sx = Inches(7.85) + (col * Inches(2.43))
        sy = Inches(1.65) + (row * Inches(1.65))
        add_card(slide2, sx, sy, card_w, card_h, bg=NAVY_CARD, border=BORDER_GOLD)

        tx_s = slide2.shapes.add_textbox(sx + Inches(0.15), sy + Inches(0.12), card_w - Inches(0.3), card_h - Inches(0.24))
        stf = tx_s.text_frame
        stf.word_wrap = True
        stf.margin_left = stf.margin_top = stf.margin_bottom = stf.margin_right = 0
        
        sp1 = stf.paragraphs[0]
        sp1.text = val
        sp1.font.name = "Georgia"
        sp1.font.size = Pt(22)
        sp1.font.bold = True
        sp1.font.color.rgb = TURQUOISE

        sp2 = stf.add_paragraph()
        sp2.text = title_s
        sp2.font.name = "Arial"
        sp2.font.size = Pt(8.5)
        sp2.font.bold = True
        sp2.font.color.rgb = TEXT_WHITE
        sp2.space_before = Pt(2)

        sp3 = stf.add_paragraph()
        sp3.text = desc_s
        sp3.font.name = "Arial"
        sp3.font.size = Pt(7.5)
        sp3.font.color.rgb = TEXT_MUTED
        sp3.space_before = Pt(2)

    add_card(slide2, Inches(7.85), Inches(5.1), Inches(4.68), Inches(1.7), bg=NAVY_SURFACE, border=TURQUOISE)
    tx_com = slide2.shapes.add_textbox(Inches(8.05), Inches(5.25), Inches(4.28), Inches(1.4))
    ctf = tx_com.text_frame
    ctf.word_wrap = True
    ctf.margin_left = ctf.margin_top = ctf.margin_bottom = ctf.margin_right = 0

    cp1 = ctf.paragraphs[0]
    cp1.text = "BASTIONGROUP PARTNERSHIP COMMITMENT"
    cp1.font.name = "Arial"
    cp1.font.size = Pt(9)
    cp1.font.bold = True
    cp1.font.color.rgb = GOLD_ACCENT

    cp2 = ctf.add_paragraph()
    cp2.text = "As South Africa's trusted corporate communications and investor reporting provider, BastionGroup considers itself an extension of your executive team. We combine battle-tested JSE blue-chip reporting rigour with bleeding-edge digital engineering."
    cp2.font.name = "Arial"
    cp2.font.size = Pt(9)
    cp2.font.color.rgb = TEXT_WHITE
    cp2.space_before = Pt(4)

    add_footer(slide2, 2)

    # =========================================================================
    # SLIDE 3: VALUE COMPARISON (LEGACY VS NEXT-GEN)
    # =========================================================================
    slide3 = prs.slides.add_slide(blank_layout)
    set_bg(slide3)
    add_header(slide3, "Comparative Advantage: Legacy Constraints vs. Modernized Flagship", "Benchmark Analysis")

    comparisons = [
        ("Content Publishing Cycle", "3 to 5 business days via external web agency; high billable retainers and communications friction.", "< 60 seconds instantaneous publish directly by Corporate Affairs & IR via Studio OS without writing code.", TURQUOISE),
        ("Performance & Global LCP", "4.8s page load speed; monolithic server hosting with frequent crashes during quarterly earnings traffic surges.", "0.8s sub-second response on serverless edge nodes across Johannesburg, London, New York, Perth and Santiago.", TURQUOISE),
        ("Asset & Mine Transparency", "Static 2D image maps and PDF downloads with outdated, disconnected annual disclosures.", "Interactive 3D WebGL Earth Globe with spatial pins, orbital controls, and live mine telemetry drawers.", GOLD_ACCENT),
        ("2030 ESG Disclosures", "Buried within dense 200-page sustainability PDF documents; difficult for rating agencies to verify.", "Real-time 2030 ESG Command Center tracking Decarbonization, Khanyisa Solar, and GISTM tailings safety.", GREEN_ESG),
        ("Stakeholder Search & Q&A", "Basic keyword search returning hundreds of unranked links and static PDF attachments.", "Conversational AI Knowledge Copilot providing instant factual answers with page-level source citations.", TURQUOISE),
        ("Mobile & Social Distribution", "Desktop-first layouts; unformatted URLs on WhatsApp and LinkedIn without rich preview cards.", "100% fluid mobile responsiveness with automated 1200x630px branded Open Graph sharing cards.", GOLD_ACCENT)
    ]

    card_h = Inches(0.78)
    for idx, (metric, legacy, modern, accent) in enumerate(comparisons):
        cy = Inches(1.65) + (idx * Inches(0.85))
        add_card(slide3, Inches(0.8), cy, Inches(11.733), card_h, bg=NAVY_CARD, border=BORDER_BLUE)
        
        tx_m = slide3.shapes.add_textbox(Inches(1.0), cy + Inches(0.12), Inches(2.5), Inches(0.55))
        mtf = tx_m.text_frame
        mtf.word_wrap = True
        mtf.margin_left = mtf.margin_top = mtf.margin_bottom = mtf.margin_right = 0
        mp = mtf.paragraphs[0]
        mp.text = metric
        mp.font.name = "Arial"
        mp.font.size = Pt(11)
        mp.font.bold = True
        mp.font.color.rgb = accent

        tx_l = slide3.shapes.add_textbox(Inches(3.6), cy + Inches(0.1), Inches(3.9), Inches(0.58))
        ltf = tx_l.text_frame
        ltf.word_wrap = True
        ltf.margin_left = ltf.margin_top = ltf.margin_bottom = ltf.margin_right = 0
        lp_tag = ltf.paragraphs[0]
        lp_tag.text = "LEGACY OUTSOURCED WEB"
        lp_tag.font.name = "Arial"
        lp_tag.font.size = Pt(7.5)
        lp_tag.font.bold = True
        lp_tag.font.color.rgb = RGBColor(220, 100, 100)
        lp_val = ltf.add_paragraph()
        lp_val.text = legacy
        lp_val.font.name = "Arial"
        lp_val.font.size = Pt(8.5)
        lp_val.font.color.rgb = TEXT_MUTED
        lp_val.space_before = Pt(1)

        div_arr = slide3.shapes.add_shape(MSO_SHAPE.RIGHT_ARROW, Inches(7.6), cy + Inches(0.28), Inches(0.25), Inches(0.18))
        div_arr.fill.solid()
        div_arr.fill.fore_color.rgb = accent
        div_arr.line.fill.background()

        tx_n = slide3.shapes.add_textbox(Inches(8.0), cy + Inches(0.1), Inches(4.3), Inches(0.58))
        ntf = tx_n.text_frame
        ntf.word_wrap = True
        ntf.margin_left = ntf.margin_top = ntf.margin_bottom = ntf.margin_right = 0
        np_tag = ntf.paragraphs[0]
        np_tag.text = "BASTIONGROUP DIGITAL FLAGSHIP"
        np_tag.font.name = "Arial"
        np_tag.font.size = Pt(7.5)
        np_tag.font.bold = True
        np_tag.font.color.rgb = TURQUOISE
        np_val = ntf.add_paragraph()
        np_val.text = modern
        np_val.font.name = "Arial"
        np_val.font.size = Pt(8.5)
        np_val.font.color.rgb = TEXT_WHITE
        np_val.space_before = Pt(1)

    add_footer(slide3, 3)

    # =========================================================================
    # SLIDE 4: PUBLIC FLAGSHIP EXPERIENCE & CINEMATIC HERO
    # =========================================================================
    slide4 = prs.slides.add_slide(blank_layout)
    set_bg(slide4)
    add_header(slide4, "Public Flagship Experience: Cinematic Brand & Live Telemetry", "Flagship Architecture")

    if os.path.exists(SCREENSHOT_HERO):
        add_card(slide4, Inches(0.8), Inches(1.65), Inches(6.2), Inches(5.15), bg=NAVY_CARD, border=BORDER_GOLD)
        slide4.shapes.add_picture(SCREENSHOT_HERO, Inches(0.95), Inches(1.8), width=Inches(5.9))

        tx_cap = slide4.shapes.add_textbox(Inches(0.95), Inches(5.85), Inches(5.9), Inches(0.8))
        ctf = tx_cap.text_frame
        ctf.word_wrap = True
        ctf.margin_left = ctf.margin_top = ctf.margin_bottom = ctf.margin_right = 0
        cp = ctf.paragraphs[0]
        cp.text = "LIVE PRODUCTION HERO: 'beyond mining.' WITH REAL-TIME TELEMETRY STRIP"
        cp.font.name = "Arial"
        cp.font.size = Pt(8.5)
        cp.font.bold = True
        cp.font.color.rgb = TURQUOISE
        cp2 = ctf.add_paragraph()
        cp2.text = "Showcasing autonomous mining haulage, Khanyisa solar generation, and interactive AI search prompt."
        cp2.font.name = "Arial"
        cp2.font.size = Pt(8)
        cp2.font.color.rgb = TEXT_MUTED

    add_card(slide4, Inches(7.28), Inches(1.65), Inches(5.25), Inches(5.15), bg=NAVY_CARD, border=BORDER_BLUE)
    tx_r4 = slide4.shapes.add_textbox(Inches(7.55), Inches(1.85), Inches(4.7), Inches(4.75))
    tr4 = tx_r4.text_frame
    tr4.word_wrap = True
    tr4.margin_left = tr4.margin_top = tr4.margin_bottom = tr4.margin_right = 0

    p = tr4.paragraphs[0]
    p.text = "FLAGSHIP CAPABILITIES BREAKDOWN"
    p.font.name = "Arial"
    p.font.size = Pt(9.5)
    p.font.bold = True
    p.font.color.rgb = GOLD_ACCENT

    features = [
        ("Cinematic Executive Typography", "Pairs the prestigious Playfair Display serif with Plus Jakarta Sans and high-contrast electric turquoise italic styling ('beyond mining.') reflecting modern industrial technology."),
        ("Real-Time Telemetry Bar", "Dynamic global ticker displaying JSE & NYSE share price, AISC ($1,385/oz cost profile), 54% renewable energy mix, and 2.30Moz annual gold production index."),
        ("One-Touch Stakeholder Routing", "Primary navigation pathways engineered specifically for Institutional Investors, ESG Rating Agencies, Commercial Partners, and Local Mining Communities."),
        ("Instant AI Query Trigger", "Built directly into the flagship header, enabling stakeholders to execute complex natural language research across annual filings with zero friction.")
    ]

    for f_title, f_desc in features:
        fp1 = tr4.add_paragraph()
        fp1.text = f_title
        fp1.font.name = "Arial"
        fp1.font.size = Pt(11)
        fp1.font.bold = True
        fp1.font.color.rgb = TEXT_WHITE
        fp1.space_before = Pt(8)

        fp2 = tr4.add_paragraph()
        fp2.text = f_desc
        fp2.font.name = "Arial"
        fp2.font.size = Pt(9)
        fp2.font.color.rgb = TEXT_MUTED
        fp2.space_before = Pt(2)

    add_footer(slide4, 4)

    # =========================================================================
    # SLIDE 5: AI KNOWLEDGE COPILOT
    # =========================================================================
    slide5 = prs.slides.add_slide(blank_layout)
    set_bg(slide5)
    add_header(slide5, "AI Knowledge Copilot: Verified Natural Language Intelligence", "AI Intelligence")

    add_card(slide5, Inches(0.8), Inches(1.65), Inches(5.6), Inches(5.15), bg=NAVY_CARD, border=BORDER_BLUE)
    tx_l5 = slide5.shapes.add_textbox(Inches(1.05), Inches(1.85), Inches(5.1), Inches(4.75))
    tl5 = tx_l5.text_frame
    tl5.word_wrap = True
    tl5.margin_left = tl5.margin_top = tl5.margin_bottom = tl5.margin_right = 0

    p = tl5.paragraphs[0]
    p.text = "INSTITUTIONAL AI ARCHITECTURE"
    p.font.name = "Arial"
    p.font.size = Pt(9.5)
    p.font.bold = True
    p.font.color.rgb = TURQUOISE

    ai_features = [
        ("Direct Grounding in Primary Filings", "The Copilot does not hallucinate. It is grounded in Gold Fields' Integrated Annual Report, Climate Change Disclosures, and H1 2026 Earnings Booklets."),
        ("Page-Level Verified Citations", "Every response provides direct page number citations with clickable links to the original PDF documents for absolute analyst verification."),
        ("Multi-Jurisdiction Synthesis", "Instantly correlates complex technical metrics across South Africa, Ghana, Australia, Chile, Peru, and Canada in seconds."),
        ("24/7 Capital Markets Readiness", "Provides institutional fund managers in New York, London, and Johannesburg with immediate answers during after-hours market inquiries.")
    ]

    for at, ad in ai_features:
        ap1 = tl5.add_paragraph()
        ap1.text = at
        ap1.font.name = "Arial"
        ap1.font.size = Pt(11)
        ap1.font.bold = True
        ap1.font.color.rgb = GOLD_ACCENT
        ap1.space_before = Pt(8)

        ap2 = tl5.add_paragraph()
        ap2.text = ad
        ap2.font.name = "Arial"
        ap2.font.size = Pt(9)
        ap2.font.color.rgb = TEXT_WHITE
        ap2.space_before = Pt(2)

    add_card(slide5, Inches(6.68), Inches(1.65), Inches(5.85), Inches(5.15), bg=NAVY_SURFACE, border=TURQUOISE, border_width=1.5)
    tx_r5 = slide5.shapes.add_textbox(Inches(6.95), Inches(1.85), Inches(5.3), Inches(4.75))
    tr5 = tx_r5.text_frame
    tr5.word_wrap = True
    tr5.margin_left = tr5.margin_top = tr5.margin_bottom = tr5.margin_right = 0

    rp1 = tr5.paragraphs[0]
    rp1.text = "COPILOT INTERACTION SIMULATION"
    rp1.font.name = "Arial"
    rp1.font.size = Pt(9.5)
    rp1.font.bold = True
    rp1.font.color.rgb = GOLD_ACCENT

    rp2 = tr5.add_paragraph()
    rp2.text = "Investor Query:"
    rp2.font.name = "Arial"
    rp2.font.size = Pt(9)
    rp2.font.bold = True
    rp2.font.color.rgb = TURQUOISE
    rp2.space_before = Pt(8)

    rp3 = tr5.add_paragraph()
    rp3.text = "\"What is Gold Fields' progress on 2030 decarbonization and what is South Deep's solar plant contribution?\""
    rp3.font.name = "Georgia"
    rp3.font.size = Pt(11)
    rp3.font.italic = True
    rp3.font.color.rgb = TEXT_WHITE
    rp3.space_before = Pt(2)

    rp4 = tr5.add_paragraph()
    rp4.text = "Copilot Verified Response:"
    rp4.font.name = "Arial"
    rp4.font.size = Pt(9)
    rp4.font.bold = True
    rp4.font.color.rgb = GOLD_ACCENT
    rp4.space_before = Pt(12)

    rp5 = tr5.add_paragraph()
    rp5.text = "1. Decarbonization Roadmap: Gold Fields is tracking toward a 30% absolute reduction in Scope 1 & 2 emissions by 2030 (from 2016 baseline) and net-zero by 2050.\n\n2. Khanyisa Solar Plant: South Deep's 50MW solar facility generates ~100GWh/year, supplying 24% of the mine's annual electricity and offsetting 110,000 tonnes of CO2e annually.\n\n3. Australian Microgrids: Agnew (hybrid wind/solar/battery) and Granny Smith solar microgrids pushed group renewable electricity generation to 54% in H1 2026."
    rp5.font.name = "Arial"
    rp5.font.size = Pt(9)
    rp5.font.color.rgb = TEXT_WHITE
    rp5.space_before = Pt(4)

    rp6 = tr5.add_paragraph()
    rp6.text = "Verified Citations: [Climate Change Report 2025, pp. 24-28] • [H1 2026 Disclosures, p. 12] • [South Deep Technical Bulletin 2026]"
    rp6.font.name = "Arial"
    rp6.font.size = Pt(8)
    rp6.font.bold = True
    rp6.font.color.rgb = TURQUOISE
    rp6.space_before = Pt(10)

    add_footer(slide5, 5)

    # =========================================================================
    # SLIDE 6: 3D WEBGL OPERATIONS GLOBE (Exact 3D Globe Image)
    # =========================================================================
    slide6 = prs.slides.add_slide(blank_layout)
    set_bg(slide6)
    add_header(slide6, "Geospatial Operations: Interactive 3D WebGL Real-Earth Globe", "3D Operations Globe")

    if os.path.exists(SCREENSHOT_GLOBE):
        add_card(slide6, Inches(0.8), Inches(1.65), Inches(6.2), Inches(5.15), bg=NAVY_CARD, border=BORDER_GOLD)
        slide6.shapes.add_picture(SCREENSHOT_GLOBE, Inches(0.95), Inches(1.8), width=Inches(5.9))

        tx_cg = slide6.shapes.add_textbox(Inches(0.95), Inches(5.85), Inches(5.9), Inches(0.8))
        cg_tf = tx_cg.text_frame
        cg_tf.word_wrap = True
        cg_tf.margin_left = cg_tf.margin_top = cg_tf.margin_bottom = cg_tf.margin_right = 0
        cgp = cg_tf.paragraphs[0]
        cgp.text = "REAL EARTH THREE.JS ORBITAL VISUALIZER (SOUTH DEEP PINNED)"
        cgp.font.name = "Arial"
        cgp.font.size = Pt(8.5)
        cgp.font.bold = True
        cgp.font.color.rgb = TURQUOISE
        cgp2 = cg_tf.add_paragraph()
        cgp2.text = "Orbital rotation, touch & drag interaction, and telemetry drawer mapping across all 10 mining assets."
        cgp2.font.name = "Arial"
        cgp2.font.size = Pt(8)
        cgp2.font.color.rgb = TEXT_MUTED

    add_card(slide6, Inches(7.28), Inches(1.65), Inches(5.25), Inches(5.15), bg=NAVY_CARD, border=BORDER_BLUE)
    tx_r6 = slide6.shapes.add_textbox(Inches(7.55), Inches(1.85), Inches(4.7), Inches(4.75))
    tr6 = tx_r6.text_frame
    tr6.word_wrap = True
    tr6.margin_left = tr6.margin_top = tr6.margin_bottom = tr6.margin_right = 0

    p = tr6.paragraphs[0]
    p.text = "PORTFOLIO VISUALIZATION MATRIX"
    p.font.name = "Arial"
    p.font.size = Pt(9.5)
    p.font.bold = True
    p.font.color.rgb = GOLD_ACCENT

    regions = [
        ("South Africa (South Deep)", "World-class bulk mechanized underground operation in Gauteng; powered by the 50MW Khanyisa solar plant with 70+ year reserve life."),
        ("Ghana (Tarkwa & Damang)", "Cornerstone West African open-pit production hubs delivering steady cash flows and high recovery rates in the Western Region."),
        ("Australia (St Ives, Granny Smith, Agnew, Gruyere)", "World benchmark in renewable mining; Agnew hybrid microgrid delivers >50% renewable electricity with cutting-edge wind and battery storage."),
        ("Chile (Salares Norte)", "High-altitude Atacama open-pit operation featuring pioneering environmental stewardship and Chinchilla preservation."),
        ("Peru (Cerro Corona)", "Copper-gold porphyry operation delivering long-term socio-economic value in the Cajamarca province."),
        ("Canada (Windfall Joint Venture)", "High-grade underground Canadian development asset expanding Gold Fields' jurisdictional footprint in the Americas.")
    ]

    for reg_t, reg_d in regions:
        rp1 = tr6.add_paragraph()
        rp1.text = reg_t
        rp1.font.name = "Arial"
        rp1.font.size = Pt(9.5)
        rp1.font.bold = True
        rp1.font.color.rgb = TEXT_WHITE
        rp1.space_before = Pt(4)

        rp2 = tr6.add_paragraph()
        rp2.text = reg_d
        rp2.font.name = "Arial"
        rp2.font.size = Pt(8)
        rp2.font.color.rgb = TEXT_MUTED
        rp2.space_before = Pt(1)

    add_footer(slide6, 6)

    # =========================================================================
    # SLIDE 7: 2030 ESG SUSTAINABILITY TRACKING COMMAND
    # =========================================================================
    slide7 = prs.slides.add_slide(blank_layout)
    set_bg(slide7)
    add_header(slide7, "2030 ESG Tracking Command: Transparent Sustainability & Decarbonization", "ESG Command Center")

    if os.path.exists(MINING_HERO):
        add_card(slide7, Inches(0.8), Inches(1.65), Inches(5.6), Inches(5.15), bg=NAVY_CARD, border=GREEN_ESG)
        slide7.shapes.add_picture(MINING_HERO, Inches(0.95), Inches(1.8), width=Inches(5.3))

        tx_esg_cap = slide7.shapes.add_textbox(Inches(0.95), Inches(5.5), Inches(5.3), Inches(1.1))
        ec_tf = tx_esg_cap.text_frame
        ec_tf.word_wrap = True
        ec_tf.margin_left = ec_tf.margin_top = ec_tf.margin_bottom = ec_tf.margin_right = 0
        ecp = ec_tf.paragraphs[0]
        ecp.text = "SUSTAINABLE EXTRACTION & ENERGY TRANSITION"
        ecp.font.name = "Arial"
        ecp.font.size = Pt(8.5)
        ecp.font.bold = True
        ecp.font.color.rgb = TURQUOISE
        ecp2 = ec_tf.add_paragraph()
        ecp2.text = "Integrating 50MW Khanyisa solar plant, electric haulage trials, and 100% GISTM tailings dam compliance into public stakeholder telemetry."
        ecp2.font.name = "Arial"
        ecp2.font.size = Pt(8)
        ecp2.font.color.rgb = TEXT_MUTED

    add_card(slide7, Inches(6.68), Inches(1.65), Inches(5.85), Inches(5.15), bg=NAVY_CARD, border=BORDER_BLUE)
    tx_r7 = slide7.shapes.add_textbox(Inches(6.95), Inches(1.85), Inches(5.3), Inches(4.75))
    tr7 = tx_r7.text_frame
    tr7.word_wrap = True
    tr7.margin_left = tr7.margin_top = tr7.margin_bottom = tr7.margin_right = 0

    p = tr7.paragraphs[0]
    p.text = "THE 6 STRATEGIC 2030 SUSTAINABILITY TARGETS"
    p.font.name = "Arial"
    p.font.size = Pt(9.5)
    p.font.bold = True
    p.font.color.rgb = GOLD_ACCENT

    esg_pillars = [
        ("01. Decarbonization & Net-Zero 2050", "30% absolute Scope 1 & 2 emissions reduction by 2030; net-zero emissions target by 2050 aligned to Paris Agreement."),
        ("02. Renewable Power Leadership", "50MW Khanyisa solar facility at South Deep; cutting-edge microgrids in Australia pushing renewables to 54% of global mix."),
        ("03. Water Stewardship", "Achieved 80% recycled and reused water benchmark across all operational processing facilities, protecting local catchments."),
        ("04. Tailings Dam Safety (GISTM)", "100% compliance with the Global Industry Standard on Tailings Management (GISTM) across all active and inactive storage facilities."),
        ("05. Gender Diversity & Inclusion", "25% female workforce participation target by 2030 with specialized operational training and executive development."),
        ("06. Host Community Value Creation", "Over 80% local procurement spend and continuous trust distributions to host community foundations.")
    ]

    for ep_t, ep_d in esg_pillars:
        ep1 = tr7.add_paragraph()
        ep1.text = ep_t
        ep1.font.name = "Arial"
        ep1.font.size = Pt(9.5)
        ep1.font.bold = True
        ep1.font.color.rgb = TEXT_WHITE
        ep1.space_before = Pt(4)

        ep2 = tr7.add_paragraph()
        ep2.text = ep_d
        ep2.font.name = "Arial"
        ep2.font.size = Pt(8)
        ep2.font.color.rgb = TEXT_MUTED
        ep2.space_before = Pt(1)

    add_footer(slide7, 7)

    # =========================================================================
    # SLIDE 8: INVESTOR RELATIONS & REGULATORY HUB (With Live H1 2026 Card)
    # =========================================================================
    slide8 = prs.slides.add_slide(blank_layout)
    set_bg(slide8)
    add_header(slide8, "Investor Relations Hub: Institutional Disclosures & Regulatory Speed", "Capital Markets Hub")

    # Left: Real H1 2026 Disclosure Card Screenshot
    if os.path.exists(SCREENSHOT_H1_CARD):
        add_card(slide8, Inches(0.8), Inches(1.65), Inches(4.5), Inches(5.15), bg=NAVY_CARD, border=BORDER_GOLD)
        slide8.shapes.add_picture(SCREENSHOT_H1_CARD, Inches(0.95), Inches(1.8), width=Inches(4.2))

        tx_h1_cap = slide8.shapes.add_textbox(Inches(0.95), Inches(5.6), Inches(4.2), Inches(1.0))
        h1_tf = tx_h1_cap.text_frame
        h1_tf.word_wrap = True
        h1_tf.margin_left = h1_tf.margin_top = h1_tf.margin_bottom = h1_tf.margin_right = 0
        h1p = h1_tf.paragraphs[0]
        h1p.text = "OFFICIAL H1 2026 RESULTS PORTAL INTEGRATION"
        h1p.font.name = "Arial"
        h1p.font.size = Pt(8.5)
        h1p.font.bold = True
        h1p.font.color.rgb = TURQUOISE
        h1p2 = h1_tf.add_paragraph()
        h1p2.text = "Live telemetry showing 1.06Moz attributable gold production, 151koz South Deep output, and one-click 3.8MB PDF booklet downloads."
        h1p2.font.name = "Arial"
        h1p2.font.size = Pt(8)
        h1p2.font.color.rgb = TEXT_MUTED

    # Right: 2 Structured Columns for IR Capabilities
    right_ir_cards = [
        ("01. REGULATORY SENS & SEC WIRE", [
            ("Automated SENS Syndication", "Instant synchronization with Johannesburg Stock Exchange (JSE SENS) regulatory announcements feed."),
            ("SEC Form 6-K Broadcast", "Automated distribution for NYSE American Depositary Receipt (ADR) filings compliance."),
            ("Synchronized Disclosures", "Price-sensitive announcements dispatched instantly to registered institutional distribution lists.")
        ], TURQUOISE),
        ("02. SHAREHOLDER VALUE ENGINE", [
            ("Total Return Calculator", "Historical share performance, capital gains, and dividend reinvestment visualizer."),
            ("Capital Allocation Tracking", "Transparent visibility into growth capex, sustaining capex, and dividend payouts."),
            ("Financial Event Calendar", "One-click .ics calendar synchronization for AGM, earnings webcasts, and analyst roadshows.")
        ], GREEN_ESG)
    ]

    rw = Inches(3.35)
    rh = Inches(5.15)
    for idx, (col_title, items_list, accent_col) in enumerate(right_ir_cards):
        rx = Inches(5.55) + (idx * Inches(3.6))
        add_card(slide8, rx, Inches(1.65), rw, rh, bg=NAVY_CARD, border=accent_col)

        tx_rc = slide8.shapes.add_textbox(rx + Inches(0.18), Inches(1.85), rw - Inches(0.36), rh - Inches(0.4))
        rtf = tx_rc.text_frame
        rtf.word_wrap = True
        rtf.margin_left = rtf.margin_top = rtf.margin_bottom = rtf.margin_right = 0

        p1 = rtf.paragraphs[0]
        p1.text = col_title
        p1.font.name = "Arial"
        p1.font.size = Pt(9.5)
        p1.font.bold = True
        p1.font.color.rgb = accent_col

        for it, idesc in items_list:
            ip1 = rtf.add_paragraph()
            ip1.text = it
            ip1.font.name = "Arial"
            ip1.font.size = Pt(10.5)
            ip1.font.bold = True
            ip1.font.color.rgb = TEXT_WHITE
            ip1.space_before = Pt(10)

            ip2 = rtf.add_paragraph()
            ip2.text = idesc
            ip2.font.name = "Arial"
            ip2.font.size = Pt(8)
            ip2.font.color.rgb = TEXT_MUTED
            ip2.space_before = Pt(2)

    add_footer(slide8, 8)

    # =========================================================================
    # SLIDE 9: STUDIO OS HEADLESS CMS & VISUAL BUILDER (Full Builder Screenshot)
    # =========================================================================
    slide9 = prs.slides.add_slide(blank_layout)
    set_bg(slide9)
    add_header(slide9, "Studio OS CMS: Visual Block Builder & In-House Content Autonomy", "Studio OS CMS")

    if os.path.exists(SCREENSHOT_CMS):
        add_card(slide9, Inches(0.8), Inches(1.65), Inches(6.2), Inches(5.15), bg=NAVY_CARD, border=BORDER_GOLD)
        slide9.shapes.add_picture(SCREENSHOT_CMS, Inches(0.95), Inches(1.8), width=Inches(5.9))

        tx_cms_cap = slide9.shapes.add_textbox(Inches(0.95), Inches(5.85), Inches(5.9), Inches(0.8))
        cms_tf = tx_cms_cap.text_frame
        cms_tf.word_wrap = True
        cms_tf.margin_left = cms_tf.margin_top = cms_tf.margin_bottom = cms_tf.margin_right = 0
        cmsp = cms_tf.paragraphs[0]
        cmsp.text = "STUDIO OS LIVE VISUAL BUILDER: REARRANGE, DUPLICATE & EDIT SECTIONS"
        cmsp.font.name = "Arial"
        cmsp.font.size = Pt(8.5)
        cmsp.font.bold = True
        cmsp.font.color.rgb = TURQUOISE
        cmsp2 = cms_tf.add_paragraph()
        cmsp2.text = "Visual block canvas allowing communications teams to manage hero copy, stats, and press releases."
        cmsp2.font.name = "Arial"
        cmsp2.font.size = Pt(8)
        cmsp2.font.color.rgb = TEXT_MUTED

    add_card(slide9, Inches(7.28), Inches(1.65), Inches(5.25), Inches(5.15), bg=NAVY_CARD, border=BORDER_BLUE)
    tx_r9 = slide9.shapes.add_textbox(Inches(7.55), Inches(1.85), Inches(4.7), Inches(4.75))
    tr9 = tx_r9.text_frame
    tr9.word_wrap = True
    tr9.margin_left = tr9.margin_top = tr9.margin_bottom = tr9.margin_right = 0

    p = tr9.paragraphs[0]
    p.text = "STUDIO OS CAPABILITIES FOR GOLD FIELDS"
    p.font.name = "Arial"
    p.font.size = Pt(9.5)
    p.font.bold = True
    p.font.color.rgb = GOLD_ACCENT

    cms_feats = [
        ("Drag-and-Drop Modular Canvas", "Corporate teams can reorder, insert, or retire modular blocks (Hero, Stat Counters, Video Reels, Executive Quotes) without touching source code."),
        ("Pre-Approved Design Guardrails", "Brand typography, palette tokens, and layout ratios are hardcoded into components, preventing unauthorized visual drift."),
        ("Instant Responsive Viewports", "Toggle live simulation across iPhone (375px), iPad (768px), Laptop (1440px), and 4K displays before hitting publish."),
        ("Encrypted Draft Previews", "Generate secure, shareable draft links with 24-hour expiration tokens for executive committee and legal review before public deployment.")
    ]

    for ct, cd in cms_feats:
        cp1 = tr9.add_paragraph()
        cp1.text = ct
        cp1.font.name = "Arial"
        cp1.font.size = Pt(11)
        cp1.font.bold = True
        cp1.font.color.rgb = TEXT_WHITE
        cp1.space_before = Pt(8)

        cp2 = tr9.add_paragraph()
        cp2.text = cd
        cp2.font.name = "Arial"
        cp2.font.size = Pt(9)
        cp2.font.color.rgb = TEXT_MUTED
        cp2.space_before = Pt(2)

    add_footer(slide9, 9)

    # =========================================================================
    # SLIDE 10: GOVERNANCE & CRYPTOGRAPHIC AUDIT TRAIL (Dedicated Graphic)
    # =========================================================================
    slide10 = prs.slides.add_slide(blank_layout)
    set_bg(slide10)
    add_header(slide10, "Editorial Governance: Multi-Tier Approval Workflows & Audit Trail", "Regulatory Governance")

    # Left: Governance Audit Graphic
    if os.path.exists(GOVERNANCE_CARD):
        add_card(slide10, Inches(0.8), Inches(1.65), Inches(5.6), Inches(5.15), bg=NAVY_CARD, border=BORDER_GOLD)
        slide10.shapes.add_picture(GOVERNANCE_CARD, Inches(0.95), Inches(1.8), width=Inches(5.3))

        tx_gov_cap = slide10.shapes.add_textbox(Inches(0.95), Inches(5.85), Inches(5.3), Inches(0.8))
        gov_tf = tx_gov_cap.text_frame
        gov_tf.word_wrap = True
        gov_tf.margin_left = gov_tf.margin_top = gov_tf.margin_bottom = gov_tf.margin_right = 0
        gp = gov_tf.paragraphs[0]
        gp.text = "IMMUTABLE AUDIT LOG & 4-TIER REGULATORY STAGES"
        gp.font.name = "Arial"
        gp.font.size = Pt(8.5)
        gp.font.bold = True
        gp.font.color.rgb = TURQUOISE
        gp2 = gov_tf.add_paragraph()
        gp2.text = "Full cryptographic SHA-256 integrity tracking and market embargo synchronization."
        gp2.font.name = "Arial"
        gp2.font.size = Pt(8)
        gp2.font.color.rgb = TEXT_MUTED

    add_card(slide10, Inches(6.68), Inches(1.65), Inches(5.85), Inches(5.15), bg=NAVY_CARD, border=BORDER_BLUE)
    tx_r10 = slide10.shapes.add_textbox(Inches(6.95), Inches(1.85), Inches(5.3), Inches(4.75))
    tr10 = tx_r10.text_frame
    tr10.word_wrap = True
    tr10.margin_left = tr10.margin_top = tr10.margin_bottom = tr10.margin_right = 0

    rp = tr10.paragraphs[0]
    rp.text = "CRYPTOGRAPHIC AUDIT & COMPLIANCE SPECIFICATIONS"
    rp.font.name = "Arial"
    rp.font.size = Pt(9.5)
    rp.font.bold = True
    rp.font.color.rgb = GOLD_ACCENT

    audit_points = [
        ("Immutable SHA-256 Revision History", "Every edit, review status change, and publication event is permanently hashed with user identity, IP address, and millisecond timestamp."),
        ("Instant 3-Second Rollback", "In the event of an urgent market correction or regulatory error, any prior page version can be restored globally in under 3 seconds."),
        ("Market Embargo Synchronization", "Content releases can be synchronized to the exact second with JSE market opening (09:00 SAST) or NYSE trading halts."),
        ("Full JSE / SEC Compliance Export", "Generate complete compliance audit packets detailing who authored, reviewed, and approved every sensitive disclosure.")
    ]

    for at, ad in audit_points:
        ap1 = tr10.add_paragraph()
        ap1.text = at
        ap1.font.name = "Arial"
        ap1.font.size = Pt(11)
        ap1.font.bold = True
        ap1.font.color.rgb = TURQUOISE
        ap1.space_before = Pt(8)

        ap2 = tr10.add_paragraph()
        ap2.text = ad
        ap2.font.name = "Arial"
        ap2.font.size = Pt(9)
        ap2.font.color.rgb = TEXT_WHITE
        ap2.space_before = Pt(2)

    add_footer(slide10, 10)

    # =========================================================================
    # SLIDE 11: LIVING DESIGN SYSTEM & TOKEN SANDBOX (Dedicated Tokens Graphic)
    # =========================================================================
    slide11 = prs.slides.add_slide(blank_layout)
    set_bg(slide11)
    add_header(slide11, "Living Design System: Corporate Tokens & WCAG AAA Accessibility", "Design System")

    if os.path.exists(DESIGN_TOKENS_CARD):
        add_card(slide11, Inches(0.8), Inches(1.65), Inches(6.2), Inches(5.15), bg=NAVY_CARD, border=BORDER_GOLD)
        slide11.shapes.add_picture(DESIGN_TOKENS_CARD, Inches(0.95), Inches(1.8), width=Inches(5.9))

        tx_ds_cap = slide11.shapes.add_textbox(Inches(0.95), Inches(5.85), Inches(5.9), Inches(0.8))
        ds_tf = tx_ds_cap.text_frame
        ds_tf.word_wrap = True
        ds_tf.margin_left = ds_tf.margin_top = ds_tf.margin_bottom = ds_tf.margin_right = 0
        dsp = ds_tf.paragraphs[0]
        dsp.text = "LIVING DESIGN TOKENS & WCAG AAA ACCESSIBILITY VERIFICATION"
        dsp.font.name = "Arial"
        dsp.font.size = Pt(8.5)
        dsp.font.bold = True
        dsp.font.color.rgb = TURQUOISE
        dsp2 = ds_tf.add_paragraph()
        dsp2.text = "Harmonizing corporate color tokens, WCAG AAA contrast compliance, and typography scale."
        dsp2.font.name = "Arial"
        dsp2.font.size = Pt(8)
        dsp2.font.color.rgb = TEXT_MUTED

    add_card(slide11, Inches(7.28), Inches(1.65), Inches(5.25), Inches(5.15), bg=NAVY_CARD, border=BORDER_BLUE)
    tx_r11 = slide11.shapes.add_textbox(Inches(7.55), Inches(1.85), Inches(4.7), Inches(4.75))
    tr11 = tx_r11.text_frame
    tr11.word_wrap = True
    tr11.margin_left = tr11.margin_top = tr11.margin_bottom = tr11.margin_right = 0

    p = tr11.paragraphs[0]
    p.text = "BRAND IDENTITY & COLOR ARCHITECTURE"
    p.font.name = "Arial"
    p.font.size = Pt(9.5)
    p.font.bold = True
    p.font.color.rgb = GOLD_ACCENT

    palettes = [
        ("Deep Navy (#061D32 / #082B49)", "The anchor of Gold Fields' institutional stature. Conveys corporate governance, bedrock stability, and enduring longevity."),
        ("Mineral Gold (#B79855 / #C8A064)", "Honors 130+ years of precious metal mining heritage while maintaining executive sophistication without garish brass tones."),
        ("Horizon Turquoise (#00E5C0)", "Represents clean energy transition, decarbonization, and future-forward technology ('beyond mining.')."),
        ("Forest Green (#1F6E43)", "Reflects land rehabilitation, water stewardship, biodiversity protection, and sustainable mining standards."),
        ("WCAG 2.1 AAA Accessibility", "All text and interactive controls maintain certified contrast ratios exceeding 7:1 for seamless reading by institutional stakeholders worldwide.")
    ]

    for pt, pd in palettes:
        pp1 = tr11.add_paragraph()
        pp1.text = pt
        pp1.font.name = "Arial"
        pp1.font.size = Pt(10.5)
        pp1.font.bold = True
        pp1.font.color.rgb = TEXT_WHITE
        pp1.space_before = Pt(6)

        pp2 = tr11.add_paragraph()
        pp2.text = pd
        pp2.font.name = "Arial"
        pp2.font.size = Pt(8.5)
        pp2.font.color.rgb = TEXT_MUTED
        pp2.space_before = Pt(1)

    add_footer(slide11, 11)

    # =========================================================================
    # SLIDE 12: MOBILE-FIRST ARCHITECTURE & SOCIAL SHARING ENGINE
    # =========================================================================
    slide12 = prs.slides.add_slide(blank_layout)
    set_bg(slide12)
    add_header(slide12, "Multi-Channel Distribution: Mobile Architecture & Social Sharing Engine", "Social & Mobile Engine")

    if os.path.exists(OG_SHARE_CARD):
        add_card(slide12, Inches(0.8), Inches(1.65), Inches(6.2), Inches(5.15), bg=NAVY_CARD, border=BORDER_GOLD)
        slide12.shapes.add_picture(OG_SHARE_CARD, Inches(0.95), Inches(1.8), width=Inches(5.9))

        tx_og_cap = slide12.shapes.add_textbox(Inches(0.95), Inches(5.85), Inches(5.9), Inches(0.8))
        og_tf = tx_og_cap.text_frame
        og_tf.word_wrap = True
        og_tf.margin_left = og_tf.margin_top = og_tf.margin_bottom = og_tf.margin_right = 0
        ogp = og_tf.paragraphs[0]
        ogp.text = "OFFICIAL 1200x630 OPEN GRAPH SOCIAL SHARING CARD (WHATSAPP / LINKEDIN)"
        ogp.font.name = "Arial"
        ogp.font.size = Pt(8.5)
        ogp.font.bold = True
        ogp.font.color.rgb = TURQUOISE
        ogp2 = og_tf.add_paragraph()
        ogp2.text = "Featuring official Gold Fields lion emblem, gold borders, and real-time operational metrics."
        ogp2.font.name = "Arial"
        ogp2.font.size = Pt(8)
        ogp2.font.color.rgb = TEXT_MUTED

    add_card(slide12, Inches(7.28), Inches(1.65), Inches(5.25), Inches(5.15), bg=NAVY_CARD, border=BORDER_BLUE)
    tx_r12 = slide12.shapes.add_textbox(Inches(7.55), Inches(1.85), Inches(4.7), Inches(4.75))
    tr12 = tx_r12.text_frame
    tr12.word_wrap = True
    tr12.margin_left = tr12.margin_top = tr12.margin_bottom = tr12.margin_right = 0

    p = tr12.paragraphs[0]
    p.text = "MULTI-CHANNEL DISTRIBUTION ADVANTAGES"
    p.font.name = "Arial"
    p.font.size = Pt(9.5)
    p.font.bold = True
    p.font.color.rgb = GOLD_ACCENT

    social_feats = [
        ("High-Impact WhatsApp Previews", "When executives, journalists, or analysts share Gold Fields releases on WhatsApp, recipients see an elegant 1200x630px branded visual card instead of a plain link."),
        ("100% Fluid Mobile Responsiveness", "Engineered to perform flawlessly from 360px smartphones through tablets up to 4K executive boardroom displays with zero horizontal scroll."),
        ("Complete Favicon & App Icon Suite", "Includes multi-resolution PNGs, SVGs, and Apple Touch Icons (180x180) for home-screen bookmarking by executive leadership."),
        ("Search Engine Structured Data", "Full Schema.org JSON-LD integration ensures Google News, Bloomberg, and Reuters index earnings announcements with rich corporate snippets.")
    ]

    for st, sd in social_feats:
        sp1 = tr12.add_paragraph()
        sp1.text = st
        sp1.font.name = "Arial"
        sp1.font.size = Pt(11)
        sp1.font.bold = True
        sp1.font.color.rgb = TEXT_WHITE
        sp1.space_before = Pt(8)

        sp2 = tr12.add_paragraph()
        sp2.text = sd
        sp2.font.name = "Arial"
        sp2.font.size = Pt(9)
        sp2.font.color.rgb = TEXT_MUTED
        sp2.space_before = Pt(2)

    add_footer(slide12, 12)

    # =========================================================================
    # SLIDE 13: ENTERPRISE TOPOLOGY & PRODUCTION ACCESS
    # =========================================================================
    slide13 = prs.slides.add_slide(blank_layout)
    set_bg(slide13)
    add_header(slide13, "Infrastructure & Live Access: Serverless Edge & Studio OS Credentials", "Infrastructure & Access")

    if os.path.exists(SCREENSHOT_LOGIN):
        add_card(slide13, Inches(0.8), Inches(1.65), Inches(6.2), Inches(5.15), bg=NAVY_CARD, border=BORDER_GOLD)
        slide13.shapes.add_picture(SCREENSHOT_LOGIN, Inches(0.95), Inches(1.8), width=Inches(5.9))

        tx_log_cap = slide13.shapes.add_textbox(Inches(0.95), Inches(5.85), Inches(5.9), Inches(0.8))
        lg_tf = tx_log_cap.text_frame
        lg_tf.word_wrap = True
        lg_tf.margin_left = lg_tf.margin_top = lg_tf.margin_bottom = lg_tf.margin_right = 0
        lgp = lg_tf.paragraphs[0]
        lgp.text = "STUDIO OS EXECUTIVE LOGIN GATEWAY (DEPLOYED AT /admin/login)"
        lgp.font.name = "Arial"
        lgp.font.size = Pt(8.5)
        lgp.font.bold = True
        lgp.font.color.rgb = TURQUOISE
        lgp2 = lg_tf.add_paragraph()
        lgp2.text = "Bank-grade authentication with encrypted session cookies and automated serverless failover."
        lgp2.font.name = "Arial"
        lgp2.font.size = Pt(8)
        lgp2.font.color.rgb = TEXT_MUTED

    add_card(slide13, Inches(7.28), Inches(1.65), Inches(5.25), Inches(5.15), bg=NAVY_CARD, border=BORDER_BLUE)
    tx_r13 = slide13.shapes.add_textbox(Inches(7.55), Inches(1.85), Inches(4.7), Inches(4.75))
    tr13 = tx_r13.text_frame
    tr13.word_wrap = True
    tr13.margin_left = tr13.margin_top = tr13.margin_bottom = tr13.margin_right = 0

    p = tr13.paragraphs[0]
    p.text = "VERIFIED LIVE ACCESS & CREDENTIALS"
    p.font.name = "Arial"
    p.font.size = Pt(9.5)
    p.font.bold = True
    p.font.color.rgb = GOLD_ACCENT

    add_card(slide13, Inches(7.5), Inches(2.2), Inches(4.8), Inches(1.5), bg=NAVY_SURFACE, border=TURQUOISE)
    tx_box = slide13.shapes.add_textbox(Inches(7.65), Inches(2.3), Inches(4.5), Inches(1.3))
    btf = tx_box.text_frame
    btf.word_wrap = True
    btf.margin_left = btf.margin_top = btf.margin_bottom = btf.margin_right = 0
    bp1 = btf.paragraphs[0]
    bp1.text = "PRODUCTION ENVIRONMENT DIRECTORY"
    bp1.font.name = "Arial"
    bp1.font.size = Pt(8)
    bp1.font.bold = True
    bp1.font.color.rgb = TURQUOISE
    
    bp2 = btf.add_paragraph()
    bp2.text = "Public Flagship: https://goldfields-bay.vercel.app\nStudio OS CMS: https://goldfields-bay.vercel.app/admin/login\nLogin Email: admin@goldfields.com\nTemporary Access Key: GoldFields2026!"
    bp2.font.name = "Courier New"
    bp2.font.size = Pt(9)
    bp2.font.color.rgb = TEXT_WHITE
    bp2.space_before = Pt(3)

    infra_feats = [
        ("Next.js 15.5+ App Router Architecture", "Built on React 19 Server Components with zero legacy JavaScript bloat, guaranteeing instant first-paint performance."),
        ("Vercel Global Edge Network", "Deployed across 300+ edge points-of-presence globally, delivering sub-100ms response times worldwide with automatic DDoS mitigation."),
        ("Distributed LibSQL / SQLite Engine", "ACID compliant transactional storage with automated serverless initialization and encrypted session cookies.")
    ]

    for it, idesc in infra_feats:
        ip1 = tr13.add_paragraph()
        ip1.text = it
        ip1.font.name = "Arial"
        ip1.font.size = Pt(10)
        ip1.font.bold = True
        ip1.font.color.rgb = TEXT_WHITE
        ip1.space_before = Pt(10)

        ip2 = tr13.add_paragraph()
        ip2.text = idesc
        ip2.font.name = "Arial"
        ip2.font.size = Pt(8.5)
        ip2.font.color.rgb = TEXT_MUTED
        ip2.space_before = Pt(2)

    add_footer(slide13, 13)

    # =========================================================================
    # SLIDE 14: STRATEGIC ROADMAP, BASTION PARTNERSHIP & SIGN-OFF (Strictly Benjamin, No Title)
    # =========================================================================
    slide14 = prs.slides.add_slide(blank_layout)
    set_bg(slide14)
    add_header(slide14, "Strategic Horizon: Innovation Roadmap & Platform Handover", "Handover & Sign-Off")

    # Top Half: Innovation Roadmap
    add_card(slide14, Inches(0.8), Inches(1.65), Inches(11.733), Inches(2.2), bg=NAVY_CARD, border=BORDER_BLUE)
    tx_rd = slide14.shapes.add_textbox(Inches(1.05), Inches(1.8), Inches(11.2), Inches(1.9))
    rtf = tx_rd.text_frame
    rtf.word_wrap = True
    rtf.margin_left = rtf.margin_top = rtf.margin_bottom = rtf.margin_right = 0

    rp = rtf.paragraphs[0]
    rp.text = "ONGOING INNOVATION: PHASE 2 & 3 STRATEGIC ROADMAP"
    rp.font.name = "Arial"
    rp.font.size = Pt(9.5)
    rp.font.bold = True
    rp.font.color.rgb = TURQUOISE

    rx1 = Inches(1.05)
    rx2 = Inches(6.8)
    
    # Phase 2
    tx_p2 = slide14.shapes.add_textbox(rx1, Inches(2.15), Inches(5.4), Inches(1.5))
    p2tf = tx_p2.text_frame
    p2tf.word_wrap = True
    p2tf.margin_left = p2tf.margin_top = p2tf.margin_bottom = p2tf.margin_right = 0
    p2p1 = p2tf.paragraphs[0]
    p2p1.text = "PHASE 02: LIVE SCADA & IOT TELEMETRY"
    p2p1.font.name = "Arial"
    p2p1.font.size = Pt(10.5)
    p2p1.font.bold = True
    p2p1.font.color.rgb = GOLD_ACCENT
    p2p2 = p2tf.add_paragraph()
    p2p2.text = "Direct SCADA connection with Khanyisa solar plant and Australian microgrid sensors, streaming live renewable MWh generation and verified carbon offset counters directly to the flagship."
    p2p2.font.name = "Arial"
    p2p2.font.size = Pt(8.5)
    p2p2.font.color.rgb = TEXT_WHITE
    p2p2.space_before = Pt(3)

    # Phase 3
    tx_p3 = slide14.shapes.add_textbox(rx2, Inches(2.15), Inches(5.4), Inches(1.5))
    p3tf = tx_p3.text_frame
    p3tf.word_wrap = True
    p3tf.margin_left = p3tf.margin_top = p3tf.margin_bottom = p3tf.margin_right = 0
    p3p1 = p3tf.paragraphs[0]
    p3p1.text = "PHASE 03: MULTI-LANGUAGE AI LOCALIZATION"
    p3p1.font.name = "Arial"
    p3p1.font.size = Pt(10.5)
    p3p1.font.bold = True
    p3p1.font.color.rgb = TURQUOISE
    p3p2 = p3tf.add_paragraph()
    p3p2.text = "Automated neural translation into Spanish (for Salares Norte and Cerro Corona stakeholders) and Canadian French, seamlessly managed and approved through Studio OS workflows."
    p3p2.font.name = "Arial"
    p3p2.font.size = Pt(8.5)
    p3p2.font.color.rgb = TEXT_WHITE
    p3p2.space_before = Pt(3)

    # Bottom Half: Formal Acceptance & Signatures
    add_card(slide14, Inches(0.8), Inches(4.05), Inches(11.733), Inches(2.75), bg=NAVY_CARD, border=BORDER_GOLD, border_width=1.5)
    tx_so = slide14.shapes.add_textbox(Inches(1.05), Inches(4.2), Inches(11.2), Inches(0.6))
    sotf = tx_so.text_frame
    sotf.word_wrap = True
    sotf.margin_left = sotf.margin_top = sotf.margin_bottom = sotf.margin_right = 0
    sop = sotf.paragraphs[0]
    sop.text = "FORMAL PLATFORM ACCEPTANCE & DELIVERY HANDOVER"
    sop.font.name = "Arial"
    sop.font.size = Pt(9.5)
    sop.font.bold = True
    sop.font.color.rgb = GOLD_ACCENT
    sop2 = sotf.add_paragraph()
    sop2.text = "By executing this platform handover document, Gold Fields Limited acknowledges the successful engineering and deployment of the Next-Generation Digital Flagship and Studio OS CMS in accordance with the enterprise delivery specifications."
    sop2.font.name = "Arial"
    sop2.font.size = Pt(8.5)
    sop2.font.color.rgb = TEXT_MUTED
    sop2.space_before = Pt(2)

    # Left: BastionGroup - Strictly Benjamin, no title
    add_card(slide14, Inches(1.05), Inches(4.85), Inches(5.4), Inches(1.75), bg=NAVY_SURFACE, border=BORDER_BLUE)
    tx_sb1 = slide14.shapes.add_textbox(Inches(1.25), Inches(4.95), Inches(5.0), Inches(1.5))
    s1tf = tx_sb1.text_frame
    s1tf.word_wrap = True
    s1tf.margin_left = s1tf.margin_top = s1tf.margin_bottom = s1tf.margin_right = 0

    s1p = s1tf.paragraphs[0]
    s1p.text = "BASTIONGROUP"
    s1p.font.name = "Arial"
    s1p.font.size = Pt(11)
    s1p.font.bold = True
    s1p.font.color.rgb = GOLD_ACCENT

    s1p2 = s1tf.add_paragraph()
    s1p2.text = "Benjamin"
    s1p2.font.name = "Georgia"
    s1p2.font.size = Pt(16)
    s1p2.font.bold = True
    s1p2.font.color.rgb = TEXT_WHITE
    s1p2.space_before = Pt(4)

    line_s1 = slide14.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(1.25), Inches(5.85), Inches(4.8), Inches(0.015))
    line_s1.fill.solid()
    line_s1.fill.fore_color.rgb = BORDER_GOLD
    line_s1.line.fill.background()

    tx_dt1 = slide14.shapes.add_textbox(Inches(1.25), Inches(5.95), Inches(4.8), Inches(0.4))
    d1p = tx_dt1.text_frame.paragraphs[0]
    d1p.text = "Date: 28 September 2026  •  Digital Signature Verified"
    d1p.font.name = "Arial"
    d1p.font.size = Pt(8.5)
    d1p.font.color.rgb = TEXT_MUTED

    # Right: Gold Fields Limited
    add_card(slide14, Inches(6.8), Inches(4.85), Inches(5.4), Inches(1.75), bg=NAVY_SURFACE, border=BORDER_BLUE)
    tx_sb2 = slide14.shapes.add_textbox(Inches(7.0), Inches(4.95), Inches(5.0), Inches(1.5))
    s2tf = tx_sb2.text_frame
    s2tf.word_wrap = True
    s2tf.margin_left = s2tf.margin_top = s2tf.margin_bottom = s2tf.margin_right = 0

    s2p = s2tf.paragraphs[0]
    s2p.text = "GOLD FIELDS LIMITED"
    s2p.font.name = "Arial"
    s2p.font.size = Pt(11)
    s2p.font.bold = True
    s2p.font.color.rgb = TURQUOISE

    s2p2 = s2tf.add_paragraph()
    s2p2.text = "Executive Committee Representative"
    s2p2.font.name = "Georgia"
    s2p2.font.size = Pt(15)
    s2p2.font.bold = True
    s2p2.font.color.rgb = TEXT_WHITE
    s2p2.space_before = Pt(4)

    line_s2 = slide14.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(7.0), Inches(5.85), Inches(4.8), Inches(0.015))
    line_s2.fill.solid()
    line_s2.fill.fore_color.rgb = BORDER_BLUE
    line_s2.line.fill.background()

    tx_dt2 = slide14.shapes.add_textbox(Inches(7.0), Inches(5.95), Inches(4.8), Inches(0.4))
    d2p = tx_dt2.text_frame.paragraphs[0]
    d2p.text = "Date: ________________________  •  Corporate Affairs & IR"
    d2p.font.name = "Arial"
    d2p.font.size = Pt(8.5)
    d2p.font.color.rgb = TEXT_MUTED

    add_footer(slide14, 14)

    # Save outputs
    pptx_filename = 'Goldfields-BastionGroup-Executive-Deck.pptx'
    pptx_path = os.path.join(OUTPUT_DIR, pptx_filename)
    prs.save(pptx_path)
    print(f"✅ Generated PPTX presentation at: {pptx_path} ({os.path.getsize(pptx_path)} bytes)")

    # Copy to project root
    root_pptx = os.path.join(PROJECT_DIR, pptx_filename)
    shutil.copyfile(pptx_path, root_pptx)

    # Copy to user's Documents folder
    doc_pptx = os.path.join(DOCUMENTS_DIR, pptx_filename)
    shutil.copyfile(pptx_path, doc_pptx)
    print(f"✅ Copied PPTX to Documents: {doc_pptx}")

    # Copy to dedicated artifacts folder
    artifact_pptx = os.path.join(DOCS_ARTIFACTS_DIR, pptx_filename)
    shutil.copyfile(pptx_path, artifact_pptx)
    print(f"✅ Copied PPTX to Artifacts: {artifact_pptx}")

    return pptx_path

if __name__ == '__main__':
    create_deck()
