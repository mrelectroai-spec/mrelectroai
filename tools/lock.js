/* ══════════════════════════════════════════════════
   MrElectroAI — نظام تفعيل الأدوات
   ──────────────────────────────────────────────────
   طريقة الاستعمال: ضيف هالسطر بأي أداة قبل </body>

   <script src="../lock.js" data-tool="roof"></script>

   data-tool = اسم الأداة (roof · transformer · inverters · load · wirephase)
   الأدوات المجانية ما بتحتاج هالملف أصلاً.
   ══════════════════════════════════════════════════ */
(function(){
  const SB_URL = "https://utjpvjnhffapbwpbkkuc.supabase.co";
  const SB_KEY = "sb_publishable_wSY0Oa0SmW_Ipgaerw-zCA_CM_PZQvK";
  const WA     = "96179434479";
  const SITE   = "https://mrelectroai-spec.github.io/mrelectroai/";

  const me   = document.currentScript;
  const TOOL = (me && me.dataset.tool) || 'tool';
  const KEY  = 'mea_lic_' + TOOL;

  /* ── بصمة الجهاز ── */
  async function fingerprint(){
    const s = [navigator.userAgent, navigator.language, screen.width+'x'+screen.height,
               new Date().getTimezoneOffset(), navigator.hardwareConcurrency||0].join('|');
    const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
    return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('').slice(0,24);
  }
  async function api(path, opts={}){
    const r = await fetch(SB_URL+'/rest/v1/'+path, { ...opts, headers:{
      apikey:SB_KEY, Authorization:'Bearer '+SB_KEY, 'Content-Type':'application/json',
      Prefer:'return=representation', ...(opts.headers||{}) }});
    if(!r.ok) throw new Error(await r.text());
    return r.status===204 ? null : r.json();
  }

  /* ── واجهة القفل ── */
  const css = `
  #meaLock{position:fixed;inset:0;z-index:99999;background:#081311;
    background-image:radial-gradient(circle at 50% -10%,rgba(34,199,155,.16),transparent 58%);
    display:grid;place-items:center;padding:20px;
    font-family:'IBM Plex Sans Arabic',system-ui,sans-serif;direction:rtl}
  #meaLock *{box-sizing:border-box;margin:0;padding:0}
  #meaLock .box{width:100%;max-width:370px;text-align:center;color:#E4F0EC}
  #meaLock .ic{width:74px;height:74px;border-radius:22px;background:#22C79B;color:#04140F;
    display:grid;place-items:center;font-size:36px;margin:0 auto 16px}
  #meaLock h2{font-size:22px;font-weight:700;margin-bottom:5px}
  #meaLock p{font-size:13px;color:#7D948E;line-height:1.8;margin-bottom:20px}
  #meaLock input{width:100%;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.18);
    color:#fff;text-align:center;font-family:'JetBrains Mono',monospace;font-size:19px;
    letter-spacing:3px;padding:15px;border-radius:13px;text-transform:uppercase}
  #meaLock input:focus{outline:none;border-color:#22C79B;background:rgba(255,255,255,.11)}
  #meaLock .err{font-size:13px;color:#FF8B8B;min-height:22px;margin-top:9px;line-height:1.6}
  #meaLock .ok{color:#7BE8A5}
  #meaLock button,#meaLock a.btn{display:flex;align-items:center;justify-content:center;gap:8px;
    width:100%;padding:15px;border-radius:13px;font-family:inherit;font-size:15px;font-weight:700;
    border:0;cursor:pointer;margin-top:10px;text-decoration:none}
  #meaLock .go{background:#22C79B;color:#04140F}
  #meaLock .wa{background:rgba(255,255,255,.09);color:#E4F0EC;border:1px solid rgba(255,255,255,.18)}
  #meaLock .ft{margin-top:22px;font-size:11.5px;color:#5E7370;line-height:1.9}
  #meaLock .ft a{color:#22C79B;text-decoration:none}
  #meaLock .or{display:flex;align-items:center;gap:12px;margin:16px 0 4px;color:#5E7370;font-size:12px}
  #meaLock .or:before,#meaLock .or:after{content:'';flex:1;height:1px;background:rgba(255,255,255,.13)}
  #meaLock .tr{background:rgba(232,163,61,.14);color:#F0B85C;border:1px solid rgba(232,163,61,.4)}
  #meaLock .feat{background:rgba(34,199,155,.08);border:1px solid rgba(34,199,155,.3);
    border-radius:13px;padding:13px;margin-bottom:18px;font-size:12.5px;color:#B8D4CB;line-height:1.9;text-align:right}
  `;

  function ui(){
    const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    const d = document.createElement('div'); d.id='meaLock';
    d.innerHTML = `<div class="box">
      <div class="ic">🔐</div>
      <h2>أداة للمشتركين</h2>
      <p>هالأداة بتحتاج مفتاح تفعيل.<br>إذا عندك مفتاح، حطّه وبيفتح لعندك للأبد.</p>
      <div class="feat">✅ كل الأدوات بمفتاح واحد<br>✅ تحديثات مجانية<br>✅ دعم مباشر على واتساب</div>
      <input id="meaKey" placeholder="MEA-XXXX-XXXX" autocomplete="off" spellcheck="false">
      <div class="err" id="meaErr"></div>
      <button class="go" id="meaGo">تفعيل</button>
      <div class="or"><span>أو</span></div>
      <button class="tr" id="meaTrial">🎁 جرّبها مجاناً 3 أيام</button>
      <a class="btn wa" id="meaWa" target="_blank" rel="noopener">💬 بدي مفتاح</a>
      <div class="ft"><b style="color:#E4F0EC">MrElectroAI</b> — أنور الحسن الجاسم<br>
        <a href="${SITE}" target="_blank">زور موقعنا</a></div>
    </div>`;
    document.body.appendChild(d);
    document.getElementById('meaWa').href = 'https://wa.me/'+WA+'?text='+
      encodeURIComponent('مرحبا، بدي مفتاح تفعيل لأدوات MrElectroAI.');
    document.getElementById('meaTrial').onclick = trialForm;
    const inp = document.getElementById('meaKey');
    inp.addEventListener('keydown', e=>{ if(e.key==='Enter') check(); });
    document.getElementById('meaGo').onclick = check;
    setTimeout(()=>inp.focus(), 300);
  }
  function trialForm(){
    document.querySelector('#meaLock .box').innerHTML = `
      <div class="ic">🎁</div>
      <h2>تجربة مجانية</h2>
      <p>٣ أيام كاملة — كل الميزات بدون قيود.<br>بس اسمك ورقمك ومنبلّش.</p>
      <input id="meaTN" placeholder="اسمك" autocomplete="off" style="letter-spacing:0;text-align:right">
      <input id="meaTP" placeholder="رقم موبايلك" inputmode="numeric"
        autocomplete="off" style="letter-spacing:1px;margin-top:10px">
      <div class="err" id="meaErr"></div>
      <button class="go" id="meaTGo">ابدأ التجربة</button>
      <button class="btn wa" id="meaBack">← رجوع</button>
      <div class="ft">رقمك بيوصلني لأتابع معك بس تخلص التجربة — وما بينشارك مع حدا.</div>`;
    document.getElementById('meaTGo').onclick = startTrial;
    document.getElementById('meaBack').onclick = ()=>{ document.getElementById('meaLock').remove();
      document.querySelectorAll('style').forEach(s=>{ if(s.textContent.includes('#meaLock')) s.remove(); }); ui(); };
    setTimeout(()=>document.getElementById('meaTN').focus(),200);
  }

  async function startTrial(){
    const n = document.getElementById('meaTN').value.trim();
    const p = document.getElementById('meaTP').value.replace(/\D/g,'').replace(/^961/,'').replace(/^0/,'');
    if(n.length < 2) return err('اكتب اسمك');
    if(p.length < 7) return err('اكتب رقم موبايل صحيح');
    const btn = document.getElementById('meaTGo');
    btn.disabled = true; btn.textContent = 'لحظة...';
    const fp = await fingerprint();
    /* إذا جرّب قبل على نفس الجهاز */
    try{
      const old = await api('trials?device=eq.'+fp+'&select=*');
      if(old && old.length){
        const t = old[0];
        if(new Date(t.ends) > new Date()){
          localStorage.setItem(KEY+'_trial', JSON.stringify({ends:t.ends,name:t.name}));
          btn.disabled=false; err('✅ تجربتك شغّالة — أهلاً '+t.name, true);
          return setTimeout(()=>location.reload(), 900);
        }
        btn.disabled=false;
        return err('استعملت التجربة المجانية من قبل. تواصل معي لمفتاح كامل 👇');
      }
    }catch(e){}
    const ends = new Date(Date.now()+3*864e5).toISOString();
    try{
      await api('trials', { method:'POST', body: JSON.stringify([{ id:'t'+Date.now().toString(36),
        name:n, phone:p, tool:TOOL, device:fp, ends }]) });
    }catch(e){ btn.disabled=false; return err('ما قدرنا نبلّش — تفقّد الإنترنت'); }
    localStorage.setItem(KEY+'_trial', JSON.stringify({ends,name:n}));
    err('✅ تفضّل — التجربة بلّشت', true);
    setTimeout(()=>location.reload(), 900);
  }

  const err = (m,ok) => { const e=document.getElementById('meaErr');
    e.textContent=m; e.className = ok ? 'err ok' : 'err'; };

  async function check(){
    const code = document.getElementById('meaKey').value.trim().toUpperCase();
    if(code.length < 6) return err('اكتب المفتاح كامل');
    const btn = document.getElementById('meaGo');
    btn.disabled = true; btn.textContent = 'عم نتحقق...';
    const r = await verify(code);
    btn.disabled = false; btn.textContent = 'تفعيل';
    if(r.ok){ err('✅ تم التفعيل — أهلاً '+r.name, true);
      localStorage.setItem(KEY, code); setTimeout(()=>location.reload(), 900); }
    else err(r.msg);
  }

  async function verify(code){
    let rows;
    try{ rows = await api('licenses?code=eq.'+encodeURIComponent(code)+'&select=*'); }
    catch(e){ return { ok:false, msg:'ما قدرنا نتحقق — تفقّد الإنترنت' }; }
    if(!rows || !rows.length) return { ok:false, msg:'المفتاح غير صحيح' };
    const L = rows[0];
    if(!L.active) return { ok:false, msg:'هالمفتاح موقوف — تواصل معنا' };
    if(L.expires && new Date(L.expires) < new Date(new Date().toDateString()))
      return { ok:false, msg:'انتهت صلاحية المفتاح بتاريخ '+L.expires };
    if(L.tools && L.tools!=='all' && !L.tools.split(',').map(s=>s.trim()).includes(TOOL))
      return { ok:false, msg:'هالمفتاح ما بيشمل هالأداة' };
    const fp = await fingerprint();
    if(L.device && L.device !== fp)
      return { ok:false, msg:'هالمفتاح مفعّل على جهاز تاني' };
    try{ await api('licenses?code=eq.'+encodeURIComponent(code), { method:'PATCH',
      body: JSON.stringify({ device: L.device || fp, uses:(L.uses||0)+1,
        last_seen: new Date().toISOString() }) }); }catch(e){}
    return { ok:true, name: L.name };
  }

  /* ── التشغيل ── */
  function trialLeft(){
    try{ const t=JSON.parse(localStorage.getItem(KEY+'_trial')||'null');
      if(!t) return 0;
      const ms = new Date(t.ends) - new Date();
      return ms > 0 ? Math.ceil(ms/864e5) : 0;
    }catch(e){ return 0; }
  }
  function trialBanner(days){
    const b = document.createElement('div');
    b.style.cssText='position:fixed;bottom:0;inset-inline:0;z-index:9998;background:#22C79B;'
      +'color:#04140F;font-family:IBM Plex Sans Arabic,sans-serif;font-size:12.5px;font-weight:700;'
      +'padding:9px 14px calc(9px + env(safe-area-inset-bottom));text-align:center;direction:rtl;'
      +'display:flex;align-items:center;justify-content:center;gap:10px';
    b.innerHTML='🎁 تجربة مجانية — باقي '+days+' '+(days===1?'يوم':'أيام')
      +' <a href="https://wa.me/'+WA+'?text='+encodeURIComponent('مرحبا، بدي مفتاح تفعيل للأدوات.')
      +'" target="_blank" style="background:#04140F;color:#22C79B;border-radius:8px;'
      +'padding:5px 12px;text-decoration:none">بدي مفتاح</a>';
    document.body.appendChild(b);
  }

  async function boot(){
    const d = trialLeft();
    if(d > 0){ trialBanner(d); return; }
    const saved = localStorage.getItem(KEY);
    if(!saved){ ui(); return; }
    const r = await verify(saved);
    if(r.ok) return;                       /* مفعّل — بيكمّل عادي */
    if(r.msg.includes('نتحقق')) return;    /* ما في إنترنت — بيشتغل مؤقتاً */
    localStorage.removeItem(KEY); ui();
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
