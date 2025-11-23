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
            return;
        }

        this.mediaRecorder.stop();
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
                statusEl.textContent = 'Dinləyirəm... Danışın 🎙️';
                recordBtn.classList.remove('hidden');
                recordBtn.classList.add('recording');
                stopBtn.classList.remove('hidden');
                spinner.classList.add('hidden');
            } else if (state === 'processing') {
                statusEl.textContent = 'AI Analiz edir... 🧠';
                stopBtn.classList.add('hidden');
                spinner.classList.remove('hidden');
                recordBtn.classList.remove('recording');
                recordBtn.classList.add('hidden');
            } else {
                // Idle
                recordBtn.classList.remove('hidden');
                recordBtn.classList.remove('recording');
                stopBtn.classList.add('hidden');
                spinner.classList.add('hidden');
                statusEl.textContent = 'Hazıram';
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

        // 3 saniyə sonra modalı bağla
        setTimeout(() => {
            this.closeModal();
        }, 3000);

        // AI səs cavabını çalırıq (əgər varsa)
        if (result.audio_response) {
            const audio = new Audio(`data:audio/mp3;base64,${result.audio_response}`);
            audio.play().catch(() => { /* ignore autoplay errors */ });
        }
    }

    showError(msg) {
        const resultDiv = document.getElementById('voice-result');
        resultDiv.innerHTML = `
            <div class="error-result">
                <div class="flex items-center gap-2">
                    <svg class="w-5 h-5 sm:w-6 sm:h-6 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span class="text-white text-sm sm:text-base">${msg}</span>
                </div>
            </div>
        `;
    }

    closeModal() {
        const modal = document.getElementById('voice-modal');
        const resultDiv = document.getElementById('voice-result');
        
        // Smooth close animation
        if (modal) {
            modal.style.opacity = '0';
            modal.style.transform = 'scale(0.95)';
            
            setTimeout(() => {
                modal.classList.add('hidden');
                modal.style.opacity = '';
                modal.style.transform = '';
                if (resultDiv) {
                    resultDiv.innerHTML = '';
                }
                this.updateUI('idle');
                // Clean up stream
                if (this.stream) {
                    this.stream.getTracks().forEach(track => track.stop());
                    this.stream = null;
                }
            }, 200);
        }
    }
}

// İnstansiya yaradırıq
const voiceRecorder = new VoiceRecorder();

// Qlobal funksiyalar (HTML-dən çağırmaq üçün)
window.openVoiceModal = () => {
    const modal = document.getElementById('voice-modal');
    if (modal) {
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
    document.getElementById('record-btn')?.addEventListener('click', () => voiceRecorder.startRecording());
    document.getElementById('stop-btn')?.addEventListener('click', () => voiceRecorder.stopRecording());
    document.getElementById('close-voice-modal')?.addEventListener('click', () => voiceRecorder.closeModal());
});
