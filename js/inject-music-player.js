/**
 * ============================================
 * INJECTION DU LECTEUR AUDIO GLOBAL
 * ============================================
 * 
 * Ce script ajoute automatiquement le lecteur audio sur toutes les pages du site.
 * Il crée les éléments HTML nécessaires et les insère dans la page.
 * 
 * Pourquoi ce fichier existe :
 * - Le lecteur doit apparaître sur toutes les pages
 * - Au lieu de copier le HTML dans chaque page, on l'injecte automatiquement
 * - Cela évite la duplication de code
 */

(function() {
    'use strict';

    // Le code HTML complet du lecteur audio
    // On le stocke ici directement dans le JavaScript pour éviter les problèmes
    // de chargement de fichier (notamment avec file://)
    const musicPlayerHTML = `
<!-- Élément audio HTML5 qui joue la musique -->
<audio id="audioPlayer" preload="none">
	<!-- Le fichier audio sera chargé dynamiquement par JavaScript -->
	Your browser does not support the audio element.
</audio>

<!-- Conteneur principal du lecteur -->
<div class="music-player" id="musicPlayer">
	<!-- En-tête avec icône musique et bouton minimiser -->
	<div class="player-header">
		<i class="fas fa-music" style="color: #3caee4; font-size: 18px;"></i>
		<button class="minimize-btn" id="minimizeBtn">
			<i class="fas fa-minus"></i>
		</button>
	</div>

	<!-- Informations sur la chanson -->
	<div class="music-info">
		<div class="song-title" id="songTitle">Ambient Space</div>
		<div class="song-artist" id="songArtist">Portfolio Soundtrack</div>

		<!-- Barre de progression cliquable -->
		<div class="progress-container" id="progressContainer">
			<div class="progress-bar" id="progressBar"></div>
		</div>

		<!-- Affichage du temps (actuel / total) -->
		<div class="time-info">
			<span id="currentTime">0:00</span>
			<span id="totalTime">0:00</span>
		</div>
	</div>

	<!-- Boutons de contrôle -->
	<div class="music-controls">
		<button class="control-btn secondary" id="prevBtn">
			<i class="fas fa-backward"></i>
		</button>
		<button class="control-btn play-pause" id="playPauseBtn">
			<i class="fas fa-play"></i>
		</button>
		<button class="control-btn secondary" id="nextBtn">
			<i class="fas fa-forward"></i>
		</button>
		<button class="control-btn secondary" id="loopBtn" title="Répétition">
			<i class="fas fa-repeat"></i>
			<span class="loop-indicator" id="loopIndicator" style="display: none;">1</span>
		</button>
	</div>

	<!-- Contrôle du volume -->
	<div class="volume-container">
		<i class="fas fa-volume-up volume-icon" id="volumeIcon"></i>
		<input type="range" class="volume-slider" id="volumeSlider" min="0" max="100" value="30">
	</div>

	<!-- Animation d'égaliseur qui bouge avec la musique -->
	<div class="equalizer" id="equalizer">
		<div class="eq-bar"></div>
		<div class="eq-bar"></div>
		<div class="eq-bar"></div>
		<div class="eq-bar"></div>
		<div class="eq-bar"></div>
	</div>
</div>
    `;

    /**
     * Fonction qui injecte le lecteur dans la page
     */
    function injectMusicPlayer() {
        // Si le lecteur existe déjà, on ne fait rien
        // (pour éviter de le créer plusieurs fois)
        if (document.getElementById('musicPlayer') || document.getElementById('audioPlayer')) {
            // Si le lecteur existe déjà, on réinitialise juste les références
            // (utile quand on change de page)
            if (window.musicPlayerInstance) {
                window.musicPlayerInstance.reinitializeDOM();
            }
            return;
        }

        // On crée un conteneur temporaire invisible pour parser le HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = musicPlayerHTML;

        // On récupère l'élément audio et on l'ajoute au début du body
        // (il doit être là pour que le JavaScript puisse le trouver)
        const audioElement = tempDiv.querySelector('#audioPlayer');
        if (audioElement) {
            document.body.insertBefore(audioElement, document.body.firstChild);
        }

        // On récupère le lecteur complet
        const musicPlayer = tempDiv.querySelector('#musicPlayer');
        if (musicPlayer) {
            // On vérifie si on est sur la page d'accueil
            const homeContent = document.querySelector('.home-content');
            
            if (homeContent) {
                // Sur la page d'accueil, on met le lecteur dans la section home-content
                // (pour qu'il soit bien positionné dans le design)
                homeContent.appendChild(musicPlayer);
            } else {
                // Sur les autres pages, on le met directement dans le body
                // (il sera positionné en bas à droite grâce au CSS)
                document.body.appendChild(musicPlayer);
            }
        }

        // Maintenant que le lecteur est dans la page, on l'initialise
        if (window.musicPlayerInstance) {
            // Si le lecteur existe déjà (par exemple après un changement de page),
            // on réinitialise juste les références aux éléments HTML
            window.musicPlayerInstance.reinitializeDOM();
        } else if (typeof MusicPlayer !== 'undefined') {
            // Sinon, on crée une nouvelle instance du lecteur
            window.musicPlayerInstance = new MusicPlayer();
        }
    }

    // On attend que la page soit complètement chargée avant d'injecter le lecteur
    if (document.readyState === 'loading') {
        // Si la page est encore en train de charger, on attend
        document.addEventListener('DOMContentLoaded', injectMusicPlayer);
    } else {
        // Si la page est déjà chargée, on injecte tout de suite
        injectMusicPlayer();
    }
})();
