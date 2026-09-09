// ==========================================
// 1. INISIALISASI SUPABASE
// ==========================================
// Isikan URL dan ANON_KEY proyek Supabase milikmu di sini
const SUPABASE_URL = 'https://qcopjasrzjubbgjnxidv.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_YFS1w6HfZbyg-F6QoxISFw_b62yHMO6';

const supabaseClient = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

document.addEventListener("DOMContentLoaded", () => {
    if (!supabaseClient) {
        console.error("Supabase SDK belum dimuat dengan benar.");
        return;
    }

    // Elemen UI Auth
    const boxAuth = document.getElementById("box-auth");
    const boxProfil = document.getElementById("box-profil");
    const profileName = document.getElementById("profile-name");
    const profileEmail = document.getElementById("profile-email");

    // Form Login
    const formLogin = document.getElementById("form-login-direct");
    const loginNotif = document.getElementById("login-notif");
    const btnSubmitLogin = document.getElementById("btn-submit-login");

    // Form Reset Password
    const btnShowForgot = document.getElementById("btn-show-forgot");
    const boxForgot = document.getElementById("box-forgot-password");
    const btnSendReset = document.getElementById("btn-send-reset");
    const btnCancelForgot = document.getElementById("btn-cancel-forgot");

    // Tombol Logout
    const btnLogout = document.getElementById("btn-logout");

    // ==========================================
    // 2. CEK STATUS SESI PENGGUNA (AUTO LOGIN)
    // ==========================================
    async function checkUserSession() {
        const { data: { session }, error } = await supabaseClient.auth.getSession();
        if (session && session.user) {
            updateUIForLoggedInUser(session.user);
        } else {
            updateUIForLoggedOutUser();
        }
    }

    function updateUIForLoggedInUser(user) {
        if (boxAuth) boxAuth.style.display = "none";
        if (boxProfil) boxProfil.style.display = "block";
        if (profileEmail) profileEmail.textContent = user.email || "-";
        if (profileName) {
            // Mengambil metadata username jika ada
            profileName.textContent = user.user_metadata?.username || user.email.split('@')[0];
        }
    }

    function updateUIForLoggedOutUser() {
        if (boxAuth) boxAuth.style.display = "block";
        if (boxProfil) boxProfil.style.display = "none";
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

            btnSubmitLogin.disabled = true;
            btnSubmitLogin.textContent = "Memproses...";

            const { data, error } = await supabaseClient.auth.signInWithPassword({
                email: email,
                password: password,
            });

            btnSubmitLogin.disabled = false;
            btnSubmitLogin.textContent = "Masuk";

            if (error) {
                showNotification("Gagal Masuk: " + error.message, true);
            } else {
                showNotification("Login berhasil! Memuat profil...", false);
                setTimeout(() => {
                    updateUIForLoggedInUser(data.user);
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

    // Jalankan pemeriksaan sesi saat pertama kali halaman dimuat
    checkUserSession();
});
