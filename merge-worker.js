const MERGED_FILE_NAME = 'merged.wasm';

const optimizeMergedFile = async (mergedFile) => {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('./binaryen-worker.js', import.meta.url));

    worker.addEventListener('message', async (event) => {
      worker.terminate();
      const { wasmFileAfter, error } = event.data;
      if (error) {
        return reject(new Error(error));
      }
      return resolve({ wasmFileAfter });
    });

    worker.postMessage({ wasmFileBefore: mergedFile });
  });
};

self.addEventListener('message', async (event) => {
  try {
    const { default: loadWASM } = await import('./third-party/wasm-merge.js');
    const { wasmFiles } = event.data;
    const errorTexts = [];
    const Module = await loadWASM({
      print: () => {
        return;
      },
      printErr: (text) => errorTexts.push(text),
    });
    const promises = wasmFiles.map(async (wasmFile) => {
      const buffer = await wasmFile.arrayBuffer();
      Module.FS.writeFile(wasmFile.name, new Uint8Array(buffer));
    });
    await Promise.all(promises);
    const wasmFilesWithNames = wasmFiles
      .map((wasmFile) => [wasmFile.name, wasmFile.name.replace(/\.wasm$/, '')])
      .flat();
    const args = [
      ...wasmFilesWithNames,
      '--rename-export-conflicts',
      '--enable-multimemory',
      '--enable-reference-types',
      '-o',
      MERGED_FILE_NAME,
    ];
    console.log('wasm-merge', args.join(' '));
    Module.callMain(args);
    if (errorTexts.length) {
      self.postMessage({ error: errorTexts.join('\n') });
      return;
    }
    const output = Module.FS.readFile(MERGED_FILE_NAME, { encoding: 'binary' });
    const file = new File([output], MERGED_FILE_NAME, {
      type: 'application/wasm',
    });
    [...wasmFiles.map((file) => file.name), MERGED_FILE_NAME].forEach(
      Module.FS.unlink,
    );
    self.postMessage({ status: { size: file.size } });
    const { wasmFileAfter, error } = await optimizeMergedFile(file);
    if (error) {
      self.postMessage({ error });
      return;
    }
    self.postMessage({ file: wasmFileAfter });
  } catch (error) {
    self.postMessage({ error: error.message });
  }
});
