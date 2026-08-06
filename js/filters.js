/**
 * ============================================
 * GESTION DES FILTRES (PROJETS & COMPÉTENCES)
 * ============================================
 */

(function () {
    'use strict';

    function setupSectionFilters(sectionId) {
        const section = document.getElementById(sectionId);
        if (!section) return;

        const filterBtns = section.querySelectorAll('.filter-btn');

        // Message "aucun résultat" (créé une seule fois par section).
        // Il porte data-i18n : le moteur i18n le retraduira tout seul lors
        // d'une bascule de langue, même s'il est déjà dans le DOM.
        function getNoResultsEl() {
            let el = section.querySelector('.no-results');
            if (!el) {
                el = document.createElement('p');
                el.className = 'no-results';
                el.setAttribute('data-i18n', 'ui.noResults');
                el.innerHTML = '<i class="fas fa-search"></i> Aucun élément dans cette catégorie.';
                el.style.display = 'none';
                const grid = section.querySelector('.projects-grid');
                if (grid) grid.insertAdjacentElement('afterend', el);
                if (window.i18n && window.i18n.apply) window.i18n.apply(el);
            }
            return el;
        }

        filterBtns.forEach(btn => {
            // onclick (et non addEventListener) : le routeur SPA réinitialise les
            // filtres à chaque navigation, on évite d'empiler les écouteurs
            btn.onclick = () => {
                // Retirer la classe active de tous les boutons de CETTE section
                filterBtns.forEach(b => b.classList.remove('active'));
                // Ajouter la classe active au bouton cliqué
                btn.classList.add('active');

                const filter = btn.dataset.filter;
                // Requêter les cartes au clic : celles de #tps sont générées par tps.js
                const cards = section.querySelectorAll('.project-card');
                let visibles = 0;

                cards.forEach(card => {
                    const categories = (card.dataset.category || '').split(' ');
                    if (filter === 'all' || categories.includes(filter)) {
                        visibles++;
                        card.style.display = 'block';
                        // Réanimer l'apparition
                        card.style.animation = 'none';
                        setTimeout(() => {
                            card.style.animation = 'projectAppear 0.6s ease-out forwards';
                        }, 10);
                    } else {
                        card.style.display = 'none';
                    }
                });

                getNoResultsEl().style.display = visibles === 0 ? 'block' : 'none';
            };
        });
    }

    function init() {
        setupSectionFilters('tps');
        setupSectionFilters('projets');
        setupSectionFilters('competences');
    }

    // Exposer pour réinitialisation si nécessaire
    window.initFilters = init;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
