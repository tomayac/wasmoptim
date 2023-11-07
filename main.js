import '/style.css';
import spinner from '/spinner.svg';

import { fileOpen } from 'browser-fs-access';
import prettyBytes from 'pretty-bytes';
import { loadWasmButton, dropArea, resultsArea, statsTemplate } from './dom.js';
import limit from './limit.js';
const supportsFileSystemAccessAPI =
  'getAsFileSystemHandle' in DataTransferItem.prototype;

loadWasmButton.addEventListener('click', async () => {
  const wasmFilesBefore = await fileOpen({
    mimeTypes: ['application/wasm'],
    extensions: ['.wasm'],
    multiple: true,
  });
  if (!wasmFilesBefore || !wasmFilesBefore.length) {
    return;
  }
  optimizeWasmFiles(wasmFilesBefore);
});

dropArea.addEventListener('dragover', (e) => {
  e.preventDefault();
});

dropArea.addEventListener('dragenter', (e) => {
  dropArea.style.outline = 'solid red 1px';
});

dropArea.addEventListener('dragleave', (e) => {
  dropArea.style.outline = '';
});

dropArea.addEventListener('drop', async (e) => {
  e.preventDefault();
  dropArea.style.outline = '';
  const fileHandlesPromises = [...e.dataTransfer.items]
    .filter((item) => item.kind === 'file')
    .map((item) =>
      supportsFileSystemAccessAPI
        ? item.getAsFileSystemHandle()
        : item.getAsFile(),
    );
  const wasmFilesBefore = [];
  for await (const handle of fileHandlesPromises) {
    let file = handle;
    if (handle.kind === 'file') {
      file = await handle.getFile();
    }
    if (file.type !== 'application/wasm') {
      continue;
    }
    wasmFilesBefore.push(file);
  }
  optimizeWasmFiles(wasmFilesBefore);
});

const optimizeWasmFiles = async (wasmFilesBefore) => {
  resultsArea.innerHTML = '';
  const tasks = [];

  for (const wasmFileBefore of wasmFilesBefore) {
    const stats = statsTemplate.content.cloneNode(true);
    const fileNameLabel = stats.querySelector('.file-name');
    const beforeSizeLabel = stats.querySelector('.before-size');
    const afterSizeLabel = stats.querySelector('.after-size');
    const deltaSizeLabel = stats.querySelector('.delta-size');
    const spinnerImage = stats.querySelector('.spinner');
    spinnerImage.src = spinner;
    fileNameLabel.textContent = wasmFileBefore.name;
    beforeSizeLabel.textContent = prettyBytes(wasmFileBefore.size);
    resultsArea.append(stats);

    tasks.push(() => {
      return new Promise((resolve, reject) => {
        const worker = new Worker(new URL('./worker.js', import.meta.url), {
          type: 'module',
        });
        worker.addEventListener('message', (event) => {
          const { wasmFileAfter } = event.data;
          afterSizeLabel.textContent = prettyBytes(wasmFileAfter.size);
          const deltaSize = wasmFileAfter.size - wasmFileBefore.size;
          deltaSizeLabel.textContent = `${(
            100 -
            (wasmFileAfter.size / wasmFileBefore.size) * 100
          ).toFixed(2)}%`;
          if (deltaSize < 0) {
            deltaSizeLabel.classList.add('size-smaller');
          } else if (deltaSize >= 0) {
            deltaSizeLabel.classList.add('size-larger');
          }
          worker.terminate();
          resolve();
        });
        worker.postMessage({ wasmFileBefore });
      });
    });
  }
  await limit(tasks, 3);
};
