/**
 * ============================================
 * ROUTEUR SPA (SINGLE PAGE APPLICATION)
 * ============================================
 */

(function () {
    'use strict';

    const PERSISTENT_SCRIPTS = [
        'three.min.js',
        'stars.js',
        'menu.js',
        'music-player.js',
        'inject-music-player.js',
        'spa-router.js'
    ];

    async function navigateTo(url, pushState = true) {
        try {
            // Sauvegarde de l'état audio avant de partir
            if (window.musicPlayerInstance) window.musicPlayerInstance.saveState();

            const response = await fetch(url);
            if (!response.ok) { window.location.href = url; return; }

            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            // 1. Extraire les éléments persistants du DOM actuel
            const canvas = document.querySelector('canvas.background');
            const audio = document.getElementById('audioPlayer');
            const playerUI = document.getElementById('sidebarMusic');

            // 2. Préparer le nouveau body
            const newBody = doc.body;

            // 3. Mettre à jour les métadonnées
            document.title = doc.title;
            document.body.className = newBody.className;

            // 4. Remplacer le contenu du body
            // On utilise innerHTML pour une transition propre, puis on réinjecte les persistants
            const scriptsToLoad = [];
            const inlineScripts = [];

            // Filtrer les scripts pour ne pas charger les persistants deux fois
            newBody.querySelectorAll('script').forEach(script => {
                if (script.src) {
                    const src = script.getAttribute('src');
                    if (!PERSISTENT_SCRIPTS.some(p => src.includes(p))) {
                        scriptsToLoad.push(src);
                    }
                } else {
                    inlineScripts.push(script.textContent);
                }
            });

            // Nettoyage du body actuel
            while (document.body.firstChild) document.body.removeChild(document.body.firstChild);

            // Injection du nouveau contenu HTML
            Array.from(newBody.children).forEach(child => {
                if (child.tagName !== 'SCRIPT') {
                    document.body.appendChild(document.adoptNode(child));
                }
            });

            // 5. Réinjection immédiate des éléments critiques
            if (canvas) document.body.appendChild(canvas);
            if (audio) document.body.insertBefore(audio, document.body.firstChild);
            
            // On délègue le replacement du lecteur à inject-music-player.js via l'événement
            if (playerUI) {
                const sidebarBottom = document.querySelector('.sidebar-bottom');
                if (sidebarBottom) sidebarBottom.insertBefore(playerUI, sidebarBottom.firstChild);
            }

            if (pushState) history.pushState({ spaUrl: url }, '', url);

            // 6. Déclencher les réinitialisations
            document.dispatchEvent(new CustomEvent('spa-page-loaded'));
            
            if (typeof window.reinitUI === 'function') window.reinitUI();
            if (window.musicPlayerInstance) window.musicPlayerInstance.reinitializeDOM();

            // 7. Charger les nouveaux scripts
            for (const src of scriptsToLoad) {
                await new Promise(resolve => {
                    const s = document.createElement('script');
                    s.src = src;
                    s.onload = resolve;
                    s.onerror = resolve;
                    document.body.appendChild(s);
                });
            }

            inlineScripts.forEach(code => {
                try {
                    const s = document.createElement('script');
                    s.textContent = code;
                    document.body.appendChild(s);
                } catch (e) {}
            });

            window.scrollTo(0, 0);

        } catch (error) {
            console.error('Erreur SPA:', error);
            window.location.href = url;
        }
    }

    document.addEventListener('click', e => {
        const anchor = e.target.closest('a[href]');
        if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) return;
        const href = anchor.getAttribute('href');
        if (href.startsWith('#') || !href.endsWith('.html') || href.includes('mailto:')) return;
        if (new URL(anchor.href).origin !== window.location.origin) return;
        
        e.preventDefault();
        navigateTo(anchor.href);
    });

    window.onpopstate = e => {
        navigateTo(e.state?.spaUrl || window.location.href, false);
    };

    history.replaceState({ spaUrl: window.location.href }, '', window.location.href);
})();
