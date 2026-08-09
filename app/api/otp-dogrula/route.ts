import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const MAX_DENEME = 5;

export async function POST(req: NextRequest) {
    try {
        const { email, kod } = await req.json();

        if (!email || !kod) {
            return NextResponse.json({ basari: false, hata: 'Email ve kod gerekli' }, { status: 400 });
        }

        await pool.query(`ALTER TABLE otp_kodlar ADD COLUMN IF NOT EXISTS deneme_sayisi INTEGER NOT NULL DEFAULT 0`);

        const mevcut = await pool.query(
            'SELECT deneme_sayisi FROM otp_kodlar WHERE email = $1 AND gecerlilik > NOW()',
            [email]
        );
        if (mevcut.rows.length > 0 && mevcut.rows[0].deneme_sayisi >= MAX_DENEME) {
            await pool.query('DELETE FROM otp_kodlar WHERE email = $1', [email]);
            return NextResponse.json({ basari: false, hata: 'Cok fazla hatali deneme. Yeni kod isteyin.' }, { status: 429 });
        }

        const result = await pool.query(
            'SELECT * FROM otp_kodlar WHERE email = $1 AND kod = $2 AND gecerlilik > NOW()',
            [email, kod]
        );

        if (result.rows.length === 0) {
            await pool.query(
                'UPDATE otp_kodlar SET deneme_sayisi = deneme_sayisi + 1 WHERE email = $1',
                [email]
            );
            return NextResponse.json({ basari: false, hata: 'Kod hatali veya suresi dolmus' }, { status: 400 });
        }

        await pool.query('DELETE FROM otp_kodlar WHERE email = $1', [email]);

        return NextResponse.json({ basari: true });
    } catch (err: unknown) {
        console.error('otp-dogrula hatasi:', err);
        return NextResponse.json({ basari: false, hata: 'Sunucu hatasi, lutfen tekrar deneyin' }, { status: 500 });
    }
}