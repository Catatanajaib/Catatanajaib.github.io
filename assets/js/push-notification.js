// ==========================================================================
// PENDAFTARAN SERVICE WORKER & WEBPUSH NOTIFICATION
// ==========================================================================

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
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
    // Daftarkan dengan path relatif
    const registration = await navigator.serviceWorker.register('./sw.js');
    console.log('Service Worker berhasil didaftarkan:', registration.scope);

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return;

    const publicVapidKey = 'BIGIK2pVpxvc5jfbw67pf3JVskbQ7RYhLzvCxuz3HBfl53FLZFil1zRsrwvYIdXzabw9pddzCulYeyGfS0hS5R8';

    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
      });
    }

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

  await client.from('push_subscriptions').upsert({
    user_id: session.user.id,
    subscription: subscription,
    updated_at: new Date().toISOString()
  }, { onConflict: 'user_id' });
}

document.addEventListener('DOMContentLoaded', () => {
  setupSystemNotification();
});
