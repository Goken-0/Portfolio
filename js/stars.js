/**
 * ============================================
 * FOND SPATIAL ANIMÉ (CANVAS 2D)
 * ============================================
 *
 * Champ d'étoiles en perspective qui défile en permanence vers le spectateur,
 * et qui passe en « vitesse lumière » à chaque navigation : les étoiles
 * s'étirent alors en traînées avant de revenir à leur dérive tranquille.
 *
 * Portage du fond du portfolio de Sonny (src/scripts/space_background.ts),
 * adapté au routeur SPA par hash de ce site : les événements de navigation
 * d'Astro sont remplacés par les clics sur les onglets et par `hashchange`.
 *
 * Aucune dépendance : canvas 2D natif, pas de Three.js, pas de WebGL.
 *
 * Les étoiles sont stockées en coordonnées polaires (rayon depuis le centre,
 * angle, décalage de profondeur) plutôt qu'en coordonnées écran. La position
 * et la taille à l'écran sont recalculées à chaque frame : animer une étoile
 * revient donc simplement à faire avancer le temps, sans jamais modifier son
 * état propre.
 */

(function () {
'use strict';

// ---- Champ d'étoiles ----
const STAR_COUNT = 700;
const DEPTH = 2000;
const MAX_STAR_RADIUS = 500;
const FULL_TURN_RADIANS = Math.PI * 2;

// ---- Apparence ----
const BACKGROUND_COLOR = '#000000';
const STAR_COLOR_RGB = '224, 234, 255';

// ---- Caméra ----
const CAMERA_FIELD_OF_VIEW_DEGREES = 75;
const NEAR_DISTANCE = 0.5;
const POINT_RADIUS_FALLOFF = 300;
const MIN_POINT_RADIUS = 0.5;
const MAX_POINT_RADIUS = 3;
const MIN_ALPHA = 0.08;
const MAX_ALPHA = 0.95;

// ---- Vitesses de défilement ----
const IDLE_WARP_SPEED = 20;
const NAVIGATION_WARP_SPEED = 400;
const WARP_ACCELERATION_DURATION_MS = 450;
const WARP_DECELERATION_DURATION_MS = 900;
// Plancher sur la durée d'affichage du warp : une navigation SPA est
// instantanée, sans ce minimum l'effet serait trop bref pour être vu.
const WARP_MIN_VISIBLE_DURATION_MS = 500;
const ARRIVAL_WARP_SPEED = 600;
const ARRIVAL_EASE_DURATION_MS = 1800;

// ---- Traînées ----
const STREAK_DURATION_SECONDS = 0.05;
const STREAK_ALPHA_FACTOR = 0.6;
const STREAK_WIDTH_FACTOR = 1.5;
const STREAK_MAX_LENGTH_PX = 120;
// En dessous de ce seuil il n'y a que la dérive de repos : on dessine alors de
// simples points, pour que les traînées ne signalent qu'une vraie transition
// (navigation ou plongée d'arrivée).
const STREAK_VISIBILITY_SPEED_THRESHOLD = IDLE_WARP_SPEED * 2;

// ---- Cadence de rendu ----
const REFRESH_SAMPLE_FRAME_COUNT = 10;
const HIGH_REFRESH_HZ_THRESHOLD = 90;
const MID_REFRESH_HZ_THRESHOLD = 50;
const HIGH_TIER_FRAMES_PER_SECOND = 60;
const MID_TIER_FRAMES_PER_SECOND = 30;
const LOW_TIER_FRAMES_PER_SECOND = 24;

// ---- Étoiles filantes ----
const SHOOTING_STAR_MIN_DELAY_S = 4;      // délai mini avant la prochaine
const SHOOTING_STAR_MAX_DELAY_S = 11;     // délai maxi avant la prochaine
const SHOOTING_STAR_SPEED_MIN = 900;      // pixels/seconde
const SHOOTING_STAR_SPEED_MAX = 1500;
const SHOOTING_STAR_LENGTH_MIN = 140;     // longueur de la traînée, en pixels
const SHOOTING_STAR_LENGTH_MAX = 320;
const SHOOTING_STAR_LIFETIME_S = 1.1;
const SHOOTING_STAR_WIDTH = 2;
const SHOOTING_STAR_FADE_IN = 0.15;       // fraction de la vie passée en fondu d'entrée
// Angle de chute, en degrés depuis l'horizontale (vers le bas-droite)
const SHOOTING_STAR_ANGLE_MIN_DEG = 20;
const SHOOTING_STAR_ANGLE_MAX_DEG = 40;

const MAX_DELTA_SECONDS = 0.1;
const MILLISECONDS_PER_SECOND = 1000;
const DEGREES_PER_HALF_TURN = 180;

// Exposé tout de suite : si le canvas 2D est indisponible, les clics sur les
// onglets appelleront une fonction inoffensive au lieu de planter.
window.triggerWarp = function () {};

// ============================================
// OUTILS
// ============================================

function lerp(start, end, progress) {
    return start + (end - start) * progress;
}

function easeInOutCubic(progress) {
    return progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;
}

function wrapDepth(value) {
    return ((value % DEPTH) + DEPTH) % DEPTH;
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function computeFocalLength(fieldOfViewDegrees) {
    return 1 / Math.tan((fieldOfViewDegrees * Math.PI) / (2 * DEGREES_PER_HALF_TURN));
}

// ============================================
// CANVAS
// ============================================

const canvas = document.createElement('canvas');
canvas.id = 'space-background';
canvas.className = 'background';
canvas.setAttribute('aria-hidden', 'true');

const context = canvas.getContext('2d');
if (!context) return;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

function attachCanvas() {
    if (!canvas.isConnected) document.body.appendChild(canvas);
}
if (document.body) {
    attachCanvas();
} else {
    document.addEventListener('DOMContentLoaded', attachCanvas);
}

window.addEventListener('resize', function () {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// ============================================
// ÉTOILES
// ============================================

// La racine carrée sur le rayon donne une répartition uniforme dans le disque :
// sans elle, les étoiles s'agglutineraient au centre.
const stars = Array.from({ length: STAR_COUNT }, function () {
    return {
        radius: Math.sqrt(Math.random()) * MAX_STAR_RADIUS,
        angle: Math.random() * FULL_TURN_RADIANS,
        zPhase: Math.random() * DEPTH
    };
});

// ============================================
// ÉTOILES FILANTES
// ============================================
//
// Indépendantes du champ d'étoiles : elles vivent en coordonnées écran, pas
// dans le tunnel en perspective. Une seule à la fois, relancée après un délai
// aléatoire — assez rare pour rester un petit événement quand elle passe.

let shootingStar = null;
let nextShootingStarIn = randomBetween(SHOOTING_STAR_MIN_DELAY_S, SHOOTING_STAR_MAX_DELAY_S);

function randomBetween(min, max) {
    return min + Math.random() * (max - min);
}

/**
 * Crée une étoile filante démarrant hors champ, en haut, avec une trajectoire
 * descendante vers la droite. La marge négative en X permet à certaines
 * d'entrer par le bord gauche plutôt que toujours par le haut.
 */
function spawnShootingStar() {
    const angle = (randomBetween(SHOOTING_STAR_ANGLE_MIN_DEG, SHOOTING_STAR_ANGLE_MAX_DEG) * Math.PI)
        / DEGREES_PER_HALF_TURN;

    shootingStar = {
        x: randomBetween(-canvas.width * 0.25, canvas.width * 0.9),
        y: randomBetween(-canvas.height * 0.1, canvas.height * 0.45),
        directionX: Math.cos(angle),
        directionY: Math.sin(angle),
        speed: randomBetween(SHOOTING_STAR_SPEED_MIN, SHOOTING_STAR_SPEED_MAX),
        length: randomBetween(SHOOTING_STAR_LENGTH_MIN, SHOOTING_STAR_LENGTH_MAX),
        age: 0
    };
}

function updateShootingStar(deltaSeconds) {
    if (shootingStar === null) {
        nextShootingStarIn -= deltaSeconds;
        if (nextShootingStarIn <= 0) spawnShootingStar();
        return;
    }

    shootingStar.age += deltaSeconds;
    shootingStar.x += shootingStar.directionX * shootingStar.speed * deltaSeconds;
    shootingStar.y += shootingStar.directionY * shootingStar.speed * deltaSeconds;

    const offScreen = shootingStar.x - shootingStar.length > canvas.width
        || shootingStar.y - shootingStar.length > canvas.height;

    if (shootingStar.age >= SHOOTING_STAR_LIFETIME_S || offScreen) {
        shootingStar = null;
        nextShootingStarIn = randomBetween(SHOOTING_STAR_MIN_DELAY_S, SHOOTING_STAR_MAX_DELAY_S);
    }
}

/**
 * Traînée dessinée avec un dégradé linéaire : opaque à la tête, transparente
 * à la queue. L'opacité globale monte vite puis redescend sur la durée de vie,
 * pour que l'étoile n'apparaisse ni ne disparaisse d'un coup.
 */
function drawShootingStar() {
    if (shootingStar === null) return;

    const progress = shootingStar.age / SHOOTING_STAR_LIFETIME_S;
    const opacity = progress < SHOOTING_STAR_FADE_IN
        ? progress / SHOOTING_STAR_FADE_IN
        : 1 - (progress - SHOOTING_STAR_FADE_IN) / (1 - SHOOTING_STAR_FADE_IN);

    const tailX = shootingStar.x - shootingStar.directionX * shootingStar.length;
    const tailY = shootingStar.y - shootingStar.directionY * shootingStar.length;

    const gradient = context.createLinearGradient(shootingStar.x, shootingStar.y, tailX, tailY);
    gradient.addColorStop(0, 'rgba(' + STAR_COLOR_RGB + ', ' + clamp(opacity, 0, 1) + ')');
    gradient.addColorStop(1, 'rgba(' + STAR_COLOR_RGB + ', 0)');

    context.beginPath();
    context.moveTo(shootingStar.x, shootingStar.y);
    context.lineTo(tailX, tailY);
    context.strokeStyle = gradient;
    context.lineWidth = SHOOTING_STAR_WIDTH;
    context.lineCap = 'round';
    context.stroke();

    // Petit point vif en tête, pour lui donner du relief
    context.beginPath();
    context.fillStyle = 'rgba(255, 255, 255, ' + clamp(opacity, 0, 1) + ')';
    context.arc(shootingStar.x, shootingStar.y, SHOOTING_STAR_WIDTH, 0, FULL_TURN_RADIANS);
    context.fill();
}

// ============================================
// ÉTAT DU WARP
// ============================================
//
// `currentSpeed` est recalculée à chaque frame en interpolant de
// `easeStartSpeed` vers `easeTargetSpeed` sur `easeDurationMs`, à partir de
// `easeStartTimestamp`. C'est une interpolation basée sur le temps (et non un
// lissage par frame) : la courbe est donc identique quelle que soit la cadence
// de rendu de la machine.

const warpState = {
    currentSpeed: IDLE_WARP_SPEED,
    easeStartSpeed: IDLE_WARP_SPEED,
    easeTargetSpeed: IDLE_WARP_SPEED,
    easeStartTimestamp: 0,
    easeDurationMs: 1,
    accumulatedTime: 0,
    lastRenderTimestamp: 0,
    // Instant (même horloge que l'interpolation) où la décélération démarre.
    // Piloter ça depuis la boucle plutôt qu'avec un setTimeout garde une seule
    // horloge : les deux ne peuvent pas dériver l'une par rapport à l'autre.
    decelerateAtTimestamp: Infinity
};

/**
 * Lance (ou redirige en plein vol) une transition de vitesse. On repart
 * toujours de la vitesse interpolée courante : deux navigations rapprochées
 * s'enchaînent en douceur au lieu de provoquer un saut.
 */
function setWarpTarget(targetSpeed, durationMs, timestamp) {
    warpState.easeStartSpeed = warpState.currentSpeed;
    warpState.easeTargetSpeed = targetSpeed;
    warpState.easeStartTimestamp = timestamp;
    warpState.easeDurationMs = durationMs;
}

/**
 * Plongée d'arrivée : on démarre à pleine vitesse et on redescend vers la
 * dérive de repos, donc les traînées sont longues au chargement puis se
 * rétractent en points à mesure que tout se stabilise.
 */
function startArrivalDive() {
    warpState.currentSpeed = ARRIVAL_WARP_SPEED;
    warpState.easeStartSpeed = ARRIVAL_WARP_SPEED;
    warpState.easeTargetSpeed = IDLE_WARP_SPEED;
    warpState.easeStartTimestamp = performance.now();
    warpState.easeDurationMs = ARRIVAL_EASE_DURATION_MS;
    warpState.decelerateAtTimestamp = Infinity;
}

/**
 * Rafale de navigation. Appelable à répétition : chaque appel relance la
 * montée en vitesse et repousse le début de la décélération.
 */
function triggerWarp() {
    const timestamp = performance.now();
    setWarpTarget(NAVIGATION_WARP_SPEED, WARP_ACCELERATION_DURATION_MS, timestamp);
    warpState.decelerateAtTimestamp = timestamp + WARP_MIN_VISIBLE_DURATION_MS;
}

window.triggerWarp = triggerWarp;

// ============================================
// PROJECTION & DESSIN
// ============================================

function projectStar(star, uTime, viewport) {
    const depthPosition = Math.min(-wrapDepth(star.zPhase + uTime), -NEAR_DISTANCE);
    const distance = -depthPosition;
    const scale = (viewport.focalLength / distance) * viewport.halfHeight;

    return {
        screenX: viewport.centerX + Math.cos(star.angle) * star.radius * scale,
        screenY: viewport.centerY - Math.sin(star.angle) * star.radius * scale,
        pointRadius: clamp(POINT_RADIUS_FALLOFF / distance, MIN_POINT_RADIUS, MAX_POINT_RADIUS),
        alpha: clamp(1 - distance / DEPTH, MIN_ALPHA, MAX_ALPHA)
    };
}

/**
 * Limite l'éloignement de la queue par rapport à la tête, en pixels écran.
 * Sans ce plafond, les étoiles proches du point de fuite (distance minuscule,
 * échelle énorme) tracent des traînées bien plus longues que tout le reste :
 * borner la longueur garde une intensité homogène quelle que soit la profondeur.
 */
function clampStreakTail(head, tail) {
    const deltaX = head.screenX - tail.screenX;
    const deltaY = head.screenY - tail.screenY;
    const length = Math.hypot(deltaX, deltaY);
    if (length <= STREAK_MAX_LENGTH_PX) return tail;

    const lengthScale = STREAK_MAX_LENGTH_PX / length;
    return {
        screenX: head.screenX - deltaX * lengthScale,
        screenY: head.screenY - deltaY * lengthScale
    };
}

function drawStreak(star, head, uTime, warpSpeed, viewport) {
    const trailUTime = uTime - warpSpeed * STREAK_DURATION_SECONDS;
    const tail = clampStreakTail(head, projectStar(star, trailUTime, viewport));

    context.beginPath();
    context.moveTo(tail.screenX, tail.screenY);
    context.lineTo(head.screenX, head.screenY);
    context.lineWidth = head.pointRadius * STREAK_WIDTH_FACTOR;
    context.lineCap = 'round';
    context.strokeStyle = 'rgba(' + STAR_COLOR_RGB + ', ' + (head.alpha * STREAK_ALPHA_FACTOR) + ')';
    context.stroke();
}

function drawStarHead(head) {
    context.beginPath();
    context.fillStyle = 'rgba(' + STAR_COLOR_RGB + ', ' + head.alpha + ')';
    context.arc(head.screenX, head.screenY, head.pointRadius, 0, FULL_TURN_RADIANS);
    context.fill();
}

/**
 * Dessine chaque étoile comme une tête lumineuse, plus — uniquement quand la
 * vitesse dépasse la dérive de repos (donc pendant une navigation ou la
 * plongée d'arrivée) — une traînée sombre remontant vers sa position d'il y a
 * STREAK_DURATION_SECONDS. À vitesse de repos, c'est toujours un simple point.
 */
function drawStar(star, uTime, warpSpeed, viewport) {
    const head = projectStar(star, uTime, viewport);

    if (warpSpeed > STREAK_VISIBILITY_SPEED_THRESHOLD) {
        drawStreak(star, head, uTime, warpSpeed, viewport);
    }

    drawStarHead(head);
}

function drawFrame(viewport) {
    context.fillStyle = BACKGROUND_COLOR;
    context.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < stars.length; i++) {
        drawStar(stars[i], warpState.accumulatedTime, warpState.currentSpeed, viewport);
    }

    // Par-dessus le champ : c'est l'élément le plus proche du spectateur
    drawShootingStar();
}

// ============================================
// CADENCE DE RENDU
// ============================================

/**
 * Échantillonne des deltas bruts de requestAnimationFrame (sans limitation)
 * pour estimer la fréquence de rafraîchissement réelle de l'écran : la boucle
 * peut ainsi viser cette cadence au lieu d'imposer la même à tout le monde.
 */
function measureRefreshRate(onMeasured) {
    let sampledFrameCount = 0;
    let firstSampleTimestamp = 0;

    function sampleFrame(timestamp) {
        if (sampledFrameCount === 0) firstSampleTimestamp = timestamp;
        sampledFrameCount += 1;

        if (sampledFrameCount < REFRESH_SAMPLE_FRAME_COUNT) {
            requestAnimationFrame(sampleFrame);
            return;
        }

        const elapsedMs = timestamp - firstSampleTimestamp;
        onMeasured((MILLISECONDS_PER_SECOND * (REFRESH_SAMPLE_FRAME_COUNT - 1)) / elapsedMs);
    }

    requestAnimationFrame(sampleFrame);
}

function pickTargetFramesPerSecond(measuredHz) {
    if (measuredHz >= HIGH_REFRESH_HZ_THRESHOLD) return HIGH_TIER_FRAMES_PER_SECOND;
    if (measuredHz >= MID_REFRESH_HZ_THRESHOLD) return MID_TIER_FRAMES_PER_SECOND;
    return LOW_TIER_FRAMES_PER_SECOND;
}

// ============================================
// BOUCLE D'ANIMATION
// ============================================

function advanceWarpState(timestamp, deltaSeconds) {
    // Fin du palier de navigation : on enclenche la décélération.
    if (timestamp >= warpState.decelerateAtTimestamp) {
        warpState.decelerateAtTimestamp = Infinity;
        setWarpTarget(IDLE_WARP_SPEED, WARP_DECELERATION_DURATION_MS, timestamp);
    }

    const easeProgress = clamp(
        (timestamp - warpState.easeStartTimestamp) / warpState.easeDurationMs, 0, 1
    );
    warpState.currentSpeed = lerp(
        warpState.easeStartSpeed,
        warpState.easeTargetSpeed,
        easeInOutCubic(easeProgress)
    );
    warpState.accumulatedTime += warpState.currentSpeed * deltaSeconds;
}

function runAnimationLoop(frameIntervalMs) {
    const focalLength = computeFocalLength(CAMERA_FIELD_OF_VIEW_DEGREES);
    // Figé au démarrage : un redimensionnement recadre le champ (recentrage)
    // au lieu de le redimensionner. Avec une hauteur lue en direct, toutes les
    // étoiles sauteraient à l'instant où la fenêtre change de hauteur.
    const scaleReferenceHalfHeight = canvas.height / 2;

    startArrivalDive();

    function renderFrame(timestamp) {
        requestAnimationFrame(renderFrame);

        if (timestamp - warpState.lastRenderTimestamp < frameIntervalMs) return;

        const deltaSeconds = Math.min(
            (timestamp - warpState.lastRenderTimestamp) / MILLISECONDS_PER_SECOND,
            MAX_DELTA_SECONDS
        );
        warpState.lastRenderTimestamp = timestamp;
        advanceWarpState(timestamp, deltaSeconds);
        updateShootingStar(deltaSeconds);

        drawFrame({
            focalLength: focalLength,
            centerX: canvas.width / 2,
            centerY: canvas.height / 2,
            halfHeight: scaleReferenceHalfHeight
        });
    }

    renderFrame(0);
}

// ============================================
// DÉCLENCHEURS DU WARP
// ============================================

// Onglets de la sidebar (on ignore les boutons de dropdown : ils ouvrent un
// sous-menu, ils ne naviguent pas) + photo de profil de la sidebar.
document.addEventListener('click', function (e) {
    if (e.target.closest('#profileCard')) {
        triggerWarp();
        // La photo de profil se comporte comme un logo : elle ramène à
        // l'accueil. Si on y est déjà, seule la rafale joue.
        if (window.location.hash !== '#accueil') window.location.hash = '#accueil';
        return;
    }

    const link = e.target.closest('nav a');
    if (!link || link.classList.contains('dropbtn')) return;

    const href = link.getAttribute('href');
    if (!href || !href.startsWith('#') || href === '#') return;

    triggerWarp();
});

// Photo de profil au clavier (elle porte role="button" tabindex="0")
document.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    if (!e.target.closest || !e.target.closest('#profileCard')) return;
    e.preventDefault();
    triggerWarp();
    if (window.location.hash !== '#accueil') window.location.hash = '#accueil';
});

// Retour/avance navigateur et liens internes hors sidebar (.btn, etc.)
window.addEventListener('hashchange', triggerWarp);

// ============================================
// DÉMARRAGE
// ============================================

// Préférence de réduction des animations : on peint une seule image fixe.
// Le fond étoilé reste visible, simplement immobile.
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    window.triggerWarp = function () {};
    drawFrame({
        focalLength: computeFocalLength(CAMERA_FIELD_OF_VIEW_DEGREES),
        centerX: canvas.width / 2,
        centerY: canvas.height / 2,
        halfHeight: canvas.height / 2
    });
} else {
    measureRefreshRate(function (measuredHz) {
        runAnimationLoop(MILLISECONDS_PER_SECOND / pickTargetFramesPerSecond(measuredHz));
    });
}

})();
