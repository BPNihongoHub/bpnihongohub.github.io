// Offline cache: app shell + question data (books are not cached).
const C='bp-v14';const CORE=['./','index.html','data.json','units.json','units-n5.json','data-n5.json','keys-n5.json','ex5-ne.json','ex5-en.json','units-n4.json','data-n4.json','keys-n4.json','ex4-ne.json','ex4-en.json','ex-ne.json','ex-en.json','icon-192.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET'||u.origin!==location.origin||u.pathname.includes('/books/'))return;
 e.respondWith(fetch(e.request).then(r=>{const cp=r.clone();caches.open(C).then(c=>c.put(e.request,cp));return r}).catch(()=>caches.match(e.request)))});
