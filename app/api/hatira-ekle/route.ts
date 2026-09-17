import { Pool } from 'pg';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const GECERLI_TIPLER = ['foto', 'video', 'not', 'gelecek_video'];

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { pasaportId, tip, url, notMetni, tarih, konum, deneyimEtiketi, acilisTarihi } = body;

        if (!pasaportId || !tip || !GECERLI_TIPLER.includes(tip)) {
            return NextResponse.json({ basari: false, hata: 'Gecersiz istek' }, { status: 400 });
        }
        if ((tip === 'foto' || tip === 'video' || tip === 'gelecek_video') && !url) {
            return NextResponse.json({ basari: false, hata: 'Dosya URL gerekli' }, { status: 400 });
        }
        if (notMetni && notMetni.length > 2000) {
            return NextResponse.json({ basari: false, hata: 'Not cok uzun' }, { status: 400 });
        }

        // Pasaportun gercekten var oldugunu dogrula -- rastgele pasaportId'lere hatira eklenmesin
        const pasaportVarMi = await pool.query(
            `SELECT 1 FROM seyahat_pasaportlari WHERE pasaport_id = $1`,
            [pasaportId]
        );
        if (pasaportVarMi.rows.length === 0) {
            return NextResponse.json({ basari: false, hata: 'Pasaport bulunamadi' }, { status: 404 });
        }

        const result = await pool.query(
            `INSERT INTO pasaport_hatiralari (pasaport_id, tip, url, not_metni, tarih, konum, deneyim_etiketi, acilis_tarihi)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
            [
                pasaportId, tip, url || null, notMetni || null,
                tarih || null, konum || null, deneyimEtiketi || null,
                acilisTarihi || null,
            ]
        );

        return NextResponse.json({ basari: true, hatira: result.rows[0] });
    } catch (err: unknown) {
        console.error('hatira-ekle hatasi:', err);
        return NextResponse.json({ basari: false, hata: 'Sunucu hatasi, lutfen tekrar deneyin' }, { status: 500 });
    }
}
