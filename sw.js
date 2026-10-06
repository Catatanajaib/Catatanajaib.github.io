// ==========================================================================
// SERVICE WORKER (sw.js) - NOTIFIKASI SISTEM LATAR BELAKANG
// ==========================================================================

// 1. Menangkap Sinyal Push dari Server & Menampilkan Notifikasi HP
self.addEventListener('push', function(event) {
  let data = { 
    title: '💬 Pesan Baru', 
    body: 'Kamu menerima pesan baru!',
    url: '/' 
  };

  // Cek apakah ada data JSON yang dikirimkan dari server
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  // Pengaturan tampilan notifikasi di sistem HP
  const options = {
    body: data.body,
    icon: '/icon.png', // Sesuaikan dengan ikon aplikasimu
    badge: '/icon.png',
    vibrate: [200, 100, 200], // Pola getar HP (Getar - Diam - Getar)
    data: {
      url: data.url || '/'
    }
  };

  // Tampilkan notifikasi ke sistem HP
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// 2. Membuka / Memfokuskan Kembali Aplikasi Saat Notifikasi Diklik
self.addEventListener('notificationclick', function(event) {
  // Tutup spanduk notifikasi
  event.notification.close();

  // Ambil URL target dari data notifikasi (default ke halaman utama '/')
  const targetUrl = (event.notification.data && event.notification.data.url) ? event.notification.data.url : '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      // Jika tab web sudah terbuka di browser, langsung fokuskan tab tersebut
      for (let i = 0; i < clientList.length; i++) {
        let client = clientList[i];
        if ('focus' in client) {
          return client.focus();
        }
      }
      // Jika tab web belum terbuka sama sekali, buka jendela baru
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
