// ==========================================================================
// FUNGSI PEMBANTU (Helper & Utility)
// ==========================================================================

function escapeHtml(text) {
  if (text === null || text === undefined) return '';
  const htmlEscapes = {
    '&': '&amp;', '<': '&lt;', '>': '&gt;',
    '"': '&quot;', "'": '&#039;', '`': '&#96;', '/': '&#47;'
  };
  return String(text).replace(/[&<>"'`/]/g, (match) => htmlEscapes[match]);
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function closeModalDirect(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.style.display = 'none';
}
