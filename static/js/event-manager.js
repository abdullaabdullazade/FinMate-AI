/**
 * Centralized Event Manager
 * Prevents page refresh, manages all click events, and coordinates with audio system
 */

(function () {
    'use strict';

    console.log('✅ Event Manager initialized');

    // ==================== PREVENT PAGE REFRESH ====================

    /**
     * Prevent default form submission and handle with HTMX
     */
    function preventFormRefresh(event) {
        const form = event.target.closest('form');
        if (!form) return;

        // If form has hx-post, hx-get, etc., prevent default
        if (form.hasAttribute('hx-post') || 
            form.hasAttribute('hx-get') || 
            form.hasAttribute('hx-put') || 
            form.hasAttribute('hx-delete')) {
            event.preventDefault();
            return false;
        }

        // If form has onsubmit that returns false, respect it
        const onsubmit = form.getAttribute('onsubmit');
        if (onsubmit && onsubmit.includes('return false')) {
            event.preventDefault();
            return false;
        }
    }

    /**
     * Prevent button clicks from causing refresh
     */
    function preventButtonRefresh(event) {
        const button = event.target.closest('button');
        if (!button) return;

        // If button is inside a form and is type="submit", prevent default
        const form = button.closest('form');
        if (form && button.type === 'submit') {
            // Only prevent if form has HTMX attributes
            if (form.hasAttribute('hx-post') || 
                form.hasAttribute('hx-get') || 
                form.hasAttribute('hx-put') || 
                form.hasAttribute('hx-delete')) {
                event.preventDefault();
                // Trigger form submission via HTMX
                if (typeof htmx !== 'undefined') {
                    htmx.trigger(form, 'submit');
                }
                return false;
            }
        }

        // If button has onclick that should prevent default
        const onclick = button.getAttribute('onclick');
        if (onclick && !onclick.includes('return true')) {
            // Don't prevent if explicitly returning true
            if (!onclick.includes('return true')) {
                event.preventDefault();
            }
        }
    }

    /**
     * Convert onclick attributes to event listeners
     */
    function convertOnclickToListeners() {
        // Find all elements with onclick attributes
        const elements = document.querySelectorAll('[onclick]');
        
        elements.forEach(element => {
            const onclick = element.getAttribute('onclick');
            if (!onclick) return;

            // Remove onclick attribute
            element.removeAttribute('onclick');

            // Add event listener
            element.addEventListener('click', function(event) {
                // Prevent default refresh
                event.preventDefault();
                event.stopPropagation();

                // Execute the original onclick code
                try {
                    // Create a function from the onclick string
                    const func = new Function('event', onclick);
                    const result = func.call(element, event);
                    
                    // If function returns false, prevent default
                    if (result === false) {
                        event.preventDefault();
                    }
                } catch (e) {
                    console.error('Error executing onclick:', e);
                }
            });
        });
    }

    // ==================== MODAL AUDIO TRIGGER ====================

    /**
     * Trigger audio when modal opens
     * Intelligently reads modal content and provides voice instructions
     */
    function triggerModalAudio(modal, retryCount = 0) {
        // Check if voice mode is enabled
        const voiceMode = localStorage.getItem('voice-mode');
        if (voiceMode !== 'enabled') return;
        
        // Skip audio for voice-modal (recording interface)
        const modalId = modal.id;
        if (modalId === 'voice-modal') {
            console.log('🔇 Skipping audio for voice-modal (recording interface)');
            return;
        }
        
        // Retry mechanism - if content not loaded, try again after delay
        const MAX_RETRIES = 3;
        const RETRY_DELAY = 200;

        // Get modal-specific audio configuration
        const audioText = modal.getAttribute('data-audio-text');
        const audioFile = modal.getAttribute('data-audio-file');

        if (audioText) {
            // Use custom audio text
            if (typeof window.queueVoiceNotification === 'function') {
                window.queueVoiceNotification(audioText, 0, 'az');
            }
            return;
        }

        if (audioFile) {
            // Load and play audio file
            fetch(audioFile)
                .then(res => res.blob())
                .then(blob => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        const base64 = reader.result.split(',')[1];
                        if (window.AudioManager) {
                            window.AudioManager.play(base64, 0);
                        }
                    };
                    reader.readAsDataURL(blob);
                })
                .catch(err => console.error('Audio file load error:', err));
            return;
        }

        // Intelligent modal content reading
        let audioMessage = '';

        // Get modal title
        const title = modal.querySelector('h1, h2, h3, .modal-title, [id*="modal-title"], [class*="title"]');
        const titleText = title ? title.textContent.trim() : '';

        // Get modal description/question
        const description = modal.querySelector('[id*="modal-description"], [class*="description"], p');
        const descriptionText = description ? description.textContent.trim() : '';

        // Get buttons to describe actions
        const buttons = modal.querySelectorAll('button, [role="button"]');
        const buttonTexts = [];
        buttons.forEach(btn => {
            const btnText = btn.textContent.trim();
            if (btnText && btnText.length < 50) { // Skip very long button texts
                // Clean button text
                const cleanText = btnText
                    .replace(/[✓✅❌⚠️🔥⚡💰🎉👍🛒🔒]/g, '') // Remove emojis
                    .replace(/\s+/g, ' ')
                    .trim();
                if (cleanText) {
                    buttonTexts.push(cleanText);
                }
            }
        });

        // Build intelligent audio message based on modal type
        // Special handling for voice confirmation modal
        if (modalId === 'voice-confirmation') {
            // Voice confirmation modal - read instructions
            audioMessage = 'Səsi yoxlayın. Düz başa düşdümsə, davam edin.';
            
            // Get button instructions
            const confirmBtn = buttonTexts.find(t => 
                t.includes('Düzdür') || 
                t.includes('Saxla') || 
                t.includes('Təsdiq')
            );
            const cancelBtn = buttonTexts.find(t => 
                t.includes('Yenidən') || 
                t.includes('Ləğv') || 
                t.includes('İmtina')
            );
            
            if (confirmBtn && cancelBtn) {
                const cleanConfirm = confirmBtn.replace(/[✓✅]/g, '').trim();
                const cleanCancel = cancelBtn.replace(/[←]/g, '').trim();
                audioMessage += ` Əgər düz başa düşdümsə, ${cleanConfirm} düyməsinə basın. Əgər yenidən cəhd etmək istəyirsinizsə, ${cleanCancel} düyməsinə basın.`;
            }
        } else if (modalId === 'claim-modal' || modalId.includes('claim')) {
            // Reward claim modal - special handling
            const rewardName = titleText || 'Hədiyyə';
            
            // Clean reward name (remove emojis)
            const cleanRewardName = rewardName.replace(/[🥉🥈🥇💎🎁]/g, '').trim();
            
            // Get cost from modal
            const costElement = modal.querySelector('[id*="modal-cost"], [id*="cost"]');
            let costValue = '';
            if (costElement) {
                const costText = costElement.textContent.trim();
                // Extract number from cost text (e.g., "-🪙 100" -> "100")
                const costMatch = costText.match(/\d+/);
                if (costMatch) {
                    costValue = costMatch[0];
                }
            }
            
            // Get remaining coins
            const remainingElement = modal.querySelector('[id*="modal-remaining"], [id*="remaining"]');
            let remainingValue = '';
            if (remainingElement) {
                const remainingText = remainingElement.textContent.trim();
                const remainingMatch = remainingText.match(/\d+/);
                if (remainingMatch) {
                    remainingValue = remainingMatch[0];
                }
            }
            
            // Build natural audio message
            if (cleanRewardName.toLowerCase().includes('kupon') || cleanRewardName.toLowerCase().includes('coffee')) {
                audioMessage = `${cleanRewardName}. Bu kuponu almaq istəyirsiniz?`;
            } else {
                audioMessage = `${cleanRewardName}. Bu hədiyyəni almaq istəyirsiniz?`;
            }
            
            if (costValue) {
                audioMessage += ` Qiymət ${costValue} coin.`;
            }
            
            if (remainingValue) {
                audioMessage += ` Qalacaq ${remainingValue} coin.`;
            }
            
            // Add clear button instructions - use natural language
            const confirmBtn = buttonTexts.find(t => 
                t.includes('Təsdiq') || 
                t.includes('Bəli') || 
                t.includes('Al') ||
                t.includes('Təsdiq Et')
            );
            const cancelBtn = buttonTexts.find(t => 
                t.includes('İmtina') || 
                t.includes('Xeyr') || 
                t.includes('Ləğv')
            );
            
            if (confirmBtn && cancelBtn) {
                // Clean button texts
                const cleanConfirm = confirmBtn.replace(/[✓✅]/g, '').trim();
                const cleanCancel = cancelBtn.replace(/[❌]/g, '').trim();
                audioMessage += ` Əgər almaq istəyirsinizsə, ${cleanConfirm} düyməsinə basın. Əgər almaq istəmirsinizsə, ${cleanCancel} düyməsinə basın.`;
            } else if (buttonTexts.length >= 2) {
                // Fallback: use first two buttons
                const cleanBtn1 = buttonTexts[0].replace(/[✓✅❌]/g, '').trim();
                const cleanBtn2 = buttonTexts[1].replace(/[✓✅❌]/g, '').trim();
                audioMessage += ` Əgər almaq istəyirsinizsə, ${cleanBtn1} düyməsinə basın. Əgər almaq istəmirsinizsə, ${cleanBtn2} düyməsinə basın.`;
            } else if (buttonTexts.length > 0) {
                // If only one button found, still provide instruction
                const cleanBtn = buttonTexts[0].replace(/[✓✅❌]/g, '').trim();
                audioMessage += ` Düymə: ${cleanBtn}.`;
            }
        } else if (modalId.includes('confirm') || modalId.includes('delete') || modalId.includes('fraud')) {
            // Confirmation modals
            audioMessage = titleText || descriptionText || 'Təsdiq edirsiniz?';
            
            if (buttonTexts.length >= 2) {
                const confirmBtn = buttonTexts.find(t => t.includes('Təsdiq') || t.includes('Bəli') || t.includes('Bəli'));
                const cancelBtn = buttonTexts.find(t => t.includes('İmtina') || t.includes('Xeyr') || t.includes('Ləğv'));
                
                if (confirmBtn && cancelBtn) {
                    audioMessage += ` Əgər bəli istəyirsinizsə, ${confirmBtn} düyməsinə basın. Əgər xeyr istəyirsinizsə, ${cancelBtn} düyməsinə basın.`;
                } else if (buttonTexts.length === 2) {
                    audioMessage += ` Əgər bəli istəyirsinizsə, ${buttonTexts[0]} düyməsinə basın. Əgər xeyr istəyirsinizsə, ${buttonTexts[1]} düyməsinə basın.`;
                }
            }
        } else {
            // Generic modal
            if (titleText) {
                audioMessage = titleText;
                if (descriptionText && descriptionText !== titleText) {
                    audioMessage += '. ' + descriptionText;
                }
            } else if (descriptionText) {
                audioMessage = descriptionText;
            }
            
            // Add button instructions if available
            if (buttonTexts.length > 0 && buttonTexts.length <= 3) {
                audioMessage += ' Düymələr: ' + buttonTexts.join(', ') + '.';
            }
        }

        // Clean and send audio message
        if (audioMessage && audioMessage.trim().length > 0) {
            // Clean message
            const cleanMessage = audioMessage
                .replace(/[✓✅❌⚠️🔥⚡💰🎉👍🛒🔒🪙]/g, '') // Remove emojis
                .replace(/\s+/g, ' ') // Normalize whitespace
                .trim();
            
            if (cleanMessage && typeof window.queueVoiceNotification === 'function') {
                console.log('🔊 Modal audio:', cleanMessage);
                window.queueVoiceNotification(cleanMessage, 0, 'az'); // High priority for modals
            }
        } else if (retryCount < MAX_RETRIES) {
            // If no message generated and we haven't exceeded retries, try again
            console.log(`🔄 Retrying modal audio (${retryCount + 1}/${MAX_RETRIES})...`);
            setTimeout(() => {
                triggerModalAudio(modal, retryCount + 1);
            }, RETRY_DELAY);
        } else {
            // Fallback: just read title if available
            const title = modal.querySelector('h1, h2, h3, .modal-title, [id*="modal-title"], [class*="title"]');
            if (title) {
                const titleText = title.textContent.trim().replace(/[✓✅❌⚠️🔥⚡💰🎉👍🛒🔒🪙]/g, '').trim();
                if (titleText && typeof window.queueVoiceNotification === 'function') {
                    window.queueVoiceNotification(titleText, 0, 'az');
                }
            }
        }
    }

    /**
     * Observe modal open/close events
     */
    function observeModals() {
        let modalObserver = null;
        let bodyObserver = null;

        // Watch for modal class changes
        modalObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const target = mutation.target;
                    
                    // Check if it's a modal (more comprehensive check)
                    const isModal = (
                        target.id && (
                            target.id.includes('modal') || 
                            target.id.includes('Modal') ||
                            target.id.includes('confirm') ||
                            target.id.includes('premium')
                        )
                    ) || (
                        target.classList.contains('modal') ||
                        (target.classList.contains('fixed') && target.classList.contains('inset-0') && 
                         target.classList.contains('z-'))
                    );
                    
                    if (isModal) {
                        // Check if modal was opened (hidden class removed)
                        const wasHidden = mutation.oldValue && mutation.oldValue.includes('hidden');
                        const isHidden = target.classList.contains('hidden');
                        
                        if (wasHidden && !isHidden) {
                            // Modal opened - trigger audio after a delay to ensure content is loaded
                            setTimeout(() => {
                                triggerModalAudio(target);
                            }, 300); // Increased delay for content to fully render
                        }
                    }
                }
            });
        });

        // Observe all elements that might be modals
        function observeExistingModals() {
            document.querySelectorAll('[id*="modal"], [id*="Modal"], [id*="confirm"], [class*="modal"]').forEach(modal => {
                modalObserver.observe(modal, {
                    attributes: true,
                    attributeOldValue: true,
                    attributeFilter: ['class']
                });
            });
        }

        observeExistingModals();

        // Also observe dynamically added modals
        bodyObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) { // Element node
                        const isModal = (
                            node.id && (
                                node.id.includes('modal') || 
                                node.id.includes('Modal') ||
                                node.id.includes('confirm') ||
                                node.id === 'voice-confirmation' ||
                                node.id === 'claim-modal'
                            )
                        ) || (
                            node.classList && (
                                node.classList.contains('modal') ||
                                (node.classList.contains('fixed') && node.classList.contains('inset-0'))
                            )
                        );
                        
                        if (isModal) {
                            // Observe for class changes
                            modalObserver.observe(node, {
                                attributes: true,
                                attributeOldValue: true,
                                attributeFilter: ['class']
                            });
                            
                            // If modal is already visible (no hidden class), trigger audio immediately
                            if (!node.classList.contains('hidden') && node.id !== 'voice-modal') {
                                setTimeout(() => {
                                    triggerModalAudio(node);
                                }, 300);
                            }
                        }
                    }
                });
            });
        });

        bodyObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // ==================== INITIALIZATION ====================

    /**
     * Initialize event manager
     */
    function init() {
        // Prevent form refresh
        document.addEventListener('submit', preventFormRefresh, true);
        
        // Prevent button refresh
        document.addEventListener('click', preventButtonRefresh, true);

        // Convert onclick to event listeners (defer to avoid conflicts)
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(convertOnclickToListeners, 100);
            });
        } else {
            setTimeout(convertOnclickToListeners, 100);
        }

        // Observe modals for audio triggers
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', observeModals);
        } else {
            observeModals();
        }

        // Re-initialize on HTMX swaps (for dynamic content)
        if (typeof htmx !== 'undefined') {
            document.body.addEventListener('htmx:afterSwap', () => {
                setTimeout(() => {
                    convertOnclickToListeners();
                    observeModals();
                }, 100);
            });
        }
    }

    // Initialize
    init();

    // Export API
    window.EventManager = {
        preventRefresh: preventFormRefresh,
        triggerModalAudio: triggerModalAudio
    };

})();

