/**
 * ============================================
 * LECTEUR DE MUSIQUE GLOBAL - MUSIC-PLAYER.JS
 * ============================================
 *
 * - Barre d'avancement utilisable à la souris, au doigt (glisser) et au
 *   clavier (flèches ±5 s, Page ±10 %, Début / Fin). Pendant un glissement,
 *   la barre et le temps suivent le doigt ; la lecture ne saute qu'au lâcher,
 *   pour éviter le son haché d'une recherche continue.
 * - Recherche possible avant même la première lecture : avec preload="none"
 *   la durée est inconnue, on charge alors les métadonnées puis on se place.
 * - Progression fluide (requestAnimationFrame) pendant la lecture, au lieu
 *   des ~4 mises à jour par seconde de l'événement timeupdate.
 * - Media Session : titre, artiste et boutons sur l'écran verrouillé et dans
 *   le centre de contrôle du téléphone.
 * - La position est mémorisée en quittant la page et restaurée au retour.
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
        this.isSeeking = false;     // glissement en cours sur la barre
        this.seekRatio = 0;         // position visée pendant le glissement
        this.pendingSeekRatio = null; // recherche demandée avant que la durée soit connue
        this.rafId = 0;

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
        this.setupMediaSession();

        // Mémoriser la position en quittant (rechargement, fermeture d'onglet)
        window.addEventListener('pagehide', () => this.saveState());
        // Libellés accessibles de la barre selon la langue
        document.addEventListener('i18n:changed', () => this.renderProgress());
    }

    initializeDOM() {
        this.playPauseBtn = document.getElementById('playPauseBtn');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.loopBtn = document.getElementById('loopBtn');
        this.volumeSlider = document.getElementById('volumeSlider');
        this.volumeIcon = document.getElementById('volumeIcon');
        this.progressBar = document.getElementById('progressBar');
        this.progressThumb = document.getElementById('progressThumb');
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

    static t(key, french) {
        return (window.i18n && window.i18n.t) ? window.i18n.t(key, french) : french;
    }

    hasDuration() {
        return Number.isFinite(this.audio.duration) && this.audio.duration > 0;
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

        this.attachSeekEvents();
    }

    // ============================================
    // BARRE D'AVANCEMENT
    // ============================================

    ratioFromPointer(clientX) {
        const rect = this.progressContainer.getBoundingClientRect();
        if (!rect.width) return 0;
        return Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
    }

    /**
     * Pointer Events : un seul code pour la souris, le doigt et le stylet.
     * setPointerCapture garde le suivi même si le doigt sort de la barre ;
     * touch-action: none (CSS) empêche le défilement de la sidebar pendant
     * le glissement.
     */
    attachSeekEvents() {
        const bar = this.progressContainer;
        if (!bar) return;

        bar.onpointerdown = (e) => {
            if (e.button !== undefined && e.button > 0) return;
            e.preventDefault();
            this.isSeeking = true;
            this.seekRatio = this.ratioFromPointer(e.clientX);
            bar.classList.add('is-seeking');
            try { bar.setPointerCapture(e.pointerId); } catch (err) { /* pointeur déjà relâché */ }
            this.renderProgress();
        };

        bar.onpointermove = (e) => {
            if (!this.isSeeking) return;
            this.seekRatio = this.ratioFromPointer(e.clientX);
            this.renderProgress();
        };

        const finish = (commit) => {
            if (!this.isSeeking) return;
            this.isSeeking = false;
            bar.classList.remove('is-seeking');
            if (commit) this.seekToRatio(this.seekRatio);
            this.renderProgress();
        };
        bar.onpointerup = () => finish(true);
        bar.onpointercancel = () => finish(false);
        bar.onlostpointercapture = () => finish(true);

        bar.onkeydown = (e) => {
            const duration = this.hasDuration() ? this.audio.duration : 0;
            const now = this.audio.currentTime || 0;
            let target = null;
            switch (e.key) {
                case 'ArrowRight': case 'ArrowUp': target = now + 5; break;
                case 'ArrowLeft': case 'ArrowDown': target = now - 5; break;
                case 'PageUp': target = now + duration * 0.1; break;
                case 'PageDown': target = now - duration * 0.1; break;
                case 'Home': target = 0; break;
                case 'End': target = duration; break;
                default: return;
            }
            e.preventDefault();
            if (!duration) {
                // Durée encore inconnue : seules les extrémités ont un sens
                if (e.key === 'Home') this.seekToRatio(0);
                else if (e.key === 'End') this.seekToRatio(1);
                else this.seekToRatio(0, true);
                return;
            }
            this.seekToRatio(Math.min(Math.max(target, 0), duration) / duration);
        };
    }

    /**
     * Se placer à `ratio` (0 → 1) du morceau. Si la durée n'est pas encore
     * connue (preload="none", rien n'a été lu), on charge les métadonnées et
     * la recherche s'applique dès qu'elles arrivent — sans lancer la lecture.
     */
    seekToRatio(ratio, metadataOnly) {
        if (this.hasDuration()) {
            // Ne pas viser la toute dernière fraction : 'ended' partirait aussitôt
            const end = Math.max(this.audio.duration - 0.25, 0);
            this.audio.currentTime = Math.min(ratio * this.audio.duration, end);
            this.renderProgress();
            this.saveState();
            return;
        }
        if (!metadataOnly) this.pendingSeekRatio = ratio;
        this.ensureSourceLoaded();
        if (this.audio.preload === 'none') this.audio.preload = 'metadata';
        if (this.audio.readyState === 0) this.audio.load();
    }

    ensureSourceLoaded() {
        const song = this.playlist[this.currentSongIndex];
        if (song && !this.audio.getAttribute('src')) this.audio.src = song.src;
    }

    /** Barre, pastille, temps écoulé et attributs ARIA, en un seul endroit. */
    renderProgress() {
        const duration = this.hasDuration() ? this.audio.duration : 0;
        let ratio;
        if (this.isSeeking) ratio = this.seekRatio;
        else if (this.pendingSeekRatio !== null) ratio = this.pendingSeekRatio;
        else ratio = duration ? (this.audio.currentTime / duration) : 0;
        ratio = Math.min(Math.max(ratio || 0, 0), 1);

        const shownTime = duration ? ratio * duration : (this.audio.currentTime || 0);
        const pct = (ratio * 100).toFixed(3) + '%';

        if (this.progressBar) this.progressBar.style.width = pct;
        if (this.progressThumb) this.progressThumb.style.left = pct;
        if (this.currentTimeEl) this.currentTimeEl.textContent = MusicPlayer.formatTime(shownTime);
        if (this.totalTimeEl) this.totalTimeEl.textContent = MusicPlayer.formatTime(duration);

        if (this.progressContainer) {
            this.progressContainer.setAttribute('aria-valuemax', String(Math.round(duration)));
            this.progressContainer.setAttribute('aria-valuenow', String(Math.round(shownTime)));
            this.progressContainer.setAttribute('aria-valuetext',
                MusicPlayer.formatTime(shownTime) + ' ' + MusicPlayer.t('music.of', 'sur') + ' ' +
                MusicPlayer.formatTime(duration));
        }
    }

    /** Boucle d'affichage active seulement pendant la lecture. */
    startProgressLoop() {
        if (this.rafId) return;
        const tick = () => {
            if (this.audio.paused || this.audio.ended) { this.rafId = 0; return; }
            if (!this.isSeeking && !document.hidden) this.renderProgress();
            this.rafId = requestAnimationFrame(tick);
        };
        this.rafId = requestAnimationFrame(tick);
    }

    // ============================================
    // ÉVÉNEMENTS AUDIO
    // ============================================

    attachAudioEvents() {
        if (!this.audio) return;

        // Filet de sécurité (onglet en arrière-plan : pas de requestAnimationFrame)
        this.audio.ontimeupdate = () => {
            if (!this.isSeeking && (this.audio.paused || document.hidden)) this.renderProgress();
            this.updatePositionState();
        };

        this.audio.ondurationchange = () => this.renderProgress();

        this.audio.onloadedmetadata = () => {
            if (this.pendingSeekRatio !== null) {
                const ratio = this.pendingSeekRatio;
                this.pendingSeekRatio = null;
                this.seekToRatio(ratio);
            }
            this.renderProgress();
            this.updatePositionState();
        };

        this.audio.onended = () => {
            if (this.isLooping) {
                this.audio.currentTime = 0;
                this.audio.play();
            } else {
                this.next();
            }
        };

        this.audio.onplay = () => { this.updateUI(); this.startProgressLoop(); };
        this.audio.onpause = () => { this.updateUI(); this.saveState(); };
        this.audio.onseeked = () => this.renderProgress();
    }

    togglePlay() {
        // Sécurité : re-charger si la source a été perdue
        if (!this.audio.getAttribute('src')) {
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

        this.pendingSeekRatio = null;
        this.audio.src = song.src;
        this.audio.load();

        if (this.songTitle) this.songTitle.textContent = song.title;
        if (this.songArtist) this.songArtist.textContent = song.artist;
        this.renderProgress();
        this.updateMediaMetadata();
        this.saveState();

        if (shouldPlay) {
            this.audio.play().catch(err => console.log("Auto-play bloqué:", err));
        }
    }

    next() {
        this.currentSongIndex = (this.currentSongIndex + 1) % this.playlist.length;
        this.loadSong(this.currentSongIndex, true);
    }

    prev() {
        // Comme sur tous les lecteurs : après 3 s, « précédent » revient au début
        if (this.audio.currentTime > 3) {
            this.audio.currentTime = 0;
            this.renderProgress();
            return;
        }
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
            this.loopBtn.setAttribute('aria-pressed', this.isLooping ? 'true' : 'false');
        }

        this.updateVolumeIcon();

        // Toujours synchroniser titre/artiste avec la chanson courante (cas du switch SPA)
        const song = this.playlist[this.currentSongIndex];
        if (song) {
            if (this.songTitle) this.songTitle.textContent = song.title;
            if (this.songArtist) this.songArtist.textContent = song.artist;
        }

        this.renderProgress();

        if ('mediaSession' in navigator) {
            navigator.mediaSession.playbackState = this.audio.paused ? 'paused' : 'playing';
        }
    }

    updateVolumeIcon() {
        if (!this.volumeIcon) return;
        const v = this.audio.volume;
        if (v === 0) this.volumeIcon.className = 'fas fa-volume-mute volume-icon';
        else if (v < 0.5) this.volumeIcon.className = 'fas fa-volume-down volume-icon';
        else this.volumeIcon.className = 'fas fa-volume-up volume-icon';
    }

    // ============================================
    // ÉCRAN VERROUILLÉ / CENTRE DE CONTRÔLE (Media Session)
    // ============================================

    setupMediaSession() {
        if (!('mediaSession' in navigator)) return;
        const ms = navigator.mediaSession;
        const handlers = {
            play: () => this.audio.play().catch(() => {}),
            pause: () => this.audio.pause(),
            previoustrack: () => this.prev(),
            nexttrack: () => this.next(),
            seekto: (d) => {
                if (!this.hasDuration() || !Number.isFinite(d.seekTime)) return;
                this.seekToRatio(d.seekTime / this.audio.duration);
            },
            seekbackward: (d) => { this.audio.currentTime = Math.max((this.audio.currentTime || 0) - (d.seekOffset || 10), 0); },
            seekforward: (d) => {
                if (!this.hasDuration()) return;
                this.audio.currentTime = Math.min((this.audio.currentTime || 0) + (d.seekOffset || 10), this.audio.duration - 0.25);
            }
        };
        Object.keys(handlers).forEach(action => {
            try { ms.setActionHandler(action, handlers[action]); } catch (e) { /* action non prise en charge */ }
        });
        this.updateMediaMetadata();
    }

    updateMediaMetadata() {
        if (!('mediaSession' in navigator) || typeof MediaMetadata === 'undefined') return;
        const song = this.playlist[this.currentSongIndex];
        if (!song) return;
        navigator.mediaSession.metadata = new MediaMetadata({
            title: song.title,
            artist: song.artist,
            album: 'Portfolio — Léo',
            artwork: [
                { src: 'assets/icons/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
                { src: 'assets/icons/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' }
            ]
        });
    }

    updatePositionState() {
        if (!('mediaSession' in navigator) || !navigator.mediaSession.setPositionState) return;
        if (!this.hasDuration()) return;
        try {
            navigator.mediaSession.setPositionState({
                duration: this.audio.duration,
                playbackRate: this.audio.playbackRate || 1,
                position: Math.min(this.audio.currentTime || 0, this.audio.duration)
            });
        } catch (e) { /* valeurs refusées par le navigateur : sans gravité */ }
    }

    // ============================================
    // MÉMORISATION (localStorage)
    // ============================================

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
            time: this.audio.currentTime || 0,
            vol: volume,
            loop: this.isLooping
        };
        try {
            localStorage.setItem('musicState', JSON.stringify(state));
        } catch (e) {
            // Stockage indisponible (navigation privée stricte) : sans gravité
        }
    }

    /**
     * Sans curseur (mobile), le son doit se régler uniquement avec les boutons
     * du téléphone : on laisse donc le gain de l'élément audio à 100 %. Sinon
     * le volume enregistré depuis le bureau (30 % par défaut) s'appliquerait
     * en plus du volume système, sans aucun moyen de le remonter.
     */
    defaultVolume(savedVolume) {
        if (MusicPlayer.isVolumeSliderHidden()) return 1;
        // HTMLMediaElement.volume n'accepte que [0, 1] : toute autre valeur
        // lève une IndexSizeError. Comme savedVolume sort de localStorage,
        // on ne lui fait pas confiance.
        const vol = Number(savedVolume);
        return (Number.isFinite(vol) && vol >= 0 && vol <= 1) ? vol : 0.3;
    }

    restoreState() {
        let saved = null;
        try { saved = localStorage.getItem('musicState'); } catch (e) { saved = null; }

        if (saved) {
            try {
                const state = JSON.parse(saved);
                // L'état vient de localStorage : il peut avoir été édité à la
                // main, ou dater d'une playlist plus longue. Un index hors
                // bornes rendrait `song` undefined et ferait planter la ligne
                // `song.src` plus bas, laissant le lecteur mort.
                const index = Number(state.index);
                this.currentSongIndex =
                    (Number.isInteger(index) && index >= 0 && index < this.playlist.length)
                        ? index
                        : 0;
                this.isLooping = state.loop === true;
                this.audio.volume = this.defaultVolume(state.vol);

                // Pré-charger la source mais ne pas lancer sans interaction
                const song = this.playlist[this.currentSongIndex];
                this.audio.src = song.src;

                // Reprendre là où on s'était arrêté, dès que la durée est
                // connue (première lecture ou recherche). On borne à la durée
                // réelle : un currentTime hors limites lève une exception sur
                // certains navigateurs.
                const time = Number(state.time);
                if (Number.isFinite(time) && time > 0) {
                    this.audio.addEventListener('loadedmetadata', () => {
                        if (this.pendingSeekRatio !== null) return; // l'utilisateur a choisi une autre position
                        const max = Number.isFinite(this.audio.duration) ? this.audio.duration - 0.25 : 0;
                        if (this.audio.currentTime < 0.5) this.audio.currentTime = Math.max(Math.min(time, max), 0);
                    }, { once: true });
                }

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
