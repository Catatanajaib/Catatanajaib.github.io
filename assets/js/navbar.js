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
   WEB COMPONENT: NAVBAR & MODAL GLOBAL (Bisa Dibuka di Halaman Manapun)
   ========================================================================== */
class NavBar extends HTMLElement {
  connectedCallback() {
    // Deteksi otomatis apakah berada di sub-folder (/pages/)
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
        <div class="modal-content chat-modal-content" style="max-width: 700px; display: flex; height: 500px; padding: 0; overflow: hidden; border-radius: 8px;">
          
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
          <div class="chat-main" style="width: 65%; display: flex; flex-direction: column; background: #fff;">
            <!-- Header Chat -->
            <div class="chat-header" style="padding: 12px; border-bottom: 1px solid #ddd; display: flex; justify-content: space-between; align-items: center; background: #fff;">
              <span id="chat-receiver-name" style="font-weight: bold; font-size: 14px; color: #333;">Pilih pengguna untuk mulai chat</span>
              <span class="close" onclick="closeChatModal()" style="cursor: pointer; font-size: 20px; font-weight: bold; color: #666;">&times;</span>
            </div>

            <!-- Pesan Chat -->
            <div id="chat-messages" style="flex: 1; padding: 12px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; background: #fafafa;">
              <p style="font-size: 13px; color: #888; text-align: center; margin-top: auto; margin-bottom: auto;">
                Silakan pilih teman dari daftar di sebelah kiri untuk melihat percakapan.
              </p>
            </div>

            <!-- Form Kirim Pesan -->
            <form id="chat-form" onsubmit="sendPrivateMessage(event)" style="padding: 10px; border-top: 1px solid #ddd; display: flex; gap: 8px; background: #fff;">
              <input type="text" id="chat-input" placeholder="Tulis pesan..." required style="flex: 1; padding: 8px 12px; border: 1px solid #ccc; border-radius: 20px; outline: none;" disabled>
              <button type="submit" id="chat-send-btn" style="padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 20px; cursor: pointer;" disabled>Kirim</button>
            </form>
          </div>

        </div>
      </div>
    `;

    // Pasang Event Listener untuk modal umum (About & Cari)
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

    // Event listener klik di luar modal untuk menutup
    window.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
      }
    });
  }
}

customElements.define('my-navbar', NavBar);

/* ==========================================================================
   LOGIKA CHATROOM GLOBAL (KONTROLER)
   ========================================================================== */

let activeChatReceiverId = null;
let chatSubscription = null;

// Helper Tutup Modal Biasa
function closeModalDirect(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.style.display = 'none';
}

// Membuka Modal Chat dari Navbar Halaman Manapun
async function openChatFromNavbar() {
  const modal = document.getElementById('Chat-Room');
  if (modal) modal.style.display = 'block';
  await loadChatUsers();
}

// Menutup Modal Chat
function closeChatModal() {
  const modal = document.getElementById('Chat-Room');
  if (modal) modal.style.display = 'none';
  
  // Hapus langganan realtime jika modal ditutup
  const client = window.supabaseClient || (typeof supabaseClient !== 'undefined' ? supabaseClient : null);
  if (client && chatSubscription) {
    client.removeChannel(chatSubscription);
    chatSubscription = null;
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

  // Mengambil pengguna unik dari tabel posts
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
         onclick="openPrivateChat('${u.id}', '${escapeHtml(u.name)}')"
         style="padding: 10px; margin-bottom: 4px; border-radius: 6px; cursor: pointer; background: #fff; border: 1px solid #e9ecef; transition: background 0.2s;">
      <div style="font-weight: 600; font-size: 13px; color: #333;">👤 ${escapeHtml(u.name)}</div>
      <div style="font-size: 11px; color: #888;">Klik untuk kirim pesan</div>
    </div>
  `).join('');
}

// Membuka Obrolan Spesifik
async function openPrivateChat(receiverId, receiverName) {
  if (!receiverId || receiverId === 'undefined') {
    alert("Pengguna ini tidak dapat menerima pesan pribadi.");
    return;
  }

  const client = window.supabaseClient || (typeof supabaseClient !== 'undefined' ? supabaseClient : null);
  if (!client) {
    alert("Koneksi database belum siap.");
    return;
  }

  const { data: { session } } = await client.auth.getSession();
  if (!session) {
    alert("Kamu harus masuk (login) terlebih dahulu untuk mengirim pesan!");
    return;
  }

  if (session.user.id === receiverId) {
    alert("Kamu tidak bisa mengirim pesan ke diri sendiri.");
    return;
  }

  activeChatReceiverId = receiverId;

  const modal = document.getElementById("Chat-Room");
  const chatHeader = document.getElementById("chat-receiver-name");
  const inputEl = document.getElementById("chat-input");
  const btnEl = document.getElementById("chat-send-btn");

  if (modal) modal.style.display = "block";
  if (chatHeader) chatHeader.textContent = `Pesan: ${receiverName || 'Pengguna'}`;

  if (inputEl) inputEl.disabled = false;
  if (btnEl) btnEl.disabled = false;

  await fetchPrivateMessages(receiverId);
  subscribeToPrivateChat(receiverId);
}

// Mengambil Riwayat Pesan
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
    console.error('Gagal mengambil pesan:', error.message);
    messageContainer.innerHTML = '<p style="font-size:12px; color:red; text-align:center; margin:auto;">Gagal memuat pesan.</p>';
    return;
  }

  if (!messages || messages.length === 0) {
    messageContainer.innerHTML = '<p style="font-size:12px; color:#888; text-align:center; margin:auto;">Belum ada percakapan. Mulai sapa!</p>';
    return;
  }

  messageContainer.innerHTML = messages.map(msg => {
    const isMe = msg.sender_id === currentUserId;
    return `
      <div style="align-self: ${isMe ? 'flex-end' : 'flex-start'}; max-width: 80%;">
        <div style="padding: 8px 12px; border-radius: 8px; font-size: 12px; line-height: 1.4; ${
          isMe 
            ? 'background-color: #007bff; color: white; border-bottom-right-radius: 2px;' 
            : 'background-color: #ffffff; color: #333; border: 1px solid #ddd; border-bottom-left-radius: 2px;'
        }">
          ${escapeHtml(msg.message)}
        </div>
        <span style="font-size: 9px; color: #999; display: block; text-align: ${isMe ? 'right' : 'left'}; margin-top: 2px;">
          ${new Date(msg.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    `;
  }).join('');

  messageContainer.scrollTop = messageContainer.scrollHeight;
}

// Mengirim Pesan Baru
async function sendPrivateMessage(event) {
  event.preventDefault();
  
  const input = document.getElementById("chat-input");
  const messageText = input ? input.value.trim() : "";

  if (!messageText || !activeChatReceiverId) return;

  const client = window.supabaseClient || (typeof supabaseClient !== 'undefined' ? supabaseClient : null);
  const { data: { session } } = await client.auth.getSession();
  if (!session) return;

  const { error } = await client
    .from('messages')
    .insert([
      {
        sender_id: session.user.id,
        receiver_id: activeChatReceiverId,
        message: messageText
      }
    ]);

  if (error) {
    alert("Gagal mengirim pesan: " + error.message);
  } else {
    input.value = "";
    fetchPrivateMessages(activeChatReceiverId);
  }
}

// Realtime Listener Pesan Masuk
function subscribeToPrivateChat(receiverId) {
  const client = window.supabaseClient || (typeof supabaseClient !== 'undefined' ? supabaseClient : null);
  if (!client) return;

  if (chatSubscription) client.removeChannel(chatSubscription);

  chatSubscription = client
    .channel('private-messages')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages' },
      (payload) => {
        if (payload.new.sender_id === receiverId || payload.new.receiver_id === receiverId) {
          fetchPrivateMessages(receiverId);
        }
      }
    )
    .subscribe();
}
