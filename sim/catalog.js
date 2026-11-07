// كتالوج الإنفرترات والبطاريات المتوفّرة بلبنان + جدول التوافق (BMS)
// الأرقام من الـDatasheet الرسمية لكل موديل. شيك الـManual تبع موديلك قبل التركيب.
'use strict';
(function(){
const INV=[
 {id:'deye5',brand:'Deye',model:'SUN-5K-SG03LP1-EU',kw:5,type:'hybrid',screen:'deye',maxVoc:500,startV:125,mppt:[150,425],nMppt:2,imp:13,maxPv:6500,maxCh:120,maxDis:120,acCh:120,sell:true,
  ports:'CAN · RS485',note:'هايبرد: بيبيع للشبكة، Time Of Use، وزيرو إكسبورت بالـCT.'},
 {id:'deye6',brand:'Deye',model:'SUN-6K-SG05LP1-EU',kw:6,type:'hybrid',screen:'deye',maxVoc:500,startV:125,mppt:[150,425],nMppt:2,imp:13,maxPv:7800,maxCh:135,maxDis:135,acCh:135,sell:true,
  ports:'CAN · RS485',note:'نفس شاشة وإعدادات الـ5K، تيار البطارية لحدّ 135A.'},
 {id:'deye8',brand:'Deye',model:'SUN-8K-SG05LP1-EU',kw:8,type:'hybrid',screen:'deye',maxVoc:500,startV:125,mppt:[150,425],nMppt:2,imp:13,maxPv:10400,maxCh:190,maxDis:190,acCh:190,sell:true,
  ports:'CAN · RS485',note:'تيار البطارية لحدّ 190A: بدّو كابلات وقاطع أكبر.'},
 {id:'fel5',brand:'Felicity',model:'IVEM5048',kw:5,type:'offgrid',screen:'felicity',maxVoc:500,startV:125,mppt:[120,450],nMppt:1,imp:20,maxPv:6000,maxCh:100,maxDis:115,acCh:100,sell:false,
  ports:'RS485 · CAN',note:'أوف غريد: MPPT واحد، ما بيبيع للشبكة. الدولة بتمرق Bypass.'},
 {id:'fel8',brand:'Felicity',model:'IVEM8048-II',kw:8,type:'offgrid',screen:'felicity',maxVoc:500,startV:100,mppt:[90,450],nMppt:2,imp:20,maxPv:10000,maxCh:150,maxDis:185,acCh:150,sell:false,
  ports:'RS485 · CAN',note:'أوف غريد 8kW بـMPPT تنين (20A لكل واحد).'},
 {id:'grw6',brand:'Growatt',model:'SPF 6000ES Plus',kw:6,type:'offgrid',screen:'growatt',maxVoc:500,startV:120,mppt:[120,450],nMppt:2,imp:16,maxPv:8000,maxCh:100,maxDis:140,acCh:100,sell:false,
  ports:'BMS (RS485/CAN)',note:'أوف غريد بـMPPT تنين، بيشتغل بلا بطارية. البرمجة بأرقام البرامج.'},
 {id:'vol8',brand:'Voltronic',model:'Axpert MAX II 8KW',kw:8,type:'offgrid',screen:'voltronic',maxVoc:500,startV:100,mppt:[90,450],nMppt:2,imp:18,maxPv:8000,perMppt:4000,maxCh:150,maxDis:185,acCh:120,sell:false,
  ports:'BMS (RS485/CAN)',note:'أوف غريد: كل MPPT لحدّ 4000W. البرمجة بأرقام البرامج (01، 02، 05…).'},
 {id:'vol11',brand:'Voltronic',model:'Axpert MAX II 11KW',kw:11,type:'offgrid',screen:'voltronic',maxVoc:500,startV:100,mppt:[90,450],nMppt:2,imp:18,maxPv:11000,perMppt:5500,maxCh:150,maxDis:250,acCh:150,sell:false,
  ports:'BMS (RS485/CAN)',note:'كل MPPT لحدّ 5500W، وشحن من الدولة لحدّ 150A.'},
];
const BAT=[
 {id:'deyeg5',brand:'Deye',model:'SE-G5.1 Pro-B',ah:100,rec:50,maxCh:100,maxDis:100,comm:['CAN','RS485'],dod:90,par:'لحدّ 64 بالتوازي',note:'بطارية Deye الأصلية، فيها قاطع داخلي.'},
 {id:'dynbx',brand:'Dyness',model:'BX51100',ah:100,rec:50,maxCh:75,maxDis:75,comm:['CAN','RS485','RS232'],dod:90,par:'لحدّ 30 بالتوازي',note:'تصميم اقتصادي عالأرض أو عالحيط.'},
 {id:'dynb',brand:'Dyness',model:'B51100',ah:100,rec:50,maxCh:75,maxDis:75,comm:['CAN','RS485'],dod:90,par:'لحدّ 40 بالتوازي',note:'رف 19 إنش، الاتصال الافتراضي CAN.'},
 {id:'fel100',brand:'Felicity',model:'LPBF48100',ah:100,rec:50,maxCh:100,maxDis:100,comm:['CAN','RS485'],dod:95,par:'لحدّ 6 بالتوازي',note:'عالحيط، بتحدّد رقم كل بطارية بالـDIP.'},
 {id:'fel200',brand:'Felicity',model:'LPBF48200',ah:200,rec:80,maxCh:120,maxDis:120,comm:['CAN','RS485'],dod:95,par:'لحدّ 6 بالتوازي',note:'10kWh بقطعة وحدة.'},
 {id:'bcuu',brand:'Blue Carbon',model:'BCT-UU48-200',ah:200,rec:100,maxCh:100,maxDis:100,comm:[],dod:80,par:'—',note:'النسخة العادية: ما فيها منفذ اتصال، بتشتغل عالفولت.'},
 {id:'bcsm',brand:'Blue Carbon',model:'SMART-BCT-V-48-200P',ah:200,rec:100,maxCh:100,maxDis:100,comm:['CAN','RS485'],dod:80,par:'Stackable',note:'النسخة الذكية فيها CAN وRS485.'},
];
// إعدادات البطارية لكل نوع شاشة
const PROG={
 growatt:{bat:'05',bopts:['AGM','FLd','USE','LI'],li:o=>o==='LI',proto:'36',popts:['L01','L02','L51','L52']},
 voltronic:{bat:'05',bopts:['AGM','FLd','USE','PYL','LIb','LIC'],li:o=>['PYL','LIb','LIC'].includes(o)},
 felicity:{bat:'08',bopts:['AGM','FLd','USE','LIb','PYL'],li:o=>['LIb','PYL'].includes(o)},
};
// التوافق: lvl ok = معتمد من الشركة، chk = بيشتغل بس تأكّد من الوكيل/السوفتوير، none = بلا اتصال
function compat(inv,bat){
 const sc=inv.screen;
 if(!bat.comm.length){
  const set=sc==='deye'?['Batt Mode: Use Batt V','Absorption V: 56.8V','Float V: 54.0V','Shutdown: 47.0V']
   :[`${PROG[sc].bat} Battery type: USE`,'Bulk 56.8V · Float 54.0V','Low DC cut-off: 47.0V'];
  return{lvl:'none',port:null,code:null,set,txt:`${bat.brand} ${bat.model} ما فيها منفذ اتصال. الإنفرتر بيشتغل عالفولت، وإنت المسؤول عن تيار الشحن (${bat.maxCh}A) والفولتات.`};}
 const B=bat.brand,I=inv.brand;
 if(sc==='deye'){
  const lvl=(B==='Deye'||B==='Dyness'||B==='Felicity')?'ok':'chk';
  return{lvl,port:'CAN',code:0,set:['Batt Mode: Lithium','Lithium Mode: 00','كابل CAN من البطارية لـBMS'],
   txt:lvl==='ok'?`${B} بتحكي مع Deye على CAN بالبروتوكول 00 (متل Pylontech).`:`${B} الذكية فيها CAN، وعادةً بتشتغل على 00. اسأل الوكيل عن البروتوكول ووضعية الـDIP قبل التركيب.`};}
 if(sc==='growatt'){
  if(B==='Dyness')return{lvl:'ok',port:'RS485',code:'L01',set:['05 Battery type: LI','36 Protocol: L01','كابل RS485 لمنفذ BMS'],txt:'Dyness موجودة بجدول Growatt على RS485 بالبروتوكول L01.'};
  return{lvl:'chk',port:'CAN',code:'L52',set:['05 Battery type: LI','36 Protocol: L52','كابل CAN لمنفذ BMS'],txt:`${B} بتشتغل مع Growatt على CAN بالبروتوكول L52 (Pylon) إذا البطارية بتدعمو. تأكّد من الوكيل.`};}
 if(sc==='voltronic'){
  const lvl=B==='Dyness'?'ok':'chk';
  return{lvl,port:'RS485',code:'PYL',set:['05 Battery type: PYL','كابل RS485 لمنفذ BMS'],
   txt:lvl==='ok'?'Dyness بتحكي مع Axpert على PYL (نفس بروتوكول Pylontech). إذا ما زبطت، بعض السوفتويرات بدها LIC.':`${B} بتشتغل مع Axpert على PYL إذا البطارية بتدعم بروتوكول Pylontech على RS485. تأكّد من الوكيل والسوفتوير.`};}
 if(sc==='felicity'){
  if(B==='Felicity')return{lvl:'ok',port:'RS485',code:'LIb',set:['08 Battery type: LIb','كابل RS485/CAN لمنفذ BMS'],txt:'إنفرتر وبطارية Felicity: نفس الشركة، بتحكي مباشرة على LIb.'};
  return{lvl:'chk',port:'CAN',code:'PYL',set:['08 Battery type: PYL','كابل CAN لمنفذ BMS'],txt:`إنفرترات Felicity عادةً بتحكي بس مع بطاريات Felicity. السوفتويرات الجديدة فيها PYL لبطاريات تانية متل ${B}. إذا السوفتوير قديم، اشتغل USE عالفولت.`};}
}
function chA(inv,bat,n){return Math.min(bat.maxCh*n,inv.maxCh);}
function disA(inv,bat,n){return Math.min(bat.maxDis*n,inv.maxDis);}
function brkBat(inv){const a=inv.maxDis;return a<=125?'DC 125A':(a<=160?'DC 160A':(a<=200?'DC 200A':'DC 250A'));}
function brkAC(inv){return inv.kw<=6?'2P 32A':(inv.kw<=8?'2P 40A':'2P 63A');}
const PRESETS=[['deye5','deyeg5',1],['deye5','bcuu',1],['deye6','dynbx',2],['fel5','fel100',1],['fel5','deyeg5',1],['grw6','dynb',2],['vol8','dynbx',2],['vol11','bcsm',1]];
window.CAT={INV,BAT,PROG,compat,chA,disA,brkBat,brkAC,PRESETS,
 inv:id=>INV.find(x=>x.id===id)||INV[0],bat:id=>BAT.find(x=>x.id===id)||BAT[0]};
})();
