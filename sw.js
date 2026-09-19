// sw.js - Berjalan di background browser
self.addEventListener('push', function(event) {
  let data = { title: 'Panggilan / Pesan Baru', body: 'Ada aktivitas baru di aplikasi!' };
  
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: '/icon.png', // Sesuaikan dengan ikon aplikasi kamu jika ada
    badge: '/icon.png',
    vibrate: [200, 100, 200]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Ketika notifikasi diklik, buka kembali aplikasi
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});
