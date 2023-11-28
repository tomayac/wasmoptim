import '/style.css';
import './ui.js';
import './wasm-optimize.js';
import './wasm-merge.js';
import './stats.js';

const supportsFileHandleDragAndDrop =
  'getAsFileSystemHandle' in DataTransferItem.prototype;
const supportsFileSystemObserver = 'FileSystemObserver' in window;

(async () => {
  if (supportsFileSystemObserver) {
    import('./file-system-observer.js');
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

    if ('share' in navigator) {
      import('./web-share-target.js');
    }
  }
})();

export { supportsFileHandleDragAndDrop, supportsFileSystemObserver };
