import{d as l,o as s,u as c,a as i}from"./index-p8IUD2Qf.js";let n=null;const d=async e=>{console.log("File system changes detected",e,await e[0].changedHandle.getFile());const t=[];for(const a of e)if(a.type==="modified"){const o=await a.changedHandle.getFile();console.log(`${o.name} modified → Re-optimizing`),o.handle=a.changedHandle,t.push(o)}i(t)},r=()=>(n||(n=new FileSystemObserver(l(e=>{d(e)},250))),n);s.parentNode.hidden=!1;s.addEventListener("change",()=>{if(localStorage.setItem("observe-changes",s.checked),s.checked){r();for(const{handle:e}of c.values())e&&(n.observe(e),console.log(`${e.name} → Observing changes`));return}n&&(n.disconnect(),n=null)});localStorage.getItem("observe-changes")!=="true"?s.checked=!1:s.checked=!0;export{r as getFileSystemChangeObserver};