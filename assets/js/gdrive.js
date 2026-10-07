// ==========================================================================
// INTEGRASI GOOGLE DRIVE
// ==========================================================================

async function uploadToGoogleDrive(file) {
  return new Promise(async (resolve, reject) => {
    if (typeof google === 'undefined' || !google.accounts) {
      return reject(new Error("SDK Google belum siap."));
    }

    try {
      const client = google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: SCOPES,
        callback: async (tokenResponse) => {
          if (tokenResponse.error) return reject(new Error(tokenResponse.error));

          const token = tokenResponse.access_token;
          const metadata = { name: file.name, mimeType: file.type };
          const formData = new FormData();
          formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
          formData.append('file', file);

          const uploadRes = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
            method: 'POST',
            headers: new Headers({ 'Authorization': 'Bearer ' + token }),
            body: formData
          });

          const fileData = await uploadRes.json();
          if (!fileData.id) return reject(new Error("Gagal mengunggah file."));

          await fetch(`https://www.googleapis.com/drive/v3/files/${fileData.id}/permissions?key=${GOOGLE_API_KEY}`, {
            method: 'POST',
            headers: new Headers({ 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' }),
            body: JSON.stringify({ role: 'reader', type: 'anyone' })
          });

          resolve(`https://lh3.googleusercontent.com/d/${fileData.id}`);
        }
      });
      client.requestAccessToken({ prompt: '' });
    } catch (err) {
      reject(err);
    }
  });
}
