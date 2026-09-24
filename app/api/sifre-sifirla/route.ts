import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

import { kodOzeti } from '../../lib/sifreSifirlama';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const MAX_DENEME = 5;
const MIN_SIFRE = 8;

/**
 * E-postaya gelen kodla yeni sifre belirler.
 *
 * 6 haneli kod 10^6 ihtimal; 5 hatali denemede kod siliniyor, yani kaba kuvvetle
 * tahmin sansi kod basina 5/1.000.000. Basarili sifirlama giris kilidini de
 * kaldiriyor: sifresini unutan kisi buraya genelde kilitlendikten sonra geliyor.
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const email = typeof body.email === 'string' ? body.email.trim() : '';
        const kod = typeof body.kod === 'string' ? body.kod.trim() : '';
        const yeniSifre = typeof body.yeniSifre === 'string' ? body.yeniSifre : '';

        if (!email || !kod || !yeniSifre) {
            return NextResponse.json({ basari: false, hata: 'Email, kod ve yeni sifre gerekli' }, { status: 400 });
        }
        if (yeniSifre.length < MIN_SIFRE) {
            return NextResponse.json({ basari: false, hata: `Sifre en az ${MIN_SIFRE} karakter olmali` }, { status: 400 });
        }

        const kayit = await pool.query(
            `SELECT kod_ozeti, deneme_sayisi FROM sifre_sifirlama_kodlari
              WHERE email = $1 AND gecerlilik > NOW()`,
            [email]
        ).catch(() => ({ rows: [] as { kod_ozeti: string; deneme_sayisi: number }[] })); // tablo henuz yoksa

        if (kayit.rows.length === 0) {
            return NextResponse.json({ basari: false, hata: 'Kod hatali veya suresi dolmus' }, { status: 400 });
        }
        if (kayit.rows[0].deneme_sayisi >= MAX_DENEME) {
            await pool.query('DELETE FROM sifre_sifirlama_kodlari WHERE email = $1', [email]);
            return NextResponse.json({ basari: false, hata: 'Cok fazla hatali deneme. Yeni kod isteyin.' }, { status: 429 });
        }

        const beklenen = Buffer.from(kayit.rows[0].kod_ozeti);
        const gelen = Buffer.from(kodOzeti(kod));
        if (beklenen.length !== gelen.length || !crypto.timingSafeEqual(beklenen, gelen)) {
            await pool.query(
                'UPDATE sifre_sifirlama_kodlari SET deneme_sayisi = deneme_sayisi + 1 WHERE email = $1',
                [email]
            );
            return NextResponse.json({ basari: false, hata: 'Kod hatali veya suresi dolmus' }, { status: 400 });
        }

        const sifreHash = await bcrypt.hash(yeniSifre, 10);
        const guncelleme = await pool.query('UPDATE kullanicilar SET sifre_hash = $1 WHERE email = $2', [sifreHash, email]);
        if (guncelleme.rowCount === 0) {
            return NextResponse.json({ basari: false, hata: 'Kod hatali veya suresi dolmus' }, { status: 400 });
        }

        // Kod tek kullanimlik.
        await pool.query('DELETE FROM sifre_sifirlama_kodlari WHERE email = $1', [email]);
        await pool.query('DELETE FROM giris_denemeleri WHERE email = $1', [email]).catch(() => undefined);

        return NextResponse.json({ basari: true });
    } catch (err: unknown) {
        console.error('sifre-sifirla hatasi:', err);
        return NextResponse.json({ basari: false, hata: 'Sunucu hatasi, lutfen tekrar deneyin' }, { status: 500 });
    }
}
