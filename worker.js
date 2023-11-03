import binaryen from "binaryen/index.js";

self.addEventListener("message", async (event) => {
  console.log(event, 'sds');
  let { file } = event.data;
  const buffer = await file.arrayBuffer();
  const module = binaryen.readBinary(new Uint8Array(buffer));
  module.optimize();
  const result = module.emitBinary();
  const beforeSize = file.size;
  file = new File([result], file.name, { type: "application/wasm" });
  self.postMessage({ file, beforeSize });
});
