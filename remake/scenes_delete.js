/* ===== "Where does a deleted file go?" — scenes ===== */
const END=39.6;
const CAPRAW=`0.78|وقتی@0.78 یک@1.46 فایل@1.58 رو@1.82
1.98|از@1.98 کامپیوتر@2.08 *پاک@2.58 می‌کنیم،*@2.98
3.60|واقعاً@3.60 *کجا@3.98 می‌ره؟*@4.36
4.76|جالبه@4.76 بدونی@5.40 که@5.70
5.86|کامپیوتر@5.86 معمولاً@6.46
7.00|همون@7.00 لحظه@7.34
7.72|اطلاعات@7.72 فایل@8.16 رو@8.44
8.60|*نابود@8.60 نمی‌کنه.*@8.92
9.72|در@9.72 واقع@10.28 فقط@10.52
10.98|*آدرس*@10.98 اون@11.50 فایل@11.76 رو@12.16
12.38|از@12.38 فهرست@12.66 اطلاعاتش@13.10
13.84|*حذف@13.84 می‌کنه*@14.28
14.72|و@14.72 فضایی@15.02 که@15.56 اشغال@15.68 کرده@16.02 رو@16.46
16.68|*آزاد*@16.68 اعلام@17.34 می‌کنه@17.72
18.12|تا@18.12 بعداً@18.30 اطلاعات@18.78 *جدیدی*@19.36
19.94|جاش@19.94 *ذخیره@20.46 بشه.*@20.96
21.28|یعنی@21.28 ممکنه@21.82 اطلاعات@22.22 فایل@22.66
22.98|*هنوز*@22.98 داخل@23.36 هارد@23.82
24.16|وجود@24.16 داشته@24.50 باشه@24.86
25.18|اما@25.18 دیگه@25.50 به@25.80 صورت@25.90 *عادی*@26.22
26.72|بهش@26.72 *دسترسی@26.94 نداریم.*@27.38
28.48|به@28.48 همین@28.76 دلیله@29.10 که@29.50
29.66|بعضی@29.66 وقتا@29.94 با@30.32 نرم‌افزار@30.54 *ریکاوری*@31.04
31.70|می‌تونیم@31.70 فایل‌های@32.10 پاک‌شده@32.52 رو@32.94
33.16|*برگردونیم.*@33.16
34.18|البته@34.18 این@34.82 موضوع@35.10
35.40|به@35.40 *نوع@35.52 حافظه*@35.68
36.22|و@36.22 *نحوه‌ی@36.32 حذف*@36.76 فایل@37.12
37.52|هم@37.52 *بستگی@37.62 داره.*@38.14
39.30|END`;
(function(){
  const L=CAPRAW.trim().split('\n').map(l=>{const [s,tx]=l.split('|');return {s:+s,tx};});
  for(let i=0;i<L.length-1;i++){
    const s=L[i].s,e=L[i+1].s;let inH=false;const words=[];
    for(let tok of L[i].tx.split(' ')){
      let [w,tt]=tok.split('@');
      if(w.startsWith('*')){inH=true;w=w.slice(1);}
      const h=inH;if(w.includes('*')){w=w.replace('*','');inH=false;}
      words.push({tx:w,hl:h,ltr:!RTL.test(w),t:+tt-.04});
    }
    for(let j=words.length-1;j>0;j--){if(words[j].hl&&words[j-1].hl){words[j-1].tx+=' '+words[j].tx;words.splice(j,1);}}
    CAPS.push({s,e,words});
  }
})();
CH.length=0;CH.push([0,'۱','فایل پاک‌شده کجا می‌ره؟'],[9.72,'۲','فهرست و آدرس'],[21.28,'۳','هنوز روی هارد'],[28.48,'۴','ریکاوری'],[34.18,'۵','بستگی داره'],[END,'','']);

/* ---------- shared pieces ---------- */
const DK={x:150,y:640,w:780,h:540};
const BC=i=>[855-(i%8)*90,DK.y+70+38+Math.floor(i/8)*90];
const FILES={txt:{idx:[2,3,4],col:P.a,name:'یادداشت',addr:'۳ تا ۵'},
  photo:{idx:[10,11,12,13,14,15],col:P.m,name:'عکس سفر',addr:'۱۱ تا ۱۶'},
  music:{idx:[26,27,28,29,30],col:P.n,name:'آهنگ',addr:'۲۷ تا ۳۱'}};
const OWN={};for(const k in FILES)FILES[k].idx.forEach(i=>OWN[i]=k);
const PHC=(()=>{let x=0,y=0;FILES.photo.idx.forEach(i=>{const c=BC(i);x+=c[0];y+=c[1];});const n=FILES.photo.idx.length;return [x/n,y/n];})();

function photoDoc(x,y,s,o={}){
  withT(x,y,{s,r:o.r||0,a:o.a??1},()=>{
    card(-130,-165,260,330,{fill:P.white,r:26,sh:12,lw:6});
    X.fillStyle=P.n;X.beginPath();X.moveTo(70,-165);X.lineTo(130,-105);X.lineTo(70,-105);X.closePath();X.fill();X.lineWidth=5;X.strokeStyle=P.ink;X.stroke();
    X.save();rr(-96,-120,192,170,16);X.clip();
    X.fillStyle=P.m;X.fillRect(-96,-120,192,170);
    X.fillStyle=P.n;X.beginPath();X.arc(44,-72,24,0,7);X.fill();
    X.fillStyle=P.ink;X.beginPath();X.moveTo(-110,60);X.lineTo(-40,-40);X.lineTo(10,20);X.lineTo(40,-8);X.lineTo(110,60);X.closePath();X.fill();
    X.restore();X.lineWidth=5;X.strokeStyle=P.ink;rr(-96,-120,192,170,16);X.stroke();
    txt('عکس سفر',0,100,36,P.ink);
  });
}
function trashCan(x,y,s,lid){
  withT(x,y,{s},()=>{
    card(-110,-90,220,250,{fill:P.white,r:26,sh:12});
    X.fillStyle='rgba(30,27,46,.28)';for(let i=-1;i<=1;i++){rr(i*55-7,-50,14,170,7);X.fill();}
    withT(-130,-110,{r:-lid},()=>{card(0,-22,260,44,{fill:P.a,r:16,sh:8});card(95,-50,70,34,{fill:P.a,r:12,sh:0});});
  });
}
function lockIcon(x,y,s,broken=0){
  withT(x,y,{s},()=>{
    X.lineWidth=18;X.strokeStyle=P.ink;X.lineCap='round';
    X.beginPath();X.arc(0,-40-broken*40,48,Math.PI,0);X.lineTo(48,-40-broken*40+10);X.stroke();
    X.beginPath();X.moveTo(-48,-40);X.lineTo(-48,-30);X.stroke();
    card(-80,-40,160,130,{fill:P.n,r:24,sh:10});
    X.fillStyle=P.ink;X.beginPath();X.arc(0,15,16,0,7);X.fill();rr(-6,15,12,36,5);X.fill();
  });
}
function lensIcon(x,y,r){
  X.lineWidth=14;X.strokeStyle=P.ink;X.beginPath();X.arc(x,y,r,0,7);X.stroke();
  X.lineCap='round';X.lineWidth=26;X.beginPath();X.moveTo(x+r*.72,y+r*.72);X.lineTo(x+r*1.35,y+r*1.35);X.stroke();
  X.lineWidth=14;X.strokeStyle=P.a;X.beginPath();X.moveTo(x+r*.8,y+r*.8);X.lineTo(x+r*1.3,y+r*1.3);X.stroke();
}
function hatch(x,y,w,h){
  X.save();rr(x,y,w,h,12);X.clip();X.strokeStyle='rgba(30,27,46,.35)';X.lineWidth=4;
  for(let k=-h;k<w;k+=16){X.beginPath();X.moveTo(x+k,y+h);X.lineTo(x+k+h,y);X.stroke();}X.restore();
}
function panel(x,y,w,h,title,o={}){
  card(x,y,w,h,{fill:P.white,r:30,sh:12,lw:6});
  X.fillStyle=o.bar||P.ink;rr(x+3,y+3,w-6,62,27);X.fill();X.fillRect(x+3,y+40,w-6,25);
  [P.m,P.n,P.mint].forEach((c,i)=>{X.fillStyle=c;X.beginPath();X.arc(x+44+i*34,y+34,11,0,7);X.fill();});
  txt(title,x+w-36,y+31,34,P.paper,'right','rtl');
}

/* ---------- A: delete into trash ---------- */
function sTrash(t){
  const al=vis(t,0,5.0,.2,.35);if(al<=0)return;
  X.save();X.globalAlpha=al;
  const lid=t<2.45?0:t<3.15?.5*eo(pr(t,2.45,2.65)):.5*(1-eb(pr(t,3.15,3.45)));
  const shake=t>3.6&&t<4.5?Math.sin(t*38)*.04*(1-pr(t,3.6,4.5)):0;
  withT(540,1110,{s:pop(t,.15,.45),r:shake},()=>trashCan(0,0,1,lid));
  // file flight
  const f=eio(pr(t,2.6,3.15));
  if(t<3.2){
    const x=lerp(540,540,f),y=lerp(640,1040,f)-Math.sin(f*Math.PI)*170;
    photoDoc(x,y,pop(t,.3,.5)*lerp(1,.25,f),{r:f*.9});
  }
  // cursor
  const ca=pr(t,1.4,1.7)*(1-pr(t,2.55,2.7));
  if(ca>0)withT(lerp(820,640,eio(pr(t,1.5,2.2))),lerp(980,700,eio(pr(t,1.5,2.2))),{a:ca,s:1-.15*Math.sin(Math.PI*pr(t,2.25,2.45))},()=>{
    X.beginPath();X.moveTo(0,0);X.lineTo(0,74);X.lineTo(20,56);X.lineTo(36,88);X.lineTo(50,81);X.lineTo(34,50);X.lineTo(60,48);X.closePath();
    X.fillStyle=P.white;X.fill();X.lineWidth=6;X.lineJoin='round';X.strokeStyle=P.ink;X.stroke();
  });
  [[3.98,540,660,230,0],[4.12,240,560,120,1],[4.24,850,600,140,2]].forEach(([tt,x,y,sz,ph])=>{
    const p=pop(t,tt,.38);if(p>0)withT(x,y,{s:p},()=>qmark(0,0,sz,t,ph,[P.m,P.a,P.n][ph]));
  });
  X.restore();
}

/* ---------- disk (B..H) ---------- */
function sDisk(t){
  const al=vis(t,4.7,34.45,.3,.3);if(al<=0)return;
  X.save();X.globalAlpha=al;
  const dp=pop(t,4.8,.5);
  withT(540,DK.y+DK.h/2,{s:dp},()=>{
    X.translate(-540,-(DK.y+DK.h/2));
    card(DK.x,DK.y,DK.w,DK.h,{fill:'#E9DFCC',r:36,sh:14,lw:7});
  });
  if(dp>.6)withT(DK.x+DK.w-120,DK.y,{s:pop(t,5.0,.35)},()=>chip('هارد دیسک',0,0,36,{fill:P.ink,color:P.n,sh:0}));
  // states
  const freeK=eo(pr(t,16.7,17.1));
  const dim=pr(t,26.9,27.2)*(1-pr(t,31.6,31.9));
  const fly=pr(t,32.05,32.7);
  const lens=t>22.1&&t<24.3?{x:lerp(760,140,eio(pr(t,22.2,24.1))),y:PHC[1],r:118}:null;
  const scan=t>30.8&&t<32.0?lerp(DK.y+40,DK.y+DK.h-40,eio(pr(t,30.85,31.9))):null;
  const drawBlock=(i,mode)=>{
    const [x,y]=BC(i);const own=OWN[i];
    const p=pop(t,4.95+((i%8)+Math.floor(i/8))*.03,.3);if(p<=0)return;
    let pulse=0;
    if(own==='photo'){
      pulse=Math.sin(Math.PI*pr(t,7.75+(i-10)*.05,8.1+(i-10)*.05))*.15+Math.sin(Math.PI*pr(t,15.0+(i-10)*.05,15.35+(i-10)*.05))*.12;
    }
    withT(x,y,{s:p*(1+pulse)},()=>{
      if(own==='photo'&&mode!=='full'){
        card(-38,-38,76,76,{fill:P.white,r:12,sh:0,lw:0});
        if(fly===0){
          X.save();X.globalAlpha*=lerp(1,.38,freeK)*(1-dim*.5);X.fillStyle=P.m;rr(-38,-38,76,76,12);X.fill();X.restore();
          if(freeK>0){X.save();X.globalAlpha*=freeK;hatch(-38,-38,76,76);X.restore();}
        }
        X.lineWidth=4;X.strokeStyle=P.ink;rr(-38,-38,76,76,12);X.stroke();
        txt(fa(i+1),0,-2,24,'rgba(30,27,46,.5)');
      }else{
        const fill=own?FILES[own].col:P.white;
        card(-38,-38,76,76,{fill,r:12,sh:0,lw:4});
        if(mode!=='full')txt(fa(i+1),0,-2,24,!own?'rgba(30,27,46,.35)':own==='txt'?P.white:P.ink);
      }
    });
  };
  for(let i=0;i<40;i++)drawBlock(i,(OWN[i]==='photo'&&t>=31.9)?'full':'normal');
  // lens reveal
  if(lens){
    X.save();X.beginPath();X.arc(lens.x,lens.y,lens.r,0,7);X.clip();
    X.fillStyle='#FFF6E3';X.fillRect(lens.x-lens.r,lens.y-lens.r,lens.r*2,lens.r*2);
    FILES.photo.idx.forEach(i=>drawBlock(i,'full'));
    X.restore();lensIcon(lens.x,lens.y,lens.r);
  }
  // scan line
  if(scan!==null){
    X.fillStyle='rgba(33,180,138,.25)';X.fillRect(DK.x+10,scan-40,DK.w-20,80);
    X.fillStyle=P.mint;X.fillRect(DK.x+10,scan-5,DK.w-20,10);
  }
  // recovered glow (before flying)
  const rg=pr(t,31.6,31.9)*(1-fly);
  if(rg>0&&fly===0){X.save();X.globalAlpha*=rg;FILES.photo.idx.forEach(i=>drawBlock(i,'full'));X.restore();
    X.save();X.globalAlpha*=rg*(.5+.5*Math.sin(t*12));X.lineWidth=8;X.strokeStyle=P.mint;const a=BC(15),b=BC(10);rr(a[0]-52,a[1]-52,b[0]-a[0]+104,104,20);X.stroke();X.restore();}
  // flying blocks
  if(fly>0&&fly<1){
    FILES.photo.idx.forEach((i,k)=>{const [x,y]=BC(i);const u=eio(pr(t,32.05+k*.04,32.55+k*.04));
      withT(lerp(x,540,u),lerp(y,470,u)-Math.sin(u*Math.PI)*120,{s:lerp(1,.5,u),a:1-pr(u,.85,1)},()=>card(-38,-38,76,76,{fill:P.m,r:12,sh:0,lw:4}));});
  }
  // free tag
  const ft=pop(t,16.75,.4)*(1-pr(t,21.9,22.2));
  if(ft>0)withT(PHC[0],PHC[1]-80,{s:ft,r:-.04},()=>chip('آزاد',0,0,46,{fill:P.mint}));
  // ghost new data (later)
  const gp=pr(t,19.4,19.7)*(1-pr(t,20.95,21.3));
  if(gp>0){
    X.save();X.globalAlpha*=gp;
    FILES.photo.idx.forEach((i,k)=>{const [x,y]=BC(i);const s=pop(t,19.4+k*.06,.3);
      withT(x,y,{s},()=>{X.setLineDash([10,8]);X.lineWidth=6;X.strokeStyle=P.mint;rr(-34,-34,68,68,10);X.stroke();X.setLineDash([]);
        const fl=pr(t,20.5+k*.05,20.75+k*.05)*(1-pr(t,20.95,21.2));if(fl>0){X.globalAlpha*=fl*.8;X.fillStyle=P.mint;rr(-34,-34,68,68,10);X.fill();}});});
    withT(PHC[0],PHC[1]+90,{s:pop(t,19.45,.35)},()=>chip('بعداً: دادهٔ جدید',0,0,38,{fill:P.white}));
    X.restore();
  }
  // still here
  const sh=pop(t,23.0,.4)*(1-pr(t,24.9,25.2));
  if(sh>0)withT(PHC[0],PHC[1]-92,{s:sh,r:.03},()=>chip('هنوز اینجاست!',0,0,46,{fill:P.m,color:P.white}));
  // lock
  const lk=pop(t,26.95,.42);
  if(lk>0){const br=pr(t,31.5,31.75);if(br<1)lockIcon(PHC[0],PHC[1]+10,lk*(1-br)*.85,br);}
  // shredder warning (B)
  X.restore();
}

/* ---------- top panels: index / explorer / recovery ---------- */
function sTop(t){
  const PX=150,PY=270,PW=780,PH=320;
  // destroy? -> not destroyed (B)
  const nd=pop(t,8.62,.4)*(1-pr(t,9.45,9.75));
  if(nd>0)withT(540,430,{s:nd},()=>{
    card(-90,-70,180,120,{fill:P.white,r:18,sh:10});
    X.fillStyle=P.ink;rr(-100,40,200,20,6);X.fill();
    X.fillStyle=P.m;for(let i=0;i<6;i++){rr(-75+i*28,60,14,40+((i*37)%25),4);X.fill();}
    X.lineWidth=22;X.strokeStyle=P.ink;X.beginPath();X.arc(5,10,150,0,7);X.stroke();
    X.lineWidth=18;X.strokeStyle=P.m;X.beginPath();X.arc(0,5,150,0,7);X.stroke();
    X.beginPath();X.moveTo(-106,-101);X.lineTo(106,111);X.stroke();
  });
  const cl1=pop(t,7.05,.35)*(1-pr(t,8.5,8.7));
  if(cl1>0)withT(540,430,{s:cl1},()=>{
    X.fillStyle=P.ink;X.beginPath();X.arc(6,6,110,0,7);X.fill();
    X.fillStyle=P.white;X.beginPath();X.arc(0,0,110,0,7);X.fill();X.lineWidth=8;X.strokeStyle=P.ink;X.stroke();
    const a=(t-7.05)*4;X.lineCap='round';X.lineWidth=12;X.beginPath();X.moveTo(0,0);X.lineTo(Math.sin(a)*70,-Math.cos(a)*70);X.stroke();
    X.lineWidth=10;X.strokeStyle=P.m;X.beginPath();X.moveTo(0,0);X.lineTo(0,-50);X.stroke();
    X.fillStyle=P.ink;X.beginPath();X.arc(0,0,12,0,7);X.fill();
  });
  // index
  const ia=vis(t,9.75,25.4,.3,.3);
  if(ia>0){
    X.save();X.globalAlpha*=ia;
    withT(540,PY+PH/2,{s:pop(t,9.78,.45)},()=>{X.translate(-540,-(PY+PH/2));panel(PX,PY,PW,PH,'فهرست فایل‌ها');});
    const rows=['txt','photo','music'];
    const del=pr(t,14.15,14.6);
    rows.forEach((k,r)=>{
      let y=PY+118+r*74;
      if(k==='music')y-=74*eio(del);
      if(k==='photo'&&del>=1)return;
      const p=pop(t,10.0+r*.12,.35);if(p<=0)return;
      const ra=k==='photo'?1-del:1;
      withT(540,y,{s:p,a:ra,sx:k==='photo'?1-del*.3:1},()=>{
        X.fillStyle=FILES[k].col;X.beginPath();X.arc(340,0,16,0,7);X.fill();X.lineWidth=4;X.strokeStyle=P.ink;X.stroke();
        txt(FILES[k].name,305,0,40,P.ink,'right','rtl');
        const hl=k==='photo'&&t>10.95;
        const pulse=k==='photo'?Math.sin(Math.PI*pr(t,10.98,11.4))*.15:0;
        withT(-230,0,{s:1+pulse},()=>chip('خونهٔ '+FILES[k].addr,0,0,32,{fill:hl?P.n:P.white,sh:4}));
        if(k==='photo'){const st=pr(t,13.85,14.12);if(st>0){X.lineWidth=9;X.strokeStyle=P.m;X.lineCap='round';X.beginPath();X.moveTo(360,0);X.lineTo(lerp(360,-370,st),0);X.stroke();}}
      });
    });
    // address link
    const lp=pr(t,11.0,11.55)*(1-pr(t,13.9,14.2));
    if(lp>0){
      const A=[540-230-110,PY+118+74],B=[BC(15)[0],BC(15)[1]-40],Cp=[A[0]-160,(A[1]+B[1])/2];
      X.save();X.setLineDash([4,18]);X.lineCap='round';X.lineWidth=11;X.strokeStyle=P.ink;X.beginPath();
      for(let u=0;u<=lp+1e-6;u+=.02){const v=Math.min(u,lp);const x=(1-v)*(1-v)*A[0]+2*(1-v)*v*Cp[0]+v*v*B[0],y=(1-v)*(1-v)*A[1]+2*(1-v)*v*Cp[1]+v*v*B[1];u?X.lineTo(x,y):X.moveTo(x,y);}
      X.stroke();X.restore();
    }
    X.restore();
  }
  // explorer
  const ea=vis(t,25.3,30.4,.3,.3);
  if(ea>0){
    X.save();X.globalAlpha*=ea;
    withT(540,PY+PH/2,{s:pop(t,25.35,.45)},()=>{
      X.translate(-540,-(PY+PH/2));panel(PX,PY,PW,PH,'جست‌وجو',{bar:P.a});
      card(PX+60,PY+105,PW-120,84,{fill:P.paper,r:42,sh:0,lw:5});
      lensIcon(PX+120,PY+142,20);
      const typed='عکس سفر';const n=Math.round(typed.length*pr(t,25.6,26.2));
      txt(typed.slice(0,n),PX+PW-100,PY+145,40,P.ink,'right','rtl');
      const rp=pop(t,26.3,.35);
      if(rp>0)withT(540,PY+250,{s:rp},()=>{txt('چیزی پیدا نشد',40,0,40,P.mute);crossMark(-150,0,26,1);});
    });
    X.restore();
  }
  // recovery app
  const ra=vis(t,30.45,32.2,.3,.25);
  if(ra>0){
    X.save();X.globalAlpha*=ra;
    withT(540,PY+PH/2,{s:pop(t,30.5,.45)},()=>{
      X.translate(-540,-(PY+PH/2));panel(PX,PY,PW,PH,'نرم‌افزار ریکاوری',{bar:P.mint});
      // lifebuoy
      withT(PX+130,PY+190,{r:t*2},()=>{
        for(let k=0;k<4;k++){X.lineWidth=40;X.strokeStyle=k%2?P.white:P.m;X.beginPath();X.arc(0,0,58,k*Math.PI/2,(k+1)*Math.PI/2);X.stroke();}
        X.lineWidth=5;X.strokeStyle=P.ink;X.beginPath();X.arc(0,0,79,0,7);X.stroke();X.beginPath();X.arc(0,0,37,0,7);X.stroke();
      });
      const pp=eio(pr(t,30.85,31.9));
      card(PX+250,PY+170,440,44,{fill:P.paper,r:22,sh:0,lw:5});
      if(pp>0){X.fillStyle=P.mint;rr(PX+250+440*(1-pp),PY+170,440*pp,44,22);X.fill();X.lineWidth=5;X.strokeStyle=P.ink;rr(PX+250,PY+170,440,44,22);X.stroke();}
      txt(pp<1?'در حال اسکن… '+fa(Math.round(pp*100))+'٪':'۱ فایل پیدا شد!',PX+690,PY+125,36,pp<1?P.ink:P.mint,'right','rtl');
    });
    X.restore();
  }
  // restored file
  const rf=pop(t,32.6,.5);
  if(rf>0&&t<34.5){
    X.save();X.globalAlpha*=1-pr(t,34.1,34.45);
    photoDoc(540,440,rf*.95,{r:Math.sin(t*2)*.03});
    const ck=pop(t,33.2,.4);if(ck>0)check(660,300,50,ck);
    const r=rng(21);for(let i=0;i<6;i++){const s=pop(t,32.8+i*.06,.4)*(.8+.3*Math.sin(t*6+i));if(s>0)spark(260+r()*560,300+r()*300,s,[P.n,P.m,P.mint][i%3],t+i);}
    X.restore();
  }
}

/* ---------- I: depends ---------- */
function sDepends(t){
  const al=pr(t,34.3,34.6);if(al<=0)return;
  X.save();X.globalAlpha=al;
  const items=[
    {x:810,t:35.55,lab:'HDD',v:'شانس بیشتر',vc:P.mint,vt:36.0,icon:'hdd'},
    {x:540,t:35.75,lab:'SSD',v:'شانس کمتر',vc:P.n,vt:36.15,icon:'ssd'},
    {x:270,t:36.4,lab:'حذف امن',v:'تقریباً هیچ',vc:P.m,vt:36.95,icon:'shred'}];
  items.forEach(it=>{
    const p=pop(t,it.t,.42);if(p<=0)return;
    withT(it.x,820+Math.sin(t*2+it.x)*6,{s:p},()=>{
      card(-120,-170,240,320,{fill:P.white,r:32,sh:12});
      if(it.icon==='hdd'){
        card(-80,-130,160,190,{fill:'#D9CFBE',r:18,sh:0,lw:5});
        X.fillStyle=P.white;X.beginPath();X.arc(0,-40,62,0,7);X.fill();X.lineWidth=5;X.strokeStyle=P.ink;X.stroke();
        X.beginPath();X.arc(0,-40,14,0,7);X.fillStyle=P.ink;X.fill();
        withT(52,30,{r:-.9-.15*Math.sin(t*3)},()=>{X.lineWidth=10;X.lineCap='round';X.beginPath();X.moveTo(0,0);X.lineTo(0,-80);X.stroke();});
      }else if(it.icon==='ssd'){
        card(-80,-120,160,170,{fill:P.ink,r:16,sh:0,lw:5});
        for(let k=0;k<4;k++){X.fillStyle=P.a;rr(-64+k*34,-100,26,60,4);X.fill();}
        card(-46,-20,92,40,{fill:P.n,r:8,sh:0,lw:4});
        X.fillStyle=P.n;for(let k=0;k<6;k++){rr(-60+k*22,50,12,22,3);X.fill();}
      }else{
        card(-84,-110,168,100,{fill:P.a,r:16,sh:0,lw:5});
        X.fillStyle=P.ink;rr(-70,-40,140,14,6);X.fill();
        const r=rng(4);X.fillStyle=P.m;for(let k=0;k<7;k++){rr(-66+k*20,-18,11,40+r()*40+Math.sin(t*8+k)*6,3);X.fill();X.lineWidth=3;X.strokeStyle=P.ink;X.stroke();}
      }
      txt(it.lab,0,110,48,P.ink);
    });
    const vp=pop(t,it.vt,.38);
    if(vp>0)withT(it.x,1060,{s:vp,r:(it.x-540)*-.0001},()=>chip(it.v,0,0,34,{fill:it.vc,color:it.vc===P.m?P.white:P.ink}));
  });
  const ap=pop(t,34.3,.45)*(1-pr(t,37.45,37.65));
  if(ap>0)withT(540,470,{s:ap,r:.03},()=>chip('البته…',0,0,72,{fill:P.n,sh:10}));
  const bp=pop(t,37.65,.5);
  if(bp>0){
    withT(540,470,{s:bp,r:-.04},()=>{card(-280,-80,560,160,{fill:P.ink,r:40,sh:12,shc:P.m});txt('بستگی داره!',0,-6,84,P.n);});
    const r=rng(8);for(let i=0;i<5;i++){const s=pop(t,37.8+i*.08,.4)*(.8+.3*Math.sin(t*5+i));if(s>0)spark(150+r()*780,300+r()*160,s,[P.n,P.m,P.a,P.mint,P.pink][i],t+i);}
  }
  X.restore();
}

function renderScenes(t){sTrash(t);sDisk(t);sTop(t);sDepends(t);}
