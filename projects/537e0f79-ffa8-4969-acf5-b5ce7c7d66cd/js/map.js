// Map Integration System for Bella Vista Restaurant Website

export class MapSystem {
    constructor() {
        this.mapContainer = document.querySelector('.map-container');
        this.directionsButton = null;
        this.isMobile = window.innerWidth <= 768;

        this.init();
    }

    init() {
        // Bind events
        this.bindEvents();

        // Check if we're on mobile and adjust map accordingly
        this.handleResponsiveMap();
    }

    bindEvents() {
        // Directions button click
        this.directionsButton = document.querySelector('.btn-tertiary');
        if (this.directionsButton) {
            this.directionsButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.openDirections();
            });

            // Keyboard support
            this.directionsButton.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.openDirections();
                }
            });
        }

        // Handle window resize for responsive map
        window.addEventListener('resize', () => {
            const wasMobile = this.isMobile;
            this.isMobile = window.innerWidth <= 768;

            if (wasMobile !== this.isMobile) {
                this.handleResponsiveMap();
            }
        });
    }

    openDirections() {
        // Get the address from the contact section or use default
        const addressElement = document.querySelector('[data-address]') ||
                              document.querySelector('.contact-item:first-child p');

        let address = '';
        if (addressElement) {
            address = encodeURIComponent(addressElement.textContent.trim());
        } else {
            // Fallback to default address
            address = encodeURIComponent('123 Culinary Street, Downtown District, City, State 12345');
        }

        // Create directions URL
        const directionsUrl = `https://maps.google.com/?q=${address}`;

        // Open in new tab for desktop
        if (!this.isMobile) {
            window.open(directionsUrl, '_blank', 'noopener,noreferrer');
        } else {
            // On mobile, try to open in native maps app
            this.openNativeMapsApp(address);
        }
    }

    openNativeMapsApp(address) {
        // Try different native apps based on platform detection
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;

        // iOS devices
        if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
            this.openIOSMaps(address);
        }
        // Android devices
        else if (/android/i.test(userAgent)) {
            this.openAndroidMaps(address);
        }
        // Desktop fallback
        else {
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${address}`, '_blank', 'noopener,noreferrer');
        }
    }

    openIOSMaps(address) {
        // Try Apple Maps first, then Google Maps
        const appleMapsUrl = `http://maps.apple.com/?q=${address}`;
        const googleMapsUrl = `comgooglemaps://?daddr=${address}&directionsmode=driving`;

        // Test if Google Maps app is installed
        const googleMapsTest = document.createElement('iframe');
        googleMapsTest.style.display = 'none';
        document.body.appendChild(googleMapsTest);

        googleMapsTest.onload = () => {
            document.body.removeChild(googleMapsTest);
            // If Google Maps loads, it's installed
            window.location.href = googleMapsUrl;
        };

        googleMapsTest.onerror = () => {
            document.body.removeChild(googleMapsTest);
            // Fall back to Apple Maps
            window.location.href = appleMapsUrl;
        };

        googleMapsTest.src = 'https://www.google.com/maps/embed/v1/place?q=' + address;
    }

    openAndroidMaps(address) {
        // Try Google Maps app first, then web version
        const googleMapsUrl = `geo:0,0?q=${address}`;
        const webMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${address}`;

        // Try to open Google Maps app
        window.location.href = googleMapsUrl;

        // If app doesn't open, fall back to web after a short delay
        setTimeout(() => {
            if (!document.hidden) {
                window.open(webMapsUrl, '_blank', 'noopener,noreferrer');
            }
        }, 500);
    }

    handleResponsiveMap() {
        if (!this.mapContainer) return;

        // For very small screens, we might want to adjust the map height
        const mapFrame = this.mapContainer.querySelector('iframe');
        if (mapFrame) {
            if (this.isMobile) {
                // Reduce map height on mobile for better UX
                mapFrame.style.height = '300px';
            } else {
                // Restore full height on desktop
                mapFrame.style.height = '';
            }
        }
    }

    // Public methods for external control
    updateMapLocation(latitude, longitude) {
        const mapFrame = this.mapContainer?.querySelector('iframe');
        if (mapFrame) {
            const newSrc = `https://maps.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`;
            mapFrame.src = newSrc;
        }
    }

    updateAddress(newAddress) {
        // Update address in contact section and directions
        const addressElements = document.querySelectorAll('.contact-item:first-child p');
        addressElements.forEach(element => {
            element.textContent = newAddress;
        });
    }
}

// Initialize map system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MapSystem();
});