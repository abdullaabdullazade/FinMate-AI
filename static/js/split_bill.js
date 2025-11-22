let splitTotal = 0;
function openSplitBill(total, items) {
    splitTotal = parseFloat(total || 0);
    document.getElementById('split-total').textContent = splitTotal.toFixed(2) + ' AZN';
    document.getElementById('split-per-person').textContent = '-';
    const list = (items && items.length)
        ? ('<p class="text-white/60 text-sm mb-2">Maddələr:</p>' + items.map(i => `<div class="flex justify-between"><span>${i.name}</span><span>${parseFloat(i.price || 0).toFixed(2)} AZN</span></div>`).join(''))
        : '';
    document.getElementById('split-list').innerHTML = list;
    document.getElementById('split-modal').classList.remove('hidden');
}
function closeSplitModal() {
    document.getElementById('split-modal')?.classList.add('hidden');
}
function calcSplit() {
    const namesStr = document.getElementById('split-names').value || '';
    const names = namesStr.split(',').map(n => n.trim()).filter(Boolean);
    const count = names.length || 1;
    const per = splitTotal / count;
    document.getElementById('split-per-person').textContent = per.toFixed(2) + ' AZN';
    const list = names.map(n => `<div class="flex justify-between"><span>${n}</span><span>${per.toFixed(2)} AZN</span></div>`).join('');
    document.getElementById('split-list').innerHTML = list || '<p class="text-white/60 text-sm">Ad daxil et, bərabər bölək.</p>';
}
function shareSplit() {
    const per = document.getElementById('split-per-person').textContent || '';
    const txt = `Payın: ${per} (FinMate bölüşdürmə)`;

    // Try native share
    if (navigator.share) {
        navigator.share({ text: txt }).catch(() => copyFallback(txt));
        return;
    }
    copyFallback(txt);
}

function shareQrSplit() {
    const per = document.getElementById('split-per-person').textContent || '';
    const txt = `Payın: ${per} (FinMate bölüşdürmə)`;
    if (typeof openQrModal === 'function') {
        openQrModal(txt);
    } else {
        copyFallback(txt);
    }
}

function copyFallback(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text)
            .then(() => alert('Kopyalandı və paylaşmağa hazıram: ' + text))
            .catch(() => alert(text));
    } else {
        alert(text);
    }
}
