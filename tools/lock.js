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
      <a class="btn wa" id="meaWa" target="_blank" rel="noopener">💬 بدي مفتاح</a>
      <div class="ft"><b style="color:#E4F0EC">MrElectroAI</b> — أنور الحسن الجاسم<br>
        <a href="${SITE}" target="_blank">زور موقعنا</a></div>
    </div>`;
    document.body.appendChild(d);
    document.getElementById('meaWa').href = 'https://wa.me/'+WA+'?text='+
      encodeURIComponent('مرحبا، بدي مفتاح تفعيل لأدوات MrElectroAI.');
    const inp = document.getElementById('meaKey');
    inp.addEventListener('keydown', e=>{ if(e.key==='Enter') check(); });
    document.getElementById('meaGo').onclick = check;
    setTimeout(()=>inp.focus(), 300);
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
  async function boot(){
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
