'use client';

import { useEffect, useRef } from 'react';

export default function Map({ restaurants, selectedRestaurant, onSelectRestaurant, userLocation }) {
  const mapContainerRef = useRef(null);
  const naverMapRef = useRef(null);
  const markersRef = useRef([]);
  const userMarkerRef = useRef(null);

  // Initialize the NAVER Map instance on mount
  useEffect(() => {
    if (typeof window === 'undefined' || !window.naver || !window.naver.maps) return;

    // Set initial center coordinates (Shinchon station 3rd exit default)
    const initialCenter = userLocation
      ? new window.naver.maps.LatLng(userLocation[0], userLocation[1])
      : new window.naver.maps.LatLng(37.55745, 126.93609);

    const mapOptions = {
      center: initialCenter,
      zoom: 16,
      zoomControl: false, // Hide native zoom buttons to preserve Antigravity custom layout
      mapTypeControl: false,
      scaleControl: false,
      logoControlOptions: {
        position: window.naver.maps.Position.BOTTOM_LEFT
      }
    };

    const map = new window.naver.maps.Map(mapContainerRef.current, mapOptions);
    naverMapRef.current = map;

    return () => {
      // Clean up map listeners on unmount
      if (naverMapRef.current) {
        naverMapRef.current.destroy();
      }
    };
  }, []);

  // Sync user location marker
  useEffect(() => {
    if (!naverMapRef.current || typeof window === 'undefined' || !window.naver || !window.naver.maps) return;

    if (userLocation && userLocation[0] && userLocation[1]) {
      const latlng = new window.naver.maps.LatLng(userLocation[0], userLocation[1]);

      if (userMarkerRef.current) {
        userMarkerRef.current.setPosition(latlng);
      } else {
        userMarkerRef.current = new window.naver.maps.Marker({
          position: latlng,
          map: naverMapRef.current,
          icon: {
            content: `<div class="user-location-marker"><div class="user-location-core"></div></div>`,
            size: new window.naver.maps.Size(32, 32),
            anchor: new window.naver.maps.Point(16, 16)
          }
        });
      }
    }
  }, [userLocation]);

  // Handle dynamic map camera panning (PanTo)
  useEffect(() => {
    if (!naverMapRef.current || typeof window === 'undefined' || !window.naver || !window.naver.maps) return;

    if (selectedRestaurant) {
      const latlng = new window.naver.maps.LatLng(selectedRestaurant.latitude, selectedRestaurant.longitude);
      naverMapRef.current.panTo(latlng, { duration: 300, easing: 'easeOutCubic' });
    } else if (userLocation && userLocation[0] && userLocation[1]) {
      // Fallback panning to user location if focused card is closed
      const latlng = new window.naver.maps.LatLng(userLocation[0], userLocation[1]);
      naverMapRef.current.panTo(latlng, { duration: 300, easing: 'easeOutCubic' });
    }
  }, [selectedRestaurant, userLocation]);

  // Sync restaurant markers dynamically on dataset updates/filtering
  useEffect(() => {
    if (!naverMapRef.current || typeof window === 'undefined' || !window.naver || !window.naver.maps) return;

    // Clear previous markers
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    // Draw new markers
    restaurants.forEach((restaurant) => {
      let contentHtml = '';

      // Set custom markup matching globals.css animations
      if (restaurant.type === 'time-sale') {
        contentHtml = `<div class="pulse-marker-container"><div class="pulse-ring"></div><div class="pulse-core"></div></div>`;
      } else if (restaurant.type === 'budget') {
        contentHtml = `<div class="budget-marker-container"><div class="budget-core"></div></div>`;
      } else {
        contentHtml = `<div class="regular-marker-container"><div class="regular-core"></div></div>`;
      }

      const marker = new window.naver.maps.Marker({
        position: new window.naver.maps.LatLng(restaurant.latitude, restaurant.longitude),
        map: naverMapRef.current,
        icon: {
          content: contentHtml,
          size: new window.naver.maps.Size(32, 32),
          anchor: new window.naver.maps.Point(16, 16)
        }
      });

      // Bind click handler
      window.naver.maps.Event.addListener(marker, 'click', () => {
        onSelectRestaurant(restaurant);
      });

      markersRef.current.push(marker);
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
