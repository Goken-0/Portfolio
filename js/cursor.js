/**
 * ============================================
 * CURSEUR PERSONNALISÉ - DÉSACTIVÉ
 * ============================================
 */
(function disableCustomCursor() {
    // Supprime les éléments du curseur s'ils existent
    const cursor = document.querySelector('.custom-cursor');
    const dot = document.querySelector('.custom-cursor-dot');
    if (cursor) cursor.remove();
    if (dot) dot.remove();

    console.log('🚫 Curseur personnalisé désactivé - Retour au curseur système');
})();
