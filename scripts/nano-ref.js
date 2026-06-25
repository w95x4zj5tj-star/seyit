// Generate photoreal product-in-scene backgrounds with Higgsfield Soul "reference" mode
// (the platform's nano-banana-style reference-image conditioning). We pass the REAL product
// cutout (and optionally the logo) as reference images via `image_urls`, plus a scene prompt,
// so the model renders the product naturally lit/shadowed on a premium set.
//
// Label text the model redraws is NOT trusted — render.js (--aibg) still composites the
// pixel-perfect real cutout + logo + NVWA-compliant copy on top.
//
//   export HIGGSFIELD_API_KEY=<id>  HIGGSFIELD_API_SECRET=<secret>
//   node scripts/nano-ref.js --ranks=1,2,4            # pilot
//   node scripts/nano-ref.js                          # all 15
//
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CA = '/root/.ccr/ca-bundle.crt';
let ID = process.env.HIGGSFIELD_API_KEY || '';
let SECRET = process.env.HIGGSFIELD_API_SECRET || '';
if (!SECRET && ID.includes(':')) { const i = ID.indexOf(':'); SECRET = ID.slice(i + 1); ID = ID.slice(0, i); }
const AUTH = `Authorization: Key ${ID}:${SECRET}`;
const MODEL = 'higgsfield-ai/soul/reference';
const BASE = 'https://platform.higgsfield.ai';

const arg = (k, d) => { const a = process.argv.find(x => x.startsWith(`--${k}=`)); return a ? a.split('=')[1] : d; };
const ranks = (arg('ranks', '') ? arg('ranks').split(',').map(Number) : null);

// Two creative formats -> nearest supported aspect ratio.
const FORMATS = [{ key: 'story', ar: '9:16' }, { key: 'feed45', ar: '3:4' }];

const top15 = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/top15.json'), 'utf8'));
const prompts = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/higgsfield-prompts.json'), 'utf8'));
// Map rank -> scene flavour from existing prompt set (reuse the art direction we already wrote).
const sceneByRank = {};
for (const p of prompts) { (sceneByRank[p.rank] = sceneByRank[p.rank] || {})[p.format] = p.prompt; }

function dataUri(rel) {
  const buf = execFileSync('python3', ['-c', `
import sys,base64,io
from PIL import Image
im=Image.open(sys.argv[1]).convert('RGBA'); im.thumbnail((640,640))
bg=Image.new('RGB',im.size,'white'); bg.paste(im,mask=im.split()[-1])
b=io.BytesIO(); bg.save(b,'JPEG',quality=88)
sys.stdout.write('data:image/jpeg;base64,'+base64.b64encode(b.getvalue()).decode())
`, path.join(ROOT, rel)]);
  return buf.toString();
}

function curl(args) { return execFileSync('curl', ['-sS', '--cacert', CA, ...args], { maxBuffer: 64 * 1024 * 1024 }).toString(); }

function sceneText(rank, size) {
  let s = (sceneByRank[rank] && sceneByRank[rank][size]) || '';
  // Our existing prompts describe an EMPTY pedestal (for compositing). In reference mode we
  // want the product present, so strip the "bare/empty, no product" instructions.
  s = s.replace(/bare empt[^,.]*|empty (illuminated )?pedestal|no product[^,.]*|generous negative space,?/gi, '').trim();
  return (`Professional product advertising photograph, hero close-up. Reproduce the EXACT product `
    + `tub/jar from the reference image — keep its silhouette, cap, colours, label layout and all `
    + `label text crisp, sharp and faithful to the reference. The product is LARGE and dominant, `
    + `filling roughly 60-70% of the frame height, centred, facing forward, in sharp focus. ${s} `
    + `Cinematic studio lighting, soft realistic contact shadow, gentle background bokeh, photoreal, `
    + `ultra detailed, accurate legible product label, no invented text, no extra props.`);
}

async function gen(rank, fmt, ref) {
  const out = `assets/bg_ai/p${String(rank).padStart(2, '0')}_${fmt.key}.jpg`;
  const body = JSON.stringify({ prompt: sceneText(rank, fmt.key), image_urls: [ref], aspect_ratio: fmt.ar, resolution: '1080p' });
  const sub = JSON.parse(curl(['-X', 'POST', `${BASE}/${MODEL}`, '-H', AUTH, '-H', 'Content-Type: application/json', '-d', body]));
  if (!sub.request_id) { console.log(`✗ p${rank} ${fmt.key}: ${JSON.stringify(sub).slice(0, 160)}`); return; }
  const rid = sub.request_id;
  for (let i = 0; i < 75; i++) {
    let j; try { j = JSON.parse(curl(['-H', AUTH, `${BASE}/requests/${rid}/status`])); } catch { await sleep(4000); continue; }
    const st = (j.status || '').toLowerCase();
    if (st.includes('complet')) {
      const url = (j.images || [{}])[0].url;
      curl(['-L', url, '-o', path.join(ROOT, out)]);
      console.log(`✓ p${rank} ${fmt.key} (${fmt.ar})`); return;
    }
    if (['fail', 'nsfw', 'cancel'].some(x => st.includes(x))) { console.log(`✗ p${rank} ${fmt.key}: ${st}`); return; }
    await sleep(4000);
  }
  console.log(`✗ p${rank} ${fmt.key}: timeout`);
}
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  fs.mkdirSync(path.join(ROOT, 'assets/bg_ai'), { recursive: true });
  const list = top15.map((p, i) => ({ ...p, rank: p.rank || i + 1 })).filter(p => !ranks || ranks.includes(p.rank));
  console.log(`Soul reference mode: ${list.length} products × ${FORMATS.length} formats`);
  for (const p of list) {
    const ref = dataUri(`assets/products_cut/p${String(p.rank).padStart(2, '0')}.png`);
    for (const fmt of FORMATS) await gen(p.rank, fmt, ref);
  }
})();
