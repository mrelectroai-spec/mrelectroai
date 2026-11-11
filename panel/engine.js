// مختبر التابلو: محرّك المحاكاة (v2)
// - الشبكات بالـunion-find (كل شي موصول بلا مقاومة = نفس الفولت)
// - كذا مصدر (شبكة 3 فاز، دولة، موتير، إنفرتر)، وكل مصدر فيك تقطعو
// - القصر وربط مصدرين ببعض، وفصل أصغر قاطع بيحلّ المشكلة
// - التيار بكل شريط: شجرة من المصدر لكل حمل (للكابلات والقواطع والأوفرلود والديفرنسيال)
'use strict';
(function(){
const {P,motorI,CAP}=window.PARTS;
const LIVE=['L1','L2','L3','L'];
const PIDX={L1:0,L2:1,L3:2};

function E(board){
 const B=board;
 const key=(c,t)=>c+'.'+t;
 const comp=id=>B.comps.find(c=>c.id===id);
 const isSrc=c=>c.type==='src'||c.type==='src1';
 function srcTerms(c){return c.type==='src'?['L1','L2','L3','N','PE']:['L','N','PE'];}
 function build(){
  const par={};
  const find=k=>{if(par[k]===undefined)return k;let r=k;while(par[r]!==r)r=par[r];while(par[k]!==r){const n=par[k];par[k]=r;k=n;}return r;};
  const uni=(a,b)=>{a=find(a);b=find(b);if(a!==b)par[a]=b;};
  for(const c of B.comps)for(const t of P[c.type].terms){const k=key(c.id,t.n);if(par[k]===undefined)par[k]=k;}
  for(const w of B.wires){if(par[w.a]===undefined||par[w.b]===undefined)continue;uni(w.a,w.b);}
  for(const c of B.comps)for(const [a,b] of P[c.type].links(c))uni(key(c.id,a),key(c.id,b));
  const pot={};
  if(B.on&&!B.blown)for(const c of B.comps)if(isSrc(c)&&!c.st.off)for(const n of srcTerms(c)){const r=find(key(c.id,n));(pot[r]=pot[r]||[]).push({s:c.id,p:n});}
  return {find,pot};
 }
 const lives=arr=>(arr||[]).filter(x=>LIVE.includes(x.p));
 const hasRet=arr=>(arr||[]).some(x=>x.p==='N'||x.p==='PE');
 function shorts(N){const out=[];for(const r in N.pot){const a=N.pot[r];const lv=lives(a);const ids=new Set(lv.map(x=>x.s+'|'+x.p));
  if(ids.size>1||(ids.size>=1&&hasRet(a)))out.push({r,cross:new Set(lv.map(x=>x.s)).size>1});}return out;}
 const potOf=(N,k)=>N.pot[N.find(k)]||[];
 function liveOf(N,k){return lives(potOf(N,k))[0]||null;}
 function volt(N,a,b){const la=liveOf(N,a),lb=liveOf(N,b);
  if(la&&lb){if(la.s===lb.s&&la.p===lb.p)return 0;return 400;}
  if((la&&hasRet(potOf(N,b)))||(lb&&hasRet(potOf(N,a))))return 230;
  return 0;}
 const breakers=()=>B.comps.filter(c=>(c.type==='mcb1'||c.type==='mcb3'||c.type==='rcd')&&c.st.on&&!c.st.trip);

 function solve(ev){
  let N,guard=0;
  for(;;){
   N=build();
   const sh=shorts(N);
   if(sh.length){
    const cands=breakers().sort((a,b)=>a.rating-b.rating);let fixed=false;
    for(const c of cands){c.st.trip=true;const n2=shorts(build()).length;if(n2<sh.length){fixed=true;ev&&ev.push({k:'trip',c,why:sh.some(x=>x.cross)?'cross':'short'});break;}c.st.trip=false;}
    if(!fixed){B.blown=true;ev&&ev.push({k:'blown',cross:sh.some(x=>x.cross)});}
    if(++guard>12)break;continue;}
   // سباق الكويلات: الريليه أسرع من الكونتاكتور، والفصل بيصير سوا، بس السحب واحد واحد
   let ch=false;const want=[];
   for(const c of B.comps){const d=P[c.type];if(!d.coil)continue;
    const v=c.st.burnt?0:volt(N,key(c.id,d.coil[0]),key(c.id,d.coil[1]));
    if(v===400&&!c.st.burnt){c.st.burnt=true;ev&&ev.push({k:'burn',c});}
    const e=v===230&&!c.st.burnt;
    if(c.type==='tmr'){if(c.st.e!==e){c.st.e=e;if(!e){c.st.t=0;if(c.st.done){c.st.done=false;ch=true;}}}continue;}
    if(!!c.st.e!==e)want.push([c,e]);}
   const drop=want.filter(x=>!x[1]),relayUp=want.filter(x=>x[1]&&x[0].type==='relay'),kcUp=want.filter(x=>x[1]&&x[0].type!=='relay');
   if(drop.length){for(const [c] of drop)c.st.e=false;ch=true;}
   else if(relayUp.length){for(const [c] of relayUp)c.st.e=true;ch=true;}
   else if(kcUp.length){kcUp[0][0].st.e=true;ch=true;}
   if(!ch)break;
   if(++guard>80){ev&&ev.push({k:'chatter'});break;}
  }
  // الأحمال
  for(const c of B.comps){const d=P[c.type];
   if(d.load){const v=volt(N,key(c.id,d.load[0]),key(c.id,d.load[1]));if(v===400&&!c.st.burnt){c.st.burnt=true;ev&&ev.push({k:'burn',c});}
    c.st.on=v===230&&!c.st.burnt;c.st.I=c.st.on?(c.type==='load'?c.watt/230:(d.W||10)/230):0;}
   if(c.type==='socket'){c.st.v=volt(N,key(c.id,'L'),key(c.id,'N'))===230;}
   if(c.type==='motor'){const ph=['U1','V1','W1'].map(t=>liveOf(N,key(c.id,t)));
    const ids=new Set(ph.filter(Boolean).map(x=>x.s+'|'+x.p));
    if(ids.size===3&&ph.every(x=>x.s===ph[0].s&&PIDX[x.p]!=null)){c.st.m='run';const o=ph.map(x=>PIDX[x.p]);c.st.dir=((o[1]-o[0]+3)%3===1)?1:-1;c.st.I=motorI(c.kw);}
    else if(ids.size>=2){c.st.m='hum';c.st.I=motorI(c.kw)*1.75;}else{c.st.m='off';c.st.I=0;}}
   if(c.type==='motor6'){const g=t=>liveOf(N,key(c.id,t));const L1=['U1','V1','W1'].map(g),L2=['U2','V2','W2'].map(g);
    const I=motorI(c.kw);c.st.I=0;c.st.m='off';
    const three=a=>a.every(Boolean)&&new Set(a.map(x=>x.s+'|'+x.p)).size===3&&a.every(x=>x.s===a[0].s&&PIDX[x.p]!=null);
    const starPt=!L2.some(Boolean)&&N.find(key(c.id,'U2'))===N.find(key(c.id,'V2'))&&N.find(key(c.id,'V2'))===N.find(key(c.id,'W2'));
    const delta=three(L1)&&L2.every(Boolean)&&[0,1,2].every(i=>!(L1[i].s===L2[i].s&&L1[i].p===L2[i].p));
    if(three(L1)&&starPt){c.st.m='star';c.st.I=I*0.58;}
    else if(delta){c.st.m='delta';c.st.I=I;}
    else if(L1.filter(Boolean).length+L2.filter(Boolean).length>=2&&!(three(L1)&&!L2.some(Boolean))){c.st.m='hum';c.st.I=I*1.5;}
    if(three(L1)){const o=L1.map(x=>PIDX[x.p]);c.st.dir=((o[1]-o[0]+3)%3===1)?1:-1;}}
  }
  B._N=N;return N;}

 // التيار: شجرة من كل طرف مصدر، وكل حمل بيسحب تيارو من الشجرة
 function currents(N){
  const adj={};const addE=(a,b,id)=>{(adj[a]=adj[a]||[]).push([b,id]);(adj[b]=adj[b]||[]).push([a,id]);};
  for(const w of B.wires)addE(w.a,w.b,'w:'+w.id);
  for(const c of B.comps)for(const [a,b] of P[c.type].links(c))addE(key(c.id,a),key(c.id,b),'c:'+c.id+':'+a);
  const EI={},EL={};const trees={};
  function tree(root){if(trees[root])return trees[root];const par={[root]:null},q=[root];
   while(q.length){const n=q.shift();for(const [m,id] of adj[n]||[])if(!(m in par)){par[m]=[n,id];q.push(m);}}return trees[root]=par;}
  const roots={};// net → source terminal key
  for(const c of B.comps)if(isSrc(c)&&!c.st.off&&B.on&&!B.blown)for(const n of srcTerms(c))roots[N.find(key(c.id,n))]=key(c.id,n);
  function draw(node,I,lid){if(!I)return;const r=roots[N.find(node)];if(!r)return;const t=tree(r);let n=node;let g=0;
   while(t[n]&&g++<500){const [p,id]=t[n];EI[id]=(EI[id]||0)+I;if(lid)(EL[id]=EL[id]||new Set()).add(lid);n=p;}}
  for(const c of B.comps){const d=P[c.type];
   if(d.load&&c.st.on){draw(key(c.id,d.load[0]),c.st.I,c.id);draw(key(c.id,c.st.leak&&c.type==='load'?'PE':d.load[1]),c.st.I,c.id);}
   if(c.type==='motor'&&c.st.I)for(const t of ['U1','V1','W1'])draw(key(c.id,t),c.st.I,c.id);
   if(c.type==='motor6'&&c.st.I){if(c.st.m==='delta'){for(const t of ['U1','V1','W1','U2','V2','W2'])draw(key(c.id,t),c.st.I*0.58,c.id);}else for(const t of ['U1','V1','W1'])draw(key(c.id,t),c.st.I,c.id);}
  }
  B._tr={tree,roots,N,EL};
  for(const w of B.wires)w.I=EI['w:'+w.id]||0;
  for(const c of B.comps){let m=0;const per={};for(const [a] of P[c.type].links(c)){const v=EI['c:'+c.id+':'+a]||0;per[a]=v;m=Math.max(m,v);}c.st.Ilinks=per;c.st.Imax=m;}
 }

 function tick(dt,ev){
  let N=solve(ev);let again=false;
  for(const c of B.comps)if(c.type==='tmr'&&c.st.e&&!c.st.done){c.st.t=(c.st.t||0)+dt;if(c.st.t>=c.sec){c.st.done=true;again=true;}}
  if(again)N=solve(ev);
  currents(N);
  let re=false;
  for(const c of B.comps){
   if(c.type==='ol'){const I=c.st.Imax||0;c.st.I=I;const r=I/(c.setA||1);c.st.heat=c.st.heat||0;
    if(r>1.1)c.st.heat+=dt*(r-1)/2.5;else c.st.heat=Math.max(0,c.st.heat-dt*0.15);
    if(c.st.heat>=1&&!c.st.trip){c.st.trip=true;c.st.heat=1;ev&&ev.push({k:'oltrip',c,why:r>1.5?'phase':'set'});re=true;}}
   if((c.type==='mcb1'||c.type==='mcb3'||c.type==='rcd')&&c.st.on&&!c.st.trip){const I=c.st.Imax||0;c.st.I=I;const r=I/c.rating;c.st.heat=c.st.heat||0;
    if(r>1.13)c.st.heat+=dt*(r-1)/8;else c.st.heat=Math.max(0,c.st.heat-dt*0.1);
    if(c.st.heat>=1){c.st.trip=true;c.st.heat=0;ev&&ev.push({k:'trip',c,why:'over'});re=true;}
    if(c.type==='rcd'){const l=c.st.Ilinks||{};const diff=Math.abs((l['1']||0)-(l['N1']||0));if(diff>0.03){c.st.trip=true;ev&&ev.push({k:'rcd',c});re=true;}}}
  }
  if(re){N=solve(ev);currents(N);}
  for(const w of B.wires){const cap=CAP[w.mm2]||10;w.heat=w.heat||0;if(w.I>cap)w.heat=Math.min(1,w.heat+dt*(w.I/cap-1)/3);else w.heat=Math.max(0,w.heat-dt*.2);}
  return N;}
 function termInfo(k){const c=comp(k.split('.')[0]);if(!c)return null;return P[c.type].terms.find(t=>t.n===k.split('.')[1]);}
 function isPower(w){const a=termInfo(w.a),b=termInfo(w.b);return !!(a&&b&&a.pw&&b.pw);}
 function live(k){const N=B._N;if(!N)return null;const a=N.pot[N.find(k)];if(!a)return null;const l=lives(a)[0];if(l)return l.p==='L'?'L1':l.p;return a.some(x=>x.p==='N')?'N':a.some(x=>x.p==='PE')?'PE':null;}
 function liveSrc(k){const N=B._N;if(!N)return null;return liveOf(N,k);}
 // مسار الطرف لحد المصدر (أسماء الحواف)
 function path(node){const T=B._tr;if(!T)return [];const r=T.roots[T.N.find(node)];if(!r)return [];const t=T.tree(r);const out=[];let n=node,g=0;while(t[n]&&g++<500){out.push(t[n][1]);n=t[n][0];}return out;}
 // أقرب حماية فوق الشريط (قاطع أو أوفرلود)
 function protector(w){const id='w:'+w.id;let p=path(w.a);if(p[0]!==id){p=path(w.b);if(p[0]!==id)return null;}
  let best=null;for(let i=1;i<p.length;i++){const m=/^c:([^:]+):/.exec(p[i]);if(!m)continue;const c=comp(m[1]);if(!c)continue;if(c.type==='mcb1'||c.type==='mcb3'){best={c,A:c.rating};break;}if(c.type==='ol'){best={c,A:c.setA};break;}}
  // الأوفرلود بيحمي كل كابلات نفس الموتور، وين ما كان محطوط على السلسلة
  const T=B._tr;const L=T&&T.EL&&T.EL[id];
  if(L&&L.size)for(const o of B.comps){if(o.type!=='ol'||o.st.trip)continue;const ol=new Set();for(const [a] of P[o.type].links(o)){const s2=T.EL['c:'+o.id+':'+a];if(s2)for(const x of s2)ol.add(x);}
   if([...L].every(x=>ol.has(x))&&(!best||o.setA<best.A))best={c:o,A:o.setA};}
  return best;}
 return {solve,tick,path,protector,live,liveSrc,volt:(a,b)=>volt(B._N||build(),a,b),isPower,termInfo,key};
}
window.PENGINE=E;
})();
