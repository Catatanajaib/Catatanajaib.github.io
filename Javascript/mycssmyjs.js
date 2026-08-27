class mycssmyjs extends HTMLElement {
  connectedCallback() {
    // 1. Masukkan file CSS via innerHTML
    this.innerHTML = `
      <link rel="stylesheet" href="/css/global.css">
      <link rel="stylesheet" href="/css/beranda.css">
      <link rel="stylesheet" href="/css/postingan.css">
    `;

    // 2. Suntikkan file JavaScript satu per satu agar dieksekusi browser
    const scripts = [
      '/Javascript/common.js',
      '/Javascript/beranda.js',
      '/Javascript/postingan.js'
    ];

    scripts.forEach(src => {
      const script = document.createElement('script');
      script.src = src;
      script.defer = true;
      document.head.appendChild(script);
    });
  }
}

customElements.define('mycssmyjs', mycssmyjs);
