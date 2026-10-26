// مشروع التوصيل: الطالب بيمدّ الشرايط ويشغّل المنظومة
'use strict';
(function(){
const BW=1000,BH=760;
const C={};
function add(id,o){C[id]=Object.assign({id},o);}
// الألواح
for(let i=0;i<6;i++){const x=20+i*92,y=22;add('p'+i,{type:'panel',x,y,w:80,h:116,name:'لوح '+(i+1),
  t:{'+':{x:x+22,y:y+146,k:'+',d:1,l:'+'},'-':{x:x+58,y:y+146,k:'-',d:1,l:'−'}}});}
// عازل DC (قطبين لكل String)
(function(){const x=40,y=232,w=210,h=128;const t={};const cols=[['1p','+','PV1+'],['1n','-','PV1−'],['2p','+','PV2+'],['2n','-','PV2−']];
 cols.forEach((c,i)=>{const cx=x+32+i*48;t['i'+c[0]]={x:cx,y:y,k:c[1],d:-1,l:c[2]};t['o'+c[0]]={x:cx,y:y+h,k:c[1],d:1,l:c[2]};});
 add('iso',{type:'iso',x,y,w,h,t,pairs:cols.map(c=>['i'+c[0],'o'+c[0]]),name:'عازل DC'});})();
// الإنفرتر
(function(){const x=330,y=200,w=350,h=360;const list=[['pv1p','PV1+','+'],['pv1n','PV1−','-'],['pv2p','PV2+','+'],['pv2n','PV2−','-'],['batp','BAT+','+'],['batn','BAT−','-'],['bms','BMS','CAN'],['gl','GRID L','L'],['gn','GRID N','N'],['ll','LOAD L','L'],['ln','LOAD N','N'],['pe','PE','PE']];
 const t={};list.forEach((a,i)=>{t[a[0]]={x:x+26+i*27,y:y+h,k:a[2],d:1,l:a[1]};});
 add('inv',{type:'inv',x,y,w,h,t,name:'الإنفرتر'});})();
// البطارية وقاطعها
add('bat',{type:'bat',x:24,y:560,w:200,h:150,name:'البطارية',t:{'+':{x:64,y:560,k:'+',d:-1,l:'+'},'-':{x:118,y:560,k:'-',d:-1,l:'−'},can:{x:184,y:560,k:'CAN',d:-1,l:'CAN'}}});
add('bbr',{type:'brk',x:248,y:600,w:90,h:136,name:'قاطع البطارية',rating:'DC 125A',t:{ip:{x:274,y:600,k:'+',d:-1,l:'+'},in:{x:312,y:600,k:'-',d:-1,l:'−'},op:{x:274,y:736,k:'+',d:1,l:'+'},on:{x:312,y:736,k:'-',d:1,l:'−'}},pairs:[['ip','op'],['in','on']]});
// الدولة وقاطعها
add('sup',{type:'sup',x:850,y:18,w:130,h:150,name:'عدّاد الدولة',t:{L:{x:880,y:168,k:'L',d:1,l:'L'},N:{x:915,y:168,k:'N',d:1,l:'N'},PE:{x:950,y:168,k:'PE',d:1,l:'PE'}}});
add('gbr',{type:'brk',x:860,y:230,w:100,h:136,name:'قاطع الدولة',rating:'2P 32A',t:{iL:{x:888,y:230,k:'L',d:-1,l:'L'},iN:{x:932,y:230,k:'N',d:-1,l:'N'},oL:{x:888,y:366,k:'L',d:1,l:'L'},oN:{x:932,y:366,k:'N',d:1,l:'N'}},pairs:[['iL','oL'],['iN','oN']]});
// البيت وقاطعو
add('lbr',{type:'brk',x:715,y:600,w:100,h:136,name:'قاطع البيت',rating:'2P 32A',t:{iL:{x:743,y:600,k:'L',d:-1,l:'L'},iN:{x:787,y:600,k:'N',d:-1,l:'N'},oL:{x:743,y:736,k:'L',d:1,l:'L'},oN:{x:787,y:736,k:'N',d:1,l:'N'}},pairs:[['iL','oL'],['iN','oN']]});
add('house',{type:'house',x:845,y:470,w:140,h:200,name:'تابلو البيت',t:{L:{x:878,y:470,k:'L',d:-1,l:'L'},N:{x:915,y:470,k:'N',d:-1,l:'N'},PE:{x:952,y:470,k:'PE',d:-1,l:'PE'}}});
// بار الأرض
(function(){const x=380,y=700,w=290,h=24;const t={};for(let i=0;i<5;i++)t['e'+i]={x:x+30+i*58,y,k:'PE',d:-1,l:'PE'};add('eb',{type:'eb',x,y,w,h,t,name:'بار الأرض'});})();

const KCOL={'+':'#d32f2f','-':'#1b1b1b','L':'#8a4b14','N':'#1f6fd1','PE':'#2e9d3a','CAN':'#8a96a0'};
const KNAME={'+':'موجب DC','-':'سالب DC','L':'فاز','N':'نوترال','PE':'أرض','CAN':'كابل اتصال'};
const SWS=['bbr','iso','inv','gbr','lbr'];
let st={wires:[],sw:{bbr:0,iso:0,inv:0,gbr:0,lbr:0},dmg:0};
try{const v=JSON.parse(ls.get('simWire')||'null');if(v&&v.wires)st=Object.assign(st,v);}catch(e){}
let hist=[];let sel=null,selW=-1,zoom=0;
const keyOf=(c,t)=>c+'.'+t;
const term=k=>{const [c,t]=k.split('.');return C[c].t[t];};
function saveW(){ls.set('simWire',JSON.stringify(st));}

/* ---------- الشبكة الكهربائية ---------- */
function nets(sw){const par={};const f=x=>{while(par[x]!==x){par[x]=par[par[x]];x=par[x];}return x;};const u=(a,b)=>{a=f(a);b=f(b);if(a!==b)par[a]=b;};
 for(const c in C)for(const t in C[c].t)par[keyOf(c,t)]=keyOf(c,t);
 for(const w of st.wires)if(par[w.a]&&par[w.b])u(w.a,w.b);
 for(const c in C)if(C[c].pairs&&sw[c])for(const p of C[c].pairs)u(keyOf(c,p[0]),keyOf(c,p[1]));
 for(let i=1;i<5;i++)u('eb.e0','eb.e'+i);
 const groups={};for(const k in par){const r=f(k);(groups[r]=groups[r]||[]).push(k);}
 return {f,groups};}
function walk(N,startK,endK){ // series string from + to −
 const s=N.f(startK),e=N.f(endK);if(s===e)return{short:true,n:0};
 let cur=s,n=0,used={},par=false;
 for(let g=0;g<8;g++){const ps=[];for(let i=0;i<6;i++){if(!used[i]&&N.f('p'+i+'.+')===cur)ps.push(i);}
  if(!ps.length)break;if(ps.length>1)par=true;const i=ps[0];used[i]=1;n++;cur=N.f('p'+i+'.-');if(cur===e)return{ok:true,n,par,used};}
 return{ok:false,n,par,used};}
function strInfo(N,k){const a='inv.pv'+k+'p',b='inv.pv'+k+'n';
 const fw=walk(N,a,b);if(fw.short)return{short:true};if(fw.ok)return{n:fw.n,par:fw.par,used:fw.used};
 const rv=walk(N,b,a);if(rv.ok)return{rev:true,n:rv.n,used:rv.used};
 const touched=fw.n>0||rv.n>0;return{open:touched,none:!touched,n:0,used:Object.assign({},fw.used||{},rv.used||{})};}
function analyze(sw){const N=nets(sw),f=N.f;const r={N};
 r.pv=[strInfo(N,1),strInfo(N,2)];
 const Bp=f('bat.+'),Bn=f('bat.-');r.batShort=Bp===Bn;
 const ip=f('inv.batp'),inn=f('inv.batn');
 r.batt=(ip===Bp&&inn===Bn)?'ok':((ip===Bn&&inn===Bp)?'rev':((ip===Bp||inn===Bn||ip===Bn||inn===Bp)?'half':'none'));
 r.comm=f('inv.bms')===f('bat.can');
 const SL=f('sup.L'),SN=f('sup.N');r.acShort=SL===SN;
 const gl=f('inv.gl'),gn=f('inv.gn'),ll=f('inv.ll'),ln=f('inv.ln');
 r.grid=(gl===SL&&gn===SN)?'ok':((gl===SN&&gn===SL)?'swap':((gl===SL||gn===SN||gl===SN||gn===SL)?'half':'none'));
 r.gridToLoad=(ll===SL||ln===SN||ll===SN||ln===SL);
 const HL=f('house.L'),HN=f('house.N');
 r.house=(HL===ll&&HN===ln)?'inv':((HL===ln&&HN===ll)?'invswap':((HL===SL||HN===SN||HL===gl)?'grid':((HL===ll||HN===ln)?'half':'none')));
 r.loadShort=ll===ln;
 r.invPE=f('inv.pe')===f('eb.e0');r.housePE=f('house.PE')===f('eb.e0');r.supPE=f('sup.PE')===f('eb.e0');
 // خلط أنواع
 r.mix=[];for(const g in N.groups){const ks=N.groups[g].map(k=>term(k).k);const set=new Set(ks);
  const dc=set.has('+')||set.has('-'),ac=set.has('L')||set.has('N');
  if(dc&&ac)r.mix.push('dcac');if(set.has('CAN')&&(dc||ac||set.has('PE')))r.mix.push('can');if(set.has('PE')&&(dc||ac))r.mix.push('pe');
  if(set.has('L')&&set.has('N'))r.mix.push('ln');}
 return r;}
const pvV=(n)=>({voc:n*49.6*(1+0.0027*25),vmp:n*41.9*(1-0.0027*40)});

/* ---------- الحالة للمحاكي ---------- */
function compute(){const op=analyze(st.sw),all={};SWS.forEach(s=>all[s]=1);const de=analyze(all);
 const strings=op.pv.map(p=>(p.n&&!p.rev&&!p.short&&!p.open&&!p.none)?p.n:0);
 const batt=st.sw.bbr&&op.batt==='ok'&&!op.batShort;
 const grid=st.sw.gbr&&op.grid!=='none'&&op.grid!=='half'&&!op.acShort;
 const powered=!!st.sw.inv&&!st.dmg&&(batt||grid);
 let load='none';if(op.house==='inv'||op.house==='invswap')load='inv';else if(op.N.f('house.L')===op.N.f('sup.L')&&op.N.f('house.N')===op.N.f('sup.N'))load='grid';
 window.WS={free:false,powered,strings,batt,comm:op.comm&&batt,grid,load,dmg:st.dmg};
 return {op,de};}

/* ---------- الأحداث وقت تكبس قاطع ---------- */
function onSwitch(id){const before=compute();st.sw[id]=st.sw[id]?0:1;const on=st.sw[id];let {op}=compute();
 const say=(cls,t)=>{ev(cls,t,'',0);flash(t,cls);};
 if(id==='bbr'&&on){
  if(op.batShort){st.sw.bbr=0;say('e','💥 Short عالبطارية! الموجب والسالب لازقين ببعض. القاطع فصل فوراً. لو ما في قاطع، الكابل بيحترق.');}
  else if(op.batt==='rev'){st.dmg=1;st.sw.bbr=0;say('e','💥 قطبية البطارية معكوسة عالإنفرتر! BAT+ عالسالب. هيك بينضرب الإنفرتر أو الفيوز الداخلي. صلّح وكبس «جهاز جديد».');}
  else if(op.mix.includes('dcac')){st.dmg=1;st.sw.bbr=0;say('e','💥 خلطت DC مع AC: البطارية واصلة على طرف AC. الإنفرتر انضرب.');}
  else if(op.batt==='ok')say('o','البطارية وصلت عالإنفرتر: '+(op.comm?'مع كابل اتصال BMS.':'بلا كابل اتصال.'));
  else say('w','رفعت قاطع البطارية، بس البطارية مش واصلة صح عالـBAT+ والـBAT−.');}
 if(id==='gbr'&&on){
  if(op.acShort||op.mix.includes('ln')){st.sw.gbr=0;say('e','💥 Short بين الفاز والنوترال! قاطع الدولة فصل.');}
  else if(op.mix.includes('dcac')){st.dmg=1;st.sw.gbr=0;say('e','💥 الدولة (AC) واصلة على طرف DC. الإنفرتر انضرب.');}
  else if(op.gridToLoad){ if(st.sw.inv&&!st.dmg){st.dmg=1;say('e','💥 الدولة واصلة على مخرج LOAD، والإنفرتر عم يطلّع كهربا عليه. التقى مصدرين: الإنفرتر انضرب. الدولة بتفوت عالـGRID، والبيت بيطلع من الـLOAD.');}
   else say('w','⚠ الدولة واصلة على مخرج LOAD! إذا شغّلت الإنفرتر رح ينضرب. نزّل القاطع وصلّح.');}
  else if(op.grid==='swap')say('w','الدولة واصلة بس الفاز والنوترال مقلوبين عالـGRID. بيشتغل، بس النوترال لازم يكون نوترال: خطر عالفني وعلى حماية الـRCD.');
  else if(op.grid==='ok')say('o','الدولة واصلة عالـGRID.');}
 if(id==='inv'&&on){
  if(st.dmg)say('e','الإنفرتر مضروب. صلّح التوصيل وكبس «جهاز جديد».');
  else if(op.gridToLoad&&st.sw.gbr){st.dmg=1;say('e','💥 شغّلت الإنفرتر والدولة واصلة على مخرج LOAD. انضرب.');}
  else if(!WS.powered)say('w','كبست ON بس الإنفرتر ما قلع: بدّو بطارية أو دولة ليقلع. الشمس لحالها ما بتقلّعو.');
  else{say('o','الإنفرتر قلع ✓');UI.pg='main';UI.tab=0;UI.draft=null;}}
 if(id==='iso'&&on){op.pv.forEach((p,k)=>{const nm='PV'+(k+1);
  if(p.short)say('e',`⚠ ${nm}: الموجب والسالب لازقين. الألواح بـShort والـMC4 ممكن تعمل قوس.`);
  else if(p.rev)say('e',`⚠ ${nm}: قطبية الألواح معكوسة! الإنفرتر ما بيشوفها، وفي موديلات بتنضرب. صلّح قبل ما ترفع العازل.`);
  else if(p.n){const v=pvV(p.n);say(v.voc>500?'e':'o',`${nm}: ${p.n} ألواح عالتسلسل. Voc بالبرد تقريباً ${v.voc.toFixed(0)}V`+(v.voc>500?' — فوق 500V، خطر عالإنفرتر!':(v.vmp<150?`، وVmp بالحرّ ${v.vmp.toFixed(0)}V تحت مجال الـMPPT.`:' ✓')));}
  else if(p.open)say('w',`${nm}: الـString مش مسكّر. في لوح أو شريط ناقص.`);});
  if(op.mix.includes('dcac')){st.dmg=1;st.sw.iso=0;say('e','💥 خلطت DC مع AC. الإنفرتر انضرب.');}}
 if(id==='lbr'&&on){
  if(op.loadShort||op.mix.includes('ln'))
   {st.sw.lbr=0;say('e','💥 Short عمخرج الـLOAD! قاطع البيت فصل.');}
  else if(op.house==='inv')say('o','البيت واصل على مخرج الـLOAD ✓');
  else if(op.house==='invswap')say('w','البيت واصل، بس الفاز والنوترال مقلوبين.');
  else say('w','رفعت قاطع البيت، بس البيت مش واصل على الـLOAD.');}
 if(!on)ev('o',({bbr:'نزّلت قاطع البطارية.',iso:'فتحت عازل الـDC.',inv:'طفيت الإنفرتر.',gbr:'نزّلت قاطع الدولة.',lbr:'نزّلت قاطع البيت.'})[id],'',0);
 const after=compute();if(before&&after){}
 saveW();render();if(typeof draw==='function')draw();}
let flashT;function flash(t,cls){const m=document.getElementById('wmsg');m.className='wmsg '+(cls||'');m.textContent=t;m.hidden=false;clearTimeout(flashT);flashT=setTimeout(()=>{m.hidden=true;},7000);}

/* ---------- الرسم ---------- */
function P(x,y){return x.toFixed(1)+' '+y.toFixed(1);}
function wirePath(a,b){const A=term(a),B=term(b);const s=Math.min(110,Math.max(40,Math.abs(A.y-B.y)*0.5+30));
 return `M${P(A.x,A.y)} C${P(A.x,A.y+A.d*s)} ${P(B.x,B.y+B.d*s)} ${P(B.x,B.y)}`;}
function compSVG(c){const {x,y,w,h}=c;let g='';
 if(c.type==='panel'){g+=`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="#163763" stroke="#9fb3c8" stroke-width="2"/>`;
  for(let i=1;i<6;i++)g+=`<line x1="${x}" x2="${x+w}" y1="${y+i*h/6}" y2="${y+i*h/6}" stroke="#4a6a93" stroke-width="1"/>`;
  for(let i=1;i<3;i++)g+=`<line y1="${y}" y2="${y+h}" x1="${x+i*w/3}" x2="${x+i*w/3}" stroke="#4a6a93" stroke-width="1"/>`;
  g+=`<rect x="${x+w/2-10}" y="${y+h-14}" width="20" height="10" fill="#222"/><text x="${x+w/2}" y="${y+16}" class="bt" fill="#fff">550W</text>`;
  g+=`<path d="M${x+w/2-6} ${y+h-4} Q${c.t['+'].x} ${y+h+8} ${c.t['+'].x} ${c.t['+'].y-8}M${x+w/2+6} ${y+h-4} Q${c.t['-'].x} ${y+h+8} ${c.t['-'].x} ${c.t['-'].y-8}" stroke="#222" stroke-width="3" fill="none"/>`;}
 else if(c.type==='iso'){const on=st.sw.iso;g+=`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="#f2f2ee" stroke="#b9bfb5" stroke-width="2"/><rect x="${x+8}" y="${y+22}" width="${w-16}" height="${h-44}" rx="6" fill="#ffd21f"/>
  <g class="sw" data-sw="iso" transform="rotate(${on?0:-90} ${x+w/2} ${y+h/2})"><circle cx="${x+w/2}" cy="${y+h/2}" r="30" fill="#d62b2b"/><rect x="${x+w/2-9}" y="${y+h/2-40}" width="18" height="80" rx="6" fill="#b51f1f"/></g>
  <text x="${x+w/2}" y="${y+16}" class="cn" style="font-size:12px">عازل DC</text><text x="${x+w/2+58}" y="${y+h/2-8}" class="bt" fill="#333">${on?'ON':'OFF'}</text><text x="${x+w/2+58}" y="${y+h/2+10}" class="bt" fill="#333" style="font-size:10px">DC 1000V</text>`;}
 else if(c.type==='inv'){const on=window.WS&&WS.powered;const dm=st.dmg;
  g+=`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="16" fill="#f4f6f7" stroke="#b5c0c7" stroke-width="2.5"/><rect x="${x}" y="${y+h-70}" width="${w}" height="70" rx="0" fill="#dfe5e8"/>
  <rect x="${x+95}" y="${y+40}" width="160" height="96" rx="8" fill="${dm?'#3a1a1a':(on?'#ffffff':'#0b1013')}" stroke="#1a2228" stroke-width="7"/>
  ${on?`<text x="${x+175}" y="${y+84}" class="bt" fill="${(typeof R!=='undefined')&&R.faults&&R.faults.size?'#e0a12c':'#25b36e'}" style="font-size:15px">${(typeof R!=='undefined')&&R.faults&&R.faults.size?[...R.faults][0]:'Normal'}</text><text x="${x+175}" y="${y+106}" class="bt" fill="#33414a" style="font-size:12px">${Math.round(((typeof R!=='undefined')&&R.load)||0)}W</text>`:''}
  ${dm?`<text x="${x+175}" y="${y+92}" class="bt" fill="#ff6a6a" style="font-size:15px">DAMAGED</text>`:''}
  <text x="${x+175}" y="${y+28}" class="bt" fill="#5c6b74" style="font-size:12px;letter-spacing:.08em">HYBRID 5kW</text>
  <circle cx="${x+120}" cy="${y+158}" r="5" fill="${on&&R.pv>5?'#25d366':'#b7c0c5'}"/><circle cx="${x+150}" cy="${y+158}" r="5" fill="${on&&R.gridPresent?'#25d366':'#b7c0c5'}"/><circle cx="${x+180}" cy="${y+158}" r="5" fill="${on?'#25d366':'#b7c0c5'}"/><circle cx="${x+210}" cy="${y+158}" r="5" fill="${dm||(on&&R.faults&&R.faults.size&&!R.faults.has('F35'))?'#ff3b3b':'#b7c0c5'}"/>
  <text x="${x+120}" y="${y+176}" class="bt" style="font-size:9px" fill="#5c6b74">DC</text><text x="${x+150}" y="${y+176}" class="bt" style="font-size:9px" fill="#5c6b74">AC</text><text x="${x+180}" y="${y+176}" class="bt" style="font-size:9px" fill="#5c6b74">NOR</text><text x="${x+210}" y="${y+176}" class="bt" style="font-size:9px" fill="#5c6b74">ALM</text>
  <g class="sw" data-sw="inv"><rect x="${x+w-62}" y="${y+190}" width="46" height="70" rx="8" fill="#2b3a44"/><rect x="${x+w-54}" y="${y+(st.sw.inv?198:226)}" width="30" height="26" rx="5" fill="${st.sw.inv?'#25b36e':'#e5533c'}"/><text x="${x+w-39}" y="${y+276}" class="bt" fill="#33414a" style="font-size:11px">${st.sw.inv?'ON':'OFF'}</text></g>
  <text x="${x+w-39}" y="${y+184}" class="bt" fill="#33414a" style="font-size:10px">POWER</text>`;
  for(const k in c.t){const t=c.t[k];g+=`<text transform="translate(${t.x+4} ${t.y-12}) rotate(-90)" class="tl" fill="#33414a">${t.l}</text>`;}}
 else if(c.type==='bat'){g+=`<rect x="${x}" y="${y+10}" width="${w}" height="${h-10}" rx="10" fill="#2d3740"/><rect x="${x+12}" y="${y+40}" width="${w-24}" height="44" rx="4" fill="#1e262c"/>
  <text x="${x+w/2}" y="${y+32}" class="cn" style="font-size:12px;fill:#cfd8dd">البطارية</text><text x="${x+w/2}" y="${y+60}" class="bt" fill="#fff" style="font-size:14px">LiFePO4 51.2V</text><text x="${x+w/2}" y="${y+78}" class="bt" fill="#9fb0ba" style="font-size:12px">100Ah · CAN</text>
  <rect x="${x+20}" y="${y+100}" width="${(w-40)*(((typeof R!=='undefined')&&R.soc)||0)}" height="12" rx="3" fill="#25b36e"/><rect x="${x+20}" y="${y+100}" width="${w-40}" height="12" rx="3" fill="none" stroke="#5c6b74"/>
  <text x="${x+w/2}" y="${y+136}" class="bt" fill="#cfd8dd" style="font-size:12px">${Math.round((((typeof R!=='undefined')&&R.soc)||0)*100)}%</text>`;}
 else if(c.type==='brk'){const on=st.sw[c.id];g+=`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="#fafafa" stroke="#b9bfc4" stroke-width="2"/>
  <g class="sw" data-sw="${c.id}"><rect x="${x+w/2-16}" y="${y+28}" width="32" height="60" rx="5" fill="#e6e9eb" stroke="#9aa5ab"/><rect x="${x+w/2-12}" y="${y+(on?32:58)}" width="24" height="26" rx="4" fill="${on?'#25b36e':'#e5533c'}"/></g>
  <text x="${x+w/2}" y="${y+22}" class="bt" fill="#33414a" style="font-size:11px">${c.rating}</text><text x="${x+w/2}" y="${y+104}" class="bt" fill="#33414a" style="font-size:11px">${on?'ON':'OFF'}</text><text x="${x+w/2}" y="${y+124}" class="cn" style="font-size:12px">${c.name}</text>`;}
 else if(c.type==='sup'){g+=`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="#e9ecef" stroke="#b9bfc4" stroke-width="2"/><rect x="${x+18}" y="${y+22}" width="${w-36}" height="40" rx="4" fill="#cfe3d4"/><text x="${x+w/2}" y="${y+48}" class="bt" fill="#1f2a30" style="font-size:15px">00427 kWh</text>
  <text x="${x+w/2}" y="${y+86}" class="bt" fill="#33414a" style="font-size:12px">230V · 50Hz</text><text x="${x+w/2}" y="${y+104}" class="bt" fill="${((typeof R!=='undefined')&&gridSched(R.min/60))?'#25b36e':'#e5533c'}" style="font-size:12px">${((typeof R!=='undefined')&&gridSched(R.min/60))?'● في كهربا':'● مقطوعة'}</text>`;}
 else if(c.type==='house'){const lit=(typeof R!=='undefined')&&R.houseOn;g+=`<path d="M${x} ${y+60}L${x+w/2} ${y+12}L${x+w} ${y+60}V${y+h}H${x}Z" fill="#f0e6d6" stroke="#b9a88a" stroke-width="2"/>
  <circle cx="${x+w/2}" cy="${y+108}" r="22" fill="${lit?'#ffd84d':'#cfd4d6'}" ${lit?'style="filter:drop-shadow(0 0 14px #ffd84d)"':''}/><rect x="${x+w/2-8}" y="${y+128}" width="16" height="10" fill="#8a96a0"/>
  <text x="${x+w/2}" y="${y+164}" class="cn" style="font-size:12px">${lit?Math.round(R.load)+'W':'عتمة'}</text><text x="${x+w/2}" y="${y+188}" class="cn" style="font-size:13px">تابلو البيت</text>`;}
 else if(c.type==='eb'){g+=`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="#c58b2a" stroke="#8a5d14"/><line x1="${x+w/2}" y1="${y+h}" x2="${x+w/2}" y2="${y+h+26}" stroke="#2e9d3a" stroke-width="4"/>
  <path d="M${x+w/2-22} ${y+h+28}h44M${x+w/2-14} ${y+h+34}h28M${x+w/2-7} ${y+h+40}h14" stroke="#33414a" stroke-width="3"/><text x="${x+w/2-70}" y="${y+h+32}" class="cn" style="font-size:13px">بار الأرض</text>`;}
 // اسم القطعة
 const ny=c.type==='panel'?y-6:(c.type==='eb'?y-12:y-8);
 if(c.type==='sup')g+=`<text x="${x+w/2}" y="${ny}" class="cn">${c.name}</text>`;
 if(c.id==='p0')g+=`<text x="${x}" y="${y-6}" class="bt" style="text-anchor:start;font-size:11px" fill="#5c6b74">PV ARRAY · 6 × 550W</text>`;
 // الأطراف
 for(const k in c.t){const t=c.t[k];const key=keyOf(c.id,k);const s=sel===key;
  g+=`<g class="tm${s?' on':''}" data-t="${key}"><circle cx="${t.x}" cy="${t.y}" r="15" fill="transparent"/><circle cx="${t.x}" cy="${t.y}" r="${s?9:7}" fill="${KCOL[t.k]}" stroke="${s?'#ffb400':'#fff'}" stroke-width="${s?4:2}"/></g>`;
  if(c.type!=='inv')g+=`<text x="${t.x}" y="${t.y+(t.d>0?24:-12)}" class="tl2">${t.l}</text>`;}
 return g;}
function render(){const b=document.getElementById('board');if(!b)return;const {de}=compute();
 let g=`<svg id="bsvg" viewBox="0 0 ${BW} ${BH}" width="${BW*zoom}" height="${BH*zoom}" xmlns="http://www.w3.org/2000/svg"><rect width="${BW}" height="${BH}" fill="#e3e9ec"/>`;
 g+=`<path d="M0 205H310" stroke="#c9d2d7" stroke-dasharray="6 6"/><text x="290" y="222" class="zn">↑ السطح</text>`;
 for(const id in C)g+=compSVG(C[id]);
 st.wires.forEach((w,i)=>{const A=term(w.a);const col=KCOL[A.k];const d=wirePath(w.a,w.b);const s=i===selW;
  g+=`<path d="${d}" stroke="${s?'#ffb400':'rgba(0,0,0,.25)'}" stroke-width="${s?11:8}" fill="none" stroke-linecap="round"/>`;
  g+=`<path d="${d}" stroke="${col}" stroke-width="5" fill="none" stroke-linecap="round"/>`;
  if(A.k==='PE')g+=`<path d="${d}" stroke="#f2d03b" stroke-width="5" stroke-dasharray="8 8" fill="none"/>`;
  g+=`<path class="wh" data-w="${i}" d="${d}" stroke="transparent" stroke-width="18" fill="none"/>`;});
 // نقاط فوق الشرايط
 for(const id in C){const c=C[id];for(const k in c.t){const t=c.t[k];const key=keyOf(id,k);if(sel===key||st.wires.some(w=>w.a===key||w.b===key))g+=`<circle cx="${t.x}" cy="${t.y}" r="4" fill="#fff" pointer-events="none"/>`;}}
 g+='</svg>';b.innerHTML=g;
 const tb=document.getElementById('wdel');if(tb)tb.disabled=selW<0;
 checklist(de);}
let liveSig='',busy=false;
function updateLive(){const b=document.getElementById('bsvg');if(!b||busy)return;const R_=(typeof R!=='undefined'&&R)||{};
 const sig=[R_.houseOn,WS&&WS.powered,Math.round((R_.soc||0)*100),R_.faults?[...R_.faults].join():'',Math.round((R_.load||0)/50),Math.round((R_.pv||0)/100),R_.gridPresent,typeof gridSched==='function'&&R_.min!=null?gridSched(R_.min/60):0].join('|');
 if(sig!==liveSig){liveSig=sig;render();}}

/* ---------- التقييم ---------- */
function checklist(de){const L=[];const add=(lvl,t)=>L.push({lvl,t});
 de.pv.forEach((p,k)=>{const nm='PV'+(k+1);
  if(p.short)add('bad',`${nm}: الموجب والسالب لازقين ببعض (Short).`);
  else if(p.rev)add('bad',`${nm}: ${p.n} ألواح بس القطبية معكوسة. موجب الألواح لازم يروح عالـ${nm}+.`);
  else if(p.n){const v=pvV(p.n);if(v.voc>500)add('bad',`${nm}: ${p.n} ألواح، Voc بالبرد ≈ ${v.voc.toFixed(0)}V فوق 500V!`);else if(v.vmp<150)add('warn',`${nm}: ${p.n} ألواح، Vmp بالحرّ ≈ ${v.vmp.toFixed(0)}V تحت مجال الـMPPT (150V). زيد ألواح عالتسلسل.`);else add('ok',`${nm}: ${p.n} ألواح عالتسلسل، Voc بالبرد ≈ ${v.voc.toFixed(0)}V ✓`);
   if(p.par)add('warn',`${nm}: في ألواح على نفس النقطة (توازي) بلا تجميع. وصّلهن عالتسلسل.`);}
  else if(p.open)add('warn',`${nm}: الـString مفتوح: في شريط ناقص بين لوحين، أو بين الألواح والعازل والإنفرتر.`);});
 if(!de.pv.some(p=>p.n||p.rev||p.short||p.open))add('todo','وصّل الألواح عالتسلسل: سالب كل لوح على موجب يلّي بعدو، والطرفين عالعازل، ومن العازل عالـPV1.');
 const used={};de.pv.forEach(p=>Object.assign(used,p.used||{}));const un=6-Object.keys(used).length;if(un>0&&un<6)add('warn',`في ${un} ألواح مش موصولين.`);
 // العازل بالنص
 if(de.pv.some(p=>p.n&&!p.rev)){const t=Object.assign({},{bbr:1,inv:1,gbr:1,lbr:1,iso:0});const x=analyze(t);if(x.pv.some(p=>p.n&&!p.rev))add('bad','الألواح واصلة عالإنفرتر بلا عازل DC بالنص. لازم تقدر تفصلها قبل ما تشتغل.');else add('ok','عازل الـDC بين الألواح والإنفرتر ✓');}
 if(de.batShort)add('bad','البطارية: الموجب والسالب لازقين (Short)!');
 else if(de.batt==='ok'){const x=analyze({iso:1,inv:1,gbr:1,lbr:1,bbr:0});if(x.batt==='ok')add('bad','البطارية واصلة عالإنفرتر بلا قاطع DC. أي Short بيحرق الكابل.');else add('ok','البطارية عالـBAT+ والـBAT− مع قاطع ✓');}
 else if(de.batt==='rev')add('bad','البطارية معكوسة: موجبها على BAT−!');
 else if(de.batt==='half')add('warn','البطارية واصلة من طرف واحد بس.');
 else add('todo','وصّل البطارية عالقاطع، ومن القاطع عالـBAT+ والـBAT−.');
 add(de.comm?'ok':'todo',de.comm?'كابل الاتصال بين الـBMS والإنفرتر ✓':'وصّل كابل الاتصال (CAN) من البطارية لـBMS بالإنفرتر. بلاه، Batt Mode: Lithium بيطلّع F58.');
 if(de.acShort)add('bad','الدولة: الفاز والنوترال لازقين (Short)!');
 if(de.gridToLoad)add('bad','الدولة واصلة على مخرج LOAD! الدولة بتفوت عالـGRID بس.');
 if(de.grid==='ok'){const x=analyze({iso:1,inv:1,bbr:1,lbr:1,gbr:0});if(x.grid==='ok')add('warn','الدولة واصلة بلا قاطع بالنص.');else add('ok','الدولة عالـGRID مع قاطع ✓');}
 else if(de.grid==='swap')add('warn','الدولة عالـGRID بس الفاز والنوترال مقلوبين.');
 else if(de.grid==='half')add('warn','الدولة واصلة من طرف واحد بس.');
 else if(!de.gridToLoad)add('todo','وصّل الدولة: من العدّاد عالقاطع، ومن القاطع عالـGRID L وN.');
 if(de.house==='inv'){const x=analyze({iso:1,inv:1,bbr:1,gbr:1,lbr:0});if(x.house==='inv')add('warn','البيت واصل عالـLOAD بلا قاطع.');else add('ok','البيت على مخرج LOAD مع قاطع ✓');}
 else if(de.house==='invswap')add('warn','البيت عالـLOAD بس الفاز والنوترال مقلوبين.');
 else if(de.house==='grid')add('warn','البيت واصل عجهة الدولة مش عالـLOAD: بالانقطاع رح يعتم.');
 else if(de.house==='half')add('warn','البيت واصل من طرف واحد بس.');
 else add('todo','وصّل البيت: من LOAD L وN عالقاطع، ومن القاطع عتابلو البيت.');
 add(de.invPE?'ok':'todo',de.invPE?'أرضي الإنفرتر (PE) عالبار ✓':'وصّل PE تبع الإنفرتر على بار الأرض.');
 if(de.invPE){if(!de.housePE)add('warn','أرضي تابلو البيت مش واصل عالبار.');if(!de.supPE)add('warn','أرضي الدولة مش واصل عالبار.');}
 const mx=new Set(de.mix);if(mx.has('dcac'))add('bad','في شريط واصل DC بـAC! هيدا بيضرب الإنفرتر.');if(mx.has('can'))add('bad','كابل الاتصال واصل على طرف قوّة!');if(mx.has('pe'))add('bad','الأرض واصلة على فاز أو نوترال أو DC!');if(mx.has('ln')&&!de.acShort)add('bad','في فاز ونوترال على نفس النقطة (Short).');
 const ic={ok:'✓',warn:'⚠',bad:'✗',todo:'○'};
 const nb=L.filter(x=>x.lvl==='bad').length,nt=L.filter(x=>x.lvl==='todo').length,nw=L.filter(x=>x.lvl==='warn').length;
 const head=nb?`<div class="wsum bad">في ${nb} غلطات خطيرة. ما ترفع القواطع قبل ما تصلّحهن.</div>`:(nt?`<div class="wsum">ضايل ${nt} خطوات.</div>`:(nw?`<div class="wsum warn">التوصيل بيشتغل، بس في ${nw} ملاحظات.</div>`:`<div class="wsum ok">التوصيل كامل وصحيح ✓ هلّق شغّل بالترتيب.</div>`));
 document.getElementById('wcheck').innerHTML=head+L.map(x=>`<div class="wc ${x.lvl}"><b>${ic[x.lvl]}</b><span>${x.t}</span></div>`).join('');}

/* ---------- التفاعل ---------- */
function onBoard(e){const sw=e.target.closest('[data-sw]');if(sw){onSwitch(sw.dataset.sw);return;}
 const t=e.target.closest('[data-t]');
 if(t){const k=t.dataset.t;selW=-1;
  if(!sel){sel=k;tip(k);}
  else if(sel===k){sel=null;}
  else{const exists=st.wires.some(w=>(w.a===sel&&w.b===k)||(w.a===k&&w.b===sel));
   if(!exists){hist.push(JSON.stringify(st.wires));const A=term(sel),B=term(k);
    st.wires.push({a:sel,b:k});
    if(A.k!==B.k)flash(`⚠ وصلت ${KNAME[A.k]} (${A.l}) على ${KNAME[B.k]} (${B.l}). متأكّد؟`,'w');}
   sel=null;saveW();compute();}
  render();return;}
 const w=e.target.closest('[data-w]');if(w){selW=+w.dataset.w;sel=null;render();return;}
 sel=null;selW=-1;render();}
function tip(k){const [c,t]=k.split('.');const T=C[c].t[t];flash(`نقّيت: ${C[c].name} ← ${T.l} (${KNAME[T.k]}). هلّق اكبس عالطرف التاني.`,'');}
function setZoom(z){const b=document.getElementById('board');const fit=Math.max(0.3,(b.clientWidth-4)/BW);zoom=z||fit;render();}
function solution(){hist.push(JSON.stringify(st.wires));const W=[];const a=(x,y)=>W.push({a:x,b:y});
 for(let i=0;i<5;i++)a('p'+i+'.-','p'+(i+1)+'.+');a('p0.+','iso.i1p');a('p5.-','iso.i1n');a('iso.o1p','inv.pv1p');a('iso.o1n','inv.pv1n');
 a('bat.+','bbr.ip');a('bat.-','bbr.in');a('bbr.op','inv.batp');a('bbr.on','inv.batn');a('bat.can','inv.bms');
 a('sup.L','gbr.iL');a('sup.N','gbr.iN');a('gbr.oL','inv.gl');a('gbr.oN','inv.gn');
 a('inv.ll','lbr.iL');a('inv.ln','lbr.iN');a('lbr.oL','house.L');a('lbr.oN','house.N');
 a('inv.pe','eb.e0');a('sup.PE','eb.e1');a('house.PE','eb.e4');
 st.wires=W;saveW();sel=null;selW=-1;render();flash('هيدا الحل النموذجي. هلّق شغّل بالترتيب: قاطع البطارية، الإنفرتر ON، العازل، قاطع الدولة، قاطع البيت.','o');}

window.WIRE={render,setZoom,compute,updateLive,
 init(){const b=document.getElementById('board');b.addEventListener('click',onBoard);b.addEventListener('pointerdown',()=>{busy=true;});addEventListener('pointerup',()=>{setTimeout(()=>{busy=false;},60);});
  document.getElementById('wzin').onclick=()=>setZoom(zoom*1.25);document.getElementById('wzout').onclick=()=>setZoom(Math.max(0.25,zoom/1.25));
  document.getElementById('wundo').onclick=()=>{if(!hist.length)return;st.wires=JSON.parse(hist.pop());selW=-1;saveW();render();};
  document.getElementById('wdel').onclick=()=>{if(selW<0)return;hist.push(JSON.stringify(st.wires));st.wires.splice(selW,1);selW=-1;saveW();render();};
  document.getElementById('wclear').onclick=()=>{if(!st.wires.length)return;hist.push(JSON.stringify(st.wires));st.wires=[];SWS.forEach(s=>st.sw[s]=0);saveW();render();if(typeof draw==='function')draw();flash('مسحت كل الشرايط ونزّلت كل القواطع.','');};
  document.getElementById('wsol').onclick=solution;
  document.getElementById('wnew').onclick=()=>{st.dmg=0;SWS.forEach(s=>st.sw[s]=0);saveW();render();if(typeof draw==='function')draw();flash('ركّبت إنفرتر جديد. كل القواطع نازلة.','o');};
  compute();setZoom();}};
})();
