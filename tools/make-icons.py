"""Draws the app icons into ../icons. Run: python3 tools/make-icons.py (needs Pillow)."""
from pathlib import Path
from PIL import Image, ImageDraw

OUT = Path(__file__).resolve().parent.parent / "icons"
BG = (21, 19, 16)          # dark page background
PAPER = (240, 235, 227)    # staff lines and notes
ACCENT = (238, 154, 69)    # the "now playing" orange


def draw(size: int) -> Image.Image:
    s = 1024  # draw large, then shrink for smooth edges
    img = Image.new("RGB", (s, s), BG)
    d = ImageDraw.Draw(img)
    # A five-line staff with three rising quarter notes, inside the safe zone iOS/Android won't crop
    left, right, gap, top = 170, 854, 64, 384
    for i in range(5):
        y = top + i * gap
        d.rectangle([left, y - 5, right, y + 5], fill=PAPER)
    for i, (x, step) in enumerate([(360, 5), (520, 3), (680, 1)]):
        cy = top + step * gap // 2
        color = ACCENT if i == 2 else PAPER
        head = Image.new("RGBA", (140, 140), (0, 0, 0, 0))
        ImageDraw.Draw(head).ellipse([20, 36, 120, 104], fill=color)
        head = head.rotate(22, resample=Image.BICUBIC)
        img.paste(head, (x - 70, cy - 70), head)
        d.rectangle([x + 37, cy - 220, x + 49, cy - 8], fill=color)  # stem up, right side
    return img.resize((size, size), Image.LANCZOS)


OUT.mkdir(exist_ok=True)
for name, size in [("icon-192.png", 192), ("icon-512.png", 512), ("apple-touch-icon.png", 180)]:
    draw(size).save(OUT / name, optimize=True)
    print("wrote", OUT / name)
