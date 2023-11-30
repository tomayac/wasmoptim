import spinner from '/spinner.svg';
import { mergeButton, mergeArea, resultsArea } from './dom';
import { uuidToFile } from './file-system';
import prettyBytes from 'pretty-bytes';

const MERGE_FILE_UUID = crypto.randomUUID();

mergeButton.addEventListener('click', async () => {
  const fileNameLabel = mergeArea.querySelector('.file-name');
  const beforeSizeLabel = mergeArea.querySelector('.before-size');
  const afterSizeLabel = mergeArea.querySelector('.after-size');
  const deltaSizeLabel = mergeArea.querySelector('.delta-size');
  const spinnerImg = mergeArea.querySelector('.spinner');

  fileNameLabel.hidden = true;
  fileNameLabel.dataset.uuid = MERGE_FILE_UUID;
  mergeArea.hidden = false;
  spinnerImg.src = spinner;
  afterSizeLabel.classList.remove('error');
  afterSizeLabel.textContent = '';
  deltaSizeLabel.textContent = 'Merging…';
  deltaSizeLabel.classList.remove('size-smaller');
  deltaSizeLabel.classList.remove('size-larger');
  deltaSizeLabel.classList.remove('error');

  const wasmFiles = [];
  const uuids = [];
  resultsArea.querySelectorAll('input:checked').forEach((input) => {
    const uuid = input.closest('tr').querySelector('[data-uuid]').dataset.uuid;
    const { file } = uuidToFile.get(uuid);
    wasmFiles.push(file);
    uuids.push(uuid);
  });
  const wasmFileSizes = wasmFiles.reduce(
    (acc, wasmFile) => acc + wasmFile.size,
    0,
  );
  beforeSizeLabel.textContent = `Σ ${prettyBytes(wasmFileSizes)}`;

  const worker = new Worker(new URL('./merge-worker.js', import.meta.url), {
    type: 'module',
  });

  worker.addEventListener('message', async (event) => {
    if (event.data.status) {
      deltaSizeLabel.textContent = 'Optimizing…';
      return;
    }
    worker.terminate();
    const { file, error } = event.data;
    spinnerImg.removeAttribute('src');
    if (error) {
      const errorObject = new Error(error);
      afterSizeLabel.classList.add('error');
      deltaSizeLabel.classList.add('error');
      afterSizeLabel.textContent = errorObject.name;
      deltaSizeLabel.textContent = errorObject.message;
      return;
    }
    fileNameLabel.hidden = false;
    fileNameLabel.querySelector('code').textContent = file.name;
    afterSizeLabel.textContent = prettyBytes(file.size);
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
          } (${prettyBytes(Math.abs(deltaSize))})`;
    deltaSizeLabel.classList.add(
      Number(deltaSizePercent) === 0
        ? 'size-larger'
        : deltaSize < 0
          ? 'size-smaller'
          : 'size-larger',
    );
    uuidToFile.set(MERGE_FILE_UUID, { file });
  });

  worker.postMessage({ wasmFiles, uuids });
});

export { MERGE_FILE_UUID };
