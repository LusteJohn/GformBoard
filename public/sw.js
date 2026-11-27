const CACHE = 'formboard-v1'

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()))

// Network-first for same-origin GETs; fall back to cache when offline.
// Cross-origin requests (Google APIs) are left untouched.
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url)
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)))
})