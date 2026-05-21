/**
 * ============================================
 * INJECTION DU LECTEUR AUDIO GLOBAL (SIDEBAR)
 * ============================================
 * 
 * Ce script ajoute automatiquement le lecteur audio dans la sidebar sur toutes les pages.
 */

(function() {
    'use strict';

    const musicPlayerHTML = `
<!-- Élément audio HTML5 -->
<audio id="audioPlayer" preload="none">
	Your browser does not support the audio element.
</audio>

<!-- Conteneur dans la sidebar -->
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
            <input type="range" class="volume-slider" id="volumeSlider" min="0" max="1" step="0.01" value="0.3">
        </div>
    </div>
</div>
    `;

    function injectMusicPlayer() {
        if (document.getElementById('musicPlayer') || document.getElementById('audioPlayer')) {
            if (window.musicPlayerInstance) window.musicPlayerInstance.reinitializeDOM();
            return;
        }

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = musicPlayerHTML;

        const audioElement = tempDiv.querySelector('#audioPlayer');
        if (audioElement) document.body.insertBefore(audioElement, document.body.firstChild);

        const musicContainer = tempDiv.querySelector('#sidebarMusic');
        if (musicContainer) {
            const sidebarBottom = document.querySelector('.sidebar-bottom');
            if (sidebarBottom) {
                // Insérer le lecteur juste AVANT le bouton de contact ou les crédits
                sidebarBottom.insertBefore(musicContainer, sidebarBottom.firstChild);
            } else {
                // Fallback si sidebar-bottom n'existe pas
                document.body.appendChild(musicContainer);
            }
        }

        if (window.musicPlayerInstance) {
            window.musicPlayerInstance.reinitializeDOM();
        } else if (typeof MusicPlayer !== 'undefined') {
            window.musicPlayerInstance = new MusicPlayer();
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectMusicPlayer);
    } else {
        injectMusicPlayer();
    }
})();
