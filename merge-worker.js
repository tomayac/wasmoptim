self.addEventListener('message', async (event) => {
  try {
    const { default: loadWASM } = await import('./third-party/wasm-merge.js');
    const { wasmFiles } = event.data;
    let errorText = '';
    const Module = await loadWASM({
      print: (text) => {
        return;
      },
      printErr: (text) => (errorText += text + '\n'),
    });
    const promises = wasmFiles.map(async (wasmFile) => {
      const buffer = await wasmFile.arrayBuffer();
      Module.FS.writeFile(wasmFile.name, new Uint8Array(buffer));
    });
    await Promise.all(promises);
    const wasmFileNames = wasmFiles
      .map((wasmFile) => [wasmFile.name, wasmFile.name.replace(/\.wasm$/, '')])
      .flat();
    console.log(
      'wasm-merge',
      [...wasmFileNames, '--rename-export-conflicts', '-o', 'merged.wasm'].join(
        ' ',
      ),
    );
    Module.callMain([
      ...wasmFileNames,
      '--rename-export-conflicts',
      '-o',
      'merged.wasm',
    ]);
    if (errorText) {
      self.postMessage({ error: errorText.trim() });
      return;
    }
    const output = Module.FS.readFile('merged.wasm', { encoding: 'binary' });
    const file = new File([output], 'merge.wasm', {
      type: 'application/wasm',
    });
    [...wasmFileNames, 'merged.wasm'].forEach(Module.FS.unlink);
    self.postMessage({ file });
  } catch (error) {
    self.postMessage({ error });
  }
});
