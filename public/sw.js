const CACHE_NAME = "civismart-v399";
const STATIC_ASSETS = [
  "/",
  "/manifest.json",
  "/i18n.js",
  "/app.css?v=399",
  "/app.js?v=399"
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return Promise.allSettled(STATIC_ASSETS.map(url => cache.add(url).catch(() => {})));
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  // API & mutations: network-only
  const apiPaths = ["/api/","/auth/","/infos/","/equipements","/referentiel/","/rdv/","/proprete/","/eau/","/signaler/","/points/","/dashboard/","/notifications/","/participation/","/legal/","/edeval/","/cap/","/civipark/","/patrimoine/","/health","/rapports/"];
  const isApi = apiPaths.some(p => url.pathname.startsWith(p)) || (e.request.headers.get("accept") || "").includes("application/json");
  if (isApi) {
    e.respondWith(fetch(e.request).catch(() => new Response(JSON.stringify({ erreur: "Hors ligne" }), { status: 503, headers: { "Content-Type": "application/json" } })));
    return;
  }
  if (e.request.method !== "GET") return;
  // HTML documents: network-first
  if (e.request.destination === "document" || e.request.mode === "navigate") {
    e.respondWith(
      fetch(e.request).then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        }
        return response;
      }).catch(() => caches.match(e.request).then(c => c || caches.match("/")))
    );
    return;
  }
  // Other resources: cache-first
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(response => {
        if (response && response.status === 200 && response.type !== "opaque") {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        }
        return response;
      }).catch(() => {});
    })
  );
});

self.addEventListener("message", e => {
  if (e.data && e.data.type === "SKIP_WAITING") self.skipWaiting();
});
