// EduSync Service Worker
// Caches the app shell for offline use

const CACHE_VERSION = 'v1';
const STATIC_CACHE = `edusync-static-${CACHE_VERSION}`;
const PAGES_CACHE = `edusync-pages-${CACHE_VERSION}`;
const FONTS_CACHE = `edusync-fonts-${CACHE_VERSION}`;

// App shell resources to pre-cache on install
const APP_SHELL = [
    '/',
    '/offline',
    '/dashboard',
    '/downloads',
    '/login',
    '/register',
    '/profile',
    '/manifest.json',
    '/icon-192x192.png',
    '/icon-512x512.png',
];

// ─── Install: pre-cache app shell ─────────────────────────────────────────
self.addEventListener('install', (event) => {
    console.log('[SW] Installing...');
    event.waitUntil(
        caches.open(STATIC_CACHE).then((cache) => {
            console.log('[SW] Pre-caching app shell');
            // Use individual adds so one failure doesn't block the rest
            return Promise.allSettled(APP_SHELL.map((url) => cache.add(url)));
        }).then(() => self.skipWaiting())
    );
});

// ─── Activate: clean up old caches ────────────────────────────────────────
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating...');
    const currentCaches = [STATIC_CACHE, PAGES_CACHE, FONTS_CACHE];
    event.waitUntil(
        caches.keys().then((cacheNames) =>
            Promise.all(
                cacheNames
                    .filter((name) => !currentCaches.includes(name))
                    .map((name) => {
                        console.log('[SW] Deleting old cache:', name);
                        return caches.delete(name);
                    })
            )
        ).then(() => self.clients.claim())
    );
});

// ─── Fetch: smart caching strategy ────────────────────────────────────────
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET and cross-origin API requests to the backend
    if (request.method !== 'GET') return;
    if (url.hostname.includes('onrender.com')) return;
    if (url.pathname.startsWith('/api/')) return;

    // Strategy: Cache-First for Next.js static assets (JS, CSS, fonts, images) and RSC payloads
    if (
        url.pathname.startsWith('/_next/static/') ||
        url.pathname.startsWith('/_next/image') ||
        url.search.includes('_rsc') ||
        /\.(png|jpg|jpeg|svg|ico|woff2?|ttf|otf|eot)$/.test(url.pathname)
    ) {
        event.respondWith(cacheFirst(request, STATIC_CACHE));
        return;
    }

    // Strategy: Cache-First for Google Fonts
    if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
        event.respondWith(cacheFirst(request, FONTS_CACHE));
        return;
    }

    // Strategy: Network-First for all page navigations
    if (request.mode === 'navigate') {
        event.respondWith(networkFirstWithOfflineFallback(request));
        return;
    }
});

// ─── Cache-First strategy ─────────────────────────────────────────────────
async function cacheFirst(request, cacheName) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) return cachedResponse;

    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(cacheName);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch {
        return new Response('Offline', {
            status: 503,
            headers: { 'X-SW-Error': 'Offline-Cache-Miss' }
        });
    }
}

// ─── Network-First with offline fallback ──────────────────────────────────
async function networkFirstWithOfflineFallback(request) {
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(PAGES_CACHE);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch {
        // Try serving from cache
        const cachedResponse = await caches.match(request);
        if (cachedResponse) return cachedResponse;

        // Fall back to the offline page
        const offlinePage = await caches.match('/offline');
        if (offlinePage) return offlinePage;

        return new Response('<h1>You are offline</h1>', {
            headers: { 'Content-Type': 'text/html' },
            status: 503,
        });
    }
}
