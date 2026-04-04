const galleryImages = [
    'image1.jpg',
    'image2.jpg',
    'image3.jpg'
];

function renderGallery() {
    const galleryContainer = document.getElementById('gallery');
    galleryImages.forEach(image => {
        const imgElement = document.createElement('img');
        imgElement.src = image;
        imgElement.alt = 'Food Image';
        imgElement.classList.add('gallery-image');
        galleryContainer.appendChild(imgElement);
    });
}

document.addEventListener('DOMContentLoaded', renderGallery);