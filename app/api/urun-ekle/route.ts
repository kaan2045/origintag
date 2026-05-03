import { Pool } from 'pg';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { urunAdi, urunTipi, bolge, hasat, miktar, birim, aciklama, kullaniciId, detaylar } = body;

        const veri = `${urunAdi}${urunTipi}${bolge}${hasat}${miktar}${birim}${Date.now()}`;
        const hash = crypto.createHash('sha256').update(veri).digest('hex');

        const result = await pool.query(
            `INSERT INTO urunler (kullanici_id, urun_adi, urun_tipi, bolge, hasat_tarihi, miktar, birim, aciklama, hash, detaylar)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
            [kullaniciId || 1, urunAdi, urunTipi, bolge, hasat, miktar, birim, aciklama, hash, JSON.stringify(detaylar || {})]
        );

        return NextResponse.json({ basari: true, urun: result.rows[0], hash });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Bilinmeyen hata';
        return NextResponse.json({ basari: false, hata: message }, { status: 500 });
    }
}