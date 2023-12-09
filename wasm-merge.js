import spinner from '/spinner.svg';
import { mergeButton, mergeArea, resultsArea } from './dom.js';
import { supportsFileSystemAccess } from './main.js';
import { uuidToFile } from './wasm-optimize.js';
import prettyBytes from 'pretty-bytes';

const MERGE_FILE_UUID = crypto.randomUUID();
const MERGED_FILE_NAME = 'merged.wasm';

if (supportsFileSystemAccess) {
  mergeArea.querySelector('.delta').colSpan += 1;
}

mergeButton.addEventListener('click', async () => {
  const fileNameLabel = mergeArea.querySelector('.file-name');
  const beforeSizeLabel = mergeArea.querySelector('.before-size');
  const afterSizeLabel = mergeArea.querySelector('.after-size');
  const deltaSizeLabel = mergeArea.querySelector('.delta-size');
  const spinnerImg = mergeArea.querySelector('.spinner');

  fileNameLabel.querySelector('code').textContent = MERGED_FILE_NAME;
  fileNameLabel.dataset.uuid = MERGE_FILE_UUID;
  fileNameLabel.classList.add('processing');
  mergeArea.hidden = false;
  spinnerImg.src = spinner;
  afterSizeLabel.textContent = '';
  deltaSizeLabel.textContent = 'Merging…';
  deltaSizeLabel.classList.remove('size-smaller');
  deltaSizeLabel.classList.remove('size-larger');
  fileNameLabel.classList.remove('error');
  deltaSizeLabel.classList.remove('error');
  afterSizeLabel.classList.remove('error');

  const wasmFiles = [];
  const uuids = [];
  resultsArea
    .querySelectorAll('input.merge-checkbox:checked:not(:disabled)')
    .forEach((input) => {
      const uuid = input.closest('tr').querySelector('[data-uuid]')
        .dataset.uuid;
      const { file } = uuidToFile.get(uuid);
      wasmFiles.push(file);
      uuids.push(uuid);
    });

  const wasmFileSizes = wasmFiles.reduce(
    (acc, wasmFile) => acc + wasmFile.size,
    0,
  );

  // eslint-disable-next-line no-irregular-whitespace
  beforeSizeLabel.textContent = `Σ ${prettyBytes(wasmFileSizes).replace(
    ' ',
    ' ',
  )}`;

  const mergeWorker = new Worker(
    new URL('./merge-worker.js', import.meta.url),
    {
      type: 'module',
    },
  );

  mergeWorker.addEventListener('message', async (event) => {
    if (event.data.status) {
      deltaSizeLabel.textContent = 'Optimizing…';
      return;
    }

    mergeWorker.terminate();

    spinnerImg.removeAttribute('src');
    fileNameLabel.classList.remove('processing');

    const { file, error } = event.data;

    if (error) {
      const errorObject = new Error(error);
      afterSizeLabel.classList.add('error');
      deltaSizeLabel.classList.add('error');
      afterSizeLabel.textContent = errorObject.name;
      deltaSizeLabel.textContent = errorObject.message;
      return;
    }

    afterSizeLabel.textContent = prettyBytes(file.size).replace(' ', ' ');
    const deltaSize = file.size - wasmFileSizes;
    console.log(
      `Files ${new Intl.ListFormat('en', {
        style: 'long',
        type: 'conjunction',
      }).format(
        wasmFiles.map((file) => file.name),
      )} merged → Before Σ: ${wasmFileSizes} After: ${
        file.size
      } Delta: ${deltaSize}`,
    );
    const deltaSizePercent = Math.abs(
      100 - (file.size / wasmFileSizes) * 100,
    ).toFixed(2);
    deltaSizeLabel.textContent =
      Number(deltaSizePercent) === 0
        ? 'no change'
        : `${deltaSizePercent}% ${
            deltaSize < 0 ? 'smaller' : 'larger'
          } (${prettyBytes(Math.abs(deltaSize)).replace(' ', ' ')})`;
    deltaSizeLabel.classList.add(
      Number(deltaSizePercent) === 0
        ? 'size-larger'
        : deltaSize < 0
          ? 'size-smaller'
          : 'size-larger',
    );
    uuidToFile.set(MERGE_FILE_UUID, { file });
  });

  mergeWorker.postMessage({ wasmFiles, uuids, fileName: MERGED_FILE_NAME });
});

export { MERGE_FILE_UUID };
