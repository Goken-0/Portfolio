/**
 * ============================================
 * LECTEUR DE MUSIQUE GLOBAL (COMPACT SIDEBAR)
 * ============================================
 */

class MusicPlayer {
    constructor() {
        this.audio = null;
        this.playPauseBtn = null;
        this.prevBtn = null;
        this.nextBtn = null;
        this.loopBtn = null;
        this.progressContainer = null;
        this.progressBar = null;
        this.songTitle = null;
        this.equalizer = null;

        this.isPlaying = false;
        this.isLooping = false;
        this.currentSongIndex = 0;
        this.eventListenersAttached = false;

        this.playlist = [
            { title: "Blinding Lights", artist: "The Weeknd", src: "./assets/music/blindinglights.mp3" },
            { title: "Nightcall", artist: "Kavinsky", src: "./assets/music/nightcall.mp3" },
            { title: "Instant Crush", artist: "Daft Punk", src: "./assets/music/instantcrush.mp3" },
            { title: "Smile", artist: "Juice WRLD, The Weeknd", src: "./assets/music/smile.mp3" }, 
            { title: "444", artist: "Lithe", src: "./assets/music/444.mp3" },   
            { title: "Wizard Of Oz", artist: "M Huncho", src: "./assets/music/wizardofoz.mp3" },   
        ];

        this.initializeDOM();
        this.init();
    }

    initializeDOM() {
        this.audio = document.getElementById('audioPlayer');
        this.playPauseBtn = document.getElementById('playPauseBtn');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.loopBtn = document.getElementById('loopBtn');
        this.progressContainer = document.getElementById('progressContainer');
        this.progressBar = document.getElementById('progressBar');
        this.songTitle = document.getElementById('songTitle');
        this.songArtist = document.getElementById('songArtist');
        this.equalizer = document.getElementById('equalizer');
    }

    reinitializeDOM() {
        this.initializeDOM();
        if (this.audio && !this.eventListenersAttached) {
            this.setupEventListeners();
            this.setupAudioEventListeners();
            this.eventListenersAttached = true;
            this.updatePlayButton();
            this.updateLoopButton();
        }
    }

    init() {
        if (!this.audio) {
            setTimeout(() => this.reinitializeDOM(), 100);
            return;
        }

        if (!this.eventListenersAttached) {
            this.setupEventListeners();
            this.setupAudioEventListeners();
            this.eventListenersAttached = true;
        }

        this.restoreState();
        setInterval(() => this.saveState(), 2000);
    }

    saveState() {
        if (!this.audio) return;
        const state = {
            currentSongIndex: this.currentSongIndex,
            currentTime: this.audio.currentTime || 0,
            isPlaying: !this.audio.paused,
            isLooping: this.isLooping,
            volume: this.audio.volume || 0.3
        };
        localStorage.setItem('musicPlayerState', JSON.stringify(state));
    }

    restoreState() {
        const savedState = localStorage.getItem('musicPlayerState');
        if (savedState) {
            try {
                const state = JSON.parse(savedState);
                this.currentSongIndex = state.currentSongIndex || 0;
                this.isLooping = state.isLooping || false;
                this.loadCurrentSong(false);
                this.audio.volume = state.volume !== undefined ? state.volume : 0.3;
                
                this.audio.addEventListener('loadedmetadata', () => {
                    this.audio.currentTime = state.currentTime || 0;
                }, { once: true });

                this.updateLoopButton();

                if (state.isPlaying) {
                    this.audio.play().catch(() => {});
                }
            } catch (e) {
                this.loadCurrentSong(false);
            }
        } else {
            this.loadCurrentSong(false);
        }
    }

    loadCurrentSong(autoPlay = false) {
        if (!this.playlist[this.currentSongIndex]) return;
        const currentSong = this.playlist[this.currentSongIndex];
        this.audio.src = currentSong.src;
        this.songTitle.textContent = currentSong.title;
        if (this.songArtist) this.songArtist.textContent = currentSong.artist;
        if (autoPlay) this.play();
    }

    setupEventListeners() {
        this.playPauseBtn?.addEventListener('click', () => this.togglePlayPause());
        this.prevBtn?.addEventListener('click', () => this.previousSong());
        this.nextBtn?.addEventListener('click', () => this.nextSong());
        this.loopBtn?.addEventListener('click', () => this.toggleLoop());
        this.progressContainer?.addEventListener('click', (e) => this.setProgress(e));
    }

    setupAudioEventListeners() {
        this.audio.addEventListener('timeupdate', () => this.updateProgress());
        this.audio.addEventListener('ended', () => {
            if (this.isLooping) {
                this.audio.currentTime = 0;
                this.play();
            } else {
                this.nextSong();
            }
        });
        this.audio.addEventListener('play', () => { this.isPlaying = true; this.updatePlayButton(); });
        this.audio.addEventListener('pause', () => { this.isPlaying = false; this.updatePlayButton(); });
    }

    togglePlayPause() {
        if (!this.audio.src || this.audio.src.includes('undefined')) {
            this.loadCurrentSong(true);
            return;
        }
        if (this.audio.paused) this.play();
        else this.pause();
    }

    toggleLoop() {
        this.isLooping = !this.isLooping;
        this.updateLoopButton();
        this.saveState();
    }

    updateLoopButton() {
        if (!this.loopBtn) return;
        if (this.isLooping) {
            this.loopBtn.classList.add('active');
            this.loopBtn.style.color = 'var(--accent)';
        } else {
            this.loopBtn.classList.remove('active');
            this.loopBtn.style.color = '';
        }
    }

    play() {
        this.audio.play().then(() => {
            this.isPlaying = true;
            this.updatePlayButton();
        }).catch(() => {});
    }

    pause() {
        this.audio.pause();
        this.isPlaying = false;
        this.updatePlayButton();
    }

    previousSong() {
        this.currentSongIndex = (this.currentSongIndex - 1 + this.playlist.length) % this.playlist.length;
        this.loadCurrentSong(true);
    }

    nextSong() {
        this.currentSongIndex = (this.currentSongIndex + 1) % this.playlist.length;
        this.loadCurrentSong(true);
    }

    setProgress(e) {
        const width = this.progressContainer.clientWidth;
        const rect = this.progressContainer.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const duration = this.audio.duration;
        if (duration) {
            this.audio.currentTime = (clickX / width) * duration;
        }
    }

    updatePlayButton() {
        if (!this.playPauseBtn) return;
        const icon = this.playPauseBtn.querySelector('i');
        if (icon) icon.className = this.isPlaying ? 'fas fa-pause' : 'fas fa-play';
        if (this.equalizer) {
            if (this.isPlaying) this.equalizer.classList.remove('paused');
            else this.equalizer.classList.add('paused');
        }
    }

    updateProgress() {
        const { currentTime, duration } = this.audio;
        if (isNaN(duration)) return;
        const progressPercent = (currentTime / duration) * 100;
        this.progressBar.style.width = `${progressPercent}%`;
    }
}

(function() {
    'use strict';
    if (!window.musicPlayerInstance) {
        window.musicPlayerInstance = new MusicPlayer();
    } else {
        window.musicPlayerInstance.reinitializeDOM();
    }
    window.musicPlayer = window.musicPlayerInstance;
})();
