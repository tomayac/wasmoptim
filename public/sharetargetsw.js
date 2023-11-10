const MEDIA_CACHE = 'media-cache';
const ALL_CACHES = [MEDIA_CACHE];

self.addEventListener('install', (installEvent) => {
  installEvent.waitUntil(
    (async () => {
      await caches.open(MEDIA_CACHE);
      self.skipWaiting();
    })(),
  );
});

self.addEventListener('activate', (activateEvent) => {
  activateEvent.waitUntil(
    (async () => {
      const cacheKeys = await caches.keys();
      await Promise.all(
        cacheKeys.map(async (cacheKey) => {
          if (!ALL_CACHES.includes(cacheKey)) {
            await caches.delete(cacheKey);
          }
        }),
      );
      self.clients.claim();
    })(),
  );
});

self.addEventListener('fetch', (fetchEvent) => {
  if (
    fetchEvent.request.url.endsWith('/share-target/') &&
    fetchEvent.request.method === 'POST'
  ) {
    return fetchEvent.respondWith(
      (async () => {
        const formData = await fetchEvent.request.formData();
        const wasmFile = formData.get('wasm-file');
        const keys = await caches.keys();
        const mediaCache = await caches.open(
          keys.filter((key) => key.startsWith('media'))[0],
        );
        await mediaCache.put('shared-wasm-file', new Response(wasmFile));
        return Response.redirect(`./?share-target=${wasmFile.name}`, 303);
      })(),
    );
  }
});
