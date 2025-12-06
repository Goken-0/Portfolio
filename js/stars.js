// =====================
// CONFIGURATION DE BASE
// =====================
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.domElement.classList.add("background");
document.body.appendChild(renderer.domElement);

// =====================
// ÉTOILES FIXES
// =====================
const starGeometry = new THREE.BufferGeometry();
const starCount = 15000;
const starPositions = new Float32Array(starCount * 3);
const starSizes = new Float32Array(starCount);

for (let i = 0; i < starCount * 3; i += 3) {
    starPositions[i] = (Math.random() - 0.5) * 3000;
    starPositions[i + 1] = (Math.random() - 0.5) * 3000;
    starPositions[i + 2] = (Math.random() - 0.5) * 3000;
    starSizes[i / 3] = Math.random() * 3 + 1; // Tailles entre 1 et 4
}

starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
starGeometry.setAttribute("size", new THREE.BufferAttribute(starSizes, 1));

const starMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 1.5,
    transparent: true,
    opacity: 1.0,
    sizeAttenuation: false
});

const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);
camera.position.z = 800;

// =====================
// ÉTOILES FILANTES SPECTACULAIRES
// =====================
let shootingStars = [];
const colors = [0xffffff, 0xffffaa, 0xaaffff, 0xffaaff, 0xaaffaa];

function createShootingStar() {
    // Noyau lumineux avec effet de halo
    const coreGeometry = new THREE.SphereGeometry(6, 16, 16);
    const coreColor = colors[Math.floor(Math.random() * colors.length)];
    const coreMaterial = new THREE.MeshBasicMaterial({
        color: coreColor,
        transparent: true,
        opacity: 1
    });
    const core = new THREE.Mesh(coreGeometry, coreMaterial);

    // Halo extérieur
    const haloGeometry = new THREE.SphereGeometry(12, 16, 16);
    const haloMaterial = new THREE.MeshBasicMaterial({
        color: coreColor,
        transparent: true,
        opacity: 0.3
    });
    const halo = new THREE.Mesh(haloGeometry, haloMaterial);

    // Position initiale aléatoire
    const startX = Math.random() > 0.5 ? 1500 : -1500;
    const startY = Math.random() * 1000 + 500;
    const startZ = (Math.random() - 0.5) * 2000;

    core.position.set(startX, startY, startZ);
    halo.position.copy(core.position);

    // Vitesse diagonale avec variation
    const velocity = new THREE.Vector3(
        startX > 0 ? -(Math.random() * 6 + 8) : (Math.random() * 6 + 8),
        -(Math.random() * 8 + 6),
        (Math.random() - 0.5) * 2
    );

    // Traînée lumineuse multiple
    const trails = [];
    const trailCount = 5;
    const trailLength = 300;

    for (let i = 0; i < trailCount; i++) {
        const trailGeometry = new THREE.BufferGeometry();
        const trailPoints = [];
        const segmentCount = 50;

        for (let j = 0; j < segmentCount; j++) {
            const progress = j / (segmentCount - 1);
            const trailPos = core.position.clone().add(
                velocity.clone().normalize().multiplyScalar(-trailLength * progress)
            );
            trailPoints.push(trailPos);
        }

        trailGeometry.setFromPoints(trailPoints);

        const trailMaterial = new THREE.LineBasicMaterial({
            color: coreColor,
            transparent: true,
            opacity: 0.8 - (i * 0.15),
            linewidth: 3 - (i * 0.5)
        });

        const trail = new THREE.Line(trailGeometry, trailMaterial);
        trails.push(trail);
        scene.add(trail);
    }

    // Particules sparkles
    const sparkleGeometry = new THREE.BufferGeometry();
    const sparkleCount = 20;
    const sparklePositions = new Float32Array(sparkleCount * 3);

    for (let i = 0; i < sparkleCount * 3; i += 3) {
        sparklePositions[i] = core.position.x + (Math.random() - 0.5) * 50;
        sparklePositions[i + 1] = core.position.y + (Math.random() - 0.5) * 50;
        sparklePositions[i + 2] = core.position.z + (Math.random() - 0.5) * 50;
    }

    sparkleGeometry.setAttribute("position", new THREE.BufferAttribute(sparklePositions, 3));

    const sparkleMaterial = new THREE.PointsMaterial({
        color: coreColor,
        size: 3,
        transparent: true,
        opacity: 0.8
    });

    const sparkles = new THREE.Points(sparkleGeometry, sparkleMaterial);

    const shootingStarGroup = {
        core,
        halo,
        trails,
        sparkles,
        velocity,
        life: 1.0,
        maxLife: Math.random() * 3 + 4
    };

    scene.add(core);
    scene.add(halo);
    scene.add(sparkles);
    shootingStars.push(shootingStarGroup);

    // Nettoyage automatique
    setTimeout(() => {
        scene.remove(core);
        scene.remove(halo);
        scene.remove(sparkles);
        trails.forEach(trail => scene.remove(trail));
        shootingStars = shootingStars.filter(s => s.core !== core);
    }, shootingStarGroup.maxLife * 1000);
}

// Génération périodique d'étoiles filantes
setInterval(() => {
    if (Math.random() < 0.8) {
        createShootingStar();
    }
}, 2000);

// Événement spécial : pluie d'étoiles filantes
setInterval(() => {
    if (Math.random() < 0.30) { // 30% de chance
        console.log("🌟 Pluie d'étoiles filantes !");
        for (let i = 0; i < 8; i++) {
            setTimeout(() => createShootingStar(), i * 200);
        }
    }
}, 15000);

// =====================
// ANIMATION PRINCIPALE
// =====================
function animateStars() {
    requestAnimationFrame(animateStars);

    // Animation des étoiles fixes avec scintillement
    stars.rotation.y += 0.0003;
    stars.rotation.x += 0.0001;

    // Effet de scintillement des étoiles
    const time = Date.now() * 0.001;
    const sizes = stars.geometry.attributes.size.array;
    for (let i = 0; i < sizes.length; i++) {
        const originalSize = 1 + Math.random() * 3;
        sizes[i] = originalSize + Math.sin(time + i * 0.1) * 0.5;
    }
    stars.geometry.attributes.size.needsUpdate = true;

    const positions = stars.geometry.attributes.position.array;
    for (let i = 1; i < positions.length; i += 3) {
        positions[i] -= 0.02;
        if (positions[i] < -1500) positions[i] = 1500;
    }
    stars.geometry.attributes.position.needsUpdate = true;

    // Animation des étoiles filantes
    shootingStars.forEach((star, index) => {
        // Mouvement
        star.core.position.add(star.velocity);
        star.halo.position.copy(star.core.position);

        // Mise à jour des traînées
        star.trails.forEach((trail, trailIndex) => {
            const trailPoints = [];
            const segmentCount = 50;
            const offset = trailIndex * 10;

            for (let j = 0; j < segmentCount; j++) {
                const progress = j / (segmentCount - 1);
                const trailPos = star.core.position.clone().add(
                    star.velocity.clone().normalize().multiplyScalar(-(300 + offset) * progress)
                );
                trailPoints.push(trailPos);
            }

            trail.geometry.setFromPoints(trailPoints);
        });

        // Mise à jour des sparkles
        const sparklePositions = star.sparkles.geometry.attributes.position.array;
        for (let i = 0; i < sparklePositions.length; i += 3) {
            sparklePositions[i] += star.velocity.x * 0.8 + (Math.random() - 0.5) * 2;
            sparklePositions[i + 1] += star.velocity.y * 0.8 + (Math.random() - 0.5) * 2;
            sparklePositions[i + 2] += star.velocity.z * 0.8 + (Math.random() - 0.5) * 2;
        }
        star.sparkles.geometry.attributes.position.needsUpdate = true;

        // Diminution progressive de l'opacité
        star.life -= 1 / (star.maxLife * 60);
        star.core.material.opacity = Math.max(0, star.life);
        star.halo.material.opacity = Math.max(0, star.life * 0.3);
        star.sparkles.material.opacity = Math.max(0, star.life * 0.8);

        star.trails.forEach((trail, trailIndex) => {
            trail.material.opacity = Math.max(0, (star.life * (0.8 - trailIndex * 0.15)));
        });
    });

    renderer.render(scene, camera);
}

// =====================
// GESTION DU REDIMENSIONNEMENT
// =====================
window.addEventListener("resize", () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

// Démarrage de l'animation
animateStars();