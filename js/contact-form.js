/**
 * ============================================
 * FORMULAIRE DE CONTACT - VALIDATION + ENVOI AJAX
 * ============================================
 * Extrait du <script> inline d'index.html pour permettre une CSP en
 * `script-src 'self'` (aucun script inline autorisé).
 */

(function () {
	'use strict';

	// Délai minimum entre deux envois depuis le même navigateur.
	// Le captcha Formspree casse l'envoi AJAX (il impose une redirection),
	// on garde donc une limite côté client. Elle ne remplace pas la
	// restriction de domaine à activer dans le tableau de bord Formspree :
	// c'est elle qui bloque réellement les POST directs vers l'endpoint.
	const THROTTLE_MS = 60 * 1000;
	const THROTTLE_KEY = 'contactLastSent';

	// Raccourci de traduction : le texte français reste la valeur de repli
	// si i18n.js n'a pas pu se charger.
	function t(key, fr) {
		return (window.i18n && window.i18n.t) ? window.i18n.t(key, fr) : fr;
	}

	/** Millisecondes restantes avant le prochain envoi autorisé, 0 si libre. */
	function throttleRemaining() {
		let last;
		try {
			last = Number(localStorage.getItem(THROTTLE_KEY));
		} catch (e) {
			return 0; // localStorage indisponible : on n'entrave pas l'envoi
		}
		if (!Number.isFinite(last) || last <= 0) return 0;

		const elapsed = Date.now() - last;
		// Horloge reculée ou valeur future forgée : on repart de zéro plutôt
		// que de bloquer le formulaire indéfiniment.
		if (elapsed < 0) return 0;
		return elapsed >= THROTTLE_MS ? 0 : THROTTLE_MS - elapsed;
	}

	function markSent() {
		try {
			localStorage.setItem(THROTTLE_KEY, String(Date.now()));
		} catch (e) {
			// ignoré volontairement
		}
	}

	function initContactForm() {
		const form = document.getElementById('contactForm');
		const submitBtn = document.getElementById('submitBtn');
		const status = document.getElementById('formStatus');
		if (!form || !submitBtn) return;

		function showStatus(type, text) {
			if (!status) return;
			status.className = 'form-status ' + type;
			status.textContent = text;
		}

		form.addEventListener('submit', function (e) {
			// Toujours bloquer l'envoi natif : jamais de redirection vers Formspree
			e.preventDefault();

			const email = document.getElementById('email');
			email.setCustomValidity('');
			if (!form.checkValidity()) {
				form.reportValidity();
				return;
			}
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(email.value.trim())) {
				email.setCustomValidity(t('contact.invalidEmail', 'Veuillez entrer une adresse email valide'));
				email.reportValidity();
				return;
			}

			const remaining = throttleRemaining();
			if (remaining > 0) {
				const seconds = Math.ceil(remaining / 1000);
				showStatus('error', t('contact.throttle', 'Patientez encore {s} secondes avant de renvoyer un message.')
					.replace('{s}', seconds));
				return;
			}

			submitBtn.disabled = true;
			submitBtn.textContent = t('contact.sending', 'Envoi en cours...');
			showStatus('', '');

			fetch(form.action, {
				method: 'POST',
				body: new FormData(form),
				headers: { 'Accept': 'application/json' }
			}).then(function (res) {
				if (res.ok) {
					markSent();
					form.reset();
					showStatus('success', t('contact.success', 'Message envoyé, merci !'));
				} else if (res.status === 429) {
					markSent();
					showStatus('error', t('contact.rateLimit', 'Trop de messages envoyés en peu de temps. Patientez quelques minutes avant de réessayer.'));
				} else {
					showStatus('error', t('contact.error', 'Une erreur est survenue. Réessayez ou contactez-moi via LinkedIn.'));
				}
			}).catch(function () {
				showStatus('error', t('contact.network', 'Impossible d\'envoyer le message. Vérifiez votre connexion.'));
			}).finally(function () {
				submitBtn.disabled = false;
				submitBtn.textContent = t('contact.submit', 'Envoyer');
			});
		});
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', initContactForm);
	} else {
		initContactForm();
	}
})();
