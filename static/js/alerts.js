// Alerts Management
(function() {
    'use strict';
    
    document.addEventListener('DOMContentLoaded', () => {
        const bell = document.getElementById('alert-bell');
        const panel = document.getElementById('alert-panel');
        
        if (bell && panel) {
            bell.addEventListener('click', (e) => {
                e.stopPropagation();
                panel.classList.toggle('hidden');
                
                // Apply incognito mode to alert panel when opened
                if (!panel.classList.contains('hidden') && document.body.classList.contains('incognito-mode')) {
                    setTimeout(() => {
                        if (window.hideAllAmounts) {
                            window.hideAllAmounts();
                        }
                    }, 100);
                }
            });
            
            document.addEventListener('click', (e) => {
                if (!panel.contains(e.target) && !bell.contains(e.target)) {
                    panel.classList.add('hidden');
                }
            });
        }
    });
})();

