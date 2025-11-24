// Scan Page JavaScript

function getAzerbaijanTime() {
    // Get current time in UTC+4 (Azerbaijan time)
    const now = new Date();
    // Get UTC time in milliseconds
    const utcTime = now.getTime() + (now.getTimezoneOffset() * 60 * 1000);
    // Add UTC+4 offset (4 hours = 4 * 60 * 60 * 1000 milliseconds)
    const azTime = new Date(utcTime + (4 * 60 * 60 * 1000));
    return azTime.toISOString();
}

function handleFileSelect(input) {
    const fileName = input.files[0]?.name || 'Fayl seçilməyib';
    const filenameEl = document.querySelector('.upload-filename');
    if (filenameEl) {
        filenameEl.textContent = fileName;
    }

    if (input.files[0]) {
        // Show scan modal
        const scanModal = document.getElementById('scanModal');
        if (scanModal) {
            scanModal.classList.add('active');
        }

        // Set headers for HTMX request with Azerbaijan time
        const form = input.form;
        if (form) {
            form.setAttribute('hx-headers', JSON.stringify({
                "X-Client-Timezone": Intl.DateTimeFormat().resolvedOptions().timeZone,
                "X-Client-Date": getAzerbaijanTime()
            }));

            // Submit form after showing modal
            setTimeout(() => {
                if (form.requestSubmit) {
                    form.requestSubmit();
                } else {
                    form.submit();
                }
            }, 100);
        }
    }
}

// Make function globally accessible
window.handleFileSelect = handleFileSelect;

// Hide modal when scan complete
document.body.addEventListener('htmx:afterRequest', function (evt) {
    if (evt.detail.target.id === 'scanResult') {
        setTimeout(() => {
            const scanModal = document.getElementById('scanModal');
            if (scanModal) {
                scanModal.classList.remove('active');
            }
        }, 1500); // Keep modal for 1.5 seconds to show animation
    }
});

// Handle errors
document.body.addEventListener('htmx:responseError', function (evt) {
    if (evt.detail.target.id === 'scanResult') {
        const scanModal = document.getElementById('scanModal');
        if (scanModal) {
            scanModal.classList.remove('active');
        }
        if (typeof window.showToast === 'function') {
            window.showToast('Xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.', 'error');
        } else {
            alert("Xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.");
        }
    }
});

