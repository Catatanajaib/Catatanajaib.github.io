class mycssmyjs extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
<link rel="stylesheet" href="../css/global.css">
<link rel="stylesheet" href="../css/beranda.css">
<link rel="stylesheet" href="../css/postingan.css">
<script src="../javascript/common.js" defer></script>
<script src="../javascript/beranda.js" defer></script>
<script src="../javascript/postingan.js defer"></script>
    `;
  }
}

customElements.define('mycssmyjs', mycssmyjs);

// untuk memanggil 
// <mycssmyjs></mycssmyjs>

//  <script src="mycssmyjs.js"></script>