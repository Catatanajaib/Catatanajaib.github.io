// ==========================================================================
// VARIABEL GLOBAL
// ==========================================================================
let activeChatReceiverId = null;
let chatSubscription = null;
let selectedFile = null;
let tokenClient = null;
let accessToken = null;

// VARIABEL WEBRTC
let localStream = null;
let peerConnection = null;
let currentCallTargetId = null;

// Config STUN Server Google
const rtcConfig = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]
};

// ==========================================================================
// FUNGSI PEMBANTU (Mencegah Celah Keamanan XSS)
// ==========================================================================
function escapeHtml(text) {
  if (text === null || text === undefined) return '';
  const htmlEscapes = {
    '&': '&amp;', '<': '&lt;', '>': '&gt;',
    '"': '&quot;', "'": '&#039;', '`': '&#96;', '/': '&#47;'
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
      <nav class="navbar">
        <style>
          @keyframes migrasi {
            0% { left: -20%; }
            100% { left: 100%; }
          }
        </style>

        <h4 class="logo" style="position: absolute; top: 50%; transform: translateY(-50%); animation: migrasi 5s infinite linear; white-space: nowrap;">
            Catatan Ajaib
        </h4>
        <nav>
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
        <div class="modal-content chat-modal-content" style="width: 95%; display: flex; height: 800px; padding: 0; overflow: hidden; border-radius: 8px;">
          
          <!-- Sidebar Kiri: Daftar Pengguna -->
          <div class="chat-sidebar" style="width: 25%; border-right: 1px solid #ddd; background: #f8f9fa; display: flex; flex-direction: column;">
            <div style="padding: 12px; border-bottom: 1px solid #ddd; font-weight: bold; background: #fff; display: flex; justify-content: space-between; align-items: center;">
              <span>✉️ Percakapan</span>
              <button onclick="loadChatUsers()" style="background: none; border: none; cursor: pointer; font-size: 15px;" title="Refresh Daftar">🔁</button>
            </div>
            <div id="chat-user-list" style="flex: 1; overflow-y: auto; padding: 8px;">
              <p style="font-size: 12px; color: #888; text-align: center;">Memuat daftar pengguna...</p>
            </div>
          </div>

          <!-- Area Kanan: Ruang Obrolan -->
          <div class="chat-main" style="width: 75%; display: flex; flex-direction: column; background: #fff; position: relative;">
            
            <!-- Header Chat -->
            <div class="chat-header" style="padding: 12px; border-bottom: 1px solid #ddd; display: flex; justify-content: space-between; align-items: center; background: #fff;">
              <span id="chat-receiver-name" style="font-weight: bold; font-size: 17px; color: #333;">Pilih pengguna untuk mulai chat</span>
              
              <div style="display: flex; align-items: center; gap: 8px;">
                <button id="btn-audio-call" onclick="startCall('audio')" disabled style="background: none; border: none; cursor: pointer; font-size: 32px; opacity: 0.5;" title="Panggilan Suara">☎️</button>
                <button id="btn-video-call" onclick="startCall('video')" disabled style="background: none; border: none; cursor: pointer; font-size: 32px; opacity: 0.5;" title="Panggilan Video">📽️</button>
                <span class="close" onclick="closeChatModal()" style="cursor: pointer; font-size: 20px; font-weight: bold; color: #666; margin-left: 8px;">&times;</span>
              </div>
            </div>

            <!-- Pesan Chat -->
            <div id="chat-messages" style="flex: 1; padding: 12px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; background: #fafafa;">
              <p style="font-size: 13px; color: #888; text-align: center; margin-top: auto; margin-bottom: auto;">
                Silakan pilih teman dari daftar di sebelah kiri untuk melihat percakapan.
              </p>
            </div>

            <!-- Indikator File Terpilih -->
            <div id="file-preview-container" style="display: none; padding: 6px 12px; background: #eef5ff; border-top: 1px solid #cce5ff; font-size: 12px; align-items: center; justify-content: space-between;">
              <span id="file-preview-name" style="color: #004085; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 80%;"></span>
              <button type="button" onclick="cancelSelectedFile()" style="background: none; border: none; color: #dc3545; font-weight: bold; cursor: pointer;">&times;</button>
            </div>

            <!-- Form Kirim Pesan -->
            <form id="chat-form" onsubmit="sendPrivateMessage(event)" style="padding: 10px; border-top: 1px solid #ddd; display: flex; gap: 8px; background: #fff; align-items: center;">
              <label for="chat-file-input" style="cursor: pointer; font-size: 18px;" title="Kirim Foto/Video">🖼️</label>
              <input type="file" id="chat-file-input" style="display: none;" onchange="handleFileSelect(event)">
              
              <input type="text" id="chat-input" placeholder="Tulis pesan..." style="flex: 1; padding: 8px 12px; border: 1px solid #ccc; border-radius: 20px; outline: none;" disabled>
              <button type="submit" id="chat-send-btn" style="padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 20px; cursor: pointer;" disabled>Kirim</button>
            </form>

            <!-- OVERLAY WEBRTC CALL -->
            <div id="webrtc-call-overlay" style="display: none; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: #111; z-index: 999; flex-direction: column; border-radius: 8px; overflow: hidden;">
              <div style="padding: 10px 14px; background: #222; color: #fff; display: flex; justify-content: space-between; align-items: center; font-size: 13px; border-bottom: 1px solid #333;">
                <span id="webrtc-status-title" style="font-weight: 500;">Panggilan Berlangsung...</span>
                <button type="button" onclick="endCall(true)" style="background: #dc3545; color: white; border: none; padding: 6px 14px; border-radius: 16px; cursor: pointer; font-size: 12px; font-weight: bold;">Tutup Panggilan</button>
              </div>
              
              <div style="flex: 1; position: relative; background: #000; display: flex; justify-content: center; align-items: center;">
                <video id="remote-video" autoplay playsinline style="width: 100%; height: 100%; object-fit: cover;"></video>
                <video id="local-video" autoplay playsinline muted style="position: absolute; bottom: 20px; right: 20px; width: 120px; height: 160px; object-fit: cover; border-radius: 8px; border: 2px solid #fff; background: #222;"></video>
              </div>
            </div>

          </div>
        </div>
        <div id="chat-toast-container" style="position: fixed; bottom: 20px; right: 20px; z-index: 99999; display: flex; flex-direction: column; gap: 10px;"></div>
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

// ==========================================================================
// HELPER MODAL & CHAT CONTROL
// ==========================================================================
function closeModalDirect(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.style.display = 'none';
}

async function openChatFromNavbar() {
  const modal = document.getElementById('Chat-Room');
  if (modal) modal.style.display = 'block';
  await loadChatUsers();
  subscribeToPrivateChat();
}

function closeChatModal() {
  const modal = document.getElementById('Chat-Room');
  if (modal) modal.style.display = 'none';
}

function handleFileSelect(event) {
  const file = event.target.files[0];
  if (!file) return;

  selectedFile = file;
  const container = document.getElementById("file-preview-container");
  const nameEl = document.getElementById("file-preview-name");
  
  if (container && nameEl) {
    nameEl.textContent = `📎 Terpilih: ${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)`;
    container.style.display = "flex";
  }
}

function cancelSelectedFile() {
  selectedFile = null;
  const fileEl = document.getElementById("chat-file-input");
  if (fileEl) fileEl.value = "";
  const container = document.getElementById("file-preview-container");
  if (container) container.style.display = "none";
}

function setUploadLoadingState(isLoading, text = "Mengunggah file...") {
  const container = document.getElementById("file-preview-container");
  const nameEl = document.getElementById("file-preview-name");
  const sendBtn = document.getElementById("chat-send-btn");

  if (isLoading) {
    if (container) container.style.display = "flex";
    if (nameEl) nameEl.innerHTML = `⏳ <b>${text}</b>`;
    if (sendBtn) sendBtn.disabled = true;
  } else {
    if (container) container.style.display = "none";
    if (sendBtn) sendBtn.disabled = false;
  }
}

// Memuat Daftar Pengguna
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

  const { data: posts, error } = await client.from('posts').select('user_id, author_name, username');
  if (error || !posts) {
    userListContainer.innerHTML = '<p style="font-size:12px; color:#888; text-align:center;">Gagal memuat pengguna.</p>';
    return;
  }

  const map = new Map();
  const uniqueUsers = [];
  
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
         style="padding: 10px; margin-bottom: 4px; border-radius: 6px; cursor: pointer; background: #fff; border: 1px solid #e9ecef;">
      <div style="font-weight: 600; font-size: 13px; color: #333;">👤 ${escapeHtml(u.name)}</div>
      <div style="font-size: 11px; color: #888;">Klik untuk pesan & telepon</div>
    </div>
  `).join('');
}

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
}

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

  if (error || !messages) {
    messageContainer.innerHTML = '<p style="font-size:12px; color:red; text-align:center;">Gagal memuat pesan.</p>';
    return;
  }

  if (messages.length === 0) {
    messageContainer.innerHTML = '<p style="font-size:12px; color:#888; text-align:center; margin:auto;">Belum ada percakapan. Mulai sapa!</p>';
    return;
  }

  messageContainer.innerHTML = messages.map(msg => {
    const isMe = msg.sender_id === currentUserId;
    let contentHtml = escapeHtml(msg.message || msg.content || '');

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

  if (file) {
    try {
      setUploadLoadingState(true, "Mengunggah media...");
      fileUrl = await uploadToGoogleDrive(file); 
      fileType = file.type.startsWith('video/') ? 'video' : 'image';
    } catch (uploadErr) {
      alert("Gagal unggah: " + uploadErr.message);
      setUploadLoadingState(false);
      return;
    } finally {
      setUploadLoadingState(false);
    }
  }

  const { error } = await client.from('messages').insert([{
    sender_id: session.user.id,
    receiver_id: activeChatReceiverId,
    message: messageText,
    file_url: fileUrl,
    file_type: fileType
  }]);

  if (error) {
    alert("Gagal mengirim pesan: " + error.message);
  } else {
    inputEl.value = "";
    cancelSelectedFile();
    fetchPrivateMessages(activeChatReceiverId);
  }
}

// ==========================================================================
// LOGIKA UTAMA WEBRTC & SUPABASE SIGNALING
// ==========================================================================

function initPeerConnection(myUserId, targetUserId) {
  peerConnection = new RTCPeerConnection(rtcConfig);

  peerConnection.onicecandidate = (event) => {
    if (event.candidate && chatSubscription) {
      chatSubscription.send({
        type: 'broadcast',
        event: 'webrtc-signal',
        payload: {
          senderId: myUserId,
          targetUserId: targetUserId,
          type: 'candidate',
          candidate: event.candidate
        }
      });
    }
  };

  peerConnection.ontrack = (event) => {
    const remoteVideo = document.getElementById('remote-video');
    if (remoteVideo && event.streams[0]) {
      remoteVideo.srcObject = event.streams[0];
    }
  };
}

async function startCall(mode) {
  if (!activeChatReceiverId) return;

  const client = window.supabaseClient || (typeof supabaseClient !== 'undefined' ? supabaseClient : null);
  const { data: { session } } = await client.auth.getSession();
  if (!session) return alert("Silakan login terlebih dahulu.");

  currentCallTargetId = activeChatReceiverId;

  document.getElementById('webrtc-call-overlay').style.display = 'flex';
  document.getElementById('webrtc-status-title').textContent = `Memanggil (${mode.toUpperCase()})...`;

  try {
    localStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: mode === 'video'
    });

    document.getElementById('local-video').srcObject = localStream;

    initPeerConnection(session.user.id, currentCallTargetId);
    localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    chatSubscription.send({
      type: 'broadcast',
      event: 'webrtc-signal',
      payload: {
        senderId: session.user.id,
        targetUserId: currentCallTargetId,
        type: 'offer',
        sdp: offer,
        mode: mode,
        callerName: session.user.email || 'Pengguna'
      }
    });
  } catch (err) {
    alert("Izin kamera/mikrofon ditolak atau tidak ditemukan.");
    endCall(false);
  }
}

async function answerCall(callerId, offerSdp, mode) {
  currentCallTargetId = callerId;

  const client = window.supabaseClient || (typeof supabaseClient !== 'undefined' ? supabaseClient : null);
  const { data: { session } } = await client.auth.getSession();
  if (!session) return;

  document.getElementById('webrtc-call-overlay').style.display = 'flex';
  document.getElementById('webrtc-status-title').textContent = 'Panggilan Terhubung';

  try {
    localStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: mode === 'video'
    });

    document.getElementById('local-video').srcObject = localStream;

    initPeerConnection(session.user.id, callerId);
    localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

    await peerConnection.setRemoteDescription(new RTCSessionDescription(offerSdp));

    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    chatSubscription.send({
      type: 'broadcast',
      event: 'webrtc-signal',
      payload: {
        senderId: session.user.id,
        targetUserId: callerId,
        type: 'answer',
        sdp: answer
      }
    });
  } catch (err) {
    alert("Gagal menghubungkan panggilan.");
    endCall(true);
  }
}

async function handleSignalData(payload) {
  const client = window.supabaseClient || (typeof supabaseClient !== 'undefined' ? supabaseClient : null);
  const { data: { session } } = await client.auth.getSession();
  if (!session) return;

  const myUserId = session.user.id;
  if (payload.targetUserId !== myUserId) return; // Hanya proses sinyal yang ditujukan ke user ini

  if (payload.type === 'offer') {
    // Tampilkan notifikasi panggilan masuk
    const isConfirm = confirm(`📞 Panggilan ${payload.mode.toUpperCase()} dari ${payload.callerName}. Jawab?`);
    if (isConfirm) {
      openChatFromNavbar();
      answerCall(payload.senderId, payload.sdp, payload.mode);
    } else {
      // Tolak Panggilan
      chatSubscription.send({
        type: 'broadcast',
        event: 'webrtc-signal',
        payload: {
          senderId: myUserId,
          targetUserId: payload.senderId,
          type: 'hangup'
        }
      });
    }
  } else if (payload.type === 'answer' && peerConnection) {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(payload.sdp));
    document.getElementById('webrtc-status-title').textContent = 'Panggilan Terhubung';
  } else if (payload.type === 'candidate' && peerConnection) {
    try {
      await peerConnection.addIceCandidate(new RTCIceCandidate(payload.candidate));
    } catch (e) {}
  } else if (payload.type === 'hangup') {
    endCall(false);
  }
}

function endCall(notifyPeer = true) {
  const client = window.supabaseClient || (typeof supabaseClient !== 'undefined' ? supabaseClient : null);

  if (notifyPeer && chatSubscription && currentCallTargetId && client) {
    client.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        chatSubscription.send({
          type: 'broadcast',
          event: 'webrtc-signal',
          payload: {
            senderId: session.user.id,
            targetUserId: currentCallTargetId,
            type: 'hangup'
          }
        });
      }
    });
  }

  if (localStream) {
    localStream.getTracks().forEach(track => track.stop());
    localStream = null;
  }

  if (peerConnection) {
    peerConnection.close();
    peerConnection = null;
  }

  currentCallTargetId = null;

  const overlay = document.getElementById('webrtc-call-overlay');
  if (overlay) overlay.style.display = 'none';
}

function subscribeToPrivateChat() {
  const client = window.supabaseClient || (typeof supabaseClient !== 'undefined' ? supabaseClient : null);
  if (!client || chatSubscription) return;

  chatSubscription = client
    .channel('private-chat-global')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages' },
      async (payload) => {
        const { data: { session } } = await client.auth.getSession();
        if (!session) return;

        const myUserId = session.user.id;
        const newMsg = payload.new;

        if (newMsg.receiver_id === myUserId && activeChatReceiverId === newMsg.sender_id) {
          fetchPrivateMessages(newMsg.sender_id);
        }
      }
    )
    .on('broadcast', { event: 'webrtc-signal' }, (payload) => {
      handleSignalData(payload.payload);
    })
    .subscribe();
}

// Inisialisasi awal
document.addEventListener('DOMContentLoaded', () => {
  subscribeToPrivateChat();
});

customElements.define('my-navbar', NavBar);
