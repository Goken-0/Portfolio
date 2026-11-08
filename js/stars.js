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
const MID_REFRESH_HZ_THRESHOLD = 50;
// Écrans 60 Hz : 60 images/s. Le dessin groupé (voir « Performances ») est
// assez léger pour ça ; une machine qui ne suit pas redescend d'elle-même à
// 30 (voir « Qualité adaptative »).
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

// Le tampon suit la taille CSS du canvas, qui vaut 100lvh en hauteur (voir
// css/style.css) : la « grande » hauteur d'écran, celle qui ne change pas quand
// la barre d'adresse mobile apparaît ou disparaît au défilement. Avant, chaque
// mouvement de cette barre déclenchait un resize, donc une réallocation
// complète du canvas en plein scroll : c'était la principale saccade sur
// téléphone.
function fitCanvasToCss() {
    const width = canvas.clientWidth || window.innerWidth;
    const height = canvas.clientHeight || window.innerHeight;
    if (canvas.width !== width) canvas.width = width;
    if (canvas.height !== height) canvas.height = height;
}

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

function attachCanvas() {
    if (!canvas.isConnected) document.body.appendChild(canvas);
    fitCanvasToCss();
}
if (document.body) {
    attachCanvas();
} else {
    document.addEventListener('DOMContentLoaded', attachCanvas);
}

// Regroupé sur une image : une rafale de resize ne coûte qu'un seul recalcul
let resizeQueued = false;
window.addEventListener('resize', function () {
    if (resizeQueued) return;
    resizeQueued = true;
    requestAnimationFrame(function () {
        resizeQueued = false;
        fitCanvasToCss();
    });
}, { passive: true });

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

// ---- Performances ----
//
// Dessiner 700 étoiles une par une, c'est 700 beginPath/fill par image, plus
// 700 chaînes 'rgba(…)' recréées : c'était l'essentiel du coût sur les petites
// machines. Les étoiles sont maintenant regroupées par niveau d'opacité (et
// d'épaisseur pour les traînées) : un seul tracé et un seul fill par groupe,
// soit quelques dizaines d'appels au lieu de 700. 48 niveaux d'opacité, c'est
// un écart de moins de 2 % entre deux niveaux : invisible à l'œil.
const ALPHA_LEVELS = 48;
const STREAK_WIDTH_STEP_PX = 0.25;
const STREAK_WIDTH_LEVELS = Math.ceil((MAX_POINT_RADIUS * STREAK_WIDTH_FACTOR) / STREAK_WIDTH_STEP_PX) + 1;

function alphaLevelOf(alpha) {
    return Math.round(((alpha - MIN_ALPHA) / (MAX_ALPHA - MIN_ALPHA)) * (ALPHA_LEVELS - 1));
}

function alphaOfLevel(level) {
    return MIN_ALPHA + (level / (ALPHA_LEVELS - 1)) * (MAX_ALPHA - MIN_ALPHA);
}

// Couleurs pré-calculées une fois pour toutes (têtes, puis traînées)
const HEAD_COLORS = [];
const STREAK_COLORS = [];
for (let level = 0; level < ALPHA_LEVELS; level++) {
    const alpha = alphaOfLevel(level);
    HEAD_COLORS.push('rgba(' + STAR_COLOR_RGB + ', ' + alpha.toFixed(3) + ')');
    STREAK_COLORS.push('rgba(' + STAR_COLOR_RGB + ', ' + (alpha * STREAK_ALPHA_FACTOR).toFixed(3) + ')');
}

// Tampons réutilisés d'une image à l'autre : aucune allocation par frame,
// donc pas de pauses du ramasse-miettes (les « micro-saccades »).
const headX = new Float32Array(STAR_COUNT);
const headY = new Float32Array(STAR_COUNT);
const headRadius = new Float32Array(STAR_COUNT);
const tailX = new Float32Array(STAR_COUNT);
const tailY = new Float32Array(STAR_COUNT);
const groupOf = new Uint16Array(STAR_COUNT);
const savedAlphaLevels = new Uint16Array(STAR_COUNT);
const sortedStars = new Uint16Array(STAR_COUNT);
const HEAD_GROUPS = ALPHA_LEVELS;
const STREAK_GROUPS = ALPHA_LEVELS * STREAK_WIDTH_LEVELS;
const groupStart = new Uint16Array(STREAK_GROUPS + 1);
const groupFill = new Uint16Array(STREAK_GROUPS + 1);

// Pré-calculs constants par étoile (cos/sin ne changent jamais)
const starCos = new Float32Array(STAR_COUNT);
const starSin = new Float32Array(STAR_COUNT);
for (let i = 0; i < STAR_COUNT; i++) {
    starCos[i] = Math.cos(stars[i].angle) * stars[i].radius;
    starSin[i] = Math.sin(stars[i].angle) * stars[i].radius;
}

function distanceOf(star, uTime) {
    return Math.max(wrapDepth(star.zPhase + uTime), NEAR_DISTANCE);
}

/**
 * Tri par comptage des étoiles selon leur groupe : les étoiles d'un même
 * groupe deviennent contiguës dans sortedStars, entre groupStart[g] et
 * groupStart[g + 1]. Linéaire, sans allocation.
 */
function sortByGroup(groupCount) {
    groupStart.fill(0, 0, groupCount + 1);
    for (let i = 0; i < STAR_COUNT; i++) groupStart[groupOf[i] + 1]++;
    for (let g = 0; g < groupCount; g++) groupStart[g + 1] += groupStart[g];
    groupFill.set(groupStart.subarray(0, groupCount));
    for (let i = 0; i < STAR_COUNT; i++) sortedStars[groupFill[groupOf[i]]++] = i;
}

/**
 * Traînées : segment remontant vers la position de l'étoile il y a
 * STREAK_DURATION_SECONDS, plafonné à STREAK_MAX_LENGTH_PX. Sans ce plafond,
 * les étoiles proches du point de fuite (distance minuscule, échelle énorme)
 * tracent des traînées bien plus longues que tout le reste.
 */
function drawStreaks(uTime, warpSpeed, viewport) {
    const trailUTime = uTime - warpSpeed * STREAK_DURATION_SECONDS;

    for (let i = 0; i < STAR_COUNT; i++) {
        const distance = distanceOf(stars[i], trailUTime);
        const scale = (viewport.focalLength / distance) * viewport.halfHeight;
        let tx = viewport.centerX + starCos[i] * scale;
        let ty = viewport.centerY - starSin[i] * scale;

        const deltaX = headX[i] - tx;
        const deltaY = headY[i] - ty;
        const length = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        if (length > STREAK_MAX_LENGTH_PX) {
            const lengthScale = STREAK_MAX_LENGTH_PX / length;
            tx = headX[i] - deltaX * lengthScale;
            ty = headY[i] - deltaY * lengthScale;
        }
        tailX[i] = tx;
        tailY[i] = ty;

        const widthLevel = Math.round((headRadius[i] * STREAK_WIDTH_FACTOR) / STREAK_WIDTH_STEP_PX);
        groupOf[i] = groupOf[i] * STREAK_WIDTH_LEVELS + widthLevel;
    }

    sortByGroup(STREAK_GROUPS);
    context.lineCap = 'round';

    for (let g = 0; g < STREAK_GROUPS; g++) {
        const start = groupStart[g];
        const end = groupStart[g + 1];
        if (start === end) continue;

        context.beginPath();
        for (let k = start; k < end; k++) {
            const i = sortedStars[k];
            context.moveTo(tailX[i], tailY[i]);
            context.lineTo(headX[i], headY[i]);
        }
        context.lineWidth = (g % STREAK_WIDTH_LEVELS) * STREAK_WIDTH_STEP_PX;
        context.strokeStyle = STREAK_COLORS[Math.floor(g / STREAK_WIDTH_LEVELS)];
        context.stroke();
    }
}

function drawHeads() {
    sortByGroup(HEAD_GROUPS);

    for (let g = 0; g < HEAD_GROUPS; g++) {
        const start = groupStart[g];
        const end = groupStart[g + 1];
        if (start === end) continue;

        context.beginPath();
        for (let k = start; k < end; k++) {
            const i = sortedStars[k];
            const r = headRadius[i];
            // moveTo : sans lui, arc() relierait chaque disque au précédent
            context.moveTo(headX[i] + r, headY[i]);
            context.arc(headX[i], headY[i], r, 0, FULL_TURN_RADIANS);
        }
        context.fillStyle = HEAD_COLORS[g];
        context.fill();
    }
}

/**
 * Chaque étoile est une tête lumineuse, plus — uniquement quand la vitesse
 * dépasse la dérive de repos (navigation ou plongée d'arrivée) — une traînée
 * plus sombre. À vitesse de repos, c'est toujours un simple point. Les
 * traînées sont tracées d'abord, les têtes par-dessus.
 */
function drawFrame(viewport) {
    context.fillStyle = BACKGROUND_COLOR;
    context.fillRect(0, 0, canvas.width, canvas.height);

    const uTime = warpState.accumulatedTime;
    const warpSpeed = warpState.currentSpeed;

    // 1. Projection des têtes dans les tampons
    for (let i = 0; i < STAR_COUNT; i++) {
        const distance = distanceOf(stars[i], uTime);
        const scale = (viewport.focalLength / distance) * viewport.halfHeight;
        headX[i] = viewport.centerX + starCos[i] * scale;
        headY[i] = viewport.centerY - starSin[i] * scale;
        headRadius[i] = clamp(POINT_RADIUS_FALLOFF / distance, MIN_POINT_RADIUS, MAX_POINT_RADIUS);
        groupOf[i] = alphaLevelOf(clamp(1 - distance / DEPTH, MIN_ALPHA, MAX_ALPHA));
    }

    // 2. Traînées (elles réutilisent groupOf, d'où la sauvegarde des niveaux)
    if (warpSpeed > STREAK_VISIBILITY_SPEED_THRESHOLD) {
        savedAlphaLevels.set(groupOf);
        drawStreaks(uTime, warpSpeed, viewport);
        groupOf.set(savedAlphaLevels);
    }

    // 3. Têtes
    drawHeads();

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
    if (measuredHz >= MID_REFRESH_HZ_THRESHOLD) return HIGH_TIER_FRAMES_PER_SECOND;
    return LOW_TIER_FRAMES_PER_SECOND;
}

// ---- Qualité adaptative ----
// Si la machine n'arrive pas à tenir la cadence visée (images qui arrivent
// nettement en retard, de façon répétée), on descend d'un palier plutôt que
// de saccader. Le rendu reste identique, seule la cadence change.
const SLOW_FRAME_RATIO = 1.6;          // retard toléré par rapport à l'intervalle visé
const SLOW_FRAME_WINDOW = 45;          // nombre d'images observées par fenêtre
const SLOW_FRAME_SHARE_TO_DEGRADE = 0.4;
const ADAPTIVE_WARMUP_MS = 2500;       // ignorer le démarrage (chargement de la page)

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
    const startedAt = performance.now();
    let observedFrames = 0;
    let slowFrames = 0;

    startArrivalDive();

    function watchCadence(timestamp, elapsedMs) {
        if (timestamp - startedAt < ADAPTIVE_WARMUP_MS) return;
        // Un très gros trou = onglet en arrière-plan, pas une machine lente
        if (elapsedMs > 1000) return;
        observedFrames++;
        if (elapsedMs > frameIntervalMs * SLOW_FRAME_RATIO) slowFrames++;
        if (observedFrames < SLOW_FRAME_WINDOW) return;

        if (slowFrames / observedFrames > SLOW_FRAME_SHARE_TO_DEGRADE) {
            if (frameIntervalMs < MILLISECONDS_PER_SECOND / MID_TIER_FRAMES_PER_SECOND) {
                frameIntervalMs = MILLISECONDS_PER_SECOND / MID_TIER_FRAMES_PER_SECOND;
            }
            // Machine juste : on allège aussi les effets CSS coûteux (flous)
            document.documentElement.classList.add('perf-lite');
        }
        observedFrames = 0;
        slowFrames = 0;
    }

    function renderFrame(timestamp) {
        requestAnimationFrame(renderFrame);

        const elapsedMs = timestamp - warpState.lastRenderTimestamp;
        // Marge de 3 ms : sans elle, une image à 33,2 ms au lieu de 33,3 ms
        // était sautée et la suivante tombait à 50 ms — une saccade
        // irrégulière bien plus visible qu'une cadence simplement plus basse.
        if (elapsedMs < frameIntervalMs - 3) return;

        watchCadence(timestamp, elapsedMs);

        const deltaSeconds = Math.min(elapsedMs / MILLISECONDS_PER_SECOND, MAX_DELTA_SECONDS);
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
