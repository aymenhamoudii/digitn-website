// Main application entry point for Bella Vista Restaurant Website

import { DemoDataSeeder } from './demo-data.js';
import { Navigation } from './navigation.js';
import { MenuSystem } from './menu.js';
import { GallerySystem } from './gallery.js';
import { MapSystem } from './map.js';

class App {
    constructor() {
        this.isInitialized = false;
    }

    async init() {
        try {
            console.log('Initializing Bella Vista Restaurant website...');

            // Initialize components in dependency order
            // 1. First, seed demo data (no dependencies)
            new DemoDataSeeder();

            // Wait a brief moment for DOM to be fully ready
            await this.waitForDOMReady();

            // 2. Initialize navigation (depends on DOM being ready)
            new Navigation();

            // 3. Initialize menu system (depends on demo data being available)
            new MenuSystem();

            // 4. Initialize gallery system (depends on demo data being available)
            new GallerySystem();

            // 5. Initialize map system (depends on DOM being ready)
            new MapSystem();

            this.isInitialized = true;
            console.log('Bella Vista Restaurant website initialized successfully!');

        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.handleInitializationError(error);
        }
    }

    waitForDOMReady() {
        return new Promise((resolve) => {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', resolve);
            } else {
                resolve();
            }
        });
    }

    handleInitializationError(error) {
        console.error('App initialization failed:', error);

        // Show user-friendly error message
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: #dc2626;
            color: white;
            padding: 1rem;
            text-align: center;
            z-index: 9999;
            font-family: 'Inter', sans-serif;
        `;
        errorDiv.innerHTML = `
            <strong>Oops!</strong> There was an issue loading the website.
            Please refresh the page or try again later.
        `;

        document.body.prepend(errorDiv);

        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.remove();
            }
        }, 10000);
    }
}

// Initialize the app when the DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.app = new App();
        window.app.init();
    });
} else {
    // DOM is already ready
    window.app = new App();
    window.app.init();
}