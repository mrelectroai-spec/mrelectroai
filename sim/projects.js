// مشاريع كورس الطاقة الشمسية: بمختبر الطاقة (وضع التوصيل)
// كل مشروع بيختار الإنفرتر والبطارية، بيحضّر اللوحة، وبيفحص التوصيل والإعدادات لحالو.
'use strict';
(function(){
const PANEL_W=550;
const fmt=n=>(Math.round(n*10)/10).toString();
const unwire=r=>{r.wires=[];};
const SP=[
 {id:'s1',n:1,title:'منظومة أوف غريد صغيرة',icon:'⛰️',inv:'deye66',bat:'deyeg5',nb:1,base:'offgrid',prep:unwire,
  brief:'شاليه بلا دولة: إنفرتر Deye 6.6kW، بطارية Deye 5kWh، و6 ألواح 550W. وصّل كل شي من الصفر، شغّل، وظبّط الإعدادات.',
  goals:['الألواح سترينغ واحد عبر العازل لـPV1','البطارية عبر قاطع DC، مع كابل الاتصال BMS','مخرج الإنفرتر عبر قاطع AC لتابلو البيت','الأرضي للإنفرتر وللبيت','إعدادات البطارية كلّها ✓'],
  hints:['الألواح: كل لوح − على + اللي بعدو. أوّل + وآخر − عالعازل (فوق)، ومن تحت العازل لـPV1+ وPV1−.','البطارية: + و− عالقاطع DC من فوق، ومن تحت لـBAT+ وBAT− تبع الإنفرتر. وكابل CAN من البطارية لـBMS.','AC OUT L وN عالقاطع AC، ومن تحت لتابلو البيت. PE الإنفرتر والبيت عبار الأرض.','عالشاشة: Batt Mode = Lithium، وLithium Mode = 00.'],
  checks:['pv1','bat','comm','load','pe','set','run']},
 {id:'s2',n:2,title:'توزيع الألواح على الـMPPT',icon:'☀️',inv:'grw6',bat:'dynb',nb:2,base:'two',prep:unwire,
  brief:'إنفرتر Growatt 6kW فيه MPPT تنين، ومعك 12 لوح 550W. وزّعن بحيث الفولت بالبرد ما يتعدّى الحدّ، وبالشوب ما ينزل تحت الـMPPT، وكل الألواح مستعملة.',
  goals:['سترينغين: واحد لكل MPPT','Voc بالبرد ≤ 500V لكل سترينغ','Vmp بالشوب ≥ 120V لكل سترينغ','ولا سترينغين عالتوازي على نفس الـMPPT (التيار 16A حدّ)','كل الـ12 لوح موصولين'],
  hints:['لوح 550W: Voc 49.6V، وبالبرد (−10°C) بيوصل لحوالي 53V. يعني 9 ألواح بالكتير بالسترينغ.','بالشوب (65°C) Vmp اللوح بينزل لحوالي 37.4V. يعني 4 ألواح عالأقل لتوصل 120V.','12 لوح: 6 على PV1 و6 على PV2. كل سترينغ: 318V بالبرد و224V بالشوب. ممتاز.'],
  checks:['pv12','all12']},
 {id:'s3',n:3,title:'بطاريتين وBMS مع Felicity',icon:'🔋',inv:'fel5',bat:'dynbx',nb:2,base:'home',prep:r=>{r.wires=r.wires.filter(w=>!/bat|bdc|bms/.test(w.a+w.b));},
  brief:'إنفرتر Felicity 5kW مع بطاريتين Dyness بالتوازي. وصّل البطاريات وكابل الاتصال، واختار نوع البطارية وتيار الشحن الصح من الشاشة.',
  goals:['البطارية عبر قاطع DC','كابل الاتصال BMS','Battery type (08) حسب جدول التوافق','Max charging current ≤ حدّ البطاريتين والإنفرتر'],
  hints:['Felicity مع Dyness: عادةً PYL إذا السوفتوير جديد. شوف كرت «الإعدادات المهمّة» تحت.','بطاريتين Dyness BX: كل وحدة 75A، يعني 150A، بس الإنفرتر حدّو 100A. خلّي الشحن 100A أو أقل.','عالشاشة: SETUP ← 08 للبطارية، و02 لتيار الشحن.'],
  checks:['bat','comm','set','run']},
 {id:'s4',n:4,title:'هايبرد مع الدولة',icon:'🏙️',inv:'deye5',bat:'deyeg5',nb:1,base:'home',prep:r=>{r.wires=r.wires.filter(w=>!/sup|bac|house|inv\.g|inv\.l|eb/.test(w.a+w.b));},
  brief:'Deye 5kW هايبرد ببيت فيه دولة. الألواح والبطارية موصولين. وصّل الدولة عالـGRID والبيت عالـLOAD، كل واحد عبر قاطعو، وانتبه: الدولة ما بتلتقي أبداً مع مخرج الإنفرتر.',
  goals:['عدّاد الدولة ← قاطع AC ← GRID','LOAD ← قاطع AC ← تابلو البيت','الدولة ما تكون واصلة عالـLOAD','الأرضي للعدّاد والإنفرتر والبيت','الإعدادات ✓'],
  hints:['الدولة L وN ← القاطع AC الأوّل ← GRID L وN تبع الإنفرتر.','LOAD L وN ← القاطع AC التاني ← البيت. إذا وصّلت الدولة دغري عالبيت والبيت عالـLOAD، المصدرين بيلتقوا والإنفرتر بينضرب.','PE العدّاد والإنفرتر والبيت كلّن عبار الأرض.'],
  checks:['grid','load','nogl','pe','set','run']},
 {id:'s5',n:5,title:'حساب منظومة بيت',icon:'🧮',calc:true,
  brief:'بيت بدّو منظومة. الأحمال تحت. احسب الاستهلاك اليومي، قدرة الإنفرتر، البطارية لليل، وعدد الألواح.',
  goals:['الاستهلاك اليومي (kWh)','قدرة الإنفرتر (kW) على أكبر حمل سوا × 1.25','البطارية (kWh) لاستهلاك الليل ÷ 0.9','عدد الألواح 550W (5 ساعات شمس، ضياع 20%)'],
  hints:['الاستهلاك = القدرة × الساعات لكل جهاز، وبتجمعن.','أكبر حمل سوا = مجموع القدرة كلّها (كلّن ممكن يشتغلوا سوا) × 1.25.','الألواح = الاستهلاك اليومي ÷ (0.55 × 5 × 0.8)، وبتدوّر لفوق.']},
 {id:'s6',n:6,title:'كشف عطل',icon:'🛠️',inv:'deye66',bat:'deyeg5',nb:1,base:'offgrid',
  prep:r=>{r.wires=r.wires.filter(w=>!(w.a==='bat.can'||w.b==='inv.bms'));for(const w of r.wires){if(w.b==='inv.pv1p')w.b='inv.pv1n';else if(w.b==='inv.pv1n')w.b='inv.pv1p';}r.wires=r.wires.filter(w=>!(w.a==='house.PE'||w.b==='house.PE'));},
  setS:{battMode:'Use Batt V',maxCh:140},
  brief:'زبون اتّصل: «المنظومة ما عم تشحن من الألواح، والبطارية عم تعطي إنذار، وبيكهربني التابلو». ركّبها فني قبلك. لاقي كل الأعطال وصلّحها.',
  goals:['لاقي العطل بالألواح','لاقي العطل بالبطارية','لاقي العطل بالأمان','لاقي الإعدادات الغلط'],
  hints:['شوف أطراف PV1 عالإنفرتر: الأحمر لازم عالـ+.','بطارية ليثيوم بلا كابل اتصال ما بتعرف تحكي مع الإنفرتر.','«بيكهربني التابلو»: شو ناقص بالبيت؟','عالشاشة: Batt Mode وMax A Charge. البطارية 5kWh بتحمل 100A بس.'],
  checks:['pv1','bat','comm','load','pe','set','run']},
];
const LOADS=[['🧊','براد',200,24],['💡','ضو',150,6],['📺','تلفزيون',120,5],['🌀','مروحة',75,8],['💧','موتور مي',750,1],['❄️','مكيّف',1100,6]];
const NIGHT=[['🧊','براد',200,12],['💡','ضو',150,5],['📺','تلفزيون',120,3],['🌀','مروحة',75,6]];

const done=id=>{try{return localStorage.getItem('solarDone_'+id)==='1';}catch(e){return false;}};
const setDone=id=>{try{localStorage.setItem('solarDone_'+id,'1');}catch(e){}};
let cur=null;try{cur=localStorage.getItem('solarCur')||null;}catch(e){}

function card(){let el=document.getElementById('spj');if(el)return el;
 el=document.createElement('div');el.className='card';el.id='spj';const ks=document.getElementById('keyset');ks.parentNode.insertBefore(el,ks);return el;}
function render(){const el=card();
 const M=window.MEAPATH;if(M&&!M.status('solar').unlocked){el.innerHTML=`<h2>🎓 مشاريع كورس الطاقة الشمسية</h2><style>.lockc{text-align:center;padding:10px}.lockc b{display:block;font-size:17px;margin:6px 0}.lockc p{color:var(--muted);line-height:1.8}.lockc a{display:inline-block;margin-top:10px;padding:11px 16px;border-radius:12px;background:var(--volt);color:#04231a;font-weight:700;text-decoration:none}</style>`+M.lockHTML('solar');return;}
 const P=SP.find(p=>p.id===cur);
 let h=`<h2>🎓 مشاريع كورس الطاقة الشمسية · ${SP.filter(p=>done(p.id)).length}/${SP.length} ✓</h2>`;
 h+=`<div class="spl">${SP.map(p=>`<button type="button" class="spb${p.id===cur?' on':''}${done(p.id)?' ok':''}" data-sp="${p.id}"><span>${p.icon}</span><b>${p.n}. ${p.title}</b>${done(p.id)?'<i>✓</i>':''}</button>`).join('')}</div>`;
 if(P){h+=`<div class="spd"><p>${P.brief}</p><ul>${P.goals.map(g=>`<li>${g}</li>`).join('')}</ul>`;
  if(P.calc)h+=calcHTML();
  h+=`<div class="spr"><button type="button" class="btn" id="spCheck">✓ افحص مشروعي</button><button type="button" class="btn alt" id="spHint">💡 تلميح</button>${P.calc?'':'<button type="button" class="btn alt" id="spReset">↺ من الأوّل</button>'}</div><div id="spRes"></div></div>`;}
 else h+=`<p class="muted" style="margin-top:8px">نقّي مشروع لتبلّش. كل مشروع بيحضّرلك الإنفرتر والبطارية واللوحة، وإنت بتوصّل وبتظبّط، وأنا بفحص.</p>`;
 el.innerHTML=h;}
function calcHTML(){const row=r=>`<tr><td>${r[0]} ${r[1]}</td><td dir="ltr">${r[2]}W</td><td dir="ltr">${r[3]}h</td></tr>`;
 return `<div class="spt"><b>أحمال النهار والليل (24 ساعة):</b><table>${LOADS.map(row).join('')}</table><b>منها بالليل (عالبطارية):</b><table>${NIGHT.map(row).join('')}</table></div>
 <div class="spf"><label>الاستهلاك اليومي (kWh)<input id="cE" inputmode="decimal" dir="ltr"></label><label>قدرة الإنفرتر (kW)<input id="cI" inputmode="decimal" dir="ltr"></label>
 <label>البطارية (kWh)<input id="cB" inputmode="decimal" dir="ltr"></label><label>عدد الألواح<input id="cP" inputmode="numeric" dir="ltr"></label></div>`;}

function start(id){const P=SP.find(p=>p.id===id);cur=id;try{localStorage.setItem('solarCur',id);}catch(e){}
 if(P.calc){render();return;}
 if(typeof setMode==='function'&&MODE!=='wire')setMode('wire');
 PROJ={inv:P.inv,bat:P.bat,n:P.nb};ls.set('simProj',JSON.stringify(PROJ));if(typeof closePicker==='function')closePicker();applyProject(true);
 if(P.setS){Object.assign(S,P.setS);save();}
 WIRE.loadBoard(P.base,P.prep);draw();render();
 ev('o','مشروع: '+P.title+'. '+P.brief,'',0);
 setTimeout(()=>document.getElementById('board').scrollIntoView({behavior:'smooth',block:'start'}),80);}

function check(){const P=SP.find(p=>p.id===cur);if(!P)return;const out=[];const ok=(pass,txt,hint)=>out.push({pass:!!pass,txt,hint:hint||''});
 if(P.calc){const E=LOADS.reduce((a,r)=>a+r[2]*r[3],0)/1000,peak=LOADS.reduce((a,r)=>a+r[2],0)*1.25/1000,night=NIGHT.reduce((a,r)=>a+r[2]*r[3],0)/1000,bat=night/0.9,pn=Math.ceil(E/(0.55*5*0.8));
  const v=id=>parseFloat((document.getElementById(id).value||'').replace(',','.'));const near=(x,y,t)=>isFinite(x)&&Math.abs(x-y)<=y*t;
  ok(near(v('cE'),E,0.06),'الاستهلاك اليومي',`جمّع القدرة × الساعات لكل جهاز. الجواب حوالي ${fmt(E)}kWh.`);
  ok(isFinite(v('cI'))&&v('cI')>=peak*0.95&&v('cI')<=peak*2,'قدرة الإنفرتر',`مجموع الأحمال ${fmt(peak/1.25)}kW × 1.25 = ${fmt(peak)}kW، يعني إنفرتر ${Math.ceil(peak)}kW أو أكبر شوي.`);
  ok(near(v('cB'),bat,0.12),'البطارية لليل',`استهلاك الليل ${fmt(night)}kWh ÷ 0.9 = ${fmt(bat)}kWh تقريباً.`);
  ok(v('cP')>=pn&&v('cP')<=pn+2,'عدد الألواح',`${fmt(E)} ÷ (0.55 × 5 × 0.8) = ${fmt(E/2.2)}، يعني ${pn} لوح.`);
  return out;}
 const W=WIRE.peek(),I=W.PI(),B=W.PB();const op=W.analyze(W.allOn());
 const C=W.C,ids=t=>Object.values(C).filter(c=>c.type===t).map(c=>c.id);
 const through=(type,brokenWhenOff)=>ids(type).some(id=>brokenWhenOff(W.analyze(W.offOne(id))));
 const pvOk=k=>{const p=op.pv[k];if(!p||!p.n||p.rev||p.short||p.open||p.none)return null;const v=W.pvV(p.n);return {n:p.n,par:p.par,voc:v.voc,vmp:v.vmp};};
 const pvMsg=k=>{const p=op.pv[k];return !p||p.none?`ما في ألواح على PV${k+1}.`:p.rev?`السترينغ على PV${k+1} معكوس: الـ+ عالسالب.`:p.short?`في Short بالسترينغ على PV${k+1}.`:p.open?`السترينغ على PV${k+1} مقطوع بالنص.`:'';};
 for(const c of P.checks){
  if(c==='pv1'){const s=pvOk(0);ok(s&&s.voc<=I.maxVoc&&s.vmp>=I.mppt[0],'الألواح موصولة صح على PV1',s?`الفولت ${Math.round(s.voc)}V أو ${Math.round(s.vmp)}V برّا حدود الإنفرتر.`:pvMsg(0));
   ok(s&&through('iso',x=>!x.pv[0].n||x.pv[0].open||x.pv[0].none),'الألواح بتمرق عبر العازل DC','وصّل الألواح عالعازل أوّل، ومن العازل للإنفرتر.');}
  if(c==='pv12'){for(const k of [0,1]){const s=pvOk(k);
    ok(s&&!s.par,`السترينغ على PV${k+1} موصول`,s?`في سترينغين عالتوازي على PV${k+1}: التيار 26A أكبر من حدّ الـMPPT (${I.imp}A).`:pvMsg(k));
    if(s){ok(s.voc<=I.maxVoc,`PV${k+1}: الفولت بالبرد ${Math.round(s.voc)}V ≤ ${I.maxVoc}V`,`${s.n} ألواح كتير: بالبرد بيوصلو ${Math.round(s.voc)}V. نزّل لـ9 أو أقل.`);
     ok(s.vmp>=I.mppt[0],`PV${k+1}: الفولت بالشوب ${Math.round(s.vmp)}V ≥ ${I.mppt[0]}V`,`${s.n} ألواح قليل: بالشوب بينزلو لـ${Math.round(s.vmp)}V، تحت الـMPPT.`);}}}
  if(c==='all12'){const n=(op.pv[0].n||0)+(op.pv[1].n||0);ok(n===12,'كل الـ12 لوح مستعملين',`موصول ${n} لوح بس من 12.`);}
  if(c==='bat'){ok(op.batt==='ok'&&!op.batShort,'البطارية موصولة صح عالإنفرتر',op.batt==='rev'?'القطبية معكوسة! + عالسالب.':op.batShort?'في Short عالبطارية!':'البطارية مش موصولة كاملة (+ و−).');
   ok(op.batt==='ok'&&through('bdc',x=>x.batt!=='ok'),'البطارية بتمرق عبر قاطع DC','حط قاطع DC بين البطارية والإنفرتر.');}
  if(c==='comm'){ok(op.comm,'كابل الاتصال BMS موصول',B.comm.length?'وصّل CAN البطارية على BMS الإنفرتر.':'');}
  if(c==='load'){ok(op.house==='inv'&&!op.loadShort,'البيت ماخد من مخرج الإنفرتر',op.house==='invswap'?'L وN معكوسين عالبيت.':'وصّل مخرج الإنفرتر (AC OUT/LOAD) عالبيت.');
   ok(op.house==='inv'&&through('bac',x=>x.house!=='inv'),'مخرج الإنفرتر بيمرق عبر قاطع AC','حط قاطع AC بين الإنفرتر والبيت.');}
  if(c==='grid'){ok(op.grid==='ok'&&!op.acShort,'الدولة موصولة عالـGRID',op.grid==='swap'?'L وN تبع الدولة معكوسين.':'وصّل عدّاد الدولة عـGRID L وN.');
   ok(op.grid==='ok'&&through('bac',x=>x.grid!=='ok'),'الدولة بتمرق عبر قاطع AC','حط قاطع AC بين العدّاد والإنفرتر.');}
  if(c==='nogl')ok(!op.gridToLoad,'الدولة مش واصلة عمخرج الإنفرتر','الدولة واصلة عالـLOAD: هيك المصدرين بيلتقوا والإنفرتر بينضرب.');
  if(c==='pe'){ok(op.invPE,'الإنفرتر موصول عالأرض','وصّل PE الإنفرتر عبار الأرض.');ok(op.housePE,'تابلو البيت موصول عالأرض','وصّل PE البيت عبار الأرض. بلا أرض، أي تسريب بيكهرب.');if(W.C.sup)ok(op.supPE,'العدّاد موصول عالأرض','وصّل PE العدّاد عبار الأرض.');}
  if(c==='set'){const rows=ksRows();for(const r of rows)ok(r[3],`الإعداد ${r[0]} = ${r[2]}`,`هلّق ${r[1]}، لازم ${r[2]}. (${r[4]})`);}
  if(c==='run'){ok(!op.mix.length&&!W.st.dmg,'ما في خلط DC مع AC ولا شي محروق',W.st.dmg?'الإنفرتر انضرب: صلّح الغلط واكبس «جهاز جديد».':'في شريط خالط DC مع AC أو PE.');}
 }
 return out;}
function showRes(r){const n=r.filter(x=>x.pass).length,all=n===r.length;if(all){setDone(cur);try{window.meaTrack&&window.meaTrack('done_'+cur);}catch(e){}}
 document.getElementById('spRes').innerHTML=`<div class="res ${all?'pass':'fail'}">${all?'🎉 مشروعك زابط! ':''}${n} / ${r.length}</div><ul class="spres">${r.map(x=>`<li><i>${x.pass?'✅':'❌'}</i><div>${x.txt}${x.pass?'':`<small>${x.hint}</small>`}</div></li>`).join('')}</ul>`;
 if(all)render(),document.getElementById('spRes').innerHTML=`<div class="res pass">🎉 مشروعك زابط! ${n} / ${r.length}</div>`;}
let hi=0;
document.addEventListener('click',e=>{const b=e.target.closest('[data-sp]');if(b){hi=0;start(b.dataset.sp);return;}
 if(e.target.id==='spCheck'){if(typeof UI!=='undefined'&&UI.draft){document.getElementById('spRes').innerHTML='<div class="res fail">في إعدادات غيّرتها عالشاشة وما حفظتها. اكبس ✓ الخضرا عالشاشة أوّل.</div>';return;}showRes(check());}
 if(e.target.id==='spHint'){const P=SP.find(p=>p.id===cur);if(!P)return;document.getElementById('spRes').innerHTML=`<div class="res" style="border:1px solid var(--warn)">💡 ${P.hints[hi%P.hints.length]}</div>`;hi++;}
 if(e.target.id==='spReset'){start(cur);}});
const st=document.createElement('style');st.textContent=`
#spj h2{margin-bottom:10px}.spl{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px}
.spb{display:flex;align-items:center;gap:8px;padding:10px;border-radius:14px;border:1px solid var(--line);background:var(--panel-2,#14241F);color:var(--text);font:inherit;font-size:13.5px;text-align:start;cursor:pointer;transition:transform .14s}
.spb:active{transform:scale(.96)}.spb span{font-size:20px}.spb.on{border-color:var(--volt);box-shadow:inset 0 0 0 1px var(--volt)}.spb.ok i{margin-inline-start:auto;color:var(--volt);font-style:normal}
.spd{margin-top:12px}.spd p{line-height:1.8}.spd ul{margin:6px 20px 8px 0;line-height:1.8;color:var(--muted);font-size:14px}
.spr{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px}.spr .btn.alt{background:transparent;border:1px solid var(--line);color:var(--text)}.spr .btn{flex:1;min-width:120px}
.spres{list-style:none;margin-top:8px}.spres li{display:flex;gap:8px;padding:8px 2px;border-top:1px solid var(--line);font-size:14px;line-height:1.6}.spres small{display:block;color:var(--muted);font-size:12.5px}.spres i{font-style:normal}
.spt table{width:100%;border-collapse:collapse;margin:6px 0 10px;font-size:14px}.spt td{padding:5px;border-bottom:1px solid var(--line)}
.spf{display:grid;grid-template-columns:1fr 1fr;gap:8px}.spf label{font-size:13px;color:var(--muted);display:flex;flex-direction:column;gap:4px}
.spf input{height:44px;border-radius:12px;border:1px solid var(--line);background:var(--void,#070F0D);color:var(--text);padding:0 10px;font:inherit;font-size:16px}`;
document.head.appendChild(st);
render();
if(location.hash==='#projects'||cur){if(typeof setMode==='function'&&MODE!=='wire'&&location.hash==='#projects')setMode('wire');setTimeout(()=>{if(location.hash==='#projects'){if(typeof closePicker==='function')closePicker();card().scrollIntoView({behavior:'smooth',block:'start'});}},300);}
window.SOLARP={SP,check,start};
})();
