import '/style.css';
import { supported as supportsFileSystemAccess } from 'browser-fs-access';
import './ui.js';
import './wasm-optimize.js';

const supportsFileHandleDragAndDrop =
  'getAsFileSystemHandle' in DataTransferItem.prototype;
const supportsFileSystemObserver = 'FileSystemObserver' in window;

(async () => {
  if (supportsFileSystemObserver) {
    import('./file-system-change-observer.js');
  }

  if (supportsFileHandleDragAndDrop && supportsFileSystemAccess) {
    import('./file-handle-drag-and-drop.js');
  }

  if ('launchQueue' in window && 'files' in LaunchParams.prototype) {
    import('./file-handling.js');
  }

  if ('serviceWorker' in navigator) {
    const { registerSW } = await import('virtual:pwa-register');
    const updateSW = registerSW({
      onOfflineReady() {},
      onNeedRefresh() {
        location.reload();
      },
    });
    updateSW();

    import('./web-share-target.js');
  }
})();

export { supportsFileHandleDragAndDrop, supportsFileSystemObserver };
