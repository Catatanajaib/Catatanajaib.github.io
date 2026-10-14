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
           
            <li class="has-dropdown">
            <span>MENU</span>
              <ul class="vertical-dropdown">
                <li><a href="#" class="open-modal-btn" data-target="Pengaturan">⚙️ Profil</a></li>
                </ul>
            </li>
            
            <li><a href="${basePath}pages/toko.html">TOKO</a></li>
            <li><a href="#" onclick="openChatFromNavbar(); return false;">💬 ChatsRoom</a></li>
            <li><a href="${basePath}index.html">BERANDA</a></li>
            <li><a href="#" class="open-modal-btn" data-target="PenelusuranModal">CARI</a></li>
            <li><a href="${basePath}pages/postingan.html">POSTS</a></li>
            <li><a href="${basePath}pages/berita.html">BERITA</a></li>
          </ul>
        </nav>
      </nav>

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
<!-- MODAL UTAMA: PENGATURAN PROFIL -->
<div id="Pengaturan" class="modal" style="display: none;">
  <div class="modal-content">
    <span class="close-btn" onclick="closeModalDirect('Pengaturan')">&times;</span>
    <h3>Profil Saya</h3>

    <div class="profile-card">
      <!-- 1. FOTO PROFIL (Klik untuk Zoom Modal) -->
      <img 
        src="https://via.placeholder.com/150" 
        alt="Foto Profil" 
        class="avatar avatar-clickable open-modal-btn" 
        data-target="FotoZoomModal"
      >

      <!-- 2. NAMA PROFIL (Klik untuk Pindah ke Halaman HTML Profil) -->
      <h4>
        <a href="#" class="profile-link">
          <span id="profile-name">-</span>
        </a>
      </h4>
    </div>
  </div>
</div>

<!-- MODAL TAMBAHAN: KHUSUS ZOOM FOTO PROFIL -->
<div id="FotoZoomModal" class="modal" style="display: none;">
  <div class="modal-content" style="text-align: center;">
    <span class="close-btn" onclick="closeModalDirect('FotoZoomModal')">&times;</span>
    <h3 id="profile-name"></h3>
    <img 
      src="https://via.placeholder.com/150" 
      alt="Foto Profil" 
      class="modal-zoom-img"
      loading="lazy" 
      width="150" 
      height="150"
    >
  </div>
</div>
      <!-- MODAL CHAT ROOM GLOBAL -->
<div id="Chat-Room" class="modal" style="display: none; align-items: center; justify-content: center; backdrop-filter: blur(8px); background-color: rgba(0, 0, 0, 0.6); z-index: 9999;">
  <div class="modal-content chat-modal-content" style="width: 100%; max-width: 900px; display: flex; height: 85vh; max-height: 750px; padding: 0; overflow: hidden; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.3); background: #fff; position: relative;">
    
    <!-- SIDEBAR CHAT & GRUP -->
    <div class="chat-sidebar" style="width: 35%; min-width: 130px; border-right: 1px solid #e4e6eb; background: #fdfdfd; display: flex; flex-direction: column;">
      <div style="padding: 12px 10px; border-bottom: 1px solid #eee; background: #ffffff; display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 13px; font-weight: 700; color: #1e293b;">💬 Pesan</span>
        <div style="display: flex; gap: 4px;">
          <button onclick="loadChatUsers()" style="background: #f1f5f9; color: #475569; border: none; width: 28px; height: 28px; border-radius: 50%; cursor: pointer; font-size: 12px; display: flex; align-items: center; justify-content: center;" title="Refresh">🔁</button>
        </div>
      </div>
      <div id="chat-user-list" style="flex: 1; overflow-y: auto; padding: 6px;">
        <p style="font-size: 11px; color: #94a3b8; text-align: center; margin-top: 15px;">Memuat...</p>
      </div>
    </div>

    <!-- MAIN CHAT AREA -->
    <div class="chat-main" style="width: 65%; display: flex; flex-direction: column; background: #ffffff; position: relative; overflow: hidden;">
      
      <!-- HEADER CHAT (Diperbaiki agar tidak bertumpuk) -->
      <div class="chat-header" style="padding: 10px 14px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; background: #ffffff; min-height: 55px;">
        <div style="display: flex; align-items: center; gap: 8px; overflow: hidden; flex: 1; padding-right: 8px;">
          <div style="width: 8px; height: 8px; background: #22c55e; border-radius: 50%; flex-shrink: 0;"></div>
          <span id="chat-receiver-name" style="font-weight: 700; font-size: 13px; color: #1e293b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Pilih chat</span>
        </div>
        
        <div style="display: flex; align-items: center; gap: 6px; flex-shrink: 0;">
          <button id="btn-audio-call" onclick="startCall('audio')" disabled style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 50%; width: 32px; height: 32px; cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center; opacity: 0.4;" title="Panggilan Suara">☎️</button>
          <button id="btn-video-call" onclick="startCall('video')" disabled style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 50%; width: 32px; height: 32px; cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center; opacity: 0.4;" title="Panggilan Video">📽️</button>
          <span class="close" onclick="closeChatModal()" style="cursor: pointer; font-size: 18px; font-weight: bold; color: #64748b; padding: 0 4px;" title="Tutup">&times;</span>
        </div>
      </div>

      <!-- AREA PESAN -->
      <div id="chat-messages" style="flex: 1; padding: 12px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; background: #f8fafc;">
        <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: auto;">
          Pilih teman untuk mulai mengobrol.
        </p>
      </div>

      <!-- PREVIEW FILE -->
      <div id="file-preview-container" style="display: none; padding: 6px 12px; background: #f0fdf4; border-top: 1px solid #bbf7d0; font-size: 11px; align-items: center; justify-content: space-between;">
        <span id="file-preview-name" style="color: #166534; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 85%;"></span>
        <button type="button" onclick="cancelSelectedFile()" style="background: none; border: none; color: #dc2626; font-weight: bold; cursor: pointer; font-size: 14px;">&times;</button>
      </div>

      <!-- FORM KIRIM PESAN -->
      <form id="chat-form" onsubmit="sendPrivateMessage(event)" style="padding: 8px 12px; border-top: 1px solid #f1f5f9; display: flex; gap: 8px; background: #ffffff; align-items: center;">
        <label for="chat-file-input" style="cursor: pointer; font-size: 18px; display: flex; align-items: center;" title="Kirim Foto">🖼️</label>
        <input type="file" id="chat-file-input" style="display: none;" onchange="handleFileSelect(event)">
        
        <input type="text" id="chat-input" placeholder="Tulis pesan..." style="flex: 1; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 20px; outline: none; font-size: 12px; background: #f8fafc;" disabled>
        <button type="submit" id="chat-send-btn" style="padding: 8px 14px; background: #00bcd4; color: white; border: none; border-radius: 20px; cursor: pointer; font-weight: 600; font-size: 12px;" disabled>Kirim</button>
      </form>

      <!-- WEBRTC CALL OVERLAY -->
      <div id="webrtc-call-overlay" style="display: none; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: #111214; z-index: 99999; flex-direction: column; justify-content: space-between; overflow: hidden;">
        <div style="padding: 14px 20px; background: rgba(30, 31, 34, 0.85); color: #fff; display: flex; justify-content: space-between; align-items: center;">
          <span id="webrtc-status-title" style="font-weight: 600; font-size: 14px;">Panggilan Berlangsung...</span>
          <span id="call-duration" style="background: rgba(0,0,0,0.3); padding: 4px 8px; border-radius: 10px; color: #b5bac1; font-size: 12px;">00:00</span>
        </div>

        <div id="video-grid-container" style="flex: 1; padding: 16px; display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 12px; align-content: center; justify-content: center; overflow-y: auto;">
          <div class="video-box" style="position: relative; background: #2b2d31; border-radius: 8px; overflow: hidden; aspect-ratio: 16/9; display: flex; align-items: center; justify-content: center;">
            <video id="local-video" autoplay playsinline muted style="width: 100%; height: 100%; object-fit: cover;"></video>
            <span style="position: absolute; bottom: 8px; left: 8px; background: rgba(0, 0, 0, 0.6); color: #fff; padding: 2px 6px; border-radius: 4px; font-size: 11px;">Anda (Lokal)</span>
          </div>
        </div>

        <div style="padding: 16px; background: rgba(30, 31, 34, 0.9); display: flex; justify-content: center; align-items: center; gap: 12px;">
          <button type="button" onclick="toggleAudio()" id="btn-toggle-audio" style="background: #2b2d31; color: white; border: 1px solid rgba(255,255,255,0.1); width: 42px; height: 42px; border-radius: 50%; cursor: pointer; font-size: 16px;">🎤</button>
          <button type="button" onclick="toggleVideo()" id="btn-toggle-video" style="background: #2b2d31; color: white; border: 1px solid rgba(255,255,255,0.1); width: 42px; height: 42px; border-radius: 50%; cursor: pointer; font-size: 16px;">📹</button>
          <button type="button" onclick="endCall(true)" style="background: #ed4245; color: white; border: none; padding: 10px 22px; border-radius: 20px; cursor: pointer; font-size: 13px; font-weight: bold;">🚫 Tutup</button>
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