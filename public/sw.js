const CACHE_NAME = "campusloop-shell-v3";
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

// ─── Web Push: wake, fetch, notify ───
// Pushes arrive without a payload (VAPID-authenticated tickles), so the
// content is pulled here over the student's own session. Nothing sensitive
// ever passes through the push service.
self.addEventListener("push", (event) => {
  event.waitUntil(
    (async () => {
      let payload = null;

      // Honour an inline payload if one is ever sent, otherwise go fetch.
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
        // Collapse repeats so a burst of activity is one entry, not a stack
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

      // Reuse an open tab when there is one rather than piling up windows
      for (const client of allClients) {
        if (client.url.includes(self.location.origin)) {
          await client.focus();
          if ("navigate" in client) {
            try {
              await client.navigate(targetUrl);
            } catch {
              /* focused tab is enough */
            }
          }
          return;
        }
      }

      await self.clients.openWindow(targetUrl);
    })()
  );
});
