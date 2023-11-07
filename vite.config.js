/**
 * @type {import('vite').UserConfig}
 */

import { defineConfig } from 'vite';
import dynamicImportVars from '@rollup/plugin-dynamic-import-vars';

export default defineConfig({
  plugins: [
    dynamicImportVars({
      include: ['./third_party/*'],
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
