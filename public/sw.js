self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener("fetch", (event) => {
  // Let the browser handle standard requests, offline functionality handles gracefully via Next.js caching
  event.respondWith(fetch(event.request));
});
