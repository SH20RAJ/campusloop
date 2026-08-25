const CACHE_NAME = "campusloop-shell-v2";
const STATIC_SHELL = [
  "/",
  "/app",
  "/app/chat",
  "/app/discover",
  "/app/colleges",
  "/app/communities",
  "/app/notifications",
  "/app/dating",
  "/app/profile",
  "/manifest.json",
  "/favicon.svg",
  "/logo.png",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];

// Install: Pre-cache core shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_SHELL).catch((err) => {
        console.warn("PWA: Pre-caching some assets failed:", err);
      });
    })
  );
  self.skipWaiting();
});

// Activate: Clean up older cache versions
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => clients.claim())
  );
});

// Fetch: Optimized Strategy depending on request type
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and Hexclave auth handlers
  if (request.method !== "GET" || url.pathname.startsWith("/handler/")) {
    return;
  }

  // 1. Static Assets & Images: Cache-first with Network Fallback
  if (
    url.pathname.startsWith("/icons/") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".ico") ||
    url.pathname.endsWith(".woff2") ||
    url.pathname.endsWith(".webp") ||
    url.hostname.includes("giphy.com") ||
    url.hostname.includes("images.unsplash.com")
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // 2. Read-Only API Endpoints: Network-first with Cache Fallback (Stale-While-Revalidate)
  if (
    url.pathname.startsWith("/api/colleges") ||
    url.pathname.startsWith("/api/communities") ||
    url.pathname.startsWith("/api/feed") ||
    url.pathname.startsWith("/api/profile/") ||
    url.pathname.startsWith("/api/dating/profiles")
  ) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cached) => {
            if (cached) return cached;
            return new Response(JSON.stringify({ error: "Offline mode", cached: true }), {
              headers: { "Content-Type": "application/json" },
              status: 200,
            });
          });
        })
    );
    return;
  }

  // 3. Navigation / HTML Pages: Network-first with App-Shell Fallback
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          const appShell = await caches.match("/app");
          if (appShell) return appShell;
          return caches.match("/");
        })
    );
  }
});
