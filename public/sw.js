const CACHE_NAME = "campusloop-shell-v7";
const STATIC_SHELL = [
  "/",
  "/app",
  "/app/chat",
  "/app/discover",
  "/app/colleges",
  "/app/communities",
  "/app/notifications",
  "/app/matching",
  "/app/marketplace",
  "/app/profile",
  "/merchant-portal",
  "/merchant-portal/orders",
  "/merchant-portal/products",
  "/merchant-portal/earnings",
  "/merchant-portal/store",
  "/manifest.json",
  "/manifest-merchant.json",
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

// Activate: Clean up older cache versions and claim immediate control
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => {
        return Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              return caches.delete(key);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch: High-Performance Caching Strategy
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and Hexclave auth handlers
  if (request.method !== "GET" || url.pathname.startsWith("/handler/")) {
    return;
  }

  // 1. Static Assets, Web Fonts & Next.js Bundles: Cache-first with Background Network Update
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.hostname === "fonts.googleapis.com" ||
    url.hostname === "fonts.gstatic.com" ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".ico") ||
    url.pathname.endsWith(".woff2") ||
    url.pathname.endsWith(".webp") ||
    url.pathname.endsWith(".avif") ||
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
    url.pathname.startsWith("/api/marketplace/stores") ||
    url.pathname.startsWith("/api/marketplace/categories") ||
    url.pathname.startsWith("/api/profile/") ||
    url.pathname.startsWith("/api/dating/profiles") ||
    url.pathname.startsWith("/api/merchant/orders")
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
            return new Response(JSON.stringify({ error: "Offline", offline: true }), {
              headers: { "Content-Type": "application/json", "Retry-After": "5" },
              status: 503,
              statusText: "Offline",
            });
          });
        })
    );
    return;
  }

  // 3. Navigation / HTML Pages: Network-first with Dedicated App-Shell Fallback
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

          // Merchant Portal isolated shell
          if (url.pathname.startsWith("/merchant-portal")) {
            const merchantShell = await caches.match("/merchant-portal");
            if (merchantShell) return merchantShell;
          }

          // Main Student App isolated shell
          const appShell = await caches.match("/app");
          if (appShell) return appShell;
          return caches.match("/");
        })
    );
  }
});

// ─── Web Push: wake, fetch, notify ───
self.addEventListener("push", (event) => {
  event.waitUntil(
    (async () => {
      let payload = null;

      if (event.data) {
        try {
          payload = event.data.json();
        } catch {
          payload = null;
        }
      }

      if (!payload) {
        try {
          const res = await fetch("/api/notifications/latest", { credentials: "include" });
          if (res.ok) {
            const data = await res.json();
            payload = data.notification;
            if (typeof data.unreadCount === "number" && "setAppBadge" in self.navigator) {
              self.navigator.setAppBadge(data.unreadCount).catch(() => {});
            }
          }
        } catch {
          payload = null;
        }
      }

      const title = payload?.title || "CampusLoop";
      const body = payload?.body || "You have a new campus notification";
      const url = payload?.url || "/app/notifications";

      await self.registration.showNotification(title, {
        body,
        icon: payload?.icon || "/icons/icon-192x192.png",
        badge: "/icons/icon-192x192.png",
        tag: payload?.type || "campusloop",
        renotify: true,
        data: { url },
      });
    })()
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/app/notifications";

  event.waitUntil(
    (async () => {
      const allClients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });

      for (const client of allClients) {
        if (client.url.includes(self.location.origin)) {
          await client.focus();
          if ("navigate" in client) {
            try {
              await client.navigate(targetUrl);
            } catch {}
          }
          return;
        }
      }

      await self.clients.openWindow(targetUrl);
    })()
  );
});
