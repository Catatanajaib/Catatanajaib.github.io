document.addEventListener('DOMContentLoaded', () => {
  const databasePostingan = [
    { id: 1, judul: "Panduan Membangun Website Cepat & Responsif", ringkasan: "Pelajari teknik optimasi performa web dan struktur HTML yang efisien.", kategori: "Web Dev", gambar: "https://picsum.photos/600/300?random=1", url: "#", tanggal: "24 Agu 2026" },
    { id: 2, judul: "Mengenal Cara Kerja Cloudflare & DNS Management", ringkasan: "Bagaimana cara menghubungkan domain kustom dan melindungi server.", kategori: "Networking", gambar: "https://picsum.photos/600/300?random=2", url: "#", tanggal: "22 Agu 2026" },
    { id: 3, judul: "Tips Monetisasi Konten Blog untuk Pemula", ringkasan: "Langkah-langkah mendaftarkan blog ke jaringan iklan online.", kategori: "Blogging", gambar: "https://picsum.photos/600/300?random=3", url: "#", tanggal: "20 Agu 2026" }
  ];

  let indexData = 0;
  const itemPerScroll = 2;
  const container = document.getElementById('posts-container');
  const sentinel = document.getElementById('scroll-sentinel');

  // FUNGSI MEMBUAT KOTAK IKLAN OTOMATIS
  function buatKotakIklan() {
    const adBox = document.createElement('div');
    adBox.className = 'post-card';
    adBox.innerHTML = `
      <div style="background: #fffdf5; border: 1px dashed #f59e0b; padding: 16px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
        <span style="font-size: 0.75rem; color: #b45309; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Sponsor / Iklan</span>
        <div style="margin-top: 10px;">
          <a href="https://app.seabank.co.id/app/main?module=router&type=me&sub_type=referral&login=true&referralCode=LHZEHN" target="_blank" rel="nofollow noopener" onclik.window-open="/html/referalseabank.html" style="text-decoration: none; color: inherit;">
            <img src="https://picsum.photos/600/150?random=99" alt="Iklan" style="width: 100%; max-height: 140px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;">
            <p style="font-weight: 600; font-size: 0.95rem; color: #1e293b;">Mau punya rekening perbankan digital yang serba gratis, aman, dan langsung kasih bonus saldo saat pendaftaran? </p>
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
        <img src="${post.gambar}" alt="${post.judul}" class="post-thumb" loading="lazy">
        <div class="post-content">
          <span class="post-tag">${post.kategori}</span>
          <h2 class="post-title"><a href="${post.url}">${post.judul}</a></h2>
          <p class="post-excerpt">${post.ringkasan}</p>
          <div class="post-meta">Dipublikasikan pada ${post.tanggal}</div>
        </div>
      `;
      if (container) container.appendChild(article);

      // SISIPKAN KOTAK IKLAN SETIAP POSTINGAN DIMUAT
      if (indexData % 2 === 0) {
        const iklan = buatKotakIklan();
        if (container) container.appendChild(iklan);
      }
    });
  }

  let observer;
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
