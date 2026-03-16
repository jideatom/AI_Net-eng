const CACHE = "jydfasting-v1";
const ASSETS = [
  "fasting-index.html",
  "fasting-plans.html",
  "fasting-food.html",
  "fasting-history.html",
  "fasting-veg.html",
  "fasting-36hrs.html",
  "fasting-72hrs.html",
  "fasting-120hrs.html",
  "fasting-manifest.json",
  "icon-192.png",
  "icon-512.png"
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE).map(k => caches.delete(k))
    ))
  );
  return self.clients.claim();
});

self.addEventListener("fetch", e => {
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(cache => cache.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
