import "./style.css";

import { fileOpen } from "browser-fs-access";
import prettyBytes from "pretty-bytes";
import { loadWasmButton, dropArea, resultsArea, statsTemplate } from "./dom.js";
import limit from "./limit.js";

const supportsFileSystemAccessAPI =
  "getAsFileSystemHandle" in DataTransferItem.prototype;

loadWasmButton.addEventListener("click", loadWasm);

const optimizeWasmFiles = async (wasmFiles) => {
  resultsArea.innerHTML = "";
  const tasks = [];

  for (const wasmFile of wasmFiles) {
    console.log("Running", wasmFile);
    const stats = statsTemplate.content.cloneNode(true);
    const fileName = stats.querySelector(".file-name");
    const beforeSize = stats.querySelector(".before-size");
    const afterSize = stats.querySelector(".after-size");
    const deltaSize = stats.querySelector(".delta-size");
    fileName.textContent = wasmFile.name;
    beforeSize.textContent = prettyBytes(wasmFile.size);
    resultsArea.append(stats);

    tasks.push(() => {
      return new Promise((resolve, reject) => {
        const worker = new Worker(new URL("./worker.js", import.meta.url), {
          type: "module",
        });
        console.log(worker);
        worker.addEventListener("message", (event) => {
          const { file } = event.data;
          console.log(file);
          afterSize.textContent = prettyBytes(file.size);
          const delta = file.size - wasmFile.size;
          deltaSize.textContent = prettyBytes(delta);
          if (delta < 0) {
            deltaSize.classList.add("size-smaller");
          } else if (delta >= 0) {
            deltaSize.classList.add("size-larger");
          }
          worker.close();
          resolve();
        });
        worker.postMessage({ wasmFile });
      });
    });
  }
  console.log(tasks);
  const results = await limit(tasks, Math.min(tasks.length, 3));
  console.log(results);
};

async function loadWasm() {
  const files = await fileOpen({
    mimeTypes: ["application/wasm"],
    extensions: [".wasm"],
    multiple: true,
  });
  if (!files || !files.length) {
    return;
  }
  optimizeWasmFiles(files);
}

dropArea.addEventListener("dragover", (e) => {
  e.preventDefault();
});

dropArea.addEventListener("dragenter", (e) => {
  dropArea.style.outline = "solid red 1px";
});

dropArea.addEventListener("dragleave", (e) => {
  dropArea.style.outline = "";
});

dropArea.addEventListener("drop", async (e) => {
  e.preventDefault();
  dropArea.style.outline = "";
  const fileHandlesPromises = [...e.dataTransfer.items]
    .filter((item) => item.kind === "file")
    .map((item) =>
      supportsFileSystemAccessAPI
        ? item.getAsFileSystemHandle()
        : item.getAsFile(),
    );
  const files = [];
  for await (const handle of fileHandlesPromises) {
    let file = handle;
    if (handle.kind === "file") {
      file = await handle.getFile();
    }
    if (file.type !== "application/wasm") {
      continue;
    }
    files.push(file);
  }
  optimizeWasmFiles(files);
});
