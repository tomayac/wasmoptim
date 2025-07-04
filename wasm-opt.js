import prettyBytes from 'pretty-bytes';
import spinner from '/spinner.svg';
import {
  supportsFileSystemObserver,
  supportsGetUniqueId,
  supportsBadging,
  supportsFileSystemAccess,
} from './main.js';
import {
  statsTemplate,
  statsHeader,
  resultsArea,
  observeFileChangesCheckbox,
  overwriteCheckbox,
  totalSavingsSize,
  selectAllCheckbox,
} from './dom.js';
import { MERGE_FILE_UUID } from './wasm-merge.js';
import { limit } from './util.js';

const uuidToFile = new Map();
if (supportsFileSystemAccess) {
  totalSavingsSize.colSpan += 1;
}

let currentlyProcessing = 0;

const optimizeWasmFiles = async (wasmFilesBefore) => {
  statsHeader.hidden = false;
  if (supportsFileSystemAccess) {
    const th = statsHeader.querySelector('th[hidden]');
    if (th) {
      th.hidden = false;
    }
  }
  resultsArea.closest('table').hidden = false;

  const tasks = [];

  for (const wasmFileBefore of wasmFilesBefore) {
    const uniqueId =
      supportsGetUniqueId && wasmFileBefore.handle
        ? await wasmFileBefore.handle.getUniqueId()
        : wasmFileBefore.webkitRelativePath
          ? wasmFileBefore.webkitRelativePath
          : wasmFileBefore.relativePath
            ? wasmFileBefore.relativePath
            : wasmFileBefore.name;

    let fileNameLabel;
    let beforeSizeLabel;
    let afterSizeLabel;
    let deltaSizeLabel;
    let spinnerImg;
    let mergeCheckbox;
    let pinCheckbox;
    const possiblyExistingFileName = resultsArea.querySelector(
      `[data-uuid="${uniqueId}"]`,
    );
    if (possiblyExistingFileName) {
      const statsRow = possiblyExistingFileName.closest('tr');
      fileNameLabel = statsRow.querySelector('.file-name');
      beforeSizeLabel = statsRow.querySelector('.before-size');
      afterSizeLabel = statsRow.querySelector('.after-size');
      deltaSizeLabel = statsRow.querySelector('.delta-size');
      spinnerImg = statsRow.querySelector('.spinner');
      mergeCheckbox = statsRow.querySelector('.merge-checkbox');
      pinCheckbox = statsRow.querySelector('.pin-checkbox');
    } else {
      const stats = statsTemplate.content.cloneNode(true);
      fileNameLabel = stats.querySelector('.file-name');
      beforeSizeLabel = stats.querySelector('.before-size');
      afterSizeLabel = stats.querySelector('.after-size');
      deltaSizeLabel = stats.querySelector('.delta-size');
      spinnerImg = stats.querySelector('.spinner');
      mergeCheckbox = stats.querySelector('.merge-checkbox');
      pinCheckbox = stats.querySelector('.pin-checkbox');
      pinCheckbox.closest('td').hidden = !supportsFileSystemAccess;
      resultsArea.append(stats);
      const twoFilesOrMore = resultsArea.querySelectorAll('tr').length > 1;
      selectAllCheckbox.closest('th').style.display = twoFilesOrMore
        ? ''
        : 'none';
      resultsArea.querySelectorAll('input.merge-checkbox').forEach((input) => {
        input.closest('td').style.display = twoFilesOrMore ? '' : 'none';
      });
    }

    spinnerImg.src = spinner;
    fileNameLabel.querySelector('code').textContent = wasmFileBefore.name;
    deltaSizeLabel.textContent = 'Optimizing…';
    beforeSizeLabel.textContent = prettyBytes(wasmFileBefore.size).replace(
      ' ',
      ' ',
    );

    fileNameLabel.dataset.uuid = uniqueId;
    mergeCheckbox.disabled = true;

    deltaSizeLabel.classList.remove('size-smaller');
    deltaSizeLabel.classList.remove('size-larger');
    deltaSizeLabel.classList.remove('error');
    afterSizeLabel.classList.remove('error');
    mergeCheckbox.classList.remove('error');
    fileNameLabel.classList.remove('error');

    fileNameLabel.classList.add('processing');
    mergeCheckbox.classList.add('processing');

    if (supportsBadging) {
      try {
        await navigator.setAppBadge(++currentlyProcessing);
      } catch (error) {
        console.error(error.name, error.message);
      }
    }

    tasks.push(() => {
      return new Promise((resolve, reject) => {
        const wasmOptWorker = new Worker(
          new URL('./wasm-opt-worker.js', import.meta.url),
        );
        wasmOptWorker.addEventListener('message', async (event) => {
          wasmOptWorker.terminate();

          spinnerImg.removeAttribute('src');
          fileNameLabel.classList.remove('processing');
          mergeCheckbox.classList.remove('processing');
          mergeCheckbox.disabled = false;

          if (supportsBadging) {
            --currentlyProcessing;
            try {
              if (currentlyProcessing === 0) {
                await navigator.clearAppBadge();
              } else {
                await navigator.setAppBadge(currentlyProcessing);
              }
            } catch (error) {
              console.error(error.name, error.message);
            }
          }

          const { wasmFileAfter, error } = event.data;

          if (error) {
            const errorObject = new Error(error);
            fileNameLabel.classList.add('error');
            afterSizeLabel.classList.add('error');
            deltaSizeLabel.classList.add('error');
            mergeCheckbox.classList.add('error');
            mergeCheckbox.disabled = true;
            afterSizeLabel.textContent = errorObject.name;
            deltaSizeLabel.textContent = errorObject.message;
            reject(errorObject);
            return;
          }

          afterSizeLabel.textContent = prettyBytes(wasmFileAfter.size).replace(
            ' ',
            ' ',
          );
          const deltaSize = wasmFileAfter.size - wasmFileBefore.size;
          console.log(
            `File ${wasmFileBefore.name} processed → Before: ${wasmFileBefore.size} After: ${wasmFileAfter.size} Delta: ${deltaSize}`,
          );
          const deltaSizePercent = Math.abs(
            100 - (wasmFileAfter.size / wasmFileBefore.size) * 100,
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

          uuidToFile.set(uniqueId, {
            file: wasmFileAfter,
            handle: wasmFileBefore.handle,
            savings: deltaSize,
          });

          const savingsArray = [];
          for (const [uuid, { savings }] of uuidToFile.entries()) {
            if (uuid === MERGE_FILE_UUID) {
              continue;
            }
            savingsArray.push(savings);
          }
          const totalSavings = savingsArray.reduce(
            (sum, percentage) => sum + percentage,
            0,
          );
          const averageSavings = totalSavings / uuidToFile.size;
          totalSavingsSize.textContent = `Saved ${prettyBytes(
            Math.abs(totalSavings),
          ).replace(' ', ' ')} in total and ${prettyBytes(
            Math.abs(averageSavings),
          ).replace(' ', ' ')} per file on average`;

          if (deltaSize < 0) {
            if (
              supportsFileSystemAccess &&
              overwriteCheckbox.checked &&
              wasmFileBefore.handle
            ) {
              try {
                const writable = await wasmFileBefore.handle.createWritable();
                await writable.write(wasmFileAfter);
                await writable.close();
              } catch (error) {
                console.error(error.name, error.message);
              }
            }
          }

          if (
            supportsFileSystemObserver &&
            observeFileChangesCheckbox.checked &&
            wasmFileBefore.handle
          ) {
            const { getFileSystemChangeObserver } = await import(
              './file-system-observer.js'
            );
            const fileSystemChangeObserver = getFileSystemChangeObserver();
            fileSystemChangeObserver.observe(wasmFileBefore.handle);
            console.log(`File ${wasmFileBefore.name} → Observing changes`);
          }
          resolve();
        });
        wasmOptWorker.postMessage({ wasmFileBefore, uniqueId });
      });
    });
  }

  await limit(
    tasks,
    'hardwareConcurrency' in navigator
      ? Math.floor(navigator.hardwareConcurrency)
      : 4,
  );
};

export { optimizeWasmFiles, uuidToFile };
