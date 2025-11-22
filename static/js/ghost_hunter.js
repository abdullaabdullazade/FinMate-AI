async function loadGhostSubs() {
    try {
        const res = await fetch('/api/ghost-subscriptions');
        const data = await res.json();
        const container = document.getElementById('ghost-sub-list');
        if (!container) return;
        container.innerHTML = '';
        if (!data.suspects || data.suspects.length === 0) {
            container.innerHTML = '<p class="text-white/60 text-sm">Şübhəli abunəlik tapılmadı.</p>';
            return;
        }
        data.suspects.forEach(s => {
            const row = document.createElement('div');
            row.className = 'flex items-center justify-between bg-white/5 rounded-xl px-3 py-2';
            row.innerHTML = `
                <div>
                    <p class="text-white font-medium">${s.merchant}</p>
                    <p class="text-xs text-white/50">${s.category} • ${s.latest}</p>
                </div>
                <div class="text-right">
                    <p class="text-white font-bold">${s.amount.toFixed(2)} AZN</p>
                    <p class="text-xs text-purple-300">${s.count} ödəniş</p>
                </div>
            `;
            container.appendChild(row);
        });
    } catch (e) {
        console.error('Ghost fetch error', e);
    }
}

document.addEventListener('DOMContentLoaded', loadGhostSubs);
