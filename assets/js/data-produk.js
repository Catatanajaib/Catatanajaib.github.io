// 1. Data Seluruh Produk (Lengkap dengan Detail)
const products = [
    {
        id: 1,
        title: "Kemeja Polos Casual",
        category: "Pakaian Pria",
        price: "Rp 120.000",
        rawPrice: 120000,
        description: "Bahan katun adem, cocok untuk aktivitas harian maupun formal. Potongan regular fit yang nyaman dipakai seharian tanpa terasa panas.",
        image: "https://via.placeholder.com/400x500",
        sizes: ["M", "L", "XL", "XXL"],
        features: [
            "100% Katun Premium (Adem & Lembut)",
            "Jahitan Rapi & Kuat",
            "Garansi Tukar Size jika tidak pas"
        ],
        sellerId: "80cb070a-2e2e-4698-b24f-4666b4514b58",
        sellerUsername: "miftah98"
    },
    {
        id: 2,
        title: "Sepatu Sneaker Lokal",
        category: "Sepatu Pria",
        price: "Rp 250.000",
        rawPrice: 250000,
        description: "Sol empuk, desain elegan, dan tahan lama untuk pemakaian harian.",
        image: "https://via.placeholder.com/400x500",
        sizes: ["39", "40", "41", "42", "43"],
        features: [
            "Bahan Kanvas Breathable",
            "Sol Karet Anti Selip",
            "Insole Empuk & Nyaman"
        ],
        sellerId: "80cb070a-2e2e-4698-b24f-4666b4514b58",
        sellerUsername: "miftah98"
    },
    {
        id: 3,
        title: "Tas Ransel Laptop",
        category: "Aksesoris",
        price: "Rp 180.000",
        rawPrice: 180000,
        description: "Dilengkapi kompartemen laptop 15 inci dan bahan tahan air.",
        image: "https://via.placeholder.com/400x500",
        sizes: ["All Size"],
        features: [
            "Bahan Water Resistant",
            "Slot Laptop 15 Inch Dilindungi Busa",
            "Resleting Anti Macet"
        ],
        sellerId: "80cb070a-2e2e-4698-b24f-4666b4514b58",
        sellerUsername: "miftah98"
    }
];

// 2. Fungsi Render Katalog Produk Ke HTML
function renderProducts() {
    const container = document.getElementById('product-list');
    if (!container) return;
    
    container.innerHTML = '';

    products.forEach(product => {
        const cardHTML = `
            <div class="product-card">
                <img src="${product.image}" alt="${product.title}" class="product-image">
                <div class="product-info">
                    <h3 class="product-title" onclick="showProductDetail(${product.id})" style="cursor: pointer;">
                        ${product.title}
                    </h3>
                    <div class="product-price">${product.price}</div>
                    <p class="product-description">${product.description}</p>
                    <div class="card-actions">
                        <button class="action-btn btn-chat-right" onclick="openPrivateChat('${product.sellerId}', '${product.sellerUsername}')" style="width: 100%; text-align: left; background: none; border: none; padding: 6px 10px; cursor: pointer; font-size: 13px;">
                            💬 Kirim Pesan
                        </button>
                        <button class="btn-buy" onclick="openPaymentModal(${product.id})">Bayar Sekarang</button>
                    </div>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', cardHTML);
    });
}

// 3. Fungsi Sinkronisasi Data ke Modal Detail Produk
function showProductDetail(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    // Isi elemen modal detail
    document.getElementById('modal-img').src = product.image;
    document.getElementById('modal-img').alt = product.title;
    document.getElementById('modal-category').textContent = product.category;
    document.getElementById('modal-title').textContent = product.title;
    document.getElementById('modal-price').textContent = product.price;
    document.getElementById('modal-description').textContent = product.description;

    // Render Pilihan Ukuran
    const sizesContainer = document.getElementById('modal-sizes');
    sizesContainer.innerHTML = product.sizes.map((size, index) => `
        <button class="btn-option ${index === 0 ? 'active' : ''}" onclick="selectOption(this)">${size}</button>
    `).join('');

    // Render Daftar Keunggulan
    const featuresContainer = document.getElementById('modal-features');
    featuresContainer.innerHTML = product.features.map(feature => `
        <div class="feature-item"><span>✓</span> ${feature}</div>
    `).join('');

    // Buka Modal Detail
    document.getElementById('modal-detail-produk').style.display = 'block';
}

// 4. Fungsi Sinkronisasi Data ke Modal Pembayaran / Checkout
// 4. Fungsi Sinkronisasi Data & Generate QR Code ke Modal Pembayaran
function openPaymentModal(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    // 1. Generate ID Transaksi Unik
    const randomTrx = 'TRX-' + Math.floor(100000000 + Math.random() * 900000000);

    // 2. Update Informasi Rincian Pesanan
    const checkoutCard = document.querySelector('#tombol-beli .checkout-card');
    if (checkoutCard) {
        checkoutCard.querySelector('.order-row:nth-child(1) .value').textContent = '#' + randomTrx;
        checkoutCard.querySelector('.order-row:nth-child(2) .value').textContent = product.title;
        checkoutCard.querySelector('.order-row:nth-child(4) .value').textContent = product.price;
    }

    // 3. Path ke gambar QRIS GoPay Merchant Anda
    const qrisGopayPath = "../assets/images/qrcodetoko.png"; 

    // 4. Set gambar ke modal
    const qrImageElement = document.getElementById('qr-code-img');
    if (qrImageElement) {
        qrImageElement.src = qrisGopayPath;
    }

    document.getElementById('tombol-beli').style.display = 'block';
}



// 5. Helper untuk Mengubah Efek Aktif pada Tombol Ukuran
function selectOption(btn) {
    const parent = btn.parentElement;
    parent.querySelectorAll('.btn-option').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

// 6. Jalankan saat DOM Selesai Dimuat
document.addEventListener('DOMContentLoaded', renderProducts);
