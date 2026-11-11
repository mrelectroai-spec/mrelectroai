// مختبر التابلو: القطع (رسم SVG + الأطراف + كيف بتوصّل جوّاتها)
// كل قطعة: w,h، أطراف T(اسم,x,y,اتجاه الشريط -1 لفوق / +1 لتحت, باور؟)، draw(c,S) بيرجّع SVG، links(c) الأطراف الموصولة جوّا.
'use strict';
(function(){
const T=(n,x,y,d,pw)=>({n,x,y,d,pw:!!pw});
const f=n=>Math.round(n*10)/10;
function screw(x,y,lab,top){
 return `<circle cx="${x}" cy="${y}" r="8" fill="#20252a"/><circle cx="${x}" cy="${y}" r="6" fill="url(#gScrew)" stroke="#6d747b" stroke-width=".6"/>`+
  `<path d="M${f(x-3.6)} ${f(y+1.7)}L${f(x+3.6)} ${f(y-1.7)}" stroke="#50565c" stroke-width="1.4" stroke-linecap="round"/>`+
  (lab!==''?`<text x="${x}" y="${top?y+19:y-12}" class="tl">${lab}</text>`:'');}
function terms(c){return P[c.type].terms.map(t=>screw(t.x,t.y,t.lab!=null?t.lab:t.n,t.d<0)).join('');}
function tag(c,w){return '';} // الاسم بينرسم فوق كل شي بطبقة لحالها
const body=(x,y,w,h,r,fill)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}"/>`;

const P={
 src:{name:'مصدر 400V',cat:'وصل',w:290,h:96,pre:'',
  terms:[T('L1',34,74,1,1),T('L2',86,74,1,1),T('L3',138,74,1,1),T('N',196,74,1),T('PE',252,74,1)],
  draw(c,S){const col={L1:'#8B5A2B',L2:'#2a2d31',L3:'#8d949b',N:'#2f6fd6',PE:'#3fae49'};
   return body(0,0,290,96,12,'url(#gDark)')+`<rect x="1" y="1" width="288" height="94" rx="11" fill="none" stroke="rgba(255,255,255,.12)"/>`+
   `<text x="16" y="24" class="lt w b" style="text-anchor:start">شبكة 400V · 3 فاز</text><circle cx="270" cy="20" r="5" fill="${S.on?'#3dff8f':'#24452f'}" ${S.on?'filter="url(#fGlow)"':''}/>`+
   this.terms.map(t=>`<rect x="${t.x-13}" y="40" width="26" height="12" rx="3" fill="${col[t.n]}"/>${t.n==='PE'?`<rect x="${t.x-13}" y="44" width="26" height="4" fill="#f2d33b"/>`:''}`).join('')+
   this.terms.map(t=>screw(t.x,t.y,'',false)+`<text x="${t.x}" y="36" class="lt w b">${t.n}</text>`).join('');},
  links:()=>[]},

 mcb1:{name:'قاطع 1P',cat:'حماية',w:40,h:172,pre:'Q',props:['rating'],def:{rating:10},
  terms:[T('1',20,15,-1),T('2',20,157,1)],
  draw(c,S){const on=c.st.on&&!c.st.trip;
   return tag(c,40)+body(0,0,40,172,5,'url(#gPlast)')+body(2,30,36,112,3,'#f6f7f8')+
   `<rect x="9" y="${on?52:80}" width="22" height="40" rx="4" fill="url(#gLever)" data-act="lever" class="act"/>`+
   `<rect x="9" y="${on?52:80}" width="22" height="7" rx="3" fill="rgba(255,255,255,.35)" pointer-events="none"/>`+
   `<text x="20" y="${on?110:66}" class="lt" fill="#1d6b47">${on?'ON':'OFF'}</text>`+
   `<text x="20" y="132" class="lt b">C${c.rating}</text>`+(c.st.trip?`<rect x="12" y="138" width="16" height="4" rx="2" fill="#ff3b30"/>`:'')+
   terms(c);},
  links:c=>c.st.on&&!c.st.trip?[['1','2']]:[]},

 mcb3:{name:'قاطع 3P',cat:'حماية',w:120,h:172,pre:'Q',props:['rating3'],def:{rating:16},
  terms:[T('1',20,15,-1,1),T('3',60,15,-1,1),T('5',100,15,-1,1),T('2',20,157,1,1),T('4',60,157,1,1),T('6',100,157,1,1)],
  draw(c,S){const on=c.st.on&&!c.st.trip;let s=tag(c,120)+body(0,0,120,172,5,'url(#gPlast)');
   for(let i=0;i<3;i++)s+=body(2+i*40,30,36,112,3,'#f6f7f8')+`<rect x="${9+i*40}" y="${on?52:80}" width="22" height="40" rx="4" fill="url(#gLever)"/>`;
   s+=`<rect x="9" y="${on?66:94}" width="102" height="9" rx="3" fill="#2a3a52" data-act="lever" class="act"/><rect x="2" y="${on?44:72}" width="116" height="56" fill="transparent" data-act="lever" class="act"/>`;
   s+=`<text x="60" y="${on?112:66}" class="lt" fill="#1d6b47">${on?'ON':'OFF'}</text><text x="60" y="132" class="lt b">C${c.rating}</text>`+(c.st.trip?`<rect x="48" y="138" width="24" height="4" rx="2" fill="#ff3b30"/>`:'');
   return s+terms(c);},
  links:c=>c.st.on&&!c.st.trip?[['1','2'],['3','4'],['5','6']]:[]},

 kc:{name:'كونتاكتور',cat:'تحكم',w:184,h:182,pre:'KM',
  terms:[T('A1',14,15,-1),T('1',40,15,-1,1),T('3',64,15,-1,1),T('5',88,15,-1,1),T('13',112,15,-1),T('21',132,15,-1),T('31',152,15,-1),T('43',172,15,-1),
         T('A2',14,167,1),T('2',40,167,1,1),T('4',64,167,1,1),T('6',88,167,1,1),T('14',112,167,1),T('22',132,167,1),T('32',152,167,1),T('44',172,167,1)],
  draw(c,S){const e=c.st.e;
   return tag(c,184)+body(0,0,184,182,8,'url(#gPlast)')+body(100,4,82,174,6,'url(#gPlast2)')+
   body(4,32,94,118,6,'#d8dce0')+`<rect x="16" y="46" width="70" height="88" rx="6" fill="url(#gWin)" stroke="rgba(0,0,0,.18)"/>`+
   `<rect x="28" y="${e?72:60}" width="46" height="34" rx="4" fill="${e?'#3ccf83':'#f3f4f5'}" stroke="#9aa1a8"/><text x="51" y="${e?94:82}" class="lt b" fill="${e?'#08351f':'#5b636b'}">${e?'I':'O'}</text>`+
   `<text x="51" y="146" class="lt">${c.st.burnt?'🔥 الكويل احترق':'230V AC'}</text>`+
   `<text x="112" y="70" class="lt s">NO</text><text x="132" y="70" class="lt s">NC</text><text x="152" y="70" class="lt s">NC</text><text x="172" y="70" class="lt s">NO</text>`+
   `<rect x="${e?106:106}" y="${e?92:84}" width="72" height="10" rx="3" fill="${e?'#3ccf83':'#aab2b9'}"/>`+terms(c);},
  links:c=>{const e=c.st.e;return e?[['1','2'],['3','4'],['5','6'],['13','14'],['43','44']]:[['21','22'],['31','32']];},
  coil:['A1','A2']},

 ol:{name:'أوفرلود',cat:'حماية',w:132,h:140,pre:'F',props:['setA'],def:{setA:10},
  terms:[T('1',18,15,-1,1),T('3',42,15,-1,1),T('5',66,15,-1,1),T('95',94,15,-1),T('97',118,15,-1),
         T('2',18,125,1,1),T('4',42,125,1,1),T('6',66,125,1,1),T('96',94,125,1),T('98',118,125,1)],
  draw(c,S){const tr=c.st.trip,heat=Math.min(1,c.st.heat||0);
   return tag(c,132)+body(0,0,132,140,7,'url(#gDark)')+`<rect x="1" y="1" width="130" height="138" rx="6" fill="none" stroke="rgba(255,255,255,.12)"/>`+
   `<circle cx="38" cy="70" r="19" fill="url(#gBlueDial)" stroke="#0d2b55" data-act="dial" class="act"/><path d="M38 70L${f(38+13*Math.cos(-2.4+(c.setA-1)/30*4.8))} ${f(70+13*Math.sin(-2.4+(c.setA-1)/30*4.8))}" stroke="#fff" stroke-width="3" stroke-linecap="round" pointer-events="none"/>`+
   `<text x="38" y="104" class="lt w b">${c.setA}A</text>`+
   `<rect x="72" y="50" width="22" height="16" rx="3" fill="#e53935" data-act="test" class="act"/><text x="83" y="61.5" class="lt s w" pointer-events="none">TEST</text>`+
   `<circle cx="112" cy="58" r="11" fill="#1e88e5" stroke="#0d47a1" data-act="reset" class="act"/><text x="112" y="61.5" class="lt s w" pointer-events="none">R</text>`+
   `<rect x="74" y="78" width="48" height="16" rx="3" fill="${tr?'#ff9800':'#2b3036'}"/><text x="98" y="89.5" class="lt s ${tr?'':'w'}">${tr?'فصل':'OK'}</text>`+
   (heat>0.05?`<rect x="72" y="100" width="${f(52*heat)}" height="4" rx="2" fill="#ff7043"/>`:'')+terms(c);},
  links:c=>{const L=[['1','2'],['3','4'],['5','6']];return L.concat(c.st.trip?[['97','98']]:[['95','96']]);}},

 pbg:{name:'كبسة تشغيل',cat:'كبسات',w:72,h:132,pre:'S',
  terms:[T('13',36,15,-1),T('14',36,117,1)],
  draw(c){return tag(c,72)+btnBody()+head(c.st.p,'#2fbf5b','#14692f','I')+terms(c);},
  links:c=>c.st.p?[['13','14']]:[]},
 pbr:{name:'كبسة توقيف',cat:'كبسات',w:72,h:132,pre:'S',
  terms:[T('11',36,15,-1),T('12',36,117,1)],
  draw(c){return tag(c,72)+btnBody()+head(c.st.p,'#e53935','#8e1a17','O')+terms(c);},
  links:c=>c.st.p?[]:[['11','12']]},
 es:{name:'كبسة طوارئ',cat:'كبسات',w:84,h:140,pre:'S',
  terms:[T('11',42,15,-1),T('12',42,125,1)],
  draw(c){const p=c.st.p;return tag(c,84)+body(6,0,72,140,8,'url(#gPlast)')+
   `<circle cx="42" cy="70" r="36" fill="#f6c915" stroke="#a88a06"/><text x="42" y="${p?44:42}" class="lt s">EMERGENCY</text>`+
   `<g data-act="latch" class="act"><circle cx="42" cy="72" r="${p?22:26}" fill="url(#gMush)" stroke="#6f1210"/><circle cx="36" cy="${p?66:64}" r="${p?6:8}" fill="rgba(255,255,255,.35)"/></g>`+
   (p?`<text x="42" y="76" class="lt w b" pointer-events="none">↻</text>`:'')+terms(c);},
  links:c=>c.st.p?[]:[['11','12']]},

 lamp:{name:'لمبة إشارة',cat:'كبسات',w:72,h:124,pre:'H',props:['color'],def:{color:'g'},
  terms:[T('X1',36,15,-1),T('X2',36,109,1)],
  draw(c){const C={g:['#36e27a','#0f6b33'],r:['#ff4d4d','#7a1212'],y:['#ffc93c','#8a5d00'],w:['#ffffff','#7c858d']}[c.color]||['#36e27a','#0f6b33'];const on=c.st.on;
   return tag(c,72)+btnBody()+`<circle cx="36" cy="62" r="25" fill="url(#gRing)"/>`+
   `<circle cx="36" cy="62" r="19" fill="${on?C[0]:C[1]}" ${on?'filter="url(#fGlow)"':''}/><circle cx="36" cy="62" r="19" fill="url(#gLens)"/>`+
   (c.st.burnt?`<text x="36" y="66" class="lt w">🔥</text>`:'')+terms(c);},
  links:()=>[],load:['X1','X2']},

 tmr:{name:'تايمر',cat:'تحكم',w:62,h:182,pre:'KT',props:['sec'],def:{sec:5},
  terms:[T('A1',14,15,-1),T('15',46,15,-1),T('A2',12,167,1),T('16',31,167,1),T('18',50,167,1)],
  draw(c){const e=c.st.e,done=c.st.done;
   return tag(c,62)+body(0,0,62,182,6,'url(#gPlast)')+body(4,30,54,122,4,'#eef0f2')+
   `<circle cx="31" cy="78" r="17" fill="url(#gBlueDial)" data-act="dial" class="act"/><text x="31" y="83" class="lt w b" pointer-events="none">${c.sec}s</text>`+
   `<circle cx="18" cy="46" r="4" fill="${e?'#3dff8f':'#2b4434'}"/><circle cx="44" cy="46" r="4" fill="${done?'#ffcc00':'#4a3f1c'}"/>`+
   `<text x="31" y="116" class="lt s">ON-DELAY</text><text x="31" y="130" class="lt s">${e&&!done?Math.max(0,c.sec-(c.st.t||0)).toFixed(1)+'s':''}</text>`+terms(c);},
  links:c=>c.st.done?[['15','18']]:[['15','16']],coil:['A1','A2']},

 motor:{name:'موتور 3 فاز',cat:'حمل',w:214,h:182,pre:'M',props:['kw'],def:{kw:7.5},
  terms:[T('U1',58,22,-1,1),T('V1',90,22,-1,1),T('W1',122,22,-1,1),T('PE',156,22,-1)],
  draw(c){const st=c.st.m||'off',I=c.st.I||0,dir=c.st.dir||1;
   let fins='';for(let i=0;i<9;i++)fins+=`<rect x="${34+i*15}" y="62" width="7" height="104" rx="3" fill="rgba(0,0,0,.18)"/>`;
   return tag(c,214)+`<rect x="24" y="56" width="150" height="116" rx="22" fill="url(#gMotor)"/>`+fins+
   `<rect x="16" y="66" width="18" height="96" rx="6" fill="url(#gMotor)"/><rect x="170" y="70" width="18" height="88" rx="6" fill="url(#gMotor)"/>`+
   `<rect x="186" y="106" width="22" height="16" rx="3" fill="url(#gMetal)"/>`+
   `<g transform="translate(200 114)"><g class="${st==='run'?(dir>0?'spin':'spinr'):(st==='hum'?'hum':'')}"><circle r="22" fill="none" stroke="rgba(255,255,255,.0)"/><path d="M0 -20L5 -6L-5 -6Z M17 10L4 5L9 -4Z M-17 10L-9 -4L-4 5Z" fill="#ffd54a"/></g></g>`+
   `<rect x="40" y="2" width="134" height="42" rx="6" fill="url(#gDark)"/><rect x="44" y="40" width="126" height="18" fill="#2a3036"/>`+
   `<rect x="60" y="120" width="92" height="34" rx="4" fill="#d9dde1"/><text x="106" y="134" class="lt s b">${c.kw}kW · 400V</text><text x="106" y="148" class="lt s">${motorI(c.kw).toFixed(1)}A</text>`+
   (st==='run'?`<text x="106" y="194" class="lt b" fill="#3ccf83">${dir>0?'↻ شغّال':'↺ شغّال (عكسي)'}</text>`:st==='hum'?`<text x="106" y="194" class="lt b" fill="#ff9800">⚠ عم يزنّ: فاز ناقص</text>`:'')+
   `<rect x="148" y="14" width="16" height="5" fill="#3fae49"/><rect x="148" y="16" width="16" height="1.6" fill="#f2d33b"/>`+terms(c);},
  links:()=>[],motor:true},

 src1:{name:'مصدر 230V',cat:'وصل',w:200,h:110,pre:'',props:['kind'],def:{kind:'grid'},
  terms:[T('L',40,88,1,1),T('N',100,88,1),T('PE',160,88,1)],
  draw(c,S){const K={grid:['⚡ الدولة','#f5c542'],gen:['🛢️ الموتير','#ff8a3d'],inv:['🔋 الإنفرتر','#36c2ff']}[c.kind]||['230V','#fff'];const av=!c.st.off;
   return tag(c,200)+body(0,0,200,110,12,'url(#gDark)')+`<rect x="1" y="1" width="198" height="108" rx="11" fill="none" stroke="${K[1]}" stroke-opacity=".55" stroke-width="2"/>`+
   `<text x="16" y="25" class="lt w b" text-anchor="start" style="text-anchor:start">${K[0]}</text>`+
   `<g data-act="avail" class="act"><rect x="120" y="10" width="70" height="24" rx="12" fill="${av?'#2fbf5b':'#5b2a2a'}"/><circle cx="${av?177:133}" cy="22" r="9" fill="#fff"/><text x="${av?143:166}" y="26" class="lt s w">${av?'فيه':'مقطوع'}</text></g>`+
   `<rect x="27" y="52" width="26" height="12" rx="3" fill="#8B5A2B"/><rect x="87" y="52" width="26" height="12" rx="3" fill="#2f6fd6"/><rect x="147" y="52" width="26" height="12" rx="3" fill="#3fae49"/><rect x="147" y="56" width="26" height="4" fill="#f2d33b"/>`+
   `<text x="40" y="48" class="lt w">L</text><text x="100" y="48" class="lt w">N</text><text x="160" y="48" class="lt w">PE</text>`+
   this.terms.map(t=>screw(t.x,t.y,'',false)).join('');},
  links:()=>[]},

 relay:{name:'ريليه مساعد',cat:'تحكم',w:150,h:150,pre:'KA',
  terms:[T('A1',16,15,-1),T('11',52,15,-1),T('21',90,15,-1),T('31',128,15,-1),
         T('A2',16,135,1),T('12',42,135,1),T('14',62,135,1),T('22',80,135,1),T('24',100,135,1),T('32',118,135,1),T('34',138,135,1)],
  draw(c){const e=c.st.e;
   return tag(c,150)+body(0,0,150,150,8,'url(#gPlast)')+`<rect x="8" y="34" width="134" height="80" rx="8" fill="rgba(80,170,255,.18)" stroke="rgba(60,90,130,.35)"/>`+
   `<rect x="20" y="${e?66:56}" width="110" height="16" rx="4" fill="${e?'#3ccf83':'#d6dbe0'}"/><circle cx="130" cy="46" r="5" fill="${e?'#ff4d4d':'#5a2d2d'}" ${e?'filter="url(#fGlow)"':''}/>`+
   `<text x="75" y="104" class="lt s">3 × CO · 230V</text>`+terms(c);},
  links:c=>c.st.e?[['11','14'],['21','24'],['31','34']]:[['11','12'],['21','22'],['31','32']],coil:['A1','A2']},

 motor6:{name:'موتور ستار دلتا',cat:'حمل',w:230,h:190,pre:'M',props:['kw'],def:{kw:11},
  terms:[T('W2',62,16,-1,1),T('U2',100,16,-1,1),T('V2',138,16,-1,1),T('U1',62,52,-1,1),T('V1',100,52,-1,1),T('W1',138,52,-1,1),T('PE',176,34,-1)],
  draw(c){const st=c.st.m||'off',dir=c.st.dir||1;let fins='';for(let i=0;i<9;i++)fins+=`<rect x="${40+i*15}" y="80" width="7" height="96" rx="3" fill="rgba(0,0,0,.18)"/>`;
   return tag(c,230)+`<rect x="30" y="74" width="150" height="110" rx="22" fill="url(#gMotor)"/>`+fins+`<rect x="176" y="86" width="18" height="86" rx="6" fill="url(#gMotor)"/><rect x="192" y="120" width="20" height="16" rx="3" fill="url(#gMetal)"/>`+
   `<g transform="translate(212 128)"><g class="${st==='star'||st==='delta'?(dir>0?'spin':'spinr'):(st==='hum'?'hum':'')}"><path d="M0 -20L5 -6L-5 -6Z M17 10L4 5L9 -4Z M-17 10L-9 -4L-4 5Z" fill="#ffd54a"/></g></g>`+
   `<rect x="40" y="0" width="160" height="72" rx="8" fill="url(#gDark)"/>`+
   `<rect x="70" y="134" width="90" height="32" rx="4" fill="#d9dde1"/><text x="115" y="148" class="lt s b">${c.kw}kW · Δ400V</text><text x="115" y="161" class="lt s">${motorI(c.kw).toFixed(1)}A</text>`+
   (st==='star'?`<text x="115" y="206" class="lt b" fill="#ffd54a">⭐ ستار</text>`:st==='delta'?`<text x="115" y="206" class="lt b" fill="#3ccf83">△ دلتا</text>`:st==='hum'?`<text x="115" y="206" class="lt b" fill="#ff9800">⚠ عم يزنّ</text>`:'')+terms(c);},
  links:()=>[],motor:true},

 smoke:{name:'حسّاس دخان',cat:'كبسات',w:110,h:110,pre:'B',
  terms:[T('C',30,95,1),T('NO',80,95,1)],
  draw(c){const sm=c.st.smoke;
   return tag(c,110)+`<circle cx="55" cy="46" r="42" fill="url(#gPlast)" stroke="#b9c0c6"/><circle cx="55" cy="46" r="30" fill="none" stroke="#c7cdd2" stroke-dasharray="3 4"/>`+
   `<circle cx="55" cy="46" r="6" fill="${sm?'#ff3b30':'#5a2d2d'}" ${sm?'filter="url(#fGlow)"':''}/>`+
   (sm?`<g opacity=".8"><circle cx="30" cy="20" r="12" fill="#9aa"/><circle cx="48" cy="10" r="14" fill="#aab"/><circle cx="72" cy="16" r="12" fill="#99a"/></g>`:'')+
   `<rect x="10" y="78" width="90" height="30" rx="6" fill="url(#gPlast2)"/>`+
   `<g data-act="smoke" class="act"><rect x="62" y="-16" width="60" height="22" rx="11" fill="${sm?'#ff3b30':'rgba(0,0,0,.45)'}"/><text x="92" y="-1" class="lt s w">${sm?'في دخان':'دخّن 💨'}</text></g>`+terms(c);},
  links:c=>c.st.smoke?[['C','NO']]:[]},

 siren:{name:'جرس إنذار',cat:'كبسات',w:90,h:120,pre:'H',
  terms:[T('X1',30,105,1),T('X2',60,105,1)],
  draw(c){const on=c.st.on;return tag(c,90)+`<path d="M10 30 Q45 -10 80 30 L80 80 L10 80Z" fill="${on?'#ff3b30':'#8e2420'}" ${on?'filter="url(#fGlow)"':''}/>`+
   `<circle cx="45" cy="52" r="16" fill="rgba(255,255,255,.25)"/><rect x="8" y="80" width="74" height="34" rx="5" fill="url(#gPlast2)"/>`+(on?`<text x="45" y="20" class="lt b" fill="#ffd54a">🔔 🔔</text>`:'')+terms(c);},
  links:()=>[],load:['X1','X2'],W:30},

 load:{name:'حمل',cat:'حمل',w:150,h:130,pre:'E',props:['kind','watt'],def:{kind:'heater',watt:3000},
  terms:[T('L',40,115,1,1),T('N',75,115,1,1),T('PE',110,115,1)],
  draw(c){const on=c.st.on,K={heater:['🚿','سخّان'],ac:['❄️','مكيّف'],fan:['🌀','مروحة شفط'],house:['🏠','البيت'],socket:['🔌','بريز']}[c.kind]||['⚙️','حمل'];
   return tag(c,150)+body(0,0,150,130,12,on?'rgba(60,207,131,.25)':'rgba(255,255,255,.12)')+`<rect x="0" y="0" width="150" height="130" rx="12" fill="none" stroke="${on?'#3ccf83':'rgba(255,255,255,.35)'}" stroke-width="2"/>`+
   `<text x="75" y="44" style="font-size:30px;text-anchor:middle" class="${on&&c.kind==='fan'?'':''}">${K[0]}</text><text x="75" y="70" class="lt w b">${K[1]}</text><text x="75" y="88" class="lt w s">${(c.watt/1000).toFixed(1)}kW · ${(c.watt/230).toFixed(1)}A</text>`+
   (c.st.leak?`<text x="75" y="100" class="lt s" fill="#ff7043">⚠ تسريب أرضي</text>`:'')+
   `<g data-act="leak" class="act"><rect x="118" y="6" width="26" height="20" rx="6" fill="${c.st.leak?'#ff7043':'rgba(0,0,0,.35)'}"/><text x="131" y="20" class="lt s w">⏚</text></g>`+
   `<rect x="20" y="100" width="110" height="26" rx="5" fill="url(#gPlast2)"/>`+terms(c);},
  links:()=>[],load:['L','N']},

 bulb:{name:'لمبة سقف',cat:'كبسات',w:90,h:110,pre:'E',
  terms:[T('L',28,95,1),T('N',62,95,1)],
  draw(c){const on=c.st.on;return tag(c,90)+`<circle cx="45" cy="40" r="30" fill="${on?'#fff3b0':'#5b5f63'}" ${on?'filter="url(#fGlow)"':''}/><circle cx="45" cy="40" r="30" fill="url(#gLens)"/>`+
   `<rect x="12" y="76" width="66" height="32" rx="5" fill="url(#gPlast2)"/>`+terms(c);},
  links:()=>[],load:['L','N'],W:60},

 sw1:{name:'مفتاح ضو',cat:'كبسات',w:80,h:110,pre:'S',
  terms:[T('L',40,15,-1),T('1',40,95,1)],
  draw(c){const on=c.st.on;return tag(c,80)+body(4,0,72,110,10,'url(#gPlast)')+`<g data-act="toggle" class="act"><rect x="18" y="30" width="44" height="50" rx="6" fill="#fff" stroke="#c4cad0"/><rect x="22" y="${on?34:56}" width="36" height="20" rx="4" fill="${on?'#3ccf83':'#d0d5da'}"/></g>`+terms(c);},
  links:c=>c.st.on?[['L','1']]:[]},
 sw2:{name:'مفتاح درج',cat:'كبسات',w:96,h:110,pre:'S',
  terms:[T('C',48,15,-1),T('L1',28,95,1),T('L2',68,95,1)],
  draw(c){const on=c.st.on;return tag(c,96)+body(4,0,88,110,10,'url(#gPlast)')+`<g data-act="toggle" class="act"><rect x="20" y="30" width="56" height="50" rx="6" fill="#fff" stroke="#c4cad0"/><path d="M48 40 L${on?66:30} 70" stroke="#2d5ea8" stroke-width="5" stroke-linecap="round"/></g><text x="48" y="78" class="lt s">${on?'L2':'L1'}</text>`+terms(c);},
  links:c=>c.st.on?[['C','L2']]:[['C','L1']]},
 socket:{name:'بريز',cat:'كبسات',w:90,h:110,pre:'X',
  terms:[T('L',22,95,1),T('N',45,95,1),T('PE',68,95,1)],
  draw(c){const on=c.st.v;return tag(c,90)+body(4,0,82,110,12,'url(#gPlast)')+`<circle cx="45" cy="44" r="26" fill="#eef0f2" stroke="#c4cad0"/><circle cx="34" cy="44" r="4.5" fill="#2a2f34"/><circle cx="56" cy="44" r="4.5" fill="#2a2f34"/>`+
   `<rect x="41" y="20" width="8" height="5" rx="1" fill="#9aa1a8"/><rect x="41" y="63" width="8" height="5" rx="1" fill="#9aa1a8"/><circle cx="80" cy="12" r="4" fill="${on?'#3dff8f':'#2b4434'}"/>`+terms(c);},
  links:()=>[]},
 rcd:{name:'ديفرنسيال 30mA',cat:'حماية',w:84,h:172,pre:'Q',props:['rating'],def:{rating:40},
  terms:[T('1',22,15,-1,1),T('N1',62,15,-1,1),T('2',22,157,1,1),T('N2',62,157,1,1)],
  draw(c){const on=c.st.on&&!c.st.trip;return tag(c,84)+body(0,0,84,172,5,'url(#gPlast)')+body(2,30,80,112,3,'#f6f7f8')+
   `<rect x="10" y="${on?52:80}" width="26" height="40" rx="4" fill="url(#gLever)" data-act="lever" class="act"/>`+
   `<rect x="48" y="58" width="26" height="18" rx="4" fill="#ffd54a" data-act="test" class="act"/><text x="61" y="70" class="lt s" pointer-events="none">T</text>`+
   `<text x="42" y="118" class="lt s b">${c.rating}A · 30mA</text><text x="23" y="${on?106:66}" class="lt s" fill="#1d6b47">${on?'ON':'OFF'}</text>`+(c.st.trip?`<rect x="30" y="134" width="24" height="4" rx="2" fill="#ff3b30"/>`:'')+terms(c);},
  links:c=>c.st.on&&!c.st.trip?[['1','2'],['N1','N2']]:[]},

 rail:{name:'سكّة DIN',cat:'تركيب',w:600,h:36,pre:'',props:['len'],def:{len:600},mount:1,
  terms:[],
  draw(c){const L=c.len||600;let s=`<rect x="0" y="4" width="${L}" height="28" rx="3" fill="url(#gRail)"/><rect x="0" y="4" width="${L}" height="5" fill="rgba(255,255,255,.45)"/>`;
   for(let x=14;x<L-20;x+=40)s+=`<rect x="${x}" y="14" width="22" height="8" rx="3" fill="rgba(40,48,56,.6)"/>`;return s;},
  links:()=>[]},
 duct:{name:'مجرى شرايط',cat:'تركيب',w:600,h:60,pre:'',props:['len'],def:{len:600},mount:1,
  terms:[],
  draw(c){const L=c.len||600;let s=`<rect x="0" y="0" width="${L}" height="60" rx="4" fill="rgba(200,206,212,.55)" stroke="rgba(255,255,255,.4)"/>`;
   for(let x=8;x<L-8;x+=16)s+=`<rect x="${x}" y="0" width="8" height="12" fill="rgba(60,70,80,.35)"/><rect x="${x}" y="48" width="8" height="12" fill="rgba(60,70,80,.35)"/>`;
   return s+`<rect x="0" y="24" width="${L}" height="12" fill="rgba(255,255,255,.25)"/>`;},
  links:()=>[]},

 tb:{name:'ترمينال',cat:'وصل',w:28,h:92,pre:'X',
  terms:[T('a',14,15,-1),T('b',14,77,1)],
  draw(c){return tag(c,28)+body(2,0,24,92,4,'url(#gPlast2)')+`<rect x="5" y="34" width="18" height="24" rx="3" fill="#fff"/><text x="14" y="50" class="lt s">${c.label||''}</text>`+terms(c);},
  links:()=>[['a','b']]},
};
function btnBody(){return body(6,0,60,132,8,'url(#gPlast)');}
function head(p,c1,c2,txt){return `<g data-act="press" class="act"><circle cx="36" cy="66" r="27" fill="url(#gRing)"/><circle cx="36" cy="66" r="${p?18:20}" fill="${c1}" stroke="${c2}" stroke-width="2"/>`+
 `<circle cx="36" cy="66" r="${p?18:20}" fill="url(#gLens)" opacity="${p?.3:.8}"/><text x="36" y="71" class="lt w b">${txt}</text></g>`;}
// تيار الموتور التقريبي: P/(√3·400·cosφ·η)
function motorI(kw){return kw*1000/(1.732*400*0.85*0.88);}
// تحمّل الكابل (نحاس، PVC، بقناة): أمبير
const CAP={0.75:6,1:10,1.5:14,2.5:19,4:26,6:34,10:46};
const GAUGES=[0.75,1,1.5,2.5,4,6,10];
const RAT1=[2,4,6,10,16,20,25,32,40,63],RAT3=[6,10,16,20,25,32,40,50];
const COLORS={br:['#8B5A2B','بني'],bk:['#24272b','أسود'],gr:['#8d949b','رمادي'],bl:['#2f6fd6','أزرق'],gy:['#3fae49','أخضر/أصفر'],rd:['#d93636','أحمر'],or:['#f08a24','برتقالي'],wh:['#e9edf0','أبيض']};
const DEFS=`<defs>
<linearGradient id="gPlast" x1="0" x2="1"><stop offset="0" stop-color="#e3e6e9"/><stop offset=".5" stop-color="#f7f8f9"/><stop offset="1" stop-color="#d2d6da"/></linearGradient>
<linearGradient id="gPlast2" x1="0" x2="1"><stop offset="0" stop-color="#cfd4d8"/><stop offset="1" stop-color="#bfc5ca"/></linearGradient>
<linearGradient id="gDark" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a5057"/><stop offset="1" stop-color="#2c3136"/></linearGradient>
<linearGradient id="gLever" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2d5ea8"/><stop offset="1" stop-color="#173a70"/></linearGradient>
<radialGradient id="gScrew" cx=".35" cy=".35"><stop offset="0" stop-color="#ffffff"/><stop offset=".55" stop-color="#c3c9ce"/><stop offset="1" stop-color="#868d94"/></radialGradient>
<linearGradient id="gWin" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7f8a94" stop-opacity=".55"/><stop offset="1" stop-color="#3b434b" stop-opacity=".75"/></linearGradient>
<radialGradient id="gBlueDial" cx=".4" cy=".35"><stop offset="0" stop-color="#5aa0ff"/><stop offset="1" stop-color="#174a9c"/></radialGradient>
<radialGradient id="gRing" cx=".4" cy=".35"><stop offset="0" stop-color="#f4f6f8"/><stop offset=".7" stop-color="#a9b0b7"/><stop offset="1" stop-color="#6c737a"/></radialGradient>
<radialGradient id="gLens" cx=".35" cy=".3" r=".7"><stop offset="0" stop-color="#fff" stop-opacity=".85"/><stop offset=".35" stop-color="#fff" stop-opacity=".15"/><stop offset="1" stop-color="#000" stop-opacity=".15"/></radialGradient>
<radialGradient id="gMush" cx=".35" cy=".3"><stop offset="0" stop-color="#ff6b5e"/><stop offset=".6" stop-color="#d32f2f"/><stop offset="1" stop-color="#7f1414"/></radialGradient>
<linearGradient id="gMotor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7e93a6"/><stop offset=".45" stop-color="#5a6f82"/><stop offset="1" stop-color="#3a4a59"/></linearGradient>
<linearGradient id="gMetal" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#eef1f3"/><stop offset=".5" stop-color="#a7afb6"/><stop offset="1" stop-color="#dfe3e6"/></linearGradient>
<linearGradient id="gRail" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f1f3f5"/><stop offset=".3" stop-color="#b8c0c7"/><stop offset=".7" stop-color="#9aa3ab"/><stop offset="1" stop-color="#e2e6e9"/></linearGradient>
<linearGradient id="gPlate" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity=".16"/><stop offset=".5" stop-color="#ffffff" stop-opacity=".06"/><stop offset="1" stop-color="#ffffff" stop-opacity=".11"/></linearGradient>
<linearGradient id="gSheen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset=".25" stop-color="#fff" stop-opacity="0"/></linearGradient>
<pattern id="pGY" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="16" height="16" fill="#3fae49"/><rect width="8" height="16" fill="#f2d33b"/></pattern>
<filter id="fGlow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
<filter id="fShadow" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#000" flood-opacity=".35"/></filter>
</defs>`;
const RATR=[25,40,63];
window.PARTS={RATR,P,motorI,CAP,GAUGES,RAT1,RAT3,COLORS,DEFS};
})();
