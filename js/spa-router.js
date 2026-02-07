/**
 * ============================================
 * ROUTEUR SPA (SINGLE PAGE APPLICATION)
 * ============================================
 * 
 * Ce script intercepte les clics sur les liens internes du site
 * et charge les pages sans rechargement complet.
 * 
 * Cela permet de garder le lecteur de musique en lecture continue
 * sans interruption lors de la navigation entre les pages.
 * 
 * Éléments préservés entre les pages :
 * - L'élément <audio> (musique en cours de lecture)
 * - Le lecteur de musique (interface utilisateur)
 * - Le fond animé Three.js (canvas étoiles)
 */

(function () {
    'use strict';

    // Liste des scripts qui ne doivent PAS être rechargés lors de la navigation
    // (ils sont déjà en mémoire et fonctionnent en continu)
    var PERSISTENT_SCRIPTS = [
        'three.min.js',
        'jquery',
        'stars.js',
        'menu.js',
        'music-player.js',
        'inject-music-player.js',
        'navigation.js',
        'footer-scroll.js',
        'spa-router.js'
    ];

    // Pages exclues du routeur SPA (nécessitent un chargement complet)
    var EXCLUDED_PAGES = [
        'spaceinvader.html'
    ];

    /**
     * Vérifie si un lien doit être intercepté par le routeur SPA
     * @param {HTMLAnchorElement} anchor - Le lien cliqué
     * @returns {boolean} - true si le lien doit être intercepté
     */
    function shouldIntercept(anchor) {
        // Ignorer les liens sans href
        if (!anchor.href) return false;

        // Ignorer les liens avec target="_blank"
        if (anchor.target === '_blank') return false;

        // Ignorer les liens avec l'attribut download
        if (anchor.hasAttribute('download')) return false;

        // Ignorer les liens externes (domaine différent)
        try {
            if (new URL(anchor.href).origin !== window.location.origin) return false;
        } catch (e) {
            return false;
        }

        // Ignorer les liens vers des ancres uniquement (#)
        var href = anchor.getAttribute('href');
        if (!href || href === '#' || href.startsWith('#')) return false;

        // Ignorer les liens qui ne pointent pas vers des fichiers .html
        if (!href.endsWith('.html')) return false;

        // Ignorer les pages exclues
        var page = href.split('/').pop();
        if (EXCLUDED_PAGES.indexOf(page) !== -1) return false;

        return true;
    }

    /**
     * Charge un script externe de manière asynchrone
     * @param {string} src - Chemin vers le script
     * @returns {Promise} - Promesse résolue quand le script est chargé
     */
    function loadScript(src) {
        return new Promise(function (resolve, reject) {
            // Supprimer l'ancien script s'il existe (pour forcer la réexécution)
            var existing = document.querySelector('script[data-spa-loaded="' + src + '"]');
            if (existing) existing.remove();

            var script = document.createElement('script');
            script.src = src;
            script.setAttribute('data-spa-loaded', src);
            script.onload = resolve;
            script.onerror = function () {
                console.error('Erreur chargement script:', src);
                resolve(); // On continue même en cas d'erreur
            };
            document.body.appendChild(script);
        });
    }

    /**
     * Charge une nouvelle page via fetch et remplace le contenu
     * sans recharger la page entière
     * 
     * @param {string} url - URL de la page à charger
     * @param {boolean} pushState - Si true, ajoute l'URL à l'historique
     */
    async function navigateTo(url, pushState) {
        if (pushState === undefined) pushState = true;

        // Ne pas recharger si on est déjà sur cette page
        var currentNorm = window.location.href.split('#')[0].split('?')[0];
        var targetNorm = new URL(url, window.location.href).href.split('#')[0].split('?')[0];
        if (currentNorm === targetNorm) return;

        try {
            // Sauvegarder l'état du lecteur avant la navigation
            if (window.musicPlayerInstance) {
                window.musicPlayerInstance.saveState();
            }

            // Récupérer la nouvelle page
            var response = await fetch(url);
            if (!response.ok) {
                // En cas d'erreur HTTP, navigation classique
                window.location.href = url;
                return;
            }

            var html = await response.text();
            var parser = new DOMParser();
            var doc = parser.parseFromString(html, 'text/html');

            // ==========================================
            // 1. Sauvegarder les éléments persistants
            // ==========================================
            var canvas = document.querySelector('canvas.background');
            var audio = document.getElementById('audioPlayer');
            var musicPlayer = document.getElementById('musicPlayer');

            // Les retirer temporairement du DOM pour les préserver
            if (canvas) canvas.remove();
            if (audio) audio.remove();
            if (musicPlayer) musicPlayer.remove();

            // ==========================================
            // 2. Collecter les scripts de la nouvelle page
            // ==========================================
            var pageScripts = [];
            var inlineScripts = [];

            var scripts = doc.body.querySelectorAll('script');
            for (var i = 0; i < scripts.length; i++) {
                var script = scripts[i];
                if (script.src) {
                    var src = script.getAttribute('src');
                    var isPersistent = false;
                    for (var j = 0; j < PERSISTENT_SCRIPTS.length; j++) {
                        if (src.indexOf(PERSISTENT_SCRIPTS[j]) !== -1) {
                            isPersistent = true;
                            break;
                        }
                    }
                    if (!isPersistent) {
                        pageScripts.push(src);
                    }
                } else if (script.textContent.trim()) {
                    inlineScripts.push(script.textContent);
                }
            }

            // ==========================================
            // 3. Mettre à jour le titre et la classe du body
            // ==========================================
            document.title = doc.title;
            document.body.className = doc.body.className;

            // ==========================================
            // 4. Remplacer le contenu du body
            // ==========================================

            // Supprimer tout le contenu actuel du body
            while (document.body.firstChild) {
                document.body.removeChild(document.body.firstChild);
            }

            // Réinsérer le canvas (fond étoilé) en premier
            if (canvas) document.body.appendChild(canvas);

            // Réinsérer l'élément audio
            if (audio) document.body.insertBefore(audio, document.body.firstChild);

            // Insérer le nouveau contenu (tout sauf les scripts)
            var newChildren = Array.from(doc.body.children);
            for (var k = 0; k < newChildren.length; k++) {
                var child = newChildren[k];
                if (child.tagName === 'SCRIPT') continue;
                document.body.appendChild(document.adoptNode(child));
            }

            // ==========================================
            // 5. Réinsérer le lecteur de musique au bon endroit
            // ==========================================
            if (musicPlayer) {
                var homeContent = document.querySelector('.home-content');
                if (homeContent) {
                    // Sur la page d'accueil, le lecteur va dans home-content
                    homeContent.appendChild(musicPlayer);
                } else {
                    // Sur les autres pages, il va à la fin du body
                    document.body.appendChild(musicPlayer);
                }
            }

            // ==========================================
            // 6. Mettre à jour l'historique AVANT les réinitialisations
            //    (pour que updateActiveNavLink voie la bonne URL)
            // ==========================================
            if (pushState) {
                history.pushState({ spaUrl: url }, '', url);
            }

            // ==========================================
            // 7. Réinitialiser les scripts communs
            // ==========================================

            // Menu hamburger
            if (typeof window.initMenu === 'function') {
                window.initMenu();
            }

            // Lien de navigation actif
            if (typeof window.updateActiveNavLink === 'function') {
                window.updateActiveNavLink();
            }

            // Footer au scroll
            if (typeof window.initFooterScroll === 'function') {
                window.initFooterScroll();
            }

            // Mettre à jour les références DOM du lecteur de musique
            if (window.musicPlayerInstance) {
                window.musicPlayerInstance.reinitializeDOM();
            }

            // ==========================================
            // 8. Charger les scripts spécifiques à la page
            // ==========================================
            for (var s = 0; s < pageScripts.length; s++) {
                await loadScript(pageScripts[s]);
            }

            // Exécuter les scripts inline (dans un scope isolé via IIFE)
            for (var n = 0; n < inlineScripts.length; n++) {
                try {
                    var inlineScript = document.createElement('script');
                    inlineScript.textContent = '(function(){' + inlineScripts[n] + '})();';
                    document.body.appendChild(inlineScript);
                } catch (e) {
                    console.error('Erreur exécution script inline:', e);
                }
            }

            // Remonter en haut de page
            window.scrollTo(0, 0);

            // Forcer le navigateur à recalculer les états :hover
            // (après remplacement du DOM, le hover est perdu tant qu'on n'interagit pas)
            document.body.style.pointerEvents = 'none';
            requestAnimationFrame(function () {
                document.body.style.pointerEvents = '';
            });

        } catch (error) {
            console.error('Erreur navigation SPA:', error);
            // En cas d'erreur (ex: protocole file://), navigation classique
            window.location.href = url;
        }
    }

    // ==========================================
    // INTERCEPTION DES CLICS (DÉLÉGATION D'ÉVÉNEMENTS)
    // ==========================================
    // On utilise la délégation d'événements sur le body
    // pour intercepter tous les clics sur les liens internes,
    // même ceux ajoutés dynamiquement après le chargement.

    document.addEventListener('click', function (e) {
        // Trouver le lien le plus proche (même si on a cliqué sur un enfant du lien)
        var anchor = e.target.closest('a[href]');
        if (!anchor) return;

        // Ne pas intercepter si des touches modificatrices sont enfoncées
        // (Ctrl+Clic = nouvel onglet, etc.)
        if (e.ctrlKey || e.shiftKey || e.metaKey || e.altKey) return;

        // Vérifier si le lien doit être intercepté
        if (!shouldIntercept(anchor)) return;

        // Empêcher la navigation classique
        e.preventDefault();

        // Résoudre le chemin relatif en URL absolue
        var href = anchor.getAttribute('href');
        var absoluteUrl = new URL(href, window.location.href).href;

        // Naviguer via le routeur SPA
        navigateTo(absoluteUrl);
    });

    // ==========================================
    // GESTION DU BOUTON RETOUR/AVANCER
    // ==========================================
    // Quand l'utilisateur utilise les boutons du navigateur

    window.addEventListener('popstate', function (e) {
        if (e.state && e.state.spaUrl) {
            navigateTo(e.state.spaUrl, false);
        } else {
            // Si pas d'état SPA, recharger la page actuelle via le routeur
            navigateTo(window.location.href, false);
        }
    });

    // Sauvegarder l'état initial dans l'historique
    // (pour que le bouton retour fonctionne correctement)
    history.replaceState({ spaUrl: window.location.href }, '', window.location.href);

    console.log('🔄 Routeur SPA initialisé - Navigation sans rechargement activée');
})();
