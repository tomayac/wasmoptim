(function(){const r=document.createElement("link").relList;if(r&&r.supports&&r.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))s(o);new MutationObserver(o=>{for(const n of o)if(n.type==="childList")for(const a of n.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&s(a)}).observe(document,{childList:!0,subtree:!0});function t(o){const n={};return o.integrity&&(n.integrity=o.integrity),o.referrerPolicy&&(n.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?n.credentials="include":o.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function s(o){if(o.ep)return;o.ep=!0;const n=t(o);fetch(o.href,n)}})();const ee="modulepreload",te=function(e){return"/wasmoptim/"+e},$={},w=function(r,t,s){if(!t||t.length===0)return r();const o=document.getElementsByTagName("link");return Promise.all(t.map(n=>{if(n=te(n),n in $)return;$[n]=!0;const a=n.endsWith(".css"),i=a?'[rel="stylesheet"]':"";if(!!s)for(let u=o.length-1;u>=0;u--){const d=o[u];if(d.href===n&&(!a||d.rel==="stylesheet"))return}else if(document.querySelector(`link[href="${n}"]${i}`))return;const l=document.createElement("link");if(l.rel=a?"stylesheet":ee,a||(l.as="script",l.crossOrigin=""),l.href=n,document.head.appendChild(l),a)return new Promise((u,d)=>{l.addEventListener("load",u),l.addEventListener("error",()=>d(new Error(`Unable to preload CSS for ${n}`)))})})).then(()=>r()).catch(n=>{const a=new Event("vite:preloadError",{cancelable:!0});if(a.payload=n,window.dispatchEvent(a),!a.defaultPrevented)throw n})},O="/wasmoptim/spinner.svg",re=document.querySelector("#load-wasm"),j=document.querySelector("#merge-button"),S=document.querySelector("#merge-area"),ne=document.querySelector("#load-directory"),C=document.querySelector("#drop-area"),g=document.querySelector("#results-area"),se=document.querySelector("#total-delta-size"),ae=document.querySelector("#stats-template"),oe=document.querySelector("#example-template"),ie=document.querySelector("#stats-header"),q=document.querySelector("#select-all-checkbox"),B=document.querySelector("#overwrite-checkbox"),ce=document.querySelector("#observe-file-changes-checkbox"),H=document.querySelector("#observe-directory-changes-checkbox"),V=document.querySelector("#examples-list"),M=document.querySelector("meta[name=theme-color]"),le=document.querySelector("#stats-files"),de=document.querySelector("#stats-size"),ue=document.querySelector("#stats-percent"),me=["B","kB","MB","GB","TB","PB","EB","ZB","YB"],fe=["B","KiB","MiB","GiB","TiB","PiB","EiB","ZiB","YiB"],pe=["b","kbit","Mbit","Gbit","Tbit","Pbit","Ebit","Zbit","Ybit"],ye=["b","kibit","Mibit","Gibit","Tibit","Pibit","Eibit","Zibit","Yibit"],U=(e,r,t)=>{let s=e;return typeof r=="string"||Array.isArray(r)?s=e.toLocaleString(r,t):(r===!0||t!==void 0)&&(s=e.toLocaleString(void 0,t)),s};function v(e,r){if(!Number.isFinite(e))throw new TypeError(`Expected a finite number, got ${typeof e}: ${e}`);r={bits:!1,binary:!1,space:!0,...r};const t=r.bits?r.binary?ye:pe:r.binary?fe:me,s=r.space?" ":"";if(r.signed&&e===0)return` 0${s}${t[0]}`;const o=e<0,n=o?"-":r.signed?"+":"";o&&(e=-e);let a;if(r.minimumFractionDigits!==void 0&&(a={minimumFractionDigits:r.minimumFractionDigits}),r.maximumFractionDigits!==void 0&&(a={maximumFractionDigits:r.maximumFractionDigits,...a}),e<1){const u=U(e,r.locale,a);return n+u+s+t[0]}const i=Math.min(Math.floor(r.binary?Math.log(e)/Math.log(1024):Math.log10(e)/3),t.length-1);e/=(r.binary?1024:1e3)**i,a||(e=e.toPrecision(3));const c=U(Number(e),r.locale,a),l=t[i];return n+c+s+l}const b=(()=>{if(typeof self>"u")return!1;if("top"in self&&self!==top)try{top.window.document._=0}catch{return!1}return"showOpenFilePicker"in self})(),he=b?Promise.resolve().then(function(){return Ee}):Promise.resolve().then(function(){return qe});async function we(...e){return(await he).default(...e)}const ge=b?Promise.resolve().then(function(){return ke}):Promise.resolve().then(function(){return Fe});async function ve(...e){return(await ge).default(...e)}const be=b?Promise.resolve().then(function(){return Pe}):Promise.resolve().then(function(){return Oe});async function Z(...e){return(await be).default(...e)}const Se=async e=>{const r=await e.getFile();return r.handle=e,r};var Le=async(e=[{}])=>{Array.isArray(e)||(e=[e]);const r=[];e.forEach((o,n)=>{r[n]={description:o.description||"Files",accept:{}},o.mimeTypes?o.mimeTypes.map(a=>{r[n].accept[a]=o.extensions||[]}):r[n].accept["*/*"]=o.extensions||[]});const t=await window.showOpenFilePicker({id:e[0].id,startIn:e[0].startIn,types:r,multiple:e[0].multiple||!1,excludeAcceptAllOption:e[0].excludeAcceptAllOption||!1}),s=await Promise.all(t.map(Se));return e[0].multiple?s:s[0]},Ee={__proto__:null,default:Le};function x(e){function r(t){if(Object(t)!==t)return Promise.reject(new TypeError(t+" is not an object."));var s=t.done;return Promise.resolve(t.value).then(function(o){return{value:o,done:s}})}return x=function(t){this.s=t,this.n=t.next},x.prototype={s:null,n:null,next:function(){return r(this.n.apply(this.s,arguments))},return:function(t){var s=this.s.return;return s===void 0?Promise.resolve({value:t,done:!0}):r(s.apply(this.s,arguments))},throw:function(t){var s=this.s.return;return s===void 0?Promise.reject(t):r(s.apply(this.s,arguments))}},new x(e)}const G=async(e,r,t=e.name,s)=>{const o=[],n=[];var a,i=!1,c=!1;try{for(var l,u=function(d){var m,f,y,h=2;for(typeof Symbol<"u"&&(f=Symbol.asyncIterator,y=Symbol.iterator);h--;){if(f&&(m=d[f])!=null)return m.call(d);if(y&&(m=d[y])!=null)return new x(m.call(d));f="@@asyncIterator",y="@@iterator"}throw new TypeError("Object is not async iterable")}(e.values());i=!(l=await u.next()).done;i=!1){const d=l.value,m=`${t}/${d.name}`;d.kind==="file"?n.push(d.getFile().then(f=>(f.directoryHandle=e,f.handle=d,Object.defineProperty(f,"webkitRelativePath",{configurable:!0,enumerable:!0,get:()=>m})))):d.kind!=="directory"||!r||s&&s(d)||o.push(G(d,r,m,s))}}catch(d){c=!0,a=d}finally{try{i&&u.return!=null&&await u.return()}finally{if(c)throw a}}return[...(await Promise.all(o)).flat(),...await Promise.all(n)]};var _e=async(e={})=>{e.recursive=e.recursive||!1,e.mode=e.mode||"read";const r=await window.showDirectoryPicker({id:e.id,startIn:e.startIn,mode:e.mode});return(await(await r.values()).next()).done?[r]:G(r,e.recursive,void 0,e.skipDirectory)},ke={__proto__:null,default:_e},Ae=async(e,r=[{}],t=null,s=!1,o=null)=>{Array.isArray(r)||(r=[r]),r[0].fileName=r[0].fileName||"Untitled";const n=[];let a=null;if(e instanceof Blob&&e.type?a=e.type:e.headers&&e.headers.get("content-type")&&(a=e.headers.get("content-type")),r.forEach((l,u)=>{n[u]={description:l.description||"Files",accept:{}},l.mimeTypes?(u===0&&a&&l.mimeTypes.push(a),l.mimeTypes.map(d=>{n[u].accept[d]=l.extensions||[]})):a?n[u].accept[a]=l.extensions||[]:n[u].accept["*/*"]=l.extensions||[]}),t)try{await t.getFile()}catch(l){if(t=null,s)throw l}const i=t||await window.showSaveFilePicker({suggestedName:r[0].fileName,id:r[0].id,startIn:r[0].startIn,types:n,excludeAcceptAllOption:r[0].excludeAcceptAllOption||!1});!t&&o&&o(i);const c=await i.createWritable();return"stream"in e?(await e.stream().pipeTo(c),i):"body"in e?(await e.body.pipeTo(c),i):(await c.write(await e),await c.close(),i)},Pe={__proto__:null,default:Ae},xe=async(e=[{}])=>(Array.isArray(e)||(e=[e]),new Promise((r,t)=>{const s=document.createElement("input");s.type="file";const o=[...e.map(c=>c.mimeTypes||[]),...e.map(c=>c.extensions||[])].join();s.multiple=e[0].multiple||!1,s.accept=o||"",s.style.display="none",document.body.append(s);const n=c=>{typeof a=="function"&&a(),r(c)},a=e[0].legacySetup&&e[0].legacySetup(n,()=>a(t),s),i=()=>{window.removeEventListener("focus",i),s.remove()};s.addEventListener("click",()=>{window.addEventListener("focus",i)}),s.addEventListener("change",()=>{window.removeEventListener("focus",i),s.remove(),n(s.multiple?Array.from(s.files):s.files[0])}),"showPicker"in HTMLInputElement.prototype?s.showPicker():s.click()})),qe={__proto__:null,default:xe},ze=async(e=[{}])=>(Array.isArray(e)||(e=[e]),e[0].recursive=e[0].recursive||!1,new Promise((r,t)=>{const s=document.createElement("input");s.type="file",s.webkitdirectory=!0;const o=a=>{typeof n=="function"&&n(),r(a)},n=e[0].legacySetup&&e[0].legacySetup(o,()=>n(t),s);s.addEventListener("change",()=>{let a=Array.from(s.files);e[0].recursive?e[0].recursive&&e[0].skipDirectory&&(a=a.filter(i=>i.webkitRelativePath.split("/").every(c=>!e[0].skipDirectory({name:c,kind:"directory"})))):a=a.filter(i=>i.webkitRelativePath.split("/").length===2),o(a)}),"showPicker"in HTMLInputElement.prototype?s.showPicker():s.click()})),Fe={__proto__:null,default:ze},Te=async(e,r={})=>{Array.isArray(r)&&(r=r[0]);const t=document.createElement("a");let s=e;"body"in e&&(s=await async function(a,i){const c=a.getReader(),l=new ReadableStream({start:m=>async function f(){return c.read().then(({done:y,value:h})=>{if(!y)return m.enqueue(h),f();m.close()})}()}),u=new Response(l),d=await u.blob();return c.releaseLock(),new Blob([d],{type:i})}(e.body,e.headers.get("content-type"))),t.download=r.fileName||"Untitled",t.href=URL.createObjectURL(await s);const o=()=>{typeof n=="function"&&n()},n=r.legacySetup&&r.legacySetup(o,()=>n(),t);return t.addEventListener("click",()=>{setTimeout(()=>URL.revokeObjectURL(t.href),3e4),o()}),t.click(),null},Oe={__proto__:null,default:Te};const T=crypto.randomUUID();j.addEventListener("click",async()=>{const e=S.querySelector(".file-name"),r=S.querySelector(".before-size"),t=S.querySelector(".after-size"),s=S.querySelector(".delta-size"),o=S.querySelector(".spinner");e.hidden=!0,e.dataset.uuid=T,S.hidden=!1,o.src=O,t.textContent="",s.textContent="Merging…",s.classList.remove("size-smaller"),s.classList.remove("size-larger"),s.classList.remove("error"),t.classList.remove("error");const n=[],a=[];g.querySelectorAll("input:checked:not(:disabled)").forEach(l=>{const u=l.closest("tr").querySelector("[data-uuid]").dataset.uuid,{file:d}=L.get(u);n.push(d),a.push(u)});const i=n.reduce((l,u)=>l+u.size,0);r.textContent=`Σ ${v(i)}`;const c=new Worker(new URL("/wasmoptim/assets/merge-worker-lJbWb-t6.js",import.meta.url),{type:"module"});c.addEventListener("message",async l=>{if(l.data.status){s.textContent="Optimizing…";return}c.terminate(),o.removeAttribute("src");const{file:u,error:d}=l.data;if(d){const y=new Error(d);t.classList.add("error"),s.classList.add("error"),t.textContent=y.name,s.textContent=y.message;return}e.hidden=!1,e.querySelector("code").textContent=u.name,t.textContent=v(u.size);const m=u.size-i;console.log(`Files ${new Intl.ListFormat("en",{style:"long",type:"conjunction"}).format(n.map(y=>y.name))} merged → Before Σ: ${i} After: ${u.size} Delta: ${m}`);const f=Math.abs(100-u.size/i*100).toFixed(2);s.textContent=Number(f)===0?"no change":`${f}% ${m<0?"smaller":"larger"} (${v(Math.abs(m))})`,s.classList.add(Number(f)===0?"size-larger":m<0?"size-smaller":"size-larger"),L.set(T,{file:u})}),c.postMessage({wasmFiles:n,uuids:a})});const Ce=async(e,r)=>{const t=[],s=async n=>{for(const[a,i]of n)try{t[a]=await i()}catch(c){t[a]=new Error(`Failed with: ${c.message}`)}},o=new Array(r).fill(e.entries()).map(s);return await Promise.allSettled(o),t},$e=(e,r)=>{let t;return function(...o){const n=()=>{clearTimeout(t),e(...o)};clearTimeout(t),t=setTimeout(n,r)}},Y="https://wasmoptim-stats.glitch.me",J={"Content-Type":"application/json"},Be=async(e,r)=>{try{const t=JSON.stringify({beforeSize:e,afterSize:r});await(await fetch(`${Y}/saved-bytes`,{method:"POST",headers:J,body:t})).json()}catch(t){if(location.hostname==="localhost")return;console.error(t.name,t.message)}},K=async()=>{try{const r=await(await fetch(`${Y}/saved-bytes`,{headers:J})).json();le.textContent=`${new Intl.NumberFormat().format(r.entryCount)} ${r.entryCount===1?"file":"files"}`,de.textContent=v(r.totalBytesSaved),ue.textContent=Number(r.averagePercentageSaved).toFixed(2)}catch(e){if(location.hostname==="localhost")return;console.error(e.name,e.message)}};K();const L=new Map,W="setAppBadge"in navigator;let P=0;const k=async e=>{ie.hidden=!1,g.closest("table").hidden=!1;const r=[];for(const t of e){const s=Re&&t.handle?await t.handle.getUniqueId():t.webkitRelativePath?t.webkitRelativePath:t.relativePath?t.relativePath:t.name;let o,n,a,i,c,l;const u=g.querySelector(`[data-uuid="${s}"]`);if(u){const d=u.closest("tr");o=d.querySelector(".file-name"),n=d.querySelector(".before-size"),a=d.querySelector(".after-size"),i=d.querySelector(".delta-size"),c=d.querySelector(".spinner"),l=d.querySelector(".merge-checkbox")}else{const d=ae.content.cloneNode(!0);o=d.querySelector(".file-name"),n=d.querySelector(".before-size"),a=d.querySelector(".after-size"),i=d.querySelector(".delta-size"),c=d.querySelector(".spinner"),l=d.querySelector(".merge-checkbox"),g.append(d);const m=g.querySelectorAll("tr").length>1;q.closest("th").style.display=m?"":"none",g.querySelectorAll("input").forEach(f=>{f.closest("td").style.display=m?"":"none"})}if(c.src=O,o.querySelector("code").textContent=t.name,i.textContent="Optimizing…",n.textContent=v(t.size),o.dataset.uuid=s,l.disabled=!0,i.classList.remove("size-smaller"),i.classList.remove("size-larger"),i.classList.remove("error"),a.classList.remove("error"),l.classList.remove("error"),o.classList.remove("error"),o.classList.add("processing"),l.classList.add("processing"),W)try{await navigator.setAppBadge(++P)}catch(d){console.error(d.name,d.message)}r.push(()=>new Promise((d,m)=>{const f=new Worker(new URL("/wasmoptim/assets/binaryen-worker-rNu5qeOs.js",import.meta.url));f.addEventListener("message",async y=>{if(f.terminate(),c.removeAttribute("src"),o.classList.remove("processing"),l.classList.remove("processing"),l.disabled=!1,W){--P;try{P===0?await navigator.clearAppBadge():await navigator.setAppBadge(P)}catch(p){console.error(p.name,p.message)}}const{wasmFileAfter:h,error:D}=y.data;if(D){const p=new Error(D);o.classList.add("error"),a.classList.add("error"),i.classList.add("error"),l.classList.add("error"),l.disabled=!0,a.textContent=p.name,i.textContent=p.message,m(p);return}a.textContent=v(h.size);const E=h.size-t.size;console.log(`File ${t.name} processed → Before: ${t.size} After: ${h.size} Delta: ${E}`);const F=Math.abs(100-h.size/t.size*100).toFixed(2);i.textContent=Number(F)===0?"no change":`${F}% ${E<0?"smaller":"larger"} (${v(Math.abs(E))})`,i.classList.add(Number(F)===0?"size-larger":E<0?"size-smaller":"size-larger"),L.set(s,{file:h,handle:t.handle,savings:E});const N=[];for(const[p,{savings:A}]of L.entries())p!==T&&N.push(A);const R=N.reduce((p,A)=>p+A,0),Q=R/L.size;if(se.textContent=`Saved ${v(Math.abs(R))} in total and ${v(Math.abs(Q))} per file on average`,E<0&&(Be(t.size,h.size).then(()=>K()),b&&B.checked&&t.handle))try{const p=await t.handle.createWritable();await p.write(h),await p.close()}catch(p){console.error(p.name,p.message)}if(_&&ce.checked&&t.handle){const{getFileSystemChangeObserver:p}=await w(()=>import("./file-system-observer-1Q6KJk86.js"),__vite__mapDeps([0,1]));p().observe(t.handle),console.log(`File ${t.name} → Observing changes`)}d()}),f.postMessage({wasmFileBefore:t})}))}await Ce(r,"hardwareConcurrency"in navigator?Math.floor(navigator.hardwareConcurrency):4)},Ie=["https://unpkg.com/canvaskit-wasm@0.39.1/bin/canvaskit.wasm","https://unpkg.com/zxing-wasm@1.0.0-rc.4/dist/full/zxing_full.wasm","https://unpkg.com/@sqlite.org/sqlite-wasm@3.44.0-build1/sqlite-wasm/jswasm/sqlite3.wasm","https://unpkg.com/@tensorflow/tfjs-backend-wasm@4.13.0/wasm-out/tfjs-backend-wasm.wasm"],De=/@(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?/;Ie.forEach(e=>{const r=oe.content.cloneNode(!0),t=r.querySelector("code"),s=r.querySelector("a");t.textContent=e.replace("https://unpkg.com/","").replace(De,""),s.href=e,V.append(r)});V.addEventListener("click",async e=>{const r=e.target.nodeName.toLowerCase();if(r!=="a"&&r!=="code")return;e.preventDefault();const t=e.target.closest("a"),s=t.href,o=t.parentNode.querySelector(".downloading");o.textContent="Downloading…",o.classList.remove("error"),o.hidden=!1;const n=t.parentNode.querySelector("img");n.src=O;try{const a=await fetch(s).then(c=>c.blob());n.removeAttribute("src"),o.hidden=!0;const i=new File([a],s.split("/").pop(),{type:"application/wasm"});i.handle=!1,await k([i])}catch(a){console.error(a.name,a.message),n.removeAttribute("src"),o.classList.add("error"),o.textContent=a.message}});ne.addEventListener("click",async()=>{try{const e=await ve({recursive:!0,mode:B.checked?"readwrite":"read"}),r=e.filter(t=>t.type==="application/wasm"||t.name.endsWith(".wasm")||t.name.endsWith(".wat"));if(b&&_&&H.checked){let t=[];for(const a of e)t.push(a.directoryHandle);t=[...new Set(t)];const{getFileSystemChangeObserver:s,observedDirectories:o}=await w(()=>import("./file-system-observer-1Q6KJk86.js"),__vite__mapDeps([0,1])),n=s();t.forEach(a=>{n.observe(a,{recursive:!0}),o.add(a),console.log(`Directory ${a.name} → Observing changes`)})}await k(r)}catch(e){if(e.name==="AbortError")return;console.error(e.name,e.message)}});re.addEventListener("click",async()=>{try{const e=await we({mimeTypes:["application/wasm"],extensions:[".wasm",".wat"],multiple:!0});if(!e||!e.length)return;await k(e)}catch(e){if(e.name==="AbortError")return;console.error(e.name,e.message)}});document.addEventListener("paste",async e=>{try{if(!e.clipboardData.files.length)return;const r=Array.from(e.clipboardData.files).filter(t=>t.type==="application/wasm"||t.name.endsWith(".wasm")||t.name.endsWith(".wat"));await k(r)}catch(r){console.error(r.name,r.message)}});let z;(async()=>{if(b){({readDirectory:z}=await w(()=>import("./file-system-NZpNX-cp.js"),__vite__mapDeps([])));return}({readDirectory:z}=await w(()=>import("./file-system-legacy-a9xyRQTO.js"),__vite__mapDeps([])))})();document.addEventListener("dragover",e=>{e.preventDefault()});document.addEventListener("dragenter",e=>{e.preventDefault(),C.classList.add("drag-hover")});document.addEventListener("dragleave",e=>{e.preventDefault(),e.target===document.documentElement&&C.classList.remove("drag-hover")});document.addEventListener("drop",async e=>{e.preventDefault(),C.classList.remove("drag-hover");const r=[...e.dataTransfer.items].filter(n=>n.kind==="file").map(n=>Ne?n.getAsFileSystemHandle():n.webkitGetAsEntry()),t=[];let s,o;_&&({getFileSystemChangeObserver:s,observedDirectories:o}=await w(()=>import("./file-system-observer-1Q6KJk86.js"),__vite__mapDeps([0,1])));for await(const n of r){if(n.kind==="directory"){let i=await z(n,!0);if(i=i.filter(c=>c.type==="application/wasm"||c.name.endsWith(".wasm")||c.name.endsWith(".wat")),t.push(...i),_&&H.checked){let c=[];for(const u of i)c.push(u.directoryHandle);c=[...new Set(c)];const l=s();c.forEach(u=>{l.observe(u,{recursive:!0}),o.add(u),console.log(`Directory ${u.name} → Observing changes`)})}continue}else if(n.isDirectory){let i=await z(n);i=i.filter(c=>c.name.endsWith(".wasm")||c.name.endsWith(".wat")),t.push(...(await Promise.all(i.map(async c=>new Promise(l=>c.file(l))))).map((c,l)=>(c.relativePath=i[l].fullPath,c)));continue}let a;n.kind==="file"?(a=await n.getFile(),a.handle=n):n.isFile&&(a=await new Promise(i=>n.file(c=>i(c)))),!(a.type&&a.type!=="application/wasm"||!a.name.endsWith(".wasm")&&!a.name.endsWith(".wat"))&&t.push(a)}if(b&&B.checked){const{checkAndPossiblyAskForPermissions:n}=await w(()=>import("./file-system-NZpNX-cp.js"),__vite__mapDeps([]));await n(t)}await k(t)});const I=()=>{const e=g.querySelectorAll("input:checked:not(:disabled)").length;j.style.display=e<2?"none":""};I();q.addEventListener("click",()=>{g.querySelectorAll("input:not(:disabled)").forEach(e=>{e.checked=q.checked}),I()});S.addEventListener("click",async e=>{const r=e.target.nodeName.toLowerCase();if(r!=="a"&&r!=="code")return;e.preventDefault();const t=e.target.closest("a");if(!t.classList.contains("file-name")||t.classList.contains("error")||t.classList.contains("processing"))return;const s=t.dataset.uuid,{file:o,handle:n}=L.get(s);try{await Z(o,{fileName:o.name,extensions:[".wasm"],mimeTypes:["application/wasm"],existingHandle:n||void 0,startIn:n||void 0})}catch(a){if(a.name==="AbortError")return;console.error(a.name,a.message)}});g.addEventListener("click",async e=>{const r=e.target.nodeName.toLowerCase();if(r==="input"||r==="label"){if(e.target.classList.contains("error")||e.target.classList.contains("processing"))return;e.target.checked||(q.checked=!1),I();return}if(r!=="a"&&r!=="code")return;e.preventDefault();const t=e.target.closest("a");if(!t.classList.contains("file-name")||t.classList.contains("error")||t.classList.contains("processing"))return;const s=t.dataset.uuid,{file:o,handle:n}=L.get(s);try{await Z(o,{fileName:o.name,extensions:[".wasm",".wat"],mimeTypes:["application/wasm"],existingHandle:n||void 0,startIn:n||void 0})}catch(a){if(a.name==="AbortError")return;console.error(a.name,a.message)}});const X=e=>{if(e.matches){M.content="rgb(32, 33, 36)";return}M.content="#fff"};matchMedia("(prefers-color-scheme: dark)").addEventListener("change",X);X(matchMedia("(prefers-color-scheme: dark)"));const Ne="getAsFileSystemHandle"in DataTransferItem.prototype,_="FileSystemObserver"in window,Re="FileSystemHandle"in window&&"getUniqueId"in FileSystemHandle.prototype;(async()=>{if(b&&w(()=>import("./file-system-NZpNX-cp.js"),__vite__mapDeps([])),_&&w(()=>import("./file-system-observer-1Q6KJk86.js"),__vite__mapDeps([0,1])),"launchQueue"in window&&"files"in LaunchParams.prototype&&w(()=>import("./file-handling-ihRt5v--.js"),__vite__mapDeps([2,1])),"serviceWorker"in navigator){const{registerSW:e}=await w(()=>import("./virtual_pwa-register-KXothvEZ.js"),__vite__mapDeps([]));e({onOfflineReady(){console.log("Ready to work offline")},onNeedRefresh(){location.reload()}})(),"share"in navigator&&w(()=>import("./web-share-target-mtccS0OU.js"),__vite__mapDeps([]))}})();export{T as M,w as _,H as a,k as b,B as c,$e as d,b as e,ce as o,Re as s,L as u};
function __vite__mapDeps(indexes) {
  if (!__vite__mapDeps.viteFileDeps) {
    __vite__mapDeps.viteFileDeps = ["assets/file-system-observer-1Q6KJk86.js","assets/file-system-NZpNX-cp.js","assets/file-handling-ihRt5v--.js"]
  }
  return indexes.map((i) => __vite__mapDeps.viteFileDeps[i])
}