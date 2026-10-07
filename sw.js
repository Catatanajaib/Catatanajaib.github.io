// ==========================================================================
// SERVICE WORKER (sw.js) - NOTIFIKASI CHAT & TELEPON LOKAL
// ==========================================================================

const BASE_URL = 'https://catatanajaib.github.io/';

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

// 1. Menangkap Sinyal Push dari Server
self.addEventListener('push', function(event) {
  let data = { 
    type: 'chat',
    title: '💬 Pesan Baru', 
    body: 'Kamu menerima pesan baru!',
    url: BASE_URL
  };

  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  // Pengaturan default untuk notifikasi CHAT
  let options = {
    body: data.body,
    icon: 'assets/images/sawer.jpeg',
    badge: 'assets/images/sawer.jpeg',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || BASE_URL,
      type: data.type || 'chat'
    }
  };

  // Pengaturan khusus untuk TELEPON / CALL
  if (data.type === 'call') {
    options.title = data.title || '📞 Panggilan Masuk...';
    options.vibrate = [500, 200, 500, 200, 500, 200, 500];
    options.tag = 'incoming-call';
    options.renotify = true;
    options.requireInteraction = true;

    options.actions = [
      { action: 'accept', title: '✅ Terima' },
      { action: 'decline', title: '❌ Tolak' }
    ];
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'Catatan Ajaib', options)
  );
});

// 2. Memproses Aksi Saat Notifikasi Diklik
self.addEventListener('notificationclick', function(event) {
  const notification = event.notification;
  const action = event.action;
  const navData = notification.data || {};

  notification.close();

  if (action === 'decline') {
    console.log('Panggilan ditolak oleh pengguna.');
    return;
  }

  // Pembentukan URL yang valid
  let targetObj;
  try {
    targetObj = new URL(navData.url || BASE_URL, BASE_URL);
  } catch (err) {
    targetObj = new URL(BASE_URL);
  }

  // Jika tombol terima ditekan pada panggilan telepon
  if (action === 'accept') {
    targetObj.searchParams.set('action', 'accept-call');
  }

  const finalUrl = targetObj.href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      for (let i = 0; i < clientList.length; i++) {
        let client = clientList[i];
        if (client.url.includes('catatanajaib.github.io') && 'focus' in client) {
          client.focus();
          if ('navigate' in client) {
            return client.navigate(finalUrl);
          }
          return;
        }
      }

      if (clients.openWindow) {
        return clients.openWindow(finalUrl);
      }
    })
  );
});
