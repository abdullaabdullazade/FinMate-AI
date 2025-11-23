// Readability Mode
(function() {
    'use strict';
    
    window.toggleReadabilityMode = function(enabled) {
        console.log('👁️ Readability mode:', enabled);
        if (enabled) {
            document.body.classList.add('readability-mode');
            localStorage.setItem('readability-mode', 'enabled');
        } else {
            document.body.classList.remove('readability-mode');
            localStorage.setItem('readability-mode', 'disabled');
        }
    };
    
    document.addEventListener('DOMContentLoaded', () => {
        const isReadabilityEnabled = localStorage.getItem('readability-mode') === 'enabled';
        if (isReadabilityEnabled) {
            window.toggleReadabilityMode(true);
        }
        
        const readabilityToggle = document.getElementById('readability-mode-toggle');
        if (readabilityToggle) {
            readabilityToggle.checked = isReadabilityEnabled;
        }
    });
})();

