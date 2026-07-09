'use client';

import { useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';

const SHINCHON_STATION_EXIT_3 = [37.55745, 126.93609];
const INITIAL_ZOOM = 16;

// Marker templates are plain divIcons so the CSS animations in globals.css apply.
function divIcon(className, html) {
  return L.divIcon({ className, html, iconSize: [32, 32], iconAnchor: [16, 16] });
}

const ICONS = {
  'time-sale': divIcon(
    'custom-pulse-marker',
    '<div class="pulse-marker-container"><div class="pulse-ring"></div><div class="pulse-core"></div></div>'
  ),
  budget: divIcon(
    'custom-budget-marker',
    '<div class="budget-marker-container"><div class="budget-core"></div></div>'
  ),
  regular: divIcon(
    'custom-regular-marker',
    '<div class="regular-marker-container"><div class="regular-core"></div></div>'
  )
};

const USER_ICON = divIcon(
  'custom-user-marker',
  '<div class="user-location-marker"><div class="user-location-core"></div></div>'
);

// Pans the camera imperatively. Lives inside MapContainer so it can reach the map
// instance through useMap().
function MapController({ center }) {
  const map = useMap();

  useEffect(() => {
    if (center?.[0] && center?.[1]) {
      map.setView(center, map.getZoom(), { animate: true });
    }
  }, [center, map]);

  return null;
}

export default function Map({ restaurants, selectedRestaurant, onSelectRestaurant, userLocation }) {
  const mapRef = useRef(null);

  // A fresh array each render would restart the pan animation on every unrelated
  // re-render (toast, redirect spinner), so keep the identity tied to the coordinates.
  const cameraTarget = useMemo(() => {
    if (selectedRestaurant) return [selectedRestaurant.latitude, selectedRestaurant.longitude];
    return userLocation ?? null;
  }, [selectedRestaurant, userLocation]);

  return (
    <div className="w-full h-screen relative">
      <MapContainer
        center={userLocation ?? SHINCHON_STATION_EXIT_3}
        zoom={INITIAL_ZOOM}
        scrollWheelZoom
        zoomControl={false} // Hidden so the floating UI owns the corners
        style={{ width: '100%', height: '100vh' }}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        {cameraTarget && <MapController center={cameraTarget} />}

        {userLocation && <Marker position={userLocation} icon={USER_ICON} />}

        {restaurants.map((restaurant) => (
          <Marker
            key={restaurant.id}
            position={[restaurant.latitude, restaurant.longitude]}
            icon={ICONS[restaurant.type] ?? ICONS.regular}
            eventHandlers={{ click: () => onSelectRestaurant(restaurant) }}
          />
        ))}
      </MapContainer>
    </div>
  );
}
