/**
 * ============================================
 * ROUTEUR SPA (SINGLE PAGE APPLICATION) - HASH BASED
 * ============================================
 */

(function () {
    'use strict';

    const SECTIONS = {
        'accueil': { id: 'accueil', class: 'home-page', display: 'flex' },
        'cv': { id: 'cv', class: 'cv-page', display: 'block' },
        'motivation': { id: 'motivation', class: 'motivation-page', display: 'block' },
        'tps': { id: 'tps', class: 'projets-page', display: 'block' },
        'projets': { id: 'projets', class: 'projets-page', display: 'block' },
        'stages': { id: 'stages', class: 'stages-page', display: 'block' },
        'competences': { id: 'competences', class: 'projets-page', display: 'block' },
        'veille': { id: 'veille', class: 'veille-page', display: 'block' },
        'contact': { id: 'contact', class: 'contact-page', display: 'block' }
    };

    function navigateTo(hash) {
        const id = hash.replace('#', '') || 'accueil';
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

        // 5. Scroll vers le haut
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // 6. Fermer le menu mobile si ouvert
        const header = document.querySelector('header');
        const overlay = document.querySelector('.sidebar-overlay');
        const hamburger = document.querySelector('.hamburger-toggle');
        if (header && header.classList.contains('sidebar-open')) {
            header.classList.remove('sidebar-open');
            if (overlay) overlay.classList.remove('active');
            if (hamburger) hamburger.classList.remove('active');
        }
        
        // 7. Réinitialiser les composants si nécessaire
        if (window.reinitUI) window.reinitUI();
        if (window.initFilters) window.initFilters();
    }

    function updateActiveLink(hash) {
        document.querySelectorAll('nav a').forEach(link => {
            const linkHash = link.getAttribute('href');
            if (linkHash === hash) {
                link.classList.add('active');
                const parentDropdown = link.closest('.dropdown');
                if (parentDropdown) parentDropdown.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    // Intercepter les clics
    document.addEventListener('click', e => {
        const link = e.target.closest('nav a, .social-contact, .btn, .view-button, .featured-btn');
        if (link && link.getAttribute('href') && link.getAttribute('href').startsWith('#')) {
            // Le hashchange s'en occupe
        } else if (link && link.getAttribute('href') && !link.getAttribute('href').startsWith('http') && link.getAttribute('href').endsWith('.html')) {
            e.preventDefault();
            const page = link.getAttribute('href').replace('.html', '');
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
