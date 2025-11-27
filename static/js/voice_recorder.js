/**
 * Voice Recorder for FinMate AI (Optimized)
 * Handles audio recording and binary transmission to FastAPI
 */

class VoiceRecorder {
    constructor() {
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.isRecording = false;
        this.stream = null;
    }

    async startRecording() {
        // If already recording, stop it (toggle behavior)
        if (this.isRecording && this.mediaRecorder && this.mediaRecorder.state === 'recording') {
            this.stopRecording();
            return;
        }

        // Stop any other speech (TTS) before starting recording
        if (window.SpeechManager) {
            window.SpeechManager.stop();
        } else if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }

        // Clean up any existing recording state completely
        if (this.mediaRecorder) {
            try {
                if (this.mediaRecorder.state !== 'inactive') {
                    this.mediaRecorder.stop();
                }
            } catch (e) {
                console.warn('Error stopping existing recorder:', e);
            }
            this.mediaRecorder = null;
        }

        // Clean up any existing stream
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }

        // Reset state completely
        this.isRecording = false;
        this.audioChunks = [];

        try {
            this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // Brauzer üçün ən uyğun formatı tapırıq (Safari vs Chrome)
            let options = { mimeType: 'audio/webm' };
            if (!MediaRecorder.isTypeSupported('audio/webm')) {
                options = { mimeType: 'audio/mp4' }; // Safari üçün
            }

            this.mediaRecorder = new MediaRecorder(this.stream, options);
            this.audioChunks = [];

            this.mediaRecorder.addEventListener('dataavailable', event => {
                if (event.data.size > 0) {
                    this.audioChunks.push(event.data);
                }
            });

            this.mediaRecorder.addEventListener('stop', () => {
                // Səsi Blob-a çeviririk
                const mimeType = this.mediaRecorder.mimeType;
                const audioBlob = new Blob(this.audioChunks, { type: mimeType });

                // Reset state before sending (so we can record again)
                const wasRecording = this.isRecording;
                this.isRecording = false;

                // Clean up stream immediately after stopping
                if (this.stream) {
                    this.stream.getTracks().forEach(track => track.stop());
                    this.stream = null;
                }

                // Send audio to server
                this.sendAudioToServer(audioBlob);
            });

            this.mediaRecorder.start();
            this.isRecording = true;

            // UI Updates
            this.updateUI('recording');

        } catch (error) {
            console.error('Mikrofon xətası:', error);
            alert('Mikrofona icazə verilmədi. Zəhmət olmasa yoxlayın.');
            this.updateUI('idle');
        }
    }

    stopRecording() {
        if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
            console.warn('MediaRecorder not active');
            // Still reset state if recorder is inactive
            this.isRecording = false;
            if (this.stream) {
                this.stream.getTracks().forEach(track => track.stop());
                this.stream = null;
            }
            this.updateUI('idle');
            return;
        }

        // Stop media recorder
        this.mediaRecorder.stop();
        this.isRecording = false;

        // Don't stop stream here - let the 'stop' event handler do it
        // This ensures the audio is fully captured before stream is released

        this.updateUI('processing');

        // MediaRecorder will fire 'stop' event which triggers sendAudioToServer
    }

    async sendAudioToServer(audioBlob) {
        try {
            const formData = new FormData();
            // Send as file
            formData.append('file', audioBlob, 'recording.webm');

            // Dil seçimi (varsa)
            const language = document.getElementById('voice-language')?.value || 'az';
            formData.append('language', language);

            // FastAPI-yə göndəririk
            const response = await fetch('/api/voice-command', {
                method: 'POST',
                body: formData
            });

            // Check if response is successful
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Server error:', response.status, errorText);
                throw new Error(`Server error: ${response.status}`);
            }

            // Check if response is HTML (confirmation template) or JSON (error)
            const contentType = response.headers.get('content-type');

            if (contentType && contentType.includes('text/html')) {
                // Confirmation template returned - replace modal with confirmation
                const html = await response.text();
                const voiceModal = document.getElementById('voice-modal');
                if (voiceModal) {
                    voiceModal.remove();
                }
                document.body.insertAdjacentHTML('beforeend', html);
            } else if (contentType && contentType.includes('application/json')) {
                // JSON response - handle as error or old success
                const result = await response.json();

                this.updateUI('idle');

                if (result.success) {
                    this.showSuccess(result);
                } else {
                    this.showError(result.error || "Anlaşılmadı");
                }
            } else {
                // Unknown response type
                throw new Error('Gözlənilməz cavab tipi');
            }

        } catch (error) {
            console.error('Server xətası:', error);
            // Reset state on error
            this.isRecording = false;
            this.audioChunks = [];
            if (this.stream) {
                this.stream.getTracks().forEach(track => track.stop());
                this.stream = null;
            }
            this.mediaRecorder = null;
            this.updateUI('idle');
            this.showError('Serverlə əlaqə kəsildi. Yenidən cəhd edin.');
        }
    }

    updateUI(state) {
        const statusEl = document.getElementById('voice-status');
        const recordBtn = document.getElementById('record-btn');
        const stopBtn = document.getElementById('stop-btn');
        const spinner = document.getElementById('loading-spinner');

        // Use requestAnimationFrame for smooth UI updates
        requestAnimationFrame(() => {
            if (state === 'recording') {
                statusEl.textContent = 'Dinləyirəm... Danışın 🎙️ (Dayandırmaq üçün yenidən basın)';
                recordBtn.classList.remove('hidden');
                recordBtn.classList.add('recording');
                // Stop button is optional now - can hide it since record button toggles
                if (stopBtn) {
                    stopBtn.classList.add('hidden');
                }
                spinner.classList.add('hidden');
            } else if (state === 'processing') {
                statusEl.textContent = 'AI Analiz edir... 🧠';
                if (stopBtn) {
                    stopBtn.classList.add('hidden');
                }
                spinner.classList.remove('hidden');
                recordBtn.classList.remove('recording');
                recordBtn.classList.add('hidden');
            } else {
                // Idle
                recordBtn.classList.remove('hidden');
                recordBtn.classList.remove('recording');
                if (stopBtn) {
                    stopBtn.classList.add('hidden');
                }
                spinner.classList.add('hidden');
                statusEl.textContent = 'Hazıram (Başlamaq üçün basın)';
            }
        });
    }

    showSuccess(result) {
        const resultDiv = document.getElementById('voice-result');

        // Uğurlu nəticə kartı
        resultDiv.innerHTML = `
            <div class="success-result">
                <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center gap-2">
                        <svg class="w-5 h-5 sm:w-6 sm:h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <span class="text-white font-bold text-base sm:text-lg">Əlavə Edildi!</span>
                    </div>
                    <span class="xp-badge">+${(result.xp_result && result.xp_result.xp_awarded) || result.xp_awarded || 10} XP</span>
                </div>
                <p class="text-white/90 italic text-sm sm:text-base mb-3">"${result.transcribed_text}"</p>
                <div class="grid grid-cols-2 gap-2 sm:gap-3 text-sm">
                    <div class="bg-white/10 backdrop-blur-sm p-2 sm:p-3 rounded-lg border border-white/20">
                        <span class="block text-xs text-white/70 mb-1">Məbləğ</span>
                        <span class="font-bold text-white text-base sm:text-lg">${result.expense_data.amount} AZN</span>
                    </div>
                    <div class="bg-white/10 backdrop-blur-sm p-2 sm:p-3 rounded-lg border border-white/20">
                        <span class="block text-xs text-white/70 mb-1">Kateqoriya</span>
                        <span class="font-bold text-white text-base sm:text-lg">${result.expense_data.category}</span>
                    </div>
                </div>
            </div>
        `;

        // Dashboard-u yeniləmək üçün HTMX trigger edirik
        requestAnimationFrame(() => {
            document.body.dispatchEvent(new Event('expensesUpdated'));
        });

        // Voice feedback using queue system
        if (typeof window.queueVoiceNotification === 'function') {
            const lang = 'az'; // Always use Azerbaijani
            let message = '';

            if (lang === 'az') {
                message = `Əlavə edildi! ${result.expense_data.amount} manat, ${result.expense_data.category} kateqoriyası`;
            } else if (lang === 'en') {
                message = `Added! ${result.expense_data.amount} AZN, ${result.expense_data.category} category`;
            } else if (lang === 'ru') {
                message = `Добавлено! ${result.expense_data.amount} манат, категория ${result.expense_data.category}`;
            }

            window.queueVoiceNotification(message, 0, lang);
        }

        // Reset state after showing success - but keep UI ready for next recording
        this.isRecording = false;
        this.audioChunks = [];
        this.mediaRecorder = null;
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }

        // Don't update UI to idle immediately - wait for voice notification to finish
        // The voice notification system will update UI when audio finishes
        // But set a timeout as fallback in case voice notification doesn't fire
        setTimeout(() => {
            // Check if modal is still open and not recording
            const voiceModal = document.getElementById('voice-modal');
            if (voiceModal && !voiceModal.classList.contains('hidden') && !this.isRecording) {
                this.updateUI('idle');
            }
        }, 1000);

        // 3 saniyə sonra modalı bağla
        setTimeout(() => {
            this.closeModal();
        }, 3000);
    }

    showError(msg) {
        const resultDiv = document.getElementById('voice-result');
        resultDiv.innerHTML = `
            <div class="error-result">
                <div class="flex items-center gap-2 mb-3">
                    <svg class="w-5 h-5 sm:w-6 sm:h-6 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span class="text-white text-sm sm:text-base">${msg}</span>
                </div>
                <button onclick="voiceRecorder.resetRecording(); voiceRecorder.startRecording()" 
                    class="w-full bg-white/10 hover:bg-white/20 text-white py-2 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                    </svg>
                    Yenidən Cəhd Et
                </button>
            </div>
        `;

        // Reset state and update UI so user can try again
        this.isRecording = false;
        this.audioChunks = [];
        this.mediaRecorder = null;
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        this.updateUI('idle');
    }

    closeModal() {
        const modal = document.getElementById('voice-modal');
        const resultDiv = document.getElementById('voice-result');

        // Stop any ongoing recording
        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
            try {
                this.mediaRecorder.stop();
            } catch (e) {
                console.warn('Error stopping recorder:', e);
            }
        }

        // Clean up stream
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }

        // Reset state completely
        this.isRecording = false;
        this.audioChunks = [];
        this.mediaRecorder = null;

        // Close modal
        if (modal) {
            modal.classList.add('hidden');
            if (resultDiv) {
                resultDiv.innerHTML = '';
            }
            this.updateUI('idle');
        }
    }

    // Reset recording state (public method for external use)
    resetRecording() {
        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
            try {
                this.mediaRecorder.stop();
            } catch (e) {
                console.warn('Error stopping recorder:', e);
            }
        }

        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }

        this.isRecording = false;
        this.audioChunks = [];
        this.mediaRecorder = null;
        this.updateUI('idle');
    }
}

// İnstansiya yaradırıq
const voiceRecorder = new VoiceRecorder();

// Make it globally accessible for voice-notifications.js
window.voiceRecorder = voiceRecorder;

// Qlobal funksiyalar (HTML-dən çağırmaq üçün)
window.openVoiceModal = () => {
    const modal = document.getElementById('voice-modal');
    if (modal) {
        // Reset modal state if it was previously used
        const resultDiv = document.getElementById('voice-result');
        if (resultDiv && resultDiv.innerHTML !== '') {
            resultDiv.innerHTML = '';
            voiceRecorder.updateUI('idle');
        }

        modal.classList.remove('hidden');
        // Smooth open animation
        requestAnimationFrame(() => {
            modal.style.opacity = '0';
            modal.style.transform = 'scale(0.95)';
            requestAnimationFrame(() => {
                modal.style.transition = 'opacity 0.2s ease-out, transform 0.2s ease-out';
                modal.style.opacity = '1';
                modal.style.transform = 'scale(1)';
            });
        });
    }
};

window.closeVoiceModal = () => voiceRecorder.closeModal();
window.startRecording = () => voiceRecorder.startRecording();
window.stopRecording = () => voiceRecorder.stopRecording();

// Button event bindings
document.addEventListener('DOMContentLoaded', () => {
    // Record button toggles recording (start/stop)
    document.getElementById('record-btn')?.addEventListener('click', () => {
        if (voiceRecorder.isRecording) {
            voiceRecorder.stopRecording();
        } else {
            voiceRecorder.startRecording();
        }
    });

    // Stop button also toggles (for backward compatibility)
    document.getElementById('stop-btn')?.addEventListener('click', () => {
        if (voiceRecorder.isRecording) {
            voiceRecorder.stopRecording();
        }
    });

    document.getElementById('close-voice-modal')?.addEventListener('click', () => voiceRecorder.closeModal());
});
