import{d as u,o as a,u as d,s as c,a as h}from"./index-e442eb06.js";let e=null;const g=async n=>{const s=[];for(const t of n)if(t.type==="modified"){const o=await t.changedHandle.getFile();console.log(`${o.name} modified → Re-optimizing`),o.handle=t.changedHandle;const l=c?await t.changedHandle.getUniqueId():t.changedHandle.name;s.push(o);for(const[r,{handle:i}]of d.entries())(c?await i.getUniqueId():i.name)===l&&document.querySelector(`[data-uuid="${r}"]`)?.closest("tr")?.remove()}h(s)},f=()=>(e||(e=new FileSystemObserver(u(n=>{g(n)},250))),e);a.parentNode.hidden=!1;a.addEventListener("change",()=>{if(localStorage.setItem("observe-changes",a.checked),a.checked){f();for(const[,{handle:n,file:s}]of d.entries())n&&e.observe(n);return}e&&(e.disconnect(),e=null)});localStorage.getItem("observe-changes")!=="true"?a.checked=!1:a.checked=!0;export{f as getFileSystemChangeObserver};