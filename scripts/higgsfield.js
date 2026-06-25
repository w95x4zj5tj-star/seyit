// Generate photoreal BACKGROUNDS with Higgsfield Soul via the native Higgsfield platform API.
// We deliberately generate text/logo-free backgrounds, then composite our own compliant
// copy + the real Kosso logo on top (scripts/render.js with --aibg) so all on-image text
// stays NVWA/EU claim-safe and pixel-accurate.
//
//   export HIGGSFIELD_API_KEY=<key-id>           # your Higgsfield API key id
//   export HIGGSFIELD_API_SECRET=<key-secret>    # your Higgsfield API key secret
//   node scripts/higgsfield.js                   # generates assets/bg_ai/*.jpg
//
// You may also pass a combined credential as HIGGSFIELD_API_KEY="<id>:<secret>".
//
// Native API (https://platform.higgsfield.ai):
//   POST  /{model_id}                       -> { status, request_id, status_url, cancel_url }
//   GET   /requests/{request_id}/status     -> { status, images:[{url}], ... }
//   Auth header:  Authorization: Key <id>:<secret>
// Overridable via env:
//   HF_MODEL       model id   (default higgsfield-ai/soul/standard)
//   HF_SUBMIT_URL  full submit URL (default https://platform.higgsfield.ai/{HF_MODEL})
//   HF_RES         resolution "720p" | "1080p" (default 1080p)
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CA = '/root/.ccr/ca-bundle.crt';

// Credentials: key id + secret. Accept either two env vars or a combined "id:secret".
let ID = process.env.HIGGSFIELD_API_KEY || process.env.WAVESPEED_API_KEY || '';
let SECRET = process.env.HIGGSFIELD_API_SECRET || '';
if (!SECRET && ID.includes(':')) { const i = ID.indexOf(':'); SECRET = ID.slice(i + 1); ID = ID.slice(0, i); }

const MODEL = process.env.HF_MODEL || 'higgsfield-ai/soul/standard';
const SUBMIT = process.env.HF_SUBMIT_URL || `https://platform.higgsfield.ai/${MODEL}`;
const STATUS_BASE = 'https://platform.higgsfield.ai/requests';
const RES = process.env.HF_RES || '1080p';
const CONC = parseInt(process.env.HF_CONC || '3', 10);

// soul/standard supports: 9:16, 16:9, 4:3, 3:4, 1:1, 2:3, 3:2 (NOT 4:5).
// Map our two creative formats to the nearest supported ratio; render.js composites/crops
// the background into the exact 1080x1920 (story) / 1080x1350 (feed45) canvas anyway.
const AR = { story: '9:16', feed45: '3:4' };

if (!ID || !SECRET) {
  console.error('✗ Missing credentials. Set HIGGSFIELD_API_KEY (id) and HIGGSFIELD_API_SECRET (secret),');
  console.error('  or HIGGSFIELD_API_KEY="<id>:<secret>", then re-run.');
  process.exit(2);
}
const AUTH = `Authorization: Key ${ID}:${SECRET}`;

function curlJSON(args) {
  const out = execFileSync('curl', ['-sS', '--cacert', CA, ...args], { encoding: 'utf8', maxBuffer: 1 << 26 });
  try { return JSON.parse(out); } catch { return { _raw: out }; }
}
function post(url, body) {
  return curlJSON(['-X', 'POST', url, '-H', AUTH,
    '-H', 'Content-Type: application/json', '-H', 'Accept: application/json', '-d', JSON.stringify(body)]);
}
function get(url) { return curlJSON(['-H', AUTH, '-H', 'Accept: application/json', url]); }
const pick = (o, ...ks) => { for (const k of ks) { const v = k.split('.').reduce((a, p) => a && a[p], o); if (v) return v; } };

function submit(prompt, aspect_ratio) {
  const r = post(SUBMIT, { prompt, aspect_ratio, resolution: RES });
  const id = pick(r, 'request_id', 'id', 'data.request_id', 'data.id');
  const statusUrl = pick(r, 'status_url', 'data.status_url') || (id ? `${STATUS_BASE}/${id}/status` : null);
  if (!id) throw new Error('submit failed: ' + JSON.stringify(r).slice(0, 240));
  return { id, statusUrl };
}
function sleep(ms) { execFileSync('sleep', [String(ms / 1000)]); }
function poll(statusUrl) {
  for (let i = 0; i < 80; i++) {
    const r = get(statusUrl);
    const status = (pick(r, 'status', 'data.status') || '').toLowerCase();
    if (/complete|succeed|success/.test(status)) {
      const url = pick(r, 'images.0.url', 'data.images.0.url', 'image.url', 'output.0', 'video.url');
      if (url) return url;
    }
    if (/fail|error|nsfw/.test(status)) throw new Error('generation ' + status + ': ' + JSON.stringify(r).slice(0, 240));
    sleep(3000);
  }
  throw new Error('timeout polling ' + statusUrl);
}
function download(url, out) {
  fs.mkdirSync(path.dirname(out), { recursive: true });
  execFileSync('curl', ['-sSL', '--cacert', CA, url, '-o', out]);
  return fs.existsSync(out) && fs.statSync(out).size > 2000;
}

const prompts = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/higgsfield-prompts.json'), 'utf8'));
const jobs = prompts.filter(p => !fs.existsSync(path.join(ROOT, p.out)));
console.log(`Higgsfield (${MODEL} @ ${RES}): ${jobs.length} backgrounds to generate (of ${prompts.length}).`);

let ok = 0, fail = 0;
function run(p) {
  const aspect = AR[p.format] || p.aspect_ratio || '9:16';
  try {
    const { statusUrl } = submit(p.prompt, aspect);
    const url = poll(statusUrl);
    if (download(url, path.join(ROOT, p.out))) { ok++; console.log(`✓ p${p.rank} ${p.format} (${aspect})`); }
    else { fail++; console.log(`✗ p${p.rank} ${p.format} download`); }
  } catch (e) { fail++; console.log(`✗ p${p.rank} ${p.format}: ${e.message.slice(0, 160)}`); }
}
(function () {
  for (let i = 0; i < jobs.length; i += CONC) {
    jobs.slice(i, i + CONC).forEach(run);  // execSync is blocking; grouped sequential
  }
  console.log(`\nDONE: ${ok} ok, ${fail} failed. Backgrounds in assets/bg_ai/`);
  console.log('Next: node scripts/render.js --ranks=all --sizes=feed45,story --out=creatives --aibg');
})();
