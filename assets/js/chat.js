// ==========================================================================
// LOGIKA CHAT & REALTIME SUPABASE
// ==========================================================================

let activeChatReceiverId = null;
let chatSubscription = null;
let selectedFile = null;

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

function subscribeToPrivateChat() {
  const client = window.supabaseClient || (typeof supabaseClient !== 'undefined' ? supabaseClient : null);
  if (!client || chatSubscription) return;

  chatSubscription = client.channel('global-chat-channel', {
    config: { broadcast: { self: false } }
  });

  chatSubscription.on('broadcast', { event: 'webrtc-signal' }, ({ payload }) => {
    if (payload) handleSignalData(payload);
  });

  client
    .channel('public:messages')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
      const newMsg = payload.new;
      if (activeChatReceiverId && (newMsg.sender_id === activeChatReceiverId || newMsg.receiver_id === activeChatReceiverId)) {
        fetchPrivateMessages(activeChatReceiverId);
      }
    })
    .subscribe();

  chatSubscription.subscribe((status) => {
    if (status === 'SUBSCRIBED') {
      console.log("Terhubung ke Realtime Chat Supabase!");
    }
  });
}
// ==========================================================================
// FUNGSI UNTUK MEMBUKA CHAT LANGSUNG DARI POSTINGAN/PROFIL
// ==========================================================================

/**
 * Membuka modal chat dan langsung memilih pengguna tujuan berdasarkan ID dan Nama.
 * @param {string} userId - ID pengguna tujuan (dari post.user_id)
 * @param {string} userName - Nama pengguna tujuan (dari author)
 */
async function openPrivateChat(userId, userName) {
  // 1. Tampilkan Modal Chat Room
  const modal = document.getElementById('Chat-Room');
  if (modal) {
    modal.style.display = 'block';
  } else {
    console.error("Modal #Chat-Room tidak ditemukan pada halaman ini.");
    return;
  }

  // 2. Muat daftar pengguna dan aktifkan koneksi realtime
  await loadChatUsers();
  subscribeToPrivateChat();

  // 3. Pilih pengguna tujuan dan muat percakapannya
  if (userId && userName) {
    await selectUserForChat(userId, userName);
  }
}
