/* ==========================================================================
   1. INTERAKSI UTAMA & MODAL HANDLER
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // A. HANDLER MODAL (Pencarian & Kontak/About)
  // Gunakan Event Delegation agar tombol navbar selalu terdeteksi
  document.addEventListener('click', (e) => {
    // Buka Modal
    const targetBtn = e.target.closest('.open-modal-btn');
    if (targetBtn) {
      e.preventDefault();
      const modalId = targetBtn.getAttribute('data-target');
      const targetModal = document.getElementById(modalId);
      if (targetModal) {
        targetModal.style.display = 'block';
      }
    }

    // Tutup Modal via Tombol Close (X)
    if (e.target.classList.contains('close-btn')) {
      const modal = e.target.closest('.modal');
      if (modal) {
        modal.style.display = 'none';
      }
    }

    // Tutup Modal saat Klik Area Luar (Overlay)
    if (e.target.classList.contains('modal')) {
      e.target.style.display = 'none';
    }
  });

   
// B. NAVBAR AUTO-HIDE SAAT SCROLL
const navbar = document.querySelector(".navbar");
let lastScrollY = window.scrollY;

if (navbar) {
  window.addEventListener("scroll", () => {
    const currentScrollY = window.scrollY;

    // Jika di-scroll ke bawah dan sudah melewati 50px
    if (currentScrollY > lastScrollY && currentScrollY > 50) {
      navbar.classList.add("navbar--hidden");
    } else {
      // Jika di-scroll ke atas
      navbar.classList.remove("navbar--hidden");
    }

    lastScrollY = currentScrollY;
  });
}


  // ------------------------------------------------------------------------
  // C. INFINITE SCROLL FEED
  // ------------------------------------------------------------------------
  
  const databasePostingan = [
    { 
      id: 1, 
      name: "Miftah98",
      judul: "hadiah pengguna baru digital banking", 
      ringkasan: "Masukkan kode ini saat pendaftaran untuk klaim bonus kamu!", 
      kategori: "dana kaget", 
      gambar: "https://catatanajaib.github.io/html/Referral.png", 
      url: "https://catatanajaib.github.io/html/referalseabank.html", 
      date: "24 Agu 2026",
      like: 12,
      comment: 5
    },
    { 
      id: 2, 
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
      id: 3, 
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
  if (observer) observer.disconnect(); // Hentikan pemantauan scroll secara total
  return;
  }
  
  // ... sisa kode perulangan pembuatan postingan tetap sama ...
  }

    dataBatch.forEach((post) => {
      indexData++;
      const article = document.createElement('article');
      article.className = 'post-card';

      article.innerHTML = ` 
        <header class="post-header"> 
          <img src="${post.gambar}" alt="Foto profil ${post.name}"" class="avatar"> 
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
            <button class="action-btn" onclick="scrollToComments()">💬 Komentar</button>
            <button class="action-btn" onclick="sharePost()">↗️ Bagikan</button>
          </footer>
        </div>
      `;

      container.appendChild(article);
    });
  }

  // Inisialisasi IntersectionObserver untuk Infinite Scroll
  if (sentinel) {
    observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setTimeout(() => muatPostinganBerikutnya(), 300);
        }
      });
    }, { rootMargin: '200px' });

    observer.observe(sentinel);
  }
     
  if (container && sentinel) {
  // Jalankan logika Infinite Scroll hanya jika kontainer ditemukan
  const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
  if (entry.isIntersecting) {
  setTimeout(() => muatPostinganBerikutnya(), 300);
  }
  });
  }, { rootMargin: '200px' });
  
  observer.observe(sentinel);
  }
  
  });

  // ------------------------------------------------------------------------
  // D. POSTINGAN TEMPORER (LOCALSTORAGE)
  // ------------------------------------------------------------------------
  const STORAGE_KEY = 'temp_posts_data';
  const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;
  const postsFeed = document.getElementById('postsFeed');
  const postForm = document.getElementById('postForm');

  function escapeHtml(text) {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function loadPosts() {
    if (!postsFeed) return;
    
    const savedPosts = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const now = new Date().getTime();
    
    const activePosts = savedPosts.filter(post => (now - post.createdAt) < THREE_DAYS_MS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(activePosts));

    if (activePosts.length === 0) {
      postsFeed.innerHTML = '';
      return;
    }

    postsFeed.innerHTML = activePosts.map(post => {
      const dateString = new Date(post.createdAt).toLocaleString('id-ID');
      const sisaWaktuJam = Math.round((THREE_DAYS_MS - (now - post.createdAt)) / (1000 * 60 * 60));
      
      return `
        <article class="post-card" style="margin-bottom:20px;">
          <header class="post-header">
            <img src="https://picsum.photos/600/300?random=99" alt="Avatar" class="avatar">
            <div class="user-info">
              <h4>${escapeHtml(post.username)}</h4>
              <span>${dateString} &bull; Sisa waktu: ${sisaWaktuJam} jam</span>
            </div>
          </header>
          <div class="post-content" style="padding:15px; text-align:left;">
            ${escapeHtml(post.content)}
          </div>
          <footer class="post-actions">
            <button class="action-btn" onclick="toggleLike(this)">👍 Suka</button>
            <button class="action-btn" onclick="scrollToComments()">💬 Komentar</button>
            <button class="action-btn" onclick="sharePost()">↗️ Bagikan</button>
          </footer>
        </article>
      `;
    }).join('');
  }

  if (postForm) {
    postForm.addEventListener('submit', function(e) {
      e.preventDefault();

      const usernameInput = document.getElementById('username');
      const contentInput = document.getElementById('content');

      if (!usernameInput || !contentInput) return;

      const username = usernameInput.value.trim();
      const content = contentInput.value.trim();

      if (!username || !content) return;

      const newPost = {
        id: Date.now(),
        username: username,
        content: content,
        createdAt: new Date().getTime()
      };

      const savedPosts = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      savedPosts.unshift(newPost);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedPosts));

      postForm.reset();
      loadPosts();
    });
  }

  loadPosts();
});

/* ==========================================================================
   2. FUNGSI UTILS GLOBAL
   ========================================================================== */
function handleCommentSubmit(event, postId) {
  event.preventDefault();
  const form = event.target;
  const input = form.querySelector('input');
  const commentText = input.value.trim();

  if (!commentText) return;

  const listContainer = document.getElementById(`comments-list-${postId}`);
  if (listContainer) {
    const newComment = document.createElement('div');
    newComment.style.padding = '4px 0';
    newComment.textContent = commentText;
    listContainer.appendChild(newComment);
  }

  form.reset();
}

function toggleLike(btnElement) {
  if (btnElement) {
    btnElement.classList.toggle('active');
    btnElement.innerHTML = btnElement.classList.contains('active') ? '👍 Disukai' : '👍 Suka';
  }
}

function scrollToComments(sectionId) {
  const commentSection = document.getElementById(sectionId);
  if (commentSection) {
    commentSection.style.display = 'block';
    commentSection.scrollIntoView({ behavior: 'smooth' });
  }
}

function sharePost() {
  if (navigator.share) {
    navigator.share({ title: document.title, url: window.location.href });
  } else {
    navigator.clipboard.writeText(window.location.href);
    alert('Link berhasil disalin ke clipboard!');
  }
        }
