// =====================
// MENU HAMBURGER MOBILE
// =====================

document.addEventListener('DOMContentLoaded', function () {
    // Créer le bouton hamburger
    const header = document.querySelector('header');
    const nav = document.querySelector('nav');

    // Créer le bouton hamburger
    const hamburgerBtn = document.createElement('button');
    hamburgerBtn.className = 'hamburger-menu';
    hamburgerBtn.setAttribute('aria-label', 'Menu de navigation');
    hamburgerBtn.setAttribute('aria-expanded', 'false');
    hamburgerBtn.innerHTML = `
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
    `;

    // Créer l'overlay
    const overlay = document.createElement('div');
    overlay.className = 'menu-overlay';
    document.body.appendChild(overlay);

    // Insérer le bouton avant la nav
    header.insertBefore(hamburgerBtn, nav);

    // Variables de contrôle
    let isMenuOpen = false;

    // Fonction pour ouvrir/fermer le menu
    function toggleMenu() {
        isMenuOpen = !isMenuOpen;

        // Toggle des classes
        hamburgerBtn.classList.toggle('active', isMenuOpen);
        nav.classList.toggle('active', isMenuOpen);
        overlay.classList.toggle('active', isMenuOpen);

        // Prévenir le scroll du body sur mobile
        if (window.innerWidth <= 995) {
            document.body.style.overflow = isMenuOpen ? 'hidden' : 'auto';
        }

        // Accessibilité
        hamburgerBtn.setAttribute('aria-expanded', isMenuOpen);

        // Feedback tactile sur mobile
        if ('vibrate' in navigator && window.innerWidth <= 995) {
            navigator.vibrate(50);
        }
    }

    // Event listener sur le bouton hamburger
    hamburgerBtn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        toggleMenu();
    });

    // Fermer le menu en cliquant sur un lien
    const navLinks = nav.querySelectorAll('a');
    navLinks.forEach(link => {
        link.addEventListener('click', function () {
            if (window.innerWidth <= 995 && isMenuOpen) {
                toggleMenu();
            }
        });
    });

    // Fermer le menu en cliquant sur l'overlay
    overlay.addEventListener('click', function () {
        if (isMenuOpen) {
            toggleMenu();
        }
    });

    // Fermer le menu en cliquant en dehors (mobile)
    document.addEventListener('click', function (e) {
        if (window.innerWidth <= 995 &&
            isMenuOpen &&
            !hamburgerBtn.contains(e.target) &&
            !nav.contains(e.target)) {
            toggleMenu();
        }
    });

    // Fermer avec la touche Échap
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && isMenuOpen) {
            toggleMenu();
        }
    });

    // Gérer le redimensionnement
    window.addEventListener('resize', function () {
        if (window.innerWidth > 995 && isMenuOpen) {
            hamburgerBtn.classList.remove('active');
            nav.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = 'auto';
            isMenuOpen = false;
            hamburgerBtn.setAttribute('aria-expanded', 'false');
        }
    });

    // Support des gestes tactiles
    let touchStartY = 0;
    let touchEndY = 0;

    nav.addEventListener('touchstart', function (e) {
        touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    nav.addEventListener('touchend', function (e) {
        touchEndY = e.changedTouches[0].screenY;
        const swipeDistance = touchStartY - touchEndY;

        // Swipe vers le haut pour fermer (minimum 80px)
        if (swipeDistance > 80 && isMenuOpen && window.innerWidth <= 995) {
            toggleMenu();
        }
    }, { passive: true });

    console.log('🍔 Menu hamburger initialisé avec succès !');
});

// Gestion du dropdown sur mobile
document.addEventListener('DOMContentLoaded', () => {
    const dropdown = document.querySelector('.dropdown');

    if (window.innerWidth <= 995 && dropdown) {
        dropdown.addEventListener('click', (e) => {
            if (e.target.tagName === 'A' && e.target.parentElement.classList.contains('dropdown')) {
                e.preventDefault();
                dropdown.classList.toggle('active');
            }
        });
    }
});