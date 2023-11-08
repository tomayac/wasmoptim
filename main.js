import '/style.css';
import spinner from '/spinner.svg';

import {
  fileOpen,
  supported as supportsFileSystemAccess,
} from 'browser-fs-access';
import prettyBytes from 'pretty-bytes';
import {
  loadWasmButton,
  dropArea,
  resultsArea,
  statsTemplate,
  statsHeader,
  overwriteCheckbox,
} from './dom.js';
import limit from './limit.js';

const supportsFileHandleDragAndDrop =
  'getAsFileSystemHandle' in DataTransferItem.prototype;

loadWasmButton.addEventListener('click', async () => {
  try {
    const wasmFilesBefore = await fileOpen({
      mimeTypes: ['application/wasm'],
      extensions: ['.wasm'],
      multiple: true,
    });
    if (!wasmFilesBefore || !wasmFilesBefore.length) {
      return;
    }
    optimizeWasmFiles(wasmFilesBefore);
  } catch (error) {
    if (error.name === 'AbortError') {
      return;
    }
    console.error(error.name, error.message);
  }
});

dropArea.addEventListener('dragover', (e) => {
  e.preventDefault();
});

dropArea.addEventListener('dragenter', (e) => {
  dropArea.classList.add('drag-hover');
});

dropArea.addEventListener('dragleave', (e) => {
  dropArea.classList.remove('drag-hover');
});

dropArea.addEventListener('drop', async (e) => {
  e.preventDefault();
  dropArea.classList.remove('drag-hover');
  const fileHandlesPromises = [...e.dataTransfer.items]
    .filter((item) => item.kind === 'file')
    .map((item) =>
      supportsFileHandleDragAndDrop
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
    file.handle = handle;
    wasmFilesBefore.push(file);
  }
  optimizeWasmFiles(wasmFilesBefore);
});

const optimizeWasmFiles = async (wasmFilesBefore) => {
  statsHeader.hidden = false;
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
        worker.addEventListener('message', async (event) => {
          worker.terminate();
          const { wasmFileAfter, error } = event.data;
          if (error) {
            reject(error);
            afterSizeLabel.classList.add('error');
            deltaSizeLabel.classList.add('error');
            afterSizeLabel.textContent = error.name;
            deltaSizeLabel.textContent = error.message;
            return;
          }
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
          if (
            deltaSize < 0 &&
            supportsFileHandleDragAndDrop &&
            supportsFileSystemAccess &&
            overwriteCheckbox.checked
          ) {
            await wasmFileBefore.handle.createWritable().then((writable) => {
              writable.write(wasmFileAfter);
              writable.close();
            });
          }
          resolve();
        });
        worker.postMessage({ wasmFileBefore });
      });
    });
  }
  await limit(
    tasks,
    'hardwareConcurrency' in navigator
      ? Math.floor(navigator.hardwareConcurrency / 2)
      : 4,
  );
};
