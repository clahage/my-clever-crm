// Simple service worker for PWA offline support

// Only register service worker in production
if (typeof self !== 'undefined' && (self.location.hostname !== 'localhost' && self.location.hostname !== '127.0.0.1')) {
  self.addEventListener('install', event => {
    self.skipWaiting();
  });

  self.addEventListener('activate', event => {
    self.clients.claim();
  });

  self.addEventListener('fetch', event => {
    event.respondWith(
      caches.open('v1').then(cache =>
        cache.match(event.request).then(response =>
          response || fetch(event.request).then(res => {
            // Only cache GET requests (POST/PUT/DELETE are not supported by Cache API)
            if (event.request.method === 'GET') {
              cache.put(event.request, res.clone());
            }
            return res;
          })
        )
      )
    );
  });
}
