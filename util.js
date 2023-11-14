const supportsGetUniqueId = 'getUniqueId' in FileSystemHandle.prototype;

const limit = async (tasks, concurrency) => {
  const results = [];

  async function runTasks(tasksIterator) {
    for (const [index, task] of tasksIterator) {
      try {
        results[index] = await task();
      } catch (error) {
        results[index] = new Error(`Failed with: ${error.message}`);
      }
    }
  }

  const workers = new Array(concurrency).fill(tasks.entries()).map(runTasks);
  await Promise.allSettled(workers);

  return results;
};

const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

const readDirectoryLegacy = async (directoryEntry) => {
  const files = [];

  async function readEntries(directoryReader) {
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
  }

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
  limit,
  debounce,
  readDirectory,
  readDirectoryLegacy,
  supportsGetUniqueId,
};
