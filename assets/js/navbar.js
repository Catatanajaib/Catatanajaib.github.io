// ==========================================================================
// FUNGSI PEMBANTU (Mencegah Celah Keamanan XSS)
// ==========================================================================
function escapeHtml(text) {
  if (text === null || text === undefined) return '';
  
  const htmlEscapes = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
    '`': '&#96;',
    '/': '&#47;'
  };

  return String(text).replace(/[&<>"'`/]/g, (match) => htmlEscapes[match]);
}
/* ==========================================================================
   WEB COMPONENT: NAVBAR & MODAL GLOBAL
   ========================================================================== */
class NavBar extends HTMLElement {
  connectedCallback() {
    const isSubPage = window.location.pathname.includes('/pages/');
    const basePath = isSubPage ? '../' : './';

    this.innerHTML = `
      <!-- NAVIGASI UTAMA -->
      <nav class="navbar">
        <h4 class="logo">Catatan Ajaib</h4>
        <ul class="nav-links">
          <li class="has-dropdown">MENU
            <ul class="vertical-dropdown">
              <li><a href="#" class="open-modal-btn" data-target="AboutModal">Kontak</a></li>
              <li><a href="${basePath}pages/toko.html">TOKO</a></li>
            </ul>
          </li>
          <li><a href="#" onclick="openChatFromNavbar(); return false;">💬 ChatsRoom</a></li>
          <li><a href="${basePath}index.html">BERANDA</a></li>
          <li><a href="#" class="open-modal-btn" data-target="PenelusuranModal">CARI</a></li>
          <li><a href="${basePath}pages/postingan.html">POSTS</a></li>
          <li><a href="${basePath}pages/berita.html">BERITA</a></li>
        </ul>
      </nav>
      
      <!-- MODAL ABOUT -->
      <div id="AboutModal" class="modal" style="display: none;">
        <div class="modal-content">
          <span class="close-btn" onclick="closeModalDirect('AboutModal')">&times;</span>
          <h2>Tentang Kami</h2>
          <p>Miftahul Mujib - 081910240675</p>
        </div>
      </div>

      <!-- MODAL PENELUSURAN -->
      <div id="PenelusuranModal" class="modal" style="display: none;">
        <div class="modal-content">
          <span class="close-btn" onclick="closeModalDirect('PenelusuranModal')">&times;</span>
          <h2>Catatan Ajaib</h2>
          <form class="search-container" action="https://www.google.com/search" method="GET" target="_blank">
            <div class="form-group">
              <label for="search-query">Penelusuran</label>
              <input type="text" id="search-query" name="q" class="search-input" placeholder="Apa yang ingin kamu cari?" required>
            </div>
            <button type="submit" class="btn-post search-button">
              <span>Cari</span>
            </button>
          </form>
        </div>
      </div>

      <!-- MODAL CHAT ROOM GLOBAL -->
      <div id="Chat-Room" class="modal" style="display: none;">
        <div class="modal-content chat-modal-content" style="width: 500px; display: flex; height: 700px; padding: 0; overflow: hidden; border-radius: 8px;">
          
          <!-- Sidebar Kiri: Daftar Pengguna -->
          <div class="chat-sidebar" style="width: 35%; border-right: 1px solid #ddd; background: #f8f9fa; display: flex; flex-direction: column;">
            <div style="padding: 12px; border-bottom: 1px solid #ddd; font-weight: bold; background: #fff; display: flex; justify-content: space-between; align-items: center;">
              <span>💬 Percakapan</span>
              <button onclick="loadChatUsers()" style="background: none; border: none; cursor: pointer; font-size: 12px;" title="Refresh Daftar">🔄</button>
            </div>
            <div id="chat-user-list" style="flex: 1; overflow-y: auto; padding: 8px;">
              <p style="font-size: 12px; color: #888; text-align: center;">Memuat daftar pengguna...</p>
            </div>
          </div>

          <!-- Area Kanan: Ruang Obrolan -->
          <div class="chat-main" style="width: 65%; display: flex; flex-direction: column; background: #fff; position: relative;">
            
            <!-- Header Chat -->
            <div class="chat-header" style="padding: 12px; border-bottom: 1px solid #ddd; display: flex; justify-content: space-between; align-items: center; background: #fff;">
              <span id="chat-receiver-name" style="font-weight: bold; font-size: 14px; color: #333;">Pilih pengguna untuk mulai chat</span>
              
              <div style="display: flex; align-items: center; gap: 8px;">
                <button id="btn-audio-call" onclick="startCall('audio')" disabled style="background: none; border: none; cursor: pointer; font-size: 16px; opacity: 0.5;" title="Panggilan Suara">📞</button>
                <button id="btn-video-call" onclick="startCall('video')" disabled style="background: none; border: none; cursor: pointer; font-size: 16px; opacity: 0.5;" title="Panggilan Video">📹</button>
                <span class="close" onclick="closeChatModal()" style="cursor: pointer; font-size: 20px; font-weight: bold; color: #666; margin-left: 8px;">&times;</span>
              </div>
            </div>

            <!-- Pesan Chat -->
            <div id="chat-messages" style="flex: 1; padding: 12px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; background: #fafafa;">
              <p style="font-size: 13px; color: #888; text-align: center; margin-top: auto; margin-bottom: auto;">
                Silakan pilih teman dari daftar di sebelah kiri untuk melihat percakapan.
              </p>
            </div>

            <!-- Form Kirim Pesan & Lampiran Media -->
            <form id="chat-form" onsubmit="sendPrivateMessage(event)" style="padding: 10px; border-top: 1px solid #ddd; display: flex; gap: 8px; background: #fff; align-items: center;">
              <label for="chat-file-input" style="cursor: pointer; font-size: 18px;" title="Kirim Foto/Video">📎</label>
              <input type="file" id="chat-file-input" style="display: none;" onchange="handleFileSelect(event)">
              
              <input type="text" id="chat-input" placeholder="Tulis pesan..." style="flex: 1; padding: 8px 12px; border: 1px solid #ccc; border-radius: 20px; outline: none;" disabled>
              <button type="submit" id="chat-send-btn" style="padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 20px; cursor: pointer;" disabled>Kirim</button>
            </form>

            <!-- OVERLAY JITSI MEET CALL -->
            <div id="jitsi-call-overlay" style="display: none; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: #000; z-index: 100; flex-direction: column;">
              <div style="padding: 8px 12px; background: #111; color: #fff; display: flex; justify-content: space-between; align-items: center; font-size: 12px;">
                <span id="jitsi-status-title">Panggilan Berlangsung...</span>
                <button onclick="endJitsiCall()" style="background: #dc3545; color: white; border: none; padding: 4px 10px; border-radius: 12px; cursor: pointer; font-size: 12px;">Tutup</button>
              </div>
              <div id="jitsi-frame" style="flex: 1; width: 100%; height: 100%;"></div>
            </div>

          </div>
        </div>
      </div>
    `;

    this.initModalEvents();
  }

  initModalEvents() {
    this.querySelectorAll('.open-modal-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = btn.getAttribute('data-target');
        const targetModal = document.getElementById(targetId);
        if (targetModal) targetModal.style.display = 'block';
      });
    });

    window.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
      }
    });
  }
}

customElements.define('my-navbar', NavBar);

/* ==========================================================================
   LOGIKA CHATROOM GLOBAL & JITSI CALL (KONTROLER)
   ========================================================================== */

let activeChatReceiverId = null;
let chatSubscription = null;
let activeJitsiApi = null;
let selectedFile = null;

// Helper Modal
function closeModalDirect(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.style.display = 'none';
}

async function openChatFromNavbar() {
  const modal = document.getElementById('Chat-Room');
  if (modal) modal.style.display = 'block';
  await loadChatUsers();
}

function closeChatModal() {
  const modal = document.getElementById('Chat-Room');
  if (modal) modal.style.display = 'none';
  
  const client = window.supabaseClient || (typeof supabaseClient !== 'undefined' ? supabaseClient : null);
  if (client && chatSubscription) {
    client.removeChannel(chatSubscription);
    chatSubscription = null;
  }
}

// Handler Saat Memilih File Media
function handleFileSelect(event) {
  const file = event.target.files[0];
  if (!file) return;

  selectedFile = file;
  const labelBtn = document.querySelector("label[for='chat-file-input']");
  if (labelBtn) {
    labelBtn.style.color = "#007bff";
    labelBtn.title = `Terpilih: ${file.name}`;
  }
}

// Memuat Daftar Pengguna dari Supabase
async function loadChatUsers() {
  const userListContainer = document.getElementById('chat-user-list');
  if (!userListContainer) return;

  userListContainer.innerHTML = '<p style="font-size:12px; color:#888; text-align:center;">Memuat...</p>';

  const client = window.supabaseClient || (typeof supabaseClient !== 'undefined' ? supabaseClient : null);
  if (!client) {
    userListContainer.innerHTML = '<p style="font-size:12px; color:red; text-align:center;">Koneksi Supabase belum siap.</p>';
    return;
  }

  const { data: { session } } = await client.auth.getSession();
  if (!session) {
    userListContainer.innerHTML = '<p style="font-size:12px; color:red; text-align:center;">Silakan login terlebih dahulu.</p>';
    return;
  }

  const { data: posts, error } = await client
    .from('posts')
    .select('user_id, author_name, username');

  if (error || !posts) {
    userListContainer.innerHTML = '<p style="font-size:12px; color:#888; text-align:center;">Gagal memuat pengguna.</p>';
    return;
  }

  const uniqueUsers = [];
  const map = new Map();
  
  for (const item of posts) {
    if (item.user_id && item.user_id !== session.user.id && !map.has(item.user_id)) {
      map.set(item.user_id, true);
      uniqueUsers.push({
        id: item.user_id,
        name: item.author_name || item.username || 'Pengguna'
      });
    }
  }

  if (uniqueUsers.length === 0) {
    userListContainer.innerHTML = '<p style="font-size:12px; color:#888; text-align:center;">Belum ada pengguna lain.</p>';
    return;
  }

  userListContainer.innerHTML = uniqueUsers.map(u => `
    <div class="user-chat-item" 
         onclick="selectUserForChat('${u.id}', '${escapeHtml(u.name)}')"
         style="padding: 10px; margin-bottom: 4px; border-radius: 6px; cursor: pointer; background: #fff; border: 1px solid #e9ecef; transition: background 0.2s;">
      <div style="font-weight: 600; font-size: 13px; color: #333;">👤 ${escapeHtml(u.name)}</div>
      <div style="font-size: 11px; color: #888;">Klik untuk pesan & telepon</div>
    </div>
  `).join('');
}

// Memilih Pengguna untuk Mengobrol
async function selectUserForChat(userId, userName) {
  activeChatReceiverId = userId;

  const chatHeader = document.getElementById("chat-receiver-name");
  const inputEl = document.getElementById("chat-input");
  const btnEl = document.getElementById("chat-send-btn");
  const btnAudio = document.getElementById("btn-audio-call");
  const btnVideo = document.getElementById("btn-video-call");

  if (chatHeader) chatHeader.textContent = userName;
  if (inputEl) inputEl.disabled = false;
  if (btnEl) btnEl.disabled = false;

  if (btnAudio) { btnAudio.disabled = false; btnAudio.style.opacity = "1"; }
  if (btnVideo) { btnVideo.disabled = false; btnVideo.style.opacity = "1"; }

  await fetchPrivateMessages(userId);
  subscribeToPrivateChat(userId);
}

// Memuat Riwayat Pesan
async function fetchPrivateMessages(receiverId) {
  const messageContainer = document.getElementById("chat-messages");
  if (!messageContainer) return;

  const client = window.supabaseClient || (typeof supabaseClient !== 'undefined' ? supabaseClient : null);
  const { data: { session } } = await client.auth.getSession();
  if (!session) return;

  const currentUserId = session.user.id;

  const { data: messages, error } = await client
    .from('messages')
    .select('*')
    .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${currentUserId})`)
    .order('created_at', { ascending: true });

  if (error) {
    messageContainer.innerHTML = '<p style="font-size:12px; color:red; text-align:center; margin:auto;">Gagal memuat pesan.</p>';
    return;
  }

  if (!messages || messages.length === 0) {
    messageContainer.innerHTML = '<p style="font-size:12px; color:#888; text-align:center; margin:auto;">Belum ada percakapan. Mulai sapa!</p>';
    return;
  }

  messageContainer.innerHTML = messages.map(msg => {
    const isMe = msg.sender_id === currentUserId;
    let contentHtml = escapeHtml(msg.content || msg.message || '');

    if (msg.file_url) {
      if (msg.file_type === 'video') {
        contentHtml += `<br><video src="${msg.file_url}" controls style="max-width:100%; border-radius:6px; margin-top:4px;"></video>`;
      } else {
        contentHtml += `<br><img src="${msg.file_url}" style="max-width:100%; border-radius:6px; margin-top:4px;" />`;
      }
    }

    return `
      <div style="align-self: ${isMe ? 'flex-end' : 'flex-start'}; max-width: 80%;">
        <div style="padding: 8px 12px; border-radius: 8px; font-size: 12px; line-height: 1.4; ${
          isMe 
            ? 'background-color: #007bff; color: white; border-bottom-right-radius: 2px;' 
            : 'background-color: #ffffff; color: #333; border: 1px solid #ddd; border-bottom-left-radius: 2px;'
        }">
          ${contentHtml}
        </div>
        <span style="font-size: 9px; color: #999; display: block; text-align: ${isMe ? 'right' : 'left'}; margin-top: 2px;">
          ${new Date(msg.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    `;
  }).join('');

  messageContainer.scrollTop = messageContainer.scrollHeight;
}

const GOOGLE_API_KEY = 'AIzaSyChf3GjmEsvFQoktUBPFbWnFKUkC1VObpU';
const GOOGLE_CLIENT_ID = '49596256372-4eoeert51u0p1ssv55f5vr851v9ia2dk.apps.googleusercontent.com';
const SCOPES = 'https://www.googleapis.com/auth/drive.file';

let tokenClient;
let accessToken = null;

// Initialize Google API Client
function initGoogleDrive() {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: GOOGLE_CLIENT_ID,
    scope: SCOPES,
    callback: (tokenResponse) => {
      accessToken = tokenResponse.access_token;
    },
  });
}

// Fungsi Upload File ke Google Drive
async function uploadToGoogleDrive(file) {
  return new Promise((resolve, reject) => {
    // Jika belum ada akses token, minta izin login Google dulu
    if (!accessToken) {
      tokenClient.callback = async (resp) => {
        if (resp.error) return reject(resp);
        accessToken = resp.access_token;
        try {
          const url = await executeDriveUpload(file);
          resolve(url);
        } catch (err) {
          reject(err);
        }
      };
      tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
      executeDriveUpload(file).then(resolve).catch(reject);
    }
  });
}

async function executeDriveUpload(file) {
  const metadata = {
    name: file.name,
    mimeType: file.type,
  };

  const formData = new FormData();
  formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  formData.append('file', file);

  // 1. Upload File ke Drive
  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: new Headers({ 'Authorization': 'Bearer ' + accessToken }),
    body: formData,
  });

  const fileData = await res.json();
  if (!fileData.id) throw new Error('Gagal upload ke Drive');

  // 2. Ubah Izin File Menjadi Public (Anyone with link)
  await fetch(`https://www.googleapis.com/drive/v3/files/${fileData.id}/permissions?key=${GOOGLE_API_KEY}`, {
    method: 'POST',
    headers: new Headers({
      'Authorization': 'Bearer ' + accessToken,
      'Content-Type': 'application/json'
    }),
    body: JSON.stringify({
      role: 'reader',
      type: 'anyone'
    })
  });

  // 3. Kembalikan Direct Link agar bisa tampil langsung di Chat
  return `https://lh3.googleusercontent.com/d/${fileData.id}`;
}


// Mengirim Pesan (Teks & File Media)
async function sendPrivateMessage(event) {
  event.preventDefault();

  const inputEl = document.getElementById("chat-input");
  const fileEl = document.getElementById("chat-file-input");
  const messageText = inputEl ? inputEl.value.trim() : "";
  const file = selectedFile || (fileEl && fileEl.files ? fileEl.files[0] : null);

  if ((!messageText && !file) || !activeChatReceiverId) return;

  const client = window.supabaseClient || (typeof supabaseClient !== 'undefined' ? supabaseClient : null);
  if (!client) return;

  const { data: { session } } = await client.auth.getSession();
  if (!session) return;

  let fileUrl = null;
  let fileType = null;

    // Proses upload file ke Google Drive jika ada file yang dipilih
  if (file) {
    try {
      // Panggil fungsi Google Drive untuk mengunggah file
      fileUrl = await uploadToGoogleDrive(file); 
      fileType = file.type.startsWith('video/') ? 'video' : 'image';
    } catch (uploadErr) {
      alert("Gagal mengunggah file: " + uploadErr.message);
      return;
    }
  }

  const { error } = await client
    .from('messages')
    .insert([
      {
        sender_id: session.user.id,
        receiver_id: activeChatReceiverId,
        content: messageText,
        file_url: fileUrl,
        file_type: fileType
      }
    ]);

  if (error) {
    alert("Gagal mengirim pesan: " + error.message);
  } else {
    inputEl.value = "";
    if (fileEl) fileEl.value = "";
    selectedFile = null;

    const labelBtn = document.querySelector("label[for='chat-file-input']");
    if (labelBtn) {
      labelBtn.style.color = "";
      labelBtn.title = "Kirim Foto/Video";
    }

    fetchPrivateMessages(activeChatReceiverId);
  }
}

// Menerima Pesan & Panggilan Realtime
function subscribeToPrivateChat(receiverId) {
  const client = window.supabaseClient || (typeof supabaseClient !== 'undefined' ? supabaseClient : null);
  if (!client) return;

  if (chatSubscription) {
    client.removeChannel(chatSubscription);
  }

  chatSubscription = client
    .channel(`private-chat-${receiverId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages' },
      async (payload) => {
        const { data: { session } } = await client.auth.getSession();
        if (!session) return;

        const currentUserId = session.user.id;
        const newMsg = payload.new;

        if (
          (newMsg.sender_id === receiverId && newMsg.receiver_id === currentUserId) ||
          (newMsg.sender_id === currentUserId && newMsg.receiver_id === receiverId)
        ) {
          fetchPrivateMessages(receiverId);
        }
      }
    )
    .on('broadcast', { event: 'incoming-call' }, async (payload) => {
      const { data: { session } } = await client.auth.getSession();
      if (!session) return;

      const myUserId = session.user.id;
      const data = payload.payload;

      if (data.targetUserId === myUserId) {
        const accept = confirm(`${data.callerName} memanggil kamu (${data.callMode} call). Angkat?`);
        if (accept) {
          startCallWithRoom(data.roomName, data.callMode);
        }
      }
    })
    .subscribe();
}

// Fitur Panggilan Video & Suara (Jitsi API)
function startCall(callMode) {
  if (!activeChatReceiverId) {
    alert("Pilih pengguna terlebih dahulu!");
    return;
  }

  const roomName = `Call_Room_${activeChatReceiverId}`;
  startCallWithRoom(roomName, callMode);
}

function startCallWithRoom(roomName, callMode) {
  const overlay = document.getElementById("jitsi-call-overlay");
  const container = document.getElementById("jitsi-frame");

  if (overlay && container) {
    overlay.style.display = "flex";
    container.innerHTML = "";

    if (typeof JitsiMeetExternalAPI !== 'undefined') {
      activeJitsiApi = new JitsiMeetExternalAPI("meet.jit.si", {
        roomName: roomName,
        width: "100%",
        height: "100%",
        parentNode: container,
        configOverwrite: {
          startWithAudioMuted: false,
          startWithVideoMuted: callMode === 'audio',
          prejoinPageEnabled: false
        }
      });

      activeJitsiApi.addEventListener('readyToClose', () => {
        endJitsiCall();
      });
    } else {
      alert("Library Jitsi belum siap.");
    }
  }
}

function endJitsiCall() {
  if (activeJitsiApi) {
    activeJitsiApi.dispose();
    activeJitsiApi = null;
  }

  const overlay = document.getElementById("jitsi-call-overlay");
  const container = document.getElementById("jitsi-frame");
  if (overlay) overlay.style.display = "none";
  if (container) container.innerHTML = "";
}

// ==========================================================================
// INISIALISASI SAAT HALAMAN SELESAI DIMUAT
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  // Pastikan library Google Client sudah dimuat di HTML sebelum dipanggil
  if (typeof google !== 'undefined' && google.accounts) {
    initGoogleDrive();
  }
});
