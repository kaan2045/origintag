import { Pool } from 'pg';
import '../../lib/pgTarih';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { istekOturumIdAl } from '../../lib/session';
import { AKTIF_AG, yazmaSozlesmesi, zincirAgiKolonunuHazirla } from '../../lib/zincir';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function polygonaYaz(hash: string, urunAdi: string, urunTipi: string) {
    try {
        const contract = await yazmaSozlesmesi();
        const tx = await contract.kayitEkle(hash, urunAdi, urunTipi);
        await tx.wait();

        return { basari: true, txHash: tx.hash };
    } catch (err: unknown) {
        console.error('Polygon yazma hatasi:', err);
        return { basari: false, hata: 'Blockchain yazimi basarisiz' };
    }
}

export async function POST(req: NextRequest) {
    try {
        const kullaniciId = await istekOturumIdAl(req);
        if (!kullaniciId) {
            return NextResponse.json({ basari: false, hata: 'Oturum gecersiz, lutfen tekrar giris yapin' }, { status: 401 });
        }

        const body = await req.json();
        const { urunAdi, urunTipi, bolge, hasat, miktar, birim, aciklama, detaylar, medyaUrls, surdurulebilirlik } = body;
        // Mobilin her yeni urun icin urettigi kimlik. Sahada istek sunucuya ulasip cevap
        // telefona donmeden baglanti kopabiliyor; cevrimdisi kuyruk urunu yeniden
        // gonderdiginde ikinci bir kayit acilmasin diye.
        const istemciKimligi =
            typeof body.istemciKimligi === 'string' && /^[A-Za-z0-9-]{8,64}$/.test(body.istemciKimligi)
                ? body.istemciKimligi
                : null;

        const veri = `${urunAdi}${urunTipi}${bolge}${hasat}${miktar}${birim}${Date.now()}`;
        const hash = crypto.createHash('sha256').update(veri).digest('hex');

        await pool.query(`ALTER TABLE urunler ADD COLUMN IF NOT EXISTS surdurulebilirlik JSONB DEFAULT '{}'::jsonb`);
        await pool.query(`ALTER TABLE urunler ADD COLUMN IF NOT EXISTS istemci_kimligi VARCHAR(64)`);
        await pool.query(
            `CREATE UNIQUE INDEX IF NOT EXISTS urunler_istemci_kimligi_benzersiz
               ON urunler (kullanici_id, istemci_kimligi) WHERE istemci_kimligi IS NOT NULL`
        );

        // Once veritabanina kaydet. Ayni istemci kimligi daha once geldiyse eklemez.
        const result = await pool.query(
            `INSERT INTO urunler (kullanici_id, urun_adi, urun_tipi, bolge, hasat_tarihi, miktar, birim, aciklama, hash, detaylar, medya_urls, surdurulebilirlik, istemci_kimligi)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
             ON CONFLICT (kullanici_id, istemci_kimligi) WHERE istemci_kimligi IS NOT NULL DO NOTHING
             RETURNING *`,
            [
                kullaniciId, urunAdi, urunTipi, bolge, hasat,
                miktar, birim, aciklama, hash,
                JSON.stringify(detaylar || {}),
                medyaUrls || [],
                JSON.stringify(surdurulebilirlik || {}),
                istemciKimligi,
            ]
        );

        if (result.rows.length === 0) {
            // Tekrar gonderim: ilk istek zaten kaydetmis, onu dondur.
            const mevcut = await pool.query(
                'SELECT * FROM urunler WHERE kullanici_id = $1 AND istemci_kimligi = $2',
                [kullaniciId, istemciKimligi]
            );
            return NextResponse.json({ basari: true, tekrar: true, urun: mevcut.rows[0], hash: mevcut.rows[0].hash });
        }

        // Sonra Polygon blockchain'e yaz (arka planda, kullaniciyi bekletmeden sonuc donsun)
        const polygonSonuc = await polygonaYaz(hash, urunAdi, urunTipi);

        // Polygon tx hash'ini veritabanina da kaydet (basarili olduysa)
        if (polygonSonuc.basari && polygonSonuc.txHash) {
            await zincirAgiKolonunuHazirla(pool);
            await pool.query(
                `UPDATE urunler SET polygon_tx_hash = $1, zincir_agi = $2 WHERE hash = $3`,
                [polygonSonuc.txHash, AKTIF_AG, hash]
            );
        }

        return NextResponse.json({
            basari: true,
            urun: result.rows[0],
            hash,
            polygon: polygonSonuc
        });
    } catch (err: unknown) {
        console.error('urun-ekle hatasi:', err);
        return NextResponse.json({ basari: false, hata: 'Sunucu hatasi, lutfen tekrar deneyin' }, { status: 500 });
    }
}