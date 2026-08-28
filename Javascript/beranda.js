document.addEventListener('DOMContentLoaded', () => {
  const databasePostingan = [
    { 
      id: 1, 
      name: "Admin Dev",
      judul: "Panduan Membangun Website Cepat & Responsif", 
      ringkasan: "Pelajari teknik optimasi performa web dan struktur HTML yang efisien.", 
      kategori: "Web Dev", 
      gambar: "https://picsum.photos/600/300?random=1", 
      url: "#", 
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
  let observer; // Deklarasi tunggal

  function buatKotakIklan() {
    const adBox = document.createElement('div');
    adBox.className = 'post-card';
    adBox.innerHTML = `
      <div style="background: #fffdf5; border: 1px dashed #f59e0b; padding: 16px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
        <span style="font-size: 0.75rem; color: #b45309; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Sponsor / Iklan</span>
        <div style="margin-top: 10px;">
          <a href="https://app.seabank.co.id/app/main?module=router&type=me&sub_type=referral&login=true&referralCode=LHZEHN" target="_blank" rel="nofollow noopener" onclik.window-open="/html/referalseabank.html" style="text-decoration: none; color: inherit;">
            <img src="https://picsum.photos/600/150?random=99" alt="Iklan" style="width: 100%; max-height: 140px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;">
            <p style="font-weight: 600; font-size: 0.95rem; color: #1e293b;">Mau punya rekening perbankan digital yang serba gratis, aman, dan langsung kasih bonus saldo saat pendaftaran. Disini tempatnya!</p>
          </a>
        </div>
      </div>
    `;
    return adBox;
  }

  function muatPostinganBerikutnya() {
    const dataBatch = databasePostingan.slice(indexData, indexData + itemPerScroll);

    if (dataBatch.length === 0) {
      if (sentinel) sentinel.textContent = 'Semua postingan telah dimuat.';
      if (observer && sentinel) observer.unobserve(sentinel);
      return;
    }

    dataBatch.forEach((post) => {
      indexData++;
      const article = document.createElement('article');
      article.className = 'post-card';

      article.innerHTML = ` 
        <header class="post-header"> 
          <img src="${post.gambar}" alt="Foto Profil" class="avatar"> 
          <div class="user-info"> 
            <h4 class="username">${post.name}</h4>
            <span class="postdate">${post.date} &bull; publik</span>
          </div>
        </header>

        <div class="post-body">
          <h2 class="post-title"><a href="${post.url}">${post.judul}</a></h2>
          <p class="post-excerpt">${post.ringkasan}</p>

          <div class="konten-zoom">
            <img src="${post.gambar}" alt="Foto Postingan" class="post-thumb" loading="lazy" />
          </div>

          <div class="post-stats">
            <span>👍 <strong>${post.like}</strong> Suka</span>
            <span><strong>${post.comment}</strong> Komentar</span>
          </div>

          <footer class="post-actions">
            <button class="action-btn" onclick="toggleLike()">👍 Suka</button>
            <button class="action-btn" onclick="scrollToComments()">💬 Komentar</button>
            <button class="action-btn" onclick="sharePost()">↗️ Bagikan</button>
          </footer>
        </div>

        <div class="post-content">
          <span class="post-tag">${post.kategori}</span>
        </div>
      `;

      if (container) container.appendChild(article);

      if (indexData % 2 === 0) {
        const iklan = buatKotakIklan();
        if (container) container.appendChild(iklan);
      }
    });
  }

  // Inisialisasi IntersectionObserver tanpa keyword 'let'
  if (sentinel) {
    observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setTimeout(() => muatPostinganBerikutnya(), 200);
        }
      });
    }, { rootMargin: '150px' });

    observer.observe(sentinel);
  }
});
        
