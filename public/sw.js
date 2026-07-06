const CACHE_NAME = "civismart-v257";
const STATIC_ASSETS = [
  "/",
  "/manifest.json",
  "/icons/icon-192.svg",
  "/icons/icon-512.svg",
  "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap",
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css",
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js",
  "https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"
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
  const apiPaths = ["/api/","/auth/","/infos/","/equipements","/referentiel/","/rdv/","/proprete/","/eau/","/signaler/","/points/","/dashboard/","/notifications/","/participation/","/legal/","/edeval/","/cap/","/civipark/","/patrimoine/","/health"];
  const isApi = apiPaths.some(p => url.pathname.startsWith(p)) || (e.request.headers.get("accept") || "").includes("application/json");
  if (isApi) {
    e.respondWith(fetch(e.request).catch(() => new Response(JSON.stringify({ erreur: "Hors ligne" }), { status: 503, headers: { "Content-Type": "application/json" } })));
    return;
  }
  if (e.request.method !== "GET") return;
  // Documents HTML : network-first (toujours chercher la dernière version)
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
  // Autres ressources (CSS, JS, images) : cache-first
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
