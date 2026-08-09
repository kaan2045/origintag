import { NextRequest, NextResponse } from 'next/server';

/**
 * Mobil uygulama (React Native/Expo) ve olasi baska istemciler API'yi farkli bir origin'den
 * cagirir; tarayicilar bunu CORS ile engeller (native uygulamalar bu kisitlamaya tabi degil,
 * bu middleware sadece web tabanli cagrilar icin gerekli). Authorization: Bearer token
 * mimarisi kullanildigindan (cerez degil) "*" origin acmak guvenli: cross-origin istekler
 * cerezi tasimaz (Allow-Credentials set edilmiyor), token da zaten istemcinin kendi
 * SecureStore/localStorage'inda -- baska bir site otomatik olarak elde edemez.
 */
export function middleware(req: NextRequest) {
  const res = req.method === 'OPTIONS' ? new NextResponse(null, { status: 204 }) : NextResponse.next();
  res.headers.set('Access-Control-Allow-Origin', '*');
  res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return res;
}

export const config = {
  matcher: '/api/:path*',
};
