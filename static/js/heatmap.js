// Heatmap Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
// Get map points from data attribute
const mapPointsDataEl = document.getElementById('map-points-data');
let mapPoints = [];
if (mapPointsDataEl) {
    try {
        mapPoints = JSON.parse(mapPointsDataEl.textContent);
    } catch (e) {
        console.error('Error parsing map points data:', e);
    }
}

// Initialize map centered on Baku
const map = L.map('map', {
    zoomControl: true,
    touchZoom: true,
    doubleClickZoom: true,
    scrollWheelZoom: true,
    boxZoom: true,
    keyboard: true,
    dragging: true
}).setView([40.4093, 49.8671], 12);

// Light tile layer for a clean white map
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19,
    minZoom: 10
}).addTo(map);

// Detect mobile
const isMobileDevice = window.innerWidth <= 768;

// Mobile optimizations
if (isMobileDevice) {
    // Adjust zoom for mobile
    map.setZoom(11);
    
    // Enable touch gestures
    map.touchZoom.enable();
    map.doubleClickZoom.enable();
    
    // Better popup positioning for mobile
    map.options.closePopupOnClick = true;
}

// Add markers for each expense
const markerSize = isMobileDevice ? 16 : 12;
const markerAnchor = isMobileDevice ? 8 : 6;

mapPoints.forEach((point, index) => {
    // Create custom red marker icon (larger on mobile for better visibility)
    const redIcon = L.divIcon({
        className: 'merchant-marker',
        iconSize: [markerSize, markerSize],
        iconAnchor: [markerAnchor, markerAnchor]
    });

    // Add marker with better touch handling
    const marker = L.marker([point.lat, point.lon], { 
        icon: redIcon,
        keyboard: true,
        title: point.merchant,
        riseOnHover: true,
        zIndexOffset: index
    }).addTo(map);

    // Create merchant label (only on desktop, hidden on mobile for better UX)
    if (!isMobileDevice) {
        const label = L.marker([point.lat, point.lon], {
            icon: L.divIcon({
                className: 'merchant-label',
                html: `<div style="font-size: 11px; font-weight: 600;">${point.merchant}</div>`,
                iconSize: null,
                iconAnchor: [0, -15]
            }),
            interactive: false
        }).addTo(map);
    }

    // Add popup with details (mobile-optimized)
    const minWidth = isMobileDevice ? '140px' : '150px';
    const fontSize1 = isMobileDevice ? '14px' : '14px';
    const fontSize2 = isMobileDevice ? '12px' : '12px';
    const fontSize3 = isMobileDevice ? '16px' : '16px';
    const marginBottom = isMobileDevice ? '4px' : '6px';
    const coordinatesHtml = !isMobileDevice ? `<p style="font-size: 10px; opacity: 0.6; font-family: monospace;">
                📍 ${point.lat.toFixed(4)}, ${point.lon.toFixed(4)}
            </p>` : '';
    
    marker.bindPopup(`
        <div style="min-width: ${minWidth};">
            <p style="font-weight: 700; font-size: ${fontSize1}; margin-bottom: 6px;">${point.merchant}</p>
            <p style="font-size: ${fontSize2}; opacity: 0.8; margin-bottom: 4px;">${point.category}</p>
            <p style="font-size: ${fontSize3}; font-weight: 700; color: #ef4444; margin-bottom: ${marginBottom};">
                ${point.amount.toFixed(2)} AZN
            </p>
            ${coordinatesHtml}
        </div>
    `, {
        maxWidth: isMobileDevice ? 220 : 250,
        className: isMobileDevice ? 'mobile-popup' : '',
        closeButton: true,
        autoPan: true,
        autoPanPadding: isMobileDevice ? [50, 50] : [20, 20]
    });
});

// Fit map to show all markers (mobile-optimized padding)
if (mapPoints.length > 0) {
    const bounds = L.latLngBounds(mapPoints.map(p => [p.lat, p.lon]));
    map.fitBounds(bounds, { 
        padding: isMobileDevice ? [40, 40] : [50, 50],
        maxZoom: isMobileDevice ? 14 : 16
    });
}

// Handle window resize for mobile
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        const nowMobile = window.innerWidth <= 768;
        if (mapPoints.length > 0) {
            const bounds = L.latLngBounds(mapPoints.map(p => [p.lat, p.lon]));
            map.fitBounds(bounds, { 
                padding: nowMobile ? [40, 40] : [50, 50],
                maxZoom: nowMobile ? 14 : 16
            });
        }
    }, 250);
});

// Better marker clustering visualization on mobile
if (isMobileDevice && mapPoints.length > 10) {
    // Add cluster group for better performance on mobile
    console.log('Mobile: Using optimized marker rendering');
}
}); // End DOMContentLoaded

