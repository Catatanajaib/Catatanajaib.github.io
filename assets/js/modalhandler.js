// Menangani klik pada elemen apa pun yang memiliki class 'open-modal-btn'
document.addEventListener('click', (e) => {
  const triggerBtn = e.target.closest('.open-modal-btn');
  
  // Jika yang diklik adalah tombol pembuka modal
  if (triggerBtn) {
    e.preventDefault();
    const targetId = triggerBtn.getAttribute('data-target');
    const modal = document.getElementById(targetId);
    
    if (modal) {
      modal.style.display = 'block'; // Atau modal.classList.add('active');
    }
  }

  // Menutup modal saat tombol 'x' / close-btn diklik
  if (e.target.classList.contains('close-btn')) {
    const modal = e.target.closest('.modal');
    if (modal) modal.style.display = 'none';
  }

  // Menutup modal saat mengklik area latar belakang (overlay)
  if (e.target.classList.contains('modal')) {
    e.target.style.display = 'none';
  }
});
