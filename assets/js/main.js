console.log("File main.js berhasil dimuat!");

/* ==========================================================================
   MAIN.JS - FITUR UTAMA, FEED, & INTEGRASI SUPABASE
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    loadPosts();

  // ------------------------------------------------------------------------
  // A. NAVBAR AUTO-HIDE SAAT SCROLL
  // ------------------------------------------------------------------------
  const navbar = document.querySelector(".navbar");
  let lastScrollY = window.scrollY;

  if (navbar) {
    window.addEventListener("scroll", () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        navbar.classList.add("navbar--hidden");
      } else {
        navbar.classList.remove("navbar--hidden");
      }
      lastScrollY = currentScrollY;
    });
  }

  // ------------------------------------------------------------------------
  // B. INFINITE SCROLL FEED (DATA DUMMY)
  // ------------------------------------------------------------------------
  const databasePostingan = [
    { 
      id: "dummy-1", 
      name: "Miftah98",
      judul: "hadiah pengguna baru digital banking", 
      ringkasan: "Masukkan kode ini saat pendaftaran untuk klaim bonus kamu!", 
      kategori: "dana kaget", 
      gambar: "https://catatanajaib.github.io/assets/images/referral.png", 
      url: "https://catatanajaib.github.io/pages/referalseabank.html", 
      date: "24 Agu 2026",
      like: 12,
      comment: 5
    },
    { 
      id: "dummy-2", 
      name: "Network Pro",
      judul: "Mengenal Cara Kerja Cloudflare & DNS Management", 
      ringkasan: "Bagaimana cara menghubungkan domain kustom dan melindungi server.", 
      kategori: "Networking", 
      gambar: "https://picsum.photos/600/300?random=2", 
      url: "#", 
      date: "22 Agu 2026",
      like: 8,
      comment: 2
    },
    { 
      id: "dummy-3", 
      name: "Blogger Hub",
      judul: "Tips Monetisasi Konten Blog untuk Pemula", 
      ringkasan: "Langkah-langkah mendaftarkan blog ke jaringan iklan online.", 
      kategori: "Blogging", 
      gambar: "https://picsum.photos/600/300?random=3", 
      url: "#", 
      date: "20 Agu 2026",
      like: 25,
      comment: 10
    }
  ];

  let indexData = 0;
  const itemPerScroll = 1;
  const container = document.getElementById('posts-container');
  const sentinel = document.getElementById('scroll-sentinel');
  let observer;

  function muatPostinganBerikutnya() {
    if (!container) return;
    
    const dataBatch = databasePostingan.slice(indexData, indexData + itemPerScroll);
    
    if (dataBatch.length === 0) {
      if (sentinel) sentinel.textContent = 'Semua postingan telah dimuat.';
      if (observer) observer.disconnect();
      return;
    }

    dataBatch.forEach((post) => {
      indexData++;
      const article = document.createElement('article');
      article.className = 'post-card';
      article.style.marginBottom = '20px';

      article.innerHTML = ` 
        <header class="post-header"> 
          <img src="${post.gambar}" alt="Foto profil ${post.name}" class="avatar"> 
          <div class="user-info"> 
            <h4 class="username">${post.name}</h4>
            <span class="postdate">${post.date} &bull; Publik</span>
          </div>
        </header>

        <div class="post-body" style="padding: 15px; text-align: left;">
          <h2 class="post-title"><a href="${post.url}" style="text-decoration:none; color:#1a252f;">${post.judul}</a></h2>
          <p class="post-excerpt" style="margin: 10px 0;">${post.ringkasan}</p>

          <div class="konten-zoom">
            <img src="${post.gambar}" alt="Foto Postingan" class="post-thumb" loading="lazy" style="width:100%; max-height:300px; object-fit:cover; border-radius:8px;" />
          </div>

          <div class="post-stats" style="margin-top:10px;">
            <span>👍 <strong>${post.like}</strong> Suka</span>
            <span><strong>${post.comment}</strong> Komentar</span>
          </div>

          <footer class="post-actions">
            <button class="action-btn" onclick="toggleLike(this)">👍 Suka</button>
            <button class="action-btn" onclick="scrollToComments('comment-section-${post.id}')">💬 Komentar</button>
            <button class="action-btn" onclick="sharePost()">↗️ Bagikan</button>
          </footer>

          <!-- WADAH KOMENTAR HASIL INFINITE SCROLL -->
          <div id="comment-section-${post.id}" class="comment-section" style="display:none; padding: 15px; border-top: 1px solid #eee; text-align: left;">
            <div class="comments-list" id="comments-list-${post.id}"></div>
            <form onsubmit="handleCommentSubmit(event, '${post.id}')" style="margin-top: 10px; display: flex; gap: 8px;">
              <input type="text" placeholder="Tulis komentar..." required style="flex: 1; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
              <button type="submit" style="padding: 8px 12px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">Kirim</button>
            </form>
          </div>
        </div>
      `;

      container.appendChild(article);
    });
  }

  if (container && sentinel) {
    muatPostinganBerikutnya();

    observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          muatPostinganBerikutnya();
        }
      });
    }, { rootMargin: '100px' });
    
    observer.observe(sentinel);
  }

}); // <-- PENUTUP EVENT DOMContentLoaded DI SINI!
// ==========================================
// FUNGSI MEMUAT & MENAMPILKAN POSTINGAN
// ==========================================
async function loadPosts() {
  const postsContainer = document.getElementById("posts-container"); // Pastikan ID ini ada di HTML kamu
  if (!postsContainer) return;

  postsContainer.innerHTML = "<p style='text-align:center;'>Memuat postingan...</p>";

  // Ambil data postingan dari tabel 'posts'
  const { data: posts, error } = await supabaseClient
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false }); // Postingan terbaru di atas

  if (error) {
    console.error("Gagal memuat postingan:", error.message);
    postsContainer.innerHTML = "<p style='color:red;'>Gagal memuat postingan.</p>";
    return;
  }

  if (!posts || posts.length === 0) {
    postsContainer.innerHTML = "<p style='text-align:center;'>Belum ada postingan.</p>";
    return;
  }

  // Render daftar postingan
  postsContainer.innerHTML = posts.map(post => {
    // Penyesuaian nama pembuat postingan (mengakomodasi author_name atau username)
    const author = escapeHtml(post.author_name || post.username || 'Anonim');
    const content = escapeHtml(post.content);
    const date = new Date(post.created_at).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    return `
      <div class="article-card">
<article class="post-card">
  <header class="post-header">
    <img src="https://picsum.photos/600/300?random=5" alt="Foto Profil" class="avatar">
    <div class="user-info">
      <h4>${author}</h4>
      <span>${date}</span>
    </div>
  </header>
  <div class="post-content">${content}</div>
  <div class="post-media">
    <img src="https://picsum.photos/600/300?random=7" alt="Foto Postingan">
  </div>
  <div class="post-stats">
    <span>👍 128jt Suka</span>
    <span>904rb Komentar</span>
  </div>
<!-- Action Buttons -->
  
  <footer class="post-actions">
    <button class="action-btn" onclick="toggleLike(this)">👍 Suka</button>
    <button class="action-btn" onclick="sharePost()">↗️ Bagikan</button>
    

        <!-- Action Buttons -->
        <button onclick="toggleComments('${post.id}')" style="background: none; border: none; color: #007bff; cursor: pointer; padding: 0; font-size: 13px;">
          💬 Komentar
        </button>

        <!-- Area Komentar (Default Sembunyi) -->
        <div id="comment-section-${post.id}" style="display: none; margin-top: 12px; padding-top: 10px; border-top: 1px solid #eee;">
          <div id="comments-list-${post.id}" style="margin-bottom: 10px;">
            <p style="font-size: 12px; color: #888;">Memuat komentar...</p>
          </div>
          
          <!-- Form Tambah Komentar -->
          <form onsubmit="handleCommentSubmit(event, '${post.id}')" style="display: flex; gap: 6px;">
            <input type="text" placeholder="Tulis komentar..." required style="flex: 1; padding: 6px 10px; font-size: 12px; border: 1px solid #ccc; border-radius: 4px;">
            <button type="submit" style="padding: 6px 12px; font-size: 12px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">Kirim</button>
          </form>
        </div>
      </div>
    `;
  }).join('');
}
