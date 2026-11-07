// Offline cache for PyLearn Quiz. Bump VERSION when the page changes.
const VERSION = 'pyquiz-v3';
const FILES = ['/pyQuiz/', '/pyQuiz/manifest.webmanifest', '/pyQuiz/icon-192.png', '/pyQuiz/icon-512.png', '/pyQuiz/icon-maskable-512.png', '/pyQuiz/apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k.startsWith('pyquiz-') && k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin || !url.pathname.startsWith('/pyQuiz/')) return;

  if (req.mode === 'navigate') {
    // Network first (3 s), so online visits get the newest cards; cache when offline.
    // Only the quiz page itself is stored as the shell, and a failed cache write
    // never throws away a good download.
    const isShell = url.pathname === '/pyQuiz/' || url.pathname === '/pyQuiz/index.html';
    const network = fetch(req);
    e.waitUntil(network.then(async res => {
      if (isShell && res.ok && (res.headers.get('Content-Type') || '').includes('text/html')) {
        const copy = res.clone();
        const cache = await caches.open(VERSION);
        await cache.put('/pyQuiz/', copy);
      }
    }).catch(() => null));
    const timeout = new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 3000));
    e.respondWith(
      Promise.race([network, timeout])
        .then(res => { if (isShell && !res.ok) throw new Error('bad'); return res; })
        .catch(async () => (isShell && await caches.match('/pyQuiz/')) || (await caches.match(req)) || new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain' } }))
    );
    return;
  }

  e.respondWith(
    caches.open(VERSION).then(async cache => {
      const hit = await cache.match(req);
      if (hit) {
        e.waitUntil(fetch(req).then(async res => { if (res.ok) await cache.put(req, res); }).catch(() => null));
        return hit;
      }
      const res = await fetch(req);
      if (res.ok) await cache.put(req, res.clone());
      return res;
    })
  );
});
