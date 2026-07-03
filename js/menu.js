/**
 * ============================================
 * SIDEBAR NAVIGATION & TILT - MENU.JS
 * ============================================
 */

(function() {
    'use strict';

    // --- MENU HAMBURGER MOBILE ---
    function setupMenu() {
        const toggle = document.querySelector('.hamburger-toggle');
        const sidebar = document.querySelector('header');
        const overlay = document.querySelector('.sidebar-overlay');

        if (!toggle || !sidebar) return;

        function toggleMenu() {
            const open = toggle.classList.toggle('active');
            sidebar.classList.toggle('sidebar-open');
            if (overlay) overlay.classList.toggle('active');
            toggle.setAttribute('aria-expanded', open);
            toggle.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
        }

        // On enlève les anciens écouteurs pour éviter les doublons SPA
        toggle.onclick = toggleMenu;
        if (overlay) overlay.onclick = toggleMenu;

        // Fermer au clic sur un lien mobile
        sidebar.querySelectorAll('nav a').forEach(link => {
            link.onclick = () => {
                if (window.innerWidth <= 995) toggleMenu();
            };
        });
    }

    // --- EFFET TILT 3D ---
    function setupTilt() {
        // Inutile (et gênant) sur écran tactile : pas de survol souris
        if (window.matchMedia('(hover: none)').matches) return;
        const cards = document.querySelectorAll('.profile-card');
        cards.forEach(card => {
            const inner = card.querySelector('.profile-card-inner');
            if (!inner) return;

            card.onmousemove = (e) => {
                const rect = card.getBoundingClientRect();
                const cx = rect.left + rect.width / 2;
                const cy = rect.top + rect.height / 2;
                const dx = (e.clientX - cx) / (rect.width / 2);
                const dy = (e.clientY - cy) / (rect.height / 2);
                inner.style.transform = `rotateX(${-dy * 20}deg) rotateY(${dx * 20}deg) scale(1.05)`;
            };

            card.onmouseleave = () => {
                inner.style.transition = 'transform 0.5s ease';
                inner.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)';
            };

            card.onmouseenter = () => {
                inner.style.transition = 'transform 0.1s ease';
            };
        });
    }

    // --- GESTION DROPDOWN ---
    function setupDropdown() {
        const dropBtns = document.querySelectorAll('.dropbtn');
        
        dropBtns.forEach(dropBtn => {
            const dropdown = dropBtn.closest('.dropdown');
            if (!dropdown) return;

            dropBtn.onclick = (e) => {
                e.preventDefault();
                // Fermer les autres dropdowns si nécessaire (optionnel, mais propre)
                document.querySelectorAll('.dropdown').forEach(d => {
                    if (d !== dropdown) {
                        d.classList.remove('active');
                        const btn = d.querySelector('.dropbtn');
                        if (btn) btn.setAttribute('aria-expanded', 'false');
                    }
                });
                const open = dropdown.classList.toggle('active');
                dropBtn.setAttribute('aria-expanded', open);
            };
        });
    }

    // Initialisation globale
    function init() {
        setupMenu();
        setupTilt();
        setupDropdown();
    }

    // Exposer pour le SPA
    window.reinitUI = init;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
