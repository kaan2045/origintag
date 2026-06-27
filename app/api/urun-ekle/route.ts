import { Pool } from 'pg';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { ethers } from 'ethers';

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
        const message = err instanceof Error ? err.message : 'Bilinmeyen hata';
        console.error('Polygon yazma hatasi:', message);
        return { basari: false, hata: message };
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { urunAdi, urunTipi, bolge, hasat, miktar, birim, aciklama, kullaniciId, detaylar, medyaUrls } = body;

        const veri = `${urunAdi}${urunTipi}${bolge}${hasat}${miktar}${birim}${Date.now()}`;
        const hash = crypto.createHash('sha256').update(veri).digest('hex');

        // Once veritabanina kaydet
        const result = await pool.query(
            `INSERT INTO urunler (kullanici_id, urun_adi, urun_tipi, bolge, hasat_tarihi, miktar, birim, aciklama, hash, detaylar, medya_urls)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
            [
                kullaniciId || 1, urunAdi, urunTipi, bolge, hasat,
                miktar, birim, aciklama, hash,
                JSON.stringify(detaylar || {}),
                medyaUrls || []
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
        const message = err instanceof Error ? err.message : 'Bilinmeyen hata';
        return NextResponse.json({ basari: false, hata: message }, { status: 500 });
    }
}