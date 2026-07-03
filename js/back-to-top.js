/**
 * ============================================
 * BOUTON RETOUR EN HAUT
 * ============================================
 * Apparaît après 600px de scroll, remonte en douceur.
 */

(function () {
    'use strict';

    const btn = document.getElementById('backToTop');
    if (!btn) return;

    let ticking = false;
    window.addEventListener('scroll', () => {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(() => {
            btn.classList.toggle('visible', window.scrollY > 600);
            ticking = false;
        });
    }, { passive: true });

    btn.addEventListener('click', () => {
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
    });
})();
