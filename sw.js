// LunarVeilAstro Service Worker — offline support
var CACHE = 'lva-v20260716';
var ASSETS = [
  '/lunarveil-astro/',
  '/lunarveil-astro/index.html',
  '/lunarveil-astro/styles.css',
  '/lunarveil-astro/i18n.js',
  '/lunarveil-astro/js/astronomy.js',
  '/lunarveil-astro/js/compass.js',
  '/lunarveil-astro/js/fortune.js',
  '/lunarveil-astro/js/lodge.js',
  '/lunarveil-astro/js/skynow.js',
  '/lunarveil-astro/js/ui.js',
  '/lunarveil-astro/js/tarot.js',
  '/lunarveil-astro/js/dailycard.js',
  '/lunarveil-astro/js/html-to-image.js',
  '/lunarveil-astro/js/data.js',
  '/lunarveil-astro/js/data-guanyin.js',
  '/lunarveil-astro/js/data-guandi.js',
  '/lunarveil-astro/js/data-lvzu.js',
  '/lunarveil-astro/img/favicon-32x32.png',
  '/lunarveil-astro/img/favicon-16x16.png',
  '/lunarveil-astro/img/apple-touch-icon.png',
  '/lunarveil-astro/img/og-image.jpg',
];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(cache) {
      return cache.addAll(ASSETS).catch(function(err) {
        console.warn('SW install: some assets failed to cache', err);
      });
    }).then(function() { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.filter(function(k) { return k !== CACHE; }).map(function(k) {
        return caches.delete(k);
      }));
    }).then(function() { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e) {
  // Skip non-GET and cross-origin (except Google Fonts)
  if (e.request.method !== 'GET') return;
  var url = new URL(e.request.url);
  if (url.origin !== self.location.origin && !url.hostname.includes('fonts.googleapis.com') && !url.hostname.includes('fonts.gstatic.com')) return;

  e.respondWith(
    caches.match(e.request).then(function(cached) {
      var fetched = fetch(e.request).then(function(response) {
        if (response && response.status === 200) {
          var clone = response.clone();
          caches.open(CACHE).then(function(cache) { cache.put(e.request, clone); });
        }
        return response;
      }).catch(function() {
        return cached || new Response('Offline — please check your connection.', {status:503});
      });
      return cached || fetched;
    })
  );
});
