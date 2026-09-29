// ==========================================
// 1. INISIALISASI SUPABASE & VARIABEL GLOBAL
// ==========================================
const SUPABASE_URL = 'https://qcopjasrzjubbgjnxidv.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_YFS1w6HfZbyg-F6QoxISFw_b62yHMO6';

// Simpan instance Supabase ke window agar dapat diakses secara global
window.supabaseClient = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;
const supabaseClient = window.supabaseClient;

// Variabel Status Utama
let currentUsername = "Pengunjung Anonim";
let activeChatUserId = null; 

// ==========================================
// 2. LOGIKA UTAMA (JALAN SAAT DOM READY)
// ==========================================
document.addEventListener("DOMContentLoaded", async () => {

    if (!supabaseClient) {
        console.error("Supabase SDK belum dimuat dengan benar. Pastikan script Supabase sudah terpasang di HTML.");
        return;
    }

    // --- ELEMEN UI PROFIL & AUTHENTIKASI ---
    const boxAuth = document.getElementById("box-auth");
    const boxProfil = document.getElementById("box-profil");
    const profileName = document.getElementById("profile-name");
    const profileEmail = document.getElementById("profile-email");

    // --- ELEMEN UI FORM LOGIN DIRECT ---
    const formLogin = document.getElementById("form-login-direct");
    const loginNotif = document.getElementById("login-notif");
    const btnSubmitLogin = document.getElementById("btn-submit-login");

    // --- ELEMEN UI RESET PASSWORD ---
    const btnShowForgot = document.getElementById("btn-show-forgot");
    const boxForgot = document.getElementById("box-forgot-password");
    const btnSendReset = document.getElementById("btn-send-reset");
    const btnCancelForgot = document.getElementById("btn-cancel-forgot");

    // --- ELEMEN UI POSTINGAN ---
    const createPostBox = document.getElementById("create-post-box");
    const loginRequiredBox = document.getElementById("login-required-box");
    const usernameInput = document.getElementById("username");

    // ------------------------------------------
    // A. FUNGSI PENGECEKAN SESI SANGAT UTAMA
    // ------------------------------------------
    async function checkUserSession() {
        try {
            const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();

            if (sessionError || !session || !session.user) {
                updateUIForLoggedOutUser();
                return;
            }

            const user = session.user;
            activeChatUserId = user.id;

            // Pemantau Panggilan Masuk (opsional)
            if (typeof listenForIncomingCalls === "function") {
                try {
                    listenForIncomingCalls(user.id);
                } catch (e) {
                    console.warn("Gagal menjalankan listenForIncomingCalls:", e);
                }
            }

            // Penentuan Username Fallback
            let username = user.user_metadata?.username 
                || user.user_metadata?.full_name 
                || user.email?.split('@')[0] 
                || "Pengguna";

            // Mengambil Username dari Tabel Profiles Database
            try {
                const { data: profile } = await supabaseClient
                    .from('profiles')
                    .select('username')
                    .eq('id', user.id)
                    .maybeSingle();

                if (profile && profile.username) {
                    username = profile.username;
                }
            } catch (pErr) {
                console.warn("Gagal mengambil profil:", pErr);
            }

            currentUsername = username;
            updateUIForLoggedInUser(user, currentUsername);

        } catch (err) {
            console.error("Detail eror pemeriksaan sesi:", err);
            updateUIForLoggedOutUser();
        }
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
        activeChatUserId = null;
    }

    function showNotification(message, isError = false) {
        if (!loginNotif) return;
        loginNotif.style.display = "block";
        loginNotif.style.backgroundColor = isError ? "#f8d7da" : "#d4edda";
        loginNotif.style.color = isError ? "#721c24" : "#155724";
        loginNotif.style.border = isError ? "1px solid #f5c6cb" : "1px solid #c3e6cb";
        loginNotif.textContent = message;
    }

    // CEK SESI OTOMATIS SETIAP KALI HALAMAN DI-REFRESH
    await checkUserSession();

    // PANTAU PERUBAHAN AUTH secare Real-time
    supabaseClient.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            checkUserSession();
        } else if (event === 'SIGNED_OUT') {
            updateUIForLoggedOutUser();
        }
    });

    // ------------------------------------------
    // B. PROSES LOGIN DIRECT
    // ------------------------------------------
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
                await checkUserSession();
            }
        });
    }

    // ------------------------------------------
    // C. PROSES LUPA KATA SANDI
    // ------------------------------------------
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

    // ------------------------------------------
    // D. PROSES LOGOUT
    // ------------------------------------------
    const btnLogout = document.getElementById("btn-logout");
    if (btnLogout) {
        btnLogout.addEventListener("click", async () => {
            const { error } = await supabaseClient.auth.signOut();
            if (error) {
                alert("Gagal keluar: " + error.message);
            } else {
                updateUIForLoggedOutUser();
                window.location.reload();
            }
        });
    }

    // ------------------------------------------
    // E. PROSES EDIT PROFIL
    // ------------------------------------------
    const formUbahProfil = document.getElementById('formUbahProfil');
    if (formUbahProfil) {
        formUbahProfil.addEventListener('submit', async (event) => {
            event.preventDefault();

            const inputNama = document.getElementById('namaLengkap');
            const inputEmail = document.getElementById('email');
            const errNama = document.getElementById('errNama');
            const errEmail = document.getElementById('errEmail');

            let isValid = true;

            if (inputNama.value.trim() === '') {
                showError(errNama, 'Nama lengkap wajib diisi!');
                isValid = false;
            } else {
                hideError(errNama);
            }

            if (inputEmail.value.trim() === '') {
                showError(errEmail, 'Alamat email wajib diisi!');
                isValid = false;
            } else if (!isValidEmail(inputEmail.value.trim())) {
                showError(errEmail, 'Format email tidak valid!');
                isValid = false;
            } else {
                hideError(errEmail);
            }

            if (isValid) {
                try {
                    // Update metadata nama pada auth Supabase
                    const { error: updateError } = await supabaseClient.auth.updateUser({
                        email: inputEmail.value.trim(),
                        data: { username: inputNama.value.trim() }
                    });

                    if (updateError) throw updateError;

                    alert('Data profil berhasil diperbarui!');
                    window.location.href = 'index.html';
                } catch (err) {
                    alert('Gagal mengedit profil: ' + err.message);
                }
            }
        });
    }

    // ------------------------------------------
    // F. FORM DUAL MODE: PENDAFTARAN & LOGIN
    // ------------------------------------------
    const formPendaftaran = document.getElementById('form-pendaftaran');
    const pesanNotif = document.getElementById('pesan-notif');
    const btnDaftar = document.getElementById('btn-submit');
    const judulForm = document.getElementById('judul-form');
    
    const groupUsername = document.getElementById('group-username');
    const inputUsername = document.getElementById('username');
    const inputEmail = document.getElementById('email');
    const inputPassword = document.getElementById('password');
    
    const linkPengalih = document.getElementById('link-pengalih');
    const teksPengalih = document.getElementById('teks-pengalih');

    let isLoginMode = false;

    if (linkPengalih) {
        linkPengalih.addEventListener('click', (e) => {
            e.preventDefault();
            isLoginMode = !isLoginMode;

            if (pesanNotif) pesanNotif.style.display = 'none';

            if (isLoginMode) {
                if (judulForm) judulForm.textContent = 'Login Akun';
                if (btnDaftar) {
                    btnDaftar.textContent = 'Masuk';
                    btnDaftar.style.backgroundColor = '#007bff';
                }
                if (teksPengalih) teksPengalih.textContent = 'Belum punya akun?';
                linkPengalih.textContent = 'Daftar di sini';
                
                if (groupUsername) groupUsername.style.display = 'none';
                if (inputUsername) inputUsername.removeAttribute('required');
            } else {
                if (judulForm) judulForm.textContent = 'Daftar Akun Baru';
                if (btnDaftar) {
                    btnDaftar.textContent = 'Daftar Sekarang';
                    btnDaftar.style.backgroundColor = '#28a745';
                }
                if (teksPengalih) teksPengalih.textContent = 'Sudah punya akun?';
                linkPengalih.textContent = 'Login di sini';
                
                if (groupUsername) groupUsername.style.display = 'block';
                if (inputUsername) inputUsername.setAttribute('required', 'true');
            }
        });
    }

    if (formPendaftaran) {
        formPendaftaran.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = inputEmail.value.trim();
            const password = inputPassword.value;
            const username = inputUsername ? inputUsername.value.trim() : '';

            btnDaftar.disabled = true;
            btnDaftar.textContent = isLoginMode ? 'Memproses Masuk...' : 'Mendaftarkan...';

            try {
                if (isLoginMode) {
                    const { error: authError } = await supabaseClient.auth.signInWithPassword({
                        email: email,
                        password: password
                    });

                    if (authError) throw authError;

                    tampilkanPesan('Login berhasil! Mengalihkan ke halaman utama...', 'sukses');
                    setTimeout(() => { window.location.href = '../index.html'; }, 1500);

                } else {
                    const { error: authError } = await supabaseClient.auth.signUp({
                        email: email,
                        password: password,
                        options: { data: { username: username } }
                    });

                    if (authError) throw authError;

                    tampilkanPesan('Pendaftaran berhasil! Mengalihkan ke halaman utama...', 'sukses');
                    setTimeout(() => { window.location.href = '../index.html'; }, 2000);
                }

            } catch (error) {
                const pesanRamah = ubahPesanErrorKeBahasaRamah(error);
                tampilkanPesan(pesanRamah, 'gagal');
                btnDaftar.disabled = false;
                btnDaftar.textContent = isLoginMode ? 'Masuk' : 'Daftar Sekarang';
            }
        });
    }

    // Pembantu Form
    function showError(element, message) {
        if (!element) return;
        element.textContent = message;
        element.style.display = 'block';
    }

    function hideError(element) {
        if (!element) return;
        element.textContent = '';
        element.style.display = 'none';
    }

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function ubahPesanErrorKeBahasaRamah(error) {
        const pesan = error.message ? error.message.toLowerCase() : '';

        if (pesan.includes('invalid login credentials') || pesan.includes('invalid credentials')) {
            return 'Email atau kata sandi yang kamu masukkan salah. Silakan periksa kembali!';
        }
        if (pesan.includes('rate limit exceeded') || pesan.includes('email rate limit')) {
            return 'Terlalu banyak percobaan. Mohon tunggu beberapa menit lagi sebelum mencoba kembali ya!';
        }
        if (error.code === '23505' || pesan.includes('unique constraint') || pesan.includes('profiles_username_key')) {
            return 'Username ini sudah digunakan oleh pengguna lain. Silakan coba nama lain!';
        }
        if (pesan.includes('already registered') || pesan.includes('user already registered')) {
            return 'Email ini sudah terdaftar. Silakan masuk (login) menggunakan email ini!';
        }
        if (pesan.includes('password should be at least')) {
            return 'Kata sandi terlalu pendek. Mohon gunakan minimal 6 karakter!';
        }

        return 'Waduh, terjadi kendala: ' + error.message;
    }

    function tampilkanPesan(teks, tipe) {
        if (!pesanNotif) return;
        pesanNotif.textContent = teks;
        pesanNotif.style.display = 'block';
        pesanNotif.style.backgroundColor = (tipe === 'sukses') ? '#d4edda' : '#f8d7da';
        pesanNotif.style.color = (tipe === 'sukses') ? '#155724' : '#721c24';
    }
});
