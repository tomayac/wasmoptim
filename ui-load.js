import { optimizeWasmFiles } from './wasm-opt.js';
import {
  fileOpen,
  directoryOpen,
  supported as supportsFileSystemAccess,
} from 'browser-fs-access';
import {
  loadWasmButton,
  overwriteCheckbox,
  observeDirectoryChangesCheckbox,
  loadDirectoryButton,
} from './dom.js';
import { supportsFileSystemObserver } from './main.js';

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
