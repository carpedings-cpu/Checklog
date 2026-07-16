const CACHE='spk-v4';
const ASSETS=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).catch(()=>{}));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.method!=='GET') return;
  // Nur eigene App-Dateien (same-origin) behandeln; Supabase/CDN NIE cachen.
  let sameOrigin=false;
  try{ sameOrigin=(new URL(req.url).origin===self.location.origin); }catch(_){}
  if(!sameOrigin) return;
  if(req.mode==='navigate'){
    // Seite immer FRISCH aus dem Netz (kein HTTP-Cache) -> neue Versionen erscheinen sofort
    e.respondWith(fetch(req,{cache:'no-store'}).then(r=>{const cp=r.clone();caches.open(CACHE).then(c=>c.put(req,cp));return r;})
      .catch(()=>caches.match(req).then(m=>m||caches.match('./index.html'))));
  } else {
    e.respondWith(caches.match(req).then(m=>m||fetch(req).then(r=>{const cp=r.clone();caches.open(CACHE).then(c=>c.put(req,cp));return r;})));
  }
});
