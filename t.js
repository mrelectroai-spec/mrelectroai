/* MrElectroAI: عدّاد زيارات بسيط. ما بيجمع أسماء ولا IP، بس رقم عشوائي للجهاز والصفحة. */
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
    if (me && me.hasAttribute('data-hash')) window.addEventListener('hashchange', function () { send(hashPart()); });
  } catch (e) {}
})();
