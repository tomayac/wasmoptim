import { fileSave } from 'browser-fs-access';
import { uuidToFile } from './wasm-opt.js';
import { showOrHideMergeButton } from './ui-merge.js';
import { resultsArea, selectAllCheckbox } from './dom.js';

resultsArea.addEventListener('click', async (e) => {
  const nodeName = e.target.nodeName.toLowerCase();
  if (nodeName === 'input' || nodeName === 'label') {
    if (
      e.target.classList.contains('error') ||
      e.target.classList.contains('processing')
    ) {
      return;
    }
    if (!e.target.checked) {
      selectAllCheckbox.checked = false;
    }
    showOrHideMergeButton();
    return;
  }
  if (nodeName !== 'a' && nodeName !== 'code') {
    return;
  }
  e.preventDefault();
  const fileNameLabel = e.target.closest('a');
  if (
    !fileNameLabel.classList.contains('file-name') ||
    fileNameLabel.classList.contains('error')
  ) {
    return;
  }
  if (fileNameLabel.classList.contains('processing')) {
    return;
  }
  const uuid = fileNameLabel.dataset.uuid;
  const { file, handle } = uuidToFile.get(uuid);
  try {
    await fileSave(file, {
      fileName: file.name,
      extensions: ['.wasm', '.wat'],
      mimeTypes: ['application/wasm'],
      existingHandle: handle ? handle : undefined,
      startIn: handle ? handle : undefined,
    });
  } catch (error) {
    if (error.name === 'AbortError') {
      return;
    }
    console.error(error.name, error.message);
  }
});
