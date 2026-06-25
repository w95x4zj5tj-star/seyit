"""Resize full-res creatives to 560px-wide JPEG thumbnails for the lookbook/PDF."""
import os
from PIL import Image
order = ['hero', 'sale', 'problem', 'info', 'social']
TW = 560
n = 0
for size in ('feed45', 'story'):
    os.makedirs(f'output/thumbs/{size}', exist_ok=True)
    for r in range(1, 16):
        for arch in order:
            src = f'creatives/{size}/p{r:02d}_{arch}.png'
            if not os.path.exists(src):
                continue
            im = Image.open(src).convert('RGB')
            th = round(TW * im.height / im.width)
            im = im.resize((TW, th), Image.LANCZOS)
            im.save(f'output/thumbs/{size}/p{r:02d}_{arch}.jpg', quality=82, optimize=True)
            n += 1
print('thumbs written:', n)
