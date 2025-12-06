// =====================
// ANIMATIONS CV SOBRES ET PROFESSIONNELLES
// =====================

document.addEventListener('DOMContentLoaded', function () {

    // =====================
    // 1. ANIMATION D'APPARITION AU SCROLL (DOUCE)
    // =====================

    function animateOnScroll() {
        const images = document.querySelectorAll('.cv-img, .lettre-img');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, {
            threshold: 0.2,
            rootMargin: '0px 0px -50px 0px'
        });

        images.forEach(img => {
            observer.observe(img);
        });
    }

    // =====================
    // 2. EFFET HOVER SUBTIL
    // =====================

    function addSubtleHoverEffects() {
        const images = document.querySelectorAll('.cv-img, .lettre-img');

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

    // =====================
    // 3. MODAL PROFESSIONNEL AVEC FONT AWESOME
    // =====================

    function addClickZoom() {
        const images = document.querySelectorAll('.cv-img, .lettre-img');

        images.forEach(img => {
            img.style.cursor = 'pointer';

            // Ajouter un indicateur subtil de clicabilité
            const indicator = document.createElement('div');
            img.parentElement.style.position = 'relative';
            img.parentElement.appendChild(indicator);

            img.addEventListener('click', function (e) {
                e.preventDefault();
                createModal(this);
            });
        });
    }

    function createModal(imgElement) {
        const modal = document.createElement('div');
        modal.className = 'image-modal';
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

        document.body.appendChild(modal);

        // Animation d'ouverture fluide
        requestAnimationFrame(() => {
            modal.classList.add('active');
        });

        setupModalControls(modal, imgElement);
    }

    function getDocumentTitle(imgElement) {
        if (imgElement.classList.contains('cv-img')) {
            return 'Curriculum Vitae';
        } else if (imgElement.classList.contains('lettre-img')) {
            return 'Lettre de Motivation';
        }
        return 'Document';
    }

    function setupModalControls(modal, originalImg) {
        const modalImg = modal.querySelector('.modal-image');
        const closeBtn = modal.querySelector('.modal-close');
        const zoomInBtn = modal.querySelector('.modal-zoom-in');
        const zoomOutBtn = modal.querySelector('.modal-zoom-out');
        const resetBtn = modal.querySelector('.modal-reset');
        const downloadBtn = modal.querySelector('.modal-download');
        const overlay = modal.querySelector('.modal-overlay');
        const imageContainer = modal.querySelector('.modal-image-container');

        let scale = 1;
        let isDragging = false;
        let dragStart = { x: 0, y: 0 };
        let imagePosition = { x: 0, y: 0 };

        // Fermer le modal
        function closeModal() {
            modal.classList.add('closing');
            setTimeout(() => {
                if (document.body.contains(modal)) {
                    document.body.removeChild(modal);
                }
                document.body.style.overflow = 'auto';
            }, 300);
        }

        // Event listeners
        closeBtn.addEventListener('click', closeModal);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeModal();
        });

        // Contrôles de zoom
        zoomInBtn.addEventListener('click', () => {
            scale = Math.min(scale * 1.3, 4);
            updateImageTransform();
        });

        zoomOutBtn.addEventListener('click', () => {
            scale = Math.max(scale / 1.3, 0.3);
            updateImageTransform();
        });

        resetBtn.addEventListener('click', () => {
            scale = 1;
            imagePosition = { x: 0, y: 0 };
            updateImageTransform();
        });

        // Téléchargement
        downloadBtn.addEventListener('click', () => {
            const link = document.createElement('a');
            link.href = 'assets/pdf/cv.pdf';
            link.download = 'CV_METGY_LEO.pdf';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });

        // Drag & Drop pour déplacer l'image zoomée
        modalImg.addEventListener('mousedown', startDrag);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', stopDrag);

        function startDrag(e) {
            if (scale > 1) {
                isDragging = true;
                dragStart.x = e.clientX - imagePosition.x;
                dragStart.y = e.clientY - imagePosition.y;
                modalImg.style.cursor = 'grabbing';
                e.preventDefault();
            }
        }

        function drag(e) {
            if (isDragging) {
                imagePosition.x = e.clientX - dragStart.x;
                imagePosition.y = e.clientY - dragStart.y;
                updateImageTransform();
            }
        }

        function stopDrag() {
            isDragging = false;
            modalImg.style.cursor = scale > 1 ? 'grab' : 'default';
        }

        function updateImageTransform() {
            modalImg.style.transform = `scale(${scale}) translate(${imagePosition.x / scale}px, ${imagePosition.y / scale}px)`;
            modalImg.style.cursor = scale > 1 ? 'grab' : 'default';
        }

        // Zoom avec la molette
        imageContainer.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? 0.9 : 1.1;
            scale = Math.min(Math.max(scale * delta, 0.3), 4);
            updateImageTransform();
        });

        // Prévenir le scroll du body
        document.body.style.overflow = 'hidden';

        // Fermer avec Échap
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
    }

    // =====================
    // 4. INDICATEUR DE CHARGEMENT SUBTIL
    // =====================

    function addLoadingIndicator() {
        const images = document.querySelectorAll('.cv-img, .lettre-img');

        images.forEach(img => {
            if (!img.complete) {
                const loader = document.createElement('div');
                loader.className = 'image-loader';
                loader.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

                img.parentElement.appendChild(loader);

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

    // =====================
    // INITIALISATION
    // =====================

    animateOnScroll();
    addSubtleHoverEffects();
    addClickZoom();
    addLoadingIndicator();

    console.log('📄 Animations CV professionnelles activées');
});