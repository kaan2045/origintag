// Ana ag icin yeni, sadece bu ise ayrilmis bir sunucu cuzdani uretir.
// Anahtar yalnizca bu terminale yazilir; hicbir yere kaydedilmez ve gonderilmez.
//
//   node scripts/cuzdan-olustur.mjs
import { ethers } from 'ethers';

const c = ethers.Wallet.createRandom();

console.log(`
Yeni cuzdan olusturuldu.

  ADRES (herkese acik, POL'u buna gondereceksin):
  ${c.address}

  OZEL ANAHTAR (GIZLI - kimseyle paylasma, sohbete/e-postaya yapistirma):
  ${c.privateKey}

Simdi yapman gerekenler:
  1. Proje klasorunde .env.polygon adinda bir dosya olustur ve icine yaz:
       POLYGON_RPC_URL=https://polygon-bor-rpc.publicnode.com
       POLYGON_PRIVATE_KEY=<yukaridaki ozel anahtar>
     (.env* dosyalari git'e girmiyor.)
  2. Bu ozel anahtari bir parola yoneticisine de kaydet. Kaybolursa sozlesmeye
     kayit eklenemez; yeni sozlesme gerekir.
  3. Adrese Polygon agi uzerinden POL gonder. 10 POL onerilir: sozlesme yukleme
     ~0.5 POL, urun basina ~0.03-0.06 POL (gaz fiyatina gore).
  4. Terminali temizle: cls
`);
