// ==========================================================================
// WEB COMPONENT: NAVBAR & MODAL GLOBAL
// ==========================================================================

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
          
          <div class="chat-sidebar" style="width: 25%; border-right: 1px solid #ddd; background: #f8f9fa; display: flex; flex-direction: column;">
            <div style="padding: 12px; border-bottom: 1px solid #ddd; font-weight: bold; background: #fff; display: flex; justify-content: space-between; align-items: center;">
              <span>✉️ Percakapan</span>
              <button onclick="loadChatUsers()" style="background: none; border: none; cursor: pointer; font-size: 15px;" title="Refresh Daftar">🔁</button>
            </div>
            <div id="chat-user-list" style="flex: 1; overflow-y: auto; padding: 8px;">
              <p style="font-size: 12px; color: #888; text-align: center;">Memuat daftar pengguna...</p>
            </div>
          </div>

          <div class="chat-main" style="width: 75%; display: flex; flex-direction: column; background: #fff; position: relative;">
            <div class="chat-header" style="padding: 12px; border-bottom: 1px solid #ddd; display: flex; justify-content: space-between; align-items: center; background: #fff;">
              <span id="chat-receiver-name" style="font-weight: bold; font-size: 17px; color: #333;">Pilih pengguna untuk mulai chat</span>
              
              <div style="display: flex; align-items: center; gap: 8px;">
                <button id="btn-audio-call" onclick="startCall('audio')" disabled style="background: none; border: none; cursor: pointer; font-size: 32px; opacity: 0.5;" title="Panggilan Suara">☎️</button>
                <button id="btn-video-call" onclick="startCall('video')" disabled style="background: none; border: none; cursor: pointer; font-size: 32px; opacity: 0.5;" title="Panggilan Video">📽️</button>
                <span class="close" onclick="closeChatModal()" style="cursor: pointer; font-size: 20px; font-weight: bold; color: #666; margin-left: 8px;">&times;</span>
              </div>
            </div>

            <div id="chat-messages" style="flex: 1; padding: 12px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; background: #fafafa;">
              <p style="font-size: 13px; color: #888; text-align: center; margin-top: auto; margin-bottom: auto;">
                Silakan pilih teman dari daftar di sebelah kiri untuk melihat percakapan.
              </p>
            </div>

            <div id="file-preview-container" style="display: none; padding: 6px 12px; background: #eef5ff; border-top: 1px solid #cce5ff; font-size: 12px; align-items: center; justify-content: space-between;">
              <span id="file-preview-name" style="color: #004085; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 80%;"></span>
              <button type="button" onclick="cancelSelectedFile()" style="background: none; border: none; color: #dc3545; font-weight: bold; cursor: pointer;">&times;</button>
            </div>

            <form id="chat-form" onsubmit="sendPrivateMessage(event)" style="padding: 10px; border-top: 1px solid #ddd; display: flex; gap: 8px; background: #fff; align-items: center;">
              <label for="chat-file-input" style="cursor: pointer; font-size: 18px;" title="Kirim Foto/Video">🖼️</label>
              <input type="file" id="chat-file-input" style="display: none;" onchange="handleFileSelect(event)">
              
              <input type="text" id="chat-input" placeholder="Tulis pesan..." style="flex: 1; padding: 8px 12px; border: 1px solid #ccc; border-radius: 20px; outline: none;" disabled>
              <button type="submit" id="chat-send-btn" style="padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 20px; cursor: pointer;" disabled>Kirim</button>
            </form>

            <div id="webrtc-call-overlay" style="display: none; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: #000; z-index: 99999; flex-direction: column; justify-content: space-between; overflow: hidden;">
              <div style="padding: 14px; background: rgba(0, 0, 0, 0.7); color: #fff; display: flex; justify-content: space-between; align-items: center; font-size: 14px; position: absolute; top: 0; left: 0; right: 0; z-index: 10;">
                <span id="webrtc-status-title" style="font-weight: 600;">Panggilan Berlangsung...</span>
              </div>

              <div style="flex: 1; width: 100%; height: 100%; position: relative; background: #111; display: flex; align-items: center; justify-content: center;">
                <video id="remote-video" autoplay playsinline style="width: 100%; height: 100%; object-fit: cover; background: #000;"></video>
                <video id="local-video" autoplay playsinline muted style="position: absolute; bottom: 90px; right: 16px; width: 100px; height: 140px; object-fit: cover; border-radius: 12px; border: 2px solid rgba(255, 255, 255, 0.8); background: #222; z-index: 5;"></video>
              </div>

              <div style="padding: 16px; background: rgba(0, 0, 0, 0.7); display: flex; justify-content: center; align-items: center; position: absolute; bottom: 0; left: 0; right: 0; z-index: 10;">
                <button type="button" onclick="endCall(true)" style="background: #dc3545; color: white; border: none; padding: 12px 28px; border-radius: 30px; cursor: pointer; font-size: 14px; font-weight: bold;">
                  🚫 Tutup Panggilan
                </button>
              </div>
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

document.addEventListener('DOMContentLoaded', () => {
  subscribeToPrivateChat();
});

customElements.define('my-navbar', NavBar);