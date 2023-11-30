import {
  observeFileChangesCheckbox,
  observeDirectoryChangesCheckbox,
} from './dom.js';
import { optimizeWasmFiles } from './wasm-optimize.js';
import {
  readDirectory,
  uuidToFile,
  checkForAndPossiblyAskForPermissions,
  supportsGetUniqueId,
} from './file-system.js';
import { debounce } from './util.js';
import { MERGE_FILE_UUID } from './wasm-merge.js';

const observedDirectories = new Set();

let fileSystemChangeObserver = null;

const fileSystemChangeCallback = async (changes) => {
  console.log(
    `File system changes detected  → ${changes
      .map((change) => `${change.changedHandle.name} (${change.type})`)
      .join(', ')}`.trim(),
  );
  let wasmFilesBefore = [];
  for (const change of changes) {
    if (change.type === 'modified') {
      if (change.changedHandle instanceof FileSystemFileHandle) {
        const changedFile = await change.changedHandle.getFile();
        console.log(`File ${changedFile.name} modified → Re-optimizing`);
        changedFile.handle = change.changedHandle;
        wasmFilesBefore.push(changedFile);
      } else if (change.changedHandle instanceof FileSystemDirectoryHandle) {
        const changedDirectoryHandle = change.changedHandle;
        let entries = await readDirectory(changedDirectoryHandle, true);
        console.log(
          `Directory ${change.changedHandle.name} modified → Getting entries`,
        );
        entries = entries.filter(
          (entry) =>
            entry.type === 'application/wasm' ||
            entry.name.endsWith('.wasm') ||
            entry.name.endsWith('.wat'),
        );
        wasmFilesBefore.push(...entries);
        const existingUuids = Array.from(uuidToFile.keys());
        const existingFilesLastModifieds = Array.from(uuidToFile.values()).map(
          (value) => value.lastModified,
        );
        const promises = wasmFilesBefore.map(async (wasmFileBefore) => {
          return supportsGetUniqueId
            ? await wasmFileBefore.handle.getUniqueId()
            : wasmFileBefore.name;
        });
        const toBeCheckedUuids = await Promise.all(promises);
        wasmFilesBefore = wasmFilesBefore.filter((wasmFileBefore, i) => {
          const uuid = toBeCheckedUuids[i];
          const isNewFile = !existingUuids.includes(uuid);
          const isModifiedFile =
            existingFilesLastModifieds[existingUuids.indexOf(uuid)] <
            wasmFileBefore.lastModified;
          return isNewFile || isModifiedFile;
        });
      }
    }
  }
  wasmFilesBefore = [...new Set(wasmFilesBefore)];
  await checkForAndPossiblyAskForPermissions(wasmFilesBefore);
  await optimizeWasmFiles(wasmFilesBefore);
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

if (localStorage.getItem('observe-file-changes') !== 'true') {
  observeFileChangesCheckbox.checked = false;
} else {
  observeFileChangesCheckbox.checked = true;
}

if (localStorage.getItem('observe-directory-changes') !== 'true') {
  observeDirectoryChangesCheckbox.checked = false;
} else {
  observeDirectoryChangesCheckbox.checked = true;
}

observeFileChangesCheckbox.parentNode.hidden = false;
observeFileChangesCheckbox.addEventListener('change', () => {
  localStorage.setItem(
    'observe-file-changes',
    observeFileChangesCheckbox.checked,
  );

  if (observeFileChangesCheckbox.checked) {
    getFileSystemChangeObserver();
    for (const [uuid, { handle }] of uuidToFile.entries()) {
      if (uuid === MERGE_FILE_UUID || !handle) {
        continue;
      }
      fileSystemChangeObserver.observe(handle);
      console.log(`File ${handle.name} → Observing changes`);
    }
    return;
  }
  if (fileSystemChangeObserver) {
    for (const [uuid, { handle }] of uuidToFile.entries()) {
      if (uuid === MERGE_FILE_UUID || !handle) {
        continue;
      }
      fileSystemChangeObserver.unobserve(handle);
      console.log(`File ${handle.name} → No longer observing changes`);
    }
  }
});

observeDirectoryChangesCheckbox.parentNode.hidden = false;
observeDirectoryChangesCheckbox.addEventListener('change', () => {
  localStorage.setItem(
    'observe-directory-changes',
    observeDirectoryChangesCheckbox.checked,
  );

  if (observeDirectoryChangesCheckbox.checked) {
    getFileSystemChangeObserver();
    for (const dirHandle of observedDirectories) {
      fileSystemChangeObserver.observe(dirHandle);
      console.log(`Directory ${dirHandle.name} → Observing changes`);
    }
    return;
  }
  if (fileSystemChangeObserver) {
    for (const dirHandle of observedDirectories) {
      fileSystemChangeObserver.unobserve(dirHandle);
      console.log(`Directory ${dirHandle.name} → No longer observing changes`);
    }
  }
});

export { getFileSystemChangeObserver, observedDirectories };
