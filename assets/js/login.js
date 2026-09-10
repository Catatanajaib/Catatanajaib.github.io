// ==========================================
// 1. INISIALISASI SUPABASE
// ==========================================
const SUPABASE_URL = 'https://qcopjasrzjubbgjnxidv.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_YFS1w6HfZbyg-F6QoxISFw_b62yHMO6';

const supabaseClient = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

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

    // --- ELEMEN UI LOGOUT ---
    const btnLogout = document.getElementById("btn-logout");

    // --- ELEMEN UI FORM POSTINGAN BARU ---
    const createPostBox = document.getElementById("create-post-box");
    const loginRequiredBox = document.getElementById("login-required-box");
    const usernameInput = document.getElementById("username");
    const postForm = document.getElementById("postForm");

    // Variable global untuk menyimpan username aktif
    let currentUsername = "";

    // ==========================================
    // 2. FUNGSI CEK STATUS SESI & PROFILE
    // ==========================================
    async function checkUserSession() {
        // 1. Cek user yang sedang aktif
        const { data: { user }, error: authError } = await supabaseClient.auth.getUser();

        if (authError || !user) {
            updateUIForLoggedOutUser();
            return;
        }

        // 2. Ambil data profil dari tabel 'profiles'
        const { data: profile } = await supabaseClient
            .from('profiles')
            .select('username')
            .eq('id', user.id)
            .maybeSingle(); // Menggunakan maybeSingle agar tidak error jika baris belum ada

        // 3. Urutan prioritas username:
        // Tabel profiles -> user_metadata -> Potongan Depan Email -> Default "Pengguna"
        currentUsername = profile?.username 
            || user.user_metadata?.username 
            || user.email?.split('@')[0] 
            || "Pengguna";

        // 4. Tampilkan ke UI
        updateUIForLoggedInUser(user, currentUsername);
    }

    // Fungsi memperbarui tampilan saat pengguna SUDAH login
    function updateUIForLoggedInUser(user, username) {
        if (boxAuth) boxAuth.style.display = "none";
        if (boxProfil) boxProfil.style.display = "block";
        
        if (profileEmail) profileEmail.textContent = user.email || "-";
        if (profileName) profileName.textContent = username;

        // Tampilan Form Postingan
        if (createPostBox) createPostBox.style.display = "block";
        if (loginRequiredBox) loginRequiredBox.style.display = "none";
        if (usernameInput) usernameInput.value = username;
    }

    // Fungsi memperbarui tampilan saat pengguna BELUM login
    function updateUIForLoggedOutUser() {
        if (boxAuth) boxAuth.style.display = "block";
        if (boxProfil) boxProfil.style.display = "none";

        if (createPostBox) createPostBox.style.display = "none";
        if (loginRequiredBox) loginRequiredBox.style.display = "block";
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

            const { error } = await supabaseClient.auth.signInWithPassword({
                email: email,
                password: password,
            });

            if (btnSubmitLogin) {
                btnSubmitLogin.disabled = false;
                btnSubmitLogin.textContent = "Masuk";
            }

            if (error) {
                showNotification("Gagal Masuk: " + error.message, true);
            } else {
                showNotification("Login berhasil! Memuat profil...", false);
                setTimeout(() => {
                    checkUserSession(); // Muat ulang sesi & username dari tabel profiles
                }, 1000);
            }
        });
    }

    // ==========================================
    // 4. LUPA / RESET KATA SANDI
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
                // Gunakan currentUsername yang didapat dari tabel profiles
                const { error } = await supabaseClient
                    .from('posts')
                    .insert([
                        {
                            user_id: session.user.id,
                            author_name: currentUsername,
                            content: contentText,
                            created_at: new Date().toISOString()
                        }
                    ]);

                if (error) throw error;

                alert("Postingan berhasil diterbitkan!");
                postForm.reset();

                if (usernameInput) {
                    usernameInput.value = currentUsername;
                }

                if (typeof loadPosts === "function") {
                    loadPosts();
                }

            } catch (err) {
                console.error("Gagal mengirim postingan:", err.message);
                alert("Terjadi kesalahan saat mengirim postingan: " + err.message);
            }
        });
    }

    // Jalankan pemeriksaan sesi pertama kali saat halaman dimuat
    checkUserSession();
});
