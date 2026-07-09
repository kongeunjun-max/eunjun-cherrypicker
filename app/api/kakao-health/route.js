import { NextResponse } from 'next/server';
import { KAKAO_APP_KEY, KAKAO_SDK_URL } from '@/app/lib/kakao';

// Diagnoses why the Kakao Maps SDK <script> failed in the browser.
//
// The browser cannot read the failure itself: dapi.kakao.com serves the SDK
// without CORS headers, so a client-side fetch() is blocked and the script tag's
// error event carries no detail. Replaying the request server-side — same key,
// same Referer — surfaces Kakao's actual JSON error body.
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const origin = searchParams.get('origin') || new URL(request.url).origin;

  try {
    const res = await fetch(KAKAO_SDK_URL, {
      headers: { Referer: `${origin}/` },
      cache: 'no-store'
    });

    if (res.ok) {
      return NextResponse.json({ ok: true, origin, status: res.status });
    }

    const body = await res.text();
    let errorType = null;
    let message = body.slice(0, 300);

    try {
      const parsed = JSON.parse(body);
      errorType = parsed.errorType ?? null;
      message = parsed.message ?? message;
    } catch {
      // Kakao returned something other than its usual JSON error envelope.
    }

    return NextResponse.json({
      ok: false,
      origin,
      status: res.status,
      errorType,
      message,
      appKeyPreview: `${KAKAO_APP_KEY.slice(0, 6)}…${KAKAO_APP_KEY.slice(-4)}`,
      usingEnvKey: Boolean(process.env.NEXT_PUBLIC_KAKAO_APP_KEY)
    });
  } catch (err) {
    return NextResponse.json({
      ok: false,
      origin,
      status: 0,
      errorType: 'NetworkError',
      message: err.message
    });
  }
}
