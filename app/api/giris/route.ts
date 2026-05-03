import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

export async function POST(req: NextRequest) {
    try {
        const { email, sifre } = await req.json();

        const result = await pool.query(
            'SELECT id, ad, soyad, sifre_hash FROM kullanicilar WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            return NextResponse.json({ basari: false, hata: 'Email veya sifre hatali' }, { status: 401 });
        }

        const kullanici = result.rows[0];
        const sifreDogruMu = await bcrypt.compare(sifre, kullanici.sifre_hash);

        if (!sifreDogruMu) {
            return NextResponse.json({ basari: false, hata: 'Email veya sifre hatali' }, { status: 401 });
        }

        return NextResponse.json({
            basari: true,
            kullanici_id: kullanici.id,
            ad: kullanici.ad + ' ' + kullanici.soyad,
        });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Bilinmeyen hata';
        return NextResponse.json({ basari: false, hata: message }, { status: 500 });
    }
}