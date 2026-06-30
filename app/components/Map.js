'use client';

import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';

// Dynamic map view controller to handle camera movements programmatically
function MapController({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, map.getZoom(), { animate: true });
    }
  }, [center, map]);
  return null;
}

export default function Map({ restaurants, selectedRestaurant, onSelectRestaurant, userLocation }) {
  const mapRef = useRef(null);

  // Initialize Custom Leaflet divIcons to inject our CSS-animated marker templates.
  const pulseIcon = typeof window !== 'undefined' ? L.divIcon({
    className: 'custom-pulse-marker',
    html: `<div class="pulse-marker-container"><div class="pulse-ring"></div><div class="pulse-core"></div></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  }) : null;

  const regularIcon = typeof window !== 'undefined' ? L.divIcon({
    className: 'custom-regular-marker',
    html: `<div class="regular-marker-container"><div class="regular-core"></div></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  }) : null;

  const budgetIcon = typeof window !== 'undefined' ? L.divIcon({
    className: 'custom-budget-marker',
    html: `<div class="budget-marker-container"><div class="budget-core"></div></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  }) : null;

  const userIcon = typeof window !== 'undefined' ? L.divIcon({
    className: 'custom-user-marker',
    html: `<div class="user-location-marker"><div class="user-location-core"></div></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  }) : null;

  return (
    <div className="w-full h-full relative" style={{ minHeight: '100vh' }}>
      <MapContainer
        center={[37.5568, 126.9368]}
        zoom={16}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100vh' }}
        zoomControl={false} // Hide default zoom buttons to apply floating UI
        ref={mapRef}
      >
        {/* CartoDB Positron Light tile server at @2x high-resolution with Retina detection */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png"
          detectRetina={true}
        />

        {/* Dynamic camera panning when a restaurant card or user location is focused */}
        {selectedRestaurant ? (
          <MapController center={[selectedRestaurant.latitude, selectedRestaurant.longitude]} />
        ) : (
          userLocation && <MapController center={userLocation} />
        )}

        {/* User GPS location marker */}
        {userLocation && (
          <Marker
            position={userLocation}
            icon={userIcon}
          />
        )}

        {restaurants.map((restaurant) => {
          let currentIcon = regularIcon;
          if (restaurant.type === 'time-sale') {
            currentIcon = pulseIcon;
          } else if (restaurant.type === 'budget') {
            currentIcon = budgetIcon;
          }

          return (
            <Marker
              key={restaurant.id}
              position={[restaurant.latitude, restaurant.longitude]}
              icon={currentIcon}
              eventHandlers={{
                click: () => {
                  onSelectRestaurant(restaurant);
                },
              }}
            />
          );
        })}
      </MapContainer>
    </div>
  );
}
