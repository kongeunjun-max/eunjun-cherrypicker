// Kakao Maps JavaScript app key.
//
// This key is not a secret: the browser must send it to dapi.kakao.com in the
// SDK <script> URL, so it is public by design. Kakao restricts it by referrer
// instead — every origin the app is served from must be registered under
// "내 애플리케이션 → 플랫폼 → Web → 사이트 도메인" in Kakao Developers, or the SDK
// responds 401 AccessDeniedError and the map never loads.
export const KAKAO_APP_KEY =
  process.env.NEXT_PUBLIC_KAKAO_APP_KEY || '3a6b39fc070eea44f186cd9fd7306476';

export const KAKAO_SDK_URL = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_APP_KEY}&autoload=false`;
