import { Pool } from 'pg';
import { NextRequest, NextResponse } from 'next/server';
import { istekOturumIdAl } from '../../lib/session';
import { olayKaydet } from '../olay-kaydet/route';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const DESTINASYON_KODLARI: Record<string, string> = {
    cappadocia: 'CAP',
    kapadokya: 'CAP',
};

function destinasyonKoduAl(destinasyon: string): string {
    const anahtar = (destinasyon || '').trim().toLocaleLowerCase('tr-TR').replace(/ı/g, 'i');
    if (DESTINASYON_KODLARI[anahtar]) return DESTINASYON_KODLARI[anahtar];
    // Bilinmeyen destinasyonlar icin ilk 3 harfi buyuk harfle kullan
    return (destinasyon || 'GEN').replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase() || 'GEN';
}

export async function POST(req: NextRequest) {
    try {
        const kullaniciId = await istekOturumIdAl(req);
        if (!kullaniciId) {
            return NextResponse.json({ basari: false, hata: 'Oturum gecersiz, lutfen tekrar giris yapin' }, { status: 401 });
        }

        const body = await req.json();
        const {
            misafirAdi, destinasyon, ulke, girisTarihi, cikisTarihi,
            kapakGorselUrl, otel, otelId, rota, deneyimler, mesaj, demoMu,
        } = body;

        if (!misafirAdi || !destinasyon) {
            return NextResponse.json({ basari: false, hata: 'Misafir adi ve destinasyon gerekli' }, { status: 400 });
        }

        await pool.query(`
            CREATE TABLE IF NOT EXISTS seyahat_pasaportlari (
                id SERIAL PRIMARY KEY,
                pasaport_id VARCHAR(50) UNIQUE NOT NULL,
                olusturan_kullanici_id INTEGER REFERENCES kullanicilar(id),
                destinasyon VARCHAR(100),
                ulke VARCHAR(100),
                misafir_adi TEXT,
                giris_tarihi DATE,
                cikis_tarihi DATE,
                kapak_gorsel_url TEXT,
                otel JSONB DEFAULT '{}'::jsonb,
                rota JSONB DEFAULT '[]'::jsonb,
                deneyimler JSONB DEFAULT '[]'::jsonb,
                mesaj TEXT,
                demo_mu BOOLEAN DEFAULT false,
                olusturma_tarihi TIMESTAMP DEFAULT NOW()
            )
        `);
        await pool.query(`
            CREATE TABLE IF NOT EXISTS pasaport_hatiralari (
                id SERIAL PRIMARY KEY,
                pasaport_id VARCHAR(50) REFERENCES seyahat_pasaportlari(pasaport_id),
                tip VARCHAR(20),
                url TEXT,
                not_metni TEXT,
                tarih DATE,
                konum VARCHAR(200),
                deneyim_etiketi VARCHAR(200),
                acilis_tarihi TIMESTAMP,
                olusturma_tarihi TIMESTAMP DEFAULT NOW()
            )
        `);
        await pool.query(`CREATE INDEX IF NOT EXISTS idx_pasaport_hatiralari_pasaport_id ON pasaport_hatiralari(pasaport_id)`);
        await pool.query(`ALTER TABLE seyahat_pasaportlari ADD COLUMN IF NOT EXISTS otel_id INTEGER`);

        const kod = destinasyonKoduAl(destinasyon);
        const yil = new Date().getFullYear();
        const sayacSonuc = await pool.query(
            `SELECT COUNT(*) FROM seyahat_pasaportlari WHERE pasaport_id LIKE $1`,
            [`${kod}-${yil}-%`]
        );
        const sira = parseInt(sayacSonuc.rows[0].count, 10) + 1;
        const pasaportId = `${kod}-${yil}-${String(sira).padStart(6, '0')}`;

        const result = await pool.query(
            `INSERT INTO seyahat_pasaportlari
             (pasaport_id, olusturan_kullanici_id, destinasyon, ulke, misafir_adi, giris_tarihi, cikis_tarihi,
              kapak_gorsel_url, otel, otel_id, rota, deneyimler, mesaj, demo_mu)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *`,
            [
                pasaportId, kullaniciId, destinasyon, ulke || '', misafirAdi, girisTarihi || null, cikisTarihi || null,
                kapakGorselUrl || null,
                JSON.stringify(otel || {}),
                otelId || null,
                JSON.stringify(rota || []),
                JSON.stringify(deneyimler || []),
                mesaj || '',
                !!demoMu,
            ]
        );

        await olayKaydet(pasaportId, otelId || null, 'passport_created', { misafirAdi, destinasyon });

        return NextResponse.json({ basari: true, pasaport: result.rows[0] });
    } catch (err: unknown) {
        console.error('travel-passport-olustur hatasi:', err);
        return NextResponse.json({ basari: false, hata: 'Sunucu hatasi, lutfen tekrar deneyin' }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const kullaniciId = await istekOturumIdAl(req);
        if (!kullaniciId) {
            return NextResponse.json({ basari: false, hata: 'Oturum gecersiz, lutfen tekrar giris yapin' }, { status: 401 });
        }

        await pool.query(`
            CREATE TABLE IF NOT EXISTS seyahat_pasaportlari (
                id SERIAL PRIMARY KEY,
                pasaport_id VARCHAR(50) UNIQUE NOT NULL,
                olusturan_kullanici_id INTEGER REFERENCES kullanicilar(id),
                destinasyon VARCHAR(100),
                ulke VARCHAR(100),
                misafir_adi TEXT,
                giris_tarihi DATE,
                cikis_tarihi DATE,
                kapak_gorsel_url TEXT,
                otel JSONB DEFAULT '{}'::jsonb,
                rota JSONB DEFAULT '[]'::jsonb,
                deneyimler JSONB DEFAULT '[]'::jsonb,
                mesaj TEXT,
                demo_mu BOOLEAN DEFAULT false,
                olusturma_tarihi TIMESTAMP DEFAULT NOW()
            )
        `);

        const result = await pool.query(
            `SELECT * FROM seyahat_pasaportlari WHERE olusturan_kullanici_id = $1 ORDER BY olusturma_tarihi DESC`,
            [kullaniciId]
        );

        return NextResponse.json({ basari: true, pasaportlar: result.rows });
    } catch (err: unknown) {
        console.error('travel-passport-olustur GET hatasi:', err);
        return NextResponse.json({ basari: false, hata: 'Sunucu hatasi, lutfen tekrar deneyin' }, { status: 500 });
    }
}
