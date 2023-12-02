const readDirectory = async (directoryEntry) => {
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

export { readDirectory };
