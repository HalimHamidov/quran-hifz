const CACHE = 'quran-hifz-shell-v3';
const CORE = ['./','index.html','manifest.webmanifest','assets/css/main.css',
  'assets/js/app.js','assets/js/app.js?v=1.0.0.3','assets/js/progress.js','assets/js/hifz.js','assets/js/murajaah.js',
  'assets/js/arabic.js','assets/js/audio.js','assets/js/history.js','assets/js/parts.js','assets/fonts/Amiri-Regular.ttf',
  'assets/icons/icon.svg','assets/images/dawn.svg','assets/images/path.svg','assets/images/moon.svg',
  'assets/images/balance.svg','assets/images/book.svg',
  'data/ayahs.json','data/surahs.json','data/revelation-order.json','data/historical-events.json',
  'data/translations.json','data/sources.json','data/al-alaq.json',
  'surahs/096-al-alaq/','surahs/096-al-alaq/index.html',
  'surahs/096-al-alaq/page.css?v=1.0.0.3','surahs/096-al-alaq/page.js?v=1.0.0.3',
  'assets/images/al-alaq-hira.webp','assets/images/al-alaq-wealth.webp','assets/images/al-alaq-prayer.webp',
  'assets/images/al-alaq-warning.webp','assets/images/al-alaq-closeness.webp'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE.map(path=>new URL(path,self.registration.scope).href))));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('quran-hifz-shell-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const url=new URL(event.request.url),scope=new URL(self.registration.scope);
  if(event.request.method!=='GET'||url.origin!==scope.origin||!url.pathname.startsWith(scope.pathname)||url.pathname.includes('/legacy/'))return;
  event.respondWith(fetch(event.request).then(response=>{
    if(response.ok){const copy=response.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put(event.request,copy)));}
    return response;
  }).catch(async()=>{
    const cached=await caches.match(event.request);if(cached)return cached;
    if(event.request.mode==='navigate')return caches.match(new URL('index.html',scope).href);
    return Response.error();
  }));
});
