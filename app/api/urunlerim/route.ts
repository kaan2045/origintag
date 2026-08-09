import { Pool } from 'pg';
import { NextRequest, NextResponse } from 'next/server';
import { istekOturumIdAl } from '../../lib/session';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

export async function GET(req: NextRequest) {
    try {
        const kullaniciId = istekOturumIdAl(req);

        if (!kullaniciId) {
            return NextResponse.json({ basari: false, hata: 'Oturum gecersiz, lutfen tekrar giris yapin' }, { status: 401 });
        }

        const result = await pool.query(
            'SELECT * FROM urunler WHERE kullanici_id = $1 ORDER BY olusturma_tarihi DESC',
            [kullaniciId]
        );

        return NextResponse.json({ basari: true, urunler: result.rows });
    } catch (err: unknown) {
        console.error('urunlerim hatasi:', err);
        return NextResponse.json({ basari: false, hata: 'Sunucu hatasi, lutfen tekrar deneyin' }, { status: 500 });
    }
}