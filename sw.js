/* TPB Ensemble · Service Worker (Version 11, F-034 Offline)
   - App-Seite: zuerst aus dem Netz (damit Updates sofort ankommen), ohne Netz oder bei sehr langsamem Netz aus dem Speicher.
   - Schriften, Bibliothek, Icons: aus dem Speicher (Dateinamen sind versioniert).
   - Dateien für unterwegs: legt die App unter …/datei/<id> im Speicher „tpb-dateien-v1“ ab; dieser Worker liefert sie aus.
   - Alte Adresse beta/: leitet auf die Hauptadresse weiter, auch ohne Netz.
   Für eine neue Version VERSION hochzählen. */
const VERSION = "tpb-ensemble-v12";
const DATEIEN = "tpb-dateien-v1";
const SHELL = [
  "./", "./manifest.webmanifest?v=3",
  "apple-touch-icon.png?v=3", "icon-192.png?v=3", "icon-512.png?v=3", "icon-maskable-512.png?v=3",
  "assets/schrift/schrift.css?v=1",
  "assets/schrift/bodoni-moda-latin-opsz-normal.woff2", "assets/schrift/bodoni-moda-latin-opsz-italic.woff2",
  "assets/schrift/bodoni-moda-latin-ext-opsz-normal.woff2", "assets/schrift/bodoni-moda-latin-ext-opsz-italic.woff2",
  "assets/schrift/instrument-sans-latin-wght-normal.woff2", "assets/schrift/instrument-sans-latin-ext-wght-normal.woff2",
  "assets/schrift/ibm-plex-mono-latin-500-normal.woff2", "assets/schrift/ibm-plex-mono-latin-ext-500-normal.woff2",
  "assets/js/supabase-2.117.3.js"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION && k !== DATEIEN).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function seite(text, status) {
  return new Response('<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<body style="margin:0;padding:24px;background:#000;color:#fbf8f1;font:16px system-ui">' + text + "</body>",
    { status: status || 200, headers: { "content-type": "text/html; charset=utf-8" } });
}

/* App-Seite: Netz zuerst; nach 4 Sekunden ohne Antwort oder ohne Netz die gespeicherte Seite */
function appSeite(req) {
  const ausNetz = fetch(req).then((res) => {
    if (res.ok) { const copy = res.clone(); caches.open(VERSION).then((c) => c.put("./", copy)); }
    return res;
  });
  const gespeichert = caches.open(VERSION).then((c) => c.match("./"));
  const warten = new Promise((r) => setTimeout(r, 4000)).then(() => gespeichert);
  return Promise.race([ausNetz.catch(() => gespeichert), warten.then((hit) => hit || ausNetz)])
    .then((res) => res || ausNetz)
    .catch(() => gespeichert.then((hit) => hit || seite("<p>Die App ist noch nicht auf diesem Gerät gespeichert. Bitte einmal mit Netz öffnen.</p>", 503)));
}

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  const scopePath = new URL(self.registration.scope).pathname;
  const path = url.pathname;

  /* Dateien für unterwegs (F-034) */
  if (path.startsWith(scopePath + "datei/")) {
    e.respondWith(caches.open(DATEIEN).then((c) => c.match(url.origin + url.pathname)).then((hit) =>
      hit || seite("<p>Diese Datei ist nicht auf dem Gerät gespeichert.</p>", 404)));
    return;
  }
  if (req.mode === "navigate") {
    if (path === scopePath || path === scopePath + "index.html") { e.respondWith(appSeite(req)); return; }
    if (path.startsWith(scopePath + "beta")) {
      e.respondWith(fetch(req).catch(() => Response.redirect(self.registration.scope + url.hash, 302)));
      return;
    }
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
  /* alte Links auf beta/ führen zur Hauptadresse */
  const ziel = ((e.notification.data && e.notification.data.url) || "./").replace(/^beta\//, "./");
  const url = new URL(ziel, self.registration.scope).href;
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
    const base = url.split("#")[0];
    const hit = list.find((c) => c.url.split("#")[0] === base);
    if (hit) return hit.navigate(url).then((c) => (c || hit).focus()).catch(() => hit.focus());
    return self.clients.openWindow(url);
  }));
});
