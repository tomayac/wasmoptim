import{_ as f}from"./index-ebI1EyE4.js";function g(o={}){const{immediate:a=!1,onNeedRefresh:p,onOfflineReady:n,onRegistered:d,onRegisteredSW:i,onRegisterError:c}=o;let t,r;const l=async(s=!0)=>{await r};async function m(){if("serviceWorker"in navigator){const{Workbox:s}=await f(()=>import("./workbox-window.prod.es5-prqDwDSL.js"),__vite__mapDeps([]));t=new s("/wasmoptim/sw.js",{scope:"/wasmoptim/",type:"classic"}),t.addEventListener("activated",e=>{(e.isUpdate||e.isExternal)&&window.location.reload()}),t.addEventListener("installed",e=>{e.isUpdate||n?.()}),t.register({immediate:a}).then(e=>{i?i("/wasmoptim/sw.js",e):d?.(e)}).catch(e=>{c?.(e)})}}return r=m(),l}export{g as registerSW};
function __vite__mapDeps(indexes) {
  if (!__vite__mapDeps.viteFileDeps) {
    __vite__mapDeps.viteFileDeps = []
  }
  return indexes.map((i) => __vite__mapDeps.viteFileDeps[i])
}