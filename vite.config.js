/**
 * @type {import('vite').UserConfig}
 */

import { defineConfig } from 'vite';
import dynamicImportVars from '@rollup/plugin-dynamic-import-vars';
import { VitePWA as vitePWA } from 'vite-plugin-pwa';
import webmanifest from './manifest.json';

export default defineConfig({
  plugins: [
    dynamicImportVars({
      include: ['./third-party/*'],
    }),
    vitePWA({
      devOptions: {
        enabled: true,
      },
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      manifest: webmanifest,
    }),
  ],
  base: '/wasm-clamp/',
  build: {
    outDir: 'docs',
    target: 'esnext',
  },
  worker: {
    format: 'es',
  },
});
