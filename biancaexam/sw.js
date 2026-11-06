// Offline cache for the exam quiz. Bump VERSION when the page changes.
const VERSION = 'biancaexam-v2';
const IMGS = ["/biancaexam/img/c0.jpg", "/biancaexam/img/c1.jpg", "/biancaexam/img/c10.jpg", "/biancaexam/img/c11.jpg", "/biancaexam/img/c12.jpg", "/biancaexam/img/c13.jpg", "/biancaexam/img/c14.jpg", "/biancaexam/img/c15.jpg", "/biancaexam/img/c2.jpg", "/biancaexam/img/c3.jpg", "/biancaexam/img/c4.jpg", "/biancaexam/img/c5.jpg", "/biancaexam/img/c6.jpg", "/biancaexam/img/c7.jpg", "/biancaexam/img/c8.jpg", "/biancaexam/img/c9.jpg", "/biancaexam/img/t-bs.jpg", "/biancaexam/img/t-bu.jpg", "/biancaexam/img/t-cd.jpg", "/biancaexam/img/t-ch.jpg", "/biancaexam/img/t-en.jpg", "/biancaexam/img/t-hi.jpg", "/biancaexam/img/t-is.jpg", "/biancaexam/img/t-ju.jpg", "/biancaexam/img/t-ph.jpg", "/biancaexam/img/t-rs.jpg"];/*IMGS*/
const FILES = ['/biancaexam/', '/biancaexam/manifest.webmanifest', '/biancaexam/icon-192.png', '/biancaexam/icon-512.png', '/biancaexam/apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(async c => { await c.addAll(FILES); await Promise.all(IMGS.map(u => c.add(u).catch(() => null))); }).then(() => self.skipWaiting()));
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
