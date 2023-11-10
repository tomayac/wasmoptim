if ('serviceWorker' in navigator)
  navigator.serviceWorker.register('/wasm-clamp/dev-sw.js?dev-sw', {
    scope: '/wasm-clamp/',
    type: 'classic',
  });
