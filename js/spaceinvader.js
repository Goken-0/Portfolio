/**
 * ============================================
 * JEU SPACE INVADERS (RESTAURATION COMPLÈTE SPA)
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

    // --- CONFIGURATION ---
    let colors = {
        player: '#00ffff',      
        enemy: '#ff00eaff',
        miniboss: '#ffaa00',
        boss: '#ff0000',
        border: '#00ffff'       
    };

    let globalVolume = 0.5;
    const gameMusic = new Audio('assets/music/galacticknight.mp3');
    gameMusic.loop = true;        
    gameMusic.volume = globalVolume;

    // --- CLASSES ---
    class Player {
        constructor() {
            this.width = 40; this.height = 40;
            this.x = canvas.width / 2 - 20;
            this.y = canvas.height - 80;
            this.speed = 5; this.dx = 0; this.dy = 0;
        }
        draw() {
            if (invulnerable && Math.floor(invulnerabilityTime / 10) % 2 === 0) ctx.globalAlpha = 0.3;
            ctx.fillStyle = colors.player;
            ctx.fillRect(this.x + 18, this.y, 4, 10);
            ctx.fillRect(this.x + 16, this.y + 10, 8, 5);
            ctx.fillRect(this.x + 14, this.y + 15, 12, 5);
            ctx.fillRect(this.x + 12, this.y + 20, 16, 5);
            ctx.fillRect(this.x + 4, this.y + 25, 32, 5);
            ctx.fillRect(this.x, this.y + 30, 40, 10);
            ctx.globalAlpha = 1.0;
        }
        update() {
            this.x += this.dx; this.y += this.dy;
            this.x = Math.max(0, Math.min(canvas.width - this.width, this.x));
            this.y = Math.max(0, Math.min(canvas.height - this.height, this.y));
        }
    }

    class Bullet {
        constructor(x, y, vY, color, isEnemy = false) {
            this.x = x; this.y = y; this.width = isEnemy ? 6 : 4; this.height = 15;
            this.vY = vY; this.color = color; this.active = true; this.isEnemy = isEnemy;
        }
        draw() { ctx.fillStyle = this.color; ctx.fillRect(this.x, this.y, this.width, this.height); }
        update() { this.y += this.vY; if (this.y < 0 || this.y > canvas.height) this.active = false; }
    }

    class Enemy {
        constructor(x, y, type = 'normal') {
            this.x = x; this.y = y; this.type = type; this.active = true;
            this.width = type === 'boss' ? 100 : 30;
            this.height = type === 'boss' ? 80 : 30;
            this.hp = type === 'boss' ? 20 + (wave * 5) : (type === 'miniboss' ? 3 : 1);
            this.maxHp = this.hp;
            this.speed = 1 + (wave * 0.1);
            this.angle = Math.random() * Math.PI * 2;
            this.dir = 1;
        }
        draw() {
            ctx.fillStyle = this.type === 'boss' ? colors.boss : (this.type === 'miniboss' ? colors.miniboss : colors.enemy);
            ctx.fillRect(this.x, this.y, this.width, this.height);
            if (this.type === 'boss') {
                const hpP = this.hp / this.maxHp;
                ctx.fillStyle = 'red'; ctx.fillRect(this.x, this.y - 10, this.width * hpP, 5);
            }
        }
        update() {
            if (this.type === 'boss') {
                this.x += this.speed * this.dir;
                if (this.x <= 0 || this.x + this.width >= canvas.width) this.dir *= -1;
                if (Math.random() < 0.02) enemyBullets.push(new Bullet(this.x + this.width/2, this.y + this.height, 5, '#0f0', true));
            } else {
                this.x += Math.cos(this.angle) * this.speed;
                this.y += Math.sin(this.angle) * this.speed;
                if (this.x <= 0 || this.x + this.width >= canvas.width) this.angle = Math.PI - this.angle;
                if (this.y <= 0 || this.y + this.height >= canvas.height - 100) this.angle = -this.angle;
            }
        }
    }

    class Particle {
        constructor(x, y, color) {
            this.x = x; this.y = y; this.size = Math.random() * 3 + 2;
            this.vX = (Math.random() - 0.5) * 4; this.vY = (Math.random() - 0.5) * 4;
            this.life = 30; this.color = color;
        }
        update() { this.x += this.vX; this.y += this.vY; this.life--; }
        draw() { ctx.globalAlpha = this.life / 30; ctx.fillStyle = this.color; ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI*2); ctx.fill(); ctx.globalAlpha = 1; }
    }

    class Star {
        constructor() { this.x = Math.random() * canvas.width; this.y = Math.random() * canvas.height; this.size = Math.random() * 2; this.speed = Math.random() * 2 + 0.5; }
        update() { this.y += this.speed; if (this.y > canvas.height) this.y = 0; }
        draw() { ctx.fillStyle = '#fff'; ctx.fillRect(this.x, this.y, this.size, this.size); }
    }

    // --- ETAT DU JEU ---
    let player, bullets, enemyBullets, enemies, particles, stars;
    let score, lives, wave, gameActive, gamePaused, keys, canShoot, shootCooldown, invulnerable, invulnerabilityTime;

    function resetGame() {
        player = new Player();
        bullets = []; enemyBullets = []; enemies = []; particles = []; 
        stars = Array.from({length: 100}, () => new Star());
        score = 0; lives = 3; wave = 1;
        gameActive = false; gamePaused = false; keys = {}; canShoot = true;
        shootCooldown = 150; invulnerable = false; invulnerabilityTime = 0;
        updateUI();
    }

    function spawnEnemies() {
        enemies = [];
        if (wave % 5 === 0) {
            enemies.push(new Enemy(canvas.width/2 - 50, 50, 'boss'));
        } else {
            for (let i = 0; i < 10 + wave; i++) {
                enemies.push(new Enemy(Math.random() * (canvas.width - 30), Math.random() * 200 + 50));
            }
        }
    }

    function updateUI() {
        const s = document.getElementById('score'); if (s) s.textContent = score;
        const l = document.getElementById('lives'); if (l) l.innerHTML = '❤'.repeat(lives);
    }

    // --- MOTEUR ---
    function update() {
        if (!gameActive || gamePaused) return;

        // Input
        player.dx = 0; player.dy = 0;
        if (keys['ArrowLeft'] || keys['q']) player.dx = -player.speed;
        if (keys['ArrowRight'] || keys['d']) player.dx = player.speed;
        if (keys['ArrowUp'] || keys['z']) player.dy = -player.speed;
        if (keys['ArrowDown'] || keys['s']) player.dy = player.speed;
        player.update();

        if (keys[' '] && canShoot) {
            bullets.push(new Bullet(player.x + 18, player.y, -7, '#ff0'));
            canShoot = false; setTimeout(() => canShoot = true, shootCooldown);
        }

        stars.forEach(s => s.update());
        bullets.forEach(b => b.update());
        enemyBullets.forEach(b => b.update());
        enemies.forEach(e => e.update());
        particles.forEach(p => p.update());

        // Collisions
        bullets.forEach(b => {
            enemies.forEach(e => {
                if (b.active && e.active && b.x < e.x + e.width && b.x + b.width > e.x && b.y < e.y + e.height && b.y + b.height > e.y) {
                    b.active = false; e.hp--;
                    if (e.hp <= 0) { e.active = false; score += 10; updateUI(); explode(e.x + e.width/2, e.y + e.height/2, colors.enemy); }
                }
            });
        });

        enemyBullets.concat(enemies).forEach(obj => {
            if (!invulnerable && obj.active && player.x < obj.x + obj.width && player.x + player.width > obj.x && player.y < obj.y + obj.height && player.y + player.height > obj.y) {
                hit(); if (obj instanceof Enemy && obj.type !== 'boss') obj.active = false;
            }
        });

        bullets = bullets.filter(b => b.active);
        enemies = enemies.filter(e => e.active);
        particles = particles.filter(p => p.life > 0);

        if (enemies.length === 0 && gameActive) { wave++; spawnEnemies(); }
        if (invulnerable) { invulnerabilityTime--; if (invulnerabilityTime <= 0) invulnerable = false; }
    }

    function explode(x, y, color) { for (let i = 0; i < 10; i++) particles.push(new Particle(x, y, color)); }
    
    function hit() {
        lives--; updateUI(); explode(player.x + 20, player.y + 20, '#0ff');
        invulnerable = true; invulnerabilityTime = 100;
        if (lives <= 0) { gameActive = false; document.getElementById('gameOver').style.display = 'flex'; document.getElementById('finalScore').textContent = score; }
    }

    function draw() {
        ctx.fillStyle = '#000'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        stars.forEach(s => s.draw());
        particles.forEach(p => p.draw());
        if (gameActive) {
            player.draw();
            bullets.forEach(b => b.draw());
            enemyBullets.forEach(b => b.draw());
            enemies.forEach(e => e.draw());
        }
    }

    function loop() { if (running) { update(); draw(); animationId = requestAnimationFrame(loop); } }

    // --- UI EVENTS ---
    const handleKey = (e) => { keys[e.key] = e.type === 'keydown'; if (e.key === ' ' && gameActive) e.preventDefault(); };
    window.addEventListener('keydown', handleKey);
    window.addEventListener('keyup', handleKey);

    const start = () => { document.getElementById('startScreen').style.display = 'none'; gameActive = true; spawnEnemies(); gameMusic.play().catch(()=>{}); };
    const btnNo = document.getElementById('btnNo'); if (btnNo) btnNo.onclick = start;
    const btnYes = document.getElementById('btnYes'); if (btnYes) btnYes.onclick = start;

    // --- CLEANUP ---
    window._spaceInvadersCleanup = () => {
        running = false; cancelAnimationFrame(animationId); gameMusic.pause();
        window.removeEventListener('keydown', handleKey); window.removeEventListener('keyup', handleKey);
        const p = document.getElementById('customPanel'); if (p) p.remove();
        const s = document.querySelector('.toggle-settings'); if (s) s.remove();
        const m = document.getElementById('musicButton'); if (m) m.remove();
        delete window._spaceInvadersCleanup;
        window._spaceInvadersRunning = false;
    };

    document.addEventListener('spa-page-loaded', function cl() {
        if (!document.getElementById('gameCanvas')) { window._spaceInvadersCleanup(); document.removeEventListener('spa-page-loaded', cl); }
    });

    resetGame();
    loop();
    window._spaceInvadersRunning = true;
})();
