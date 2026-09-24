import { Pool } from 'pg';
import { NextRequest, NextResponse } from 'next/server';

import { istekOturumIdAl } from '../../lib/session';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

/**
 * Oturum sahibinin profil bilgisi. Giris/kayit uclari bu bilgiyi zaten donuyor
 * ama yalnizca o istegin anindaki degeri -- profil ekraninin her acilista
 * guncel veriyi gostermesi icin ayri bir GET ucu gerekiyordu.
 */
export async function GET(req: NextRequest) {
    try {
        const kullaniciId = await istekOturumIdAl(req);
        if (!kullaniciId) {
            return NextResponse.json({ basari: false, hata: 'Oturum gecersiz, lutfen tekrar giris yapin' }, { status: 401 });
        }

        const result = await pool.query(
            `SELECT k.ad, k.soyad, k.email, k.firma, k.olusturma_tarihi,
                    (SELECT COUNT(*) FROM urunler u WHERE u.kullanici_id = k.id) AS urun_sayisi,
                    (SELECT COUNT(*) FROM urunler u WHERE u.kullanici_id = k.id AND u.polygon_tx_hash IS NOT NULL) AS zincire_yazilan_sayisi
               FROM kullanicilar k WHERE k.id = $1`,
            [kullaniciId]
        );

        if (result.rows.length === 0) {
            return NextResponse.json({ basari: false, hata: 'Kullanici bulunamadi' }, { status: 404 });
        }

        return NextResponse.json({ basari: true, kullanici: result.rows[0] });
    } catch (err: unknown) {
        console.error('kullanici-bilgi hatasi:', err);
        return NextResponse.json({ basari: false, hata: 'Sunucu hatasi, lutfen tekrar deneyin' }, { status: 500 });
    }
}
