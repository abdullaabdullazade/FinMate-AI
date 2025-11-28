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
                if (document.body.classList.contains('incognito-mode')) {
                    setTimeout(() => {
                        if (window.hideAllAmounts) {
                            window.hideAllAmounts();
                        }
                    }, 100);
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

