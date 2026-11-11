// مسار التعلّم: الكتاب ← كورس الأسئلة ← التقرير ← المشاريع
// بيقرا تقدّم الكورسات من التلفون (نفس localStorage تبع الكورسات) وبيقرّر إيمتى تنفتح المشاريع.
'use strict';
(function(){
const C={
 course:{key:'electro-course-v1',book:'الكهرباء بالمختصر المفيد',title:'كورس الكهربا',icon:'⚡',url:'course/',proj:'panel/',projN:3,total:18},
 classic:{key:'classic-course-v1',book:'الكلاسيك كنترول بالمختصر المفيد',title:'كورس الكلاسيك كنترول',icon:'🎛️',url:'classic/',proj:'panel/',projN:5,total:25},
 solar:{key:'solar-course-v1',book:'الطاقة الشمسية بالمختصر المفيد',title:'كورس الطاقة الشمسية',icon:'☀️',url:'solar/',proj:'sim/#projects',projN:6,total:32}};
const MAX_MISTAKES=15; // المشاريع بتنفتح بس يخلّص الكورس بـ15 غلطة أو أقل
const CERT_MAX=5; // الشهادة من أنور: 5 غلطات أو أقل
const get=k=>{try{return localStorage.getItem(k);}catch(e){return null;}};
const set=(k,v)=>{try{localStorage.setItem(k,v);}catch(e){}};
// فتح المشاريع للأستاذ (للتجربة): ?teacher=mea بأي صفحة
try{if(/[?&]teacher=mea\b/.test(location.search))set('meaTeacher','1');}catch(e){}
function status(id){const c=C[id];let S=null;try{S=JSON.parse(get(c.key)||'null');}catch(e){}
 const read=get('meaRead_'+id)==='1';
 const rules=S&&S.rules?S.rules:{};let mistakes=0,answers=0,passed=0;const per=[];
 for(const n in rules){const r=rules[n]||{};mistakes+=r.mistakes||0;answers+=r.answers||0;if(r.passed)passed++;per.push({n:+n,m:r.mistakes||0,a:r.answers||0,p:!!r.passed,missed:r.missed||{}});}
 const finished=!!(S&&S.finishedAt);
 const total=c.total;
 const excellent=finished&&mistakes<=MAX_MISTAKES,cert=finished&&mistakes<=CERT_MAX;
 const teacher=get('meaTeacher')==='1';
 // أضعف القواعد: اللي فيها أكتر غلطات (2 أو أكتر، أو أكتر من 20% من أجوبتها)
 const weak=per.filter(r=>r.m>=2||(r.a&&r.m/r.a>0.2)).sort((a,b)=>b.m-a.m);
 return {id,c,cert,read,started:!!S,passed,total,mistakes,answers,finished,excellent,unlocked:excellent||teacher,teacher,weak,per,current:S?S.current:1};}
function markRead(id,v){set('meaRead_'+id,v?'1':'0');}
let RULES=null;
function rules(){if(RULES)return Promise.resolve(RULES);const base=(document.querySelector('script[src*="path.js"]')||{}).src||'';const u=base.replace(/path\.js.*$/,'rules.json');
 return fetch(u).then(r=>r.json()).then(j=>RULES=j).catch(()=>({}));}
const QS={};
function questions(id){if(QS[id])return Promise.resolve(QS[id]);const base=(document.querySelector('script[src*="path.js"]')||{}).src||'';const u=base.replace(/app\/path\.js.*$/,'')+C[id].url+'questions.js';
 return fetch(u).then(r=>r.text()).then(t=>{let R=[];try{R=new Function(t+';return RULES;')();}catch(e){}return QS[id]=R;}).catch(()=>[]);}
// قفل بصفحة المشاريع: بيرجّع HTML إذا مقفول، أو null إذا مفتوح
function lockHTML(id,root){const s=status(id);if(s.unlocked)return null;root=root||'../';
 const step=!s.read?'📖 خلّص قراية الكتاب':!s.finished?`🎯 خلّص كورس الأسئلة (${s.passed}/${s.total} قاعدة)`:`📊 نتيجتك ${s.mistakes} غلطات: لازم ${MAX_MISTAKES} أو أقل`;
 return `<div class="lockc"><div style="font-size:40px">🔒</div><b>المشاريع بتنفتح بس تكون جاهز</b><p>${s.c.title}: ${step}.</p><a href="${root}app/#path">شوف مسارك ←</a></div>`;}
window.MEAPATH={C,status,markRead,rules,questions,lockHTML,MAX_MISTAKES,CERT_MAX};
})();
