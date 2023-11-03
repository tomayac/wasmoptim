import "./style.css";

import { fileOpen } from "browser-fs-access";
import prettyBytes from "pretty-bytes";
import { loadWasmButton, beforeSize, afterSize, deltaSize } from "./dom";

const worker = new Worker(new URL('./worker.js', import.meta.url), {
  type: 'module',
})

worker.addEventListener("message", (event) => {
  const { file, beforeSize } = event.data;
  console.log(file);
  afterSize.textContent = prettyBytes(file.size);
  const delta = file.size-beforeSize;
  deltaSize.textContent = prettyBytes(delta);
  deltaSize.classList.remove("size-smaller");
  deltaSize.classList.remove("size-larger");
  if (delta < 0) {
    deltaSize.classList.add("size-smaller");
  } else if (delta >= 0) {
    deltaSize.classList.add("size-larger");
  }
});

loadWasmButton.addEventListener("click", loadWasm);

async function loadWasm() {
  const file = await fileOpen({
    mimeTypes: ["application/wasm"],
    extensions: [".wasm"],
  });
  console.log(file);
  beforeSize.textContent = prettyBytes(file.size);
  worker.postMessage({ file }, );
}
