import { Pool } from 'pg';
import { NextRequest, NextResponse } from 'next/server';
import { sahtecilikKontrolEt, TaramaNoktasi } from '../../lib/sahtecilik';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

export async function POST(req: NextRequest) {
    try {
        const { hash } = await req.json();

        if (!hash) {
            return NextResponse.json({ basari: false, hata: 'Hash gerekli' }, { status: 400 });
        }

        // Ürünü bul
        const urunResult = await pool.query('SELECT id FROM urunler WHERE hash = $1', [hash]);
        if (urunResult.rows.length === 0) {
            return NextResponse.json({ basari: false, hata: 'Urun bulunamadi' }, { status: 404 });
        }
        const urunId = urunResult.rows[0].id;

        // IP adresini al
        const ip =
            req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
            req.headers.get('x-real-ip') ||
            '0.0.0.0';

        // Cihaz tipi tespiti
        const userAgent = req.headers.get('user-agent') || '';
        const cihazTipi = /mobile|android|iphone/i.test(userAgent) ? 'Mobil' : 'Masaüstü';

        // IP'den şehir tespiti (ücretsiz ip-api.com servisi)
        let sehir = null;
        let ilce = null;
        let ulke = null;
        let enlem: number | null = null;
        let boylam: number | null = null;

        try {
            if (ip && ip !== '0.0.0.0' && ip !== '127.0.0.1' && !ip.startsWith('::1')) {
                const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,regionName,city,lat,lon`, {
                    signal: AbortSignal.timeout(3000),
                });
                const geoData = await geoRes.json();
                if (geoData.status === 'success') {
                    sehir = geoData.regionName || null;
                    ilce = geoData.city || null;
                    ulke = geoData.country || null;
                    enlem = typeof geoData.lat === 'number' ? geoData.lat : null;
                    boylam = typeof geoData.lon === 'number' ? geoData.lon : null;
                }
            }
        } catch {
            // Geo servis hatası olsa da taramayı kaydet, konum bilgisi olmadan
        }

        // --- Sahtecilik / anomali kontrolü ---
        // Aynı ürünün son 24 saatteki taramalarını çek, yeni taramayla karşılaştır
        let supheli = false;
        let supheliTip: string | null = null;
        let supheliDetay: string | null = null;

        try {
            const gecmisResult = await pool.query(
                `SELECT enlem, boylam, tarama_tarihi FROM taramalar
                 WHERE urun_hash = $1 AND tarama_tarihi > NOW() - INTERVAL '24 hours'
                 ORDER BY tarama_tarihi DESC
                 LIMIT 200`,
                [hash]
            );

            const oncekiTaramalar: TaramaNoktasi[] = gecmisResult.rows.map(r => ({
                enlem: r.enlem,
                boylam: r.boylam,
                tarama_tarihi: r.tarama_tarihi,
            }));

            const sonuc = sahtecilikKontrolEt(
                { enlem, boylam, tarama_tarihi: new Date() },
                oncekiTaramalar
            );

            supheli = sonuc.supheli;
            supheliTip = sonuc.tip;
            supheliDetay = sonuc.detay;
        } catch {
            // Sahtecilik kontrolü başarısız olsa da taramayı kaydetmeye devam et
        }

        await pool.query(
            `INSERT INTO taramalar (urun_id, urun_hash, ip_adresi, sehir, ilce, ulke, cihaz_tipi, enlem, boylam, supheli, supheli_tip, supheli_detay)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
            [urunId, hash, ip, sehir, ilce, ulke, cihazTipi, enlem, boylam, supheli, supheliTip, supheliDetay]
        );

        return NextResponse.json({ basari: true });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Bilinmeyen hata';
        return NextResponse.json({ basari: false, hata: message }, { status: 500 });
    }
}