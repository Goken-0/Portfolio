// Couleurs personnalisables
let colors = {
    player: '#00ffff',
    enemy: '#ff00eaff',
    border: '#00ffff'
};

// Musique de fond
const music = new Audio('assets/music/galacticknight.mp3');
music.loop = true;
music.volume = 0.5;

// Panneau de personnalisation
const customPanel = document.createElement('div');
customPanel.id = 'customPanel';
customPanel.style.cssText = `
    position: fixed;
    top: 50%;
    right: -300px;
    transform: translateY(-50%);
    width: 300px;
    background: rgba(0, 20, 40, 0.95);
    border: 2px solid #00ffff;
    border-right: none;
    border-radius: 10px 0 0 10px;
    padding: 20px;
    z-index: 100;
    transition: right 0.3s;
    box-shadow: -5px 0 20px rgba(0, 255, 255, 0.3);
    font-family: 'Press Start 2P', cursive !important;
`;
customPanel.innerHTML = `
    <h3 style="color: #00ffff; font-size: 14px; margin-bottom: 20px; text-align: center;">PERSONNALISATION</h3>
    <div style="margin-bottom: 20px;">
        <label style="color: #00ffff; font-size: 10px; display: block; margin-bottom: 10px;">Vaisseau</label>
        <input type="color" id="playerColor" value="#00ffff" style="width: 100%; height: 40px; cursor: pointer; border: 2px solid #00ffff; background: transparent;">
    </div>
    <div style="margin-bottom: 20px;">
        <label style="color: #ff00eaff; font-size: 10px; display: block; margin-bottom: 10px;">Ennemis</label>
        <input type="color" id="enemyColor" value="#ff00ea" style="width: 100%; height: 40px; cursor: pointer; border: 2px solid #ff00eaff; background: transparent;">
    </div>
    <div style="margin-bottom: 20px;">
        <label style="color: #00ffff; font-size: 10px; display: block; margin-bottom: 10px;">Cadre</label>
        <input type="color" id="borderColor" value="#00ffff" style="width: 100%; height: 40px; cursor: pointer; border: 2px solid #00ffff; background: transparent;">
    </div>
    <button id="resetColors" style="width: 100%; padding: 10px; background: rgba(255, 0, 0, 0.2); border: 2px solid #ff0000; color: #ff0000; font-size: 10px; cursor: pointer; font-family: 'Press Start 2P', cursive; border-radius: 5px;">RESET</button>
`;
document.body.appendChild(customPanel);

// Bouton toggle panneau
const togglePanelBtn = document.createElement('button');
togglePanelBtn.innerHTML = '<i class="fas fa-palette"></i>';
togglePanelBtn.style.cssText = `
    position: fixed;
    top: 50%;
    right: 20px;
    transform: translateY(-50%);
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: rgba(0, 255, 255, 0.2);
    border: 2px solid #00ffff;
    color: #00ffff;
    font-size: 20px;
    cursor: pointer;
    z-index: 1000000;
    transition: all 0.3s;
    box-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
`;
document.body.appendChild(togglePanelBtn);

let panelOpen = false;
togglePanelBtn.addEventListener('click', () => {
    panelOpen = !panelOpen;
    customPanel.style.right = panelOpen ? '0px' : '-300px';
    togglePanelBtn.style.right = panelOpen ? '320px' : '20px';
});

togglePanelBtn.addEventListener('mouseenter', () => {
    togglePanelBtn.style.transform = 'translateY(-50%) scale(1.1)';
    togglePanelBtn.style.boxShadow = '0 0 20px rgba(0, 255, 255, 0.8)';
});
togglePanelBtn.addEventListener('mouseleave', () => {
    togglePanelBtn.style.transform = 'translateY(-50%) scale(1)';
    togglePanelBtn.style.boxShadow = '0 0 10px rgba(0, 255, 255, 0.5)';
});

// Event listeners pour les changements de couleur
document.getElementById('playerColor').addEventListener('input', (e) => {
    colors.player = e.target.value;
});

document.getElementById('enemyColor').addEventListener('input', (e) => {
    colors.enemy = e.target.value + 'ff';
});

document.getElementById('borderColor').addEventListener('input', (e) => {
    colors.border = e.target.value;
    const gameCanvas = document.getElementById('gameCanvas');
    gameCanvas.style.borderColor = e.target.value;
    document.getElementById('gameContainer').style.boxShadow = `0 0 40px ${e.target.value}80`;
});

document.getElementById('resetColors').addEventListener('click', () => {
    colors.player = '#00ffff';
    colors.enemy = '#ff00eaff';
    colors.border = '#00ffff';
    document.getElementById('playerColor').value = '#00ffff';
    document.getElementById('enemyColor').value = '#ff00ea';
    document.getElementById('borderColor').value = '#00ffff';
    const gameCanvas = document.getElementById('gameCanvas');
    gameCanvas.style.borderColor = '#00ffff';
    document.getElementById('gameContainer').style.boxShadow = '0 0 40px rgba(0, 255, 255, 0.5)';
});

// Bouton play/pause musique
const musicButton = document.createElement('button');
musicButton.id = 'musicButton';
musicButton.innerHTML = '<i class="fas fa-volume-mute"></i>';
musicButton.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: rgba(255, 0, 0, 0.2);
    border: 2px solid #ff0000;
    color: #ff0000;
    font-size: 20px;
    cursor: pointer;
    z-index: 1000000;
    transition: all 0.3s;
    box-shadow: 0 0 10px rgba(255, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
`;
document.body.appendChild(musicButton);

let musicPlaying = false;
musicButton.addEventListener('click', () => {
    if (musicPlaying) {
        music.pause();
        musicButton.innerHTML = '<i class="fas fa-volume-mute"></i>';
        musicButton.style.background = 'rgba(255, 0, 0, 0.2)';
        musicButton.style.borderColor = '#ff0000';
        musicButton.style.color = '#ff0000';
    } else {
        music.play();
        musicButton.innerHTML = '<i class="fas fa-volume-up"></i>';
        musicButton.style.background = 'rgba(0, 255, 255, 0.2)';
        musicButton.style.borderColor = '#00ffff';
        musicButton.style.color = '#00ffff';
    }
    musicPlaying = !musicPlaying;
});

// Hover effect
musicButton.addEventListener('mouseenter', () => {
    musicButton.style.transform = 'scale(1.1)';
    musicButton.style.boxShadow = '0 0 20px rgba(0, 255, 255, 0.8)';
});
musicButton.addEventListener('mouseleave', () => {
    musicButton.style.transform = 'scale(1)';
    musicButton.style.boxShadow = '0 0 10px rgba(0, 255, 255, 0.5)';
});

document.addEventListener('keydown', function onMusicToggle(e) {
    if (e.code === 'KeyM') {
        musicButton.click();
    }
});

// ===================== GESTIONNAIRES D'ÉVÉNEMENTS =====================

// Écran de démarrage
document.getElementById('startButton').addEventListener('click', function () {
    initAudioContext(); // Initialiser l'audio au clic
    document.getElementById('startScreen').style.display = 'none';
    gameActive = true;
    gamePaused = false;
});

// Menu de pause
document.getElementById('resumeButton').addEventListener('click', function () {
    document.getElementById('pauseScreen').style.display = 'none';
    gamePaused = false;
});

document.getElementById('restartButton').addEventListener('click', function () {
    document.getElementById('pauseScreen').style.display = 'none';
    resetGame();
});

// Gestion de la touche Échap pour la pause
document.addEventListener('keydown', function (e) {
    if (e.code === 'Escape') {
        if (gameActive && !gamePaused) {
            // Mettre en pause
            gamePaused = true;
            document.getElementById('pauseScreen').style.display = 'flex';
        } else if (gameActive && gamePaused) {
            // Reprendre
            gamePaused = false;
            document.getElementById('pauseScreen').style.display = 'none';
        }
    }
});

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');
const gameOverEl = document.getElementById('gameOver');
const finalScoreEl = document.getElementById('finalScore');

// Audio Context pour les effets sonores
let audioCtx = null;

function initAudioContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function playLaserSound() {
    initAudioContext();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(200, audioCtx.currentTime + 0.1);

    gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);

    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 0.1);
}

function playExplosionSound() {
    initAudioContext();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(200, audioCtx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + 0.3);

    gainNode.gain.setValueAtTime(0.4, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);

    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 0.3);
}

function playHitSound() {
    initAudioContext();
    
    // Explosion principale (basse fréquence)
    const oscillator1 = audioCtx.createOscillator();
    const gainNode1 = audioCtx.createGain();
    
    oscillator1.connect(gainNode1);
    gainNode1.connect(audioCtx.destination);
    
    oscillator1.type = 'sawtooth';
    oscillator1.frequency.setValueAtTime(150, audioCtx.currentTime);
    oscillator1.frequency.exponentialRampToValueAtTime(30, audioCtx.currentTime + 0.4);
    
    gainNode1.gain.setValueAtTime(0.6, audioCtx.currentTime);
    gainNode1.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
    
    oscillator1.start(audioCtx.currentTime);
    oscillator1.stop(audioCtx.currentTime + 0.4);
    
    // Bruit blanc pour l'impact
    const bufferSize = audioCtx.sampleRate * 0.3;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }
    
    const noiseSource = audioCtx.createBufferSource();
    const noiseGain = audioCtx.createGain();
    
    noiseSource.buffer = buffer;
    noiseSource.connect(noiseGain);
    noiseGain.connect(audioCtx.destination);
    
    noiseGain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
    
    noiseSource.start(audioCtx.currentTime);
    
    // Résonance métallique
    const oscillator2 = audioCtx.createOscillator();
    const gainNode2 = audioCtx.createGain();
    
    oscillator2.connect(gainNode2);
    gainNode2.connect(audioCtx.destination);
    
    oscillator2.type = 'square';
    oscillator2.frequency.setValueAtTime(800, audioCtx.currentTime + 0.1);
    oscillator2.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.4);
    
    gainNode2.gain.setValueAtTime(0.2, audioCtx.currentTime + 0.1);
    gainNode2.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
    
    oscillator2.start(audioCtx.currentTime + 0.1);
    oscillator2.stop(audioCtx.currentTime + 0.4);
}

function playGameOverSound() {
    initAudioContext();
    // Séquence de notes descendantes pour le Game Over
    const notes = [440, 392, 349, 294, 262]; // A4, G4, F4, D4, C4
    const duration = 0.3;

    notes.forEach((freq, index) => {
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime + index * duration);

        gainNode.gain.setValueAtTime(0, audioCtx.currentTime + index * duration);
        gainNode.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + index * duration + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + index * duration + duration);

        oscillator.start(audioCtx.currentTime + index * duration);
        oscillator.stop(audioCtx.currentTime + index * duration + duration);
    });
}

class Player {
    constructor() {
        this.width = 40;
        this.height = 40;
        this.x = canvas.width / 2 - this.width / 2;
        this.y = canvas.height - 80;
        this.speed = 5;
        this.dx = 0;
        this.dy = 0;
    }

    draw() {
        // Effet de clignotement pendant l'invincibilité
        if (invulnerable && Math.floor(invulnerabilityTime / 10) % 2 === 0) {
            ctx.globalAlpha = 0.3;
        }

        ctx.fillStyle = colors.player;
        // Pas de shadowBlur
        // Corps principal
        ctx.fillRect(this.x + 15, this.y + 10, 10, 25);

        // Nez du vaisseau
        ctx.beginPath();
        ctx.moveTo(this.x + 20, this.y);
        ctx.lineTo(this.x + 25, this.y + 10);
        ctx.lineTo(this.x + 15, this.y + 10);
        ctx.closePath();
        ctx.fill();

        // Ailes
        ctx.beginPath();
        ctx.moveTo(this.x, this.y + 20);
        ctx.lineTo(this.x + 15, this.y + 15);
        ctx.lineTo(this.x + 15, this.y + 30);
        ctx.lineTo(this.x + 5, this.y + 35);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(this.x + 40, this.y + 20);
        ctx.lineTo(this.x + 25, this.y + 15);
        ctx.lineTo(this.x + 25, this.y + 30);
        ctx.lineTo(this.x + 35, this.y + 35);
        ctx.closePath();
        ctx.fill();

        // Réacteurs
        ctx.fillStyle = '#ff6600';
        ctx.fillRect(this.x + 16, this.y + 35, 3, 5);
        ctx.fillRect(this.x + 21, this.y + 35, 3, 5);

        // Cockpit
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(this.x + 20, this.y + 15, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = 1.0;
    }

    update() {
        this.x += this.dx;
        this.y += this.dy;

        if (this.x < 0) this.x = 0;
        if (this.x + this.width > canvas.width) this.x = canvas.width - this.width;
        if (this.y < 0) this.y = 0;
        if (this.y + this.height > canvas.height) this.y = canvas.height - this.height;
    }

    moveLeft() {
        this.dx = -this.speed;
    }

    moveRight() {
        this.dx = this.speed;
    }

    moveUp() {
        this.dy = -this.speed;
    }

    moveDown() {
        this.dy = this.speed;
    }

    stopHorizontal() {
        this.dx = 0;
    }

    stopVertical() {
        this.dy = 0;
    }

    stop() {
        this.dx = 0;
        this.dy = 0;
    }
}

class Bullet {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 4;
        this.height = 15;
        this.speed = 7;
        this.active = true;
    }

    draw() {
        ctx.fillStyle = '#ffff00';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    update() {
        this.y -= this.speed;
    }
}

class Enemy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 35;
        this.speed = 0.8 + Math.random() * 1.8;
        this.angle = Math.random() * Math.PI * 2;
        this.changeDirectionTimer = 0;
        this.changeDirectionDelay = 60 + Math.random() * 120;
        this.animFrame = 0;
        this.active = true;
    }

    draw() {
        this.animFrame += 0.1;

        ctx.fillStyle = colors.enemy;
        // Pas de shadowBlur

        // Tête rectangulaire
        ctx.fillRect(this.x + 8, this.y, 14, 12);

        // Antennes
        ctx.fillRect(this.x + 6, this.y - 4, 2, 4);
        ctx.fillRect(this.x + 22, this.y - 4, 2, 4);

        // Boules antennes
        ctx.beginPath();
        ctx.arc(this.x + 7, this.y - 4, 2, 0, Math.PI * 2);
        ctx.arc(this.x + 23, this.y - 4, 2, 0, Math.PI * 2);
        ctx.fill();

        // Corps
        ctx.fillRect(this.x + 5, this.y + 12, 20, 15);

        // Yeux (style LCD)
        ctx.fillStyle = '#000000';
        ctx.fillRect(this.x + 10, this.y + 4, 3, 4);
        ctx.fillRect(this.x + 17, this.y + 4, 3, 4);

        // Bouche/grille
        ctx.fillRect(this.x + 12, this.y + 9, 6, 1);

        // Bras animés
        const armOffset = Math.sin(this.animFrame) * 2;
        ctx.fillStyle = colors.enemy;
        ctx.fillRect(this.x, this.y + 14 + armOffset, 5, 8);
        ctx.fillRect(this.x + 25, this.y + 14 - armOffset, 5, 8);

        // Jambes
        ctx.fillRect(this.x + 9, this.y + 27, 5, 8);
        ctx.fillRect(this.x + 16, this.y + 27, 5, 8);

        // Pieds
        ctx.fillRect(this.x + 7, this.y + 35, 7, 2);
        ctx.fillRect(this.x + 16, this.y + 35, 7, 2);
    }

    update() {
        this.changeDirectionTimer++;

        if (this.changeDirectionTimer >= this.changeDirectionDelay) {
            this.angle = Math.random() * Math.PI * 2;
            this.changeDirectionTimer = 0;
            this.changeDirectionDelay = 60 + Math.random() * 120;
        }

        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;

        // Rebondir sur les bords
        if (this.x <= 0 || this.x + this.width >= canvas.width) {
            this.angle = Math.PI - this.angle;
            this.x = Math.max(0, Math.min(canvas.width - this.width, this.x));
        }
        if (this.y <= 0 || this.y + this.height >= canvas.height - 50) {
            this.angle = -this.angle;
            this.y = Math.max(0, Math.min(canvas.height - 50 - this.height, this.y));
        }
    }
}

class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 3 + 2;
        this.speedX = (Math.random() - 0.5) * 4;
        this.speedY = (Math.random() - 0.5) * 4;
        this.life = 30;
        this.maxLife = 30;
    }

    draw() {
        ctx.fillStyle = `rgba(255, ${100 + Math.random() * 155}, 0, ${this.life / this.maxLife})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life--;
    }
}

class Star {
    constructor() {
        this.reset();
        this.y = Math.random() * canvas.height;
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = 0;
        this.size = Math.random() * 2;
        this.speed = Math.random() * 2 + 0.5;
    }

    draw() {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillRect(this.x, this.y, this.size, this.size);
    }

    update() {
        this.y += this.speed;
        if (this.y > canvas.height) {
            this.reset();
        }
        if (this.x > canvas.width) {
            this.x = Math.random() * canvas.width;
        }
    }
}

let player = new Player();
let bullets = [];
let enemies = [];
let particles = [];
let stars = [];
let score = 0;
let lives = 3;
let gameActive = false;
let gamePaused = false;
let keys = {};
let canShoot = true;
let shootCooldown = 150;
let invulnerable = false;
let invulnerabilityTime = 0;

// Initialiser l'affichage des vies
if (document.getElementById('lives')) {
    updateLivesDisplay();
}

// Fonction pour redimensionner le canvas
function resizeCanvas() {
    const oldWidth = canvas.width;
    const oldHeight = canvas.height;

    if (window.innerWidth <= 768) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    } else {
        canvas.width = 800;
        canvas.height = 600;
    }

    // Repositionner le joueur
    if (player) {
        player.x = canvas.width / 2 - player.width / 2;
        player.y = canvas.height - 80;
    }

    // Repositionner les ennemis
    if (gameActive && enemies.length > 0) {
        spawnEnemies();
    }
}

// Créer des étoiles
function createStars() {
    stars = [];
    for (let i = 0; i < 100; i++) {
        stars.push(new Star());
    }
}

createStars();

// Créer des ennemis
function spawnEnemies() {
    enemies = [];

    let rows = window.innerWidth <= 768 ? 2 : 3;
    let cols = window.innerWidth <= 480 ? 4 : (window.innerWidth <= 768 ? 6 : 8);
    let spacing = canvas.width / (cols + 1);

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            enemies.push(new Enemy(col * spacing + spacing / 2, row * 60 + 30));
        }
    }
}

spawnEnemies();

// Appeler au chargement et au redimensionnement
resizeCanvas();
window.addEventListener('resize', () => {
    resizeCanvas();
    createStars();
});

// Contrôles clavier
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;

    if (e.key === ' ' && gameActive && canShoot && !gamePaused) {
        e.preventDefault();
        bullets.push(new Bullet(player.x + player.width / 2 - 2, player.y));
        playLaserSound();
        canShoot = false;
        setTimeout(() => {
            canShoot = true;
        }, shootCooldown);
    }

    if (e.key === ' ' && !gameActive) {
        e.preventDefault();
        resetGame();
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Contrôles tactiles
if (window.innerWidth <= 768) {
    document.getElementById('mobileControls').style.display = 'block';

    // Tir tactile
    document.getElementById('shootBtn').addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (gameActive && canShoot && !gamePaused) {
            bullets.push(new Bullet(player.x + player.width / 2 - 2, player.y));
            playLaserSound();
            canShoot = false;
            setTimeout(() => {
                canShoot = true;
            }, shootCooldown);
        }
    });

    // Déplacement tactile sur le canvas
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (gameActive && !gamePaused) {
            const touch = e.touches[0];
            const rect = canvas.getBoundingClientRect();
            player.x = touch.clientX - rect.left - player.width / 2;
            player.y = touch.clientY - rect.top - player.height / 2;

            // Limites
            player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));
            player.y = Math.max(0, Math.min(canvas.height - player.height, player.y));
        }
    });
}

function resetGame() {
    player = new Player();
    player.x = canvas.width / 2 - player.width / 2;
    player.y = canvas.height - 80;
    bullets = [];
    particles = [];
    score = 0;
    lives = 3;
    gameActive = true;
    gamePaused = false;
    canShoot = true;
    invulnerable = false;
    invulnerabilityTime = 0;
    gameOverEl.style.display = 'none';
    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('pauseScreen').style.display = 'none';
    spawnEnemies();
    scoreEl.textContent = score;
    updateLivesDisplay();
}

function checkCollision(rect1, rect2) {
    const margin = 2;

    return rect1.x + margin < rect2.x + rect2.width - margin &&
        rect1.x + rect1.width - margin > rect2.x + margin &&
        rect1.y + margin < rect2.y + rect2.height - margin &&
        rect1.y + rect1.height - margin > rect2.y + margin;
}

function createExplosion(x, y) {
    for (let i = 0; i < 15; i++) {
        particles.push(new Particle(x, y));
    }
}

function update() {
    if (!gameActive || gamePaused) return;

    // Mouvement du joueur
    if ((keys['ArrowLeft'] || keys['q']) && (keys['ArrowUp'] || keys['z'])) {
        player.moveLeft();
        player.moveUp();
    } else if ((keys['ArrowRight'] || keys['d']) && (keys['ArrowUp'] || keys['z'])) {
        player.moveRight();
        player.moveUp();
    } else if ((keys['ArrowLeft'] || keys['q']) && (keys['ArrowDown'] || keys['s'])) {
        player.moveLeft();
        player.moveDown();
    } else if ((keys['ArrowRight'] || keys['d']) && (keys['ArrowDown'] || keys['s'])) {
        player.moveRight();
        player.moveDown();
    } else if (keys['ArrowLeft'] || keys['q']) {
        player.moveLeft();
        player.stopVertical();
    } else if (keys['ArrowRight'] || keys['d']) {
        player.moveRight();
        player.stopVertical();
    } else if (keys['ArrowUp'] || keys['z']) {
        player.moveUp();
        player.stopHorizontal();
    } else if (keys['ArrowDown'] || keys['s']) {
        player.moveDown();
        player.stopHorizontal();
    } else {
        player.stop();
    }

    player.update();

    stars.forEach(star => star.update());

    bullets.forEach(bullet => {
        if (bullet.active) {
            bullet.update();
        }
    });
    bullets = bullets.filter(bullet => bullet.y > 0 && bullet.active);

    enemies.forEach(enemy => {
        if (enemy.active) {
            enemy.update();
        }
    });

    // Vérifier les collisions balles-ennemis
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        if (!bullet.active) continue;

        for (let j = enemies.length - 1; j >= 0; j--) {
            const enemy = enemies[j];
            if (!enemy.active) continue;

            if (checkCollision(bullet, enemy)) {
                bullet.active = false;
                enemy.active = false;
                bullets.splice(i, 1);
                enemies.splice(j, 1);
                score += 10;
                scoreEl.textContent = score;
                createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
                playExplosionSound();
                break;
            }
        }
    }

    // Nettoyer les ennemis inactifs
    enemies = enemies.filter(enemy => enemy.active);

    // Vérifier si les ennemis touchent le joueur
    enemies.forEach(enemy => {
        if (enemy.active && !invulnerable && checkCollision(player, enemy)) {
            lives--;
            updateLivesDisplay();
            createExplosion(player.x + player.width / 2, player.y + player.height / 2);
            playHitSound();

            enemy.active = false;

            invulnerable = true;
            invulnerabilityTime = 120;

            if (lives <= 0) {
                gameActive = false;
                gameOverEl.style.display = 'block';
                finalScoreEl.textContent = score;
                playGameOverSound();
            } else {
                player.x = canvas.width / 2 - player.width / 2;
                player.y = canvas.height - 80;
            }
        }
    });

    particles = particles.filter(p => p.life > 0);
    particles.forEach(particle => particle.update());

    if (invulnerable) {
        invulnerabilityTime--;
        if (invulnerabilityTime <= 0) {
            invulnerable = false;
        }
    }

    // Respawn des ennemis
    if (enemies.length === 0) {
        spawnEnemies();
    }
}

function draw() {
    // Fond avec dégradé (pas complètement opaque pour garder l'effet de traînée)
    ctx.fillStyle = 'rgba(0, 8, 20, 0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    stars.forEach(star => star.draw());
    particles.forEach(particle => particle.draw());
    player.draw();
    bullets.forEach(bullet => {
        if (bullet.active) bullet.draw();
    });
    enemies.forEach(enemy => {
        if (enemy.active) enemy.draw();
    });
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function updateLivesDisplay() {
    const livesEl = document.getElementById('lives');
    livesEl.innerHTML = '';

    for (let i = 0; i < lives; i++) {
        const heart = document.createElement('span');
        heart.innerHTML = '❤';
        heart.style.color = '#ff0000 !important';
        heart.style.textShadow = '0 0 10px #ff0000 !important';
        heart.style.marginLeft = '5px';
        heart.style.display = 'inline';
        heart.style.verticalAlign = 'middle';
        livesEl.appendChild(heart);
    }
}

gameLoop();