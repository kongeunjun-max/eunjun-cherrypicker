'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

const SHINCHON_STATION_EXIT_3 = [37.55745, 126.93609];

function createMarkerElement(restaurant) {
  const el = document.createElement('div');

  if (restaurant.type === 'time-sale') {
    el.className = 'pulse-marker-container';
    el.innerHTML = '<div class="pulse-ring"></div><div class="pulse-core"></div>';
  } else if (restaurant.type === 'budget') {
    el.className = 'budget-marker-container';
    el.innerHTML = '<div class="budget-core"></div>';
  } else {
    el.className = 'regular-marker-container';
    el.innerHTML = '<div class="regular-core"></div>';
  }

  return el;
}

export default function Map({ restaurants, selectedRestaurant, onSelectRestaurant, userLocation }) {
  const mapContainerRef = useRef(null);
  const kakaoMapRef = useRef(null);
  const overlaysRef = useRef([]);
  const userOverlayRef = useRef(null);

  // The map is built inside kakao.maps.load()'s callback, which may run a tick after
  // mount. Every other effect reads kakaoMapRef, so it needs a render to re-run against
  // once the map exists — otherwise props that settled first (geolocation, restaurants)
  // are never drawn.
  const [mapReady, setMapReady] = useState(false);

  const syncOverlays = useCallback(() => {
    const map = kakaoMapRef.current;
    if (!map) return;

    overlaysRef.current.forEach((overlay) => overlay.setMap(null));
    overlaysRef.current = [];

    restaurants.forEach((restaurant) => {
      const el = createMarkerElement(restaurant);
      el.onclick = () => onSelectRestaurant(restaurant);

      overlaysRef.current.push(
        new window.kakao.maps.CustomOverlay({
          position: new window.kakao.maps.LatLng(restaurant.latitude, restaurant.longitude),
          content: el,
          map,
          yAnchor: 0.5
        })
      );
    });
  }, [restaurants, onSelectRestaurant]);

  // Initialize the Kakao Map instance on mount.
  useEffect(() => {
    if (typeof window === 'undefined' || !window.kakao?.maps) return;

    let cancelled = false;

    window.kakao.maps.load(() => {
      if (cancelled || !mapContainerRef.current) return;

      const [lat, lng] = userLocation ?? SHINCHON_STATION_EXIT_3;

      kakaoMapRef.current = new window.kakao.maps.Map(mapContainerRef.current, {
        center: new window.kakao.maps.LatLng(lat, lng),
        level: 3 // Detailed alley grid view
      });

      setMapReady(true);
    });

    return () => {
      cancelled = true;
      overlaysRef.current.forEach((overlay) => overlay.setMap(null));
      overlaysRef.current = [];
      userOverlayRef.current?.setMap(null);
      userOverlayRef.current = null;
      kakaoMapRef.current = null;
    };
    // userLocation is read only to pick the initial center; later values pan the camera
    // through the effect below instead of rebuilding the map.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Draw restaurant overlays, and redraw whenever the filtered set changes.
  useEffect(() => {
    if (!mapReady) return;
    syncOverlays();
  }, [mapReady, syncOverlays]);

  // Keep the user's GPS overlay in sync.
  useEffect(() => {
    if (!mapReady || !userLocation?.[0] || !userLocation?.[1]) return;

    const latlng = new window.kakao.maps.LatLng(userLocation[0], userLocation[1]);

    if (userOverlayRef.current) {
      userOverlayRef.current.setPosition(latlng);
      return;
    }

    const el = document.createElement('div');
    el.className = 'user-location-marker';
    el.innerHTML = '<div class="user-location-core"></div>';

    userOverlayRef.current = new window.kakao.maps.CustomOverlay({
      position: latlng,
      content: el,
      map: kakaoMapRef.current,
      yAnchor: 0.5
    });
  }, [mapReady, userLocation]);

  // Pan the camera to the selected restaurant, else follow the user.
  useEffect(() => {
    if (!mapReady) return;

    const target = selectedRestaurant
      ? [selectedRestaurant.latitude, selectedRestaurant.longitude]
      : userLocation?.[0] && userLocation?.[1]
        ? userLocation
        : null;

    if (!target) return;
    kakaoMapRef.current.panTo(new window.kakao.maps.LatLng(target[0], target[1]));
  }, [mapReady, selectedRestaurant, userLocation]);

  return (
    <div
      ref={mapContainerRef}
      className="w-full h-screen relative bg-[#f4f5f6]"
      style={{ width: '100%', height: '100vh' }}
    />
  );
}
