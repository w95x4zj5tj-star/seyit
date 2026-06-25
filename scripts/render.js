// Render creatives to PNG via headless Chrome.
// Usage: node scripts/render.js --ranks=1 --sizes=feed45,story [--arch=A1_hero,...] [--debug] [--out=creatives]
const { execFile } = require('child_process');
const fs = require('fs');
const path = require('path');
const C = require('../templates/creative.js');

const CHROME = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const ROOT = path.resolve(__dirname, '..');
const TMP = path.join(ROOT, '.rtmp');
fs.mkdirSync(TMP, { recursive: true });

function arg(name, def){ const m=process.argv.find(a=>a.startsWith('--'+name+'=')); return m?m.split('=').slice(1).join('='):def; }
const hasFlag = n => process.argv.includes('--'+n);

const specs = JSON.parse(fs.readFileSync(path.join(ROOT,'data/copy.json'),'utf8'));
const ranksArg = arg('ranks','all');
const ranks = ranksArg==='all' ? specs.map(s=>s.rank) : ranksArg.split(',').map(Number);
const sizes = arg('sizes','feed45,story').split(',');
const arches = arg('arch', C.ORDER.join(',')).split(',');
const outDir = arg('out','creatives');
const debug = hasFlag('debug');
const CONC = parseInt(arg('conc','4'),10);

const jobs=[];
for(const r of ranks){
  const p = specs.find(s=>s.rank===r);
  if(!p){ console.error('no spec rank',r); continue; }
  for(const size of sizes){
    for(const arch of arches){
      jobs.push({p,size,arch});
    }
  }
}

function renderOne(job){
  return new Promise((resolve)=>{
    const {p,size,arch}=job;
    const S=C.SIZES[size];
    const html=C.buildHTML(p,size,arch,debug,hasFlag('aibg'),hasFlag('noprod'));
    const id=`p${String(p.rank).padStart(2,'0')}_${arch}_${size}`;
    const htmlPath=path.join(TMP,id+'.html');
    fs.writeFileSync(htmlPath,html);
    const dir=path.join(ROOT,outDir,size); fs.mkdirSync(dir,{recursive:true});
    const png=path.join(dir,`p${String(p.rank).padStart(2,'0')}_${arch.replace(/^A\d_/,'')}.png`);
    const args=['--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--hide-scrollbars',
      '--force-device-scale-factor=1',`--window-size=${S.w},${S.h}`,
      `--screenshot=${png}`,'file://'+htmlPath];
    execFile(CHROME,args,{timeout:60000},(err)=>{
      if(err){ console.error('FAIL',id,err.message.split('\n')[0]); resolve({id,ok:false}); }
      else { const sz=fs.existsSync(png)?fs.statSync(png).size:0; console.log('ok',png.replace(ROOT+'/',''),sz); resolve({id,ok:sz>0,png}); }
    });
  });
}

(async()=>{
  let i=0, done=0; const results=[];
  async function worker(){
    while(i<jobs.length){
      const job=jobs[i++];
      results.push(await renderOne(job));
      done++;
    }
  }
  await Promise.all(Array.from({length:Math.min(CONC,jobs.length)},worker));
  const okc=results.filter(r=>r.ok).length;
  console.log(`\nRENDERED ${okc}/${jobs.length}`);
  if(okc<jobs.length) process.exit(1);
})();
