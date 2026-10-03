#!/usr/bin/env python3
"""
Gold Fields Limited — Digital Flagship & Studio OS Executive Presentation Deck
Prepared by BastionGroup (Benjamin)
Refined for zero clipping, uniform corner radius, mock browser frames, high readability, and clean screenshots.
"""

import os
import shutil
import subprocess
from PIL import Image
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

# Executive Luxury Palette
NAVY_DARK = RGBColor(6, 29, 50)       # #061D32 (Deepest Midnight Background)
NAVY_CARD = RGBColor(11, 48, 82)      # #0B3052 (Card Background)
NAVY_SURFACE = RGBColor(16, 58, 98)   # #103A62 (Nested Container Background)
BORDER_BLUE = RGBColor(26, 75, 117)   # #1A4B75 (Subtle Card Border)
BORDER_GOLD = RGBColor(200, 160, 100) # #C8A064 (Accent Border)

GOLD_ACCENT = RGBColor(200, 160, 100) # #C8A064 (Primary Gold)
TURQUOISE = RGBColor(0, 229, 192)     # #00E5C0 (Electric Innovation)
GREEN_ESG = RGBColor(31, 110, 67)     # #1F6E43 (Forest Sustainability Green)

TEXT_WHITE = RGBColor(255, 255, 255)
TEXT_MUTED = RGBColor(170, 190, 210)
TEXT_GOLD = RGBColor(240, 228, 206)

# Asset Paths
BASTION_LOGO_WHITE = os.path.join(ASSETS_DIR, 'bastion-logo-white.png')
GOLDFIELDS_EMBLEM = os.path.join(ASSETS_DIR, 'goldfields-emblem.png')
OG_SHARE_CARD = os.path.join(ASSETS_DIR, 'goldfields-og-share.png')
DESIGN_TOKENS_CARD = os.path.join(ASSETS_DIR, 'design-system-tokens.png')
GOVERNANCE_CARD = os.path.join(ASSETS_DIR, 'governance-audit-card.png')
CLEAN_LOGIN_CARD = os.path.join(ASSETS_DIR, 'clean_admin_login.png')
CHAT_SCREENSHOT = os.path.join(ASSETS_DIR, 'chat_crop_q_and_a.png')

SCREENSHOT_HERO = '/Users/malcolmgovender/.gemini/antigravity/brain/8d5736b7-122d-4e9c-95b8-96b414fb7dfa/.user_uploaded/media_1790576282836.png'
SCREENSHOT_GLOBE = '/Users/malcolmgovender/.gemini/antigravity/brain/8d5736b7-122d-4e9c-95b8-96b414fb7dfa/.user_uploaded/media_1790528693970.png'
SCREENSHOT_CMS = '/Users/malcolmgovender/.gemini/antigravity/brain/8d5736b7-122d-4e9c-95b8-96b414fb7dfa/.user_uploaded/media_1790567902942.png'
SCREENSHOT_H1_CARD = '/Users/malcolmgovender/.gemini/antigravity/brain/8d5736b7-122d-4e9c-95b8-96b414fb7dfa/.user_uploaded/media_1790562287284.png'
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

    def add_card(slide, left, top, width, height, bg=NAVY_CARD, border=BORDER_BLUE, border_width=1, radius_inches=0.15):
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        card.fill.solid()
        card.fill.fore_color.rgb = bg
        card.line.color.rgb = border
        card.line.width = Pt(border_width)
        if hasattr(card, "adjustments") and len(card.adjustments) > 0:
            shorter = min(width, height)
            if shorter > 0:
                card.adjustments[0] = min(0.5, Inches(radius_inches) / shorter)
        return card

    def add_header(slide, title_text, category_text):
        # 1. Bastion Logo top left
        if os.path.exists(BASTION_LOGO_WHITE):
            slide.shapes.add_picture(BASTION_LOGO_WHITE, Inches(0.8), Inches(0.35), height=Inches(0.32))
        
        # Divider line
        div = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(2.1), Inches(0.35), Inches(0.015), Inches(0.32))
        div.fill.solid()
        div.fill.fore_color.rgb = BORDER_BLUE
        div.line.fill.background()

        # Partner text
        tx = slide.shapes.add_textbox(Inches(2.25), Inches(0.35), Inches(4.5), Inches(0.32))
        tf = tx.text_frame
        tf.margin_left = tf.margin_top = tf.margin_bottom = tf.margin_right = 0
        p = tf.paragraphs[0]
        p.text = "GOLDFIELDS DIGITAL FLAGSHIP • EXECUTIVE PRESENTATION"
        p.font.name = "Arial"
        p.font.size = Pt(8.5)
        p.font.bold = True
        p.font.color.rgb = TEXT_MUTED

        # Category pill on right
        pill = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(9.8), Inches(0.32), Inches(2.733), Inches(0.36))
        pill.fill.solid()
        pill.fill.fore_color.rgb = NAVY_CARD
        pill.line.color.rgb = GOLD_ACCENT
        pill.line.width = Pt(1)
        if hasattr(pill, "adjustments") and len(pill.adjustments) > 0:
            pill.adjustments[0] = min(0.5, Inches(0.12) / Inches(0.36))
        ptf = pill.text_frame
        ptf.word_wrap = True
        ptf.margin_top = Inches(0.04)
        pp = ptf.paragraphs[0]
        pp.text = category_text.upper()
        pp.alignment = PP_ALIGN.CENTER
        pp.font.name = "Arial"
        pp.font.size = Pt(8.5)
        pp.font.bold = True
        pp.font.color.rgb = TURQUOISE

        # Main slide title (Top 0.82, height 0.48 - finishes at 1.30, completely safe from cards starting at 1.50)
        tx_title = slide.shapes.add_textbox(Inches(0.8), Inches(0.82), Inches(11.733), Inches(0.48))
        tt = tx_title.text_frame
        tt.margin_left = tt.margin_top = tt.margin_bottom = tt.margin_right = 0
        p_title = tt.paragraphs[0]
        p_title.text = title_text
        p_title.font.name = "Georgia"
        p_title.font.size = Pt(20)
        p_title.font.bold = True
        p_title.font.color.rgb = TEXT_WHITE

    def add_footer(slide, current_idx):
        # Footer line at 6.72
        line = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(6.72), Inches(11.733), Inches(0.015))
        line.fill.solid()
        line.fill.fore_color.rgb = BORDER_BLUE
        line.line.fill.background()

        # Left metadata - Strictly Benjamin with NO title
        tx_left = slide.shapes.add_textbox(Inches(0.8), Inches(6.82), Inches(9.0), Inches(0.35))
        tl = tx_left.text_frame
        tl.margin_left = tl.margin_top = tl.margin_bottom = tl.margin_right = 0
        pl = tl.paragraphs[0]
        pl.text = "BastionGroup  •  https://bastiongroup.co.za  •  +27 11 778 5800  •  Benjamin"
        pl.font.name = "Arial"
        pl.font.size = Pt(8.5)
        pl.font.color.rgb = TEXT_MUTED

        # Right page number
        tx_right = slide.shapes.add_textbox(Inches(10.5), Inches(6.82), Inches(2.033), Inches(0.35))
        tr = tx_right.text_frame
        tr.margin_left = tr.margin_top = tr.margin_bottom = tr.margin_right = 0
        pr = tr.paragraphs[0]
        pr.alignment = PP_ALIGN.RIGHT
        pr.text = f"Slide {current_idx:02d} / {TOTAL_SLIDES:02d}"
        pr.font.name = "Arial"
        pr.font.size = Pt(8.5)
        pr.font.bold = True
        pr.font.color.rgb = GOLD_ACCENT

    def add_browser_screenshot_card(slide, left, top, width, height, image_path, url_text, caption_title, caption_desc, border_color=BORDER_GOLD):
        # 1. Base card with uniform sleek 0.15" rounded corners
        add_card(slide, left, top, width, height, bg=NAVY_CARD, border=border_color, border_width=1, radius_inches=0.15)
        
        # 2. Browser header bar
        bar_x = left + Inches(0.18)
        bar_y = top + Inches(0.18)
        bar_w = width - Inches(0.36)
        bar_h = Inches(0.24)
        
        bar = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, bar_x, bar_y, bar_w, bar_h)
        bar.fill.solid()
        bar.fill.fore_color.rgb = NAVY_SURFACE
        bar.line.color.rgb = BORDER_BLUE
        bar.line.width = Pt(0.75)
        
        # Window controls (3 subtle dots: red, amber, green)
        dot_r = Inches(0.08)
        dot_y = bar_y + Inches(0.08)
        dot_colors = [RGBColor(235, 90, 80), RGBColor(245, 185, 75), RGBColor(45, 195, 120)]
        for i, col in enumerate(dot_colors):
            dot = slide.shapes.add_shape(MSO_SHAPE.OVAL, bar_x + Inches(0.10) + (i * Inches(0.14)), dot_y, dot_r, dot_r)
            dot.fill.solid()
            dot.fill.fore_color.rgb = col
            dot.line.fill.background()
            
        # URL text in the bar
        tx_url = slide.shapes.add_textbox(bar_x + Inches(0.55), bar_y + Inches(0.02), bar_w - Inches(0.65), bar_h - Inches(0.04))
        utf = tx_url.text_frame
        utf.margin_left = utf.margin_top = utf.margin_bottom = utf.margin_right = 0
        up = utf.paragraphs[0]
        up.text = f"🔒  {url_text}"
        up.font.name = "Arial"
        up.font.size = Pt(7)
        up.font.color.rgb = TEXT_MUTED
        
        # 3. Image placement
        img_max_h = Inches(3.18)
        img_y = bar_y + bar_h
        
        if os.path.exists(image_path):
            with Image.open(image_path) as im:
                orig_w, orig_h = im.size
                ar = orig_w / orig_h
                
            calc_h = bar_w / ar
            if calc_h <= img_max_h:
                img_w = bar_w
                img_h = calc_h
                img_x = bar_x
                slide.shapes.add_picture(image_path, img_x, img_y, width=img_w, height=img_h)
                actual_bottom = img_y + img_h
            else:
                img_h = img_max_h
                img_w = int(img_h * ar)
                img_x = bar_x + int((bar_w - img_w) / 2)
                slide.shapes.add_picture(image_path, img_x, img_y, width=img_w, height=img_h)
                actual_bottom = img_y + img_h
        else:
            actual_bottom = img_y + Inches(2.5)

        # 4. Caption textbox below image
        cap_y = max(actual_bottom + Inches(0.08), top + Inches(3.68))
        cap_h = (top + height) - cap_y - Inches(0.10)
        tx_cap = slide.shapes.add_textbox(bar_x, cap_y, bar_w, cap_h)
        ctf = tx_cap.text_frame
        ctf.word_wrap = True
        ctf.margin_left = ctf.margin_top = ctf.margin_bottom = ctf.margin_right = 0
        
        cp1 = ctf.paragraphs[0]
        cp1.text = caption_title
        cp1.font.name = "Arial"
        cp1.font.size = Pt(8)
        cp1.font.bold = True
        cp1.font.color.rgb = TURQUOISE
        
        cp2 = ctf.add_paragraph()
        cp2.text = caption_desc
        cp2.font.name = "Arial"
        cp2.font.size = Pt(7.5)
        cp2.font.color.rgb = TEXT_MUTED
        cp2.space_before = Pt(2)

    # =========================================================================
    # SLIDE 1: COVER
    # =========================================================================
    slide1 = prs.slides.add_slide(blank_layout)
    set_bg(slide1)

    if os.path.exists(BASTION_LOGO_WHITE):
        slide1.shapes.add_picture(BASTION_LOGO_WHITE, Inches(0.8), Inches(0.8), height=Inches(0.65))

    div_c = slide1.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(3.2), Inches(0.85), Inches(0.015), Inches(0.55))
    div_c.fill.solid()
    div_c.fill.fore_color.rgb = BORDER_GOLD
    div_c.line.fill.background()

    if os.path.exists(GOLDFIELDS_EMBLEM):
        slide1.shapes.add_picture(GOLDFIELDS_EMBLEM, Inches(3.45), Inches(0.8), height=Inches(0.65))

    pill1 = slide1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.8), Inches(4.8), Inches(0.38))
    pill1.fill.solid()
    pill1.fill.fore_color.rgb = NAVY_CARD
    pill1.line.color.rgb = TURQUOISE
    pill1.line.width = Pt(1)
    if hasattr(pill1, "adjustments") and len(pill1.adjustments) > 0:
        pill1.adjustments[0] = min(0.5, Inches(0.12) / Inches(0.38))
    p1_tf = pill1.text_frame
    p1_tf.margin_top = Inches(0.05)
    p1_p = p1_tf.paragraphs[0]
    p1_p.text = "CORPORATE COMMUNICATIONS & STAKEHOLDER REPORTING"
    p1_p.alignment = PP_ALIGN.CENTER
    p1_p.font.name = "Arial"
    p1_p.font.size = Pt(8.5)
    p1_p.font.bold = True
    p1_p.font.color.rgb = TURQUOISE

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

    add_card(slide1, Inches(0.8), Inches(4.55), Inches(11.733), Inches(1.80), bg=NAVY_CARD, border=BORDER_GOLD, border_width=1.5, radius_inches=0.15)
    tx_det = slide1.shapes.add_textbox(Inches(1.1), Inches(4.70), Inches(11.133), Inches(1.50))
    td = tx_det.text_frame
    td.word_wrap = True
    td.margin_left = td.margin_top = td.margin_bottom = td.margin_right = 0
    
    p_meta = td.paragraphs[0]
    p_meta.text = "PARTNERSHIP ENGAGEMENT SPECIFICATION"
    p_meta.font.name = "Arial"
    p_meta.font.size = Pt(9.5)
    p_meta.font.bold = True
    p_meta.font.color.rgb = TURQUOISE

    cols_y = Inches(5.10)
    items = [
        ("Prepared By", "BastionGroup", "bastiongroup.co.za  |  +27 11 778 5800"),
        ("Presented By", "Benjamin", "BastionGroup"),
        ("Client Recipient", "Gold Fields Limited", "Executive Committee & Corporate Affairs"),
        ("Delivery & Status", "September 2026", "Live Production Verified (goldfields-bay.vercel.app)")
    ]
    col_w = Inches(2.7)
    for idx, (label, val1, val2) in enumerate(items):
        cx = Inches(1.1) + (idx * col_w)
        tx_col = slide1.shapes.add_textbox(cx, cols_y, col_w - Inches(0.2), Inches(1.05))
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

    tx_cf = slide1.shapes.add_textbox(Inches(0.8), Inches(6.85), Inches(11.733), Inches(0.35))
    tcf_p = tx_cf.text_frame.paragraphs[0]
    tcf_p.text = "STRICTLY CONFIDENTIAL  •  BASTION GROUP EXECUTIVE PRESENTATION  •  GOLDFIELDS 2026"
    tcf_p.font.name = "Arial"
    tcf_p.font.size = Pt(8.5)
    tcf_p.font.bold = True
    tcf_p.font.color.rgb = TEXT_MUTED

    # =========================================================================
    # SLIDE 2: STRATEGIC EXECUTIVE SUMMARY (Redesigned for Premium Readability)
    # =========================================================================
    slide2 = prs.slides.add_slide(blank_layout)
    set_bg(slide2)
    add_header(slide2, "Strategic Vision: Real-Time Content Autonomy & Investor Intelligence", "Strategic Vision")

    # 1. Top Transformation Mandate Banner (Full Width: 11.733" x 0.95")
    add_card(slide2, Inches(0.8), Inches(1.50), Inches(11.733), Inches(0.95), bg=NAVY_CARD, border=TURQUOISE, border_width=1, radius_inches=0.15)
    tx_man = slide2.shapes.add_textbox(Inches(1.05), Inches(1.58), Inches(11.2), Inches(0.80))
    mtf = tx_man.text_frame
    mtf.word_wrap = True
    mtf.margin_left = mtf.margin_top = mtf.margin_bottom = mtf.margin_right = 0
    mp1 = mtf.paragraphs[0]
    mp1.text = "THE TRANSFORMATION MANDATE"
    mp1.font.name = "Arial"
    mp1.font.size = Pt(8.5)
    mp1.font.bold = True
    mp1.font.color.rgb = TURQUOISE

    mp2 = mtf.add_paragraph()
    mp2.text = "Gold Fields operates 10 premier assets across 6 sovereign nations. BastionGroup has engineered an enterprise digital flagship that eliminates slow external agency retainers, replacing bottlenecks with instant in-house publishing, live operational telemetry, and bank-grade regulatory compliance."
    mp2.font.name = "Georgia"
    mp2.font.size = Pt(10)
    mp2.font.color.rgb = TEXT_WHITE
    mp2.space_before = Pt(2)

    # 2. Bottom Left: 4 Clear Value Pillar Cards (Width: 5.75", Height: 4.05")
    pillars_left = [
        ("01. Content Autonomy (< 60s)", "Corporate Affairs & IR publish press releases, disclosures, and board bios without developer tickets.", TURQUOISE),
        ("02. Real-Time Telemetry Bar", "Live JSE & NYSE share price, AISC cost guidance ($1,385/oz), and 54% renewable energy mix.", GOLD_ACCENT),
        ("03. Institutional Capital Hub", "Interactive H1 2026 earnings booklets, automated SENS/SEC wire, and an AI Knowledge Copilot.", TURQUOISE),
        ("04. 2030 ESG Tracking Command", "Transparent milestone tracking across decarbonization, 50MW Khanyisa solar, and 100% GISTM tailings safety.", GREEN_ESG)
    ]
    card_h = Inches(0.90)
    for idx, (p_title, p_desc, p_accent) in enumerate(pillars_left):
        cy = Inches(2.60) + (idx * Inches(1.02))
        add_card(slide2, Inches(0.8), cy, Inches(5.75), card_h, bg=NAVY_CARD, border=p_accent, radius_inches=0.15)
        
        tx_p = slide2.shapes.add_textbox(Inches(0.98), cy + Inches(0.10), Inches(5.38), Inches(0.70))
        ptf = tx_p.text_frame
        ptf.word_wrap = True
        ptf.margin_left = ptf.margin_top = ptf.margin_bottom = ptf.margin_right = 0
        
        pp1 = ptf.paragraphs[0]
        pp1.text = p_title
        pp1.font.name = "Arial"
        pp1.font.size = Pt(10)
        pp1.font.bold = True
        pp1.font.color.rgb = p_accent

        pp2 = ptf.add_paragraph()
        pp2.text = p_desc
        pp2.font.name = "Arial"
        pp2.font.size = Pt(8.5)
        pp2.font.color.rgb = TEXT_WHITE
        pp2.space_before = Pt(2)

    # 3. Bottom Right: 4 Metrics (2x2 Grid) + Bastion Commitment Card
    stats_r = [
        ("< 60s", "PUBLISHING VELOCITY", "In-house release to global edge CDN"),
        ("0.8s", "GLOBAL PAGE SPEED", "Sub-second LCP benchmark across global capital hubs"),
        ("10 Mines", "GEOSPATIAL ASSETS", "Interactive 3D WebGL mapping across 6 nations"),
        ("100%", "REGULATORY READY", "SENS / SEC compliance with cryptographic audit logs")
    ]
    sw = Inches(2.78)
    sh = Inches(1.30)
    for idx, (val, title_s, desc_s) in enumerate(stats_r):
        col = idx % 2
        row = idx // 2
        sx = Inches(6.78) + (col * Inches(2.97))
        sy = Inches(2.60) + (row * Inches(1.42))
        add_card(slide2, sx, sy, sw, sh, bg=NAVY_CARD, border=BORDER_GOLD, radius_inches=0.15)

        tx_s = slide2.shapes.add_textbox(sx + Inches(0.15), sy + Inches(0.10), sw - Inches(0.3), sh - Inches(0.20))
        stf = tx_s.text_frame
        stf.word_wrap = True
        stf.margin_left = stf.margin_top = stf.margin_bottom = stf.margin_right = 0
        
        sp1 = stf.paragraphs[0]
        sp1.text = val
        sp1.font.name = "Georgia"
        sp1.font.size = Pt(20)
        sp1.font.bold = True
        sp1.font.color.rgb = TURQUOISE

        sp2 = stf.add_paragraph()
        sp2.text = title_s
        sp2.font.name = "Arial"
        sp2.font.size = Pt(8)
        sp2.font.bold = True
        sp2.font.color.rgb = TEXT_WHITE
        sp2.space_before = Pt(1)

        sp3 = stf.add_paragraph()
        sp3.text = desc_s
        sp3.font.name = "Arial"
        sp3.font.size = Pt(7.5)
        sp3.font.color.rgb = TEXT_MUTED
        sp3.space_before = Pt(1)

    # Bastion Commitment Card below stats
    add_card(slide2, Inches(6.78), Inches(5.48), Inches(5.75), Inches(1.15), bg=NAVY_SURFACE, border=TURQUOISE, radius_inches=0.15)
    tx_com = slide2.shapes.add_textbox(Inches(6.98), Inches(5.56), Inches(5.35), Inches(0.95))
    ctf = tx_com.text_frame
    ctf.word_wrap = True
    ctf.margin_left = ctf.margin_top = ctf.margin_bottom = ctf.margin_right = 0

    cp1 = ctf.paragraphs[0]
    cp1.text = "BASTIONGROUP EXECUTIVE COMMITMENT"
    cp1.font.name = "Arial"
    cp1.font.size = Pt(8.5)
    cp1.font.bold = True
    cp1.font.color.rgb = GOLD_ACCENT

    cp2 = ctf.add_paragraph()
    cp2.text = "As South Africa's trusted corporate communications and reporting partner, BastionGroup provides Gold Fields with an ongoing extension to your team — uniting JSE/NYSE reporting rigour with bleeding-edge digital engineering."
    cp2.font.name = "Arial"
    cp2.font.size = Pt(8)
    cp2.font.color.rgb = TEXT_WHITE
    cp2.space_before = Pt(2)

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

    card_h = Inches(0.72)
    for idx, (metric, legacy, modern, accent) in enumerate(comparisons):
        cy = Inches(1.50) + (idx * Inches(0.85))
        add_card(slide3, Inches(0.8), cy, Inches(11.733), card_h, bg=NAVY_CARD, border=BORDER_BLUE, radius_inches=0.15)
        
        tx_m = slide3.shapes.add_textbox(Inches(1.0), cy + Inches(0.12), Inches(2.4), Inches(0.50))
        mtf = tx_m.text_frame
        mtf.word_wrap = True
        mtf.margin_left = mtf.margin_top = mtf.margin_bottom = mtf.margin_right = 0
        mp = mtf.paragraphs[0]
        mp.text = metric
        mp.font.name = "Arial"
        mp.font.size = Pt(10.5)
        mp.font.bold = True
        mp.font.color.rgb = accent

        tx_l = slide3.shapes.add_textbox(Inches(3.5), cy + Inches(0.08), Inches(4.0), Inches(0.55))
        ltf = tx_l.text_frame
        ltf.word_wrap = True
        ltf.margin_left = ltf.margin_top = ltf.margin_bottom = ltf.margin_right = 0
        lp_tag = ltf.paragraphs[0]
        lp_tag.text = "LEGACY OUTSOURCED WEB"
        lp_tag.font.name = "Arial"
        lp_tag.font.size = Pt(7.5)
        lp_tag.font.bold = True
        lp_tag.font.color.rgb = RGBColor(230, 100, 100)
        lp_val = ltf.add_paragraph()
        lp_val.text = legacy
        lp_val.font.name = "Arial"
        lp_val.font.size = Pt(8)
        lp_val.font.color.rgb = TEXT_MUTED
        lp_val.space_before = Pt(1)

        div_arr = slide3.shapes.add_shape(MSO_SHAPE.RIGHT_ARROW, Inches(7.6), cy + Inches(0.24), Inches(0.22), Inches(0.16))
        div_arr.fill.solid()
        div_arr.fill.fore_color.rgb = accent
        div_arr.line.fill.background()

        tx_n = slide3.shapes.add_textbox(Inches(7.95), cy + Inches(0.08), Inches(4.35), Inches(0.55))
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
        np_val.font.size = Pt(8)
        np_val.font.color.rgb = TEXT_WHITE
        np_val.space_before = Pt(1)

    add_footer(slide3, 3)

    # =========================================================================
    # SLIDE 4: PUBLIC FLAGSHIP EXPERIENCE & CINEMATIC HERO
    # =========================================================================
    slide4 = prs.slides.add_slide(blank_layout)
    set_bg(slide4)
    add_header(slide4, "Public Flagship Experience: Cinematic Brand & Live Telemetry", "Flagship Architecture")

    # Left: Framed Browser Screenshot Card
    add_browser_screenshot_card(
        slide4, Inches(0.8), Inches(1.50), Inches(5.75), Inches(5.0),
        SCREENSHOT_HERO, "goldfields-bay.vercel.app",
        "LIVE PRODUCTION HERO: 'beyond mining.' WITH REAL-TIME TELEMETRY",
        "Showcasing autonomous mining haulage, Khanyisa solar generation, and interactive AI search prompt.",
        border_color=BORDER_GOLD
    )

    # Right Card: Capabilities Breakdown
    add_card(slide4, Inches(6.78), Inches(1.50), Inches(5.75), Inches(5.0), bg=NAVY_CARD, border=BORDER_BLUE, radius_inches=0.15)
    tx_r4 = slide4.shapes.add_textbox(Inches(7.05), Inches(1.70), Inches(5.2), Inches(4.55))
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
        fp1.font.size = Pt(10)
        fp1.font.bold = True
        fp1.font.color.rgb = TEXT_WHITE
        fp1.space_before = Pt(8)

        fp2 = tr4.add_paragraph()
        fp2.text = f_desc
        fp2.font.name = "Arial"
        fp2.font.size = Pt(8)
        fp2.font.color.rgb = TEXT_MUTED
        fp2.space_before = Pt(1)

    add_footer(slide4, 4)

    # =========================================================================
    # SLIDE 5: AI KNOWLEDGE COPILOT
    # =========================================================================
    slide5 = prs.slides.add_slide(blank_layout)
    set_bg(slide5)
    add_header(slide5, "AI Knowledge Copilot: Verified Natural Language Intelligence", "AI Intelligence")

    add_card(slide5, Inches(0.8), Inches(1.50), Inches(5.75), Inches(5.0), bg=NAVY_CARD, border=BORDER_BLUE, radius_inches=0.15)
    tx_l5 = slide5.shapes.add_textbox(Inches(1.05), Inches(1.70), Inches(5.2), Inches(4.55))
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
        ap1.font.size = Pt(10)
        ap1.font.bold = True
        ap1.font.color.rgb = GOLD_ACCENT
        ap1.space_before = Pt(8)

        ap2 = tl5.add_paragraph()
        ap2.text = ad
        ap2.font.name = "Arial"
        ap2.font.size = Pt(8)
        ap2.font.color.rgb = TEXT_WHITE
        ap2.space_before = Pt(1)

    # Right Card: Live Copilot Chat Interface + Key Grounding Highlights
    add_card(slide5, Inches(6.78), Inches(1.50), Inches(5.75), Inches(5.0), bg=NAVY_CARD, border=TURQUOISE, border_width=1.5, radius_inches=0.15)
    
    tx_r5 = slide5.shapes.add_textbox(Inches(7.00), Inches(1.65), Inches(5.3), Inches(0.40))
    tr5 = tx_r5.text_frame
    tr5.word_wrap = True
    tr5.margin_left = tr5.margin_top = tr5.margin_bottom = tr5.margin_right = 0
    rp1 = tr5.paragraphs[0]
    rp1.text = "REAL COPILOT INTERACTION: LIVE VERIFIED RESPONSE"
    rp1.font.name = "Arial"
    rp1.font.size = Pt(9.5)
    rp1.font.bold = True
    rp1.font.color.rgb = GOLD_ACCENT

    # Chat screenshot on the left half of right card
    if os.path.exists(CHAT_SCREENSHOT):
        slide5.shapes.add_picture(CHAT_SCREENSHOT, Inches(7.00), Inches(2.12), height=Inches(4.18))

    # Callout badges on the right half of right card
    callouts = [
        ("DETERMINISTIC LLM GROUNDING", "Constrained strictly to audited annual reports; zero generative drift or hallucination.", TURQUOISE),
        ("PAGE-LEVEL CITATIONS", "Clickable citations link directly to primary PDF source pages for regulatory verification.", GOLD_ACCENT),
        ("DYNAMIC ACTION DEEP-LINKS", "One-click routing to the relevant asset profile and live operational telemetry drawer.", TURQUOISE),
        ("ENTERPRISE AUDIT TRAIL", "Every query, citation, and session token is cryptographically logged for compliance.", TEXT_WHITE)
    ]

    for idx, (title, desc, accent) in enumerate(callouts):
        cy = Inches(2.12) + (idx * Inches(1.04))
        add_card(slide5, Inches(9.95), cy, Inches(2.38), Inches(0.96), bg=NAVY_SURFACE, border=BORDER_BLUE, radius_inches=0.10)
        tx_c = slide5.shapes.add_textbox(Inches(10.08), cy + Inches(0.08), Inches(2.12), Inches(0.80))
        ctf = tx_c.text_frame
        ctf.word_wrap = True
        ctf.margin_left = ctf.margin_top = ctf.margin_bottom = ctf.margin_right = 0
        cp1 = ctf.paragraphs[0]
        cp1.text = title
        cp1.font.name = "Arial"
        cp1.font.size = Pt(7.5)
        cp1.font.bold = True
        cp1.font.color.rgb = accent
        
        cp2 = ctf.add_paragraph()
        cp2.text = desc
        cp2.font.name = "Arial"
        cp2.font.size = Pt(7)
        cp2.font.color.rgb = TEXT_MUTED
        cp2.space_before = Pt(1)

    add_footer(slide5, 5)

    # =========================================================================
    # SLIDE 6: GEOSPATIAL 3D OPERATIONS GLOBE
    # =========================================================================
    slide6 = prs.slides.add_slide(blank_layout)
    set_bg(slide6)
    add_header(slide6, "Geospatial Operations: Interactive 3D WebGL Real-Earth Globe", "3D Operations Globe")

    # Left: Framed Browser Screenshot Card
    add_browser_screenshot_card(
        slide6, Inches(0.8), Inches(1.50), Inches(5.75), Inches(5.0),
        SCREENSHOT_GLOBE, "goldfields-bay.vercel.app#operations-globe",
        "REAL EARTH THREE.JS ORBITAL VISUALIZER (SOUTH DEEP PINNED)",
        "Orbital rotation, touch & drag interaction, and telemetry drawer mapping across all 10 mining assets.",
        border_color=BORDER_GOLD
    )

    # Right: Operations Breakdown
    add_card(slide6, Inches(6.78), Inches(1.50), Inches(5.75), Inches(5.0), bg=NAVY_CARD, border=BORDER_BLUE, radius_inches=0.15)
    tx_r6 = slide6.shapes.add_textbox(Inches(7.05), Inches(1.70), Inches(5.2), Inches(4.55))
    tr6 = tx_r6.text_frame
    tr6.word_wrap = True
    tr6.margin_left = tr6.margin_top = tr6.margin_bottom = tr6.margin_right = 0

    p = tr6.paragraphs[0]
    p.text = "PORTFOLIO VISUALIZATION MATRIX"
    p.font.name = "Arial"
    p.font.size = Pt(9.5)
    p.font.bold = True
    p.font.color.rgb = GOLD_ACCENT

    mines = [
        ("South Africa (South Deep)", "World-class bulk mechanized underground operation in Gauteng; powered by the 50MW Khanyisa solar plant with 70+ year reserve life."),
        ("Ghana (Tarkwa & Damang)", "Cornerstone West African open-pit production hubs delivering steady cash flows and high recovery rates in the Western Region."),
        ("Australia (St Ives, Granny Smith, Agnew, Gruyere)", "World benchmark in renewable mining; Agnew hybrid microgrid delivers >50% renewable electricity with cutting-edge wind and battery storage."),
        ("Chile (Salares Norte)", "High-altitude Atacama open-pit operation featuring pioneering environmental stewardship and Chinchilla preservation."),
        ("Peru (Cerro Corona)", "Copper-gold porphyry operation delivering long-term socio-economic value in the Cajamarca province."),
        ("Canada (Windfall Joint Venture)", "High-grade underground Canadian development asset expanding Gold Fields' jurisdictional footprint in the Americas.")
    ]

    for m_title, m_desc in mines:
        mp1 = tr6.add_paragraph()
        mp1.text = m_title
        mp1.font.name = "Arial"
        mp1.font.size = Pt(9.5)
        mp1.font.bold = True
        mp1.font.color.rgb = TEXT_WHITE
        mp1.space_before = Pt(5)

        mp2 = tr6.add_paragraph()
        mp2.text = m_desc
        mp2.font.name = "Arial"
        mp2.font.size = Pt(7.5)
        mp2.font.color.rgb = TEXT_MUTED
        mp2.space_before = Pt(1)

    add_footer(slide6, 6)

    # =========================================================================
    # SLIDE 7: 2030 ESG TRACKING COMMAND CENTER
    # =========================================================================
    slide7 = prs.slides.add_slide(blank_layout)
    set_bg(slide7)
    add_header(slide7, "2030 ESG Tracking Command: Transparent Sustainability & Decarbonization", "ESG Command Center")

    # Left: Framed Browser Screenshot Card
    add_browser_screenshot_card(
        slide7, Inches(0.8), Inches(1.50), Inches(5.75), Inches(5.0),
        MINING_HERO, "goldfields-bay.vercel.app#sustainability",
        "SUSTAINABLE EXTRACTION & ENERGY TRANSITION",
        "Integrating 50MW Khanyisa solar plant, electric haulage trials, and 100% GISTM tailings dam compliance into public stakeholder telemetry.",
        border_color=GREEN_ESG
    )

    # Right: ESG Pillars
    add_card(slide7, Inches(6.78), Inches(1.50), Inches(5.75), Inches(5.0), bg=NAVY_CARD, border=GREEN_ESG, radius_inches=0.15)
    tx_r7 = slide7.shapes.add_textbox(Inches(7.05), Inches(1.70), Inches(5.2), Inches(4.55))
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
        ep2.font.size = Pt(7.5)
        ep2.font.color.rgb = TEXT_MUTED
        ep2.space_before = Pt(1)

    add_footer(slide7, 7)

    # =========================================================================
    # SLIDE 8: INVESTOR RELATIONS & REGULATORY HUB
    # =========================================================================
    slide8 = prs.slides.add_slide(blank_layout)
    set_bg(slide8)
    add_header(slide8, "Investor Relations Hub: Institutional Disclosures & Regulatory Speed", "Capital Markets Hub")

    # Left: Framed Browser Screenshot Card (Width 4.5")
    add_browser_screenshot_card(
        slide8, Inches(0.8), Inches(1.50), Inches(4.5), Inches(5.0),
        SCREENSHOT_H1_CARD, "goldfields-bay.vercel.app#investors",
        "OFFICIAL H1 2026 RESULTS PORTAL INTEGRATION",
        "Live telemetry showing 1.06Moz attributable gold production, 151koz South Deep output, and one-click PDF downloads.",
        border_color=BORDER_GOLD
    )

    # Right: 2 Columns
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

    rw = Inches(3.40)
    rh = Inches(5.0)
    for idx, (col_title, items_list, accent_col) in enumerate(right_ir_cards):
        rx = Inches(5.60) + (idx * Inches(3.68))
        add_card(slide8, rx, Inches(1.50), rw, rh, bg=NAVY_CARD, border=accent_col, radius_inches=0.15)

        tx_rc = slide8.shapes.add_textbox(rx + Inches(0.18), Inches(1.70), rw - Inches(0.36), rh - Inches(0.40))
        rtf = tx_rc.text_frame
        rtf.word_wrap = True
        rtf.margin_left = rtf.margin_top = rtf.margin_bottom = rtf.margin_right = 0

        p1 = rtf.paragraphs[0]
        p1.text = col_title
        p1.font.name = "Arial"
        p1.font.size = Pt(9)
        p1.font.bold = True
        p1.font.color.rgb = accent_col

        for it, idesc in items_list:
            ip1 = rtf.add_paragraph()
            ip1.text = it
            ip1.font.name = "Arial"
            ip1.font.size = Pt(10)
            ip1.font.bold = True
            ip1.font.color.rgb = TEXT_WHITE
            ip1.space_before = Pt(8)

            ip2 = rtf.add_paragraph()
            ip2.text = idesc
            ip2.font.name = "Arial"
            ip2.font.size = Pt(7.5)
            ip2.font.color.rgb = TEXT_MUTED
            ip2.space_before = Pt(1)

    add_footer(slide8, 8)

    # =========================================================================
    # SLIDE 9: STUDIO OS HEADLESS CMS & VISUAL BUILDER
    # =========================================================================
    slide9 = prs.slides.add_slide(blank_layout)
    set_bg(slide9)
    add_header(slide9, "Studio OS CMS: Visual Block Builder & In-House Content Autonomy", "Studio OS CMS")

    # Left: Framed Browser Screenshot Card
    add_browser_screenshot_card(
        slide9, Inches(0.8), Inches(1.50), Inches(5.75), Inches(5.0),
        SCREENSHOT_CMS, "goldfields-bay.vercel.app/admin/pages/page_home",
        "STUDIO OS LIVE VISUAL BUILDER: REARRANGE, DUPLICATE & EDIT SECTIONS",
        "Visual block canvas allowing communications teams to manage hero copy, stats, and press releases.",
        border_color=BORDER_GOLD
    )

    # Right: Studio OS Capabilities
    add_card(slide9, Inches(6.78), Inches(1.50), Inches(5.75), Inches(5.0), bg=NAVY_CARD, border=BORDER_BLUE, radius_inches=0.15)
    tx_r9 = slide9.shapes.add_textbox(Inches(7.05), Inches(1.70), Inches(5.2), Inches(4.55))
    tr9 = tx_r9.text_frame
    tr9.word_wrap = True
    tr9.margin_left = tr9.margin_top = tr9.margin_bottom = tr9.margin_right = 0

    p = tr9.paragraphs[0]
    p.text = "STUDIO OS CAPABILITIES FOR GOLD FIELDS"
    p.font.name = "Arial"
    p.font.size = Pt(9.5)
    p.font.bold = True
    p.font.color.rgb = GOLD_ACCENT

    cms_points = [
        ("Drag-and-Drop Modular Canvas", "Corporate teams can reorder, insert, or retire modular blocks (Hero, Stat Counters, Video Reels, Executive Quotes) without touching source code."),
        ("Pre-Approved Design Guardrails", "Brand typography, palette tokens, and layout ratios are hardcoded into components, preventing unauthorized visual drift."),
        ("Instant Responsive Viewports", "Toggle live simulation across iPhone (375px), iPad (768px), Laptop (1440px), and 4K displays before hitting publish."),
        ("Encrypted Draft Previews", "Generate secure, shareable draft links with 24-hour expiration tokens for executive committee and legal review before public deployment.")
    ]

    for ct, cd in cms_points:
        cp1 = tr9.add_paragraph()
        cp1.text = ct
        cp1.font.name = "Arial"
        cp1.font.size = Pt(10)
        cp1.font.bold = True
        cp1.font.color.rgb = TEXT_WHITE
        cp1.space_before = Pt(8)

        cp2 = tr9.add_paragraph()
        cp2.text = cd
        cp2.font.name = "Arial"
        cp2.font.size = Pt(8)
        cp2.font.color.rgb = TEXT_MUTED
        cp2.space_before = Pt(1)

    add_footer(slide9, 9)

    # =========================================================================
    # SLIDE 10: EDITORIAL GOVERNANCE & 4-TIER WORKFLOWS
    # =========================================================================
    slide10 = prs.slides.add_slide(blank_layout)
    set_bg(slide10)
    add_header(slide10, "Editorial Governance: Multi-Tier Approval Workflows & Audit Trail", "Regulatory Governance")

    # Left: Framed Browser Screenshot Card
    add_browser_screenshot_card(
        slide10, Inches(0.8), Inches(1.50), Inches(5.75), Inches(5.0),
        GOVERNANCE_CARD, "goldfields-bay.vercel.app/admin/audit",
        "IMMUTABLE AUDIT LOG & 4-TIER REGULATORY STAGES",
        "Full cryptographic SHA-256 integrity tracking and market embargo synchronization.",
        border_color=BORDER_GOLD
    )

    # Right: Governance Points
    add_card(slide10, Inches(6.78), Inches(1.50), Inches(5.75), Inches(5.0), bg=NAVY_CARD, border=BORDER_BLUE, radius_inches=0.15)
    tx_r10 = slide10.shapes.add_textbox(Inches(7.05), Inches(1.70), Inches(5.2), Inches(4.55))
    tr10 = tx_r10.text_frame
    tr10.word_wrap = True
    tr10.margin_left = tr10.margin_top = tr10.margin_bottom = tr10.margin_right = 0

    p = tr10.paragraphs[0]
    p.text = "CRYPTOGRAPHIC AUDIT & COMPLIANCE SPECIFICATIONS"
    p.font.name = "Arial"
    p.font.size = Pt(9.5)
    p.font.bold = True
    p.font.color.rgb = GOLD_ACCENT

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
        ap1.font.size = Pt(10)
        ap1.font.bold = True
        ap1.font.color.rgb = TURQUOISE
        ap1.space_before = Pt(8)

        ap2 = tr10.add_paragraph()
        ap2.text = ad
        ap2.font.name = "Arial"
        ap2.font.size = Pt(8)
        ap2.font.color.rgb = TEXT_WHITE
        ap2.space_before = Pt(1)

    add_footer(slide10, 10)

    # =========================================================================
    # SLIDE 11: LIVING DESIGN SYSTEM & TOKEN SANDBOX
    # =========================================================================
    slide11 = prs.slides.add_slide(blank_layout)
    set_bg(slide11)
    add_header(slide11, "Living Design System: Corporate Tokens & WCAG AAA Accessibility", "Design System")

    # Left: Framed Browser Screenshot Card
    add_browser_screenshot_card(
        slide11, Inches(0.8), Inches(1.50), Inches(5.75), Inches(5.0),
        DESIGN_TOKENS_CARD, "goldfields-bay.vercel.app/design-tokens",
        "LIVING DESIGN TOKENS & WCAG AAA ACCESSIBILITY VERIFICATION",
        "Harmonizing corporate color tokens, WCAG AAA contrast compliance, and typography scale.",
        border_color=BORDER_GOLD
    )

    # Right: Design System Details
    add_card(slide11, Inches(6.78), Inches(1.50), Inches(5.75), Inches(5.0), bg=NAVY_CARD, border=BORDER_BLUE, radius_inches=0.15)
    tx_r11 = slide11.shapes.add_textbox(Inches(7.05), Inches(1.70), Inches(5.2), Inches(4.55))
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
        pp1.font.size = Pt(9.5)
        pp1.font.bold = True
        pp1.font.color.rgb = TEXT_WHITE
        pp1.space_before = Pt(4)

        pp2 = tr11.add_paragraph()
        pp2.text = pd
        pp2.font.name = "Arial"
        pp2.font.size = Pt(7.5)
        pp2.font.color.rgb = TEXT_MUTED
        pp2.space_before = Pt(1)

    add_footer(slide11, 11)

    # =========================================================================
    # SLIDE 12: MOBILE-FIRST ARCHITECTURE & SOCIAL SHARING ENGINE
    # =========================================================================
    slide12 = prs.slides.add_slide(blank_layout)
    set_bg(slide12)
    add_header(slide12, "Multi-Channel Distribution: Mobile Architecture & Social Sharing Engine", "Social & Mobile Engine")

    # Left: Framed Browser Screenshot Card
    add_browser_screenshot_card(
        slide12, Inches(0.8), Inches(1.50), Inches(5.75), Inches(5.0),
        OG_SHARE_CARD, "goldfields-bay.vercel.app/api/og",
        "OFFICIAL 1200x630 OPEN GRAPH SOCIAL SHARING CARD (WHATSAPP / LINKEDIN)",
        "Featuring official Gold Fields lion emblem, gold borders, and real-time operational metrics.",
        border_color=BORDER_GOLD
    )

    # Right: Distribution Advantages
    add_card(slide12, Inches(6.78), Inches(1.50), Inches(5.75), Inches(5.0), bg=NAVY_CARD, border=BORDER_BLUE, radius_inches=0.15)
    tx_r12 = slide12.shapes.add_textbox(Inches(7.05), Inches(1.70), Inches(5.2), Inches(4.55))
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
        sp1.font.size = Pt(10)
        sp1.font.bold = True
        sp1.font.color.rgb = TEXT_WHITE
        sp1.space_before = Pt(8)

        sp2 = tr12.add_paragraph()
        sp2.text = sd
        sp2.font.name = "Arial"
        sp2.font.size = Pt(8)
        sp2.font.color.rgb = TEXT_MUTED
        sp2.space_before = Pt(1)

    add_footer(slide12, 12)

    # =========================================================================
    # SLIDE 13: ENTERPRISE TOPOLOGY & PRODUCTION ACCESS (CLEAN LOGIN SCREENSHOT)
    # =========================================================================
    slide13 = prs.slides.add_slide(blank_layout)
    set_bg(slide13)
    add_header(slide13, "Infrastructure & Live Access: Serverless Edge & Studio OS Credentials", "Infrastructure & Access")

    # Left: Clean Login Screenshot (Framed Browser Card, Without any error!)
    add_browser_screenshot_card(
        slide13, Inches(0.8), Inches(1.50), Inches(5.75), Inches(5.0),
        CLEAN_LOGIN_CARD, "goldfields-bay.vercel.app/admin/login",
        "STUDIO OS EXECUTIVE LOGIN GATEWAY (DEPLOYED AT /admin/login)",
        "Bank-grade authentication with 5 one-click RBAC test personas and automated serverless failover.",
        border_color=BORDER_GOLD
    )

    # Right: Credentials & Topology Breakdown
    add_card(slide13, Inches(6.78), Inches(1.50), Inches(5.75), Inches(5.0), bg=NAVY_CARD, border=BORDER_BLUE, radius_inches=0.15)
    
    # Title Textbox (Discrete top element: 1.68 to 2.00)
    tx_title13 = slide13.shapes.add_textbox(Inches(7.05), Inches(1.68), Inches(5.2), Inches(0.32))
    tr13 = tx_title13.text_frame
    tr13.word_wrap = True
    tr13.margin_left = tr13.margin_top = tr13.margin_bottom = tr13.margin_right = 0
    p = tr13.paragraphs[0]
    p.text = "VERIFIED LIVE ACCESS & CREDENTIALS"
    p.font.name = "Arial"
    p.font.size = Pt(9.5)
    p.font.bold = True
    p.font.color.rgb = GOLD_ACCENT

    # Credentials Box (Starts at 2.05, height 1.40, ends at 3.45)
    add_card(slide13, Inches(7.05), Inches(2.05), Inches(5.2), Inches(1.40), bg=NAVY_SURFACE, border=TURQUOISE, radius_inches=0.12)
    tx_box = slide13.shapes.add_textbox(Inches(7.20), Inches(2.15), Inches(4.9), Inches(1.20))
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
    bp2.text = "Public Flagship: https://goldfields-bay.vercel.app\nStudio OS CMS: https://goldfields-bay.vercel.app/admin/login\nLogin Email: admin@goldfields.com\nAccess: credentials are issued separately by your account manager"
    bp2.font.name = "Courier New"
    bp2.font.size = Pt(8.5)
    bp2.font.color.rgb = TEXT_WHITE
    bp2.space_before = Pt(3)

    # Separate Infrastructure Textbox below the credentials card (Starts at 3.60, ends at 6.35)
    tx_infra = slide13.shapes.add_textbox(Inches(7.05), Inches(3.60), Inches(5.2), Inches(2.75))
    itf = tx_infra.text_frame
    itf.word_wrap = True
    itf.margin_left = itf.margin_top = itf.margin_bottom = itf.margin_right = 0

    infra_feats = [
        ("Next.js 15.5+ App Router Architecture", "Built on React 19 Server Components with zero legacy JavaScript bloat, guaranteeing instant first-paint performance."),
        ("Vercel Global Edge Network", "Deployed across 300+ edge points-of-presence globally, delivering sub-100ms response times worldwide with automatic DDoS mitigation."),
        ("Distributed LibSQL / SQLite Engine", "ACID compliant transactional storage with automated serverless initialization and encrypted session cookies.")
    ]

    for idx, (it, idesc) in enumerate(infra_feats):
        ip1 = itf.paragraphs[0] if idx == 0 else itf.add_paragraph()
        ip1.text = it
        ip1.font.name = "Arial"
        ip1.font.size = Pt(9.5)
        ip1.font.bold = True
        ip1.font.color.rgb = TEXT_WHITE
        if idx > 0:
            ip1.space_before = Pt(8)

        ip2 = itf.add_paragraph()
        ip2.text = idesc
        ip2.font.name = "Arial"
        ip2.font.size = Pt(7.5)
        ip2.font.color.rgb = TEXT_MUTED
        ip2.space_before = Pt(1)

    add_footer(slide13, 13)

    # =========================================================================
    # SLIDE 14: STRATEGIC ROADMAP, BASTION PARTNERSHIP & SIGN-OFF
    # =========================================================================
    slide14 = prs.slides.add_slide(blank_layout)
    set_bg(slide14)
    add_header(slide14, "Strategic Horizon: Innovation Roadmap & Platform Handover", "Handover & Sign-Off")

    # Top Half: Innovation Roadmap
    add_card(slide14, Inches(0.8), Inches(1.50), Inches(11.733), Inches(2.20), bg=NAVY_CARD, border=BORDER_BLUE, radius_inches=0.15)
    
    # Title
    tx_rd = slide14.shapes.add_textbox(Inches(1.05), Inches(1.65), Inches(11.2), Inches(0.30))
    rtf = tx_rd.text_frame
    rtf.word_wrap = True
    rtf.margin_left = rtf.margin_top = rtf.margin_bottom = rtf.margin_right = 0
    rp = rtf.paragraphs[0]
    rp.text = "ONGOING INNOVATION: PHASE 2 & 3 STRATEGIC ROADMAP"
    rp.font.name = "Arial"
    rp.font.size = Pt(9.5)
    rp.font.bold = True
    rp.font.color.rgb = TURQUOISE

    # Phase 02 Nested Card
    add_card(slide14, Inches(1.05), Inches(2.02), Inches(5.45), Inches(1.50), bg=NAVY_SURFACE, border=TURQUOISE, radius_inches=0.12)
    tx_p2 = slide14.shapes.add_textbox(Inches(1.22), Inches(2.12), Inches(5.1), Inches(1.30))
    p2tf = tx_p2.text_frame
    p2tf.word_wrap = True
    p2tf.margin_left = p2tf.margin_top = p2tf.margin_bottom = p2tf.margin_right = 0
    p2p1 = p2tf.paragraphs[0]
    p2p1.text = "PHASE 02: LIVE SCADA & IOT TELEMETRY"
    p2p1.font.name = "Arial"
    p2p1.font.size = Pt(9.5)
    p2p1.font.bold = True
    p2p1.font.color.rgb = GOLD_ACCENT
    p2p2 = p2tf.add_paragraph()
    p2p2.text = "Direct SCADA connection with Khanyisa solar plant and Australian microgrid sensors, streaming live renewable MWh generation and verified carbon offset counters directly to the flagship."
    p2p2.font.name = "Arial"
    p2p2.font.size = Pt(8)
    p2p2.font.color.rgb = TEXT_WHITE
    p2p2.space_before = Pt(2)

    # Phase 03 Nested Card
    add_card(slide14, Inches(6.80), Inches(2.02), Inches(5.45), Inches(1.50), bg=NAVY_SURFACE, border=BORDER_GOLD, radius_inches=0.12)
    tx_p3 = slide14.shapes.add_textbox(Inches(6.98), Inches(2.12), Inches(5.1), Inches(1.30))
    p3tf = tx_p3.text_frame
    p3tf.word_wrap = True
    p3tf.margin_left = p3tf.margin_top = p3tf.margin_bottom = p3tf.margin_right = 0
    p3p1 = p3tf.paragraphs[0]
    p3p1.text = "PHASE 03: MULTI-LANGUAGE AI LOCALIZATION"
    p3p1.font.name = "Arial"
    p3p1.font.size = Pt(9.5)
    p3p1.font.bold = True
    p3p1.font.color.rgb = TURQUOISE
    p3p2 = p3tf.add_paragraph()
    p3p2.text = "Automated neural translation into Spanish (for Salares Norte and Cerro Corona stakeholders) and Canadian French, seamlessly managed and approved through Studio OS workflows."
    p3p2.font.name = "Arial"
    p3p2.font.size = Pt(8)
    p3p2.font.color.rgb = TEXT_WHITE
    p3p2.space_before = Pt(2)

    # Bottom Half: Formal Acceptance & Signatures
    add_card(slide14, Inches(0.8), Inches(3.90), Inches(11.733), Inches(2.65), bg=NAVY_CARD, border=BORDER_GOLD, border_width=1.5, radius_inches=0.15)
    tx_so = slide14.shapes.add_textbox(Inches(1.05), Inches(4.05), Inches(11.2), Inches(0.55))
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
    sop2.text = "By executing this platform handover document, Gold Fields Limited acknowledges the successful engineering and deployment of the Next-Generation Digital Flagship and Studio OS CMS in accordance with enterprise delivery specifications."
    sop2.font.name = "Arial"
    sop2.font.size = Pt(8)
    sop2.font.color.rgb = TEXT_MUTED
    sop2.space_before = Pt(2)

    # Left: BastionGroup - Strictly Benjamin, no title
    add_card(slide14, Inches(1.05), Inches(4.70), Inches(5.45), Inches(1.65), bg=NAVY_SURFACE, border=BORDER_BLUE, radius_inches=0.12)
    tx_sb1 = slide14.shapes.add_textbox(Inches(1.25), Inches(4.80), Inches(5.0), Inches(1.45))
    s1tf = tx_sb1.text_frame
    s1tf.word_wrap = True
    s1tf.margin_left = s1tf.margin_top = s1tf.margin_bottom = s1tf.margin_right = 0

    s1p = s1tf.paragraphs[0]
    s1p.text = "BASTIONGROUP"
    s1p.font.name = "Arial"
    s1p.font.size = Pt(10)
    s1p.font.bold = True
    s1p.font.color.rgb = GOLD_ACCENT

    s1p2 = s1tf.add_paragraph()
    s1p2.text = "Benjamin"
    s1p2.font.name = "Georgia"
    s1p2.font.size = Pt(15)
    s1p2.font.bold = True
    s1p2.font.color.rgb = TEXT_WHITE
    s1p2.space_before = Pt(3)

    line_s1 = slide14.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(1.25), Inches(5.70), Inches(4.8), Inches(0.015))
    line_s1.fill.solid()
    line_s1.fill.fore_color.rgb = BORDER_GOLD
    line_s1.line.fill.background()

    tx_dt1 = slide14.shapes.add_textbox(Inches(1.25), Inches(5.80), Inches(4.8), Inches(0.35))
    d1p = tx_dt1.text_frame.paragraphs[0]
    d1p.text = "Date: 28 September 2026  •  Digital Signature Verified"
    d1p.font.name = "Arial"
    d1p.font.size = Pt(8)
    d1p.font.color.rgb = TURQUOISE

    # Right: Gold Fields Limited
    add_card(slide14, Inches(6.80), Inches(4.70), Inches(5.45), Inches(1.65), bg=NAVY_SURFACE, border=BORDER_BLUE, radius_inches=0.12)
    tx_sb2 = slide14.shapes.add_textbox(Inches(7.00), Inches(4.80), Inches(5.0), Inches(1.45))
    s2tf = tx_sb2.text_frame
    s2tf.word_wrap = True
    s2tf.margin_left = s2tf.margin_top = s2tf.margin_bottom = s2tf.margin_right = 0

    s2p = s2tf.paragraphs[0]
    s2p.text = "GOLD FIELDS LIMITED"
    s2p.font.name = "Arial"
    s2p.font.size = Pt(10)
    s2p.font.bold = True
    s2p.font.color.rgb = TURQUOISE

    s2p2 = s2tf.add_paragraph()
    s2p2.text = "Executive Committee Representative"
    s2p2.font.name = "Georgia"
    s2p2.font.size = Pt(14)
    s2p2.font.bold = True
    s2p2.font.color.rgb = TEXT_WHITE
    s2p2.space_before = Pt(3)

    line_s2 = slide14.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(7.00), Inches(5.70), Inches(4.8), Inches(0.015))
    line_s2.fill.solid()
    line_s2.fill.fore_color.rgb = BORDER_BLUE
    line_s2.line.fill.background()

    tx_dt2 = slide14.shapes.add_textbox(Inches(7.00), Inches(5.80), Inches(4.8), Inches(0.35))
    d2p = tx_dt2.text_frame.paragraphs[0]
    d2p.text = "Date: ________________________  •  Corporate Affairs & IR"
    d2p.font.name = "Arial"
    d2p.font.size = Pt(8)
    d2p.font.color.rgb = TEXT_MUTED

    add_footer(slide14, 14)

    # Save outputs
    pptx_path = os.path.join(OUTPUT_DIR, "Goldfields-BastionGroup-Executive-Deck.pptx")
    prs.save(pptx_path)
    print(f"✅ Generated PPTX presentation at: {pptx_path} ({os.path.getsize(pptx_path)} bytes)")

    # Also copy to Documents and Desktop
    destinations = [
        os.path.join(DOCUMENTS_DIR, "Goldfields-BastionGroup-Executive-Deck.pptx"),
        os.path.join(DOCUMENTS_DIR, "Goldfields-Proposal.pptx"),
        os.path.join(DOCS_ARTIFACTS_DIR, "Goldfields-BastionGroup-Executive-Deck.pptx"),
        "/Users/malcolmgovender/Desktop/Goldfields-Proposal.pptx"
    ]
    for dst in destinations:
        try:
            shutil.copyfile(pptx_path, dst)
            print(f"✅ Copied to: {dst}")
        except Exception as e:
            print(f"⚠️ Error copying to {dst}: {e}")

    # Generate PDF export using LibreOffice
    soffice_bin = "/opt/homebrew/bin/soffice"
    if os.path.exists(soffice_bin):
        pdf_path = os.path.join(OUTPUT_DIR, "Goldfields-BastionGroup-Executive-Deck.pdf")
        subprocess.run([soffice_bin, "--headless", "--convert-to", "pdf", "--outdir", OUTPUT_DIR, pptx_path], check=False)
        if os.path.exists(pdf_path):
            print(f"✅ Generated PDF presentation at: {pdf_path} ({os.path.getsize(pdf_path)} bytes)")
            pdf_dests = [
                os.path.join(DOCUMENTS_DIR, "Goldfields-BastionGroup-Executive-Deck.pdf"),
                os.path.join(DOCUMENTS_DIR, "Goldfields-Proposal.pdf"),
                os.path.join(DOCS_ARTIFACTS_DIR, "Goldfields-BastionGroup-Executive-Deck.pdf"),
                "/Users/malcolmgovender/Desktop/Goldfields-Proposal.pdf"
            ]
            for pdst in pdf_dests:
                try:
                    shutil.copyfile(pdf_path, pdst)
                    print(f"✅ Copied PDF to: {pdst}")
                except Exception as e:
                    print(f"⚠️ Error copying PDF to {pdst}: {e}")

if __name__ == "__main__":
    create_deck()

