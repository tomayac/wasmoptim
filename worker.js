self.addEventListener('message', async (event) => {
  const binaryen = (await import('binaryen/index.js')).default;
  const { wasmFileBefore } = event.data;
  const wasmBufferBefore = await wasmFileBefore.arrayBuffer();
  const module = binaryen.readBinary(new Uint8Array(wasmBufferBefore));
  module.optimize();
  const wasmFileAfter = new File([module.emitBinary()], wasmFileBefore.name, {
    type: 'application/wasm',
  });
  self.postMessage({ wasmFileAfter });
});
