/**
 * ============================================
 * GESTION DU FOOTER AU SCROLL
 * ============================================
 * 
 * Ce script cache le footer lors du défilement vers le bas
 * et le réaffiche lors du défilement vers le haut ou en bas de page.
 * 
 * Utile pour ne pas gêner la lecture sur mobile.
 */

// AbortController pour pouvoir annuler les écouteurs lors de la réinitialisation
let _footerScrollAbortController = null;

/**
 * Initialise la gestion du footer au scroll
 * Peut être appelé plusieurs fois (lors de la navigation SPA)
 */
window.initFooterScroll = function () {
    // Annuler les anciens écouteurs
    if (_footerScrollAbortController) {
        _footerScrollAbortController.abort();
    }
    _footerScrollAbortController = new AbortController();
    const signal = _footerScrollAbortController.signal;

    const footer = document.querySelector('.credit');
    
    // Si le footer n'existe pas, on ne fait rien
    if (!footer) return;
    
    let lastScrollTop = 0;
    let scrollTimeout;
    const scrollThreshold = 10; // Seuil de défilement en pixels
    const hideDelay = 300; // Délai avant de cacher (ms)
    
    /**
     * Vérifie si on est en bas de page
     */
    function isAtBottom() {
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // On considère qu'on est en bas si on est à moins de 100px du bas
        return (windowHeight + scrollTop) >= (documentHeight - 100);
    }
    
    /**
     * Gère l'affichage/masquage du footer selon le scroll
     */
    function handleScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollDifference = Math.abs(scrollTop - lastScrollTop);
        
        // Si le défilement est trop petit, on ignore
        if (scrollDifference < scrollThreshold) {
            return;
        }
        
        // Annuler le timeout précédent
        clearTimeout(scrollTimeout);
        
        // Si on est en bas de page, toujours afficher le footer
        if (isAtBottom()) {
            footer.classList.remove('hidden');
            lastScrollTop = scrollTop;
            return;
        }
        
        // Si on scroll vers le bas, cacher le footer
        if (scrollTop > lastScrollTop) {
            scrollTimeout = setTimeout(() => {
                footer.classList.add('hidden');
            }, hideDelay);
        } 
        // Si on scroll vers le haut, afficher le footer
        else if (scrollTop < lastScrollTop) {
            footer.classList.remove('hidden');
        }
        
        lastScrollTop = scrollTop;
    }
    
    // Écouter l'événement de scroll avec throttling pour les performances
    let ticking = false;
    window.addEventListener('scroll', function () {
        if (!ticking) {
            window.requestAnimationFrame(function () {
                handleScroll();
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true, signal });
    
    // Au chargement de la page, vérifier si on est déjà en bas
    if (isAtBottom()) {
        footer.classList.remove('hidden');
    }
    
    console.log('📱 Gestion du footer au scroll activée');
};

// Initialiser au chargement de la page
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.initFooterScroll);
} else {
    window.initFooterScroll();
}

