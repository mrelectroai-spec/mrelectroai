// رفيق الحفظ — Service Worker
// غيّر الرقم لما تعدّل index.html حتى ينزل التحديث عالموبايل
const SHELL_CACHE = 'hifz-shell-v2';
const DATA_CACHE = 'hifz-data-v1';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(SHELL_CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((k) => k.startsWith('hifz-shell-') && k !== SHELL_CACHE).map((k) => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // ملفات التطبيق: من النت أول (لتوصل التحديثات)، وإذا ما في نت من الذاكرة
  if (url.origin === self.location.origin) {
    e.respondWith(
      fetch(req).then((res) => {
        if (res.ok) { const copy = res.clone(); caches.open(SHELL_CACHE).then((c) => c.put(req, copy)); }
        return res;
      }).catch(() => caches.match(req).then((r) => r || (req.mode === 'navigate' ? caches.match('./index.html') : Response.error())))
    );
    return;
  }

  // نص المصحف والخطوط: من الذاكرة أول (ما بيتغيّروا)
  if (url.hostname === 'api.alquran.cloud' || url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(
      caches.open(DATA_CACHE).then((c) => c.match(req).then((hit) => {
        if (hit) return hit;
        return fetch(req).then((res) => { if (res.ok || res.type === 'opaque') c.put(req, res.clone()); return res; });
      }))
    );
  }
  // ملفات الصوت بيخزّنها التطبيق نفسه (hifz-audio-v1)
});
