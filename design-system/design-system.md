# Kosso Nutrition — Ad Creative Design System

> Derived directly from the live store (kossonutrition.nl): brand tokens, fonts and
> product imagery were extracted from the site's CSS, font files and product API.
> All copy is **NVWA/EU claim-safe** by default.

## 1. Brand
- **Name:** Kosso Nutrition
- **Tagline:** `KWALITEIT = PRIORITEIT`
- **Voice:** energiek, no-nonsense, prestatiegericht, nuchter-Nederlands
- **Proof points:** ★ 4,5 / 5 · 5.300+ beoordelingen · Gratis verzending v.a. €65 · Voor 23:30 besteld, morgen in huis

## 2. Colour palette
| Token | Hex | Use |
|---|---|---|
| Ink | `#111111` | Backgrounds, display text on light |
| Brand Blue | `#65BEEC` | Primary accent, logo badge, trust/info |
| Energy Red | `#E84E4E` | Energy accent, badges, highlights |
| Sale Red | `#C8202E` | Deep sale gradient |
| Gold | `#E6B400` | Star ratings |
| Paper | `#F8F8F8` | Light backgrounds |
| White | `#FFFFFF` | Light backgrounds, text on dark |

Each product also carries a **data-sampled accent** (taken from its real packaging) so a
creative harmonises with the product on screen (e.g. Tsunami → blue, Samurai → purple).

## 3. Typography
- **Display / headings:** **Anton** (self-hosted, the store's real heading font) — ALWAYS UPPERCASE.
- **Body / supporting:** **Roboto Condensed** (the store's real body font) — weights 400 / 700 / 900.
- Both fonts are bundled in `assets/fonts/` for pixel-accurate, repeatable rendering.

## 4. Formats & safe zones
| Format | Pixels | Ratio | Top reserve | Bottom reserve |
|---|---|---|---|---|
| Story | 1080 × 1920 | 9:16 | 250 px | 320 px |
| Feed (4:5) | 1080 × 1350 | 4:5 | 90 px | 150 px |

Critical text/logos are kept inside the safe area so nothing is hidden behind the
Stories UI (profile, send bar) or feed caption.

## 5. The 5 creative concepts (per product)
| # | Concept | Goal | Background |
|---|---|---|---|
| A1 | **Hero** | Awareness / brand | Premium dark |
| A2 | **Sale / Offer** | Conversion (price, shipping) | Accent diagonal |
| A3 | **Probleem → Oplossing** | Consideration | Light/dark split |
| A4 | **Informatief / USP** | Education (facts + authorised claim) | Dark, accent rule |
| A5 | **Social Proof** | Trust (rating + review) | Light blue |

## 6. NVWA / EU compliance rules (built into the copy)
The copy engine is **claim-safe by design**:
- **No unauthorised health claims**, no disease/slimming claims, no "energy/focus/fat-burn" suggestions.
- **Only EU-authorised health claims** are used, with faithful wording and required conditions:
  - **Eiwitten** (whey, clear whey, gainer): *"Eiwitten dragen bij aan de groei en het behoud van spiermassa."*
  - **Creatine:** *"Creatine verhoogt de fysieke prestatie bij opeenvolgende korte, zeer intensieve inspanningen."* (³g/dag).
- **Botanicals (Ashwagandha):** EU botanical claims are on hold → **strictly factual** (extract, mg, vegan), no benefit claims.
- **Pre-workouts:** claim-free (flavour, scoops, ritual) + mandatory **caffeine warning** in the legal line.
- Every supplement creative carries a supplement/food disclaimer line.

> The default deliverable contains the authorised protein/creatine claims only where the
> product qualifies. A **fully claim-free** variant (zero health claims, even authorised
> ones) can be produced by toggling `claim` off in `data/copy.json`.

## 7. Top 15 products (best-selling supplements & nutrition)
Ranked by the store's best-selling sort, filtered to ingestible supplement/nutrition
products (apparel, Monster Energy, coaching & accessories excluded). See `data/top15.json`.

## 8. How it's built (repeatable)
```
scripts/research.js     # data + token extraction (via curl/API)
scripts/prep_images.py  # transparent cutouts + accent sampling
scripts/build_copy.py   # claim-safe copy spec  -> data/copy.json
templates/creative.js   # 5 archetypes × 2 sizes (HTML/CSS)
scripts/render.js       # headless-Chrome render -> exact-size PNG
```
