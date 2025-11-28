// Base Template JavaScript

// CRITICAL: Apply theme before page renders to prevent flash
(function () {
    'use strict';

    // Add preload class to disable transitions
    document.documentElement.classList.add('preload');

    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);

    // Apply premium theme immediately (before page render)
    const savedPremiumTheme = localStorage.getItem('premium-theme');
    const validThemes = ['gold', 'midnight', 'ocean', 'forest', 'sunset', 'royal'];

    // Remove any existing theme classes from html
    const themes = ['theme-gold', 'theme-midnight', 'theme-ocean', 'theme-forest', 'theme-sunset', 'theme-royal'];
    document.documentElement.classList.remove(...themes);

    if (savedPremiumTheme && validThemes.includes(savedPremiumTheme)) {
        document.documentElement.classList.add('theme-' + savedPremiumTheme);
    }

    // Remove preload class after a short delay to enable transitions
    window.addEventListener('load', function () {
        setTimeout(function () {
            document.documentElement.classList.remove('preload');
        }, 100);
    });
})();

// Global Speech Manager
window.SpeechManager = {
    speechTimeout: null,

    stop: function () {
        // Clear any pending speech timeout
        if (this.speechTimeout) {
            clearTimeout(this.speechTimeout);
            this.speechTimeout = null;
        }

        // Stop TTS
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            // Double cancel for safety
            setTimeout(() => {
                if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
                    window.speechSynthesis.cancel();
                }
            }, 10);
        }

        // Stop Recording if active
        if (window.voiceRecorder && window.voiceRecorder.isRecording) {
            window.voiceRecorder.stopRecording();
        }
    },

    speak: function (text, lang = 'az-AZ') {
        if (!('speechSynthesis' in window)) return;

        // Stop everything first
        this.stop();

        const cleanText = text.trim();
        if (!cleanText) return;

        // Small delay to ensure cancellation takes effect
        this.speechTimeout = setTimeout(() => {
            const utterance = new SpeechSynthesisUtterance(cleanText);
            utterance.lang = lang;
            utterance.rate = 1.0;
            utterance.pitch = 1.0;

            window.speechSynthesis.speak(utterance);
        }, 100);
    }
};

// Backward compatibility
window.stopAllSpeech = () => window.SpeechManager.stop();

// Global Toast Function
window.showToast = function (message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) {
        // Create container if doesn't exist
        const newContainer = document.createElement('div');
        newContainer.id = 'toast-container';
        newContainer.className = 'fixed top-24 right-4 sm:right-6 z-[100] flex flex-col gap-2 pointer-events-none';
        document.body.appendChild(newContainer);
        return window.showToast(message, type);
    }

    const toast = document.createElement('div');
    const styles = type === 'success'
        ? 'bg-green-500/90 border-green-400/50 shadow-green-500/20'
        : type === 'error'
            ? 'bg-red-500/90 border-red-400/50 shadow-red-500/20'
            : 'bg-blue-500/90 border-blue-400/50 shadow-blue-500/20';

    const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';

    toast.className = `pointer-events-auto backdrop-blur-md text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl shadow-lg border flex items-center gap-3 transform transition-all duration-500 translate-x-full ${styles} select-none touch-pan-y cursor-grab active:cursor-grabbing`;
    toast.innerHTML = `
        <span class="text-xl flex-shrink-0">${icon}</span>
        <span class="font-medium text-sm sm:text-base flex-1">${message}</span>
        <button class="toast-close-btn p-1 hover:bg-white/20 rounded-full transition-colors flex-shrink-0" aria-label="Close">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
        </button>
    `;

    // Store auto-remove timeout in a way that removeToast can access it
    let autoRemoveTimeout;
    
    // Remove toast function
    function removeToast() {
        // Clear auto-remove timeout if exists
        if (autoRemoveTimeout) {
            clearTimeout(autoRemoveTimeout);
        }
        // Animate out
        toast.style.transition = 'all 0.5s ease';
        toast.style.transform = 'translateX(100%)';
        toast.style.opacity = '0';
        // Remove from DOM after animation
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 500);
    }

    // Close button handler
    const closeBtn = toast.querySelector('.toast-close-btn');
    closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        removeToast();
    });

    // Swipe to dismiss logic (both touch and mouse)
    let touchStartX = 0;
    let touchCurrentX = 0;
    let mouseStartX = 0;
    let mouseCurrentX = 0;
    let isDragging = false;
    const swipeThreshold = 50; // px

    // Touch events
    toast.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        toast.style.transition = 'none';
        isDragging = true;
    }, { passive: true });

    toast.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        touchCurrentX = e.touches[0].clientX;
        const diff = touchCurrentX - touchStartX;

        // Allow swiping right (dismiss) or left (reset)
        if (diff > 0) {
            toast.style.transform = `translateX(${Math.min(diff, 300)}px)`;
            toast.style.opacity = `${Math.max(0, 1 - (diff / 200))}`;
        } else if (diff < -20) {
            // Small left swipe to show it's interactive
            toast.style.transform = `translateX(${diff}px)`;
        }
    }, { passive: true });

    toast.addEventListener('touchend', (e) => {
        if (!isDragging) return;
        const diff = touchCurrentX - touchStartX;
        toast.style.transition = 'all 0.5s ease';
        isDragging = false;

        if (diff > swipeThreshold) {
            // Swiped enough to dismiss
            removeToast();
        } else {
            // Reset position
            toast.style.transform = 'translateX(0)';
            toast.style.opacity = '1';
        }
    });

    // Mouse drag events (for desktop)
    toast.addEventListener('mousedown', (e) => {
        if (e.target.closest('.toast-close-btn')) return; // Don't drag if clicking close button
        mouseStartX = e.clientX;
        isDragging = true;
        toast.style.transition = 'none';
        toast.style.cursor = 'grabbing';
        e.preventDefault();
    });

    toast.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        mouseCurrentX = e.clientX;
        const diff = mouseCurrentX - mouseStartX;

        if (diff > 0) {
            toast.style.transform = `translateX(${Math.min(diff, 300)}px)`;
            toast.style.opacity = `${Math.max(0, 1 - (diff / 200))}`;
        }
    });

    toast.addEventListener('mouseup', (e) => {
        if (!isDragging) return;
        const diff = mouseCurrentX - mouseStartX;
        toast.style.transition = 'all 0.5s ease';
        toast.style.cursor = 'grab';
        isDragging = false;

        if (diff > swipeThreshold) {
            removeToast();
        } else {
            toast.style.transform = 'translateX(0)';
            toast.style.opacity = '1';
        }
    });

    toast.addEventListener('mouseleave', (e) => {
        if (isDragging) {
            const diff = mouseCurrentX - mouseStartX;
            toast.style.transition = 'all 0.5s ease';
            toast.style.cursor = 'grab';
            isDragging = false;

            if (diff > swipeThreshold) {
                removeToast();
            } else {
                toast.style.transform = 'translateX(0)';
                toast.style.opacity = '1';
            }
        }
    });

    container.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => {
        toast.classList.remove('translate-x-full');
    });

    // Remove after 5 seconds (increased from 3 to give time to read/interact)
    autoRemoveTimeout = setTimeout(() => {
        removeToast();
    }, 5000);

    // Pause auto-remove on hover/touch
    toast.addEventListener('mouseenter', () => {
        if (autoRemoveTimeout) {
            clearTimeout(autoRemoveTimeout);
        }
    });
    toast.addEventListener('touchstart', () => {
        if (autoRemoveTimeout) {
            clearTimeout(autoRemoveTimeout);
        }
    }, { passive: true });

    // Voice Notification (TTS)
    if ('speechSynthesis' in window) {
        window.SpeechManager.speak(message);
    }
};
