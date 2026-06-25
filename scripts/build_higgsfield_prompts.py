# -*- coding: utf-8 -*-
"""Generate photoreal Higgsfield (Soul) text-to-image BACKGROUND prompts per product x format.
Backgrounds carry NO text/logos (we composite compliant copy ourselves), with negative space
reserved for the product + headline. Scene is tailored by product type; brand palette injected."""
import json

specs = json.load(open('data/copy.json'))

# scene direction by product type/category
def scene(p):
    t = (p['type'] or '').lower()
    name = p['name']
    acc = p['accent']
    if 'pre workout' in t or 'pre-work' in name.lower() or p['rank'] in (4,5,7,9,12,13):
        return (f"dark dramatic photographic studio scene, swirling {p.get('flavor','')} coloured smoke and "
                f"powder splash in {acc} tones, volumetric rim lighting, wet concrete podium, energetic gym atmosphere, "
                f"high-contrast, moody")
    if 'whey' in t or 'protein' in t or 'isola' in t or 'whey' in name.lower():
        return (f"clean premium studio scene, dynamic milk and protein splash frozen in motion, soft gradient "
                f"backdrop in {acc} and white, bright product photography lighting, marble podium, fresh and crisp")
    if 'creatine' in t:
        return (f"minimalist clean laboratory-grade studio backdrop, subtle {acc} gradient, fine white powder "
                f"drifting, soft top light, scientific premium feel, lots of negative space")
    if 'electrolyt' in t:
        return (f"fresh vibrant scene, crystal water splash and citrus, bright {acc} gradient sky, droplets, "
                f"summer energy, clean and hydrating mood, airy")
    if 'gainer' in t or 'bulk' in name.lower():
        return (f"bold gym studio scene, dust and powder burst in {acc}, dramatic side light, raw concrete, "
                f"strong and heavy mass-building atmosphere")
    if 'vitam' in t or 'ashwa' in name.lower():
        return (f"natural earthy botanical scene, soft daylight, ashwagandha roots and green leaves bokeh, "
                f"warm neutral and {acc} tones, calm wellness mood, organic textures")
    # foods: bars, pops, coffee, pancakes
    if any(k in name.lower() for k in ('bar','pops','ijskoffie','pancake','oats')):
        return (f"appetising lifestyle food scene, soft natural kitchen light, marble and wood surface, "
                f"chocolate/cereal/coffee accents, {acc} colour pop, shallow depth of field, fresh and tasty")
    return f"premium studio advertising backdrop with {acc} gradient, soft lighting, clean negative space"

NEG = ("no text, no words, no letters, no logos, no watermark, no people faces, no product packaging, "
       "leave clear empty negative space in the centre and lower third for product placement")
STYLE = ("photorealistic, ultra detailed, commercial advertising photography, 8k, sharp, professional colour grading")

out = []
for p in specs:
    base = scene(p)
    for fmt, ar, comp in (('story','9:16','vertical composition, subject space lower-center'),
                          ('feed45','4:5','balanced composition, subject space center-right')):
        prompt = f"{base}, {comp}, {STYLE}. {NEG}."
        out.append({
            'rank': p['rank'], 'name': p['name'], 'format': fmt, 'aspect_ratio': ar,
            'accent': p['accent'], 'prompt': prompt,
            'out': f"assets/bg_ai/p{p['rank']:02d}_{fmt}.jpg",
        })

json.dump(out, open('data/higgsfield-prompts.json', 'w'), indent=2, ensure_ascii=False)
print(f"Wrote {len(out)} background prompts (15 products x 2 formats) -> data/higgsfield-prompts.json")
for o in out[:4]:
    print(f"\n p{o['rank']:02d} {o['name']} [{o['format']} {o['aspect_ratio']}]\n  {o['prompt'][:150]}…")
