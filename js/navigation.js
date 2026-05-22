/**
 * ============================================
 * GESTION DE LA NAVIGATION ACTIVE
 * ============================================
 * 
 * Ce script met automatiquement en surbrillance le lien de navigation
 * correspondant à la page actuelle.
 * 
 * Par exemple, si vous êtes sur la page "cv.html",
 * le lien "CV" dans le menu sera automatiquement mis en surbrillance.
 */

(function() {
    'use strict';

    /**
     * Fonction qui met à jour le lien actif dans le menu
     * Accessible globalement via window.updateActiveNavLink()
     */
    window.updateActiveNavLink = function updateActiveNavLink() {
        // On récupère le chemin de la page actuelle
        // Par exemple : "/Portfolio/cv.html" ou juste "cv.html"
        const currentPath = window.location.pathname;
        
        // On extrait juste le nom du fichier (la dernière partie après le "/")
        let currentPage = currentPath.split('/').pop();
        
        // Si on est sur la page d'accueil (racine du site)
        // Le nom de fichier peut être vide ou "index.html"
        if (!currentPage || currentPage === '' || currentPage === 'index.html') {
            currentPage = 'index.html';
        }
        
        // On retire la classe "active" de tous les liens de navigation
        // (pour repartir à zéro)
        const allNavLinks = document.querySelectorAll('nav a[href], .dropdown-content a[href]');
        allNavLinks.forEach(link => {
            link.classList.remove('active');
        });
        
        // On cherche dans les liens principaux du menu
        const navLinks = document.querySelectorAll('nav > a[href]');
        navLinks.forEach(link => {
            // On récupère le lien href (ex: "cv.html")
            const linkHref = link.getAttribute('href');
            if (!linkHref) return;
            
            // On extrait juste le nom du fichier (sans les paramètres éventuels)
            const linkPage = linkHref.split('/').pop().split('?')[0];
            
            // Si le nom du fichier correspond à la page actuelle, on active le lien
            if (linkPage === currentPage) {
                link.classList.add('active');
            }
        });
        
        // On gère aussi les liens dans les menus déroulants (Parcours, Réalisations, etc.)
        const dropdownLinks = document.querySelectorAll('.dropdown-content a[href]');
        let foundInDropdown = false;
        
        dropdownLinks.forEach(link => {
            const linkHref = link.getAttribute('href');
            if (!linkHref) return;
            
            const linkPage = linkHref.split('/').pop().split('?')[0];
            
            // Si on trouve la page dans le dropdown
            if (linkPage === currentPage) {
                // On active le lien dans le dropdown
                link.classList.add('active');
                foundInDropdown = true;
                
                // On active aussi le bouton parent pour indiquer qu'une sous-page est active
                const parentDropdown = link.closest('.dropdown');
                if (parentDropdown) {
                    const dropbtn = parentDropdown.querySelector('.dropbtn');
                    if (dropbtn) {
                        dropbtn.classList.add('active');
                    }
                }
            }
        });
        
        // Si on n'a pas trouvé de correspondance, on essaie une recherche plus large
        // (au cas où le chemin serait différent)
        if (!foundInDropdown && currentPage) {
            const fullPath = window.location.pathname;
            allNavLinks.forEach(link => {
                const linkHref = link.getAttribute('href');
                if (linkHref && (fullPath.includes(linkHref) || linkHref.includes(currentPage))) {
                    link.classList.add('active');
                }
            });
        }
    }

    // On exécute la fonction dès que la page est chargée
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', window.updateActiveNavLink);
    } else {
        window.updateActiveNavLink();
    }
})();
