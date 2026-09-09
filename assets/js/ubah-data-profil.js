// Memastikan script berjalan setelah seluruh elemen DOM selesai dimuat
document.addEventListener('DOMContentLoaded', () => {
  const formUbahProfil = document.getElementById('formUbahProfil');

  if (formUbahProfil) {
    formUbahProfil.addEventListener('submit', (event) => {
      // Mencegah form dari reload/submit bawaan browser
      event.preventDefault();

      // Ambil elemen input
      const inputNama = document.getElementById('namaLengkap');
      const inputEmail = document.getElementById('email');
      
      // Ambil elemen tempat pesan error
      const errNama = document.getElementById('errNama');
      const errEmail = document.getElementById('errEmail');

      let isValid = true;

      // 1. Validasi Nama Lengkap
      if (inputNama.value.trim() === '') {
        showError(errNama, 'Nama lengkap wajib diisi!');
        isValid = false;
      } else {
        hideError(errNama);
      }

      // 2. Validasi Email
      if (inputEmail.value.trim() === '') {
        showError(errEmail, 'Alamat email wajib diisi!');
        isValid = false;
      } else if (!isValidEmail(inputEmail.value.trim())) {
        showError(errEmail, 'Format email tidak valid!');
        isValid = false;
      } else {
        hideError(errEmail);
      }

      // 3. Jika semua input sudah benar/valid
      if (isValid) {
        alert('Data profil berhasil diperbarui!');
        // Setelah berhasil, arahkan kembali pengguna ke halaman index.html
        window.location.href = 'index.html';
      }
    });
  }

  // Fungsi pembantu untuk menampilkan pesan kesalahan
  function showError(element, message) {
    element.textContent = message;
    element.style.display = 'block';
  }

  // Fungsi pembantu untuk menyembunyikan pesan kesalahan
  function hideError(element) {
    element.textContent = '';
    element.style.display = 'none';
  }

  // Fungsi pembantu untuk mengecek format email menggunakan Regular Expression (Regex)
  function isValidEmail(email) {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(email);
  }
});
