import { observeChangesCheckbox } from './dom.js';
import { uuidToFile } from './wasm-optimize.js';
import { optimizeWasmFiles } from './wasm-optimize.js';
import { debounce } from './util.js';

let fileSystemChangeObserver = null;

const fileSystemChangeCallback = async (changes) => {
  const wasmFilesBefore = [];
  for (const change of changes) {
    if (change.type === 'modified') {
      const changedFile = await change.changedHandle.getFile();
      console.log(`File modified, re-optimizing ${changedFile.name}.`);
      changedFile.handle = change.changedHandle;
      const changedUniqueId =
        (await change.changedHandle?.getUniqueId()) ||
        change.changedHandle.name;
      wasmFilesBefore.push(changedFile);
      for (const [uuid, { handle }] of uuidToFile.entries()) {
        const uniqueId = (await handle?.getUniqueId()) || handle.name;
        if (uniqueId === changedUniqueId) {
          document
            .querySelector(`[data-uuid="${uuid}"]`)
            ?.closest('tr')
            ?.remove();
        }
      }
    }
  }
  optimizeWasmFiles(wasmFilesBefore);
};

const getFileSystemChangeObserver = () => {
  if (!fileSystemChangeObserver) {
    fileSystemChangeObserver = new FileSystemObserver(
      debounce((changes) => {
        fileSystemChangeCallback(changes);
      }, 250),
    );
  }
  return fileSystemChangeObserver;
};

observeChangesCheckbox.parentNode.hidden = false;
observeChangesCheckbox.addEventListener('change', () => {
  localStorage.setItem('observe-changes', observeChangesCheckbox.checked);

  if (observeChangesCheckbox.checked) {
    getFileSystemChangeObserver();
    for (const [, { handle, file }] of uuidToFile.entries()) {
      if (!handle) {
        continue;
      }
      fileSystemChangeObserver.observe(handle);
    }
    return;
  }
  if (fileSystemChangeObserver) {
    fileSystemChangeObserver.disconnect();
    fileSystemChangeObserver = null;
  }
});

if (localStorage.getItem('observe-changes') !== 'true') {
  observeChangesCheckbox.checked = false;
} else {
  observeChangesCheckbox.checked = true;
}

export { getFileSystemChangeObserver };
