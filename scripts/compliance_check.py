# -*- coding: utf-8 -*-
"""NVWA/EU compliance linter for creative copy.
Flags non-authorized health-claim language. Two EU-authorized claim sentences are allowlisted."""
import json, re, unicodedata

specs = json.load(open('data/copy.json'))

# EU-authorized claim sentences (faithful wording) — allowed verbatim
AUTHORIZED = [
    'eiwitten dragen bij aan de groei en het behoud van spiermassa',
    'creatine verhoogt de fysieke prestatie bij opeenvolgende korte, zeer intensieve inspanningen',
]

# Forbidden / risky terms: health claims, disease, slimming, stimulant-benefit, recovery, etc.
FORBIDDEN = [
    r'afval', r'vetverbrand', r'vet verbrand', r'slank', r'gewichtsverlies',
    r'verbrand\w*', r'detox', r'ontgift',
    r'\benergie\b', r'energiek', r'\bfocus\b', r'concentrat', r'alert', r'wakker',
    r'immuun', r'immun', r'weerstand', r'afweer',
    r'herstel', r'recovery', r'spiergroei', r'spieropbouw', r'spierherstel',
    r'\bspiermassa\b',  # allowed ONLY inside authorized protein claim (checked separately)
    r'gezond\w*', r'genees\w*', r'behandel\w*', r'voorkom\w*', r'preventie',
    r'ziekte', r'pijn', r'ontstek', r'bloeddruk', r'cholesterol', r'suiker\w*spiegel',
    r'slaap', r'stress', r'\brust\b', r'angst', r'depress', r'stemming', r'libido',
    r'testosteron', r'hormoon', r'hormonaal',
    r'verhoog\w* de prestatie',  # allowed ONLY inside authorized creatine claim
    r'meer kracht', r'sterker\b', r'krachtiger', r'explosie',
    r'hydrat', r'vochtbalans', r'elektrolytenbalans',
    r'anti-?oxidant', r'vrije radicalen', r'metabolisme', r'stofwisseling',
]

def norm(s):
    return s.lower()

def strip_authorized(text):
    t = norm(text)
    for a in AUTHORIZED:
        t = t.replace(a, ' [AUTH] ')
    return t

FIELDS = ['kicker','name','sub','flavor','problem','solution','quote','claim']

issues = []
for s in specs:
    blob_parts = []
    for f in FIELDS:
        v = s.get(f)
        if v: blob_parts.append(('%s'%f, v))
    for u in s.get('usps',[]):
        blob_parts.append(('usp', u))
    for field, text in blob_parts:
        scan = strip_authorized(text)
        for pat in FORBIDDEN:
            for m in re.finditer(pat, scan):
                frag = scan[max(0,m.start()-20):m.end()+20]
                issues.append((s['rank'], s['name'], field, pat, frag.strip()))

print(f"Scanned {len(specs)} products across {len(FIELDS)}+usps fields.")
if not issues:
    print("\n✅ PASS — no non-authorized health-claim language detected.")
else:
    print(f"\n⚠️  {len(issues)} potential issue(s):")
    for r,n,f,pat,frag in issues:
        print(f"  p{r:02d} {n:12s} [{f}] /{pat}/ -> …{frag}…")

# Confirm authorized claims used only where intended
print("\nClaim usage:")
for s in specs:
    if s.get('claim'):
        ok = any(a in norm(s['claim']) for a in AUTHORIZED)
        print(f"  p{s['rank']:02d} {s['name']:12s} claim {'✓ authorized' if ok else '✗ NON-AUTHORIZED'}")
