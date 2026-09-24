// Zincir betiklerinin ortak parcalari. Betikler --env <dosya> ile hangi ayar dosyasini
// okuyacagini alir (varsayilan .env.local); ana ag icin ayri bir .env.polygon onerilir.
import { readFileSync } from 'node:fs';
import dotenv from 'dotenv';
import { ethers } from 'ethers';

export const AGLAR = {
    80002n: { ad: 'Polygon Amoy (TEST agi)', kasif: 'https://amoy.polygonscan.com', gercekPara: false },
    137n: { ad: 'Polygon ANA AG', kasif: 'https://polygonscan.com', gercekPara: true },
};

export function argumanlar() {
    const a = process.argv.slice(2);
    const envIdx = a.indexOf('--env');
    const hashIdx = a.indexOf('--hash');
    return {
        envDosyasi: envIdx >= 0 ? a[envIdx + 1] : '.env.local',
        onayla: a.includes('--onayla'),
        tekHash: hashIdx >= 0 ? a[hashIdx + 1] : null,
    };
}

export function ayarlariYukle(envDosyasi) {
    // override: .env.local daha once yuklendiyse (kayitlari-tasi DATABASE_URL icin yukluyor)
    // oradaki Amoy ayarlari, --env ile verilen ana ag ayarlarini ezmemeli.
    const sonuc = dotenv.config({ path: envDosyasi, quiet: true, override: true });
    if (sonuc.error) throw new Error(`${envDosyasi} okunamadi`);
    for (const k of ['POLYGON_RPC_URL', 'POLYGON_PRIVATE_KEY']) {
        if (!process.env[k]) throw new Error(`${envDosyasi} icinde ${k} yok`);
    }
}

export async function baglan() {
    const provider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL);
    const { chainId } = await provider.getNetwork();
    const ag = AGLAR[chainId];
    if (!ag) throw new Error(`Bilinmeyen ag (chainId ${chainId}); yalnizca Polygon ana ag ve Amoy destekleniyor`);
    const cuzdan = new ethers.Wallet(process.env.POLYGON_PRIVATE_KEY, provider);
    return { provider, cuzdan, ag, chainId };
}

export function kontratDosyasi() {
    return JSON.parse(readFileSync(new URL('../contracts/OriginTagRegistry.json', import.meta.url), 'utf8'));
}

export const pol = (wei) => `${Number(ethers.formatEther(wei)).toFixed(5)} POL`;
