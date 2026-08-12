import { Pool } from 'pg';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { ethers } from 'ethers';
import { istekOturumIdAl } from '../../lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const ABI = [
    "function kayitEkle(string memory hash, string memory urunAdi, string memory urunTipi) public",
];
const CONTRACT_ADDRESS = "0x9Da4e7F749beAaEF618bD2C2Fe456b86e48387A3";

async function polygonaYaz(hash: string, urunAdi: string, urunTipi: string) {
    try {
        const provider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL);
        const wallet = new ethers.Wallet(process.env.POLYGON_PRIVATE_KEY!, provider);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);

        const tx = await contract.kayitEkle(hash, urunAdi, urunTipi);
        await tx.wait();

        return { basari: true, txHash: tx.hash };
    } catch (err: unknown) {
        console.error('Polygon yazma hatasi:', err);
        return { basari: false, hata: 'Blockchain yazimi basarisiz' };
    }
}

export async function POST(req: NextRequest) {
    try {
        const kullaniciId = istekOturumIdAl(req);
        if (!kullaniciId) {
            return NextResponse.json({ basari: false, hata: 'Oturum gecersiz, lutfen tekrar giris yapin' }, { status: 401 });
        }

        const body = await req.json();
        const { urunAdi, urunTipi, bolge, hasat, miktar, birim, aciklama, detaylar, medyaUrls, surdurulebilirlik } = body;

        const veri = `${urunAdi}${urunTipi}${bolge}${hasat}${miktar}${birim}${Date.now()}`;
        const hash = crypto.createHash('sha256').update(veri).digest('hex');

        await pool.query(`ALTER TABLE urunler ADD COLUMN IF NOT EXISTS surdurulebilirlik JSONB DEFAULT '{}'::jsonb`);

        // Once veritabanina kaydet
        const result = await pool.query(
            `INSERT INTO urunler (kullanici_id, urun_adi, urun_tipi, bolge, hasat_tarihi, miktar, birim, aciklama, hash, detaylar, medya_urls, surdurulebilirlik)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
            [
                kullaniciId, urunAdi, urunTipi, bolge, hasat,
                miktar, birim, aciklama, hash,
                JSON.stringify(detaylar || {}),
                medyaUrls || [],
                JSON.stringify(surdurulebilirlik || {})
            ]
        );

        // Sonra Polygon blockchain'e yaz (arka planda, kullaniciyi bekletmeden sonuc donsun)
        const polygonSonuc = await polygonaYaz(hash, urunAdi, urunTipi);

        // Polygon tx hash'ini veritabanina da kaydet (basarili olduysa)
        if (polygonSonuc.basari && polygonSonuc.txHash) {
            await pool.query(
                `UPDATE urunler SET polygon_tx_hash = $1 WHERE hash = $2`,
                [polygonSonuc.txHash, hash]
            );
        }

        return NextResponse.json({
            basari: true,
            urun: result.rows[0],
            hash,
            polygon: polygonSonuc
        });
    } catch (err: unknown) {
        console.error('urun-ekle hatasi:', err);
        return NextResponse.json({ basari: false, hata: 'Sunucu hatasi, lutfen tekrar deneyin' }, { status: 500 });
    }
}