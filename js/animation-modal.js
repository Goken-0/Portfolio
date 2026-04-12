/**
 * ============================================
 * ANIMATIONS MODALES CV/LETTRE DE MOTIVATION
 * ============================================
 * 
 * Module unique pour gérer les modales de zoom sur les documents
 * Remplace animation-cv.js et animation-lm.js (code dupliqué à 95%)
 * 
 * Fonctionnalités :
 * - Animation au scroll
 * - Effet hover sur les images
 * - Modal avec zoom (molette), drag (souris), pinch-to-zoom (tactile)
 * - Boutons de contrôle (zoom, dézoom, ajuster, télécharger)
 * - Fermeture avec ESC ou clic sur l'overlay
 */

(function() {
    'use strict';

    // Configuration pour chaque type de document
    const CONFIG = {
        cv: {
            selector: '.cv-img',
            title: 'Curriculum Vitae',
            downloadPath: 'assets/pdf/cv.pdf',
            downloadName: 'CV_METGY_LEO.pdf'
        },
        lm: {
            selector: '.lettre-img, .lm-img',
            title: 'Lettre de Motivation',
            downloadPath: 'assets/pdf/lettremotivation.pdf',
            downloadName: 'LETTRE_DE_MOTIVATION_METGY_LEO.pdf'
        }
    };

    /**
     * Détermine le type de page actuel
     * @returns {string|null} - 'cv', 'lm', ou null
     */
    function findPageType() {
        if (document.querySelector(CONFIG.cv.selector)) return 'cv';
        if (document.querySelector(CONFIG.lm.selector)) return 'lm';
        return null;
    }

    /**
     * 1. ANIMATION AU SCROLL
     * Ajoute une classe 'animate-in' quand l'image devient visible
     */
    function animateOnScroll() {
        const images = document.querySelectorAll('.cv-img, .lettre-img, .lm-img');
        if (!images.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, { threshold: 0.2, rootMargin: '0px 0px -50px 0px' });
        
        images.forEach(img => observer.observe(img));
    }

    /**
     * 2. EFFET HOVER
     * Ajoute un effet de soulèvement au survol
     */
    function addSubtleHoverEffects() {
        const images = document.querySelectorAll('.cv-img, .lettre-img, .lm-img');
        images.forEach(img => {
            img.addEventListener('mouseenter', function () {
                this.style.transform = 'translateY(-8px) scale(1.02)';
                this.style.boxShadow = '0 15px 35px rgba(119, 158, 148, 0.15)';
                this.style.transition = 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)';
            });
            img.addEventListener('mouseleave', function () {
                this.style.transform = 'translateY(0) scale(1)';
                this.style.boxShadow = '0 5px 15px rgba(119, 158, 148, 0.1)';
                this.style.transition = 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)';
            });
        });
    }

    /**
     * 3. ZOOM AU CLIC
     * Ajoute un écouteur de clic pour ouvrir la modal
     */
    function addClickZoom() {
        const images = document.querySelectorAll('.cv-img, .lettre-img, .lm-img');
        images.forEach(img => {
            img.style.cursor = 'zoom-in';
            const indicator = document.createElement('div');
            img.parentElement.style.position = 'relative';
            img.parentElement.appendChild(indicator);
            img.addEventListener('click', function (e) {
                e.preventDefault();
                createModal(this);
            });
        });
    }

    /**
     * Crée la modal de zoom
     * Utilise DOM API au lieu de innerHTML pour éviter les failles XSS
     * @param {HTMLImageElement} imgElement - L'image cliquée
     */
    function createModal(imgElement) {
        const modal = document.createElement('div');
        modal.className = 'image-modal';

        // Créer les éléments via DOM API (plus sûr que innerHTML)
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        
        const content = document.createElement('div');
        content.className = 'modal-content';
        
        const header = document.createElement('div');
        header.className = 'modal-header';
        
        const title = document.createElement('h3');
        title.className = 'modal-title';
        title.textContent = getDocumentTitle(imgElement); // textContent échappe automatiquement
        
        const closeBtn = document.createElement('button');
        closeBtn.className = 'modal-close';
        closeBtn.setAttribute('aria-label', 'Fermer');
        const closeIcon = document.createElement('i');
        closeIcon.className = 'fas fa-times';
        closeBtn.appendChild(closeIcon);
        
        header.appendChild(title);
        header.appendChild(closeBtn);
        
        const imageContainer = document.createElement('div');
        imageContainer.className = 'modal-image-container';
        
        const modalImage = document.createElement('img');
        modalImage.src = imgElement.src;
        modalImage.alt = imgElement.alt;
        modalImage.className = 'modal-image';
        
        imageContainer.appendChild(modalImage);
        
        const controls = document.createElement('div');
        controls.className = 'modal-controls';
        
        // Boutons de contrôle
        const buttons = [
            { icon: 'fas fa-search-plus', text: 'Zoomer', class: 'modal-zoom-in', title: 'Zoomer' },
            { icon: 'fas fa-search-minus', text: 'Dézoomer', class: 'modal-zoom-out', title: 'Dézoomer' },
            { icon: 'fas fa-compress-arrows-alt', text: 'Ajuster', class: 'modal-reset', title: 'Ajuster' },
            { icon: 'fas fa-download', text: 'Télécharger', class: 'modal-download', title: 'Télécharger' }
        ];
        
        buttons.forEach(btn => {
            const button = document.createElement('button');
            button.className = `modal-btn ${btn.class}`;
            button.title = btn.title;
            const icon = document.createElement('i');
            icon.className = btn.icon;
            const span = document.createElement('span');
            span.textContent = btn.text;
            button.appendChild(icon);
            button.appendChild(span);
            controls.appendChild(button);
        });
        
        content.appendChild(header);
        content.appendChild(imageContainer);
        content.appendChild(controls);
        overlay.appendChild(content);
        modal.appendChild(overlay);
        
        document.body.appendChild(modal);
        requestAnimationFrame(() => modal.classList.add('active'));
        setupModalControls(modal, imgElement);
    }

    /**
     * Détermine le titre du document selon le type d'image
     * @param {HTMLImageElement} imgElement 
     * @returns {string}
     */
    function getDocumentTitle(imgElement) {
        if (imgElement.classList.contains('cv-img')) return 'Curriculum Vitae';
        if (imgElement.classList.contains('lettre-img') || imgElement.classList.contains('lm-img')) {
            return 'Lettre de Motivation';
        }
        return 'Document';
    }

    /**
     * Configure les contrôles de la modal (zoom, drag, etc.)
     * @param {HTMLDivElement} modal - La modal créée
     * @param {HTMLImageElement} originalImg - L'image originale
     */
    function setupModalControls(modal, originalImg) {
        const modalImg = modal.querySelector('.modal-image');
        const zoomInBtn = modal.querySelector('.modal-zoom-in');
        const zoomOutBtn = modal.querySelector('.modal-zoom-out');
        const resetBtn = modal.querySelector('.modal-reset');
        const downloadBtn = modal.querySelector('.modal-download');
        const closeBtn = modal.querySelector('.modal-close');
        const overlay = modal.querySelector('.modal-overlay');
        const imageContainer = modal.querySelector('.modal-image-container');

        // Déterminer le chemin de téléchargement
        let downloadPath, downloadName;
        if (originalImg.classList.contains('cv-img')) {
            downloadPath = CONFIG.cv.downloadPath;
            downloadName = CONFIG.cv.downloadName;
        } else {
            downloadPath = CONFIG.lm.downloadPath;
            downloadName = CONFIG.lm.downloadName;
        }

        // --- LIMITES DE ZOOM (en pixels) ---
        const MIN_ZOOM = 300;
        const MAX_ZOOM = 2500;

        let isFitMode = true;
        let currentWidth = 0;

        // --- DRAG STATE ---
        let isDragging = false;
        let dragStartX = 0;
        let dragStartY = 0;
        let scrollStartX = 0;
        let scrollStartY = 0;

        // --- TOUCH STATE ---
        let lastTouchDist = 0;
        let isTouchDragging = false;
        let touchStartX = 0;
        let touchStartY = 0;
        let touchScrollStartX = 0;
        let touchScrollStartY = 0;

        /**
         * Initialise le zoom (mode ajustement)
         */
        function initZoom() {
            isFitMode = true;
            modalImg.style.width = 'auto';
            modalImg.style.height = 'auto';
            modalImg.style.maxWidth = '100%';
            modalImg.style.maxHeight = '100%';
            modalImg.style.objectFit = 'contain';
            modalImg.style.cursor = 'zoom-in';
            modalImg.style.margin = 'auto';

            imageContainer.style.display = 'flex';
            imageContainer.style.alignItems = 'center';
            imageContainer.style.justifyContent = 'center';
        }

        /**
         * Applique un zoom avec un facteur donné
         * @param {number} factor - Facteur de zoom (>1 pour zoomer, <1 pour dézoomer)
         */
        function applyZoom(factor) {
            if (isFitMode) {
                currentWidth = modalImg.getBoundingClientRect().width;
                isFitMode = false;

                imageContainer.style.display = 'block';
                imageContainer.style.textAlign = 'center';

                modalImg.style.maxHeight = 'none';
                modalImg.style.maxWidth = 'none';
            }

            let newWidth = currentWidth * factor;
            if (newWidth > MAX_ZOOM) newWidth = MAX_ZOOM;
            if (newWidth < MIN_ZOOM) newWidth = MIN_ZOOM;

            currentWidth = newWidth;

            modalImg.style.width = `${currentWidth}px`;
            modalImg.style.height = 'auto';
            modalImg.style.cursor = isDragging ? 'grabbing' : 'grab';
        }

        initZoom();

        /**
         * Ferme la modal
         */
        function closeModal() {
            modal.classList.add('closing');
            setTimeout(() => {
                if (document.body.contains(modal)) {
                    document.body.removeChild(modal);
                }
                document.body.style.overflow = 'auto';
            }, 300);
        }

        closeBtn.addEventListener('click', closeModal);
        overlay.addEventListener('click', (e) => { 
            if (e.target === overlay) closeModal(); 
        });

        zoomInBtn.addEventListener('click', () => applyZoom(1.1));
        zoomOutBtn.addEventListener('click', () => applyZoom(0.9));
        resetBtn.addEventListener('click', initZoom);

        // --- ZOOM MOLETTE (sans Ctrl) ---
        imageContainer.addEventListener('wheel', (e) => {
            e.preventDefault();
            const factor = e.deltaY > 0 ? 0.9 : 1.1;
            applyZoom(factor);
        }, { passive: false });

        // --- DRAG SOURIS (clic gauche maintenu) ---
        imageContainer.addEventListener('mousedown', (e) => {
            if (isFitMode) return;
            isDragging = true;
            dragStartX = e.clientX;
            dragStartY = e.clientY;
            scrollStartX = imageContainer.scrollLeft;
            scrollStartY = imageContainer.scrollTop;
            imageContainer.style.cursor = 'grabbing';
            modalImg.style.cursor = 'grabbing';
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const dx = e.clientX - dragStartX;
            const dy = e.clientY - dragStartY;
            imageContainer.scrollLeft = scrollStartX - dx;
            imageContainer.scrollTop = scrollStartY - dy;
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                imageContainer.style.cursor = '';
                modalImg.style.cursor = isFitMode ? 'zoom-in' : 'grab';
            }
        });

        // --- CLIC IMAGE (zoom toggle, seulement si pas de drag) ---
        let mouseDownPos = { x: 0, y: 0 };
        modalImg.addEventListener('mousedown', (e) => {
            mouseDownPos = { x: e.clientX, y: e.clientY };
        });
        modalImg.addEventListener('click', (e) => {
            e.stopPropagation();
            const dist = Math.hypot(e.clientX - mouseDownPos.x, e.clientY - mouseDownPos.y);
            if (dist > 5) return; // c'était un drag, pas un clic
            if (isFitMode) {
                applyZoom(1.5);
            } else {
                initZoom();
            }
        });

        // --- SUPPORT TACTILE : DRAG + PINCH-TO-ZOOM ---
        function getTouchDist(touches) {
            const dx = touches[0].clientX - touches[1].clientX;
            const dy = touches[0].clientY - touches[1].clientY;
            return Math.hypot(dx, dy);
        }

        imageContainer.addEventListener('touchstart', (e) => {
            if (e.touches.length === 2) {
                // Pinch start
                lastTouchDist = getTouchDist(e.touches);
                e.preventDefault();
            } else if (e.touches.length === 1 && !isFitMode) {
                // Drag start
                isTouchDragging = true;
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
                touchScrollStartX = imageContainer.scrollLeft;
                touchScrollStartY = imageContainer.scrollTop;
            }
        }, { passive: false });

        imageContainer.addEventListener('touchmove', (e) => {
            if (e.touches.length === 2 && lastTouchDist > 0) {
                // Pinch zoom
                e.preventDefault();
                const newDist = getTouchDist(e.touches);
                const factor = newDist / lastTouchDist;
                applyZoom(factor);
                lastTouchDist = newDist;
            } else if (e.touches.length === 1 && isTouchDragging) {
                // Touch drag
                e.preventDefault();
                const dx = e.touches[0].clientX - touchStartX;
                const dy = e.touches[0].clientY - touchStartY;
                imageContainer.scrollLeft = touchScrollStartX - dx;
                imageContainer.scrollTop = touchScrollStartY - dy;
            }
        }, { passive: false });

        imageContainer.addEventListener('touchend', (e) => {
            if (e.touches.length < 2) lastTouchDist = 0;
            if (e.touches.length === 0) isTouchDragging = false;
        });

        downloadBtn.addEventListener('click', () => {
            const link = document.createElement('a');
            link.href = downloadPath;
            link.download = downloadName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });

        document.body.style.overflow = 'hidden';
        const escHandler = (e) => { 
            if (e.key === 'Escape') { 
                closeModal(); 
                document.removeEventListener('keydown', escHandler); 
            }
        };
        document.addEventListener('keydown', escHandler);
    }

    /**
     * Ajoute un indicateur de chargement sur les images
     */
    function addLoadingIndicator() {
        const images = document.querySelectorAll('.cv-img, .lettre-img, .lm-img');
        images.forEach(img => {
            if (!img.complete) {
                const loader = document.createElement('div');
                loader.className = 'image-loader';
                loader.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
                img.parentElement.appendChild(loader);
                img.addEventListener('load', () => {
                    loader.style.opacity = '0';
                    setTimeout(() => {
                        if (img.parentElement && img.parentElement.contains(loader)) {
                            img.parentElement.removeChild(loader);
                        }
                    }, 300);
                });
            }
        });
    }

    /**
     * Initialise toutes les animations
     */
    function init() {
        const pageType = findPageType();
        if (!pageType) return; // Pas une page CV ou LM

        animateOnScroll();
        addSubtleHoverEffects();
        addClickZoom();
        addLoadingIndicator();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
