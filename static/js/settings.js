// Make all functions global
(function () {
    'use strict';

    // Income Slider Logic
    window.updateIncomeFromSlider = function (val) {
        const input = document.getElementById('monthly-income-input');
        const progress = document.getElementById('income-progress');
        const thumb = document.getElementById('income-thumb');

        if (input) {
            input.value = val;
        }
        if (progress && thumb) {
            const percentage = Math.min((val / 100000) * 100, 100);
            progress.style.width = percentage + '%';
            thumb.style.left = percentage + '%';
        }
    };

    window.updateIncomeFromInput = function (val) {
        const slider = document.getElementById('monthly-income-slider');
        const progress = document.getElementById('income-progress');
        const thumb = document.getElementById('income-thumb');
        
        // Validate input
        let numVal = parseFloat(val);
        if (isNaN(numVal) || numVal < 0) {
            numVal = 0;
        } else if (numVal > 100000) {
            numVal = 100000;
            window.showToast('Maksimum maaş 100000 AZN-dir', 'error');
        }
        
        // Update input if value was corrected
        const input = document.getElementById('monthly-income-input');
        if (input && input.value != numVal) {
            input.value = numVal;
        }
        
        // Update slider
        if (slider) {
            slider.value = numVal;
        }
        
        // Update progress bar
        if (progress && thumb) {
            const percentage = Math.min((numVal / 100000) * 100, 100);
            progress.style.width = percentage + '%';
            thumb.style.left = percentage + '%';
        }
    };

    // Budget Slider Logic
    window.updateBudgetFromSlider = function (val) {
        const input = document.getElementById('monthly-budget-input');
        const progress = document.getElementById('budget-progress');
        const thumb = document.getElementById('budget-thumb');

        if (input) {
            input.value = val;
        }
        if (progress && thumb) {
            const percentage = Math.min((val / 50000) * 100, 100);
            progress.style.width = percentage + '%';
            thumb.style.left = percentage + '%';
        }
    };

    window.updateBudgetFromInput = function (val) {
        const slider = document.getElementById('monthly-budget-slider');
        const progress = document.getElementById('budget-progress');
        const thumb = document.getElementById('budget-thumb');
        
        // Validate input
        let numVal = parseFloat(val);
        if (isNaN(numVal) || numVal < 100) {
            numVal = 100;
            window.showToast('Minimum büdcə 100 AZN-dir', 'error');
        } else if (numVal > 50000) {
            numVal = 50000;
            window.showToast('Maksimum büdcə 50000 AZN-dir', 'error');
        }
        
        // Update input if value was corrected
        const input = document.getElementById('monthly-budget-input');
        if (input && input.value != numVal) {
            input.value = numVal;
        }
        
        // Update slider
        if (slider) {
            slider.value = numVal;
        }
        
        // Update progress bar
        if (progress && thumb) {
            const percentage = Math.min((numVal / 50000) * 100, 100);
            progress.style.width = percentage + '%';
            thumb.style.left = percentage + '%';
        }
    };

    // Daily Limit Validation
    window.validateDailyLimit = function(input) {
        const value = parseFloat(input.value);
        const inputElement = input;
        
        // Remove any previous error styling
        inputElement.classList.remove('border-red-500', 'focus:border-red-500', 'focus:ring-red-500');
        
        // If empty, allow it (optional field)
        if (input.value === '' || input.value === null) {
            inputElement.classList.add('border-white/10', 'focus:border-green-500', 'focus:ring-green-500');
            return true;
        }
        
        // Check if valid number
        if (isNaN(value)) {
            inputElement.classList.add('border-red-500', 'focus:border-red-500', 'focus:ring-red-500');
            window.showToast('Yalnız rəqəm daxil edin', 'error');
            return false;
        }
        
        // Check range
        if (value < 0) {
            inputElement.value = '0';
            inputElement.classList.add('border-red-500', 'focus:border-red-500', 'focus:ring-red-500');
            window.showToast('Mənfi dəyər ola bilməz', 'error');
            return false;
        }
        
        if (value > 1000) {
            inputElement.value = '1000';
            inputElement.classList.add('border-red-500', 'focus:border-red-500', 'focus:ring-red-500');
            window.showToast('Maksimum limit 1000 AZN-dir', 'error');
            return false;
        }
        
        // Valid value
        inputElement.classList.add('border-white/10', 'focus:border-green-500', 'focus:ring-green-500');
        return true;
    };

    // Form Validation before submit
    window.validateSettingsForm = function(form) {
        const dailyLimitInput = document.getElementById('daily-budget-limit-input');
        if (dailyLimitInput && dailyLimitInput.value !== '') {
            if (!window.validateDailyLimit(dailyLimitInput)) {
                return false;
            }
        }
        
        // Validate monthly budget input
        const monthlyBudgetInput = document.getElementById('monthly-budget-input');
        if (monthlyBudgetInput) {
            const budgetVal = parseFloat(monthlyBudgetInput.value);
            if (isNaN(budgetVal) || budgetVal < 100 || budgetVal > 50000) {
                window.showToast('Aylıq büdcə 100-50000 AZN arası olmalıdır', 'error');
                return false;
            }
        }
        
        return true;
    };

    // Toast Notification System
    window.showToast = function (message, type = 'success') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');

        const styles = type === 'success'
            ? 'bg-green-500/90 border-green-400/50 shadow-green-500/20'
            : type === 'error'
                ? 'bg-red-500/90 border-red-400/50 shadow-red-500/20'
                : 'bg-blue-500/90 border-blue-400/50 shadow-blue-500/20';

        const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';

        toast.className = `pointer-events-auto backdrop-blur-md text-white px-6 py-4 rounded-xl shadow-lg border flex items-center gap-3 transform transition-all duration-500 translate-x-full ${styles}`;
        toast.innerHTML = `
            <span class="text-xl">${icon}</span>
            <span class="font-medium">${message}</span>
        `;

        container.appendChild(toast);

        // Animate in
        requestAnimationFrame(() => {
            toast.classList.remove('translate-x-full');
        });

        // Remove after 3 seconds
        setTimeout(() => {
            toast.classList.add('translate-x-full', 'opacity-0');
            setTimeout(() => toast.remove(), 500);
        }, 3000);
    };

    // HTMX Request Validation
    document.body.addEventListener('htmx:configRequest', function (event) {
        if (event.detail && event.detail.target && event.detail.target.tagName === 'FORM') {
            // Validate form before submit
            if (!window.validateSettingsForm(event.detail.target)) {
                event.preventDefault();
                return false;
            }
        }
    });

    // HTMX Response Handling
    document.body.addEventListener('htmx:afterRequest', function (event) {
        if (event.detail && event.detail.target && event.detail.target.tagName === 'FORM') {
            if (event.detail.successful) {
                try {
                    const response = JSON.parse(event.detail.xhr.response);
                    if (response.success) {
                        window.showToast(response.message || 'Tənzimləmələr yadda saxlanıldı!');
                    } else {
                        window.showToast(response.error || 'Xəta baş verdi', 'error');
                    }
                } catch (e) {
                    window.showToast('Tənzimləmələr yadda saxlanıldı!', 'success');
                }
            } else {
                window.showToast('Server xətası baş verdi', 'error');
            }
        }
    });

    // Reset Demo Data
    window.resetDemoData = async function () {
        if (!confirm('Demo məlumatlarını sıfırlamaq istəyirsən? Bütün cari məlumatlar silinəcək.')) return;
        try {
            const res = await fetch('/api/reset-demo', { method: 'POST' });
            const data = await res.json();
            if (data.success) {
                window.showToast('Demo məlumatları yeniləndi, səhifəni yenilə!');
            } else {
                window.showToast(data.error || 'Sıfırlama alınmadı', 'error');
            }
        } catch (err) {
            window.showToast('Şəbəkə xətası', 'error');
        }
    };

    // Update Theme Buttons
    window.updateThemeButtons = function (activeTheme) {
        const buttons = {
            'gold': 'theme-gold-btn',
            'midnight': 'theme-midnight-btn',
            'ocean': 'theme-ocean-btn',
            'forest': 'theme-forest-btn',
            'sunset': 'theme-sunset-btn',
            'royal': 'theme-royal-btn'
        };

        const borderClasses = {
            'gold': 'border-yellow-500 ring-2 ring-yellow-500/50',
            'midnight': 'border-gray-500 ring-2 ring-gray-500/50',
            'ocean': 'border-cyan-500 ring-2 ring-cyan-500/50',
            'forest': 'border-green-500 ring-2 ring-green-500/50',
            'sunset': 'border-orange-500 ring-2 ring-orange-500/50',
            'royal': 'border-purple-500 ring-2 ring-purple-500/50'
        };

        // Remove all active states
        Object.values(buttons).forEach(btnId => {
            const btn = document.getElementById(btnId);
            if (btn) {
                btn.classList.remove('border-yellow-500', 'ring-2', 'ring-yellow-500/50',
                    'border-gray-500', 'ring-gray-500/50',
                    'border-cyan-500', 'ring-cyan-500/50',
                    'border-green-500', 'ring-green-500/50',
                    'border-orange-500', 'ring-orange-500/50',
                    'border-purple-500', 'ring-purple-500/50');
            }
        });

        // Add active state to selected theme
        if (activeTheme !== 'default' && buttons[activeTheme]) {
            const btn = document.getElementById(buttons[activeTheme]);
            if (btn && borderClasses[activeTheme]) {
                const classes = borderClasses[activeTheme].split(' ');
                classes.forEach(cls => btn.classList.add(cls));
            }
        }
    };

    // Premium Theme Switching (Settings-specific wrapper)
    window.applyPremiumThemeSettings = function (theme) {
        console.log('Settings: Applying theme:', theme);

        // Call global function if available
        if (typeof window.applyPremiumTheme === 'function') {
            window.applyPremiumTheme(theme);
        } else {
            // Fallback: apply theme directly
            const body = document.body;
            const html = document.documentElement;
            const themes = ['theme-gold', 'theme-midnight', 'theme-ocean', 'theme-forest', 'theme-sunset', 'theme-royal'];

            themes.forEach(t => {
                body.classList.remove(t);
                html.classList.remove(t);
            });

            const themeMap = {
                'gold': 'theme-gold',
                'midnight': 'theme-midnight',
                'ocean': 'theme-ocean',
                'forest': 'theme-forest',
                'sunset': 'theme-sunset',
                'royal': 'theme-royal'
            };

            if (theme && theme !== 'default' && themeMap[theme]) {
                body.classList.add(themeMap[theme]);
                html.classList.add(themeMap[theme]);
                localStorage.setItem('premium-theme', theme);
            } else {
                localStorage.removeItem('premium-theme');
                // When returning to default, set theme to 'light' for pink color scheme
                html.setAttribute('data-theme', 'light');
                localStorage.setItem('theme', 'light');
            }
        }

        const themeNames = {
            'gold': '✨ Investor Gold',
            'midnight': '🌙 Midnight',
            'ocean': '🌊 Ocean',
            'forest': '🌲 Forest',
            'sunset': '🌅 Sunset',
            'royal': '👑 Royal Purple',
            'default': 'Standart (Çəhrayı)'
        };

        const themeName = themeNames[theme] || 'Standart';
        if (theme !== 'default') {
            window.showToast(`${themeName} temaya keçildi!`, 'success');
        } else {
            window.showToast('Standart çəhrayı temaya qayıdıldı', 'success');
        }

        // Update button states
        window.updateThemeButtons(theme);
    };

    // Incognito Mode Toggle (Settings-specific wrapper)
    window.toggleIncognitoModeSettings = function (enabled) {
        if (typeof window.toggleIncognitoMode === 'function') {
            window.toggleIncognitoMode(enabled);
            if (enabled) {
                window.showToast('🕵️‍♂️ Məxfilik modu aktivləşdirildi', 'success');
            } else {
                window.showToast('Məxfilik modu deaktivləşdirildi', 'success');
            }
        } else {
            window.showToast('Məxfilik modu funksiyası yüklənməyib', 'error');
        }
    };

    // Initialize on page load
    document.addEventListener('DOMContentLoaded', () => {
        // Load premium theme
        const savedTheme = localStorage.getItem('premium-theme');
        const validThemes = ['gold', 'midnight', 'ocean', 'forest', 'sunset', 'royal'];

        // Wait for theme.js to load
        setTimeout(() => {
            if (savedTheme && validThemes.includes(savedTheme)) {
                // Apply theme using global function
                if (typeof window.applyPremiumTheme === 'function') {
                    window.applyPremiumTheme(savedTheme);
                } else {
                    window.applyPremiumThemeSettings(savedTheme);
                }
                window.updateThemeButtons(savedTheme);
            } else {
                window.updateThemeButtons('default');
            }
        }, 200);

        // Load incognito mode
        const isIncognito = localStorage.getItem('incognito-mode') === 'enabled';
        const toggle = document.getElementById('incognito-mode-toggle');
        if (toggle) {
            toggle.checked = isIncognito;
            if (isIncognito && typeof window.toggleIncognitoMode === 'function') {
                setTimeout(() => {
                    window.toggleIncognitoMode(true);
                }, 300);
            }
        }

        // Listen for theme changes
        window.addEventListener('themeChanged', (event) => {
            const theme = event.detail.theme;
            window.updateThemeButtons(theme === 'default' ? 'default' : theme);
        });
    });
})();

