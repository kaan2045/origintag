import { Pool } from 'pg';
import { NextRequest, NextResponse } from 'next/server';

import { istekOturumIdAl } from '../../lib/session';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

/**
 * Urun kaydini siler.
 *
 * Kayit gercekten siliniyor: silinen urunun QR'i okutuldugunda dogrulama sayfasi
 * "kayit bulunamadi" demeli, "var ama gizli" degil. Zincirdeki ozet kaliyor --
 * blockchain'den kayit silinemez, zaten silinebilseydi dogrulamanin anlami olmazdi.
 */
export async function POST(req: NextRequest) {
    try {
        const kullaniciId = istekOturumIdAl(req);
        if (!kullaniciId) {
            return NextResponse.json({ basari: false, hata: 'Oturum gecersiz, lutfen tekrar giris yapin' }, { status: 401 });
        }

        const { hash } = await req.json();
        if (!hash) {
            return NextResponse.json({ basari: false, hata: 'Urun belirtilmedi' }, { status: 400 });
        }

        // kullanici_id kosulu sahiplik kontrolu: baskasinin urununu silemesin.
        const result = await pool.query(
            `DELETE FROM urunler WHERE hash = $1 AND kullanici_id = $2`,
            [hash, kullaniciId]
        );

        if (result.rowCount === 0) {
            return NextResponse.json({ basari: false, hata: 'Urun bulunamadi' }, { status: 404 });
        }

        return NextResponse.json({ basari: true });
    } catch (err: unknown) {
        console.error('urun-sil hatasi:', err);
        return NextResponse.json({ basari: false, hata: 'Sunucu hatasi, lutfen tekrar deneyin' }, { status: 500 });
    }
}
