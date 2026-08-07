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
	// on garde donc une limite côté client. Elle ne remplace pas Formshield,
	// qui est la seule protection agissant côté serveur.
	const THROTTLE_MS = 60 * 1000;
	const THROTTLE_KEY = 'contactLastSent';

	// Raccourci de traduction : le texte français reste la valeur de repli
	// si i18n.js n'a pas pu se charger.
	function t(key, fr) {
		return (window.i18n && window.i18n.t) ? window.i18n.t(key, fr) : fr;
	}

	// ============================================
	// LIMITATION DE FRÉQUENCE
	// ============================================

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

	// ============================================
	// QUALITÉ DES SAISIES
	// ============================================
	// On ne peut pas vérifier qu'un nom est « vrai » : « Ng », « Åsa »,
	// « O'Brien » sont réels, « Jean Dupont » est plausible et faux. Un filtre
	// agressif rejetterait de vraies personnes — un coût bien pire que de
	// recevoir un message bidon qu'on supprime en deux secondes.
	//
	// On vise donc uniquement le pianotage évident (« eaeaeaea », « aaaa »),
	// avec des règles volontairement prudentes, et surtout la faute de frappe
	// dans le domaine du mail : c'est le cas fréquent et réellement coûteux,
	// puisqu'un « gmial.com » rend toute réponse impossible.

	const VOWELS = 'aeiouyàâäåéèêëïîíìôöòóøùûüúÿæœ';

	/** Retire accents et casse pour analyser la forme du mot. */
	function normalize(value) {
		// ̀-ͯ = diacritiques combinants, isolés par la décomposition
		// NFD. Écrits en échappements plutôt qu'en caractères bruts : ils sont
		// invisibles dans un éditeur et survivent mal aux conversions d'encodage.
		return value
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '')
			.toLowerCase();
	}

	// Rangées de touches AZERTY et QWERTY. Une suite de 5 touches voisines
	// dans l'ordre (« qwert », « asdfg ») ne se rencontre dans aucun
	// patronyme réel, mais trahit immédiatement un doigt glissé sur le clavier.
	const KEYBOARD_ROWS = [
		'azertyuiop', 'qsdfghjklm', 'wxcvbn',
		'qwertyuiop', 'asdfghjkl', 'zxcvbnm'
	];
	const KEYBOARD_RUN = 5;

	function hasKeyboardRun(word) {
		for (let i = 0; i + KEYBOARD_RUN <= word.length; i++) {
			const chunk = word.slice(i, i + KEYBOARD_RUN);
			for (let r = 0; r < KEYBOARD_ROWS.length; r++) {
				const row = KEYBOARD_ROWS[r];
				if (row.indexOf(chunk) !== -1) return true;
				// même chose en sens inverse (« poiuy »)
				if (row.indexOf(chunk.split('').reverse().join('')) !== -1) return true;
			}
		}
		return false;
	}

	/**
	 * Détecte un mot tapé au hasard sur le clavier.
	 * Quatre signaux, chacun choisi pour ne toucher aucun vrai patronyme :
	 *   - une même lettre répétée 4 fois de suite  (« aaaa »)
	 *   - un même couple de lettres répété 3 fois  (« eaeaea », « azazaz »)
	 *   - aucune voyelle dans un mot de 4 lettres ou plus
	 *   - 5 touches consécutives d'une rangée de clavier  (« qwert »)
	 * « Anna », « Aaron », « Nana », « Ng », « Krzysztof », « Łukasz »,
	 * « Nguyễn », « Mbappé » passent tous — vérifié par test_validation.js.
	 */
	function looksLikeMashing(value) {
		const word = normalize(value).replace(/[^a-z]/g, '');
		if (word.length < 4) return false;

		if (/(.)\1{3,}/.test(word)) return true;
		if (/(..)\1{2,}/.test(word)) return true;
		if (hasKeyboardRun(word)) return true;

		for (const char of word) {
			if (VOWELS.indexOf(char) !== -1) return false;
		}
		return true;
	}

	// Domaines les plus courants chez les particuliers en France : sert
	// uniquement à proposer une correction, jamais à bloquer.
	const COMMON_DOMAINS = [
		'gmail.com', 'hotmail.com', 'hotmail.fr', 'outlook.com', 'outlook.fr',
		'yahoo.com', 'yahoo.fr', 'orange.fr', 'wanadoo.fr', 'free.fr',
		'sfr.fr', 'laposte.net', 'live.fr', 'icloud.com', 'proton.me',
		'protonmail.com', 'bbox.fr', 'numericable.fr', 'aol.com'
	];

	/** Distance de Levenshtein, bornée : au-delà de `max` on abandonne. */
	function editDistance(a, b, max) {
		if (Math.abs(a.length - b.length) > max) return max + 1;
		let previous = Array.from({ length: b.length + 1 }, function (_, i) { return i; });
		for (let i = 1; i <= a.length; i++) {
			const current = [i];
			let best = i;
			for (let j = 1; j <= b.length; j++) {
				const cost = a[i - 1] === b[j - 1] ? 0 : 1;
				current[j] = Math.min(
					previous[j] + 1,
					current[j - 1] + 1,
					previous[j - 1] + cost
				);
				if (current[j] < best) best = current[j];
			}
			if (best > max) return max + 1;   // toute la ligne dépasse : inutile de continuer
			previous = current;
		}
		return previous[b.length];
	}

	/** Renvoie le domaine probablement voulu, ou null si rien de suspect. */
	function suggestDomain(email) {
		const at = email.lastIndexOf('@');
		if (at === -1) return null;
		const domain = email.slice(at + 1).toLowerCase();
		if (!domain || COMMON_DOMAINS.indexOf(domain) !== -1) return null;

		let best = null;
		let bestDistance = 3;
		for (let i = 0; i < COMMON_DOMAINS.length; i++) {
			const distance = editDistance(domain, COMMON_DOMAINS[i], 2);
			if (distance > 0 && distance < bestDistance) {
				bestDistance = distance;
				best = COMMON_DOMAINS[i];
			}
		}
		return best;
	}

	/**
	 * Validation stricte de la syntaxe d'une adresse.
	 * Plus exigeante que l'ancien `[^\s@]+@[^\s@]+\.[^\s@]+` : impose une
	 * extension d'au moins deux lettres et interdit points en début/fin et
	 * points consécutifs, invalides et presque toujours signe d'une faute.
	 */
	function isValidEmail(email) {
		if (email.length > 254) return false;
		if (!/^[^\s@]+@[^\s@]+$/.test(email)) return false;

		const at = email.lastIndexOf('@');
		const local = email.slice(0, at);
		const domain = email.slice(at + 1);

		if (local.length > 64) return false;
		if (/^\.|\.$|\.\./.test(local)) return false;
		if (/^[.-]|[.-]$|\.\./.test(domain)) return false;
		return /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(domain);
	}

	// ============================================
	// FORMULAIRE
	// ============================================

	function initContactForm() {
		const form = document.getElementById('contactForm');
		const submitBtn = document.getElementById('submitBtn');
		const status = document.getElementById('formStatus');
		if (!form || !submitBtn) return;

		const email = document.getElementById('email');
		const name = document.getElementById('name');
		const firstname = document.getElementById('firstname');

		// La suggestion de domaine n'est qu'un avertissement : au second envoi
		// sans modification, on laisse passer. L'utilisateur reste maître de
		// son adresse — il peut très bien avoir un domaine perso proche d'un
		// domaine courant.
		let warnedFor = null;

		if (email) {
			email.addEventListener('input', function () {
				if (warnedFor !== null && email.value.trim() !== warnedFor) {
					warnedFor = null;
					showStatus('', null);
				}
			});
		}

		// Le message de statut est écrit par JS, il n'est donc pas annoté
		// `data-i18n` et i18n.js ne peut pas le retrouver. On mémorise sa clé
		// pour le réafficher soi-même quand le visiteur change de drapeau.
		let lastStatus = null;

		function renderStatus(entry) {
			const text = t(entry.key, entry.fr);
			return entry.param === undefined ? text : text.replace('{s}', entry.param);
		}

		/**
		 * @param {string} type  '', 'success' ou 'error'
		 * @param {string|null} key  clé i18n, ou null pour effacer le message
		 * @param {string} [fr]  texte français de repli
		 * @param {string|number} [param]  valeur substituée à {s}
		 */
		function showStatus(type, key, fr, param) {
			if (!status) return;
			lastStatus = key ? { key: key, fr: fr, param: param } : null;
			status.className = 'form-status ' + type;
			status.textContent = lastStatus ? renderStatus(lastStatus) : '';
		}

		document.addEventListener('i18n:changed', function () {
			if (status && lastStatus) status.textContent = renderStatus(lastStatus);
		});

		function rejectField(field, message) {
			field.setCustomValidity(message);
			field.reportValidity();
		}

		form.addEventListener('submit', function (e) {
			// Toujours bloquer l'envoi natif : jamais de redirection vers Formspree
			e.preventDefault();

			[name, firstname, email].forEach(function (field) {
				if (field) field.setCustomValidity('');
			});

			// 1. Contraintes HTML natives (required, maxlength, pattern)
			if (!form.checkValidity()) {
				form.reportValidity();
				return;
			}

			// 2. Nom et prénom : pianotage manifeste
			const mashed = [name, firstname].filter(function (field) {
				return field && looksLikeMashing(field.value.trim());
			});
			if (mashed.length > 0) {
				rejectField(mashed[0], t('contact.invalidName',
					'Merci d\'indiquer un nom réel : cette saisie ne semble pas en être un.'));
				return;
			}

			// 3. Adresse e-mail : syntaxe
			const address = email.value.trim();
			if (!isValidEmail(address)) {
				rejectField(email, t('contact.invalidEmail',
					'Veuillez entrer une adresse email valide'));
				return;
			}

			// 4. Adresse e-mail : faute de frappe probable sur le domaine.
			//    Bloque une seule fois, puis laisse passer si rien n'a changé.
			const suggestion = suggestDomain(address);
			if (suggestion && warnedFor !== address) {
				warnedFor = address;
				const corrected = address.slice(0, address.lastIndexOf('@') + 1) + suggestion;
				showStatus('error', 'contact.emailTypo',
					'Vouliez-vous dire {s} ? Corrigez, ou renvoyez pour confirmer votre adresse.',
					corrected);
				email.focus();
				return;
			}

			// 5. Fréquence d'envoi
			const remaining = throttleRemaining();
			if (remaining > 0) {
				const seconds = Math.ceil(remaining / 1000);
				showStatus('error', 'contact.throttle',
					'Patientez encore {s} secondes avant de renvoyer un message.',
					seconds);
				return;
			}

			submitBtn.disabled = true;
			submitBtn.textContent = t('contact.sending', 'Envoi en cours...');
			showStatus('', null);

			fetch(form.action, {
				method: 'POST',
				body: new FormData(form),
				headers: { 'Accept': 'application/json' }
			}).then(function (res) {
				if (res.ok) {
					markSent();
					form.reset();
					warnedFor = null;
					showStatus('success', 'contact.success', 'Message envoyé, merci !');
				} else if (res.status === 429) {
					markSent();
					showStatus('error', 'contact.rateLimit', 'Trop de messages envoyés en peu de temps. Patientez quelques minutes avant de réessayer.');
				} else {
					showStatus('error', 'contact.error', 'Une erreur est survenue. Réessayez ou contactez-moi via LinkedIn.');
				}
			}).catch(function () {
				showStatus('error', 'contact.network', 'Impossible d\'envoyer le message. Vérifiez votre connexion.');
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
