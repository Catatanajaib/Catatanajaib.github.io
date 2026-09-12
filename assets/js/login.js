//login, daftar, posting, komentar 
// ==========================================
// 1. INISIALISASI SUPABASE
// ==========================================
const SUPABASE_URL = 'https://qcopjasrzjubbgjnxidv.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_YFS1w6HfZbyg-F6QoxISFw_b62yHMO6';

const supabaseClient = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

// Variable global untuk menyimpan username aktif
let currentUsername = "Pengunjung Anonim";

document.addEventListener("DOMContentLoaded", () => {
    if (!supabaseClient) {
        console.error("Supabase SDK belum dimuat dengan benar. Pastikan script Supabase sudah terpasang di HTML.");
        return;
    }

    // --- ELEMEN UI AUTH & PROFIL ---
    const boxAuth = document.getElementById("box-auth");
    const boxProfil = document.getElementById("box-profil");
    const profileName = document.getElementById("profile-name");
    const profileEmail = document.getElementById("profile-email");

    // --- ELEMEN UI FORM LOGIN ---
    const formLogin = document.getElementById("form-login-direct");
    const loginNotif = document.getElementById("login-notif");
    const btnSubmitLogin = document.getElementById("btn-submit-login");

    // --- ELEMEN UI RESET PASSWORD ---
    const btnShowForgot = document.getElementById("btn-show-forgot");
    const boxForgot = document.getElementById("box-forgot-password");
    const btnSendReset = document.getElementById("btn-send-reset");
    const btnCancelForgot = document.getElementById("btn-cancel-forgot");

    // --- ELEMEN UI FORM POSTINGAN BARU ---
    const createPostBox = document.getElementById("create-post-box");
    const loginRequiredBox = document.getElementById("login-required-box");
    const usernameInput = document.getElementById("username");
    const postForm = document.getElementById("postForm");

    // ==========================================
    // 2. FUNGSI CEK STATUS SESI & PROFILE
    // ==========================================
    async function checkUserSession() {
        const { data: { user }, error: authError } = await supabaseClient.auth.getUser();

        if (authError || !user) {
            updateUIForLoggedOutUser();
            return;
        }

        const { data: profile } = await supabaseClient
            .from('profiles')
            .select('username')
            .eq('id', user.id)
            .maybeSingle();

        currentUsername = profile?.username 
            || user.user_metadata?.username 
            || user.email?.split('@')[0] 
            || "Pengguna";

        updateUIForLoggedInUser(user, currentUsername);
    }

    function updateUIForLoggedInUser(user, username) {
        if (boxAuth) boxAuth.style.display = "none";
        if (boxProfil) boxProfil.style.display = "block";
        
        if (profileEmail) profileEmail.textContent = user.email || "-";
        if (profileName) profileName.textContent = username;

        if (createPostBox) createPostBox.style.display = "block";
        if (loginRequiredBox) loginRequiredBox.style.display = "none";
        if (usernameInput) usernameInput.value = username;
    }

    function updateUIForLoggedOutUser() {
        if (boxAuth) boxAuth.style.display = "block";
        if (boxProfil) boxProfil.style.display = "none";

        if (createPostBox) createPostBox.style.display = "none";
        if (loginRequiredBox) loginRequiredBox.style.display = "block";
        currentUsername = "Pengunjung Anonim";
    }

    function showNotification(message, isError = false) {
        if (!loginNotif) return;
        loginNotif.style.display = "block";
        loginNotif.style.backgroundColor = isError ? "#f8d7da" : "#d4edda";
        loginNotif.style.color = isError ? "#721c24" : "#155724";
        loginNotif.style.border = isError ? "1px solid #f5c6cb" : "1px solid #c3e6cb";
        loginNotif.textContent = message;
    }

    // ==========================================
    // 3. PROSES LOGIN
    // ==========================================
    if (formLogin) {
        formLogin.addEventListener("submit", async (e) => {
            e.preventDefault();
            const email = document.getElementById("login-email").value.trim();
            const password = document.getElementById("login-password").value.trim();

            if (btnSubmitLogin) {
                btnSubmitLogin.disabled = true;
                btnSubmitLogin.textContent = "Memproses...";
            }

            const { error } = await supabaseClient.auth.signInWithPassword({ email, password });

            if (btnSubmitLogin) {
                btnSubmitLogin.disabled = false;
                btnSubmitLogin.textContent = "Masuk";
            }

            if (error) {
                showNotification("Gagal Masuk: " + error.message, true);
            } else {
                showNotification("Login berhasil! Memuat profil...", false);
                setTimeout(checkUserSession, 1000);
            }
        });
    }

    // ==========================================
    // 4. RESET KATA SANDI
    // ==========================================
    if (btnShowForgot && boxForgot) {
        btnShowForgot.addEventListener("click", (e) => {
            e.preventDefault();
            boxForgot.style.display = "block";
        });
    }

    if (btnCancelForgot && boxForgot) {
        btnCancelForgot.addEventListener("click", () => {
            boxForgot.style.display = "none";
        });
    }

    if (btnSendReset) {
        btnSendReset.addEventListener("click", async () => {
            const forgotEmail = document.getElementById("forgot-email").value.trim();
            if (!forgotEmail) {
                alert("Harap masukkan alamat email kamu.");
                return;
            }

            const { error } = await supabaseClient.auth.resetPasswordForEmail(forgotEmail, {
                redirectTo: window.location.origin + '/pages/edit-profil.html',
            });

            if (error) {
                alert("Gagal mengirim tautan reset: " + error.message);
            } else {
                alert("Tautan pembaruan kata sandi telah dikirim ke email kamu!");
                boxForgot.style.display = "none";
            }
        });
    }

    // ==========================================
    // 5. PROSES LOGOUT
    // ==========================================
    const btnLogout = document.getElementById("btn-logout");
    if (btnLogout) {
        btnLogout.addEventListener("click", async () => {
            const { error } = await supabaseClient.auth.signOut();
            if (error) {
                alert("Gagal keluar: " + error.message);
            } else {
                updateUIForLoggedOutUser();
            }
        });
    }

    // ==========================================
    // 6. PROSES MEMBUAT POSTINGAN BARU
    // ==========================================
    if (postForm) {
        postForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            const { data: { session } } = await supabaseClient.auth.getSession();

            if (!session) {
                alert("Sesi Anda telah berakhir. Silakan login kembali.");
                updateUIForLoggedOutUser();
                return;
            }

            const contentInput = document.getElementById("content");
            const contentText = contentInput ? contentInput.value.trim() : "";

            if (!contentText) {
                alert("Isi postingan tidak boleh kosong!");
                return;
            }

            try {
                const { error } = await supabaseClient
                    .from('posts')
                    .insert([
                        {
                            user_id: session.user.id,
                            username: currentUsername,
                            content: contentText,
                            is_logged_in: true
                        }
                    ]);

                if (error) throw error;

                alert("Postingan berhasil diterbitkan!");
                postForm.reset();

                if (usernameInput) usernameInput.value = currentUsername;

                if (typeof loadPosts === "function") {
                    loadPosts();
                }

            } catch (err) {
                console.error("Gagal mengirim postingan:", err.message);
                alert("Terjadi kesalahan saat mengirim postingan: " + err.message);
            }
        });
    }

    // Jalankan pemeriksaan sesi awal
    checkUserSession();
});

// ==========================================
// 7. SISTEM KOMENTAR & UTILS GLOBAL (NESTED)
// ==========================================

function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function toggleComments(postId) {
  const section = document.getElementById(`comment-section-${postId}`);
  if (!section) return;

  const isHidden = section.style.display === 'none' || section.style.display === '';
  section.style.display = isHidden ? 'block' : 'none';

  if (isHidden) {
    await fetchCommentsForPost(postId);
    subscribeToRealtimeComments(postId);
  }
}

// Mengambil komentar & menyusun hirarki (Parent - Child)
async function fetchCommentsForPost(postId) {
  const listEl = document.getElementById(`comments-list-${postId}`);
  if (!listEl) return;

  if (!supabaseClient) {
    listEl.innerHTML = '<p style="font-size:12px; color:red;">Koneksi Supabase belum siap.</p>';
    return;
  }

  // Ambil seluruh komentar untuk post_id ini
  const { data: comments, error } = await supabaseClient
    .from('comments')
    .select('*')
    .eq('post_id', String(postId))
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching comments:', error);
    listEl.innerHTML = '<p style="font-size:12px; color:red;">Gagal memuat komentar.</p>';
    return;
  }

  if (!comments || comments.length === 0) {
    listEl.innerHTML = '<p style="font-size:12px; color: white;">Belum ada komentar. Tulis sesuatu!</p>';
    return;
  }

  // Pisahkan komentar utama dan balasan berdasarkan parent_id
  const parentComments = comments.filter(c => !c.parent_id);
  const replies = comments.filter(c => c.parent_id);

  listEl.innerHTML = parentComments.map(parent => {
    const childReplies = replies.filter(r => String(r.parent_id) === String(parent.id));
    return renderCommentTree(parent, childReplies, postId);
  }).join('');
}

// Render tampilan Komentar Utama beserta Balasannya
function renderCommentTree(parent, replies, postId) {
  const author = escapeHtml(parent.author_name || parent.username || 'Anonim');
  const content = escapeHtml(parent.content);
  const time = new Date(parent.created_at).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' });

  // HTML daftar balasan komentar (di-indent ke kanan)
  const repliesHTML = replies.map(reply => {
    const rAuthor = escapeHtml(reply.author_name || reply.username || 'Anonim');
    const rContent = escapeHtml(reply.content);
    const rTime = new Date(reply.created_at).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' });

    return `
      <div style="margin-top: 6px; margin-left: 18px; padding: 6px 10px; background: #ffffff; border-left: 3px solid #007bff; border-radius: 4px; font-size: 12px; text-align: left;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <strong style="color:#333;">${rAuthor}</strong>
          <span style="font-size:10px; color:#999;">${rTime}</span>
        </div>
        <p style="margin:4px 0 0 0; color:#444; line-height:1.4;">${rContent}</p>
      </div>
    `;
  }).join('');

  return `
    <div style="margin-bottom: 8px; font-size: 13px; background: #f8f9fa; padding: 8px 12px; border-radius: 6px; border: 1px solid #eee; text-align: left;">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <strong style="color:#333;">${author}</strong>
        <span style="font-size:10px; color:#999;">${time}</span>
      </div>
      <p style="margin:4px 0 6px 0; color:#444; line-height:1.4;">${content}</p>

      <!-- Tombol Balas -->
      <button onclick="toggleReplyForm('${parent.id}')" style="background:none; border:none; color:#007bff; font-size:11px; cursor:pointer; padding:0; font-weight:bold;">
        ↩ Balas
      </button>

      <!-- Form Input Balasan (Default Sembunyi) -->
      <div id="reply-form-${parent.id}" style="display:none; margin-top:8px;">
        <form onsubmit="handleCommentSubmit(event, '${postId}', '${parent.id}')" style="display:flex; gap:6px;">
          <input type="text" placeholder="Tulis balasan..." required style="flex:1; padding:6px; font-size:11px; border:1px solid #ccc; border-radius:4px;">
          <button type="submit" style="padding:6px 10px; font-size:11px; background:#28a745; color:white; border:none; border-radius:4px; cursor:pointer;">Kirim</button>
        </form>
      </div>

      <!-- Wadah Balasan Komentar -->
      <div class="replies-container">
        ${repliesHTML}
      </div>
    </div>
  `;
}

// Buka/Tutup Form Balasan Komentar
function toggleReplyForm(commentId) {
  const formBox = document.getElementById(`reply-form-${commentId}`);
  if (formBox) {
    const isHidden = formBox.style.display === 'none' || formBox.style.display === '';
    formBox.style.display = isHidden ? 'block' : 'none';
  }
}

// Handler submit komentar utama maupun balasan (dilihat dari parameter parentId)
async function handleCommentSubmit(event, postId, parentId = null) {
  event.preventDefault();
  const form = event.target;
  const input = form.querySelector('input');
  const submitBtn = form.querySelector('button');
  const content = input ? input.value.trim() : '';

  if (!content) return;

  if (submitBtn) submitBtn.disabled = true;

  // 1. Cek Sesi Auth
  const { data: { session } } = await supabaseClient.auth.getSession();

  if (!session) {
    alert('Kamu harus login terlebih dahulu untuk mengirim komentar!');
    if (submitBtn) submitBtn.disabled = false;
    return;
  }

  // 2. Susun Payload
  const payload = {
    post_id: String(postId),
    user_id: session.user.id,
    author_name: currentUsername || 'Pengguna',
    content: content
  };

  if (parentId) {
    payload.parent_id = parentId; // Simpan parent_id jika berupa balasan
  }

  // 3. Simpan ke Supabase
  const { error } = await supabaseClient
    .from('comments')
    .insert([payload]);

  if (submitBtn) submitBtn.disabled = false;

  if (error) {
    alert('Gagal mengirim komentar: ' + error.message);
  } else {
    input.value = '';
    fetchCommentsForPost(postId);
  }
}

function subscribeToRealtimeComments(postId) {
  if (!supabaseClient) return;

  supabaseClient
    .channel(`public:comments:${postId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'comments',
        filter: `post_id=eq.${postId}`
      },
      () => {
        fetchCommentsForPost(postId);
      }
    )
    .subscribe();
}
