import { Pool } from 'pg';
import '../../lib/pgTarih';
import { NextRequest, NextResponse } from 'next/server';

import { istekOturumIdAl } from '../../lib/session';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

/**
 * Urun kaydini gunceller.
 *
 * `hash` bilerek degismiyor: QR etiketler basilmis olabilir ve hash urunun kimligi.
 * Yeniden hesaplasak sahadaki her etiket olu baglantiya donerdi. Bunun bedeli, zincire
 * yazilan ozetin artik guncel veriyi degil kaydin ilk halini temsil etmesi -- bu yuzden
 * `guncelleme_tarihi` tutuluyor ve dogrulama sayfasi kaydin sonradan degistigini
 * ziyaretciye soyluyor.
 */
export async function POST(req: NextRequest) {
    try {
        const kullaniciId = await istekOturumIdAl(req);
        if (!kullaniciId) {
            return NextResponse.json({ basari: false, hata: 'Oturum gecersiz, lutfen tekrar giris yapin' }, { status: 401 });
        }

        const body = await req.json();
        const { hash, urunAdi, urunTipi, bolge, hasat, miktar, birim, aciklama, detaylar, medyaUrls, surdurulebilirlik } = body;

        if (!hash) {
            return NextResponse.json({ basari: false, hata: 'Urun belirtilmedi' }, { status: 400 });
        }
        if (!urunAdi || !urunTipi || !bolge || !hasat || !miktar) {
            return NextResponse.json({ basari: false, hata: 'Zorunlu alanlar eksik' }, { status: 400 });
        }

        await pool.query(`ALTER TABLE urunler ADD COLUMN IF NOT EXISTS guncelleme_tarihi TIMESTAMP`);

        // kullanici_id kosulu sahiplik kontrolu: baskasinin urununu guncelleyemesin.
        const result = await pool.query(
            `UPDATE urunler
                SET urun_adi = $1, urun_tipi = $2, bolge = $3, hasat_tarihi = $4,
                    miktar = $5, birim = $6, aciklama = $7, detaylar = $8,
                    medya_urls = $9, surdurulebilirlik = $10, guncelleme_tarihi = NOW()
              WHERE hash = $11 AND kullanici_id = $12
              RETURNING *`,
            [
                urunAdi, urunTipi, bolge, hasat, miktar, birim, aciklama,
                JSON.stringify(detaylar || {}),
                medyaUrls || [],
                JSON.stringify(surdurulebilirlik || {}),
                hash, kullaniciId,
            ]
        );

        if (result.rowCount === 0) {
            return NextResponse.json({ basari: false, hata: 'Urun bulunamadi' }, { status: 404 });
        }

        return NextResponse.json({ basari: true, urun: result.rows[0] });
    } catch (err: unknown) {
        console.error('urun-guncelle hatasi:', err);
        return NextResponse.json({ basari: false, hata: 'Sunucu hatasi, lutfen tekrar deneyin' }, { status: 500 });
    }
}
