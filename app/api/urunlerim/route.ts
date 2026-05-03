import { Pool } from 'pg';
import { NextRequest, NextResponse } from 'next/server';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const kullaniciId = searchParams.get('kullanici_id');

        if (!kullaniciId) {
            return NextResponse.json({ basari: false, hata: 'Kullanici ID gerekli' }, { status: 400 });
        }

        const result = await pool.query(
            'SELECT * FROM urunler WHERE kullanici_id = $1 ORDER BY olusturma_tarihi DESC',
            [kullaniciId]
        );

        return NextResponse.json({ basari: true, urunler: result.rows });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Bilinmeyen hata';
        return NextResponse.json({ basari: false, hata: message }, { status: 500 });
    }
}