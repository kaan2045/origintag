import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import { sessionCookieAyarla } from '../../lib/session';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const MAX_DENEME = 5;
const KILIT_SURESI_DK = 15;

export async function POST(req: NextRequest) {
    try {
        const { email, sifre } = await req.json();

        if (!email || !sifre) {
            return NextResponse.json({ basari: false, hata: 'Email ve sifre gerekli' }, { status: 400 });
        }

        await pool.query(`
            CREATE TABLE IF NOT EXISTS giris_denemeleri (
                email VARCHAR(200) PRIMARY KEY,
                deneme_sayisi INTEGER NOT NULL DEFAULT 0,
                son_deneme TIMESTAMP NOT NULL DEFAULT NOW()
            )
        `);

        const denemeSonuc = await pool.query(
            `SELECT deneme_sayisi FROM giris_denemeleri
             WHERE email = $1 AND deneme_sayisi >= $2 AND son_deneme > NOW() - INTERVAL '${KILIT_SURESI_DK} minutes'`,
            [email, MAX_DENEME]
        );
        if (denemeSonuc.rows.length > 0) {
            return NextResponse.json({ basari: false, hata: 'Cok fazla basarisiz deneme. Lutfen birkac dakika sonra tekrar deneyin.' }, { status: 429 });
        }

        const result = await pool.query(
            'SELECT id, ad, soyad, sifre_hash FROM kullanicilar WHERE email = $1',
            [email]
        );

        const basarisizGiris = async () => {
            await pool.query(
                `INSERT INTO giris_denemeleri (email, deneme_sayisi, son_deneme) VALUES ($1, 1, NOW())
                 ON CONFLICT (email) DO UPDATE SET deneme_sayisi = giris_denemeleri.deneme_sayisi + 1, son_deneme = NOW()`,
                [email]
            );
        };

        if (result.rows.length === 0) {
            await basarisizGiris();
            return NextResponse.json({ basari: false, hata: 'Email veya sifre hatali' }, { status: 401 });
        }

        const kullanici = result.rows[0];
        const sifreDogruMu = await bcrypt.compare(sifre, kullanici.sifre_hash);

        if (!sifreDogruMu) {
            await basarisizGiris();
            return NextResponse.json({ basari: false, hata: 'Email veya sifre hatali' }, { status: 401 });
        }

        await pool.query(`DELETE FROM giris_denemeleri WHERE email = $1`, [email]);

        const response = NextResponse.json({
            basari: true,
            kullanici_id: kullanici.id,
            ad: kullanici.ad + ' ' + kullanici.soyad,
        });
        sessionCookieAyarla(response, kullanici.id);
        return response;
    } catch (err: unknown) {
        console.error('giris hatasi:', err);
        return NextResponse.json({ basari: false, hata: 'Sunucu hatasi, lutfen tekrar deneyin' }, { status: 500 });
    }
}