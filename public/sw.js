const CACHE_NAME = "civismart-v3";
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

// ── Installation : mise en cache des assets statiques
self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return Promise.allSettled(STATIC_ASSETS.map(url => cache.add(url).catch(() => {})));
    }).then(() => self.skipWaiting())
  );
});

// ── Activation : nettoyage des anciens caches
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// ── Fetch : stratégie Network First pour l'API, Cache First pour les assets
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);

  // Requêtes API : toujours réseau, pas de cache
  if (url.pathname.startsWith("/api/")) {
    e.respondWith(
      fetch(e.request).catch(() =>
        new Response(JSON.stringify({ erreur: "Hors ligne — vérifiez votre connexion" }), {
          status: 503,
          headers: { "Content-Type": "application/json" }
        })
      )
    );
    return;
  }

  // POST/PATCH/DELETE : jamais caché
  if (e.request.method !== "GET") return;

  // Assets statiques : Cache First avec fallback réseau
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(response => {
        if (response && response.status === 200 && response.type !== "opaque") {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        }
        return response;
      }).catch(() => {
        // Fallback : retourner index.html pour la navigation SPA
        if (e.request.destination === "document") {
          return caches.match("/");
        }
      });
    })
  );
});

// ── Message : forcer la mise à jour du cache
self.addEventListener("message", e => {
  if (e.data && e.data.type === "SKIP_WAITING") self.skipWaiting();
});
