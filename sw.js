// Сервис-воркер: кэширует сайт, чтобы он открывался без интернета.
// Если добавите или переименуете файлы, увеличьте номер версии V.
const V='blok-v1',FILES=['./','index.html','games.html','play.html','profile.html','style.css','main.js','games.js','logo.svg','mark.svg','manifest.webmanifest','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);
  if(u.origin!==location.origin){ // шрифты Google: запоминаем после первой загрузки
    if(/(^|\.)(googleapis|gstatic)\.com$/.test(u.hostname))
      e.respondWith(caches.open(V).then(c=>c.match(r).then(h=>h||fetch(r).then(n=>{c.put(r,n.clone());return n}).catch(()=>h))));
    return;
  }
  // свои файлы: сразу из кэша, а в фоне обновляем (новая версия появится при следующем открытии)
  e.respondWith(caches.match(r,{ignoreSearch:true}).then(h=>{
    const n=fetch(r).then(x=>{if(x.ok)caches.open(V).then(c=>c.put(r,x.clone()));return x}).catch(()=>h);
    return h||n;
  }));
});
