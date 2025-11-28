// Alerts Management
(function() {
    'use strict';
    
    // Initialize immediately if DOM is ready, otherwise wait
    function initAlerts() {
        const bell = document.getElementById('alert-bell');
        const panel = document.getElementById('alert-panel');
        
        if (!bell || !panel) {
            console.warn('Alert bell or panel not found');
            return;
        }
        
        // Remove any existing inline onclick handlers
        bell.removeAttribute('onclick');
        
        // Initialize alert counter on load
        if (typeof updateAlertCounter === 'function') {
            updateAlertCounter();
        }
        
        // Handle bell click
        bell.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const isHidden = panel.classList.contains('hidden');
            if (isHidden) {
                panel.classList.remove('hidden');
                // Apply incognito mode to alert panel when opened
                // But only if incognito mode is actually enabled
                const isIncognitoEnabled = document.body.classList.contains('incognito-mode') || 
                                          localStorage.getItem('incognito-mode') === 'enabled';
                if (isIncognitoEnabled) {
                    setTimeout(() => {
                        if (window.hideAllAmounts) {
                            window.hideAllAmounts();
                        }
                    }, 100);
                } else {
                    // If incognito is disabled, make sure all amounts are visible
                    setTimeout(() => {
                        if (window.showAllAmounts) {
                            // Only restore alert panel elements, don't trigger full restore
                            const allElements = panel.querySelectorAll('*');
                            allElements.forEach(el => {
                                const original = el.getAttribute('data-original');
                                if (original && original !== '****' && !original.includes('****')) {
                                    if (original.match(/[\d,]+\.?\d*/)) {
                                        el.textContent = original;
                                        el.removeAttribute('data-original');
                                        el.classList.remove('incognito-processed', 'incognito-hidden');
                                    }
                                }
                            });
                        }
                    }, 50);
                }
            } else {
                panel.classList.add('hidden');
            }
        });
        
        // Close panel when clicking outside
        document.addEventListener('click', (e) => {
            if (!panel.classList.contains('hidden')) {
                if (!panel.contains(e.target) && !bell.contains(e.target)) {
                    panel.classList.add('hidden');
                }
            }
        });
        
        // Prevent panel clicks from closing it
        panel.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }
    
    // Try to initialize immediately
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAlerts);
    } else {
        // DOM is already ready
        initAlerts();
    }
})();

