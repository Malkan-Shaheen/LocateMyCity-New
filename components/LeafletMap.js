'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Preload marker images
const preloadImages = () => {
  const markerUrls = [
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png'
  ];
  
  markerUrls.forEach(url => {
    const img = new Image();
    img.src = url;
  });
};

// Preload images on module load
if (typeof window !== 'undefined') {
  setTimeout(preloadImages, 1000);
}

// Cache icons to prevent recreating them
const iconCache = {
  green: null,
  red: null
};

const getCachedIcon = (color) => {
  if (iconCache[color]) return iconCache[color];
  
  const iconUrl = color === 'green' 
    ? 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png'
    : 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png';
  
  const shadowUrl = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png';
  
  iconCache[color] = L.icon({
    iconUrl,
    shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
  
  return iconCache[color];
};

const LeafletMap = ({ source, destination, distance }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layerRef = useRef(null);
  const [mapStatus, setMapStatus] = useState('Loading map...');
  const [isInteractive, setIsInteractive] = useState(false);
  const isInitializedRef = useRef(false);

  // Memoized cleanup function
  const cleanupMap = useCallback(() => {
    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.remove();
      } catch (e) {
        console.warn('Error during map cleanup:', e);
      }
      mapInstanceRef.current = null;
    }
    if (layerRef.current) {
      try {
        layerRef.current.clearLayers();
      } catch (e) {
        console.warn('Error during layer cleanup:', e);
      }
      layerRef.current = null;
    }
    setIsInteractive(false);
  }, []);

  // Memoized map initialization
  const initializeMap = useCallback(() => {
    if (!source || !destination || !mapRef.current || isInitializedRef.current) return;
    
    cleanupMap();
    isInitializedRef.current = true;

    try {
      const map = L.map(mapRef.current, {
        preferCanvas: true, // Better performance for many markers
        zoomControl: true,
        keyboard: true,
        keyboardPanDelta: 75,
        fadeAnimation: false, // Improve performance
        markerZoomAnimation: false // Improve performance
      }).setView(
        [
          (parseFloat(source.lat) + parseFloat(destination.lat)) / 2,
          (parseFloat(source.lng) + parseFloat(destination.lng)) / 2
        ],
        3
      );

      // Accessible zoom controls
      const zoomContainer = map.zoomControl._container;
      if (zoomContainer) {
        zoomContainer.setAttribute('aria-label', 'Map zoom controls');
        const zoomIn = zoomContainer.querySelector('.leaflet-control-zoom-in');
        const zoomOut = zoomContainer.querySelector('.leaflet-control-zoom-out');
        if (zoomIn) zoomIn.setAttribute('aria-label', 'Zoom in');
        if (zoomOut) zoomOut.setAttribute('aria-label', 'Zoom out');
      }

      mapInstanceRef.current = map;
      layerRef.current = L.layerGroup().addTo(map);

      // Use optimized tile layer with proper error handling
      const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" aria-label="OpenStreetMap copyright">OpenStreetMap</a>',
        crossOrigin: 'anonymous',
        maxZoom: 19,
        minZoom: 1
      }).addTo(map);

      tileLayer.on('tileerror', (error) => {
        console.warn('Tile loading error:', error);
      });

      const createMarker = (latlng, icon, title, html) =>
        L.marker(latlng, { icon, alt: title, title, riseOnHover: true })
          .bindPopup(html, { className: 'accessible-popup', maxWidth: 300 });

      // Use cached icons
      const sourceIcon = getCachedIcon('green');
      const destIcon = getCachedIcon('red');

      createMarker(
        [source.lat, source.lng], sourceIcon,
        `Source: ${source.name}`,
        `<div><h3>Source</h3><p>${source.name}</p><p>Lat: ${source.lat}</p><p>Lng: ${source.lng}</p></div>`
      ).addTo(layerRef.current);

      createMarker(
        [destination.lat, destination.lng], destIcon,
        `Destination: ${destination.name}`,
        `<div><h3>Destination</h3><p>${destination.name}</p><p>Lat: ${destination.lat}</p><p>Lng: ${destination.lng}</p></div>`
      ).addTo(layerRef.current);

      const line = L.polyline(
        [[source.lat, source.lng], [destination.lat, destination.lng]],
        { color: 'blue', weight: 2, dashArray: '5,5' }
      ).addTo(layerRef.current);

      const midpoint = line.getBounds().getCenter();
      L.marker(midpoint, {
        icon: L.divIcon({
          html: `<div role="status" aria-live="polite">${distance.toFixed(1)} km<span class="sr-only"> Distance</span></div>`,
          className: 'distance-label-container',
          iconSize: [100, 30]
        }),
        keyboard: false
      }).addTo(layerRef.current);

      // Fit bounds with padding
      const bounds = L.latLngBounds([source.lat, source.lng], [destination.lat, destination.lng]);
      map.fitBounds(bounds, { padding: [50, 50], animate: false });

      setMapStatus(`Map loaded showing route from ${source.name} to ${destination.name}`);
      setIsInteractive(true);

      map.whenReady(() => {
        if (mapRef.current) {
          mapRef.current.setAttribute('aria-busy', 'false');
          // Removed programmatic focus to prevent page from auto-scrolling to the map
        }
      });

    } catch (err) {
      setMapStatus('Error loading map. Please try again.');
      console.error('Map initialization error:', err);
      isInitializedRef.current = false;
    }
  }, [source, destination, distance, cleanupMap]);

  useEffect(() => {
    // Initialize map with a small delay to prevent blocking main thread
    const timer = setTimeout(initializeMap, 100);
    return () => clearTimeout(timer);
  }, [initializeMap]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupMap();
    };
  }, [cleanupMap]);

  return (
    <div
      ref={mapRef}
      style={{ 
        height: '500px', 
        width: '100%', 
        borderRadius: '8px', 
        position: 'relative',
        minHeight: '300px' // Prevent layout shifts
      }}
      role="application"
      aria-label={`Interactive map ${mapStatus}`}
      aria-live="polite"
      tabIndex={0}
      aria-busy={!isInteractive}
    >
      <div className="sr-only" aria-live="assertive">{mapStatus}</div>
      {!isInteractive && (
        <div style={{
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0,
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: 'rgba(255,255,255,0.9)', 
          zIndex: 1000,
          borderRadius: '8px'
        }}>
          <p style={{ textAlign: 'center', padding: '1rem' }}>{mapStatus}</p>
        </div>
      )}
    </div>
  );
};

export default LeafletMap;