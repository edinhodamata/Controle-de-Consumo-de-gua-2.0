/**
 * Service Worker — Água Control
 * Provê suporte offline e cache de ativos estáticos utilizando a Cache API do navegador.
 */

const CACHE_NAME = 'aguacontrol-v1';

// Ativos fundamentais para funcionamento offline do shell da aplicação
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/pwa-maskable-512x512.png',
  '/apple-touch-icon.png',
];

// Instalação do Service Worker: pré-carrega os ativos essenciais
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => {
        // Ativação imediata sem esperar o encerramento das abas antigas
        return self.skipWaiting();
      })
      .catch((error) => {
        console.warn('[SW] Aviso na pré-carga de ativos:', error);
      })
  );
});

// Ativação: limpa versões anteriores do cache para evitar conflitos de versão
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((name) => {
            if (name !== CACHE_NAME) {
              return caches.delete(name);
            }
          })
        );
      })
      .then(() => {
        // Assume o controle de todos os clientes abertos imediatamente
        return self.clients.claim();
      })
  );
});

// Interceptação de requisições: Estratégias de Cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Apenas métodos GET são armazenáveis em cache
  if (request.method !== 'GET') {
    return;
  }

  // Ignora requisições de extensões de navegador ou esquemas não-http
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // 1. Navegação de Páginas (HTML): Network-First com fallback para o cache do index.html
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          // Quando offline, busca o documento em cache ou o shell raiz /index.html
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }
          const shellResponse = await caches.match('/index.html');
          if (shellResponse) {
            return shellResponse;
          }
          return caches.match('/');
        })
    );
    return;
  }

  // 2. Requisições de API (/api/*): Network-First com fallback para cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) {
            return cached;
          }
          // Se não houver cache da API, retorna mensagem orientativa JSON
          return new Response(
            JSON.stringify({
              offline: true,
              success: true,
              message: 'Modo offline: os dados locais continuam acessíveis no seu navegador.',
            }),
            {
              headers: { 'Content-Type': 'application/json' },
            }
          );
        })
    );
    return;
  }

  // 3. Ativos Estáticos (Scripts JS, CSS, Fontes Google/Gstatic, Imagens):
  // Estratégia Stale-While-Revalidate / Cache-First dinâmico
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          // Armazena no cache se a resposta for válida ou opaca (fontes externas / cdn)
          if (
            networkResponse &&
            (networkResponse.status === 200 || networkResponse.type === 'opaque')
          ) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Falha na rede esperada quando offline; se havia cópia em cache ela foi servida
        });

      return cachedResponse || fetchPromise;
    })
  );
});

// Listener para atualização voluntária solicitada pelo cliente
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
