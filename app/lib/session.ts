import crypto from 'crypto';
import type { NextRequest, NextResponse } from 'next/server';

const SECRET = process.env.SESSION_SECRET;
const SURE_MS = 30 * 24 * 60 * 60 * 1000; // 30 gun
const COOKIE_ADI = 'otag_session';

function imzala(payload: string, secret: string): string {
    return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

export function sessionTokenOlustur(kullaniciId: number): string {
    if (!SECRET) {
        throw new Error('SESSION_SECRET env degiskeni tanimli degil');
    }
    const payload = `${kullaniciId}.${Date.now() + SURE_MS}`;
    return `${payload}.${imzala(payload, SECRET)}`;
}

export function sessionCookieAyarla(res: NextResponse, kullaniciId: number) {
    const token = sessionTokenOlustur(kullaniciId);

    res.cookies.set(COOKIE_ADI, token, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: SURE_MS / 1000,
        path: '/',
    });
}

export function sessionCookieTemizle(res: NextResponse) {
    res.cookies.delete(COOKIE_ADI);
}

export function sessionDogrula(cookieDegeri: string | undefined): number | null {
    if (!cookieDegeri || !SECRET) return null;

    const parcalar = cookieDegeri.split('.');
    if (parcalar.length !== 3) return null;
    const [idStr, expStr, imza] = parcalar;

    const payload = `${idStr}.${expStr}`;
    const beklenenImza = imzala(payload, SECRET);

    const a = Buffer.from(imza);
    const b = Buffer.from(beklenenImza);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

    if (Date.now() > Number(expStr)) return null;

    const kullaniciId = Number(idStr);
    return Number.isFinite(kullaniciId) ? kullaniciId : null;
}

/**
 * Web icin cerez, mobil (React Native) icin Authorization: Bearer header'i kabul eder --
 * ikisi de ayni imzali token'i tasir, browser cerez jar'i olmayan native ortamda gerekli.
 */
export function istekOturumIdAl(req: NextRequest): number | null {
    const authHeader = req.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
        return sessionDogrula(authHeader.slice('Bearer '.length));
    }
    return sessionDogrula(req.cookies.get(COOKIE_ADI)?.value);
}

export { COOKIE_ADI };
