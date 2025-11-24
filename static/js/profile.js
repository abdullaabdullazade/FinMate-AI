// Profile Page JavaScript

document.addEventListener('DOMContentLoaded', function () {
    const ctxEl = document.getElementById('xpChart');
    if (!ctxEl) return;
    
    const ctx = ctxEl.getContext('2d');

    // Parse the breakdown data from data attribute or inline script
    const xpDataElement = document.getElementById('xp-data');
    let xpData = {};
    
    if (xpDataElement) {
        try {
            xpData = JSON.parse(xpDataElement.textContent);
        } catch (e) {
            console.error('Error parsing XP data:', e);
        }
    }

    // If no data, show empty state or default
    if (Object.keys(xpData).length === 0) {
        // Optional: Handle empty state
        return;
    }

    const labels = Object.keys(xpData).map(key => {
        if (key === 'manual_expense') return 'Xərclər';
        if (key === 'scan_receipt') return 'Qəbz';
        if (key === 'chat_message') return 'Söhbət';
        if (key === 'login_streak') return 'Serial giriş';
        return key;
    });

    const data = Object.values(xpData);

    // Get theme colors
    const getThemeColors = () => {
        const body = document.body;
        if (body.classList.contains('theme-gold')) {
            return ['#ffd700', '#ffed4e', '#ffb300', '#ffc107', '#ffa000'];
        } else if (body.classList.contains('theme-midnight')) {
            return ['#ffffff', '#e0e0e0', '#bdbdbd', '#9e9e9e', '#757575'];
        } else if (body.classList.contains('theme-ocean')) {
            return ['#00bfff', '#5dade2', '#3498db', '#2980b9', '#1e88e5'];
        } else if (body.classList.contains('theme-forest')) {
            return ['#4caf50', '#81c784', '#66bb6a', '#43a047', '#388e3c'];
        } else if (body.classList.contains('theme-sunset')) {
            return ['#ff9800', '#ffb74d', '#ffa726', '#fb8c00', '#f57c00'];
        } else if (body.classList.contains('theme-royal')) {
            return ['#9c27b0', '#ba68c8', '#ab47bc', '#8e24aa', '#7b1fa2'];
        } else {
            // Default colors
            return ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EC4899'];
        }
    };

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: getThemeColors(),
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: 'rgba(255, 255, 255, 0.7)',
                        font: {
                            family: 'Inter'
                        }
                    }
                }
            },
            cutout: '70%'
        }
    });
});

// Fast level transition on page load/update
document.addEventListener('DOMContentLoaded', function () {
    const levelCard = document.getElementById('level-card');
    const progressBar = document.getElementById('level-progress-bar');

    if (levelCard && progressBar) {
        // Force immediate style update for instant transition
        levelCard.style.transition = 'background 0.2s ease-in-out, border-color 0.2s ease-in-out';
        progressBar.style.transition = 'width 0.3s ease-out, background 0.2s ease-in-out';

        // Trigger reflow to ensure styles are applied
        void levelCard.offsetHeight;
        void progressBar.offsetHeight;
    }
});

// Listen for HTMX updates (if profile is updated via HTMX)
document.body.addEventListener('htmx:afterSwap', function (event) {
    if (event.detail.target.id === 'level-card' || event.detail.target.querySelector('#level-card')) {
        const levelCard = document.getElementById('level-card');
        const progressBar = document.getElementById('level-progress-bar');

        if (levelCard && progressBar) {
            // Reset and apply fast transition
            levelCard.style.transition = 'background 0.2s ease-in-out, border-color 0.2s ease-in-out';
            progressBar.style.transition = 'width 0.3s ease-out, background 0.2s ease-in-out';

            // Force reflow
            void levelCard.offsetHeight;
            void progressBar.offsetHeight;
        }
    }
});

