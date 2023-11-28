import captureWebsite from 'capture-website';

const options = {
  launchOptions: {
    headless: 'new',
  },
  overwrite: true,
};

(async () => {
  await captureWebsite.file(
    'http://localhost:5173/wasmoptim/',
    'public/screenshot-desktop-light.png',
    {
      ...options,
      fullPage: true,
    },
  );
  await captureWebsite.file(
    'http://localhost:5173/wasmoptim/',
    'public/screenshot-desktop-dark.png',
    {
      ...options,
      fullPage: true,
      darkMode: true,
    },
  );
  await captureWebsite.file(
    'http://localhost:5173/wasmoptim/',
    'public/screenshot-mobile-light.png',
    {
      ...options,
      emulateDevice: 'iPhone X',
    },
  );
  await captureWebsite.file(
    'http://localhost:5173/wasmoptim/',
    'public/screenshot-mobile-dark.png',
    {
      ...options,
      emulateDevice: 'iPhone X',
      darkMode: true,
    },
  );
})();
