// مختبر التابلو: كاتالوج القطع الحقيقية (ماركات وموديلات)
// كل موديل: b ماركة، m الموديل، s وصف قصير، set القيم يلي بتنحط عالقطعة (أمبير، ضبط الأوفرلود، قدرة الموتور، لون…)
// الأسماء والأرقام للتعريف بس (متل ما مكتوبة عالقطعة)، بلا شعارات.
'use strict';
(function(){
const C={};const add=(t,b,m,s,set)=>{(C[t]=C[t]||[]).push({b,m,s,set:set||{}});};
const RAT1=[2,4,6,10,16,20,25,32,40,63],RAT3=[6,10,16,20,25,32,40,50],RATR=[25,40,63];
const pad=n=>String(n).padStart(2,'0');

/* ---------- قواطع 1P ---------- */
for(const a of RAT1){
 add('mcb1','Schneider',`iC60N 1P C${a}`,`${a}A · منحنى C · 6kA`,{rating:a});
 add('mcb1','ABB',`S201-C${a}`,`${a}A · منحنى C · 6kA`,{rating:a});
 add('mcb1','Siemens',`5SL6 1${pad(a)}-7`,`${a}A · منحنى C · 6kA`,{rating:a});
 add('mcb1','Eaton',`PL6-C${a}/1`,`${a}A · منحنى C · 6kA`,{rating:a});
 add('mcb1','Legrand',`DX³ 1P C${a}`,`${a}A · منحنى C · 6kA`,{rating:a});
 add('mcb1','Hager',`MCN1${pad(a)}`,`${a}A · منحنى C · 6kA`,{rating:a});
 add('mcb1','Chint',`NXB-63 1P C${a}`,`${a}A · منحنى C · 6kA`,{rating:a});
 if(a<=63)add('mcb1','LS',`BKN 1P C${a}A`,`${a}A · منحنى C · 6kA`,{rating:a});
}
/* ---------- قواطع 3P ---------- */
for(const a of RAT3){
 add('mcb3','Schneider',`iC60N 3P C${a}`,`${a}A · منحنى C · 6kA`,{rating:a});
 add('mcb3','ABB',`S203-C${a}`,`${a}A · منحنى C · 6kA`,{rating:a});
 add('mcb3','Siemens',`5SL6 3${pad(a)}-7`,`${a}A · منحنى C · 6kA`,{rating:a});
 add('mcb3','Eaton',`PL6-C${a}/3`,`${a}A · منحنى C · 6kA`,{rating:a});
 add('mcb3','Legrand',`DX³ 3P C${a}`,`${a}A · منحنى C · 6kA`,{rating:a});
 add('mcb3','Hager',`NCN3${pad(a)}`,`${a}A · منحنى C · 10kA`,{rating:a});
 add('mcb3','Chint',`NXB-63 3P C${a}`,`${a}A · منحنى C · 6kA`,{rating:a});
 add('mcb3','LS',`BKN 3P C${a}A`,`${a}A · منحنى C · 6kA`,{rating:a});
}
/* ---------- ديفرنسيال ---------- */
for(const a of RATR){
 add('rcd','Schneider',`iID 2P ${a}A 30mA`,`${a}A · 30mA · نوع AC`,{rating:a});
 add('rcd','ABB',`F202 AC-${a}/0.03`,`${a}A · 30mA · نوع AC`,{rating:a});
 add('rcd','Siemens',`5SV3 31${a===25?2:a===40?4:6}-6`,`${a}A · 30mA · نوع AC`,{rating:a});
 add('rcd','Eaton',`PF6-${a}/2/003`,`${a}A · 30mA · نوع AC`,{rating:a});
 add('rcd','Legrand',`RX³ 2P ${a}A 30mA`,`${a}A · 30mA · نوع AC`,{rating:a});
 add('rcd','Hager',`CDC2${a}F`,`${a}A · 30mA · نوع AC`,{rating:a});
 add('rcd','Chint',`NL1-63 2P ${a}A 30mA`,`${a}A · 30mA · نوع AC`,{rating:a});
 add('rcd','LS',`RKN 2P ${a}A 30mA`,`${a}A · 30mA · نوع AC`,{rating:a});
}
/* ---------- كونتاكتورات (AC-3، 400V) ---------- */
const COILS=[['M7','220V AC'],['Q7','380V AC'],['F7','110V AC'],['BD','24V DC']];
const KC=[[9,4],[12,5.5],[18,7.5],[25,11],[32,15],[38,18.5],[40,18.5],[50,22],[65,30],[80,37],[95,45]];
for(const [a,kw] of KC){
 for(const [cs,cv] of COILS)if(cs==='M7'||a<=38)add('kc','Schneider',`LC1D${pad(a)}${cs}`,`${a}A · ${kw}kW · كويل ${cv}`,{amp:a});
}
for(const [a,kw] of [[9,4],[12,5.5],[16,7.5],[26,11],[30,15],[38,18.5],[40,18.5],[50,22],[65,30],[80,37],[96,45]])add('kc','ABB',`AF${pad(a)}-30-10-13`,`${a}A · ${kw}kW · كويل 100-250V`,{amp:a});
for(const [m,a,kw] of [['3RT2015-1AP01',7,3],['3RT2016-1AP01',9,4],['3RT2017-1AP01',12,5.5],['3RT2018-1AP01',16,7.5],['3RT2023-1AP00',9,4],['3RT2024-1AP00',12,5.5],['3RT2025-1AP00',17,7.5],['3RT2026-1AP00',25,11],['3RT2027-1AP00',32,15],['3RT2028-1AP00',38,18.5],['3RT2035-1AP00',40,18.5],['3RT2036-1AP00',50,22],['3RT2037-1AP00',65,30],['3RT2038-1AP00',80,37]])add('kc','Siemens',m,`${a}A · ${kw}kW · كويل 230V AC`,{amp:a});
for(const [a,kw] of [[7,3],[9,4],[12,5.5],[15,7.5],[17,7.5],[25,11],[32,15],[38,18.5],[40,18.5],[50,22],[65,30],[80,37],[95,45]])add('kc','Eaton',`DILM${a}-10(230V50HZ)`,`${a}A · ${kw}kW · كويل 230V AC`,{amp:a});
for(const [a,kw] of KC)add('kc','Chint',`NXC-${pad(a)} 220V`,`${a}A · ${kw}kW · كويل 220V AC`,{amp:a});
for(const [m,a,kw] of [['MC-9b',9,4],['MC-12b',12,5.5],['MC-18b',18,7.5],['MC-25a',25,11],['MC-32a',32,15],['MC-40a',40,18.5],['MC-50a',50,22],['MC-65a',65,30],['MC-75a',75,37],['MC-85a',85,45]])add('kc','LS',m+' AC220V',`${a}A · ${kw}kW · كويل 220V AC`,{amp:a});
for(const [m,a,kw] of [['S-T10',11,4],['S-T12',13,5.5],['S-T20',18,7.5],['S-T25',26,11],['S-T32',32,15],['S-T35',40,18.5],['S-T50',50,22],['S-T65',65,30],['S-T80',80,37]])add('kc','Mitsubishi',m+' AC200V',`${a}A · ${kw}kW · كويل 200-240V AC`,{amp:a});
/* ---------- أوفرلود (مدى الضبط) ---------- */
const mid=(a,b)=>Math.round((a+b)/2*2)/2;
for(const [m,a,b] of [['LRD06',1,1.6],['LRD07',1.6,2.5],['LRD08',2.5,4],['LRD10',4,6],['LRD12',5.5,8],['LRD14',7,10],['LRD16',9,13],['LRD21',12,18],['LRD22',16,24],['LRD32',23,32]])add('ol','Schneider',m,`${a}-${b}A · لـLC1D`,{setA:mid(a,b),olMin:a,olMax:b});
for(const [m,a,b] of [['TF42-1.7',1.3,1.7],['TF42-2.3',1.7,2.3],['TF42-3.1',2.3,3.1],['TF42-4.2',3.1,4.2],['TF42-5.7',4.2,5.7],['TF42-7.6',5.7,7.6],['TF42-10',7.6,10],['TF42-13',10,13],['TF42-16',13,16],['TF42-20',16,20],['TF42-24',20,24],['TF42-29',24,29],['TF42-35',29,35]])add('ol','ABB',m,`${a}-${b}A · لـAF`,{setA:Math.min(32,mid(a,b)),olMin:a,olMax:b});
for(const [m,a,b] of [['3RU2116-1EB0',2.8,4],['3RU2116-1FB0',3.5,5],['3RU2116-1GB0',4.5,6.3],['3RU2116-1HB0',5.5,8],['3RU2116-1JB0',7,10],['3RU2116-1KB0',9,12.5],['3RU2126-4AB0',11,16],['3RU2126-4BB0',14,20],['3RU2126-4CB0',17,22],['3RU2126-4DB0',20,25],['3RU2126-4EB0',23,28],['3RU2126-4NB0',27,32]])add('ol','Siemens',m,`${a}-${b}A · لـ3RT2`,{setA:mid(a,b),olMin:a,olMax:b});
for(const [m,a,b] of [['ZB12-4',2.4,4],['ZB12-6',4,6],['ZB12-10',6,10],['ZB12-12',9,12],['ZB12-16',10,16],['ZB32-24',16,24],['ZB32-32',24,32]])add('ol','Eaton',m,`${a}-${b}A · لـDILM`,{setA:mid(a,b),olMin:a,olMax:b});
for(const [a,b] of [[2.5,4],[4,6],[5.5,8],[7,10],[9,13],[12,18],[17,25],[23,32]])add('ol','Chint',`NXR-25 ${a}-${b}A`,`${a}-${b}A · لـNXC`,{setA:mid(a,b),olMin:a,olMax:b});
for(const [a,b] of [[2.5,4],[4,6],[5,8],[6,9],[7,10],[9,13],[12,18],[16,22],[18,25],[22,32]])add('ol','LS',`MT-32 ${a}-${b}A`,`${a}-${b}A · لـMC`,{setA:mid(a,b),olMin:a,olMax:b});
/* ---------- تايمرات ---------- */
for(const [b,m,s] of [['Omron','H3CR-A8 AC100-240','متعدّد الوظايف · 0.05s-300h'],['Omron','H3CR-G8EL','ستار دلتا · 220V'],['Omron','H3Y-2 AC220','تأخير تشغيل · 2 كونتاك'],['Schneider','RE17RAMU','تأخير تشغيل · 24-240V'],['Schneider','RE17RMMU','متعدّد الوظايف · 24-240V'],['Schneider','RE22R1AMR','ستار دلتا (Y-Δ)'],['Siemens','3RP2505-1BW30','متعدّد الوظايف · 12-240V'],['Siemens','3RP2574-1NW30','ستار دلتا (Y-Δ)'],['ABB','CT-ERD.12','تأخير تشغيل · 24-240V'],['ABB','CT-SDD.22','ستار دلتا (Y-Δ)'],['Finder','80.01.0.240.0000','متعدّد الوظايف · 12-240V'],['Finder','80.82.0.240.0000','ستار دلتا (Y-Δ)'],['Chint','NJS1-X','تأخير تشغيل · 220V'],['Chint','NKG1','تايمر أسبوعي'],['LS','TDR-SA','تأخير تشغيل · 220V'],['Eaton','ETR4-11-A','متعدّد الوظايف · 24-240V']])add('tmr',b,m,s,{});
/* ---------- ريليهات مساعدة ---------- */
for(const [b,m,s] of [['Finder','40.52.8.230.0000','2 كونتاك · 8A · 230V AC'],['Finder','55.34.8.230.0040','4 كونتاك · 7A · 230V AC'],['Finder','46.52.8.230.0040','2 كونتاك · 8A · سليم'],['Omron','MY2N-GS AC220/240','2 كونتاك · 5A · 220V'],['Omron','MY4N-GS AC220/240','4 كونتاك · 5A · 220V'],['Omron','LY2N AC220/240','2 كونتاك · 10A · 220V'],['Omron','G2R-2-SN AC230','2 كونتاك · 5A · سليم'],['Schneider','RXM2AB2P7','2 كونتاك · 12A · 230V AC'],['Schneider','RXM4AB2P7','4 كونتاك · 6A · 230V AC'],['Schneider','RSB1A160P7','1 كونتاك · 16A · 230V AC'],['Siemens','3RH2122-1AP00','ريليه كونتاكتور · 2NO+2NC'],['Siemens','LZX:PT570730','4 كونتاك · 6A · 230V'],['ABB','CR-M230AC2','2 كونتاك · 12A · 230V'],['ABB','CR-M230AC4','4 كونتاك · 6A · 230V'],['Chint','NXJ-2Z AC220V','2 كونتاك · 5A · 220V'],['Chint','JZX-22F(D)/4Z','4 كونتاك · 5A · 220V'],['Eaton','DILA-22(230V50HZ)','ريليه كونتاكتور · 2NO+2NC'],['Phoenix Contact','PLC-RSC-230UC/21','1 كونتاك · 6A · سليم']])add('relay',b,m,s,{});
/* ---------- كبسات ولمبات ---------- */
const PB=[['Schneider','XB5AA31','XB5AA42','XB5AS8442','XB5AVM'],['Schneider','XB4BA31','XB4BA42','XB4BS8442','XB4BVM'],['Siemens','3SU1100-0AB40','3SU1100-0AB20','3SU1100-1HB20','3SU1106-6AA'],['ABB','MP1-10G','MP1-10R','MPMT3-10R','CL2-523'],['Eaton','M22-D-G','M22-D-R','M22-PV/KC02','M22-L'],['Chint','NP2-BA31','NP2-BA42','NP2-BS542','ND16-22DS'],['LS','KPF22','KPF22','KMF22','KLF22'],['Telemecanique','ZB5AA3','ZB5AA4','ZB5AS844','ZB5AV0']];
const LCOL=[['g','خضرا','3'],['r','حمرا','4'],['y','صفرا','5'],['w','بيضا','1']];
for(const [b,g,r,e,l] of PB){
 add('pbg',b,g,'كبسة تشغيل خضرا · 1NO · 22mm',{});
 add('pbr',b,r,'كبسة توقيف حمرا · 1NC · 22mm',{});
 add('es',b,e,'كبسة طوارئ فطر · 1NC · بتعلّق',{});
 for(const [v,n,d] of LCOL)add('lamp',b,`${l}${d}`,`لمبة إشارة ${n} LED · 230V`,{color:v});
}
/* ---------- موتورات ---------- */
for(const kw of [2.2,4,5.5,7.5,11,15]){
 add('motor','Siemens',`1LE1 ${kw}kW 4P`,`${kw}kW · 400V · 1450rpm · IE3`,{kw});
 add('motor','ABB',`M2BAX ${kw}kW 4P`,`${kw}kW · 400V · 1450rpm · IE2`,{kw});
 add('motor','WEG',`W22 ${kw}kW 4P`,`${kw}kW · 400V · 1450rpm · IE3`,{kw});
 add('motor','Leroy-Somer',`LSES ${kw}kW 4P`,`${kw}kW · 400V · 1450rpm · IE3`,{kw});
}
for(const kw of [7.5,11,15,18.5,22]){
 add('motor6','Siemens',`1LE1 ${kw}kW Δ400V`,`${kw}kW · ستار دلتا · 6 أطراف`,{kw});
 add('motor6','ABB',`M3BP ${kw}kW Δ400V`,`${kw}kW · ستار دلتا · 6 أطراف`,{kw});
 add('motor6','WEG',`W22 ${kw}kW Δ400V`,`${kw}kW · ستار دلتا · 6 أطراف`,{kw});
}
/* ---------- إنارة ومفاتيح وبرايز ---------- */
for(const [b,s1,s2,so] of [['Legrand','Mosaic 077011','Mosaic 077001','Mosaic 077111'],['Legrand','Valena 752001','Valena 752005','Valena 753021'],['Schneider','Unica MGU3.101','Unica MGU3.103','Unica MGU3.037'],['ABB','Zenit N2101','Zenit N2102','Zenit N2288'],['Hager','Kallysta WK001','Kallysta WK005','Kallysta WK041'],['Chint','NEW5 1G1W','NEW5 1G2W','NEW5 16A']]){
 add('sw1',b,s1,'مفتاح ضو · 10A',{});add('sw2',b,s2,'مفتاح درج (2 طريق) · 10A',{});add('socket',b,so,'بريز 16A مع أرضي',{});
}
/* ---------- مصادر وحمل وترمينال وتركيب ---------- */
for(const [b,m] of [['Phoenix Contact','UT 4'],['Phoenix Contact','UT 6'],['Phoenix Contact','UT 10'],['Weidmüller','WDU 4'],['Weidmüller','WDU 6'],['Weidmüller','WDU 10'],['Schneider','NSYTRV42'],['Legrand','Viking 3 4mm²'],['Chint','UK-4'],['Chint','UK-6']])add('tb',b,m,'ترمينال سكّة · '+(m.match(/\d+/g)||['4']).pop()+'mm²',{});
for(const [b,m] of [['Hager','HTG457H'],['Legrand','Lexic 4mm'],['Siemens','8GF1'],['Phoenix Contact','NS 35/7.5']])add('rail',b,m,'سكّة DIN 35mm',{});
for(const [b,m] of [['Legrand','Lina 25 40x60'],['Hager','BA7 40x40'],['Schneider','NSYDCV40'],['Iboco','40x60']])add('duct',b,m,'مجرى شرايط',{});
for(const [b,m,s] of [['Hochiki','DCD-1E','حسّاس دخان'],['Apollo','ORB-OP','حسّاس دخان ضوئي'],['System Sensor','2151E','حسّاس دخان']])add('smoke',b,m,s,{});
for(const [b,m,s] of [['Hochiki','CHQ-WS2','جرس/سيرينة 24V'],['Klaxon','Sonos Pulse','سيرينة مع فلاش']])add('siren',b,m,s,{});

/* ---------- ماركات (ترتيب العرض) ---------- */
const ORDER=['Schneider','ABB','Siemens','Eaton','Legrand','Hager','Chint','LS','Mitsubishi','Omron','Finder','Telemecanique','Phoenix Contact','Weidmüller','WEG','Leroy-Somer'];
const brands=t=>{const s=[...new Set((C[t]||[]).map(x=>x.b))];return s.sort((a,b)=>(ORDER.indexOf(a)+99)%999-(ORDER.indexOf(b)+99)%999);};
const total=Object.values(C).reduce((n,a)=>n+a.length,0);
const find=q=>{q=String(q||'').toLowerCase().replace(/\s+/g,'');if(q.length<2)return [];const out=[];
 for(const [t,L] of Object.entries(C))for(const x of L)if((x.b+x.m).toLowerCase().replace(/\s+/g,'').includes(q))out.push(Object.assign({t},x));return out.slice(0,40);};
window.CATALOG={C,brands,total,find};
})();
