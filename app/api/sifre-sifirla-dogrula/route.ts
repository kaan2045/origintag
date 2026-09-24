import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

import { KOD_HATA_MESAJI, koduDogrula } from '../../lib/sifreSifirlama';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

/**
 * Sifirlama kodunu yeni sifre sorulmadan once kontrol eder, kodu tuketmez.
 * Boylece kullanici yanlis kodu, yeni sifresini iki kez yazdiktan sonra degil
 * hemen ogreniyor.
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const email = typeof body.email === 'string' ? body.email.trim() : '';
        const kod = typeof body.kod === 'string' ? body.kod.trim() : '';
        if (!email || !kod) {
            return NextResponse.json({ basari: false, hata: 'Email ve kod gerekli' }, { status: 400 });
        }

        const sonuc = await koduDogrula(pool, email, kod);
        if (sonuc !== 'gecerli') {
            const { hata, status } = KOD_HATA_MESAJI[sonuc];
            return NextResponse.json({ basari: false, hata }, { status });
        }
        return NextResponse.json({ basari: true });
    } catch (err: unknown) {
        console.error('sifre-sifirla-dogrula hatasi:', err);
        return NextResponse.json({ basari: false, hata: 'Sunucu hatasi, lutfen tekrar deneyin' }, { status: 500 });
    }
}
