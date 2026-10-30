/* TPB Ensemble: Seiten kommen frisch aus dem Netz, damit Updates sofort ankommen;
   ohne Netz springt der Cache ein. Für eine neue Version VERSION hochzählen. */
const VERSION = "tpb-ensemble-v11";
const SHELL = ["./", "./index.html", "./manifest.webmanifest?v=3", "apple-touch-icon.png?v=3", "icon-192.png?v=3", "icon-512.png?v=3", "icon-maskable-512.png?v=3",
  "assets/schrift/schrift.css?v=1", "assets/schrift/bodoni-moda-latin-opsz-normal.woff2", "assets/schrift/bodoni-moda-latin-opsz-italic.woff2",
  "assets/schrift/instrument-sans-latin-wght-normal.woff2", "assets/schrift/ibm-plex-mono-latin-500-normal.woff2"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  if (req.mode === "navigate") {
    /* Nur die App-Seite selbst zwischenspeichern; andere Seiten im Ordner (z. B. beta/) nicht anfassen */
    const scopePath = new URL(self.registration.scope).pathname;
    const path = new URL(req.url).pathname;
    if (path !== scopePath && path !== scopePath + "index.html") return;
    e.respondWith(
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(VERSION).then((c) => c.put("./index.html", copy));
        return res;
      }).catch(() => caches.match("./index.html"))
    );
    return;
  }
  e.respondWith(caches.match(req).then((hit) => hit || fetch(req)));
});

/* Push-Nachrichten (F-025): anzeigen und beim Antippen die App an der passenden Stelle öffnen */
self.addEventListener("push", (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (x) { d = { body: e.data ? e.data.text() : "" }; }
  e.waitUntil(self.registration.showNotification(d.title || "TPB Ensemble", {
    body: d.body || "",
    icon: "icon-192.png?v=3",
    badge: "icon-192.png?v=3",
    tag: d.tag || undefined,
    data: { url: d.url || "./" }
  }));
});
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const url = new URL((e.notification.data && e.notification.data.url) || "./", self.registration.scope).href;
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
    const base = url.split("#")[0];
    const hit = list.find((c) => c.url.split("#")[0] === base);
    if (hit) return hit.navigate(url).then((c) => (c || hit).focus()).catch(() => hit.focus());
    return self.clients.openWindow(url);
  }));
});
