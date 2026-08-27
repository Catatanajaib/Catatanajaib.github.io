class mycssmyjs extends HTMLElement {
  connectedCallback() {
    // 1. Masukkan CSS via innerHTML (CSS tetap jalan via innerHTML)
    this.innerHTML = `
      <link rel="stylesheet" href="/css/global.css">
      <link rel="stylesheet" href="/css/beranda.css">
      <link rel="stylesheet" href="/css/postingan.css">
    `;

    // 2. Buat dan tempelkan tag <script> secara dinamis
    const jsFiles = [
      '/Javascript/common.js',
      '/Javascript/beranda.js',
      '/Javascript/postingan.js'
    ];

    jsFiles.forEach(src => {
      const script = document.createElement('script');
      script.src = src;
      script.defer = true;
      document.head.appendChild(script); // Script disuntikkan ke <head> agar dieksekusi browser
    });
  }
}

customElements.define('mycssmyjs', mycssmyjs);
