class mycssmyjs extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
<link rel="stylesheet" href="/css/global.css">
<link rel="stylesheet" href="/css/beranda.css">
<link rel="stylesheet" href="/css/postingan.css">
<script src="/Javascript/common.js" defer></script>
<script src="/Javascript/beranda.js" defer></script>
<script src="/Javascript/postingan.js" defer></script>
    `;
  }
}

customElements.define('mycssmyjs', mycssmyjs);

// untuk memanggil 
// <mycssmyjs></mycssmyjs>

//  <script src="mycssmyjs.js"></script>
