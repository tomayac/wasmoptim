import { optimizeWasmFiles } from './wasm-optimize.js';

(async () => {
  try {
    await navigator.serviceWorker.register('./sharetargetsw.js', {
      scope: './share-target/',
    });
  } catch (error) {
    console.error(error.name, error.message);
  }

  if (location.search.includes('share-target')) {
    try {
      const urlSearchParams = new URLSearchParams(location.search);
      const fileName = urlSearchParams.get('share-target');
      const keys = await caches.keys();
      const mediaCache = await caches.open(
        keys.filter((key) => key.startsWith('media'))[0],
      );
      const wasmResponse = await mediaCache.match('shared-wasm-file');
      const wasmBlob = await wasmResponse.blob();
      const wasmFileBefore = new File([wasmBlob], fileName, {
        type: 'application/wasm',
      });
      wasmFileBefore.handle = false;
      await mediaCache.delete('shared-wasm-file');
      await optimizeWasmFiles([wasmFileBefore]);
    } catch (error) {
      console.error(error.name, error.message);
    }
  }
})();
