import prettyBytes from 'pretty-bytes';
import spinner from '/spinner.svg';
import {
  supportsFileHandleDragAndDrop,
  supportsFileSystemObserver,
} from './main.js';
import { supported as supportsFileSystemAccess } from 'browser-fs-access';
import { supportsGetUniqueId } from './file-system.js';
import {
  statsTemplate,
  statsHeader,
  resultsArea,
  observeChangesCheckbox,
  overwriteCheckbox,
  totalSavingsSize,
  selectAllCheckbox,
} from './dom.js';
import { MERGE_FILE_UUID } from './wasm-merge.js';
import { limit } from './util.js';

const supportsBadging = 'setAppBadge' in navigator;

const uuidToFile = new Map();

let currentlyProcessing = 0;

const optimizeWasmFiles = async (wasmFilesBefore, isMergedFile = false) => {
  statsHeader.hidden = false;
  resultsArea.closest('table').hidden = false;
  const tasks = [];

  for (const wasmFileBefore of wasmFilesBefore) {
    const uniqueId =
      supportsGetUniqueId && wasmFileBefore.handle
        ? await wasmFileBefore.handle.getUniqueId()
        : wasmFileBefore.name;
    let fileNameLabel;
    let beforeSizeLabel;
    let afterSizeLabel;
    let deltaSizeLabel;
    let spinnerImg;
    let mergeCheckbox;
    const existingFileName = resultsArea.querySelector(
      `[data-uuid="${uniqueId}"]`,
    );
    if (existingFileName) {
      const statsRow = existingFileName.closest('tr');
      fileNameLabel = statsRow.querySelector('.file-name');
      beforeSizeLabel = statsRow.querySelector('.before-size');
      afterSizeLabel = statsRow.querySelector('.after-size');
      deltaSizeLabel = statsRow.querySelector('.delta-size');
      spinnerImg = statsRow.querySelector('.spinner');
      mergeCheckbox = statsRow.querySelector('.merge-checkbox');
    } else {
      const stats = statsTemplate.content.cloneNode(true);
      fileNameLabel = stats.querySelector('.file-name');
      beforeSizeLabel = stats.querySelector('.before-size');
      afterSizeLabel = stats.querySelector('.after-size');
      deltaSizeLabel = stats.querySelector('.delta-size');
      spinnerImg = stats.querySelector('.spinner');
      mergeCheckbox = stats.querySelector('.merge-checkbox');
      resultsArea.append(stats);
      const twoFilesOrMore = resultsArea.querySelectorAll('tr').length > 1;
      selectAllCheckbox.closest('th').style.display = twoFilesOrMore
        ? ''
        : 'none';
      resultsArea.querySelectorAll('input').forEach((input) => {
        input.closest('td').style.display = twoFilesOrMore ? '' : 'none';
      });
    }
    spinnerImg.src = spinner;
    deltaSizeLabel.textContent = 'Optimizing…';
    deltaSizeLabel.classList.remove('size-smaller');
    deltaSizeLabel.classList.remove('size-larger');
    fileNameLabel.querySelector('code').textContent = wasmFileBefore.name;
    fileNameLabel.classList.add('processing');
    mergeCheckbox.classList.add('processing');
    mergeCheckbox.disabled = true;
    if (supportsBadging) {
      navigator.setAppBadge(++currentlyProcessing);
    }
    beforeSizeLabel.textContent = prettyBytes(wasmFileBefore.size);
    fileNameLabel.dataset.uuid = uniqueId;

    tasks.push(() => {
      return new Promise((resolve, reject) => {
        const worker = new Worker(
          new URL('./binaryen-worker.js', import.meta.url),
        );
        worker.addEventListener('message', async (event) => {
          worker.terminate();
          spinnerImg.removeAttribute('src');
          fileNameLabel.classList.remove('processing');
          mergeCheckbox.classList.remove('processing');
          mergeCheckbox.disabled = false;
          if (supportsBadging) {
            navigator.setAppBadge(--currentlyProcessing);
            if (currentlyProcessing === 0) {
              navigator.clearAppBadge();
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
          afterSizeLabel.textContent = prettyBytes(wasmFileAfter.size);
          const deltaSize = wasmFileAfter.size - wasmFileBefore.size;
          console.log(
            `${wasmFileBefore.name} processed → Before: ${wasmFileBefore.size} After: ${wasmFileAfter.size} Delta: ${deltaSize}`,
          );
          const deltaSizePercent = Math.abs(
            100 - (wasmFileAfter.size / wasmFileBefore.size) * 100,
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
          )} in total and ${prettyBytes(
            Math.abs(averageSavings),
          )} per file on average`;
          if (deltaSize < 0) {
            if (
              supportsFileHandleDragAndDrop &&
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
            observeChangesCheckbox.checked &&
            wasmFileBefore.handle
          ) {
            const { getFileSystemChangeObserver } = await import(
              './file-system-observer.js'
            );
            const fileSystemChangeObserver = getFileSystemChangeObserver();
            fileSystemChangeObserver.observe(wasmFileBefore.handle);
            console.log(`${wasmFileBefore.name} → Observing changes`);
          }
          resolve();
        });
        worker.postMessage({ wasmFileBefore });
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
