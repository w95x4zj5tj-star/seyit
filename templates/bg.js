// Rich background system for Kosso creatives. Pure CSS/SVG — renders offline in Chrome.
// Every generator returns full-bleed layered HTML using --accent / --accentDeep.

let _uid = 0;
const uid = () => 'fx' + (++_uid);

// --- film grain via inline SVG turbulence (no data-URI quoting issues) ---
function grain(opacity=0.10, blend='overlay'){
  const id = uid();
  return `<svg width="100%" height="100%" viewBox="0 0 1080 1080" preserveAspectRatio="none" style="position:absolute;inset:0;opacity:${opacity};mix-blend-mode:${blend};pointer-events:none">
    <filter id="${id}"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>
    <rect width="100%" height="100%" filter="url(#${id})"/></svg>`;
}
// --- soft smoke/cloud texture (inline SVG) ---
function smoke(opacity=0.5, blend='screen'){
  const id = uid();
  return `<svg width="100%" height="100%" viewBox="0 0 1080 1920" preserveAspectRatio="none" style="position:absolute;inset:0;opacity:${opacity};mix-blend-mode:${blend};pointer-events:none">
    <filter id="${id}"><feTurbulence type="fractalNoise" baseFrequency="0.011" numOctaves="4" seed="7"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="gamma" amplitude="1" exponent="2.6"/></feComponentTransfer></filter>
    <rect width="100%" height="100%" filter="url(#${id})"/></svg>`;
}
function vignette(strength=0.55){
  return `<div style="position:absolute;inset:0;background:radial-gradient(120% 100% at 50% 42%, transparent 40%, rgba(0,0,0,${strength}) 100%);pointer-events:none"></div>`;
}
function bokeh(accent){
  const blob=(x,y,s,c,o)=>`<div style="position:absolute;left:${x}%;top:${y}%;width:${s}px;height:${s}px;border-radius:50%;background:${c};filter:blur(70px);opacity:${o};transform:translate(-50%,-50%)"></div>`;
  return blob(20,18,520,accent,.5)+blob(86,30,440,'var(--accentDeep)',.45)+blob(70,86,560,accent,.4)+blob(12,82,360,'#ffffff',.10);
}
// --- immersive backdrop derived from the product's own art (blurred blow-up) ---
function ambient(cutAbs, accent, dark=true){
  return `
  <div style="position:absolute;inset:0;background:radial-gradient(120% 90% at 50% 30%, ${accent} 0%, var(--accentDeep) 45%, #0a0a0a 100%)"></div>
  <img src="${cutAbs}" style="position:absolute;left:50%;top:42%;transform:translate(-50%,-50%) scale(2.7);width:80%;filter:blur(64px) brightness(${dark?0.55:1.1}) saturate(1.5);opacity:.7"/>
  <div style="position:absolute;inset:0;background:radial-gradient(110% 80% at 50% 36%, transparent 30%, rgba(0,0,0,.6) 100%)"></div>`;
}
// --- studio: dark sweep + reflective floor + top spotlight ---
function studio(accent){
  return `
  <div style="position:absolute;inset:0;background:linear-gradient(180deg,#1c1c1c 0%,#121212 46%,#0a0a0a 100%)"></div>
  <div style="position:absolute;left:50%;top:-12%;width:120%;height:70%;transform:translateX(-50%);background:radial-gradient(closest-side, ${accent} 0%, transparent 70%);opacity:.34;filter:blur(8px)"></div>
  <div style="position:absolute;left:0;right:0;bottom:0;height:34%;background:linear-gradient(180deg,transparent,rgba(255,255,255,.05) 60%,rgba(255,255,255,.09));"></div>
  <div style="position:absolute;left:0;right:0;bottom:0;height:2px;background:linear-gradient(90deg,transparent,${accent},transparent);opacity:.5"></div>`;
}
// --- energy: bold accent flood + light streaks ---
function energy(accent){
  const streak=(x,w,o,rot)=>`<div style="position:absolute;left:${x}%;top:-20%;width:${w}px;height:160%;background:linear-gradient(180deg,transparent,rgba(255,255,255,${o}),transparent);transform:rotate(${rot}deg);filter:blur(6px)"></div>`;
  return `
  <div style="position:absolute;inset:0;background:linear-gradient(150deg, ${accent} 0%, var(--accentDeep) 70%, #111 140%)"></div>
  <div style="position:absolute;inset:0;background:radial-gradient(90% 70% at 78% 22%, rgba(255,255,255,.22), transparent 60%)"></div>
  ${streak(18,60,.18,14)}${streak(40,30,.12,14)}${streak(64,80,.1,14)}`;
}
// --- carbon: dark technical texture + accent edge ---
function carbon(accent){
  return `
  <div style="position:absolute;inset:0;background:#0d0d0d"></div>
  <div style="position:absolute;inset:0;background-image:repeating-linear-gradient(45deg,rgba(255,255,255,.035) 0 2px,transparent 2px 6px),repeating-linear-gradient(-45deg,rgba(255,255,255,.025) 0 2px,transparent 2px 6px)"></div>
  <div style="position:absolute;inset:0;background:radial-gradient(120% 80% at 80% 8%, rgba(255,255,255,.10), transparent 55%)"></div>
  <div style="position:absolute;left:0;top:0;bottom:0;width:12px;background:linear-gradient(180deg,${accent},var(--accentDeep))"></div>`;
}
// --- light mesh: soft pastel bokeh on near-white ---
function meshLight(accent){
  return `
  <div style="position:absolute;inset:0;background:linear-gradient(180deg,#ffffff,#eef3f7)"></div>
  <div style="position:absolute;left:-8%;top:-6%;width:60%;height:60%;border-radius:50%;background:${accent};opacity:.16;filter:blur(90px)"></div>
  <div style="position:absolute;right:-10%;top:30%;width:55%;height:55%;border-radius:50%;background:var(--blue);opacity:.16;filter:blur(90px)"></div>
  <div style="position:absolute;left:30%;bottom:-12%;width:50%;height:50%;border-radius:50%;background:${accent};opacity:.10;filter:blur(90px)"></div>`;
}
// --- realistic floor reflection of a product image (mirror + fade) ---
function reflection(cutAbs, leftPct, bottomPx, widthPct, maxHPct){
  return `<img src="${cutAbs}" style="position:absolute;left:${leftPct};bottom:${bottomPx}px;width:${widthPct};max-height:${maxHPct};object-fit:contain;object-position:bottom;transform:translateX(-50%) scaleY(-1);opacity:.20;-webkit-mask-image:linear-gradient(to bottom,rgba(0,0,0,.5),transparent 55%);mask-image:linear-gradient(to bottom,rgba(0,0,0,.5),transparent 55%);filter:blur(1px)"/>`;
}
// --- soft contact shadow ellipse under product ---
function contact(leftPct, bottomPx, w, h){
  return `<div style="position:absolute;left:${leftPct};bottom:${bottomPx}px;width:${w}px;height:${h}px;transform:translateX(-50%);background:radial-gradient(closest-side, rgba(0,0,0,.55), transparent 72%);filter:blur(6px)"></div>`;
}

module.exports = { grain, smoke, vignette, bokeh, ambient, studio, energy, carbon, meshLight, reflection, contact, aiPhoto };

// --- photoreal AI background (Higgsfield) + legibility scrim. Used in --aibg mode. ---
function aiPhoto(fileUrl, accent){
  return `
  <img src="${fileUrl}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover"/>
  <div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(0,0,0,.62) 0%, rgba(0,0,0,.30) 34%, rgba(0,0,0,.42) 64%, rgba(0,0,0,.78) 100%)"></div>
  <div style="position:absolute;inset:0;background:radial-gradient(120% 90% at 50% 30%, transparent 40%, rgba(0,0,0,.5) 100%)"></div>
  <div style="position:absolute;left:0;top:0;bottom:0;width:10px;background:linear-gradient(180deg,${accent},${accent}00)"></div>`;
}
