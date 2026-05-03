import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

export async function POST(req: NextRequest) {
    try {
        const { ad, soyad, email, firma, sifre } = await req.json();

        const mevcut = await pool.query(
            'SELECT id FROM kullanicilar WHERE email = $1',
            [email]
        );

        if (mevcut.rows.length > 0) {
            return NextResponse.json({ basari: false, hata: 'Bu email zaten kayitli' }, { status: 400 });
        }

        await pool.query(`
      ALTER TABLE kullanicilar ADD COLUMN IF NOT EXISTS sifre_hash VARCHAR(200)
    `);

        const sifre_hash = await bcrypt.hash(sifre, 10);

        const result = await pool.query(
            'INSERT INTO kullanicilar (ad, soyad, email, firma, sifre_hash) VALUES ($1, $2, $3, $4, $5) RETURNING id, ad, soyad',
            [ad, soyad, email, firma, sifre_hash]
        );

        return NextResponse.json({
            basari: true,
            kullanici_id: result.rows[0].id,
            ad: result.rows[0].ad + ' ' + result.rows[0].soyad,
        });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Bilinmeyen hata';
        return NextResponse.json({ basari: false, hata: message }, { status: 500 });
    }
}