self.addEventListener("message",async r=>{const{default:s}=await import("./binaryen-P2Tsh51H.js"),{isBinaryFile:i}=await import("./index-5tyMNrCW.js"),{wasmFileBefore:t}=r.data;try{const e=await t.arrayBuffer();let a;i(e)?a=s.readBinary(new Uint8Array(e)):a=s.parseText(new TextDecoder().decode(e)),a.optimize();const n=new File([a.emitBinary()],t.name,{type:"application/wasm"});self.postMessage({wasmFileAfter:n})}catch(e){self.postMessage({error:e.message})}});