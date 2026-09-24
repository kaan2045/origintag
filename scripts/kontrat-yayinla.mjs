// OriginTagRegistry sozlesmesini baglanilan aga yukler.
//
//   node scripts/kontrat-yayinla.mjs --env .env.polygon            (kuru calisma: maliyet ve bakiye)
//   node scripts/kontrat-yayinla.mjs --env .env.polygon --onayla   (gercekten yukler)
//
// Yuklenen kod contracts/OriginTagRegistry.json'daki bytecode: Amoy'daki dogrulanmis
// sozlesmeyle bit bit ayni. Sozlesmenin sahibi (kayit ekleyebilen tek adres),
// yuklemeyi yapan cuzdan olur.
import { ethers } from 'ethers';
import { argumanlar, ayarlariYukle, baglan, kontratDosyasi, pol } from './zincirOrtak.mjs';

const { envDosyasi, onayla } = argumanlar();
ayarlariYukle(envDosyasi);
const { provider, cuzdan, ag } = await baglan();
const k = kontratDosyasi();

const fabrika = new ethers.ContractFactory(k.abi, k.bytecode, cuzdan);
const islem = await fabrika.getDeployTransaction();
const gaz = await provider.estimateGas({ ...islem, from: cuzdan.address });
const { maxFeePerGas, gasPrice } = await provider.getFeeData();
const birimFiyat = maxFeePerGas ?? gasPrice;
const tahmini = gaz * birimFiyat;
const bakiye = await provider.getBalance(cuzdan.address);

console.log(`
Ag            : ${ag.ad}
Cuzdan        : ${cuzdan.address}
Bakiye        : ${pol(bakiye)}
Tahmini ucret : ${pol(tahmini)} (${gaz} gaz, ust sinir)
`);

if (bakiye < tahmini) {
    console.log('Bakiye yetersiz. Once bu adrese POL gonder.');
    process.exit(1);
}
if (!onayla) {
    console.log('Kuru calisma: hicbir sey gonderilmedi. Yuklemek icin komutu --onayla ile tekrar calistir.');
    process.exit(0);
}

console.log('Yukleniyor...');
const sozlesme = await fabrika.deploy();
const tx = sozlesme.deploymentTransaction();
console.log(`Islem gonderildi: ${ag.kasif}/tx/${tx.hash}`);
await sozlesme.waitForDeployment();
const adres = await sozlesme.getAddress();

const sahip = await sozlesme.owner();
if (sahip.toLowerCase() !== cuzdan.address.toLowerCase()) {
    throw new Error(`Beklenmeyen sahip: ${sahip}`);
}
const harcanan = bakiye - (await provider.getBalance(cuzdan.address));

console.log(`
Sozlesme yuklendi.
  Adres   : ${adres}
  Gezgin  : ${ag.kasif}/address/${adres}
  Sahip   : ${sahip} (bu cuzdan)
  Harcanan: ${pol(harcanan)}

Vercel'de (origintag-nb51 projesi, Production) su degiskenleri ayarla:
  POLYGON_AG=${ag.gercekPara ? 'polygon' : 'amoy'}
  POLYGON_KONTRAT_ADRESI=${adres}
  POLYGON_RPC_URL=<${envDosyasi} icindeki RPC adresi>
  POLYGON_PRIVATE_KEY=<${envDosyasi} icindeki ozel anahtar>
Sonra yeniden dagit (deploy).
`);
