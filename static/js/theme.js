// Theme Management
(function () {
    'use strict';

    // Apply theme before page renders to prevent flash
    (function () {
        document.documentElement.classList.add('preload');
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);

        const savedPremiumTheme = localStorage.getItem('premium-theme');
        const validThemes = ['gold', 'midnight', 'ocean', 'forest', 'sunset', 'royal'];
        const themes = ['theme-gold', 'theme-midnight', 'theme-ocean', 'theme-forest', 'theme-sunset', 'theme-royal'];
        document.documentElement.classList.remove(...themes);

        if (savedPremiumTheme && validThemes.includes(savedPremiumTheme)) {
            document.documentElement.classList.add('theme-' + savedPremiumTheme);
        }
    })();

    // Theme Toggle Functionality
    document.addEventListener('DOMContentLoaded', () => {
        const themeToggle = document.getElementById('theme-toggle');
        const sunIcon = document.getElementById('sun-icon');
        const moonIcon = document.getElementById('moon-icon');
        const html = document.documentElement;

        const currentTheme = localStorage.getItem('theme') || 'dark';
        updateThemeIcons(currentTheme);

        window.addEventListener('load', () => {
            document.body.classList.remove('no-transition');
        });

        themeToggle?.addEventListener('click', () => {
            const newTheme = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            html.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcons(newTheme);
        });

        function updateThemeIcons(theme) {
            if (theme === 'dark') {
                sunIcon?.classList.remove('hidden');
                moonIcon?.classList.add('hidden');
            } else {
                sunIcon?.classList.add('hidden');
                moonIcon?.classList.remove('hidden');
            }
        }
    });

    // Premium Theme Functions
    window.applyPremiumTheme = function (theme) {
        const body = document.body;
        const html = document.documentElement;
        const themes = ['theme-gold', 'theme-midnight', 'theme-ocean', 'theme-forest', 'theme-sunset', 'theme-royal'];

        // Remove all theme classes
        themes.forEach(t => {
            body.classList.remove(t);
            html.classList.remove(t);
        });

        const themeMap = {
            'gold': 'theme-gold',
            'midnight': 'theme-midnight',
            'ocean': 'theme-ocean',
            'forest': 'theme-forest',
            'sunset': 'theme-sunset',
            'royal': 'theme-royal'
        };

        if (theme && theme !== 'default' && themeMap[theme]) {
            // Apply theme with smooth transition
            requestAnimationFrame(() => {
                body.classList.add(themeMap[theme]);
                html.classList.add(themeMap[theme]);
                localStorage.setItem('premium-theme', theme);

                // Trigger custom event for other components
                window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
            });
        } else {
            // Reset to default - restore original pink theme (light mode)
            localStorage.removeItem('premium-theme');
            html.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
            window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: 'default' } }));
        }
    };

    // Load premium theme on page load
    document.addEventListener('DOMContentLoaded', () => {
        const savedTheme = localStorage.getItem('premium-theme');
        const validThemes = ['gold', 'midnight', 'ocean', 'forest', 'sunset', 'royal'];
        if (savedTheme && validThemes.includes(savedTheme)) {
            const body = document.body;
            const html = document.documentElement;
            if (!body.classList.contains('theme-' + savedTheme)) {
                window.applyPremiumTheme(savedTheme);
            }
        }
    });
})();

