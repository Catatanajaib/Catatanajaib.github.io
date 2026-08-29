class NavBar extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <nav class="navbar">
        <ul class="nav-links">
          <li><a href="index.html" class="active">Beranda</a></li>
          <li><a href="#" class="open-modal-btn" data-target="PenelusuranModal">Penelusuran</a></li>
          <li><a href="html/postingan.html">Postingan</a></li>
          <li><a href="#">Kategori</a></li>
          <li><a href="feed-artikel/feed-artikel.html">Berita</a></li>
          <li><a href="#" class="open-modal-btn" data-target="AboutModal">Kontak</a></li>
        </ul>
      </nav>
    `;
  }
}

customElements.define('navbar', NavBar);
