import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

export async function POST(req: NextRequest) {
    try {
        const { email, kod } = await req.json();

        const result = await pool.query(
            'SELECT * FROM otp_kodlar WHERE email = $1 AND kod = $2 AND gecerlilik > NOW()',
            [email, kod]
        );

        if (result.rows.length === 0) {
            return NextResponse.json({ basari: false, hata: 'Kod hatali veya suresi dolmus' }, { status: 400 });
        }

        await pool.query('DELETE FROM otp_kodlar WHERE email = $1', [email]);

        return NextResponse.json({ basari: true });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Bilinmeyen hata';
        return NextResponse.json({ basari: false, hata: message }, { status: 500 });
    }
}