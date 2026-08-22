/**
 * FPL//AI Service Worker — fplai-v2
 *
 * Strategy:
 *  - Static assets (/_next/static/, /icons/, /images/): network-first
 *  - Navigation requests (pages, API): network-first with offline fallback
 *  - Offline fallback: /offline.html (pre-cached on install)
 *
 * NOTE: _next/static/ was moved from cache-first to network-first because
 * dev bundles change on every HMR update and the SW would serve stale JS,
 * causing hydration mismatches and hiding code changes at localhost:3000.
 * In production, HTTP cache headers already handle static asset caching.
 */

const CACHE_NAME = "fplai-v2";
const OFFLINE_URL = "/offline.html";

// Assets to pre-cache on install
const PRECACHE = [
  OFFLINE_URL,
  "/logo/logo.svg",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/apple-touch-icon.png",
];

// Patterns that should use cache-first (only truly immutable assets)
const CACHE_FIRST_PATTERNS = [
  /\/icons\//,
  /\/images\//,
  /\.(?:woff2?|ttf|eot)$/,
];

// Patterns that should use network-first (includes _next/static/)
const NETWORK_FIRST_PATTERNS = [
  /\/_next\/static\//,
];

// ─── Install ─────────────────────────────────────────────────────────────────

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

// ─── Activate ────────────────────────────────────────────────────────────────

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

// ─── Fetch ────────────────────────────────────────────────────────────────────

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin requests
  if (url.origin !== self.location.origin) return;

  // Skip non-GET requests
  if (request.method !== "GET") return;

  // Network-first for _next/static/ and similar dynamic assets
  if (NETWORK_FIRST_PATTERNS.some((p) => p.test(url.pathname))) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Cache-first for truly static assets
  if (CACHE_FIRST_PATTERNS.some((p) => p.test(url.pathname))) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Network-first for navigations with offline fallback
  if (request.mode === "navigate") {
    event.respondWith(networkFirstWithOfflineFallback(request));
    return;
  }

  // Default: network-first (no offline fallback for API/data calls)
  event.respondWith(networkFirst(request));
});

// ─── Strategies ──────────────────────────────────────────────────────────────

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response("", { status: 503 });
  }
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached ?? new Response("", { status: 503 });
  }
}

async function networkFirstWithOfflineFallback(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    const offline = await caches.match(OFFLINE_URL);
    return offline ?? new Response("Offline", { status: 503 });
  }
}
