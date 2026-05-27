const CACHE_NAME = 'bentosite-cache-v1';
const ASSETS = [
  '/bentosite/',
  '/bentosite/favicon.ico',
  '/bentosite/icon-192x192.png',
  '/bentosite/icon-512x512.png',
  '/bentosite/models/model.glb'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Warm up the cache with critical assets
      return cache.addAll(ASSETS).catch((err) => {
        console.warn('PWA Service Worker - precaching warming skipped:', err);
      });
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Offline-first resource fetching strategy
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request).catch(() => {
        // Fallback offline behavior
        if (event.request.mode === 'navigate') {
          return caches.match('/bentosite/');
        }
      });
    })
  );
});
