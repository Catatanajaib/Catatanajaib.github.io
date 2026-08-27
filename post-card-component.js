class PostCard extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
  <article class="post-card">
        <header class="post-header">
          <img src="gambar/IMG_20251213_171056.jpg" alt="Foto Profil" class="avatar">
          <div class="user-info">
            <h4>Miftahul Mujib</h4>
            <span>2 jam yang lalu &bull; Publik</span>
          </div>
        </header>

        <div class="post-content">
          semoga nantinya aku bisa membuatnya, ini keren sebenernya kalau bisa seperti yang aku bayangkan
          sayangnya kurang biaya hahaha.. 
         sawer disini  seabank 901509027272
        </div>

        <div class="post-media">
          <img src="https://picsum.photos/600/300?random=5" alt="Foto Postingan">
        </div>

        <div class="post-stats">
          <span>👍 128jt Suka</span>
          <span>904rb Komentar</span>
        </div>

        <footer class="post-actions">
          <button class="action-btn">👍 Suka</button>
          <button class="action-btn">💬 Komentar</button>
          <button class="action-btn">↗️ Bagikan</button>
        </footer>
      </article>
    `;
  }
}

customElements.define('post-card', PostCard);

// untuk memanggil 
// <post-card></post-card>

//  <script src="post-card-component.js"></script>