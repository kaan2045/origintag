const { Client } = require('pg');

async function addUser() {
    const client = new Client({
        host: 'localhost',
        port: 5432,
        user: 'postgres',
        password: 'kaan2045',
        database: 'origintag'
    });

    await client.connect();

    await client.query(`
    INSERT INTO kullanicilar (ad, soyad, email, firma) 
    VALUES ('Test', 'Kullanici', 'test@origintag.com', 'OriginTag')
    ON CONFLICT (email) DO NOTHING
  `);

    console.log('✅ Test kullanıcısı eklendi!');
    await client.end();
}

addUser().catch(console.error);