const CACHE_VERSION = "nerdsnote-v1"
const APP_SHELL = ["/", "/notepad", "/manifest.webmanifest"]

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_VERSION).then((cache) => cache.addAll(APP_SHELL)))
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener("fetch", (event) => {
  const request = event.request
  if (request.method !== "GET") return

  const url = new URL(request.url)
  if (
    url.origin !== self.location.origin ||
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/s/") ||
    url.pathname.startsWith("/_next/webpack-hmr")
  ) {
    return
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone()
            caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy))
          }
          return response
        })
        .catch(async () => (await caches.match(request)) || caches.match("/notepad")),
    )
    return
  }

  if (url.pathname.startsWith("/_next/static/") || request.destination === "image" || request.destination === "font") {
    event.respondWith(
      caches.match(request).then((cached) => {
        const network = fetch(request)
          .then((response) => {
            if (response.ok) {
              caches.open(CACHE_VERSION).then((cache) => cache.put(request, response.clone()))
            }
            return response
          })
          .catch(() => cached || Response.error())
        return cached || network
      }),
    )
  }
})
