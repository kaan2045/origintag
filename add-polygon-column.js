const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

console.log('DATABASE_URL var mi:', process.env.DATABASE_URL ? 'EVET' : 'HAYIR - .env.local kontrol et');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
    try {
        await pool.query(`
      ALTER TABLE urunler 
      ADD COLUMN IF NOT EXISTS polygon_tx_hash VARCHAR(100);
    `);
        console.log('polygon_tx_hash kolonu basariyla eklendi!');
    } catch (err) {
        console.error('HATA OLUSTU:', err);
    } finally {
        await pool.end();
    }
}

migrate();