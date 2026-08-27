class mycssmyjs extends HTMLElement {
  connectedCallback() {
    // 1. Muat File CSS via innerHTML
    this.innerHTML = `
      <link rel="stylesheet" href="/css/global.css">
      <link rel="stylesheet" href="/css/beranda.css">
      <link rel="stylesheet" href="/css/postingan.css">
    `;

    // 2. Muat File JS secara dinamis menggunakan createElement
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
