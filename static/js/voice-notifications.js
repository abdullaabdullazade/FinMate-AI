/**
 * Voice Notifications System with Queue
 * Provides spoken feedback for all user actions and notifications  
 */

(function () {
    'use strict';

    console.log('✅ Voice Notifications system loaded');

    // ==================== VOICE QUEUE SYSTEM ====================

    let voiceQueue = [];
    let isProcessingVoice = false;

    /**
     * Add voice notification to queue with priority
     * @param {string} text - Text to speak
     * @param {number} priority - 0=urgent, 1=normal, 2=low
     * @param {string} language - Language code
     */
    window.queueVoiceNotification = function (text, priority = 1, language = 'az') {
        if (!text || !text.trim()) return;

        const voiceMode = localStorage.getItem('voice-mode');
        if (voiceMode !== 'enabled') {
            return;
        }

        console.log(`🔊 Queuing voice (priority ${priority}):`, text.substring(0, 50));

        // Add to queue with priority
        voiceQueue.push({ text, priority, language });

        // Sort by priority (0 = highest)
        voiceQueue.sort((a, b) => a.priority - b.priority);

        // Start processing if not already
        if (!isProcessingVoice) {
            processVoiceQueue();
        }
    };

    /**
     * Process voice queue sequentially
     */
    async function processVoiceQueue() {
        if (voiceQueue.length === 0) {
            isProcessingVoice = false;
            console.log('✅ Voice queue empty');
            return;
        }

        isProcessingVoice = true;
        const item = voiceQueue.shift();

        console.log(`🔊 Speaking (${voiceQueue.length} remaining):`, item.text.substring(0, 50));

        try {
            // Call backend TTS API
            const formData = new FormData();
            formData.append('text', item.text);
            formData.append('language', item.language);

            const response = await fetch('/api/tts', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.audio_response) {
                    // Play audio and wait for it to finish
                    await playAudio(data.audio_response);
                } else {
                    console.warn('⚠️ TTS failed:', data.error);
                }
            } else {
                console.error('❌ TTS API error:', response.status);
            }
        } catch (error) {
            console.error('❌ Voice queue error:', error);
        }

        // Small delay between notifications
        await new Promise(resolve => setTimeout(resolve, 300));

        // Process next item
        processVoiceQueue();
    }

    /**
     * Play audio from base64 and wait for completion
     */
    function playAudio(base64Audio) {
        return new Promise((resolve, reject) => {
            const audio = new Audio(`data:audio/mp3;base64,${base64Audio}`);

            audio.onended = () => {
                console.log('✅ Audio finished');
                
                // Notify voice recorder that audio is finished so it can reset UI
                if (typeof window.voiceRecorder !== 'undefined' && window.voiceRecorder) {
                    // Check if we're in voice modal and recording is not active
                    const voiceModal = document.getElementById('voice-modal');
                    if (voiceModal && !voiceModal.classList.contains('hidden')) {
                        const isRecording = window.voiceRecorder.isRecording;
                        if (!isRecording) {
                            // Reset UI to idle so user can record again
                            window.voiceRecorder.updateUI('idle');
                        }
                    }
                }
                
                resolve();
            };

            audio.onerror = (error) => {
                console.error('❌ Audio play error:', error);
                reject(error);
            };

            audio.play().catch(err => {
                console.error('❌ Audio play failed:', err);
                reject(err);
            });
        });
    }

    // ==================== PUBLIC API ====================

    /**
     * Speak notification using queue system
     * @param {string} text - Text to speak
     * @param {string} type - Notification type (info, success, warning, error)
     */
    window.speakNotification = function (text, type = 'info') {
        // Map type to priority
        const priorityMap = {
            'error': 0,    // Urgent
            'warning': 0,  // Urgent
            'success': 1,  // Normal
            'info': 2      // Low
        };

        const priority = priorityMap[type] || 1;
        const language = document.documentElement.lang || 'az';

        window.queueVoiceNotification(text, priority, language);
    };

    /**
     * Enhanced toast notification with voice
     */
    const originalShowToast = window.showToast;

    window.showToast = function (message, type = 'success') {
        // Call original toast to show visual notification (always show)
        if (typeof originalShowToast === 'function') {
            originalShowToast(message, type);
        }

        // Speak the notification only if voice mode is enabled
        const voiceMode = localStorage.getItem('voice-mode');
        if (voiceMode === 'enabled') {
            // Clean message from HTML and emojis for better speech
            const cleanMessage = message
                .replace(/<[^>]*>/g, '') // Remove HTML tags
                .replace(/[✓✅❌⚠️🔥⚡💰🎉👍]/g, '') // Remove common emojis
                .replace(/\s+/g, ' ') // Normalize whitespace
                .trim();

            if (cleanMessage.length > 0) {
                window.speakNotification(cleanMessage, type);
            }
        }
    };

    /**
     * Convert number to Azerbaijani words for natural speech
     */
    window.numberToAzerbaijani = function (num) {
        if (isNaN(num)) return num;

        const wholePart = Math.floor(num);
        const decimalPart = Math.round((num - wholePart) * 100);

        const ones = ['', 'bir', 'iki', 'üç', 'dörd', 'beş', 'altı', 'yeddi', 'səkkiz', 'doqquz'];
        const tens = ['', 'on', 'iyirmi', 'otuz', 'qırx', 'əlli', 'altmış', 'yetmiş', 'səksən', 'doxsan'];
        const hundreds = ['', 'yüz', 'iki yüz', 'üç yüz', 'dörd yüz', 'beş yüz', 'altı yüz', 'yeddi yüz', 'səkkiz yüz', 'doqquz yüz'];

        function convertBelow1000(n) {
            if (n === 0) return 'sıfır';

            let result = '';
            const h = Math.floor(n / 100);
            const t = Math.floor((n % 100) / 10);
            const o = n % 10;

            if (h > 0) result += hundreds[h];
            if (t > 0) result += (result ? ' ' : '') + tens[t];
            if (o > 0) result += (result ? ' ' : '') + ones[o];

            return result;
        }

        let result = '';

        if (wholePart >= 1000) {
            const thousands = Math.floor(wholePart / 1000);
            result += convertBelow1000(thousands) + ' min';
            const remainder = wholePart % 1000;
            if (remainder > 0) {
                result += ' ' + convertBelow1000(remainder);
            }
        } else if (wholePart > 0) {
            result = convertBelow1000(wholePart);
        } else {
            result = 'sıfır';
        }

        result += ' manat';

        if (decimalPart > 0) {
            result += ' ' + convertBelow1000(decimalPart) + ' qəpik';
        }

        return result;
    };

    /**
     * Speak scan result with natural number pronunciation
     */
    window.speakScanResult = function (totalAmount, itemCount) {
        const lang = document.documentElement.lang || 'az';
        let message = '';

        if (lang === 'az') {
            const amountText = window.numberToAzerbaijani(totalAmount);
            message = `Qəbz oxundu! ${itemCount} məhsul tapıldı. Ümumi ${amountText}`;
        } else if (lang === 'en') {
            message = `Receipt scanned! ${itemCount} items found. Total amount ${totalAmount} dollars`;
        } else if (lang === 'ru') {
            message = `Чек отсканирован! Найдено ${itemCount} товаров. Общая сумма ${totalAmount} манат`;
        }

        window.speakNotification(message, 'success');
    };

})();
