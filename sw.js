// ==========================================================================
// SERVICE WORKER (sw.js) - NOTIFIKASI SISTEM LATAR BELAKANG
// ==========================================================================

// Activate Event: Memastikan Service Worker langsung mengambil alih kontrol
self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

// 1. Menangkap Sinyal Push dari Server & Menampilkan Notifikasi HP
self.addEventListener('push', function(event) {
  let data = { 
    title: '💬 Pesan Baru', 
    body: 'Kamu menerima pesan baru!',
    url: '/' 
  };

  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: 'assets/images/sawer.jpeg', 
    badge: 'assets/images/sawer.jpeg',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/'
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// 2. Membuka / Memfokuskan Kembali Aplikasi Saat Notifikasi Diklik
self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  const targetUrl = (event.notification.data && event.notification.data.url) ? event.notification.data.url : '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      for (let i = 0; i < clientList.length; i++) {
        let client = clientList[i];
        if ('focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
