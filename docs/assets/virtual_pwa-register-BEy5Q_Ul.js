import{_ as f}from"./index-I--hkdoU.js";function _(a={}){const{immediate:n=!1,onNeedRefresh:g,onOfflineReady:o,onRegistered:d,onRegisteredSW:r,onRegisterError:i}=a;let t,s;const c=async(e=!0)=>{await s};async function l(){if("serviceWorker"in navigator){if(t=await f(()=>import("./workbox-window.prod.es5-prqDwDSL.js"),__vite__mapDeps([])).then(({Workbox:e})=>new e("/sw.js",{scope:"/",type:"classic"})).catch(e=>{i?.(e)}),!t)return;t.addEventListener("activated",e=>{(e.isUpdate||e.isExternal)&&window.location.reload()}),t.addEventListener("installed",e=>{e.isUpdate===!1&&o?.()}),t.register({immediate:n}).then(e=>{r?r("/sw.js",e):d?.(e)}).catch(e=>{i?.(e)})}}return s=l(),c}export{_ as registerSW};
function __vite__mapDeps(indexes) {
  if (!__vite__mapDeps.viteFileDeps) {
    __vite__mapDeps.viteFileDeps = []
  }
  return indexes.map((i) => __vite__mapDeps.viteFileDeps[i])
}
