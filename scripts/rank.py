import json, re

# Best-selling order from the supplements collection HTML
html = open('/tmp/bs.html', encoding='utf-8', errors='ignore').read()
# also fetch fitness-supplementen specifically
import subprocess
CA='/root/.ccr/ca-bundle.crt'
subprocess.run(['curl','-sS','-L','--cacert',CA,'-o','/tmp/fs.html',
                'https://kossonutrition.nl/collections/fitness-supplementen?sort_by=best-selling'])
fs = open('/tmp/fs.html', encoding='utf-8', errors='ignore').read()

def order(html):
    seen=[]
    for m in re.finditer(r'/products/([a-z0-9\-]+)', html):
        h=m.group(1)
        if h not in seen:
            seen.append(h)
    return seen

fs_order = order(fs)
products = {p['handle']: p for p in json.load(open('data/products-full.json'))}

# Non-supplement types to exclude
EXCLUDE_TYPES = {'kleding & accessoires','Monster Energy','Coaching by Kosso',
                 'Duffelbag','Fitness riem','Wrist Wrap','Massage Gun',
                 'lifting strap','Arm Blaster','Kast (Alles in een)',''}

ranked=[]
for h in fs_order:
    p = products.get(h)
    if not p: continue
    if p['type'] in EXCLUDE_TYPES: continue
    if not p['available']: continue
    if not p['image']: continue
    ranked.append(p)

print('Best-selling supplement/nutrition order (first 25):')
for i,p in enumerate(ranked[:25],1):
    print(f'{i:2d}. {p["title"][:48]:48s}  EUR {p["price"]:>6}  [{p["type"]}]  imgs={len(p["images"])}')

json.dump(ranked, open('data/ranked-supplements.json','w'), indent=2, ensure_ascii=False)
print('\nSaved', len(ranked), 'ranked supplement products')
