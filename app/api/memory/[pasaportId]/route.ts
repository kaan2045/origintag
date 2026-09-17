import { Pool } from 'pg';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ pasaportId: string }> }
) {
    try {
        const { pasaportId } = await context.params;

        const pasaportSonuc = await pool.query(
            `SELECT * FROM seyahat_pasaportlari WHERE pasaport_id = $1`,
            [pasaportId]
        );

        if (pasaportSonuc.rows.length === 0) {
            return NextResponse.json({ basari: false, hata: 'Pasaport bulunamadi' }, { status: 404 });
        }

        const hatiralarSonuc = await pool.query(
            `SELECT * FROM pasaport_hatiralari WHERE pasaport_id = $1 ORDER BY olusturma_tarihi DESC`,
            [pasaportId]
        );

        return NextResponse.json({
            basari: true,
            pasaport: pasaportSonuc.rows[0],
            hatiralar: hatiralarSonuc.rows,
        });
    } catch (err: unknown) {
        console.error('memory GET hatasi:', err);
        return NextResponse.json({ basari: false, hata: 'Sunucu hatasi, lutfen tekrar deneyin' }, { status: 500 });
    }
}
