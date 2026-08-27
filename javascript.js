document.addEventListener('DOMContentLoaded', () => {

  // 1. DATA POSTINGAN MURNI (Tambahkan artikel Anda di sini)
  const databasePostingan = [
    {
      id: 1,
      judul: "Panduan Membangun Website Cepat & Responsif",
      ringkasan: "Pelajari teknik optimasi performa web dan struktur HTML yang efisien.",
      kategori: "Web Dev",
      gambar: "https://picsum.photos/600/300?random=1",
      url: "#",
      tanggal: "24 Agu 2026"
    },
    {
      id: 2,
      judul: "Mengenal Cara Kerja Cloudflare & DNS Management",
      ringkasan: "Bagaimana cara menghubungkan domain kustom dan melindungi server.",
      kategori: "Networking",
      gambar: "https://picsum.photos/600/300?random=2",
      url: "#",
      tanggal: "22 Agu 2026"
    },
    {
      id: 3,
      judul: "Tips Monetisasi Konten Blog untuk Pemula",
      ringkasan: "Langkah-langkah mendaftarkan blog ke jaringan iklan online.",
      kategori: "Blogging",
      gambar: "https://picsum.photos/600/300?random=3",
      url: "#",
      tanggal: "20 Agu 2026"
    },
    {
      id: 4,
      judul: "Eksplorasi Teknologi Drone Kargo Masa Depan",
      ringkasan: "Ulasan kapasitas angkut payload berat dan efisiensi baterai.",
      kategori: "Teknologi",
      gambar: "https://picsum.photos/600/300?random=4",
      url: "#",
      tanggal: "18 Agu 2026"
    },
    {
      id: 5,
      judul: "Koleksi Spot Mancing Air Tawar Terbaik",
      ringkasan: "Rekomendasi titik lokasi mancing potensial lengkap dengan rute.",
      kategori: "Outdoor",
      gambar: "https://picsum.photos/600/300?random=5",
      url: "#",
      tanggal: "15 Agu 2026"
    },
    {
      id: 6,
      judul: "Strategi Optimasi Game Mobile di HP Spek Menengah",
      ringkasan: "Pengaturan grafis dan jaringan agar gameplay tetap stabil tanpa lag.",
      kategori: "Gaming",
      gambar: "https://picsum.photos/600/300?random=6",
      url: "#",
      tanggal: "12 Agu 2026"
    }
  ];

  // 2. VARIABEL & ELEMEN HTML
  let indexData = 0;
  const itemPerScroll = 2; // Jumlah artikel yang dimuat setiap scroll
  const container = document.getElementById('posts-container');
  const sentinel = document.getElementById('scroll-sentinel');

  // 3. FUNGSI MEMBUAT KOTAK IKLAN OTOMATIS
  function buatKotakIklan() {
    const adBox = document.createElement('div');
    adBox.className = 'post-card';
    adBox.innerHTML = `
      <div style="background: #fffdf5; border: 1px dashed #f59e0b; padding: 16px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
        <span style="font-size: 0.75rem; color: #b45309; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Sponsor / Iklan</span>
        <div style="margin-top: 10px;">
          <!-- Ganti konten/kode banner iklan Anda di sini -->
          <a href="#" target="_blank" rel="nofollow noopener" style="text-decoration: none; color: inherit;">
            <img src="https://picsum.photos/600/150?random=99" alt="Iklan" style="width: 100%; max-height: 140px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;">
            <p style="font-weight: 600; font-size: 0.95rem; color: #1e293b;">Dapatkan Promo Spesial Domain & Hosting Hari Ini!</p>
          </a>
        </div>
      </div>
    `;
    return adBox;
  }

  // 4. FUNGSI MERENDER POSTINGAN DAN MENYISIPKAN IKLAN
  function muatPostinganBerikutnya() {
    const dataBatch = databasePostingan.slice(indexData, indexData + itemPerScroll);

    if (dataBatch.length === 0) {
      if (sentinel) sentinel.textContent = 'Semua postingan telah dimuat.';
      if (observer && sentinel) observer.unobserve(sentinel);
      return;
    }

    dataBatch.forEach((post) => {
      indexData++;

      // Render Kartu Artikel
      const article = document.createElement('article');
      article.className = 'post-card';
      article.innerHTML = `
        <img src="${post.gambar}" alt="${post.judul}" class="post-thumb" loading="lazy">
        <div class="post-content">
          <span class="post-tag">${post.kategori}</span>
          <h2 class="post-title">
            <a href="${post.url}">${post.judul}</a>
          </h2>
          <p class="post-excerpt">${post.ringkasan}</p>
          <div class="post-meta">Dipublikasikan pada ${post.tanggal}</div>
        </div>
      `;

      if (container) container.appendChild(article);

      // SISIPKAN IKLAN OTOMATIS: Setiap kelipatan 3 artikel
      if (indexData % 1 === 0) {
        const iklan = buatKotakIklan();
        if (container) container.appendChild(iklan);
      }
    });
  }

  // 5. OBSERVER UNTUK INFINITE SCROLL
  let observer;
  if (sentinel) {
    observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            muatPostinganBerikutnya();
          }, 200);
        }
      });
    }, {
      rootMargin: '150px'
    });

    observer.observe(sentinel);
  }

});
//Navbar
// 1. Ambil semua tombol pembuka modal
const modalButtons = document.querySelectorAll('.open-modal-btn');
// 2. Ambil semua tombol silang (close)
const closeButtons = document.querySelectorAll('.close-btn');

// Jalankan fungsi buka modal saat menu diklik
modalButtons.forEach(button => {
  button.addEventListener('click', function(e) {
    e.preventDefault(); // Mencegah halaman reload/lompat ke atas
    const targetId = this.getAttribute('data-target');
    const modalToOpen = document.getElementById(targetId);
    if (modalToOpen) {
      modalToOpen.style.display = 'block';
    }
  });
});

// Jalankan fungsi tutup modal saat tombol (X) diklik
closeButtons.forEach(button => {
  button.addEventListener('click', function() {
    this.closest('.modal').style.display = 'none';
  });
});

// Tutup modal jika pengguna mengklik area luar modal (area hitam/transparan)
window.addEventListener('click', function(e) {
  if (e.target.classList.contains('modal')) {
    e.target.style.display = 'none';
  }
});

const navbar = document.querySelector(".navbar");
let lastScrollY = window.scrollY;

window.addEventListener("scroll", () => {
  // Jika scroll ke bawah lebih dari 50px, sembunyikan navbar
  if (window.scrollY > lastScrollY && window.scrollY > 50) {
    navbar.classList.add("navbar--hidden");
  } else {
    // Jika scroll ke atas, munculkan navbar kembali
    navbar.classList.remove("navbar--hidden");
  }
  
  lastScrollY = window.scrollY;
});

// Skenario 1: Penyimpanan sementara di LocalStorage (Untuk Uji Coba / Tanpa Database)
const STORAGE_KEY = 'temp_posts_data';
const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

// Fungsi mengambil dan memfilter postingan (< 3 hari)
function loadPosts() {
  const postsFeed = document.getElementById('postsFeed');
  const savedPosts = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  const now = new Date().getTime();

  // Filter: Hanya ambil postingan yang usianya belum mencapai 3 hari
  const activePosts = savedPosts.filter(post => (now - post.createdAt) < THREE_DAYS_MS);

  // Simpan kembali data yang sudah dibersihkan dari postingan kadaluwarsa
  localStorage.setItem(STORAGE_KEY, JSON.stringify(activePosts));

  if (activePosts.length === 0) {
    postsFeed.innerHTML = '<p>Belum ada postingan aktif.</p>';
    return;
  }

  postsFeed.innerHTML = activePosts.map(post => {
    const dateString = new Date(post.createdAt).toLocaleString('id-ID');
    const sisaWaktuJam = Math.round((THREE_DAYS_MS - (now - post.createdAt)) / (1000 * 60 * 60));
    
    return `
      <div class="post-card" style=border-radius:3px;">
        <div class="post-meta">
          <strong>${escapeHtml(post.username)}</strong> • ${dateString} 
          <span class="badge">Hangus -${sisaWaktuJam} jam</span>
        </div>
        <div>${escapeHtml(post.content)}</div>
      </div>
    `;
  }).join('');
}

// Fungsi Sanitasi Input (Mencegah XSS Injection)
function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Event Submit Form
document.getElementById('postForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const username = document.getElementById('username').value.trim();
  const content = document.getElementById('content').value.trim();

  if (!username || !content) return;

  const newPost = {
    id: Date.now(),
    username: username,
    content: content,
    createdAt: new Date().getTime()
  };

  const savedPosts = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  savedPosts.unshift(newPost); // Tambahkan ke baris paling atas
  localStorage.setItem(STORAGE_KEY, JSON.stringify(savedPosts));

  document.getElementById('postForm').reset();
  loadPosts();
});

// Jalankan pertama kali saat halaman dibuka
loadPosts();

const express = require('express');
const app = express();

app.use(express.json());

// Database sementara (Gunakan MongoDB/MySQL untuk produksi)
let userIpRegistry = {}; // Format: { "192.168.1.1": "Ahmad" }
let posts = [];

app.post('/api/posts', (req, res) => {
  // 1. Mendapatkan IP Address Pengguna
  const userIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const { username, content } = req.body;

  // 2. Cek apakah IP ini sudah pernah membuat nama sebelumnya
  if (userIpRegistry[userIp]) {
    const existingName = userIpRegistry[userIp];

    // Jika nama yang dimasukkan tidak sama dengan nama yang terdaftar di IP ini
    if (existingName.toLowerCase() !== username.toLowerCase()) {
      return res.status(400).json({
        message: `IP Anda sudah terdaftar dengan nama "${existingName}". Anda tidak bisa menggunakan nama lain!`
      });
    }
  } else {
    // 3. Jika IP belum ada, daftarkan nama baru untuk IP ini
    userIpRegistry[userIp] = username;
  }

  // 4. Simpan Postingan (Otomatis hapus/berlaku 3 hari)
  const newPost = {
    id: Date.now(),
    username: userIpRegistry[userIp],
    content,
    createdAt: new Date()
  };
  posts.push(newPost);

  return res.status(200).json({ message: 'Postingan berhasil dibuat!' });
});
document.getElementById('postForm').addEventListener('submit', async function(e) {
  e.preventDefault();

  const username = document.getElementById('username').value;
  const content = document.getElementById('content').value;

  const response = await fetch('/api/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, content })
  });

  const result = await response.json();

  if (response.ok) {
    alert(result.message);
  } else {
    // Menampilkan pesan jika nama ditolak karena IP sudah kepakai nama lain
    alert(result.message); 
  }
});