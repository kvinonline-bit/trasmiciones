const CACHE_NAME = 'stream-studio-v1';
const assets = [
  'index.html',
  'style.css',
  'app.js',
  'manifest.json',
  'banner1.png',
  'banner2.png',
  'icono.png'
];

// Instalar el Service Worker y guardar archivos en caché
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(assets);
    })
  );
});

// Interceptar las peticiones para cargar desde la caché si no hay internet
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(response => {
      return response || fetch(e.request);
    })
  );
});