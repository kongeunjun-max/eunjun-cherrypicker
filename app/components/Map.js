'use client';

import { useEffect, useRef } from 'react';

export default function Map({ restaurants, selectedRestaurant, onSelectRestaurant, userLocation }) {
  const mapContainerRef = useRef(null);
  const kakaoMapRef = useRef(null);
  const overlaysRef = useRef([]);
  const userOverlayRef = useRef(null);

  // Initialize the Kakao Map instance on mount
  useEffect(() => {
    if (typeof window === 'undefined' || !window.kakao || !window.kakao.maps) return;

    // Center coordinates: Shinchon station 3rd exit default
    const initialCenter = userLocation
      ? new window.kakao.maps.LatLng(userLocation[0], userLocation[1])
      : new window.kakao.maps.LatLng(37.55745, 126.93609);

    const mapOptions = {
      center: initialCenter,
      level: 3 // Kakao map zoom level (lower is zoomed-in, 3 is standard detailed alley grid view)
    };

    const map = new window.kakao.maps.Map(mapContainerRef.current, mapOptions);
    kakaoMapRef.current = map;

    return () => {
      // Clean up map reference on unmount
      kakaoMapRef.current = null;
    };
  }, []);

  // Sync user location custom overlay
  useEffect(() => {
    if (!kakaoMapRef.current || typeof window === 'undefined' || !window.kakao || !window.kakao.maps) return;

    if (userLocation && userLocation[0] && userLocation[1]) {
      const latlng = new window.kakao.maps.LatLng(userLocation[0], userLocation[1]);

      if (userOverlayRef.current) {
        userOverlayRef.current.setPosition(latlng);
      } else {
        // Create custom HTML element matching globals.css rose-red bouncing style
        const el = document.createElement('div');
        el.className = 'user-location-marker';
        el.innerHTML = '<div class="user-location-core"></div>';

        userOverlayRef.current = new window.kakao.maps.CustomOverlay({
          position: latlng,
          content: el,
          map: kakaoMapRef.current,
          yAnchor: 0.5
        });
      }
    }
  }, [userLocation]);

  // Handle dynamic map camera panning (panTo)
  useEffect(() => {
    if (!kakaoMapRef.current || typeof window === 'undefined' || !window.kakao || !window.kakao.maps) return;

    if (selectedRestaurant) {
      const latlng = new window.kakao.maps.LatLng(selectedRestaurant.latitude, selectedRestaurant.longitude);
      kakaoMapRef.current.panTo(latlng);
    } else if (userLocation && userLocation[0] && userLocation[1]) {
      // Fallback panning to user location if focused card is closed
      const latlng = new window.kakao.maps.LatLng(userLocation[0], userLocation[1]);
      kakaoMapRef.current.panTo(latlng);
    }
  }, [selectedRestaurant, userLocation]);

  // Sync restaurant overlays dynamically on dataset updates/filtering
  useEffect(() => {
    if (!kakaoMapRef.current || typeof window === 'undefined' || !window.kakao || !window.kakao.maps) return;

    // Clear previous overlays from map
    overlaysRef.current.forEach((overlay) => overlay.setMap(null));
    overlaysRef.current = [];

    // Draw new overlays
    restaurants.forEach((restaurant) => {
      const el = document.createElement('div');

      // Set custom markup matching globals.css animations
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

      // Bind click handler dynamically to DOM element
      el.onclick = () => {
        onSelectRestaurant(restaurant);
      };

      const overlay = new window.kakao.maps.CustomOverlay({
        position: new window.kakao.maps.LatLng(restaurant.latitude, restaurant.longitude),
        content: el,
        map: kakaoMapRef.current,
        yAnchor: 0.5
      });

      overlaysRef.current.push(overlay);
    });
  }, [restaurants]);

  return (
    <div 
      ref={mapContainerRef} 
      className="w-full h-screen relative bg-[#f4f5f6]"
      style={{ width: '100%', height: '100vh' }}
    />
  );
}
