import json, re, glob

products = {p['handle']: p for p in json.load(open('data/products-full.json'))}

# Build best-selling order across paginated HTML
order = []
for f in sorted(glob.glob('data/bs-all-*.html')):
    html = open(f, encoding='utf-8', errors='ignore').read()
    for m in re.finditer(r'/products/([a-z0-9\-]+)', html):
        h = m.group(1)
        if h not in order:
            order.append(h)

# Keep only supplement/nutrition products (ingestible), exclude gear/apparel/monster/coaching
EXCLUDE_TYPES = {'kleding & accessoires', 'Monster Energy', 'Coaching by Kosso',
                 'Duffelbag', 'Fitness riem', 'Wrist Wrap', 'Massage Gun',
                 'lifting strap', 'Arm Blaster', 'Kast (Alles in een)', ''}

ranked = []
for h in order:
    p = products.get(h)
    if not p or p['type'] in EXCLUDE_TYPES: continue
    if not p['available'] or not p['image']: continue
    ranked.append(p)

top15 = ranked[:15]
print(f'Best-selling order parsed: {len(order)} handles; eligible supplements/nutrition: {len(ranked)}\n')
print('TOP 15:')
for i, p in enumerate(top15, 1):
    print(f'{i:2d}. {p["title"][:46]:46s} EUR {str(p["price"]):>6}  [{p["type"]}] imgs={len(p["images"])}')

json.dump(ranked, open('data/ranked-supplements.json', 'w'), indent=2, ensure_ascii=False)
json.dump(top15, open('data/top15.json', 'w'), indent=2, ensure_ascii=False)
print(f'\nSaved data/top15.json ({len(top15)}) and ranked list ({len(ranked)})')
