const CACHE_NAME = 'video-sync-v1';
const urlsToCache = [
  'https://kualia.one/syncwave/',
  'https://kualia.one/syncwave/index.html',
  'https://kualia.one/syncwave/styles.css',
  'https://kualia.one/syncwave/main.js',
  'https://kualia.one/syncwave/videoController.js',
  'https://kualia.one/syncwave/uiController.js',
  'https://kualia.one/syncwave/syncController.js',
  'https://kualia.one/syncwave/audioAnalyzer.js',
  'https://kualia.one/syncwave/midiController.js',
  'https://kualia.one/syncwave/utils.js',
  'https://kualia.one/syncwave/icon-192x192.png',
  'https://kualia.one/syncwave/icon-512x512.png'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        return Promise.all(
          urlsToCache.map(url => {
            return cache.add(url).catch(error => {
              console.error('Failed to cache:', url, error);
            });
          })
        );
      })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});