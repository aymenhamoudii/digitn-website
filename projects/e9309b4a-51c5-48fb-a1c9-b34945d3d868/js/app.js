// Main Application Logic

class App {
    constructor() {
        this.init();
    }

    init() {
        this.removeLoader();
        this.setupNavigation();
        this.populateMenu();
        this.populateGallery();
        this.populateReviews();
        this.setupParallax();
        this.setupReservationModal();
    }

    removeLoader() {
        setTimeout(() => {
            const loader = document.getElementById('loader');
            if (loader) {
                loader.classList.add('hidden');
            }
        }, 800);
    }

    setupNavigation() {
        const navbar = document.getElementById('navbar');
        const mobileBtn = document.querySelector('.mobile-menu-btn');
        const navContent = document.querySelector('.nav-content');
        const navLinks = document.querySelectorAll('.nav-links a');

        // Scroll effect
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });

        // Mobile menu toggle
        if (mobileBtn) {
            mobileBtn.addEventListener('click', () => {
                mobileBtn.classList.toggle('active');
                navContent.classList.toggle('menu-open');
            });
        }

        // Smooth scroll & close mobile menu
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const targetSec = document.getElementById(targetId);
                
                if (targetSec) {
                    window.scrollTo({
                        top: targetSec.offsetTop - 80,
                        behavior: 'smooth'
                    });
                }

                if (mobileBtn && mobileBtn.classList.contains('active')) {
                    mobileBtn.classList.remove('active');
                    navContent.classList.remove('menu-open');
                }
            });
        });
    }

    populateMenu() {
        const menuGrid = document.getElementById('menu-grid');
        if (!menuGrid || !THE_RUSTIC_HEARTH_DATA.menu) return;

        THE_RUSTIC_HEARTH_DATA.menu.forEach(item => {
            const tagsHtml = item.tags.map(tag => `<span class="tag">${tag}</span>`).join('');
            
            const card = document.createElement('div');
            card.className = 'menu-item';
            card.innerHTML = `
                <div class="menu-item-img" style="background-image: url('${item.image}')"></div>
                <div class="menu-item-content">
                    <div class="menu-item-header">
                        <h3>${item.name}</h3>
                        <span class="menu-item-price">${item.price}</span>
                    </div>
                    <p class="menu-item-desc">${item.description}</p>
                    <div class="menu-item-tags">
                        ${tagsHtml}
                    </div>
                </div>
            `;
            menuGrid.appendChild(card);
        });
    }

    populateGallery() {
        const galleryGrid = document.getElementById('gallery-grid');
        if (!galleryGrid || !THE_RUSTIC_HEARTH_DATA.gallery) return;

        THE_RUSTIC_HEARTH_DATA.gallery.forEach((url, index) => {
            const item = document.createElement('div');
            item.className = 'gallery-item';
            item.innerHTML = `<img src="${url}" alt="Restaurant Ambiance ${index + 1}" loading="lazy">`;
            galleryGrid.appendChild(item);
        });
    }

    populateReviews() {
        const slider = document.getElementById('reviews-slider');
        if (!slider || !THE_RUSTIC_HEARTH_DATA.reviews) return;

        THE_RUSTIC_HEARTH_DATA.reviews.forEach(review => {
            const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
            
            const card = document.createElement('div');
            card.className = 'review-card';
            card.innerHTML = `
                <div class="stars">${stars}</div>
                <p class="review-text">"${review.text}"</p>
                <div class="reviewer">
                    <div class="reviewer-avatar">${review.avatar}</div>
                    <div>
                        <div class="reviewer-name">${review.name}</div>
                        <div class="reviewer-date">${review.date}</div>
                    </div>
                </div>
            `;
            slider.appendChild(card);
        });
    }

    setupParallax() {
        const parallaxElements = document.querySelectorAll('.parallax-element');
        
        window.addEventListener('scroll', () => {
            const scrolled = window.scrollY;
            
            parallaxElements.forEach(el => {
                const speed = parseFloat(el.getAttribute('data-speed')) || 0.5;
                const yPos = -(scrolled * speed);
                el.style.transform = `translateY(${yPos}px)`;
            });
        });
    }

    setupReservationModal() {
        const modal = document.getElementById('reservation-modal');
        const form = document.getElementById('reservation-form');
        const successMsg = document.getElementById('reservation-success');
        
        const openBtns = [
            document.getElementById('nav-reserve-btn'),
            document.getElementById('hero-reserve-btn')
        ];
        
        const closeBtn = document.querySelector('.close-modal');

        const openModal = () => {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Set min date to today
            const dateInput = document.getElementById('res-date');
            if (dateInput) {
                const today = new Date().toISOString().split('T')[0];
                dateInput.setAttribute('min', today);
                dateInput.value = today;
            }
        };

        const closeModal = () => {
            modal.classList.remove('active');
            document.body.style.overflow = '';
            setTimeout(() => {
                form.reset();
                form.classList.remove('hidden');
                successMsg.classList.add('hidden');
            }, 300);
        };

        openBtns.forEach(btn => {
            if (btn) btn.addEventListener('click', (e) => {
                e.preventDefault();
                openModal();
            });
        });

        if (closeBtn) {
            closeBtn.addEventListener('click', closeModal);
        }

        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });

        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                form.classList.add('hidden');
                successMsg.classList.remove('hidden');
                
                // Demo behavior: close modal after 3 seconds
                setTimeout(() => {
                    closeModal();
                }, 3000);
            });
        }
    }
}

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});