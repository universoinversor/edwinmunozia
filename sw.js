'use strict';
/* ════════════════════════════════════════════════
   EDWIN MUÑOZ ISAZA — Service Worker v1.4
   Strategy: Cache-First for assets, Network-First for HTML
   ════════════════════════════════════════════════ */

const CACHE_NAME = 'em-portfolio-v1.4';
const OFFLINE_URL = '/404';

const STATIC_ASSETS = [
    '/',
    '/index',
    '/desarrollo',
    '/cripto',
    '/marketing',
    '/negocios',
    '/diplomado',
    '/404',
    '/style.css',
    '/script.js',
    '/favicon.svg',
    '/manifest.json',
    '/assets_v2/img/ai_entity_bot.png',
    '/assets_v2/img/edwin-tech-main.png'
];

// ─── INSTALL ──────────────────────────────────────────────
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(STATIC_ASSETS.map(url => new Request(url, { cache: 'reload' })));
        })
    );
    self.skipWaiting();
});

// ─── ACTIVATE ─────────────────────────────────────────────
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        )
    );
    self.clients.claim();
});

// ─── FETCH ────────────────────────────────────────────────
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET and cross-origin
    if (request.method !== 'GET' || url.origin !== location.origin) return;

    // HTML pages: Network-First → fallback to cache → fallback to 404
    if (request.headers.get('accept')?.includes('text/html')) {
        event.respondWith(
            fetch(request)
                .then(res => {
                    const clone = res.clone();
                    caches.open(CACHE_NAME).then(c => c.put(request, clone));
                    return res;
                })
                .catch(() =>
                    caches.match(request).then(cached => cached || caches.match(OFFLINE_URL))
                )
        );
        return;
    }

    // Assets (CSS, JS, images): Cache-First → Network fallback
    event.respondWith(
        caches.match(request).then(cached => {
            if (cached) return cached;
            return fetch(request).then(res => {
                if (res.ok) {
                    const clone = res.clone();
                    caches.open(CACHE_NAME).then(c => c.put(request, clone));
                }
                return res;
            });
        })
    );
});

