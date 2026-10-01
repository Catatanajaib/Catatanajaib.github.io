class PlayMusikIn extends HTMLElement {
    constructor() {
        super();
        // 1. Inisialisasi Shadow DOM
        this.attachShadow({ mode: 'open' });
        
        // 2. Inisialisasi State
        this.currentSongIndex = 0;
        this.isPlaying = false;
        
        // Pastikan path 'src' mengarah ke file audio mp3 yang valid
        this.songs = [
            {
                title: "Judul Lagu 1",
                artist: "Artis 1",
                src: "../assets/musik/1.mp3"
            },
            {
                title: "Judul Lagu 2",
                artist: "Artis 2",
                src: "../assets/musik/2.mp3"
            }
        ];
    }

    connectedCallback() {
        const isSubPage = window.location.pathname.includes('/pages/');
        const basePath = isSubPage ? '../' : './';
        
        // Render Struktur HTML & CSS ke Shadow DOM
        this.shadowRoot.innerHTML = `
        <style>
.music-player-card {
    width: 100%;
    height: 15%;
    min-height: 110px; /* Menjaga tata letak tetap presisi di layar HP */
    background: rgba(30, 30, 47, 0.85);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    color: #ffffff;
    border-radius: 12px;
    padding: 10px 14px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.37), inset 0 1px 1px rgba(255, 255, 255, 0.1);
    font-family: system-ui, -apple-system, sans-serif;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    border: 1px solid rgba(255, 255, 255, 0.08);
}

.player-header {
    display: flex;
    align-items: center;
    gap: 12px;
}

.album-art {
    width: 42px;
    height: 42px;
    flex-shrink: 0;
    background: linear-gradient(135deg, #ff007f, #7928ca);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    box-shadow: 0 4px 15px rgba(255, 0, 127, 0.4);
    transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.album-art.playing {
    animation: pulse 1.5s infinite alternate;
}

@keyframes pulse {
    0% { transform: scale(1); box-shadow: 0 4px 15px rgba(255, 0, 127, 0.4); }
    100% { transform: scale(1.08); box-shadow: 0 6px 20px rgba(255, 0, 127, 0.7); }
}

.track-info {
    overflow: hidden;
    white-space: nowrap;
}

.track-info h3 {
    margin: 0;
    font-size: 0.95rem;
    font-weight: 600;
    color: #fff;
    text-overflow: ellipsis;
    overflow: hidden;
}

.track-info p {
    margin: 2px 0 0;
    font-size: 0.78rem;
    color: #a0a0b8;
    text-overflow: ellipsis;
    overflow: hidden;
}

.progress-container {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.75rem;
    color: #8a8a9e;
}

#progress-bar {
    flex: 1;
    height: 4px;
    accent-color: #ff007f;
    cursor: pointer;
    border-radius: 2px;
}

.player-controls {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 12px;
}

.btn-ctrl {
    background: rgba(255, 255, 255, 0.08);
    border: none;
    color: #fff;
    font-size: 0.9rem;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
}

.btn-ctrl:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.05);
}

.btn-play {
    background: linear-gradient(135deg, #ff007f, #e00070);
    width: 38px;
    height: 38px;
    font-size: 1rem;
    box-shadow: 0 4px 14px rgba(255, 0, 127, 0.5);
}

.btn-play:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 18px rgba(255, 0, 127, 0.7);
}

.playlist-container {
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    padding-top: 6px;
}

.playlist-container h4 {
    margin: 0 0 4px;
    font-size: 0.8rem;
    color: #b3b3c6;
}

.playlist-list {
    list-style: none;
    padding: 0;
    margin: 0;
    max-height: 80px;
    overflow-y: auto;
}

.playlist-list li {
    padding: 6px 8px;
    border-radius: 6px;
    font-size: 0.8rem;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: background 0.2s ease;
}

.playlist-list li:hover {
    background: rgba(255, 255, 255, 0.08);
}

.playlist-list li.active {
    background: rgba(255, 0, 127, 0.2);
    color: #ff007f;
    font-weight: 600;
}
</style>


        <div class="article-card">
            <div class="music-player-card">
                <div class="player-header">
                    <div class="album-art" id="album-art">
                        <span>🎵</span>
                    </div>
                    <div class="track-info">
                        <h3 id="track-title">Judul Lagu</h3>
                        <p id="track-artist">Nama Artis</p>
                    </div>
                </div>
                
                <audio id="audio-player"></audio>
                
                <div class="progress-container">
                    <span id="current-time">0:00</span>
                    <input type="range" id="progress-bar" value="0" min="0" max="100">
                    <span id="duration-time">0:00</span>
                </div>
                
                <div class="player-controls">
                    <button class="btn-ctrl" id="btn-prev" title="Sebelumnya">⏮️</button>
                    <button class="btn-ctrl btn-play" id="btn-play" title="Putar">▶️</button>
                    <button class="btn-ctrl" id="btn-next" title="Berikutnya">⏭</button>
                </div>
                
                <div class="playlist-container">
                    <h4>Daftar Putar</h4>
                    <ul id="playlist" class="playlist-list"></ul>
                </div>
            </div>
        </div>
        `;

        this.initPlayer();
    }

    initPlayer() {
        const sr = this.shadowRoot;

        // Mengambil elemen secara eksplisit dari shadowRoot
        this.audio = sr.getElementById("audio-player");
        this.trackTitle = sr.getElementById("track-title");
        this.trackArtist = sr.getElementById("track-artist");
        this.btnPlay = sr.getElementById("btn-play");
        this.btnPrev = sr.getElementById("btn-prev");
        this.btnNext = sr.getElementById("btn-next");
        this.progressBar = sr.getElementById("progress-bar");
        this.currentTimeEl = sr.getElementById("current-time");
        this.durationTimeEl = sr.getElementById("duration-time");
        this.albumArt = sr.getElementById("album-art");
        this.playlistEl = sr.getElementById("playlist");

        // Event Listeners
        this.btnPlay.addEventListener("click", () => this.togglePlay());
        this.btnPrev.addEventListener("click", () => this.prevSong());
        this.btnNext.addEventListener("click", () => this.nextSong());

        this.audio.addEventListener("timeupdate", () => this.updateProgress());
        this.audio.addEventListener("ended", () => this.nextSong());

        this.progressBar.addEventListener("input", () => {
            if (this.audio.duration) {
                const seekTime = (this.progressBar.value / 100) * this.audio.duration;
                this.audio.currentTime = seekTime;
            }
        });

        // Inisialisasi awal
        this.renderPlaylist();
        this.loadSong(this.songs[this.currentSongIndex]);
    }

    loadSong(song) {
        if (!song) return;
        
        // Memasang teks ke elemen DOM dengan aman
        this.trackTitle.textContent = song.title;
        this.trackArtist.textContent = song.artist;
        
        // Hanya ubah src jika nilainya berubah
        if (song.src && this.audio.getAttribute('src') !== song.src) {
            this.audio.src = song.src;
        }
        
        this.updatePlaylistUI();
    }

    renderPlaylist() {
        this.playlistEl.innerHTML = "";
        this.songs.forEach((song, index) => {
            const li = document.createElement("li");
            li.innerHTML = `<span>${index + 1}. ${song.title}</span> <small>${song.artist}</small>`;
            li.addEventListener("click", () => {
                this.currentSongIndex = index;
                this.loadSong(this.songs[this.currentSongIndex]);
                this.playSong();
            });
            this.playlistEl.appendChild(li);
        });
        this.updatePlaylistUI();
    }

    updatePlaylistUI() {
        const listItems = this.playlistEl.querySelectorAll("li");
        listItems.forEach((item, index) => {
            if (index === this.currentSongIndex) {
                item.classList.add("active");
            } else {
                item.classList.remove("active");
            }
        });
    }

    togglePlay() {
        if (this.isPlaying) {
            this.pauseSong();
        } else {
            this.playSong();
        }
    }

    playSong() {
        if (!this.audio.src) return;

        this.isPlaying = true;
        const playPromise = this.audio.play();

        if (playPromise !== undefined) {
            playPromise.then(() => {
                this.btnPlay.innerText = "⏸️";
                this.albumArt.classList.add("playing");
            }).catch(error => {
                console.warn("Gagal memutar audio:", error);
                this.isPlaying = false;
            });
        }
    }

    pauseSong() {
        this.isPlaying = false;
        this.audio.pause();
        this.btnPlay.innerText = "▶️";
        this.albumArt.classList.remove("playing");
    }

    prevSong() {
        this.currentSongIndex = (this.currentSongIndex - 1 + this.songs.length) % this.songs.length;
        this.loadSong(this.songs[this.currentSongIndex]);
        this.playSong();
    }

    nextSong() {
        this.currentSongIndex = (this.currentSongIndex + 1) % this.songs.length;
        this.loadSong(this.songs[this.currentSongIndex]);
        this.playSong();
    }

    updateProgress() {
        const { duration, currentTime } = this.audio;
        if (duration) {
            const progressPercent = (currentTime / duration) * 100;
            this.progressBar.value = progressPercent;

            const curMins = Math.floor(currentTime / 60);
            const curSecs = Math.floor(currentTime % 60);
            const durMins = Math.floor(duration / 60);
            const durSecs = Math.floor(duration % 60);

            this.currentTimeEl.innerText = `${curMins}:${curSecs < 10 ? '0' : ''}${curSecs}`;
            this.durationTimeEl.innerText = `${durMins}:${durSecs < 10 ? '0' : ''}${durSecs}`;
        }
    }
}

// Mendaftarkan Web Component
customElements.define('play-musik-in', PlayMusikIn);
