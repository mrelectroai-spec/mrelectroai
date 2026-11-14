// مسار التعلّم: الكتاب ← كورس الأسئلة ← التقرير ← المشاريع
// بيقرا تقدّم الكورسات من التلفون (نفس localStorage تبع الكورسات) وبيقرّر إيمتى تنفتح المشاريع.
'use strict';
(function(){
const C={
 course:{tool:'book',q:180,price:'10$',key:'electro-course-v1',book:'الكهرباء بالمختصر المفيد',title:'كورس الكهربا',icon:'⚡',url:'course/',proj:'panel/',projN:3,total:18},
 classic:{tool:'book2',q:250,price:'',key:'classic-course-v1',book:'الكلاسيك كنترول بالمختصر المفيد',title:'كورس الكلاسيك كنترول',icon:'🎛️',url:'classic/',proj:'panel/',projN:5,total:25},
 solar:{tool:'book3',q:320,price:'',key:'solar-course-v1',book:'الطاقة الشمسية بالمختصر المفيد',title:'كورس الطاقة الشمسية',icon:'☀️',url:'solar/',proj:'sim/#projects',projN:6,total:32}};
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
 return {id,c,cert,read,started:!!S,passed,total,mistakes,answers,finished,excellent,unlocked:(excellent&&owned(id))||teacher,owned:owned(id),teacher,weak,per,current:S?S.current:1};}
// الكتاب مشتري؟ (مفتاح الكتاب انحط عهالتلفون، أو وضع الأستاذ)
function okVal(v){return v==='1'||(!!v&&v.slice(0,6)==='until:'&&v.slice(6)>=new Date().toISOString().slice(0,10));}
function owned(id){if(okVal(get('meaBook_'+id))||get('meaTeacher')==='1')return true;
 // اللي بلّشوا الكورس قبل القفل بيضل مفتوحلن
 try{const S=JSON.parse(get(C[id].key)||'null');if(S&&S.startedAt&&S.startedAt<Date.parse('2026-11-13T00:00:00+02:00')){set('meaBook_'+id,'1');return true;}}catch(e){}return false;}
const SB='https://utjpvjnhffapbwpbkkuc.supabase.co',SK='sb_publishable_wSY0Oa0SmW_Ipgaerw-zCA_CM_PZQvK';
// بصمة الجهاز = بصمة التلفون + رقم عشوائي خاص بهالتثبيت (المفتاح ما بيشتغل إلا عتلفون واحد)
function devId(){let d=get('meaDevId');if(!d){d=[...crypto.getRandomValues(new Uint8Array(12))].map(x=>x.toString(16).padStart(2,'0')).join('');set('meaDevId',d);}return d;}
async function fp(){const s=[navigator.language,screen.width+'x'+screen.height,new Date().getTimezoneOffset(),navigator.hardwareConcurrency||0].join('|');
 const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s));return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('').slice(0,24)+':'+devId();}
async function verify(code,tool){const res=await fetch(SB+'/rest/v1/rpc/verify_license',{method:'POST',headers:{apikey:SK,Authorization:'Bearer '+SK,'Content-Type':'application/json'},body:JSON.stringify({p_code:code,p_device:await fp(),p_tool:tool})});return res.json();}
function keep(id,code,r){set('meaBook_'+id,r.expires?'until:'+r.expires:'1');set('meaKey_'+id,code);set('meaPdf_'+id,r.pdf?'1':'0');set('meaChk_'+id,String(Date.now()));}
function drop(id){['meaBook_','meaKey_','meaPdf_','meaChk_'].forEach(k=>{try{localStorage.removeItem(k+id);}catch(e){}});}
const clean=c=>String(c||'').trim().toUpperCase().replace(/\s+/g,'');
// تفعيل مفتاح كتاب: بيرجّع {ok,msg}
async function unlock(id,code){code=clean(code);if(code.length<8)return{ok:false,msg:'اكتب المفتاح كامل.'};
 let r;try{r=await verify(code,C[id].tool);}
 catch(e){return{ok:false,msg:'ما قدرنا نتحقق. تأكد من الإنترنت وجرّب كمان مرة.'};}
 if(r&&r.ok){keep(id,code,r);return{ok:true,name:r.name,expires:r.expires,pdf:!!r.pdf};}return{ok:false,msg:(r&&r.msg)||'المفتاح غلط.'};}
// مفتاح واحد بيفتح كل الكتب يلي فيه: بيرجّع {ok,books:[ids],name,msg}
async function activateAll(code){code=clean(code);if(code.length<8)return{ok:false,msg:'اكتب المفتاح كامل.'};
 const ids=Object.keys(C);let first;try{first=await verify(code,C[ids[0]].tool);}catch(e){return{ok:false,msg:'ما قدرنا نتحقق. تأكد من الإنترنت وجرّب كمان مرة.'};}
 const got=[];let r0=first;
 if(first&&first.ok){keep(ids[0],code,first);got.push(ids[0]);}
 const tl=String((first&&first.tools)||'').replace(/\s/g,'').split(',');
 for(const id of ids.slice(1)){if(first&&first.ok&&!tl.includes(C[id].tool))continue;
  try{const r=await verify(code,C[id].tool);if(r&&r.ok){keep(id,code,r);got.push(id);r0=r;}else if(!(first&&first.ok))r0=r;}catch(e){}}
 if(!got.length)return{ok:false,msg:(r0&&r0.msg)||(first&&first.msg)||'المفتاح غلط.'};
 return{ok:true,books:got,name:(r0&&r0.name)||(first&&first.name)};}
// كل يوم منتأكد إنو المفتاح بعدو شغّال عهالتلفون. إذا أنور وقّفو أو انفتح عتلفون تاني، بيتسكّر الكتاب.
async function recheck(force){const out=[];for(const id of Object.keys(C)){const code=get('meaKey_'+id);if(!code)continue;
  const last=+get('meaChk_'+id)||0;if(!force&&Date.now()-last<20*3600e3)continue;
  try{const r=await verify(code,C[id].tool);if(r&&r.ok)keep(id,code,r);else if(r&&r.revoked){drop(id);out.push({id,msg:r.msg});}}catch(e){}}
 return out;}
function hasPdf(id){return okVal(get('meaBook_'+id))&&!!get('meaKey_'+id)&&get('meaPdf_'+id)==='1';}
// رابط تنزيل الـPDF (مؤقت، عليه اسم ورقم الشاري)
async function pdf(id){const code=get('meaKey_'+id);if(!code)return{ok:false,msg:'لازم تحط مفتاح الكتاب أوّل.'};
 try{const res=await fetch(SB+'/functions/v1/mea-book',{method:'POST',headers:{apikey:SK,Authorization:'Bearer '+SK,'Content-Type':'application/json'},body:JSON.stringify({code,device:await fp(),book:C[id].tool})});
  const j=await res.json();if(j&&j.ok)return j;return{ok:false,msg:(j&&j.msg)||'ما زبط التنزيل.'};}
 catch(e){return{ok:false,msg:'ما قدرنا نوصل. تأكد من الإنترنت.'};}}
function markRead(id,v){set('meaRead_'+id,v?'1':'0');}
let RULES=null;
function rules(){if(RULES)return Promise.resolve(RULES);const base=(document.querySelector('script[src*="path.js"]')||{}).src||'';const u=base.replace(/path\.js.*$/,'rules.json');
 return fetch(u).then(r=>r.json()).then(j=>RULES=j).catch(()=>({}));}
const QS={};
function questions(id){if(QS[id])return Promise.resolve(QS[id]);const base=(document.querySelector('script[src*="path.js"]')||{}).src||'';const u=base.replace(/app\/path\.js.*$/,'')+C[id].url+'questions.js';
 return fetch(u).then(r=>r.text()).then(t=>{let R=[];try{R=new Function(t+';return RULES;')();}catch(e){}return QS[id]=R;}).catch(()=>[]);}
// قفل بصفحة المشاريع: بيرجّع HTML إذا مقفول، أو null إذا مفتوح
function lockHTML(id,root){const s=status(id);if(s.unlocked)return null;root=root||'../';
 const step=!s.owned?'🔑 اشتري الكتاب وحط المفتاح':!s.read?'📖 خلّص قراية الكتاب':!s.finished?`🎯 خلّص كورس الأسئلة (${s.passed}/${s.total} قاعدة)`:`📊 نتيجتك ${s.mistakes} غلطات: لازم ${MAX_MISTAKES} أو أقل`;
 return `<div class="lockc"><div style="font-size:40px">🔒</div><b>المشاريع بتنفتح بس تكون جاهز</b><p>${s.c.title}: ${step}.</p><a href="${root}app/#path">شوف مسارك ←</a></div>`;}
window.MEAPATH={C,owned,unlock,activateAll,recheck,hasPdf,pdf,fp,status,markRead,rules,questions,lockHTML,MAX_MISTAKES,CERT_MAX};
})();
