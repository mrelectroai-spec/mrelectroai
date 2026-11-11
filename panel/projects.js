// مختبر التابلو: المشاريع + الفحص الأوتوماتيكي
// كل مشروع: setup (القطع اللي بتكون جاهزة)، brief، goals، hints، check(board) → [{pass,txt,hint}]
'use strict';
(function(){
const {P,motorI,CAP}=window.PARTS;
const clone=o=>JSON.parse(JSON.stringify(o));
const fmt=n=>(Math.round(n*10)/10).toString();
const all=(b,t,f)=>b.comps.filter(c=>c.type===t&&(!f||f(c)));

// بيشغّل سيناريو على نسخة من التابلو (ما بيغيّر شغل الطالب)
function sandbox(board){
 const b=clone({comps:board.comps,wires:board.wires});b.on=true;b.blown=false;
 for(const c of b.comps){c.st={};if(c.type==='mcb1'||c.type==='mcb3'||c.type==='rcd')c.st.on=true;}
 const E=window.PENGINE(b);const ev=[];const maxI={};const prot={};
 const rec=()=>{for(const w of b.wires){if((w.I||0)>(maxI[w.id]||0))maxI[w.id]=w.I;if(w.I>0.05){const p=E.protector(w);if(p&&(!prot[w.id]||p.A>prot[w.id].A))prot[w.id]={A:p.A,c:p.c.label};}}};
 const run=ms=>{for(let t=0;t<ms;t+=50){E.tick(0.05,ev);rec();}};
 const get=id=>b.comps.find(c=>c.id===id);
 const press=(id,ms)=>{get(id).st.p=true;run(ms||400);get(id).st.p=false;run(ms||400);};
 const name=k=>{const [id,t]=k.split('.');const c=get(id);return (c&&(c.label||P[c.type].name))+'·'+t;};
 // الكابلات: سخنت؟ والحماية فوقها أكبر من تحمّلها؟
 function cables(){const hot=[],weak=[];for(const w of b.wires){const cap=CAP[w.mm2]||0;if((maxI[w.id]||0)>cap+0.01)hot.push(w);const p=prot[w.id];if(p&&p.A>cap+0.01)weak.push([w,p]);}return {hot,weak};}
 const fault=()=>{const e=ev.find(x=>x.k==='blown'||(x.k==='trip'&&(x.why==='short'||x.why==='cross')));if(e)return e.why==='cross'||e.cross?'ربطت مصدرين ببعض! كل مصدر لازم يكون معزول عن التاني.':'صار قصر وفصل '+(e.c?'القاطع '+e.c.label:'الفيوز الرئيسي')+': صلّحو أوّل.';
  const bu=ev.find(x=>x.k==='burn');if(bu)return (bu.c.label||'قطعة')+' انحطّت على 400V واحترقت: الكويل واللمبة بدّن فاز ونوترال.';return null;};
 return {b,E,ev,run,get,press,name,cables,fault,maxI};
}
function R(){const out=[];const ok=(pass,txt,hint)=>out.push({pass:!!pass,txt,hint:hint||''});return {out,ok};}
// فحص الكابلات والحماية والأرضي (مشترك)
function common(S,ok,opts){
 const f=S.fault();ok(!f,'ما في قصر ولا شي محروق',f||'');
 const {hot,weak}=S.cables();
 ok(!hot.length,'كل شريط بيحمل التيار اللي مارق فيه',hot.length?`في ${hot.length} شريط رفيع على تيارو، متل ${S.name(hot[0].a)} ← ${S.name(hot[0].b)} (${fmt(S.maxI[hot[0].id])}A، بس بيحمل ${CAP[hot[0].mm2]}A). كبّر المقطع.`:'');
 ok(!weak.length,'القواطع أصغر من تحمّل الكابلات اللي بتحميها',weak.length?`الشريط ${S.name(weak[0][0].a)} ← ${S.name(weak[0][0].b)} (${weak[0][0].mm2}mm² بيحمل ${CAP[weak[0][0].mm2]}A) محمي بـ${weak[0][1].c} على ${weak[0][1].A}A: يا بتكبّر الكابل يا بتصغّر القاطع.`:'');
 if(opts&&opts.pe)for(const [id,lab] of opts.pe){const has=S.b.wires.some(w=>w.a===id+'.PE'||w.b===id+'.PE');ok(has,`${lab} موصول عالأرضي (PE)`,`وصّل PE تبع ${lab} على PE تبع المصدر بشريط أخضر/أصفر.`);}
}

const PROJECTS=[
 /* ===================== كورس الكلاسيك كنترول ===================== */
 {id:'dol',n:1,course:'classic',title:'تشغيل وتوقيف موتور (Start/Stop)',icon:'⚙️',
  brief:'عندك موتور تلات فاز 7.5kW على 400V. ركّبلو دارة تشغيل مباشر: كبسة خضرا بتشغّل، كبسة حمرا بتوقّف، والموتور بيضلّ شغّال بعد ما تترك الكبسة الخضرا.',
  goals:['قاطع 3P للموتور، وقاطع 1P لدارة التحكم','كونتاكتور + أوفرلود مضبوط على تيار الموتور','كبسة تشغيل خضرا (NO) وكبسة توقيف حمرا (NC)','تثبيت (Self-hold) بالكونتاك المساعد 13-14','لمبة خضرا لما يشتغل، ولمبة حمرا لما يفصل الأوفرلود','كابلات الباور والتحكم بالمقطع الصح، والأرضي للموتور'],
  hints:['ابدا بالباور: L1 L2 L3 ← قاطع 3P ← كونتاكتور 1-3-5 ← من 2-4-6 للأوفرلود 1-3-5 ← من 2-4-6 للموتور U1 V1 W1.',
   'دارة التحكم: L1 بعد القاطع 3P ← قاطع 1P ← أوفرلود 95-96 ← كبسة توقيف 11-12 ← كبسة تشغيل 13-14 ← كونتاكتور A1، وA2 على N.',
   'التثبيت: حط 13-14 تبع الكونتاكتور بالتوازي مع الكبسة الخضرا (نفس الطرفين).',
   'تيار الموتور تقريباً 14.5A: الكابل 1.5mm² بيحمل 14A بس، فبدّك 2.5mm². القاطع 16A، والأوفرلود على 14.5 لـ15.5A.',
   'اللمبة الخضرا بالتوازي مع كويل الكونتاكتور (A1-A2). اللمبة الحمرا: من 97 ← اللمبة ← N، و97 بياخد من نفس الطرف اللي داخل على 95.'],
  setup(add){add('src',380,70);const m=add('motor',700,860);m.kw=7.5;},
  check(board){const {out,ok}=R();
   const m=all(board,'motor')[0],I=m?motorI(m.kw):0;
   const kcs=all(board,'kc'),ols=all(board,'ol'),m3=all(board,'mcb3'),m1=all(board,'mcb1');
   const g=all(board,'pbg'),r=all(board,'pbr').concat(all(board,'es'));
   const lg=all(board,'lamp',c=>c.color==='g'),lr=all(board,'lamp',c=>c.color==='r');
   ok(m&&kcs.length&&ols.length&&m3.length&&m1.length&&g.length&&r.length,'كل القطع موجودة','لازم: قاطع 3P، قاطع 1P، كونتاكتور، أوفرلود، كبسة خضرا، كبسة حمرا.');
   if(!m||!g.length||!r.length||!ols.length)return out;
   const S=sandbox(board);const mm=()=>S.get(m.id).st;const lamp=arr=>arr.some(l=>S.get(l.id).st.on);const why=h=>S.fault()||h;
   S.run(400);ok(mm().m==='off'&&!S.b.blown,'الموتور واقف أوّل ما تشغّل الكهربا',why('الموتور اشتغل لحالو: الكبسة الخضرا لازم تكون NO.'));
   S.get(g[0].id).st.p=true;S.run(500);const on1=mm().m,gl=lamp(lg);
   ok(on1==='run','بتكبس الخضرا: الموتور بيشتغل',why(on1==='hum'?'الموتور عم يزنّ: في فاز ناقص بالباور.':'ما اشتغل: شيك دارة التحكم من L1 لـA1، وA2 على N، والباور للموتور.'));
   S.get(g[0].id).st.p=false;S.run(600);
   ok(mm().m==='run','بتترك الكبسة: الموتور بيضلّ شغّال (تثبيت)',why('وقف لما تركت الكبسة: حط 13-14 تبع الكونتاكتور بالتوازي مع الكبسة الخضرا.'));
   ok(lg.length&&gl,'اللمبة الخضرا بتضوي وهو شغّال',why('حط لمبة خضرا بالتوازي مع كويل الكونتاكتور.'));
   S.get(r[0].id).st.p=true;S.run(500);const s1=mm().m;S.get(r[0].id).st.p=false;S.run(500);
   ok(s1==='off'&&mm().m==='off','الكبسة الحمرا بتوقّف، والموتور بيضلّ واقف بعدها',why('الحمرا لازم تكون NC (11-12) على السلسلة قبل الخضرا والتثبيت.'));
   S.press(g[0].id);const ol=ols[0];S.get(ol.id).st.trip=true;S.run(600);
   ok(mm().m==='off','الأوفرلود إذا فصل، الموتور بيوقف',why('وصّل 95-96 تبع الأوفرلود على السلسلة بدارة التحكم.'));
   ok(lr.length&&lamp(lr),'اللمبة الحمرا بتضوي لما يفصل الأوفرلود',why('حط لمبة حمرا على 97-98 تبع الأوفرلود.'));
   S.get(ol.id).st.trip=false;S.get(ol.id).st.heat=0;S.run(300);S.press(g[0].id);S.run(20000);
   const olt=S.ev.find(e=>e.k==='oltrip'),brk=S.ev.find(e=>e.k==='trip'&&e.why==='over');
   ok(mm().m==='run'&&!olt&&!brk,'بيضلّ شغّال 20 ثانية بلا ما يفصل شي',why(olt?`الأوفرلود فصل لحالو: ظبطو على تيار الموتور (${fmt(I)}A تقريباً).`:brk?'القاطع فصل: صغير على تيار الموتور.':'الموتور وقف لحالو. شيك التثبيت والحماية.'));
   ok(ol.setA>=I*0.98&&ol.setA<=I*1.1,'الأوفرلود مضبوط صح',`ظبّط الأوفرلود بين ${fmt(I)} و${fmt(I*1.1)}A (اكبس عالدولاب الأزرق).`);
   ok(m3.length&&m3[0].rating>=I,'قاطع الموتور أكبر من تيار الموتور',`تيار الموتور ${fmt(I)}A: القاطع لازم يكون أكبر منو (16A).`);
   common(S,ok,{pe:[[m.id,'الموتور']]});return out;}},

 {id:'rev',n:2,course:'classic',title:'عكس اتجاه موتور',icon:'🔄',
  brief:'موتور 5.5kW لازم يدور لقدّام ولورا (متل باب كراج أو ونش). كبسة خضرا لقدّام، كبسة خضرا تانية لورا، وكبسة حمرا بتوقّف. ممنوع الكونتاكتورين يسحبوا سوا!',
  goals:['كونتاكتور لقدّام (KM1) وكونتاكتور لورا (KM2)','KM2 بيبدّل فازين (L1 مع L3) عالموتور','حماية Interlock: NC تبع كل كونتاكتور بدارة التاني','تثبيت لكل اتجاه، وكبسة توقيف مشتركة','أوفرلود وقواطع وكابلات صح، وأرضي للموتور'],
  hints:['الباور: قاطع 3P ← KM1 1-3-5 وKM2 1-3-5 من نفس المخارج. من KM1 2-4-6 دغري للأوفرلود. من KM2 2-4-6 للأوفرلود بس بعد ما تبدّل: KM2·2 ← أوفرلود·5، وKM2·6 ← أوفرلود·1.',
   'التحكم: قاطع 1P ← 95-96 ← كبسة توقيف ← بعدها بتفرّق لخطّين: واحد لكبسة لقدّام وواحد لكبسة لورا.',
   'خط لقدّام: كبسة خضرا 13-14 ← KM2 21-22 (NC) ← KM1 A1. وخط لورا: كبسة خضرا تانية ← KM1 21-22 ← KM2 A1. وA2 لتنيناتن على N.',
   'التثبيت: KM1 13-14 بالتوازي مع كبسة لقدّام، وKM2 13-14 بالتوازي مع كبسة لورا.',
   'موتور 5.5kW تيارو 10.6A: كابل 2.5mm² مع قاطع 16A، والأوفرلود على 10.6 لـ11.6A.'],
  setup(add){add('src',380,70);const m=add('motor',700,860);m.kw=5.5;},
  check(board){const {out,ok}=R();
   const m=all(board,'motor')[0],I=m?motorI(m.kw):0,kcs=all(board,'kc'),ols=all(board,'ol'),g=all(board,'pbg'),r=all(board,'pbr').concat(all(board,'es'));
   ok(m&&kcs.length>=2&&ols.length&&g.length>=2&&r.length&&all(board,'mcb3').length&&all(board,'mcb1').length,'كل القطع موجودة','لازم: قاطع 3P، قاطع 1P، 2 كونتاكتور، أوفرلود، 2 كبسة خضرا، كبسة حمرا.');
   if(!m||g.length<2||!r.length)return out;
   const S=sandbox(board);const mm=()=>S.get(m.id).st;const why=h=>S.fault()||h;
   S.run(300);ok(mm().m==='off','الموتور واقف بالأوّل',why('الموتور اشتغل لحالو.'));
   S.press(g[0].id);const d1=mm().m==='run'?mm().dir:0;
   ok(d1,'الكبسة الأولى بتشغّل الموتور وبيضلّ شغّال',why(mm().m==='hum'?'في فاز ناقص بالباور.':'ما اشتغل أو ما ثبت: شيك التثبيت 13-14 والإنترلوك.'));
   S.press(g[1].id);ok(mm().m==='run'&&mm().dir===d1&&!S.fault(),'وهوّي شغّال، كبسة الاتجاه التاني ما بتعمل شي (Interlock)',why('لما كبست الاتجاه التاني صار شي غلط: لازم NC الكونتاكتور الشغّال يمنع التاني يسحب.'));
   S.press(r[0].id);ok(mm().m==='off','الكبسة الحمرا بتوقّف',why('الحمرا NC على السلسلة قبل الخطّين.'));
   S.press(g[1].id);const d2=mm().m==='run'?mm().dir:0;
   ok(d2&&d2===-d1,'الكبسة التانية بتشغّلو بالعكس',why(d2===d1?'دار بنفس الاتجاه: لازم KM2 يبدّل فازين (L1 مع L3) قبل الموتور.':'ما اشتغل بالعكس: شيك خط الكبسة التانية وKM2.'));
   S.press(r[0].id);const b2=sandbox(board);b2.run(300);const k1=b2.get(g[0].id),k2=b2.get(g[1].id);k1.st.p=true;k2.st.p=true;b2.run(500);k1.st.p=false;k2.st.p=false;b2.run(300);
   ok(!b2.fault(),'حتى لو كبست الكبستين سوا، ما في قصر',b2.fault()?'كبست التنتين سوا وصار قصر: الإنترلوك ناقص. حط KM2 21-22 بخط KM1، وKM1 21-22 بخط KM2.':'');
   S.press(g[0].id);S.run(15000);const olt=S.ev.find(e=>e.k==='oltrip');
   ok(mm().m==='run'&&!olt,'بيضلّ شغّال 15 ثانية بلا ما يفصل',why(olt?`الأوفرلود فصل: ظبطو على ${fmt(I)}A تقريباً.`:'وقف لحالو.'));
   const ol=ols[0];ok(ol&&ol.setA>=I*0.98&&ol.setA<=I*1.1,'الأوفرلود مضبوط صح',`ظبّط الأوفرلود بين ${fmt(I)} و${fmt(I*1.1)}A.`);
   common(S,ok,{pe:[[m.id,'الموتور']]});return out;}},

 {id:'yd',n:3,course:'classic',title:'ستار دلتا مع تايمر',icon:'⭐',
  brief:'موتور 11kW كبير، إذا اشتغل مباشرة بيسحب تيار كتير. شغّلو ستار أوّل، وبعد التايمر بيقلب دلتا لحالو. ممنوع ستار ودلتا يسحبوا سوا!',
  goals:['KM1 رئيسي، KM2 ستار، KM3 دلتا، وتايمر On-delay','بتكبس تشغيل: KM1 + KM2 (ستار)، وبعد الوقت: KM1 + KM3 (دلتا)','Interlock بين KM2 وKM3','الأوفرلود بعد KM1 مضبوط على 0.58 × تيار الموتور','كبسة توقيف، وكابلات وقواطع صح، وأرضي'],
  hints:['الباور: قاطع 3P ← KM1 1-3-5 وKM3 1-3-5. KM1 2-4-6 ← أوفرلود 1-3-5 ← الموتور U1 V1 W1.',
   'دلتا: KM3 2-4-6 ← الموتور W2 V2... بالترتيب: KM3·2 ← W2، KM3·4 ← U2، KM3·6 ← V2.',
   'ستار: KM2 1-3-5 ← الموتور U2 V2 W2، وجسّر KM2 2 مع 4 مع 6 (نقطة الستار).',
   'التحكم: 95-96 ← توقيف ← تشغيل ← KM1 A1 (وتثبيت KM1 13-14). بعد التثبيت: التايمر A1، وKT 15-16 ← KM3 21-22 ← KM2 A1، وKT 15-18 ← KM2 21-22 ← KM3 A1.',
   'موتور 11kW تيارو 21A: القاطع 25A مع كابل 4mm² للخط الرئيسي. كابلات الموتور بيمرق فيها 0.58 من التيار (12.3A)، والأوفرلود على 12.3A.'],
  setup(add){add('src',380,70);const m=add('motor6',720,840);m.kw=11;},
  check(board){const {out,ok}=R();
   const m=all(board,'motor6')[0],I=m?motorI(m.kw):0,kcs=all(board,'kc'),t=all(board,'tmr'),g=all(board,'pbg'),r=all(board,'pbr').concat(all(board,'es')),ols=all(board,'ol');
   ok(m&&kcs.length>=3&&t.length&&g.length&&r.length&&ols.length&&all(board,'mcb3').length,'كل القطع موجودة','لازم: قاطع 3P، قاطع 1P، 3 كونتاكتورات، تايمر، أوفرلود، كبسة خضرا وحمرا.');
   if(!m||!t.length||!g.length||!r.length)return out;
   const S=sandbox(board);const mm=()=>S.get(m.id).st;const why=h=>S.fault()||h;const T=S.get(t[0].id).sec;
   S.run(300);ok(mm().m==='off','الموتور واقف بالأوّل',why('اشتغل لحالو.'));
   const kcs2=all(board,'kc');S.get(g[0].id).st.p=true;S.run(300);const onStar=kcs2.filter(k=>S.get(k.id).st.e).map(k=>k.id);const pStar={};for(const k of kcs2)pStar[k.id]=S.E.path(k.id+'.A1');S.get(g[0].id).st.p=false;S.run(300);const st1=mm().m;
   ok(st1==='star','بتكبس تشغيل: بيبلّش ستار',why(st1==='delta'?'بلّش دلتا دغري: لازم KM2 (ستار) يسحب أوّل والتايمر يقلبو.':st1==='hum'?'عم يزنّ: الستار أو الباور ناقص.':'ما بلّش: شيك KM1 وKM2 والتثبيت.'));
   S.run((T+1.2)*1000);const st2=mm().m;
   ok(st2==='delta','بعد التايمر بيقلب دلتا لحالو',why(st2==='star'?'ضلّ ستار: KT 15-18 لازم يشغّل KM3، وKT 15-16 يفصل KM2.':'ما قلب دلتا صح: شيك وصل KM3 عالموتور W2 U2 V2.'));
   ok(!S.ev.find(e=>e.k==='trip'),'ما صار قصر وقت القلبة (ستار ودلتا ما سحبوا سوا)',why('في لحظة سحبوا KM2 وKM3 سوا: حط NC تبع كل واحد بدارة التاني.'));
   {const onDelta=kcs2.filter(k=>S.get(k.id).st.e).map(k=>k.id);const star=onStar.find(x=>!onDelta.includes(x)),delta=onDelta.find(x=>!onStar.includes(x));
    const nc=(p,id)=>p.some(e=>e==='c:'+id+':21'||e==='c:'+id+':31');
    const ok1=star&&delta&&nc(pStar[star]||[],delta)&&nc(S.E.path(delta+'.A1'),star);
    ok(ok1,'Interlock بين الستار والدلتا (NC كل واحد بدارة التاني)','حط 21-22 تبع كونتاكتور الدلتا على خط كويل الستار، و21-22 تبع الستار على خط كويل الدلتا. هيك مستحيل يسحبوا سوا.');}
   ok(m&&mm().dir,'الموتور عم يدور',why(''));
   S.press(r[0].id);ok(mm().m==='off','الكبسة الحمرا بتوقّف',why('الحمرا NC على السلسلة.'));
   S.press(g[0].id,300);S.run((T+1)*1000+12000);const olt=S.ev.find(e=>e.k==='oltrip');
   ok(mm().m==='delta'&&!olt,'بيضلّ شغّال دلتا بلا ما يفصل',why(olt?`الأوفرلود فصل: إذا بعد KM1، ظبطو على ${fmt(I*0.58)}A (0.58 × ${fmt(I)}A).`:'وقف لحالو.'));
   const ol=ols[0];ok(ol&&ol.setA>=I*0.55&&ol.setA<=I*0.65,'الأوفرلود مضبوط على تيار الملفّ (0.58 × I)',`الأوفرلود بعد KM1 بيشوف تيار الملف: ظبطو على ${fmt(I*0.58)}A تقريباً.`);
   common(S,ok,{pe:[[m.id,'الموتور']]});return out;}},

 {id:'ats',n:4,course:'classic',title:'ATS بـ3 مصادر: دولة، موتير، إنفرتر',icon:'🔀',
  brief:'بيت حملو 5kW. الأولوية للدولة، إذا انقطعت بياخد من الموتير، وإذا الموتير كمان مقطوع بياخد من الإنفرتر. ولما ترجع الدولة، بيرجع عليها لحالو. ممنوع مصدرين يلتقوا!',
  goals:['كونتاكتور لكل مصدر (بيقطع L وN)','ريليه للدولة وريليه للموتير بيعطوا الأولوية','Interlock: كل كونتاكتور فيه NC من التانيين','قاطع لكل مصدر، وكابلات بتحمل 21.7A'],
  hints:['كل مصدر: L ← قاطع ← كونتاكتور 1 (L)، وN ← كونتاكتور 3 (N). مخارج الكونتاكتورات 2 مع بعض للبيت L، و4 مع بعض للبيت N.',
   'ريليه الدولة KA1: كويلو على الدولة نفسها (بعد قاطعها). ريليه الموتير KA2 على الموتير.',
   'KM1 (دولة): L الدولة ← KA1 11-14 ← KM2 21-22 ← KM3 21-22 ← KM1 A1، وA2 على N الدولة.',
   'KM2 (موتير): L الموتير ← KA1 21-22 (يعني الدولة مقطوعة) ← KM1 21-22 ← KM3 31-32 ← KM2 A1، وA2 على N الموتير.',
   'KM3 (إنفرتر): L الإنفرتر ← KA1 31-32 ← KA2 21-22 ← KM1 31-32 ← KM2 31-32 ← KM3 A1. البيت 21.7A: كابل 4mm² وقاطع 25A.'],
  setup(add){const a=add('src1',140,60);a.kind='grid';const b=add('src1',600,60);b.kind='gen';const c=add('src1',1060,60);c.kind='inv';const h=add('load',760,900);h.kind='house';h.watt=5000;},
  check(board){const {out,ok}=R();
   const src=k=>all(board,'src1',c=>c.kind===k)[0];const G=src('grid'),M=src('gen'),V=src('inv'),H=all(board,'load',c=>c.kind==='house')[0];
   ok(G&&M&&V&&H&&all(board,'kc').length>=3,'كل القطع موجودة','لازم 3 مصادر، البيت، و3 كونتاكتورات عالأقل.');
   if(!G||!M||!V||!H)return out;
   const S=sandbox(board);const set=(g,m,v)=>{S.get(G.id).st.off=!g;S.get(M.id).st.off=!m;S.get(V.id).st.off=!v;S.run(700);};
   const from=()=>{const h=S.get(H.id);if(!h.st.on)return null;const l=S.E.liveSrc(H.id+'.L');return l?{[G.id]:'grid',[M.id]:'gen',[V.id]:'inv'}[l.s]:null;};
   const nm={grid:'الدولة',gen:'الموتير',inv:'الإنفرتر'};const why=h=>S.fault()||h;
   const step=(g,m,v,exp,txt)=>{set(g,m,v);const f=from();ok(f===exp,txt,why(f?`البيت أخد من ${nm[f]} بدل ${nm[exp]||'ولا شي'}.`:(exp?`البيت ما أخد كهربا. لازم ياخد من ${nm[exp]}.`:'')));};
   step(1,1,1,'grid','كل المصادر موجودة: البيت عالدولة');
   step(0,1,1,'gen','الدولة انقطعت: البيت عالموتير');
   step(0,0,1,'inv','الدولة والموتير مقطوعين: البيت عالإنفرتر');
   step(0,1,1,'gen','رجع الموتير: البيت بيرجع عالموتير');
   step(1,1,1,'grid','رجعت الدولة: البيت بيرجع عالدولة لحالو');
   step(1,0,1,'grid','الموتير انقطع والدولة موجودة: بيضلّ عالدولة');
   set(0,0,0);ok(!S.get(H.id).st.on,'كل المصادر مقطوعة: البيت ما في كهربا',why(''));
   set(1,1,1);S.run(20000);
   ok(!S.ev.find(e=>e.k==='trip'&&e.why==='over')&&from()==='grid','بيضلّ 20 ثانية عالحمل بلا ما يفصل شي',why('فصل قاطع: صغير على حمل البيت (21.7A) أو الكابل.'));
   common(S,ok,{pe:[[H.id,'البيت']]});return out;}},

 {id:'fire',n:5,course:'classic',title:'إنذار حريق ومراوح شفط',icon:'🔥',
  brief:'بمطعم: بالوضع العادي المكيّف شغّال. إذا الحسّاس شمّ دخان: الجرس بيضرب، مروحة الشفط بتشتغل، والمكيّف بينقطع. الإنذار بيضلّ ماسك لحتى حدا يكبس Reset، حتى لو راح الدخان.',
  goals:['ريليه إنذار (KA) بيمسك حالو (تثبيت)','كبسة Reset حمرا بتفكّ الإنذار','الجرس والمروحة بيشتغلوا مع الإنذار','المكيّف على كونتاكتور، بينقطع وقت الإنذار','قواطع وكابلات صح للمكيّف والمروحة'],
  hints:['الحسّاس: L (بعد قاطع التحكم) ← حسّاس C ← NO ← KA A1، وA2 على N.',
   'التثبيت: من نفس L ← كبسة Reset 11-12 ← KA 11-14 ← KA A1.',
   'الإنذار: L ← KA 21-24 ← الجرس X1 وكويل كونتاكتور المروحة A1. وX2 وA2 على N.',
   'المكيّف: L ← KA 31-32 (NC) ← كويل كونتاكتور المكيّف A1. يعني بالعادي شغّال، ووقت الإنذار بيوقف.',
   'المكيّف 2.6kW = 11.3A: قاطع 16A وكابل 2.5mm². المروحة 0.75kW = 3.3A: قاطع 6 أو 10A وكابل 1.5mm².'],
  setup(add){const g=add('src1',160,60);g.kind='grid';add('smoke',1180,300);add('siren',1360,300);const f=add('load',1120,900);f.kind='fan';f.watt=750;const a=add('load',1320,900);a.kind='ac';a.watt=2600;},
  check(board){const {out,ok}=R();
   const sm=all(board,'smoke')[0],sr=all(board,'siren')[0],fan=all(board,'load',c=>c.kind==='fan')[0],ac=all(board,'load',c=>c.kind==='ac')[0],ka=all(board,'relay'),rs=all(board,'pbr');
   ok(sm&&sr&&fan&&ac&&ka.length&&rs.length&&all(board,'kc').length>=2,'كل القطع موجودة','لازم: ريليه KA، كبسة Reset حمرا، وكونتاكتورين (مروحة ومكيّف).');
   if(!sm||!sr||!fan||!ac||!rs.length)return out;
   const S=sandbox(board);const on=x=>S.get(x.id).st.on;const why=h=>S.fault()||h;
   S.run(600);ok(on(ac)&&!on(fan)&&!on(sr),'بالعادي: المكيّف شغّال، والمروحة والجرس طافيين',why(!on(ac)?'المكيّف لازم يشتغل بالعادي: غذّيه عبر NC تبع KA.':'الجرس أو المروحة شغّالين بلا دخان.'));
   S.get(sm.id).st.smoke=true;S.run(700);
   ok(on(sr),'في دخان: الجرس بيضرب',why('الجرس لازم يشتغل من KA 21-24.'));
   ok(on(fan),'في دخان: مروحة الشفط بتشتغل',why('كونتاكتور المروحة لازم يسحب من KA.'));
   ok(!on(ac),'في دخان: المكيّف بينقطع',why('المكيّف لازم يوقف: كويلو عبر KA 31-32 (NC).'));
   S.get(sm.id).st.smoke=false;S.run(700);
   ok(on(sr)&&on(fan),'راح الدخان: الإنذار بيضلّ ماسك',why('الإنذار وقف لحالو: لازم KA يثبّت حالو بـ11-14 عبر كبسة Reset.'));
   S.press(rs[0].id,400);S.run(500);
   ok(!on(sr)&&!on(fan)&&on(ac),'بتكبس Reset: كل شي بيرجع عالعادي',why('Reset (11-12) لازم يقطع خط التثبيت تبع KA.'));
   S.run(20000);ok(on(ac)&&!S.ev.find(e=>e.k==='trip'),'المكيّف بيضلّ 20 ثانية بلا ما يفصل شي',why('فصل القاطع: صغير على المكيّف (11.3A).'));
   S.get(sm.id).st.smoke=true;S.run(15000);ok(on(fan)&&!S.ev.find(e=>e.k==='trip'),'المروحة بتضلّ شغّالة وقت الإنذار',why('فصل شي وقت الإنذار.'));
   common(S,ok,{pe:[[ac.id,'المكيّف'],[fan.id,'المروحة']]});return out;}},

 /* ===================== كورس الكهربا ===================== */
 {id:'room',n:1,course:'electro',title:'غرفة: ضو بمفتاحين درج + بريز',icon:'💡',
  brief:'غرفة نوم: لمبة سقف بتنضوى وبتنطفى من مفتاحين (واحد عالباب وواحد حد التخت)، وبريز. كل وحدة على قاطع لحالها.',
  goals:['قاطع للضو 10A وقاطع للبريز 16A','مفتاحين درج: الضو بيتغيّر من أي واحد فيهن','البريز فيه L وN وأرضي PE','كابلات: 1.5mm² للضو، و2.5mm² للبريز'],
  hints:['الضو: L ← قاطع 10A ← مفتاح درج 1 (C).','بين المفتاحين: L1 مع L1، وL2 مع L2 (هول الـtravellers).','مفتاح درج 2 (C) ← اللمبة L، واللمبة N ← N.','البريز: L ← قاطع 16A ← البريز L، والبريز N ← N، والبريز PE ← PE. كلّن 2.5mm².'],
  setup(add){const g=add('src1',160,60);g.kind='grid';add('bulb',900,300);add('sw2',700,560);add('sw2',1100,560);add('socket',1300,860);},
  check(board){const {out,ok}=R();
   const bu=all(board,'bulb')[0],sws=all(board,'sw2'),so=all(board,'socket')[0];
   ok(bu&&sws.length>=2&&so&&all(board,'mcb1').length>=2,'كل القطع موجودة','لازم قاطعين 1P (ضو وبريز).');
   if(!bu||sws.length<2||!so)return out;
   const S=sandbox(board);const why=h=>S.fault()||h;const res=[];
   for(const [a,b] of [[0,0],[1,0],[1,1],[0,1]]){S.get(sws[0].id).st.on=!!a;S.get(sws[1].id).st.on=!!b;S.run(300);res.push(S.get(bu.id).st.on);}
   const changes=[0,1,2].filter(i=>res[i]!==res[i+1]).length+(res[3]!==res[0]?1:0);
   ok(changes===4,'الضو بيتغيّر من أي مفتاح',why(res.every(x=>!x)?'الضو ما ضوى أبداً: شيك L ← المفتاح الأوّل C، والمفتاح التاني C ← اللمبة، واللمبة N.':'في وضعيات ما بيتغيّر فيها: وصّل L1 مع L1 وL2 مع L2 بين المفتاحين.'));
   S.run(300);ok(S.get(so.id).st.v,'البريز فيه 230V بين L وN',why('وصّل البريز L وN.'));
   const pe=S.b.wires.some(w=>w.a===so.id+'.PE'||w.b===so.id+'.PE');ok(pe,'البريز موصول عالأرضي',"وصّل PE تبع البريز على PE تبع المصدر.");
   const brk=p=>{for(const e of p){const m=/^c:([^:]+):/.exec(e);if(m){const c=S.get(m[1]);if(c&&c.type==='mcb1')return c;}}return null;};
   {const i=res.indexOf(true);const cmb=[[0,0],[1,0],[1,1],[0,1]][i<0?0:i];S.get(sws[0].id).st.on=!!cmb[0];S.get(sws[1].id).st.on=!!cmb[1];S.run(200);}const qb=brk(S.E.path(bu.id+'.L')),qs=brk(S.E.path(so.id+'.L'));
   ok(qb&&qs&&qb.id!==qs.id,'الضو والبريز كل واحد على قاطع لحالو',why(qb&&qs?'الضو والبريز عنفس القاطع: افصلن.':'في دارة بلا قاطع.'));
   ok(qs&&qs.rating===16,'قاطع البريز 16A',qs?`قاطع البريز ${qs.rating}A: البريز بيتحمّل 16A، فالقاطع 16A.`:'حط قاطع للبريز.');
   ok(qb&&qb.rating<=10,'قاطع الضو 10A أو أقل',qb?`قاطع الضو ${qb.rating}A: كبير على دارة ضو بـ1.5mm².`:'حط قاطع للضو.');
   const thin=S.b.wires.filter(w=>(w.a.startsWith(so.id+'.')||w.b.startsWith(so.id+'.'))&&!/\.PE$/.test(w.a+w.b)&&w.mm2<2.5);
   ok(!thin.length,'شرايط البريز 2.5mm²','شرايط البريز لازم 2.5mm² (بتحمل 19A) لأنو البريز 16A.');
   common(S,ok);return out;}},

 {id:'flat',n:2,course:'electro',title:'تابلو شقة مع ديفرنسيال',icon:'🏠',
  brief:'تابلو شقة صغيرة: ديفرنسيال 30mA بيحمي كل الشقة، وتحتو 3 قواطع: ضو، بريزات، وسخّان 3kW. إذا صار تسريب عالأرض، الديفرنسيال بيفصل.',
  goals:['ديفرنسيال 2P 30mA بأول التابلو (L وN)','3 دارات، كل وحدة على قاطع: ضو، بريز، سخّان','كل الـN بيرجعوا من تحت الديفرنسيال','السخّان 13A: قاطع 16A وكابل 2.5mm²','الأرضي للسخّان والبريز'],
  hints:['الدولة L ← ديفرنسيال 1، الدولة N ← ديفرنسيال N1.','تحت الديفرنسيال: 2 ← القواطع التلاتة (فوق)، وN2 ← N كل الدارات.','أي N بيرجع دغري عالدولة بلا ما يمرق بالديفرنسيال بيخلّيه يفصل لحالو!','السخّان: قاطع 16A ← سخّان L بـ2.5mm²، وN من N2، وPE على PE.'],
  setup(add){const g=add('src1',160,60);g.kind='grid';add('bulb',820,860);add('socket',1040,860);const h=add('load',1240,860);h.kind='heater';h.watt=3000;},
  check(board){const {out,ok}=R();
   const rc=all(board,'rcd')[0],bu=all(board,'bulb')[0],so=all(board,'socket')[0],he=all(board,'load',c=>c.kind==='heater')[0];
   ok(rc&&bu&&so&&he&&all(board,'mcb1').length>=3,'كل القطع موجودة','لازم: ديفرنسيال و3 قواطع 1P.');
   if(!rc||!bu||!so||!he)return out;
   const S=sandbox(board);const why=h=>S.fault()||h;S.run(800);
   ok(S.get(bu.id).st.on&&S.get(so.id).st.v&&S.get(he.id).st.on,'الضو والبريز والسخّان فيهن كهربا',why(S.ev.find(e=>e.k==='rcd')?'الديفرنسيال فصل لحالو: في N راجع من برّاتو. كل الـN لازم من N2.':'في دارة ما فيها كهربا.'));
   const thru=S.E.path(he.id+'.L').some(e=>e.startsWith('c:'+rc.id+':'))&&S.E.path(so.id+'.L').some(e=>e.startsWith('c:'+rc.id+':'))&&S.E.path(bu.id+'.L').some(e=>e.startsWith('c:'+rc.id+':'));
   ok(thru,'كل الدارات تحت الديفرنسيال',why('في دارة مش ماخدة من تحت الديفرنسيال.'));
   S.run(15000);ok(!S.ev.find(e=>e.k==='rcd'||e.k==='trip'),'15 ثانية شغّال بلا ما يفصل شي',why(S.ev.find(e=>e.k==='rcd')?'الديفرنسيال فصل: في N راجع من برّاتو.':'فصل قاطع: صغير على الحمل.'));
   S.get(he.id).st.leak=true;S.run(500);ok(S.ev.find(e=>e.k==='rcd')&&!S.get(he.id).st.on,'تسريب بالسخّان: الديفرنسيال بيفصل',why('ما فصل: لازم السخّان يكون تحت الديفرنسيال وموصول عالأرضي.'));
   const B2=sandbox(board);B2.run(300);B2.get(rc.id).st.trip=true;B2.run(300);ok(!B2.get(bu.id).st.on&&!B2.get(he.id).st.on&&!B2.get(so.id).st.v,'زر TEST بالديفرنسيال بيقطع كل الشقة','في دارة ما انقطعت: كلّن لازم من تحت الديفرنسيال.');
   common(S,ok,{pe:[[he.id,'السخّان'],[so.id,'البريز']]});return out;}},

 {id:'load',n:3,course:'electro',title:'سخّان ومكيّف: حساب الحمل',icon:'🧮',
  brief:'بدّك تركّب سخّان 3kW ومكيّف 2.6kW بنفس البيت. احسب تيار كل واحد، اختار القاطع والكابل، وحط قاطع رئيسي بيتحمّل التنين سوا.',
  goals:['كل جهاز على قاطع لحالو','السخّان 13A والمكيّف 11.3A: قاطع 16A وكابل 2.5mm² لكل واحد','قاطع رئيسي على المجموع (24.3A): 25A مع كابل 4mm²','التنين شغّالين دقيقة بلا ما يفصل شي','الأرضي للتنين'],
  hints:['التيار = القدرة ÷ 230. السخّان 3000÷230 = 13A، والمكيّف 2600÷230 = 11.3A.','المجموع 24.3A: القاطع الرئيسي 25A، والكابل من الدولة للرئيسي ومنو للقواطع 4mm² (بيحمل 26A).','إذا حطّيت التنين على قاطع 16A واحد، بيفصل بعد شوي!'],
  setup(add){const g=add('src1',160,60);g.kind='grid';const h=add('load',900,860);h.kind='heater';h.watt=3000;const a=add('load',1180,860);a.kind='ac';a.watt=2600;},
  check(board){const {out,ok}=R();
   const he=all(board,'load',c=>c.kind==='heater')[0],ac=all(board,'load',c=>c.kind==='ac')[0];
   ok(he&&ac&&all(board,'mcb1').length>=3,'كل القطع موجودة','لازم 3 قواطع: رئيسي، سخّان، مكيّف.');
   if(!he||!ac)return out;
   const S=sandbox(board);const why=h=>S.fault()||h;S.run(600);
   ok(S.get(he.id).st.on&&S.get(ac.id).st.on,'السخّان والمكيّف فيهن كهربا',why('في جهاز ما فيه كهربا.'));
   const brk=p=>p.map(e=>/^c:([^:]+):/.exec(e)).filter(Boolean).map(m=>S.get(m[1])).filter(c=>c&&c.type==='mcb1');
   const bh=brk(S.E.path(he.id+'.L')),ba=brk(S.E.path(ac.id+'.L'));
   ok(bh.length&&ba.length&&bh[0].id!==ba[0].id,'كل جهاز على قاطع لحالو',why('السخّان والمكيّف عنفس القاطع.'));
   const main=bh.find(c=>ba.some(x=>x.id===c.id));
   ok(main,'في قاطع رئيسي فوق التنين',why('حط قاطع رئيسي بين الدولة وقواطع الأجهزة.'));
   ok(main&&main.rating>=25,'القاطع الرئيسي بيتحمّل المجموع (24.3A)',main?`الرئيسي ${main.rating}A أصغر من المجموع 24.3A: خلّيه 25A.`:'');
   S.run(60000);ok(!S.ev.find(e=>e.k==='trip'),'دقيقة كاملة شغّالين بلا ما يفصل شي',why('فصل قاطع: شوف أي واحد صغير على تيارو.'));
   common(S,ok,{pe:[[he.id,'السخّان'],[ac.id,'المكيّف']]});return out;}},
];
window.PROJECTS=PROJECTS;window.PSANDBOX=sandbox;
})();
