const CACHE_NAME = "aihotel-demo-v1";
const CORE = ["/", "/frontdesk", "/staff", "/manager", "/ai-call"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE)));
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});
