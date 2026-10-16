/* Games 63 offline shell. No server-side user data or third-party network calls. */
const NAME='games63-offline-v2.1.0';
const ASSETS=[
  './','./index.php','./manifest.webmanifest',
  './assets/style.css','./assets/app.js','./assets/i18n.js','./assets/help.js',
  './assets/icon.svg','./assets/icon-180.png','./assets/icon-192.png','./assets/icon-512.png',
  './assets/vendor/react.production.min.js','./assets/vendor/react-dom.production.min.js',
  ...['wolf','formula','blocks','boats','moto','snooker','darts','farm','cards','chess','domino','zole'].map(x=>'./assets/art/'+x+'.svg'),
  ...['shared','legacy-adapter','wolf-retro','domino','zole','formula','blocks','venice','moto','snooker','darts','farm','cards','chess'].map(x=>'./games/'+x+'.js')
];
self.addEventListener('install',event=>{event.waitUntil(caches.open(NAME).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('games63-offline-')&&key!==NAME).map(key=>caches.delete(key)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',event=>{
 const req=event.request;
 if(req.method!=='GET')return;
 const url=new URL(req.url);
 if(url.origin!==self.location.origin)return;
 if(!url.pathname.startsWith(new URL(self.registration.scope).pathname))return;
 if(req.mode==='navigate'){
   event.respondWith(fetch(req).catch(async()=>{const cache=await caches.open(NAME);return await cache.match('./')||await cache.match('./index.php')||Response.error()}));
   return;
 }
 event.respondWith(caches.open(NAME).then(async cache=>{
   const match=await cache.match(req,{ignoreSearch:true});
   if(match)return match;
   const response=await fetch(req);
   if(response.ok&&response.type==='basic')cache.put(req,response.clone()).catch(()=>{});
   return response;
 }).catch(()=>fetch(req)));
});
