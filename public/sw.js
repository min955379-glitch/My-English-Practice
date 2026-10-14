const CACHE = "english-practice-public-v4";
const PAGES = [
  "/",
  "/learn",
  "/guides",
  "/planner",
  "/session",
  "/dashboard",
  "/phonics",
  "/reading",
  "/pronunciation",
  "/dictation",
  "/profile",
  "/help",
  "/privacy",
  "/terms",
  "/about",
  "/contact",
];
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then(async (cache) => {
      await Promise.allSettled(
        PAGES.map(async (path) => {
          const response = await fetch(path, { cache: "reload" });
          if (response.ok) await cache.put(path, response);
        }),
      );
      await self.skipWaiting();
    }),
  );
});
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter(
              (k) => k.startsWith("english-practice-public-") && k !== CACHE,
            )
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});
self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (
    request.method !== "GET" ||
    url.origin !== self.location.origin ||
    url.pathname.startsWith("/api/")
  )
    return;
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then(async (response) => {
          if (response.ok && PAGES.includes(url.pathname)) {
            const cache = await caches.open(CACHE);
            await cache.put(url.pathname, response.clone());
          }
          return response;
        })
        .catch(
          async () =>
            (await caches.match(url.pathname)) ||
            (await caches.match("/")) ||
            new Response("Reconnect to load this page.", {
              status: 503,
              headers: { "Content-Type": "text/plain" },
            }),
        ),
    );
  } else if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then(async (response) => {
            if (response.ok) {
              const cache = await caches.open(CACHE);
              await cache.put(request, response.clone());
            }
            return response;
          }),
      ),
    );
  }
});
