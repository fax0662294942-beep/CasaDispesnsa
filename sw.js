const CACHE = 'dispensa-casa-v7b-2';
const ASSETS = ['./manifest.json', './icon-192.png', './icon-512.png'];

// Ascolta messaggio SKIP_WAITING
self.addEventListener('message', e => {
  if(e.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('install', e => {
  // NON mettere index.html in cache — va sempre dalla rete
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = e.request.url;
  
  // index.html e navigazione: SEMPRE dalla rete, mai dalla cache
  if(e.request.mode === 'navigate' || url.includes('index.html')) {
    e.respondWith(
      fetch(e.request, {cache: 'no-store'}).catch(() => caches.match('./index.html'))
    );
    return;
  }
  
  // Icone e manifest: cache first
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});
