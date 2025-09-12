// Progressive Web App Configuration
// For Phase 4 implementation

// manifest.json additions
const pwaManifest = {
  "name": "SpeedyCRM Client Portal",
  "short_name": "SpeedyCRM",
  "theme_color": "#3B82F6",
  "background_color": "#ffffff",
  "display": "standalone",
  "orientation": "portrait",
  "scope": "/",
  "start_url": "/client-portal",
  "icons": [
    {
      "src": "icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ]
};

// Service Worker for offline
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('v1').then(cache => {
      return cache.addAll([
        '/client-portal',
        '/client-portal/scores',
        '/offline.html'
      ]);
    })
  );
});
