/**
 * Heatmap Map Component
 * HTML/CSS/JS-dən bir-bir köçürülmüş versiya - Leaflet istifadə edir
 */

import React, { useEffect, useRef } from 'react'
import '../../styles/components/heatmap/heatmap.css'

const HeatmapMap = ({ points }) => {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef([])

  useEffect(() => {
    // Leaflet script və CSS yüklə
    const loadLeaflet = () => {
      return new Promise((resolve) => {
        // CSS yoxla
        if (!document.querySelector('link[href*="leaflet"]')) {
          const link = document.createElement('link')
          link.rel = 'stylesheet'
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
          document.head.appendChild(link)
        }

        // Script yoxla
        if (window.L) {
          resolve()
          return
        }

        const script = document.createElement('script')
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
        script.onload = resolve
        document.body.appendChild(script)
      })
    }

    const initMap = async () => {
      await loadLeaflet()

      if (!window.L || !mapRef.current) return

      // Köhnə map-i sil
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        markersRef.current.forEach(marker => {
          if (marker.marker) marker.marker.remove()
          if (marker.label) marker.label.remove()
        })
        markersRef.current = []
      }

      // Yeni map yarat
      const map = window.L.map(mapRef.current, {
        zoomControl: true,
        touchZoom: true,
        doubleClickZoom: true,
        scrollWheelZoom: true,
        boxZoom: true,
        keyboard: true,
        dragging: true
      }).setView([40.4093, 49.8671], 12)

      // Tile layer əlavə et
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
        minZoom: 10
      }).addTo(map)

      mapInstanceRef.current = map

      // Mobile detection
      const isMobileDevice = window.innerWidth <= 768

      // Mobile optimizations
      if (isMobileDevice) {
        map.setZoom(11)
        map.touchZoom.enable()
        map.doubleClickZoom.enable()
        map.options.closePopupOnClick = true
      }

      // Markers əlavə et
      const markerSize = isMobileDevice ? 16 : 12
      const markerAnchor = isMobileDevice ? 8 : 6

      points.forEach((point, index) => {
        // Custom red marker icon
        const redIcon = window.L.divIcon({
          className: 'merchant-marker',
          iconSize: [markerSize, markerSize],
          iconAnchor: [markerAnchor, markerAnchor]
        })

        // Marker əlavə et
        const marker = window.L.marker([point.lat, point.lon], {
          icon: redIcon,
          keyboard: true,
          title: point.merchant,
          riseOnHover: true,
          zIndexOffset: index
        }).addTo(map)

        // Merchant label (yalnız desktop üçün)
        let label = null
        if (!isMobileDevice) {
          label = window.L.marker([point.lat, point.lon], {
            icon: window.L.divIcon({
              className: 'merchant-label',
              html: `<div style="font-size: 11px; font-weight: 600;">${point.merchant}</div>`,
              iconSize: null,
              iconAnchor: [0, -15]
            }),
            interactive: false
          }).addTo(map)
        }

        // Popup əlavə et (HTML/CSS/JS-dən bir-bir eyni)
        const minWidth = isMobileDevice ? '140px' : '150px'
        const fontSize1 = isMobileDevice ? '14px' : '14px'
        const fontSize2 = isMobileDevice ? '12px' : '12px'
        const fontSize3 = isMobileDevice ? '16px' : '16px'
        const marginBottom = isMobileDevice ? '4px' : '6px'
        const coordinatesHtml = !isMobileDevice
          ? `<p style="font-size: 10px; opacity: 0.6; font-family: monospace;">
                📍 ${point.lat.toFixed(4)}, ${point.lon.toFixed(4)}
            </p>`
          : ''

        marker.bindPopup(
          `
            <div style="min-width: ${minWidth};">
                <p style="font-weight: 700; font-size: ${fontSize1}; margin-bottom: 6px;">${point.merchant}</p>
                <p style="font-size: ${fontSize2}; opacity: 0.8; margin-bottom: 4px;">${point.category}</p>
                <p style="font-size: ${fontSize3}; font-weight: 700; color: #ef4444; margin-bottom: ${marginBottom};">
                    ${point.amount.toFixed(2)} AZN
                </p>
                ${coordinatesHtml}
            </div>
        `,
          {
            maxWidth: isMobileDevice ? 220 : 250,
            className: isMobileDevice ? 'mobile-popup' : '',
            closeButton: true,
            autoPan: true,
            autoPanPadding: isMobileDevice ? [50, 50] : [20, 20]
          }
        )

        markersRef.current.push({ marker, label })
      })

      // Fit map to show all markers (mobile-optimized padding) - HTML/CSS/JS-dən bir-bir eyni
      if (points.length > 0) {
        const bounds = window.L.latLngBounds(points.map(p => [p.lat, p.lon]))
        map.fitBounds(bounds, {
          padding: isMobileDevice ? [40, 40] : [50, 50],
          maxZoom: isMobileDevice ? 14 : 16
        })
      }

      // Handle window resize for mobile - HTML/CSS/JS-dən bir-bir eyni
      let resizeTimer
      const handleResize = () => {
        clearTimeout(resizeTimer)
        resizeTimer = setTimeout(() => {
          const nowMobile = window.innerWidth <= 768
          if (points.length > 0 && mapInstanceRef.current) {
            const bounds = window.L.latLngBounds(points.map(p => [p.lat, p.lon]))
            mapInstanceRef.current.fitBounds(bounds, {
              padding: nowMobile ? [40, 40] : [50, 50],
              maxZoom: nowMobile ? 14 : 16
            })
          }
        }, 250)
      }

      window.addEventListener('resize', handleResize)

      // Better marker clustering visualization on mobile - HTML/CSS/JS-dən bir-bir eyni
      if (isMobileDevice && points.length > 10) {
        console.log('Mobile: Using optimized marker rendering')
      }

      return () => {
        window.removeEventListener('resize', handleResize)
        if (resizeTimer) {
          clearTimeout(resizeTimer)
        }
      }
    }

    initMap()

    return () => {
      // Cleanup
      if (mapInstanceRef.current) {
        markersRef.current.forEach(marker => {
          if (marker.marker) marker.marker.remove()
          if (marker.label) marker.label.remove()
        })
        markersRef.current = []
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [points])

  return <div id="map" ref={mapRef} className="heatmap-container"></div>
}

export default HeatmapMap

