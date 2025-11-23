// Offline Detection
(function() {
    'use strict';
    
    let notificationShown = false;
    
    function checkOnlineStatus() {
        if (!navigator.onLine && window.location.pathname !== '/offline') {
            window.location.href = '/offline';
        }
    }
    
    function showOnlineNotification() {
        if (notificationShown) return;
        notificationShown = true;
        
        const notification = document.createElement('div');
        notification.className = 'fixed top-20 right-4 z-50 px-6 py-3 rounded-lg bg-green-500 text-white font-medium shadow-lg';
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
    
    window.addEventListener('offline', checkOnlineStatus, { passive: true });
    
    window.addEventListener('online', () => {
        if (window.location.pathname === '/offline') {
            window.location.href = '/';
        } else {
            showOnlineNotification();
        }
    }, { passive: true });
    
    // Check on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkOnlineStatus);
    } else {
        checkOnlineStatus();
    }
})();

