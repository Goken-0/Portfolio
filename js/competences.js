/**
 * ============================================
 * PAGE COMPÉTENCES : APPARITIONS & COMPTEURS
 * ============================================
 *
 * Motion design discret :
 * - les éléments .sk-reveal apparaissent en fondu quand ils entrent à l'écran,
 *   avec un léger décalage entre voisins ; les logos d'une tuile suivent
 *   un par un ;
 * - les chiffres clés comptent de 0 jusqu'à leur valeur.
 *
 * L'état masqué n'est posé que si ce script tourne (classe .skills-js) :
 * sans JS, la page reste entièrement lisible. Avec prefers-reduced-motion,
 * tout s'affiche directement à l'état final.
 */

(function () {
    'use strict';

    const STAGGER_MS = 70;
    const COUNT_MS = 1200;
    const SETTLE_MS = 900;

    const reduceMotion = window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let observer = null;

    /** Valeur cible d'un compteur. Le nombre de TPs est lu dans la grille
     *  générée par tps.js : ajouter un TP met la page à jour toute seule. */
    function targetOf(el) {
        if (el.dataset.countFrom === 'tps') {
            const n = document.querySelectorAll('#tps-grid .project-card').length;
            if (n > 0) return n;
        }
        return parseInt(el.dataset.count, 10) || 0;
    }

    function runCounter(el) {
        const target = targetOf(el);
        if (reduceMotion) {
            el.textContent = target;
            return;
        }
        const start = performance.now();
        function step(now) {
            const p = Math.min((now - start) / COUNT_MS, 1);
            // easeOutCubic : démarre vite, se pose en douceur
            const eased = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.round(target * eased);
            if (p < 1) requestAnimationFrame(step);
        }
        el.textContent = '0';
        requestAnimationFrame(step);
    }

    function reveal(el) {
        el.classList.add('is-visible');
        el.querySelectorAll('[data-count]').forEach(runCounter);

        // Fin de l'apparition : le survol des tuiles peut prendre le relais
        // sans hériter du délai de cascade (voir .is-settled dans le CSS)
        const delay = parseInt(el.style.getPropertyValue('--sk-delay'), 10) || 0;
        el._settleTimer = setTimeout(function () {
            el.classList.add('is-settled');
        }, reduceMotion ? 0 : delay + SETTLE_MS);
    }

    /** Délai d'apparition : rang de l'élément parmi les .sk-reveal de son
     *  parent, pour que les lignes d'un même bloc arrivent en cascade.
     *  Les logos d'une tuile reçoivent leur rang dans --i. */
    function setDelays(root) {
        root.querySelectorAll('.sk-reveal').forEach(function (el) {
            const siblings = Array.prototype.filter.call(
                el.parentElement.children,
                function (c) { return c.classList.contains('sk-reveal'); }
            );
            el.style.setProperty('--sk-delay', (siblings.indexOf(el) * STAGGER_MS) + 'ms');
        });
        root.querySelectorAll('.skills-tools, .skills-missions').forEach(function (list) {
            Array.prototype.forEach.call(list.children, function (li, i) {
                li.style.setProperty('--i', i);
            });
        });
    }

    /** (Ré)arme les apparitions : appelé au chargement et à chaque retour
     *  sur la page, pour rejouer l'animation plutôt que de la voir figée. */
    function arm() {
        const root = document.querySelector('#competences .skills');
        if (!root) return;

        const items = root.querySelectorAll('.sk-reveal');

        if (reduceMotion || !('IntersectionObserver' in window)) {
            items.forEach(reveal);
            return;
        }

        if (observer) observer.disconnect();
        observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                reveal(entry.target);
                observer.unobserve(entry.target);
            });
        }, { rootMargin: '0px 0px -8% 0px', threshold: 0.1 });

        items.forEach(function (el) {
            clearTimeout(el._settleTimer);
            el.classList.remove('is-visible', 'is-settled');
            observer.observe(el);
        });
    }

    function init() {
        const root = document.querySelector('#competences .skills');
        if (!root) return;
        root.classList.add('skills-js');
        setDelays(root);
        arm();
    }

    // Retour sur la page : spa-router.js (chargé avant) vient d'afficher la
    // section, on rejoue les apparitions.
    window.addEventListener('hashchange', function () {
        if (window.location.hash === '#competences') arm();
    });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
