import { Pool } from 'pg';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const kullaniciId = searchParams.get('kullanici_id');
        const urunHash = searchParams.get('urun_hash');

        if (urunHash) {
            // Belirli bir ürünün taramaları
            const result = await pool.query(
                `SELECT t.*, u.urun_adi FROM taramalar t
         JOIN urunler u ON t.urun_id = u.id
         WHERE t.urun_hash = $1
         ORDER BY t.tarama_tarihi DESC
         LIMIT 100`,
                [urunHash]
            );
            return NextResponse.json({ basari: true, taramalar: result.rows });
        }

        if (!kullaniciId) {
            return NextResponse.json({ basari: false, hata: 'Kullanici ID gerekli' }, { status: 400 });
        }

        // Kullanıcının tüm ürünlerinin taramaları
        const result = await pool.query(
            `SELECT t.*, u.urun_adi FROM taramalar t
       JOIN urunler u ON t.urun_id = u.id
       WHERE u.kullanici_id = $1
       ORDER BY t.tarama_tarihi DESC
       LIMIT 200`,
            [kullaniciId]
        );

        return NextResponse.json({ basari: true, taramalar: result.rows });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Bilinmeyen hata';
        return NextResponse.json({ basari: false, hata: message }, { status: 500 });
    }
}