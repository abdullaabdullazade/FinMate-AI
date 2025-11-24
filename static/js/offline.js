// Offline Detection - Show banner instead of redirecting
(function() {
    'use strict';
    
    let offlineBanner = null;
    let notificationShown = false;
    
    function createOfflineBanner() {
        // Remove existing banner if any
        if (offlineBanner) {
            offlineBanner.remove();
        }
        
        offlineBanner = document.createElement('div');
        offlineBanner.id = 'offline-banner';
        // Position below top bar (top bar is ~64-72px, so use 64px = top-16)
        offlineBanner.className = 'fixed top-16 left-0 right-0 z-50';
        offlineBanner.style.transform = 'translateY(-100%)';
        offlineBanner.style.transition = 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
        offlineBanner.innerHTML = `
            <div class="mx-4 mt-2">
                <div class="glass-card border-2 border-red-500/50 bg-gradient-to-r from-red-600/95 via-red-500/95 to-orange-500/95 backdrop-blur-xl shadow-2xl rounded-2xl overflow-hidden">
                    <div class="px-5 py-4">
                        <div class="flex items-start gap-4">
                            <!-- Animated Icon -->
                            <div class="flex-shrink-0 relative">
                                <div class="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                    <svg class="w-7 h-7 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"></path>
                                    </svg>
                                </div>
                                <!-- Pulse Ring -->
                                <div class="absolute inset-0 rounded-full border-2 border-white/30 animate-ping"></div>
                            </div>
                            
                            <!-- Content -->
                            <div class="flex-1 min-w-0">
                                <div class="flex items-center gap-2 mb-1">
                                    <h3 class="font-bold text-base sm:text-lg text-white drop-shadow-sm">
                                        İnternet Bağlantısı Yoxdur
                                    </h3>
                                    <div class="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                </div>
                                <p class="text-sm sm:text-base text-white/90 leading-relaxed">
                                    Offline rejimdəsiniz. Bəzi funksiyalar məhdudlaşdırıla bilər.
                                </p>
                                <p class="text-xs text-white/70 mt-1.5">
                                    İnternet bağlantınızı yoxlayın və yenidən cəhd edin.
                                </p>
                            </div>
                            
                            <!-- Close Button -->
                            <button 
                                onclick="hideOfflineBanner()" 
                                class="flex-shrink-0 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center text-white/90 hover:text-white transition-all duration-200 hover:scale-110 active:scale-95"
                                title="Bağla"
                            >
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                    
                    <!-- Animated Progress Bar -->
                    <div class="h-1 bg-white/10">
                        <div class="h-full bg-white/30 animate-pulse" style="width: 100%; animation: shimmer 2s ease-in-out infinite;"></div>
                    </div>
                </div>
            </div>
        `;
        
        // Add shimmer animation style if not exists
        if (!document.getElementById('offline-banner-styles')) {
            const style = document.createElement('style');
            style.id = 'offline-banner-styles';
            style.textContent = `
                @keyframes shimmer {
                    0%, 100% { opacity: 0.3; }
                    50% { opacity: 0.6; }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(offlineBanner);
        
        // Animate in
        requestAnimationFrame(() => {
            offlineBanner.style.transform = 'translateY(0)';
        });
    }
    
    function hideOfflineBanner() {
        if (offlineBanner) {
            offlineBanner.style.transform = 'translateY(-100%)';
            setTimeout(() => {
                if (offlineBanner && offlineBanner.parentNode) {
                    offlineBanner.remove();
                }
                offlineBanner = null;
            }, 300);
        }
    }
    
    // Make it globally accessible for the close button
    window.hideOfflineBanner = hideOfflineBanner;
    
    function checkOnlineStatus() {
        if (!navigator.onLine) {
            // Don't redirect, just show banner
            if (!offlineBanner || !document.body.contains(offlineBanner)) {
                createOfflineBanner();
            }
        } else {
            hideOfflineBanner();
        }
    }
    
    function showOnlineNotification() {
        if (notificationShown) return;
        notificationShown = true;
        
        const notification = document.createElement('div');
        // Position below top bar, accounting for possible offline banner
        notification.className = 'fixed top-24 right-4 z-50 px-6 py-3 rounded-lg bg-green-500 text-white font-medium shadow-lg';
        notification.textContent = '✅ İnternet bağlantısı bərpa olundu!';
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.3s';
        document.body.appendChild(notification);

        requestAnimationFrame(() => {
            notification.style.opacity = '1';
        });
        
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                notification.remove();
                notificationShown = false;
            }, 300);
        }, 3000);
    }
    
    window.addEventListener('offline', () => {
        checkOnlineStatus();
    }, { passive: true });
    
    window.addEventListener('online', () => {
        hideOfflineBanner();
        showOnlineNotification();
    }, { passive: true });
    
    // Check on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkOnlineStatus);
    } else {
        checkOnlineStatus();
    }
    
    // Also check periodically in case navigator.onLine is unreliable
    setInterval(() => {
        checkOnlineStatus();
    }, 5000);
})();

