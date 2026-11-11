/* APSI PM app: works offline after the first visit. Bump VERSION when files change. */
const VERSION="apsi-pm-v1";
const SHELL=["./","./index.html","./manifest.webmanifest","./icon-192.png","./icon-512.png","./icon-maskable-512.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(VERSION).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
  const req=e.request; if(req.method!=="GET")return;
  const url=new URL(req.url);
  // Pages: network first so updates show, cached copy when offline
  if(req.mode==="navigate"){e.respondWith(fetch(req).then(r=>{const c=r.clone();caches.open(VERSION).then(x=>x.put("./index.html",c));return r}).catch(()=>caches.match("./index.html")));return}
  // Everything else (icons, fonts): cache first, then network
  e.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(r=>{if(r.ok&&(url.origin===location.origin||url.hostname.endsWith("gstatic.com")||url.hostname.endsWith("googleapis.com"))){const c=r.clone();caches.open(VERSION).then(x=>x.put(req,c))}return r})));
});
