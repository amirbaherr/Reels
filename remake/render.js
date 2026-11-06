// usage: node render.js stills out_dir t1 t2 ...   |  node render.js video out.mp4 startFrame endFrame
const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),{spawn}=require('child_process');
const FPS=30;
(async()=>{
  const [mode,out,...rest]=process.argv.slice(2);
  const font=fs.readFileSync(path.join(__dirname,'ECPeyda-Medium.ttf')).toString('base64');
  const html=fs.readFileSync(path.join(__dirname,'reel.html'),'utf8').replace('FONT_URL','data:font/ttf;base64,'+font);
  const b=await chromium.launch();const p=await b.newPage({viewport:{width:540,height:960}});
  p.on('pageerror',e=>{console.error('PAGEERR',e.message);process.exit(1);});
  await p.setContent(html);await p.evaluate(()=>init());
  const grab=t=>p.evaluate(t=>{render(t);return document.getElementById('c').toDataURL('image/png');},t);
  if(mode==='stills'){
    fs.mkdirSync(out,{recursive:true});
    for(const t of rest){const d=await grab(+t);fs.writeFileSync(path.join(out,`t${(+t).toFixed(2)}.png`),Buffer.from(d.split(',')[1],'base64'));}
  }else{
    const [s,e]=rest.map(Number);
    const ff=spawn('ffmpeg',['-y','-v','error','-f','image2pipe','-framerate',String(FPS),'-c:v','png','-i','-','-c:v','libx264','-preset','medium','-crf','16','-pix_fmt','yuv420p','-r',String(FPS),out],{stdio:['pipe','inherit','inherit']});
    for(let f=s;f<e;f++){
      const d=await grab(f/FPS);const buf=Buffer.from(d.split(',')[1],'base64');
      if(!ff.stdin.write(buf))await new Promise(r=>ff.stdin.once('drain',r));
      if(f%150===0)console.log(out,f);
    }
    ff.stdin.end();await new Promise(r=>ff.on('close',r));
  }
  await b.close();
})();
