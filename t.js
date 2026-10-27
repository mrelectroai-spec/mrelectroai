/* MrElectroAI: عدّاد زيارات بسيط، رقم عشوائي للجهاز والصفحة (بلا IP).
   وأوّل مرّة بيفوت فيها حدا عالموقع، بيطلب اسمو ورقمو مرّة وحدة (بيوصلوا لأنور بس). */
(function () {
  try {
    var K = 'sb_publishable_wSY0Oa0SmW_Ipgaerw-zCA_CM_PZQvK';
    var U = 'https://utjpvjnhffapbwpbkkuc.supabase.co/rest/v1/page_views';
    var ls = window.localStorage;
    var v = ls.getItem('mea_vid');
    if (!v) { v = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2, 12); ls.setItem('mea_vid', v); }
    window.MEA_VID = v;
    var me = document.currentScript, page = (me && me.getAttribute('data-page')) || 'other';
    var q = new URLSearchParams(location.search);
    var src = (q.get('src') || q.get('utm_source') || '').slice(0, 40);
    if (src) { try { if (!ls.getItem('mea_src')) ls.setItem('mea_src', src); } catch (e) {} }
    var ref = '';
    try { if (document.referrer) { var h = new URL(document.referrer).hostname; if (h && h !== location.hostname) ref = h.slice(0, 80); } } catch (e) {}
    var dev = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) ? 'mobile' : 'desktop';
    function send(part) {
      var key = 'mea_pv_' + page + '_' + (part || '');
      var last = +(ls.getItem(key) || 0);
      if (Date.now() - last < 30 * 60 * 1000) return;   // نفس الصفحة خلال نص ساعة ما بتنعدّ مرتين
      ls.setItem(key, String(Date.now()));
      fetch(U, { method: 'POST', keepalive: true,
        headers: { apikey: K, Authorization: 'Bearer ' + K, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
        body: JSON.stringify({ vid: v, page: page, part: part || null, src: src || null, ref: ref || null, dev: dev }) }).catch(function () {});
    }
    var hashPart = function () { return me && me.hasAttribute('data-hash') ? (location.hash.slice(1, 40) || null) : null; };
    send(hashPart());

    // ---------- أوّل ما يفوت: اسمو ورقمو (مرّة وحدة عهالتلفون) ----------
    var GATE = { home: 1, sample: 1, lab: 1, course: 1, classic: 1, solar: 1, quiz: 1, tools: 1 };
    var LU = 'https://utjpvjnhffapbwpbkkuc.supabase.co/rest/v1/site_leads';
    function known() {
      try { var l = JSON.parse(ls.getItem('mea_lead') || 'null'); if (l && l.name && l.phone) return l; } catch (e) {}
      var ks = ['electro-course-v1', 'classic-course-v1', 'solar-course-v1'];
      for (var i = 0; i < ks.length; i++) { try { var o = JSON.parse(ls.getItem(ks[i]) || 'null'); if (o && o.name && o.phone) return { name: o.name, phone: o.phone }; } catch (e) {} }
      return null;
    }
    function record(l) {
      if (ls.getItem('mea_lead_sent') === v) return;
      ls.setItem('mea_lead_sent', v);
      fetch(LU, { method: 'POST', keepalive: true,
        headers: { apikey: K, Authorization: 'Bearer ' + K, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
        body: JSON.stringify({ vid: v, name: String(l.name).slice(0, 80), phone: String(l.phone).slice(0, 25), page: page, src: (src || ls.getItem('mea_src') || '').slice(0, 80) || null, dev: dev }) }).catch(function () {});
    }
    function fill(l) {   // إذا في فورم بالصفحة (الكورس)، منعبّيه
      var n = document.getElementById('nm'), ph = document.getElementById('ph');
      if (n && !n.value) n.value = l.name; if (ph && !ph.value) ph.value = l.phone;
    }
    function gate() {
      var st = document.createElement('style');
      st.textContent = '#meaGate{position:fixed;inset:0;z-index:9999;background:rgba(3,10,8,.82);display:flex;align-items:center;justify-content:center;padding:16px;direction:rtl;font-family:inherit}' +
        '#meaGate form{width:min(400px,100%);background:#0E1A17;color:#E8F2EE;border:1px solid #1E332D;border-radius:22px;padding:24px 20px;box-shadow:0 24px 70px rgba(0,0,0,.55);text-align:right}' +
        '#meaGate .lg{display:flex;align-items:center;gap:10px;direction:ltr;justify-content:flex-end;font:700 17px ui-monospace,monospace;color:#22C79B;margin-bottom:12px}' +
        '#meaGate h2{margin:0 0 4px;font-size:22px;font-weight:700}#meaGate p{margin:0 0 14px;color:#9fb6af;font-size:14.5px;line-height:1.6}' +
        '#meaGate label{display:block;font-size:14px;font-weight:600;margin:10px 0 5px}' +
        '#meaGate input{width:100%;box-sizing:border-box;background:#070F0D;border:1px solid #1E332D;color:#E8F2EE;border-radius:12px;padding:12px 13px;font:inherit;font-size:16px}' +
        '#meaGate input:focus{outline:2px solid #22C79B;border-color:transparent}' +
        '#meaGate .er{color:#ff6b6b;font-size:13.5px;min-height:20px;margin-top:6px}' +
        '#meaGate button{width:100%;margin-top:4px;background:#22C79B;color:#031310;border:0;border-radius:14px;padding:14px;font:inherit;font-size:17px;font-weight:700;cursor:pointer}' +
        '#meaGate .pv{font-size:12.5px;color:#7B928C;margin-top:10px;text-align:center}';
      document.head.appendChild(st);
      var d = document.createElement('div'); d.id = 'meaGate'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true');
      d.innerHTML = '<form novalidate><div class="lg">MrElectroAI ⚡</div><h2>أهلا فيك 👋</h2>' +
        '<p>اكتب اسمك ورقمك وفوت عالموقع: الكتب، العيّنات المجانية، الكورسات، ومختبر القطع.</p>' +
        '<label for="mgN">اسمك</label><input id="mgN" type="text" autocomplete="name" placeholder="مثلاً: محمد علي">' +
        '<label for="mgP">رقمك (واتساب)</label><input id="mgP" type="tel" inputmode="tel" autocomplete="tel" dir="ltr" placeholder="70 123 456">' +
        '<div class="er" id="mgE"></div><button type="submit">فوت ⚡</button>' +
        '<div class="pv">رقمك بيوصل لأنور بس، وما بينشارك مع حدا.</div></form>';
      document.body.appendChild(d);
      document.documentElement.style.overflow = 'hidden';
      setTimeout(function () { var i = document.getElementById('mgN'); if (i) i.focus(); }, 80);
      d.querySelector('form').addEventListener('submit', function (e) {
        e.preventDefault();
        var n = document.getElementById('mgN').value.trim().replace(/\s+/g, ' '), ph = document.getElementById('mgP').value.trim(), er = document.getElementById('mgE');
        if (n.length < 2) { er.textContent = 'اكتب اسمك.'; return; }
        if (ph.replace(/\D/g, '').length < 7) { er.textContent = 'اكتب رقمك كامل.'; return; }
        var l = { name: n, phone: ph };
        try { ls.setItem('mea_lead', JSON.stringify(l)); } catch (x) {}
        record(l); fill(l);
        d.remove(); document.documentElement.style.overflow = '';
      });
    }
    if (GATE[page]) {
      var kl = known();
      if (kl) record(kl); else if (document.body) gate(); else document.addEventListener('DOMContentLoaded', gate);
    }
    if (me && me.hasAttribute('data-hash')) window.addEventListener('hashchange', function () { send(hashPart()); });
  } catch (e) {}
})();
