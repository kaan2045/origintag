import crypto from 'crypto';
import type { Pool } from 'pg';

export const MAX_DENEME = 5;

/** Sifirlama kodunun veritabaninda saklanan ozeti (kodun kendisi saklanmiyor). */
export function kodOzeti(kod: string): string {
    return crypto.createHash('sha256').update(kod).digest('hex');
}

export type KodSonucu = 'gecerli' | 'hatali' | 'kilitli';

/**
 * Kodu kontrol eder ama tuketmez. Akis iki adimli (once kod, sonra yeni sifre)
 * oldugu icin ayni kod iki kez dogrulaniyor; yalnizca sifre gercekten
 * degistiginde siliniyor. Hatali denemeler iki adimda da ayni sayaca yaziliyor,
 * yani adimlari bolmek tahmin hakkini artirmiyor.
 */
export async function koduDogrula(pool: Pool, email: string, kod: string): Promise<KodSonucu> {
    const kayit = await pool
        .query(
            `SELECT kod_ozeti, deneme_sayisi FROM sifre_sifirlama_kodlari
              WHERE email = $1 AND gecerlilik > NOW()`,
            [email]
        )
        .catch(() => ({ rows: [] as { kod_ozeti: string; deneme_sayisi: number }[] })); // tablo henuz yoksa

    if (kayit.rows.length === 0) return 'hatali';
    if (kayit.rows[0].deneme_sayisi >= MAX_DENEME) {
        await pool.query('DELETE FROM sifre_sifirlama_kodlari WHERE email = $1', [email]);
        return 'kilitli';
    }

    const beklenen = Buffer.from(kayit.rows[0].kod_ozeti);
    const gelen = Buffer.from(kodOzeti(kod));
    if (beklenen.length !== gelen.length || !crypto.timingSafeEqual(beklenen, gelen)) {
        await pool.query(
            'UPDATE sifre_sifirlama_kodlari SET deneme_sayisi = deneme_sayisi + 1 WHERE email = $1',
            [email]
        );
        return 'hatali';
    }
    return 'gecerli';
}

export const KOD_HATA_MESAJI: Record<Exclude<KodSonucu, 'gecerli'>, { hata: string; status: number }> = {
    hatali: { hata: 'Kod hatali veya suresi dolmus', status: 400 },
    kilitli: { hata: 'Cok fazla hatali deneme. Yeni kod isteyin.', status: 429 },
};
