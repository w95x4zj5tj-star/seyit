import json, glob

prods = []
for f in sorted(glob.glob('data/products-raw-*.json')):
    prods += json.load(open(f))['products']

slim = []
for p in prods:
    slim.append({
        'handle': p['handle'],
        'title': p['title'],
        'vendor': p.get('vendor'),
        'type': p.get('product_type'),
        'tags': p.get('tags'),
        'price': (p['variants'][0]['price'] if p.get('variants') else None),
        'available': any(v.get('available') for v in p.get('variants', [])),
        'image': (p['images'][0]['src'] if p.get('images') else None),
        'images': [i['src'] for i in p.get('images', [])],
    })

json.dump(slim, open('data/products-full.json', 'w'), indent=2, ensure_ascii=False)

# Summary by type
from collections import Counter
types = Counter(p['type'] for p in slim)
print('Total products:', len(slim))
print('Available:', sum(1 for p in slim if p['available']))
print('\nBy type:')
for t, c in types.most_common():
    print(f'  {c:3d}  {t}')
