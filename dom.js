const loadWasmButton = document.querySelector('#load-wasm');
const mergeButton = document.querySelector('#merge-button');
const mergeArea = document.querySelector('#merge-area');
const loadDirectoryButton = document.querySelector('#load-directory');
const dropArea = document.querySelector('#drop-area');
const resultsArea = document.querySelector('#results-area');
const totalSavingsSize = document.querySelector('#total-delta-size');
const statsTemplate = document.querySelector('#stats-template');
const exampleTemplate = document.querySelector('#example-template');
const statsHeader = document.querySelector('#stats-header');
const selectAllCheckbox = document.querySelector('#select-all-checkbox');
const overwriteCheckbox = document.querySelector('#overwrite-checkbox');
const observeFileChangesCheckbox = document.querySelector(
  '#observe-file-changes-checkbox',
);
const observeDirectoryChangesCheckbox = document.querySelector(
  '#observe-directory-changes-checkbox',
);
const examplesList = document.querySelector('#examples-list');
const metaThemeColor = document.querySelector('meta[name=theme-color]');
const statsFiles = document.querySelector('#stats-files');
const statsSize = document.querySelector('#stats-size');
const statsPercent = document.querySelector('#stats-percent');

export {
  loadWasmButton,
  mergeButton,
  mergeArea,
  loadDirectoryButton,
  dropArea,
  resultsArea,
  totalSavingsSize,
  statsTemplate,
  exampleTemplate,
  statsHeader,
  selectAllCheckbox,
  overwriteCheckbox,
  observeFileChangesCheckbox,
  observeDirectoryChangesCheckbox,
  examplesList,
  metaThemeColor,
  statsFiles,
  statsSize,
  statsPercent,
};
