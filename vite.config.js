/**
 * @type {import('vite').UserConfig}
 */

import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: 'docs',
    target: "esnext",
  },
  worker: {
    format: "es",
  },
});
