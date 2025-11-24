// Service Worker for Offline Support
const CACHE_NAME = 'finmate-v1';
const OFFLINE_URL = '/offline';

// Assets to cache on install
const STATIC_ASSETS = [
    '/',
    '/offline',
    '/static/js/theme.js',
    '/static/js/incognito.js',
    '/static/js/offline.js',
    '/static/js/alerts.js',
    '/static/js/readability.js',
    '/static/js/voice-mode.js',
    '/static/js/premium-modal.js',
    '/static/js/personality-share.js',
    '/static/icons/icon-192.png',
    '/static/icons/icon-512.png'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[Service Worker] Caching static assets');
            return cache.addAll(STATIC_ASSETS).catch((err) => {
                console.warn('[Service Worker] Failed to cache some assets:', err);
                // Continue even if some assets fail to cache
                return Promise.resolve();
            });
        })
    );
    // Force activation of new service worker
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[Service Worker] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    // Take control of all pages immediately
    return self.clients.claim();
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Skip cross-origin requests
    if (url.origin !== location.origin) {
        return;
    }

    // Network-first strategy for HTML pages
    if (request.headers.get('accept')?.includes('text/html')) {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    // Clone the response for caching
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(request, responseToCache);
                    });
                    return response;
                })
                .catch(() => {
                    // Network failed, try cache
                    return caches.match(request).then((cachedResponse) => {
                        if (cachedResponse) {
                            return cachedResponse;
                        }
                        // If no cache and we're offline, don't redirect to offline page
                        // The offline banner will be shown by offline.js on the current page
                        // Return error response - browser will handle it, but user stays on current page
                        return new Response('Network error', { 
                            status: 503,
                            statusText: 'Service Unavailable',
                            headers: { 'Content-Type': 'text/plain' }
                        });
                    });
                })
        );
        return;
    }

    // Cache-first strategy for static assets
    event.respondWith(
        caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }
            return fetch(request).then((response) => {
                // Don't cache non-successful responses
                if (!response || response.status !== 200 || response.type !== 'basic') {
                    return response;
                }
                const responseToCache = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(request, responseToCache);
                });
                return response;
            });
        })
    );
});

// Message event - handle cache updates
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

