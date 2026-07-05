'use client';

import { useState, useEffect } from 'react';
import Script from 'next/script';
import Map from './components/Map';

const FILTERS = ["🔥전체", "🍻단체 뒤풀이", "👩❤️👨조용한 데이트", "🎧혼밥/가성비", "☔비오는 날", "💸가성비(만원이하)"];

export default function Page() {
  const [restaurants, setRestaurants] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('🔥전체');
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  
  // Weather state to spawn dynamic rainy day deals
  const [isRainy, setIsRainy] = useState(false);
  
  // Geolocation state to track user's real position [latitude, longitude]
  const [userLocation, setUserLocation] = useState(null);

  // Redirection loading and toast states
  const [toastVisible, setToastVisible] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Naver Maps Script loaded state
  const [mapLoaded, setMapLoaded] = useState(false);

  // Detect exact browser origin for Naver domain debugging
  const [currentOrigin, setCurrentOrigin] = useState('');

  // Sync script load state and extract origin
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentOrigin(window.location.origin);
      if (window.naver && window.naver.maps) {
        setMapLoaded(true);
      }
    }
  }, []);

  // Request HTML5 Geolocation access on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
        },
        (error) => {
          console.warn("Geolocation denied or unavailable: ", error);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    }
  }, []);

  // Fetch real Shinchon restaurant deals from our backend API
  const fetchRestaurants = async (rainyStatus) => {
    try {
      const res = await fetch(`/api/restaurants?rain=${rainyStatus}`);
      if (res.ok) {
        const data = await res.json();
        setRestaurants(data);
        
        // Sync selected card details if already focused
        if (selectedRestaurant) {
          const updated = data.find((r) => r.id === selectedRestaurant.id);
          if (updated) setSelectedRestaurant(updated);
        }
      }
    } catch (err) {
      console.error('Failed to fetch real restaurant deals:', err);
    }
  };

  useEffect(() => {
    fetchRestaurants(isRainy);
  }, [isRainy]);

  // Client-side category filtering
  const filteredRestaurants = restaurants.filter((r) => {
    if (selectedFilter === '🔥전체') return true;
    return r.situation === selectedFilter;
  });

  const handleWeatherToggle = (newRainState) => {
    setIsRainy(newRainState);
    setSelectedRestaurant(null);
    if (newRainState) {
      setSelectedFilter('☔비오는 날');
    } else {
      setSelectedFilter('🔥전체');
    }
  };

  // Center map on user's current location dynamically
  const handleSnapToUser = () => {
    if (userLocation) {
      setSelectedRestaurant(null); // Clear selected restaurant focus
      setUserLocation([...userLocation]); // Trigger reference update to pan MapController
    } else {
      alert("위치 정보를 가져오는 중이거나 권한이 거부되었습니다.");
      // Retry fetching geolocation
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setUserLocation([latitude, longitude]);
          },
          (err) => console.error(err)
        );
      }
    }
  };

  // Dynamic redirect handler. Opens the official brand deal or Naver place in a new tab 
  const handleRedirectToDeal = async () => {
    if (!selectedRestaurant || isRedirecting) return;
    
    setIsRedirecting(true);
    setToastVisible(true);

    try {
      const res = await fetch('/api/restaurants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedRestaurant.id })
      });
      
      if (res.ok) {
        const result = await res.json();
        
        // Update local click count stats
        setRestaurants(prev => 
          prev.map(r => r.id === selectedRestaurant.id ? { ...r, downloads: result.newDownloadCount } : r)
        );
        setSelectedRestaurant(prev => 
          prev ? { ...prev, downloads: result.newDownloadCount } : null
        );

        // Safely redirect to official webpage in a new tab
        window.open(selectedRestaurant.redirectUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (err) {
      console.error('Failed to register redirect log:', err);
    } finally {
      setIsRedirecting(false);
      setTimeout(() => {
        setToastVisible(false);
      }, 2500);
    }
  };

  // Return style classes based on restaurant type
  const getBadgeStyle = (type) => {
    if (type === 'time-sale') {
      return 'bg-red-500/10 border-red-500/20 text-[#ff4d4f]';
    } else if (type === 'budget') {
      return 'bg-emerald-500/10 border-emerald-500/20 text-[#2ec4b6]';
    } else {
      return 'bg-blue-500/10 border-blue-500/20 text-[#2f54eb]';
    }
  };

  const getBadgeText = (type) => {
    if (type === 'time-sale') return '⏰ 마감임박';
    if (type === 'budget') return '💸 상시가성비(만원이하)';
    return '💡 상시할인';
  };

  const getDiscountBoxStyle = (type) => {
    if (type === 'time-sale') {
      return 'bg-red-500/5 border-l-[#ff4d4f] border-black/5';
    } else if (type === 'budget') {
      return 'bg-emerald-500/5 border-l-[#2ec4b6] border-black/5';
    } else {
      return 'bg-blue-500/5 border-l-[#2f54eb] border-black/5';
    }
  };

  // Get Client ID securely from env variables
  const naverClientId = process.env.NEXT_PUBLIC_NAVER_CLIENT_ID || 'YOUR_CLIENT_ID';

  return (
    <main className="w-full h-screen relative bg-[#f4f5f6] select-none">
      
      {/* Load NAVER Map Script dynamically */}
      <Script 
        src={`https://oapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${naverClientId}`}
        strategy="beforeInteractive"
        onLoad={() => setMapLoaded(true)}
      />

      {/* Render map only when NAVER SDK is ready in DOM */}
      {mapLoaded ? (
        <Map 
          restaurants={filteredRestaurants} 
          selectedRestaurant={selectedRestaurant}
          onSelectRestaurant={setSelectedRestaurant}
          userLocation={userLocation}
        />
      ) : (
        <div className="w-full h-screen bg-[#f4f5f6] flex flex-col items-center justify-center text-[#12141a] gap-4">
          <div className="w-12 h-12 border-4 border-t-[#12141a] border-r-black/10 border-b-black/10 border-l-black/10 rounded-full animate-spin"></div>
          <p className="text-[#5c6370] text-sm font-semibold tracking-wider animate-pulse">네이버 지도 엔진을 가동하는 중...</p>
        </div>
      )}

      {/* Floating Header & Filters */}
      <div className="absolute top-0 left-0 right-0 z-[1000] p-4 flex flex-col gap-3.5 pointer-events-none">
        
        {/* Header & Weather Toggle / User GPS Controls */}
        <div className="w-full flex items-start justify-between">
          <div className="flex flex-col drop-shadow-[0_2px_8px_rgba(255,255,255,0.8)]">
            <h1 className="text-2xl font-black text-[#12141a] tracking-tighter flex items-center gap-1.5">
              DealRadar <span className="text-xl animate-pulse">📡</span>
            </h1>
            <p className="text-xs text-[#5c6370] font-bold mt-0.5 tracking-wider">신촌 실시간 특가 & 가성비 레이더</p>
            {currentOrigin && (
              <div className="mt-1 bg-red-500/10 border border-red-500/20 rounded-md px-2 py-0.5 text-[9px] text-red-600 font-bold max-w-max pointer-events-auto select-text" title="네이버 콘솔에 등록해야 하는 실제 주소">
                네이버 주소 등록 확인: {currentOrigin}
              </div>
            )}
          </div>

          {/* Floating Control Box (Weather Switch + My Location Button) */}
          <div className="pointer-events-auto bg-white/90 border border-black/5 px-2.5 py-1.5 rounded-full flex items-center gap-2 antigravity-shadow">
            
            {/* Weather controls */}
            <div className="flex gap-1.5 border-r border-black/10 pr-2">
              <button 
                onClick={() => handleWeatherToggle(false)}
                className={`p-1.5 rounded-full text-xs transition-all duration-300 ${!isRainy ? 'bg-[#12141a] text-white scale-110 shadow-sm' : 'text-[#8c9ba5] hover:text-[#12141a]'}`}
                title="맑음 (기본 할인 켜기)"
              >
                ☀️
              </button>
              <button 
                onClick={() => handleWeatherToggle(true)}
                className={`p-1.5 rounded-full text-xs transition-all duration-300 ${isRainy ? 'bg-blue-600 text-white scale-110 shadow-sm' : 'text-[#8c9ba5] hover:text-blue-600'}`}
                title="비 오는 날 (게릴라 파전 켜기)"
              >
                ☔
              </button>
            </div>

            {/* GPS Snap to location Button */}
            <button 
              onClick={handleSnapToUser}
              className="p-1.5 rounded-full text-xs transition-all duration-300 text-[#8c9ba5] hover:text-[#ff0055] hover:scale-110"
              title="내 위치로 지도 이동"
            >
              📍
            </button>
          </div>
        </div>

        {/* Top Context Filter Chips bar */}
        <div className="pointer-events-auto w-full overflow-x-auto scrollbar-hidden flex gap-2 pb-2">
          {FILTERS.map((filter) => {
            const isSelected = selectedFilter === filter;
            return (
              <button
                key={filter}
                onClick={() => {
                  setSelectedFilter(filter);
                  setSelectedRestaurant(null); // Clear active card
                }}
                className={`flex-shrink-0 px-4 py-2 rounded-full border transition-all duration-300 text-sm font-bold antigravity-shadow ${
                  isSelected 
                    ? 'bg-[#12141a] border-[#12141a] text-white shadow-md' 
                    : 'bg-white/90 border-black/5 text-[#12141a] hover:bg-white'
                }`}
              >
                {filter}
              </button>
            );
          })}
        </div>
      </div>

      {/* Floating Bottom Sheet Card (White Glassmorphic Look) */}
      <div 
        className={`absolute bottom-6 left-4 right-4 z-[1000] transition-all duration-500 ease-out transform ${
          selectedRestaurant ? 'translate-y-0 opacity-100' : 'translate-y-96 opacity-0 pointer-events-none'
        }`}
      >
        {selectedRestaurant && (
          <div className="frosted-glass rounded-3xl p-5 w-full max-w-lg mx-auto antigravity-shadow">
            
            {/* Sheet Handle and Close button */}
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-lg font-black text-[#12141a] leading-tight">{selectedRestaurant.name}</h3>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[#ffb800] text-xs">★</span>
                  <span className="text-xs text-[#5c6370] font-bold">{selectedRestaurant.rating}</span>
                  <span className="text-xs text-black/10">•</span>
                  <span className="text-xs text-[#5c6370] font-semibold">실시간 안내 확인 {selectedRestaurant.downloads}회</span>
                </div>
              </div>

              {/* Status Badge */}
              <div className={`px-2.5 py-1.5 rounded-xl border text-[10px] font-black uppercase ${getBadgeStyle(selectedRestaurant.type)}`}>
                {getBadgeText(selectedRestaurant.type)}
              </div>
            </div>

            {/* Discount Content Panel */}
            <div className={`rounded-2xl p-4 border-l-4 mb-4 ${getDiscountBoxStyle(selectedRestaurant.type)}`}>
              <p className="text-sm font-bold text-[#12141a] leading-relaxed">{selectedRestaurant.discount}</p>
              {selectedRestaurant.originalPrice && (
                <p className="text-xs text-[#5c6370] mt-1.5 font-medium">{selectedRestaurant.originalPrice}</p>
              )}
            </div>

            {/* Meta tags and Remaining time */}
            <div className="flex items-center justify-between mb-5 gap-3">
              <div className="flex items-center gap-1.5 bg-black/5 px-2.5 py-1.5 rounded-lg border border-black/5">
                <span className="text-xs">⏳</span>
                <span className="text-xs font-bold text-[#e6a100]">{selectedRestaurant.remainingTime}</span>
              </div>

              <div className="flex gap-1.5 overflow-x-auto scrollbar-hidden">
                {selectedRestaurant.tags.map((tag, idx) => (
                  <span key={idx} className="bg-black/5 border border-black/5 text-[10px] text-[#5c6370] font-bold px-2 py-1 rounded-lg flex-shrink-0">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Floating Action Buttons */}
            <div className="flex gap-2.5">
              <button 
                onClick={() => setSelectedRestaurant(null)}
                className="px-4 py-3.5 rounded-2xl bg-black/5 border border-black/5 text-[#12141a] font-bold text-sm hover:bg-black/10 transition-all duration-300"
              >
                닫기
              </button>
              <button 
                onClick={handleRedirectToDeal}
                disabled={isRedirecting}
                className="flex-1 py-3.5 rounded-2xl bg-[#12141a] text-white font-black text-sm hover:bg-[#252830] active:scale-95 transition-all duration-300 shadow-[0_4px_12px_rgba(18,20,26,0.25)] flex items-center justify-center gap-1.5"
              >
                {isRedirecting ? (
                  <div className="w-4 h-4 border-2 border-t-white border-r-transparent border-b-white border-l-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    {selectedRestaurant.type === 'budget' 
                      ? '📍 상세 위치 및 매장 정보 확인하기' 
                      : '📍 실시간 할인 안내 및 확인하기'
                    }
                  </>
                )}
              </button>
            </div>

          </div>
        )}
      </div>

      {/* Floating Redirection Toast Notification */}
      <div 
        className={`absolute top-28 left-4 right-4 z-[2000] flex justify-center transition-all duration-500 ease-out transform ${
          toastVisible ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-12 opacity-0 scale-90 pointer-events-none'
        }`}
      >
        <div className="bg-[#12141a] rounded-2xl p-4 flex items-center gap-3 shadow-[0_12px_36px_rgba(18,20,26,0.35)] max-w-md w-full">
          <div className="text-2xl animate-bounce">🔗</div>
          <div>
            <h4 className="text-xs font-black text-white">
              {selectedRestaurant?.type === 'budget' 
                ? '가성비 식당 상세 안내로 이동 중...' 
                : '공식 할인 안내처로 이동 중...'
              }
            </h4>
            <p className="text-[10px] text-[#8c9ba5] font-medium mt-0.5">
              {selectedRestaurant?.type === 'budget'
                ? '매장 정보 및 네이버 지도 상세 페이지로 리다이렉트합니다.'
                : '매장의 상세 이벤트 웹페이지 및 예약 페이지로 안전하게 리다이렉트합니다.'
              }
            </p>
          </div>
        </div>
      </div>

    </main>
  );
}
