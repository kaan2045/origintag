const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

console.log('DATABASE_URL var mi:', process.env.DATABASE_URL ? 'EVET' : 'HAYIR - .env.local kontrol et');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
    try {
        await pool.query(`
      CREATE TABLE IF NOT EXISTS taramalar (
        id SERIAL PRIMARY KEY,
        urun_id INTEGER REFERENCES urunler(id),
        urun_hash VARCHAR(64) NOT NULL,
        ip_adresi VARCHAR(64),
        sehir VARCHAR(100),
        ilce VARCHAR(100),
        ulke VARCHAR(100),
        cihaz_tipi VARCHAR(50),
        tarama_tarihi TIMESTAMP DEFAULT NOW()
      );
    `);
        await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_taramalar_urun_hash ON taramalar(urun_hash);
    `);
        await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_taramalar_tarih ON taramalar(tarama_tarihi DESC);
    `);
        console.log('taramalar tablosu basariyla olusturuldu!');
    } catch (err) {
        console.error('HATA OLUSTU:', err);
    } finally {
        await pool.end();
    }
}

migrate();