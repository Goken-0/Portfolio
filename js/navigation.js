/**
 * ============================================
 * GESTION DE LA NAVIGATION ACTIVE (HASH BASED)
 * ============================================
 */

(function() {
    'use strict';

    window.updateActiveNavLink = function updateActiveNavLink() {
        const currentHash = window.location.hash || '#accueil';
        
        // Retirer la classe active de tous les liens
        const allLinks = document.querySelectorAll('nav a, .dropdown-content a');
        allLinks.forEach(link => {
            link.classList.remove('active');
            // Gérer les parents dropdown
            const parentDropdown = link.closest('.dropdown');
            if (parentDropdown) {
                const dropbtn = parentDropdown.querySelector('.dropbtn');
                if (dropbtn) dropbtn.classList.remove('active');
            }
        });
        
        // Activer les liens correspondants au hash
        allLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentHash) {
                link.classList.add('active');
                
                // Activer aussi le bouton parent si c'est dans un dropdown
                const parentDropdown = link.closest('.dropdown');
                if (parentDropdown) {
                    const dropbtn = parentDropdown.querySelector('.dropbtn');
                    if (dropbtn) dropbtn.classList.add('active');
                }
            }
        });
    }

    window.addEventListener('hashchange', window.updateActiveNavLink);
    window.addEventListener('load', window.updateActiveNavLink);
})();
