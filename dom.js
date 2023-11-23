const loadWasmButton = document.querySelector('#load-wasm');
const mergeButton = document.querySelector('#merge-button');
const mergedFileLink = document.querySelector('#merged-file-link');
const mergedFileStatus = document.querySelector('#merged-file-status');
const loadDirectoryButton = document.querySelector('#load-directory');
const dropArea = document.querySelector('#drop-area');
const resultsArea = document.querySelector('#results-area');
const totalSavingsSize = document.querySelector('#total-delta-size');
const statsTemplate = document.querySelector('#stats-template');
const exampleTemplate = document.querySelector('#example-template');
const statsHeader = document.querySelector('#stats-header');
const selectAllCheckbox = document.querySelector('#select-all-checkbox');
const overwriteCheckbox = document.querySelector('#overwrite-checkbox');
const observeChangesCheckbox = document.querySelector(
  '#observe-changes-checkbox',
);
const examplesList = document.querySelector('#examples-list');

export {
  loadWasmButton,
  mergeButton,
  mergedFileLink,
  mergedFileStatus,
  loadDirectoryButton,
  dropArea,
  resultsArea,
  totalSavingsSize,
  statsTemplate,
  exampleTemplate,
  statsHeader,
  selectAllCheckbox,
  overwriteCheckbox,
  observeChangesCheckbox,
  examplesList,
};
