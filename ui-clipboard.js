import { optimizeWasmFiles } from './wasm-opt.js';

document.addEventListener('paste', async (e) => {
  try {
    if (!e.clipboardData.files.length) {
      return;
    }
    const wasmFilesBefore = Array.from(e.clipboardData.files).filter(
      (file) =>
        file.type === 'application/wasm' ||
        file.name.endsWith('.wasm') ||
        file.name.endsWith('.wat'),
    );
    await optimizeWasmFiles(wasmFilesBefore);
  } catch (error) {
    console.error(error.name, error.message);
  }
});
