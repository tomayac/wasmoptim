import '/style.css';
import { registerSW } from 'virtual:pwa-register';
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
  examplesList,
  exampleTemplate,
} from './dom.js';
import limit from './limit.js';

const EXAMPLE_URLS = [
  'https://unpkg.com/canvaskit-wasm@0.39.1/bin/canvaskit.wasm',
  'https://unpkg.com/zxing-wasm@1.0.0-rc.4/dist/full/zxing_full.wasm',
  'https://unpkg.com/@sqlite.org/sqlite-wasm@3.44.0-build1/sqlite-wasm/jswasm/sqlite3.wasm',
  'https://unpkg.com/@tensorflow/tfjs-backend-wasm@4.13.0/wasm-out/tfjs-backend-wasm.wasm',
];
const SEMVER_REGEX =
  /@(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?/;

const supportsFileHandleDragAndDrop =
  'getAsFileSystemHandle' in DataTransferItem.prototype;

const uuidToFile = new Map();

(() => {
  const colorSchemeChange = (e) => {
    const metaThemeColor = document.querySelector('meta[name=theme-color]');
    if (e.matches) {
      metaThemeColor.content = 'Canvas';
      return;
    }
  };
  matchMedia('(prefers-color-scheme: dark)').addEventListener(
    'change',
    colorSchemeChange,
  );
  colorSchemeChange(matchMedia('(prefers-color-scheme: dark)'));

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

  EXAMPLE_URLS.forEach((url) => {
    const example = exampleTemplate.content.cloneNode(true);
    const code = example.querySelector('code');
    const anchor = example.querySelector('a');
    code.textContent = url
      .replace('https://unpkg.com/', '')
      .replace(SEMVER_REGEX, '');
    anchor.href = url;
    examplesList.append(example);
  });

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        await navigator.serviceWorker.register('./sharetargetsw.js', {
          scope: './share-target/',
        });
      } catch (err) {
        console.error(err.name, err.message);
      }

      if (location.search.includes('share-target')) {
        try {
          const urlSearchParams = new URLSearchParams(location.search);
          const fileName = urlSearchParams.get('share-target');
          const keys = await caches.keys();
          const mediaCache = await caches.open(
            keys.filter((key) => key.startsWith('media'))[0],
          );
          const wasmResponse = await mediaCache.match('shared-wasm-file');
          await mediaCache.delete('shared-wasm-file');
          const wasmBlob = await wasmResponse.blob();
          const wasmFileBefore = new File([wasmBlob], fileName, {
            type: 'application/wasm',
          });
          wasmFileBefore.handle = false;
          optimizeWasmFiles([wasmFileBefore]);
        } catch (err) {
          console.error(err.name, err.message);
        }
      }
    });
  }

  const updateSW = registerSW({
    onOfflineReady() {},
    onNeedRefresh() {
      location.reload();
    },
  });
  updateSW();
})();

document.addEventListener('paste', (e) => {
  try {
    if (!e.clipboardData.files.length) {
      return;
    }
    const wasmFilesBefore = Array.from(e.clipboardData.files).filter(
      (file) => file.type === 'application/wasm' || file.name.endsWith('.wasm'),
    );
    optimizeWasmFiles(wasmFilesBefore);
  } catch (err) {
    console.error(err.name, err.message);
  }
});

examplesList.addEventListener('click', async (e) => {
  if (e.target.nodeName.toLowerCase() !== 'code') {
    return;
  }
  e.preventDefault();
  const anchor = e.target.closest('a');
  const wasmFileURL = anchor.href;
  const downloading = anchor.parentNode.querySelector('.downloading');
  downloading.hidden = false;
  const spinnerImg = anchor.parentNode.querySelector('img');
  spinnerImg.src = spinner;
  const wasmBlobBefore = await fetch(wasmFileURL).then((response) =>
    response.blob(),
  );
  spinnerImg.removeAttribute('src');
  downloading.hidden = true;
  const wasmFileBefore = new File(
    [wasmBlobBefore],
    wasmFileURL.split('/').pop(),
    {
      type: 'application/wasm',
    },
  );
  wasmFileBefore.handle = false;
  optimizeWasmFiles([wasmFileBefore]);
});

resultsArea.addEventListener('click', async (e) => {
  if (e.target.nodeName.toLowerCase() !== 'code') {
    return;
  }
  const anchor = e.target.closest('a');
  if (!anchor.classList.contains('file-name')) {
    return;
  }
  if (anchor.dataset.processing) {
    return;
  }
  e.preventDefault();
  const uuid = anchor.dataset.uuid;
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

if ('launchQueue' in window && 'files' in LaunchParams.prototype) {
  launchQueue.setConsumer(async (launchParams) => {
    if (!launchParams.files.length) {
      return;
    }
    const wasmFilesBefore = [];
    for (const handle of launchParams.files) {
      const file = await handle.getFile();
      file.handle = handle;
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
}

const checkForAndPossiblyAskForPermissions = async (wasmFilesBefore) => {
  for (const wasmFileBefore of wasmFilesBefore) {
    const state = await wasmFileBefore.handle.requestPermission({
      mode: 'readwrite',
    });
  }
};

const optimizeWasmFiles = async (wasmFilesBefore) => {
  statsHeader.hidden = false;
  resultsArea.closest('table').hidden = false;
  const tasks = [];

  for (const wasmFileBefore of wasmFilesBefore) {
    const stats = statsTemplate.content.cloneNode(true);
    const fileNameLabel = stats.querySelector('.file-name');
    const beforeSizeLabel = stats.querySelector('.before-size');
    const afterSizeLabel = stats.querySelector('.after-size');
    const deltaSizeLabel = stats.querySelector('.delta-size');
    const spinnerImg = stats.querySelector('.spinner');
    spinnerImg.src = spinner;
    fileNameLabel.querySelector('code').textContent = wasmFileBefore.name;
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
          console.log(
            wasmFileBefore.name,
            '→',
            'Before:',
            wasmFileBefore.size,
            'After:',
            wasmFileAfter.size,
            'Delta:',
            deltaSize,
          );
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
              overwriteCheckbox.checked &&
              wasmFileBefore.handle
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
