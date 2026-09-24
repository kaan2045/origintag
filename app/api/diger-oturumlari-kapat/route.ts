import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

import { oturumuYenileVeYanitla } from '../../lib/oturumYenile';
import { istekOturumIdAl } from '../../lib/session';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

/**
 * Bu cihaz disindaki butun oturumlari kapatir (kaybolan telefon, unutulan ortak
 * bilgisayar). Istegi yapan cihaz yanittaki yeni token'la acik kalir.
 */
export async function POST(req: NextRequest) {
    try {
        const kullaniciId = await istekOturumIdAl(req);
        if (!kullaniciId) {
            return NextResponse.json({ basari: false, hata: 'Oturum gecersiz, lutfen tekrar giris yapin' }, { status: 401 });
        }
        return await oturumuYenileVeYanitla(pool, kullaniciId);
    } catch (err: unknown) {
        console.error('diger-oturumlari-kapat hatasi:', err);
        return NextResponse.json({ basari: false, hata: 'Sunucu hatasi, lutfen tekrar deneyin' }, { status: 500 });
    }
}
