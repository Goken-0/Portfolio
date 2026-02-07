/**
 * ============================================
 * MENU HAMBURGER POUR MOBILE
 * ============================================
 * 
 * Ce script gère le menu hamburger (les trois lignes) qui apparaît sur mobile.
 * Quand on clique dessus, le menu de navigation s'ouvre en plein écran.
 * 
 * Fonctionnalités :
 * - Création automatique du bouton hamburger
 * - Ouverture/fermeture du menu
 * - Fermeture en cliquant ailleurs, sur Échap, ou en swipant
 * - Support tactile (vibration sur mobile)
 * - Gestion du dropdown "Réalisations" (mobile et desktop)
 * 
 * Compatible SPA : peut être réinitialisé via window.initMenu()
 */

// AbortController pour pouvoir annuler les écouteurs lors de la réinitialisation
let _menuAbortController = null;

/**
 * Initialise le menu hamburger et les dropdowns
 * Peut être appelé plusieurs fois (lors de la navigation SPA)
 */
window.initMenu = function () {
    // Annuler les anciens écouteurs d'événements
    if (_menuAbortController) {
        _menuAbortController.abort();
    }
    _menuAbortController = new AbortController();
    const signal = _menuAbortController.signal;

    // Supprimer l'ancien hamburger et overlay s'ils existent
    const oldHamburger = document.querySelector('.hamburger-menu');
    if (oldHamburger) oldHamburger.remove();
    const oldOverlay = document.querySelector('.menu-overlay');
    if (oldOverlay) oldOverlay.remove();

    // On récupère le header et la navigation
    const header = document.querySelector('header');
    const nav = document.querySelector('nav');
    if (!header || !nav) return;

    // =====================
    // MENU HAMBURGER MOBILE
    // =====================

    // On crée le bouton hamburger (les trois lignes)
    const hamburgerBtn = document.createElement('button');
    hamburgerBtn.className = 'hamburger-menu';
    hamburgerBtn.setAttribute('aria-label', 'Menu de navigation');
    hamburgerBtn.setAttribute('aria-expanded', 'false');

    hamburgerBtn.innerHTML = `
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
    `;

    // On crée un overlay (fond sombre) qui apparaît quand le menu est ouvert
    const overlay = document.createElement('div');
    overlay.className = 'menu-overlay';
    document.body.appendChild(overlay);

    // On insère le bouton hamburger dans le header, juste avant le menu
    header.insertBefore(hamburgerBtn, nav);

    // Variable qui indique si le menu est ouvert ou fermé
    let isMenuOpen = false;

    /**
     * Fonction qui ouvre ou ferme le menu
     */
    function toggleMenu() {
        isMenuOpen = !isMenuOpen;

        hamburgerBtn.classList.toggle('active', isMenuOpen);
        nav.classList.toggle('active', isMenuOpen);
        overlay.classList.toggle('active', isMenuOpen);

        if (window.innerWidth <= 995) {
            document.body.style.overflow = isMenuOpen ? 'hidden' : 'auto';
        }

        hamburgerBtn.setAttribute('aria-expanded', isMenuOpen);

        if ('vibrate' in navigator && window.innerWidth <= 995) {
            navigator.vibrate(50);
        }
    }

    // Quand on clique sur le bouton hamburger
    hamburgerBtn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        toggleMenu();
    }, { signal });

    // Quand on clique sur un lien du menu (sauf le bouton Réalisations)
    const navLinks = nav.querySelectorAll('a:not(.dropbtn)');
    navLinks.forEach(link => {
        link.addEventListener('click', function () {
            if (window.innerWidth <= 995 && isMenuOpen && !link.closest('.dropdown-content')) {
                toggleMenu();
            }
        }, { signal });
    });

    // Quand on clique sur l'overlay
    overlay.addEventListener('click', function () {
        if (isMenuOpen) {
            toggleMenu();
        }
    }, { signal });

    // Quand on appuie sur Échap
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && isMenuOpen) {
            toggleMenu();
        }
    }, { signal });

    // Si on redimensionne la fenêtre et qu'on passe en mode desktop
    window.addEventListener('resize', function () {
        if (window.innerWidth > 995 && isMenuOpen) {
            hamburgerBtn.classList.remove('active');
            nav.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = 'auto';
            isMenuOpen = false;
            hamburgerBtn.setAttribute('aria-expanded', 'false');
        }
    }, { signal });

    // Support des gestes tactiles (swipe)
    let touchStartY = 0;
    let touchEndY = 0;

    nav.addEventListener('touchstart', function (e) {
        touchStartY = e.changedTouches[0].screenY;
    }, { passive: true, signal });

    nav.addEventListener('touchend', function (e) {
        touchEndY = e.changedTouches[0].screenY;
        const swipeDistance = touchStartY - touchEndY;

        if (swipeDistance > 80 && isMenuOpen && window.innerWidth <= 995) {
            toggleMenu();
        }
    }, { passive: true, signal });

    // =====================
    // GESTION DU DROPDOWN "RÉALISATIONS"
    // =====================

    const dropdown = document.querySelector('.dropdown');
    const dropBtn = document.querySelector('.dropbtn');
    const dropContent = document.querySelector('.dropdown-content');

    if (dropdown && dropBtn && dropContent) {
        // Clic sur le bouton "Réalisations"
        dropBtn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();

            // Mobile : toggle la classe active sur le dropdown
            if (window.innerWidth <= 995) {
                dropdown.classList.toggle('active');
            }

            // Desktop : toggle la classe show sur le contenu
            dropContent.classList.toggle('show');
            dropBtn.classList.toggle('active');
        }, { signal });

        // Quand on clique sur un lien dans le dropdown, fermer le menu mobile
        const dropdownLinks = dropContent.querySelectorAll('a');
        dropdownLinks.forEach(link => {
            link.addEventListener('click', function () {
                if (window.innerWidth <= 995) {
                    if (nav && hamburgerBtn && nav.classList.contains('active')) {
                        hamburgerBtn.classList.remove('active');
                        nav.classList.remove('active');
                        overlay.classList.remove('active');
                        document.body.style.overflow = 'auto';
                        isMenuOpen = false;
                    }
                }
            }, { signal });
        });

        // Fermer le dropdown quand on clique ailleurs
        document.addEventListener('click', function (e) {
            if (!dropContent.contains(e.target) && !dropBtn.contains(e.target)) {
                dropContent.classList.remove('show');
                dropBtn.classList.remove('active');
            }
        }, { signal });
    }

    console.log('🍔 Menu hamburger initialisé avec succès !');
};

// Initialiser au chargement de la page
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.initMenu);
} else {
    window.initMenu();
}
