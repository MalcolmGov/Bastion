import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ASSETS_DIR = 'public/assets'
SRC_APP_DIR = 'src/app'

emblem = Image.open('/tmp/emblem_transparent.png').convert('RGBA')
ew, eh = emblem.size

# Fonts
font_title = ImageFont.truetype('/System/Library/Fonts/Supplemental/Georgia Bold.ttf', 64)
font_badge = ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial Bold.ttf', 16)
font_tagline = ImageFont.truetype('/System/Library/Fonts/Supplemental/Georgia.ttf', 27)
font_pill = ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial Bold.ttf', 16)
font_small = ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial.ttf', 15)
font_domain = ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial Bold.ttf', 15)

# --- 1. 1200 x 630 LANDSCAPE OG CARD ---
W, H = 1200, 630
card = Image.new('RGBA', (W, H), (6, 29, 50, 255)) # #061D32
draw = ImageDraw.Draw(card)

# Background gradient & ambient lighting
# Create soft radial glow around (260, 315)
glow = Image.new('RGBA', (W, H), (0, 0, 0, 0))
glow_draw = ImageDraw.Draw(glow)
glow_center = (250, 315)
for r in range(280, 50, -10):
    alpha = int(35 * (1 - r / 280))
    glow_draw.ellipse(
        [glow_center[0] - r, glow_center[1] - r, glow_center[0] + r, glow_center[1] + r],
        fill=(200, 160, 100, alpha)
    )
card = Image.alpha_composite(card, glow)
draw = ImageDraw.Draw(card)

# Outer refined gold hairline border
draw.rectangle([24, 24, W - 25, H - 25], outline=(183, 152, 85, 90), width=1)
draw.rectangle([28, 28, W - 29, H - 29], outline=(183, 152, 85, 45), width=1)

# Corner accents
c_len = 16
for (cx, cy) in [(24, 24), (W - 25, 24), (24, H - 25), (W - 25, H - 25)]:
    dx = 1 if cx == 24 else -1
    dy = 1 if cy == 24 else -1
    draw.line([(cx, cy), (cx + dx * c_len, cy)], fill=(200, 160, 100, 220), width=2)
    draw.line([(cx, cy), (cx, cy + dy * c_len)], fill=(200, 160, 100, 220), width=2)

# Place emblem on left side
target_emblem_size = 270
scale = target_emblem_size / max(ew, eh)
nw, nh = int(ew * scale), int(eh * scale)
emblem_resized = emblem.resize((nw, nh), Image.Resampling.LANCZOS)
emblem_pos = (115, (H - nh) // 2)
card.paste(emblem_resized, emblem_pos, emblem_resized)

# Right side content coordinates
tx = 440
ty = 135

# 1. Category Badge
badge_text = "GLOBAL DIVERSIFIED GOLD PRODUCER"
draw.text((tx, ty), badge_text, fill=(200, 160, 100, 255), font=font_badge)

# 2. Main Title
title_y = ty + 32
draw.text((tx, title_y), "GOLD FIELDS", fill=(255, 255, 255, 255), font=font_title)

# Gold decorative underline
line_y = title_y + 82
draw.line([(tx, line_y), (tx + 90, line_y)], fill=(200, 160, 100, 240), width=3)
draw.line([(tx + 100, line_y), (tx + 140, line_y)], fill=(0, 229, 192, 220), width=3)

# 3. Tagline
tagline_y = line_y + 20
draw.text((tx, tagline_y), "Creating Enduring Value Beyond Mining", fill=(226, 231, 234, 255), font=font_tagline)

# 4. Interactive pills / metadata row
pills_y = tagline_y + 60

# Pill 1: JSE / NYSE: GFI
p1_text = "JSE / NYSE: GFI"
p1_w = int(draw.textlength(p1_text, font=font_pill)) + 26
draw.rounded_rectangle([tx, pills_y, tx + p1_w, pills_y + 36], radius=8, fill=(10, 53, 90, 220), outline=(200, 160, 100, 160), width=1)
draw.text((tx + 13, pills_y + 9), p1_text, fill=(235, 195, 120, 255), font=font_pill)

# Pill 2: H1 2026 Operational Results
p2_x = tx + p1_w + 14
p2_text = "H1 2026 Results"
p2_w = int(draw.textlength(p2_text, font=font_pill)) + 26
draw.rounded_rectangle([p2_x, pills_y, p2_x + p2_w, pills_y + 36], radius=8, fill=(10, 53, 90, 220), outline=(0, 229, 192, 160), width=1)
draw.text((p2_x + 13, pills_y + 9), p2_text, fill=(0, 229, 192, 255), font=font_pill)

# Pill 3: 2030 ESG Targets
p3_x = p2_x + p2_w + 14
p3_text = "2030 ESG Targets"
p3_w = int(draw.textlength(p3_text, font=font_pill)) + 26
draw.rounded_rectangle([p3_x, pills_y, p3_x + p3_w, pills_y + 36], radius=8, fill=(10, 53, 90, 220), outline=(36, 99, 77, 180), width=1)
draw.text((p3_x + 13, pills_y + 9), p3_text, fill=(111, 210, 165, 255), font=font_pill)

# 5. Global Operations Footprint strip
ops_y = pills_y + 64
ops_label = "OPERATIONS:"
draw.text((tx, ops_y), ops_label, fill=(200, 160, 100, 220), font=font_badge)
label_w = int(draw.textlength(ops_label, font=font_badge)) + 10
ops_countries = "Australia  •  Canada  •  Chile  •  Ghana  •  Peru  •  South Africa"
draw.text((tx + label_w, ops_y - 1), ops_countries, fill=(138, 155, 168, 255), font=font_small)

# 6. Bottom domain verification
draw.text((W - 195, H - 56), "www.goldfields.com", fill=(200, 160, 100, 180), font=font_domain)

# Save 1200x630 card
og_path_assets = os.path.join(ASSETS_DIR, 'goldfields-og-share.png')
og_path_app = os.path.join(SRC_APP_DIR, 'opengraph-image.png')
tw_path_app = os.path.join(SRC_APP_DIR, 'twitter-image.png')

card.convert('RGB').save(og_path_assets, 'PNG', optimize=True)
card.convert('RGB').save(og_path_app, 'PNG', optimize=True)
card.convert('RGB').save(tw_path_app, 'PNG', optimize=True)
print("1200x630 OG Card generated.")

# --- 2. 600 x 600 SQUARE WHATSAPP CARD ---
SW, SH = 600, 600
sq_card = Image.new('RGBA', (SW, SH), (6, 29, 50, 255))
sq_draw = ImageDraw.Draw(sq_card)

# Border
sq_draw.rectangle([16, 16, SW - 17, SH - 17], outline=(183, 152, 85, 90), width=1)

# Glow
sq_glow = Image.new('RGBA', (SW, SH), (0, 0, 0, 0))
sq_glow_draw = ImageDraw.Draw(sq_glow)
for r in range(220, 30, -10):
    alpha = int(40 * (1 - r / 220))
    sq_glow_draw.ellipse(
        [300 - r, 200 - r, 300 + r, 200 + r],
        fill=(200, 160, 100, alpha)
    )
sq_card = Image.alpha_composite(sq_card, sq_glow)
sq_draw = ImageDraw.Draw(sq_card)

# Center emblem
target_sq_emblem = 230
sq_scale = target_sq_emblem / max(ew, eh)
sq_nw, sq_nh = int(ew * sq_scale), int(eh * sq_scale)
sq_emblem_resized = emblem.resize((sq_nw, sq_nh), Image.Resampling.LANCZOS)
sq_emblem_pos = ((SW - sq_nw) // 2, 75)
sq_card.paste(sq_emblem_resized, sq_emblem_pos, sq_emblem_resized)

# Center text below emblem
font_sq_title = ImageFont.truetype('/System/Library/Fonts/Supplemental/Georgia Bold.ttf', 44)
font_sq_tagline = ImageFont.truetype('/System/Library/Fonts/Supplemental/Georgia.ttf', 21)
font_sq_pill = ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial Bold.ttf', 14)

sq_title = "GOLD FIELDS"
sq_title_w = int(sq_draw.textlength(sq_title, font=font_sq_title))
sq_draw.text(((SW - sq_title_w) // 2, 335), sq_title, fill=(255, 255, 255, 255), font=font_sq_title)

# Underline
sq_draw.line([(260, 395), (340, 395)], fill=(200, 160, 100, 240), width=2)

sq_tag = "Creating Enduring Value Beyond Mining"
sq_tag_w = int(sq_draw.textlength(sq_tag, font=font_sq_tagline))
sq_draw.text(((SW - sq_tag_w) // 2, 415), sq_tag, fill=(226, 231, 234, 255), font=font_sq_tagline)

# Pill: JSE / NYSE: GFI • Official Portal
sq_pill_text = "JSE / NYSE: GFI  •  Global Mining Flagship"
sq_pill_w = int(sq_draw.textlength(sq_pill_text, font=font_sq_pill)) + 24
sq_pill_x = (SW - sq_pill_w) // 2
sq_draw.rounded_rectangle([sq_pill_x, 465, sq_pill_x + sq_pill_w, 465 + 32], radius=6, fill=(10, 53, 90, 220), outline=(200, 160, 100, 160), width=1)
sq_draw.text((sq_pill_x + 12, 465 + 8), sq_pill_text, fill=(235, 195, 120, 255), font=font_sq_pill)

# Bottom operations summary
sq_ops = "South Africa • Australia • Ghana • Chile • Peru • Canada"
sq_ops_w = int(sq_draw.textlength(sq_ops, font=font_small))
sq_draw.text(((SW - sq_ops_w) // 2, 520), sq_ops, fill=(138, 155, 168, 255), font=font_small)

sq_og_path = os.path.join(ASSETS_DIR, 'goldfields-og-square.png')
sq_card.convert('RGB').save(sq_og_path, 'PNG', optimize=True)
print("600x600 Square WhatsApp Card generated.")
