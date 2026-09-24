import bcrypt from 'bcryptjs';
import type { Pool } from 'pg';

const MAX_DENEME = 5;
const KILIT_SURESI_DK = 15;

export type SifreSonucu =
    | { durum: 'dogru'; email: string; sifreHash: string }
    | { durum: 'hatali' | 'kilitli' };

/**
 * Giris yapmis kullanicidan hassas bir islem (sifre degistirme, hesap silme)
 * oncesi mevcut sifresini ister. Acik kalmis ya da calinmis bir oturum tek basina
 * bu islemlere yetmemeli.
 *
 * Yanlis denemeler girisin kullandigi giris_denemeleri sayacina yaziliyor: ayri bir
 * sayac olsa, calinmis oturumla bu uclardan sinirsiz sifre tahmini yapilabilirdi.
 */
export async function mevcutSifreyiDogrula(pool: Pool, kullaniciId: number, sifre: string): Promise<SifreSonucu> {
    const kullanici = await pool.query('SELECT email, sifre_hash FROM kullanicilar WHERE id = $1', [kullaniciId]);
    if (kullanici.rows.length === 0) return { durum: 'hatali' };
    const { email, sifre_hash } = kullanici.rows[0];

    const kilit = await pool
        .query(
            `SELECT 1 FROM giris_denemeleri
              WHERE email = $1 AND deneme_sayisi >= $2 AND son_deneme > NOW() - INTERVAL '${KILIT_SURESI_DK} minutes'`,
            [email, MAX_DENEME]
        )
        .catch(() => ({ rows: [] }));
    if (kilit.rows.length > 0) return { durum: 'kilitli' };

    if (!(await bcrypt.compare(sifre, sifre_hash))) {
        await pool
            .query(
                `INSERT INTO giris_denemeleri (email, deneme_sayisi, son_deneme) VALUES ($1, 1, NOW())
                 ON CONFLICT (email) DO UPDATE SET deneme_sayisi = giris_denemeleri.deneme_sayisi + 1, son_deneme = NOW()`,
                [email]
            )
            .catch(() => undefined);
        return { durum: 'hatali' };
    }

    await pool.query('DELETE FROM giris_denemeleri WHERE email = $1', [email]).catch(() => undefined);
    return { durum: 'dogru', email, sifreHash: sifre_hash };
}

/**
 * Hatali/kilitli sonucun yaniti. 401 degil 400: istemciler 401'i "oturum sonlandi"
 * sayip kullaniciyi cikis yaptiriyor, yanlis sifre yazmak bunu tetiklememeli.
 */
export const SIFRE_HATA_YANITI = {
    hatali: { hata: 'Mevcut sifre hatali', status: 400 },
    kilitli: { hata: 'Cok fazla hatali deneme. Lutfen birkac dakika sonra tekrar deneyin.', status: 429 },
} as const;
