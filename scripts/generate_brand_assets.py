import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

# 1. Base paths
PUBLIC_DIR = 'public'
SRC_APP_DIR = 'src/app'
ASSETS_DIR = 'public/assets'

os.makedirs(ASSETS_DIR, exist_ok=True)
os.makedirs(SRC_APP_DIR, exist_ok=True)

# 2. Load transparent emblem
emblem = Image.open('/tmp/emblem_transparent.png').convert('RGBA')
ew, eh = emblem.size

# Function to center emblem inside a square transparent canvas
def make_square_icon(size, padding_ratio=0.08):
    canvas = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    target_size = int(size * (1 - 2 * padding_ratio))
    # Resize emblem with high quality LANCZOS
    scale = min(target_size / ew, target_size / eh)
    nw, nh = int(ew * scale), int(eh * scale)
    resized_emblem = emblem.resize((nw, nh), Image.Resampling.LANCZOS)
    offset = ((size - nw) // 2, (size - nh) // 2)
    canvas.paste(resized_emblem, offset, resized_emblem)
    return canvas

# Generate square icons
icon_512 = make_square_icon(512, padding_ratio=0.06)
icon_192 = make_square_icon(192, padding_ratio=0.06)
icon_48  = make_square_icon(48,  padding_ratio=0.04)
icon_32  = make_square_icon(32,  padding_ratio=0.04)
icon_16  = make_square_icon(16,  padding_ratio=0.02)

# Save standard icons
icon_512.save(os.path.join(PUBLIC_DIR, 'icon-512.png'), 'PNG', optimize=True)
icon_192.save(os.path.join(PUBLIC_DIR, 'icon-192.png'), 'PNG', optimize=True)
icon_32.save(os.path.join(PUBLIC_DIR, 'icon.png'), 'PNG', optimize=True)
icon_32.save(os.path.join(SRC_APP_DIR, 'icon.png'), 'PNG', optimize=True)

# Generate multi-resolution favicon.ico
# Combine 16, 32, 48 into one .ico
icon_48.save(
    os.path.join(PUBLIC_DIR, 'favicon.ico'),
    format='ICO',
    sizes=[(16, 16), (32, 32), (48, 48)]
)
icon_48.save(
    os.path.join(SRC_APP_DIR, 'favicon.ico'),
    format='ICO',
    sizes=[(16, 16), (32, 32), (48, 48)]
)

# Apple Touch Icon: 180x180 with elegant deep navy background & gold accent border
def make_apple_icon():
    size = 180
    bg_color = (8, 43, 73, 255) # Deep navy #082B49
    canvas = Image.new('RGBA', (size, size), bg_color)
    draw = ImageDraw.Draw(canvas)
    
    # Subtle inner gold border
    draw.rounded_rectangle([4, 4, size - 5, size - 5], radius=32, outline=(183, 152, 85, 80), width=2)
    
    # Place emblem in center
    target_size = 136
    scale = min(target_size / ew, target_size / eh)
    nw, nh = int(ew * scale), int(eh * scale)
    resized_emblem = emblem.resize((nw, nh), Image.Resampling.LANCZOS)
    offset = ((size - nw) // 2, (size - nh) // 2)
    canvas.paste(resized_emblem, offset, resized_emblem)
    return canvas

apple_icon = make_apple_icon()
apple_icon.save(os.path.join(PUBLIC_DIR, 'apple-icon.png'), 'PNG', optimize=True)
apple_icon.save(os.path.join(SRC_APP_DIR, 'apple-icon.png'), 'PNG', optimize=True)

print("Favicons and Apple icons generated successfully.")
