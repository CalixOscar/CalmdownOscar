// Offline cache for the exam quiz. Bump VERSION when the page changes.
const VERSION = 'biancaexam-v1';
const FILES = ['/biancaexam/', '/biancaexam/manifest.webmanifest', '/biancaexam/icon-192.png', '/biancaexam/icon-512.png', '/biancaexam/apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// Open instantly from cache, and quietly refresh the cache when online.
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin || !url.pathname.startsWith('/biancaexam')) return;
  e.respondWith(
    caches.open(VERSION).then(async cache => {
      const key = req.mode === 'navigate' ? '/biancaexam/' : req;
      const hit = await cache.match(key);
      const net = fetch(req).then(r => { if (r.ok) cache.put(key, r.clone()); return r; }).catch(() => null);
      return hit || (await net) || new Response('Offline', {status: 503});
    })
  );
});
