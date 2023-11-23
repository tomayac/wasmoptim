import spinner from '/spinner.svg';
import {
  mergeButton,
  mergedFileLink,
  mergedFileStatus,
  resultsArea,
} from './dom';
import { uuidToFile } from './wasm-optimize';
import prettyBytes from 'pretty-bytes';

mergeButton.addEventListener('click', async () => {
  mergedFileLink.hidden = true;
  const spinnerImg = mergedFileStatus.querySelector('.spinner');
  spinnerImg.src = spinner;
  const statusMessage = mergedFileStatus.querySelector('.status-message');
  statusMessage.classList.remove('error');
  statusMessage.textContent = 'Merging…';
  const wasmFiles = [];
  resultsArea.querySelectorAll('input:checked').forEach((input) => {
    const uuid = input.closest('tr').querySelector('[data-uuid]').dataset.uuid;
    const { file } = uuidToFile.get(uuid);
    wasmFiles.push(file);
  });
  const worker = new Worker(new URL('./merge-worker.js', import.meta.url), {
    type: 'module',
  });

  worker.addEventListener('message', async (event) => {
    if (event.data.status) {
      statusMessage.textContent = 'Optimizing…';
      return;
    }
    worker.terminate();
    const { file, error } = event.data;
    spinnerImg.removeAttribute('src');
    if (error) {
      statusMessage.classList.add('error');
      statusMessage.textContent = error;
      return;
    }
    mergedFileLink.hidden = false;
    mergedFileLink.querySelector('code').textContent = file.name;
    statusMessage.textContent = `Merged (${prettyBytes(file.size)})`;
  });

  worker.postMessage({ wasmFiles });
});
