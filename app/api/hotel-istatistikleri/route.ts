import { Pool } from 'pg';
import { NextRequest, NextResponse } from 'next/server';
import { istekOturumIdAl } from '../../lib/session';
import { semaHazirlaOlaylar } from '../olay-kaydet/route';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

export async function GET(req: NextRequest) {
    try {
        const kullaniciId = istekOturumIdAl(req);
        if (!kullaniciId) {
            return NextResponse.json({ basari: false, hata: 'Oturum gecersiz, lutfen tekrar giris yapin' }, { status: 401 });
        }

        await semaHazirlaOlaylar();

        const { searchParams } = new URL(req.url);
        const otelId = searchParams.get('otel_id');

        const otellerSonuc = await pool.query(
            otelId
                ? `SELECT * FROM oteller WHERE olusturan_kullanici_id = $1 AND id = $2`
                : `SELECT * FROM oteller WHERE olusturan_kullanici_id = $1 ORDER BY olusturma_tarihi DESC`,
            otelId ? [kullaniciId, otelId] : [kullaniciId]
        );

        const rollup = await Promise.all(
            otellerSonuc.rows.map(async (otel) => {
                const sayilar = await pool.query(
                    `SELECT olay_tipi, COUNT(*) FROM pasaport_olaylari WHERE otel_id = $1 GROUP BY olay_tipi`,
                    [otel.id]
                );
                const sayilarMap: Record<string, number> = {};
                sayilar.rows.forEach((r) => { sayilarMap[r.olay_tipi] = parseInt(r.count, 10); });

                return {
                    ...otel,
                    pasaport_olusturuldu: sayilarMap['passport_created'] || 0,
                    pasaport_acildi: sayilarMap['passport_opened'] || 0,
                    foto_yuklendi: sayilarMap['photo_uploaded'] || 0,
                    yer_eklendi: sayilarMap['place_added'] || 0,
                    deneyim_tiklandi: sayilarMap['experience_clicked'] || 0,
                    otel_tiklandi: sayilarMap['hotel_clicked'] || 0,
                    paylasildi: sayilarMap['passport_shared'] || 0,
                };
            })
        );

        return NextResponse.json({ basari: true, oteller: rollup });
    } catch (err: unknown) {
        console.error('hotel-istatistikleri hatasi:', err);
        return NextResponse.json({ basari: false, hata: 'Sunucu hatasi, lutfen tekrar deneyin' }, { status: 500 });
    }
}
