"""Draws the app icons into ../icons. Run: python3 tools/make-icons.py (needs Pillow).
An orange eighth note and a cream exclamation mark on the app's dark background: page fright!"""
import math
from pathlib import Path
from PIL import Image, ImageDraw

OUT = Path(__file__).resolve().parent.parent / "icons"
BG = (21, 19, 16)          # dark page background
PAPER = (240, 235, 227)    # cream text color
ACCENT = (238, 154, 69)    # the app's orange


def bezier(p0, p1, p2, p3, n=40):
    pts = []
    for i in range(n + 1):
        t = i / n
        a, b, c, d = (1 - t) ** 3, 3 * t * (1 - t) ** 2, 3 * t * t * (1 - t), t ** 3
        pts.append((a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0], a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1]))
    return pts


def draw(size: int = 1024) -> Image.Image:
    s = 1024  # draw large, then shrink for smooth edges
    img = Image.new("RGB", (s, s), BG)
    d = ImageDraw.Draw(img)

    # Eighth note: a tilted notehead, a stem touching its right edge, and a curved flag.
    A, Bh, tilt = 165, 115, 24               # notehead half-width, half-height, tilt (degrees)
    head = Image.new("RGBA", (440, 440), (0, 0, 0, 0))
    ImageDraw.Draw(head).ellipse([220 - A, 220 - Bh, 220 + A, 220 + Bh], fill=ACCENT)
    head = head.rotate(tilt, resample=Image.BICUBIC)
    hx, hy = 335, 735                        # notehead centre
    img.paste(head, (hx - 220, hy - 220), head)
    # Where the tilted ellipse reaches furthest right: the stem's right edge goes there.
    c, sn = math.cos(math.radians(tilt)), math.sin(math.radians(tilt))
    xr = math.sqrt((A * c) ** 2 + (Bh * sn) ** 2)
    yr = (A * A - Bh * Bh) * sn * c / xr    # how far above the centre that point is
    stem_r, stem_w, top_y = hx + xr, 46, 150
    d.rectangle([stem_r - stem_w, top_y, stem_r, hy - yr], fill=ACCENT)
    top = (stem_r, top_y)
    outer = bezier(top, (top[0] + 30, 300), (top[0] + 230, 330), (top[0] + 170, 600))
    inner = bezier((top[0] + 170, 600), (top[0] + 190, 430), (top[0] + 60, 360), (top[0] - 2, 330))
    d.polygon([(stem_r - stem_w, top_y)] + outer + inner, fill=ACCENT)

    # Exclamation mark: a tapering bar and a dot.
    x0 = 790
    d.polygon([(x0 - 62, 150), (x0 + 62, 150), (x0 + 34, 640), (x0 - 34, 640)], fill=PAPER)
    d.ellipse([x0 - 62, 88, x0 + 62, 212], fill=PAPER)   # round the top
    d.ellipse([x0 - 66, 712, x0 + 66, 844], fill=PAPER)
    return img


def maskable() -> Image.Image:
    """Android crops icons to a circle, so this copy has the drawing shrunk to fit inside it."""
    art = draw(1024).resize((800, 800), Image.LANCZOS)
    img = Image.new("RGB", (1024, 1024), BG)
    img.paste(art, (112, 112))
    return img


OUT.mkdir(exist_ok=True)
for name, size in [("icon-192.png", 192), ("icon-512.png", 512), ("apple-touch-icon.png", 180)]:
    draw(size).resize((size, size), Image.LANCZOS).save(OUT / name, optimize=True)
    print("wrote", OUT / name)
maskable().resize((512, 512), Image.LANCZOS).save(OUT / "icon-maskable-512.png", optimize=True)
print("wrote", OUT / "icon-maskable-512.png")
