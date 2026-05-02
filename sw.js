const CACHE_NAME = 'sight-words-mission-v3';
const APP_SCOPE = self.registration.scope;
const APP_SHELL = [
  '',
  'index.html',
  'style.css',
  'script.js',
  'manifest.webmanifest',
  'audio/tick.wav',
  'audio/success.wav',
  'audio/fail.wav',
  'audio/levelup.wav',
  'icons/icon.svg',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/apple-touch-icon.png',
].map((path) => new URL(path, APP_SCOPE).toString());

const INDEX_URL = new URL('index.html', APP_SCOPE).toString();
const NAVIGATION_TIMEOUT_MS = 2500;

function fetchWithTimeout(request, timeoutMs = NAVIGATION_TIMEOUT_MS) {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => reject(new Error('Network timed out')), timeoutMs);
    fetch(request).then((response) => {
      clearTimeout(timeoutId);
      resolve(response);
    }).catch((error) => {
      clearTimeout(timeoutId);
      reject(error);
    });
  });
}

async function cacheResponse(request, response) {
  if (!response || !response.ok) return;
  const cache = await caches.open(CACHE_NAME);
  await cache.put(request, response.clone());
}

async function cachedAppShell() {
  const indexResponse = await caches.match(INDEX_URL);
  return indexResponse || caches.match(APP_SCOPE);
}

function offlineFallback() {
  return new Response(
    '<!doctype html><title>Sight Words Studio</title><meta name="viewport" content="width=device-width, initial-scale=1"><body><h1>Sight Words Studio</h1><p>The app is offline and the cached shell is not available yet. Reopen it once while connected.</p></body>',
    {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    }
  );
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys
        .filter((key) => key !== CACHE_NAME)
        .map((key) => caches.delete(key))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const requestUrl = new URL(event.request.url);

  if (requestUrl.origin !== self.location.origin) return;

  if (event.request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        const cachedResponse = await cachedAppShell();

        if (cachedResponse) {
          fetchWithTimeout(event.request)
            .then((response) => cacheResponse(INDEX_URL, response))
            .catch(() => {});
          return cachedResponse;
        }

        try {
          const networkResponse = await fetchWithTimeout(event.request);
          cacheResponse(INDEX_URL, networkResponse);
          return networkResponse;
        } catch (error) {
          return (await cachedAppShell()) || offlineFallback();
        }
      })()
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        fetch(event.request)
          .then((networkResponse) => cacheResponse(event.request, networkResponse))
          .catch(() => {});
        return cachedResponse;
      }

      return fetch(event.request).then((networkResponse) => {
        cacheResponse(event.request, networkResponse);
        return networkResponse;
      }).catch(() => caches.match(event.request));
    })
  );
});
