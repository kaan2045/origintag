const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

console.log('DATABASE_URL var mi:', process.env.DATABASE_URL ? 'EVET' : 'HAYIR - .env.local kontrol et');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
    try {
        // Konum koordinatlari - hiz/mesafe hesabi icin gerekli
        await pool.query(`
      ALTER TABLE taramalar ADD COLUMN IF NOT EXISTS enlem DOUBLE PRECISION;
    `);
        await pool.query(`
      ALTER TABLE taramalar ADD COLUMN IF NOT EXISTS boylam DOUBLE PRECISION;
    `);

        // Sahtecilik supheli bayraklari
        await pool.query(`
      ALTER TABLE taramalar ADD COLUMN IF NOT EXISTS supheli BOOLEAN DEFAULT FALSE;
    `);
        await pool.query(`
      ALTER TABLE taramalar ADD COLUMN IF NOT EXISTS supheli_tip VARCHAR(30);
    `);
        await pool.query(`
      ALTER TABLE taramalar ADD COLUMN IF NOT EXISTS supheli_detay TEXT;
    `);

        await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_taramalar_supheli ON taramalar(supheli) WHERE supheli = TRUE;
    `);

        console.log('sahtecilik tespiti kolonlari basariyla eklendi!');
    } catch (err) {
        console.error('HATA OLUSTU:', err);
    } finally {
        await pool.end();
    }
}

migrate();