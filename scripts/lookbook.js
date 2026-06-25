// Build an HTML lookbook of all creatives, then Chrome prints it to one PDF.
const fs=require('fs'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
const FONTDIR='file://'+path.resolve(ROOT,'assets/fonts');
const BASE=fs.readFileSync(path.resolve(ROOT,'templates/base.css'),'utf8').split('FONTDIR').join(FONTDIR);
const specs=JSON.parse(fs.readFileSync(path.join(ROOT,'data/copy.json'),'utf8'));
const f=p=>'file://'+path.join(ROOT,p);
const order=['hero','sale','problem','info','social'];
const labels={hero:'Hero',sale:'Sale',problem:'Probleem→Oplossing',info:'Informatief',social:'Social proof'};

function thumb(src,cap){
  return `<div class="thumb"><img src="${src}"/><div class="cap">${cap}</div></div>`;
}
function productPage(p){
  const feed=order.map(a=>thumb(f(`output/thumbs/feed45/p${String(p.rank).padStart(2,'0')}_${a}.jpg`),labels[a])).join('');
  const story=order.map(a=>thumb(f(`output/thumbs/story/p${String(p.rank).padStart(2,'0')}_${a}.jpg`),labels[a])).join('');
  const claimTag=p.claim?`<span class="tag tag-blue">EU-toegestane claim</span>`:`<span class="tag tag-green">Claimvrij</span>`;
  return `<section class="page">
    <div class="phead">
      <div class="pnum">#${p.rank}</div>
      <div class="pname">${p.name}<span class="psub">${p.title}</span></div>
      <div class="pmeta"><span class="tag tag-dark">€${p.price}</span><span class="tag tag-dark">${p.type}</span>${claimTag}</div>
    </div>
    <div class="rowlabel">Feed · 4:5 (1080×1350)</div>
    <div class="row feed">${feed}</div>
    <div class="rowlabel">Story · 9:16 (1080×1920)</div>
    <div class="row story">${story}</div>
  </section>`;
}

const cover=`<section class="page cover">
  <img src="${f('assets/logo/logo-main.svg')}" style="height:96px"/>
  <div class="disp" style="font-size:120px;margin-top:40px;color:#111">AD CREATIVES</div>
  <div class="cond" style="font-size:40px;font-weight:700;color:var(--red);letter-spacing:.1em">TOP 15 PRODUCTEN · 5 CONCEPTEN · STORY + 4:5</div>
  <div class="cond" style="font-size:30px;color:#444;margin-top:30px;max-width:1000px;line-height:1.5">
    150 creatives, gegenereerd op basis van het Kosso Nutrition design system (echte merkkleuren, Anton + Roboto Condensed). Alle teksten zijn <b>NVWA/EU claim-safe</b>: geen ongeoorloofde gezondheidsclaims; uitsluitend EU-toegestane claims voor eiwitten en creatine met exacte bewoording.</div>
  <div class="cond" style="position:absolute;bottom:60px;font-size:26px;color:#888;letter-spacing:.2em">KWALITEIT = PRIORITEIT · kossonutrition.nl</div>
</section>`;

const html=`<!doctype html><html><head><meta charset="utf-8"><style>${BASE}
@page{size:1400px 990px;margin:0}
*{box-sizing:border-box}
body{margin:0;background:#fff;font-family:'Roboto Condensed',sans-serif}
.page{width:1400px;height:990px;padding:46px 56px;position:relative;page-break-after:always;background:#fff;overflow:hidden}
.cover{display:flex;flex-direction:column;align-items:flex-start;justify-content:center}
.phead{display:flex;align-items:center;gap:24px;border-bottom:4px solid #111;padding-bottom:16px;margin-bottom:14px}
.pnum{font-family:'Anton';font-size:54px;color:var(--red)}
.pname{font-family:'Anton';font-size:50px;color:#111;line-height:1;display:flex;flex-direction:column}
.psub{font-family:'Roboto Condensed';font-weight:700;font-size:20px;color:#888;text-transform:none;letter-spacing:0}
.pmeta{margin-left:auto;display:flex;gap:10px}
.tag{font-weight:700;text-transform:uppercase;letter-spacing:.05em;font-size:18px;padding:7px 14px;border-radius:999px}
.tag-dark{background:#111;color:#fff}.tag-blue{background:#65BEEC;color:#06243a}.tag-green{background:#28A745;color:#fff}
.rowlabel{font-weight:700;text-transform:uppercase;letter-spacing:.18em;font-size:18px;color:#999;margin:10px 0 8px}
.row{display:flex;gap:14px}
.thumb{flex:1;display:flex;flex-direction:column;align-items:center}
.thumb img{width:100%;border:1px solid #e2e2e2;border-radius:8px}
.row.feed .thumb img{height:300px;object-fit:contain;background:#000}
.row.story .thumb img{height:300px;object-fit:contain;background:#000}
.cap{font-weight:700;font-size:16px;color:#666;margin-top:5px;text-transform:uppercase;letter-spacing:.04em}
</style></head><body>
${cover}
${specs.map(productPage).join('')}
</body></html>`;
const out=path.join(ROOT,'output/lookbook.html');
fs.mkdirSync(path.join(ROOT,'output'),{recursive:true});
fs.writeFileSync(out,html);
console.log('wrote',out);
