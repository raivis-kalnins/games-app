/* Games 63 v2.3.0: offline and refresh-safe PWA caching. No tracking. */
const CACHE_NAME='games63-offline-v2.3.0';
const SHELL=[
 './','./index.php','./manifest.webmanifest',
 './assets/style.css','./assets/app.js','./assets/i18n.js','./assets/help.js',
 './assets/icon.svg','./assets/icon-180.png','./assets/icon-192.png','./assets/icon-512.png',
 './assets/vendor/react.production.min.js','./assets/vendor/react-dom.production.min.js',
 ...['wolf','formula','blocks','boats','moto','snooker','darts','farm','cards','chess','domino','zole','novuss','platform','tycoon','cirks'].map(x=>'./assets/art/'+x+'.svg'),
 ...['shared','legacy-adapter','wolf-retro','domino','zole','formula','blocks','venice','moto','snooker','darts','farm','cards','chess','novuss','platform','tycoon','cirks'].map(x=>'./games/'+x+'.js')
];
self.addEventListener('install',event=>event.waitUntil((async()=>{
 const cache=await caches.open(CACHE_NAME);
 await cache.addAll(SHELL);
 await self.skipWaiting();
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 const names=await caches.keys();
 await Promise.all(names.filter(n=>n.startsWith('games63-offline-')&&n!==CACHE_NAME).map(n=>caches.delete(n)));
 await self.clients.claim();
})()));
self.addEventListener('fetch',event=>{
 const request=event.request;
 if(request.method!=='GET')return;
 const url=new URL(request.url);
 if(url.origin!==self.location.origin)return;
 const destination=request.destination;
 const isPage=request.mode==='navigate';
 const isCode=['script','style','worker','sharedworker','document'].includes(destination)||/\.(?:js|css|php|html)$/.test(url.pathname);
 event.respondWith((async()=>{
   const cache=await caches.open(CACHE_NAME);
   if(isPage||isCode){
      try{const response=await fetch(request);if(response.ok){await cache.put(request,response.clone());if(isPage)await cache.put('./',response.clone());}return response;}
      catch(e){return (await cache.match(request))||(isPage?(await cache.match('./'))||(await cache.match('./index.php')):null)||Response.error();}
   }
   const saved=await cache.match(request);
   if(saved)return saved;
   try{const fresh=await fetch(request);if(fresh.ok)await cache.put(request,fresh.clone());return fresh;}
   catch(e){return Response.error();}
 })());
});
