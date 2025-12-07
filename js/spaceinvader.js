/**
 * ============================================
 * JEU SPACE INVADERS
 * ============================================
 * 
 * Ce fichier contient tout le code du jeu Space Invaders intégré au portfolio.
 * 
 * Fonctionnalités :
 * - Vaisseau joueur contrôlable (clavier ou tactile)
 * - Ennemis qui se déplacent et descendent
 * - Système de tir et collisions
 * - Système de score et de vies
 * - Effets sonores générés dynamiquement
 * - Personnalisation des couleurs
 * - Musique de fond
 * - Support mobile (contrôles tactiles)
 * 
 * Technologies utilisées :
 * - Canvas HTML5 pour le rendu graphique
 * - Web Audio API pour les sons
 * - Classes ES6 pour l'organisation du code
 */

// ============================================
// CONFIGURATION DES COULEURS
// ============================================
// Objet qui stocke les couleurs personnalisables du jeu
let colors = {
    player: '#00ffff',      // Couleur du vaisseau joueur (cyan par défaut)
    enemy: '#ff00eaff',     // Couleur des ennemis (magenta par défaut)
    border: '#00ffff'       // Couleur du cadre du jeu (cyan par défaut)
};

// ============================================
// MUSIQUE DE FOND
// ============================================
// Création de l'élément audio pour la musique de fond
const music = new Audio('assets/music/galacticknight.mp3');
music.loop = true;        // La musique se répète en boucle
music.volume = 0.5;      // Volume à 50%

// ============================================
// PANNEAU DE PERSONNALISATION
// ============================================
// Création d'un panneau qui permet de changer les couleurs du jeu
const customPanel = document.createElement('div');
customPanel.id = 'customPanel';

// Style du panneau (positionné à droite, caché par défaut)
customPanel.style.cssText = `
    position: fixed;
    top: 50%;
    right: -300px;              /* Caché à droite de l'écran */
    transform: translateY(-50%);
    width: 300px;
    background: rgba(0, 20, 40, 0.95);
    border: 2px solid #00ffff;
    border-right: none;
    border-radius: 10px 0 0 10px;
    padding: 20px;
    z-index: 100;
    transition: right 0.3s;    /* Animation d'ouverture */
    box-shadow: -5px 0 20px rgba(0, 255, 255, 0.3);
    font-family: 'Press Start 2P', cursive !important;
`;

// Contenu HTML du panneau (sélecteurs de couleur)
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

// Ajouter le panneau à la page
document.body.appendChild(customPanel);

// ============================================
// BOUTON POUR OUVRIR/FERMER LE PANNEAU
// ============================================
// Création d'un bouton avec une icône de palette
const togglePanelBtn = document.createElement('button');
togglePanelBtn.innerHTML = '<i class="fas fa-palette"></i>';

// Style du bouton (positionné à droite de l'écran)
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

// Variable qui indique si le panneau est ouvert
let panelOpen = false;

// Quand on clique sur le bouton, on ouvre/ferme le panneau
togglePanelBtn.addEventListener('click', () => {
    panelOpen = !panelOpen;
    // Si ouvert, on fait glisser le panneau depuis la droite
    customPanel.style.right = panelOpen ? '0px' : '-300px';
    // On déplace aussi le bouton pour qu'il ne soit pas caché
    togglePanelBtn.style.right = panelOpen ? '320px' : '20px';
});

// Effet hover sur le bouton (agrandissement)
togglePanelBtn.addEventListener('mouseenter', () => {
    togglePanelBtn.style.transform = 'translateY(-50%) scale(1.1)';
    togglePanelBtn.style.boxShadow = '0 0 20px rgba(0, 255, 255, 0.8)';
});

togglePanelBtn.addEventListener('mouseleave', () => {
    togglePanelBtn.style.transform = 'translateY(-50%) scale(1)';
    togglePanelBtn.style.boxShadow = '0 0 10px rgba(0, 255, 255, 0.5)';
});

// ============================================
// GESTION DES CHANGEMENTS DE COULEUR
// ============================================
// Quand on change la couleur du vaisseau
document.getElementById('playerColor').addEventListener('input', (e) => {
    colors.player = e.target.value;
});

// Quand on change la couleur des ennemis
document.getElementById('enemyColor').addEventListener('input', (e) => {
    colors.enemy = e.target.value + 'ff';  // On ajoute 'ff' pour l'opacité
});

// Quand on change la couleur du cadre
document.getElementById('borderColor').addEventListener('input', (e) => {
    colors.border = e.target.value;
    const gameCanvas = document.getElementById('gameCanvas');
    gameCanvas.style.borderColor = e.target.value;
    // On met aussi à jour l'ombre du conteneur
    document.getElementById('gameContainer').style.boxShadow = `0 0 40px ${e.target.value}80`;
});

// Bouton reset pour remettre les couleurs par défaut
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

// ============================================
// BOUTON PLAY/PAUSE MUSIQUE
// ============================================
// Création d'un bouton pour contrôler la musique
const musicButton = document.createElement('button');
musicButton.id = 'musicButton';
musicButton.innerHTML = '<i class="fas fa-volume-mute"></i>';

// Style du bouton (en haut à droite)
musicButton.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: rgba(255, 0, 0, 0.2);    /* Rouge quand muet */
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

// Variable qui indique si la musique joue
let musicPlaying = false;

// Quand on clique sur le bouton, on joue/pause la musique
musicButton.addEventListener('click', () => {
    if (musicPlaying) {
        // Si elle joue, on la met en pause
        music.pause();
        musicButton.innerHTML = '<i class="fas fa-volume-mute"></i>';
        musicButton.style.background = 'rgba(255, 0, 0, 0.2)';
        musicButton.style.borderColor = '#ff0000';
        musicButton.style.color = '#ff0000';
    } else {
        // Si elle est en pause, on la lance
        music.play();
        musicButton.innerHTML = '<i class="fas fa-volume-up"></i>';
        musicButton.style.background = 'rgba(0, 255, 255, 0.2)';
        musicButton.style.borderColor = '#00ffff';
        musicButton.style.color = '#00ffff';
    }
    musicPlaying = !musicPlaying;
});

// Effet hover sur le bouton musique
musicButton.addEventListener('mouseenter', () => {
    musicButton.style.transform = 'scale(1.1)';
    musicButton.style.boxShadow = '0 0 20px rgba(0, 255, 255, 0.8)';
});

musicButton.addEventListener('mouseleave', () => {
    musicButton.style.transform = 'scale(1)';
    musicButton.style.boxShadow = '0 0 10px rgba(0, 255, 255, 0.5)';
});

// Raccourci clavier : M pour activer/désactiver la musique
document.addEventListener('keydown', function onMusicToggle(e) {
    if (e.code === 'KeyM') {
        musicButton.click();
    }
});

// ============================================
// GESTIONNAIRES D'ÉVÉNEMENTS
// ============================================

// Écran de démarrage : bouton pour commencer le jeu
document.getElementById('startButton').addEventListener('click', function () {
    initAudioContext();  // Initialiser l'audio au premier clic (requis par les navigateurs)
    document.getElementById('startScreen').style.display = 'none';
    gameActive = true;
    gamePaused = false;
});

// Menu de pause : bouton pour reprendre
document.getElementById('resumeButton').addEventListener('click', function () {
    document.getElementById('pauseScreen').style.display = 'none';
    gamePaused = false;
});

// Menu de pause : bouton pour redémarrer
document.getElementById('restartButton').addEventListener('click', function () {
    document.getElementById('pauseScreen').style.display = 'none';
    resetGame();
});

// Touche Échap pour mettre en pause/reprendre
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

// ============================================
// INITIALISATION DU CANVAS
// ============================================
// Récupération du canvas et de son contexte de dessin
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');  // Contexte 2D pour dessiner

// Récupération des éléments d'interface
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');
const gameOverEl = document.getElementById('gameOver');
const finalScoreEl = document.getElementById('finalScore');

// ============================================
// SYSTÈME AUDIO POUR LES EFFETS SONORES
// ============================================
// Audio Context : nécessaire pour générer des sons
let audioCtx = null;

/**
 * Initialise l'audio context (requis par les navigateurs pour éviter l'autoplay)
 */
function initAudioContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}

/**
 * Joue un son de laser quand on tire
 */
function playLaserSound() {
    initAudioContext();
    
    // Création d'un oscillateur (génère un son)
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();  // Pour contrôler le volume
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    // Fréquence qui descend rapidement (effet laser)
    oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(200, audioCtx.currentTime + 0.1);
    
    // Volume qui diminue rapidement
    gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
    
    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 0.1);
}

/**
 * Joue un son d'explosion quand un ennemi est détruit
 */
function playExplosionSound() {
    initAudioContext();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    // Type de son "sawtooth" pour un effet plus brut
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(200, audioCtx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + 0.3);
    
    gainNode.gain.setValueAtTime(0.4, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
    
    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 0.3);
}

/**
 * Joue un son d'impact quand le joueur est touché
 */
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
    
    // Bruit blanc pour l'impact (son aléatoire)
    const bufferSize = audioCtx.sampleRate * 0.3;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    
    // Remplir avec des valeurs aléatoires
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
    
    // Résonance métallique (son supplémentaire)
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

/**
 * Joue une mélodie de Game Over (notes descendantes)
 */
function playGameOverSound() {
    initAudioContext();
    // Séquence de notes descendantes pour le Game Over
    const notes = [440, 392, 349, 294, 262]; // A4, G4, F4, D4, C4
    const duration = 0.3;
    
    // Jouer chaque note une par une
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

// ============================================
// CLASSES DU JEU
// ============================================

/**
 * Classe représentant le vaisseau du joueur
 */
class Player {
    constructor() {
        this.width = 40;      // Largeur du vaisseau
        this.height = 40;     // Hauteur du vaisseau
        this.x = canvas.width / 2 - this.width / 2;  // Position X (centré)
        this.y = canvas.height - 80;                  // Position Y (en bas)
        this.speed = 5;       // Vitesse de déplacement
        this.dx = 0;          // Vitesse horizontale actuelle
        this.dy = 0;          // Vitesse verticale actuelle
    }
    
    /**
     * Dessine le vaisseau sur le canvas
     */
    draw() {
        // Effet de clignotement pendant l'invincibilité
        if (invulnerable && Math.floor(invulnerabilityTime / 10) % 2 === 0) {
            ctx.globalAlpha = 0.3;  // Rendre semi-transparent
        }
        
        ctx.fillStyle = colors.player;
        
        // Corps principal du vaisseau (rectangle)
        ctx.fillRect(this.x + 15, this.y + 10, 10, 25);
        
        // Nez du vaisseau (triangle)
        ctx.beginPath();
        ctx.moveTo(this.x + 20, this.y);
        ctx.lineTo(this.x + 25, this.y + 10);
        ctx.lineTo(this.x + 15, this.y + 10);
        ctx.closePath();
        ctx.fill();
        
        // Aile gauche
        ctx.beginPath();
        ctx.moveTo(this.x, this.y + 20);
        ctx.lineTo(this.x + 15, this.y + 15);
        ctx.lineTo(this.x + 15, this.y + 30);
        ctx.lineTo(this.x + 5, this.y + 35);
        ctx.closePath();
        ctx.fill();
        
        // Aile droite
        ctx.beginPath();
        ctx.moveTo(this.x + 40, this.y + 20);
        ctx.lineTo(this.x + 25, this.y + 15);
        ctx.lineTo(this.x + 25, this.y + 30);
        ctx.lineTo(this.x + 35, this.y + 35);
        ctx.closePath();
        ctx.fill();
        
        // Réacteurs (orange)
        ctx.fillStyle = '#ff6600';
        ctx.fillRect(this.x + 16, this.y + 35, 3, 5);
        ctx.fillRect(this.x + 21, this.y + 35, 3, 5);
        
        // Cockpit (fenêtre blanche)
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(this.x + 20, this.y + 15, 4, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.globalAlpha = 1.0;  // Remettre l'opacité normale
    }
    
    /**
     * Met à jour la position du vaisseau
     */
    update() {
        this.x += this.dx;
        this.y += this.dy;
        
        // Empêcher le vaisseau de sortir du canvas
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > canvas.width) this.x = canvas.width - this.width;
        if (this.y < 0) this.y = 0;
        if (this.y + this.height > canvas.height) this.y = canvas.height - this.height;
    }
    
    // Méthodes de mouvement
    moveLeft() { this.dx = -this.speed; }
    moveRight() { this.dx = this.speed; }
    moveUp() { this.dy = -this.speed; }
    moveDown() { this.dy = this.speed; }
    stopHorizontal() { this.dx = 0; }
    stopVertical() { this.dy = 0; }
    stop() { this.dx = 0; this.dy = 0; }
}

/**
 * Classe représentant une balle tirée par le joueur
 */
class Bullet {
    constructor(x, y) {
        this.x = x;           // Position X
        this.y = y;           // Position Y
        this.width = 4;       // Largeur
        this.height = 15;      // Hauteur
        this.speed = 7;        // Vitesse de déplacement vers le haut
        this.active = true;   // Si la balle est active (pas encore sortie de l'écran)
    }
    
    /**
     * Dessine la balle
     */
    draw() {
        ctx.fillStyle = '#ffff00';  // Jaune
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
    
    /**
     * Met à jour la position (la balle monte)
     */
    update() {
        this.y -= this.speed;
    }
}

/**
 * Classe représentant un ennemi
 */
class Enemy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 35;
        this.speed = 0.8 + Math.random() * 1.8;  // Vitesse aléatoire
        this.angle = Math.random() * Math.PI * 2; // Direction aléatoire
        this.changeDirectionTimer = 0;            // Compteur pour changer de direction
        this.changeDirectionDelay = 60 + Math.random() * 120;  // Délai avant changement
        this.animFrame = 0;                       // Frame d'animation
        this.active = true;                       // Si l'ennemi est actif
    }
    
    /**
     * Dessine l'ennemi (style Space Invaders classique)
     */
    draw() {
        this.animFrame += 0.1;  // Incrémenter l'animation
        
        ctx.fillStyle = colors.enemy;
        
        // Tête rectangulaire
        ctx.fillRect(this.x + 8, this.y, 14, 12);
        
        // Antennes
        ctx.fillRect(this.x + 6, this.y - 4, 2, 4);
        ctx.fillRect(this.x + 22, this.y - 4, 2, 4);
        
        // Boules aux extrémités des antennes
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
        
        // Bras animés (bougent avec sin)
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
    
    /**
     * Met à jour la position de l'ennemi
     */
    update() {
        this.changeDirectionTimer++;
        
        // Changer de direction périodiquement
        if (this.changeDirectionTimer >= this.changeDirectionDelay) {
            this.angle = Math.random() * Math.PI * 2;
            this.changeDirectionTimer = 0;
            this.changeDirectionDelay = 60 + Math.random() * 120;
        }
        
        // Déplacer selon l'angle
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

/**
 * Classe représentant une particule d'explosion
 */
class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 3 + 2;                    // Taille aléatoire
        this.speedX = (Math.random() - 0.5) * 4;              // Vitesse X aléatoire
        this.speedY = (Math.random() - 0.5) * 4;              // Vitesse Y aléatoire
        this.life = 30;                                        // Durée de vie
        this.maxLife = 30;
    }
    
    /**
     * Dessine la particule
     */
    draw() {
        // Couleur orange/jaune avec opacité qui diminue
        ctx.fillStyle = `rgba(255, ${100 + Math.random() * 155}, 0, ${this.life / this.maxLife})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
    
    /**
     * Met à jour la position et la durée de vie
     */
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life--;  // Diminuer la durée de vie
    }
}

/**
 * Classe représentant une étoile de fond
 */
class Star {
    constructor() {
        this.reset();
        this.y = Math.random() * canvas.height;
    }
    
    /**
     * Réinitialise la position de l'étoile
     */
    reset() {
        this.x = Math.random() * canvas.width;
        this.y = 0;
        this.size = Math.random() * 2;
        this.speed = Math.random() * 2 + 0.5;
    }
    
    /**
     * Dessine l'étoile
     */
    draw() {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillRect(this.x, this.y, this.size, this.size);
    }
    
    /**
     * Met à jour la position (l'étoile descend)
     */
    update() {
        this.y += this.speed;
        if (this.y > canvas.height) {
            this.reset();  // Réapparaître en haut
        }
        if (this.x > canvas.width) {
            this.x = Math.random() * canvas.width;
        }
    }
}

// ============================================
// VARIABLES GLOBALES DU JEU
// ============================================
let player = new Player();      // Instance du joueur
let bullets = [];               // Tableau des balles
let enemies = [];               // Tableau des ennemis
let particles = [];             // Tableau des particules d'explosion
let stars = [];                 // Tableau des étoiles de fond
let score = 0;                  // Score actuel
let lives = 3;                  // Nombre de vies
let gameActive = false;         // Si le jeu est actif
let gamePaused = false;         // Si le jeu est en pause
let keys = {};                  // Objet qui stocke les touches pressées
let canShoot = true;            // Si on peut tirer (cooldown)
let shootCooldown = 150;        // Délai entre deux tirs (en millisecondes)
let invulnerable = false;       // Si le joueur est invincible
let invulnerabilityTime = 0;    // Temps restant d'invincibilité

// Initialiser l'affichage des vies
if (document.getElementById('lives')) {
    updateLivesDisplay();
}

// ============================================
// FONCTIONS UTILITAIRES
// ============================================

/**
 * Redimensionne le canvas selon la taille de l'écran
 */
function resizeCanvas() {
    const oldWidth = canvas.width;
    const oldHeight = canvas.height;
    
    // Sur mobile, le canvas prend toute la fenêtre
    if (window.innerWidth <= 768) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    } else {
        // Sur desktop, taille fixe
        canvas.width = 800;
        canvas.height = 600;
    }
    
    // Repositionner le joueur au centre
    if (player) {
        player.x = canvas.width / 2 - player.width / 2;
        player.y = canvas.height - 80;
    }
    
    // Recréer les ennemis si le jeu est actif
    if (gameActive && enemies.length > 0) {
        spawnEnemies();
    }
}

/**
 * Crée les étoiles de fond
 */
function createStars() {
    stars = [];
    for (let i = 0; i < 100; i++) {
        stars.push(new Star());
    }
}

createStars();

/**
 * Crée les ennemis au début du jeu
 */
function spawnEnemies() {
    enemies = [];
    
    // Nombre de lignes et colonnes selon la taille de l'écran
    let rows = window.innerWidth <= 768 ? 2 : 3;
    let cols = window.innerWidth <= 480 ? 4 : (window.innerWidth <= 768 ? 6 : 8);
    let spacing = canvas.width / (cols + 1);
    
    // Créer une grille d'ennemis
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

// ============================================
// CONTRÔLES CLAVIER
// ============================================
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;  // Marquer la touche comme pressée
    
    // Espace pour tirer
    if (e.key === ' ' && gameActive && canShoot && !gamePaused) {
        e.preventDefault();
        // Créer une balle au centre du vaisseau
        bullets.push(new Bullet(player.x + player.width / 2 - 2, player.y));
        playLaserSound();
        canShoot = false;
        // Réactiver le tir après le cooldown
        setTimeout(() => {
            canShoot = true;
        }, shootCooldown);
    }
    
    // Espace pour redémarrer si le jeu n'est pas actif
    if (e.key === ' ' && !gameActive) {
        e.preventDefault();
        resetGame();
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;  // Marquer la touche comme relâchée
});

// ============================================
// CONTRÔLES TACTILES (MOBILE)
// ============================================
if (window.innerWidth <= 768) {
    document.getElementById('mobileControls').style.display = 'block';
    
    // Bouton de tir tactile
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
            // Positionner le vaisseau sous le doigt
            player.x = touch.clientX - rect.left - player.width / 2;
            player.y = touch.clientY - rect.top - player.height / 2;
            
            // Limites
            player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));
            player.y = Math.max(0, Math.min(canvas.height - player.height, player.y));
        }
    });
}

/**
 * Réinitialise le jeu
 */
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

/**
 * Vérifie si deux rectangles se chevauchent (collision)
 */
function checkCollision(rect1, rect2) {
    const margin = 2;  // Marge pour rendre les collisions plus faciles
    
    return rect1.x + margin < rect2.x + rect2.width - margin &&
        rect1.x + rect1.width - margin > rect2.x + margin &&
        rect1.y + margin < rect2.y + rect2.height - margin &&
        rect1.y + rect1.height - margin > rect2.y + margin;
}

/**
 * Crée une explosion de particules à une position donnée
 */
function createExplosion(x, y) {
    for (let i = 0; i < 15; i++) {
        particles.push(new Particle(x, y));
    }
}

// ============================================
// BOUCLE PRINCIPALE DU JEU
// ============================================

/**
 * Fonction qui met à jour l'état du jeu (appelée à chaque frame)
 */
function update() {
    if (!gameActive || gamePaused) return;
    
    // Mouvement du joueur selon les touches pressées
    // Gestion des mouvements diagonaux
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
    
    // Mettre à jour les étoiles de fond
    stars.forEach(star => star.update());
    
    // Mettre à jour les balles
    bullets.forEach(bullet => {
        if (bullet.active) {
            bullet.update();
        }
    });
    // Retirer les balles qui sont sorties de l'écran
    bullets = bullets.filter(bullet => bullet.y > 0 && bullet.active);
    
    // Mettre à jour les ennemis
    enemies.forEach(enemy => {
        if (enemy.active) {
            enemy.update();
        }
    });
    
    // Vérifier les collisions entre balles et ennemis
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        if (!bullet.active) continue;
        
        for (let j = enemies.length - 1; j >= 0; j--) {
            const enemy = enemies[j];
            if (!enemy.active) continue;
            
            if (checkCollision(bullet, enemy)) {
                // Collision détectée !
                bullet.active = false;
                enemy.active = false;
                bullets.splice(i, 1);
                enemies.splice(j, 1);
                score += 10;  // Ajouter 10 points
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
            lives--;  // Perdre une vie
            updateLivesDisplay();
            createExplosion(player.x + player.width / 2, player.y + player.height / 2);
            playHitSound();
            
            enemy.active = false;
            
            // Activer l'invincibilité temporaire
            invulnerable = true;
            invulnerabilityTime = 120;  // 120 frames d'invincibilité
            
            if (lives <= 0) {
                // Game Over
                gameActive = false;
                gameOverEl.style.display = 'block';
                finalScoreEl.textContent = score;
                playGameOverSound();
            } else {
                // Repositionner le joueur au centre
                player.x = canvas.width / 2 - player.width / 2;
                player.y = canvas.height - 80;
            }
        }
    });
    
    // Mettre à jour les particules
    particles = particles.filter(p => p.life > 0);
    particles.forEach(particle => particle.update());
    
    // Gérer l'invincibilité
    if (invulnerable) {
        invulnerabilityTime--;
        if (invulnerabilityTime <= 0) {
            invulnerable = false;
        }
    }
    
    // Si tous les ennemis sont détruits, en créer de nouveaux
    if (enemies.length === 0) {
        spawnEnemies();
    }
}

/**
 * Fonction qui dessine tout sur le canvas (appelée à chaque frame)
 */
function draw() {
    // Fond avec dégradé (légèrement transparent pour l'effet de traînée)
    ctx.fillStyle = 'rgba(0, 8, 20, 0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Dessiner les étoiles
    stars.forEach(star => star.draw());
    
    // Dessiner les particules
    particles.forEach(particle => particle.draw());
    
    // Dessiner le joueur
    player.draw();
    
    // Dessiner les balles
    bullets.forEach(bullet => {
        if (bullet.active) bullet.draw();
    });
    
    // Dessiner les ennemis
    enemies.forEach(enemy => {
        if (enemy.active) enemy.draw();
    });
}

/**
 * Boucle principale du jeu (appelée en continu)
 */
function gameLoop() {
    update();  // Mettre à jour l'état
    draw();     // Dessiner
    requestAnimationFrame(gameLoop);  // Demander la prochaine frame
}

/**
 * Met à jour l'affichage des vies (cœurs)
 */
function updateLivesDisplay() {
    const livesEl = document.getElementById('lives');
    livesEl.innerHTML = '';
    
    // Créer un cœur pour chaque vie restante
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

// Démarrer la boucle du jeu
gameLoop();
