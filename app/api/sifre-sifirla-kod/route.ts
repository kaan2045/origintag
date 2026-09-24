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

        // Spam filtrelerini tetikleyen seyleri bilerek kaldirdik: yalnizca HTML govde
        // (duz metin surumu yoktu), gonderen adresten farkli bir alan adindan yuklenen
        // gorsel ve "sifre / hesap" kelimelerini one cikaran bir konu satiri. Asil cozum
        // gondericiyi @origintag.com.tr'ye (SPF/DKIM) tasimak; bu sadece icerik tarafi.
        const metin = [
            `OriginTag doğrulama kodunuz: ${kod}`,
            '',
            `Bu kod ${GECERLILIK_DK} dakika geçerlidir ve yalnızca bir kez kullanılabilir.`,
            'Bu isteği siz yapmadıysanız bu e-postayı yok sayabilirsiniz; hesabınızda hiçbir şey değişmez.',
            '',
            'OriginTag',
            'https://origintag.com.tr',
        ].join('\n');

        await transporter.sendMail({
            from: '"OriginTag" <' + process.env.EMAIL_USER + '>',
            to: email,
            subject: `OriginTag doğrulama kodunuz: ${kod}`,
            text: metin,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 420px; margin: 0 auto; padding: 24px; color: #1a1f1b;">
          <p style="font-size: 16px; font-weight: bold; color: #2D5A27; margin: 0 0 16px;">OriginTag</p>
          <p style="margin: 0 0 12px;">Doğrulama kodunuz:</p>
          <p style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #2D5A27; margin: 0 0 16px;">${kod}</p>
          <p style="color: #555; font-size: 14px; margin: 0 0 8px;">Bu kod ${GECERLILIK_DK} dakika geçerlidir ve yalnızca bir kez kullanılabilir.</p>
          <p style="color: #777; font-size: 13px; margin: 0 0 20px;">Bu isteği siz yapmadıysanız bu e-postayı yok sayabilirsiniz; hesabınızda hiçbir şey değişmez.</p>
          <p style="color: #999; font-size: 12px; margin: 0;">OriginTag · <a href="https://origintag.com.tr" style="color: #999;">origintag.com.tr</a></p>
        </div>
      `,
        });

        return NextResponse.json({ basari: true });
    } catch (err: unknown) {
        console.error('sifre-sifirla-kod hatasi:', err);
        return NextResponse.json({ basari: false, hata: 'Sunucu hatasi, lutfen tekrar deneyin' }, { status: 500 });
    }
}
