import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { Pool } from 'pg';

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

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();
        const kod = Math.floor(100000 + Math.random() * 900000).toString();
        const gecerlilik = new Date(Date.now() + 10 * 60 * 1000);

        await pool.query(`
      CREATE TABLE IF NOT EXISTS otp_kodlar (
        id SERIAL PRIMARY KEY,
        email VARCHAR(200) NOT NULL,
        kod VARCHAR(6) NOT NULL,
        gecerlilik TIMESTAMP NOT NULL,
        olusturma TIMESTAMP DEFAULT NOW()
      )
    `);

        await pool.query(
            `DELETE FROM otp_kodlar WHERE email = $1`,
            [email]
        );

        await pool.query(
            `INSERT INTO otp_kodlar (email, kod, gecerlilik) VALUES ($1, $2, $3)`,
            [email, kod, gecerlilik]
        );

        await transporter.sendMail({
            from: '"OriginTag" <' + process.env.EMAIL_USER + '>',
            to: email,
            subject: 'OriginTag - Giris Kodunuz',
            html: `
        <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto; padding: 2rem; border: 1px solid #eee; border-radius: 12px;">
          <img src="https://origintag.com/origin.png" style="height: 50px; margin-bottom: 1rem;" />
          <h2 style="color: #2D5A27;">Giris Dogrulama Kodunuz</h2>
          <p style="color: #555;">OriginTag hesabiniza giris icin asagidaki kodu kullanin:</p>
          <div style="font-size: 2.5rem; font-weight: bold; color: #2D5A27; text-align: center; padding: 1rem; background: #f9f7f4; border-radius: 8px; letter-spacing: 0.5rem; margin: 1rem 0;">
            ${kod}
          </div>
          <p style="color: #888; font-size: 0.85rem;">Bu kod 10 dakika gecerlidir. Eger bu islemi siz yapmadiysaniz bu emaili dikkate almayin.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 1rem 0;" />
          <p style="color: #aaa; font-size: 0.75rem;">OriginTag - Geographical Indicator & Traceability</p>
        </div>
      `,
        });

        return NextResponse.json({ basari: true });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Bilinmeyen hata';
        return NextResponse.json({ basari: false, hata: message }, { status: 500 });
    }
}