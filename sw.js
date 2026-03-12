const cacheName = 'secret-cache-v1';
const filesToCache = [
    'index.html',
    'style.css',
    'java.js',
    'script.js',
    'secret.html',
    'smalllock.png',
    'biglock.png',
    'manifest.json'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(cacheName).then(cache => cache.addAll(filesToCache))
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request).catch(() => {
                return caches.match('index.html');
            });
        })
    );
});