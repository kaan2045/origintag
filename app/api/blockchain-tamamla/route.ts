import { Pool } from 'pg';
import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const ABI = [
    "function kayitEkle(string memory hash, string memory urunAdi, string memory urunTipi) public",
    "function kayitVarMi(string memory hash) public view returns (bool)",
];
const CONTRACT_ADDRESS = "0x9Da4e7F749beAaEF618bD2C2Fe456b86e48387A3";

export async function POST(req: NextRequest) {
    try {
        const { hash } = await req.json();
        if (!hash) {
            return NextResponse.json({ basari: false, hata: 'hash gerekli' }, { status: 400 });
        }

        const urunSonuc = await pool.query('SELECT * FROM urunler WHERE hash = $1', [hash]);
        const urun = urunSonuc.rows[0];
        if (!urun) {
            return NextResponse.json({ basari: false, hata: 'Ürün bulunamadı' }, { status: 404 });
        }
        if (urun.polygon_tx_hash) {
            return NextResponse.json({ basari: true, zatenKayitli: true, txHash: urun.polygon_tx_hash });
        }

        const provider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL);
        const wallet = new ethers.Wallet(process.env.POLYGON_PRIVATE_KEY!, provider);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);

        // Kontratta bu hash zaten kayıtlıysa (ör. eski bir işlem aslında zincire geçmiş ama
        // veritabanına yazılamamışsa) tekrar kayitEkle çağırmak "Hash zaten kayıtlı" ile geri döner.
        const zincirdeVarMi: boolean = await contract.kayitVarMi(hash);
        if (zincirdeVarMi) {
            await pool.query(
                `UPDATE urunler SET polygon_tx_hash = $1 WHERE hash = $2`,
                ['zincirde-kayitli-tx-bilinmiyor', hash]
            );
            return NextResponse.json({ basari: true, zincirdeZatenVarmis: true });
        }

        const tx = await contract.kayitEkle(hash, urun.urun_adi, urun.urun_tipi);
        await tx.wait();

        await pool.query(
            `UPDATE urunler SET polygon_tx_hash = $1 WHERE hash = $2`,
            [tx.hash, hash]
        );

        return NextResponse.json({ basari: true, txHash: tx.hash });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Bilinmeyen hata';
        return NextResponse.json({ basari: false, hata: message }, { status: 500 });
    }
}
