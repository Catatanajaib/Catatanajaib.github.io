/* ==========================================================================
   WEB COMPONENT: NAVBAR & MODAL GABUNGAN
   ========================================================================== */
class NavBar extends HTMLElement {
  connectedCallback() {
    // Mengecek apakah file HTML berada di dalam folder 'pages'
    const isSubPage = window.location.pathname.includes('/pages/');
    const basePath = isSubPage ? '../' : './';

    // Merender HTML Navigasi dan Modal secara dinamik
    this.innerHTML = `
      <!-- NAVIGASI UTAMA -->
      <nav class="navbar">
        <h4 class="logo">Catatan Ajaib</h4>
        <ul class="nav-links">
          <li><a href="${basePath}index.html">Beranda</a></li>
          <li><a href="#" class="open-modal-btn" data-target="PenelusuranModal">Penelusuran</a></li>
          <li><a href="${basePath}pages/postingan.html">Postingan</a></li>
          <li><a href="${basePath}pages/berita.html">Berita</a></li>
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
    `;
  }
}

// Mendaftarkan elemen kustom <my-navbar>
customElements.define('my-navbar', NavBar);
