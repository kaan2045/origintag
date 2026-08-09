import { Pool } from 'pg';
import { NextRequest, NextResponse } from 'next/server';
import { sessionDogrula, COOKIE_ADI } from '../../lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

export async function GET(req: NextRequest) {
    try {
        const kullaniciId = sessionDogrula(req.cookies.get(COOKIE_ADI)?.value);
        if (!kullaniciId) {
            return NextResponse.json({ basari: false, hata: 'Oturum gecersiz, lutfen tekrar giris yapin' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const urunHash = searchParams.get('urun_hash');
        const sadeceSupheli = searchParams.get('supheli') === '1';

        if (urunHash) {
            // Belirli bir ürünün taramaları -- ama sadece o ürün bu kullanıcıya aitse
            const result = await pool.query(
                `SELECT t.*, u.urun_adi FROM taramalar t
         JOIN urunler u ON t.urun_id = u.id
         WHERE t.urun_hash = $1 AND u.kullanici_id = $2
         ORDER BY t.tarama_tarihi DESC
         LIMIT 100`,
                [urunHash, kullaniciId]
            );
            return NextResponse.json({ basari: true, taramalar: result.rows });
        }

        // Kullanıcının tüm ürünlerinin taramaları (opsiyonel: sadece şüpheli olanlar)
        const result = await pool.query(
            `SELECT t.*, u.urun_adi FROM taramalar t
       JOIN urunler u ON t.urun_id = u.id
       WHERE u.kullanici_id = $1 ${sadeceSupheli ? 'AND t.supheli = TRUE' : ''}
       ORDER BY t.tarama_tarihi DESC
       LIMIT 200`,
            [kullaniciId]
        );

        return NextResponse.json({ basari: true, taramalar: result.rows });
    } catch (err: unknown) {
        console.error('taramalarim hatasi:', err);
        return NextResponse.json({ basari: false, hata: 'Sunucu hatasi, lutfen tekrar deneyin' }, { status: 500 });
    }
}