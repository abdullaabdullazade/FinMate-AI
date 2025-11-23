// Voice Mode (Text-to-Speech)
(function() {
    'use strict';
    
    let speechUtterance = null;
    
    window.speakSummary = function() {
        if (!('speechSynthesis' in window)) return;
        const parts = [];
        const greet = document.querySelector('h2.text-2xl');
        if (greet) parts.push(greet.innerText);
        const total = document.getElementById('stat-total');
        if (total) parts.push(`Ümumi xərc ${total.innerText} AZN`);
        const budget = document.getElementById('stat-budget');
        if (budget) parts.push(`Aylıq büdcə ${budget.innerText} AZN`);
        const remaining = document.getElementById('stat-remaining');
        if (remaining) parts.push(`Qalıq ${remaining.innerText} AZN`);
        const eco = document.querySelector('.eco-leaf');
        if (eco) {
            const ecoValue = eco.nextElementSibling ? eco.nextElementSibling.innerText : '';
            if (ecoValue) parts.push(`Eko iz ${ecoValue} kiloqram CO2`);
        }
        const text = parts.join('. ');
        if (!text) return;
        window.speechSynthesis.cancel();
        speechUtterance = new SpeechSynthesisUtterance(text);
        speechUtterance.lang = 'az-AZ';
        speechUtterance.rate = 1.0;
        window.speechSynthesis.speak(speechUtterance);
    };
    
    window.toggleVoiceMode = function(enabled) {
        console.log('🔊 Voice mode:', enabled);
        if (enabled) {
            localStorage.setItem('voice-mode', 'enabled');
            document.body.addEventListener('mouseover', speakText);
            document.body.addEventListener('focusin', speakText);
            console.log('✅ Voice mode enabled!');
            setTimeout(window.speakSummary, 500);
        } else {
            localStorage.setItem('voice-mode', 'disabled');
            document.body.removeEventListener('mouseover', speakText);
            document.body.removeEventListener('focusin', speakText);
            window.speechSynthesis.cancel();
            console.log('❌ Voice mode disabled');
        }
    };
    
    // Throttle speakText to prevent too many calls
    let lastSpeakTime = 0;
    const SPEAK_THROTTLE = 500; // 500ms between speaks
    
    function speakText(event) {
        const now = Date.now();
        if (now - lastSpeakTime < SPEAK_THROTTLE) {
            return;
        }
        lastSpeakTime = now;
        
        const target = event.target;
        if (['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'SPAN', 'A', 'BUTTON', 'LABEL', 'LI'].includes(target.tagName)) {
            const text = target.innerText || target.textContent;
            if (text && text.trim().length > 0 && text.trim().length < 200) { // Limit text length
                window.speechSynthesis.cancel();
                speechUtterance = new SpeechSynthesisUtterance(text.trim());
                speechUtterance.lang = 'az-AZ';
                speechUtterance.rate = 1.0;
                window.speechSynthesis.speak(speechUtterance);
            }
        }
    }
    
    document.addEventListener('DOMContentLoaded', () => {
        const isVoiceModeEnabled = localStorage.getItem('voice-mode') === 'enabled';
        if (isVoiceModeEnabled) {
            window.toggleVoiceMode(true);
        }
        
        const voiceToggle = document.getElementById('voice-mode-toggle');
        if (voiceToggle) {
            voiceToggle.checked = isVoiceModeEnabled;
        }
    });
})();

