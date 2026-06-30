import { NextResponse } from 'next/server';

// Expanded in-memory analytics store for logging redirects/clicks
let redirectClicks = {
  '1': 32,  // 리춘시장
  '2': 78,  // 써브웨이
  '3': 15,  // 에일크루
  '4': 41,  // 교촌치킨
  '5': 29,  // 설빙
  '6': 94,  // 버거킹
  '7': 11,  // 대포 (비)
  '8': 18,  // 피자헛
  '9': 57,  // KFC
  '10': 39, // 맘스터치
  '11': 142,// 꼬숑돈까스
  '12': 91, // 이석덕파스타
  '13': 64, // 별당김치찜
  '14': 53  // 신촌수제비
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const isRainy = searchParams.get('rain') === 'true';

  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  // Dynamic rolling countdown timers to simulate live deals
  const deal1MinutesLeft = 120 - ((currentHour % 2) * 60 + currentMinute);
  const deal1TimeText = `${Math.floor(deal1MinutesLeft / 60)}시간 ${deal1MinutesLeft % 60}분 남음`;

  const deal7MinutesLeft = 60 - currentMinute;
  const deal7TimeText = `${deal7MinutesLeft}분 남음`;

  const restaurants = [
    // 1. active deals (time-sale or regular promo)
    {
      id: '1',
      name: '리춘시장 신촌점',
      type: 'time-sale', 
      discount: '생맥주 1,900원 & 고량주 하이볼 한정 특가 행사',
      originalPrice: '생맥주 4,500원 ➔ 1,900원',
      remainingTime: deal1TimeText,
      tags: ['#단체뒤풀이', '#생맥주1900원', '#더본코리아행사'],
      situation: '🍻단체 뒤풀이',
      latitude: 37.55787,
      longitude: 126.93512,
      rating: 4.5,
      downloads: redirectClicks['1'] || 0,
      redirectUrl: 'https://www.theborn.co.kr/theborn_brand/%eb%a6%ac%ec%bd%98%ec%8a%9c%ec%9e%a5/'
    },
    {
      id: '2',
      name: '써브웨이 신촌점',
      type: 'regular', 
      discount: '이달의 썹!프라이즈 샌드위치 콤보 특가 할인',
      originalPrice: '샌드위치 콤보 8,900원 ➔ 6,500원',
      remainingTime: '상시 운영',
      tags: ['#혼밥', '#가성비최강', '#썹프라이즈'],
      situation: '🎧혼밥/가성비',
      latitude: 37.55688,
      longitude: 126.93663,
      rating: 4.4,
      downloads: redirectClicks['2'] || 0,
      redirectUrl: 'https://www.subway.co.kr/eventList'
    },
    {
      id: '3',
      name: '에일크루브루잉 신촌점',
      type: 'regular', 
      discount: '네이버 예약 방문 고객 하이볼 할인 및 감자튀김 제공',
      originalPrice: '수제맥주 8,000원 ➔ 예약 시 10% 추가할인',
      tags: ['#조용한데이트', '#분위기맥주집', '#네이버예약혜택'],
      situation: '👩❤️👨조용한 데이트',
      latitude: 37.55621,
      longitude: 126.93489,
      rating: 4.8,
      remainingTime: '상시 운영',
      downloads: redirectClicks['3'] || 0,
      redirectUrl: 'https://map.naver.com/v5/entry/place/1758117769'
    },
    {
      id: '4',
      name: '교촌치킨 신촌점',
      type: 'regular', 
      discount: '교촌 앱 포장 주문 시 전 메뉴 10% 즉시 추가할인',
      originalPrice: '허니콤보세트 23,000원 ➔ 앱포장가 20,700원',
      remainingTime: '상시 운영',
      tags: ['#단체뒤풀이', '#치맥회식', '#앱쿠폰할인'],
      situation: '🍻단체 뒤풀이',
      latitude: 37.55831,
      longitude: 126.93582,
      rating: 4.6,
      downloads: redirectClicks['4'] || 0,
      redirectUrl: 'http://www.kyochon.com'
    },
    {
      id: '5',
      name: '설빙 신촌점',
      type: 'regular', 
      discount: '설빙 공식 카카오톡 채널 추가 시 멜론빙수 10% 쿠폰',
      originalPrice: '리얼통통멜론설빙 15,500원 ➔ 쿠폰가 13,950원',
      remainingTime: '상시 운영',
      tags: ['#조용한데이트', '#여름디저트', '#멜론빙수'],
      situation: '👩❤️👨조용한 데이트',
      latitude: 37.55656,
      longitude: 126.93628,
      rating: 4.7,
      downloads: redirectClicks['5'] || 0,
      redirectUrl: 'https://sulbing.com'
    },
    {
      id: '6',
      name: '버거킹 신촌점',
      type: 'regular', 
      discount: '버거킹 공식 앱 쿠폰 제시 시 시그니처 와퍼 세트 최대 35% 할인',
      originalPrice: '치즈와퍼세트 9,700원 ➔ 앱 쿠폰가 6,700원',
      remainingTime: '오늘 마감',
      tags: ['#혼밥', '#버거킹앱할인', '#가성비버거'],
      situation: '🎧혼밥/가성비',
      latitude: 37.55573,
      longitude: 126.93722,
      rating: 4.3,
      downloads: redirectClicks['6'] || 0,
      redirectUrl: 'https://www.burgerking.co.kr/#/event'
    },
    {
      id: '8',
      name: '피자헛 신촌점',
      type: 'regular',
      discount: '포장 주문 시 프리미엄 피자 40% 상시 할인 특별전',
      originalPrice: '슈퍼슈프림 L 29,900원 ➔ 방문포장 17,940원',
      remainingTime: '상시 운영',
      tags: ['#혼밥/가성비', '#방문포장할인', '#피자특가'],
      situation: '🎧혼밥/가성비',
      latitude: 37.55584,
      longitude: 126.93679,
      rating: 4.2,
      downloads: redirectClicks['8'] || 0,
      redirectUrl: 'https://www.pizzahut.co.kr/main'
    },
    {
      id: '9',
      name: 'KFC 신촌역점',
      type: 'regular',
      discount: 'KFC 공식 앱 멤버십 쿠폰팩 전용 버켓/징거버거 세트 할인',
      originalPrice: '징거버거세트 8,900원 ➔ 앱 쿠폰가 6,230원',
      remainingTime: '오늘 마감',
      tags: ['#혼밥', '#KFC쿠폰', '#가성비치킨'],
      situation: '🎧혼밥/가성비',
      latitude: 37.55609,
      longitude: 126.93699,
      rating: 4.1,
      downloads: redirectClicks['9'] || 0,
      redirectUrl: 'https://www.kfckorea.com/'
    },
    {
      id: '10',
      name: '맘스터치 신촌점',
      type: 'regular',
      discount: '맘스 스마트오더 첫 주문 시 버거세트 1,000원 할인 쿠폰 제공',
      originalPrice: '싸이버거세트 6,900원 ➔ 앱 주문가 5,900원',
      remainingTime: '상시 운영',
      tags: ['#혼밥', '#스마트오더', '#싸이버거'],
      situation: '🎧혼밥/가성비',
      latitude: 37.55729,
      longitude: 126.93617,
      rating: 4.4,
      downloads: redirectClicks['10'] || 0,
      redirectUrl: 'https://www.momstouch.co.kr/'
    },
    
    // 2. budget joints under 10k (type: 'budget')
    {
      id: '11',
      name: '꼬숑돈까스',
      type: 'budget',
      discount: '바삭하고 두툼한 수제 등심 돈까스를 단돈 4,000원에 제공',
      originalPrice: '현금 결제 (계좌이체 가능)로 운영되는 신촌 극강 가성비 식당',
      remainingTime: '상시 운영',
      tags: ['#가성비맛집', '#돈까스4000원', '#레전드밥집'],
      situation: '💸가성비(만원이하)',
      latitude: 37.55852,
      longitude: 126.93614,
      rating: 4.5,
      downloads: redirectClicks['11'] || 0,
      redirectUrl: 'https://map.naver.com/v5/entry/place/37286161'
    },
    {
      id: '12',
      name: '이석덕생면파스타 신촌점',
      type: 'budget',
      discount: '매일 직접 제면하는 쫄깃한 자가제면 생면 파스타가 3,900원부터',
      originalPrice: '볼로네제 파스타 3,900원 ➔ 아란치니 세트 9,800원',
      remainingTime: '상시 운영',
      tags: ['#생면파스타', '#데이트맛집', '#이탈리안가성비'],
      situation: '💸가성비(만원이하)',
      latitude: 37.55809,
      longitude: 126.93718,
      rating: 4.6,
      downloads: redirectClicks['12'] || 0,
      redirectUrl: 'https://map.naver.com/v5/entry/place/1529124483'
    },
    {
      id: '13',
      name: '별당김치찜',
      type: 'budget',
      discount: '부드러운 돼지고기 김치찜과 제육볶음 백반 단돈 5,000원',
      originalPrice: '김치찜 백반 5,000원 ➔ 제육볶음 5,000원 (현금)',
      remainingTime: '상시 운영',
      tags: ['#김치찜5000원', '#집밥한식', '#꼬숑돈까스옆집'],
      situation: '💸가성비(만원이하)',
      latitude: 37.55847,
      longitude: 126.93609,
      rating: 4.4,
      downloads: redirectClicks['13'] || 0,
      redirectUrl: 'https://map.naver.com/v5/entry/place/1880356598'
    },
    {
      id: '14',
      name: '신촌수제비',
      type: 'budget',
      discount: '40년 노포에서 직접 뜯어 끓여내는 맑고 푸짐한 옛날 수제비 5,000원',
      originalPrice: '손수제비 5,000원 ➔ 김밥 2,000원',
      remainingTime: '상시 운영',
      tags: ['#수제비5000원', '#신촌노포', '#현지인추천'],
      situation: '💸가성비(만원이하)',
      latitude: 37.55593,
      longitude: 126.93598,
      rating: 4.6,
      downloads: redirectClicks['14'] || 0,
      redirectUrl: 'https://map.naver.com/v5/entry/place/11679093'
    }
  ];

  // Spawn the real Shinchon rainy day guerrilla pub if it is rainy
  if (isRainy) {
    restaurants.push({
      id: '7',
      name: '대포 신촌점',
      type: 'time-sale', 
      discount: '☔ 비오는 날 한정 모듬전 20% 게릴라 즉시 할인',
      originalPrice: '모듬전 18,000원 ➔ 비오는날 할인가 14,400원',
      remainingTime: deal7TimeText,
      tags: ['#비오는날', '#민속주점막걸리', '#게릴라파전할인'],
      situation: '☔비오는 날',
      latitude: 37.55605,
      longitude: 126.93553,
      rating: 4.7,
      downloads: redirectClicks['7'] || 0,
      redirectUrl: 'https://map.naver.com/v5/entry/place/13572856'
    });
  }

  return NextResponse.json(restaurants);
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id || !redirectClicks.hasOwnProperty(id)) {
      return NextResponse.json({ error: 'Invalid Restaurant ID' }, { status: 400 });
    }

    // Increment redirect click stats on the server
    redirectClicks[id] += 1;

    return NextResponse.json({ 
      success: true, 
      id: id,
      newDownloadCount: redirectClicks[id]
    });
  } catch (error) {
    return NextResponse.json({ error: 'Bad Request' }, { status: 400 });
  }
}
