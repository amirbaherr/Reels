// Usage:
//   node render.js frames <fps> <duration> <outDir> [workers]
//   node render.js stills <outDir> t1 t2 ...
const {chromium}=require('playwright');
const path=require('path'),fs=require('fs');
const url='file://'+path.resolve(__dirname,'index.html');
async function page(b){const p=await b.newPage({viewport:{width:1080,height:1920},deviceScaleFactor:1});
  await p.goto(url);await p.evaluate(()=>window.ready);return p;}
(async()=>{
  const [mode,...a]=process.argv.slice(2);
  const b=await chromium.launch({args:['--disable-web-security','--allow-file-access-from-files']});
  if(mode==='stills'){const [out,...ts]=a;fs.mkdirSync(out,{recursive:true});const p=await page(b);
    for(const t of ts){await p.evaluate(t=>window.render(t),+t);await p.screenshot({path:`${out}/t${(+t).toFixed(2)}.jpg`,type:'jpeg',quality:88});}
    await b.close();return;}
  const fps=+a[0],dur=+a[1],out=a[2],W=+(a[3]||4);fs.mkdirSync(out,{recursive:true});
  const N=Math.ceil(fps*dur);let next=0,done=0;const t0=Date.now();
  await Promise.all([...Array(W)].map(async()=>{const p=await page(b);
    while(true){const i=next++;if(i>=N)break;const f=`${out}/f${String(i).padStart(5,'0')}.jpg`;
      if(!fs.existsSync(f)){await p.evaluate(t=>window.render(t),i/fps);await p.screenshot({path:f,type:'jpeg',quality:94});}
      if(++done%60===0)process.stdout.write(`${done}/${N} ${((Date.now()-t0)/1000).toFixed(0)}s\n`);}
  }));
  await b.close();
})();
