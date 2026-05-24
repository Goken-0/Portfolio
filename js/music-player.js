/**
 * ============================================
 * LECTEUR DE MUSIQUE GLOBAL - MUSIC-PLAYER.JS
 * ============================================
 */

class MusicPlayer {
    constructor() {
        this.playlist = [
            { title: "Blinding Lights", artist: "The Weeknd", src: "./assets/music/blindinglights.mp3" },
            { title: "Nightcall", artist: "Kavinsky", src: "./assets/music/nightcall.mp3" },
            { title: "Instant Crush", artist: "Daft Punk", src: "./assets/music/instantcrush.mp3" },
            { title: "Smile", artist: "Juice WRLD, The Weeknd", src: "./assets/music/smile.mp3" }, 
            { title: "444", artist: "Lithe", src: "./assets/music/444.mp3" },   
            { title: "Wizard Of Oz", artist: "M Huncho", src: "./assets/music/wizardofoz.mp3" },   
        ];

        this.currentSongIndex = 0;
        this.isLooping = false;
        
        // Initialisation immédiate du moteur audio (l'élément est déjà injecté par inject-music-player.js)
        this.audio = document.getElementById('audioPlayer');
        if (!this.audio) {
            this.audio = document.createElement('audio');
            this.audio.id = 'audioPlayer';
            document.body.insertBefore(this.audio, document.body.firstChild);
        }

        this.restoreState();
        this.reinitializeDOM();
        this.attachAudioEvents();
    }

    initializeDOM() {
        this.playPauseBtn = document.getElementById('playPauseBtn');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.loopBtn = document.getElementById('loopBtn');
        this.volumeSlider = document.getElementById('volumeSlider');
        this.volumeIcon = document.getElementById('volumeIcon');
        this.progressBar = document.getElementById('progressBar');
        this.progressContainer = document.getElementById('progressContainer');
        this.songTitle = document.getElementById('songTitle');
        this.songArtist = document.getElementById('songArtist');
        this.equalizer = document.getElementById('equalizer');

        this.attachButtonEvents();
    }

    reinitializeDOM() {
        this.initializeDOM();
        this.updateUI();
    }

    attachButtonEvents() {
        // Play / Pause
        if (this.playPauseBtn) {
            this.playPauseBtn.onclick = (e) => {
                e.preventDefault();
                this.togglePlay();
            };
        }
        
        // Navigation
        if (this.prevBtn) this.prevBtn.onclick = (e) => { e.preventDefault(); this.prev(); };
        if (this.nextBtn) this.nextBtn.onclick = (e) => { e.preventDefault(); this.next(); };
        
        // Loop
        if (this.loopBtn) {
            this.loopBtn.onclick = (e) => {
                e.preventDefault();
                this.toggleLoop();
            };
        }

        // Volume
        if (this.volumeSlider) {
            this.volumeSlider.value = this.audio.volume * 100;
            this.volumeSlider.oninput = (e) => {
                const vol = e.target.value / 100;
                try {
                    this.audio.volume = vol;
                } catch (err) {
                    console.log("audio.volume est en lecture seule sur cet appareil");
                }
                
                if (this.gainNode) {
                    this.gainNode.gain.value = vol;
                }
                this.updateVolumeIcon();
                this.saveState();
            };
        }

        // Progress
        if (this.progressContainer) {
            this.progressContainer.onclick = (e) => {
                const rect = this.progressContainer.getBoundingClientRect();
                const pos = (e.clientX - rect.left) / rect.width;
                if (this.audio.duration) {
                    this.audio.currentTime = pos * this.audio.duration;
                }
            };
        }
    }

    attachAudioEvents() {
        if (!this.audio) return;

        this.audio.ontimeupdate = () => {
            if (this.progressBar && this.audio.duration) {
                const pc = (this.audio.currentTime / this.audio.duration) * 100;
                this.progressBar.style.width = pc + '%';
            }
        };

        this.audio.onended = () => {
            if (this.isLooping) {
                this.audio.currentTime = 0;
                this.audio.play();
            } else {
                this.next();
            }
        };

        this.audio.onplay = () => this.updateUI();
        this.audio.onpause = () => this.updateUI();
    }

    togglePlay() {
        // Initialiser l'AudioContext pour iOS au premier clic
        this.setupAudioContext();

        // Sécurité : re-charger si la source a été perdue
        if (!this.audio.src || this.audio.src === "" || window.location.href.includes(this.audio.src)) {
            this.loadSong(this.currentSongIndex, false);
        }

        if (this.audio.paused) {
            this.audio.play().catch(err => console.log("Lecture bloquée par le navigateur:", err));
        } else {
            this.audio.pause();
        }
    }

    setupAudioContext() {
        if (this.audioContext) {
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            return;
        }

        try {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (AudioContextClass) {
                this.audioContext = new AudioContextClass();
                this.source = this.audioContext.createMediaElementSource(this.audio);
                this.gainNode = this.audioContext.createGain();
                
                // On met le volume de l'élément audio à 1 et on gère via le gainNode
                this.gainNode.gain.value = this.audio.volume;
                
                this.source.connect(this.gainNode);
                this.gainNode.connect(this.audioContext.destination);
                
                console.log("AudioContext initialisé avec succès");
            }
        } catch (e) {
            console.error("Erreur lors de l'initialisation de l'AudioContext:", e);
        }
    }

    loadSong(index, shouldPlay = true) {
        // S'assurer que l'AudioContext est prêt
        if (shouldPlay) this.setupAudioContext();
        
        this.currentSongIndex = index;
        const song = this.playlist[index];
        if (!song) return;

        this.audio.src = song.src;
        this.audio.load();
        
        if (this.songTitle) this.songTitle.textContent = song.title;
        if (this.songArtist) this.songArtist.textContent = song.artist;

        if (shouldPlay) {
            this.audio.play().catch(err => console.log("Auto-play bloqué:", err));
        }
    }

    next() {
        this.currentSongIndex = (this.currentSongIndex + 1) % this.playlist.length;
        this.loadSong(this.currentSongIndex, true);
    }

    prev() {
        this.currentSongIndex = (this.currentSongIndex - 1 + this.playlist.length) % this.playlist.length;
        this.loadSong(this.currentSongIndex, true);
    }

    toggleLoop() {
        this.isLooping = !this.isLooping;
        this.updateUI();
        this.saveState();
    }

    updateUI() {
        if (this.playPauseBtn) {
            const icon = this.playPauseBtn.querySelector('i');
            if (icon) icon.className = this.audio.paused ? 'fas fa-play' : 'fas fa-pause';
        }
        
        if (this.equalizer) {
            if (this.audio.paused) this.equalizer.classList.add('paused');
            else this.equalizer.classList.remove('paused');
        }

        if (this.loopBtn) {
            if (this.isLooping) this.loopBtn.classList.add('active');
            else this.loopBtn.classList.remove('active');
        }

        this.updateVolumeIcon();

        // Mettre à jour les infos si elles sont vides (cas du switch SPA)
        if (this.songTitle && this.songTitle.textContent === "Blinding Lights") {
             const song = this.playlist[this.currentSongIndex];
             this.songTitle.textContent = song.title;
             if (this.songArtist) this.songArtist.textContent = song.artist;
        }
    }

    updateVolumeIcon() {
        if (!this.volumeIcon) return;
        const v = this.audio.volume;
        if (v === 0) this.volumeIcon.className = 'fas fa-volume-mute volume-icon';
        else if (v < 0.5) this.volumeIcon.className = 'fas fa-volume-down volume-icon';
        else this.volumeIcon.className = 'fas fa-volume-up volume-icon';
    }

    saveState() {
        const state = {
            index: this.currentSongIndex,
            time: this.audio.currentTime,
            vol: this.audio.volume,
            loop: this.isLooping
        };
        localStorage.setItem('musicState', JSON.stringify(state));
    }

    restoreState() {
        const saved = localStorage.getItem('musicState');
        if (saved) {
            try {
                const state = JSON.parse(saved);
                this.currentSongIndex = state.index || 0;
                this.isLooping = state.loop || false;
                this.audio.volume = state.vol !== undefined ? state.vol : 0.3;
                
                // Pré-charger la source mais ne pas lancer sans interaction
                const song = this.playlist[this.currentSongIndex];
                this.audio.src = song.src;
                
                // Tenter de restaurer le temps après chargement
                this.audio.addEventListener('loadedmetadata', () => {
                    this.audio.currentTime = state.time || 0;
                }, { once: true });

            } catch (e) {
                console.error("Erreur restauration état audio:", e);
            }
        } else {
            this.audio.volume = 0.3;
            const song = this.playlist[this.currentSongIndex];
            this.audio.src = song.src;
        }
    }
}

// Initialisation unique
if (!window.musicPlayerInstance) {
    window.musicPlayerInstance = new MusicPlayer();
}
