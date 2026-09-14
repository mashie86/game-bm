// Service Worker - Game BM Hebat
// Naikkan nombor versi ini setiap kali fail app dikemaskini supaya cache lama dibersihkan.
const VERSI_CACHE = 'bmgame-v2';

const FAIL_UTAMA = [
  './',
  './index.html',
  './css/style.css',
  './js/data/tahap1.js',
  './js/data/tahap2.js',
  './js/data/padanan.js',
  './js/data/levels.js',
  './js/storage.js',
  './js/sound.js',
  './js/game.js',
  './js/app.js',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(VERSI_CACHE)
      .then((cache) => cache.addAll(FAIL_UTAMA))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((namaSemua) =>
      Promise.all(
        namaSemua
          .filter((nama) => nama !== VERSI_CACHE)
          .map((nama) => caches.delete(nama))
      )
    ).then(() => self.clients.claim())
  );
});

// Strategi: cache-first utk aset app, fallback ke rangkaian; jika rangkaian gagal (offline)
// dan permintaan adalah navigasi, kembalikan index.html dari cache (SPA offline fallback).
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((responTercache) => {
      if (responTercache) return responTercache;

      return fetch(event.request)
        .then((responRangkaian) => {
          if (responRangkaian && responRangkaian.status === 200 && responRangkaian.type === 'basic') {
            const salinan = responRangkaian.clone();
            caches.open(VERSI_CACHE).then((cache) => cache.put(event.request, salinan));
          }
          return responRangkaian;
        })
        .catch(() => {
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
        });
    })
  );
});
