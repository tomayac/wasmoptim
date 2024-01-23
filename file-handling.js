import { checkAndPossiblyAskForPermissions } from './file-system.js';
import { overwriteCheckbox } from './dom.js';
import { supportsFileSystemAccess } from './main.js';
import { optimizeWasmFiles } from './wasm-opt.js';

launchQueue.setConsumer(async (launchParams) => {
  if (!launchParams.files.length) {
    return;
  }

  const wasmFilesBefore = [];
  for (const handle of launchParams.files) {
    const file = await handle.getFile();
    file.handle = handle;
    if (
      (file.type && file.type !== 'application/wasm') ||
      (!file.name.endsWith('.wasm') && !file.name.endsWith('.wat'))
    ) {
      continue;
    }
    wasmFilesBefore.push(file);
  }
  if (supportsFileSystemAccess && overwriteCheckbox.checked) {
    await checkAndPossiblyAskForPermissions(wasmFilesBefore);
  }
  await optimizeWasmFiles(wasmFilesBefore);
});
