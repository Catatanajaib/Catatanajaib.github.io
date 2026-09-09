// ==========================================================================
// LOGIKA PENDAFTARAN & LOGIN AKUN CATATAN AJAIB (SUPABASE AUTH & PROFILES)
// ==========================================================================

// 1. Inisialisasi Supabase menggunakan URL dan Kunci API milikmu
const SUPABASE_URL = 'https://qcopjasrzjubbgjnxidv.supabase.co';
const SUPABASE_KEY = 'sb_publishable_YFS1w6HfZbyg-F6QoxISFw_b62yHMO6';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

document.addEventListener('DOMContentLoaded', () => {
    // Elemen DOM
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

    let isLoginMode = false; // Status mode (false = Pendaftaran, true = Login)

    // 2. Fungsi Pengalih (Toggle) Mode Pendaftaran dan Login
    if (linkPengalih) {
        linkPengalih.addEventListener('click', (e) => {
            e.preventDefault();
            isLoginMode = !isLoginMode;

            // Sembunyikan notifikasi saat berpindah mode
            if (pesanNotif) pesanNotif.style.display = 'none';

            if (isLoginMode) {
                // Tampilan Mode Login
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
                // Tampilan Mode Pendaftaran
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

    // 3. Menangani Submit Form (Pendaftaran atau Login)
    if (formPendaftaran) {
        formPendaftaran.addEventListener('submit', async (e) => {
            e.preventDefault(); // Mencegah reload halaman saat submit

            const email = inputEmail.value.trim();
            const password = inputPassword.value;
            const username = inputUsername ? inputUsername.value.trim() : '';

            // Mengubah status tombol saat memproses
            btnDaftar.disabled = true;
            btnDaftar.textContent = isLoginMode ? 'Memproses Masuk...' : 'Mendaftarkan...';

            try {
                if (isLoginMode) {
                    // ================= LOGIKA LOGIN =================
                    const { data: authData, error: authError } = await supabaseClient.auth.signInWithPassword({
                        email: email,
                        password: password
                    });

                    if (authError) throw authError;

                    tampilkanPesan('Login berhasil! Mengalihkan ke halaman utama...', 'sukses');
                    
                    setTimeout(() => {
                        window.location.href = '../index.html';
                    }, 1500);

                } else {
                    // ================= LOGIKA PENDAFTARAN =================
                    // Langkah A: Daftarkan Email & Password ke Supabase Auth
                    const { data: authData, error: authError } = await supabaseClient.auth.signUp({
                        email: email,
                        password: password
                    });

                    if (authError) throw authError;

                    // Langkah B: Simpan Username ke Tabel Profiles di Database
                    if (authData.user) {
                        const userId = authData.user.id;

                        const { error: profileError } = await supabaseClient
                            .from('profiles')
                            .insert([
                                { 
                                    id: userId, 
                                    username: username,
                                    bio: 'Halo, aku pengguna baru!' 
                                }
                            ]);

                        if (profileError) throw profileError;

                        tampilkanPesan('Pendaftaran berhasil! Mengalihkan ke halaman utama...', 'sukses');
                        
                        setTimeout(() => {
                            window.location.href = '../index.html';
                        }, 2000);
                    }
                }

            } catch (error) {
                // Tangkap error dan terjemahkan menjadi pesan yang ramah
                const pesanRamah = ubahPesanErrorKeBahasaRamah(error);
                tampilkanPesan(pesanRamah, 'gagal');
                
                // Kembalikan tombol ke keadaan semula
                btnDaftar.disabled = false;
                btnDaftar.textContent = isLoginMode ? 'Masuk' : 'Daftar Sekarang';
            }
        });
    }

    // 4. Fungsi untuk mengonversi error teknis Supabase menjadi kalimat ramah
    function ubahPesanErrorKeBahasaRamah(error) {
        const pesan = error.message ? error.message.toLowerCase() : '';

        // Error Khas Login
        if (pesan.includes('invalid login credentials') || pesan.includes('invalid credentials')) {
            return 'Email atau kata sandi yang kamu masukkan salah. Silakan periksa kembali!';
        }

        // Cek jika terkena pembatasan frekuensi pengiriman email
        if (pesan.includes('rate limit exceeded') || pesan.includes('email rate limit')) {
            return 'Terlalu banyak percobaan. Mohon tunggu beberapa menit lagi sebelum mencoba kembali ya!';
        }

        // Cek jika username sudah dipakai (Error PostgreSQL 23505)
        if (error.code === '23505' || pesan.includes('unique constraint') || pesan.includes('profiles_username_key')) {
            return 'Username ini sudah digunakan oleh pengguna lain. Silakan coba nama lain!';
        }

        // Cek jika email sudah terdaftar
        if (pesan.includes('already registered') || pesan.includes('user already registered')) {
            return 'Email ini sudah terdaftar. Silakan masuk (login) menggunakan email ini!';
        }

        // Cek jika password kurang panjang
        if (pesan.includes('password should be at least')) {
            return 'Kata sandi terlalu pendek. Mohon gunakan minimal 6 karakter!';
        }

        // Pesan standar jika terjadi kesalahan lain
        return 'Waduh, terjadi kendala: ' + error.message;
    }

    // 5. Fungsi Pembantu untuk Menampilkan Notifikasi di Layar
    function tampilkanPesan(teks, tipe) {
        if (!pesanNotif) return;
        pesanNotif.textContent = teks;
        pesanNotif.style.display = 'block';
        pesanNotif.style.backgroundColor = (tipe === 'sukses') ? '#d4edda' : '#f8d7da';
        pesanNotif.style.color = (tipe === 'sukses') ? '#155724' : '#721c24';
    }
});
