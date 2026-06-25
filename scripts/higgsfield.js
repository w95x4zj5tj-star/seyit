// Generate photoreal BACKGROUNDS with Higgsfield (Soul) via the WaveSpeed-style async API.
// We deliberately generate text/logo-free backgrounds, then composite our own compliant
// copy + the real Kosso logo on top (scripts/render.js with --aibg) so all on-image text
// stays NVWA/EU claim-safe and pixel-accurate.
//
//   export HIGGSFIELD_API_KEY=sk-...            # your key (WaveSpeed or Higgsfield Cloud)
//   node scripts/higgsfield.js                  # generates assets/bg_ai/*.jpg
//
// Endpoints are overridable via env so you can point at WaveSpeed / Higgsfield Cloud / Segmind:
//   HF_SUBMIT_URL  (default WaveSpeed Higgsfield Soul text-to-image)
//   HF_SIZE_FMT    "WxH" template, default "{w}*{h}"
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CA = '/root/.ccr/ca-bundle.crt';
const KEY = process.env.HIGGSFIELD_API_KEY || process.env.WAVESPEED_API_KEY || '';
const SUBMIT = process.env.HF_SUBMIT_URL || 'https://api.wavespeed.ai/api/v3/higgsfield/soul';
const DIM = { story: [1080, 1920], feed45: [1080, 1350] };
const CONC = parseInt(process.env.HF_CONC || '3', 10);

if (!KEY) {
  console.error('✗ No API key. Set HIGGSFIELD_API_KEY (or WAVESPEED_API_KEY) and re-run.');
  process.exit(2);
}

function curlJSON(args) {
  const out = execFileSync('curl', ['-sS', '--cacert', CA, ...args], { encoding: 'utf8', maxBuffer: 1 << 26 });
  try { return JSON.parse(out); } catch { return { _raw: out }; }
}
function post(url, body) {
  return curlJSON(['-X', 'POST', url, '-H', `Authorization: Bearer ${KEY}`,
    '-H', 'Content-Type: application/json', '-d', JSON.stringify(body)]);
}
function get(url) {
  return curlJSON(['-H', `Authorization: Bearer ${KEY}`, url]);
}
// flexible field pickers (schemas differ slightly across providers)
const pick = (o, ...ks) => { for (const k of ks) { const v = k.split('.').reduce((a, p) => a && a[p], o); if (v) return v; } };

function submit(prompt, w, h) {
  const size = (process.env.HF_SIZE_FMT || '{w}*{h}').replace('{w}', w).replace('{h}', h);
  const r = post(SUBMIT, { prompt, size, aspect_ratio: `${w}:${h}`, enable_base64_output: false, num_images: 1 });
  const id = pick(r, 'data.id', 'id', 'data.request_id', 'request_id');
  const resultUrl = pick(r, 'data.urls.get', 'urls.get') || (id ? `https://api.wavespeed.ai/api/v3/predictions/${id}/result` : null);
  if (!id) throw new Error('submit failed: ' + JSON.stringify(r).slice(0, 240));
  return { id, resultUrl };
}
function sleep(ms){ execFileSync('sleep', [String(ms/1000)]); }
function poll(resultUrl) {
  for (let i = 0; i < 60; i++) {
    const r = get(resultUrl);
    const status = pick(r, 'data.status', 'status') || '';
    if (/complete|succeed|success/i.test(status)) {
      const url = pick(r, 'data.outputs.0', 'outputs.0', 'data.output.0', 'data.image_url', 'output');
      if (url) return url;
    }
    if (/fail|error/i.test(status)) throw new Error('generation failed: ' + JSON.stringify(r).slice(0, 240));
    sleep(3000);
  }
  throw new Error('timeout polling ' + resultUrl);
}
function download(url, out) {
  fs.mkdirSync(path.dirname(out), { recursive: true });
  execFileSync('curl', ['-sSL', '--cacert', CA, url, '-o', out]);
  return fs.existsSync(out) && fs.statSync(out).size > 2000;
}

const prompts = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/higgsfield-prompts.json'), 'utf8'));
const jobs = prompts.filter(p => !fs.existsSync(path.join(ROOT, p.out)));
console.log(`Higgsfield: ${jobs.length} backgrounds to generate (of ${prompts.length}).`);

let ok = 0, fail = 0;
function run(p) {
  const [w, h] = DIM[p.format];
  try {
    const { id, resultUrl } = submit(p.prompt, w, h);
    const url = poll(resultUrl);
    if (download(url, path.join(ROOT, p.out))) { ok++; console.log(`✓ p${p.rank} ${p.format}`); }
    else { fail++; console.log(`✗ p${p.rank} ${p.format} download`); }
  } catch (e) { fail++; console.log(`✗ p${p.rank} ${p.format}: ${e.message.slice(0,120)}`); }
}
// simple sequential w/ small concurrency via batching
(function(){
  for (let i = 0; i < jobs.length; i += CONC) {
    jobs.slice(i, i + CONC).forEach(run);  // execSync is blocking; effectively sequential but grouped
  }
  console.log(`\nDONE: ${ok} ok, ${fail} failed. Backgrounds in assets/bg_ai/`);
  console.log('Next: node scripts/render.js --ranks=all --sizes=feed45,story --out=creatives --aibg');
})();
