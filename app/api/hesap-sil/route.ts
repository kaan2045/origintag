import { del } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

import { istekOturumIdAl, sessionCookieTemizle } from '../../lib/session';
import { mevcutSifreyiDogrula, SIFRE_HATA_YANITI } from '../../lib/sifreDogrula';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

/** Yalnizca bizim Blob deposundaki dosyalar silinir; baska adresler (orn. /public gorselleri) atlanir. */
const BLOB_ADRESI = /^https:\/\/[a-z0-9]+\.public\.blob\.vercel-storage\.com\//i;

/**
 * Hesabi ve ona bagli butun verileri kalici olarak siler (KVKK silme hakki; App Store
 * da hesap acilabilen uygulamalarda uygulama icinden silmeyi zorunlu tutuyor).
 *
 * Mevcut sifre soruluyor: geri donusu olmayan bu islem calinmis bir oturumla
 * yapilamamali.
 *
 * Tablolar arasindaki yabanci anahtarlar ON DELETE NO ACTION; bu yuzden silme
 * cocuktan ebeveyne dogru ve tek bir transaction icinde. Yarida kalirsa hicbir sey
 * silinmemis olur. Blob'daki fotograflar veritabani islendikten sonra siliniyor:
 * Blob silme basarisiz olursa hesap yine silinmis sayilir (yetim dosya kalir, ama
 * hesabin yarim silinmesinden iyidir) ve hata kaydediliyor.
 *
 * Zincire (Polygon) yazilmis ozetler silinemez; bunlar urun hash'i, adi ve tipinden
 * ibaret, kisisel bilgi icermiyor.
 */
export async function POST(req: NextRequest) {
    try {
        const kullaniciId = await istekOturumIdAl(req);
        if (!kullaniciId) {
            return NextResponse.json({ basari: false, hata: 'Oturum gecersiz, lutfen tekrar giris yapin' }, { status: 401 });
        }

        const body = await req.json();
        const sifre = typeof body.sifre === 'string' ? body.sifre : '';
        if (!sifre) {
            return NextResponse.json({ basari: false, hata: 'Sifre gerekli' }, { status: 400 });
        }

        const dogrulama = await mevcutSifreyiDogrula(pool, kullaniciId, sifre);
        if (dogrulama.durum !== 'dogru') {
            const { hata, status } = SIFRE_HATA_YANITI[dogrulama.durum];
            return NextResponse.json({ basari: false, hata }, { status });
        }
        const { email } = dogrulama;

        const istemci = await pool.connect();
        let dosyalar: string[] = [];
        try {
            await istemci.query('BEGIN');

            // Silmeden once kullaniciya ait dosya adreslerini topla.
            const medya = await istemci.query(
                `SELECT unnest(medya_urls) AS url FROM urunler WHERE kullanici_id = $1
                 UNION SELECT kapak_gorsel_url FROM seyahat_pasaportlari WHERE olusturan_kullanici_id = $1
                 UNION SELECT h.url FROM pasaport_hatiralari h
                         JOIN seyahat_pasaportlari s ON s.pasaport_id = h.pasaport_id
                        WHERE s.olusturan_kullanici_id = $1
                 UNION SELECT logo_url FROM oteller WHERE olusturan_kullanici_id = $1
                 UNION SELECT kapak_gorsel_url FROM oteller WHERE olusturan_kullanici_id = $1`,
                [kullaniciId]
            );
            dosyalar = medya.rows.map((r) => r.url).filter((u): u is string => typeof u === 'string' && BLOB_ADRESI.test(u));

            const pasaportlar = `SELECT pasaport_id FROM seyahat_pasaportlari WHERE olusturan_kullanici_id = $1`;
            const oteller = `SELECT id FROM oteller WHERE olusturan_kullanici_id = $1`;
            await istemci.query(`DELETE FROM pasaport_hatiralari WHERE pasaport_id IN (${pasaportlar})`, [kullaniciId]);
            await istemci.query(
                `DELETE FROM pasaport_olaylari WHERE pasaport_id IN (${pasaportlar}) OR otel_id IN (${oteller})`,
                [kullaniciId]
            );
            await istemci.query('DELETE FROM seyahat_pasaportlari WHERE olusturan_kullanici_id = $1', [kullaniciId]);
            await istemci.query('DELETE FROM oteller WHERE olusturan_kullanici_id = $1', [kullaniciId]);
            await istemci.query('DELETE FROM urunler WHERE kullanici_id = $1', [kullaniciId]);
            // E-postaya bagli kayitlar (tablo henuz olusmamis olabilir, SAVEPOINT ile guvenli).
            for (const tablo of ['giris_denemeleri', 'otp_kodlar', 'sifre_sifirlama_kodlari']) {
                await istemci.query('SAVEPOINT eposta');
                await istemci
                    .query(`DELETE FROM ${tablo} WHERE email = $1`, [email])
                    .catch(() => istemci.query('ROLLBACK TO SAVEPOINT eposta'));
            }
            await istemci.query('DELETE FROM kullanicilar WHERE id = $1', [kullaniciId]);

            await istemci.query('COMMIT');
        } catch (err) {
            await istemci.query('ROLLBACK');
            throw err;
        } finally {
            istemci.release();
        }

        if (dosyalar.length > 0) {
            await del(dosyalar).catch((err) =>
                console.error(`hesap-sil: ${dosyalar.length} Blob dosyasi silinemedi (kullanici ${kullaniciId}):`, err)
            );
        }

        const yanit = NextResponse.json({ basari: true });
        sessionCookieTemizle(yanit);
        return yanit;
    } catch (err: unknown) {
        console.error('hesap-sil hatasi:', err);
        return NextResponse.json({ basari: false, hata: 'Sunucu hatasi, lutfen tekrar deneyin' }, { status: 500 });
    }
}
