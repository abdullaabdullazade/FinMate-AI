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

    // Helper function to get current currency
    window.getCurrentCurrency = function () {
        const selector = document.getElementById('currency-selector');
        if (selector && selector.value) {
            return selector.value;
        }
        // Fallback: try to get from currency-symbol-min
        const currencyEl = document.getElementById('currency-symbol-min');
        if (currencyEl) {
            return currencyEl.textContent.trim();
        }
        // Last fallback
        return currentCurrency || 'AZN';
    };

    // Budget Slider Logic
    window.updateBudgetFromSlider = function (val) {
        const input = document.getElementById('monthly-budget-input');
        const slider = document.getElementById('monthly-budget-slider');
        const progress = document.getElementById('budget-progress');
        const thumb = document.getElementById('budget-thumb');
        const displayUnit = document.getElementById('budget-display-unit');

        // Convert to number
        const numVal = parseFloat(val) || 0;

        // Update input field
        if (input) {
            input.value = numVal;
        }

        // Update display unit with current currency
        if (displayUnit) {
            const currency = window.getCurrentCurrency();
            displayUnit.textContent = currency;
        }

        // Update progress bar and thumb
        if (progress && thumb && slider) {
            // Calculate percentage based on slider max
            const sliderMax = parseFloat(slider.max) || 100000;

            // Use slider max for percentage calculation
            const percentage = Math.min((numVal / sliderMax) * 100, 100);

            progress.style.width = percentage + '%';
            thumb.style.left = percentage + '%';
        }

        // Ensure slider value is set correctly
        if (slider) {
            slider.value = Math.min(numVal, parseFloat(slider.max) || 100000);
        }
    };

    // Update display only (no validation) - called on input
    window.updateBudgetDisplay = function (val) {
        const slider = document.getElementById('monthly-budget-slider');
        const progress = document.getElementById('budget-progress');
        const thumb = document.getElementById('budget-thumb');
        const displayUnit = document.getElementById('budget-display-unit');

        // Allow empty input - don't validate during typing
        if (!val || val === '') {
            if (displayUnit) {
                displayUnit.textContent = window.getCurrentCurrency();
            }
            if (progress && thumb) {
                progress.style.width = '0%';
                thumb.style.left = '0%';
            }
            if (slider) {
                slider.value = 0;
            }
            return;
        }

        // Try to parse as number - extract digits only
        const cleaned = String(val).replace(/[^\d.]/g, '');
        const numVal = cleaned ? parseFloat(cleaned) : NaN;

        // Only update display if we have a valid number
        if (isNaN(numVal)) {
            return;
        }

        // Update display unit with current currency
        if (displayUnit) {
            displayUnit.textContent = window.getCurrentCurrency();
        }

        // Update slider and progress
        if (slider && progress && thumb) {
            let sliderMax = parseFloat(slider.max) || 100000;

            // If value exceeds current max, update slider max to accommodate it
            // This allows the slider to remain useful for large numbers
            if (numVal > sliderMax) {
                sliderMax = numVal;
                slider.max = sliderMax;
            }

            // Update slider value
            slider.value = numVal;

            // Calculate percentage
            const percentage = Math.min((numVal / sliderMax) * 100, 100);
            progress.style.width = percentage + '%';
            thumb.style.left = percentage + '%';
        }
    };

    // Validate input only on blur (when user leaves the field)
    window.validateBudgetInput = function (input) {
        const val = input.value;

        // Allow empty - will be validated on form submit
        if (!val || val.trim() === '') {
            return;
        }

        // Try to parse as number
        const cleaned = String(val).replace(/[^\d.]/g, '');
        let numVal = cleaned ? parseFloat(cleaned) : 0;

        // Validate minimum
        if (isNaN(numVal) || numVal < 100) {
            input.value = '100';
            window.showToast('Minimum büdcə 100 AZN-dir', 'error');
            // Update display after correction
            window.updateBudgetDisplay('100');
            return;
        }

        // Update input with formatted number
        input.value = numVal;

        // Update other UI elements
        window.updateBudgetDisplay(numVal);
    };

    // Keep old function for backward compatibility (used by slider)
    window.updateBudgetFromInput = function (val) {
        window.updateBudgetDisplay(val);
    };

    // Daily Limit Validation
    window.validateDailyLimit = function (input) {
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

    // Format on blur
    window.formatDailyLimit = function (input) {
        if (!input.value) return;
        const val = parseFloat(input.value);
        if (!isNaN(val)) {
            input.value = val.toFixed(2);
        }
    };

    // Form Validation before submit
    window.validateSettingsForm = function (form) {
        try {
            // Validate daily limit if provided
            const dailyLimitInput = document.getElementById('daily-budget-limit-input');
            if (dailyLimitInput && dailyLimitInput.value !== '' && dailyLimitInput.value !== null) {
                const dailyVal = parseFloat(dailyLimitInput.value);
                if (isNaN(dailyVal) || dailyVal < 0 || dailyVal > 1000) {
                    window.showToast('Gündəlik limit 0-1000 arasında olmalıdır', 'error');
                    return false;
                }
            }

            // Validate monthly budget input on form submit
            const monthlyBudgetInput = document.getElementById('monthly-budget-input');
            if (monthlyBudgetInput) {
                const val = String(monthlyBudgetInput.value).toLowerCase().trim();
                const isUnlimited = val === 'limitsiz' || val === 'unlimited' || val === '∞';

                // If empty, set to minimum
                if (!val || val === '') {
                    monthlyBudgetInput.value = '100';
                } else if (isUnlimited) {
                    // Set to 50000 for unlimited
                    monthlyBudgetInput.value = '50000';
                } else {
                    const budgetVal = parseFloat(monthlyBudgetInput.value);
                    if (isNaN(budgetVal) || budgetVal < 100) {
                        monthlyBudgetInput.value = '100';
                        window.showToast('Aylıq büdcə minimum 100 AZN olmalıdır', 'error');
                        return false;
                    }
                }
            }

            return true;
        } catch (e) {
            console.error('Validation error:', e);
            return true; // Allow submission if validation fails to avoid blocking
        }
    };

    // Toast Notification System with close button and swipe
    window.showToast = function (message, type = 'success') {
        const container = document.getElementById('toast-container');
        if (!container) {
            // Create container if it doesn't exist
            const newContainer = document.createElement('div');
            newContainer.id = 'toast-container';
            newContainer.className = 'fixed top-24 right-6 z-50 flex flex-col gap-2 pointer-events-none';
            document.body.appendChild(newContainer);
            container = newContainer;
        }

        const toast = document.createElement('div');

        const styles = type === 'success'
            ? 'bg-green-500/90 border-green-400/50 shadow-green-500/20'
            : type === 'error'
                ? 'bg-red-500/90 border-red-400/50 shadow-red-500/20'
                : 'bg-blue-500/90 border-blue-400/50 shadow-blue-500/20';

        const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';

        toast.className = `pointer-events-auto backdrop-blur-md text-white px-6 py-4 rounded-xl shadow-lg border flex items-center gap-3 transform transition-all duration-500 translate-x-full relative group ${styles}`;
        toast.innerHTML = `
            <span class="text-xl">${icon}</span>
            <span class="font-medium flex-1">${message}</span>
            <button onclick="this.closest('.toast-item').remove()" class="opacity-0 group-hover:opacity-100 transition-opacity ml-2 hover:bg-white/20 rounded-full p-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
        `;
        toast.classList.add('toast-item');

        container.appendChild(toast);

        // Animate in
        requestAnimationFrame(() => {
            toast.classList.remove('translate-x-full');
        });

        // Swipe to dismiss
        let startX = 0;
        let currentX = 0;
        let isDragging = false;

        toast.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            isDragging = true;
        });

        toast.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            currentX = e.touches[0].clientX;
            const diff = currentX - startX;
            if (diff > 0) {
                toast.style.transform = `translateX(${diff}px)`;
                toast.style.opacity = `${1 - Math.min(diff / 200, 1)}`;
            }
        });

        toast.addEventListener('touchend', () => {
            if (!isDragging) return;
            isDragging = false;
            const diff = currentX - startX;
            if (diff > 100) {
                // Swiped enough to dismiss
                toast.style.transform = 'translateX(400px)';
                toast.style.opacity = '0';
                setTimeout(() => toast.remove(), 300);
            } else {
                // Snap back
                toast.style.transform = '';
                toast.style.opacity = '';
            }
        });

        // Auto remove after 5 seconds (increased from 3)
        const autoRemoveTimeout = setTimeout(() => {
            toast.classList.add('translate-x-full', 'opacity-0');
            setTimeout(() => toast.remove(), 500);
        }, 5000);

        // Clear timeout if manually closed
        toast.querySelector('button')?.addEventListener('click', () => {
            clearTimeout(autoRemoveTimeout);
        });
    };

    // HTMX Request Validation - only for settings form
    document.body.addEventListener('htmx:configRequest', function (event) {
        if (event.detail && event.detail.target) {
            const form = event.detail.target;
            // Only validate settings form
            if (form && form.id === 'settings-form') {
                console.log('Validating settings form...');
                const isValid = window.validateSettingsForm(form);
                console.log('Validation result:', isValid);
                if (!isValid) {
                    console.log('Settings form validation failed - blocking request');
                    event.preventDefault();
                    event.stopPropagation();
                    return false;
                }
                console.log('Settings form validation passed - allowing request');
            }
        }
    });

    // Don't prevent default - let HTMX handle it naturally
    // The submit event handler is removed to avoid interfering with HTMX

    // HTMX Response Handling - only for settings form
    document.body.addEventListener('htmx:afterRequest', function (event) {
        if (event.detail && event.detail.target) {
            const form = event.detail.target;
            // Only handle settings form responses
            if (form && form.id === 'settings-form') {
                if (event.detail.successful) {
                    try {
                        const responseText = event.detail.xhr.responseText;
                        if (responseText) {
                            const response = JSON.parse(responseText);
                            if (response.success) {
                                window.showToast(response.message || 'Tənzimləmələr yadda saxlanıldı');
                                // Voice notification happens automatically via showToast override
                            } else {
                                window.showToast(response.error || 'Xəta baş verdi', 'error');
                            }
                        }
                    } catch (e) {
                        // JSON parse failed - likely non-JSON response, ignore
                        console.log('Non-JSON response received:', e);
                        // Still show success message if request was successful
                        if (event.detail.xhr.status === 200) {
                            window.showToast('Tənzimləmələr yadda saxlanıldı');
                        }
                    }
                } else {
                    const status = event.detail.xhr ? event.detail.xhr.status : 'unknown';
                    console.error('Settings save failed:', status, event.detail.xhr?.responseText);
                    window.showToast('Server xətası baş verdi', 'error');
                }
            }
        }
    });

    // Reset Demo Data
    window.resetDemoData = async function (event) {
        // Prevent page refresh
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

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
    window.applyPremiumThemeSettings = function (theme, event) {
        // Prevent page refresh if event is provided
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

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
    window.toggleIncognitoModeSettings = function (enabled, event) {
        // Prevent page refresh if event is provided
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

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

    // ========== CURRENCY CONVERSION HANDLERS ==========

    let pendingCurrencyChange = null;
    // Initialize currentCurrency from DOM or default
    let currentCurrency = 'AZN';

    // We need to wait for DOM to get the initial currency value
    document.addEventListener('DOMContentLoaded', () => {
        const selector = document.getElementById('currency-selector');
        if (selector) {
            currentCurrency = selector.getAttribute('data-current-currency') || 'AZN';
        }
    });

    window.handleCurrencyChange = async function (newCurrency) {
        const selector = document.getElementById('currency-selector');
        const oldCurrency = currentCurrency;

        // If same currency, do nothing
        if (oldCurrency === newCurrency) {
            return;
        }

        // Update currency display elements immediately (before confirmation)
        const currencySymbolMin = document.getElementById('currency-symbol-min');
        const budgetDisplayUnit = document.getElementById('budget-display-unit');
        if (currencySymbolMin) {
            currencySymbolMin.textContent = newCurrency;
        }
        if (budgetDisplayUnit) {
            budgetDisplayUnit.textContent = newCurrency;
        }

        // Get preview from server
        try {
            const formData = new FormData();
            formData.append('new_currency', newCurrency);
            formData.append('confirm', 'false');

            const response = await fetch('/api/update-currency', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.preview) {
                // Show preview modal
                pendingCurrencyChange = {
                    old: result.old_currency,
                    new: result.new_currency,
                    data: result.data
                };
                showCurrencyPreview(result);
            } else if (result.success) {
                // No conversion needed
                window.showToast(result.message, 'info');
            } else {
                window.showToast(result.error || 'Xəta baş verdi', 'error');
                // Reset selector to old value
                selector.value = oldCurrency;
            }
        } catch (error) {
            console.error('Currency preview error:', error);
            window.showToast('Xəta baş verdi', 'error');
            // Reset selector to old value
            selector.value = oldCurrency;
        }
    };

    window.showCurrencyPreview = function (previewResult) {
        const modal = document.getElementById('currency-confirm-modal');
        const content = document.getElementById('conversion-preview-content');

        const { old_currency, new_currency, data } = previewResult;

        // Build preview HTML with mobile-responsive design
        let html = `
            <div class="bg-gradient-to-r from-purple-500/15 to-pink-500/15 rounded-xl p-3 sm:p-4 border border-purple-500/30">
                <div class="flex items-center justify-center gap-2 sm:gap-4 text-base sm:text-lg font-bold">
                    <span class="text-purple-400">${old_currency}</span>
                    <svg class="w-5 h-5 sm:w-6 sm:h-6 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                    </svg>
                    <span class="text-pink-400">${new_currency}</span>
                </div>
                <p class="text-center text-white/60 text-xs sm:text-sm mt-1.5 sm:mt-2">
                    1 ${old_currency} = ${data.conversion_rate.rate.toFixed(4)} ${new_currency}
                </p>
            </div>
        `;

        // Monthly Budget
        html += `
            <div class="bg-white/5 rounded-lg p-3 sm:p-4 border border-white/10">
                <div class="flex items-center justify-between mb-1.5 sm:mb-2">
                    <span class="text-white/70 text-xs sm:text-sm">💰 Aylıq Büdcə</span>
                </div>
                <div class="flex items-center justify-between gap-2">
                    <span class="text-red-400 line-through text-xs sm:text-sm truncate">${data.monthly_budget.old.toFixed(2)} ${old_currency}</span>
                    <svg class="w-3 h-3 sm:w-4 sm:h-4 text-white/30 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                    <span class="text-green-400 font-bold text-sm sm:text-base truncate">${data.monthly_budget.new.toFixed(2)} ${new_currency}</span>
                </div>
            </div>
        `;

        // Daily Limit (if exists)
        if (data.daily_limit) {
            html += `
                <div class="bg-white/5 rounded-lg p-3 sm:p-4 border border-white/10">
                    <div class="flex items-center justify-between mb-1.5 sm:mb-2">
                        <span class="text-white/70 text-xs sm:text-sm">📅 Gündəlik Limit</span>
                    </div>
                    <div class="flex items-center justify-between gap-2">
                        <span class="text-red-400 line-through text-xs sm:text-sm truncate">${data.daily_limit.old.toFixed(2)} ${old_currency}</span>
                        <svg class="w-3 h-3 sm:w-4 sm:h-4 text-white/30 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                        </svg>
                        <span class="text-green-400 font-bold text-sm sm:text-base truncate">${data.daily_limit.new.toFixed(2)} ${new_currency}</span>
                    </div>
                </div>
            `;
        }

        // Dreams (if any)
        if (data.dreams && data.dreams.length > 0) {
            html += `
                <div class="bg-white/5 rounded-lg p-3 sm:p-4 border border-white/10">
                    <div class="flex items-center justify-between mb-2 sm:mb-3">
                        <span class="text-white/70 text-xs sm:text-sm">✨ Dream Vault</span>
                        <span class="text-white/50 text-xs">${data.dreams.length} ədəd</span>
                    </div>
            `;

            data.dreams.forEach(dream => {
                html += `
                    <div class="mb-2 last:mb-0">
                        <p class="text-white/80 text-xs sm:text-sm mb-1 truncate">${dream.title}</p>
                        <div class="flex items-center justify-between text-xs gap-2">
                            <span class="text-white/50">Hədəf:</span>
                            <div class="flex items-center gap-1.5 flex-shrink-0">
                                <span class="text-red-400 line-through">${dream.old_target.toFixed(0)}</span>
                                <span class="text-green-400 font-medium">${dream.new_target.toFixed(0)}</span>
                            </div>
                        </div>
                    </div>
                `;
            });

            html += `</div>`;
        }

        content.innerHTML = html;
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    };

    window.closeCurrencyModal = function (event) {
        // Prevent page refresh if event is provided
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        const modal = document.getElementById('currency-confirm-modal');
        const selector = document.getElementById('currency-selector');

        // Reset selector to current currency
        if (selector) {
            selector.value = currentCurrency;
        }

        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
        pendingCurrencyChange = null;
    };

    window.confirmCurrencyConversion = async function (event) {
        // Prevent page refresh if event is provided
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        if (!pendingCurrencyChange) {
            window.closeCurrencyModal();
            return;
        }

        const { new: newCurrency } = pendingCurrencyChange;

        try {
            const formData = new FormData();
            formData.append('new_currency', newCurrency);
            formData.append('confirm', 'true');

            const response = await fetch('/api/update-currency', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                window.showToast(result.message || 'Valyuta uğurla dəyişdirildi', 'success');
                currentCurrency = newCurrency;

                // Close modal
                window.closeCurrencyModal();

                // Reload page after 1 second to show new amounts
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            } else {
                window.showToast(result.error || 'Xəta baş verdi', 'error');
            }
        } catch (error) {
            console.error('Currency conversion error:', error);
            window.showToast('Xəta baş verdi', 'error');
        }
    };

    // Currency selector change handler
    window.updateCurrencyDisplay = function (currency) {
        // This function seems to be a placeholder or used elsewhere, keeping it for compatibility
        if (typeof window.updateCurrencyDisplay === 'function' && window.updateCurrencyDisplay !== window.updateCurrencyDisplay) {
            // Avoid recursion if it was defined externally
            window.updateCurrencyDisplay(currency);
        }
    };

    // Handle HTMX response for settings form
    window.handleSettingsResponse = function (event) {
        const response = event.detail.xhr;
        if (response.status === 200) {
            try {
                const data = JSON.parse(response.responseText);
                if (data.success) {
                    window.showToast(data.message || 'Tənzimləmələr yadda saxlanıldı', 'success');
                    // Trigger settings updated event for dashboard refresh
                    document.body.dispatchEvent(new CustomEvent('settingsUpdated'));
                } else {
                    window.showToast(data.error || 'Xəta baş verdi', 'error');
                }
            } catch (e) {
                // If response is not JSON, assume success
                window.showToast('Tənzimləmələr yadda saxlanıldı', 'success');
                document.body.dispatchEvent(new CustomEvent('settingsUpdated'));
            }
        } else {
            window.showToast('Xəta baş verdi', 'error');
        }
    };

    // Initialize on page load
    document.addEventListener('DOMContentLoaded', () => {
        // Toggle manual mode fields visibility based on persona mode selection
        const personaModeSelect = document.querySelector('select[name="ai_persona_mode"]');
        const manualModeFields = document.getElementById('manual-mode-fields');

        if (personaModeSelect && manualModeFields) {
            personaModeSelect.addEventListener('change', function () {
                if (this.value === 'Manual') {
                    manualModeFields.style.display = 'grid';
                } else {
                    manualModeFields.style.display = 'none';
                }
            });
        }


        // Initialize budget display
        const budgetInput = document.getElementById('monthly-budget-input');
        if (budgetInput) {
            const currentValue = budgetInput.value;
            if (currentValue) {
                updateBudgetDisplay(currentValue);
            }
        }

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

