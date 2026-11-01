const CACHE_NAME = 'shimana-v2';
const DATA_CACHE_NAME = 'shimana-data-v2';

const STATIC_ASSETS = [
  '/sw-manifest.json',
  '/data/world-countries-geo-50m.json',
  '/data/bangladesh-districts-topo.json',
  '/manifest.webmanifest',
  '/icon.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable-512.png',
  '/icons/apple-touch-icon.png'
];

const APP_ROUTES = [
  '/',
  '/world',
  '/bangladesh',
  '/explore/world',
  '/explore/bangladesh',
  '/offline'
];

async function precacheAll() {
  const cache = await caches.open(CACHE_NAME);

  // 1. Precache static assets & map datasets
  await Promise.all(
    STATIC_ASSETS.map(async (url) => {
      try {
        const res = await fetch(url);
        if (res.ok) await cache.put(url, res);
      } catch (err) {
        console.warn('Failed to precache static asset:', url, err);
      }
    })
  );

  // 2. Precache build-time static chunks if manifest exists (production mode)
  try {
    const manifestRes = await fetch('/sw-manifest.json');
    if (manifestRes.ok) {
      const chunkUrls = await manifestRes.json();
      if (Array.isArray(chunkUrls)) {
        await Promise.all(
          chunkUrls.map(async (chunk) => {
            try {
              const chunkRes = await fetch(chunk);
              if (chunkRes.ok) await cache.put(chunk, chunkRes);
            } catch (_) {}
          })
        );
      }
    }
  } catch (_) {}

  // 3. Precache HTML documents AND RSC payloads for all routes (works in both dev and prod)
  for (const route of APP_ROUTES) {
    try {
      const htmlRes = await fetch(route);
      if (htmlRes.ok) {
        await cache.put(route, htmlRes.clone());
        const htmlText = await htmlRes.text();

        // Auto-discover and cache all script and stylesheet tags in the HTML
        const matches = htmlText.matchAll(/(?:src|href)="(\/_next\/static\/[^"]+)"/g);
        for (const m of matches) {
          try {
            const chunkRes = await fetch(m[1]);
            if (chunkRes.ok) await cache.put(m[1], chunkRes);
          } catch (_) {}
        }
      }
    } catch (err) {
      console.warn('Failed to precache route HTML:', route, err);
    }

    try {
      const rscReq = new Request(route, { headers: { rsc: '1' } });
      const rscRes = await fetch(rscReq);
      if (rscRes.ok) {
        await cache.put(rscReq, rscRes.clone());
        await cache.put(route + '?_rsc', rscRes);
      }
    } catch (_) {}
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    precacheAll().then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // 1. Navigation requests (HTML documents)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, clone.clone());
              cache.put(url.pathname, clone);
            });
          }
          return response;
        })
        .catch(async () => {
          const cache = await caches.open(CACHE_NAME);

          // Always use { ignoreSearch: true, ignoreVary: true } to prevent Next.js Vary header mismatch
          let cached = await cache.match(request, { ignoreSearch: true, ignoreVary: true });
          if (cached) return cached;

          cached = await cache.match(url.pathname, { ignoreSearch: true, ignoreVary: true });
          if (cached) return cached;

          // Alternate trailing slash
          const altPath = url.pathname.endsWith('/') ? url.pathname.slice(0, -1) : url.pathname + '/';
          if (altPath) {
            cached = await cache.match(altPath, { ignoreSearch: true, ignoreVary: true });
            if (cached) return cached;
          }

          // Fallback to /offline route
          const offlineFallback = await cache.match('/offline', { ignoreSearch: true, ignoreVary: true });
          if (offlineFallback) return offlineFallback;

          // Fallback to root /
          const rootFallback = await cache.match('/', { ignoreSearch: true, ignoreVary: true });
          if (rootFallback) return rootFallback;

          return new Response('Offline and page not cached.', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
          });
        })
    );
    return;
  }

  // 2. Map datasets (/data/*.json) - Stale While Revalidate
  if (url.pathname.startsWith('/data/')) {
    event.respondWith(
      caches.open(DATA_CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(request, { ignoreSearch: true, ignoreVary: true });

        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => null);

        if (cached) {
          event.waitUntil(fetchPromise);
          return cached;
        }

        const networkResponse = await fetchPromise;
        if (networkResponse) return networkResponse;

        return caches.match(request, { ignoreSearch: true, ignoreVary: true });
      })
    );
    return;
  }

  // 3. Next.js static assets (/_next/static/*) - Cache First
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.match(request, { ignoreSearch: true, ignoreVary: true }).then((cached) => {
        if (cached) return cached;

        return fetch(request)
          .then((response) => {
            if (response && response.status === 200) {
              const clone = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            }
            return response;
          })
          .catch(() => caches.match(url.pathname, { ignoreSearch: true, ignoreVary: true }));
      })
    );
    return;
  }

  // 4. RSC requests - Network First with cache fallback
  if (url.searchParams.has('_rsc') || request.headers.get('rsc')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, clone.clone());
              cache.put(url.pathname + '?_rsc', clone);
            });
          }
          return response;
        })
        .catch(async () => {
          const cache = await caches.open(CACHE_NAME);
          const exact = await cache.match(request, { ignoreSearch: true, ignoreVary: true });
          if (exact) return exact;

          const rscReq = new Request(url.pathname, { headers: { rsc: '1' } });
          const rscMatch = await cache.match(rscReq, { ignoreSearch: true, ignoreVary: true });
          if (rscMatch) return rscMatch;

          const altMatch = await cache.match(url.pathname + '?_rsc', { ignoreSearch: true, ignoreVary: true });
          if (altMatch) return altMatch;

          return cache.match(url.pathname, { ignoreSearch: true, ignoreVary: true });
        })
    );
    return;
  }

  // 5. General static assets (icons, images, manifest) - Cache First / Stale While Revalidate
  event.respondWith(
    caches.match(request, { ignoreSearch: true, ignoreVary: true }).then((cached) => {
      if (cached) return cached;

      const fetchPromise = fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => null);

      return fetchPromise;
    })
  );
});
