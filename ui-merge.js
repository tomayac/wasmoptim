import {
  mergeButton,
  mergeArea,
  resultsArea,
  selectAllCheckbox,
} from './dom.js';
import { uuidToFile } from './wasm-optimize.js';
import { fileSave } from 'browser-fs-access';

const showOrHideMergeButton = () => {
  const numInputsChecked = resultsArea.querySelectorAll(
    'input:checked:not(:disabled)',
  ).length;
  mergeButton.style.display = numInputsChecked < 2 ? 'none' : '';
};
showOrHideMergeButton();

selectAllCheckbox.addEventListener('click', () => {
  resultsArea.querySelectorAll('input:not(:disabled)').forEach((input) => {
    input.checked = selectAllCheckbox.checked;
  });
  showOrHideMergeButton();
});

mergeArea.addEventListener('click', async (e) => {
  const nodeName = e.target.nodeName.toLowerCase();
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
      extensions: ['.wasm'],
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

export { showOrHideMergeButton };
