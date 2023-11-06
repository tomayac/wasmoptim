import binaryen from "binaryen/index.js";

self.addEventListener("message", async (event) => {
  console.log(event.data);
  const { wasmFile } = event.data;
  const wasmBuffer = await wasmFile.arrayBuffer();
  const module = binaryen.readBinary(new Uint8Array(wasmBuffer));
  module.optimize();
  const result = module.emitBinary();
  const file = new File([result], wasmFile.name, { type: "application/wasm" });
  self.postMessage({ file });
});
