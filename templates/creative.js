// Kosso creative engine — 5 archetypes x 2 sizes. Pure HTML/CSS, rendered by headless Chrome.
const path = require('path');
const fs = require('fs');
const FONTDIR = 'file://' + path.resolve(__dirname, '../assets/fonts');
const BASE_CSS = fs.readFileSync(path.resolve(__dirname, 'base.css'), 'utf8').split('FONTDIR').join(FONTDIR);
const BG = require('./bg.js');

const SIZES = {
  story:  { w:1080, h:1920, key:'story',  safeTop:250, safeBot:320, side:72 },
  feed45: { w:1080, h:1350, key:'feed45', safeTop:90,  safeBot:150, side:80 },
};

// ---------- shared components ----------
function logo(scale=1, fg='#fff'){
  const s = 30*scale;
  return `<div class="kosso-logo" style="--logo-fg:${fg};font-size:${s}px">
    <span class="kn" style="font-size:${s*1.15}px">KN</span>
    <span class="wm"><b style="font-size:${s*1.18}px">KOSSO</b><span style="font-size:${s*0.5}px">NUTRITION</span></span>
  </div>`;
}
function stars(scale=1, fg='#fff'){
  const s=30*scale;
  return `<span class="stars" style="font-size:${s}px;--star-fg:${fg}">
    <span class="s">★★★★★</span><span class="lbl">4,5 / 5 &nbsp;·&nbsp; 5.300+ beoordelingen</span></span>`;
}
function trustbar(scale=1, fg='#fff'){
  const s=24*scale;
  return `<div class="trustbar" style="font-size:${s}px;color:${fg}">
    <span class="t">★ 4,5 uit 5.300+</span><span class="dot"></span>
    <span class="t">Voor 23:30 → morgen in huis</span><span class="dot"></span>
    <span class="t">Gratis verzending v.a. €65</span></div>`;
}
function priceTag(price, label, scale=1){
  const [eu, ct] = String(price).split('.');
  return `<div style="display:inline-flex;flex-direction:column;align-items:flex-start">
    ${label?`<span class="cond" style="font-weight:900;text-transform:uppercase;letter-spacing:.08em;font-size:${30*scale}px;color:#fff;background:var(--accent);padding:.1em .5em;border-radius:6px 6px 0 0">${label}</span>`:''}
    <span class="price" style="font-size:${150*scale}px;color:#fff;background:#111;padding:.04em .22em .08em;border-radius:0 12px 12px 12px">
      <span class="cur">€</span>${eu}<span class="cents">${ct?','+ct:',-'}</span></span></div>`;
}

// ---------- background helpers ----------
function gridDots(color='rgba(255,255,255,.05)'){
  return `<div style="position:absolute;inset:0;background-image:radial-gradient(${color} 2px,transparent 2px);background-size:46px 46px"></div>`;
}
function diagStripe(accent){
  return `<div style="position:absolute;width:180%;height:240px;left:-40%;top:-90px;transform:rotate(-9deg);background:${accent}"></div>`;
}

// ---------- archetypes ----------
// Each returns inner HTML for the .stage. p = product spec, S = size obj.
// Per-product variation via p.rank so each product's 5 creatives feel like a mix.
function A1_hero(p,S){ // BRAND / HERO — awareness, claim-free. studio <-> immersive ambient
  const big = S.key==='story';
  const pb = big?300:255, pcx='50%';
  const bg = (p.rank%2===0) ? BG.ambient(p.cutAbs,p.accent) : BG.studio(p.accent);
  return `
  ${bg}
  ${BG.grain(0.09)}
  ${BG.vignette(0.5)}
  <div style="position:absolute;left:${S.side}px;right:${S.side}px;top:${S.safeTop-(big?70:34)}px;display:flex;justify-content:space-between;align-items:center">
    ${logo(1.15)}
    <span class="pill badge-red" style="font-size:26px;padding:.5em .95em">★ Bestseller</span>
  </div>
  <div style="position:absolute;left:${S.side}px;right:${S.side}px;top:${big?320:222}px;text-align:center">
    <div class="cond" style="font-weight:700;letter-spacing:.32em;text-transform:uppercase;color:var(--accent);font-size:${big?34:30}px">${p.kicker}</div>
    <div class="disp" style="color:#fff;font-size:${big?164:140}px;margin-top:10px;text-shadow:0 4px 30px rgba(0,0,0,.5)">${p.name}</div>
    <div class="cond" style="color:#e2e2e2;font-weight:700;text-transform:uppercase;letter-spacing:.06em;font-size:${big?46:40}px;margin-top:12px">${p.sub}</div>
  </div>
  ${BG.contact(pcx, pb-14, big?560:480, 70)}
  <img class="prod" src="${p.cutAbs}" style="position:absolute;left:${pcx};transform:translateX(-50%);bottom:${pb}px;max-width:${big?80:74}%;max-height:${big?44:46}%;object-fit:contain"/>
  <div style="position:absolute;left:0;right:0;bottom:${big?180:120}px;display:flex;justify-content:center">${stars(1.08)}</div>
  <div style="position:absolute;left:0;right:0;bottom:${big?108:64}px;text-align:center"><span class="cond" style="color:#9a9a9a;font-weight:700;letter-spacing:.24em;text-transform:uppercase;font-size:23px">KWALITEIT = PRIORITEIT</span></div>`;
}

function A2_sale(p,S){ // SALE / OFFER — conversion, claim-free. bold energy <-> immersive ambient
  const big=S.key==='story';
  const useAmbient = (p.rank%3===0);
  const bg = useAmbient ? BG.ambient(p.cutAbs,p.accent,true) : BG.energy(p.accent);
  return `
  ${bg}
  <div style="position:absolute;right:-12%;top:${big?260:180}px;width:${big?78:74}%;height:${big?52:56}%;background:radial-gradient(closest-side, rgba(0,0,0,.55), transparent 72%);filter:blur(20px)"></div>
  ${BG.grain(0.08)}
  <div style="position:absolute;left:${S.side}px;right:${S.side}px;top:${S.safeTop-(big?70:30)}px;display:flex;justify-content:space-between;align-items:center">
    ${logo(1.1)}<span class="pill badge-white" style="font-size:24px;padding:.5em .9em">${p.flavor||'Topkwaliteit'}</span>
  </div>
  ${BG.contact(big?'72%':'70%', big?430:350, big?420:380, 56)}
  <img class="prod" src="${p.cutAbs}" style="position:absolute;right:${big?2:0}%;top:${big?320:230}px;max-width:${big?58:52}%;max-height:${big?42:46}%;object-fit:contain;filter:drop-shadow(0 30px 50px rgba(0,0,0,.5))"/>
  <div style="position:absolute;left:${S.side}px;top:${big?360:300}px;max-width:54%">
    <div class="disp" style="color:#fff;font-size:${big?96:84}px;line-height:.9;text-shadow:0 4px 24px rgba(0,0,0,.4)">${p.name}</div>
  </div>
  <div style="position:absolute;left:${S.side}px;bottom:${big?430:355}px">${priceTag(p.price,'Nu vanaf',big?1:0.92)}</div>
  <div style="position:absolute;left:${S.side}px;right:${S.side}px;bottom:${big?250:205}px">
    <div class="cond" style="color:#fff;font-weight:900;text-transform:uppercase;font-size:${big?40:34}px;letter-spacing:.02em">Gratis verzending vanaf €65</div>
    <div class="cond" style="color:#06243a;font-weight:700;text-transform:uppercase;font-size:${big?30:26}px;letter-spacing:.04em;margin-top:6px">Voor 23:30 besteld · morgen in huis</div>
  </div>
  <div style="position:absolute;left:0;right:0;bottom:${big?120:96}px;display:flex;justify-content:center">
    <span class="pill badge-black" style="font-size:${big?34:30}px;padding:.6em 1.4em">Bestel op kossonutrition.nl →</span></div>`;
}

function A3_problem(p,S){ // PROBLEEM → OPLOSSING — consideration, claim-safe. clean textured split
  const big=S.key==='story';
  const floor = S.safeBot-(big?20:0);
  return `
  <div style="position:absolute;inset:0;background:linear-gradient(180deg,#ffffff,#eef2f5)"></div>
  <div style="position:absolute;left:-10%;top:-8%;width:60%;height:50%;border-radius:50%;background:var(--accent);opacity:.10;filter:blur(80px)"></div>
  <div style="position:absolute;left:0;right:0;bottom:0;height:54%;background:linear-gradient(180deg,#181818,#0c0c0c)"></div>
  <div style="position:absolute;left:0;right:0;bottom:0;height:54%">${BG.grain(0.12)}</div>
  <div style="position:absolute;left:0;right:0;bottom:54%;height:120px;background:linear-gradient(180deg,transparent,rgba(0,0,0,.12))"></div>
  <div style="position:absolute;left:${S.side}px;right:${S.side}px;top:${S.safeTop-(big?60:24)}px">${logo(1.05,'#111')}</div>
  <div style="position:absolute;left:${S.side}px;right:${S.side}px;top:${big?330:250}px">
    <span class="pill" style="background:#111;color:#fff;font-size:26px;padding:.5em 1em">DE SITUATIE</span>
    <div class="disp" style="color:#111;font-size:${big?92:80}px;margin-top:18px">${p.problem}</div>
  </div>
  <div style="position:absolute;left:${S.side}px;top:${big?720:560}px;display:flex;align-items:center;gap:.5em">
    <span class="disp" style="color:var(--accent);font-size:${big?64:54}px">↓</span>
    <span class="pill" style="background:var(--accent);color:#fff;font-size:26px;padding:.5em 1em">DE OPLOSSING</span>
  </div>
  ${BG.contact(big?'24%':'22%', floor-6, big?420:360, 50)}
  <img class="prod" src="${p.cutAbs}" style="position:absolute;left:${big?-2:-4}%;bottom:${floor}px;max-width:${big?56:50}%;max-height:${big?44:46}%;object-fit:contain;filter:drop-shadow(0 26px 40px rgba(0,0,0,.5))"/>
  <div style="position:absolute;right:${S.side}px;bottom:${big?420:300}px;width:${big?48:46}%;text-align:right">
    <div class="disp" style="color:#fff;font-size:${big?80:68}px">${p.name}</div>
    <div class="cond" style="color:#dcdcdc;font-weight:700;font-size:${big?36:32}px;margin-top:14px;line-height:1.2">${p.solution}</div>
  </div>
  <div style="position:absolute;right:${S.side}px;bottom:${big?180:90}px">${stars(0.92)}</div>`;
}

function A4_info(p,S){ // INFORMATIEF / USP — education. realistic carbon <-> immersive ambient
  const big=S.key==='story';
  const bg = (p.rank%2===1) ? BG.carbon(p.accent) : (BG.ambient(p.cutAbs,p.accent,true)+`<div style="position:absolute;left:0;top:0;bottom:0;width:12px;background:linear-gradient(180deg,var(--accent),var(--accentDeep))"></div>`);
  const chips = p.usps.map(u=>`<div style="display:flex;align-items:center;gap:.6em;margin-bottom:${big?22:16}px">
      <span style="flex:0 0 auto;width:${big?52:46}px;height:${big?52:46}px;border-radius:50%;background:var(--accent);color:#fff;display:flex;align-items:center;justify-content:center;font-family:Anton;font-size:${big?26:22}px;box-shadow:0 6px 18px rgba(0,0,0,.4)">✓</span>
      <span class="cond" style="color:#fff;font-weight:700;text-transform:uppercase;letter-spacing:.02em;font-size:${big?38:33}px">${u}</span></div>`).join('');
  return `
  ${bg}
  ${BG.grain(0.07)}
  <div style="position:absolute;left:${S.side}px;right:${S.side}px;top:${S.safeTop-(big?60:24)}px;display:flex;justify-content:space-between;align-items:center">
    ${logo(1.05)}<span class="pill badge-blue" style="font-size:24px;padding:.5em .9em">Wat zit erin?</span></div>
  <div style="position:absolute;left:${S.side}px;top:${big?330:250}px">
    <div class="cond" style="font-weight:700;letter-spacing:.3em;text-transform:uppercase;color:var(--accent);font-size:${big?30:26}px">${p.kicker}</div>
    <div class="disp" style="color:#fff;font-size:${big?104:88}px;margin-top:8px">${p.name}</div>
  </div>
  <img class="prod" src="${p.cutAbs}" style="position:absolute;right:${big?-4:-6}%;top:${big?560:430}px;max-width:${big?52:48}%;max-height:${big?40:42}%;object-fit:contain;filter:drop-shadow(0 26px 44px rgba(0,0,0,.55))"/>
  <div style="position:absolute;left:${S.side}px;top:${big?620:480}px;width:${big?60:58}%">${chips}</div>
  ${p.claim?`<div style="position:absolute;left:${S.side}px;right:${S.side}px;bottom:${big?170:96}px">
     <div class="cond" style="color:#e6e6e6;font-weight:700;font-size:${big?30:26}px;line-height:1.25;border-left:5px solid var(--accent);padding-left:16px">${p.claim}</div></div>`:''}
  <div style="position:absolute;left:${S.side}px;right:${S.side}px;bottom:${big?80:36}px">
    <div class="legal" style="color:#9a9a9a;font-size:19px">${p.legal||'Voedingssupplement. Niet ter vervanging van een gevarieerde voeding en gezonde leefstijl.'}</div></div>`;
}

function A5_social(p,S){ // SOCIAL PROOF — trust, claim-free. clean light + bokeh + reflection
  const big=S.key==='story';
  const pb = big?180:200;
  return `
  ${BG.meshLight(p.accent)}
  <div style="position:absolute;left:0;right:0;top:0;height:14px;background:linear-gradient(90deg,var(--accent),var(--blue))"></div>
  <div style="position:absolute;left:${S.side}px;right:${S.side}px;top:${S.safeTop-(big?60:24)}px;display:flex;justify-content:space-between;align-items:center">
    ${logo(1.05,'#111')}<span class="pill badge-red" style="font-size:24px;padding:.5em .9em">★ Bestseller</span></div>
  <div style="position:absolute;left:0;right:0;top:${big?330:240}px;text-align:center">
    <div class="disp" style="color:var(--gold);font-size:${big?120:104}px;letter-spacing:.06em;text-shadow:0 6px 20px rgba(230,180,0,.3)">★★★★★</div>
    <div class="disp" style="color:#111;font-size:${big?92:80}px;margin-top:6px">4,5 / 5</div>
    <div class="cond" style="color:#345;font-weight:700;text-transform:uppercase;letter-spacing:.12em;font-size:${big?34:30}px;margin-top:6px">5.300+ beoordelingen</div>
  </div>
  <div style="position:absolute;left:${big?120:90}px;right:${big?120:90}px;top:${big?690:520}px;text-align:center">
    <div class="cond" style="color:#0c2a3e;font-weight:700;font-style:italic;font-size:${big?44:38}px;line-height:1.3">“${p.quote}”</div>
    <div class="cond" style="color:#5a7488;font-weight:700;text-transform:uppercase;letter-spacing:.1em;font-size:${big?26:23}px;margin-top:16px">— Geverifieerde klant</div>
  </div>
  ${BG.contact('50%', pb-8, big?420:340, 48)}
  ${BG.reflection(p.cutAbs,'50%', pb-(big?260:210), big?'48%':'40%', big?'30%':'26%')}
  <img class="prod" src="${p.cutAbs}" style="position:absolute;left:50%;transform:translateX(-50%);bottom:${pb}px;max-width:${big?54:44}%;max-height:${big?34:30}%;object-fit:contain;filter:drop-shadow(0 24px 36px rgba(0,0,0,.28))"/>
  <div style="position:absolute;left:0;right:0;bottom:${big?100:104}px;text-align:center">
    <span class="disp" style="color:#111;font-size:${big?52:44}px">${p.name}</span></div>`;
}

const ARCHETYPES = { A1_hero, A2_sale, A3_problem, A4_info, A5_social };
const ORDER = ['A1_hero','A2_sale','A3_problem','A4_info','A5_social'];

function buildHTML(p, sizeKey, archKey, debugSafe=false){
  const S = SIZES[sizeKey];
  const accent = p.accent || '#E84E4E';
  const accentDeep = p.accentDeep || accent;
  const inner = ARCHETYPES[archKey](p, S);
  const safe = debugSafe ? `<div class="safe"><div class="z" style="top:0;height:${S.safeTop}px"></div><div class="z" style="bottom:0;height:${S.safeBot}px"></div><div class="ln" style="top:${S.safeTop}px"></div><div class="ln" style="bottom:${S.safeBot}px"></div></div>`:'';
  return `<!doctype html><html><head><meta charset="utf-8"><style>${BASE_CSS}</style></head><body>
  <div class="stage" style="width:${S.w}px;height:${S.h}px;background:#0c0c0c;--accent:${accent};--accentDeep:${accentDeep}">${inner}${safe}</div>
  </body></html>`;
}

module.exports = { SIZES, ARCHETYPES, ORDER, buildHTML, FONTDIR };
