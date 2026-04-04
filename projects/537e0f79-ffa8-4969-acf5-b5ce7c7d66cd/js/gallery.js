// Gallery System for Bella Vista Restaurant Website

export class GallerySystem {
    constructor() {
        this.galleryGrid = document.getElementById('gallery-grid');
        this.lightboxModal = null;
        this.currentImageIndex = 0;
        this.images = [];

        this.init();
    }

    init() {
        // Load demo gallery data
        this.loadGalleryData();

        // Create lightbox modal
        this.createLightboxModal();

        // Bind events
        this.bindEvents();

        // Initial render
        this.renderGallery();
    }

    loadGalleryData() {
        // This would normally come from an API or database
        // For now, we'll use the demo data seeded in demo-data.js
        if (window.demoGalleryData && Array.isArray(window.demoGalleryData)) {
            this.images = window.demoGalleryData;
        } else {
            console.warn('Demo gallery data not found, using fallback data');
            this.images = [];
        }
    }

    createLightboxModal() {
        // Create lightbox modal if it doesn't exist
        if (!document.querySelector('.lightbox-modal')) {
            const modal = document.createElement('div');
            modal.className = 'lightbox-modal';
            modal.innerHTML = `
                <div class="lightbox-content">
                    <button class="lightbox-close" aria-label="Close lightbox">&times;</button>
                    <img src="" alt="" class="lightbox-image">
                    <button class="lightbox-nav lightbox-prev" aria-label="Previous image">&#10094;</button>
                    <button class="lightbox-nav lightbox-next" aria-label="Next image">&#10095;</button>
                    <p class="lightbox-caption"></p>
                </div>
            `;
            document.body.appendChild(modal);
            this.lightboxModal = modal;

            // Add keyboard event listeners to modal buttons
            modal.querySelector('.lightbox-close').addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.closeLightbox();
                }
            });

            modal.querySelector('.lightbox-prev').addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.showPrevImage();
                }
            });

            modal.querySelector('.lightbox-next').addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.showNextImage();
                }
            });
        } else {
            this.lightboxModal = document.querySelector('.lightbox-modal');
        }
    }

    bindEvents() {
        // Gallery item click events
        if (this.galleryGrid) {
            this.galleryGrid.addEventListener('click', (e) => {
                const galleryItem = e.target.closest('.gallery-item');
                if (galleryItem) {
                    const index = parseInt(galleryItem.getAttribute('data-index'));
                    this.openLightbox(index);
                }
            });
        }

        // Keyboard navigation for lightbox
        document.addEventListener('keydown', (e) => {
            if (this.lightboxModal && this.lightboxModal.classList.contains('active')) {
                switch (e.key) {
                    case 'Escape':
                        this.closeLightbox();
                        break;
                    case 'ArrowLeft':
                        this.showPrevImage();
                        break;
                    case 'ArrowRight':
                        this.showNextImage();
                        break;
                }
            }
        });

        // Close lightbox when clicking outside image
        if (this.lightboxModal) {
            this.lightboxModal.addEventListener('click', (e) => {
                if (e.target === this.lightboxModal) {
                    this.closeLightbox();
                }
            });
        }

        // Close button events
        const closeBtn = this.lightboxModal?.querySelector('.lightbox-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeLightbox());
        }

        // Navigation button events
        const prevBtn = this.lightboxModal?.querySelector('.lightbox-prev');
        const nextBtn = this.lightboxModal?.querySelector('.lightbox-next');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.showPrevImage());
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.showNextImage());
        }
    }

    renderGallery() {
        if (!this.galleryGrid) return;

        if (this.images.length === 0) {
            this.galleryGrid.innerHTML = `
                <div class="no-images">
                    <p>No gallery images available.</p>
                </div>
            `;
            return;
        }

        this.galleryGrid.innerHTML = this.images.map((image, index) =>
            this.createGalleryItemHTML(image, index)
        ).join('');
    }

    createGalleryItemHTML(image, index) {
        return `
            <figure class="gallery-item" data-index="${index}" tabindex="0" role="button" aria-label="View ${image.caption} in full size">
                <img src="${image.src}"
                     alt="${this.escapeHtml(image.alt)}"
                     class="gallery-image"
                     loading="lazy"
                     width="400"
                     height="300">
                <figcaption class="gallery-caption">
                    <span class="gallery-caption-text">${this.escapeHtml(image.caption)}</span>
                </figcaption>
            </figure>
        `;
    }

    openLightbox(index) {
        if (!this.images[index]) return;

        this.currentImageIndex = index;
        const currentImage = this.images[index];

        // Update lightbox content
        const lightboxImage = this.lightboxModal.querySelector('.lightbox-image');
        const lightboxCaption = this.lightboxModal.querySelector('.lightbox-caption');

        lightboxImage.src = currentImage.src;
        lightboxImage.alt = currentImage.alt;
        lightboxCaption.textContent = currentImage.caption;

        // Show lightbox
        this.lightboxModal.classList.add('active');

        // Focus management
        setTimeout(() => {
            this.lightboxModal.querySelector('.lightbox-close').focus();
        }, 100);

        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    }

    closeLightbox() {
        if (this.lightboxModal) {
            this.lightboxModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    showPrevImage() {
        let newIndex = this.currentImageIndex - 1;
        if (newIndex < 0) {
            newIndex = this.images.length - 1;
        }
        this.openLightbox(newIndex);
    }

    showNextImage() {
        let newIndex = this.currentImageIndex + 1;
        if (newIndex >= this.images.length) {
            newIndex = 0;
        }
        this.openLightbox(newIndex);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Public methods for external control
    refreshGallery() {
        this.loadGalleryData();
        this.renderGallery();
    }

    addImage(imageData) {
        this.images.push(imageData);
        this.renderGallery();
    }

    removeImage(index) {
        if (index >= 0 && index < this.images.length) {
            this.images.splice(index, 1);
            this.renderGallery();
        }
    }
}

// Initialize gallery system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new GallerySystem();
});