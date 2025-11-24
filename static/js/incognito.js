// Incognito Mode Management
(function () {
    'use strict';

    // Debounce helper
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Throttle helper
    function throttle(func, limit) {
        let inThrottle;
        return function (...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // Cache for processed elements
    let processedCache = new WeakSet();

    // Optimized hide amount function
    function hideAmountInElement(el) {
        if (!el || processedCache.has(el) || el.closest('.incognito-ignore')) {
            return;
        }

        // Quick check for premium sections
        if (el.closest('[class*="premium"], [id*="premium"], [class*="upgrade"], [id*="upgrade"]')) {
            return;
        }

        const text = el.textContent || el.innerText || '';
        if (!text || text.includes('4.99') || text.includes('Premium')) return;

        const numberPattern = /[\d,]+\.?\d*/g;
        if (numberPattern.test(text)) {
            // Always save original value, even if already hidden
            const currentOriginal = el.getAttribute('data-original');
            if (!currentOriginal || currentOriginal === '****' || currentOriginal.includes('****')) {
                // Only update if we don't have a valid original
                el.setAttribute('data-original', text);
            }
            el.textContent = text.replace(numberPattern, '****');
            el.classList.add('incognito-hidden');
            processedCache.add(el);
        }
    }

    // Optimized hide all amounts function
    window.hideAllAmounts = function () {
        // Use requestAnimationFrame for smooth performance
        requestAnimationFrame(() => {
            // Hide dashboard stats by ID (FIRST) - most important
            const statsIds = ['stat-total', 'stat-budget', 'stat-remaining', 'projected-balance', 'monthly-savings'];
            statsIds.forEach(id => {
                const el = document.getElementById(id);
                if (el && !processedCache.has(el)) {
                    // Get original value from data-initial or data-value first, then from text
                    const dataInitial = el.getAttribute('data-initial');
                    const dataValue = el.getAttribute('data-value');
                    const text = el.textContent || el.innerText || '';

                    // Determine original value
                    let original = el.getAttribute('data-original');
                    if (!original || original === '****' || original.includes('****')) {
                        if (dataInitial && dataInitial !== '****' && !dataInitial.includes('****')) {
                            original = dataInitial;
                        } else if (dataValue) {
                            const value = parseFloat(dataValue);
                            if (!isNaN(value)) {
                                original = value.toFixed(2) + ' AZN';
                            } else {
                                original = text;
                            }
                        } else if (text && text.match(/[\d,]+\.?\d*/) && text !== '****' && !text.includes('****')) {
                            original = text;
                        } else {
                            original = text; // Fallback
                        }
                    }

                    if (original && original !== '****' && !original.includes('****') && original.match(/[\d,]+\.?\d*/)) {
                        el.setAttribute('data-original', original);
                        el.textContent = original.replace(/[\d,]+\.?\d*/g, '****');
                        el.classList.add('incognito-processed');
                        processedCache.add(el);
                    }
                }
            });

            // Hide elements with incognito-hidden class (batch process)
            const hiddenElements = document.querySelectorAll('.incognito-hidden:not(.incognito-processed)');
            hiddenElements.forEach(el => {
                const text = el.textContent || el.innerText || '';
                if (text && text.match(/[\d,]+\.?\d*/)) {
                    const original = el.getAttribute('data-original') || text;
                    el.setAttribute('data-original', original);
                    el.textContent = text.replace(/[\d,]+\.?\d*/g, '****');
                    el.classList.add('incognito-processed');
                    processedCache.add(el);
                }
            });

            // Hide transaction amounts (only visible ones)
            const transactionElements = document.querySelectorAll('[id^="expense-"]:not(.incognito-processed) span, [id^="expense-"]:not(.incognito-processed) p, .transaction-row:not(.incognito-processed) span, .transaction-row:not(.incognito-processed) p');
            transactionElements.forEach(hideAmountInElement);

            // Hide Eco Impact
            const ecoLeaf = document.querySelector('.eco-leaf');
            if (ecoLeaf) {
                const ecoImpact = ecoLeaf.nextElementSibling;
                if (ecoImpact && !processedCache.has(ecoImpact)) {
                    hideAmountInElement(ecoImpact);
                }
            }

            // Hide amounts in alert panel (only if visible)
            const alertPanel = document.getElementById('alert-panel');
            if (alertPanel && !alertPanel.classList.contains('hidden')) {
                alertPanel.querySelectorAll('div:not(.text-amber-500):not(.text-purple-500):not(.text-blue-500), li, span:not(.text-amber-500):not(.text-purple-500):not(.text-blue-500), p').forEach(el => {
                    if (!processedCache.has(el)) {
                        const text = el.textContent || el.innerText || '';
                        if (text && text.match(/[\d,]+\.?\d*/) && !text.includes('Premium') && !text.includes('4.99')) {
                            const original = el.getAttribute('data-original') || text;
                            el.setAttribute('data-original', original);
                            el.textContent = text.replace(/[\d,]+\.?\d*/g, '****');
                            processedCache.add(el);
                        }
                    }
                });
            }
        });
    };

    // Show all amounts function
    window.showAllAmounts = function () {
        // Restore dashboard stats FIRST - get original values from data attributes
        ['stat-total', 'stat-budget', 'stat-remaining', 'projected-balance', 'monthly-savings'].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                // Priority: data-initial > data-value > data-original
                let restoreValue = null;

                const dataInitial = el.getAttribute('data-initial');
                const dataValue = el.getAttribute('data-value');

                if (dataInitial && dataInitial !== '****' && !dataInitial.includes('****') && dataInitial.match(/[\d,]+\.?\d*/)) {
                    // Remove "AZN" if present (since AZN is in separate span for stat elements)
                    if (id === 'stat-total' || id === 'stat-budget' || id === 'stat-remaining') {
                        restoreValue = dataInitial.replace(/\s*AZN\s*/gi, '').trim();
                    } else {
                        restoreValue = dataInitial;
                    }
                } else if (dataValue) {
                    const value = parseFloat(dataValue);
                    if (!isNaN(value)) {
                        if (id.includes('progress') || id.includes('percentage')) {
                            restoreValue = value.toFixed(1) + '%';
                        } else if (id === 'stat-total' || id === 'stat-budget' || id === 'stat-remaining') {
                            restoreValue = value.toFixed(2); // No AZN for stat elements
                        } else {
                            restoreValue = value.toFixed(2) + ' AZN';
                        }
                    }
                } else {
                    const original = el.getAttribute('data-original');
                    if (original && original !== '****' && !original.includes('****') && original.match(/[\d,]+\.?\d*/)) {
                        if (id === 'stat-total' || id === 'stat-budget' || id === 'stat-remaining') {
                            restoreValue = original.replace(/\s*AZN\s*/gi, '').trim();
                        } else {
                            restoreValue = original;
                        }
                    }
                }

                if (restoreValue) {
                    el.textContent = restoreValue;
                    el.removeAttribute('data-original');
                    el.classList.remove('incognito-processed', 'incognito-hidden');
                    el.style.display = '';
                    el.style.visibility = 'visible';
                    el.style.opacity = '1';
                    processedCache.delete(el);
                    // Force reflow
                    void el.offsetHeight;
                }
            }
        });

        requestAnimationFrame(() => {
            // Clear cache after restoring stats
            processedCache = new WeakSet();

            // Restore all hidden elements
            document.querySelectorAll('.incognito-hidden').forEach(el => {
                const original = el.getAttribute('data-original');
                if (original && original !== '****' && !original.includes('****')) {
                    el.textContent = original;
                    el.removeAttribute('data-original');
                    el.classList.remove('incognito-processed', 'incognito-hidden');
                }
            });
        });
    };

    // Toggle incognito mode
    window.toggleIncognitoMode = function (enabled) {
        const alertCounter = document.getElementById('alert-counter');

        if (enabled) {
            document.body.classList.add('incognito-mode');
            localStorage.setItem('incognito-mode', 'enabled');
            if (alertCounter) {
                alertCounter.style.display = 'none';
            }
            // Use requestAnimationFrame for smooth transition
            requestAnimationFrame(() => {
                if (window.hideAllAmounts) {
                    window.hideAllAmounts();
                }
            });
            updateEyeIcons(true);
        } else {
            document.body.classList.remove('incognito-mode');
            localStorage.removeItem('incognito-mode');
            if (alertCounter) {
                alertCounter.style.display = 'block';
            }
            updateEyeIcons(false);

            // Immediately restore dashboard stats from data attributes - FORCE RESTORE
            const statIds = ['stat-total', 'stat-budget', 'stat-remaining'];
            statIds.forEach(id => {
                const el = document.getElementById(id);
                if (el) {
                    // Try data-initial first, then data-value
                    let restoreValue = null;
                    const dataInitial = el.getAttribute('data-initial');
                    const dataValue = el.getAttribute('data-value');

                    // Force restore from data attributes
                    if (dataInitial && dataInitial !== '****' && !dataInitial.includes('****')) {
                        // Remove "AZN" from data-initial if present (since AZN is in separate span)
                        restoreValue = dataInitial.replace(/\s*AZN\s*/gi, '').trim();
                    } else if (dataValue) {
                        const value = parseFloat(dataValue);
                        if (!isNaN(value)) {
                            restoreValue = value.toFixed(2);
                        }
                    }

                    if (restoreValue) {
                        // Force set text content
                        el.textContent = restoreValue;
                        el.innerText = restoreValue;
                        el.removeAttribute('data-original');
                        el.classList.remove('incognito-processed', 'incognito-hidden');
                        // Force update to ensure visibility
                        el.style.display = '';
                        el.style.visibility = 'visible';
                        el.style.opacity = '1';
                        el.style.color = ''; // Reset color
                        // Force reflow multiple times
                        void el.offsetHeight;
                        requestAnimationFrame(() => {
                            void el.offsetHeight;
                        });
                    }
                }
            });

            // Show all amounts immediately
            if (window.showAllAmounts) {
                window.showAllAmounts();
            }

            // Force show all amounts again after a short delay
            setTimeout(() => {
                if (window.showAllAmounts) {
                    window.showAllAmounts();
                }
            }, 100);

            // Restart counters when incognito mode is disabled
            setTimeout(() => {
                // Trigger counter restart event
                document.body.dispatchEvent(new CustomEvent('incognitoDisabled'));

                // Dashboard counters
                if (typeof window.restartDashboardCounters === 'function') {
                    window.restartDashboardCounters();
                }

                // Dream Vault counters
                if (typeof window.restartDreamVaultCounters === 'function') {
                    window.restartDreamVaultCounters();
                }

                // Final restore after counters
                setTimeout(() => {
                    if (window.showAllAmounts) {
                        window.showAllAmounts();
                    }
                }, 500);
            }, 200);
        }
    };

    // Update eye icons
    function updateEyeIcons(isHidden) {
        const eyeIcons = document.querySelectorAll('#eye-icon, #eye-icon-update');
        eyeIcons.forEach(icon => {
            if (isHidden) {
                icon.innerHTML = `
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
                `;
            } else {
                icon.innerHTML = `
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                `;
            }
        });
    }

    // Quick toggle function - always works, even if incognito mode is enabled globally
    window.toggleIncognitoQuick = function () {
        try {
            const isCurrentlyIncognito = document.body.classList.contains('incognito-mode') ||
                localStorage.getItem('incognito-mode') === 'enabled';

            // Add visual feedback - scale animation on toggle button
            const toggleBtn = document.getElementById('incognito-toggle-btn');
            if (toggleBtn) {
                toggleBtn.style.transform = 'scale(0.9)';
                setTimeout(() => {
                    toggleBtn.style.transform = 'scale(1)';
                }, 150);
            }

            // Debug logging
            console.log('Toggling incognito mode. Current state:', isCurrentlyIncognito ? 'hidden' : 'visible');

            if (typeof window.toggleIncognitoMode === 'function') {
                window.toggleIncognitoMode(!isCurrentlyIncognito);
            } else {
                // Fallback: manually toggle
                if (isCurrentlyIncognito) {
                    document.body.classList.remove('incognito-mode');
                    localStorage.removeItem('incognito-mode');
                    updateEyeIcons(false);
                    if (window.showAllAmounts) {
                        window.showAllAmounts();
                    }
                    // Restore stats immediately
                    ['stat-total', 'stat-budget', 'stat-remaining'].forEach(id => {
                        const el = document.getElementById(id);
                        if (el) {
                            const dataInitial = el.getAttribute('data-initial');
                            const dataValue = el.getAttribute('data-value');
                            let restoreValue = null;

                            if (dataInitial && dataInitial !== '****' && !dataInitial.includes('****')) {
                                restoreValue = dataInitial.replace(/\s*AZN\s*/gi, '').trim();
                            } else if (dataValue) {
                                const value = parseFloat(dataValue);
                                if (!isNaN(value)) {
                                    restoreValue = value.toFixed(2);
                                }
                            }

                            if (restoreValue) {
                                el.textContent = restoreValue;
                                el.classList.remove('incognito-processed', 'incognito-hidden');
                            }
                        }
                    });
                } else {
                    document.body.classList.add('incognito-mode');
                    localStorage.setItem('incognito-mode', 'enabled');
                    updateEyeIcons(true);
                    if (window.hideAllAmounts) {
                        window.hideAllAmounts();
                    }
                }
            }

            // Show toast notification for user feedback
            if (typeof window.showToast === 'function') {
                const message = isCurrentlyIncognito ? 'Məbləğlər göstərilir 👁️' : 'Məbləğlər gizlədildi 👁️‍🗨️';
                window.showToast(message, 'info');
            }

            console.log('Incognito mode toggled. New state:', !isCurrentlyIncognito ? 'hidden' : 'visible');
        } catch (error) {
            console.error('Error in toggleIncognitoQuick:', error);
        }
    };

    // Initialize on load
    document.addEventListener('DOMContentLoaded', () => {
        const isIncognitoEnabled = localStorage.getItem('incognito-mode') === 'enabled';
        const alertCounter = document.getElementById('alert-counter');

        if (isIncognitoEnabled) {
            document.body.classList.add('incognito-mode');
            if (alertCounter) {
                alertCounter.style.display = 'none';
            }
            if (window.hideAllAmounts) {
                window.hideAllAmounts();
                setTimeout(() => {
                    window.hideAllAmounts();
                    updateEyeIcons(true);
                }, 500);
            }
        } else {
            if (alertCounter) {
                alertCounter.style.display = 'block';
            }
        }

        // Watch for dynamically added content (with debounce for performance)
        if (isIncognitoEnabled) {
            const debouncedHide = debounce(() => {
                if (document.body.classList.contains('incognito-mode') && window.hideAllAmounts) {
                    requestAnimationFrame(window.hideAllAmounts);
                }
            }, 150);

            const observer = new MutationObserver((mutations) => {
                // Only process if there are actual changes
                const hasRelevantChanges = mutations.some(mutation =>
                    mutation.addedNodes.length > 0 ||
                    (mutation.type === 'childList' && mutation.target.querySelector && mutation.target.querySelector('[id^="expense-"], .transaction-row, .incognito-hidden'))
                );

                if (hasRelevantChanges) {
                    debouncedHide();
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });

            // Store observer for cleanup
            window._incognitoObserver = observer;
        }
    });
})();

