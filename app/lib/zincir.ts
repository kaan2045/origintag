import { ethers } from 'ethers';
import type { Pool } from 'pg';

import kontrat from '../../contracts/OriginTagRegistry.json';
import { AG_BILGISI, type Ag } from './zincirAdres';

export { islemAdresi } from './zincirAdres';

/**
 * Hangi Polygon agina yazildigi tek yerden, ortam degiskenleriyle seciliyor:
 *
 *   POLYGON_AG             'polygon' (ana ag) | 'amoy' (test agi, varsayilan)
 *   POLYGON_RPC_URL        secilen agin RPC adresi
 *   POLYGON_PRIVATE_KEY    sozlesme sahibi sunucu cuzdaninin anahtari
 *   POLYGON_KONTRAT_ADRESI ana agda zorunlu; Amoy'da verilmezse eski adres
 *
 * Varsayilan Amoy: degiskenler degismedikce davranis ayni kaliyor.
 */
const VARSAYILAN_AMOY_KONTRATI = '0x9Da4e7F749beAaEF618bD2C2Fe456b86e48387A3';

export const AKTIF_AG: Ag = process.env.POLYGON_AG === 'polygon' ? 'polygon' : 'amoy';

/**
 * Yazma icin sozlesme. Baglanilan RPC'nin gercekten secilen ag oldugunu kontrol
 * ediyor: POLYGON_AG=polygon yapilip RPC adresi Amoy'da unutulursa kayitlar
 * sessizce test agina gidip "ana agda" diye isaretlenirdi.
 */
export async function yazmaSozlesmesi(): Promise<ethers.Contract> {
    const ag = AG_BILGISI[AKTIF_AG];
    const adres = process.env.POLYGON_KONTRAT_ADRESI || (AKTIF_AG === 'amoy' ? VARSAYILAN_AMOY_KONTRATI : undefined);
    if (!adres) throw new Error(`POLYGON_KONTRAT_ADRESI tanimli degil (${ag.ad})`);

    const provider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL);
    const { chainId } = await provider.getNetwork();
    if (chainId !== ag.chainId) {
        throw new Error(`RPC agi uyusmuyor: POLYGON_AG=${AKTIF_AG} (chainId ${ag.chainId}) ama RPC chainId ${chainId}`);
    }

    const cuzdan = new ethers.Wallet(process.env.POLYGON_PRIVATE_KEY!, provider);
    return new ethers.Contract(adres, kontrat.abi, cuzdan);
}

/**
 * urunler.zincir_agi: her kaydin hangi aga yazildigi. Bu kolon eklenmeden once
 * yazilmis butun kayitlar Amoy'daydi; bos olanlar 'amoy' olarak dolduruluyor.
 */
let kolonHazir: Promise<unknown> | null = null;
export function zincirAgiKolonunuHazirla(pool: Pool) {
    kolonHazir ??= (async () => {
        await pool.query('ALTER TABLE urunler ADD COLUMN IF NOT EXISTS zincir_agi VARCHAR(20)');
        await pool.query("UPDATE urunler SET zincir_agi = 'amoy' WHERE polygon_tx_hash IS NOT NULL AND zincir_agi IS NULL");
    })().catch((err) => {
        kolonHazir = null;
        throw err;
    });
    return kolonHazir;
}
