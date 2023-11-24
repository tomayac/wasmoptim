import { observeChangesCheckbox } from './dom.js';
import { uuidToFile, optimizeWasmFiles } from './wasm-optimize.js';
import { debounce } from './util.js';
import { MERGE_FILE_UUID } from './wasm-merge.js';

let fileSystemChangeObserver = null;

const fileSystemChangeCallback = async (changes) => {
  console.log(
    'File system changes detected',
    changes,
    await changes[0].changedHandle.getFile(),
  );
  const wasmFilesBefore = [];
  for (const change of changes) {
    if (change.type === 'modified') {
      const changedFile = await change.changedHandle.getFile();
      console.log(`${changedFile.name} modified → Re-optimizing`);
      changedFile.handle = change.changedHandle;
      wasmFilesBefore.push(changedFile);
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
  localStorage.setItem('observe-file-changes', observeChangesCheckbox.checked);

  if (observeChangesCheckbox.checked) {
    getFileSystemChangeObserver();
    for (const [uuid, { handle }] of uuidToFile.entries()) {
      if (uuid === MERGE_FILE_UUID || !handle) {
        continue;
      }
      fileSystemChangeObserver.observe(handle);
      console.log(`${handle.name} → Observing changes`);
    }
    return;
  }
  if (fileSystemChangeObserver) {
    fileSystemChangeObserver.disconnect();
    fileSystemChangeObserver = null;
  }
});

if (localStorage.getItem('observe-file-changes') !== 'true') {
  observeChangesCheckbox.checked = false;
} else {
  observeChangesCheckbox.checked = true;
}

export { getFileSystemChangeObserver };
