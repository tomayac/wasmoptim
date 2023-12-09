import { supported as supportsFileSystemAccess } from 'browser-fs-access';
import './ui-examples.js';
import './ui-load.js';
import './ui-clipboard.js';
import './ui-drag-drop.js';
import './ui-optimize.js';
import './ui-merge.js';
import './ui-other.js';
import './wasm-optimize.js';
import './wasm-merge.js';
import './stats.js';

const supportsFileHandleDragAndDrop =
  'getAsFileSystemHandle' in DataTransferItem.prototype;
const supportsFileSystemObserver = 'FileSystemObserver' in window;
const supportsGetUniqueId =
  'FileSystemHandle' in window && 'getUniqueId' in FileSystemHandle.prototype;
const supportsBadging = 'setAppBadge' in navigator;

(async () => {
  if (supportsFileSystemAccess) {
    import('./file-system.js');
  }

  if (supportsFileSystemObserver) {
    import('./file-system-observer.js');
  }

  if ('launchQueue' in window && 'files' in LaunchParams.prototype) {
    import('./file-handling.js');
  }

  if ('serviceWorker' in navigator) {
    const { registerSW } = await import('virtual:pwa-register');
    const updateSW = registerSW({
      onOfflineReady() {
        console.log('Ready to work offline');
      },
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

export {
  supportsFileHandleDragAndDrop,
  supportsFileSystemAccess,
  supportsFileSystemObserver,
  supportsGetUniqueId,
  supportsBadging,
};
