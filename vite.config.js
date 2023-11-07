/**
 * @type {import('vite').UserConfig}
 */

import { defineConfig } from 'vite';
import dynamicImportVars from '@rollup/plugin-dynamic-import-vars';

export default defineConfig({
  plugins: [
    dynamicImportVars({
      include: ['node_modules/binaryen/**/*'],
    }),
  ],
  build: {
    outDir: 'docs',
    target: 'esnext',
    base: '/wasm-opt/',
  },
  worker: {
    format: 'es',
  },
});
