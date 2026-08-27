document.addEventListener('DOMContentLoaded', () => {
  // Modal Handler
  const modalButtons = document.querySelectorAll('.open-modal-btn');
  const closeButtons = document.querySelectorAll('.close-btn');

  modalButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('data-target');
      const modalToOpen = document.getElementById(targetId);
      if (modalToOpen) modalToOpen.style.display = 'block';
    });
  });

  closeButtons.forEach(button => {
    button.addEventListener('click', function() {
      const modal = this.closest('.modal');
      if (modal) modal.style.display = 'none';
    });
  });

  window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
      e.target.style.display = 'none';
    }
  });

  // Navbar Auto-Hide
  const navbar = document.querySelector(".navbar");
  let lastScrollY = window.scrollY;

  if (navbar) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > lastScrollY && window.scrollY > 50) {
        navbar.classList.add("navbar--hidden");
      } else {
        navbar.classList.remove("navbar--hidden");
      }
      lastScrollY = window.scrollY;
    });
  }
});
