class PostCardElement extends HTMLElement {
  connectedCallback() {
    // 1. Render Struktur HTML & CSS
    this.innerHTML = `
      <style>
        .post-body {
          font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          font-size: 16px;
          line-height: 1.8;
          color: #333333;
          max-width: 800px;
          margin: 0 auto;
          padding: 15px;
        }

        .post-body h2 {
          font-size: 24px;
          color: #1a252f;
          margin-top: 25px;
          margin-bottom: 15px;
          border-bottom: 2px solid #e2e8f0;
          padding-bottom: 8px;
        }

        .post-body p {
          margin-bottom: 16px;
          text-align: justify;
        }

        .galeri-desain {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(600px, 1fr));
          gap: 15px;
          margin: 20px 0;
        }

        .konten-zoom {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 5px rgba(0,0,0,0.05);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          text-align: center;
        }

        .konten-zoom:hover {
          transform: translateY(-4px);
          box-shadow: 0 6px 15px rgba(0,0,0,0.1);
        }

        .konten-zoom img {
          width: 100%;
          height: 180px;
          object-fit: cover;
          display: block;
        }

        .post-stats {
          display: flex;
          justify-content: space-between;
          font-size: 14px;
          color: #65676b;
          padding: 10px 5px;
          border-bottom: 1px solid #e4e6eb;
          margin-top: 20px;
        }

        .post-actions {
          display: flex;
          justify-content: space-around;
          padding: 6px 0;
          border-bottom: 1px solid #e4e6eb;
        }

        .action-btn {
          flex: 1;
          background: transparent;
          border: none;
          padding: 10px 8px;
          border-radius: 6px;
          font-weight: 600;
          color: #65676b;
          cursor: pointer;
          font-size: 14px;
          transition: background-color 0.2s, transform 0.1s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        .action-btn:hover { background-color: #f2f2f2; }
        .action-btn:active { transform: scale(0.95); }

        .action-btn.active { color: #0866ff; }
        .action-btn.active .btn-icon { animation: bounce 0.3s ease; }

        @keyframes bounce {
          0% { transform: scale(1); }
          50% { transform: scale(1.3); }
          100% { transform: scale(1); }
        }
      </style>

      <article class="post-card">
        <header class="post-header">
          <img src="gambar/IMG_20251213_171056.jpg" alt="Foto Profil" class="avatar">
          <div class="user-info">
            <h4>Miftahul Mujib</h4>
            <span>2 jam yang lalu &bull; Publik</span>
          </div>
        </header>

        <article class="post-body">
          <h2>Inspirasi Desain Rumah Simpel, Sederhana, dan Tetap Mempesona</h2>
          <p>Berikut beberapa desain menarik rumah yang simpel,... <a href="/artikel.html">baca lebih lengkap</a></p>
          
          <div class="konten-zoom">
            <img src="https://picsum.photos/600/300?random=1" alt="Foto Postingan 1" />
          </div>
          
          <div class="post-stats">
            <span>👍 <strong class="like-count">128000000</strong> Suka</span>
            <span><strong class="comment-count">904rb</strong> Komentar</span>
          </div>
        
          <footer class="post-actions">
            <button class="action-btn btn-like">
              <span class="btn-icon">👍</span>
              <span class="btn-like-text">Suka</span>
            </button>
            <button class="action-btn btn-comment">💬 Komentar</button>
            <button class="action-btn btn-share">↗️ Bagikan</button>
          </footer>
        </article>
      </article>
    `;

    // 2. Logika Interaksi Web Component
    this.initComponent();
  }

  initComponent() {
    let isLiked = false;
    let rawLikes = 128000000;

    const likeBtn = this.querySelector('.btn-like');
    const likeText = this.querySelector('.btn-like-text');
    const likeCountElem = this.querySelector('.like-count');
    const commentBtn = this.querySelector('.btn-comment');
    const shareBtn = this.querySelector('.btn-share');

    const formatNumber = (num) => {
      if (num >= 1000000) return (num / 1000000).toFixed(0) + 'jt';
      if (num >= 1000) return (num / 1000).toFixed(0) + 'rb';
      return num;
    };

    // Format angka awal
    likeCountElem.innerText = formatNumber(rawLikes);

    // Event Listener Tombol Like
    likeBtn.addEventListener('click', () => {
      if (!isLiked) {
        rawLikes++;
        likeBtn.classList.add('active');
        likeText.innerText = 'Disukai';
        isLiked = true;
      } else {
        rawLikes--;
        likeBtn.classList.remove('active');
        likeText.innerText = 'Suka';
        isLiked = false;
      }
      likeCountElem.innerText = formatNumber(rawLikes);
    });

    // Event Listener Scroll Komentar
    commentBtn.addEventListener('click', () => {
      const commentSection = document.getElementById('kolom-komentar');
      if (commentSection) {
        commentSection.scrollIntoView({ behavior: 'smooth' });
      } else {
        alert('Silakan tulis komentar Anda di bagian bawah artikel!');
      }
    });

    // Event Listener Bagikan
    shareBtn.addEventListener('click', () => {
      if (navigator.share) {
        navigator.share({
          title: document.title,
          url: window.location.href
        });
      } else {
        navigator.clipboard.writeText(window.location.href);
        alert('Link artikel berhasil disalin!');
      }
    });
  }
}

customElements.define('post-card-element', PostCardElement);

// untuk memanggil 
// <post-card-element></post-card-element>

//  <script src="post-card-element.js"></script>
