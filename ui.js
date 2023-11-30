import spinner from '/spinner.svg';
import {
  readDirectory,
  readDirectoryLegacy,
  checkForAndPossiblyAskForPermissions,
  uuidToFile,
} from './file-system.js';
import { optimizeWasmFiles } from './wasm-optimize.js';
import { supportsFileHandleDragAndDrop } from './main.js';
import {
  fileOpen,
  directoryOpen,
  fileSave,
  supported as supportsFileSystemAccess,
} from 'browser-fs-access';
import {
  loadWasmButton,
  dropArea,
  resultsArea,
  mergeArea,
  selectAllCheckbox,
  overwriteCheckbox,
  observeDirectoryChangesCheckbox,
  examplesList,
  exampleTemplate,
  loadDirectoryButton,
  mergeButton,
  metaThemeColor,
} from './dom.js';
import { supportsFileSystemObserver } from './main.js';
import { MERGE_FILE_UUID } from './wasm-merge.js';

if (supportsFileSystemAccess) {
  overwriteCheckbox.parentNode.hidden = false;
  overwriteCheckbox.addEventListener('change', async () => {
    localStorage.setItem('overwrite-original-files', overwriteCheckbox.checked);
    const files = [];
    if (overwriteCheckbox.checked) {
      for (const [uuid, { file }] of uuidToFile.entries()) {
        if (uuid === MERGE_FILE_UUID || !file.handle) {
          continue;
        }
        files.push(file);
      }
      await checkForAndPossiblyAskForPermissions(files);
    }
  });

  if (localStorage.getItem('overwrite-original-files') !== 'true') {
    overwriteCheckbox.checked = false;
  } else {
    overwriteCheckbox.checked = true;
  }
}

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
  const nodeName = e.target.nodeName.toLowerCase();
  if (nodeName !== 'a' && nodeName !== 'code') {
    return;
  }
  e.preventDefault();
  const anchor = e.target.closest('a');
  const wasmFileURL = anchor.href;
  const downloading = anchor.parentNode.querySelector('.downloading');
  downloading.textContent = 'Downloading…';
  downloading.classList.remove('error');
  downloading.hidden = false;
  const spinnerImg = anchor.parentNode.querySelector('img');
  spinnerImg.src = spinner;
  try {
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
    await optimizeWasmFiles([wasmFileBefore]);
  } catch (error) {
    console.error(error.name, error.message);
    spinnerImg.removeAttribute('src');
    downloading.classList.add('error');
    downloading.textContent = error.message;
  }
});

document.addEventListener('paste', async (e) => {
  try {
    if (!e.clipboardData.files.length) {
      return;
    }
    const wasmFilesBefore = Array.from(e.clipboardData.files).filter(
      (file) =>
        file.type === 'application/wasm' ||
        file.name.endsWith('.wasm') ||
        file.name.endsWith('.wat'),
    );
    await optimizeWasmFiles(wasmFilesBefore);
  } catch (error) {
    console.error(error.name, error.message);
  }
});

const showOrHideMergeButton = () => {
  const numInputsChecked = resultsArea.querySelectorAll('input:checked').length;
  mergeButton.style.display = numInputsChecked < 2 ? 'none' : '';
};
showOrHideMergeButton();

selectAllCheckbox.addEventListener('click', () => {
  resultsArea.querySelectorAll('input:not(:disabled)').forEach((input) => {
    input.checked = selectAllCheckbox.checked;
  });
  showOrHideMergeButton();
});

resultsArea.addEventListener('click', async (e) => {
  const nodeName = e.target.nodeName.toLowerCase();
  if (nodeName === 'input' || nodeName === 'label') {
    if (
      e.target.classList.contains('error') ||
      e.target.classList.contains('processing')
    ) {
      return;
    }
    if (!e.target.checked) {
      selectAllCheckbox.checked = false;
    }
    showOrHideMergeButton();
    return;
  }
  if (nodeName !== 'a' && nodeName !== 'code') {
    return;
  }
  e.preventDefault();
  const fileNameLabel = e.target.closest('a');
  if (
    !fileNameLabel.classList.contains('file-name') ||
    fileNameLabel.classList.contains('error')
  ) {
    return;
  }
  if (fileNameLabel.classList.contains('processing')) {
    return;
  }
  const uuid = fileNameLabel.dataset.uuid;
  const { file, handle } = uuidToFile.get(uuid);
  try {
    await fileSave(file, {
      fileName: file.name,
      extensions: ['.wasm', '.wat'],
      mimeTypes: ['application/wasm'],
      existingHandle: handle ? handle : undefined,
      startIn: handle ? handle : undefined,
    });
  } catch (error) {
    if (error.name === 'AbortError') {
      return;
    }
    console.error(error.name, error.message);
  }
});

mergeArea.addEventListener('click', async (e) => {
  const nodeName = e.target.nodeName.toLowerCase();
  if (nodeName !== 'a' && nodeName !== 'code') {
    return;
  }
  e.preventDefault();
  const fileNameLabel = e.target.closest('a');
  if (
    !fileNameLabel.classList.contains('file-name') ||
    fileNameLabel.classList.contains('error')
  ) {
    return;
  }
  if (fileNameLabel.classList.contains('processing')) {
    return;
  }
  const uuid = fileNameLabel.dataset.uuid;
  const { file, handle } = uuidToFile.get(uuid);
  try {
    await fileSave(file, {
      fileName: file.name,
      extensions: ['.wasm'],
      mimeTypes: ['application/wasm'],
      existingHandle: handle ? handle : undefined,
      startIn: handle ? handle : undefined,
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
      mode: overwriteCheckbox.checked ? 'readwrite' : 'read',
    });
    const wasmFilesBefore = files.filter(
      (file) =>
        file.type === 'application/wasm' ||
        file.name.endsWith('.wasm') ||
        file.name.endsWith('.wat'),
    );
    if (
      supportsFileSystemAccess &&
      supportsFileSystemObserver &&
      observeDirectoryChangesCheckbox.checked
    ) {
      let directoryHandles = [];
      for (const file of files) {
        directoryHandles.push(file.directoryHandle);
      }
      directoryHandles = [...new Set(directoryHandles)];
      const { getFileSystemChangeObserver, observedDirectories } = await import(
        './file-system-observer.js'
      );
      const fileSystemChangeObserver = getFileSystemChangeObserver();
      directoryHandles.forEach((directoryHandle) => {
        fileSystemChangeObserver.observe(directoryHandle, { recursive: true });
        observedDirectories.add(directoryHandle);
        console.log(`Directory ${directoryHandle.name} → Observing changes`);
      });
    }
    await optimizeWasmFiles(wasmFilesBefore);
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
      extensions: ['.wasm', '.wat'],
      multiple: true,
    });
    if (!wasmFilesBefore || !wasmFilesBefore.length) {
      return;
    }
    await optimizeWasmFiles(wasmFilesBefore);
  } catch (error) {
    if (error.name === 'AbortError') {
      return;
    }
    console.error(error.name, error.message);
  }
});

document.addEventListener('dragover', (e) => {
  e.preventDefault();
});

document.addEventListener('dragenter', (e) => {
  e.preventDefault();
  dropArea.classList.add('drag-hover');
});

document.addEventListener('dragleave', (e) => {
  e.preventDefault();
  if (e.target !== document.documentElement) {
    return;
  }
  dropArea.classList.remove('drag-hover');
});

document.addEventListener('drop', async (e) => {
  e.preventDefault();
  dropArea.classList.remove('drag-hover');
  const fileHandlesPromises = [...e.dataTransfer.items]
    .filter((item) => item.kind === 'file')
    .map((item) =>
      supportsFileHandleDragAndDrop
        ? item.getAsFileSystemHandle()
        : item.webkitGetAsEntry(),
    );
  const wasmFilesBefore = [];

  let getFileSystemChangeObserver;
  let observedDirectories;
  if (supportsFileSystemObserver) {
    ({ getFileSystemChangeObserver, observedDirectories } = await import(
      './file-system-observer.js'
    ));
  }
  for await (const handle of fileHandlesPromises) {
    if (handle.kind === 'directory') {
      let entries = await readDirectory(handle, true);
      entries = entries.filter(
        (entry) =>
          entry.type === 'application/wasm' ||
          entry.name.endsWith('.wasm') ||
          entry.name.endsWith('.wat'),
      );
      wasmFilesBefore.push(...entries);
      if (
        supportsFileSystemObserver &&
        observeDirectoryChangesCheckbox.checked
      ) {
        let directoryHandles = [];
        for (const entry of entries) {
          directoryHandles.push(entry.directoryHandle);
        }
        directoryHandles = [...new Set(directoryHandles)];
        const fileSystemChangeObserver = getFileSystemChangeObserver();
        directoryHandles.forEach((directoryHandle) => {
          fileSystemChangeObserver.observe(directoryHandle, {
            recursive: true,
          });
          observedDirectories.add(directoryHandle);
          console.log(`Directory ${directoryHandle.name} → Observing changes`);
        });
      }
      continue;
    } else if (handle.isDirectory) {
      let entries = await readDirectoryLegacy(handle);
      entries = entries.filter(
        (entry) => entry.name.endsWith('.wasm') || entry.name.endsWith('.wat'),
      );
      wasmFilesBefore.push(
        ...(await Promise.all(
          entries.map(
            async (entry) => new Promise((resolve) => entry.file(resolve)),
          ),
        )),
      );
      continue;
    }
    let file;
    if (handle.kind === 'file') {
      file = await handle.getFile();
      file.handle = handle;
    } else if (handle.isFile) {
      file = await new Promise((resolve) =>
        handle.file((file) => resolve(file)),
      );
    }
    if (
      (file.type && file.type !== 'application/wasm') ||
      (!file.name.endsWith('.wasm') && !file.name.endsWith('.wat'))
    ) {
      continue;
    }
    wasmFilesBefore.push(file);
  }
  if (supportsFileSystemAccess && overwriteCheckbox.checked) {
    await checkForAndPossiblyAskForPermissions(wasmFilesBefore);
  }
  await optimizeWasmFiles(wasmFilesBefore);
});

const colorSchemeChange = (e) => {
  if (e.matches) {
    metaThemeColor.content = 'rgb(32, 33, 36)';
    return;
  }
  metaThemeColor.content = '#fff';
};
matchMedia('(prefers-color-scheme: dark)').addEventListener(
  'change',
  colorSchemeChange,
);
colorSchemeChange(matchMedia('(prefers-color-scheme: dark)'));
