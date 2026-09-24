import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

import { oturumuYenileVeYanitla } from '../../lib/oturumYenile';
import { istekOturumIdAl } from '../../lib/session';
import { mevcutSifreyiDogrula, SIFRE_HATA_YANITI } from '../../lib/sifreDogrula';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const MIN_SIFRE = 8;

/**
 * Giris yapmis kullanicinin sifresini degistirir (mevcut sifre soruluyor, bkz.
 * lib/sifreDogrula.ts). Sifre degisince diger cihazlardaki oturumlar kapaniyor, bu
 * cihaz yeni token'la acik kaliyor.
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

        const sonuc = await mevcutSifreyiDogrula(pool, kullaniciId, mevcutSifre);
        if (sonuc.durum !== 'dogru') {
            const { hata, status } = SIFRE_HATA_YANITI[sonuc.durum];
            return NextResponse.json({ basari: false, hata }, { status });
        }
        if (await bcrypt.compare(yeniSifre, sonuc.sifreHash)) {
            return NextResponse.json({ basari: false, hata: 'Yeni sifre mevcut sifreyle ayni olamaz' }, { status: 400 });
        }

        return await oturumuYenileVeYanitla(pool, kullaniciId, { kolon: 'sifre_hash', deger: await bcrypt.hash(yeniSifre, 10) });
    } catch (err: unknown) {
        console.error('sifre-degistir hatasi:', err);
        return NextResponse.json({ basari: false, hata: 'Sunucu hatasi, lutfen tekrar deneyin' }, { status: 500 });
    }
}
