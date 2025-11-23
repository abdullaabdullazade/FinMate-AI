// Incognito Mode Management
(function() {
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
        return function(...args) {
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
            const original = el.getAttribute('data-original') || text;
            el.setAttribute('data-original', original);
            el.textContent = text.replace(numberPattern, '****');
            el.classList.add('incognito-hidden');
            processedCache.add(el);
        }
    }
    
    // Optimized hide all amounts function
    window.hideAllAmounts = function() {
        // Use requestAnimationFrame for smooth performance
        requestAnimationFrame(() => {
            // Hide dashboard stats by ID (FIRST) - most important
            const statsIds = ['stat-total', 'stat-budget', 'stat-remaining', 'projected-balance', 'monthly-savings'];
            statsIds.forEach(id => {
                const el = document.getElementById(id);
                if (el && !processedCache.has(el)) {
                    const text = el.textContent || el.innerText || '';
                    if (text && text.match(/[\d,]+\.?\d*/)) {
                        const original = el.getAttribute('data-original') || text;
                        el.setAttribute('data-original', original);
                        el.textContent = text.replace(/[\d,]+\.?\d*/g, '****');
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
    window.showAllAmounts = function() {
        requestAnimationFrame(() => {
            // Clear cache
            processedCache = new WeakSet();
            
            // Restore dashboard stats
            ['stat-total', 'stat-budget', 'stat-remaining', 'projected-balance', 'monthly-savings'].forEach(id => {
                const el = document.getElementById(id);
                if (el) {
                    const original = el.getAttribute('data-original');
                    if (original) {
                        el.textContent = original;
                        el.removeAttribute('data-original');
                        el.classList.remove('incognito-processed');
                    }
                }
            });
            
            // Restore all hidden elements
            document.querySelectorAll('.incognito-hidden').forEach(el => {
                const original = el.getAttribute('data-original');
                if (original) {
                    el.textContent = original;
                    el.removeAttribute('data-original');
                    el.classList.remove('incognito-processed');
                }
            });
        });
    };
    
    // Toggle incognito mode
    window.toggleIncognitoMode = function(enabled) {
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
            if (window.showAllAmounts) {
                window.showAllAmounts();
            }
            updateEyeIcons(false);
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
    
    // Quick toggle function
    window.toggleIncognitoQuick = function() {
        const isCurrentlyIncognito = document.body.classList.contains('incognito-mode');
        window.toggleIncognitoMode(!isCurrentlyIncognito);
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

