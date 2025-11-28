// Premium Modal Functions
(function() {
    'use strict';
    
    window.openPremiumModal = function() {
        console.log('🔓 Opening premium modal...');
        const modal = document.getElementById('premium-modal');
        if (modal) {
            // Remove hidden class and ensure display is set
            modal.classList.remove('hidden');
            modal.style.display = 'flex';
            modal.style.zIndex = '150';
            // Prevent body scroll
            document.body.style.overflow = 'hidden';
            console.log('✅ Premium modal opened');
        } else {
            console.error('❌ Premium modal element not found!');
            console.error('Available modals:', document.querySelectorAll('[id*="modal"]'));
            alert('Premium modal tapılmadı. Zəhmət olmasa səhifəni yeniləyin.');
        }
    };
    
    window.closePremiumModal = function() {
        console.log('🔒 Closing premium modal...');
        const modal = document.getElementById('premium-modal');
        if (modal) {
            modal.classList.add('hidden');
            modal.style.display = 'none';
            // Restore body scroll
            document.body.style.overflow = '';
            console.log('✅ Premium modal closed');
        } else {
            console.error('❌ Premium modal element not found!');
        }
    };
    
    // Ensure function is available even if script loads late
    // Also add click handler for premium upgrade cards as fallback
    document.addEventListener('DOMContentLoaded', function() {
        // Find all elements that should open premium modal
        const premiumButtons = document.querySelectorAll('[onclick*="openPremiumModal"], [data-open-premium]');
        premiumButtons.forEach(btn => {
            btn.addEventListener('click', function(e) {
                if (typeof window.openPremiumModal === 'function') {
                    window.openPremiumModal();
                } else {
                    console.error('openPremiumModal function not available');
                    alert('Premium modal funksiyası yüklənməyib. Zəhmət olmasa səhifəni yeniləyin.');
                }
            });
        });
        
        // Close modal when clicking outside
        const modal = document.getElementById('premium-modal');
        if (modal) {
            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    window.closePremiumModal();
                }
            });
        }
    });
})();

