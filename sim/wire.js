// لوحة المشروع متل الأوتوكاد: زوم ونقل، مكتبة قطع، مشاريع جاهزة، كل قطعة بتكبر وبتصغر لحالها
'use strict';
(function(){
const C={};
const PI=()=>(typeof PROJ!=='undefined'&&PROJ)?CAT.inv(PROJ.inv):CAT.inv('deye5');
const PB=()=>(typeof PROJ!=='undefined'&&PROJ)?CAT.bat(PROJ.bat):CAT.bat('deyeg5');
const PN=()=>(typeof PROJ!=='undefined'&&PROJ&&PROJ.n)||1;
const projKey=()=>PI().id+':'+PB().id+':'+PN();
const KCOL={'+':'#d32f2f','-':'#1b1b1b','L':'#8a4b14','N':'#1f6fd1','PE':'#2e9d3a','CAN':'#8a96a0'};
const KNAME={'+':'موجب DC','-':'سالب DC','L':'فاز','N':'نوترال','PE':'أرض','CAN':'كابل اتصال'};
const SINGLE={inv:1,bat:1,sup:1,house:1};
const PFX={panel:'p',iso:'iso',bdc:'bdc',bac:'bac',eb:'eb'};
const LIB=[['panel','☀ لوح 550W'],['iso','عازل DC'],['bdc','قاطع DC'],['bac','قاطع AC'],['inv','الإنفرتر'],['bat','البطارية'],['sup','عدّاد الدولة'],['house','تابلو البيت'],['eb','بار أرض']];

/* ---------- القطع ---------- */
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
function brk(k1,k2,l1,l2){const kk=k=>k==='p'?'+':(k==='n'?'-':k);return {w:96,h:136,t:{['i'+k1]:{rx:28,ry:0,k:kk(k1),d:-1,l:l1},['i'+k2]:{rx:68,ry:0,k:kk(k2),d:-1,l:l2},['o'+k1]:{rx:28,ry:136,k:kk(k1),d:1,l:l1},['o'+k2]:{rx:68,ry:136,k:kk(k2),d:1,l:l2}},pairs:[['i'+k1,'o'+k1],['i'+k2,'o'+k2]]};}
function mk(o){const I=PI(),B=PB(),n=PN();let d;
 switch(o.type){
  case 'panel':d={w:80,h:116,t:{'+':{rx:22,ry:146,k:'+',d:1,l:'+'},'-':{rx:58,ry:146,k:'-',d:1,l:'−'}}};break;
  case 'iso':{const t={};const cols=[['1p','+','PV1+'],['1n','-','PV1−'],['2p','+','PV2+'],['2n','-','PV2−']];
   cols.forEach((c,i)=>{const cx=32+i*48;t['i'+c[0]]={rx:cx,ry:0,k:c[1],d:-1,l:c[2]};t['o'+c[0]]={rx:cx,ry:128,k:c[1],d:1,l:c[2]};});
   d={w:210,h:128,t,pairs:cols.map(c=>['i'+c[0],'o'+c[0]])};break;}
  case 'inv':{const w=380,h=440,L=invLayout(I);const tot=L.reduce((a,s)=>a+SLOTW[s[3]],0);const sc=(w-24)/tot;let cx=12;const t={},dec=[];
   L.forEach(s=>{const sw=SLOTW[s[3]]*sc,mid=cx+sw/2;cx+=sw;if(s[2])t[s[0]]={rx:mid,ry:h+8,k:s[2],d:1,l:s[1],kind:s[3]};else dec.push({id:s[0],rx:mid,l:s[1],kind:s[3],w:sw});});
   d={w,h,t,dec};break;}
  case 'bat':{const look=B.look||'box';const stack=look==='rack'||look==='box';const mh=look==='rack'?(n>2?58:72):(n>2?70:96);
   const w=stack?280:190,h=stack?mh*n+16:250;const t={};const tx=stack?[150,196,246]:[52,92,148];const ty=stack?8+mh*0.5:h-24;
   t['+']={rx:tx[0],ry:ty,k:'+',d:stack?-1:1,l:'+'};t['-']={rx:tx[1],ry:ty,k:'-',d:stack?-1:1,l:'−'};
   if(B.comm.length)t.can={rx:tx[2],ry:ty,k:'CAN',d:stack?-1:1,l:B.comm.includes('CAN')?'CAN':B.comm[0]};
   d={w,h,t,look,mh};break;}
  case 'bdc':d=brk('p','n','+','−');d.rating=CAT.brkBat(I);break;
  case 'bac':d=brk('L','N','L','N');d.rating=CAT.brkAC(I);break;
  case 'sup':d={w:130,h:150,t:{L:{rx:30,ry:150,k:'L',d:1,l:'L'},N:{rx:65,ry:150,k:'N',d:1,l:'N'},PE:{rx:100,ry:150,k:'PE',d:1,l:'PE'}}};break;
  case 'house':d={w:140,h:240,t:{L:{rx:32,ry:240,k:'L',d:1,l:'L'},N:{rx:70,ry:240,k:'N',d:1,l:'N'},PE:{rx:108,ry:240,k:'PE',d:1,l:'PE'}}};break;
  case 'eb':{const t={};for(let i=0;i<5;i++)t['e'+i]={rx:30+i*60,ry:0,k:'PE',d:-1,l:'PE'};d={w:300,h:24,t};break;}
 }
 return Object.assign({s:1},o,d);}
const NAMES={panel:'لوح',iso:'عازل DC',bdc:'قاطع DC',bac:'قاطع AC',inv:'الإنفرتر',bat:'البطارية',sup:'عدّاد الدولة',house:'تابلو البيت',eb:'بار الأرض'};
function nameOf(c){if(SINGLE[c.type])return NAMES[c.type];const m=c.id.match(/\d+$/);return NAMES[c.type]+(m?' '+m[0]:'');}
function rebuildC(){for(const k in C)delete C[k];for(const o of st.comps){const c=mk(o);c.name=nameOf(c);C[o.id]=c;}}
const byType=t=>Object.values(C).filter(c=>c.type===t);
const keyOf=(c,t)=>c+'.'+t;
function term(k){const [c,t]=k.split('.');const o=C[c],T=o.t[t],s=o.s||1;return {x:o.x+T.rx*s,y:o.y+T.ry*s,k:T.k,d:T.d,l:T.l};}
const hasT=k=>{const [c,t]=k.split('.');return !!(C[c]&&C[c].t[t]);};

/* ---------- المشاريع الجاهزة ---------- */
function readyProject(id){const I=PI(),n=PN(),B=PB();const comps=[],W=[];const a=(x,y)=>W.push({a:x,b:y});
 const look=B.look||'box';const stack=look==='rack'||look==='box';const mh=look==='rack'?(n>2?58:72):(n>2?70:96);
 const add=(type,id,x,y)=>comps.push({id,type,x,y,s:1});
 const two=id==='two',one=I.nMppt<2,dy=two&&!one?160:0;
 const np=id==='ups'?0:(two?(one?8:12):6);
 for(let i=0;i<np;i++){const row=two&&!one&&i>=6;add('panel','p'+(i+1),20+(row?i-6:i)*92,24+(row?176:0));}
 if(np)add('iso','iso1',40,252+dy);
 add('inv','inv',390,186+dy);
 add('bat','bat',20,(stack?Math.round(650-mh*(n-1)*0.6):590)+dy);
 add('bdc','bdc1',318,690+dy);
 if(id!=='offgrid'){add('sup','sup',950,22);add('bac','bac1',968,236);}
 add('bac','bac2',820,700+dy);add('house','house',950,560+dy);add('eb','eb1',420,846+dy);
 if(id==='empty')return {comps:[],wires:[]};
 const chain=(from,to)=>{for(let i=from;i<to;i++)a('p'+i+'.-','p'+(i+1)+'.+');};
 if(np){if(two&&!one){chain(1,6);chain(7,12);a('p1.+','iso1.i1p');a('p6.-','iso1.i1n');a('p7.+','iso1.i2p');a('p12.-','iso1.i2n');a('iso1.o2p','inv.pv2p');a('iso1.o2n','inv.pv2n');}
  else{chain(1,np);a('p1.+','iso1.i1p');a('p'+np+'.-','iso1.i1n');}
  a('iso1.o1p','inv.pv1p');a('iso1.o1n','inv.pv1n');}
 a('bat.+','bdc1.ip');a('bat.-','bdc1.in');a('bdc1.op','inv.batp');a('bdc1.on','inv.batn');if(B.comm.length)a('bat.can','inv.bms');
 if(id!=='offgrid'){a('sup.L','bac1.iL');a('sup.N','bac1.iN');a('bac1.oL','inv.gl');a('bac1.oN','inv.gn');a('sup.PE','eb1.e1');}
 a('inv.ll','bac2.iL');a('inv.ln','bac2.iN');a('bac2.oL','house.L');a('bac2.oN','house.N');
 a('inv.pe','eb1.e0');a('house.PE','eb1.e4');
 return {comps,wires:W};}
const READY=()=>[['home','🏠 بيت: ألواح + بطارية + دولة'],['two',PI().nMppt<2?'☀ 8 ألواح عسترينغ واحد':'☀ 12 لوح عسترينغين'],['offgrid','⛰ بلا دولة'],['ups','🔋 بطارية بلا ألواح'],['empty','⬜ من الصفر']];

/* ---------- الحالة ---------- */
function freshSw(){const s={bsw:0,inv:0};if(PI().dcsw)s.idc=0;return s;}
let st={proj:'',comps:[],wires:[],sw:freshSw(),dmg:0};
try{const v=JSON.parse(ls.get('simBoard')||'null');if(v&&v.comps)st=Object.assign(st,v);}catch(e){}
function loadReady(id,keepSay){const r=readyProject(id);st.comps=r.comps;st.wires=r.wires;st.sw=freshSw();st.dmg=0;st.proj=projKey();rebuildC();hist=[];sel=null;selW=-1;selC=null;saveW();}
let hist=[];let sel=null,selW=-1,selC=null,editMode=false,cam={x:0,y:0,w:1100};
if(st.proj!==projKey()||!st.comps.length&&!st.empty){const r=readyProject('home');st.comps=r.comps;st.wires=r.wires;st.sw=freshSw();st.dmg=0;st.proj=projKey();}
rebuildC();
st.wires=st.wires.filter(w=>hasT(w.a)&&hasT(w.b));st.wires.forEach(w=>{delete w.pts;if(w.c&&!(w.c.length%2))delete w.c;});
const snapH=()=>JSON.stringify({c:st.comps,w:st.wires});
function restore(h){const o=JSON.parse(h);st.comps=o.c;st.wires=o.w;rebuildC();}
function saveW(){ls.set('simBoard',JSON.stringify(st));}
function syncComp(c){const o=st.comps.find(x=>x.id===c.id);if(o){o.x=c.x;o.y=c.y;o.s=c.s;}}

/* ---------- الشبكة الكهربائية ---------- */
let EB0='∅eb';
function nets(sw){const par={};const f=x=>{if(par[x]===undefined)return x;while(par[x]!==x){par[x]=par[par[x]];x=par[x];}return x;};const u=(a,b)=>{a=f(a);b=f(b);if(a!==b)par[a]=b;};
 for(const c in C)for(const t in C[c].t)par[keyOf(c,t)]=keyOf(c,t);
 for(const w of st.wires)if(par[w.a]&&par[w.b])u(w.a,w.b);
 for(const c in C)if(C[c].pairs&&sw[c])for(const p of C[c].pairs)u(keyOf(c,p[0]),keyOf(c,p[1]));
 const ebs=byType('eb');EB0=ebs.length?keyOf(ebs[0].id,'e0'):'∅eb';
 for(const e of ebs)for(let i=0;i<5;i++)u(EB0,keyOf(e.id,'e'+i));
 const groups={};for(const k in par){const r=f(k);(groups[r]=groups[r]||[]).push(k);}
 return {f,groups};}
function walk(N,startK,endK){const s=N.f(startK),e=N.f(endK);if(s===e)return{short:true,n:0};const P=byType('panel').map(c=>c.id);
 let cur=s,n=0,used={},par=false;
 for(let g=0;g<P.length+1;g++){const ps=P.filter(id=>!used[id]&&N.f(id+'.+')===cur);
  if(!ps.length)break;if(ps.length>1)par=true;const id=ps[0];used[id]=1;n++;cur=N.f(id+'.-');if(cur===e)return{ok:true,n,par,used};}
 return{ok:false,n,par,used};}
function strInfo(N,k){if(!C.inv||!C.inv.t['pv'+k+'p'])return{none:true,n:0,used:{}};const a='inv.pv'+k+'p',b='inv.pv'+k+'n';
 const fw=walk(N,a,b);if(fw.short)return{short:true,used:{}};if(fw.ok)return{n:fw.n,par:fw.par,used:fw.used};
 const rv=walk(N,b,a);if(rv.ok)return{rev:true,n:rv.n,used:rv.used};
 const touched=fw.n>0||rv.n>0;return{open:touched,none:!touched,n:0,used:Object.assign({},fw.used||{},rv.used||{})};}
function analyze(sw){const N=nets(sw),f=N.f;const r={N};
 r.pv=[strInfo(N,1),strInfo(N,2)];
 const Bp=f('bat.+'),Bn=f('bat.-');r.batShort=!!C.bat&&Bp===Bn;
 const ip=f('inv.batp'),inn=f('inv.batn');
 r.batt=!C.bat||!C.inv?'none':(ip===Bp&&inn===Bn)?'ok':((ip===Bn&&inn===Bp)?'rev':((ip===Bp||inn===Bn||ip===Bn||inn===Bp)?'half':'none'));
 r.comm=!!(C.bat&&C.bat.t.can&&C.inv)&&f('inv.bms')===f('bat.can');
 const SL=f('sup.L'),SN=f('sup.N');r.acShort=!!C.sup&&SL===SN;
 const gl=f('inv.gl'),gn=f('inv.gn'),ll=f('inv.ll'),ln=f('inv.ln');
 r.grid=!C.sup||!C.inv?'none':(gl===SL&&gn===SN)?'ok':((gl===SN&&gn===SL)?'swap':((gl===SL||gn===SN||gl===SN||gn===SL)?'half':'none'));
 r.gridToLoad=!!(C.sup&&C.inv)&&(ll===SL||ln===SN||ll===SN||ln===SL);
 const HL=f('house.L'),HN=f('house.N');
 r.house=!C.house?'none':!C.inv?((HL===SL&&HN===SN)?'grid':'none'):(HL===ll&&HN===ln)?'inv':((HL===ln&&HN===ll)?'invswap':((HL===SL||HN===SN||HL===gl)?'grid':((HL===ll||HN===ln)?'half':'none')));
 r.loadShort=!!C.inv&&ll===ln;
 r.invPE=!!C.inv&&f('inv.pe')===f(EB0);r.housePE=!!C.house&&f('house.PE')===f(EB0);r.supPE=!!C.sup&&f('sup.PE')===f(EB0);
 r.mix=[];for(const g in N.groups){const ks=N.groups[g].map(k=>term(k).k);const set=new Set(ks);
  const dc=set.has('+')||set.has('-'),ac=set.has('L')||set.has('N');
  if(dc&&ac)r.mix.push('dcac');if(set.has('CAN')&&(dc||ac||set.has('PE')))r.mix.push('can');if(set.has('PE')&&(dc||ac))r.mix.push('pe');
  if(set.has('L')&&set.has('N'))r.mix.push('ln');}
 return r;}
const pvV=(n)=>({voc:n*49.6*(1+0.0027*25),vmp:n*41.9*(1-0.0027*40)});
const VMAX=()=>PI().maxVoc,VMIN=()=>PI().mppt[0];
const allOn=()=>{const a={bsw:1,inv:1,idc:1};for(const id in C)if(C[id].pairs)a[id]=1;return a;};
const offTypes=(...ts)=>{const a=allOn();for(const id in C)if(ts.includes(C[id].type))a[id]=0;return a;};
const without=id=>{const a=Object.assign({},st.sw);a[id]=0;return a;};
const closedOf=t=>Object.values(C).filter(c=>c.type===t&&st.sw[c.id]).map(c=>c.id);

/* ---------- الحالة للمحاكي ---------- */
function compute(){const op=analyze(st.sw),de=analyze(allOn());const I=PI();
 const pvOn=!I.dcsw||!!st.sw.idc;
 const strings=op.pv.map(p=>(pvOn&&p.n&&!p.rev&&!p.short&&!p.open&&!p.none)?p.n:0);
 const batt=!!st.sw.bsw&&op.batt==='ok'&&!op.batShort;
 const grid=(op.grid==='ok'||op.grid==='swap')&&!op.acShort;
 const powered=!!C.inv&&!!st.sw.inv&&!st.dmg&&(batt||grid);
 let load='none';if((op.house==='inv'||op.house==='invswap')&&!op.loadShort)load='inv';else if(C.house&&C.sup&&op.N.f('house.L')===op.N.f('sup.L')&&op.N.f('house.N')===op.N.f('sup.N'))load='grid';
 window.WS={free:false,powered,strings,batt,comm:op.comm&&batt,grid,load,dmg:st.dmg};
 return {op,de};}

/* ---------- الحماية بعد كل تغيير ---------- */
let fuseSaid=false;
function tripFirst(type,test){for(const id of closedOf(type)){if(!test(analyze(without(id)))){st.sw[id]=0;return id;}}return null;}
function hazards(say){let op=analyze(st.sw);const outN=PI().type==='offgrid'?'AC OUT':'LOAD';
 if(st.sw.bsw&&op.batShort){const t=tripFirst('bdc',x=>x.batShort);if(t)say('e',`💥 Short عالبطارية! ${C[t].name} فصل فوراً.`);else{st.sw.bsw=0;say('e','💥 Short عالبطارية وما في قاطع بالنص! حماية الـBMS فصلت البطارية. بلا BMS، الكابل بيحترق.');}op=analyze(st.sw);}
 if(st.sw.bsw&&op.batt==='rev'&&!st.dmg){st.dmg=1;say('e','💥 قطبية البطارية معكوسة عالإنفرتر! BAT+ عالسالب. انضرب الإنفرتر أو الفيوز الداخلي. صلّح وكبس «جهاز جديد».');}
 if(op.mix.includes('dcac')&&(st.sw.bsw||op.grid!=='none')&&!st.dmg){st.dmg=1;say('e','💥 خلطت DC مع AC: في شريط واصل البطارية أو الألواح على طرف AC. الإنفرتر انضرب.');}
 if(op.acShort){const t=tripFirst('bac',x=>x.acShort);if(t){say('e',`💥 Short بين الفاز والنوترال! ${C[t].name} فصل.`);fuseSaid=false;}
  else if(!fuseSaid){fuseSaid=true;say('e','💥 Short بين فاز ونوترال الدولة وما في قاطع بالنص! فيوز العدّاد ضرب والدولة مقطوعة لحد ما تشيل الـShort.');}}
 else fuseSaid=false;
 op=analyze(st.sw);
 if(op.gridToLoad&&st.sw.inv&&!st.dmg&&!op.acShort){st.dmg=1;say('e',`💥 الدولة واصلة على مخرج ${outN}، والإنفرتر عم يطلّع كهربا عليه. التقى مصدرين: الإنفرتر انضرب.`);}
 compute();
 if(op.loadShort&&WS.powered){const t=tripFirst('bac',x=>x.loadShort);if(t)say('e',`💥 Short عالمخرج! ${C[t].name} فصل.`);else{st.sw.inv=0;say('e','💥 Short عمخرج الإنفرتر وما في قاطع. حماية الإنفرتر طفّته.');}}
}

/* ---------- الأحداث ---------- */
function onSwitch(id){st.sw[id]=st.sw[id]?0:1;const on=st.sw[id];
 const say=(cls,t)=>{ev(cls,t,'',0);flash(t,cls);};
 const before=st.dmg;hazards(say);
 if(on&&!st.sw[id]){saveW();render();if(typeof draw==='function')draw();return;}
 let {op}=compute();const c=C[id];
 if(on&&!(st.dmg&&!before)){
  if(id==='bsw')say(op.batt==='ok'?'o':'w',op.batt==='ok'?`شغّلت البطارية (${PB().sw}): `+(op.comm?'مع كابل اتصال BMS.':(C.bat.t.can?'بلا كابل اتصال.':'هالبطارية ما فيها اتصال، الإنفرتر لازم يشتغل عالفولت.'))+(analyze(offTypes('bdc')).batt==='ok'?' ⚠ بلا قاطع DC بالنص.':''):`شغّلت البطارية (${PB().sw})، بس مش واصلة صح عالـBAT+ والـBAT−.`);
  else if(id==='inv'){if(st.dmg)say('e','الإنفرتر مضروب. صلّح التوصيل وكبس «جهاز جديد».');else if(!WS.powered)say('w','كبست ON بس الإنفرتر ما قلع: بدّو بطارية شغّالة أو دولة. الشمس لحالها ما بتقلّعو.');else{say('o','الإنفرتر قلع ✓');UI.pg='main';UI.tab=0;UI.draft=null;}}
  else if(id==='idc'||(c&&c.type==='iso')){say('o',id==='idc'?'فتحت الـDC SW تبع الإنفرتر.':`رفعت ${c.name}.`);op.pv.forEach((p,k)=>{const nm='PV'+(k+1);
   if(p.short)say('e',`⚠ ${nm}: الموجب والسالب لازقين. الألواح بـShort والـMC4 ممكن تعمل قوس.`);
   else if(p.rev)say('e',`⚠ ${nm}: قطبية الألواح معكوسة! صلّح قبل ما ترفع العازل.`);
   else if(p.n){const v=pvV(p.n);say(v.voc>VMAX()?'e':'o',`${nm}: ${p.n} ألواح عالتسلسل. Voc بالبرد تقريباً ${v.voc.toFixed(0)}V`+(v.voc>VMAX()?` — فوق ${VMAX()}V، خطر عالإنفرتر!`:(v.vmp<VMIN()?`، وVmp بالحرّ ${v.vmp.toFixed(0)}V تحت مجال الـMPPT.`:' ✓')));}
   else if(p.open)say('w',`${nm}: الـString مش مسكّر. في لوح أو شريط ناقص.`);});}
  else if(c)say('o',`رفعت ${c.name}.`+(c.type==='bac'&&op.gridToLoad?' ⚠ الدولة واصلة على مخرج البيت! إذا شغّلت الإنفرتر رح ينضرب.':''));}
 if(!on)ev('o',id==='bsw'?'طفيت البطارية.':id==='inv'?'طفيت الإنفرتر.':id==='idc'?'سكّرت الـDC SW.':`نزّلت ${c?c.name:id}.`,'',0);
 saveW();render();if(typeof draw==='function')draw();}
function afterChange(){const say=(cls,t)=>{ev(cls,t,'',0);flash(t,cls);};hazards(say);saveW();compute();render();if(typeof draw==='function')draw();}
let flashT;function flash(t,cls){const m=document.getElementById('wmsg');m.className='wmsg '+(cls||'');m.textContent=t;m.hidden=false;clearTimeout(flashT);flashT=setTimeout(()=>{m.hidden=true;},7000);}

/* ---------- مسار الشرايط ---------- */
const P2=(x,y)=>x.toFixed(1)+' '+y.toFixed(1);
// الشريط = خطوط أفقية وعمودية. w.c = [y1, x2, y3, …, yn]: أوّل وآخر قطعة عموديّة عالأطراف
function defC(w){const A=term(w.a),B=term(w.b),s=24;const i=st.wires.indexOf(w);const off=((i<0?0:i)%5)*7;
 const a1=A.y+A.d*s,b1=B.y+B.d*s;let yc;
 if(A.d>0&&B.d>0)yc=Math.max(a1,b1)+off;else if(A.d<0&&B.d<0)yc=Math.min(a1,b1)-off;else yc=(a1+b1)/2+off-14;
 return [Math.round(yc)];}
function corners(w){const A=term(w.a),B=term(w.b);const c=w.c||defC(w);const P=[[A.x,A.y]];let x=A.x;
 for(let i=0;i<c.length;i++){if(i%2===0)P.push([x,c[i]]);else{x=c[i];P.push([x,c[i-1]]);}}
 P.push([B.x,c[c.length-1]]);P.push([B.x,B.y]);return P;}
// القطعة j (بين P[j] وP[j+1]) ← رقمها بـc، أو -1 للقطعتين يلّي عالأطراف
const segParam=(P,j)=>(j>=1&&j<=P.length-3)?j-1:-1;
const segHoriz=(P,j)=>Math.abs(P[j][1]-P[j+1][1])<0.5&&Math.abs(P[j][0]-P[j+1][0])>=0.5;
function simplify(w){const c=w.c;if(!c)return;let ch=true;while(ch){ch=false;for(let i=0;i+2<c.length;i++){if(Math.abs(c[i]-c[i+2])<1){c.splice(i+1,2);ch=true;break;}}}}
function wirePath(w){const p=corners(w);let d=`M${P2(p[0][0],p[0][1])}`;
 for(let i=1;i<p.length-1;i++){const a=p[i-1],b=p[i],c=p[i+1];const l1=Math.hypot(b[0]-a[0],b[1]-a[1]),l2=Math.hypot(c[0]-b[0],c[1]-b[1]);const r=Math.min(14,l1/2,l2/2);
  if(r<1){d+=` L${P2(b[0],b[1])}`;continue;}
  const s1=[b[0]+(a[0]-b[0])*r/l1,b[1]+(a[1]-b[1])*r/l1],s2=[b[0]+(c[0]-b[0])*r/l2,b[1]+(c[1]-b[1])*r/l2];d+=` L${P2(s1[0],s1[1])} Q${P2(b[0],b[1])} ${P2(s2[0],s2[1])}`;}
 const z=p[p.length-1];return d+` L${P2(z[0],z[1])}`;}
// الشريط متل الحقيقي: لمعة، وجلبة (ماركر) فيها اسم الطرف حدّ كل راس
const HI={'+':'#ff8a80','-':'#6b6b6b','L':'#d08a4e','N':'#7fb3ff','PE':'#7fd88a','CAN':'#cfd6db'};
function sleeve(w,end){const p=corners(w);const a=end?p[p.length-1]:p[0],b=end?p[p.length-2]:p[1];const L=Math.hypot(b[0]-a[0],b[1]-a[1]);if(L<34)return '';
 const T=term(end?w.b:w.a);const ux=(b[0]-a[0])/L,uy=(b[1]-a[1])/L;const cx=a[0]+ux*24,cy=a[1]+uy*24;const vert=Math.abs(uy)>0.5;
 let txt=(T.l.length>7?T.l.slice(0,7):T.l).replace('−','–');if(txt==='+'||txt==='–')txt=txt==='+'?'+ DC':'– DC';const len=Math.max(22,txt.length*6.4+8);
 return `<g pointer-events="none" transform="translate(${cx.toFixed(1)} ${cy.toFixed(1)})${vert?' rotate(-90)':''}"><rect x="${-len/2}" y="-6.5" width="${len}" height="13" rx="3" fill="#f7f7f2" stroke="#9aa3a8" stroke-width="1"/><text x="0" y="3.6" text-anchor="middle" font-size="9.5" font-weight="700" fill="#222" style="font-family:'IBM Plex Mono',ui-monospace,monospace">${txt}</text></g>`;}

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

function body(c){const {x,y,w,h}=c;let g='';
 if(c.type==='panel'){g+=`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="#163763" stroke="#9fb3c8" stroke-width="2"/>`;
  for(let i=1;i<6;i++)g+=`<line x1="${x}" x2="${x+w}" y1="${y+i*h/6}" y2="${y+i*h/6}" stroke="#4a6a93" stroke-width="1"/>`;
  for(let i=1;i<3;i++)g+=`<line y1="${y}" y2="${y+h}" x1="${x+i*w/3}" x2="${x+i*w/3}" stroke="#4a6a93" stroke-width="1"/>`;
  g+=`<rect x="${x+w/2-10}" y="${y+h-14}" width="20" height="10" fill="#222"/><text x="${x+w/2}" y="${y+16}" class="bt" fill="#fff">550W</text>`;
  g+=`<path d="M${x+w/2-6} ${y+h-4} Q${x+22} ${y+h+8} ${x+22} ${y+h+22}M${x+w/2+6} ${y+h-4} Q${x+58} ${y+h+8} ${x+58} ${y+h+22}" stroke="#222" stroke-width="3" fill="none"/>`;}
 else if(c.type==='iso'){const on=st.sw[c.id];g+=`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="#f2f2ee" stroke="#b9bfb5" stroke-width="2"/><rect x="${x+8}" y="${y+22}" width="${w-16}" height="${h-44}" rx="6" fill="#ffd21f"/>
  <g class="sw" data-sw="${c.id}" transform="rotate(${on?0:-90} ${x+w/2} ${y+h/2})"><circle cx="${x+w/2}" cy="${y+h/2}" r="30" fill="#d62b2b"/><rect x="${x+w/2-9}" y="${y+h/2-40}" width="18" height="80" rx="6" fill="#b51f1f"/></g>
  <text x="${x+w/2}" y="${y+16}" class="cn" style="font-size:12px">${c.name}</text><text x="${x+w/2+58}" y="${y+h/2-8}" class="bt" fill="#333">${on?'ON':'OFF'}</text><text x="${x+w/2+58}" y="${y+h/2+10}" class="bt" fill="#333" style="font-size:10px">DC 1000V</text>`;}
 else if(c.type==='inv')g+=invBody(c);
 else if(c.type==='bat')g+=batBody(c);
 else if(c.type==='bdc'||c.type==='bac'){const on=st.sw[c.id];g+=`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="#fafafa" stroke="#b9bfc4" stroke-width="2"/>
  <g class="sw" data-sw="${c.id}"><rect x="${x+w/2-16}" y="${y+28}" width="32" height="60" rx="5" fill="#e6e9eb" stroke="#9aa5ab"/><rect x="${x+w/2-12}" y="${y+(on?32:58)}" width="24" height="26" rx="4" fill="${on?'#25b36e':'#e5533c'}"/></g>
  <text x="${x+w/2}" y="${y+22}" class="bt" fill="#33414a" style="font-size:11px">${c.rating}</text><text x="${x+w/2}" y="${y+104}" class="bt" fill="#33414a" style="font-size:11px">${on?'ON':'OFF'}</text><text x="${x+w/2}" y="${y+124}" class="cn" style="font-size:12px">${c.name}</text>`;}
 else if(c.type==='sup'){const r=R_();const live=typeof gridSched==='function'&&r.min!=null&&gridSched(r.min/60);g+=`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="#e9ecef" stroke="#b9bfc4" stroke-width="2"/><rect x="${x+18}" y="${y+22}" width="${w-36}" height="40" rx="4" fill="#cfe3d4"/><text x="${x+w/2}" y="${y+48}" class="bt" fill="#1f2a30" style="font-size:15px">00427 kWh</text>
  <text x="${x+w/2}" y="${y+86}" class="bt" fill="#33414a" style="font-size:12px">230V · 50Hz</text><text x="${x+w/2}" y="${y+104}" class="bt" fill="${live?'#25b36e':'#e5533c'}" style="font-size:12px">${live?'● في كهربا':'● مقطوعة'}</text><text x="${x+w/2}" y="${y-8}" class="cn">${c.name}</text>`;}
 else if(c.type==='house'){const r=R_();const lit=r.houseOn;g+=`<path d="M${x} ${y+60}L${x+w/2} ${y+12}L${x+w} ${y+60}V${y+h}H${x}Z" fill="#f0e6d6" stroke="#b9a88a" stroke-width="2"/>
  <circle cx="${x+w/2}" cy="${y+108}" r="22" fill="${lit?'#ffd84d':'#cfd4d6'}" ${lit?'style="filter:drop-shadow(0 0 14px #ffd84d)"':''}/><rect x="${x+w/2-8}" y="${y+128}" width="16" height="10" fill="#8a96a0"/>
  <text x="${x+w/2}" y="${y+164}" class="cn" style="font-size:12px">${lit?Math.round(r.load)+'W':'عتمة'}</text><text x="${x+w/2}" y="${y+190}" class="cn" style="font-size:13px">تابلو البيت</text>`;}
 else if(c.type==='eb'){g+=`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="#c58b2a" stroke="#8a5d14"/><line x1="${x+w/2}" y1="${y+h}" x2="${x+w/2}" y2="${y+h+16}" stroke="#2e9d3a" stroke-width="4"/>
  <path d="M${x+w/2-22} ${y+h+18}h44M${x+w/2-14} ${y+h+24}h28" stroke="#33414a" stroke-width="3"/><text x="${x+w/2-70}" y="${y+h+22}" class="cn" style="font-size:13px">${c.name}</text>`;}
 return g;}
function compSVG(c){const s=c.s||1;let g=`<g data-c="${c.id}" transform="matrix(${s} 0 0 ${s} ${(c.x*(1-s)).toFixed(2)} ${(c.y*(1-s)).toFixed(2)})">${body(c)}`;
 if(editMode){const on=selC===c.id;g+=`<rect x="${c.x-6}" y="${c.y-6}" width="${c.w+12}" height="${c.h+(c.type==='inv'||c.type==='panel'?34:12)}" rx="10" fill="rgba(34,199,155,${on?0.12:0.04})" stroke="${on?'#ffb400':'#22c79b'}" stroke-width="${on?3/s:2/s}" stroke-dasharray="${on?'':'7 6'}"/>`;}
 g+='</g>';
 if(editMode&&selC===c.id){const X=c.x+(c.w+6)*s,Y=c.y+(c.h+(c.type==='inv'||c.type==='panel'?28:6))*s;g+=`<g class="rz"><circle cx="${X}" cy="${Y}" r="22" fill="transparent"/><rect x="${X-11}" y="${Y-11}" width="22" height="22" rx="5" fill="#ffb400" stroke="#fff" stroke-width="3"/><path d="M${X-5} ${Y+5}L${X+5} ${Y-5}M${X+1} ${Y-5}h4v4M${X-5} ${Y+1}v4h4" stroke="#fff" stroke-width="2" fill="none"/></g>`;}
 for(const k in c.t){const key=keyOf(c.id,k);const t=term(key);const sl=sel===key;
  g+=`<g class="tm${sl?' on':''}" data-t="${key}"><circle cx="${t.x}" cy="${t.y}" r="${(15*KZ).toFixed(1)}" fill="transparent"/><circle cx="${t.x}" cy="${t.y}" r="${sl?9:7}" fill="${KCOL[t.k]}" stroke="${sl?'#ffb400':'#fff'}" stroke-width="${sl?4:2}"/></g>`;
  if(c.type!=='inv')g+=`<text x="${t.x}" y="${t.y+(t.d>0?24:-14)}" class="tl2">${t.l}</text>`;}
 return g;}
const brd=()=>document.getElementById('board');
function vb(){const b=brd();const ar=(b.clientHeight||600)/(b.clientWidth||1000);return [cam.x,cam.y,cam.w,cam.w*ar];}
function applyView(){const s=document.getElementById('bsvg');if(s)s.setAttribute('viewBox',vb().map(v=>v.toFixed(1)).join(' '));}
function render(){const b=brd();if(!b)return;const {de}=compute();KZ=Math.min(2.4,Math.max(1,pxToW()));
 let g=`<svg id="bsvg" viewBox="${vb().join(' ')}" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" class="${editMode?'mv':''}">
 <defs><pattern id="g1" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" stroke="#d3dbdf" stroke-width="0.6"/></pattern><pattern id="g5" width="100" height="100" patternUnits="userSpaceOnUse"><rect width="100" height="100" fill="url(#g1)"/><path d="M100 0H0V100" fill="none" stroke="#bfcad0" stroke-width="1.2"/></pattern></defs>
 <rect x="-5000" y="-5000" width="10000" height="10000" fill="#e8edf0"/><rect x="-5000" y="-5000" width="10000" height="10000" fill="url(#g5)"/>`;
 for(const id in C)g+=compSVG(C[id]);
 st.wires.forEach((w,i)=>{const A=term(w.a);const col=KCOL[A.k];const d=wirePath(w);const s=i===selW;
  g+=`<path d="${d}" transform="translate(1.5 2.5)" stroke="rgba(0,0,0,.22)" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  if(s)g+=`<path d="${d}" stroke="#ffb400" stroke-width="13" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  g+=`<path d="${d}" stroke="${col}" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  if(A.k==='PE')g+=`<path d="${d}" stroke="#f2d03b" stroke-width="7" stroke-dasharray="10 10" fill="none" stroke-linejoin="round"/>`;
  g+=`<path d="${d}" transform="translate(-1.2 -1.2)" stroke="${A.k==='PE'?'#fff6c4':HI[A.k]}" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity=".75"/>`;
  g+=sleeve(w,0)+sleeve(w,1);
  if(!editMode)g+=`<path class="wh" data-w="${i}" d="${d}" stroke="transparent" stroke-width="18" fill="none"/>`;});
 for(const id in C){const c=C[id];for(const k in c.t){const key=keyOf(id,k);if(sel===key||st.wires.some(w=>w.a===key||w.b===key)){const t=term(key);g+=`<circle cx="${t.x}" cy="${t.y}" r="4" fill="#fff" pointer-events="none"/>`;}}}
 if(selW>=0&&st.wires[selW]&&!editMode){const w=st.wires[selW];
  const P=corners(w);const K=KZ;
  for(let j=0;j<P.length-1;j++){const a=P[j],b=P[j+1];const len=Math.hypot(b[0]-a[0],b[1]-a[1]);if(len<22*K)continue;const mx=(a[0]+b[0])/2,my=(a[1]+b[1])/2;const hz=Math.abs(a[1]-b[1])<0.5;
   const L=13*K,T=5*K;g+=`<g class="hd" data-hw="${selW}" data-seg="${j}"><rect x="${mx-(hz?24:18)*K}" y="${my-(hz?18:24)*K}" width="${(hz?48:36)*K}" height="${(hz?36:48)*K}" fill="transparent"/><rect x="${mx-(hz?L:T)}" y="${my-(hz?T:L)}" width="${2*(hz?L:T)}" height="${2*(hz?T:L)}" rx="${3*K}" fill="#fff" stroke="#ffb400" stroke-width="${2.5*K}"/></g>`;}
  // كرت صغير حدّ الشريط: احذف / رجّعو
  let best=1,bl=-1;for(let j=0;j<P.length-1;j++){const l=Math.hypot(P[j+1][0]-P[j][0],P[j+1][1]-P[j][1]);if(l>bl){bl=l;best=j;}}
  const cx=(P[best][0]+P[best+1][0])/2,cy=(P[best][1]+P[best+1][1])/2-42*K;
  g+=chip(cx,cy,[['wdel','🗑 احذف'],...(w.c?[['wstraight','↺ رجّعو']]:[])],K);}
 if(editMode&&selC&&C[selC]){const c=C[selC],s=c.s||1;g+=chip(c.x+c.w*s/2,c.y-34*KZ,[['wsmall','－'],['wbig','＋'],['wdelc','🗑 شيلها']],KZ);}
 if(st.dmg&&C.inv){const c=C.inv,s=c.s||1;g+=chip(c.x+c.w*s/2,c.y+c.h*s*0.45,[['wnew','🔧 ركّب إنفرتر جديد']],KZ*1.2);}
 g+='</svg>';b.innerHTML=g;
 const en=(id,v)=>{const e=document.getElementById(id);if(e)e.disabled=!v;};
 en('wdel',selW>=0);en('wstraight',selW>=0&&st.wires[selW]&&!!st.wires[selW].c);en('wbig',!!selC);en('wsmall',!!selC);en('wdelc',!!selC);
 const mv=document.getElementById('wmove');if(mv){mv.classList.toggle('on',editMode);mv.textContent=editMode?'✓ خلصت تعديل':'✋ عدّل القطع';}
 const ed=document.getElementById('wedit');if(ed)ed.hidden=!editMode;
 libUI();checklist(de);}
let liveSig='',busy=false,drag=null,KZ=1;
function chip(cx,cy,acts,K){const h=30*K,pad=8*K,fs=13*K;const ws=acts.map(a=>Math.max(30*K,(a[1].length*7.2+16)*K));const tot=ws.reduce((x,y)=>x+y,0)+(acts.length-1)*4*K;let x=cx-tot/2;
 let g=`<g class="chip">`;acts.forEach((a,i)=>{g+=`<g data-act="${a[0]}"><rect x="${x}" y="${cy-h/2}" width="${ws[i]}" height="${h}" rx="${h/2}" fill="#10221d" stroke="#22c79b" stroke-width="${1.5*K}"/><text x="${x+ws[i]/2}" y="${cy+fs*0.36}" text-anchor="middle" font-size="${fs}" font-weight="700" fill="#e9fff7" style="font-family:'Readex Pro',sans-serif">${a[1]}</text></g>`;x+=ws[i]+4*K;});
 return g+'</g>';}
function updateLive(){const b=document.getElementById('bsvg');if(!b||busy||drag)return;const r=R_();
 const sig=[r.houseOn,WS&&WS.powered,Math.round((r.soc||0)*100),r.faults?[...r.faults].join():'',Math.round((r.load||0)/50),Math.round((r.pv||0)/100),r.gridPresent,typeof gridSched==='function'&&r.min!=null?gridSched(r.min/60):0].join('|');
 if(sig!==liveSig){liveSig=sig;render();}}

/* ---------- المكتبة والمشاريع الجاهزة ---------- */
const ICON={panel:'<rect x="4" y="3" width="38" height="26" rx="2" fill="#163763" stroke="#9fb3c8"/><path d="M4 12h38M4 20h38M17 3v26M30 3v26" stroke="#4a6a93"/>',
 iso:'<rect x="6" y="3" width="34" height="28" rx="4" fill="#f2f2ee" stroke="#b9bfb5"/><rect x="9" y="7" width="28" height="20" rx="3" fill="#ffd21f"/><circle cx="23" cy="17" r="7" fill="#d62b2b"/><rect x="21" y="8" width="4" height="18" rx="2" fill="#b51f1f"/>',
 bdc:'<rect x="13" y="2" width="20" height="30" rx="3" fill="#fafafa" stroke="#9aa5ab"/><rect x="18" y="8" width="10" height="12" rx="2" fill="#25b36e"/><text x="23" y="29" font-size="6" text-anchor="middle" fill="#33414a" font-weight="700">DC</text>',
 bac:'<rect x="13" y="2" width="20" height="30" rx="3" fill="#fafafa" stroke="#9aa5ab"/><rect x="18" y="8" width="10" height="12" rx="2" fill="#25b36e"/><text x="23" y="29" font-size="6" text-anchor="middle" fill="#33414a" font-weight="700">AC</text>',
 inv:'<rect x="9" y="1" width="28" height="32" rx="5" fill="#f7f8f8" stroke="#c4cacd"/><rect x="16" y="6" width="14" height="9" rx="1" fill="#0d1419"/><path d="M9 22Q23 26 37 22V29Q37 33 33 33H13Q9 33 9 29Z" fill="#d7dcdf"/>',
 bat:'<rect x="3" y="9" width="40" height="18" rx="3" fill="#3a4046" stroke="#1f2428"/><rect x="7" y="13" width="14" height="3" fill="#25d366"/><circle cx="30" cy="18" r="3" fill="#c62828"/><circle cx="37" cy="18" r="3" fill="#202326"/>',
 sup:'<rect x="9" y="2" width="28" height="30" rx="3" fill="#e9ecef" stroke="#b9bfc4"/><rect x="13" y="6" width="20" height="9" rx="1" fill="#cfe3d4"/>',
 house:'<path d="M6 16L23 3L40 16V32H6Z" fill="#f0e6d6" stroke="#b9a88a"/><circle cx="23" cy="20" r="5" fill="#ffd84d"/>',
 eb:'<rect x="3" y="12" width="40" height="7" rx="2" fill="#c58b2a"/><path d="M23 19v6M15 26h16M18 29h10M21 32h4" stroke="#2e9d3a" stroke-width="2"/>'};
const LIBG=[['الطاقة الشمسية',[['panel','لوح 550W'],['iso','عازل DC']]],['الأجهزة',[['inv','الإنفرتر'],['bat','البطارية']]],['الحماية والأرضي',[['bdc','قاطع DC'],['bac','قاطع AC'],['eb','بار أرض']]],['الدولة والبيت',[['sup','عدّاد الدولة'],['house','تابلو البيت']]]];
function libUI(){const L=document.getElementById('wlib');if(!L)return;
 L.className='tlib';L.innerHTML=LIBG.map(([g,items])=>`<div class="tgrp"><h5>${g}</h5><div class="tbtns">${items.map(([t,l])=>`<button type="button" class="lcard" data-add="${t}" ${SINGLE[t]&&C[t]?'disabled title="موجود عاللوحة"':''}><svg viewBox="0 0 46 34">${ICON[t]}</svg><span>${l}${SINGLE[t]&&C[t]?' ✓':''}</span></button>`).join('')}</div></div>`).join('');
 const Rd=document.getElementById('wready');if(Rd)Rd.innerHTML=READY().map(([id,l])=>`<button type="button" data-ready="${id}">${l}</button>`).join('');
 document.querySelectorAll('.qbar [data-q="edit"]').forEach(b=>b.classList.toggle('on',editMode));}
function addPart(type){if(SINGLE[type]&&C[type])return;hist.push(snapH());const v=vb();
 let id=type;if(!SINGLE[type]){let i=1;while(C[PFX[type]+i])i++;id=PFX[type]+i;}
 const tmp=mk({type,id,x:0,y:0});const x=Math.round((v[0]+v[2]/2-tmp.w/2)/5)*5,y=Math.round((v[1]+v[3]/2-tmp.h/2)/5)*5;
 st.comps.push({id,type,x,y,s:1});st.empty=0;rebuildC();editMode=true;selC=id;sel=null;selW=-1;afterChange();flash(`زدت ${C[id].name}. اسحبها لمحلها، وكبّرها أو صغّرها من المربّع الأصفر.`,'');}
function delPart(id){if(!C[id])return;hist.push(snapH());const nm=C[id].name;st.comps=st.comps.filter(o=>o.id!==id);st.wires=st.wires.filter(w=>!w.a.startsWith(id+'.')&&!w.b.startsWith(id+'.'));delete st.sw[id];selC=null;rebuildC();afterChange();flash(`شلت ${nm} والشرايط تبعها.`,'');}
function scalePart(id,f){const c=C[id];if(!c)return;c.s=Math.max(0.4,Math.min(3,Math.round((c.s||1)*f*100)/100));syncComp(c);saveW();render();}

/* ---------- التقييم ---------- */
function checklist(de){const L=[];const add=(lvl,t)=>L.push({lvl,t});const I=PI(),B=PB();
 const need={inv:'الإنفرتر',bat:'البطارية',house:'تابلو البيت'};const miss=Object.keys(need).filter(k=>!C[k]);if(miss.length)add('todo','زيد من المكتبة: '+miss.map(k=>need[k]).join('، ')+'.');
 if(!byType('panel').length&&C.inv)add('warn','ما في ألواح: الإنفرتر بيشتغل عالبطارية والدولة بس.');
 de.pv.forEach((p,k)=>{if(!C.inv||!C.inv.t['pv'+(k+1)+'p'])return;const nm=I.nMppt<2?'PV':'PV'+(k+1);
  if(p.short)add('bad',`${nm}: الموجب والسالب لازقين ببعض (Short).`);
  else if(p.rev)add('bad',`${nm}: ${p.n} ألواح بس القطبية معكوسة. موجب الألواح لازم يروح عالـ${nm}+.`);
  else if(p.n){const v=pvV(p.n);if(v.voc>VMAX())add('bad',`${nm}: ${p.n} ألواح، Voc بالبرد ≈ ${v.voc.toFixed(0)}V فوق ${VMAX()}V!`);else if(v.vmp<VMIN())add('warn',`${nm}: ${p.n} ألواح، Vmp بالحرّ ≈ ${v.vmp.toFixed(0)}V تحت مجال الـMPPT (${VMIN()}V). زيد ألواح عالتسلسل.`);else add('ok',`${nm}: ${p.n} ألواح عالتسلسل، Voc بالبرد ≈ ${v.voc.toFixed(0)}V ✓`);
   if(p.par)add('warn',`${nm}: في ألواح على نفس النقطة (توازي) بلا تجميع.`);}
  else if(p.open)add('warn',`${nm}: الـString مفتوح: في شريط ناقص.`);});
 const P=byType('panel');if(P.length){const used={};de.pv.forEach(p=>Object.assign(used,p.used||{}));const un=P.length-Object.keys(used).length;if(un>0&&un<P.length)add('warn',`في ${un} ألواح مش موصولين.`);
  if(!de.pv.some(p=>p.n||p.rev||p.short||p.open))add('todo','وصّل الألواح عالتسلسل: سالب كل لوح على موجب يلّي بعدو، والطرفين عالإنفرتر.');}
 if(de.pv.some(p=>p.n&&!p.rev)){const x=analyze(offTypes('iso','bdc'));if(x.pv.some(p=>p.n&&!p.rev))add(I.dcsw?'ok':'warn',I.dcsw?'الألواح عالإنفرتر بلا عازل برّاني: الـDC SW جوّا الإنفرتر بيفصلها ✓':'الألواح عالإنفرتر بلا عازل DC: بتشتغل، بس ما فيك تفصلها إذا صار شي. المستحسن عازل بالنص.');else add('ok','عازل الـDC بين الألواح والإنفرتر ✓');}
 if(C.bat&&C.inv){if(de.batShort)add('bad','البطارية: الموجب والسالب لازقين (Short)!');
  else if(de.batt==='ok'){const x=analyze(offTypes('bdc'));if(x.batt==='ok')add('warn',`البطارية واصلة بلا قاطع DC: بتشتغل، بس أي Short بالكابل ما في شي يفصلو غير الـBMS. المقترح ${CAT.brkBat(I)}.`);else add('ok','البطارية عالـBAT+ والـBAT− مع قاطع ✓');}
  else if(de.batt==='rev')add('bad','البطارية معكوسة: موجبها على BAT−!');
  else if(de.batt==='half')add('warn','البطارية واصلة من طرف واحد بس.');
  else add('todo','وصّل البطارية عالـBAT+ والـBAT− (مباشرة أو مع قاطع).');
  const cp=CAT.compat(I,B);
  if(!C.bat.t.can)add('ok',`البطارية ما فيها منفذ اتصال. اضبط الإنفرتر عالفولت: ${cp.set[0]}.`);
  else add(de.comm?'ok':'todo',de.comm?`كابل الاتصال (${cp.port}) ✓ الإعداد: ${cp.set.slice(0,2).join('، ')}.`:`وصّل كابل الاتصال (${cp.port}) من البطارية لمنفذ BMS بالإنفرتر.`);}
 if(de.acShort)add('bad','الدولة: الفاز والنوترال لازقين (Short)!');
 if(de.gridToLoad)add('bad','الدولة واصلة على مخرج البيت! الدولة بتفوت عالـ'+(I.type==='offgrid'?'AC IN':'GRID')+' بس.');
 if(C.sup&&C.inv){if(de.grid==='ok'){const x=analyze(offTypes('bac'));if(x.grid==='ok')add('warn','الدولة واصلة بلا قاطع: بتشتغل، بس أي Short بيضرب فيوز العدّاد.');else add('ok','الدولة عالمدخل مع قاطع ✓');}
  else if(de.grid==='swap')add('warn','الدولة واصلة بس الفاز والنوترال مقلوبين.');
  else if(de.grid==='half')add('warn','الدولة واصلة من طرف واحد بس.');
  else if(!de.gridToLoad)add('todo',`وصّل الدولة عالـ${I.type==='offgrid'?'AC IN':'GRID'} L وN.`);}
 if(C.house&&C.inv){if(de.house==='inv'){const x=analyze(offTypes('bac'));if(x.house==='inv')add('warn','البيت واصل عالمخرج بلا قاطع.');else add('ok','البيت على مخرج الإنفرتر مع قاطع ✓');}
  else if(de.house==='invswap')add('warn','البيت عالمخرج بس الفاز والنوترال مقلوبين.');
  else if(de.house==='grid')add('warn','البيت واصل عجهة الدولة مش عمخرج الإنفرتر: بالانقطاع رح يعتم.');
  else if(de.house==='half')add('warn','البيت واصل من طرف واحد بس.');
  else add('todo',`وصّل البيت على ${I.type==='offgrid'?'AC OUT':'LOAD'} L وN.`);}
 if(C.inv){if(!byType('eb').length)add('todo','زيد بار أرض من المكتبة ووصّل عليه PE.');else{add(de.invPE?'ok':'todo',de.invPE?'أرضي الإنفرتر (PE) عالبار ✓':'وصّل PE تبع الإنفرتر على بار الأرض.');
  if(de.invPE){if(C.house&&!de.housePE)add('warn','أرضي تابلو البيت مش واصل عالبار.');if(C.sup&&!de.supPE)add('warn','أرضي الدولة مش واصل عالبار.');}}}
 const mx=new Set(de.mix);if(mx.has('dcac'))add('bad','في شريط واصل DC بـAC! هيدا بيضرب الإنفرتر.');if(mx.has('can'))add('bad','كابل الاتصال واصل على طرف قوّة!');if(mx.has('pe'))add('bad','الأرض واصلة على فاز أو نوترال أو DC!');if(mx.has('ln')&&!de.acShort)add('bad','في فاز ونوترال على نفس النقطة (Short).');
 const ic={ok:'✓',warn:'⚠',bad:'✗',todo:'○'};
 const nb=L.filter(x=>x.lvl==='bad').length,nt=L.filter(x=>x.lvl==='todo').length,nw=L.filter(x=>x.lvl==='warn').length;
 const head=nb?`<div class="wsum bad">في ${nb} غلطات خطيرة. صلّحهن قبل ما تشغّل.</div>`:(nt?`<div class="wsum">ضايل ${nt} خطوات.</div>`:(nw?`<div class="wsum warn">التوصيل بيشتغل، بس في ${nw} ملاحظات.</div>`:`<div class="wsum ok">التوصيل كامل وصحيح ✓ هلّق شغّل بالترتيب.</div>`));
 document.getElementById('wcheck').innerHTML=head+L.map(x=>`<div class="wc ${x.lvl}"><b>${ic[x.lvl]}</b><span>${x.t}</span></div>`).join('');}

/* ---------- الكاميرا: زوم ونقل متل الأوتوكاد ---------- */
function bbox(){const cs=Object.values(C);if(!cs.length)return [0,0,1100,900];let a=1e9,b=1e9,c=-1e9,d=-1e9;
 for(const o of cs){const s=o.s||1;a=Math.min(a,o.x);b=Math.min(b,o.y-20);c=Math.max(c,o.x+o.w*s);d=Math.max(d,o.y+(o.h+40)*s);}return [a,b,c,d];}
let camAnim=0;function animCam(t,ms){cancelAnimationFrame(camAnim);const f={...cam},t0=performance.now();const ease=x=>1-Math.pow(1-x,3);
 const st_=now=>{const k=Math.min(1,(now-t0)/ms),e=ease(k);cam={x:f.x+(t.x-f.x)*e,y:f.y+(t.y-f.y)*e,w:f.w+(t.w-f.w)*e};applyView();if(k<1)camAnim=requestAnimationFrame(st_);else render();};camAnim=requestAnimationFrame(st_);}
function fit(anim){const b=brd();const [a,bb,c,d]=bbox();const m=30;const ar=(b.clientHeight||600)/(b.clientWidth||1000);
 const W=Math.max(c-a+2*m,(d-bb+2*m)/ar);const t={x:(a+c)/2-W/2,y:(bb+d)/2-W*ar/2,w:W};if(anim===true&&document.getElementById('bsvg'))animCam(t,240);else{cam=t;render();}}
function zoomAt(f,wx,wy){const nw=Math.max(120,Math.min(6000,cam.w/f));f=cam.w/nw;cam.x=wx-(wx-cam.x)/f;cam.y=wy-(wy-cam.y)/f;cam.w=nw;applyView();}
function zoomBtn(f){const v=vb();const wx=v[0]+v[2]/2,wy=v[1]+v[3]/2;const nw=Math.max(120,Math.min(6000,cam.w/f));const k=cam.w/nw;animCam({x:wx-(wx-cam.x)/k,y:wy-(wy-cam.y)/k,w:nw},200);}

/* ---------- السحب واللمس ---------- */
let justDragged=0,raf=0;const ptrs=new Map();let pinch=null,pan=null;
function svgPt(e){const s=document.getElementById('bsvg');const p=s.createSVGPoint();p.x=e.clientX;p.y=e.clientY;const q=p.matrixTransform(s.getScreenCTM().inverse());return [q.x,q.y];}
const snap=(v,g)=>Math.round(v/g)*g;
const pxToW=()=>cam.w/(brd().clientWidth||1000);
const cap=e=>{try{brd().setPointerCapture(e.pointerId);}catch(_){}};
function onDown(e){const b=brd();ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});
 if(ptrs.size===2){drag=null;pan=null;const [p1,p2]=[...ptrs.values()];pinch={d:Math.hypot(p1.x-p2.x,p1.y-p2.y),mx:(p1.x+p2.x)/2,my:(p1.y+p2.y)/2};busy=true;return;}
 if(ptrs.size>2)return;
 const hd=e.target.closest('.hd');
 if(hd){e.preventDefault();const wi=+hd.dataset.hw,w=st.wires[wi];hist.push(snapH());
  if(!w.c)w.c=defC(w).slice();const P=corners(w);const p0=svgPt(e);
  drag={t:'pt',wi,seg:hd.dataset.seg!=null?+hd.dataset.seg:null,cor:hd.dataset.cor!=null?+hd.dataset.cor:null,P,p0,c0:w.c.slice(),moved:false,sx:e.clientX,sy:e.clientY};busy=true;return;}
 if(e.target.closest('[data-act]'))return;
 const tt=e.target.closest('[data-t]');if(tt&&!editMode){drag={t:'link',from:tt.dataset.t,moved:false,sx:e.clientX,sy:e.clientY};busy=true;return;}
 if(editMode&&e.target.closest('.rz')&&selC){e.preventDefault();hist.push(snapH());drag={t:'rz',id:selC,moved:false};busy=true;return;}
 if(editMode){const g=e.target.closest('[data-c]');if(g&&!e.target.closest('[data-sw]')){e.preventDefault();const c=C[g.dataset.c],p=svgPt(e);hist.push(snapH());drag={t:'c',id:c.id,ox:p[0]-c.x,oy:p[1]-c.y,moved:false,sx:e.clientX,sy:e.clientY};busy=true;return;}}
 if(!e.target.closest('[data-t],[data-sw],[data-w],[data-act]')){pan={sx:e.clientX,sy:e.clientY,cx:cam.x,cy:cam.y,moved:false};busy=true;}}
function onMove(e){if(!ptrs.has(e.pointerId))return;ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});
 if(pinch&&ptrs.size>=2){e.preventDefault();cap(e);const [p1,p2]=[...ptrs.values()];const d=Math.hypot(p1.x-p2.x,p1.y-p2.y),mx=(p1.x+p2.x)/2,my=(p1.y+p2.y)/2;
  const k=pxToW();cam.x-=(mx-pinch.mx)*k;cam.y-=(my-pinch.my)*k;const wp=svgPt({clientX:mx,clientY:my});zoomAt(d/pinch.d,wp[0],wp[1]);pinch={d,mx,my};justDragged=Date.now();return;}
 if(pan){const dx=e.clientX-pan.sx,dy=e.clientY-pan.sy;if(!pan.moved&&Math.hypot(dx,dy)<5)return;if(!pan.moved)cap(e);pan.moved=true;const k=pxToW();cam.x=pan.cx-dx*k;cam.y=pan.cy-dy*k;applyView();return;}
 if(!drag)return;e.preventDefault();const p=svgPt(e);
 if(drag.t==='link'){if(!drag.moved&&Math.hypot(e.clientX-drag.sx,e.clientY-drag.sy)<7)return;if(!drag.moved){cap(e);sel=null;}drag.moved=true;drag.to=nearT(p,drag.from);rubber(drag.from,p,drag.to);return;}
 if((drag.t==='c'||drag.t==='pt')&&!drag.moved&&Math.hypot(e.clientX-drag.sx,e.clientY-drag.sy)<4)return;if(!drag.moved)cap(e);drag.moved=true;
 if(drag.t==='pt'){const w=st.wires[drag.wi];const P=drag.P;w.c=drag.c0.slice();
  if(drag.seg!=null){let j=drag.seg;
   if(segParam(P,j)<0){// قطعة عالطرف: منزيد زاوية تلقائياً ومنسحبها
    const end=j===0;const m=Math.round(((P[j][1]+P[j+1][1])/2)/5)*5;const xx=P[j][0];
    let k;if(end){w.c.unshift(m,xx);k=1;}else{w.c.push(xx,m);k=w.c.length-2;}
    w.c[k]=snap(p[0],5);}
   else{const k=segParam(P,j);w.c[k]=snap(k%2===0?p[1]:p[0],5);}}
  else if(drag.cor!=null){const j=drag.cor;const kb=segParam(P,j-1),ka=segParam(P,j);
   for(const k of [kb,ka])if(k>=0)w.c[k]=snap(k%2===0?p[1]:p[0],5);
   if(kb<0&&ka>=0&&ka%2===0){/* زاوية حدّ الطرف الأول: الطرف ثابت */}}
  drag.moved=true;}
 else if(drag.t==='rz'){const c=C[drag.id];const s=Math.max(0.4,Math.min(3,((p[0]-c.x)/(c.w+6)+(p[1]-c.y)/(c.h+(c.type==='inv'||c.type==='panel'?28:6)))/2));c.s=Math.round(s*100)/100;syncComp(c);}
 else{const c=C[drag.id];c.x=snap(p[0]-drag.ox,5);c.y=snap(p[1]-drag.oy,5);syncComp(c);}
 if(!raf)raf=requestAnimationFrame(()=>{raf=0;render();});}
function onUp(e){ptrs.delete(e.pointerId);if(ptrs.size<2&&pinch){pinch=null;if(!ptrs.size)busy=false;return;}
 if(pan){if(pan.moved)justDragged=Date.now();pan=null;busy=false;return;}
 if(!drag)return;const d=drag;drag=null;busy=false;
 if(d.t==='link'){if(!d.moved)return;justDragged=Date.now();const r=document.getElementById('rub');if(r)r.remove();
  if(d.to)connect(d.from,d.to);else{flash('فلتّ الشريط بمحل فاضي. اسحب لحدّ ما توصل عالطرف التاني.','w');render();}return;}
 if(d.t==='pt'){justDragged=Date.now();const w=st.wires[d.wi];
  if(!d.moved&&d.seg!=null){// كبسة عقطعة بلا سحب: زيد زاويتين بنصّها
   const P=d.P,j=d.seg,k=segParam(P,j);const a=P[j],b=P[j+1];const hz=Math.abs(a[1]-b[1])<0.5;const m=snap(hz?(a[0]+b[0])/2:(a[1]+b[1])/2,5);
   if(k>=0)w.c.splice(k+1,0,m,w.c[k]);else if(j===0)w.c.unshift(m,a[0]);else w.c.push(a[0],m);
   flash('زدت زاويتين ✓ اسحب القطعة الجديدة لتطلّعها أو تنزّلها.','');}
  else if(!d.moved){hist.pop();}
  else simplify(w);
  saveW();render();return;}
 if(d.t==='c'&&!d.moved){hist.pop();selC=d.id;render();return;}
 justDragged=Date.now();if(!d.moved)hist.pop();if(d.t==='c')selC=d.id;saveW();render();}

/* ---------- التفاعل ---------- */
function onBoard(e){const act=e.target.closest('[data-act]');if(act){const b=document.getElementById(act.dataset.act);if(b){b.disabled=false;b.click();}return;}
 if(Date.now()-justDragged<300)return;if(e.target.closest('.hd,.rz'))return;
 const sw=e.target.closest('[data-sw]');if(sw){onSwitch(sw.dataset.sw);return;}
 if(editMode){if(!e.target.closest('[data-c]')){selC=null;render();}return;}
 const t=e.target.closest('[data-t]');
 if(t){const k=t.dataset.t;selW=-1;
  if(!sel){sel=k;tip(k);}
  else if(sel===k){sel=null;}
  else{connect(sel,k);return;}
  render();return;}
 const w=e.target.closest('[data-w]');if(w){selW=+w.dataset.w;sel=null;flash('اسحب المستطيلات البيض لتحرّك الشريط. كبسة عليها بتزيد زاوية.','');render();return;}
 if(sel||selW>=0){sel=null;selW=-1;render();}}
function connect(a,b){const exists=st.wires.some(w=>(w.a===a&&w.b===b)||(w.a===b&&w.b===a));sel=null;
 if(!exists&&a!==b){hist.push(snapH());const A=term(a),B=term(b);st.wires.push({a,b});selW=-1;
  if(A.k!==B.k)flash(`⚠ وصلت ${KNAME[A.k]} (${A.l}) على ${KNAME[B.k]} (${B.l}). متأكّد؟`,'w');else flash(`وصلت ${A.l} ← ${B.l} ✓`,'');}
 afterChange();}
function nearT(p,except){let best=null,bd=Math.max(26,22*pxToW());for(const id in C)for(const k in C[id].t){const key=keyOf(id,k);if(key===except)continue;const t=term(key);const d=Math.hypot(t.x-p[0],t.y-p[1]);if(d<bd){bd=d;best=key;}}return best;}
function rubber(from,p,to){const s=document.getElementById('bsvg');if(!s)return;let r=document.getElementById('rub');
 if(!r){r=document.createElementNS('http://www.w3.org/2000/svg','g');r.id='rub';r.setAttribute('pointer-events','none');s.appendChild(r);}
 const A=term(from),col=KCOL[A.k];const T=to?term(to):null;const ex=T?T.x:p[0],ey=T?T.y:p[1];const K=KZ;
 r.innerHTML=`<path d="M${A.x} ${A.y}L${A.x} ${(A.y+ey)/2}L${ex} ${(A.y+ey)/2}L${ex} ${ey}" stroke="${col}" stroke-width="${5*K}" fill="none" stroke-dasharray="${10*K} ${6*K}" opacity=".85"/>`+(T?`<circle cx="${T.x}" cy="${T.y}" r="${14*K}" fill="none" stroke="#ffb400" stroke-width="${4*K}"/>`:`<circle cx="${ex}" cy="${ey}" r="${7*K}" fill="${col}"/>`);}
function tip(k){const [c,t]=k.split('.');const T=C[c].t[t];flash(`${T.l}: هلّق اكبس عالطرف التاني (أو اسحب إصبعك لعندو).`,'');}
function setZoom(){fit();}

window.WIRE={render,setZoom,compute,updateLive,applyView,
 // للمشاريع: قراءة الحالة، وتحميل لوحة بداية (بلا شرايط أو مع أعطال)
 peek(){return {st,C,analyze,allOn,pvV,PI,PB,PN,byType,offOne:id=>{const a=allOn();a[id]=0;return a;}};},
 loadBoard(base,fn){const r=readyProject(base);if(fn)fn(r);st.comps=r.comps;st.wires=r.wires;st.sw=freshSw();st.dmg=0;st.proj=projKey();st.empty=0;rebuildC();hist=[];sel=null;selW=-1;selC=null;editMode=false;saveW();compute();fit();render();},
 rebuild(){loadReady('home');editMode=false;compute();fit();},
 init(){const b=brd();b.addEventListener('click',onBoard);
  b.addEventListener('pointerdown',onDown);b.addEventListener('pointermove',onMove);b.addEventListener('pointerup',onUp);b.addEventListener('pointercancel',onUp);
  b.addEventListener('wheel',e=>{e.preventDefault();const p=svgPt(e);zoomAt(Math.exp(-e.deltaY*0.0015),p[0],p[1]);},{passive:false});
  const on=(id,f)=>{const e=document.getElementById(id);if(e)e.onclick=f;};
  on('wzin',()=>zoomBtn(1.4));on('wzout',()=>zoomBtn(1/1.4));on('wfit',()=>fit(true));
  on('wundo',()=>{if(!hist.length)return;restore(hist.pop());selW=-1;selC=null;afterChange();});
  on('wdel',()=>{if(selW<0)return;hist.push(snapH());st.wires.splice(selW,1);selW=-1;afterChange();});
  on('wstraight',()=>{if(selW<0)return;hist.push(snapH());delete st.wires[selW].c;saveW();render();});
  on('wmove',()=>{editMode=!editMode;sel=null;selW=-1;selC=null;render();flash(editMode?'وضع التعديل: اسحب أي قطعة، كبس عليها لتنقّيها، وكبّرها أو صغّرها بالمربّع الأصفر أو بالأزرار. وزيد قطع من المكتبة.':'خلصت تعديل ✓','');});
  on('wbig',()=>selC&&scalePart(selC,1.15));on('wsmall',()=>selC&&scalePart(selC,1/1.15));on('wdelc',()=>selC&&delPart(selC));
  on('wclear',()=>{if(!st.wires.length)return;hist.push(snapH());st.wires=[];for(const k in st.sw)st.sw[k]=0;selW=-1;afterChange();flash('مسحت كل الشرايط ونزّلت كل القواطع. القطع بقيت.','');});
  on('wnew',()=>{st.dmg=0;for(const k in st.sw)st.sw[k]=0;saveW();render();if(typeof draw==='function')draw();flash('ركّبت إنفرتر جديد. كل القواطع نازلة.','o');});
  document.getElementById('wlib').addEventListener('click',e=>{const t=e.target.closest('[data-add]');if(t)addPart(t.dataset.add);});
  document.getElementById('wready').addEventListener('click',e=>{const t=e.target.closest('[data-ready]');if(!t)return;hist.push(snapH());const id=t.dataset.ready;loadReady(id);st.empty=id==='empty'?1:0;saveW();editMode=id==='empty';compute();fit();if(typeof draw==='function')draw();
   flash(id==='empty'?'لوحة فاضية: زيد القطع من المكتبة وارسم مشروعك.':'حمّلت المشروع الجاهز موصول. شغّل بالترتيب، أو «امسح الشرايط» ووصّلو إنت.','o');});
  compute();fit();}};
})();
