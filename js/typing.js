/**
 * ============================================
 * ANIMATION TEXTE ROTATIF
 * ============================================
 * Remplace l'animation CSS de typing par une rotation
 * de mots fluide et responsive.
 */
(function () {
    'use strict';

    const words = [
        'étudiant en BTS SIO',
        'passionné de réseaux',
        'futur technicien IT',
        'amateur de cybersecurité'
    ];

    function initTyping() {
        const h3 = document.querySelector('.typing-text');
        if (!h3) return;

        // Vider le h3 et reconstruire proprement
        h3.innerHTML = '';

        const prefix = document.createTextNode('Je suis\u00a0');
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
            setTimeout(() => spans[prev].classList.remove('word-out'), 500);

            // Entrée du nouveau mot
            setTimeout(() => showWord(current), 300);
        }

        // Premier mot immédiatement
        showWord(0);

        // Rotation toutes les 3s
        setInterval(nextWord, 3000);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTyping);
    } else {
        initTyping();
    }
})();
