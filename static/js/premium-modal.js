// Premium Modal Functions
(function() {
    'use strict';
    
    window.openPremiumModal = function() {
        const modal = document.getElementById('premium-modal');
        if (modal) {
            modal.classList.remove('hidden');
        }
    };
    
    window.closePremiumModal = function() {
        const modal = document.getElementById('premium-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    };
})();

