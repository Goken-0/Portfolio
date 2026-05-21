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
        // Vérifier si le lecteur est déjà dans le DOM pour éviter les doublons
        const existingPlayer = document.getElementById('sidebarMusic');
        const existingAudio = document.getElementById('audioPlayer');

        if (!existingAudio) {
            const tempAudio = document.createElement('div');
            tempAudio.innerHTML = `
                <audio id="audioPlayer" preload="none">
                    Your browser does not support the audio element.
                </audio>
            `;
            document.body.insertBefore(tempAudio.firstElementChild, document.body.firstChild);
        }

        if (!existingPlayer) {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = musicPlayerHTML.replace(/<audio.*<\/audio>/s, ''); // Retirer l'audio du template pour l'injecter proprement
            const musicContainer = tempDiv.querySelector('#sidebarMusic');
            
            const sidebarBottom = document.querySelector('.sidebar-bottom');
            if (sidebarBottom) {
                // Toujours injecter en tant que PREMIER enfant de sidebar-bottom
                // Cela garantit qu'il est en haut de cette section, dans la sidebar
                sidebarBottom.insertBefore(musicContainer, sidebarBottom.firstChild);
                console.log('✅ Lecteur injecté dans la sidebar (sidebar-bottom)');
            } else {
                console.error('❌ Erreur : .sidebar-bottom non trouvé');
            }
        }

        // Réinitialiser la logique du lecteur sur les nouveaux éléments
        if (window.musicPlayerInstance) {
            window.musicPlayerInstance.reinitializeDOM();
        } else if (typeof MusicPlayer !== 'undefined') {
            window.musicPlayerInstance = new MusicPlayer();
        }
    }

    // Exécuter l'injection
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectMusicPlayer);
    } else {
        injectMusicPlayer();
    }

    // S'assurer que le lecteur reste en place lors des changements SPA
    document.addEventListener('spa-page-loaded', injectMusicPlayer);
    
})();
