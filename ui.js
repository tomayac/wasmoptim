import spinner from '/spinner.svg';
import { uuidToFile } from './wasm-optimize.js';
import { supportsFileHandleDragAndDrop } from './main.js';

import {
  fileOpen,
  directoryOpen,
  fileSave,
  supported as supportsFileSystemAccess,
} from 'browser-fs-access';

import { optimizeWasmFiles } from './wasm-optimize.js';

import {
  loadWasmButton,
  dropArea,
  resultsArea,
  overwriteCheckbox,
  examplesList,
  exampleTemplate,
  loadDirectoryButton,
} from './dom.js';

const checkForAndPossiblyAskForPermissions = async (wasmFilesBefore) => {
  for (const wasmFileBefore of wasmFilesBefore) {
    const state = await wasmFileBefore.handle.requestPermission({
      mode: 'readwrite',
    });
  }
};

const EXAMPLE_URLS = [
  'https://unpkg.com/canvaskit-wasm@0.39.1/bin/canvaskit.wasm',
  'https://unpkg.com/zxing-wasm@1.0.0-rc.4/dist/full/zxing_full.wasm',
  'https://unpkg.com/@sqlite.org/sqlite-wasm@3.44.0-build1/sqlite-wasm/jswasm/sqlite3.wasm',
  'https://unpkg.com/@tensorflow/tfjs-backend-wasm@4.13.0/wasm-out/tfjs-backend-wasm.wasm',
];

const SEMVER_REGEX =
  /@(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?/;

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

resultsArea.addEventListener('click', async (e) => {
  e.preventDefault();
  if (e.target.nodeName.toLowerCase() !== 'code') {
    return;
  }
  const anchor = e.target.closest('a');
  if (
    !anchor.classList.contains('file-name') ||
    anchor.classList.contains('error')
  ) {
    return;
  }
  if (anchor.dataset.processing) {
    return;
  }
  const uuid = anchor.dataset.uuid;
  const { file } = uuidToFile.get(uuid);
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

loadDirectoryButton.addEventListener('click', async () => {
  try {
    const files = await directoryOpen({
      recursive: true,
      mode: 'readwrite',
    });
    const wasmFilesBefore = files.filter(
      (file) => file.type === 'application/wasm' || file.name.endsWith('.wasm'),
    );
    optimizeWasmFiles(wasmFilesBefore);
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

export { checkForAndPossiblyAskForPermissions };
