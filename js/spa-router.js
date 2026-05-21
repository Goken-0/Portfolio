/**
 * ============================================
 * ROUTEUR SPA (SINGLE PAGE APPLICATION) - V3
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

            // 1. GESTION DU HEAD (Styles spécifiques)
            const currentLinks = Array.from(document.head.querySelectorAll('link[rel="stylesheet"]'));
            const newLinks = Array.from(doc.head.querySelectorAll('link[rel="stylesheet"]'));

            newLinks.forEach(newLink => {
                const href = newLink.getAttribute('href');
                if (!currentLinks.some(l => l.getAttribute('href') === href)) {
                    const link = document.createElement('link');
                    link.rel = 'stylesheet';
                    link.href = href;
                    link.setAttribute('data-spa-style', 'true');
                    document.head.appendChild(link);
                }
            });

            // 2. ÉLÉMENTS PERSISTANTS (SANS SUPPRESSION)
            const canvas = document.querySelector('canvas.background');
            const audio = document.getElementById('audioPlayer');
            const playerUI = document.getElementById('sidebarMusic');
            const header = document.querySelector('header'); // La sidebar est persistante !

            // 3. NETTOYAGE DU BODY (Sauf persistants)
            const children = Array.from(document.body.children);
            children.forEach(child => {
                if (child !== canvas && child !== audio && child !== playerUI && child !== header && child.tagName !== 'SCRIPT') {
                    document.body.removeChild(child);
                }
            });

            // 4. INJECTION DU NOUVEAU CONTENU
            document.title = doc.title;
            const newBody = doc.body;
            document.body.className = newBody.className;

            const scriptsToLoad = [];
            const inlineScripts = [];

            Array.from(newBody.children).forEach(child => {
                if (child.tagName === 'HEADER') return; // On garde notre header actuel
                
                if (child.tagName === 'SCRIPT') {
                    if (child.src) {
                        const src = child.getAttribute('src');
                        if (!PERSISTENT_SCRIPTS.some(p => src.includes(p))) scriptsToLoad.push(src);
                    } else {
                        inlineScripts.push(child.textContent);
                    }
                    return;
                }
                
                document.body.appendChild(document.adoptNode(child));
            });

            // 5. RE-POSITIONNEMENT DU LECTEUR DANS LA NOUVELLE SIDEBAR (si header a changé)
            // Note: Comme on garde le même 'header', il devrait déjà être là.
            if (playerUI) {
                const sidebarBottom = document.querySelector('.sidebar-bottom');
                if (sidebarBottom && playerUI.parentElement !== sidebarBottom) {
                    sidebarBottom.insertBefore(playerUI, sidebarBottom.firstChild);
                }
            }

            if (pushState) history.pushState({ spaUrl: url }, '', url);

            // 6. RÉINITIALISATIONS
            document.dispatchEvent(new CustomEvent('spa-page-loaded'));
            if (typeof window.reinitUI === 'function') window.reinitUI();
            if (window.musicPlayerInstance) window.musicPlayerInstance.reinitializeDOM();

            // 7. SCRIPTS DYNAMIQUES
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
        if (!href || href.startsWith('#') || !href.endsWith('.html') || href.includes('mailto:')) return;
        if (new URL(anchor.href).origin !== window.location.origin) return;
        
        e.preventDefault();
        navigateTo(anchor.href);
    });

    window.onpopstate = e => {
        navigateTo(e.state?.spaUrl || window.location.href, false);
    };

    history.replaceState({ spaUrl: window.location.href }, '', window.location.href);
})();
