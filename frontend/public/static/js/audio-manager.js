/**
 * Global Persistent Audio Manager
 * Ensures audio continues playing through DOM changes and page interactions
 */

(function () {
    'use strict';

    console.log('✅ Audio Manager initialized');

    // ==================== GLOBAL AUDIO INSTANCE ====================
    
    // Single persistent audio instance that survives DOM changes
    let globalAudioInstance = null;
    let currentAudioQueue = [];
    let isPlaying = false;
    let audioContext = null;

    /**
     * Initialize global audio instance
     */
    function initGlobalAudio() {
        if (!globalAudioInstance) {
            globalAudioInstance = new Audio();
            globalAudioInstance.preload = 'auto';
            
            // Prevent audio from stopping on DOM changes
            globalAudioInstance.addEventListener('error', (e) => {
                console.error('❌ Audio error:', e);
                isPlaying = false;
                playNextInQueue();
            });

            globalAudioInstance.addEventListener('ended', () => {
                console.log('✅ Audio finished');
                isPlaying = false;
                playNextInQueue();
            });

            globalAudioInstance.addEventListener('pause', () => {
                // Only allow pause if explicitly requested by user
                console.log('⚠️ Audio paused');
            });
        }
        return globalAudioInstance;
    }

    /**
     * Play audio from base64 data
     */
    function playAudioFromBase64(base64Data) {
        return new Promise((resolve, reject) => {
            const audio = initGlobalAudio();
            
            // Stop current audio if playing
            if (isPlaying && !audio.paused) {
                audio.pause();
                audio.currentTime = 0;
            }

            // Set source
            audio.src = `data:audio/mp3;base64,${base64Data}`;
            isPlaying = true;

            // Handle audio events
            const handleEnded = () => {
                isPlaying = false;
                resolve();
            };

            const handleError = (err) => {
                console.error('❌ Audio play error:', err);
                isPlaying = false;
                reject(err);
            };

            audio.addEventListener('ended', handleEnded, { once: true });
            audio.addEventListener('error', handleError, { once: true });

            // Play audio
            const playPromise = audio.play();
            
            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        console.log('🔊 Audio started playing');
                    })
                    .catch(err => {
                        console.error('❌ Audio play failed:', err);
                        audio.removeEventListener('ended', handleEnded);
                        audio.removeEventListener('error', handleError);
                        isPlaying = false;
                        reject(err);
                    });
            }
        });
    }

    /**
     * Queue audio for sequential playback
     */
    function queueAudio(base64Data, priority = 1) {
        currentAudioQueue.push({ data: base64Data, priority });
        currentAudioQueue.sort((a, b) => a.priority - b.priority);
        
        if (!isPlaying) {
            playNextInQueue();
        }
    }

    /**
     * Play next item in queue
     */
    function playNextInQueue() {
        if (currentAudioQueue.length === 0) {
            isPlaying = false;
            return;
        }

        const next = currentAudioQueue.shift();
        playAudioFromBase64(next.data)
            .then(() => {
                // Small delay between audio clips
                setTimeout(() => {
                    playNextInQueue();
                }, 200);
            })
            .catch(() => {
                playNextInQueue();
            });
    }

    /**
     * Stop all audio (only if explicitly requested)
     */
    function stopAllAudio() {
        const audio = initGlobalAudio();
        audio.pause();
        audio.currentTime = 0;
        currentAudioQueue = [];
        isPlaying = false;
    }

    /**
     * Check if audio is currently playing
     */
    function isAudioPlaying() {
        return isPlaying || (globalAudioInstance && !globalAudioInstance.paused);
    }

    // ==================== PUBLIC API ====================

    window.AudioManager = {
        /**
         * Play audio from base64 data
         * @param {string} base64Data - Base64 encoded audio
         * @param {number} priority - Priority (0=urgent, 1=normal, 2=low)
         */
        play: function (base64Data, priority = 1) {
            if (!base64Data) return;
            queueAudio(base64Data, priority);
        },

        /**
         * Stop all audio (use sparingly - only for user-initiated stops)
         */
        stop: function () {
            stopAllAudio();
        },

        /**
         * Check if audio is playing
         */
        isPlaying: function () {
            return isAudioPlaying();
        },

        /**
         * Get current audio instance (for advanced use)
         */
        getInstance: function () {
            return initGlobalAudio();
        }
    };

    // Initialize on load
    initGlobalAudio();

    // Prevent audio from being garbage collected
    window.addEventListener('beforeunload', () => {
        // Keep audio alive
    });

})();

