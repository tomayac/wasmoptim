import { mergeButton, resultsArea } from './dom';
import { uuidToFile } from './wasm-optimize';
import { optimizeWasmFiles } from './wasm-optimize';

mergeButton.addEventListener('click', async () => {
  const wasmFiles = [];
  resultsArea.querySelectorAll('input:checked').forEach((input) => {
    const uuid = input.closest('tr').querySelector('[data-uuid]').dataset.uuid;
    const { file } = uuidToFile.get(uuid);
    wasmFiles.push(file);
  });
  const worker = new Worker(new URL('./merge-worker.js', import.meta.url));

  worker.addEventListener('message', async (event) => {
    worker.terminate();
    if (event.data.error) {
      console.error(event.data.error);
      return;
    }
    const { file, error } = event.data;
    if (error) {
      console.error(error.name, error.message);
      return;
    }
    await optimizeWasmFiles([file]);
  });

  worker.postMessage({ wasmFiles });
});
