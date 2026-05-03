const { Client } = require('pg');

async function setup() {
    const client = new Client({
        host: 'localhost',
        port: 5432,
        user: 'postgres',
        password: 'kaan2045',
        database: 'postgres'
    });

    await client.connect();

    await client.query(`CREATE DATABASE origintag`).catch(() => {
        console.log('Veritabanı zaten var, devam ediliyor...');
    });

    await client.end();

    const client2 = new Client({
        host: 'localhost',
        port: 5432,
        user: 'postgres',
        password: 'kaan2045',
        database: 'origintag'
    });

    await client2.connect();

    await client2.query(`
    CREATE TABLE IF NOT EXISTS kullanicilar (
      id SERIAL PRIMARY KEY,
      ad VARCHAR(100),
      soyad VARCHAR(100),
      email VARCHAR(200) UNIQUE NOT NULL,
      firma VARCHAR(200),
      olusturma_tarihi TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS urunler (
      id SERIAL PRIMARY KEY,
      kullanici_id INTEGER REFERENCES kullanicilar(id),
      urun_adi VARCHAR(200) NOT NULL,
      urun_tipi VARCHAR(100),
      bolge VARCHAR(200),
      hasat_tarihi DATE,
      miktar DECIMAL,
      birim VARCHAR(20),
      aciklama TEXT,
      hash VARCHAR(64) UNIQUE NOT NULL,
      olusturma_tarihi TIMESTAMP DEFAULT NOW()
    );
  `);

    console.log('✅ Veritabanı ve tablolar hazır!');
    await client2.end();
}

setup().catch(console.error);