"""Product images from Shopify are already transparent (palette PNG w/ alpha).
Preserve alpha, autocrop to content, sample dominant accent color."""
import json, os
import numpy as np
from PIL import Image
from collections import Counter

os.makedirs('assets/products_cut', exist_ok=True)
manifest = json.load(open('data/top15-manifest.json'))

def load_rgba(path):
    return Image.open(path).convert('RGBA')

def autocrop(im, pad=10):
    a = np.array(im)
    ys, xs = np.where(a[:, :, 3] > 12)
    if not len(xs):
        return im
    h, w = a.shape[:2]
    x0, x1 = max(0, xs.min()-pad), min(w, xs.max()+pad)
    y0, y1 = max(0, ys.min()-pad), min(h, ys.max()+pad)
    return Image.fromarray(a[y0:y1, x0:x1], 'RGBA')

def accent_color(im):
    a = np.array(im)
    mask = a[:, :, 3] > 200
    rgb = a[:, :, :3][mask].astype(float)
    if len(rgb) == 0:
        return '#E84E4E'
    mx, mn = rgb.max(1), rgb.min(1)
    sat, val = mx - mn, mx
    good = (sat > 70) & (val > 80) & (val < 245)
    cand = rgb[good]
    if len(cand) < 80:
        return '#E84E4E'
    q = (cand // 24 * 24 + 12).astype(int)
    common = Counter(tuple(c) for c in q).most_common(1)[0][0]
    return '#%02X%02X%02X' % common

out = []
for p in manifest:
    im = autocrop(load_rgba(p['images'][0]))
    cut = f"assets/products_cut/p{p['rank']:02d}.png"
    im.save(cut)
    acc = accent_color(im)
    p2 = dict(p, cut=cut, accent=acc, cut_size=im.size)
    out.append(p2)
    print(f"p{p['rank']:02d} {p['title'][:32]:32s} accent={acc} cut={im.size}")

json.dump(out, open('data/top15-manifest.json', 'w'), indent=2, ensure_ascii=False)
print('OK cutouts preserved with alpha')
