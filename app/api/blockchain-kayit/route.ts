import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';

const ABI = [
    "function kayitEkle(string memory hash, string memory urunAdi, string memory urunTipi) public",
    "function kayitGetir(string memory hash) public view returns (string memory, string memory, string memory, uint256)"
];

const CONTRACT_ADDRESS = ""; // Sonra ekleyeceğiz

export async function POST(req: NextRequest) {
    try {
        const { hash, urunAdi, urunTipi } = await req.json();

        const provider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL);
        const wallet = new ethers.Wallet(process.env.POLYGON_PRIVATE_KEY!, provider);

        if (!CONTRACT_ADDRESS) {
            return NextResponse.json({ basari: false, hata: 'Contract adresi henuz ayarlanmadi' }, { status: 500 });
        }

        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);
        const tx = await contract.kayitEkle(hash, urunAdi, urunTipi);
        await tx.wait();

        return NextResponse.json({ basari: true, txHash: tx.hash });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Bilinmeyen hata';
        return NextResponse.json({ basari: false, hata: message }, { status: 500 });
    }
}