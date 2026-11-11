// مختبر التابلو: المشاريع + الفحص الأوتوماتيكي
'use strict';
(function(){
const {P,motorI,CAP}=window.PARTS;
const clone=o=>JSON.parse(JSON.stringify(o));

// بيشغّل سيناريو على نسخة من التابلو (ما بيغيّر شغل الطالب)
function sandbox(board){
 const b=clone({comps:board.comps,wires:board.wires});b.on=true;b.blown=false;
 for(const c of b.comps){c.st={};if(c.type==='mcb1'||c.type==='mcb3')c.st.on=true;}
 const E=window.PENGINE(b);const ev=[];
 const run=ms=>{for(let t=0;t<ms;t+=50)E.tick(0.05,ev);};
 const get=id=>b.comps.find(c=>c.id===id);
 return {b,E,ev,run,get};
}
function find(board,type,f){return board.comps.filter(c=>c.type===type&&(!f||f(c)));}
const fmt=n=>(Math.round(n*10)/10).toString();

const PROJECTS=[
 {id:'dol',n:1,course:'classic',title:'تشغيل وتوقيف موتور (Start/Stop)',icon:'⚙️',kw:7.5,
  brief:'عندك موتور تلات فاز 7.5kW على 400V. ركّبلو دارة تشغيل مباشر: كبسة خضرا بتشغّل، كبسة حمرا بتوقّف، والموتور بيضلّ شغّال بعد ما تترك الكبسة الخضرا.',
  goals:['قاطع 3P للموتور، وقاطع 1P لدارة التحكم','كونتاكتور + أوفرلود مضبوط على تيار الموتور','كبسة تشغيل خضرا (NO) وكبسة توقيف حمرا (NC)','تثبيت (Self-hold) بالكونتاك المساعد 13-14','لمبة خضرا لما يشتغل، ولمبة حمرا لما يفصل الأوفرلود','كابلات الباور والتحكم بالمقطع الصح، والأرضي للموتور'],
  hints:['ابدا بالباور: L1 L2 L3 ← قاطع 3P ← كونتاكتور 1-3-5 ← من 2-4-6 للأوفرلود 1-3-5 ← من 2-4-6 للموتور U1 V1 W1.',
   'دارة التحكم: L1 ← قاطع 1P ← أوفرلود 95-96 ← كبسة توقيف 11-12 ← كبسة تشغيل 13-14 ← كونتاكتور A1، وA2 على N.',
   'التثبيت: حط 13-14 تبع الكونتاكتور بالتوازي مع الكبسة الخضرا (نفس الطرفين).',
   'تيار الموتور تقريباً 14.5A: الكابل 1.5mm² بيحمل 14A بس، فبدّك 2.5mm². القاطع 16A، والأوفرلود على 14.5 لـ15.5A.',
   'اللمبة الخضرا بالتوازي مع كويل الكونتاكتور (A1-A2). اللمبة الحمرا: من 97 ← اللمبة ← N، و97 بياخد من نفس الطرف اللي داخل على 95.'],
  setup(add){add('src',380,70);add('motor',700,860);},
  check(board){
   const R=[];const ok=(pass,txt,hint)=>R.push({pass:!!pass,txt,hint});
   const m=find(board,'motor')[0],I=m?motorI(m.kw):0;
   const kcs=find(board,'kc'),ols=find(board,'ol'),m3=find(board,'mcb3'),m1=find(board,'mcb1');
   const g=find(board,'pbg'),r=find(board,'pbr').concat(find(board,'es'));
   const lg=find(board,'lamp',c=>c.color==='g'),lr=find(board,'lamp',c=>c.color==='r');
   ok(m&&kcs.length&&ols.length&&m3.length&&m1.length&&g.length&&r.length,'كل القطع موجودة','لازم: قاطع 3P، قاطع 1P، كونتاكتور، أوفرلود، كبسة خضرا، كبسة حمرا.');
   if(!m||!g.length){return R;}
   const S=sandbox(board);const mm=()=>S.get(m.id).st;const press=(id,v)=>{S.get(id).st.p=v;};
   const lamp=(arr)=>arr.some(l=>S.get(l.id).st.on);
   // إذا صار عطل كبير، هوّي السبب الأساسي لكل شي بعدو
   const why=h=>{const e=S.ev.find(x=>x.k==='blown'||(x.k==='trip'&&x.why==='short'));if(e)return 'صار قصر وفصل '+(e.c?'القاطع '+e.c.label:'الفيوز الرئيسي')+': صلّحو أوّل (فازين أو فاز ونوترال على نفس الشريط).';
    const b=S.ev.find(x=>x.k==='burn');if(b)return b.c.label+' انحطّ على 400V واحترق: الكويل واللمبة بدّن فاز ونوترال (230V).';
    const o=S.ev.find(x=>x.k==='oltrip'&&x.why==='phase');if(o)return 'الأوفرلود فصل لأنو في فاز ناقص عالموتور: شيك شرايط الباور التلاتة.';return h;};
   S.run(400);const idle=mm().m;
   ok(idle==='off'&&!S.b.blown,'الموتور واقف أوّل ما تشغّل الكهربا',S.b.blown?'في قصر مباشر بلا قاطع! شيك الشرايط.':'الموتور اشتغل لحالو: الكبسة الخضرا لازم تكون NO وما تكون مقطوعة الدارة.');
   press(g[0].id,true);S.run(500);const on1=mm().m;const gl=lamp(lg);
   ok(on1==='run','بتكبس الخضرا: الموتور بيشتغل',why(on1==='hum'?'الموتور عم يزنّ: في فاز ناقص بالباور.':'ما اشتغل: شيك دارة التحكم من L1 لـA1، وA2 على N، والباور للموتور.'));
   press(g[0].id,false);S.run(600);const hold=mm().m;
   ok(hold==='run','بتترك الكبسة: الموتور بيضلّ شغّال (تثبيت)',why('وقف لما تركت الكبسة: حط 13-14 تبع الكونتاكتور بالتوازي مع الكبسة الخضرا.'));
   ok(lg.length&&gl,'اللمبة الخضرا بتضوي وهو شغّال',why('حط لمبة خضرا بالتوازي مع كويل الكونتاكتور.'));
   press(r[0].id,true);S.run(500);const st1=mm().m;press(r[0].id,false);S.run(500);const st2=mm().m;
   ok(st1==='off'&&st2==='off','الكبسة الحمرا بتوقّف، والموتور بيضلّ واقف بعدها',why('الحمرا لازم تكون NC (11-12) على السلسلة قبل الخضرا والتثبيت.'));
   press(g[0].id,true);S.run(400);press(g[0].id,false);S.run(400);
   const ol=ols[0];S.get(ol.id).st.trip=true;S.run(600);const tr=mm().m;const rl=lamp(lr);
   ok(tr==='off','الأوفرلود إذا فصل، الموتور بيوقف',why('وصّل 95-96 تبع الأوفرلود على السلسلة بدارة التحكم.'));
   ok(lr.length&&rl,'اللمبة الحمرا بتضوي لما يفصل الأوفرلود',why('حط لمبة حمرا على 97-98 تبع الأوفرلود.'));
   S.get(ol.id).st.trip=false;S.get(ol.id).st.heat=0;S.run(300);
   press(g[0].id,true);S.run(400);press(g[0].id,false);S.run(20000);
   const longRun=mm().m==='run';const olt=S.ev.find(e=>e.k==='oltrip'),brk=S.ev.find(e=>e.k==='trip'&&e.why==='over');
   ok(longRun&&!olt&&!brk,'بيضلّ شغّال 20 ثانية بلا ما يفصل شي',why(olt?`الأوفرلود فصل لحالو: ظبطو على تيار الموتور (${fmt(I)}A تقريباً).`:brk?'القاطع فصل: صغير على تيار الموتور.':'الموتور وقف لحالو. شيك التثبيت والحماية.'));
   const sc=S.ev.find(e=>e.k==='trip'&&e.why==='short')||S.ev.find(e=>e.k==='blown'),burn=S.ev.find(e=>e.k==='burn');
   ok(!sc&&!burn,'ما في قصر ولا كويل محروق',why(burn?'في كويل أو لمبة انحطّت على 400V بين فازين: 230V يعني فاز ونوترال.':'صار قصر: شيك إنو ما في فازين أو فاز ونوترال على نفس الشريط.'));
   // الحسابات
   const E=window.PENGINE(board);
   const pw=board.wires.filter(w=>E.isPower(w));const ctl=board.wires.filter(w=>!E.isPower(w));
   const thin=pw.filter(w=>(CAP[w.mm2]||0)<I);
   ok(pw.length&&!thin.length,`شرايط الباور بتحمل تيار الموتور (${fmt(I)}A)`,`في ${thin.length} شريط باور رفيع: ${fmt(I)}A بدّو 2.5mm² عالأقل (1.5 بيحمل 14A بس).`);
   const q3=m3[0];ok(q3&&q3.rating>=I&&q3.rating<=Math.min(...pw.map(w=>CAP[w.mm2]||99),99),'قاطع الموتور مناسب للتيار وللكابل',`القاطع لازم يكون أكبر من ${fmt(I)}A وأصغر من تحمّل الكابل: 16A مع 2.5mm².`);
   ok(ol.setA>=I*0.98&&ol.setA<=I*1.1,'الأوفرلود مضبوط صح',`ظبّط الأوفرلود بين ${fmt(I)} و${fmt(I*1.1)}A (اكبس عالدولاب الأزرق).`);
   const q1=m1[0];const thinC=ctl.filter(w=>(CAP[w.mm2]||0)<(q1?q1.rating:6)&&!(w.color==='gy'));
   ok(q1&&!thinC.length,'قاطع التحكم بيحمي شرايط التحكم',q1?`قاطع التحكم ${q1.rating}A أكبر من تحمّل ${thinC.length} شريط تحكم. خلّيه 6A مع 0.75mm²، أو 10A مع 1mm².`:'حط قاطع 1P لدارة التحكم.');
   const pe=board.wires.some(w=>(w.a.startsWith(m.id+'.PE')||w.b.startsWith(m.id+'.PE')));
   ok(pe,'الموتور موصول عالأرضي (PE)','وصّل PE تبع الموتور على PE تبع المصدر بشريط أخضر/أصفر.');
   return R;}},
 {id:'rev',n:2,course:'classic',title:'عكس اتجاه موتور',icon:'🔄',soon:true},
 {id:'yd',n:3,course:'classic',title:'ستار دلتا مع تايمر',icon:'⭐',soon:true},
 {id:'ats',n:4,course:'classic',title:'ATS بـ3 مصادر: دولة، موتير، إنفرتر',icon:'🔀',soon:true},
 {id:'fire',n:5,course:'classic',title:'إنذار حريق ومراوح شفط',icon:'🔥',soon:true},
];
window.PROJECTS=PROJECTS;window.PSANDBOX=sandbox;
})();
