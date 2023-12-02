self.addEventListener('message', async (event) => {
  const errorTexts = [];
  const { default: loadWASM } = await import('./third-party/binaryen_wasm.js');
  const Module = await loadWASM({
    print: () => {
      return;
    },
    printErr: (text) => errorTexts.push(text),
  });
  await Module.ready;
  const binaryen = Module;

  const { isBinaryFile } = await import('arraybuffer-isbinary');

  const { wasmFileBefore } = event.data;

  try {
    const wasmBufferBefore = await wasmFileBefore.arrayBuffer();

    let module;
    if (isBinaryFile(wasmBufferBefore)) {
      module = binaryen.readBinary(new Uint8Array(wasmBufferBefore));
    } else {
      module = binaryen.parseText(new TextDecoder().decode(wasmBufferBefore));
    }
    module.optimize();

    const wasmFileAfter = new File([module.emitBinary()], wasmFileBefore.name, {
      type: 'application/wasm',
    });
    self.postMessage({ wasmFileAfter });
  } catch (error) {
    self.postMessage({ error: error.message });
  }
});
