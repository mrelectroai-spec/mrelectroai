/* زجاج المراية: بيظبط الثيم (نفس إعداد التطبيق siteTheme: auto/dark/light) وبيزيد الخلفية الملوّنة */
(function () {
  var d = document.documentElement;
  function pick() {
    var t = 'auto';
    try { t = localStorage.getItem('siteTheme') || 'auto'; } catch (e) {}
    return t === 'auto' ? (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark') : t;
  }
  function apply() {
    var m = pick(); d.setAttribute('data-theme', m);
    var c = document.querySelector('meta[name=theme-color]'); if (c) c.content = m === 'light' ? '#e9f2ef' : '#06110e';
  }
  apply();
  try { matchMedia('(prefers-color-scheme: light)').addEventListener('change', apply); } catch (e) {}
  window.addEventListener('storage', function (e) { if (e.key === 'siteTheme') apply(); });
  window.meaTheme = function (t) { try { localStorage.setItem('siteTheme', t); } catch (e) {} apply(); };
  function bg() { if (document.querySelector('.mea-bg') || !document.body) return; var b = document.createElement('div'); b.className = 'mea-bg'; b.setAttribute('aria-hidden', 'true'); document.body.prepend(b); }
  if (document.body) bg(); else document.addEventListener('DOMContentLoaded', bg);
})();
