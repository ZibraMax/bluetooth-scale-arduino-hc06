const VERSION = "v1.3";
const CACHE_NAME = `cofee-BT-scale-${VERSION}`;
const APP_STATIC_RESOURCES = [
	"./",
	"./index.html",
	"./manifest.json",
	"./css/main.css",
	"./css/picnic.css",
	"./js/main.js",
	"./js/BluetoothTerminal.js",
	"./js/plotly-2.29.1.min.js",
	"./favicon/android-chrome-36x36.png",
	"./favicon/android-chrome-48x48.png",
	"./favicon/android-chrome-72x72.png",
	"./favicon/android-chrome-96x96.png",
	"./favicon/android-chrome-144x144.png",
	"./favicon/android-chrome-192x192.png",
	"./favicon/android-chrome-256x256.png",
	"./favicon/android-chrome-384x384.png",
	"./favicon/icon512x512.png",
	"./favicon/apple-touch-icon.png",
	"./favicon/browserconfig.xml",
	"./favicon/favicon-16x16.png",
	"./favicon/favicon-32x32.png",
	"./favicon/favicon.ico",
	"./favicon/mstile-150x150.png",
	"./favicon/safari-pinned-tab.svg",
];
self.addEventListener("install", (event) => {
	event.waitUntil(
		(async () => {
			const cache = await caches.open(CACHE_NAME);
			cache.addAll(APP_STATIC_RESOURCES);
		})()
	);
});
self.addEventListener("activate", (event) => {
	event.waitUntil(
		(async () => {
			const names = await caches.keys();
			await Promise.all(
				names.map((name) => {
					if (name !== CACHE_NAME) {
						return caches.delete(name);
					}
				})
			);
			await clients.claim();
		})()
	);
});
self.addEventListener("fetch", (event) => {
	// when seeking an HTML page
	if (event.request.mode === "navigate") {
		// Return to the index.html page
		event.respondWith(caches.match("./"));
		return;
	}

	// For every other request type
	event.respondWith(
		(async () => {
			const cache = await caches.open(CACHE_NAME);
			const cachedResponse = await cache.match(event.request.url);
			if (cachedResponse) {
				// Return the cached response if it's available.
				return cachedResponse;
			}
			// Respond with a HTTP 404 response status.
			return new Response(null, { status: 404 });
		})()
	);
});
