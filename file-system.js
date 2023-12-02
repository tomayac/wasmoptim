import { MERGE_FILE_UUID } from './wasm-merge.js';
import { overwriteCheckbox } from './dom.js';
import { supported as supportsFileSystemAccess } from 'browser-fs-access';

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
      await checkAndPossiblyAskForPermissions(files);
    }
  });
}

if (localStorage.getItem('overwrite-original-files') !== 'true') {
  overwriteCheckbox.checked = false;
} else {
  overwriteCheckbox.checked = true;
}

const checkAndPossiblyAskForPermissions = async (wasmFilesBefore) => {
  const promises = wasmFilesBefore.map((wasmFileBefore) =>
    wasmFileBefore.handle.requestPermission({
      mode: 'readwrite',
    }),
  );
  await Promise.all(promises);
};

const readDirectory = async (
  dirHandle,
  recursive,
  path = dirHandle.name,
  skipDirectory,
) => {
  const dirs = [];
  const files = [];
  for await (const entry of dirHandle.values()) {
    const nestedPath = `${path}/${entry.name}`;
    if (entry.kind === 'file') {
      files.push(
        entry.getFile().then((file) => {
          file.directoryHandle = dirHandle;
          file.handle = entry;
          return Object.defineProperty(file, 'webkitRelativePath', {
            configurable: true,
            enumerable: true,
            get: () => nestedPath,
          });
        }),
      );
    } else if (entry.kind === 'directory' && recursive) {
      dirs.push(readDirectory(entry, recursive, nestedPath, skipDirectory));
    }
  }
  return [...(await Promise.all(dirs)).flat(), ...(await Promise.all(files))];
};

export { readDirectory, checkAndPossiblyAskForPermissions };
