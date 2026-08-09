import crypto from 'crypto';
import type { NextResponse } from 'next/server';

const SECRET = process.env.SESSION_SECRET;
const SURE_MS = 30 * 24 * 60 * 60 * 1000; // 30 gun
const COOKIE_ADI = 'otag_session';

function imzala(payload: string, secret: string): string {
    return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

export function sessionCookieAyarla(res: NextResponse, kullaniciId: number) {
    if (!SECRET) {
        throw new Error('SESSION_SECRET env degiskeni tanimli degil');
    }
    const payload = `${kullaniciId}.${Date.now() + SURE_MS}`;
    const token = `${payload}.${imzala(payload, SECRET)}`;

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

export { COOKIE_ADI };
