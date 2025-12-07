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
 */

// =====================
// MENU HAMBURGER MOBILE
// =====================

// On attend que la page soit chargée avant de faire quoi que ce soit
document.addEventListener('DOMContentLoaded', function () {
    // On récupère le header et la navigation
    const header = document.querySelector('header');
    const nav = document.querySelector('nav');

    // On crée le bouton hamburger (les trois lignes)
    const hamburgerBtn = document.createElement('button');
    hamburgerBtn.className = 'hamburger-menu';
    hamburgerBtn.setAttribute('aria-label', 'Menu de navigation');  // Pour l'accessibilité
    hamburgerBtn.setAttribute('aria-expanded', 'false');             // Le menu est fermé au départ
    
    // On ajoute les trois lignes du hamburger
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
        // On inverse l'état : si c'était ouvert, ça devient fermé, et vice versa
        isMenuOpen = !isMenuOpen;

        // On ajoute ou retire les classes CSS pour l'animation
        hamburgerBtn.classList.toggle('active', isMenuOpen);      // Le bouton devient une croix
        nav.classList.toggle('active', isMenuOpen);                // Le menu s'affiche
        overlay.classList.toggle('active', isMenuOpen);              // L'overlay apparaît

        // Sur mobile, on empêche de scroller la page quand le menu est ouvert
        if (window.innerWidth <= 995) {
            document.body.style.overflow = isMenuOpen ? 'hidden' : 'auto';
        }

        // On met à jour l'attribut d'accessibilité
        hamburgerBtn.setAttribute('aria-expanded', isMenuOpen);

        // Sur mobile, on fait vibrer légèrement le téléphone
        // (pour donner un feedback tactile à l'utilisateur)
        if ('vibrate' in navigator && window.innerWidth <= 995) {
            navigator.vibrate(50);  // 50 millisecondes de vibration
        }
    }

    // Quand on clique sur le bouton hamburger, on ouvre/ferme le menu
    hamburgerBtn.addEventListener('click', function (e) {
        e.preventDefault();      // On empêche le comportement par défaut
        e.stopPropagation();     // On empêche l'événement de remonter
        toggleMenu();
    });

    // Quand on clique sur un lien du menu, on ferme le menu automatiquement
    // MAIS on exclut le bouton "Réalisations" (dropbtn) car il doit ouvrir le dropdown
    const navLinks = nav.querySelectorAll('a:not(.dropbtn)');
    navLinks.forEach(link => {
        link.addEventListener('click', function () {
            // On ferme seulement sur mobile et si ce n'est pas un lien du dropdown
            if (window.innerWidth <= 995 && isMenuOpen && !link.closest('.dropdown-content')) {
                toggleMenu();
            }
        });
    });

    // Quand on clique sur l'overlay (le fond sombre), on ferme le menu
    overlay.addEventListener('click', function () {
        if (isMenuOpen) {
            toggleMenu();
        }
    });

    // Quand on clique ailleurs sur la page (pas sur le menu), on ferme le menu
    document.addEventListener('click', function (e) {
        // On vérifie qu'on est sur mobile, que le menu est ouvert,
        // et qu'on n'a pas cliqué sur le bouton, le menu, ou le dropdown
        const dropdown = document.querySelector('.dropdown');
        const isClickOnDropdown = dropdown && dropdown.contains(e.target);
        
        if (window.innerWidth <= 995 &&
            isMenuOpen &&
            !hamburgerBtn.contains(e.target) &&
            !nav.contains(e.target) &&
            !isClickOnDropdown) {
            toggleMenu();
        }
    });

    // Quand on appuie sur la touche Échap, on ferme le menu
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && isMenuOpen) {
            toggleMenu();
        }
    });

    // Si on redimensionne la fenêtre et qu'on passe en mode desktop,
    // on ferme automatiquement le menu
    window.addEventListener('resize', function () {
        if (window.innerWidth > 995 && isMenuOpen) {
            // On retire toutes les classes actives
            hamburgerBtn.classList.remove('active');
            nav.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = 'auto';
            isMenuOpen = false;
            hamburgerBtn.setAttribute('aria-expanded', 'false');
        }
    });

    // Support des gestes tactiles (swipe)
    // On peut fermer le menu en swipant vers le haut
    let touchStartY = 0;  // Position Y du doigt au début du touch
    let touchEndY = 0;     // Position Y du doigt à la fin du touch

    // Quand on pose le doigt sur l'écran
    nav.addEventListener('touchstart', function (e) {
        touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    // Quand on retire le doigt de l'écran
    nav.addEventListener('touchend', function (e) {
        touchEndY = e.changedTouches[0].screenY;
        
        // On calcule la distance du swipe
        const swipeDistance = touchStartY - touchEndY;

        // Si on a swipé vers le haut d'au moins 80 pixels, on ferme le menu
        if (swipeDistance > 80 && isMenuOpen && window.innerWidth <= 995) {
            toggleMenu();
        }
    }, { passive: true });

    console.log('🍔 Menu hamburger initialisé avec succès !');
});

// =====================
// GESTION DU DROPDOWN SUR MOBILE
// =====================

// Gestion spéciale du menu déroulant "Réalisations" sur mobile
document.addEventListener('DOMContentLoaded', () => {
    const dropdown = document.querySelector('.dropdown');
    const dropBtn = document.querySelector('.dropbtn');
    const dropContent = document.querySelector('.dropdown-content');

    // Sur mobile uniquement
    if (window.innerWidth <= 995 && dropdown && dropBtn && dropContent) {
        // Quand on clique sur le bouton "Réalisations"
        dropBtn.addEventListener('click', function (e) {
            e.preventDefault(); // Empêche le lien de naviguer
            e.stopPropagation(); // Empêche la fermeture du menu hamburger
            // On ouvre/ferme le dropdown
            dropdown.classList.toggle('active');
        });

        // Quand on clique sur un lien dans le contenu du dropdown
        const dropdownLinks = dropContent.querySelectorAll('a');
        dropdownLinks.forEach(link => {
            link.addEventListener('click', function () {
                // On ferme le menu hamburger quand on clique sur un lien du dropdown
                // (car on va naviguer vers une autre page)
                if (window.innerWidth <= 995) {
                    const nav = document.querySelector('nav');
                    const hamburgerBtn = document.querySelector('.hamburger-menu');
                    if (nav && hamburgerBtn && nav.classList.contains('active')) {
                        hamburgerBtn.classList.remove('active');
                        nav.classList.remove('active');
                        document.querySelector('.menu-overlay')?.classList.remove('active');
                        document.body.style.overflow = 'auto';
                    }
                }
            });
        });
    }
});

// =====================
// GESTION DU DROPDOWN "RÉALISATIONS"
// =====================

// Gestion du menu déroulant "Réalisations" sur desktop
document.addEventListener("DOMContentLoaded", function () {
    // On récupère le bouton "Réalisations" et le menu déroulant
    const dropBtn = document.querySelector('.dropbtn');
    const dropContent = document.querySelector('.dropdown-content');

    if (dropBtn && dropContent) {
        // Quand on clique sur "Réalisations"
        dropBtn.addEventListener('click', function (e) {
            e.preventDefault();      // On empêche le lien de remonter en haut de page
            e.stopPropagation();     // On empêche l'événement de se propager

            // On ouvre ou ferme le menu déroulant
            dropContent.classList.toggle('show');
            // On change aussi l'apparence du bouton (couleur active)
            dropBtn.classList.toggle('active');
        });

        // Quand on clique ailleurs sur la page, on ferme le menu déroulant
        document.addEventListener('click', function (e) {
            // Si on n'a pas cliqué sur le menu ou le bouton
            if (!dropContent.contains(e.target) && !dropBtn.contains(e.target)) {
                dropContent.classList.remove('show');
                dropBtn.classList.remove('active');
            }
        });
    }
});
