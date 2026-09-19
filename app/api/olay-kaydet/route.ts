import { Pool } from 'pg';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const GECERLI_OLAYLAR = [
    'passport_created',
    'passport_opened',
    'photo_uploaded',
    'place_added',
    'experience_clicked',
    'hotel_clicked',
    'passport_shared',
];

export async function semaHazirlaOlaylar() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS pasaport_olaylari (
            id SERIAL PRIMARY KEY,
            pasaport_id VARCHAR(50),
            otel_id INTEGER,
            olay_tipi VARCHAR(50) NOT NULL,
            meta JSONB DEFAULT '{}'::jsonb,
            olusturma_tarihi TIMESTAMP DEFAULT NOW()
        )
    `);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_pasaport_olaylari_otel_id ON pasaport_olaylari(otel_id)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_pasaport_olaylari_pasaport_id ON pasaport_olaylari(pasaport_id)`);
    // otel_id, seyahat_pasaportlari'nda henuz olmayabilir -- FK kisitlamasi yok, siralama bagimliligi olmasin
    await pool.query(`ALTER TABLE seyahat_pasaportlari ADD COLUMN IF NOT EXISTS otel_id INTEGER`);
}

/** Sunucu icinden (ornegin travel-passport-olustur route'undan) dogrudan cagrilir. */
export async function olayKaydet(pasaportId: string | null, otelId: number | null, olayTipi: string, meta: Record<string, unknown> = {}) {
    try {
        await semaHazirlaOlaylar();
        await pool.query(
            `INSERT INTO pasaport_olaylari (pasaport_id, otel_id, olay_tipi, meta) VALUES ($1, $2, $3, $4)`,
            [pasaportId, otelId, olayTipi, JSON.stringify(meta)]
        );
    } catch (err) {
        console.error('olay-kaydet (dahili) hatasi:', err);
        // Event kaydi basarisiz olsa da ana akisi bozma
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { pasaportId, olayTipi, meta } = body;

        if (!olayTipi || !GECERLI_OLAYLAR.includes(olayTipi)) {
            return NextResponse.json({ basari: false, hata: 'Gecersiz olay tipi' }, { status: 400 });
        }

        await semaHazirlaOlaylar();

        let otelId: number | null = null;
        if (pasaportId) {
            const pasaportSonuc = await pool.query(
                `SELECT otel_id FROM seyahat_pasaportlari WHERE pasaport_id = $1`,
                [pasaportId]
            );
            if (pasaportSonuc.rows.length === 0) {
                return NextResponse.json({ basari: false, hata: 'Pasaport bulunamadi' }, { status: 404 });
            }
            otelId = pasaportSonuc.rows[0].otel_id;
        }

        await pool.query(
            `INSERT INTO pasaport_olaylari (pasaport_id, otel_id, olay_tipi, meta) VALUES ($1, $2, $3, $4)`,
            [pasaportId || null, otelId, olayTipi, JSON.stringify(meta || {})]
        );

        return NextResponse.json({ basari: true });
    } catch (err: unknown) {
        console.error('olay-kaydet hatasi:', err);
        return NextResponse.json({ basari: false, hata: 'Sunucu hatasi' }, { status: 500 });
    }
}
