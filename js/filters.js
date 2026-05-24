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
        const cards = section.querySelectorAll('.project-card');

        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Retirer la classe active de tous les boutons de CETTE section
                filterBtns.forEach(b => b.classList.remove('active'));
                // Ajouter la classe active au bouton cliqué
                btn.classList.add('active');

                const filter = btn.dataset.filter;

                cards.forEach(card => {
                    const categories = card.dataset.category || '';
                    if (filter === 'all' || categories.includes(filter)) {
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
            });
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
