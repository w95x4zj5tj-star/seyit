# -*- coding: utf-8 -*-
"""Generate photoreal Higgsfield (Soul) text-to-image SCENE prompts per product x format.
These are rich, fully-art-directed product-photography SETS (lit pedestal, depth, props,
category-matched atmosphere) — NOT flat backdrops. The real product cut-out, real logo and
NVWA/EU claim-safe copy are composited on top by render.js --aibg, so the scene must contain
NO product and NO text/logo, and must reserve an empty, spotlit product stage with deep
shadow at the top and bottom edges where the headline and CTA copy will sit."""
import json

specs = json.load(open('data/copy.json'))

# scene direction by product type/category — a complete set, not a backdrop
def scene(p):
    t = (p['type'] or '').lower()
    name = p['name']
    acc = p['accent']
    if 'pre workout' in t or 'pre-work' in name.lower() or p['rank'] in (4,5,7,9,12,13):
        return (f"dark dramatic cinematic product-photography set, empty wet black-concrete podium catching a "
                f"hard spotlight, explosive swirling {p.get('flavor','')} coloured smoke and powder bursting in "
                f"{acc} tones, volumetric god-rays and rim light, energetic underground-gym atmosphere, glowing "
                f"{acc} haze, high-contrast, moody, deep cinematic depth of field")
    if 'whey' in t or 'protein' in t or 'isola' in t or 'whey' in name.lower():
        return (f"clean premium studio set, empty polished marble podium on a soft gradient cyclorama in {acc} "
                f"and white, dynamic milk and protein splash frozen mid-air around the stage, bright crisp "
                f"product-photography softboxes, fresh dairy droplets, airy, glossy reflections, shallow depth of field")
    if 'creatine' in t:
        return (f"premium laboratory-grade studio set, empty illuminated white pedestal, subtle {acc} gradient "
                f"glow, fine crystalline white powder drifting through a soft top spotlight, scientific clinical "
                f"premium feel, glassy reflective floor, generous negative space, cinematic")
    if 'electrolyt' in t:
        return (f"fresh vibrant hydration set, empty glass podium amid a crystal-clear water splash and flying "
                f"citrus slices, bright {acc} gradient sky, sparkling droplets suspended in air, summer energy, "
                f"clean refreshing mood, airy, high-key with crisp highlights")
    if 'gainer' in t or 'bulk' in name.lower():
        return (f"bold heavy gym studio set, empty raw-concrete plinth, dense dust and powder burst exploding in "
                f"{acc}, dramatic hard side light and long shadows, industrial strength atmosphere, mass-building "
                f"power, cinematic grit")
    if 'vitam' in t or 'ashwa' in name.lower():
        return (f"natural earthy botanical set, empty raw-stone pedestal in soft warm daylight, ashwagandha roots, "
                f"green leaves and dried herbs scattered as foreground bokeh, warm neutral and {acc} tones, calm "
                f"organic wellness mood, linen and wood textures, shallow depth of field")
    # foods: bars, pops, coffee, pancakes
    if any(k in name.lower() for k in ('bar','pops','ijskoffie','pancake','oats')):
        return (f"appetising lifestyle food set, empty marble-and-wood riser in soft natural kitchen light, "
                f"chocolate drips, cereal, coffee beans and crumbs styled around the stage, {acc} colour pop, "
                f"warm inviting mood, rich shallow depth of field, tasty and fresh")
    return (f"premium studio advertising set, empty spotlit podium on a {acc} gradient, soft cinematic lighting, "
            f"clean negative space, glossy reflective floor")

# The scene must stay product-free and text-free; product/logo/copy are composited later.
# The podium MUST be bare — a stray AI-rendered product would clash with the composited real one.
NEG = ("the podium and pedestal are completely bare, empty and unoccupied, nothing is standing or placed on the "
       "podium, no object on the pedestal; absolutely no product, no bottle, no jar, no tub, no can, no container, "
       "no box, no packaging, no label, no text, no words, no letters, no numbers, no logos, no watermark, "
       "no people, no hands, no faces; keep the lower third clear, and keep the top edge and bottom edge dark "
       "and uncluttered for overlay copy")
STYLE = ("photorealistic, ultra detailed, commercial advertising photography, shot on Phase One, 8k, razor sharp, "
         "professional colour grading, dramatic studio lighting")

out = []
for p in specs:
    base = scene(p)
    for fmt, ar, comp in (('story','9:16','vertical 9:16 composition, bare empty display stage in the lower-center, '
                                          'dark gradient at very top and very bottom'),
                          ('feed45','3:4','balanced 3:4 composition, bare empty display stage center to center-right, '
                                          'dark gradient at top and bottom')):
        prompt = f"{base}, {comp}, {STYLE}. {NEG}."
        out.append({
            'rank': p['rank'], 'name': p['name'], 'format': fmt, 'aspect_ratio': ar,
            'accent': p['accent'], 'prompt': prompt,
            'out': f"assets/bg_ai/p{p['rank']:02d}_{fmt}.jpg",
        })

json.dump(out, open('data/higgsfield-prompts.json', 'w'), indent=2, ensure_ascii=False)
print(f"Wrote {len(out)} scene prompts (15 products x 2 formats) -> data/higgsfield-prompts.json")
for o in out[:4]:
    print(f"\n p{o['rank']:02d} {o['name']} [{o['format']} {o['aspect_ratio']}]\n  {o['prompt'][:150]}…")
