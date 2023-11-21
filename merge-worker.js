import loadWASM from '/wasm-merge.js';

self.addEventListener('message', async (event) => {
  const { wasmFiles } = event.data;
  const Module = await loadWASM();
  const promises = wasmFiles.map(async (wasmFile) => {
    const buffer = await wasmFile.arrayBuffer();
    Module.FS.writeFile(file, new Uint8Array(buffer));
  });
  await Promise.all(promises);
  const wasmFileNames = wasmFiles.map(wasmFile => wasmFile.name);
  Module.callMain([...wasmFileNames, '-o', 'merged.wasm' ]);
  const output = Module.FS.readFile('merged.wasm', { encoding: 'binary' });
  const file = new File([output], 'merge.wasm', {
    type: 'application/wasm',
  });
  [...wasmFileNames, 'merged.wasm'].forEach(Module.FS.unlink);
  self.postMessage({ file });
});
