document.addEventListener('DOMContentLoaded', initNotification);
console.log("File main.js berhasil dimuat!");

// Helper function untuk mencegah XSS injection
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
// INISIALISASI UTAMA (DOM CONTENT LOADED)
// ==========================================
document.addEventListener('DOMContentLoaded', async () => {
  // 1. Inisialisasi Pemuatan Data Supabase
  loadPosts();

  // 2. Inisialisasi Feed Dummy / Infinite Scroll
  initInfiniteScrollFeed();

  // 3. Inisialisasi Web Push Notification & Service Worker
  initNotification();

  // 4. Inisialisasi Listener Panggilan Masuk (Jika fungsi tersedia)
  const client = window.supabaseClient || (typeof supabaseClient !== 'undefined' ? supabaseClient : null);
  if (client) {
    const { data: { session } } = await client.auth.getSession();
    if (session?.user?.id && typeof listenForIncomingCalls === 'function') {
      listenForIncomingCalls(session.user.id);
    }
  }
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
  name: "frekuensi",
  judul: "Bermacam-Macam Frekuensi: Dari Sinyal HP Sampai Cahaya yang Kita Lihat", 
  ringkasan: "Memahami spektrum gelombang elektromagnetik dan akustik secara sederhana. Pelajari bagaimana gelombang radio, Wi-Fi, cahaya, hingga suara bekerja di sekitar kita sehari-hari.", 
  kategori: "Networking", 
  gambar: "https://picsum.photos/600/300?random=2", 
  url: "../pages/artikel-frekuensi.html", 
  date: "22 Agu 2026",
  like: 8,
  comment: 2
},

    { 
      id: "dummy-3", 
      name: "Blogger Hub",
      judul: "Rangkaian lampu paralel", 
      ringkasan: "membuat rangkaian paralel untuk lampu.", 
      kategori: "Blogging", 
      gambar: "https://picsum.photos/600/300?random=3", 
      url: "../pages/artikel-rangkaian-paralel.html", 
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
   A. GLOBAL VARIABLES & HELPER FUNCTIONS
   ========================================================================== */

// 1. Variabel Global Siklus Render (TIDAK BOLEH DIDEKLARASIKAN DUA KALI)
let currentRenderCycle = 1;
let userLocation = null;

// Helper untuk menghindari XSS Injection
function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// 2. Fungsi Mengambil Lokasi (GPS Utama -> IP Jaringan sebagai Pengganti)
async function getCurrentLocation() {
  return new Promise((resolve) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log("📍 Lokasi berhasil diambil via GPS");
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            source: 'GPS'
          });
        },
        async (error) => {
          console.warn("⚠️ GPS tidak aktif/ditolak. Mengambil lokasi dari IP Jaringan...", error.message);
          const ipLocation = await getLocationFromIP();
          resolve(ipLocation);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      getLocationFromIP().then(resolve);
    }
  });
}

// 3. Fungsi Pengambil Lokasi Berdasarkan IP Jaringan
// Fungsi Pengambil Lokasi Berdasarkan IP Jaringan (Menggunakan HTTPS API)
async function getLocationFromIP() {
  try {
    // Menggunakan ipapi.co (Mendukung HTTPS & CORS)
    const response = await fetch('https://ipapi.co/json/');
    if (!response.ok) throw new Error("Respon API IP tidak OK");
    
    const data = await response.json();

    if (data.latitude && data.longitude) {
      console.log("🌐 Lokasi berhasil diambil via IP Jaringan:", data.city);
      return {
        lat: data.latitude,
        lng: data.longitude,
        source: 'IP'
      };
    } else {
      throw new Error("Data koordinat IP tidak ditemukan");
    }
  } catch (err) {
    console.warn("⚠️ Gagal mengambil via ipapi.co, mencoba opsi cadangan (ipwho.is)...");
    
    // Cadangan API IP HTTPS kedua
    try {
      const res2 = await fetch('https://ipwho.is/');
      const data2 = await res2.json();
      if (data2.success) {
        return {
          lat: data2.latitude,
          lng: data2.longitude,
          source: 'IP'
        };
      }
    } catch (e) {
      console.error("❌ Semua API IP gagal:", e.message);
    }

    // Lokasi Default (Jakarta) jika semua jaringan API gagal
    return {
      lat: -6.2088,
      lng: 106.8456,
      source: 'DEFAULT'
    };
  }
}

// ==========================================================================
// 1. INTEGRASI GOOGLE DRIVE (UPLOADER REUSABLE)
// ==========================================================================
const GOOGLE_API_KEY = 'AIzaSyChf3GjmEsvFQoktUBPFbWnFKUkC1VObpU';
const GOOGLE_CLIENT_ID = '49596256372-4eoeert51u0p1ssv55f5vr851v9ia2dk.apps.googleusercontent.com';
const SCOPES = 'https://www.googleapis.com/auth/drive.file';

async function uploadToGoogleDrive(file) {
  return new Promise(async (resolve, reject) => {
    const waitForGoogleSDK = () => {
      return new Promise((res) => {
        if (typeof google !== 'undefined' && google.accounts && google.accounts.oauth2) {
          return res(true);
        }
        let checkCount = 0;
        const interval = setInterval(() => {
          checkCount++;
          if (typeof google !== 'undefined' && google.accounts && google.accounts.oauth2) {
            clearInterval(interval);
            res(true);
          } else if (checkCount > 20) {
            clearInterval(interval);
            res(false);
          }
        }, 500);
      });
    };

    const isReady = await waitForGoogleSDK();
    if (!isReady) {
      return reject(new Error("Gagal memuat skrip Google. Pastikan tag script Google terpasang di HTML."));
    }

    try {
      const client = google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: SCOPES,
        callback: async (tokenResponse) => {
          if (tokenResponse.error) {
            return reject(new Error("Gagal otorisasi Google Drive: " + tokenResponse.error));
          }

          try {
            const token = tokenResponse.access_token;
            
            const metadata = { name: file.name, mimeType: file.type };
            const formData = new FormData();
            formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
            formData.append('file', file);

            const uploadRes = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
              method: 'POST',
              headers: new Headers({ 'Authorization': 'Bearer ' + token }),
              body: formData
            });

            const fileData = await uploadRes.json();
            if (!fileData.id) return reject(new Error(fileData.error ? fileData.error.message : "Gagal upload ke Drive"));

            await fetch(`https://www.googleapis.com/drive/v3/files/${fileData.id}/permissions?key=${GOOGLE_API_KEY}`, {
              method: 'POST',
              headers: new Headers({
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
              }),
              body: JSON.stringify({ role: 'reader', type: 'anyone' })
            });

            const directMediaUrl = `https://lh3.googleusercontent.com/d/${fileData.id}`;
            resolve(directMediaUrl);

          } catch (err) {
            reject(err);
          }
        }
      });

      client.requestAccessToken({ prompt: '' });
    } catch (err) {
      reject(err);
    }
  });
}

// ==========================================================================
// 2. HELPER KELOLA INPUT FILE & LOKASI
// ==========================================================================

function handlePostFileSelect(event) {
  const fileInput = event.target;
  const previewContainer = document.getElementById("file-preview-container");
  const fileNameLabel = document.getElementById("file-name-label");

  if (fileInput.files && fileInput.files[0]) {
    fileNameLabel.textContent = "📎 " + fileInput.files[0].name;
    previewContainer.style.display = "flex";
  } else {
    clearSelectedFile();
  }
}

function clearSelectedFile() {
  const fileInput = document.getElementById("post-image-input");
  const previewContainer = document.getElementById("file-preview-container");
  if (fileInput) fileInput.value = "";
  if (previewContainer) previewContainer.style.display = "none";
}

async function getCurrentLocation() {
  return new Promise((resolve) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log("📍 Lokasi berhasil diambil via GPS");
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            source: 'GPS'
          });
        },
        async (error) => {
          console.warn("⚠️ GPS tidak aktif. Mengambil lokasi via IP...", error.message);
          const ipLocation = await getLocationFromIP();
          resolve(ipLocation);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      getLocationFromIP().then(resolve);
    }
  });
}

async function getLocationFromIP() {
  try {
    const response = await fetch('https://ipapi.co/json/');
    if (!response.ok) throw new Error("Respon API IP tidak OK");
    const data = await response.json();

    if (data.latitude && data.longitude) {
      return { lat: data.latitude, lng: data.longitude, source: 'IP' };
    } else {
      throw new Error("Data koordinat IP tidak ditemukan");
    }
  } catch (err) {
    try {
      const res2 = await fetch('https://ipwho.is/');
      const data2 = await res2.json();
      if (data2.success) {
        return { lat: data2.latitude, lng: data2.longitude, source: 'IP' };
      }
    } catch (e) {
      console.error("❌ Semua API IP gagal:", e.message);
    }
    return { lat: -6.2088, lng: 106.8456, source: 'DEFAULT' };
  }
}

// ==========================================================================
// 3. PROSES SUBMIT MEMBUAT POSTINGAN BARU
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
  const postForm = document.getElementById("postForm");

  if (postForm) {
    postForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const client = window.supabaseClient || window.supabase;
      if (!client) {
        alert("Koneksi database belum siap.");
        return;
      }

      const { data: { session } } = await client.auth.getSession();
      if (!session) {
        alert("Sesi Anda telah berakhir. Silakan login kembali.");
        return;
      }

      const contentInput = document.getElementById("content");
      const contentText = contentInput ? contentInput.value.trim() : "";
      
      const imageInput = document.getElementById("post-image-input");
      const file = imageInput && imageInput.files ? imageInput.files[0] : null;

      if (!contentText && !file) {
        alert("Postingan tidak boleh kosong! Tulis teks atau sertakan gambar.");
        return;
      }

      const loadingEl = document.getElementById("upload-loading");
      const submitBtn = document.getElementById("post-submit-btn");

      try {
        let mediaUrl = null;

        // 1. Unggah gambar jika ada file yang dipilih
        if (file) {
          if (loadingEl) loadingEl.style.display = "flex";
          if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.style.opacity = "0.6";
            submitBtn.style.cursor = "not-allowed";
          }

          console.log("Mengunggah gambar ke Google Drive...");
          mediaUrl = await uploadToGoogleDrive(file);
          console.log("Gambar berhasil diunggah:", mediaUrl);
        }

        // 2. Ambil lokasi pengguna
        const loc = await getCurrentLocation();
        const pointString = `POINT(${loc.lng} ${loc.lat})`;
        const currentUsername = session.user.user_metadata?.username || session.user.email;

        // 3. Simpan postingan ke Supabase
        const { error } = await client
          .from('posts')
          .insert([
            {
              user_id: session.user.id,
              username: currentUsername,
              content: contentText || "",
              image_url: mediaUrl,
              is_logged_in: true,
              location: pointString
            }
          ]);

        if (error) throw error;

        alert("Postingan berhasil diterbitkan!");
        
        postForm.reset();
        clearSelectedFile();

        if (typeof loadPosts === "function") {
          loadPosts();
        }

      } catch (err) {
        console.error("Gagal mengirim postingan:", err.message);
        alert("Terjadi kesalahan saat mengirim postingan: " + err.message);
      } finally {
        if (loadingEl) loadingEl.style.display = "none";
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.style.opacity = "1";
          submitBtn.style.cursor = "pointer";
        }
      }
    });
  }

  if (typeof checkUserSession === "function") {
    checkUserSession();
  }
  loadPosts();
});

// ==========================================================================
// 4. MEMUAT & MERENDER POSTINGAN (RADIAL CYCLE FEED)
// ==========================================================================
async function loadPosts() {
  const postsContainer = document.getElementById("posts-container");
  if (!postsContainer) return;

  postsContainer.innerHTML = "<p style='text-align:center;'>Mendeteksi lokasi & memuat postingan...</p>";

  const client = window.supabaseClient || window.supabase;
  if (!client) {
    postsContainer.innerHTML = "<p style='color:red; text-align:center;'>Gagal mengoneksikan database.</p>";
    return;
  }

  try {
    userLocation = await getCurrentLocation();

    let minMeters = 0;
    let maxMeters = 8500;

    switch (currentRenderCycle) {
      case 1: minMeters = 0; maxMeters = 300; break;
      case 2: minMeters = 300; maxMeters = 500; break;
      case 3: minMeters = 500; maxMeters = 3500; break;
      case 4: minMeters = 3500; maxMeters = 8500; break;
      case 5: minMeters = 0; maxMeters = 500; break;
      case 6: minMeters = 0; maxMeters = 3500; break;
      case 7: minMeters = 500; maxMeters = 8500; break;
      case 8: minMeters = 0; maxMeters = 3500; break;
      case 9: minMeters = 0; maxMeters = 8500; break;
    }

    const { data: posts, error } = await client.rpc('get_posts_by_radius', {
      user_lat: userLocation.lat,
      user_lng: userLocation.lng,
      min_meters: minMeters,
      max_meters: maxMeters,
      limit_count: 9
    });

    currentRenderCycle = (currentRenderCycle % 9) + 1;

    if (error) {
      postsContainer.innerHTML = "<p style='color:red; text-align:center;'>Gagal memuat postingan.</p>";
      return;
    }

    if (!posts || posts.length === 0) {
      postsContainer.innerHTML = `<p style='text-align:center;'>Belum ada postingan di area ini.</p>`;
      return;
    }

    const { data: { session } } = await client.auth.getSession();
    const currentUserId = session?.user?.id;

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

      // 1. KONDISI TEKS: Tampilkan elemen div teks HANYA JIKA postingan memiliki isi teks
      const contentHtml = content ? `<div class="post-content">${content}</div>` : '';

      // 2. KONDISI GAMBAR: Tampilkan elemen div gambar HANYA JIKA postingan memiliki URL gambar
      const postImageHtml = post.image_url 
        ? `<div class="post-media" style="margin-top: 10px;">
             <img src="${post.image_url}" alt="Foto Postingan" style="width:100%; border-radius:8px;">
           </div>` 
        : '';
      

      const isOwner = currentUserId && post.user_id === currentUserId;

      return `
      <article class="post-card" data-post-id="${post.id}">
        <header class="post-header" style="position: relative; display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <img src="https://picsum.photos/600/300?random=5" alt="Foto Profil" class="avatar">
            <div class="user-info">
              <h4>${author}</h4>
              <span>${date}</span>
            </div>
          </div>

          <details class="post-menu-dropdown" style="position: relative;">
            <summary style="list-style: none; cursor: pointer; font-size: 18px; padding: 4px 8px; user-select: none;">⋮</summary>
            <div style="position: absolute; right: 0; top: 100%; background: white; border: 1px solid #ddd; border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); display: flex; flex-direction: column; gap: 4px; padding: 6px; min-width: 130px; z-index: 10;">
              <button class="action-btn btn-chat-right" onclick="openPrivateChat('${post.user_id}', '${author}')" style="width: 100%; text-align: left; background: none; border: none; padding: 6px 10px; cursor: pointer; font-size: 13px;">
                💬 Kirim Pesan
              </button>
              ${isOwner ? `
                <button onclick="deletePost('${post.id}')" style="width: 100%; text-align: left; background: none; border: none; color: #dc3545; padding: 6px 10px; cursor: pointer; font-size: 13px;">
                  🗑️ Hapus
                </button>
              ` : ''}
            </div>
          </details>
        </header>
 <!-- DISINI LETAK ELEMEN TEKS DINAMIS -->
        ${contentHtml}

        <!-- DISINI LETAK ELEMEN GAMBAR DINAMIS -->
        ${postImageHtml}
        

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

// ------------------------------------------------------------------------
// FUNGSI MENAMPILKAN NOTIFIKASI TOAST
// ------------------------------------------------------------------------
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

// ------------------------------------------------------------------------
// FUNGSI UNTUK MENGHAPUS POSTINGAN
// ------------------------------------------------------------------------
async function deletePost(postId) {
  const confirmDelete = confirm("Apakah Anda yakin ingin menghapus postingan ini?");
  if (!confirmDelete) return;

  const client = window.supabaseClient || (typeof supabaseClient !== 'undefined' ? supabaseClient : null);
  if (!client) {
    alert("Koneksi Supabase tidak ditemukan.");
    return;
  }

  // Hapus postingan dari tabel 'posts' berdasarkan ID
  const { error } = await client
    .from('posts')
    .delete()
    .eq('id', postId);

  if (error) {
    alert("Gagal menghapus postingan: " + error.message);
  } else {
    alert("Postingan berhasil dihapus!");
    if (typeof loadPosts === 'function') {
      loadPosts();
    } else {
      location.reload();
    }
  }
}

// ------------------------------------------------------------------------
// LOGIKA WEB PUSH NOTIFICATION
// ------------------------------------------------------------------------
const PUBLIC_VAPID_KEY = 'BNUMzABdr28NW_FhFsQeJGeima8yago6J3Q77DpWB6Gnk2rEmq4lixD0cQjyJ1Ke78bTwm1VZyWb7MRzaEa1hWY';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

async function initNotification() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

  try {
    // 1. Register Service Worker
    const reg = await navigator.serviceWorker.register('/sw.js');

    // 2. Minta Izin Notifikasi
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn("Izin notifikasi tidak diberikan");
      return;
    }

    // 3. Ambil/Buat Subscription dari PushManager
    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY)
      });
    }

    // 4. Simpan Subscription ke tabel 'push_subscriptions' di Supabase
    const client = window.supabaseClient || window.supabase;
    if (client) {
      const { data: { session } } = await client.auth.getSession();
      if (session?.user) {
        await client
          .from('push_subscriptions')
          .upsert({
            user_id: session.user.id,
            subscription: sub.toJSON()
          }, { onConflict: 'user_id' });
      }
    }
  } catch (err) {
    console.error("Gagal menginisialisasi Web Push:", err);
  }
}
