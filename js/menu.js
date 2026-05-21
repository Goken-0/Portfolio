/**
 * ============================================
 * SIDEBAR NAVIGATION - MENU.JS
 * ============================================
 * Gère l'ouverture/fermeture de la sidebar sur mobile
 * et le dropdown "Réalisations".
 * Compatible SPA : réinitialisable via window.initMenu()
 */

let _menuAbortController = null;

window.initMenu = function () {
    if (_menuAbortController) _menuAbortController.abort();
    _menuAbortController = new AbortController();
    const signal = _menuAbortController.signal;

    const header  = document.querySelector('header');
    const nav     = document.querySelector('nav');
    if (!header || !nav) return;

    // ----- Créer le bouton hamburger -----
    const oldToggle  = document.querySelector('.hamburger-toggle');
    const oldOverlay = document.querySelector('.sidebar-overlay');
    if (oldToggle)  oldToggle.remove();
    if (oldOverlay) oldOverlay.remove();

    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'hamburger-toggle';
    toggleBtn.id = 'hamburgerToggle';
    toggleBtn.setAttribute('aria-label', 'Ouvrir le menu');
    toggleBtn.setAttribute('aria-expanded', 'false');
    toggleBtn.innerHTML = '<span></span><span></span><span></span>';
    document.body.appendChild(toggleBtn);

    // ----- Créer l'overlay -----
    const overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    document.body.appendChild(overlay);

    let isOpen = false;

    function openSidebar() {
        isOpen = true;
        header.classList.add('sidebar-open');
        toggleBtn.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        toggleBtn.setAttribute('aria-expanded', 'true');
        if ('vibrate' in navigator) navigator.vibrate(40);
    }

    function closeSidebar() {
        isOpen = false;
        header.classList.remove('sidebar-open');
        toggleBtn.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
        toggleBtn.setAttribute('aria-expanded', 'false');
    }

    function toggleSidebar() {
        isOpen ? closeSidebar() : openSidebar();
    }

    // Bouton hamburger
    toggleBtn.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        toggleSidebar();
    }, { signal });

    // Bouton close dans la sidebar
    const closeBtn = header.querySelector('.sidebar-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeSidebar, { signal });
    }

    // Overlay
    overlay.addEventListener('click', closeSidebar, { signal });

    // Touche Échap
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && isOpen) closeSidebar();
    }, { signal });

    // Fermer si on dépasse le breakpoint
    window.addEventListener('resize', () => {
        if (window.innerWidth > 995 && isOpen) closeSidebar();
    }, { signal });

    // Fermer quand on clique un lien de nav (sauf dropbtn)
    nav.querySelectorAll('a:not(.dropbtn)').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 995 && isOpen) closeSidebar();
        }, { signal });
    });

    // Support swipe left pour fermer
    let touchStartX = 0;
    header.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true, signal });
    header.addEventListener('touchend', e => {
        const dx = touchStartX - e.changedTouches[0].screenX;
        if (dx > 70 && isOpen) closeSidebar();
    }, { passive: true, signal });

    // ----- DROPDOWN "RÉALISATIONS" -----
    const dropdown   = document.querySelector('.dropdown');
    const dropBtn    = document.querySelector('.dropbtn');
    const dropContent = document.querySelector('.dropdown-content');

    if (dropdown && dropBtn && dropContent) {
        dropBtn.addEventListener('click', e => {
            e.preventDefault();
            e.stopPropagation();
            dropdown.classList.toggle('active');
            dropContent.classList.toggle('show');
            dropBtn.classList.toggle('active');
        }, { signal });

        // Fermer dropdown si clic extérieur (desktop)
        document.addEventListener('click', e => {
            if (!dropdown.contains(e.target)) {
                dropdown.classList.remove('active');
                dropContent.classList.remove('show');
                dropBtn.classList.remove('active');
            }
        }, { signal });

        // Fermer la sidebar après clic sur un lien du dropdown
        dropContent.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 995 && isOpen) closeSidebar();
                dropdown.classList.remove('active');
                dropContent.classList.remove('show');
                dropBtn.classList.remove('active');
            }, { signal });
        });
    }

    console.log('🗂️ Sidebar initialisée');
};

// Init au chargement
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.initMenu);
} else {
    window.initMenu();
}

// ============================================
// PROFILE CARD 3D TILT EFFECT
// ============================================
(function initProfileTilt() {
    function setup() {
        const cards = document.querySelectorAll('.profile-card');
        if (cards.length === 0) return;
        
        cards.forEach(card => {
            const inner = card.querySelector('.profile-card-inner');
            if (!inner) return;

            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const cx = rect.left + rect.width / 2;
                const cy = rect.top + rect.height / 2;
                const dx = (e.clientX - cx) / (rect.width / 2);
                const dy = (e.clientY - cy) / (rect.height / 2);
                const rotX = -dy * 22;
                const rotY = dx * 22;
                inner.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.06)`;
            });

            card.addEventListener('mouseleave', () => {
                inner.style.transition = 'transform 0.5s ease';
                inner.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)';
                setTimeout(() => { inner.style.transition = 'transform 0.1s ease, box-shadow 0.3s ease'; }, 500);
            });

            card.addEventListener('mouseenter', () => {
                inner.style.transition = 'transform 0.1s ease, box-shadow 0.3s ease';
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setup);
    } else {
        setup();
    }

    // Re-init for SPA
    window._initProfileTilt = setup;
})();
