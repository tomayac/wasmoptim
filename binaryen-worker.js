self.addEventListener('message', async (event) => {
  const { default: binaryen } = await import('./third-party/binaryen.js');
  const { wasmFileBefore } = event.data;
  try {
    const wasmBufferBefore = await wasmFileBefore.arrayBuffer();
    const module = binaryen.readBinary(new Uint8Array(wasmBufferBefore));
    module.optimize();
    const wasmFileAfter = new File([module.emitBinary()], wasmFileBefore.name, {
      type: 'application/wasm',
    });
    self.postMessage({ wasmFileAfter });
  } catch (error) {
    self.postMessage({ error });
  }
});
