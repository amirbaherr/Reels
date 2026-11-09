"""Generate paper grain + stamp-ink mask textures used by index.html."""
import numpy as np
from PIL import Image, ImageFilter
from pathlib import Path

out = Path(__file__).parent
rng = np.random.default_rng(7)
W, H = 1080, 1920

def blob(scale, amp):
    small = rng.random((H // scale + 2, W // scale + 2))
    im = Image.fromarray((small * 255).astype(np.uint8)).resize((W, H), Image.BICUBIC)
    return (np.asarray(im, np.float32) / 255 - 0.5) * amp

g = 1.0 + blob(160, 0.05) + blob(40, 0.04) + blob(8, 0.03)
g += (rng.random((H, W)) - 0.5) * 0.07          # fine grain
# paper fibres: short faint strokes
fib = Image.new("L", (W, H), 0)
from PIL import ImageDraw
d = ImageDraw.Draw(fib)
for _ in range(1400):
    x, y = rng.random() * W, rng.random() * H
    a = rng.random() * np.pi
    L = 6 + rng.random() * 22
    d.line([(x, y), (x + np.cos(a) * L, y + np.sin(a) * L)], fill=int(40 + rng.random() * 60), width=1)
fib = np.asarray(fib.filter(ImageFilter.GaussianBlur(0.6)), np.float32) / 255
g -= fib * 0.12
# vignette
yy, xx = np.mgrid[0:H, 0:W]
r = np.sqrt(((xx - W / 2) / (W * 0.62)) ** 2 + ((yy - H / 2) / (H * 0.62)) ** 2)
g *= 1 - np.clip(r - 0.55, 0, 1) * 0.28
g = np.clip(g * 0.985, 0, 1)
Image.fromarray((g * 255).astype(np.uint8)).save(out / "grain.png", optimize=True)

# stamp mask: mostly opaque with ink gaps
m = 1.0 - np.clip((rng.random((128, 256)) - 0.80) * 6, 0, 1)
mi = Image.fromarray((m * 255).astype(np.uint8)).resize((768, 384), Image.BICUBIC).filter(ImageFilter.GaussianBlur(1.2))
a = np.asarray(mi, np.float32) / 255
a = np.where(a > 0.62, 1.0, a * 0.6)
rgba = np.zeros((384, 768, 4), np.uint8)
rgba[..., :3] = 255
rgba[..., 3] = ((1 - a) * 255).astype(np.uint8)   # white ink-gaps, laid over the stamp
Image.fromarray(rgba, "RGBA").save(out / "stampspeck.png", optimize=True)
print("ok")
