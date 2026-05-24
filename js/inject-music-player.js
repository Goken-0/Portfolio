/**
 * ============================================
 * INJECTION DU LECTEUR AUDIO GLOBAL (SIDEBAR)
 * ============================================
 */

(function() {
    'use strict';

    const musicPlayerHTML = `
<div class="sidebar-music-container" id="sidebarMusic">
    <div class="music-player" id="musicPlayer">
        <div class="player-header">
            <i class="fas fa-music" style="color: var(--accent); font-size: 1.2rem;"></i>
            <div class="equalizer" id="equalizer">
                <div class="eq-bar"></div>
                <div class="eq-bar"></div>
                <div class="eq-bar"></div>
                <div class="eq-bar"></div>
            </div>
        </div>

        <div class="music-info">
            <div class="song-title" id="songTitle">Blinding Lights</div>
            <div class="song-artist" id="songArtist">The Weeknd</div>
        </div>

        <div class="progress-container" id="progressContainer">
            <div class="progress-bar" id="progressBar"></div>
        </div>

        <div class="music-controls">
            <button class="control-btn" id="prevBtn"><i class="fas fa-backward"></i></button>
            <button class="control-btn play-pause" id="playPauseBtn"><i class="fas fa-play"></i></button>
            <button class="control-btn" id="nextBtn"><i class="fas fa-forward"></i></button>
            <button class="control-btn" id="loopBtn" title="Répétition"><i class="fas fa-repeat"></i></button>
        </div>

        <div class="volume-container">
            <i class="fas fa-volume-up volume-icon" id="volumeIcon"></i>
            <input type="range" class="volume-slider" id="volumeSlider" min="0" max="100" step="1" value="30">
        </div>
    </div>
</div>
    `;

    function injectMusicPlayer() {
        // 1. Gérer l'élément AUDIO (persistant, caché en haut du body)
        let audio = document.getElementById('audioPlayer');
        if (!audio) {
            audio = document.createElement('audio');
            audio.id = 'audioPlayer';
            audio.preload = 'auto';
            document.body.insertBefore(audio, document.body.firstChild);
        }

        // 2. Gérer l'INTERFACE (repositionnée si nécessaire)
        let playerUI = document.getElementById('sidebarMusic');
        const sidebarBottom = document.querySelector('.sidebar-bottom');

        if (!playerUI && sidebarBottom) {
            const temp = document.createElement('div');
            temp.innerHTML = musicPlayerHTML;
            playerUI = temp.firstElementChild;
            sidebarBottom.insertBefore(playerUI, sidebarBottom.firstChild);
            console.log('✅ Lecteur injecté');
        } else if (playerUI && sidebarBottom && playerUI.parentElement !== sidebarBottom) {
            // Si le lecteur existe mais n'est pas dans la sidebar (ex: après un mauvais switch SPA)
            sidebarBottom.insertBefore(playerUI, sidebarBottom.firstChild);
            console.log('⚓ Lecteur ré-ancré dans la sidebar');
        }

        // 3. Initialiser ou ré-attacher la logique
        if (window.musicPlayerInstance) {
            window.musicPlayerInstance.reinitializeDOM();
        } else if (typeof MusicPlayer !== 'undefined') {
            window.musicPlayerInstance = new MusicPlayer();
        }
    }

    // Init au chargement réel de la page
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectMusicPlayer);
    } else {
        injectMusicPlayer();
    }

    // Init lors des transitions SPA
    document.addEventListener('spa-page-loaded', injectMusicPlayer);
    
    // Expose pour forcer l'injection si besoin
    window.forceMusicInjection = injectMusicPlayer;
})();
