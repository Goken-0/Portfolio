/**
 * ============================================
 * SIDEBAR NAVIGATION & TILT - MENU.JS
 * ============================================
 */

(function() {
    'use strict';

    // Resynchronise le libellé du hamburger, réassignée par setupMenu()
    let syncMenuLabel = function () {};

    // --- MENU HAMBURGER MOBILE ---
    function setupMenu() {
        const toggle = document.querySelector('.hamburger-toggle');
        const sidebar = document.querySelector('header');
        const overlay = document.querySelector('.sidebar-overlay');

        if (!toggle || !sidebar) return;

        // Le libellé du hamburger dépend de son état ouvert/fermé : il est donc
        // géré ici plutôt que par un data-i18n statique, et resynchronisé à
        // chaque changement de langue.
        function t(key, french) {
            return (window.i18n && window.i18n.t) ? window.i18n.t(key, french) : french;
        }

        function syncToggleLabel() {
            const open = toggle.classList.contains('active');
            toggle.setAttribute(
                'aria-label',
                open ? t('ui.closeMenu', 'Fermer le menu') : t('ui.openMenu', 'Ouvrir le menu')
            );
        }

        function toggleMenu() {
            const open = toggle.classList.toggle('active');
            sidebar.classList.toggle('sidebar-open');
            if (overlay) overlay.classList.toggle('active');
            toggle.setAttribute('aria-expanded', open);
            syncToggleLabel();
        }

        // setupMenu() est rejoué à chaque navigation SPA : on expose la
        // resynchronisation plutôt que d'empiler un écouteur à chaque appel
        // (l'écouteur unique est branché tout en bas du fichier).
        syncMenuLabel = syncToggleLabel;
        syncToggleLabel();

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

    // Écouteur unique : le libellé du hamburger dépend de l'état d'ouverture,
    // il ne peut pas être piloté par un simple data-i18n statique.
    document.addEventListener('i18n:changed', function () {
        syncMenuLabel();
    });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
