// Offline support. Fetches the newest version when online and keeps a copy for offline use. Bump VERSION when the app shell changes.
const VERSION = 'v13';
const CACHE = 'story-atlas-' + VERSION;
const SHELL = [
  './', 'index.html', 'style.css', 'app.js', 'manifest.json',
  'icon.svg', 'icon-180.png', 'icon-192.png', 'icon-512.png',
  'content/curriculum.json', 'content/concordance.json', 'content/sequences.json', 'content/diagrams.json', 'content/paths.json',
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(SHELL);
    // Also store every finished lesson and its quiz, so the whole course works offline.
    try {
      const cur = await (await fetch('content/curriculum.json')).json();
      const lessons = cur.tracks.flatMap(t => t.lessons).filter(l => l.ready);
      await cache.addAll(['content/glossary.json', 'content/scenarios.json', 'content/examples.json', ...lessons.flatMap(l => [`content/lessons/${l.id}.md`, `content/quiz/${l.id}.json`])]);
    } catch { /* lessons will be cached as they're opened */ }
    self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k.startsWith('story-atlas-') && k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  // Network first, so updates show up on the next open; fall back to the cache when offline or slow.
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    try {
      const res = await Promise.race([
        fetch(req, { cache: 'no-cache' }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 4000)),
      ]);
      if (res.ok) cache.put(req, res.clone());
      return res;
    } catch {
      const cached = await cache.match(req, { ignoreSearch: true });
      return cached || new Response('Offline', { status: 503 });
    }
  })());
});
