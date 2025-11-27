// ============================================
// PREMIUM HAMBURGER MENU FUNCTIONALITY
// ============================================

(function () {
    'use strict';

    // Wait for DOM to be ready
    document.addEventListener('DOMContentLoaded', function () {
        initHamburgerMenu();
    });

    function initHamburgerMenu() {
        const hamburgerBtn = document.getElementById('hamburger-btn');
        const menuPanel = document.getElementById('menu-panel');
        const menuBackdrop = document.getElementById('menu-backdrop');
        const menuCloseBtn = document.getElementById('menu-close-btn');
        const menuItems = document.querySelectorAll('.menu-item');

        if (!hamburgerBtn || !menuPanel || !menuBackdrop) {
            console.warn('Hamburger menu elements not found');
            return;
        }

        // Initialize state
        if (!menuPanel.classList.contains('active')) {
            menuPanel.inert = true;
            menuPanel.setAttribute('aria-hidden', 'true');
        }

        // Toggle menu function
        function toggleMenu(open) {
            const isOpen = open !== undefined ? open : !menuPanel.classList.contains('active');

            if (isOpen) {
                // Open menu
                menuPanel.classList.add('active');
                menuBackdrop.classList.add('active');
                hamburgerBtn.classList.add('active');
                document.body.classList.add('menu-open');

                // Enable interaction and announce to screen readers
                menuPanel.inert = false;
                menuPanel.setAttribute('aria-hidden', 'false');
                hamburgerBtn.setAttribute('aria-expanded', 'true');

                // Focus the close button or first item for better a11y
                setTimeout(() => {
                    const closeBtn = document.getElementById('menu-close-btn');
                    if (closeBtn) closeBtn.focus();
                }, 100);
            } else {
                // Close menu
                menuPanel.classList.remove('active');
                menuBackdrop.classList.remove('active');
                hamburgerBtn.classList.remove('active');
                document.body.classList.remove('menu-open');

                // Disable interaction and announce to screen readers
                menuPanel.inert = true;
                menuPanel.setAttribute('aria-hidden', 'true');
                hamburgerBtn.setAttribute('aria-expanded', 'false');

                // Return focus to hamburger button
                hamburgerBtn.focus();
            }
        }

        // Hamburger button click
        hamburgerBtn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            toggleMenu();
        });

        // Close button click
        if (menuCloseBtn) {
            menuCloseBtn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                toggleMenu(false);
            });
        }

        // Backdrop click to close
        menuBackdrop.addEventListener('click', function () {
            toggleMenu(false);
        });

        // Close menu when clicking a menu item
        menuItems.forEach(function (item) {
            item.addEventListener('click', function () {
                // Small delay for visual feedback
                setTimeout(function () {
                    toggleMenu(false);
                }, 150);
            });
        });

        // Close menu on ESC key
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && menuPanel.classList.contains('active')) {
                toggleMenu(false);
            }
        });

        // Prevent menu from staying open on window resize
        let resizeTimer;
        window.addEventListener('resize', function () {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function () {
                // Close menu if window is resized to desktop
                if (window.innerWidth >= 1024 && menuPanel.classList.contains('active')) {
                    toggleMenu(false);
                }
            }, 250);
        });

        // Handle swipe gesture to close (touch devices)
        let touchStartX = 0;
        let touchEndX = 0;

        menuPanel.addEventListener('touchstart', function (e) {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        menuPanel.addEventListener('touchend', function (e) {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });

        function handleSwipe() {
            const swipeThreshold = 100;
            const swipeDistance = touchStartX - touchEndX;

            // Swipe left to close
            if (swipeDistance < -swipeThreshold) {
                toggleMenu(false);
            }
        }

        console.log('✅ Hamburger menu initialized');
    }

    // Export toggle function globally for potential external use
    window.toggleHamburgerMenu = function (open) {
        const menuPanel = document.getElementById('menu-panel');
        const menuBackdrop = document.getElementById('menu-backdrop');
        const hamburgerBtn = document.getElementById('hamburger-btn');

        if (!menuPanel || !menuBackdrop || !hamburgerBtn) return;

        const isOpen = open !== undefined ? open : !menuPanel.classList.contains('active');

        if (isOpen) {
            menuPanel.classList.add('active');
            menuBackdrop.classList.add('active');
            hamburgerBtn.classList.add('active');
            document.body.classList.add('menu-open');
        } else {
            menuPanel.classList.remove('active');
            menuBackdrop.classList.remove('active');
            hamburgerBtn.classList.remove('active');
            document.body.classList.remove('menu-open');
        }
    };
})();
