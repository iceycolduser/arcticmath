importScripts('/uv/uv.bundle.js');
importScripts('/uv/uv.config.js');
importScripts('/uv/uv.sw.js');

const CACHE_NAME = 'arctic-v1.0';
const urlsToCache = [
  '/static/',
  '/static/index.html',
  '/static/settings.html',
  '/static/assets/css/app.css',
  '/static/assets/css/menu.css',
  '/static/assets/js/particles.js',
  '/static/assets/js/themes.js',
  '/static/assets/js/index.js',
  '/static/assets/js/anym.js',
  '/static/assets/js/main.js',
  '/static/assets/img/salyte.jpg',
  '/static/android-chrome-192x192.png',
  '/static/android-chrome-512x512.png',
  '/static/wk/wk2.js',
  '/static/wk/wk3.js'
];

const uv = new UVServiceWorker();

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache.map(url => new Request(url, {cache: 'reload'})));
      })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

async function handleRequest(event) {
  if (uv.route(event)) {
    return await uv.fetch(event);
  }

  const cachedResponse = await caches.match(event.request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const response = await fetch(event.request);
    
    if (response && response.status === 200 && response.type === 'basic') {
      const responseToCache = response.clone();
      caches.open(CACHE_NAME).then(cache => {
        cache.put(event.request, responseToCache);
      });
    }
    
    return response;
  } catch (error) {
    return await fetch(event.request);
  }
}

self.addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event));
});
