# Higgsfield photoreal upgrade — ready to run

This adds **AI photoreal backgrounds** (Higgsfield Soul) under the existing creatives,
while keeping the **real Kosso logo, product cut-outs and all NVWA/EU claim-safe copy**
composited by us (so no AI text-slop and no compliance risk).

## Why this approach
Higgsfield generates the **background only** (no text, no logos). We then layer the real
logo + product + Dutch claim-safe copy on top with the existing engine. Result: photoreal
immersive scenes *and* pixel-accurate, legally-safe text. This matches the "deadzones
respected / remove the AI slop" workflow.

## How to run (3 steps)
```bash
# 1. Provide your Higgsfield / WaveSpeed API key
export HIGGSFIELD_API_KEY=sk-xxxxxxxx
#    (optional) point at a specific provider endpoint:
# export HF_SUBMIT_URL=https://api.wavespeed.ai/api/v3/higgsfield/soul

# 2. Generate the 30 photoreal backgrounds (15 products x 2 formats) -> assets/bg_ai/*.jpg
node scripts/higgsfield.js

# 3. Re-render the dark concepts (Hero / Sale / Info) over the AI backgrounds
node scripts/render.js --ranks=all --sizes=feed45,story --out=creatives --aibg
```
Problem→Oplossing and Social Proof intentionally stay on the clean CSS look (dark-text
legibility); Hero, Sale and Informatief switch to the photoreal backgrounds.

## Prompts
`data/higgsfield-prompts.json` — one tailored photoreal prompt per product per format,
scene-matched by category (pre-workout smoke, whey milk splash, electrolyte water splash,
botanical for ashwagandha, food lifestyle for bars/coffee…), brand accent injected, with
explicit negative space for product/headline and **no text/logos** in the image.

## Network / access notes
- `cloud.higgsfield.ai` and `api.wavespeed.ai` are reachable from this environment;
  `api.higgsfield.ai` was blocked by egress policy — use the Cloud/WaveSpeed endpoint.
- Alternatively, enable the **Higgsfield MCP for Claude Code** and I can drive generation
  through MCP tools instead of the REST script.
- A key is required (credits are consumed per image — ~30 images for the full set).
