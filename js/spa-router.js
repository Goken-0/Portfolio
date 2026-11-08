/**
 * ============================================
 * ROUTEUR SPA (SINGLE PAGE APPLICATION) - HASH BASED
 * ============================================
 */

(function () {
    'use strict';

    const SECTIONS = {
        'accueil': { id: 'accueil', class: 'home-page', display: 'flex' },
        'experiences': { id: 'experiences', class: 'experiences-page', display: 'block' },
        'motivation': { id: 'motivation', class: 'motivation-page', display: 'block' },
        'tps': { id: 'tps', class: 'projets-page', display: 'block' },
        'projets': { id: 'projets', class: 'projets-page', display: 'block' },
        'stages': { id: 'stages', class: 'stages-page', display: 'block' },
        'competences': { id: 'competences', class: 'projets-page', display: 'block' },
        'veille': { id: 'veille', class: 'veille-page', display: 'block' },
        'contact': { id: 'contact', class: 'contact-page', display: 'block' },
        'mentions': { id: 'mentions', class: 'legal-page', display: 'block' }
    };

    function navigateTo(hash) {
        let id = hash.replace('#', '') || 'accueil';
        let deepTarget = null;

        // Hash qui n'est pas une page : soit une carte précise d'une page
        // (#tp-8, #projet-nas…, liens de la page Compétences), soit le lien
        // d'évitement (#main-content)
        if (!SECTIONS[id]) {
            const anchor = document.getElementById(id);
            const parentSection = anchor && anchor.closest('main > section');
            if (parentSection && SECTIONS[parentSection.id]) {
                deepTarget = anchor;
                id = parentSection.id;
                hash = '#' + id;
            } else if (anchor) {
                if (!anchor.hasAttribute('tabindex')) anchor.setAttribute('tabindex', '-1');
                anchor.focus();
                return;
            }
        }

        const config = SECTIONS[id] || SECTIONS['accueil'];

        // 1. Masquer toutes les sections
        document.querySelectorAll('main > section').forEach(sec => {
            sec.style.display = 'none';
        });

        // 2. Afficher la section cible avec son display original
        const targetSection = document.getElementById(config.id);
        if (targetSection) {
            targetSection.style.display = config.display;
            
            // Re-déclencher les animations si nécessaire
            targetSection.classList.remove('animate-in');
            void targetSection.offsetWidth; // Force reflow
            targetSection.classList.add('animate-in');
        }

        // 3. Mettre à jour la classe du body pour le CSS scoping
        document.body.className = config.class;

        // 4. Mettre à jour la navigation active
        updateActiveLink(hash || '#accueil');

        // 5. Scroll vers le haut (ou vers la carte visée, voir étape 8)
        if (!deepTarget) window.scrollTo({ top: 0, behavior: 'smooth' });

        // 6. Fermer le menu mobile si ouvert
        const header = document.querySelector('header');
        const overlay = document.querySelector('.sidebar-overlay');
        const hamburger = document.querySelector('.hamburger-toggle');
        if (header && header.classList.contains('sidebar-open')) {
            header.classList.remove('sidebar-open');
            if (overlay) overlay.classList.remove('active');
            if (hamburger) {
                hamburger.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
            }
        }
        
        // 7. Réinitialiser les composants si nécessaire
        if (window.reinitUI) window.reinitUI();
        if (window.initFilters) window.initFilters();

        // 8. Carte visée : la rendre visible, défiler jusqu'à elle, la surligner
        if (deepTarget) focusCard(deepTarget, targetSection);
    }

    function focusCard(card, section) {
        // Un filtre actif peut masquer la carte : on repasse sur « Tous »
        if (card.style.display === 'none' && section) {
            const allBtn = section.querySelector('.filter-btn[data-filter="all"]');
            if (allBtn) allBtn.click();
        }
        // Pas d'attente de l'animation d'apparition en cascade pour celle-ci
        card.style.animationDelay = '0s';

        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        requestAnimationFrame(() => {
            card.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
            if (!card.hasAttribute('tabindex')) card.setAttribute('tabindex', '-1');
            card.focus({ preventScroll: true });
            card.classList.add('is-targeted');
            clearTimeout(card._targetTimer);
            card._targetTimer = setTimeout(() => card.classList.remove('is-targeted'), 2600);
        });
    }

    function updateActiveLink(hash) {
        // Refermer les sous-menus ouverts pour une page précédente
        document.querySelectorAll('nav .dropdown').forEach(d => {
            d.classList.remove('active');
            const btn = d.querySelector('.dropbtn');
            if (btn) btn.setAttribute('aria-expanded', 'false');
        });
        document.querySelectorAll('nav a').forEach(link => {
            const linkHash = link.getAttribute('href');
            if (linkHash === hash) {
                link.classList.add('active');
                const parentDropdown = link.closest('.dropdown');
                if (parentDropdown) {
                    parentDropdown.classList.add('active');
                    const btn = parentDropdown.querySelector('.dropbtn');
                    if (btn) btn.setAttribute('aria-expanded', 'true');
                }
            } else {
                link.classList.remove('active');
            }
        });
    }

    // Intercepter les clics sur d'anciens liens *.html (les liens #hash sont gérés par hashchange)
    // Recliquer un lien vers la carte déjà visée ne déclenche pas hashchange :
    // on relance la navigation à la main
    document.addEventListener('click', e => {
        const link = e.target.closest('a[href^="#"]');
        if (link && link.getAttribute('href') === window.location.hash &&
            !SECTIONS[window.location.hash.slice(1)]) {
            e.preventDefault();
            navigateTo(window.location.hash);
        }
    });

    document.addEventListener('click', e => {
        const link = e.target.closest('nav a, .social-contact, .btn, .view-button, .featured-btn');
        if (!link) return;
        const href = link.getAttribute('href');
        if (href && !href.startsWith('#') && !href.startsWith('http') && href.endsWith('.html')) {
            e.preventDefault();
            const page = href.replace('.html', '');
            window.location.hash = (page === 'index') ? '#accueil' : '#' + page;
        }
    });

    window.addEventListener('hashchange', () => {
        navigateTo(window.location.hash);
    });

    window.addEventListener('load', () => {
        if (!window.location.hash || window.location.hash === '#') {
            window.location.hash = '#accueil';
        } else {
            navigateTo(window.location.hash);
        }
    });

})();
