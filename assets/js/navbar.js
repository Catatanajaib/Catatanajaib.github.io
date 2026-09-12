/* ==========================================================================
   WEB COMPONENT: NAVBAR & MODAL GABUNGAN
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
          <li><a href="${basePath}index.html">Beranda</a></li>
          <li><a href="#" class="open-modal-btn" data-target="PenelusuranModal">Penelusuran</a></li>
          <li><a href="${basePath}pages/postingan.html">Postingan</a></li>
          <li><a href="${basePath}pages/berita.html">Berita</a></li>
          <li><a href="#" class="open-modal-btn" data-target="Chat-Room">ChatRoom</a></li>
          <li><a href="#" class="open-modal-btn" data-target="AboutModal">Kontak</a></li>
        </ul>
      </nav>
      
      <!-- MODAL ABOUT -->
      <div id="AboutModal" class="modal">
        <div class="modal-content">
          <span class="close-btn">&times;</span>
          <h2>Tentang Kami</h2>
          <p>Miftahul Mujib - 081910240675</p>
        </div>
      </div>

      <!-- MODAL PENELUSURAN -->
      <div id="PenelusuranModal" class="modal">
        <div class="modal-content">
          <span class="close-btn">&times;</span>
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

      <!-- MODAL CHATROOM / OBROLAN PRIBADI -->
      <div id="Chat-Room" class="modal">
        <div class="modal-content" style="max-width: 450px; padding: 0; overflow: hidden; border-radius: 8px;">
          
          <!-- Header Modal Chat -->
          <div style="background-color: #007bff; color: white; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center;">
            <strong id="chat-receiver-name" style="font-size: 1rem;">Obrolan Pribadi</strong>
            <span class="close-btn" style="color: white; opacity: 1; cursor: pointer; font-size: 20px;">&times;</span>
          </div>

          <!-- Area Pesan -->
          <div id="chat-messages-list" style="height: 320px; padding: 12px; overflow-y: auto; background-color: #f8f9fa; display: flex; flex-direction: column; gap: 8px;">
            <p style="text-align: center; color: #888; font-size: 12px; margin: auto;">Pilih pengguna atau klik ikon pesan di postingan untuk memulai obrolan.</p>
          </div>

          <!-- Form Kirim Pesan -->
          <form onsubmit="sendPrivateMessage(event)" style="display: flex; gap: 6px; padding: 10px; background-color: #fff; border-top: 1px solid #eee;">
            <input type="text" id="chat-input-message" placeholder="Tulis pesan pribadi..." required style="flex: 1; padding: 8px 10px; font-size: 12px; border: 1px solid #ccc; border-radius: 4px;">
            <button type="submit" class="btn-post" style="padding: 8px 14px; font-size: 12px; width: auto; margin: 0;">Kirim</button>
          </form>

        </div>
      </div>
    `;
  }
}

customElements.define('my-navbar', NavBar);

/* =====================
   FITUR OBROLAN PRIBADI (DIRECT MESSAGES)
   ===================== */

let activeChatReceiverId = null;
let chatSubscription = null;

// 1. Membuka Modal Chat untuk Penerima Tertentu
async function openPrivateChat(receiverId, receiverName) {
  if (!receiverId || receiverId === 'undefined') {
    alert("Pengguna ini tidak dapat menerima pesan pribadi.");
    return;
  }

  // Mengakses supabaseClient dari global window
  const client = window.supabaseClient || supabaseClient;
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

  // Buka Modal Chat-Room (Sesuai ID di navbar.js)
  const modal = document.getElementById("Chat-Room");
  const chatHeader = document.getElementById("chat-receiver-name");

  if (modal) modal.style.display = "block";
  if (chatHeader) chatHeader.textContent = `Pesan: ${escapeHtml(receiverName || 'Pengguna')}`;

  await fetchPrivateMessages(receiverId);
  subscribeToPrivateChat(receiverId);
}

// 2. Mengambil Riwayat Pesan dari Supabase
async function fetchPrivateMessages(receiverId) {
  const messageContainer = document.getElementById("chat-messages-list");
  if (!messageContainer) return;

  const client = window.supabaseClient || supabaseClient;
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

  // Render Gelembung Chat
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

// 3. Mengirim Pesan Baru
async function sendPrivateMessage(event) {
  event.preventDefault();
  const input = document.getElementById("chat-input-message");
  const messageText = input ? input.value.trim() : "";

  if (!messageText || !activeChatReceiverId) return;

  const client = window.supabaseClient || supabaseClient;
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

// 4. Realtime Listener Pesan Masuk
function subscribeToPrivateChat(receiverId) {
  const client = window.supabaseClient || supabaseClient;
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
