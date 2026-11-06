/* ===== "How does Instagram know what we like?" — scenes ===== */
const END=63.3;
const CAPRAW=`0.56|چطور@0.56 *اینستاگرام*@1.04 می‌فهمه@1.68
2.30|ما@2.30 به@2.46 چه@2.60 *محتوایی*@2.80 علاقه@3.28 داریم@3.84
4.18|حتی@4.18 وقتی@4.50 خودمون@4.92
5.30|چیزی@5.30 رو@5.54 *جست‌وجو@5.70 نکردیم؟*@6.16
6.86|در@6.86 واقع@7.38 اینستاگرام@7.64
8.12|*رفتار*@8.12 ما@8.50 رو@8.64 *تحلیل@8.80 می‌کنه*@9.26
9.64|و@9.64 از@9.72 روی@9.92 اون@10.08 *حدس@10.44 می‌زنه*@10.80
11.16|چه@11.16 محتوایی@11.36 برامون@11.82 *جذابه*@12.26
12.92|مثلاً@12.92 وقتی@13.64 یه@14.04 ویدیو@14.16 رو@14.36
14.54|*تا@14.54 آخر*@14.66 تماشا@14.86 می‌کنی،@15.30
15.86|*چند@15.86 بار*@16.10 می‌بینی،@16.34
16.82|*لایک*@16.82 می‌کنی،@17.14
17.70|*ذخیره*@17.70 می‌کنی@18.12
18.92|یا@18.92 برای@19.04 کسی@19.24 *می‌فرستی*@19.52
20.14|هر@20.14 کدوم@20.48 از@20.80 این@20.96 رفتارها@21.10
21.66|برای@21.66 *الگوریتمِ@21.92 اینستاگرام*@22.62
23.56|یک@23.56 *سیگنال*@23.74 محسوب@24.26 می‌شه@24.84
25.16|حتی@25.16 اینکه@25.80 روی@26.10 چه@26.20 پست‌هایی@26.42
26.84|*مکث*@26.84 می‌کنی،@27.20
27.68|چه@27.68 *پیج‌هایی*@27.80 رو@28.20 دنبال@28.32 می‌کنی@28.72
29.14|و@29.14 با@29.24 چه@29.40 *موضوعاتی*@29.52 تعامل@30.12 داریم@30.60
30.96|توی@30.96 این@31.52 تحلیل@31.72 *تأثیرگذاره*@32.12
33.06|اینستاگرام@33.06 این@33.92 اطلاعات@34.10 رو@34.50
34.62|با@34.62 رفتار@34.72 *کاربرای@35.12 مشابه*@35.70
36.30|*مقایسه@36.30 می‌کنه*@36.80
37.30|و@37.30 با@37.72 استفاده@38.02 از@38.52
38.64|سیستم‌های@38.64 *هوش@39.22 مصنوعی*@39.46
40.06|*پیش‌بینی@40.06 می‌کنه*@40.50
40.94|احتمالاً@40.94 از@41.56 دیدن@41.70 چه@42.04 محتواهایی@42.34
42.90|*بیشتر@42.90 لذت*@43.30 می‌بری@43.78
44.20|بعد@44.20 محتواهای@44.68 مختلف@45.34 رو@45.86
46.08|*رتبه‌بندی*@46.08 می‌کنه@46.72
47.22|و@47.22 اون‌هایی@47.56 رو@48.22 که@48.40
48.60|*احتمال@48.60 تعامل@49.26 بیشتری*@49.68
50.16|باهاشون@50.16 داری@50.66
50.96|*بالاتر*@50.96 نشون@51.76 می‌ده@52.14
52.40|نکته‌ی@52.40 جالب@53.08 اینه@53.46 که@53.60
53.76|الگوریتم@53.76 *لازم@54.26 نیست*@54.68
54.84|دقیقاً@54.84 بدونه@55.28 تو@55.80 *به@56.24 چی@56.40 فکر@56.60 می‌کنی*@56.92
57.28|فقط@57.28 کافیه@57.60 *رفتار@58.06 تو*@58.48 رو@58.58 تحلیل@58.76 کنه@59.14
59.46|تا@59.46 *علایقت*@59.90 رو@60.34
60.58|با@60.58 *احتمال@60.72 زیادی*@61.14 پیش‌بینی@61.62 کنه@62.16
62.90|END`;
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
CH.length=0;CH.push([0,'۱','از کجا می‌دونه؟'],[12.92,'۲','سیگنال‌ها'],[33.06,'۳','کاربرای مشابه'],[44.2,'۴','رتبه‌بندی'],[52.4,'۵','فکر یا رفتار؟'],[END,'','']);

/* ---------- icons ---------- */
function bowl(x,y,s){withT(x,y,{s},()=>{X.lineWidth=7;X.strokeStyle=P.ink;X.lineCap='round';
  for(let k=-1;k<=1;k++){X.beginPath();X.moveTo(k*30,-40);X.quadraticCurveTo(k*30+14,-58,k*30,-76);X.stroke();}
  X.fillStyle=P.m;X.beginPath();X.moveTo(-80,-20);X.lineTo(80,-20);X.arc(0,-20,80,0,Math.PI);X.closePath();X.fill();X.stroke();
  X.fillStyle=P.n;rr(-60,-32,120,16,8);X.fill();X.stroke();});}
function ball(x,y,s){withT(x,y,{s},()=>{X.fillStyle=P.white;X.beginPath();X.arc(0,0,70,0,7);X.fill();X.lineWidth=7;X.strokeStyle=P.ink;X.stroke();
  X.fillStyle=P.ink;X.beginPath();for(let k=0;k<5;k++){const a=-Math.PI/2+k*2*Math.PI/5;X.lineTo(Math.cos(a)*24,Math.sin(a)*24);}X.closePath();X.fill();
  for(let k=0;k<5;k++){const a=-Math.PI/2+k*2*Math.PI/5;X.beginPath();X.moveTo(Math.cos(a)*24,Math.sin(a)*24);X.lineTo(Math.cos(a)*70,Math.sin(a)*70);X.stroke();}});}
const TOP={travel:{n:'سفر',bg:'#FFE3C7'},cat:{n:'گربه',bg:'#FFE0EC'},food:{n:'آشپزی',bg:'#FFF1C2'},ball:{n:'فوتبال',bg:'#D9F3EA'}};
function topicArt(k,w){
  X.save();rr(-w/2,-w/2,w,w,w*.09);X.clip();
  if(k==='travel')X.drawImage(IMG.day,-w/2,-w/2,w,w);
  else{X.fillStyle=TOP[k].bg;X.fillRect(-w/2,-w/2,w,w);
    if(k==='cat')catFace(0,w*.06,w/480);else if(k==='food')bowl(0,w*.12,w/260);else ball(0,0,w/220);}
  X.restore();X.lineWidth=Math.max(3,w/40);X.strokeStyle=P.ink;rr(-w/2,-w/2,w,w,w*.09);X.stroke();
}
function bookmark(x,y,s,fill){withT(x,y,{s},()=>{X.beginPath();X.moveTo(-22,-30);X.lineTo(22,-30);X.lineTo(22,30);X.lineTo(0,14);X.lineTo(-22,30);X.closePath();X.fillStyle=fill||P.white;X.fill();X.lineWidth=6;X.lineJoin='round';X.strokeStyle=P.ink;X.stroke();});}
function plane(x,y,s,fill){withT(x,y,{s},()=>{X.beginPath();X.moveTo(-32,-4);X.lineTo(34,-28);X.lineTo(12,32);X.lineTo(2,8);X.closePath();X.fillStyle=fill||P.white;X.fill();X.lineWidth=6;X.lineJoin='round';X.strokeStyle=P.ink;X.stroke();X.beginPath();X.moveTo(2,8);X.lineTo(34,-28);X.stroke();});}
function heartI(x,y,s,fill){withT(x,y,{s},()=>{X.beginPath();X.moveTo(0,26);X.bezierCurveTo(-60,-12,-30,-58,0,-24);X.bezierCurveTo(30,-58,60,-12,0,26);X.fillStyle=fill||P.white;X.fill();X.lineWidth=6;X.lineJoin='round';X.strokeStyle=P.ink;X.stroke();});}
function bubbleI(x,y,s){withT(x,y,{s},()=>{X.beginPath();X.arc(0,-2,28,0,7);X.fillStyle=P.white;X.fill();X.lineWidth=6;X.strokeStyle=P.ink;X.stroke();X.beginPath();X.moveTo(-18,18);X.lineTo(-26,32);X.lineTo(-6,24);X.stroke();});}
function replayI(x,y,s,rot){withT(x,y,{s,r:rot},()=>{X.lineWidth=10;X.lineCap='round';X.strokeStyle=P.ink;X.beginPath();X.arc(0,0,34,.3,Math.PI*1.75);X.stroke();
  X.fillStyle=P.ink;X.beginPath();const a=Math.PI*1.75,px=Math.cos(a)*34,py=Math.sin(a)*34;X.moveTo(px+14,py-4);X.lineTo(px-6,py-18);X.lineTo(px-4,py+12);X.closePath();X.fill();});}
function stopwatch(x,y,s,frac){withT(x,y,{s},()=>{card(-14,-74,28,22,{fill:P.ink,r:6,sh:0,lw:0});X.fillStyle=P.white;X.beginPath();X.arc(0,0,58,0,7);X.fill();X.lineWidth=8;X.strokeStyle=P.ink;X.stroke();
  X.fillStyle=P.m;X.beginPath();X.moveTo(0,0);X.arc(0,0,46,-Math.PI/2,-Math.PI/2+frac*Math.PI*2);X.closePath();X.fill();
  X.lineCap='round';X.lineWidth=7;X.beginPath();X.moveTo(0,0);const a=-Math.PI/2+frac*Math.PI*2;X.lineTo(Math.cos(a)*44,Math.sin(a)*44);X.stroke();});}
function avatar(x,y,r,col,o={}){withT(x,y,{s:o.s??1,a:o.a??1},()=>{
  X.fillStyle=P.ink;X.beginPath();X.arc(r*.06,r*.06,r,0,7);X.fill();
  X.fillStyle=col;X.beginPath();X.arc(0,0,r,0,7);X.fill();
  X.save();X.beginPath();X.arc(0,0,r,0,7);X.clip();X.fillStyle=P.white;X.beginPath();X.arc(0,-r*.18,r*.36,0,7);X.fill();X.beginPath();X.ellipse(0,r*.75,r*.62,r*.5,0,0,7);X.fill();X.restore();
  X.lineWidth=Math.max(4,r*.09);X.strokeStyle=P.ink;X.beginPath();X.arc(0,0,r,0,7);X.stroke();
  if(o.label)chip(o.label,0,r+30,Math.max(26,r*.36),{fill:o.lfill||P.white,sh:4,lw:4});
});}
function algoBox(x,y,s,label,glow=0){
  withT(x,y,{s},()=>{
    if(glow>0){X.save();X.globalAlpha*=glow;X.lineWidth=14;X.strokeStyle=P.mint;rr(-175,-110,350,220,50);X.stroke();X.restore();}
    card(-150,-85,300,170,{fill:P.ink,r:38,sh:12,shc:P.a});
    for(let k=0;k<3;k++){X.lineWidth=10;X.lineCap='round';const on=.5+.5*Math.sin(T*6-k*1.2);X.strokeStyle=on>.5?P.n:'rgba(244,236,221,.35)';X.beginPath();X.arc(0,40,30+k*26,-Math.PI*.78,-Math.PI*.22);X.stroke();}
    X.fillStyle=P.n;X.beginPath();X.arc(0,40,11,0,7);X.fill();
    withT(0,-85,{},()=>chip(label,0,0,32,{fill:P.n,sh:4,lw:4}));
  });
}
function miniPost(k,x,y,w,o={}){
  withT(x,y,{s:o.s??1,a:o.a??1,r:o.r||0},()=>{
    const h=w*1.32;card(-w/2,-h/2,w,h,{fill:P.white,r:w*.08,sh:w*.04,lw:Math.max(3,w/55)});
    const hy=-h/2+w*.1;X.fillStyle=TOP[k].bg;X.beginPath();X.arc(w/2-w*.12,hy,w*.06,0,7);X.fill();X.lineWidth=Math.max(2,w/80);X.strokeStyle=P.ink;X.stroke();
    X.fillStyle='rgba(30,27,46,.25)';rr(w/2-w*.62,hy-w*.025,w*.4,w*.05,w*.025);X.fill();
    withT(0,-h/2+w*.2+w*.42,{},()=>topicArt(k,w*.84));
    const ay=h/2-w*.1;
    heartI(w/2-w*.12,ay,w/520,o.liked?P.m:P.white);bubbleI(w/2-w*.27,ay,w/560);plane(w/2-w*.42,ay,w/560);bookmark(-w/2+w*.12,ay,w/560,o.saved?P.n:P.white);
  });
}
function phone(x,y,s,fn,o={}){
  withT(x,y,{s,a:o.a??1},()=>{
    card(-210,-410,420,820,{fill:P.ink,r:64,sh:16,lw:0,shc:o.shc||P.a});
    X.save();rr(-188,-388,376,776,46);X.clip();X.fillStyle=P.paper;X.fillRect(-188,-388,376,776);fn();X.restore();
    X.fillStyle=P.ink;rr(-60,-388,120,30,15);X.fill();
  });
}
const FEED=['travel','cat','food','ball','cat','travel','food','cat'];

/* ---------- 1: how does it know? ---------- */
function sKnow(t){
  const al=vis(t,0,7.1,.2,.3);if(al<=0)return;
  X.save();X.globalAlpha=al;
  const mv=eio(pr(t,6.86,7.35));
  phone(lerp(540,290,mv),lerp(800,760,mv),pop(t,.1,.5)*lerp(1,.72,mv),()=>{
    const off=(t*90)%420;
    for(let i=-1;i<4;i++)miniPost(FEED[(i+8+Math.floor(t*90/420))%8],0,-200+i*420-off+120,300);
    X.fillStyle=P.paper;X.fillRect(-188,-388,376,110);
    const hs=t>5.6&&t<6.9?1+.06*Math.sin(Math.PI*pr(t,5.65,6.0)):1;
    withT(0,-320,{s:hs},()=>{card(-150,-30,300,60,{fill:t>5.65?P.n:P.white,r:30,sh:0,lw:5});lensIcon(115,-2,13);txt('جست‌وجو',70,0,28,P.mute,'right','rtl');});
  });
  [[1.7,860,520,170,0],[2.0,200,640,110,1],[2.25,880,980,120,2]].forEach(([tt,x,y,sz,ph])=>{
    const p=pop(t,tt,.38)*(1-pr(t,6.6,6.9));if(p>0)withT(x,y,{s:p},()=>qmark(0,0,sz,t,ph,[P.m,P.a,P.n][ph]));
  });
  const cx=pop(t,6.0,.35)*(1-pr(t,6.7,6.95));
  if(cx>0)crossMark(760,440,44,cx);
  X.restore();
}

/* ---------- 2: analyzes behavior, guesses ---------- */
function sGuess(t){
  const al=vis(t,6.9,13.1,.3,.3);if(al<=0)return;
  X.save();X.globalAlpha=al;
  if(t>7.3)phone(290,760,.72,()=>{
    const off=(t*90)%420;
    for(let i=-1;i<4;i++)miniPost(FEED[(i+8+Math.floor(t*90/420))%8],0,-200+i*420-off+120,300);
  });
  const bp=pop(t,7.65,.45);
  if(bp>0)algoBox(780,900,bp*.9,'تحلیل رفتار',Math.max(0,Math.sin(Math.PI*pr(t,9.2,9.9))));
  // behaviour particles
  const icons=[(x,y,s)=>heartI(x,y,s,P.m),(x,y,s)=>bookmark(x,y,s,P.n),(x,y,s)=>plane(x,y,s,P.white),(x,y,s)=>stopwatch(x,y,s*.6,.6)];
  for(let k=0;k<10;k++){
    const t0=8.15+k*.17,u=pr(t,t0,t0+.75);if(u<=0||u>=1)continue;
    const x=lerp(420,720,eio(u)),y=lerp(700-k%3*80,880,eio(u))-Math.sin(u*Math.PI)*120;
    withT(x,y,{a:1-pr(u,.8,1)},()=>icons[k%4](0,0,.8));
  }
  // thought bubble
  const tp=pop(t,10.4,.45);
  if(tp>0)withT(780,520,{s:tp},()=>{
    X.fillStyle=P.ink;X.beginPath();X.ellipse(8,8,230,150,0,0,7);X.fill();
    X.fillStyle=P.white;X.beginPath();X.ellipse(0,0,230,150,0,0,7);X.fill();X.lineWidth=7;X.strokeStyle=P.ink;X.stroke();
    [[0,215,22],[-14,250,12]].forEach(([dx,dy,r])=>{X.fillStyle=P.white;X.beginPath();X.arc(dx,dy,r,0,7);X.fill();X.stroke();});
    const ks=['food','cat','travel'];
    ks.forEach((k,i)=>{
      const pick=k==='cat'?pr(t,12.2,12.5):0;
      const dimk=k!=='cat'?pr(t,12.2,12.5)*.6:0;
      withT(110-i*110,0,{s:pop(t,10.55+i*.12,.35)*(1+pick*.25),a:1-dimk},()=>topicArt(k,94));
    });
    if(t<12.2)withT(0,-112,{s:pop(t,10.9,.3)},()=>qmark(0,0,70,t,1,P.m));
    const hp=pop(t,12.26,.4);if(hp>0)heartI(0,-90,hp*1.3,P.m);
  });
  X.restore();
}

/* ---------- 3: signals ---------- */
function sSignals(t){
  const al=vis(t,12.95,25.35,.3,.3);if(al<=0)return;
  X.save();X.globalAlpha=al;
  const pp=pop(t,13.0,.5);
  const liked=t>16.85,saved=t>17.72;
  withT(540,640,{s:pp},()=>{
    const w=520,h=600;card(-w/2,-h/2,w,h,{fill:P.white,r:40,sh:14,lw:6});
    avatar(w/2-48,-h/2+46,24,P.mint);X.fillStyle='rgba(30,27,46,.25)';rr(w/2-260,-h/2+38,170,16,8);X.fill();
    withT(0,-28,{},()=>{
      topicArt('travel',470);
      const prog=pr(t,14.5,15.3)+(t>15.86?pr(t,15.9,16.6):0);
      const pg=prog>1?prog-1:prog;
      X.fillStyle='rgba(30,27,46,.35)';rr(-205,190,410,14,7);X.fill();
      X.fillStyle=P.m;rr(205-410*Math.min(1,pg),190,410*Math.min(1,pg),14,7);X.fill();
      if(t<14.5){withT(0,0,{s:pop(t,13.4,.35)},()=>{X.fillStyle='rgba(30,27,46,.75)';X.beginPath();X.arc(0,0,58,0,7);X.fill();X.fillStyle=P.white;X.beginPath();X.moveTo(-18,-28);X.lineTo(-18,28);X.lineTo(30,0);X.closePath();X.fill();});}
      const rp=pop(t,15.86,.3)*(1-pr(t,16.6,16.85));
      if(rp>0)withT(0,0,{s:rp},()=>{X.fillStyle='rgba(255,251,243,.9)';X.beginPath();X.arc(0,0,70,0,7);X.fill();replayI(0,0,1.2,t*5);});
      const hb=pr(t,16.82,17.5);
      if(hb>0&&hb<1)withT(0,0,{a:1-pr(hb,.5,1)},()=>heartI(0,0,lerp(1,3.6,eo(hb)),P.m));
    });
    const ay=h/2-46;
    heartI(w/2-50,ay,(1+.4*Math.sin(Math.PI*pr(t,16.82,17.1)))*.9,liked?P.m:P.white);
    bubbleI(w/2-130,ay,.85);
    const sf=pr(t,19.52,20.1);
    if(sf<1)withT(lerp(w/2-210,w/2-210-260,eio(sf)),lerp(ay,ay-360,eio(sf)),{a:1-sf},()=>plane(0,0,.9+sf*.4,t>19.5?P.a:P.white));
    if(sf>0)plane(w/2-210,ay,.9,P.white);
    bookmark(-w/2+50,ay,(1+.4*Math.sin(Math.PI*pr(t,17.7,17.98)))*.95,saved?P.n:P.white);
  });
  // signal chips
  const chips=[['تا آخر دیدی',15.3,P.mint],['۲ بار دیدی',16.2,P.a],['لایک',17.0,P.m],['ذخیره',17.9,P.n],['ارسال',19.75,P.pink]];
  const intoA=t>23.75;
  chips.forEach(([lab,tt,col],i)=>{
    const p=pop(t,tt,.38);if(p<=0)return;
    const row=i<3?0:1,idxR=i<3?i:i-3,n=row?2:3;
    const x0=540+((n-1)/2-idxR)*250,y0=1040+row*95;
    const u=eio(pr(t,23.8+i*.08,24.4+i*.08));
    const x=lerp(x0,540,u),y=lerp(y0,1120,u)-Math.sin(u*Math.PI)*90;
    if(u>=1)return;
    const pulse=t>20.2&&t<23.8?Math.sin((t-20.2)*6-i)*.5+.5:0;
    if(pulse>0){X.save();X.globalAlpha*=pulse*.6*(1-u);X.lineWidth=5;X.strokeStyle=col;rr(x-115-pulse*10,y-34-pulse*10,230+pulse*20,68+pulse*20,40);X.stroke();X.restore();}
    withT(x,y,{s:p*lerp(1,.3,u)},()=>chip(lab,0,0,36,{fill:col,color:col===P.a?P.white:P.ink}));
  });
  const ab=pop(t,21.9,.45);
  if(ab>0&&intoA)algoBox(540,1150,ab*.85,'الگوریتم',Math.max(0,Math.sin(Math.PI*pr(t,24.2,25.0))));
  const sg=pop(t,23.74,.4)*(1-pr(t,23.75,23.9));
  if(ab>0&&!intoA)withT(820,1240,{s:ab*.6},()=>algoBox(0,0,1,'الگوریتم',0));
  X.restore();
}

/* ---------- 4: dwell, follows, topics -> profile ---------- */
function sProfile(t){
  const al=vis(t,25.2,33.25,.3,.3);if(al<=0)return;
  X.save();X.globalAlpha=al;
  const cards=[[800,26.84,'مکث'],[540,27.8,'پیج‌ها'],[280,29.52,'موضوع‌ها']];
  cards.forEach(([x,tt,lab],i)=>{
    const p=pop(t,tt,.45);if(p<=0)return;
    withT(x,560,{s:p},()=>{
      card(-120,-160,240,320,{fill:P.white,r:34,sh:12});
      if(i===0){
        X.save();rr(-96,-136,192,200,18);X.clip();
        const sc=t<27.4?(t-26.84)*400:224+Math.min(0,0);
        for(let k=0;k<4;k++)withT(0,-36+k*224-Math.min(sc,224),{},()=>topicArt(FEED[k+2],180));
        X.restore();X.lineWidth=5;X.strokeStyle=P.ink;rr(-96,-136,192,200,18);X.stroke();
        withT(60,100,{},()=>stopwatch(0,0,.55,pr(t,27.4,30.4)*.75));
        txt(fa(Math.min(3,Math.floor(pr(t,27.4,30.4)*4)))+' ثانیه',-34,100,30,P.ink,'center','rtl');
      }else if(i===1){
        [[-50,-70,P.m,'travel'],[50,-70,P.a,'cat'],[0,25,P.n,'food']].forEach(([ax,ay,c],k)=>{avatar(ax,ay,40,c,{s:pop(t,tt+.1+k*.1,.3)});
          const ck=pop(t,28.4+k*.12,.3);if(ck>0)check(ax+30,ay+28,15,ck);});
      }else{
        [['سفر',.85,P.m],['گربه',.6,P.a],['آشپزی',.35,P.n]].forEach(([w,v,c],k)=>{
          const y=-95+k*72,g=eo(pr(t,29.8+k*.12,30.5+k*.12));
          txt(w,92,y,28,P.ink,'right','rtl');
          X.fillStyle='rgba(30,27,46,.08)';rr(-95,y+18,190,18,9);X.fill();
          X.fillStyle=c;rr(95-190*v*g,y+18,Math.max(18,190*v*g),18,9);X.fill();
        });
      }
      chip(lab,0,170,36,{fill:P.n});
    });
    const lp=pr(t,31.75+i*.1,32.3+i*.1);
    if(lp>0){X.save();X.setLineDash([4,18]);X.lineCap='round';X.lineWidth=10;X.strokeStyle=P.ink;X.beginPath();X.moveTo(x,790);X.lineTo(lerp(x,540,lp*.7),lerp(790,930,lp));X.stroke();X.restore();}
  });
  const pf=pop(t,32.1,.45);
  if(pf>0)withT(540,1080,{s:pf},()=>{
    card(-330,-120,660,240,{fill:P.ink,r:40,sh:14,shc:P.m});
    avatar(250,-10,60,P.m,{});
    txt('پروفایل علایق تو',160,-70,36,P.n,'right','rtl');
    [['سفر',.85,P.m],['گربه',.6,P.a],['آشپزی',.35,P.n],['فوتبال',.1,P.mint]].forEach(([w,v,c],k)=>{
      const y=-18+k*36,g=eo(pr(t,32.4+k*.1,33.0+k*.1));
      txt(w,160,y,24,P.paper,'right','rtl');
      X.fillStyle='rgba(244,236,221,.15)';rr(-290,y-9,350,18,9);X.fill();
      X.fillStyle=c;rr(60-350*v*g,y-9,Math.max(18,350*v*g),18,9);X.fill();
    });
  });
  X.restore();
}

/* ---------- 5: similar users + AI prediction ---------- */
const CANDS=[['food',.40],['cat',.78],['ball',.15],['travel',.92],['cat',.64]];
function sSimilar(t){
  const al=vis(t,33.1,44.45,.3,.3);if(al<=0)return;
  X.save();X.globalAlpha=al;
  const o1=1-pr(t,37.3,37.7);
  if(o1>0){
    X.save();X.globalAlpha*=o1;
    const others=[[-1,-.55,P.a,'۹۱٪'],[1,-.55,P.mint,'۸۷٪'],[-1,.55,P.n,'۸۴٪'],[1,.55,P.pink,'۷۹٪']];
    others.forEach(([dx,dy,c,pc],k)=>{
      const p=pop(t,35.15+k*.12,.4);if(p<=0)return;
      const x=540+dx*290,y=720+dy*360;
      const lp=pr(t,35.3+k*.12,35.8+k*.12),pul=Math.sin(Math.PI*pr(t,36.3+k*.08,36.9+k*.08));
      X.save();X.lineCap='round';X.lineWidth=8+pul*8;X.strokeStyle=pul>0?P.mint:P.ink;X.setLineDash([2,16]);X.beginPath();X.moveTo(540,720);X.lineTo(lerp(540,x,lp),lerp(720,y,lp));X.stroke();X.restore();
      avatar(x,y,72,c,{s:p});
      const ip=pop(t,36.35+k*.1,.35);
      if(ip>0)withT(x+(dx>0?-80:80),y-70,{s:ip*.5},()=>topicArt(k%2?'cat':'travel',110));
      const cp=pop(t,36.6+k*.1,.35);if(cp>0)withT((540+x)/2,(720+y)/2,{s:cp},()=>chip(pc,0,0,32,{fill:P.white}));
    });
    avatar(540,720,110,P.m,{s:pop(t,33.15,.45),label:'تو',lfill:P.n});
    const ip=pop(t,34.1,.35);
    if(ip>0)['travel','cat'].forEach((k,i)=>withT(540+(i?-100:100),560,{s:ip*.55},()=>topicArt(k,120)));
    X.restore();
  }
  if(t>37.3){
    algoBox(540,470,pop(t,37.75,.45),'هوش مصنوعی',Math.max(0,Math.sin(Math.PI*pr(t,40.06,40.8))));
    CANDS.forEach(([k,v],i)=>{
      const x=540+(2-i)*190,p=pop(t,38.7+i*.08,.4);if(p<=0)return;
      const sh=v>.7?Math.sin(Math.PI*pr(t,42.9,43.5))*.12:0;
      miniPost(k,x,860,170,{s:p*(1+sh)});
      const bp=pop(t,40.95+i*.18,.35);
      if(bp>0)withT(x,1030,{s:bp},()=>chip(fa(Math.round(v*100))+'٪',0,0,36,{fill:v>.7?P.mint:v>.5?P.n:P.white,dir:'ltr'}));
      const lp=pr(t,40.1+i*.06,40.6+i*.06);
      if(lp>0&&lp<1){X.save();X.globalAlpha*=1-lp;X.fillStyle=P.n;X.beginPath();X.arc(lerp(540,x,lp),lerp(560,750,lp),12,0,7);X.fill();X.restore();}
    });
  }
  X.restore();
}

/* ---------- 6: ranking ---------- */
function sRank(t){
  const al=vis(t,44.2,52.65,.3,.3);if(al<=0)return;
  X.save();X.globalAlpha=al;
  const sorted=CANDS.map((c,i)=>i).sort((a,b)=>CANDS[b][1]-CANDS[a][1]);
  const rankOf={};sorted.forEach((ci,r)=>rankOf[ci]=r);
  const sp=eio(pr(t,46.1,46.95));
  phone(540,780,pop(t,44.25,.5),()=>{
    txt('فید تو',150,-330,34,P.ink,'right','rtl');
    CANDS.forEach(([k,v],i)=>{
      const y=lerp(-240+i*136,-240+rankOf[i]*136,sp);
      const top=rankOf[i]<2&&t>48.6;
      const gl=top?.5+.5*Math.sin(t*6):0;
      withT(0,y,{},()=>{
        card(-170,-58,340,116,{fill:top?'#E6F7F0':P.white,r:22,sh:5,lw:4});
        if(gl>0){X.save();X.globalAlpha*=gl;X.lineWidth=6;X.strokeStyle=P.mint;rr(-176,-64,352,128,26);X.stroke();X.restore();}
        withT(110,0,{},()=>topicArt(k,88));
        X.fillStyle='rgba(30,27,46,.08)';rr(-150,-10,190,20,10);X.fill();
        X.fillStyle=v>.7?P.mint:v>.5?P.n:P.m;rr(40-190*v,-10,190*v,20,10);X.fill();
        txt(fa(Math.round(v*100))+'٪',-100,-38,24,P.ink,'center','ltr');
        if(sp>.5){X.save();X.globalAlpha*=pr(sp,.5,1);X.fillStyle=P.ink;X.beginPath();X.arc(-140,30,16,0,7);X.fill();txt(fa(rankOf[i]+1),-140,28,20,P.n);X.restore();}
      });
    });
  },{shc:P.m});
  const rk=pop(t,46.1,.4);
  if(rk>0)withT(850,500,{s:rk,r:.08},()=>chip('رتبه‌بندی',0,0,40,{fill:P.n}));
  const up=pop(t,50.96,.45);
  if(up>0)withT(190,520,{s:up},()=>{
    card(-90,-120,180,240,{fill:P.mint,r:40,sh:10});
    X.fillStyle=P.ink;X.beginPath();X.moveTo(0,-80);X.lineTo(50,-20);X.lineTo(18,-20);X.lineTo(18,60);X.lineTo(-18,60);X.lineTo(-18,-20);X.lineTo(-50,-20);X.closePath();X.fill();
    txt('بالاتر',0,92,30,P.ink);
  });
  X.restore();
}

/* ---------- 7: behaviour, not thoughts ---------- */
function sBehave(t){
  const al=vis(t,52.4,END+1,.3,.3);if(al<=0)return;
  X.save();X.globalAlpha=al;
  const o1=1-pr(t,57.1,57.45);
  if(o1>0){
    X.save();X.globalAlpha*=o1;
    withT(360,780,{s:pop(t,52.5,.45)},()=>{
      X.fillStyle=P.ink;X.beginPath();X.moveTo(-120,260);X.lineTo(-120,120);X.bezierCurveTo(-200,40,-170,-170,0,-170);X.bezierCurveTo(130,-170,160,-60,150,10);X.lineTo(190,90);X.lineTo(145,100);X.lineTo(140,170);X.lineTo(60,170);X.lineTo(60,260);X.closePath();X.fill();
      X.fillStyle=P.a;X.beginPath();X.arc(10,-40,58,0,7);X.fill();
      X.lineWidth=6;X.strokeStyle=P.white;X.beginPath();X.arc(10,-40,58,0,7);X.stroke();
      for(let k=0;k<3;k++){X.beginPath();X.arc(10,-40,20+k*14,t*2+k,t*2+k+2);X.stroke();}
    });
    const bp=pop(t,54.3,.45);
    if(bp>0)withT(760,520,{s:bp},()=>{
      X.fillStyle=P.ink;X.beginPath();X.ellipse(8,8,200,140,0,0,7);X.fill();
      X.fillStyle=P.white;X.beginPath();X.ellipse(0,0,200,140,0,0,7);X.fill();X.lineWidth=7;X.strokeStyle=P.ink;X.stroke();
      [[-150,170,22],[-200,215,13]].forEach(([dx,dy,r])=>{X.fillStyle=P.white;X.beginPath();X.arc(dx,dy,r,0,7);X.fill();X.stroke();});
      txt('فکرهای تو',0,-50,40,P.mute);
      qmark(0,40,110,t,0,P.a);
    });
    const cx=pop(t,54.7,.4);if(cx>0)crossMark(930,420,50,cx);
    X.restore();
  }
  if(t>57.2){
    const icons=[(s)=>heartI(0,0,s,P.m),(s)=>bookmark(0,0,s,P.n),(s)=>plane(0,0,s,P.a),(s)=>stopwatch(0,0,s*.6,.6),(s)=>replayI(0,0,s*.8,t*3)];
    icons.forEach((f,i)=>{
      const x=540+(2-i)*170,p=pop(t,57.35+i*.08,.35);if(p<=0)return;
      const u=eio(pr(t,58.2+i*.07,58.9+i*.07));
      withT(lerp(x,540,u),lerp(400,640,u),{s:p*lerp(1,.4,u),a:1-pr(u,.85,1)},()=>{card(-62,-62,124,124,{fill:P.white,r:30,sh:8});f(1.15);});
    });
    algoBox(540,680,pop(t,57.9,.45)*.9,'الگوریتم',Math.max(0,Math.sin(Math.PI*pr(t,58.8,59.6))));
    [['سفر',800],['گربه',540],['آشپزی',280]].forEach(([w,x],i)=>{
      const p=pop(t,59.95+i*.12,.38);if(p>0)withT(x,910,{s:p,r:(i-1)*.05},()=>chip(w,0,0,44,{fill:[P.m,P.a,P.n][i],color:i===1?P.white:P.ink}));
    });
    const gp=pop(t,60.6,.45);
    if(gp>0)withT(540,1215,{s:gp},()=>{
      card(-230,-150,460,215,{fill:P.white,r:36,sh:12});
      const segs=[[P.m,0,.33],[P.n,.33,.66],[P.mint,.66,1]];
      segs.forEach(([c,a,b])=>{X.lineWidth=34;X.strokeStyle=c;X.beginPath();X.arc(0,40,150,Math.PI+a*Math.PI,Math.PI+b*Math.PI);X.stroke();});
      X.lineWidth=5;X.strokeStyle=P.ink;X.beginPath();X.arc(0,40,167,Math.PI,0);X.stroke();X.beginPath();X.arc(0,40,133,Math.PI,0);X.stroke();
      const v=lerp(.05,.92,eb(pr(t,60.75,61.7)));const a=Math.PI+v*Math.PI;
      X.lineWidth=12;X.lineCap='round';X.strokeStyle=P.ink;X.beginPath();X.moveTo(0,40);X.lineTo(Math.cos(a)*120,40+Math.sin(a)*120);X.stroke();
      X.fillStyle=P.ink;X.beginPath();X.arc(0,40,18,0,7);X.fill();
      txt(fa(Math.round(v*100))+'٪',0,-30,52,P.ink,'center','ltr');
    });
  }
  X.restore();
}

function renderScenes(t){T=t;sKnow(t);sGuess(t);sSignals(t);sProfile(t);sSimilar(t);sRank(t);sBehave(t);}
