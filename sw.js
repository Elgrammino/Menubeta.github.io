const CACHE_NAME = "menu-v2";

const ASSETS = [
  "/Menubeta.github.io/",
  "/Menubeta.github.io/index.html",
  "/Menubeta.github.io/logo_menu.png",
  "/Menubeta.github.io/apple-touch-icon.png",
  "/Menubeta.github.io/manifest.json"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    Promise.all([
      caches.keys().then(keys =>
        Promise.all(
          keys.map(key => {
            if (key !== CACHE_NAME) {
              return caches.delete(key);
            }
          })
        )
      ),
      self.clients.claim()
    ])
  );
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request)
      .then(cached => {
        return (
          cached ||
          fetch(event.request).then(response => {
            const copy = response.clone();

            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, copy);
            });

            return response;
          })
        );
      })
  );
});
