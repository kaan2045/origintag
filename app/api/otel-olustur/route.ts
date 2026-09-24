import { Pool } from 'pg';
import { NextRequest, NextResponse } from 'next/server';
import { istekOturumIdAl } from '../../lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function semaHazirla() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS oteller (
            id SERIAL PRIMARY KEY,
            olusturan_kullanici_id INTEGER REFERENCES kullanicilar(id),
            ad TEXT NOT NULL,
            logo_url TEXT,
            kapak_gorsel_url TEXT,
            sehir VARCHAR(150),
            harita_url TEXT,
            telefon VARCHAR(50),
            website TEXT,
            instagram VARCHAR(150),
            checkin_saat VARCHAR(10),
            checkout_saat VARCHAR(10),
            olusturma_tarihi TIMESTAMP DEFAULT NOW()
        )
    `);
}

export async function POST(req: NextRequest) {
    try {
        const kullaniciId = await istekOturumIdAl(req);
        if (!kullaniciId) {
            return NextResponse.json({ basari: false, hata: 'Oturum gecersiz, lutfen tekrar giris yapin' }, { status: 401 });
        }

        const body = await req.json();
        const { ad, logoUrl, kapakGorselUrl, sehir, haritaUrl, telefon, website, instagram, checkinSaat, checkoutSaat } = body;

        if (!ad) {
            return NextResponse.json({ basari: false, hata: 'Otel adi gerekli' }, { status: 400 });
        }

        await semaHazirla();

        const result = await pool.query(
            `INSERT INTO oteller
             (olusturan_kullanici_id, ad, logo_url, kapak_gorsel_url, sehir, harita_url, telefon, website, instagram, checkin_saat, checkout_saat)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
            [kullaniciId, ad, logoUrl || null, kapakGorselUrl || null, sehir || null, haritaUrl || null, telefon || null, website || null, instagram || null, checkinSaat || null, checkoutSaat || null]
        );

        return NextResponse.json({ basari: true, otel: result.rows[0] });
    } catch (err: unknown) {
        console.error('otel-olustur hatasi:', err);
        return NextResponse.json({ basari: false, hata: 'Sunucu hatasi, lutfen tekrar deneyin' }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const kullaniciId = await istekOturumIdAl(req);
        if (!kullaniciId) {
            return NextResponse.json({ basari: false, hata: 'Oturum gecersiz, lutfen tekrar giris yapin' }, { status: 401 });
        }

        await semaHazirla();

        const result = await pool.query(
            `SELECT * FROM oteller WHERE olusturan_kullanici_id = $1 ORDER BY olusturma_tarihi DESC`,
            [kullaniciId]
        );

        return NextResponse.json({ basari: true, oteller: result.rows });
    } catch (err: unknown) {
        console.error('otel-olustur GET hatasi:', err);
        return NextResponse.json({ basari: false, hata: 'Sunucu hatasi, lutfen tekrar deneyin' }, { status: 500 });
    }
}
