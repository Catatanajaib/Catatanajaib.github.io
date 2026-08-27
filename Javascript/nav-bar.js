class NavBar extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
<nav class="navbar">
		<!-- Logo H4 di Tengah -->
		<h4 class="logo">Catatan Ajaib</h4>
		<!-- Navigasi Utama -->
		<!-- Navigation Links di Bawah Logo -->
		<ul class="nav-links">
			<li><a href="index.html" class="active">Beranda</a></li>
			<!-- Menu dengan trigger modal (pakai data-target) -->
			<li><a href="#" class="open-modal-btn" data-target="PenelusuranModal">Penelusuran</a></li>
			<li><a href="/html/postingan.html">Postingan </a></li>
			<li><a href="#">Kategori</a></li>
			<li><a href="/html/artikel.html">Berita</a></li>
			<li><a href="#" class="open-modal-btn" data-target="AboutModal">Kontak</a></li>
		</ul>
</nav>
<!-- MODAL 1: About -->
<div id="AboutModal" class="modal">
  <div class="modal-content">
    <span class="close-btn">&times;</span>
    <h2>Tentang Kami</h2>
    <p>Miftahul Mujib - 081910240675</p>
  </div>
</div>

<!-- MODAL 2: Penelusuran -->
<div id="PenelusuranModal" class="modal">
  <div class="modal-content">
    <span class="close-btn">&times;</span>
    <h2>Catatan ajaib </h2>
    
 <form class="search-container" action="https://www.google.com/search" method="GET" target="_blank">
 	<div class="form-group">
 	<label for="content">Penelusuran</label>
 	<textarea 
 	id="content" 
 	name="q" 
 	rows="4" 
 	class="search-input" 
 	placeholder="Apa yang ingin kamu Cari ?" 
 	required
 	></textarea>
 	</div>
 
 	<button type="submit" class="btn-post search-button">
 	<!-- Ikon Kaca Pembesar (SVG) -->
 	<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
 	<circle cx="11" cy="11" r="8"></circle>
 	<line x1="21" y1="21" x2="16.65" y2="16.65"></line>
 	</svg>
 	<span>Cari</span>
 	</button>
 </form>
 
    </div>
  </div>
    `;
  }
}

customElements.define('nav-bar', NavBar);

// untuk memanggil 
// <nav-bar></nav-bar>

//  <script src="post-card-component.js"></script>
