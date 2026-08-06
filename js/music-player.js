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
            this.audio.preload = 'none';
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
        this.currentTimeEl = document.getElementById('currentTime');
        this.totalTimeEl = document.getElementById('totalTime');

        this.attachButtonEvents();
    }

    reinitializeDOM() {
        this.initializeDOM();
        this.updateUI();
    }

    /**
     * Vrai quand le curseur de volume est masqué, c'est-à-dire sur mobile
     * (voir la règle .volume-slider dans css/style.css). Le seuil doit rester
     * aligné sur celui de la feuille de style.
     */
    static isVolumeSliderHidden() {
        return window.matchMedia('(max-width: 995px)').matches;
    }

    static formatTime(seconds) {
        if (!isFinite(seconds) || seconds < 0) return '0:00';
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return m + ':' + String(s).padStart(2, '0');
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
                this.audio.volume = e.target.value / 100;
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
            if (this.currentTimeEl) this.currentTimeEl.textContent = MusicPlayer.formatTime(this.audio.currentTime);
        };

        this.audio.ondurationchange = () => {
            if (this.totalTimeEl) this.totalTimeEl.textContent = MusicPlayer.formatTime(this.audio.duration);
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

    loadSong(index, shouldPlay = true) {
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

        // Resynchroniser l'affichage du temps (cas du switch SPA)
        if (this.currentTimeEl) this.currentTimeEl.textContent = MusicPlayer.formatTime(this.audio.currentTime);
        if (this.totalTimeEl) this.totalTimeEl.textContent = MusicPlayer.formatTime(this.audio.duration);

        // Toujours synchroniser titre/artiste avec la chanson courante (cas du switch SPA)
        const song = this.playlist[this.currentSongIndex];
        if (song) {
            if (this.songTitle) this.songTitle.textContent = song.title;
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
        // Sur mobile le gain est forcé à 100 % (voir restoreState) : ce n'est
        // pas un choix de l'utilisateur, on ne l'écrit donc pas par-dessus le
        // volume réglé au bureau.
        let volume = this.audio.volume;
        if (MusicPlayer.isVolumeSliderHidden()) {
            try {
                const previous = JSON.parse(localStorage.getItem('musicState'));
                if (previous && previous.vol !== undefined) volume = previous.vol;
            } catch (e) {
                // état illisible : on retombe sur le volume courant
            }
        }

        const state = {
            index: this.currentSongIndex,
            time: this.audio.currentTime,
            vol: volume,
            loop: this.isLooping
        };
        localStorage.setItem('musicState', JSON.stringify(state));
    }

    /**
     * Sans curseur (mobile), le son doit se régler uniquement avec les boutons
     * du téléphone : on laisse donc le gain de l'élément audio à 100 %. Sinon
     * le volume enregistré depuis le bureau (30 % par défaut) s'appliquerait
     * en plus du volume système, sans aucun moyen de le remonter.
     */
    defaultVolume(savedVolume) {
        if (MusicPlayer.isVolumeSliderHidden()) return 1;
        return savedVolume !== undefined ? savedVolume : 0.3;
    }

    restoreState() {
        const saved = localStorage.getItem('musicState');
        if (saved) {
            try {
                const state = JSON.parse(saved);
                this.currentSongIndex = state.index || 0;
                this.isLooping = state.loop || false;
                this.audio.volume = this.defaultVolume(state.vol);
                
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
            this.audio.volume = this.defaultVolume(undefined);
            const song = this.playlist[this.currentSongIndex];
            this.audio.src = song.src;
        }
    }
}

// Initialisation unique
if (!window.musicPlayerInstance) {
    window.musicPlayerInstance = new MusicPlayer();
}
