// Render the Design System style-guide board (1600x2200) for client sign-off.
const fs=require('fs'), path=require('path');
const FONTDIR='file://'+path.resolve(__dirname,'../assets/fonts');
const BASE=fs.readFileSync(path.resolve(__dirname,'../templates/base.css'),'utf8').split('FONTDIR').join(FONTDIR);
const sw=(name,hex,fg='#fff')=>`<div style="display:flex;flex-direction:column"><div style="width:170px;height:120px;border-radius:14px;background:${hex};border:1px solid #e2e2e2"></div><div class="cond" style="font-weight:700;margin-top:8px;font-size:22px;color:#111">${name}</div><div class="cond" style="color:#777;font-size:20px">${hex}</div></div>`;
const html=`<!doctype html><html><head><meta charset="utf-8"><style>${BASE}</style></head>
<body><div class="stage" style="width:1600px;height:2260px;background:#fff;padding:70px 80px;color:#111">
  <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:4px solid #111;padding-bottom:26px">
    <img src="file://${path.resolve(__dirname,'../assets/logo/logo-main.svg')}" style="height:64px"/>
    <div class="disp" style="font-size:40px;color:#111">AD CREATIVE · DESIGN SYSTEM</div>
  </div>

  <div class="disp" style="font-size:34px;margin:40px 0 18px;color:var(--red)">01 — Kleurenpalet</div>
  <div style="display:flex;gap:26px;flex-wrap:wrap">
    ${sw('Ink','#111111')}${sw('Brand Blue','#65BEEC')}${sw('Energy Red','#E84E4E')}${sw('Sale Red','#C8202E')}${sw('Gold ★','#E6B400')}${sw('Paper','#F8F8F8','#111')}${sw('White','#FFFFFF','#111')}
  </div>

  <div class="disp" style="font-size:34px;margin:48px 0 18px;color:var(--red)">02 — Typografie</div>
  <div style="display:flex;gap:70px;align-items:flex-end">
    <div><div class="cond" style="color:#777;font-size:22px;letter-spacing:.2em">DISPLAY · KOPPEN</div><div class="disp" style="font-size:120px;line-height:.9">ANTON</div><div class="cond" style="color:#999;font-size:22px">Altijd hoofdletters · Anton</div></div>
    <div><div class="cond" style="color:#777;font-size:22px;letter-spacing:.2em">BODY · TEKST</div><div class="cond" style="font-size:58px;font-weight:700">Roboto Condensed</div><div class="cond" style="font-size:40px;font-weight:400">Regular &amp; Bold · 400 / 700 / 900</div></div>
  </div>

  <div class="disp" style="font-size:34px;margin:48px 0 18px;color:var(--red)">03 — Componenten</div>
  <div style="display:flex;gap:20px;align-items:center;flex-wrap:wrap">
    <span class="pill badge-red" style="font-size:26px;padding:.5em 1em">★ Bestseller</span>
    <span class="pill badge-blue" style="font-size:26px;padding:.5em 1em">Wat zit erin?</span>
    <span class="pill badge-black" style="font-size:26px;padding:.5em 1em">Bestel nu →</span>
    <span class="stars" style="font-size:30px;--star-fg:#111"><span class="s">★★★★★</span><span class="lbl">4,5 / 5 · 5.300+</span></span>
    <span style="display:inline-flex;flex-direction:column;align-items:flex-start"><span class="cond" style="font-weight:900;text-transform:uppercase;letter-spacing:.08em;font-size:22px;color:#fff;background:#E84E4E;padding:.1em .5em;border-radius:6px 6px 0 0">Nu vanaf</span><span class="price" style="font-size:84px;color:#fff;background:#111;padding:.04em .2em .08em;border-radius:0 10px 10px 10px"><span class="cur">€</span>6<span class="cents">,00</span></span></span>
  </div>

  <div class="disp" style="font-size:34px;margin:48px 0 18px;color:var(--red)">04 — De 5 creative concepten (per product)</div>
  <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:20px">
    ${[['01','HERO','Merk &amp; bestseller','#111','#fff'],['02','SALE','Prijs &amp; aanbod','var(--red)','#fff'],['03','PROBLEEM→OPLOSSING','Herkenning','#F8F8F8','#111'],['04','INFORMATIEF','USP’s &amp; feiten','#1a1a1a','#fff'],['05','SOCIAL PROOF','Reviews &amp; sterren','#eef6fc','#111']].map(c=>`
      <div style="border-radius:16px;overflow:hidden;border:1px solid #e2e2e2;background:${c[3]};color:${c[4]};aspect-ratio:4/5;display:flex;flex-direction:column;justify-content:space-between;padding:22px">
        <div class="cond" style="font-weight:700;font-size:22px;opacity:.6">${c[0]}</div>
        <div><div class="disp" style="font-size:34px;line-height:.95">${c[1]}</div><div class="cond" style="font-size:22px;margin-top:8px;opacity:.85">${c[2]}</div></div>
      </div>`).join('')}
  </div>

  <div class="disp" style="font-size:34px;margin:48px 0 16px;color:var(--red)">05 — Formaten &amp; NVWA/EU compliance</div>
  <div style="display:flex;gap:50px">
    <div class="cond" style="font-size:30px;line-height:1.5;color:#222">
      <b>Story</b> 1080×1920 (9:16) · <b>Feed</b> 1080×1350 (4:5)<br>
      Veilige marges gerespecteerd (boven/onder vrij voor UI &amp; caption)
    </div>
    <div class="cond" style="font-size:26px;line-height:1.5;color:#222;border-left:5px solid var(--red);padding-left:22px">
      ✓ Geen ongeoorloofde gezondheidsclaims<br>
      ✓ Alleen EU-toegestane claims (eiwitten, creatine) met exacte bewoording<br>
      ✓ Botanicals (Ashwagandha) &amp; pre-workouts: claimvrij<br>
      ✓ Verplichte vermeldingen (cafeïne, supplement-disclaimer)
    </div>
  </div>
</div></body></html>`;
const out=path.resolve(__dirname,'../design-system/styleguide.html');
fs.writeFileSync(out,html);
console.log('wrote',out);
