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
            if (window.musicPlayerInstance) window.musicPlayerInstance.saveState();

            const response = await fetch(url);
            if (!response.ok) { window.location.href = url; return; }

            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            const canvas = document.querySelector('canvas.background');
            const audio = document.getElementById('audioPlayer');
            const playerUI = document.getElementById('sidebarMusic');

            const newBody = doc.body;
            document.title = doc.title;
            document.body.className = newBody.className;

            // Nettoyage intelligent
            const children = Array.from(document.body.children);
            children.forEach(child => {
                if (child !== canvas && child !== audio && child !== playerUI && child.tagName !== 'SCRIPT') {
                    document.body.removeChild(child);
                }
            });

            const scriptsToLoad = [];
            const inlineScripts = [];

            Array.from(newBody.children).forEach(child => {
                if (child.tagName === 'SCRIPT') {
                    if (child.src) {
                        const src = child.getAttribute('src');
                        if (!PERSISTENT_SCRIPTS.some(p => src.includes(p))) {
                            scriptsToLoad.push(src);
                        }
                    } else {
                        inlineScripts.push(child.textContent);
                    }
                    return;
                }
                document.body.appendChild(document.adoptNode(child));
            });

            if (playerUI) {
                const sidebarBottom = document.querySelector('.sidebar-bottom');
                if (sidebarBottom) sidebarBottom.insertBefore(playerUI, sidebarBottom.firstChild);
            }

            if (pushState) history.pushState({ spaUrl: url }, '', url);

            // RÉINITIALISATIONS
            if (typeof window.reinitUI === 'function') window.reinitUI();
            if (window.musicPlayerInstance) window.musicPlayerInstance.reinitializeDOM();

            // CHARGEMENT DES SCRIPTS DE PAGE
            for (const src of scriptsToLoad) {
                await new Promise(resolve => {
                    const s = document.createElement('script');
                    s.src = src;
                    s.setAttribute('data-spa-dynamic', 'true');
                    s.onload = resolve;
                    s.onerror = resolve;
                    document.body.appendChild(s);
                });
            }

            inlineScripts.forEach(code => {
                try {
                    const s = document.createElement('script');
                    s.textContent = code;
                    s.setAttribute('data-spa-inline', 'true');
                    document.body.appendChild(s);
                } catch (e) {}
            });

            window.scrollTo(0, 0);
            document.dispatchEvent(new CustomEvent('spa-page-loaded'));

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
