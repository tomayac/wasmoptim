const loadWasmButton = document.querySelector('#load-wasm');
const loadDirectoryButton = document.querySelector('#load-directory');
const dropArea = document.querySelector('#drop-area');
const resultsArea = document.querySelector('#results-area');
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
  loadDirectoryButton,
  dropArea,
  resultsArea,
  statsTemplate,
  exampleTemplate,
  statsHeader,
  selectAllCheckbox,
  overwriteCheckbox,
  observeChangesCheckbox,
  examplesList,
};
