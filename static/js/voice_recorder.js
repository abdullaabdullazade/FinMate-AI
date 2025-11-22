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
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.isRecording = false;

            // Mikrofon axınını tam dayandırırıq (işləməyə davam etməsin)
            if (this.stream) {
                this.stream.getTracks().forEach(track => track.stop());
            }

            this.updateUI('processing');
        }
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

            const result = await response.json();

            this.updateUI('idle');

            if (result.success) {
                this.showSuccess(result);
            } else {
                this.showError(result.error || "Anlaşılmadı");
            }

        } catch (error) {
            console.error('Server xətası:', error);
            this.updateUI('idle');
            this.showError('Serverlə əlaqə kəsildi.');
        }
    }

    updateUI(state) {
        const statusEl = document.getElementById('voice-status');
        const recordBtn = document.getElementById('record-btn');
        const stopBtn = document.getElementById('stop-btn');
        const spinner = document.getElementById('loading-spinner');
        const waves = document.getElementById('voice-waves'); // Vizual effekt (əsas dizaynda yoxdur)

        if (state === 'recording') {
            statusEl.textContent = 'Dinləyirəm... Danışın 🎙️';
            recordBtn.classList.add('hidden');
            stopBtn.classList.remove('hidden');
            waves && waves.classList.remove('hidden');
        } else if (state === 'processing') {
            statusEl.textContent = 'AI Analiz edir... 🧠';
            stopBtn.classList.add('hidden');
            spinner.classList.remove('hidden');
            waves && waves.classList.add('hidden');
        } else {
            // Idle
            recordBtn.classList.remove('hidden');
            stopBtn.classList.add('hidden');
            spinner.classList.add('hidden');
            waves && waves.classList.add('hidden');
            statusEl.textContent = 'Hazıram';
        }
    }

    showSuccess(result) {
        const resultDiv = document.getElementById('voice-result');

        // Uğurlu nəticə kartı
        resultDiv.innerHTML = `
            <div class="bg-green-50 border border-green-200 rounded-xl p-4 animate-fade-in-up">
                <div class="flex items-center gap-2 mb-2">
                    <span class="text-green-600 font-bold text-lg">✅ Əlavə Edildi!</span>
                    <span class="badge badge-warning gap-1">+${(result.xp_result && result.xp_result.xp_awarded) || result.xp_awarded || 10} XP</span>
                </div>
                <p class="text-gray-600 italic">"${result.transcribed_text}"</p>
                <div class="mt-3 grid grid-cols-2 gap-2 text-sm">
                    <div class="bg-white p-2 rounded shadow-sm">
                        <span class="block text-xs text-gray-400">Məbləğ</span>
                        <span class="font-bold text-gray-800">${result.expense_data.amount} AZN</span>
                    </div>
                    <div class="bg-white p-2 rounded shadow-sm">
                        <span class="block text-xs text-gray-400">Kateqoriya</span>
                        <span class="font-bold text-gray-800">${result.expense_data.category}</span>
                    </div>
                </div>
            </div>
        `;

        // Dashboard-u yeniləmək üçün HTMX trigger edirik (Refresh etmədən!)
        // Body-də hx-trigger="expensesUpdated" dinləyən bir element olmalıdır
        document.body.dispatchEvent(new Event('expensesUpdated'));

        // 3 saniyə sonra modalı bağla
        setTimeout(() => this.closeModal(), 3500);

        // AI səs cavabını çalırıq (əgər varsa)
        if (result.audio_response) {
            const audio = new Audio(`data:audio/mp3;base64,${result.audio_response}`);
            audio.play().catch(() => { /* ignore autoplay errors */ });
        }
    }

    showError(msg) {
        document.getElementById('voice-result').innerHTML = `
            <div class="bg-red-50 text-red-600 p-3 rounded-xl border border-red-200 text-sm">
                ❌ ${msg}
            </div>
        `;
    }

    closeModal() {
        document.getElementById('voice-modal').classList.add('hidden');
        document.getElementById('voice-result').innerHTML = '';
        this.updateUI('idle');
    }
}

// İnstansiya yaradırıq
const voiceRecorder = new VoiceRecorder();

// Qlobal funksiyalar (HTML-dən çağırmaq üçün)
window.openVoiceModal = () => document.getElementById('voice-modal').classList.remove('hidden');
window.closeVoiceModal = () => voiceRecorder.closeModal();
window.startRecording = () => voiceRecorder.startRecording();
window.stopRecording = () => voiceRecorder.stopRecording();

// Button event bindings
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('record-btn')?.addEventListener('click', () => voiceRecorder.startRecording());
    document.getElementById('stop-btn')?.addEventListener('click', () => voiceRecorder.stopRecording());
    document.getElementById('close-voice-modal')?.addEventListener('click', () => voiceRecorder.closeModal());
});
