import {
  dropArea,
  observeDirectoryChangesCheckbox,
  overwriteCheckbox,
} from './dom.js';
import {
  supportsFileHandleDragAndDrop,
  supportsFileSystemObserver,
} from './main.js';
import { supported as supportsFileSystemAccess } from 'browser-fs-access';
import { optimizeWasmFiles } from './wasm-optimize.js';

let readDirectory;
(async () => {
  if (supportsFileSystemAccess) {
    ({ readDirectory } = await import('./file-system.js'));
    return;
  }
  ({ readDirectory } = await import('./file-system-legacy.js'));
})();

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
      let entries = await readDirectory(handle);
      entries = entries.filter(
        (entry) => entry.name.endsWith('.wasm') || entry.name.endsWith('.wat'),
      );
      wasmFilesBefore.push(
        ...(
          await Promise.all(
            entries.map(
              async (entry) => new Promise((resolve) => entry.file(resolve)),
            ),
          )
        ).map((file, i) => {
          file.relativePath = entries[i].fullPath;
          return file;
        }),
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
    const { checkAndPossiblyAskForPermissions } = await import(
      './file-system.js'
    );
    await checkAndPossiblyAskForPermissions(wasmFilesBefore);
  }
  await optimizeWasmFiles(wasmFilesBefore);
});
