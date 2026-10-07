// ==========================================================================
// PENDAFTARAN SERVICE WORKER & WEBPUSH NOTIFICATION
// ==========================================================================

// Fungsi pembantu untuk mengonversi Kunci VAPID dari Base64 ke Uint8Array
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

async function setupSystemNotification() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn("Browser tidak mendukung Web Push Notification.");
    return;
  }

  try {
    // 1. Daftarkan Service Worker menggunakan path relatif ('./sw.js')
    const registration = await navigator.serviceWorker.register('./sw.js');
    console.log('Service Worker berhasil didaftarkan:', registration.scope);

    // 2. Minta Izin Notifikasi
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('Izin notifikasi tidak diberikan oleh pengguna.');
      return;
    }

    // 3. VAPID Public Key
    const publicVapidKey = 'BIGIK2pVpxvc5jfbw67pf3JVskbQ7RYhLzvCxuz3HBfl53FLZFil1zRsrwvYIdXzabw9pddzCulYeyGfS0hS5R8';

    // 4. Buat / Dapatkan Push Subscription
    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
      });
    }

    // 5. Simpan Subscription ke Supabase
    await saveSubscriptionToSupabase(subscription);

  } catch (error) {
    console.error('Gagal menginisialisasi Notifikasi Sistem:', error);
  }
}

async function saveSubscriptionToSupabase(subscription) {
  const client = window.supabaseClient || (typeof supabaseClient !== 'undefined' ? supabaseClient : null);
  if (!client) return;

  const { data: { session } } = await client.auth.getSession();
  if (!session) return;

  const { error } = await client.from('push_subscriptions').upsert({
    user_id: session.user.id,
    subscription: subscription,
    updated_at: new Date().toISOString()
  }, { onConflict: 'user_id' });

  if (error) {
    console.error("Gagal menyimpan token notifikasi ke database:", error.message);
  } else {
    console.log("Token notifikasi berhasil diperbarui di Supabase.");
  }
}

// Fungsi Tambahan: Menampilkan Notifikasi Uji Coba Secara Langsung
function kirimNotifikasiUjiCoba(judul, pesan) {
  if (Notification.permission === 'granted') {
    navigator.serviceWorker.ready.then(registration => {
      registration.showNotification(judul || 'Catatan Ajaib', {
        body: pesan || 'Notifikasi sistem berhasil aktif!',
        icon: 'assets/images/sawer.jpeg', // Sesuaikan dengan ikon situsmu
        vibrate: [200, 100, 200]
      });
    });
  } else {
    alert('Izin notifikasi belum diaktifkan!');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  setupSystemNotification();

  // Menghubungkan tombol "Aktifkan Sensor" di index.html untuk menguji notifikasi
  const btnPermission = document.getElementById('btn-permission');
  if (btnPermission) {
    btnPermission.addEventListener('click', () => {
      setupSystemNotification().then(() => {
        kirimNotifikasiUjiCoba('Uji Coba Notifikasi', 'Selamat! Sistem notifikasi kamu bekerja dengan baik.');
      });
    });
  }
});
