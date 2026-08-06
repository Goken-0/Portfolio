/**
 * ============================================
 * ANIMATION TEXTE ROTATIF
 * ============================================
 * Remplace l'animation CSS de typing par une rotation
 * de mots fluide et responsive.
 *
 * Bilingue : les mots sont rejoués dans la langue courante à chaque
 * bascule (événement i18n:changed).
 */
(function () {
    'use strict';

    const WORDS = {
        fr: [
            'étudiant en BTS SIO',
            'passionné de réseaux',
            'futur technicien IT',
            'amateur de cybersecurité'
        ],
        en: [
            'an IT student',
            'a networking enthusiast',
            'a future IT technician',
            'a cybersecurity enthusiast'
        ]
    };

    const PREFIX = {
        fr: 'Je suis ',
        en: "I'm "
    };

    // Identifiants des minuteries en cours : sans ce suivi, chaque bascule de
    // langue empilerait un nouvel setInterval et la rotation s'emballerait.
    let rotationTimer = null;
    let pendingTimeouts = [];

    function clearTimers() {
        if (rotationTimer !== null) {
            clearInterval(rotationTimer);
            rotationTimer = null;
        }
        pendingTimeouts.forEach(clearTimeout);
        pendingTimeouts = [];
    }

    function currentLang() {
        return (window.i18n && window.i18n.lang === 'en') ? 'en' : 'fr';
    }

    function initTyping() {
        const h3 = document.querySelector('.typing-text');
        if (!h3) return;

        clearTimers();

        const lang = currentLang();
        const words = WORDS[lang];

        // Vider le h3 et reconstruire proprement
        h3.innerHTML = '';

        const prefix = document.createTextNode(PREFIX[lang]);
        h3.appendChild(prefix);

        const wrap = document.createElement('span');
        wrap.className = 'rotate-wrap';

        // Créer les spans de mots
        const spans = words.map((w, i) => {
            const s = document.createElement('span');
            s.textContent = w;
            s.style.setProperty('--i', i);
            wrap.appendChild(s);
            return s;
        });

        h3.appendChild(wrap);

        let current = 0;

        function showWord(index) {
            spans.forEach((s, i) => {
                s.classList.remove('word-visible', 'word-out');
                if (i === index) {
                    s.classList.add('word-visible');
                }
            });
        }

        function nextWord() {
            const prev = current;
            current = (current + 1) % words.length;

            // Sortie de l'ancien mot
            spans[prev].classList.remove('word-visible');
            spans[prev].classList.add('word-out');
            pendingTimeouts.push(setTimeout(() => spans[prev].classList.remove('word-out'), 500));

            // Entrée du nouveau mot
            pendingTimeouts.push(setTimeout(() => showWord(current), 300));
        }

        // Premier mot immédiatement
        showWord(0);

        // Rotation toutes les 3s
        rotationTimer = setInterval(nextWord, 3000);
    }

    document.addEventListener('i18n:changed', initTyping);

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTyping);
    } else {
        initTyping();
    }
})();
