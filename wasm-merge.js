import { mergeButton } from "./dom";

mergeButton.addEventListener('click', async () => {
});

const worker = new Worker(
  new URL('./merge-worker.js', import.meta.url, { type: 'module' }),
);
worker.addEventListener('message', async (event) => {
  worker.terminate();
});
