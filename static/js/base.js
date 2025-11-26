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

    toast.className = `pointer-events-auto backdrop-blur-md text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl shadow-lg border flex items-center gap-3 transform transition-all duration-500 translate-x-full ${styles}`;
    toast.innerHTML = `
        <span class="text-xl">${icon}</span>
        <span class="font-medium text-sm sm:text-base">${message}</span>
    `;

    container.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => {
        toast.classList.remove('translate-x-full');
    });

    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.add('translate-x-full', 'opacity-0');
        setTimeout(() => toast.remove(), 500);
    }, 3000);

    // Voice Notification (TTS)
    if ('speechSynthesis' in window) {
        window.SpeechManager.speak(message);
    }
};
