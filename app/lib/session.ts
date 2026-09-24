import crypto from 'crypto';
import type { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const SECRET = process.env.SESSION_SECRET;
const SURE_MS = 30 * 24 * 60 * 60 * 1000; // 30 gun
const COOKIE_ADI = 'otag_session';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

/**
 * Oturum surumu: kullanicilar.oturum_surumu token'a gomuluyor ve her istekte
 * veritabanindakiyle karsilastiriliyor. Sifre sifirlaninca surum artiyor ve o ana
 * kadar verilmis butun token'lar (baska cihazlar, calinmis olanlar dahil) aninda
 * gecersizlesiyor. Imza tek basina bunu saglayamiyordu: token 30 gun boyunca
 * sunucunun haberi olmadan gecerliydi.
 */
let surumKolonuHazir: Promise<unknown> | null = null;
export function oturumSurumuKolonunuHazirla() {
    surumKolonuHazir ??= pool
        .query('ALTER TABLE kullanicilar ADD COLUMN IF NOT EXISTS oturum_surumu INTEGER NOT NULL DEFAULT 0')
        .catch((err) => {
            surumKolonuHazir = null; // gecici hataysa sonraki istek tekrar denesin
            throw err;
        });
    return surumKolonuHazir;
}

function imzala(payload: string, secret: string): string {
    return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

export async function oturumSurumuAl(kullaniciId: number): Promise<number> {
    await oturumSurumuKolonunuHazirla();
    const r = await pool.query('SELECT oturum_surumu FROM kullanicilar WHERE id = $1', [kullaniciId]);
    return r.rows[0]?.oturum_surumu ?? 0;
}

export function sessionTokenOlustur(kullaniciId: number, surum: number): string {
    if (!SECRET) {
        throw new Error('SESSION_SECRET env degiskeni tanimli degil');
    }
    const payload = `${kullaniciId}.${surum}.${Date.now() + SURE_MS}`;
    return `${payload}.${imzala(payload, SECRET)}`;
}

export function sessionCookieAyarla(res: NextResponse, kullaniciId: number, surum: number) {
    const token = sessionTokenOlustur(kullaniciId, surum);

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

/**
 * Yalnizca imzayi ve sureyi kontrol eder (veritabanina bakmaz).
 *
 * Iki bicim kabul ediliyor: yeni `id.surum.bitis.imza` ve bu degisiklikten once
 * verilmis `id.bitis.imza`. Eskiler surum 0 sayiliyor; boylece dagitimla herkes
 * cikis yapmak zorunda kalmiyor, ama ilk sifre sifirlamada (surum 1) onlar da
 * gecersizlesiyor.
 */
export function sessionDogrula(cookieDegeri: string | undefined): { kullaniciId: number; surum: number } | null {
    if (!cookieDegeri || !SECRET) return null;

    const parcalar = cookieDegeri.split('.');
    let idStr: string, surumStr: string, expStr: string, imza: string;
    if (parcalar.length === 4) {
        [idStr, surumStr, expStr, imza] = parcalar;
    } else if (parcalar.length === 3) {
        [idStr, expStr, imza] = parcalar;
        surumStr = '0';
    } else {
        return null;
    }

    const payload = parcalar.length === 4 ? `${idStr}.${surumStr}.${expStr}` : `${idStr}.${expStr}`;
    const beklenenImza = imzala(payload, SECRET);

    const a = Buffer.from(imza);
    const b = Buffer.from(beklenenImza);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

    if (Date.now() > Number(expStr)) return null;

    const kullaniciId = Number(idStr);
    const surum = Number(surumStr);
    if (!Number.isInteger(kullaniciId) || !Number.isInteger(surum)) return null;
    return { kullaniciId, surum };
}

/**
 * Web icin cerez, mobil (React Native) icin Authorization: Bearer header'i kabul eder --
 * ikisi de ayni imzali token'i tasir, browser cerez jar'i olmayan native ortamda gerekli.
 *
 * Imza dogruysa token'daki surum veritabanindakiyle karsilastiriliyor (sifre
 * sifirlanmis ya da kullanici silinmisse gecersiz). Bu yuzden async: cagiran her
 * yerde `await` gerekli -- unutulursa Promise her zaman "dolu" gorunur.
 */
export async function istekOturumIdAl(req: NextRequest): Promise<number | null> {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ')
        ? authHeader.slice('Bearer '.length)
        : req.cookies.get(COOKIE_ADI)?.value;

    const oturum = sessionDogrula(token);
    if (!oturum) return null;

    await oturumSurumuKolonunuHazirla();
    const r = await pool.query('SELECT oturum_surumu FROM kullanicilar WHERE id = $1', [oturum.kullaniciId]);
    if (r.rows.length === 0 || r.rows[0].oturum_surumu !== oturum.surum) return null;

    return oturum.kullaniciId;
}

export { COOKIE_ADI };
