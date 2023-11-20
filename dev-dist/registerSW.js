if ('serviceWorker' in navigator)
  navigator.serviceWorker.register('/wasmoptim/dev-sw.js?dev-sw', {
    scope: '/wasmoptim/',
    type: 'classic',
  });
