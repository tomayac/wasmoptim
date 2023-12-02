const MERGED_FILE_NAME = 'merged.wasm';

const optimizeMergedFile = async (mergedFile) => {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('./binaryen-worker.js', import.meta.url));

    worker.addEventListener('message', async (event) => {
      worker.terminate();

      const { wasmFileAfter, error } = event.data;

      if (error) {
        reject(new Error(error));
        return;
      }

      resolve({ wasmFileAfter });
    });

    worker.postMessage({ wasmFileBefore: mergedFile });
  });
};

self.addEventListener('message', async (event) => {
  try {
    const errorTexts = [];

    const { default: loadWASM } = await import('./third-party/wasm-merge.js');
    const Module = await loadWASM({
      print: () => {
        return;
      },
      printErr: (text) => errorTexts.push(text),
    });
    await Module.ready;

    const { wasmFiles, uuids } = event.data;

    const promises = wasmFiles.map(async (wasmFile, i) => {
      const buffer = await wasmFile.arrayBuffer();
      Module.FS.writeFile(
        uuids[i].replaceAll('/', '_'),
        new Uint8Array(buffer),
      );
    });
    await Promise.all(promises);

    const fakeWasmFilesWithNames = wasmFiles
      .map((wasmFile) => [
        wasmFile.webkitRelativePath || wasmFile.relativePath || wasmFile.name,
        wasmFile.name.replace(/\.wasm$/, ''),
      ])
      .flat();
    const timestamp = Date.now();
    const fakeArgs = [
      ...fakeWasmFilesWithNames,
      '--rename-export-conflicts',
      '--enable-multimemory',
      '--enable-reference-types',
      '-o',
      MERGED_FILE_NAME + timestamp,
    ];
    console.log(`Running wasm-merge ${fakeArgs.join(' ')}`);

    const wasmFilesWithNames = wasmFiles
      .map((wasmFile, i) => [
        uuids[i].replaceAll('/', '_'),
        wasmFile.name.replace(/\.wasm$/, ''),
      ])
      .flat();
    const args = [
      ...wasmFilesWithNames,
      '--rename-export-conflicts',
      '--enable-multimemory',
      '--enable-reference-types',
      '-o',
      MERGED_FILE_NAME + timestamp,
    ];

    Module.callMain(args);

    if (errorTexts.length) {
      self.postMessage({ error: errorTexts.join('\n') });
      return;
    }

    const output = Module.FS.readFile(MERGED_FILE_NAME + timestamp, {
      encoding: 'binary',
    });
    const file = new File([output], MERGED_FILE_NAME, {
      type: 'application/wasm',
    });

    [
      ...wasmFiles.map((_, i) => uuids[i].replaceAll('/', '_')),
      MERGED_FILE_NAME + timestamp,
    ].forEach(Module.FS.unlink);

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
