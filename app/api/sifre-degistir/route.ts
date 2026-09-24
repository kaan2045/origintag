import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

import { oturumuYenileVeYanitla } from '../../lib/oturumYenile';
import { istekOturumIdAl } from '../../lib/session';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const MIN_SIFRE = 8;
const MAX_DENEME = 5;
const KILIT_SURESI_DK = 15;

/**
 * Giris yapmis kullanicinin sifresini degistirir.
 *
 * Mevcut sifre soruluyor: acik kalmis ya da calinmis bir oturum tek basina sifreyi
 * degistirip hesabi ele gecirmeye yetmemeli. Yanlis mevcut sifre girisin kullandigi
 * giris_denemeleri sayacina yaziliyor -- ayri bir sayac olsa, calinmis oturumla
 * buradan sinirsiz tahmin yapilabilirdi.
 *
 * Sifre degisince diger cihazlardaki oturumlar kapaniyor, bu cihaz yeni token'la
 * acik kaliyor.
 */
export async function POST(req: NextRequest) {
    try {
        const kullaniciId = await istekOturumIdAl(req);
        if (!kullaniciId) {
            return NextResponse.json({ basari: false, hata: 'Oturum gecersiz, lutfen tekrar giris yapin' }, { status: 401 });
        }

        const body = await req.json();
        const mevcutSifre = typeof body.mevcutSifre === 'string' ? body.mevcutSifre : '';
        const yeniSifre = typeof body.yeniSifre === 'string' ? body.yeniSifre : '';
        if (!mevcutSifre || !yeniSifre) {
            return NextResponse.json({ basari: false, hata: 'Mevcut ve yeni sifre gerekli' }, { status: 400 });
        }
        if (yeniSifre.length < MIN_SIFRE) {
            return NextResponse.json({ basari: false, hata: `Sifre en az ${MIN_SIFRE} karakter olmali` }, { status: 400 });
        }

        const kullanici = await pool.query('SELECT email, sifre_hash FROM kullanicilar WHERE id = $1', [kullaniciId]);
        const { email, sifre_hash } = kullanici.rows[0];

        const kilit = await pool
            .query(
                `SELECT 1 FROM giris_denemeleri
                  WHERE email = $1 AND deneme_sayisi >= $2 AND son_deneme > NOW() - INTERVAL '${KILIT_SURESI_DK} minutes'`,
                [email, MAX_DENEME]
            )
            .catch(() => ({ rows: [] }));
        if (kilit.rows.length > 0) {
            return NextResponse.json({ basari: false, hata: 'Cok fazla hatali deneme. Lutfen birkac dakika sonra tekrar deneyin.' }, { status: 429 });
        }

        if (!(await bcrypt.compare(mevcutSifre, sifre_hash))) {
            await pool
                .query(
                    `INSERT INTO giris_denemeleri (email, deneme_sayisi, son_deneme) VALUES ($1, 1, NOW())
                     ON CONFLICT (email) DO UPDATE SET deneme_sayisi = giris_denemeleri.deneme_sayisi + 1, son_deneme = NOW()`,
                    [email]
                )
                .catch(() => undefined);
            // 401 degil: istemciler 401'i "oturum sonlandi" sayip cikis yaptiriyor.
            return NextResponse.json({ basari: false, hata: 'Mevcut sifre hatali' }, { status: 400 });
        }
        if (await bcrypt.compare(yeniSifre, sifre_hash)) {
            return NextResponse.json({ basari: false, hata: 'Yeni sifre mevcut sifreyle ayni olamaz' }, { status: 400 });
        }

        await pool.query('DELETE FROM giris_denemeleri WHERE email = $1', [email]).catch(() => undefined);
        return await oturumuYenileVeYanitla(pool, kullaniciId, { kolon: 'sifre_hash', deger: await bcrypt.hash(yeniSifre, 10) });
    } catch (err: unknown) {
        console.error('sifre-degistir hatasi:', err);
        return NextResponse.json({ basari: false, hata: 'Sunucu hatasi, lutfen tekrar deneyin' }, { status: 500 });
    }
}
