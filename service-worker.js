const CACHE = 'quran-hifz-shell-v16';
const CORE = ['./','index.html','manifest.webmanifest','assets/css/main.css',
  'assets/js/app.js','assets/js/app.js?v=1.0.0.6','assets/js/progress.js','assets/js/hifz.js','assets/js/murajaah.js',
  'assets/js/arabic.js','assets/js/audio.js','assets/js/history.js','assets/js/parts.js','assets/fonts/Amiri-Regular.ttf',
  'assets/icons/icon.svg','assets/images/dawn.svg','assets/images/path.svg','assets/images/moon.svg',
  'assets/images/balance.svg','assets/images/book.svg',
  'data/ayahs.json','data/surahs.json','data/revelation-order.json','data/historical-events.json',
  'data/translations.json','data/sources.json','data/al-alaq.json','data/al-alaq.json?v=1.0.0.6','data/al-alaq-translation.json','data/al-alaq-translation.json?v=1.0.0.6',
  'surahs/096-al-alaq/','surahs/096-al-alaq/index.html',
  'surahs/096-al-alaq/page.css?v=1.0.0.6','surahs/096-al-alaq/page.js?v=1.0.0.6',
  'assets/images/al-alaq-hira.webp','assets/images/al-alaq-wealth.webp','assets/images/al-alaq-prayer.webp',
  'assets/images/al-alaq-warning.webp','assets/images/al-alaq-closeness.webp',
  'assets/images/al-alaq/ayah-01.webp','assets/images/al-alaq/ayah-02.webp','assets/images/al-alaq/ayah-03.webp','assets/images/al-alaq/ayah-04.webp','assets/images/al-alaq/ayah-05.webp','assets/images/al-alaq/ayah-06.webp','assets/images/al-alaq/ayah-07.webp','assets/images/al-alaq/ayah-08.webp','assets/images/al-alaq/ayah-09.webp','assets/images/al-alaq/ayah-10.webp','assets/images/al-alaq/ayah-11.webp','assets/images/al-alaq/ayah-12.webp','assets/images/al-alaq/ayah-13.webp','assets/images/al-alaq/ayah-14.webp','assets/images/al-alaq/ayah-15.webp','assets/images/al-alaq/ayah-16.webp','assets/images/al-alaq/ayah-17.webp','assets/images/al-alaq/ayah-18.webp','assets/images/al-alaq/ayah-19.webp'];
CORE.push('data/al-muddassir-language.json?v=1.0.0.16','assets/fonts/ScheherazadeNew-Regular.ttf','assets/css/quran-readable.css?v=1.0.0.10',
  'assets/js/app.js?v=1.0.0.12','assets/js/arabic.js?v=1.0.0.10','surahs/074-al-muddassir/','surahs/074-al-muddassir/index.html',
  'surahs/074-al-muddassir/page.css?v=1.0.0.16','surahs/074-al-muddassir/page.js?v=1.0.0.16',
  'data/al-muddassir.json?v=1.0.0.10','data/al-muddassir-tafsir.json?v=1.0.0.10',
  ...Array.from({length:10},(_,i)=>`assets/images/al-muddassir/ayah-${String(i+1).padStart(2,'0')}.webp`));
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
