// مشروع التوصيل: الطالب بيمدّ الشرايط، بيحرّك القطع ومشي الشرايط، وبيشغّل المنظومة
'use strict';
(function(){
const BW=1100,BH=900;
const C={};
function add(id,o){C[id]=Object.assign({id},o);}
const PI=()=>(typeof PROJ!=='undefined'&&PROJ)?CAT.inv(PROJ.inv):CAT.inv('deye5');
const PB=()=>(typeof PROJ!=='undefined'&&PROJ)?CAT.bat(PROJ.bat):CAT.bat('deyeg5');
const PN=()=>(typeof PROJ!=='undefined'&&PROJ&&PROJ.n)||1;
const posKey=()=>'simPos:'+PI().id+':'+PB().id+':'+PN();
const KCOL={'+':'#d32f2f','-':'#1b1b1b','L':'#8a4b14','N':'#1f6fd1','PE':'#2e9d3a','CAN':'#8a96a0'};
const KNAME={'+':'موجب DC','-':'سالب DC','L':'فاز','N':'نوترال','PE':'أرض','CAN':'كابل اتصال'};

/* ---------- القطع ---------- */
// ترتيب أطراف الإنفرتر من تحت، متل الجهاز الحقيقي
function invLayout(I){
 const pv=[['pv1p',I.nMppt<2?'PV+':'PV1+','+','mc4'],['pv1n',I.nMppt<2?'PV−':'PV1−','-','mc4']];
 if(I.nMppt>1)pv.push(['pv2p','PV2+','+','mc4'],['pv2n','PV2−','-','mc4']);
 const bat=[['batp','BAT+','+','bat'],['batn','BAT−','-','bat']],bms=[['bms','BMS','CAN','rj']];
 const off=I.type==='offgrid';
 const ac=a=>{const nm=a==='g'?(off?'AC IN':'GRID'):(off?'AC OUT':'LOAD');return [[a+'l',nm+' L','L','ac'],[a+'n',nm+' N','N','ac']];};
 const pe=[['pe','PE','PE','pe']];
 if(I.lay==='og03')return [['par','PARALLEL',null,'dec'],...pv,...bms,['func','FUNCTION',null,'dec'],...bat,['pwr','ON/OFF',null,'btn'],...ac('g'),['gen','GEN',null,'dec'],...ac('l'),...pe];
 if(I.lay==='sg')return [['idc','DC SW',null,'dsw'],...pv,...bat,...bms,['meter','METER',null,'dec'],['par','PARALLEL',null,'dec'],...ac('g'),...ac('l'),['gen','GEN',null,'dec'],...pe];
 return [...pv,...bat,...bms,...ac('g'),...ac('l'),...pe];}
const SLOTW={mc4:24,bat:34,rj:30,ac:26,pe:28,dec:30,btn:44,dsw:52};
function build(){for(const k in C)delete C[k];const I=PI(),B=PB(),n=PN();
 for(let i=0;i<6;i++)add('p'+i,{type:'panel',x:20+i*92,y:24,w:80,h:116,name:'لوح '+(i+1),t:{'+':{rx:22,ry:146,k:'+',d:1,l:'+'},'-':{rx:58,ry:146,k:'-',d:1,l:'−'}}});
 {const t={};const cols=[['1p','+','PV1+'],['1n','-','PV1−'],['2p','+','PV2+'],['2n','-','PV2−']];
  cols.forEach((c,i)=>{const cx=32+i*48;t['i'+c[0]]={rx:cx,ry:0,k:c[1],d:-1,l:c[2]};t['o'+c[0]]={rx:cx,ry:128,k:c[1],d:1,l:c[2]};});
  add('iso',{type:'iso',x:40,y:252,w:210,h:128,t,pairs:cols.map(c=>['i'+c[0],'o'+c[0]]),name:'عازل DC'});}
 {const w=380,h=440,L=invLayout(I);const tot=L.reduce((a,s)=>a+SLOTW[s[3]],0);const sc=(w-24)/tot;let cx=12;const t={},dec=[];
  L.forEach(s=>{const sw=SLOTW[s[3]]*sc,mid=cx+sw/2;cx+=sw;if(s[2])t[s[0]]={rx:mid,ry:h+8,k:s[2],d:1,l:s[1],kind:s[3]};else dec.push({id:s[0],rx:mid,l:s[1],kind:s[3],w:sw});});
  add('inv',{type:'inv',x:390,y:186,w,h,t,dec,name:'الإنفرتر'});}
 {const look=B.look||'box';const stack=look==='rack'||look==='box';const mh=look==='rack'?(n>2?58:72):(n>2?70:96);
  const w=stack?280:190,h=stack?mh*n+16:250;const bt={};
  const tx=stack?[150,196,246]:[52,92,148];const ty=stack?8+mh*0.5:h-24;
  bt['+']={rx:tx[0],ry:ty,k:'+',d:stack?-1:1,l:'+'};bt['-']={rx:tx[1],ry:ty,k:'-',d:stack?-1:1,l:'−'};
  if(B.comm.length)bt.can={rx:tx[2],ry:ty,k:'CAN',d:stack?-1:1,l:B.comm.includes('CAN')?'CAN':B.comm[0]};
  add('bat',{type:'bat',look,x:20,y:stack?Math.round(650-mh*(n-1)*0.6):590,w,h,mh,t:bt,name:'البطارية'});}
 const bk=(id,x,y,rating,name,k1,k2,l1,l2)=>{const kk=k=>k==='p'?'+':(k==='n'?'-':k);add(id,{type:'brk',x,y,w:96,h:136,name,rating,t:{['i'+k1]:{rx:28,ry:0,k:kk(k1),d:-1,l:l1},['i'+k2]:{rx:68,ry:0,k:kk(k2),d:-1,l:l2},['o'+k1]:{rx:28,ry:136,k:kk(k1),d:1,l:l1},['o'+k2]:{rx:68,ry:136,k:kk(k2),d:1,l:l2}},pairs:[['i'+k1,'o'+k1],['i'+k2,'o'+k2]]});};
 bk('bbr',318,690,CAT.brkBat(I),'قاطع البطارية','p','n','+','−');
 add('sup',{type:'sup',x:950,y:22,w:130,h:150,name:'عدّاد الدولة',t:{L:{rx:30,ry:150,k:'L',d:1,l:'L'},N:{rx:65,ry:150,k:'N',d:1,l:'N'},PE:{rx:100,ry:150,k:'PE',d:1,l:'PE'}}});
 bk('gbr',968,236,CAT.brkAC(I),'قاطع الدولة','L','N','L','N');
 bk('lbr',820,700,CAT.brkAC(I),'قاطع البيت','L','N','L','N');
 add('house',{type:'house',x:950,y:560,w:140,h:240,name:'تابلو البيت',t:{L:{rx:32,ry:240,k:'L',d:1,l:'L'},N:{rx:70,ry:240,k:'N',d:1,l:'N'},PE:{rx:108,ry:240,k:'PE',d:1,l:'PE'}}});
 {const t={};for(let i=0;i<5;i++)t['e'+i]={rx:30+i*60,ry:0,k:'PE',d:-1,l:'PE'};add('eb',{type:'eb',x:420,y:846,w:300,h:24,t,name:'بار الأرض'});}
 try{const P=JSON.parse(ls.get(posKey())||'null');if(P)for(const id in P)if(C[id]){C[id].x=P[id][0];C[id].y=P[id][1];}}catch(e){}
}
build();
function savePos(){const P={};for(const id in C)P[id]=[C[id].x,C[id].y];ls.set(posKey(),JSON.stringify(P));}
const keyOf=(c,t)=>c+'.'+t;
function term(k){const [c,t]=k.split('.');const o=C[c],T=o.t[t];return {x:o.x+T.rx,y:o.y+T.ry,k:T.k,d:T.d,l:T.l};}
const hasT=k=>{const [c,t]=k.split('.');return !!(C[c]&&C[c].t[t]);};

/* ---------- الحالة ---------- */
function freshSw(){const s={bsw:0,bbr:0,iso:0,inv:0,gbr:0,lbr:0};if(PI().dcsw)s.idc=0;return s;}
let st={wires:[],sw:freshSw(),dmg:0};
try{const v=JSON.parse(ls.get('simWire')||'null');if(v&&v.wires){st=Object.assign(st,v);st.sw=Object.assign(freshSw(),v.sw||{});}}catch(e){}
st.wires=st.wires.filter(w=>hasT(w.a)&&hasT(w.b));st.wires.forEach(w=>{if(!w.pts)w.pts=[];});
let hist=[];let sel=null,selW=-1,zoom=0,moveMode=false;
const snapH=()=>JSON.stringify(st.wires);
function saveW(){ls.set('simWire',JSON.stringify(st));}

/* ---------- الشبكة الكهربائية ---------- */
function nets(sw){const par={};const f=x=>{if(par[x]===undefined)return x;while(par[x]!==x){par[x]=par[par[x]];x=par[x];}return x;};const u=(a,b)=>{a=f(a);b=f(b);if(a!==b)par[a]=b;};
 for(const c in C)for(const t in C[c].t)par[keyOf(c,t)]=keyOf(c,t);
 for(const w of st.wires)if(par[w.a]&&par[w.b])u(w.a,w.b);
 for(const c in C)if(C[c].pairs&&sw[c])for(const p of C[c].pairs)u(keyOf(c,p[0]),keyOf(c,p[1]));
 for(let i=1;i<5;i++)u('eb.e0','eb.e'+i);
 const groups={};for(const k in par){const r=f(k);(groups[r]=groups[r]||[]).push(k);}
 return {f,groups};}
function walk(N,startK,endK){const s=N.f(startK),e=N.f(endK);if(s===e)return{short:true,n:0};
 let cur=s,n=0,used={},par=false;
 for(let g=0;g<8;g++){const ps=[];for(let i=0;i<6;i++){if(!used[i]&&N.f('p'+i+'.+')===cur)ps.push(i);}
  if(!ps.length)break;if(ps.length>1)par=true;const i=ps[0];used[i]=1;n++;cur=N.f('p'+i+'.-');if(cur===e)return{ok:true,n,par,used};}
 return{ok:false,n,par,used};}
function strInfo(N,k){const a='inv.pv'+k+'p',b='inv.pv'+k+'n';
 const fw=walk(N,a,b);if(fw.short)return{short:true,used:{}};if(fw.ok)return{n:fw.n,par:fw.par,used:fw.used};
 const rv=walk(N,b,a);if(rv.ok)return{rev:true,n:rv.n,used:rv.used};
 const touched=fw.n>0||rv.n>0;return{open:touched,none:!touched,n:0,used:Object.assign({},fw.used||{},rv.used||{})};}
function analyze(sw){const N=nets(sw),f=N.f;const r={N};
 r.pv=[strInfo(N,1),C.inv.t.pv2p?strInfo(N,2):{none:true,n:0,used:{}}];
 const Bp=f('bat.+'),Bn=f('bat.-');r.batShort=Bp===Bn;
 const ip=f('inv.batp'),inn=f('inv.batn');
 r.batt=(ip===Bp&&inn===Bn)?'ok':((ip===Bn&&inn===Bp)?'rev':((ip===Bp||inn===Bn||ip===Bn||inn===Bp)?'half':'none'));
 r.comm=!!C.bat.t.can&&f('inv.bms')===f('bat.can');
 const SL=f('sup.L'),SN=f('sup.N');r.acShort=SL===SN;
 const gl=f('inv.gl'),gn=f('inv.gn'),ll=f('inv.ll'),ln=f('inv.ln');
 r.grid=(gl===SL&&gn===SN)?'ok':((gl===SN&&gn===SL)?'swap':((gl===SL||gn===SN||gl===SN||gn===SL)?'half':'none'));
 r.gridToLoad=(ll===SL||ln===SN||ll===SN||ln===SL);
 const HL=f('house.L'),HN=f('house.N');
 r.house=(HL===ll&&HN===ln)?'inv':((HL===ln&&HN===ll)?'invswap':((HL===SL||HN===SN||HL===gl)?'grid':((HL===ll||HN===ln)?'half':'none')));
 r.loadShort=ll===ln;
 r.invPE=f('inv.pe')===f('eb.e0');r.housePE=f('house.PE')===f('eb.e0');r.supPE=f('sup.PE')===f('eb.e0');
 r.mix=[];for(const g in N.groups){const ks=N.groups[g].map(k=>term(k).k);const set=new Set(ks);
  const dc=set.has('+')||set.has('-'),ac=set.has('L')||set.has('N');
  if(dc&&ac)r.mix.push('dcac');if(set.has('CAN')&&(dc||ac||set.has('PE')))r.mix.push('can');if(set.has('PE')&&(dc||ac))r.mix.push('pe');
  if(set.has('L')&&set.has('N'))r.mix.push('ln');}
 return r;}
const pvV=(n)=>({voc:n*49.6*(1+0.0027*25),vmp:n*41.9*(1-0.0027*40)});
const VMAX=()=>PI().maxVoc,VMIN=()=>PI().mppt[0];
const allOn=()=>{const a={};for(const k in st.sw)a[k]=1;return a;};
const without=id=>{const a=allOn();a[id]=0;return a;};

/* ---------- الحالة للمحاكي ---------- */
function compute(){const op=analyze(st.sw),de=analyze(allOn());const I=PI();
 const pvOn=!I.dcsw||!!st.sw.idc;
 const strings=op.pv.map(p=>(pvOn&&p.n&&!p.rev&&!p.short&&!p.open&&!p.none)?p.n:0);
 const batt=!!st.sw.bsw&&op.batt==='ok'&&!op.batShort;
 const grid=(op.grid==='ok'||op.grid==='swap')&&!op.acShort;
 const powered=!!st.sw.inv&&!st.dmg&&(batt||grid);
 let load='none';if((op.house==='inv'||op.house==='invswap')&&!op.loadShort)load='inv';else if(op.N.f('house.L')===op.N.f('sup.L')&&op.N.f('house.N')===op.N.f('sup.N'))load='grid';
 window.WS={free:false,powered,strings,batt,comm:op.comm&&batt,grid,load,dmg:st.dmg};
 return {op,de};}

/* ---------- الحماية: بعد كل تغيير (شريط أو قاطع) ---------- */
let fuseSaid=false;
function hazards(say){let op=analyze(st.sw);const outN=PI().type==='offgrid'?'AC OUT':'LOAD';
 if(st.sw.bsw&&op.batShort){st.sw.bsw=0;say('e','💥 Short عالبطارية! الموجب والسالب لازقين. حماية الـBMS فصلت البطارية فوراً. بلا BMS، الكابل بيحترق.');op=analyze(st.sw);}
 if(st.sw.bsw&&op.batt==='rev'&&!st.dmg){st.dmg=1;say('e','💥 قطبية البطارية معكوسة عالإنفرتر! BAT+ عالسالب. انضرب الإنفرتر أو الفيوز الداخلي. صلّح وكبس «جهاز جديد».');}
 if(op.mix.includes('dcac')&&(st.sw.bsw||op.grid!=='none')&&!st.dmg){st.dmg=1;say('e','💥 خلطت DC مع AC: في شريط واصل البطارية أو الألواح على طرف AC. الإنفرتر انضرب.');}
 if(op.acShort){
  if(st.sw.gbr&&!analyze(without('gbr')).acShort){st.sw.gbr=0;say('e','💥 Short بين الفاز والنوترال! قاطع الدولة فصل.');fuseSaid=false;}
  else if(!fuseSaid){fuseSaid=true;say('e','💥 Short بين فاز ونوترال الدولة وما في قاطع بالنص! فيوز العدّاد ضرب والدولة مقطوعة لحد ما تشيل الـShort.');}}
 else fuseSaid=false;
 op=analyze(st.sw);
 if(op.gridToLoad&&st.sw.inv&&!st.dmg&&!op.acShort){st.dmg=1;say('e',`💥 الدولة واصلة على مخرج ${outN}، والإنفرتر عم يطلّع كهربا عليه. التقى مصدرين: الإنفرتر انضرب.`);}
 compute();
 if(op.loadShort&&WS.powered){
  if(st.sw.lbr&&!analyze(without('lbr')).loadShort){st.sw.lbr=0;say('e','💥 Short عالمخرج! قاطع البيت فصل.');}
  else{st.sw.inv=0;say('e','💥 Short عمخرج الإنفرتر وما في قاطع. حماية الإنفرتر طفّته. شيل الـShort وشغّل من جديد.');}}
}

/* ---------- الأحداث ---------- */
function onSwitch(id){st.sw[id]=st.sw[id]?0:1;const on=st.sw[id];
 const say=(cls,t)=>{ev(cls,t,'',0);flash(t,cls);};
 const before=st.dmg;hazards(say);
 if(on&&!st.sw[id]){saveW();render();if(typeof draw==='function')draw();return;}
 let {op}=compute();
 if(on&&!(st.dmg&&!before)){
  if(id==='bsw')say(op.batt==='ok'?'o':'w',op.batt==='ok'?`شغّلت البطارية (${PB().sw}): `+(op.comm?'مع كابل اتصال BMS.':(C.bat.t.can?'بلا كابل اتصال.':'هالبطارية ما فيها اتصال، الإنفرتر لازم يشتغل عالفولت.'))+(analyze(without('bbr')).batt==='ok'?' ⚠ بلا قاطع DC بالنص.':''):`شغّلت البطارية (${PB().sw})، بس مش واصلة صح عالـBAT+ والـBAT−.`);
  if(id==='bbr')say('o','رفعت قاطع البطارية.');
  if(id==='gbr')say(op.grid==='swap'?'w':'o',op.grid==='swap'?'الدولة واصلة بس الفاز والنوترال مقلوبين: بيشتغل، بس خطر عالفني وعلى الـRCD.':(op.gridToLoad?'⚠ الدولة واصلة على مخرج البيت! إذا شغّلت الإنفرتر رح ينضرب.':'رفعت قاطع الدولة.'));
  if(id==='inv'){if(st.dmg)say('e','الإنفرتر مضروب. صلّح التوصيل وكبس «جهاز جديد».');else if(!WS.powered)say('w','كبست ON بس الإنفرتر ما قلع: بدّو بطارية شغّالة أو دولة. الشمس لحالها ما بتقلّعو.');else{say('o','الإنفرتر قلع ✓');UI.pg='main';UI.tab=0;UI.draft=null;}}
  if(id==='iso'||id==='idc'){if(id==='idc')say('o','فتحت الـDC SW تبع الإنفرتر.');op.pv.forEach((p,k)=>{const nm='PV'+(k+1);
   if(p.short)say('e',`⚠ ${nm}: الموجب والسالب لازقين. الألواح بـShort والـMC4 ممكن تعمل قوس.`);
   else if(p.rev)say('e',`⚠ ${nm}: قطبية الألواح معكوسة! صلّح قبل ما ترفع العازل.`);
   else if(p.n){const v=pvV(p.n);say(v.voc>VMAX()?'e':'o',`${nm}: ${p.n} ألواح عالتسلسل. Voc بالبرد تقريباً ${v.voc.toFixed(0)}V`+(v.voc>VMAX()?` — فوق ${VMAX()}V، خطر عالإنفرتر!`:(v.vmp<VMIN()?`، وVmp بالحرّ ${v.vmp.toFixed(0)}V تحت مجال الـMPPT.`:' ✓')));}
   else if(p.open)say('w',`${nm}: الـString مش مسكّر. في لوح أو شريط ناقص.`);});}
  if(id==='lbr')say(op.house==='inv'?'o':'w',op.house==='inv'?'البيت واصل على مخرج الإنفرتر ✓':(op.house==='invswap'?'البيت واصل، بس الفاز والنوترال مقلوبين.':'رفعت قاطع البيت، بس البيت مش واصل على مخرج الإنفرتر.'));}
 if(!on)ev('o',({bsw:'طفيت البطارية.',bbr:'نزّلت قاطع البطارية.',iso:'فتحت عازل الـDC.',idc:'سكّرت الـDC SW.',inv:'طفيت الإنفرتر.',gbr:'نزّلت قاطع الدولة.',lbr:'نزّلت قاطع البيت.'})[id],'',0);
 saveW();render();if(typeof draw==='function')draw();}
function afterWireChange(){const say=(cls,t)=>{ev(cls,t,'',0);flash(t,cls);};hazards(say);saveW();compute();render();if(typeof draw==='function')draw();}
let flashT;function flash(t,cls){const m=document.getElementById('wmsg');m.className='wmsg '+(cls||'');m.textContent=t;m.hidden=false;clearTimeout(flashT);flashT=setTimeout(()=>{m.hidden=true;},7000);}

/* ---------- مسار الشرايط ---------- */
const P2=(x,y)=>x.toFixed(1)+' '+y.toFixed(1);
function wPts(w){const A=term(w.a),B=term(w.b),s=24;return [[A.x,A.y],[A.x,A.y+A.d*s],...w.pts,[B.x,B.y+B.d*s],[B.x,B.y]];}
function wirePath(w){const A=term(w.a),B=term(w.b);
 if(!w.pts.length){const s=Math.min(110,Math.max(40,Math.abs(A.y-B.y)*0.5+30));return `M${P2(A.x,A.y)} C${P2(A.x,A.y+A.d*s)} ${P2(B.x,B.y+B.d*s)} ${P2(B.x,B.y)}`;}
 const p=wPts(w);let d=`M${P2(p[0][0],p[0][1])}`;
 for(let i=1;i<p.length-1;i++){const a=p[i-1],b=p[i],c=p[i+1];const l1=Math.hypot(b[0]-a[0],b[1]-a[1]),l2=Math.hypot(c[0]-b[0],c[1]-b[1]);const r=Math.min(16,l1/2,l2/2);
  if(r<1){d+=` L${P2(b[0],b[1])}`;continue;}
  const s1=[b[0]+(a[0]-b[0])*r/l1,b[1]+(a[1]-b[1])*r/l1],s2=[b[0]+(c[0]-b[0])*r/l2,b[1]+(c[1]-b[1])*r/l2];d+=` L${P2(s1[0],s1[1])} Q${P2(b[0],b[1])} ${P2(s2[0],s2[1])}`;}
 const z=p[p.length-1];return d+` L${P2(z[0],z[1])}`;}
function midCubic(w){const A=term(w.a),B=term(w.b);const s=Math.min(110,Math.max(40,Math.abs(A.y-B.y)*0.5+30));
 const p0=[A.x,A.y],p1=[A.x,A.y+A.d*s],p2=[B.x,B.y+B.d*s],p3=[B.x,B.y];return [0,1].map(i=>0.125*p0[i]+0.375*p1[i]+0.375*p2[i]+0.125*p3[i]);}

/* ---------- الرسم ---------- */
const R_=()=>(typeof R!=='undefined'&&R)||{};
function invBody(c){const I=PI(),{x,y,w,h}=c;const on=window.WS&&WS.powered,dm=st.dmg,r=R_();let g='';
 const fault=r.faults&&r.faults.size?[...r.faults][0]:'';
 const scr=dm?'#3a1a1a':(on?'#e9f6ff':'#0d1419');
 const scrTxt=(cy)=>on?`<text x="${x+w/2}" y="${cy}" class="bt" fill="${fault&&fault!=='F35'?'#d9822b':'#1f9d55'}" style="font-size:11px">${fault||'Normal'}</text><text x="${x+w/2}" y="${cy+15}" class="bt" fill="#33414a" style="font-size:10px">${Math.round(r.load||0)}W</text>`:(dm?`<text x="${x+w/2}" y="${cy+6}" class="bt" fill="#ff6a6a" style="font-size:10px">DAMAGED</text>`:'');
 const led=i=>i===0?(on&&r.pv>5):i===1?(on&&r.gridPresent):i===2?on:(dm||(on&&fault&&fault!=='F35'));
 if(I.brand==='Deye'){
  // جسم Deye متل الصورة: أبيض فوق، رمادي تحت بقوس، شاشة صغيرة بالنص، ودنات تثبيت
  for(const yy of [y+50,y+h-150])g+=`<rect x="${x-10}" y="${yy}" width="12" height="26" rx="3" fill="#c9cfd3"/><rect x="${x+w-2}" y="${yy}" width="12" height="26" rx="3" fill="#c9cfd3"/><circle cx="${x-4}" cy="${yy+13}" r="3" fill="#fff"/><circle cx="${x+w+4}" cy="${yy+13}" r="3" fill="#fff"/>`;
  g+=`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="26" fill="#f7f8f8" stroke="#c4cacd" stroke-width="2.5"/>
  <path d="M${x+2} ${y+h*0.6}Q${x+w/2} ${y+h*0.68} ${x+w-2} ${y+h*0.6}V${y+h-26}Q${x+w-2} ${y+h-2} ${x+w-26} ${y+h-2}H${x+26}Q${x+2} ${y+h-2} ${x+2} ${y+h-26}Z" fill="#d7dcdf"/>
  <path d="M${x+2} ${y+h*0.6}Q${x+w/2} ${y+h*0.68} ${x+w-2} ${y+h*0.6}" stroke="#b9c0c4" stroke-width="2" fill="none"/>
  <rect x="${x+w/2-56}" y="${y+56}" width="112" height="128" rx="12" fill="#e3e7ea" stroke="#c9cfd3"/>
  <rect x="${x+w/2-42}" y="${y+70}" width="84" height="58" rx="4" fill="${scr}" stroke="#2a3238" stroke-width="3"/>${scrTxt(y+96)}
  ${[0,1,2,3].map(i=>`<circle cx="${x+w/2-27+i*18}" cy="${y+148}" r="4.5" fill="${led(i)?(i===3?'#ff3b3b':'#25d366'):'#aab3b8'}"/><text x="${x+w/2-27+i*18}" y="${y+166}" class="bt" fill="#6c7a82" style="font-size:7px">${['DC','AC','NOR','ALM'][i]}</text>`).join('')}
  <text x="${x+w/2}" y="${y+214}" class="bt" fill="#1f5fae" style="font-size:22px;font-style:italic;font-weight:800">Deye</text>
  <text x="${x+w/2}" y="${y+234}" class="bt" fill="#7a8890" style="font-size:10px">${I.model}</text>`;}
 else{const th={Felicity:['#2f3438','#e07b1f','#3d4348','#c7d0d5'],Growatt:['#f4f6f7','#2fa84f','#2b3136','#5c6b74'],Voltronic:['#f2f4f5','#1f6fd1','#1d2226','#5c6b74']}[I.brand]||['#f4f6f7','#25b36e','#2b3136','#5c6b74'];
  g+=`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="16" fill="${th[0]}" stroke="#9aa6ad" stroke-width="2.5"/><rect x="${x+20}" y="${y+44}" width="${w-40}" height="200" rx="12" fill="${th[2]}"/>
  <rect x="${x+w/2-60}" y="${y+64}" width="120" height="74" rx="6" fill="${scr}" stroke="#11171b" stroke-width="3"/>${scrTxt(y+98)}
  ${I.brand==='Voltronic'?`<circle cx="${x+w/2}" cy="${y+196}" r="22" fill="none" stroke="${on?'#4fd1ff':'#59646b'}" stroke-width="5"/>`:''}
  <text x="${x+w/2}" y="${y+32}" class="bt" fill="${th[1]}" style="font-size:16px;font-weight:800;letter-spacing:.06em">${I.brand.toUpperCase()}</text>
  <text x="${x+w/2}" y="${y+266}" class="bt" fill="${th[3]}" style="font-size:10.5px">${I.model}</text>
  ${[0,2,3].map((i,j)=>`<circle cx="${x+w/2-20+j*20}" cy="${y+158}" r="5" fill="${led(i)?(i===3?'#ff3b3b':'#25d366'):'#59646b'}"/>`).join('')}`;}
 // البورد: الأطراف من تحت
 const dark=I.brand==='Felicity';const by=y+h-70;g+=`<rect x="${x+8}" y="${by}" width="${w-16}" height="62" rx="10" fill="${dark?'#262a2e':'#c6cdd1'}" opacity=".9"/>`;
 for(const k in c.t){const T=c.t[k],tx=x+T.rx;
  if(T.kind==='mc4')g+=`<rect x="${tx-6}" y="${by+20}" width="12" height="40" rx="5" fill="#1d1f21"/><rect x="${tx-4}" y="${by+52}" width="8" height="8" fill="${T.k==='+'?'#c62828':'#111'}"/>`;
  else if(T.kind==='bat')g+=`<circle cx="${tx}" cy="${by+42}" r="13" fill="${T.k==='+'?'#c62828':'#202326'}"/><circle cx="${tx}" cy="${by+42}" r="5" fill="#d9a441"/>`;
  else if(T.kind==='rj')g+=`<rect x="${tx-10}" y="${by+32}" width="20" height="18" rx="2" fill="#2a3238"/><rect x="${tx-6}" y="${by+36}" width="12" height="9" fill="#d9a441"/>`;
  else g+=`<circle cx="${tx}" cy="${by+44}" r="9" fill="#8e989e"/><circle cx="${tx}" cy="${by+44}" r="4" fill="#5d676d"/>`;
  g+=`<text transform="translate(${tx+4} ${by-4}) rotate(-90)" class="tl" fill="${dark?'#e6ecef':'#33414a'}">${T.l}</text>`;}
 for(const D of c.dec){const tx=x+D.rx;
  if(D.kind==='btn'){const s=st.sw.inv;g+=`<g class="sw" data-sw="inv"><circle cx="${tx}" cy="${by+36}" r="17" fill="#2b3a44"/><circle cx="${tx}" cy="${by+36}" r="11" fill="${s?'#25b36e':'#e5533c'}"/><path d="M${tx} ${by+29}v7M${tx-5} ${by+32}a7 7 0 1 0 10 0" stroke="#fff" stroke-width="2" fill="none"/></g><text transform="translate(${tx+4} ${by-4}) rotate(-90)" class="tl" fill="#33414a">ON/OFF · ${s?'ON':'OFF'}</text>`;}
  else if(D.kind==='dsw'){const s=st.sw.idc;g+=`<g class="sw" data-sw="idc" transform="rotate(${s?0:-90} ${tx} ${by+34})"><circle cx="${tx}" cy="${by+34}" r="20" fill="#ffd21f" stroke="#c9a400"/><rect x="${tx-5}" y="${by+15}" width="10" height="38" rx="4" fill="#d62b2b"/></g><text transform="translate(${tx+4} ${by-4}) rotate(-90)" class="tl" fill="#33414a">DC SW · ${s?'ON':'OFF'}</text>`;}
  else g+=`<rect x="${tx-Math.min(10,D.w/2-2)}" y="${by+30}" width="${Math.min(20,D.w-4)}" height="22" rx="4" fill="#9aa4aa"/><text transform="translate(${tx+4} ${by-4}) rotate(-90)" class="tl" fill="#7d878d">${D.l}</text>`;}
 if(I.lay!=='og03'){const s=st.sw.inv;g+=`<g class="sw" data-sw="inv"><rect x="${x+w-58}" y="${y+150}" width="40" height="62" rx="8" fill="#2b3a44"/><rect x="${x+w-51}" y="${y+(s?157:183)}" width="26" height="22" rx="5" fill="${s?'#25b36e':'#e5533c'}"/></g><text x="${x+w-38}" y="${y+228}" class="bt" fill="${dark?'#e6ecef':'#33414a'}" style="font-size:10px">POWER ${s?'ON':'OFF'}</text>`;}
 return g;}
function batBody(c){const B=PB(),n=PN(),{x,y,w,h}=c;const r=R_();const soc=r.soc||0,on=st.sw.bsw;let g='';
 const swG=(sx,sy,hh,lc)=>`<text x="${sx+15}" y="${sy-4}" class="bt" style="font-size:8px" fill="${lc}">${B.sw}</text><g class="sw" data-sw="bsw"><rect x="${sx}" y="${sy}" width="30" height="${hh}" rx="5" fill="#1b2125" stroke="#59646b"/><rect x="${sx+5}" y="${sy+(on?3:hh/2)}" width="20" height="${hh/2-3}" rx="3" fill="${on?'#25b36e':'#e5533c'}"/></g>`;
 const leds=(lx,ly,col)=>[0,1,2,3,4].map(i=>`<rect x="${lx+i*11}" y="${ly}" width="8" height="5" rx="1" fill="${on&&soc>i*0.2+0.01?'#25d366':col}"/>`).join('');
 if(c.look==='rack'){const dk=B.brand==='Deye';for(let i=n-1;i>=0;i--){const my=y+8+i*c.mh;
   g+=`<rect x="${x}" y="${my}" width="${w}" height="${c.mh-6}" rx="5" fill="${dk?'#3a4046':'#e9ecee'}" stroke="#1f2428" stroke-width="1.5"/>
   <rect x="${x+6}" y="${my+8}" width="12" height="${c.mh-22}" rx="5" fill="none" stroke="${dk?'#8a949b':'#9aa4aa'}" stroke-width="3"/><rect x="${x+w-18}" y="${my+8}" width="12" height="${c.mh-22}" rx="5" fill="none" stroke="${dk?'#8a949b':'#9aa4aa'}" stroke-width="3"/>
   ${leds(x+26,my+10,dk?'#596168':'#c3cacd')}<text x="${x+26}" y="${my+c.mh-14}" class="bt" style="font-size:9px;text-anchor:start" fill="${dk?'#cfd8dd':'#33414a'}">${B.brand} ${B.model}</text>`;
   if(i>0)g+=`<rect x="${x+140}" y="${my+c.mh*0.4}" width="112" height="5" rx="2" fill="#6c757b" opacity=".6"/>`;}
  g+=swG(x+96,y+20,30,dk?'#cfd8dd':'#33414a');}
 else if(c.look==='box'){for(let i=n-1;i>=0;i--){const my=y+8+i*c.mh;g+=`<rect x="${x}" y="${my}" width="${w}" height="${c.mh-6}" rx="10" fill="#f1f3f4" stroke="#aeb7bc" stroke-width="1.5"/><rect x="${x+10}" y="${my+8}" width="76" height="${c.mh-22}" rx="6" fill="#dfe4e7"/>${leds(x+18,my+14,'#c3cacd')}<text x="${x+14}" y="${my+c.mh-18}" class="bt" style="font-size:9px;text-anchor:start" fill="#33414a">${B.brand} ${B.model}</text>`;}
  g+=swG(x+100,y+22,34,'#33414a');}
 else{const bc=c.look==='bc';g+=`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14" fill="${bc?'#1d3f73':'#f3f5f6'}" stroke="${bc?'#0f2546':'#aeb7bc'}" stroke-width="2"/>
  <rect x="${x+16}" y="${y+20}" width="${w-32}" height="44" rx="6" fill="${bc?'#0d1b2e':'#20272c'}"/><text x="${x+w/2}" y="${y+48}" class="bt" fill="#5fe0a0" style="font-size:16px">${on?Math.round(soc*100)+'%':''}</text>
  <text x="${x+w/2}" y="${y+86}" class="bt" style="font-size:${bc?13:12}px;font-weight:800" fill="${bc?'#ffffff':'#e07b1f'}">${bc?'BLUE CARBON':'FELICITY SOLAR'}</text><text x="${x+w/2}" y="${y+104}" class="bt" style="font-size:9.5px" fill="${bc?'#b8c8e0':'#5c6b74'}">${B.model}</text>
  <text x="${x+w/2}" y="${y+122}" class="bt" style="font-size:10px" fill="${bc?'#b8c8e0':'#5c6b74'}">51.2V ${B.ah}Ah${n>1?' × '+n:''}</text>${swG(x+w/2-15,y+150,34,bc?'#cfd8dd':'#33414a')}
  <rect x="${x+10}" y="${y+h-44}" width="${w-20}" height="36" rx="6" fill="${bc?'#132c52':'#dfe4e7'}"/>`;}
 for(const k in c.t){const T=c.t[k],tx=x+T.rx,ty=y+T.ry;g+=k==='can'?`<rect x="${tx-10}" y="${ty-8}" width="20" height="16" rx="2" fill="#2a3238"/><rect x="${tx-6}" y="${ty-4}" width="12" height="8" fill="#d9a441"/>`:`<circle cx="${tx}" cy="${ty}" r="11" fill="${k==='+'?'#c62828':'#202326'}" stroke="#d9a441" stroke-width="2"/>`;}
 if(n>1&&(c.look==='rack'||c.look==='box'))g+=`<text x="${x+w-6}" y="${y+h+12}" class="bt" style="text-anchor:end;font-size:10px" fill="#5c6b74">${n} × ${B.ah}Ah بالتوازي</text>`;
 return g;}
function compSVG(c){const {x,y,w,h}=c;let g=`<g data-c="${c.id}">`;
 if(c.type==='panel'){g+=`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="#163763" stroke="#9fb3c8" stroke-width="2"/>`;
  for(let i=1;i<6;i++)g+=`<line x1="${x}" x2="${x+w}" y1="${y+i*h/6}" y2="${y+i*h/6}" stroke="#4a6a93" stroke-width="1"/>`;
  for(let i=1;i<3;i++)g+=`<line y1="${y}" y2="${y+h}" x1="${x+i*w/3}" x2="${x+i*w/3}" stroke="#4a6a93" stroke-width="1"/>`;
  g+=`<rect x="${x+w/2-10}" y="${y+h-14}" width="20" height="10" fill="#222"/><text x="${x+w/2}" y="${y+16}" class="bt" fill="#fff">550W</text>`;
  g+=`<path d="M${x+w/2-6} ${y+h-4} Q${x+22} ${y+h+8} ${x+22} ${y+h+22}M${x+w/2+6} ${y+h-4} Q${x+58} ${y+h+8} ${x+58} ${y+h+22}" stroke="#222" stroke-width="3" fill="none"/>`;}
 else if(c.type==='iso'){const on=st.sw.iso;g+=`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="#f2f2ee" stroke="#b9bfb5" stroke-width="2"/><rect x="${x+8}" y="${y+22}" width="${w-16}" height="${h-44}" rx="6" fill="#ffd21f"/>
  <g class="sw" data-sw="iso" transform="rotate(${on?0:-90} ${x+w/2} ${y+h/2})"><circle cx="${x+w/2}" cy="${y+h/2}" r="30" fill="#d62b2b"/><rect x="${x+w/2-9}" y="${y+h/2-40}" width="18" height="80" rx="6" fill="#b51f1f"/></g>
  <text x="${x+w/2}" y="${y+16}" class="cn" style="font-size:12px">عازل DC</text><text x="${x+w/2+58}" y="${y+h/2-8}" class="bt" fill="#333">${on?'ON':'OFF'}</text><text x="${x+w/2+58}" y="${y+h/2+10}" class="bt" fill="#333" style="font-size:10px">DC 1000V</text>`;}
 else if(c.type==='inv')g+=invBody(c);
 else if(c.type==='bat')g+=batBody(c);
 else if(c.type==='brk'){const on=st.sw[c.id];g+=`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="#fafafa" stroke="#b9bfc4" stroke-width="2"/>
  <g class="sw" data-sw="${c.id}"><rect x="${x+w/2-16}" y="${y+28}" width="32" height="60" rx="5" fill="#e6e9eb" stroke="#9aa5ab"/><rect x="${x+w/2-12}" y="${y+(on?32:58)}" width="24" height="26" rx="4" fill="${on?'#25b36e':'#e5533c'}"/></g>
  <text x="${x+w/2}" y="${y+22}" class="bt" fill="#33414a" style="font-size:11px">${c.rating}</text><text x="${x+w/2}" y="${y+104}" class="bt" fill="#33414a" style="font-size:11px">${on?'ON':'OFF'}</text><text x="${x+w/2}" y="${y+124}" class="cn" style="font-size:12px">${c.name}</text>`;}
 else if(c.type==='sup'){const r=R_();const live=typeof gridSched==='function'&&r.min!=null&&gridSched(r.min/60);g+=`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="#e9ecef" stroke="#b9bfc4" stroke-width="2"/><rect x="${x+18}" y="${y+22}" width="${w-36}" height="40" rx="4" fill="#cfe3d4"/><text x="${x+w/2}" y="${y+48}" class="bt" fill="#1f2a30" style="font-size:15px">00427 kWh</text>
  <text x="${x+w/2}" y="${y+86}" class="bt" fill="#33414a" style="font-size:12px">230V · 50Hz</text><text x="${x+w/2}" y="${y+104}" class="bt" fill="${live?'#25b36e':'#e5533c'}" style="font-size:12px">${live?'● في كهربا':'● مقطوعة'}</text><text x="${x+w/2}" y="${y-8}" class="cn">${c.name}</text>`;}
 else if(c.type==='house'){const r=R_();const lit=r.houseOn;g+=`<path d="M${x} ${y+60}L${x+w/2} ${y+12}L${x+w} ${y+60}V${y+h}H${x}Z" fill="#f0e6d6" stroke="#b9a88a" stroke-width="2"/>
  <circle cx="${x+w/2}" cy="${y+108}" r="22" fill="${lit?'#ffd84d':'#cfd4d6'}" ${lit?'style="filter:drop-shadow(0 0 14px #ffd84d)"':''}/><rect x="${x+w/2-8}" y="${y+128}" width="16" height="10" fill="#8a96a0"/>
  <text x="${x+w/2}" y="${y+164}" class="cn" style="font-size:12px">${lit?Math.round(r.load)+'W':'عتمة'}</text><text x="${x+w/2}" y="${y+190}" class="cn" style="font-size:13px">تابلو البيت</text>`;}
 else if(c.type==='eb'){g+=`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="#c58b2a" stroke="#8a5d14"/><line x1="${x+w/2}" y1="${y+h}" x2="${x+w/2}" y2="${y+h+16}" stroke="#2e9d3a" stroke-width="4"/>
  <path d="M${x+w/2-22} ${y+h+18}h44M${x+w/2-14} ${y+h+24}h28" stroke="#33414a" stroke-width="3"/><text x="${x+w/2-70}" y="${y+h+22}" class="cn" style="font-size:13px">بار الأرض</text>`;}
 if(c.id==='p0')g+=`<text x="${x}" y="${y-6}" class="bt" style="text-anchor:start;font-size:11px" fill="#5c6b74">PV ARRAY · 6 × 550W</text>`;
 if(moveMode)g+=`<rect x="${x-6}" y="${y-6}" width="${w+12}" height="${h+(c.type==='inv'?20:12)}" rx="10" fill="rgba(34,199,155,.07)" stroke="#22c79b" stroke-width="2" stroke-dasharray="7 6"/>`;
 g+='</g>';
 for(const k in c.t){const key=keyOf(c.id,k);const t=term(key);const s=sel===key;
  g+=`<g class="tm${s?' on':''}" data-t="${key}"><circle cx="${t.x}" cy="${t.y}" r="15" fill="transparent"/><circle cx="${t.x}" cy="${t.y}" r="${s?9:7}" fill="${KCOL[t.k]}" stroke="${s?'#ffb400':'#fff'}" stroke-width="${s?4:2}"/></g>`;
  if(c.type!=='inv')g+=`<text x="${t.x}" y="${t.y+(t.d>0?24:-14)}" class="tl2">${t.l}</text>`;}
 return g;}
function render(){const b=document.getElementById('board');if(!b)return;const {de}=compute();
 let g=`<svg id="bsvg" viewBox="0 0 ${BW} ${BH}" width="${BW*zoom}" height="${BH*zoom}" xmlns="http://www.w3.org/2000/svg" class="${moveMode?'mv':''}"><rect width="${BW}" height="${BH}" fill="#e3e9ec"/>`;
 g+=`<path d="M0 210H340" stroke="#c9d2d7" stroke-dasharray="6 6"/><text x="320" y="226" class="zn">↑ السطح</text>`;
 for(const id in C)g+=compSVG(C[id]);
 st.wires.forEach((w,i)=>{const A=term(w.a);const col=KCOL[A.k];const d=wirePath(w);const s=i===selW;
  g+=`<path d="${d}" stroke="${s?'#ffb400':'rgba(0,0,0,.25)'}" stroke-width="${s?11:8}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  g+=`<path d="${d}" stroke="${col}" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  if(A.k==='PE')g+=`<path d="${d}" stroke="#f2d03b" stroke-width="5" stroke-dasharray="8 8" fill="none"/>`;
  if(!moveMode)g+=`<path class="wh" data-w="${i}" d="${d}" stroke="transparent" stroke-width="18" fill="none"/>`;});
 for(const id in C){const c=C[id];for(const k in c.t){const key=keyOf(id,k);if(sel===key||st.wires.some(w=>w.a===key||w.b===key)){const t=term(key);g+=`<circle cx="${t.x}" cy="${t.y}" r="4" fill="#fff" pointer-events="none"/>`;}}}
 if(selW>=0&&st.wires[selW]&&!moveMode){const w=st.wires[selW];
  if(!w.pts.length){const m=midCubic(w);g+=`<g class="hd" data-hw="${selW}" data-ins="0"><circle cx="${m[0]}" cy="${m[1]}" r="22" fill="transparent"/><circle cx="${m[0]}" cy="${m[1]}" r="11" fill="#ffb400" stroke="#fff" stroke-width="3"/><path d="M${m[0]-5} ${m[1]}h10M${m[0]} ${m[1]-5}v10" stroke="#fff" stroke-width="2.5"/></g>`;}
  else{const p=wPts(w);for(let i=1;i<p.length-2;i++){const a=p[i],c=p[i+1];const mx=(a[0]+c[0])/2,my=(a[1]+c[1])/2;g+=`<g class="hd" data-hw="${selW}" data-ins="${i-1}"><circle cx="${mx}" cy="${my}" r="16" fill="transparent"/><circle cx="${mx}" cy="${my}" r="7" fill="#fff" stroke="#ffb400" stroke-width="3"/><path d="M${mx-3.5} ${my}h7M${mx} ${my-3.5}v7" stroke="#ffb400" stroke-width="2"/></g>`;}
   w.pts.forEach((q,i)=>{g+=`<g class="hd" data-hw="${selW}" data-hp="${i}"><circle cx="${q[0]}" cy="${q[1]}" r="22" fill="transparent"/><circle cx="${q[0]}" cy="${q[1]}" r="11" fill="#ffb400" stroke="#fff" stroke-width="3"/></g>`;});}}
 g+='</svg>';b.innerHTML=g;b.classList.toggle('lock',moveMode||selW>=0);
 const tb=document.getElementById('wdel');if(tb)tb.disabled=selW<0;const ts=document.getElementById('wstraight');if(ts)ts.disabled=!(selW>=0&&st.wires[selW]&&st.wires[selW].pts.length);
 const mv=document.getElementById('wmove');if(mv){mv.classList.toggle('on',moveMode);mv.textContent=moveMode?'✓ خلصت ترتيب':'✋ حرّك القطع';}
 checklist(de);}
let liveSig='',busy=false,drag=null;
function updateLive(){const b=document.getElementById('bsvg');if(!b||busy||drag)return;const r=R_();
 const sig=[r.houseOn,WS&&WS.powered,Math.round((r.soc||0)*100),r.faults?[...r.faults].join():'',Math.round((r.load||0)/50),Math.round((r.pv||0)/100),r.gridPresent,typeof gridSched==='function'&&r.min!=null?gridSched(r.min/60):0].join('|');
 if(sig!==liveSig){liveSig=sig;render();}}

/* ---------- التقييم ---------- */
function checklist(de){const L=[];const add=(lvl,t)=>L.push({lvl,t});const I=PI(),B=PB();
 de.pv.forEach((p,k)=>{const nm=I.nMppt<2?'PV':'PV'+(k+1);
  if(p.short)add('bad',`${nm}: الموجب والسالب لازقين ببعض (Short).`);
  else if(p.rev)add('bad',`${nm}: ${p.n} ألواح بس القطبية معكوسة. موجب الألواح لازم يروح عالـ${nm}+.`);
  else if(p.n){const v=pvV(p.n);if(v.voc>VMAX())add('bad',`${nm}: ${p.n} ألواح، Voc بالبرد ≈ ${v.voc.toFixed(0)}V فوق ${VMAX()}V!`);else if(v.vmp<VMIN())add('warn',`${nm}: ${p.n} ألواح، Vmp بالحرّ ≈ ${v.vmp.toFixed(0)}V تحت مجال الـMPPT (${VMIN()}V). زيد ألواح عالتسلسل.`);else add('ok',`${nm}: ${p.n} ألواح عالتسلسل، Voc بالبرد ≈ ${v.voc.toFixed(0)}V ✓`);
   if(p.par)add('warn',`${nm}: في ألواح على نفس النقطة (توازي) بلا تجميع. وصّلهن عالتسلسل.`);}
  else if(p.open)add('warn',`${nm}: الـString مفتوح: في شريط ناقص.`);});
 if(!de.pv.some(p=>p.n||p.rev||p.short||p.open))add('todo','وصّل الألواح عالتسلسل: سالب كل لوح على موجب يلّي بعدو، والطرفين عالإنفرتر (مع عازل بالنص إذا بدّك).');
 const used={};de.pv.forEach(p=>Object.assign(used,p.used||{}));const un=6-Object.keys(used).length;if(un>0&&un<6)add('warn',`في ${un} ألواح مش موصولين.`);
 if(de.pv.some(p=>p.n&&!p.rev)){const x=analyze(without('iso'));if(x.pv.some(p=>p.n&&!p.rev))add(I.dcsw?'ok':'warn',I.dcsw?'الألواح عالإنفرتر بلا عازل برّاني: الـDC SW جوّا الإنفرتر بيفصلها ✓ (العازل البرّاني مستحسن إذا الألواح بعاد).':'الألواح عالإنفرتر بلا عازل DC: بتشتغل، بس ما فيك تفصلها إذا صار شي. المستحسن عازل بالنص.');else add('ok','عازل الـDC بين الألواح والإنفرتر ✓');}
 if(de.batShort)add('bad','البطارية: الموجب والسالب لازقين (Short)!');
 else if(de.batt==='ok'){const x=analyze(without('bbr'));if(x.batt==='ok')add('warn',`البطارية واصلة بلا قاطع DC: بتشتغل، بس أي Short بالكابل ما في شي يفصلو غير الـBMS. المقترح ${CAT.brkBat(I)}.`);else add('ok','البطارية عالـBAT+ والـBAT− مع قاطع ✓');}
 else if(de.batt==='rev')add('bad','البطارية معكوسة: موجبها على BAT−!');
 else if(de.batt==='half')add('warn','البطارية واصلة من طرف واحد بس.');
 else add('todo','وصّل البطارية عالـBAT+ والـBAT− (مباشرة أو مع قاطع).');
 {const cp=CAT.compat(I,B);
  if(!C.bat.t.can)add('ok',`البطارية ما فيها منفذ اتصال. اضبط الإنفرتر عالفولت: ${cp.set[0]}.`);
  else add(de.comm?'ok':'todo',de.comm?`كابل الاتصال (${cp.port}) ✓ الإعداد: ${cp.set.slice(0,2).join('، ')}.`:`وصّل كابل الاتصال (${cp.port}) من البطارية لمنفذ BMS بالإنفرتر.`);}
 if(de.acShort)add('bad','الدولة: الفاز والنوترال لازقين (Short)!');
 if(de.gridToLoad)add('bad','الدولة واصلة على مخرج البيت! الدولة بتفوت عالـ'+(I.type==='offgrid'?'AC IN':'GRID')+' بس.');
 if(de.grid==='ok'){const x=analyze(without('gbr'));if(x.grid==='ok')add('warn','الدولة واصلة بلا قاطع: بتشتغل، بس أي Short بيضرب فيوز العدّاد.');else add('ok','الدولة عالمدخل مع قاطع ✓');}
 else if(de.grid==='swap')add('warn','الدولة واصلة بس الفاز والنوترال مقلوبين.');
 else if(de.grid==='half')add('warn','الدولة واصلة من طرف واحد بس.');
 else if(!de.gridToLoad)add('todo',`وصّل الدولة عالـ${I.type==='offgrid'?'AC IN':'GRID'} L وN.`);
 if(de.house==='inv'){const x=analyze(without('lbr'));if(x.house==='inv')add('warn','البيت واصل عالمخرج بلا قاطع.');else add('ok','البيت على مخرج الإنفرتر مع قاطع ✓');}
 else if(de.house==='invswap')add('warn','البيت عالمخرج بس الفاز والنوترال مقلوبين.');
 else if(de.house==='grid')add('warn','البيت واصل عجهة الدولة مش عمخرج الإنفرتر: بالانقطاع رح يعتم.');
 else if(de.house==='half')add('warn','البيت واصل من طرف واحد بس.');
 else add('todo',`وصّل البيت على ${I.type==='offgrid'?'AC OUT':'LOAD'} L وN.`);
 add(de.invPE?'ok':'todo',de.invPE?'أرضي الإنفرتر (PE) عالبار ✓':'وصّل PE تبع الإنفرتر على بار الأرض.');
 if(de.invPE){if(!de.housePE)add('warn','أرضي تابلو البيت مش واصل عالبار.');if(!de.supPE)add('warn','أرضي الدولة مش واصل عالبار.');}
 const mx=new Set(de.mix);if(mx.has('dcac'))add('bad','في شريط واصل DC بـAC! هيدا بيضرب الإنفرتر.');if(mx.has('can'))add('bad','كابل الاتصال واصل على طرف قوّة!');if(mx.has('pe'))add('bad','الأرض واصلة على فاز أو نوترال أو DC!');if(mx.has('ln')&&!de.acShort)add('bad','في فاز ونوترال على نفس النقطة (Short).');
 const ic={ok:'✓',warn:'⚠',bad:'✗',todo:'○'};
 const nb=L.filter(x=>x.lvl==='bad').length,nt=L.filter(x=>x.lvl==='todo').length,nw=L.filter(x=>x.lvl==='warn').length;
 const head=nb?`<div class="wsum bad">في ${nb} غلطات خطيرة. صلّحهن قبل ما تشغّل.</div>`:(nt?`<div class="wsum">ضايل ${nt} خطوات.</div>`:(nw?`<div class="wsum warn">التوصيل بيشتغل، بس في ${nw} ملاحظات.</div>`:`<div class="wsum ok">التوصيل كامل وصحيح ✓ هلّق شغّل بالترتيب.</div>`));
 document.getElementById('wcheck').innerHTML=head+L.map(x=>`<div class="wc ${x.lvl}"><b>${ic[x.lvl]}</b><span>${x.t}</span></div>`).join('');}

/* ---------- السحب: مقابض الشرايط وتحريك القطع ---------- */
let justDragged=0,raf=0;
function svgPt(e){const s=document.getElementById('bsvg');const p=s.createSVGPoint();p.x=e.clientX;p.y=e.clientY;const q=p.matrixTransform(s.getScreenCTM().inverse());return [q.x,q.y];}
const snap=(v,g)=>Math.round(v/g)*g;
function onDown(e){const hd=e.target.closest('.hd');const b=document.getElementById('board');
 if(hd){e.preventDefault();const wi=+hd.dataset.hw,w=st.wires[wi];hist.push(snapH());
  let pi;if(hd.dataset.hp!=null)pi=+hd.dataset.hp;else{const p=svgPt(e);pi=+hd.dataset.ins;w.pts.splice(pi,0,[snap(p[0],5),snap(p[1],5)]);}
  drag={t:'pt',wi,pi,moved:false,ins:hd.dataset.hp==null};try{b.setPointerCapture(e.pointerId);}catch(_){}busy=true;return;}
 if(moveMode){const g=e.target.closest('[data-c]');if(g&&!e.target.closest('[data-sw]')){e.preventDefault();const c=C[g.dataset.c],p=svgPt(e);drag={t:'c',id:c.id,ox:p[0]-c.x,oy:p[1]-c.y,moved:false};try{b.setPointerCapture(e.pointerId);}catch(_){}busy=true;}}}
function onMove(e){if(!drag)return;e.preventDefault();const p=svgPt(e);drag.moved=true;
 if(drag.t==='pt'){st.wires[drag.wi].pts[drag.pi]=[Math.max(0,Math.min(BW,snap(p[0],5))),Math.max(0,Math.min(BH,snap(p[1],5)))];}
 else{const c=C[drag.id];c.x=Math.max(10,Math.min(BW-c.w-10,snap(p[0]-drag.ox,5)));c.y=Math.max(10,Math.min(BH-c.h-24,snap(p[1]-drag.oy,5)));}
 if(!raf)raf=requestAnimationFrame(()=>{raf=0;render();});}
function onUp(){if(!drag)return;const d=drag;drag=null;busy=false;justDragged=Date.now();
 if(d.t==='pt'){if(!d.moved){if(d.ins)st.wires[d.wi].pts.splice(d.pi,1);hist.pop();}saveW();}else if(d.moved)savePos();render();}

/* ---------- التفاعل ---------- */
function onBoard(e){if(Date.now()-justDragged<350)return;if(e.target.closest('.hd'))return;
 const sw=e.target.closest('[data-sw]');if(sw){onSwitch(sw.dataset.sw);return;}
 if(moveMode)return;
 const t=e.target.closest('[data-t]');
 if(t){const k=t.dataset.t;selW=-1;
  if(!sel){sel=k;tip(k);}
  else if(sel===k){sel=null;}
  else{const exists=st.wires.some(w=>(w.a===sel&&w.b===k)||(w.a===k&&w.b===sel));
   if(!exists){hist.push(snapH());const A=term(sel),B=term(k);
    st.wires.push({a:sel,b:k,pts:[]});selW=st.wires.length-1;
    if(A.k!==B.k)flash(`⚠ وصلت ${KNAME[A.k]} (${A.l}) على ${KNAME[B.k]} (${B.l}). متأكّد؟`,'w');else flash('وصلت ✓ اسحب الدائرة الصفرا لتحدّد مشي الشريط، أو اكبس بمحل فاضي لتكمّل.','');}
   sel=null;afterWireChange();return;}
  render();return;}
 const w=e.target.closest('[data-w]');if(w){selW=+w.dataset.w;sel=null;flash('نقّيت الشريط: اسحب الدوائر الصفر لتغيّر مشيو، و«+» بتزيد نقطة. «سوّي الشريط» بترجّعو متل الأول.','');render();return;}
 sel=null;selW=-1;render();}
function tip(k){const [c,t]=k.split('.');const T=C[c].t[t];flash(`نقّيت: ${C[c].name} ← ${T.l} (${KNAME[T.k]}). هلّق اكبس عالطرف التاني.`,'');}
function setZoom(z){const b=document.getElementById('board');const fit=Math.max(0.3,(b.clientWidth-4)/BW);zoom=z||fit;render();}
function solution(){hist.push(snapH());const W=[];const a=(x,y)=>W.push({a:x,b:y,pts:[]});
 for(let i=0;i<5;i++)a('p'+i+'.-','p'+(i+1)+'.+');a('p0.+','iso.i1p');a('p5.-','iso.i1n');a('iso.o1p','inv.pv1p');a('iso.o1n','inv.pv1n');
 a('bat.+','bbr.ip');a('bat.-','bbr.in');a('bbr.op','inv.batp');a('bbr.on','inv.batn');if(C.bat.t.can)a('bat.can','inv.bms');
 a('sup.L','gbr.iL');a('sup.N','gbr.iN');a('gbr.oL','inv.gl');a('gbr.oN','inv.gn');
 a('inv.ll','lbr.iL');a('inv.ln','lbr.iN');a('lbr.oL','house.L');a('lbr.oN','house.N');
 a('inv.pe','eb.e0');a('sup.PE','eb.e1');a('house.PE','eb.e4');
 st.wires=W;sel=null;selW=-1;afterWireChange();
 flash(`هيدا الحل النموذجي. شغّل بالترتيب: ${PB().sw} البطارية، قاطع البطارية، الإنفرتر ON، ${PI().dcsw?'الـDC SW والعازل':'العازل'}، الدولة، البيت.`,'o');}

window.WIRE={render,setZoom,compute,updateLive,
 rebuild(){build();st={wires:[],sw:freshSw(),dmg:0};hist=[];sel=null;selW=-1;moveMode=false;saveW();compute();setZoom();},
 init(){const b=document.getElementById('board');b.addEventListener('click',onBoard);
  b.addEventListener('pointerdown',e=>{busy=true;onDown(e);});b.addEventListener('pointermove',onMove);b.addEventListener('pointerup',onUp);b.addEventListener('pointercancel',onUp);
  addEventListener('pointerup',()=>{setTimeout(()=>{if(!drag)busy=false;},60);});
  document.getElementById('wzin').onclick=()=>setZoom(zoom*1.25);document.getElementById('wzout').onclick=()=>setZoom(Math.max(0.25,zoom/1.25));
  document.getElementById('wundo').onclick=()=>{if(!hist.length)return;st.wires=JSON.parse(hist.pop());selW=-1;afterWireChange();};
  document.getElementById('wdel').onclick=()=>{if(selW<0)return;hist.push(snapH());st.wires.splice(selW,1);selW=-1;afterWireChange();};
  document.getElementById('wstraight').onclick=()=>{if(selW<0)return;hist.push(snapH());st.wires[selW].pts=[];saveW();render();};
  document.getElementById('wmove').onclick=()=>{moveMode=!moveMode;sel=null;selW=-1;render();flash(moveMode?'اسحب أي قطعة (إنفرتر، بطارية، قاطع…) لمحل ما بدّك. الشرايط بتلحقها.':'تحفظ الترتيب ✓','');};
  document.getElementById('wlay').onclick=()=>{ls.set(posKey(),'');build();render();flash('رجّعت القطع لمحلاتها الأصلية.','');};
  document.getElementById('wclear').onclick=()=>{if(!st.wires.length)return;hist.push(snapH());st.wires=[];for(const k in st.sw)st.sw[k]=0;selW=-1;afterWireChange();flash('مسحت كل الشرايط ونزّلت كل القواطع.','');};
  document.getElementById('wsol').onclick=solution;
  document.getElementById('wnew').onclick=()=>{st.dmg=0;for(const k in st.sw)st.sw[k]=0;saveW();render();if(typeof draw==='function')draw();flash('ركّبت إنفرتر جديد. كل القواطع نازلة.','o');};
  compute();setZoom();}};
})();
