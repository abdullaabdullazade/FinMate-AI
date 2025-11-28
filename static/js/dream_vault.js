// Dream Vault JavaScript

function getTodayDateString() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function openAddDreamModal() {
    // Check limit (max 5 active dreams)
    const dreamsList = document.getElementById('dreams-list');
    const dreamCards = dreamsList ? dreamsList.querySelectorAll('.dream-card') : [];

    if (dreamCards.length >= 5) {
        if (typeof window.showToast === 'function') {
            window.showToast('⚠️ Maksimum 5 arzu yarada bilərsiniz!', 'warning');
        } else {
            alert('Maksimum 5 arzu yarada bilərsiniz!');
        }
        return;
    }

    const modal = document.getElementById('add-dream-modal');

    // Set min date to today
    const dateInput = modal.querySelector('input[name="target_date"]');
    if (dateInput) {
        dateInput.min = getTodayDateString();
    }

    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        document.getElementById('add-dream-modal-content').classList.remove('scale-95');
        document.getElementById('add-dream-modal-content').classList.add('scale-100');
    }, 10);
}

function closeAddDreamModal() {
    const modal = document.getElementById('add-dream-modal');
    modal.classList.add('opacity-0');
    document.getElementById('add-dream-modal-content').classList.add('scale-95');
    document.getElementById('add-dream-modal-content').classList.remove('scale-100');
    setTimeout(() => {
        modal.classList.add('hidden');
        // Reset form
        const form = modal.querySelector('form');
        if (form) form.reset();
    }, 300);
}

function handleDreamSubmit(event) {
    // Check if request was successful
    if (event.detail.successful !== false) {
        // Hide empty state if it exists
        const emptyState = document.getElementById('empty-dreams');
        if (emptyState) {
            emptyState.style.display = 'none';
        }

        // Update count after a short delay to allow DOM to update
        setTimeout(() => {
            const dreamsList = document.getElementById('dreams-list');
            const dreamCards = dreamsList.querySelectorAll('.dream-card');
            const countEl = document.getElementById('dreams-count');
            if (countEl && dreamsList) {
                countEl.textContent = `Aktiv Arzular (${dreamCards.length})`;
            }
        }, 100);

        // Close modal
        closeAddDreamModal();

        // Trigger stats update
        document.body.dispatchEvent(new Event('dreamUpdated'));

        // Show success toast
        if (typeof window.showToast === 'function') {
            window.showToast('✅ Arzu uğurla yaradıldı! (+25 XP)', 'success');
        }
    }
}

// Intersection Observer for counter animation
let statsObserver = null;
let hasAnimated = false;

function initStatsObserver() {
    const statsElement = document.getElementById('dream-stats');
    if (!statsElement || statsObserver) return;

    statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !hasAnimated) {
                hasAnimated = true;
                setTimeout(() => {
                    animateNumber('total-saved');
                    animateNumber('total-target');
                    animateNumber('total-progress');
                }, 100);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '50px'
    });

    statsObserver.observe(statsElement);
}

// Animate numbers when stats update (only if visible)
document.body.addEventListener('dreamUpdated', function () {
    const statsElement = document.getElementById('dream-stats');
    if (statsElement && hasAnimated) {
        // Reset animation flag if element is visible
        setTimeout(() => {
            const rect = statsElement.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
            if (isVisible) {
                animateNumber('total-saved');
                animateNumber('total-target');
                animateNumber('total-progress');
            }
        }, 300);
    }
});

function animateNumber(elementId) {
    const el = document.getElementById(elementId);
    if (!el) return;

    // Check incognito mode first - if enabled, don't animate
    const isIncognito = localStorage.getItem('incognito-mode') === 'enabled';
    if (isIncognito) {
        // In incognito mode, just set to hidden value
        if (elementId.includes('progress')) {
            el.textContent = '****%';
        } else {
            el.textContent = '**** AZN';
        }
        return;
    }

    // Check if element is visible
    const rect = el.getBoundingClientRect();
    const isVisible = rect.top < window.innerHeight && rect.bottom > 0 &&
        rect.left < window.innerWidth && rect.right > 0;

    if (!isVisible) {
        // If hidden, set initial value directly without animation
        const targetValue = parseFloat(el.getAttribute('data-value') || 0);
        const initialValue = el.getAttribute('data-initial');
        if (initialValue) {
            if (elementId.includes('progress')) {
                el.textContent = parseFloat(initialValue).toFixed(1) + '%';
            } else {
                el.textContent = parseFloat(initialValue).toFixed(2) + ' AZN';
            }
        }
        return;
    }

    const targetValue = parseFloat(el.getAttribute('data-value') || el.textContent.replace(/[^\d.]/g, ''));
    const currentText = el.textContent.replace(/[^\d.]/g, '');
    const currentValue = parseFloat(currentText) || 0;

    if (Math.abs(targetValue - currentValue) < 0.01) return;

    const duration = 1000;
    const startTime = Date.now();
    const startValue = currentValue;

    function update() {
        // Check visibility during animation
        const rect = el.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom > 0 &&
            rect.left < window.innerWidth && rect.right > 0;

        if (!isVisible) {
            // If becomes hidden, stop animation and set final value
            if (elementId.includes('progress')) {
                el.textContent = targetValue.toFixed(1) + '%';
            } else {
                el.textContent = targetValue.toFixed(2) + ' AZN';
            }
            return;
        }

        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = startValue + (targetValue - startValue) * easeOut;

        if (elementId.includes('progress')) {
            el.textContent = current.toFixed(1) + '%';
        } else {
            el.textContent = current.toFixed(2) + ' AZN';
        }

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            // Ensure final value is set
            if (elementId.includes('progress')) {
                el.textContent = targetValue.toFixed(1) + '%';
            } else {
                el.textContent = targetValue.toFixed(2) + ' AZN';
            }
        }
    }

    update();
}

// Initialize observer when page loads
document.addEventListener('DOMContentLoaded', function () {
    initStatsObserver();
});

// Re-initialize after HTMX swaps
document.body.addEventListener('htmx:afterSwap', function (event) {
    if (event.detail.target.id === 'dream-stats' || event.detail.target.querySelector('#dream-stats')) {
        hasAnimated = false;
        if (statsObserver) {
            statsObserver.disconnect();
            statsObserver = null;
        }
        setTimeout(() => {
            initStatsObserver();
        }, 100);
    }
});

// Restart counters when incognito mode is disabled
window.restartDreamVaultCounters = function () {
    const isIncognito = localStorage.getItem('incognito-mode') === 'enabled';
    if (!isIncognito) {
        // Reset animation flag and restart observer
        hasAnimated = false;
        if (statsObserver) {
            statsObserver.disconnect();
            statsObserver = null;
        }
        setTimeout(() => {
            initStatsObserver();
        }, 100);
    }
};

// Listen for incognito disabled event
document.body.addEventListener('incognitoDisabled', function () {
    window.restartDreamVaultCounters();
});

function handleDreamError(event) {
    // Show error toast
    const errorMsg = event.detail?.xhr?.responseJSON?.error || 'Xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.';
    if (typeof window.showToast === 'function') {
        window.showToast('❌ ' + errorMsg, 'error');
    } else {
        alert('Xəta: ' + errorMsg);
    }
}

// Close modal on outside click
document.getElementById('add-dream-modal')?.addEventListener('click', function (e) {
    if (e.target === this) {
        closeAddDreamModal();
    }
});

// Global Edit Dream Functions
function openEditDreamModal(dreamId) {
    // Fetch dream data first
    fetch(`/api/dreams/${dreamId}/data`)
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                const dream = data.dream;
                // Populate form
                document.getElementById('edit-dream-id').value = dream.id;
                document.getElementById('edit-dream-title').value = dream.title || '';
                document.getElementById('edit-dream-description').value = dream.description || '';
                document.getElementById('edit-dream-target-amount').value = dream.target_amount || '';
                document.getElementById('edit-dream-image-url').value = dream.image_url || '';
                document.getElementById('edit-dream-category').value = dream.category || 'Digər';
                document.getElementById('edit-dream-priority').value = dream.priority || 3;
                if (dream.target_date) {
                    document.getElementById('edit-dream-target-date').value = dream.target_date;
                } else {
                    document.getElementById('edit-dream-target-date').value = '';
                }

                // Set min date
                const dateInput = document.getElementById('edit-dream-target-date');
                if (dateInput) {
                    dateInput.min = getTodayDateString();
                }

                // Update form action
                const form = document.getElementById('edit-dream-form');
                if (form) {
                    // Remove old HTMX attributes first
                    form.removeAttribute('hx-put');
                    form.removeAttribute('hx-target');
                    form.removeAttribute('hx-swap');

                    // Set new attributes
                    form.setAttribute('hx-put', `/api/dreams/${dreamId}`);
                    form.setAttribute('hx-target', `#dream-${dreamId}`);
                    form.setAttribute('hx-swap', 'outerHTML');

                    // Re-process HTMX attributes - use setTimeout to ensure DOM is ready
                    if (typeof htmx !== 'undefined') {
                        setTimeout(() => {
                            htmx.process(form);
                        }, 50);
                    }
                }

                // Open modal
                const modal = document.getElementById('edit-dream-modal');
                modal.classList.remove('hidden');
                setTimeout(() => {
                    modal.classList.remove('opacity-0');
                    document.getElementById('edit-dream-modal-content').classList.remove('scale-95');
                    document.getElementById('edit-dream-modal-content').classList.add('scale-100');
                }, 10);
            } else {
                if (typeof window.showToast === 'function') {
                    window.showToast('❌ Arzu məlumatlarını yükləmək mümkün olmadı', 'error');
                }
            }
        })
        .catch(err => {
            console.error('Error fetching dream data:', err);
            if (typeof window.showToast === 'function') {
                window.showToast('❌ Xəta baş verdi', 'error');
            }
        });
}

function closeEditDreamModal() {
    const modal = document.getElementById('edit-dream-modal');
    modal.classList.add('opacity-0');
    document.getElementById('edit-dream-modal-content').classList.add('scale-95');
    document.getElementById('edit-dream-modal-content').classList.remove('scale-100');
    setTimeout(() => {
        modal.classList.add('hidden');
        const form = document.getElementById('edit-dream-form');
        if (form) form.reset();
    }, 300);
}

function handleEditDreamSubmit(event) {
    if (event.detail.successful !== false) {
        closeEditDreamModal();
        document.body.dispatchEvent(new Event('dreamUpdated'));
        if (typeof window.showToast === 'function') {
            window.showToast('✅ Arzu uğurla yeniləndi', 'success');
        }
    } else {
        const errorMsg = event.detail?.xhr?.responseJSON?.error || 'Xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.';
        if (typeof window.showToast === 'function') {
            window.showToast('❌ ' + errorMsg, 'error');
        } else {
            alert('Xəta: ' + errorMsg);
        }
    }
}

// Global Delete Dream Function
function deleteDream(dreamId) {
    if (confirm('Bu arzunu silmək istədiyinizə əminsiniz? Bu əməliyyat geri alına bilməz.')) {
        fetch(`/api/dreams/${dreamId}`, {
            method: 'DELETE',
            headers: {
                'HX-Request': 'true',
                'Content-Type': 'application/json'
            }
        })
            .then(res => {
                if (res.ok) {
                    // Remove card from DOM
                    const card = document.getElementById(`dream-${dreamId}`);
                    if (card) {
                        card.style.transition = 'opacity 0.3s, transform 0.3s';
                        card.style.opacity = '0';
                        card.style.transform = 'scale(0.9)';
                        setTimeout(() => {
                            card.remove();
                            // Update count
                            const dreamsList = document.getElementById('dreams-list');
                            const dreamCards = dreamsList.querySelectorAll('.dream-card');
                            const countEl = document.getElementById('dreams-count');
                            if (countEl) {
                                countEl.textContent = `Aktiv Arzular (${dreamCards.length})`;
                            }
                            // Check if empty
                            if (dreamCards.length === 0) {
                                const emptyState = document.getElementById('empty-dreams');
                                if (emptyState) {
                                    emptyState.style.display = 'block';
                                }
                            }
                        }, 300);
                    }
                    // Trigger stats update
                    document.body.dispatchEvent(new Event('dreamUpdated'));
                    // Show success toast
                    if (typeof window.showToast === 'function') {
                        window.showToast('✅ Arzu uğurla silindi', 'success');
                    }
                } else {
                    throw new Error('Delete failed');
                }
            })
            .catch(err => {
                console.error('Delete error:', err);
                if (typeof window.showToast === 'function') {
                    window.showToast('❌ Arzu silinərkən xəta baş verdi', 'error');
                }
            });
    }
}

// Close edit modal on outside click
document.getElementById('edit-dream-modal')?.addEventListener('click', function (e) {
    if (e.target === this) {
        closeEditDreamModal();
    }
});

// Make functions globally accessible
window.openAddDreamModal = openAddDreamModal;
window.closeAddDreamModal = closeAddDreamModal;
window.openEditDreamModal = openEditDreamModal;
window.closeEditDreamModal = closeEditDreamModal;
window.deleteDream = deleteDream;
window.handleDreamSubmit = handleDreamSubmit;
window.handleEditDreamSubmit = handleEditDreamSubmit;

