let currentIndex = 0;
const images = ['img/dish1.jpg', 'img/dish2.jpg', 'img/dish3.jpg'];
const carousel = document.querySelector('.carousel');
const imgEl = document.createElement('img');
imgEl.src = images[currentIndex];
carousel.appendChild(imgEl);

function updateCarousel() {
    imgEl.src = images[currentIndex];
    imgEl.style.transform = 'scale(1.2)';
    setTimeout(() => imgEl.style.transform = 'scale(1)', 500);
}

function nextImage() {
    currentIndex = (currentIndex + 1) % images.length;
    updateCarousel();
}

setInterval(nextImage, 3000); // Change image every 3 seconds
