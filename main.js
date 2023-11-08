import '/style.css';
import spinner from '/spinner.svg';

import {
  fileOpen,
  fileSave,
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

const uuidToFile = new Map();

if (supportsFileHandleDragAndDrop && supportsFileSystemAccess) {
  overwriteCheckbox.parentNode.hidden = false;

  overwriteCheckbox.addEventListener('change', () => {
    localStorage.setItem('overwrite', overwriteCheckbox.checked);
  });

  if (localStorage.getItem('overwrite') !== 'true') {
    overwriteCheckbox.checked = false;
  } else {
    overwriteCheckbox.checked = true;
  }
}

resultsArea.addEventListener('click', async (e) => {
  console.log(e.target);
  if (!e.target.classList.contains('file-name')) {
    return;
  }
  if (e.target.dataset.processing) {
    return;
  }
  const uuid = e.target.dataset.uuid;
  const file = uuidToFile.get(uuid);
  try {
    await fileSave(file, {
      fileName: file.name,
      extensions: ['.wasm'],
      mimeTypes: ['application/wasm'],
    });
  } catch (error) {
    if (error.name === 'AbortError') {
      return;
    }
    console.error(error.name, error.message);
  }
});

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
      file.handle = handle;
    }
    if (
      (file.type && file.type !== 'application/wasm') ||
      !file.name.endsWith('.wasm')
    ) {
      continue;
    }
    wasmFilesBefore.push(file);
  }
  if (
    supportsFileSystemAccess &&
    supportsFileSystemAccess &&
    overwriteCheckbox.checked
  ) {
    await checkForAndPossiblyAskForPermissions(wasmFilesBefore);
  }
  optimizeWasmFiles(wasmFilesBefore);
});

const checkForAndPossiblyAskForPermissions = async (wasmFilesBefore) => {
  for (const wasmFileBefore of wasmFilesBefore) {
    const state = await wasmFileBefore.handle.requestPermission({
      mode: 'readwrite',
    });
  }
};

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
    fileNameLabel.dataset.processing = true;
    beforeSizeLabel.textContent = prettyBytes(wasmFileBefore.size);
    resultsArea.append(stats);

    tasks.push(() => {
      return new Promise((resolve, reject) => {
        const worker = new Worker(new URL('./worker.js', import.meta.url));
        worker.addEventListener('message', async (event) => {
          worker.terminate();
          const { wasmFileAfter, error } = event.data;
          if (error) {
            reject(error);
            fileNameLabel.classList.add('error');
            afterSizeLabel.classList.add('error');
            deltaSizeLabel.classList.add('error');
            afterSizeLabel.textContent = error.name;
            deltaSizeLabel.textContent = error.message;
            return;
          }
          afterSizeLabel.textContent = prettyBytes(wasmFileAfter.size);
          const deltaSize = wasmFileAfter.size - wasmFileBefore.size;
          console.log(wasmFileBefore.size, wasmFileAfter.size, deltaSize);
          deltaSizeLabel.textContent = `${Math.abs(
            100 - (wasmFileAfter.size / wasmFileBefore.size) * 100,
          ).toFixed(2)}% ${deltaSize < 0 ? 'smaller' : 'larger'}`;
          if (deltaSize < 0) {
            deltaSizeLabel.classList.add('size-smaller');
          } else if (deltaSize >= 0) {
            deltaSizeLabel.classList.add('size-larger');
          }
          if (deltaSize < 0) {
            const uuid = crypto.randomUUID();
            fileNameLabel.dataset.uuid = uuid;
            delete fileNameLabel.dataset.processing;
            uuidToFile.set(uuid, wasmFileAfter);
            if (
              supportsFileHandleDragAndDrop &&
              supportsFileSystemAccess &&
              overwriteCheckbox.checked
            ) {
              await wasmFileBefore.handle.createWritable().then((writable) => {
                writable.write(wasmFileAfter);
                writable.close();
              });
            }
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
