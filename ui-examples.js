import spinner from '/spinner.svg';
import { examplesList, exampleTemplate } from './dom.js';
import { optimizeWasmFiles } from './wasm-opt.js';

const EXAMPLE_URLS = [
  // 'https://unpkg.com/canvaskit-wasm@0.39.1/bin/canvaskit.wasm',
  'https://unpkg.com/zxing-wasm@1.0.0-rc.4/dist/full/zxing_full.wasm',
  'https://unpkg.com/@sqlite.org/sqlite-wasm@3.44.0-build1/sqlite-wasm/jswasm/sqlite3.wasm',
  // 'https://unpkg.com/@tensorflow/tfjs-backend-wasm@4.13.0/wasm-out/tfjs-backend-wasm.wasm',
  '/third-party/wasm-opt.wasm',
  '/third-party/wasm-merge.wasm',
];

const SEMVER_REGEX =
  /@(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?/;

EXAMPLE_URLS.forEach((url) => {
  const example = exampleTemplate.content.cloneNode(true);
  const code = example.querySelector('code');
  const anchor = example.querySelector('a');
  code.textContent = url
    .replace('https://unpkg.com/', '')
    .replace(SEMVER_REGEX, '');
  anchor.href = url;
  examplesList.append(example);
});

examplesList.addEventListener('click', async (e) => {
  const nodeName = e.target.nodeName.toLowerCase();
  if (nodeName !== 'a' && nodeName !== 'code') {
    return;
  }

  e.preventDefault();

  const anchor = e.target.closest('a');
  const wasmFileURL = anchor.href;
  const downloading = anchor.parentNode.querySelector('.downloading');
  downloading.textContent = 'Downloading…';
  downloading.classList.remove('error');
  downloading.hidden = false;
  const spinnerImg = anchor.parentNode.querySelector('img');
  spinnerImg.src = spinner;

  try {
    const wasmBlobBefore = await fetch(wasmFileURL).then((response) =>
      response.blob(),
    );
    spinnerImg.removeAttribute('src');
    downloading.hidden = true;
    const wasmFileBefore = new File(
      [wasmBlobBefore],
      wasmFileURL.split('/').pop(),
      {
        type: 'application/wasm',
      },
    );
    wasmFileBefore.handle = false;
    await optimizeWasmFiles([wasmFileBefore]);
  } catch (error) {
    console.error(error.name, error.message);
    spinnerImg.removeAttribute('src');
    downloading.classList.add('error');
    downloading.textContent = error.message;
  }
});
