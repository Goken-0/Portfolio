/**
 * ============================================
 * INITIALISATION PRÉCOCE (remplace les handlers inline)
 * ============================================
 * Ce fichier existe uniquement pour que la CSP puisse interdire le script
 * inline (`script-src 'self'`). Ce qui était écrit dans un attribut
 * onerror= du HTML a été déplacé ici.
 *
 * La bascule des feuilles de style asynchrones a disparu : Poppins et Font
 * Awesome sont désormais auto-hébergés et chargés normalement, il n'y a plus
 * de media="print" à repasser en "all".
 */

(function () {
	'use strict';

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

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', initProfileImageFallback);
	} else {
		initProfileImageFallback();
	}
})();
