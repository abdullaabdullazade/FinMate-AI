const defaultQrText = 'M10 0000 0000 0000 0000';
let qrLibLoaded = typeof QRCode !== 'undefined';
let qrLibLoading = null;

function ensureQrLib() {
    if (qrLibLoaded) return Promise.resolve();
    if (qrLibLoading) return qrLibLoading;
    qrLibLoading = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
        script.onload = () => {
            qrLibLoaded = true;
            resolve();
        };
        script.onerror = (e) => reject(e);
        document.head.appendChild(script);
    });
    return qrLibLoading;
}

function renderQr(text) {
    const box = document.getElementById('qr-canvas');
    if (!box) {
        console.error('QR code box missing');
        return;
    }
    ensureQrLib().then(() => {
        box.innerHTML = '';
        new QRCode(box, {
            text: text || defaultQrText,
            width: 220,
            height: 220
        });
    }).catch(err => {
        console.error('QR generation failed:', err);
    });
}

function openQrModal(text) {
    const modal = document.getElementById('qr-modal');
    const input = document.getElementById('qr-text');
    if (!modal) return;
    if (input && text) input.value = text;
    const qrText = (input && input.value) || text || defaultQrText;
    modal.classList.remove('hidden');
    renderQr(qrText);
}

function closeQrModal() {
    document.getElementById('qr-modal')?.classList.add('hidden');
}

function generateQrFromInput() {
    const input = document.getElementById('qr-text');
    renderQr(input && input.value ? input.value.trim() : defaultQrText);
}

function copyQrText() {
    const input = document.getElementById('qr-text');
    const value = (input && input.value.trim()) || defaultQrText;
    navigator.clipboard.writeText(value).catch(err => console.error('Copy failed', err));
}
