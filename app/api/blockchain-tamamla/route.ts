import { Pool } from 'pg';
import { NextRequest, NextResponse } from 'next/server';
import { istekOturumIdAl } from '../../lib/session';
import { AKTIF_AG, yazmaSozlesmesi, zincirAgiKolonunuHazirla } from '../../lib/zincir';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

/**
 * Urunu aktif aga yazar: ilk yazim basarisiz olduysa tekrar denemek icin, ya da ana
 * aga gecildikten sonra Amoy'da kalmis eski bir kaydi ana aga tasimak icin.
 */
export async function POST(req: NextRequest) {
    try {
        const kullaniciId = await istekOturumIdAl(req);
        if (!kullaniciId) {
            return NextResponse.json({ basari: false, hata: 'Oturum gecersiz, lutfen tekrar giris yapin' }, { status: 401 });
        }

        const { hash } = await req.json();
        if (!hash) {
            return NextResponse.json({ basari: false, hata: 'hash gerekli' }, { status: 400 });
        }

        await zincirAgiKolonunuHazirla(pool);
        const urunSonuc = await pool.query('SELECT * FROM urunler WHERE hash = $1 AND kullanici_id = $2', [hash, kullaniciId]);
        const urun = urunSonuc.rows[0];
        if (!urun) {
            return NextResponse.json({ basari: false, hata: 'Ürün bulunamadı' }, { status: 404 });
        }
        // Aktif agda zaten kayitliysa bir sey yapma; baska agdaysa (Amoy -> ana ag) yeniden yaz.
        if (urun.polygon_tx_hash && urun.zincir_agi === AKTIF_AG) {
            return NextResponse.json({ basari: true, zatenKayitli: true, txHash: urun.polygon_tx_hash });
        }

        const contract = await yazmaSozlesmesi();

        // Kontratta bu hash zaten kayıtlıysa (ör. eski bir işlem aslında zincire geçmiş ama
        // veritabanına yazılamamışsa) tekrar kayitEkle çağırmak "Hash zaten kayıtlı" ile geri döner.
        const zincirdeVarMi: boolean = await contract.kayitVarMi(hash);
        if (zincirdeVarMi) {
            await pool.query(
                `UPDATE urunler SET polygon_tx_hash = $1, zincir_agi = $2 WHERE hash = $3`,
                ['zincirde-kayitli-tx-bilinmiyor', AKTIF_AG, hash]
            );
            return NextResponse.json({ basari: true, zincirdeZatenVarmis: true });
        }

        const tx = await contract.kayitEkle(hash, urun.urun_adi, urun.urun_tipi);
        await tx.wait();

        await pool.query(
            `UPDATE urunler SET polygon_tx_hash = $1, zincir_agi = $2 WHERE hash = $3`,
            [tx.hash, AKTIF_AG, hash]
        );

        return NextResponse.json({ basari: true, txHash: tx.hash });
    } catch (err: unknown) {
        console.error('blockchain-tamamla hatasi:', err);
        return NextResponse.json({ basari: false, hata: 'Sunucu hatasi, lutfen tekrar deneyin' }, { status: 500 });
    }
}
