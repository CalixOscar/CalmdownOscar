"""Generate the site's favicon set.

Two marks, because calmdownoscar.com is a studio site listing several apps:

  * the studio pages get a "co" monogram drawn from the site's own wordmark —
    "calmdown" in --ink, "oscar" in --accent, on --slate
  * the two Shuttle Vision pages get the app's own icon

At 16 and 32 pixels the full app icon collapses into a dark smudge, so the
small sizes use a crop tightened onto the rackets, which is the only part with
enough contrast to survive.
"""
from PIL import Image, ImageDraw, ImageFont
import os

SITE = "$SITE_ROOT"
OUT = os.path.join(SITE, "assets", "favicon")
os.makedirs(OUT, exist_ok=True)

SLATE = (20, 27, 34)
INK = (232, 238, 244)
ACCENT = (228, 71, 29)
INTER = os.path.join(SITE, "assets", "fonts", "Inter-Variable.woff2")

# --- studio monogram -------------------------------------------------------

def load_inter(size):
    f = ImageFont.truetype(INTER, size)
    try:
        f.set_variation_by_axes([800])     # match the wordmark's weight
    except Exception:
        pass
    return f

def monogram(px):
    scale = 4
    n = px * scale
    im = Image.new("RGB", (n, n), SLATE)
    d = ImageDraw.Draw(im)
    font = load_inter(int(n * 0.62))
    c_w = d.textlength("c", font=font)
    o_w = d.textlength("o", font=font)
    total = c_w + o_w
    box = d.textbbox((0, 0), "co", font=font)
    x = (n - total) / 2
    y = (n - (box[3] - box[1])) / 2 - box[1]
    d.text((x, y), "c", font=font, fill=INK)
    d.text((x + c_w, y), "o", font=font, fill=ACCENT)
    return im.resize((px, px), Image.LANCZOS)

studio_512 = monogram(512)
studio_512.save(os.path.join(OUT, "favicon-512.png"), optimize=True)
for s in (16, 32, 180):
    monogram(s).save(os.path.join(OUT, f"favicon-{s}.png"), optimize=True)
os.replace(os.path.join(OUT, "favicon-180.png"), os.path.join(OUT, "apple-touch-icon.png"))
studio_512.save(os.path.join(OUT, "favicon.ico"), sizes=[(16, 16), (32, 32), (48, 48)])

# --- Shuttle Vision --------------------------------------------------------

app = Image.open(
    "$SHUTTLE_VISION_ICON_DIR/"
    "Assets.xcassets/AppIcon.appiconset/ShuttleVision-AppIcon.png"
).convert("RGB")

app.resize((180, 180), Image.LANCZOS).save(os.path.join(OUT, "shuttle-vision-touch-icon.png"), optimize=True)

# Tighter crop for the sizes where the tripod and strings would disappear.
# Framed on the two racket heads plus the shuttle, which is the densest part
# of the artwork and the only region with enough contrast to survive 16px.
w, h = app.size
tight = app.crop((int(0.305 * w), int(0.320 * h), int(0.925 * w), int(0.940 * h)))
# A photoreal render on near-black loses its subject entirely once it is 32
# pixels wide, so the tab sizes get their midtones lifted. Only these do — the
# 180px touch icon is left exactly as the app ships it.
def punch(img):
    lut = [min(255, int(((v / 255.0) ** 0.62) * 255 * 1.18)) for v in range(256)]
    return img.point(lut * 3)

small = punch(tight)
for s in (16, 32):
    small.resize((s, s), Image.LANCZOS).save(os.path.join(OUT, f"shuttle-vision-favicon-{s}.png"), optimize=True)
small.resize((256, 256), Image.LANCZOS).save(
    os.path.join(OUT, "shuttle-vision-favicon.ico"), sizes=[(16, 16), (32, 32), (48, 48)]
)

print("written to", OUT)
print(sorted(os.listdir(OUT)))
