import{_ as g}from"./index-XrS_x5uc.js";function w(o={}){const{immediate:a=!1,onNeedRefresh:_,onOfflineReady:n,onRegistered:d,onRegisteredSW:i,onRegisterError:c}=o;let t,r;const l=async(s=!0)=>{await r};async function f(){if("serviceWorker"in navigator){const{Workbox:s}=await g(()=>import("./workbox-window.prod.es5-prqDwDSL.js"),__vite__mapDeps([]));t=new s("/sw.js",{scope:"/",type:"classic"}),t.addEventListener("activated",e=>{(e.isUpdate||e.isExternal)&&window.location.reload()}),t.addEventListener("installed",e=>{e.isUpdate||n?.()}),t.register({immediate:a}).then(e=>{i?i("/sw.js",e):d?.(e)}).catch(e=>{c?.(e)})}}return r=f(),l}export{w as registerSW};
function __vite__mapDeps(indexes) {
  if (!__vite__mapDeps.viteFileDeps) {
    __vite__mapDeps.viteFileDeps = []
  }
  return indexes.map((i) => __vite__mapDeps.viteFileDeps[i])
}
