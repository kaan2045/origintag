const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

console.log('DATABASE_URL var mi:', process.env.DATABASE_URL ? 'EVET' : 'HAYIR - .env.local kontrol et');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function sifirla() {
    try {
        // Once taramalar (urunler'e foreign key ile bagli), sonra urunler.
        // kullanicilar tablosuna dokunulmuyor - mevcut hesaplar korunur.
        const taramaSonuc = await pool.query('DELETE FROM taramalar');
        console.log(`${taramaSonuc.rowCount} tarama kaydi silindi.`);

        const urunSonuc = await pool.query('DELETE FROM urunler');
        console.log(`${urunSonuc.rowCount} urun kaydi silindi.`);

        // ID sayaclarini de sifirla ki yeni kayitlar 1'den baslasin
        await pool.query('ALTER SEQUENCE taramalar_id_seq RESTART WITH 1');
        await pool.query('ALTER SEQUENCE urunler_id_seq RESTART WITH 1');

        console.log('Sifirlama tamamlandi. kullanicilar tablosu korundu.');
    } catch (err) {
        console.error('HATA OLUSTU:', err);
    } finally {
        await pool.end();
    }
}

sifirla();
