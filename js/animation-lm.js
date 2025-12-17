/**
 * ============================================
 * ANIMATIONS LM - VERSION FINALE (AVEC LIMITES DE ZOOM)
 * ============================================
 */

document.addEventListener('DOMContentLoaded', function () {

    function animateOnScroll() {
        const images = document.querySelectorAll('.cv-img, .lettre-img');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) entry.target.classList.add('animate-in');
            });
        }, { threshold: 0.2, rootMargin: '0px 0px -50px 0px' });
        images.forEach(img => observer.observe(img));
    }

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

    function addClickZoom() {
        const images = document.querySelectorAll('.cv-img, .lettre-img');
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

    function createModal(imgElement) {
        const modal = document.createElement('div');
        modal.className = 'image-modal';
        
        modal.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 class="modal-title">${getDocumentTitle(imgElement)}</h3>
                        <button class="modal-close" aria-label="Fermer"><i class="fas fa-times"></i></button>
                    </div>
                    
                    <div class="modal-image-container">
                        <img src="${imgElement.src}" alt="${imgElement.alt}" class="modal-image">
                    </div>
                    
                    <div class="modal-controls">
                        <button class="modal-btn modal-zoom-in" title="Zoomer">
                            <i class="fas fa-search-plus"></i><span>Zoomer</span>
                        </button>
                        <button class="modal-btn modal-zoom-out" title="Dézoomer">
                            <i class="fas fa-search-minus"></i><span>Dézoomer</span>
                        </button>
                        <button class="modal-btn modal-reset" title="Ajuster">
                            <i class="fas fa-compress-arrows-alt"></i><span>Ajuster</span>
                        </button>
                        <button class="modal-btn modal-download" title="Télécharger">
                            <i class="fas fa-download"></i><span>Télécharger</span>
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        requestAnimationFrame(() => modal.classList.add('active'));
        setupModalControls(modal, imgElement);
    }

    function getDocumentTitle(imgElement) {
        if (imgElement.classList.contains('lettre-img') || imgElement.classList.contains('lm-img')) return 'Lettre de Motivation';
        return 'Document';
    }

    function setupModalControls(modal, originalImg) {
        const modalImg = modal.querySelector('.modal-image');
        const zoomInBtn = modal.querySelector('.modal-zoom-in');
        const zoomOutBtn = modal.querySelector('.modal-zoom-out');
        const resetBtn = modal.querySelector('.modal-reset');
        const downloadBtn = modal.querySelector('.modal-download');
        const closeBtn = modal.querySelector('.modal-close');
        const overlay = modal.querySelector('.modal-overlay');
        const imageContainer = modal.querySelector('.modal-image-container');

        // --- LIMITES DE ZOOM (en pixels) ---
        const MIN_ZOOM = 300; 
        const MAX_ZOOM = 2500; 

        let isFitMode = true;
        let currentWidth = 0;

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
            
            // --- APPLICATION DES LIMITES ---
            if (newWidth > MAX_ZOOM) newWidth = MAX_ZOOM;
            if (newWidth < MIN_ZOOM) newWidth = MIN_ZOOM;
            
            currentWidth = newWidth;
            
            modalImg.style.width = `${currentWidth}px`;
            modalImg.style.height = 'auto';
            modalImg.style.cursor = 'zoom-out';
        }

        initZoom();

        function closeModal() {
            modal.classList.add('closing');
            setTimeout(() => {
                if (document.body.contains(modal)) document.body.removeChild(modal);
                document.body.style.overflow = 'auto';
            }, 300);
        }

        closeBtn.addEventListener('click', closeModal);
        overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });

        zoomInBtn.addEventListener('click', () => applyZoom(1.1));
        zoomOutBtn.addEventListener('click', () => applyZoom(0.9));
        resetBtn.addEventListener('click', initZoom);

        modalImg.addEventListener('click', (e) => {
            e.stopPropagation();
            if (isFitMode) {
                applyZoom(1.5);
            } else {
                initZoom();
            }
        });

        imageContainer.addEventListener('wheel', (e) => {
            if (e.ctrlKey) {
                e.preventDefault();
                const factor = e.deltaY > 0 ? 0.9 : 1.1;
                applyZoom(factor);
            }
        });

        downloadBtn.addEventListener('click', () => {
            const link = document.createElement('a');
            link.href = 'assets/pdf/lettremotivation.pdf'; 
            link.download = 'LETTRE_DE_MOTIVATION_METGY_LEO.pdf';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });

        document.body.style.overflow = 'hidden';
        const escHandler = (e) => { if (e.key === 'Escape') { closeModal(); document.removeEventListener('keydown', escHandler); }};
        document.addEventListener('keydown', escHandler);
    }

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
                    setTimeout(() => img.parentElement.contains(loader) && img.parentElement.removeChild(loader), 300);
                });
            }
        });
    }

    animateOnScroll();
    addSubtleHoverEffects();
    addClickZoom();
    addLoadingIndicator();
});