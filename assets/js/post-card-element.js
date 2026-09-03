class PostCardElement extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        // Mengambil nilai dari atribut HTML atau menggunakan nilai bawaan
        const title = this.getAttribute('title') || 'Judul Postingan';
        const highlight = this.getAttribute('highlight') || '';
        const excerpt = this.getAttribute('excerpt') || '';
        const link = this.getAttribute('link') || '#';
        const date = this.getAttribute('date') || 'Terbaru';

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    margin-bottom: 20px;
                }
                .card {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    padding: 20px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                    text-align: left;
                }
                .card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
                }
                .card-date {
                    font-size: 0.8rem;
                    color: #64748b;
                    margin-bottom: 8px;
                }
                .card-title {
                    font-size: 1.25rem;
                    font-weight: 700;
                    margin: 0 0 12px 0;
                    color: #0f172a;
                }
                .card-title a {
                    color: inherit;
                    text-decoration: none;
                }
                .card-title a:hover {
                    color: #2563eb;
                }
                /* Area Sorotan Utama (Menarik Perhatian) */
                .card-highlight {
                    background: #eff6ff;
                    border-left: 4px solid #2563eb;
                    padding: 10px 12px;
                    border-radius: 4px;
                    font-size: 0.9rem;
                    font-weight: 600;
                    color: #1e40af;
                    margin-bottom: 12px;
                }
                .card-excerpt {
                    font-size: 0.95rem;
                    color: #334155;
                    line-height: 1.6;
                    margin-bottom: 16px;
                }
                .btn-read {
                    display: inline-block;
                    padding: 8px 16px;
                    background: #2563eb;
                    color: #ffffff;
                    border-radius: 6px;
                    text-decoration: none;
                    font-size: 0.875rem;
                    font-weight: 600;
                }
                .btn-read:hover {
                    background: #1d4ed8;
                }
            </style>

            <div class="card">
                <div class="card-date">📅 ${date}</div>
                <h2 class="card-title">
                    <a href="${link}">${title}</a>
                </h2>
                
                ${highlight ? `<div class="card-highlight">🔥 ${highlight}</div>` : ''}
                
                <p class="card-excerpt">${excerpt}</p>
                
                <a href="${link}" class="btn-read">Baca Selengkapnya &rarr;</a>
            </div>
        `;
    }
}

// Mendaftarkan Web Component kustom
customElements.define('post-card', PostCardElement);
