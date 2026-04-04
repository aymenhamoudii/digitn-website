/**
 * Theme Engine
 * Manages dark/light mode preference and OS sync
 */

(function() {
    const STORAGE_KEY = 'portfelio-theme';
    const themeToggle = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;

    // 1. Determine Initial Theme
    const getInitialTheme = () => {
        const savedTheme = localStorage.getItem(STORAGE_KEY);
        if (savedTheme) {
            return savedTheme;
        }

        // Check system preference
        const userPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        return userPrefersDark ? 'dark' : 'light';
    };

    // 2. Apply Theme Function
    const applyTheme = (theme) => {
        htmlElement.setAttribute('data-theme', theme);
        localStorage.setItem(STORAGE_KEY, theme);
        
        // Dynamic Meta Theme Color update
        const themeColor = theme === 'dark' ? '#050810' : '#f1f5f9';
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.setAttribute('content', themeColor);
        } else {
            const meta = document.createElement('meta');
            meta.name = 'theme-color';
            meta.content = themeColor;
            document.head.appendChild(meta);
        }
    };

    // 3. Initialize Engine
    const currentTheme = getInitialTheme();
    applyTheme(currentTheme);

    // 4. Handle Interaction
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const current = htmlElement.getAttribute('data-theme');
            const next = current === 'dark' ? 'light' : 'dark';
            applyTheme(next);
        });
    }

    // 5. Watch System Changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem(STORAGE_KEY)) {
            applyTheme(e.matches ? 'dark' : 'light');
        }
    });
})();
