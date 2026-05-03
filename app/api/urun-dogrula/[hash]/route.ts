import { Pool } from 'pg';
import { NextRequest, NextResponse } from 'next/server';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ hash: string }> }
) {
    try {
        const { hash } = await context.params;

        const result = await pool.query(
            `SELECT * FROM urunler WHERE hash = $1`,
            [hash]
        );

        if (result.rows.length === 0) {
            return NextResponse.json({ basari: false, hata: 'Urun bulunamadi' }, { status: 404 });
        }

        return NextResponse.json({ basari: true, urun: result.rows[0] });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Bilinmeyen hata';
        return NextResponse.json({ basari: false, hata: message }, { status: 500 });
    }
}