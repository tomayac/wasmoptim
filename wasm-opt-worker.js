const loadWasmOpt = async (errorTexts) => {
  const { default: loadWASM } = await import('./third-party/wasm-opt.js');
  const Module = await loadWASM({
    print: () => {
      return;
    },
    printErr: (text) => errorTexts.push(text),
  });
  await Module.ready;
  return Module;
};

self.addEventListener('message', async (event) => {
  const errorTexts = [];
  const wasmOpt = await loadWasmOpt(errorTexts);
  const { wasmFileBefore, uniqueId } = event.data;

  try {
    const wasmBufferBefore = await wasmFileBefore.arrayBuffer();
    wasmOpt.FS.writeFile(uniqueId, new Uint8Array(wasmBufferBefore));
    const args = [
      uniqueId,
      '-o',
      uniqueId,
      '-Os',
      '--always-inline-max-function-size',
      '--enable-reference-types',
      '--enable-multimemory',
      '--converge',
    ];
    const fakeArgs = [
      wasmFileBefore.name,
      '-o',
      wasmFileBefore.name,
      '-Os',
      '--always-inline-max-function-size',
      '--enable-reference-types',
      '--enable-multimemory',
      '--converge',
    ];
    console.log(`Running wasm-opt ${fakeArgs.join(' ')}`);
    wasmOpt.callMain(args);
    if (errorTexts.length > 0) {
      throw new Error(errorTexts.join('. '));
    }
    const output = wasmOpt.FS.readFile(uniqueId, {
      encoding: 'binary',
    });
    wasmOpt.FS.unlink(uniqueId);
    const wasmFileAfter = new File([output], wasmFileBefore.name, {
      type: 'application/wasm',
    });
    self.postMessage({ wasmFileAfter });
  } catch (error) {
    self.postMessage({ error: error.message });
  }
});
