console.log("File main.js berhasil dimuat!");

// Helper function untuk mencegah XSS injection (yang tadi bikin error karena belum ada)
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ==========================================
// FUNGSI MEMUAT & MENAMPILKAN POSTINGAN
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  // 1. Inisialisasi Pemuatan Data Supabase
  loadPosts();

  // 2. Inisialisasi Feed Dummy / Infinite Scroll
  initInfiniteScrollFeed();
});

/* ==========================================================================
   A. LOGIKA INFINITE SCROLL FEED (#post-article-container)
   ========================================================================== */
function initInfiniteScrollFeed() {
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
  const container = document.getElementById('post-article-container');
  const sentinel = document.getElementById('scroll-sentinel');
  let observer;

  if (!container) return;

  function muatPostinganBerikutnya() {
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
      article.setAttribute('data-post-id', post.id);

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

          <div id="comment-section-${post.id}" class="comment-section" style="display:none; padding: 15px; border-top: 1px solid #eee; text-align: left;">
            <div class="comments-list" id="comments-list-${post.id}"></div>
            <form onsubmit="handleCommentSubmit(event, '${post.id}', null)" style="margin-top: 10px; display: flex; gap: 8px;">
              <input type="text" placeholder="Tulis komentar..." required style="flex: 1; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
              <button type="submit" style="padding: 8px 12px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">Kirim</button>
            </form>
          </div>
        </div>
      `;

      container.appendChild(article);
    });
  }

  // Muat postingan pertama kali
  muatPostinganBerikutnya();

  // Siapkan IntersectionObserver jika elemen sentinel ada
  if (sentinel) {
    observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          muatPostinganBerikutnya();
        }
      });
    }, { rootMargin: '100px' });
    
    observer.observe(sentinel);
  }
}

/* ==========================================================================
   B. LOGIKA SUPABASE FEED (#posts-container)
   ========================================================================== */
async function loadPosts() {
  // Mengecek elemen posts-container (Perhatikan typo id di HTML harus posts-container)
  const postsContainer = document.getElementById("posts-container");
  if (!postsContainer) return;

  postsContainer.innerHTML = "<p style='text-align:center;'>Memuat postingan...</p>";

  // Mengamankan pemanggilan Supabase jika client menggunakan 'supabase' atau 'supabaseClient'
  const client = window.supabaseClient || window.supabase;

  if (!client) {
    console.error("Supabase client belum diinisialisasi.");
    postsContainer.innerHTML = "<p style='color:red; text-align:center;'>Gagal mengoneksikan database.</p>";
    return;
  }

  try {
    const { data: posts, error } = await client
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Gagal memuat postingan:", error.message);
      postsContainer.innerHTML = "<p style='color:red; text-align:center;'>Gagal memuat postingan.</p>";
      return;
    }

    if (!posts || posts.length === 0) {
      postsContainer.innerHTML = "<p style='text-align:center;'>Belum ada postingan.</p>";
      return;
    }

    postsContainer.innerHTML = posts.map(post => {
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
      <article class="post-card" data-post-id="${post.id}">
        <header class="post-header">
          <img src="https://picsum.photos/600/300?random=5" alt="Foto Profil" class="avatar">
          <div class="user-info">
            <h4>${author}</h4>
            <span>${date}</span>
          </div>
          <button class="action-btn btn-chat-right" onclick="openPrivateChat('${post.user_id}', '${author}')">
            💬 Kirim Pesan
          </button>
        </header>
        <div class="post-content">${content}</div>
        <div class="post-media">
          <img src="https://picsum.photos/600/300?random=7" alt="Foto Postingan">
        </div>
        <footer class="post-actions">
          <button class="action-btn" onclick="toggleLike(this)">Suka</button>
          <button class="action-btn" onclick="toggleComments('${post.id}')">Komentar</button>
          <button class="action-btn" onclick="sharePost()">Bagikan</button>
        </footer>
        <div id="comment-section-${post.id}" style="display: none; margin-top: 12px; padding-top: 10px; border-top: 1px solid #eee;">
          <div id="comments-list-${post.id}" style="margin-bottom: 10px; text-align: left;">
            <p style="font-size: 12px; color: #888;">Memuat komentar...</p>
          </div>
          <form onsubmit="handleCommentSubmit(event, '${post.id}', null)" style="display: flex; gap: 6px;">
            <input type="text" placeholder="Tulis komentar..." required style="flex: 1; padding: 6px 10px; font-size: 12px; border: 1px solid #ccc; border-radius: 4px;">
            <button type="submit" style="padding: 6px 12px; font-size: 12px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">Kirim</button>
          </form>
        </div>
      </article>
      `;
    }).join('');
  } catch (err) {
    console.error("Terjadi error sistem saat memuat data:", err);
    postsContainer.innerHTML = "<p style='color:red; text-align:center;'>Terjadi kesalahan koneksi.</p>";
  }
}

// ------------------------------------------------------------------------
// NAVBAR AUTO-HIDE SAAT SCROLL
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

//=========
// Fungsi Menampilkan Notifikasi Toast
//=========

function showGlobalToast(title, message, onClickCallback) {
  const container = document.getElementById("chat-toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.style.cssText = `
    background: #ffffff;
    color: #333;
    padding: 12px 16px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    border-left: 4px solid #007bff;
    min-width: 250px;
    max-width: 320px;
    cursor: pointer;
    transition: all 0.3s ease;
  `;

  toast.innerHTML = `
    <div style="font-weight: bold; font-size: 13px; margin-bottom: 4px; color: #007bff;">${escapeHtml(title)}</div>
    <div style="font-size: 12px; color: #555; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${escapeHtml(message)}</div>
  `;

  toast.onclick = () => {
    if (onClickCallback) onClickCallback();
    toast.remove();
  };

  container.appendChild(toast);

  // Otomatis hilangkan setelah 5 detik
  setTimeout(() => {
    if (toast.parentNode) toast.remove();
  }, 5000);
}
