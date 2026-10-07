// ==========================================================================
// PENDAFTARAN SERVICE WORKER & WEBPUSH NOTIFICATION
// ==========================================================================

async function setupSystemNotification() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn("Browser tidak mendukung Web Push Notification.");
    return;
  }

  try {
    // 1. Daftarkan Service Worker
    const registration = await navigator.serviceWorker.register('/sw.js');
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

document.addEventListener('DOMContentLoaded', () => {
  setupSystemNotification();
});