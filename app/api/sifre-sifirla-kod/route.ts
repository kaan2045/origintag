import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { Pool } from 'pg';

import { kodOzeti } from '../../lib/sifreSifirlama';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const GONDERIM_ARALIGI_SN = 45;
const GECERLILIK_DK = 15;

/**
 * Sifre sifirlama kodu gonderir.
 *
 * Kayit dogrulamasindaki otp_kodlar tablosunu bilerek paylasmiyoruz: orada istenen
 * bir kod burada gecerli olmamali. Kodun kendisi degil ozeti saklaniyor -- bu kod
 * hesabi ele gecirmeye yetiyor, veritabani sizarsa dogrudan kullanilamasin.
 *
 * E-posta kayitli olsun olmasin yanit ayni, bu uc hesap varligini soylemiyor.
 * (Yanit suresi farkini kapatmaya ugrasmadik: /api/kayit zaten 'Bu email zaten
 * kayitli' diyerek ayni bilgiyi veriyor.)
 */
export async function POST(req: NextRequest) {
    try {
        const { email: hamEmail } = await req.json();
        const email = typeof hamEmail === 'string' ? hamEmail.trim() : '';
        if (!email) {
            return NextResponse.json({ basari: false, hata: 'Email gerekli' }, { status: 400 });
        }

        await pool.query(`
            CREATE TABLE IF NOT EXISTS sifre_sifirlama_kodlari (
                email VARCHAR(200) PRIMARY KEY,
                kod_ozeti VARCHAR(64) NOT NULL,
                gecerlilik TIMESTAMP NOT NULL,
                deneme_sayisi INTEGER NOT NULL DEFAULT 0,
                olusturma TIMESTAMP NOT NULL DEFAULT NOW()
            )
        `);

        // Ayni adrese art arda e-posta bombardimanini engeller.
        const yakinZamanda = await pool.query(
            `SELECT 1 FROM sifre_sifirlama_kodlari
              WHERE email = $1 AND olusturma > NOW() - INTERVAL '${GONDERIM_ARALIGI_SN} seconds'`,
            [email]
        );
        if (yakinZamanda.rows.length > 0) {
            return NextResponse.json({ basari: false, hata: 'Cok sik kod istendi. Lutfen biraz bekleyin.' }, { status: 429 });
        }

        const kullanici = await pool.query('SELECT id FROM kullanicilar WHERE email = $1', [email]);
        if (kullanici.rows.length === 0) {
            return NextResponse.json({ basari: true });
        }

        // Math.random tahmin edilebilir; hesap ele gecirmeye yetecek bir kod icin CSPRNG.
        const kod = crypto.randomInt(100000, 1000000).toString();

        await pool.query(
            `INSERT INTO sifre_sifirlama_kodlari (email, kod_ozeti, gecerlilik, deneme_sayisi, olusturma)
             VALUES ($1, $2, NOW() + INTERVAL '${GECERLILIK_DK} minutes', 0, NOW())
             ON CONFLICT (email) DO UPDATE
               SET kod_ozeti = EXCLUDED.kod_ozeti, gecerlilik = EXCLUDED.gecerlilik,
                   deneme_sayisi = 0, olusturma = NOW()`,
            [email, kodOzeti(kod)]
        );

        await transporter.sendMail({
            from: '"OriginTag" <' + process.env.EMAIL_USER + '>',
            to: email,
            subject: 'OriginTag - Sifre Sifirlama Kodunuz',
            html: `
        <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto; padding: 2rem; border: 1px solid #eee; border-radius: 12px;">
          <img src="https://origintag.com.tr/origin.png" style="height: 50px; margin-bottom: 1rem;" />
          <h2 style="color: #2D5A27;">Sifre Sifirlama Kodunuz</h2>
          <p style="color: #555;">OriginTag hesabinizin sifresini yenilemek icin asagidaki kodu kullanin:</p>
          <div style="font-size: 2.5rem; font-weight: bold; color: #2D5A27; text-align: center; padding: 1rem; background: #f9f7f4; border-radius: 8px; letter-spacing: 0.5rem; margin: 1rem 0;">
            ${kod}
          </div>
          <p style="color: #888; font-size: 0.85rem;">Bu kod ${GECERLILIK_DK} dakika gecerlidir. Sifre sifirlamayi siz istemediyseniz bu emaili dikkate almayin; sifreniz degismez.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 1rem 0;" />
          <p style="color: #aaa; font-size: 0.75rem;">OriginTag - Geographical Indicator & Traceability</p>
        </div>
      `,
        });

        return NextResponse.json({ basari: true });
    } catch (err: unknown) {
        console.error('sifre-sifirla-kod hatasi:', err);
        return NextResponse.json({ basari: false, hata: 'Sunucu hatasi, lutfen tekrar deneyin' }, { status: 500 });
    }
}
