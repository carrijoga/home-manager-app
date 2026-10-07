const CACHE_NAME = 'ninho-v5';
const RUNTIME_CACHE = 'ninho-runtime-v5';

// Assets estáticos essenciais para cache durante a instalação (PWA App Shell + Clima 3D)
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  '/logo.svg',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',

  // Ícones de clima 3D (precache completo das 38 camadas/imags em WebP para funcionamento offline)
  '/assets/icons/3d/weather/clear/full.webp',
  '/assets/icons/3d/weather/clear/disc.webp',
  '/assets/icons/3d/weather/clear/ray-00.webp',
  '/assets/icons/3d/weather/clear/ray-01.webp',
  '/assets/icons/3d/weather/clear/ray-02.webp',
  '/assets/icons/3d/weather/clear/ray-03.webp',
  '/assets/icons/3d/weather/clear/ray-04.webp',
  '/assets/icons/3d/weather/clear/ray-05.webp',
  '/assets/icons/3d/weather/clear/ray-06.webp',
  '/assets/icons/3d/weather/clear/ray-07.webp',
  '/assets/icons/3d/weather/clear/ray-08.webp',
  '/assets/icons/3d/weather/clear/ray-09.webp',
  '/assets/icons/3d/weather/clear/ray-10.webp',
  '/assets/icons/3d/weather/clear/ray-11.webp',
  '/assets/icons/3d/weather/cloudy/full.webp',
  '/assets/icons/3d/weather/cloudy/single.webp',
  '/assets/icons/3d/weather/partly-cloudy/full.webp',
  '/assets/icons/3d/weather/partly-cloudy/body.webp',
  '/assets/icons/3d/weather/partly-cloudy/ray-00.webp',
  '/assets/icons/3d/weather/partly-cloudy/ray-01.webp',
  '/assets/icons/3d/weather/partly-cloudy/ray-02.webp',
  '/assets/icons/3d/weather/partly-cloudy/ray-03.webp',
  '/assets/icons/3d/weather/partly-cloudy/ray-04.webp',
  '/assets/icons/3d/weather/rain/full.webp',
  '/assets/icons/3d/weather/rain/cloud.webp',
  '/assets/icons/3d/weather/rain/drop-00.webp',
  '/assets/icons/3d/weather/rain/drop-01.webp',
  '/assets/icons/3d/weather/rain/drop-02.webp',
  '/assets/icons/3d/weather/snow/full.webp',
  '/assets/icons/3d/weather/snow/cloud.webp',
  '/assets/icons/3d/weather/snow/flake-00.webp',
  '/assets/icons/3d/weather/snow/flake-01.webp',
  '/assets/icons/3d/weather/snow/flake-02.webp',
  '/assets/icons/3d/weather/thunderstorm/full.webp',
  '/assets/icons/3d/weather/thunderstorm/stormcloud.webp',
  '/assets/icons/3d/weather/thunderstorm/bolt.webp',
  '/assets/icons/3d/weather/thunderstorm/glow.webp',
  '/assets/icons/3d/weather/thunderstorm/hot.webp',
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Precaching app shell & weather assets');
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => self.skipWaiting())
  );
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
              console.log('[Service Worker] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Estratégia de fetch
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignora requisições não-HTTP
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // IMPORTANTE: A Cache API só suporta requisições GET.
  if (request.method !== 'GET') {
    return;
  }

  // IMPORTANTE: Ignora requisições de API, SignalR Hubs e WebSockets - deixa passar direto para a rede
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/hubs/') ||
    url.pathname.includes('/negotiate') ||
    url.port === '5026' ||
    (url.hostname.includes('localhost') && url.port !== '' && url.port !== '3000')
  ) {
    return;
  }

  // Cache-first para assets de clima e recursos estáticos
  if (
    url.pathname.startsWith('/assets/icons/3d/weather/') ||
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'image' ||
    request.destination === 'font'
  ) {
    event.respondWith(
      caches
        .match(request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(request).then((response) => {
            if (response.status === 200) {
              const responseClone = response.clone();
              caches.open(RUNTIME_CACHE).then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return response;
          });
        })
        .catch(() => {
          // Fallback para quando estiver offline
          if (url.pathname.startsWith('/assets/icons/3d/weather/')) {
            const match = url.pathname.match(/\/assets\/icons\/3d\/weather\/([^/]+)/);
            if (match) {
              const iconName = match[1];
              return caches.match(`/assets/icons/3d/weather/${iconName}/full.webp`);
            }
          }
          if (request.destination === 'image') {
            return caches.match('/icons/icon-192x192.png');
          }
        })
    );
    return;
  }

  // Network-first para navegação
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            return caches.match('/');
          });
        })
    );
    return;
  }

  // Network-first para outras requisições
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(request);
      })
  );
});
