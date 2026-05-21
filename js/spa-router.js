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
 */

(function () {
    'use strict';

    // Liste des scripts qui ne doivent PAS être rechargés lors de la navigation
    var PERSISTENT_SCRIPTS = [
        'three.min.js',
        'stars.js',
        'menu.js',
        'music-player.js',
        'inject-music-player.js',
        'navigation.js',
        'footer-scroll.js',
        'spa-router.js'
    ];

    // Pages exclues du routeur SPA
    var EXCLUDED_PAGES = [
        'spaceinvader.html'
    ];

    function shouldIntercept(anchor) {
        if (!anchor.href) return false;
        if (anchor.target === '_blank') return false;
        if (anchor.hasAttribute('download')) return false;
        try {
            if (new URL(anchor.href).origin !== window.location.origin) return false;
        } catch (e) {
            return false;
        }
        var href = anchor.getAttribute('href');
        if (!href || href === '#' || href.startsWith('#')) return false;
        if (!href.endsWith('.html')) return false;
        var page = href.split('/').pop();
        if (EXCLUDED_PAGES.indexOf(page) !== -1) return false;
        return true;
    }

    function loadScript(src) {
        return new Promise(function (resolve) {
            var existing = document.querySelector('script[data-spa-loaded="' + src + '"]');
            if (existing) existing.remove();
            var script = document.createElement('script');
            script.src = src;
            script.setAttribute('data-spa-loaded', src);
            script.onload = resolve;
            script.onerror = function () {
                console.error('Erreur chargement script:', src);
                resolve();
            };
            document.body.appendChild(script);
        });
    }

    async function navigateTo(url, pushState) {
        if (pushState === undefined) pushState = true;
        var currentNorm = window.location.href.split('#')[0].split('?')[0];
        var targetNorm = new URL(url, window.location.href).href.split('#')[0].split('?')[0];
        if (currentNorm === targetNorm) return;

        try {
            if (window.musicPlayerInstance) {
                window.musicPlayerInstance.saveState();
            }

            var response = await fetch(url);
            if (!response.ok) {
                window.location.href = url;
                return;
            }

            var html = await response.text();
            var parser = new DOMParser();
            var doc = parser.parseFromString(html, 'text/html');

            // Sauvegarder les éléments qui doivent persister
            var canvas = document.querySelector('canvas.background');
            var audio = document.getElementById('audioPlayer');
            var musicPlayer = document.getElementById('sidebarMusic'); // On cible le conteneur parent

            // Les retirer pour les protéger
            if (canvas) canvas.remove();
            if (audio) audio.remove();
            if (musicPlayer) musicPlayer.remove();

            // Collecter les scripts
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
                    if (!isPersistent) pageScripts.push(src);
                } else if (script.textContent.trim()) {
                    inlineScripts.push(script.textContent);
                }
            }

            // Mettre à jour le body
            document.title = doc.title;
            document.body.className = doc.body.className;

            // Remplacer le contenu
            while (document.body.firstChild) {
                document.body.removeChild(document.body.firstChild);
            }

            if (canvas) document.body.appendChild(canvas);
            if (audio) document.body.insertBefore(audio, document.body.firstChild);

            var newChildren = Array.from(doc.body.children);
            for (var k = 0; k < newChildren.length; k++) {
                var child = newChildren[k];
                if (child.tagName === 'SCRIPT') continue;
                document.body.appendChild(document.adoptNode(child));
            }

            // ==========================================
            // FIX : Réinsérer le lecteur dans la SIDEBAR
            // ==========================================
            if (musicPlayer) {
                var sidebarBottom = document.querySelector('.sidebar-bottom');
                if (sidebarBottom) {
                    sidebarBottom.insertBefore(musicPlayer, sidebarBottom.firstChild);
                    console.log('✅ SPA : Lecteur replacé dans la sidebar');
                } else {
                    document.body.appendChild(musicPlayer);
                    console.warn('⚠️ SPA : .sidebar-bottom non trouvé, fallback body');
                }
            }

            if (pushState) {
                history.pushState({ spaUrl: url }, '', url);
            }

            // Réinitialiser les scripts
            if (typeof window.initMenu === 'function') window.initMenu();
            if (typeof window.updateActiveNavLink === 'function') window.updateActiveNavLink();
            if (typeof window.initFooterScroll === 'function') window.initFooterScroll();

            // Rétablir la logique du lecteur
            if (window.musicPlayerInstance) {
                window.musicPlayerInstance.reinitializeDOM();
            }

            for (var s = 0; s < pageScripts.length; s++) {
                await loadScript(pageScripts[s]);
            }

            for (var n = 0; n < inlineScripts.length; n++) {
                try {
                    var inlineScript = document.createElement('script');
                    inlineScript.textContent = '(function(){' + inlineScripts[n] + '})();';
                    document.body.appendChild(inlineScript);
                } catch (e) {}
            }

            window.scrollTo(0, 0);
            
            // Émettre un événement personnalisé pour inject-music-player.js
            document.dispatchEvent(new CustomEvent('spa-page-loaded'));

        } catch (error) {
            console.error('Erreur navigation SPA:', error);
            window.location.href = url;
        }
    }

    document.addEventListener('click', function (e) {
        var anchor = e.target.closest('a[href]');
        if (!anchor || e.ctrlKey || e.shiftKey || e.metaKey || e.altKey) return;
        if (!shouldIntercept(anchor)) return;
        e.preventDefault();
        navigateTo(new URL(anchor.getAttribute('href'), window.location.href).href);
    });

    window.addEventListener('popstate', function (e) {
        navigateTo(e.state && e.state.spaUrl ? e.state.spaUrl : window.location.href, false);
    });

    history.replaceState({ spaUrl: window.location.href }, '', window.location.href);
})();
