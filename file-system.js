const uuidToFile = new Map();

const supportsGetUniqueId =
  'FileSystemHandle' in window && 'getUniqueId' in FileSystemHandle.prototype;

const checkForAndPossiblyAskForPermissions = async (wasmFilesBefore) => {
  const promises = wasmFilesBefore.map((wasmFileBefore) =>
    wasmFileBefore.handle.requestPermission({
      mode: 'readwrite',
    }),
  );
  await Promise.all(promises);
};

const readDirectoryLegacy = async (directoryEntry) => {
  const files = [];

  const readEntries = async (directoryReader) => {
    const entries = await new Promise((resolve) =>
      directoryReader.readEntries(resolve),
    );

    await Promise.all(
      entries.map(async (entry) => {
        if (entry.isDirectory) {
          await readEntries(entry.createReader());
        } else {
          files.push(entry);
        }
      }),
    );
  };

  const directoryReader = directoryEntry.createReader();
  await readEntries(directoryReader);

  return files;
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

export {
  readDirectory,
  readDirectoryLegacy,
  checkForAndPossiblyAskForPermissions,
  uuidToFile,
  supportsGetUniqueId,
};
