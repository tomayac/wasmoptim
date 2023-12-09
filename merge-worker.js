const optimizeMergedFile = async (mergedFile) => {
  return new Promise((resolve, reject) => {
    const binaryenWorker = new Worker(
      new URL('./binaryen-worker.js', import.meta.url),
    );

    binaryenWorker.addEventListener('message', async (event) => {
      binaryenWorker.terminate();

      const { wasmFileAfter, error } = event.data;

      if (error) {
        reject(new Error(error));
        return;
      }

      resolve({ wasmFileAfter });
    });

    binaryenWorker.postMessage({ wasmFileBefore: mergedFile });
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

    const { wasmFiles, uuids, fileName } = event.data;

    const promises = wasmFiles.map(async (wasmFile, i) => {
      const buffer = await wasmFile.arrayBuffer();
      Module.FS.writeFile(
        uuids[i].replaceAll('/', '_'),
        new Uint8Array(buffer),
      );
    });
    await Promise.all(promises);

    const fakeWasmFilesWithNames = wasmFiles
      .map((wasmFile) => [wasmFile.name, wasmFile.name.replace(/\.wasm$/, '')])
      .flat();
    const timestamp = Date.now();
    const fakeArgs = [
      ...fakeWasmFilesWithNames,
      '--rename-export-conflicts',
      '--enable-multimemory',
      '--enable-reference-types',
      '-o',
      fileName + timestamp,
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
      fileName + timestamp,
    ];

    Module.callMain(args);

    if (errorTexts.length) {
      self.postMessage({ error: errorTexts.join('\n') });
      return;
    }

    const output = Module.FS.readFile(fileName + timestamp, {
      encoding: 'binary',
    });
    const file = new File([output], fileName, {
      type: 'application/wasm',
    });

    [
      ...wasmFiles.map((_, i) => uuids[i].replaceAll('/', '_')),
      fileName + timestamp,
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
