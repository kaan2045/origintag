// Bu scripti bir kez çalıştır: node add-medya-column.js

const { Pool } = require('pg');

require('dotenv').config({ path: '.env.local' });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {

    try {

        await pool.query(`

      ALTER TABLE urunler 

      ADD COLUMN IF NOT EXISTS medya_urls TEXT[] DEFAULT '{}';

    `);

        console.log('✅ medya_urls kolonu eklendi!');

    } catch (err) {

        console.error('Hata:', err.message);

    } finally {

        await pool.end();

    }

}

migrate();

