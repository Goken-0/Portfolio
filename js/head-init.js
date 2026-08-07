/**
 * ============================================
 * INITIALISATION PRÉCOCE (remplace les handlers inline)
 * ============================================
 * Ce fichier existe uniquement pour que la CSP puisse interdire le script
 * inline (`script-src 'self'`). Tout ce qui était écrit dans un attribut
 * onload= / onerror= du HTML a été déplacé ici.
 *
 * Chargé dans <head>, juste après les <link>, sans defer : les éléments
 * qu'il cible en <head> sont déjà analysés, et la partie <body> attend
 * DOMContentLoaded.
 */

(function () {
	'use strict';

	/**
	 * Feuilles de style non bloquantes.
	 * Le HTML les déclare en media="print" pour que le navigateur les
	 * télécharge sans retarder le premier rendu ; on repasse en media="all"
	 * une fois chargées. Remplace onload="this.media='all'".
	 */
	function activateAsyncStyles() {
		document.querySelectorAll('link[data-async-style]').forEach(function (link) {
			// Déjà chargée avant l'exécution de ce script : l'événement 'load'
			// est passé, on bascule directement.
			if (link.sheet) {
				link.media = 'all';
				return;
			}
			link.addEventListener('load', function () {
				link.media = 'all';
			}, { once: true });
		});
	}

	/**
	 * Photo de profil : si le fichier est absent ou bloqué, on masque l'image
	 * et on révèle l'icône de repli placée juste après.
	 * Remplace onerror="this.style.display='none';this.nextElementSibling..."
	 */
	function initProfileImageFallback() {
		var img = document.querySelector('.profile-img');
		if (!img) return;

		function showPlaceholder() {
			img.style.display = 'none';
			var placeholder = img.nextElementSibling;
			if (placeholder) placeholder.style.display = 'flex';
		}

		// complete && naturalWidth === 0 : le chargement est terminé et a échoué,
		// l'événement 'error' est déjà passé avant l'exécution de ce script.
		if (img.complete && img.naturalWidth === 0) showPlaceholder();
		else img.addEventListener('error', showPlaceholder, { once: true });
	}

	activateAsyncStyles();

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', initProfileImageFallback);
	} else {
		initProfileImageFallback();
	}
})();
