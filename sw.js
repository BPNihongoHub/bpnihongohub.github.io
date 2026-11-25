// Offline cache: app shell + question data. Books: every book page you open is kept (bp-books) so it opens again without internet.
const C='bp-v36';const CORE=['./','index.html','data.json','units.json','units-n5.json','data-n5.json','keys-n5.json','ex5-ne.json','ex5-en.json','units-n4.json','data-n4.json','keys-n4.json','ex4-ne.json','ex4-en.json','ex-ne.json','ex-en.json','icon-192.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C&&k!=='bp-books').map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET'||u.origin!==location.origin)return;
 if(u.pathname.includes('/books/')){/* stale-while-revalidate: show the saved copy at once, refresh it in the background */
  e.respondWith(caches.open('bp-books').then(c=>c.match(e.request).then(hit=>{const net=fetch(e.request).then(r=>{if(r.ok)c.put(e.request,r.clone());return r}).catch(()=>hit);return hit||net})));return}
 e.respondWith(fetch(e.request).then(r=>{const cp=r.clone();caches.open(C).then(c=>c.put(e.request,cp));return r}).catch(()=>caches.match(e.request)))});
