/**
 * ============================================
 * JEU SPACE INVADERS (SPA COMPATIBLE V2)
 * ============================================
 */

(function initSpaceInvaders() {
    'use strict';

    // Sécurité : Nettoyer l'instance précédente si elle existe
    if (window._spaceInvadersCleanup) {
        window._spaceInvadersCleanup();
    }

    const canvas = document.getElementById('gameCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationId = null;
    let running = true;

    // Configuration Couleurs
    let colors = {
        player: '#00ffff',      
        enemy: '#ff00eaff',
        miniboss: '#ffaa00',
        boss: '#ff0000'
    };

    // Audio du jeu
    const gameMusic = new Audio('assets/music/galacticknight.mp3');
    gameMusic.loop = true;
    gameMusic.volume = 0.5;

    // Panneau de réglages
    const customPanel = document.createElement('div');
    customPanel.id = 'customPanel';
    customPanel.style.cssText = `
        position: fixed; top: 50%; right: -300px; transform: translateY(-50%); width: 300px;
        background: rgba(0, 10, 20, 0.98); border: 2px solid #00ffff; border-radius: 10px 0 0 10px;
        padding: 20px; z-index: 2000; transition: right 0.3s; font-family: 'Press Start 2P', cursive;
    `;
    customPanel.innerHTML = `
        <h3 style="color: #00ffff; font-size: 14px; margin-bottom: 20px; text-align: center;">RÉGLAGES</h3>
        <div style="margin-bottom: 20px;">
            <label style="color: #00ffff; font-size: 10px; display: block; margin-bottom: 5px;">VOLUME</label>
            <input type="range" id="gameVol" min="0" max="1" step="0.1" value="0.5" style="width: 100%;">
        </div>
        <button id="closeSettings" style="width: 100%; padding: 10px; background: #00ffff; color: #000; font-size: 10px; cursor: pointer;">FERMER</button>
    `;
    document.body.appendChild(customPanel);

    // Bouton flottant
    const settingsBtn = document.createElement('button');
    settingsBtn.innerHTML = '<i class="fas fa-cog"></i>';
    settingsBtn.className = 'game-btn cyan-style';
    settingsBtn.style.cssText = 'position: fixed; top: 50%; right: 20px; transform: translateY(-50%); z-index: 2001;';
    document.body.appendChild(settingsBtn);

    settingsBtn.onclick = () => { customPanel.style.right = '0'; };
    document.getElementById('closeSettings').onclick = () => { customPanel.style.right = '-300px'; };

    // Logique simplifiée pour test
    let gameActive = false;
    class Star {
        constructor() { this.x = Math.random() * canvas.width; this.y = Math.random() * canvas.height; this.s = Math.random() * 2; }
        draw() { ctx.fillStyle = '#fff'; ctx.fillRect(this.x, this.y, this.s, this.s); }
    }
    let stars = Array.from({length: 100}, () => new Star());

    function gameLoop() {
        if (!running) return;
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        stars.forEach(s => s.draw());
        
        if (gameActive) {
            ctx.fillStyle = colors.player;
            ctx.fillRect(canvas.width/2 - 20, canvas.height - 60, 40, 40);
            ctx.fillStyle = '#fff';
            ctx.font = '20px "Press Start 2P"';
            ctx.fillText('JEU EN COURS', canvas.width/2 - 100, canvas.height/2);
        }

        animationId = requestAnimationFrame(gameLoop);
    }

    const startBtn = document.getElementById('btnNo');
    if (startBtn) startBtn.onclick = () => {
        document.getElementById('startScreen').style.display = 'none';
        gameActive = true;
        gameMusic.play().catch(() => {});
    };

    // FONCTION DE NETTOYAGE (CRITIQUE POUR SPA)
    window._spaceInvadersCleanup = () => {
        running = false;
        cancelAnimationFrame(animationId);
        gameMusic.pause();
        customPanel.remove();
        settingsBtn.remove();
        delete window._spaceInvadersCleanup;
        console.log('🧹 Space Invader nettoyé');
    };

    // Détecter si on quitte la page via SPA
    document.addEventListener('spa-page-loaded', function cleanup() {
        if (!document.getElementById('gameCanvas')) {
            window._spaceInvadersCleanup();
            document.removeEventListener('spa-page-loaded', cleanup);
        }
    }, { once: true });

    gameLoop();
})();
