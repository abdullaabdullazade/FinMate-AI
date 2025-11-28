/**
 * Gamification JavaScript for FinMate AI
 * Handles XP notifications, level-up animations, and confetti effects
 */

// Show XP toast notification
function showXPToast(amount, action) {
    const toast = document.createElement('div');
    toast.className = 'xp-toast';
    toast.innerHTML = `
        <div class="xp-toast-content">
            <span class="xp-icon">✨</span>
            <span class="xp-text">+${amount} XP</span>
            <span class="xp-action">${action}</span>
        </div>
    `;

    document.body.appendChild(toast);

    // Animate in
    setTimeout(() => toast.classList.add('show'), 100);

    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Trigger level up animation with confetti
function triggerLevelUp(newLevel, levelInfo, coinsAwarded = 0) {
    // Confetti explosion
    if (window.confetti) {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });

        // Second burst
        setTimeout(() => {
            confetti({
                particleCount: 50,
                angle: 60,
                spread: 55,
                origin: { x: 0 }
            });
            confetti({
                particleCount: 50,
                angle: 120,
                spread: 55,
                origin: { x: 1 }
            });
        }, 250);
    }

    // Show level-up modal
    const modal = document.createElement('div');
    modal.className = 'level-up-modal';
    const coinReward = coinsAwarded > 0 ? `<div class="level-up-reward">🎁 Hədiyyə: <strong>${coinsAwarded} Coin</strong></div>` : '';
    modal.innerHTML = `
        <div class="level-up-content">
            <div class="level-up-icon">${levelInfo.emoji}</div>
            <h2 class="level-up-title">Level Up!</h2>
            <p class="level-up-text">Sən indi <strong>${newLevel}</strong> oldun!</p>
            ${coinReward}
            <button onclick="this.closest('.level-up-modal').remove()" class="level-up-button">
                Əla! 🎉
            </button>
        </div>
    `;

    document.body.appendChild(modal);

    setTimeout(() => modal.classList.add('show'), 100);
}

// Update XP progress bar
function updateXPBar(currentXP, levelInfo) {
    const progressBar = document.getElementById('xp-progress-bar');
    const xpText = document.getElementById('xp-text');

    if (progressBar && levelInfo) {
        progressBar.style.width = levelInfo.progress_percentage + '%';

        if (xpText) {
            xpText.textContent = `${currentXP} / ${levelInfo.max_xp === Infinity ? '∞' : levelInfo.max_xp} XP`;
        }
    }
}

// Listen for XP award events from HTMX responses
document.addEventListener('htmx:afterSwap', function (event) {
    const response = event.detail.xhr.response;

    try {
        const data = JSON.parse(response);

        // Check if XP was awarded
        if (data.xp_result) {
            const xpResult = data.xp_result;

            // Show XP toast
            showXPToast(xpResult.xp_awarded, 'Action completed');

            // Update XP bar
            updateXPBar(xpResult.level_info.current_xp, xpResult.level_info);

            // Check for level up
            if (xpResult.level_up) {
                setTimeout(() => {
                    triggerLevelUp(xpResult.new_level, xpResult.level_info, xpResult.coins_awarded || 0);
                }, 500);
            }
        }
    } catch (e) {
        // Not JSON or no XP data, ignore
    }
});

// Add CSS styles dynamically
const style = document.createElement('style');
style.textContent = `
    .xp-toast {
        position: fixed;
        top: 80px;
        right: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        transform: translateX(400px);
        transition: transform 0.3s ease;
        z-index: 10000;
    }
    
    .xp-toast.show {
        transform: translateX(0);
    }
    
    .xp-toast-content {
        display: flex;
        align-items: center;
        gap: 12px;
    }
    
    .xp-icon {
        font-size: 24px;
    }
    
    .xp-text {
        font-size: 20px;
        font-weight: bold;
    }
    
    .xp-action {
        font-size: 14px;
        opacity: 0.9;
    }
    
    .level-up-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10001;
        opacity: 0;
        transition: opacity 0.3s ease;
    }
    
    .level-up-modal.show {
        opacity: 1;
    }
    
    .level-up-content {
        background: white;
        padding: 40px;
        border-radius: 20px;
        text-align: center;
        max-width: 400px;
        animation: slideUp 0.5s ease;
    }
    
    @keyframes slideUp {
        from {
            transform: translateY(50px);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }
    
    .level-up-icon {
        font-size: 80px;
        margin-bottom: 20px;
        animation: bounce 0.6s ease infinite alternate;
    }
    
    @keyframes bounce {
        from { transform: translateY(0); }
        to { transform: translateY(-10px); }
    }
    
    .level-up-title {
        font-size: 32px;
        font-weight: bold;
        color: #4F46E5;
        margin-bottom: 10px;
    }
    
    .level-up-text {
        font-size: 18px;
        color: #666;
        margin-bottom: 15px;
    }
    
    .level-up-reward {
        background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
        color: white;
        padding: 12px 20px;
        border-radius: 12px;
        font-size: 16px;
        margin-bottom: 20px;
        box-shadow: 0 4px 12px rgba(251, 191, 36, 0.3);
    }
    
    .level-up-button {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        padding: 12px 32px;
        border-radius: 8px;
        font-size: 16px;
        font-weight: bold;
        cursor: pointer;
        transition: transform 0.2s ease;
    }
    
    .level-up-button:hover {
        transform: scale(1.05);
    }
`;
document.head.appendChild(style);
