function __vite__mapDeps(indexes) {
  if (!__vite__mapDeps.viteFileDeps) {
    __vite__mapDeps.viteFileDeps = []
  }
  return indexes.map((i) => __vite__mapDeps.viteFileDeps[i])
}
import{_ as f}from"./index-CcY2qFLA.js";function _(s={}){const{immediate:a=!1,onNeedRefresh:g,onOfflineReady:o,onRegistered:d,onRegisteredSW:r,onRegisterError:i}=s;let t,n;const c=async(e=!0)=>{await n};async function l(){if("serviceWorker"in navigator){if(t=await f(()=>import("./workbox-window.prod.es5-DFjpnwFp.js"),__vite__mapDeps([])).then(({Workbox:e})=>new e("/sw.js",{scope:"/",type:"classic"})).catch(e=>{i?.(e)}),!t)return;t.addEventListener("activated",e=>{(e.isUpdate||e.isExternal)&&window.location.reload()}),t.addEventListener("installed",e=>{e.isUpdate||o?.()}),t.register({immediate:a}).then(e=>{r?r("/sw.js",e):d?.(e)}).catch(e=>{i?.(e)})}}return n=l(),c}export{_ as registerSW};
