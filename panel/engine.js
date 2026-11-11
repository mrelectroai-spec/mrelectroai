// مختبر التابلو: محرّك المحاكاة
// الشبكات (union-find)، القصر وفصل القواطع، الكويلات والتايمرات، الموتور، الأوفرلود، وسخونة الكابلات.
'use strict';
(function(){
const {P,motorI,CAP}=window.PARTS;
const PH=['L1','L2','L3'];

function E(board){ // board = {comps:[], wires:[], on:bool}
 const B=board;
 const key=(c,t)=>c+'.'+t;
 function build(){
  const par={};
  const find=k=>{if(par[k]===undefined)return k;let r=k;while(par[r]!==r)r=par[r];while(par[k]!==r){const n=par[k];par[k]=r;k=n;}return r;};
  const uni=(a,b)=>{a=find(a);b=find(b);if(a!==b)par[a]=b;};
  for(const c of B.comps)for(const t of P[c.type].terms){const k=key(c.id,t.n);if(par[k]===undefined)par[k]=k;}
  for(const w of B.wires){if(par[w.a]===undefined||par[w.b]===undefined)continue;uni(w.a,w.b);}
  for(const c of B.comps)for(const [a,b] of P[c.type].links(c))uni(key(c.id,a),key(c.id,b));
  const pot={};
  if(B.on&&!B.blown)for(const c of B.comps)if(c.type==='src')for(const n of ['L1','L2','L3','N','PE']){const r=find(key(c.id,n));(pot[r]=pot[r]||new Set()).add(n);}
  return {find,pot};
 }
 function shorts(N){const out=[];for(const r in N.pot){const s=N.pot[r];const ph=PH.filter(p=>s.has(p)).length;if(ph>1||(ph>=1&&(s.has('N')||s.has('PE'))))out.push(r);}return out;}
 function potOf(N,k){return N.pot[N.find(k)]||new Set();}
 function volt(N,a,b){const pa=potOf(N,a),pb=potOf(N,b);
  const fa=PH.find(p=>pa.has(p)),fb=PH.find(p=>pb.has(p));
  if(fa&&fb)return fa===fb?0:400;
  if((fa&&(pb.has('N')||pb.has('PE')))||(fb&&(pa.has('N')||pa.has('PE'))))return 230;
  return 0;}
 // يحلّ لحد ما توقف الكونتاكتورات عن التغيير، ويفصل القواطع إذا في قصر
 function solve(ev){
  let N,guard=0;
  for(;;){
   N=build();
   // القصر: منفصل أصغر قاطع بيحلّ المشكلة
   let sh=shorts(N);
   if(sh.length){
    const cands=B.comps.filter(c=>(c.type==='mcb1'||c.type==='mcb3')&&c.st.on&&!c.st.trip).sort((a,b)=>a.rating-b.rating);
    let fixed=false;
    for(const c of cands){c.st.trip=true;const n2=shorts(build()).length;if(n2<sh.length){fixed=true;ev&&ev.push({k:'trip',c,why:'short'});break;}c.st.trip=false;}
    if(!fixed){B.blown=true;ev&&ev.push({k:'blown'});}
    if(++guard>12)break;continue;}
   let ch=false;
   for(const c of B.comps){const d=P[c.type];if(!d.coil)continue;
    const v=c.st.burnt?0:volt(N,key(c.id,d.coil[0]),key(c.id,d.coil[1]));
    if(v===400&&!c.st.burnt){c.st.burnt=true;ev&&ev.push({k:'burn',c});}
    const e=v===230&&!c.st.burnt;
    if(c.type==='kc'&&c.st.e!==e){c.st.e=e;ch=true;}
    if(c.type==='tmr'){if(c.st.e!==e){c.st.e=e;if(!e){c.st.t=0;if(c.st.done){c.st.done=false;ch=true;}}}}
   }
   if(!ch)break;
   if(++guard>40){ev&&ev.push({k:'chatter'});break;}
  }
  // الأحمال
  for(const c of B.comps){
   if(c.type==='lamp'){const v=volt(N,key(c.id,'X1'),key(c.id,'X2'));if(v===400&&!c.st.burnt){c.st.burnt=true;ev&&ev.push({k:'burn',c});}c.st.on=v===230&&!c.st.burnt;}
   if(c.type==='motor'){const ph=['U1','V1','W1'].map(t=>PH.find(p=>potOf(N,key(c.id,t)).has(p))||null);
    const set=new Set(ph.filter(Boolean));
    if(set.size===3){c.st.m='run';const ord=ph.map(p=>PH.indexOf(p));const par=((ord[1]-ord[0]+3)%3===1);c.st.dir=par?1:-1;c.st.I=motorI(c.kw);}
    else if(set.size===2){c.st.m='hum';c.st.I=motorI(c.kw)*1.75;}
    else{c.st.m='off';c.st.I=0;}
    c.st.pe=potOf(N,key(c.id,'PE')).has('PE');}
  }
  B._N=N;return N;}
 // الوقت: التايمرات، الأوفرلود، القواطع، الكابلات
 function tick(dt,ev){
  let N=solve(ev);let again=false;
  for(const c of B.comps)if(c.type==='tmr'&&c.st.e&&!c.st.done){c.st.t=(c.st.t||0)+dt;if(c.st.t>=c.sec){c.st.done=true;again=true;}}
  if(again)N=solve(ev);
  const motors=B.comps.filter(c=>c.type==='motor'&&c.st.I>0);
  // مين حامل تيار الموتور: الأوفرلود والقاطع 3P اللي أطرافن بنفس شبكات الموتور
  for(const c of B.comps){
   if(c.type!=='ol'&&c.type!=='mcb3'){continue;}
   let I=0;const outs=c.type==='ol'?['2','4','6']:['2','4','6'];
   for(const m of motors){const mt=['U1','V1','W1'].map(t=>N.find(key(m.id,t)));if(outs.some(o=>mt.includes(N.find(key(c.id,o)))))I+=m.st.I;}
   c.st.I=I;
   if(c.type==='ol'){
    const r=I/(c.setA||1);c.st.heat=c.st.heat||0;
    if(r>1.1){c.st.heat+=dt*(r-1)/2.5;}else c.st.heat=Math.max(0,c.st.heat-dt*0.15);
    if(c.st.heat>=1&&!c.st.trip){c.st.trip=true;c.st.heat=1;ev&&ev.push({k:'oltrip',c,why:r>1.6?'phase':'set'});N=solve(ev);}
   }else{
    const r=I/c.rating;c.st.heat=c.st.heat||0;
    if(r>1.13)c.st.heat+=dt*(r-1)/12;else c.st.heat=Math.max(0,c.st.heat-dt*0.1);
    if(c.st.heat>=1&&!c.st.trip&&c.st.on){c.st.trip=true;c.st.heat=0;ev&&ev.push({k:'trip',c,why:'over'});N=solve(ev);}
   }
  }
  // الكابلات: شريط باور (طرفينو باور) بيحمل تيار الموتور إذا شبكتو من شبكات الموتور
  const mnets=new Map();for(const m of B.comps)if(m.type==='motor'&&m.st.I>0)for(const t of ['U1','V1','W1'])mnets.set(N.find(key(m.id,t)),m.st.I);
  for(const w of B.wires){w.I=0;if(!isPower(w))continue;const r=N.find(w.a);if(mnets.has(r))w.I=mnets.get(r);
   const cap=CAP[w.mm2]||10;w.heat=w.heat||0;
   if(w.I>cap)w.heat=Math.min(1,w.heat+dt*(w.I/cap-1)/3);else w.heat=Math.max(0,w.heat-dt*.2);}
  return N;}
 function termInfo(k){const c=B.comps.find(x=>x.id===k.split('.')[0]);if(!c)return null;return P[c.type].terms.find(t=>t.n===k.split('.')[1]);}
 function isPower(w){const a=termInfo(w.a),b=termInfo(w.b);return !!(a&&b&&a.pw&&b.pw);}
 function live(k){const N=B._N;if(!N)return null;const s=N.pot[N.find(k)];if(!s)return null;return PH.find(p=>s.has(p))||(s.has('N')?'N':s.has('PE')?'PE':null);}
 return {solve,tick,live,volt:(a,b)=>volt(B._N||build(),a,b),isPower,termInfo,key};
}
window.PENGINE=E;
})();
