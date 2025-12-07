/**
 * ============================================
 * ANIMATIONS PROFESSIONNELLES POUR LA PAGE CV
 * ============================================
 * 
 * Ce fichier ajoute des animations élégantes et professionnelles à la page CV.
 * 
 * Fonctionnalités :
 * 1. Animation d'apparition au scroll (fade in)
 * 2. Effet hover subtil sur les images
 * 3. Modal avec zoom et téléchargement au clic
 * 4. Indicateur de chargement pour les images
 * 
 * Technologies utilisées :
 * - IntersectionObserver : Détection du scroll
 * - CSS Transitions : Animations fluides
 * - DOM Manipulation : Création dynamique d'éléments
 */

// Attendre que le DOM soit complètement chargé
document.addEventListener('DOMContentLoaded', function () {

    // ============================================
    // 1. ANIMATION D'APPARITION AU SCROLL
    // ============================================
    
    /**
     * Ajoute une animation d'apparition progressive quand on scroll
     * L'image apparaît en fondu quand elle entre dans la zone visible
     */
    function animateOnScroll() {
        // Sélectionner toutes les images de CV et lettre de motivation
        const images = document.querySelectorAll('.cv-img, .lettre-img');

        // Créer un observateur qui surveille quand les éléments entrent dans la vue
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                // Si l'élément est visible (intersecte avec la zone visible)
                if (entry.isIntersecting) {
                    // Ajouter la classe CSS qui déclenche l'animation
                    entry.target.classList.add('animate-in');
                }
            });
        }, {
            threshold: 0.2,                    // Déclencher quand 20% de l'élément est visible
            rootMargin: '0px 0px -50px 0px'   // Marge pour déclencher un peu avant
        });

        // Observer chaque image
        images.forEach(img => {
            observer.observe(img);
        });
    }

    // ============================================
    // 2. EFFET HOVER SUBTIL
    // ============================================
    
    /**
     * Ajoute un effet hover élégant sur les images
     * Quand on passe la souris dessus, l'image se soulève légèrement
     */
    function addSubtleHoverEffects() {
        const images = document.querySelectorAll('.cv-img, .lettre-img');

        images.forEach(img => {
            // Quand la souris entre sur l'image
            img.addEventListener('mouseenter', function () {
                // L'image se soulève de 8px et s'agrandit légèrement
                this.style.transform = 'translateY(-8px) scale(1.02)';
                // Ajouter une ombre plus prononcée
                this.style.boxShadow = '0 15px 35px rgba(119, 158, 148, 0.15)';
                // Transition fluide
                this.style.transition = 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)';
            });

            // Quand la souris quitte l'image
            img.addEventListener('mouseleave', function () {
                // Remettre l'image à sa position normale
                this.style.transform = 'translateY(0) scale(1)';
                // Ombre normale
                this.style.boxShadow = '0 5px 15px rgba(119, 158, 148, 0.1)';
                this.style.transition = 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)';
            });
        });
    }

    // ============================================
    // 3. MODAL PROFESSIONNEL AVEC ZOOM
    // ============================================
    
    /**
     * Rend les images cliquables et ouvre un modal au clic
     */
    function addClickZoom() {
        const images = document.querySelectorAll('.cv-img, .lettre-img');

        images.forEach(img => {
            // Changer le curseur pour indiquer que c'est cliquable
            img.style.cursor = 'pointer';

            // Créer un indicateur visuel subtil (optionnel)
            const indicator = document.createElement('div');
            img.parentElement.style.position = 'relative';
            img.parentElement.appendChild(indicator);

            // Quand on clique sur l'image
            img.addEventListener('click', function (e) {
                e.preventDefault();  // Empêcher le comportement par défaut
                createModal(this);   // Créer et afficher le modal
            });
        });
    }

    /**
     * Crée un modal (fenêtre popup) pour afficher l'image en grand
     * @param {HTMLElement} imgElement - L'image sur laquelle on a cliqué
     */
    function createModal(imgElement) {
        // Créer le conteneur du modal
        const modal = document.createElement('div');
        modal.className = 'image-modal';
        
        // HTML du modal avec tous les contrôles
        modal.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 class="modal-title">${getDocumentTitle(imgElement)}</h3>
                        <button class="modal-close" aria-label="Fermer">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-image-container">
                        <img src="${imgElement.src}" alt="${imgElement.alt}" class="modal-image">
                    </div>
                    <div class="modal-controls">
                        <button class="modal-btn modal-zoom-in" title="Zoomer">
                            <i class="fas fa-search-plus"></i>
                            <span>Zoomer</span>
                        </button>
                        <button class="modal-btn modal-zoom-out" title="Dézoomer">
                            <i class="fas fa-search-minus"></i>
                            <span>Dézoomer</span>
                        </button>
                        <button class="modal-btn modal-reset" title="Taille originale">
                            <i class="fas fa-expand-arrows-alt"></i>
                            <span>Ajuster</span>
                        </button>
                        <button class="modal-btn modal-download" title="Télécharger">
                            <i class="fas fa-download"></i>
                            <span>Télécharger</span>
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Ajouter le modal au body
        document.body.appendChild(modal);

        // Animation d'ouverture fluide (après le prochain frame)
        requestAnimationFrame(() => {
            modal.classList.add('active');
        });

        // Configurer tous les contrôles du modal
        setupModalControls(modal, imgElement);
    }

    /**
     * Détermine le titre à afficher selon le type de document
     * @param {HTMLElement} imgElement - L'élément image
     * @returns {string} Le titre du document
     */
    function getDocumentTitle(imgElement) {
        if (imgElement.classList.contains('cv-img')) {
            return 'Curriculum Vitae';
        } else if (imgElement.classList.contains('lettre-img')) {
            return 'Lettre de Motivation';
        }
        return 'Document';
    }

    /**
     * Configure tous les contrôles du modal (zoom, téléchargement, etc.)
     * @param {HTMLElement} modal - L'élément modal
     * @param {HTMLElement} originalImg - L'image originale
     */
    function setupModalControls(modal, originalImg) {
        // Récupérer tous les éléments du modal
        const modalImg = modal.querySelector('.modal-image');
        const closeBtn = modal.querySelector('.modal-close');
        const zoomInBtn = modal.querySelector('.modal-zoom-in');
        const zoomOutBtn = modal.querySelector('.modal-zoom-out');
        const resetBtn = modal.querySelector('.modal-reset');
        const downloadBtn = modal.querySelector('.modal-download');
        const overlay = modal.querySelector('.modal-overlay');
        const imageContainer = modal.querySelector('.modal-image-container');

        // Variables pour gérer le zoom et le déplacement
        let scale = 1;                    // Niveau de zoom (1 = taille normale)
        let isDragging = false;           // Si on est en train de déplacer l'image
        let dragStart = { x: 0, y: 0 };  // Position de départ du drag
        let imagePosition = { x: 0, y: 0 };  // Position actuelle de l'image

        /**
         * Ferme le modal avec animation
         */
        function closeModal() {
            modal.classList.add('closing');
            setTimeout(() => {
                if (document.body.contains(modal)) {
                    document.body.removeChild(modal);
                }
                document.body.style.overflow = 'auto';  // Réactiver le scroll
            }, 300);
        }

        // Fermer avec le bouton X
        closeBtn.addEventListener('click', closeModal);
        
        // Fermer en cliquant sur l'overlay (fond sombre)
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeModal();
        });

        // Bouton zoom avant (agrandir)
        zoomInBtn.addEventListener('click', () => {
            scale = Math.min(scale * 1.3, 4);  // Multiplier par 1.3, max 4x
            updateImageTransform();
        });

        // Bouton zoom arrière (réduire)
        zoomOutBtn.addEventListener('click', () => {
            scale = Math.max(scale / 1.3, 0.3);  // Diviser par 1.3, min 0.3x
            updateImageTransform();
        });

        // Bouton reset (taille normale)
        resetBtn.addEventListener('click', () => {
            scale = 1;
            imagePosition = { x: 0, y: 0 };
            updateImageTransform();
        });

        // Bouton télécharger
        downloadBtn.addEventListener('click', () => {
            // Créer un lien de téléchargement invisible
            const link = document.createElement('a');
            link.href = 'assets/pdf/cv.pdf';
            link.download = 'CV_METGY_LEO.pdf';
            document.body.appendChild(link);
            link.click();  // Simuler un clic
            document.body.removeChild(link);
        });

        // Gestion du drag & drop pour déplacer l'image zoomée
        modalImg.addEventListener('mousedown', startDrag);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', stopDrag);

        /**
         * Démarre le drag (quand on appuie sur l'image)
         */
        function startDrag(e) {
            if (scale > 1) {  // Seulement si l'image est zoomée
                isDragging = true;
                dragStart.x = e.clientX - imagePosition.x;
                dragStart.y = e.clientY - imagePosition.y;
                modalImg.style.cursor = 'grabbing';
                e.preventDefault();
            }
        }

        /**
         * Pendant le drag (quand on déplace la souris)
         */
        function drag(e) {
            if (isDragging) {
                imagePosition.x = e.clientX - dragStart.x;
                imagePosition.y = e.clientY - dragStart.y;
                updateImageTransform();
            }
        }

        /**
         * Arrête le drag (quand on relâche)
         */
        function stopDrag() {
            isDragging = false;
            modalImg.style.cursor = scale > 1 ? 'grab' : 'default';
        }

        /**
         * Met à jour la transformation CSS de l'image (zoom + position)
         */
        function updateImageTransform() {
            modalImg.style.transform = `scale(${scale}) translate(${imagePosition.x / scale}px, ${imagePosition.y / scale}px)`;
            modalImg.style.cursor = scale > 1 ? 'grab' : 'default';
        }

        // Zoom avec la molette de la souris
        imageContainer.addEventListener('wheel', (e) => {
            e.preventDefault();
            // Déterminer si on zoome avant ou arrière
            const delta = e.deltaY > 0 ? 0.9 : 1.1;
            scale = Math.min(Math.max(scale * delta, 0.3), 4);
            updateImageTransform();
        });

        // Empêcher le scroll de la page quand le modal est ouvert
        document.body.style.overflow = 'hidden';

        // Fermer avec la touche Échap
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
    }

    // ============================================
    // 4. INDICATEUR DE CHARGEMENT
    // ============================================
    
    /**
     * Affiche un indicateur de chargement pendant que l'image se charge
     */
    function addLoadingIndicator() {
        const images = document.querySelectorAll('.cv-img, .lettre-img');

        images.forEach(img => {
            // Si l'image n'est pas encore chargée
            if (!img.complete) {
                // Créer un indicateur de chargement
                const loader = document.createElement('div');
                loader.className = 'image-loader';
                loader.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

                img.parentElement.appendChild(loader);

                // Quand l'image est chargée, cacher l'indicateur
                img.addEventListener('load', () => {
                    loader.style.opacity = '0';
                    setTimeout(() => {
                        if (img.parentElement.contains(loader)) {
                            img.parentElement.removeChild(loader);
                        }
                    }, 300);
                });
            }
        });
    }

    // ============================================
    // INITIALISATION
    // ============================================
    
    // Lancer toutes les fonctionnalités
    animateOnScroll();
    addSubtleHoverEffects();
    addClickZoom();
    addLoadingIndicator();

    console.log('📄 Animations CV professionnelles activées');
});
