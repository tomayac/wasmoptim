const optimizeMergedFile = async (mergedFile) => {
  return new Promise((resolve, reject) => {
    const wasmOptWorker = new Worker(
      new URL('./wasm-opt-worker.js', import.meta.url),
    );

    wasmOptWorker.addEventListener('message', async (event) => {
      wasmOptWorker.terminate();

      const { wasmFileAfter, error } = event.data;

      if (error) {
        reject(new Error(error));
        return;
      }

      resolve({ wasmFileAfter });
    });

    wasmOptWorker.postMessage({
      wasmFileBefore: mergedFile,
      uniqueId: crypto.randomUUID(),
    });
  });
};

const loadWasmMerge = async (errorTexts) => {
  const { default: loadWASM } = await import('./third-party/wasm-merge.js');
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
  try {
    const errorTexts = [];
    const wasmMerge = await loadWasmMerge(errorTexts);
    const { wasmFiles, uuids, fileName } = event.data;

    const promises = wasmFiles.map(async (wasmFile, i) => {
      const buffer = await wasmFile.arrayBuffer();
      wasmMerge.FS.writeFile(
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
      fileName,
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

    wasmMerge.callMain(args);

    if (errorTexts.length > 0) {
      throw new Error(errorTexts.join('\n'));
    }

    const output = wasmMerge.FS.readFile(fileName + timestamp, {
      encoding: 'binary',
    });
    const file = new File([output], fileName, {
      type: 'application/wasm',
    });

    [
      ...wasmFiles.map((_, i) => uuids[i].replaceAll('/', '_')),
      fileName + timestamp,
    ].forEach(wasmMerge.FS.unlink);

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
