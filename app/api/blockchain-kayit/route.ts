import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ABI = [
    "function kayitEkle(string memory hash, string memory urunAdi, string memory urunTipi) public",
    "function kayitGetir(string memory hash) public view returns (string memory, string memory, uint256, address, bool)",
    "function kayitVarMi(string memory hash) public view returns (bool)"
];

const CONTRACT_ADDRESS = "0x9Da4e7F749beAaEF618bD2C2Fe456b86e48387A3";

export async function POST(req: NextRequest) {
    try {
        const { hash, urunAdi, urunTipi } = await req.json();

        if (!hash || !urunAdi || !urunTipi) {
            return NextResponse.json({ basari: false, hata: 'hash, urunAdi ve urunTipi gerekli' }, { status: 400 });
        }

        const provider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL);
        const wallet = new ethers.Wallet(process.env.POLYGON_PRIVATE_KEY!, provider);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);

        const tx = await contract.kayitEkle(hash, urunAdi, urunTipi);
        const receipt = await tx.wait();

        return NextResponse.json({
            basari: true,
            txHash: tx.hash,
            blockNumber: receipt.blockNumber,
            polygonscanUrl: `https://amoy.polygonscan.com/tx/${tx.hash}`
        });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Bilinmeyen hata';
        return NextResponse.json({ basari: false, hata: message }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const hash = searchParams.get('hash');

        if (!hash) {
            return NextResponse.json({ basari: false, hata: 'hash parametresi gerekli' }, { status: 400 });
        }

        const provider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

        const [urunAdi, urunTipi, zamanDamgasi, kaydedenAdres, mevcut] = await contract.kayitGetir(hash);

        return NextResponse.json({
            basari: true,
            mevcut,
            urunAdi,
            urunTipi,
            zamanDamgasi: zamanDamgasi.toString(),
            kaydedenAdres
        });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Bilinmeyen hata';
        return NextResponse.json({ basari: false, hata: message }, { status: 500 });
    }
}