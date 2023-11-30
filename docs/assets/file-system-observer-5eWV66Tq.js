import{d as k,o as a,a as t,u as c,M as h,r as w,s as H,c as S,b as C}from"./index-heTWHEn9.js";const f=new Set;let o=null;const D=async n=>{console.log(`File system changes detected  → ${n.map(s=>`${s.changedHandle.name} (${s.type})`).join(", ")}`.trim());let e=[];for(const s of n)if(s.type==="modified"){if(s.changedHandle instanceof FileSystemFileHandle){const r=await s.changedHandle.getFile();console.log(`File ${r.name} modified → Re-optimizing`),r.handle=s.changedHandle,e.push(r)}else if(s.changedHandle instanceof FileSystemDirectoryHandle){const r=s.changedHandle;let l=await w(r,!0);console.log(`Directory ${s.changedHandle.name} modified → Getting entries`),l=l.filter(i=>i.type==="application/wasm"||i.name.endsWith(".wasm")||i.name.endsWith(".wat")),e.push(...l);const d=Array.from(c.keys()),u=Array.from(c.values()).map(i=>i.lastModified),b=e.map(async i=>H?await i.handle.getUniqueId():i.name),y=await Promise.all(b);e=e.filter((i,v)=>{const g=y[v],F=!d.includes(g),p=u[d.indexOf(g)]<i.lastModified;return F||p})}}e=[...new Set(e)],await S(e),await C(e)},m=()=>(o||(o=new FileSystemObserver(k(n=>{D(n)},250))),o);localStorage.getItem("observe-file-changes")!=="true"?a.checked=!1:a.checked=!0;localStorage.getItem("observe-directory-changes")!=="true"?t.checked=!1:t.checked=!0;a.parentNode.hidden=!1;a.addEventListener("change",()=>{if(localStorage.setItem("observe-file-changes",a.checked),a.checked){m();for(const[n,{handle:e}]of c.entries())n===h||!e||(o.observe(e),console.log(`File ${e.name} → Observing changes`));return}if(o)for(const[n,{handle:e}]of c.entries())n===h||!e||(o.unobserve(e),console.log(`File ${e.name} → No longer observing changes`))});t.parentNode.hidden=!1;t.addEventListener("change",()=>{if(localStorage.setItem("observe-directory-changes",t.checked),t.checked){m();for(const n of f)o.observe(n),console.log(`Directory ${n.name} → Observing changes`);return}if(o)for(const n of f)o.unobserve(n),console.log(`Directory ${n.name} → No longer observing changes`)});export{m as getFileSystemChangeObserver,f as observedDirectories};