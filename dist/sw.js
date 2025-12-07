const CACHE_NAME = 'scorebook-cache-v1';
const OFFLINE_URLS = ['/', '/index.html', '/manifest.webmanifest'];

// インストール時に基本ファイルをキャッシュ
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(OFFLINE_URLS))
  );
  self.skipWaiting();
});

// 古いキャッシュを片付ける
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// 通信時のキャッシュ戦略
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // SPAなので、画面遷移(navigate)は index.html を返す
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // それ以外は「キャッシュ優先、なければネット→キャッシュに保存」
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => cached); // どうしてもダメなら手元のキャッシュを返す
    })
  );
});
