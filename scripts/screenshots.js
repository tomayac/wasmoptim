import captureWebsite from 'capture-website';
import terminalImage from 'terminal-image';

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
  console.log(
    'Captured screenshot-desktop-light.png\n\n',
    await terminalImage.file('./public/screenshot-desktop-light.png', {
      width: 50,
    }),
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
  console.log(
    'Captured screenshot-desktop-dark.png\n\n',
    await terminalImage.file('./public/screenshot-desktop-dark.png', {
      width: 50,
    }),
  );
  await captureWebsite.file(
    'http://localhost:5173/wasmoptim/',
    'public/screenshot-mobile-light.png',
    {
      ...options,
      emulateDevice: 'iPhone X',
    },
  );
  console.log(
    'Captured screenshot-mobile-light.png\n\n',
    await terminalImage.file('./public/screenshot-mobile-light.png', {
      width: 50,
    }),
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
  console.log(
    'Captured screenshot-mobile-dark.png\n\n',
    await terminalImage.file('./public/screenshot-mobile-dark.png', {
      width: 50,
    }),
  );
})();
