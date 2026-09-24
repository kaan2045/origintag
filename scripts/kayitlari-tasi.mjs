// Baska agda (Amoy) kayitli ya da hic yazilamamis urunleri baglanilan aga yazar.
//
//   node scripts/kayitlari-tasi.mjs --env .env.polygon            (kuru calisma: liste ve maliyet)
//   node scripts/kayitlari-tasi.mjs --env .env.polygon --onayla   (gercekten yazar)
//   ... --hash <urun hash>                                          (yalnizca tek urun; once boyle dene)
//
// Veritabani baglantisi .env.local'dan (DATABASE_URL), zincir ayarlari --env dosyasindan.
// Sozlesme adresi --env dosyasinda POLYGON_KONTRAT_ADRESI olarak bulunmali.
import dotenv from 'dotenv';
import { ethers } from 'ethers';
import pg from 'pg';
import { argumanlar, ayarlariYukle, baglan, kontratDosyasi, pol } from './zincirOrtak.mjs';

const { envDosyasi, onayla, tekHash } = argumanlar();
dotenv.config({ path: '.env.local', quiet: true }); // DATABASE_URL
ayarlariYukle(envDosyasi);
const adres = process.env.POLYGON_KONTRAT_ADRESI;
if (!adres) throw new Error(`${envDosyasi} icinde POLYGON_KONTRAT_ADRESI yok (once kontrat-yayinla calistir)`);

const { provider, cuzdan, ag, chainId } = await baglan();
const hedefAg = chainId === 137n ? 'polygon' : 'amoy';
const sozlesme = new ethers.Contract(adres, kontratDosyasi().abi, cuzdan);
if ((await sozlesme.owner()).toLowerCase() !== cuzdan.address.toLowerCase()) {
    throw new Error('Bu cuzdan sozlesmenin sahibi degil; kayit ekleyemez');
}

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
await pool.query('ALTER TABLE urunler ADD COLUMN IF NOT EXISTS zincir_agi VARCHAR(20)');
await pool.query("UPDATE urunler SET zincir_agi = 'amoy' WHERE polygon_tx_hash IS NOT NULL AND zincir_agi IS NULL");
const { rows } = await pool.query(
    'SELECT hash, urun_adi, urun_tipi FROM urunler WHERE zincir_agi IS DISTINCT FROM $1 AND ($2::text IS NULL OR hash = $2) ORDER BY id',
    [hedefAg, tekHash]
);

const gazBasi = rows.length ? await sozlesme.kayitEkle.estimateGas(rows[0].hash, rows[0].urun_adi, rows[0].urun_tipi).catch(() => 250000n) : 0n;
const { maxFeePerGas, gasPrice } = await provider.getFeeData();
const tahmini = gazBasi * (maxFeePerGas ?? gasPrice) * BigInt(rows.length);
const bakiye = await provider.getBalance(cuzdan.address);

console.log(`
Ag            : ${ag.ad}
Sozlesme      : ${adres}
Tasinacak     : ${rows.length} urun
Tahmini ucret : ${pol(tahmini)} (ust sinir)
Bakiye        : ${pol(bakiye)}
`);
rows.forEach((u) => console.log(`  - ${u.urun_adi} (${u.hash.slice(0, 12)}...)`));

if (!onayla || rows.length === 0) {
    console.log(rows.length ? '\nKuru calisma: hicbir sey gonderilmedi. Yazmak icin --onayla ekle.' : '\nTasinacak urun yok.');
    await pool.end();
    process.exit(0);
}
if (bakiye < tahmini) {
    console.log('\nBakiye yetersiz.');
    await pool.end();
    process.exit(1);
}

let basarili = 0;
for (const u of rows) {
    try {
        let txHash = 'zincirde-kayitli-tx-bilinmiyor';
        if (!(await sozlesme.kayitVarMi(u.hash))) {
            const tx = await sozlesme.kayitEkle(u.hash, u.urun_adi, u.urun_tipi);
            await tx.wait();
            txHash = tx.hash;
        }
        // Veritabani yalnizca zincire yazildiktan sonra guncelleniyor.
        await pool.query('UPDATE urunler SET polygon_tx_hash = $1, zincir_agi = $2 WHERE hash = $3', [txHash, hedefAg, u.hash]);
        basarili++;
        console.log(`  OK  ${u.urun_adi}  ${txHash.startsWith('0x') ? `${ag.kasif}/tx/${txHash}` : '(zaten kayitliydi)'}`);
    } catch (err) {
        console.log(`  HATA ${u.urun_adi}: ${err.shortMessage || err.message}`);
    }
}
console.log(`\n${basarili}/${rows.length} urun ${ag.ad} uzerine yazildi.`);
await pool.end();
