import sys, glob, os
from PIL import Image, ImageDraw

size = sys.argv[1] if len(sys.argv) > 1 else 'feed45'
order = ['hero', 'sale', 'problem', 'info', 'social']
tw = 224
ratio = (1350/1080) if size == 'feed45' else (1920/1080)
th = int(tw * ratio)
gap = 10
labh = 26
cols, rows = 5, 15
W = cols*tw + (cols+1)*gap
H = rows*(th+labh) + (rows+1)*gap
sheet = Image.new('RGB', (W, H), '#202020')
d = ImageDraw.Draw(sheet)
for r in range(1, 16):
    for ci, arch in enumerate(order):
        f = f'creatives/{size}/p{r:02d}_{arch}.png'
        if not os.path.exists(f):
            continue
        im = Image.open(f).convert('RGB').resize((tw, th))
        x = gap + ci*(tw+gap)
        y = gap + (r-1)*(th+labh+gap)
        sheet.paste(im, (x, y))
        d.text((x+4, y+th+6), f'p{r:02d} {arch}', fill='#bbb')
sheet.save(f'creatives/_montage_{size}.png')
print('saved', f'creatives/_montage_{size}.png', sheet.size)
