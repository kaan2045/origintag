/**
 * Tarayicida da kullanilabilen zincir bilgisi (ethers ya da sozlesme dosyasi
 * icermez; dogrulama sayfasi bir istemci bileseni).
 */
export type Ag = 'amoy' | 'polygon';

export const AG_BILGISI: Record<Ag, { chainId: bigint; ad: string; kasif: string; testAgi: boolean }> = {
    amoy: { chainId: BigInt(80002), ad: 'Polygon Amoy', kasif: 'https://amoy.polygonscan.com', testAgi: true },
    polygon: { chainId: BigInt(137), ad: 'Polygon', kasif: 'https://polygonscan.com', testAgi: false },
};

/** zincir_agi bos olan kayitlar kolon eklenmeden once yazildi; hepsi Amoy'daydi. */
export function kayitAgi(zincirAgi: string | null | undefined): Ag {
    return zincirAgi === 'polygon' ? 'polygon' : 'amoy';
}

export function islemAdresi(zincirAgi: string | null | undefined, txHash: string): string {
    return `${AG_BILGISI[kayitAgi(zincirAgi)].kasif}/tx/${txHash}`;
}
