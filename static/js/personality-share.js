// Personality Card Sharing
(function() {
    'use strict';
    
    window.sharePersonality = async function() {
        const card = document.getElementById('personality-card');
        if (!card) {
            console.error('Personality card not found');
            return;
        }
        
        // Check if html2canvas is loaded
        if (typeof html2canvas === 'undefined') {
            // Load html2canvas dynamically
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
            script.onload = () => captureAndShare(card);
            script.onerror = () => alert('Xəta: html2canvas yüklənmədi. Səhifəni yeniləyin.');
            document.head.appendChild(script);
            return;
        }
        
        captureAndShare(card);
    };
    
    async function captureAndShare(card) {
        try {
            const canvas = await html2canvas(card, {
                backgroundColor: null,
                scale: 2,
                logging: false,
                useCORS: true,
                allowTaint: false
            });
            
            canvas.toBlob((blob) => {
                if (!blob) {
                    alert('Xəta: Şəkil yaradıla bilmədi.');
                    return;
                }
                
                // Try native share API first
                if (navigator.share && navigator.canShare) {
                    const file = new File([blob], `finmate-personality-${Date.now()}.png`, { type: 'image/png' });
                    if (navigator.canShare({ files: [file] })) {
                        navigator.share({
                            files: [file],
                            title: 'FinMate AI - Maliyyə Şəxsiyyətim',
                            text: 'Mənim maliyyə şəxsiyyətim!'
                        }).catch(() => downloadImage(blob));
                        return;
                    }
                }
                
                downloadImage(blob);
            }, 'image/png');
        } catch (error) {
            console.error('Share failed:', error);
            alert('Xəta baş verdi: ' + error.message);
        }
    }
    
    function downloadImage(blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `finmate-personality-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showNotification('✅ Şəxsiyyət kartı yükləndi!');
    }
    
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'fixed top-20 right-4 z-50 px-6 py-3 rounded-lg bg-green-500 text-white font-medium shadow-lg';
        notification.textContent = message;
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.3s';
        document.body.appendChild(notification);
        
        setTimeout(() => notification.style.opacity = '1', 10);
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
})();

