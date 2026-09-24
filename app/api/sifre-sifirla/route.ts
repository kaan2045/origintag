import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

import { oturumSurumuKolonunuHazirla } from '../../lib/session';
import { KOD_HATA_MESAJI, koduDogrula } from '../../lib/sifreSifirlama';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const MIN_SIFRE = 8;

/**
 * E-postaya gelen kodla yeni sifre belirler.
 *
 * Istemci kodu once /api/sifre-sifirla-dogrula ile kontrol ediyor, ama burada da
 * yeniden dogruluyoruz: o adim sadece arayuz icin, yetki burada. 6 haneli kod
 * 10^6 ihtimal ve 5 hatali denemede siliniyor. Basarili sifirlama giris kilidini
 * de kaldiriyor: sifresini unutan kisi buraya genelde kilitlendikten sonra geliyor.
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

        const sonuc = await koduDogrula(pool, email, kod);
        if (sonuc !== 'gecerli') {
            const { hata, status } = KOD_HATA_MESAJI[sonuc];
            return NextResponse.json({ basari: false, hata }, { status });
        }

        const sifreHash = await bcrypt.hash(yeniSifre, 10);
        // oturum_surumu'nu artirmak bu hesaba o ana kadar verilmis butun oturumlari (diger
        // cihazlar, sifreyi calan kisinin acik oturumu dahil) aninda gecersiz kiliyor.
        await oturumSurumuKolonunuHazirla();
        const guncelleme = await pool.query(
            'UPDATE kullanicilar SET sifre_hash = $1, oturum_surumu = oturum_surumu + 1 WHERE email = $2',
            [sifreHash, email]
        );
        if (guncelleme.rowCount === 0) {
            return NextResponse.json({ basari: false, hata: KOD_HATA_MESAJI.hatali.hata }, { status: 400 });
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
