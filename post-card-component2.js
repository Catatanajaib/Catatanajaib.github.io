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
<style>
/* Container Utama Artikel */
.post-body {
  font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  font-size: 16px;
  line-height: 1.8;
  color: #333333;
  max-width: 800px;
  margin: 0 auto;
  padding: 15px;
}

/* Pengaturan Judul Sub-Topik */
.post-body h2 {
  font-size: 24px;
  color: #1a252f;
  margin-top: 25px;
  margin-bottom: 15px;
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 8px;
}

.post-body h3 {
  font-size: 19px;
  color: #2c3e50;
  margin-top: 20px;
  margin-bottom: 10px;
}

/* Pengaturan Paragraf */
.post-body p {
  margin-bottom: 16px;
  text-align: justify;
}

/* Galeri Gambar yang Rapi (Grid Responsive) */
.galeri-desain {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 15px;
  margin: 20px 0;
}

/* Kartu Gambar & Efek Hover/Zoom */
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

.konten-zoom p {
  font-size: 14px;
  font-weight: 600;
  color: #555555;
  padding: 8px;
  margin: 0;
  text-align: center;
  background-color: #f8fafc;
}

/* Kotak Komentar / Call-to-Action di Akhir */
.call-to-action {
  background-color: #f0fdf4;
  border-left: 4px solid #22c55e;
  padding: 15px 20px;
  margin-top: 30px;
  border-radius: 4px;
}</style>
<article class="post-body">
  <h2>Inspirasi Desain Rumah Simpel, Sederhana, dan Tetap Mempesona</h2>
     
  <p>Memiliki rumah dengan desain yang simpel dan sederhana namun tetap terlihat cantik terkadang membuat bingung, ya? Menentukan desain rumah impian memang memerlukan waktu dan kesepakatan bersama seluruh anggota keluarga. Bukan kah begitu?</p>
   
  <p>Nah, pada kesempatan kali ini, saya akan membagikan beberapa inspirasi model rumah minimalis yang simpel namun tetap anggun. Desain ini mengusung konsep <strong>2 kamar tidur, 2 kamar mandi, ruang tamu, ruang keluarga, serta area dapur/memasak</strong>.</p>

  <h3>1. Denah & Tata Letak Ruangan</h3>
  <p>Tata letak ini sangat cocok dipertimbangkan bagi Anda yang ingin membangun rumah simpel tanpa mengorbankan estetika.</p>
  
  <div class="galeri-desain">
    <div class="konten-zoom">
      <img src="URL_GAMBAR_1" alt="Desain Tata Letak Rumah 1" />
      <p>Desain 1</p>
    </div>
    <div class="konten-zoom">
      <img src="URL_GAMBAR_2" alt="Desain Tata Letak Rumah 2" />
      <p>Desain 2</p>
    </div>
    <div class="konten-zoom">
      <img src="URL_GAMBAR_3" alt="Desain Tata Letak Rumah 3" />
      <p>Desain 3</p>
    </div>
  </div>
   
  <h3>2. Pembatas Ruang Terbuka (Open Space)</h3>
  <p>Menggunakan pembatas yang sederhana antara ruang tamu, ruang keluarga, dan dapur akan membuat interior terasa jauh lebih luas dan lapang.</p>
  
  <div class="galeri-desain">
    <div class="konten-zoom">
      <img src="URL_GAMBAR_4" alt="Pembatas Ruang Minimalis 1" />
      <p>Desain 1</p>
    </div>
    <div class="konten-zoom">
      <img src="URL_GAMBAR_5" alt="Pembatas Ruang Minimalis 2" />
      <p>Desain 2</p>
    </div>
    <div class="konten-zoom">
      <img src="URL_GAMBAR_6" alt="Pembatas Ruang Minimalis 3" />
      <p>Desain 3</p>
    </div>
  </div>
   
  <h3>3. Penataan Jendela & Sirkulasi Udara</h3>
  <p>Selain sebagai pengatur pencahayaan alami dan sirkulasi udara, jendela yang disusun rapi akan memberikan nilai estetika tinggi tanpa mengurangi kekokohan bangunan.</p>
  
  <div class="galeri-desain">
    <div class="konten-zoom">
      <img src="URL_GAMBAR_7" alt="Desain Jendela Rumah 1" />
      <p>Desain 1</p>
    </div>
    <div class="konten-zoom">
      <img src="URL_GAMBAR_8" alt="Desain Jendela Rumah 2" />
      <p>Desain 2</p>
    </div>
    <div class="konten-zoom">
      <img src="URL_GAMBAR_9" alt="Desain Jendela Rumah 3" />
      <p>Desain 3</p>
    </div>
  </div>

  <h3>4. Pondasi & Struktur Dasar</h3>
  <p>Struktur pondasi yang simpel tidak membutuhkan terlalu banyak pilar penyangga, melainkan mengandalkan desain yang saling terikat satu sama lain. Bagian ini sangat krusial dan membutuhkan ketelitian ekstra dalam pembuatannya.</p>
  
  <div class="galeri-desain">
    <div class="konten-zoom">
      <img src="URL_GAMBAR_10" alt="Pondasi Rumah 1" />
      <p>Desain 1</p>
    </div>
    <div class="konten-zoom">
      <img src="URL_GAMBAR_11" alt="Pondasi Rumah 2" />
      <p>Desain 2</p>
    </div>
    <div class="konten-zoom">
      <img src="URL_GAMBAR_12" alt="Pondasi Rumah 3" />
      <p>Desain 3</p>
    </div>
  </div>
   
  <h3>5. Dekorasi & Penataan Interior</h3>
  <p>Setelah struktur siap, langkah selanjutnya adalah mengatur isi ruangan agar fungsi dan tampilannya semakin maksimal.</p>
  
  <div class="galeri-desain">
    <div class="konten-zoom">
      <img src="URL_GAMBAR_13" alt="Penataan Interior 1" />
      <p>Desain 1</p>
    </div>
    <div class="konten-zoom">
      <img src="URL_GAMBAR_14" alt="Penataan Interior 2" />
      <p>Desain 2</p>
    </div>
    <div class="konten-zoom">
      <img src="URL_GAMBAR_15" alt="Penataan Interior 3" />
      <p>Desain 3</p>
    </div>
  </div>
   
  <p>Rahasia utama di balik rumah yang terlihat indah adalah <strong>kombinasi warna cat, pencahayaan alami yang pas, serta kebersihan yang selalu terjaga</strong>.</p>
   
  <p>Bagaimana, tertarik menerapkan model ini pada rumah impian Anda? Semoga inspirasi ini membantu. Sampai jumpa di artikel berikutnya!</p>

  <section class="call-to-action">
    <p><strong>Bagaimana pendapat Anda tentang desain ini? Tulis tanggapan atau pertanyaan Anda di kolom komentar di bawah ya!</strong></p>
  </section>
</article>

        </div>

        <div class="post-media">
          <img src="https://picsum.photos/600/300?random=5" alt="Foto Postingan">
        </div>

        <!-- Area Statistik Jumlah Like & Komentar -->
        <script>
        /* Container Statistik */
        .post-stats {
        display: flex;
        justify-content: space-between;
        font-size: 14px;
        color: #65676b;
        padding: 10px 5px;
        border-bottom: 1px solid #e4e6eb;
        margin-top: 20px;
        }
        
        /* Container Tombol */
        .post-actions {
        display: flex;
        justify-content: space-around;
        padding: 6px 0;
        border-bottom: 1px solid #e4e6eb;
        }
        
        /* Desain Dasar Tombol */
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
        
        /* Efek Hover & Klik */
        .action-btn:hover {
        background-color: #f2f2f2;
        }
        
        .action-btn:active {
        transform: scale(0.95); /* Efek tombol tertekan */
        }
        
        /* Tampilan Saat Tombol Like Di-klik (Aktif) */
        .action-btn.active {
        color: #0866ff; /* Warna biru ala media sosial */
        }
        
        .action-btn.active .btn-icon {
        animation: bounce 0.3s ease;
        }
        
        /* Animasi Membal (Bounce) saat Like */
        @keyframes bounce {
        0% { transform: scale(1); }
        50% { transform: scale(1.3); }
        100% { transform: scale(1); }
        }
        </script>
        <div class="post-stats">
        <span><span id="like-icon">👍</span> <strong id="like-count">128000000</strong> Suka</span>
        <span><strong id="comment-count">904000</strong> Komentar</span>
        </div>
        
        <!-- Tombol Aksi -->
        <footer class="post-actions">
        <button class="action-btn" id="btn-like" onclick="toggleLike()">
        <span class="btn-icon">👍</span> <span id="btn-like-text">Suka</span>
        </button>
        <button class="action-btn" onclick="scrollToComments()">
        💬 Komentar
        </button>
        <button class="action-btn" onclick="sharePost()">
        ↗️ Bagikan
        </button>
        </footer>
        
        <!-- Script Interaksi Otomatis -->
        <script>
        let isLiked = false;
        let rawLikes = 128000000;
        
        // Format angka ke juta (jt) atau ribu (rb) agar natural
        function formatNumber(num) {
        if (num >= 1000000) return (num / 1000000).toFixed(0) + 'jt';
        if (num >= 1000) return (num / 1000).toFixed(0) + 'rb';
        return num;
        }
        
        // Tampilkan angka terformat saat halaman dimuat
        document.getElementById('like-count').innerText = formatNumber(rawLikes);
        
        // Fungsi Tombol Like
        function toggleLike() {
        const likeBtn = document.getElementById('btn-like');
        const likeText = document.getElementById('btn-like-text');
        const likeCountElem = document.getElementById('like-count');
        
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
        }
        
        // Fungsi Scroll Otomatis ke Form Komentar
        function scrollToComments() {
        const commentSection = document.getElementById('kolom-komentar');
        if (commentSection) {
        commentSection.scrollIntoView({ behavior: 'smooth' });
        } else {
        alert('Silakan tulis komentar Anda di bagian bawah artikel!');
        }
        }
        
        // Fungsi Bagikan Artikel
        function sharePost() {
        if (navigator.share) {
        navigator.share({
        title: document.title,
        url: window.location.href
        });
        } else {
        navigator.clipboard.writeText(window.location.href);
        alert('Link artikel berhasil disalin!');
        }
        }
        </script>

      </article>
    `;
  }
}

customElements.define('post-card', PostCard);

// untuk memanggil 
// <post-card></post-card>

//  <script src="post-card-component.js"></script>