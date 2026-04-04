// carousel.js - Global scope, handles gallery and reviews rendering/logic

// Gallery State
const state = {
    currentIndex: 0,
    itemWidth: 0,
    totalItems: 0,
    itemsPerView: 3
};

function renderGallery() {
    const track = document.getElementById('gallery-track');
    if (!track) return;

    const imagesDataStr = localStorage.getItem('auraGalleryData');
    if (!imagesDataStr) return;

    const images = JSON.parse(imagesDataStr);
    state.totalItems = images.length;
    
    let html = '';
    images.forEach((img, index) => {
        html += `
            <div class="gallery-item ${index === 1 ? 'active-slide' : ''}">
                <img src="${img.url}" alt="${img.title}" loading="lazy">
                <div class="gallery-caption">
                    <h4>${img.title}</h4>
                    <p>${img.desc}</p>
                </div>
            </div>
        `;
    });

    track.innerHTML = html;
    initCarousel();
}

function initCarousel() {
    const track = document.getElementById('gallery-track');
    const items = document.querySelectorAll('.gallery-item');
    const prevBtn = document.getElementById('gallery-prev');
    const nextBtn = document.getElementById('gallery-next');

    if (!track || items.length === 0) return;

    function updateMetrics() {
        const viewportWidth = window.innerWidth;
        if (viewportWidth <= 768) {
            state.itemsPerView = 1;
        } else if (viewportWidth <= 1024) {
            state.itemsPerView = 2;
        } else {
            state.itemsPerView = 3;
        }
        
        // Include gap in calculation
        const gap = parseInt(window.getComputedStyle(track).gap) || 24; // fallback to 24px (1.5rem)
        state.itemWidth = items[0].offsetWidth + gap;
        updateSliderPosition();
    }

    function updateSliderPosition() {
        // Prevent scrolling past the end
        const maxIndex = state.totalItems - state.itemsPerView;
        state.currentIndex = Math.max(0, Math.min(state.currentIndex, maxIndex));
        
        const offset = -(state.currentIndex * state.itemWidth);
        track.style.transform = `translateX(${offset}px)`;

        // Update active class for center effect if needed
        items.forEach(item => item.classList.remove('active-slide'));
        // Roughly target the visible center item
        const centerIndex = state.currentIndex + Math.floor(state.itemsPerView / 2);
        if(items[centerIndex]) {
            items[centerIndex].classList.add('active-slide');
        }

        // Disable/enable buttons
        if(prevBtn) prevBtn.style.opacity = state.currentIndex === 0 ? '0.5' : '1';
        if(nextBtn) nextBtn.style.opacity = state.currentIndex >= maxIndex ? '0.5' : '1';
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            state.currentIndex--;
            updateSliderPosition();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            state.currentIndex++;
            updateSliderPosition();
        });
    }

    window.addEventListener('resize', () => {
        // Simple debounce for resize
        clearTimeout(window.resizeTimer);
        window.resizeTimer = setTimeout(updateMetrics, 200);
    });

    // Initial calculation
    setTimeout(updateMetrics, 100);
}

function renderReviews() {
    const grid = document.getElementById('reviews-grid');
    if (!grid) return;

    const reviewsDataStr = localStorage.getItem('auraReviewsData');
    if (!reviewsDataStr) return;

    const reviews = JSON.parse(reviewsDataStr);
    
    let html = '';
    reviews.forEach(review => {
        const starsHtml = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
        html += `
            <div class="review-card">
                <div class="stars" aria-label="Rating: ${review.rating} out of 5 stars">${starsHtml}</div>
                <p class="review-text">${review.text}</p>
                <div class="reviewer-info">
                    <p class="reviewer-name">${review.author}</p>
                    <p class="reviewer-title">${review.title}</p>
                </div>
            </div>
        `;
    });

    grid.innerHTML = html;
}
