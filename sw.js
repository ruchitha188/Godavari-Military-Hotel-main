const CACHE_NAME = 'raajanna-cache-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/menu.html',
  '/gallery.html',
  '/about-us.html',
  '/contact.html',
  '/login.html',
  '/admin.html',
  '/assets/css/styles.css',
  '/assets/js/scripts.js',
  '/assets/js/data.js',
  '/assets/js/auth.js',
  '/assets/js/gold-dust.js',
  '/assets/icons/app-icon-512.png',
  '/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME).map(name => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // COMPLETELY BYPASS custom API endpoints so they are never cached
  if (url.pathname.startsWith('/api/') || url.search.includes('?t=')) {
    return; // Fall back to network automatically
  }

  // NETWORK-FIRST STRATEGY: Always try to get the newest file from the internet,
  // but if the device is offline, fall back to the cached version.
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Only cache successful local responses
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache);
        });

        return response;
      })
      .catch(() => {
        // If network fails, serve from cache
        return caches.match(event.request);
      })
  );
});
