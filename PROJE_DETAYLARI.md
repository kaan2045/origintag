# OriginTag Proje Detayları (Yeni Sohbete Aktarım İçin)

Bu dosya, sohbet limiti dolduğunda yeni bir Claude Code oturumuna yapıştırıp kaldığın yerden devam edebilmen için hazırlandı.

## Proje Özeti
- **Ne:** Tarım ürünleri (zeytinyağı, bal, peynir, süt, kahve, sebze&meyve, tahıl, turşu/reçel vb.) için blockchain tabanlı QR izlenebilirlik/doğrulama SaaS platformu.
- **Canlı site:** https://origintag.com.tr
- **GitHub:** github.com/kaan2045/origintag
- **Yerel klasör:** `C:\Users\kaanc\Desktop\programlar\blockchain\origintag`
- **Marka:** TÜRKPATENT başvurusu 2026/054815, Kaan Çağrı Çağrıcı adına yapılmış.

## Teknoloji Yığını
- Next.js 16 (App Router), React 19, TypeScript
- Tailwind v4 (CSS-first config, `app/globals.css` içinde design token'lar: `--surface`, `--secondary` vb. ve ürün temasına göre `--{tip}-accent/deep/tint`)
- Neon PostgreSQL (Frankfurt bölgesi)
- Polygon Amoy testnet (chainId 80002) — ethers.js ile hash yazma. Cüzdan: `0xD5e7EC0b61BE7a0963543cc5943997a642E7Ca6d`
- Vercel Blob — medya (fotoğraf/video) depolama
- Vercel — deploy. **ÖNEMLİ TUZAK:** iki Vercel projesi var, `origintag` YANLIŞ/kullanılmıyor; doğru proje `kaan2045s-projects/origintag-nb51`. Her `vercel link`/env işleminde bunu doğrula, yoksa canlı siteyi etkilemez.
- `three.js` / `@react-three/fiber` / `@react-three/drei` — anasayfadaki 3D döner dünya (globe)
- GSAP KULLANILMIYOR (bilinçli tercih — yeni animasyon bağımlılığı istenmiyor)
- i18n: React Context (`app/context/LanguageContext.tsx`), TR/EN, localStorage'da saklanıyor

## Yapılan ve Tamamlanan İşler (deploy edildi)
1. Ürün tipine "Kahve" eklendi.
2. Anasayfaya kıta bazlı doğru coğrafyaya sahip, ülkeler arası ticaret rotalarıyla 3D döner dünya eklendi (`app/components/GlobeSahnesi.tsx`, `app/components/dunyaNoktalari.ts` — world-atlas verisinden 2556 gerçek nokta). Boşta otomatik dönüyor, scroll ve sürüklemeyle de dönüyor, `prefers-reduced-motion` destekleniyor.
3. Blockchain'e yazma hatası düzeltildi: testnet gas yetersizliği + `rpc-amoy.polygon.technology` endpoint'inin çalışmaması. RPC, Vercel env'de `https://polygon-amoy.drpc.org` olarak değiştirildi (3 ortamda da). Dashboard'a, blockchain yazımı başarısız kalan ürünler için "⛓ Blockchain'e Yaz" retry butonu eklendi (`app/api/blockchain-tamamla/route.ts`, `app/dashboard/page.tsx`).
4. Chrome'un dashboard'da gösterdiği "şifre sızıntısı" uyarısı incelendi — bu bir tarayıcı özelliği, kodla ilgisi yok, düzeltme gerekmiyor.
5. `/dogrula/[hash]` (QR doğrulama) sayfasında dil değiştiricinin mobilde çalışmaması sorunu: kök neden, navbar'ın otomatik oynayan video içeren hero container'ının içine gömülü olmasıydı (bazı mobil tarayıcılarda video katmanı dokunmayı engelliyor). Navbar, `position: fixed` bağımsız bir üst katmana taşındı (commit 8be3971). **Kullanıcıdan gerçek telefonda QR okutarak teyit bekleniyordu — sohbet kesildiğinde henüz teyit gelmemişti, bu konu hâlâ takip edilmeli.**
6. Kullanıcı 6 video attı (kahve, peynir, süt, sebze&meyve temaları için); dosya adları yanıltıcıydı, ffmpeg ile kare çıkarılıp içerik gözle doğrulandıktan sonra doğrulama sayfasına tema bazlı arkaplan videoları eklendi. **Sonra kullanıcı bunları geri almamı istedi** ("bu son ekledigimiz videoları kaldır önceki gibi kalsın") — `git revert` ile geri alındı, orijinal hale dönüldü. Bu özellik artık YOK.
7. Yanlışlıkla Olba (başka bir proje) için OriginTag sekmesine yazılan büyük bir prompt/redesign tamamen geri alındı, OriginTag hiç değişmemiş haliyle bırakıldı.

## Google'da Aranabilirlik (ŞU AN AKTİF KONU — YARIM KALDI)
**Kullanıcının hedefi:** Google'a "origintag" yazınca sitenin çıkması (tam URL yazmadan).

Yapılanlar:
- `app/layout.tsx`: Zengin `Metadata` eklendi (metadataBase, title template, keywords, OpenGraph, Twitter, canonical, robots: index/follow true) + `organizationJsonLd` (schema.org Organization) `<head>` içine `<script type="application/ld+json">` ile eklendi.
- `app/robots.ts` (yeni dosya): `/dashboard`, `/urun-ekle`, `/api/` disallow, sitemap linki veriyor.
- `app/sitemap.ts` (yeni dosya): `/`, `/login`, `/register`, `/demo` sayfalarını listeliyor. `curl https://origintag.com.tr/sitemap.xml` ile canlıda 200 OK ve geçerli XML olduğu doğrulandı.
- Google Search Console'da **Domain tipi mülk** (`sc-domain:origintag.com.tr`) DNS TXT kaydıyla METUnic üzerinden doğrulandı — **BAŞARILI, "Sahiplik doğrulandı" onayı alındı.**
- Sitemap gönderildi ama önce "Geçersiz site haritası adresi" hatası aldı (kullanıcı göreli `sitemap.xml` girmişti, domain-tipi mülklerde tam URL gerekiyor). Tam URL (`https://origintag.com.tr/sitemap.xml`) ile tekrar gönderildi.
- **SORUN:** Yeniden gönderilen sitemap, Search Console'da **"Getirilemedi" (fetch başarısız)** durumunda görünüyor, 0 sayfa/video keşfedilmiş. Sitemap dosyasının kendisi curl ile canlı ve geçerli olduğu doğrulanmıştı — yani muhtemelen bu bir zamanlama/işleme gecikmesi (DNS doğrulamasında yaşanan gecikmeye benzer). **Buna henüz kesin bir çözüm/yanıt verilmedi — yeni sohbette önce buradan devam edilmeli.**
- URL Denetimi (URL Inspection) aracında `https://origintag.com.tr/` için **Canlı Test** yapıldı, sonuç: "URL, Google tarafından kullanılabilir" (yeşil), Sayfa kullanılabilirliği ✓, Video keşfi ✓. **"DİZİNE EKLENMESİNİ İSTE" butonu görünüyordu ama henüz TIKLANMADI.**

### Yeni sohbette hemen yapılacaklar:
1. Search Console'a gir, Site Haritaları (Sitemaps) bölümünde sitemap durumunun hâlâ "Getirilemedi" mi yoksa artık işlenmiş mi olduğuna bak (zamanla kendiliğinden düzelebilir).
2. Eğer hâlâ "Getirilemedi" ise, sitemap'i sil ve tekrar `https://origintag.com.tr/sitemap.xml` olarak gönder; olmuyorsa Search Console yardım/forumlarına bakılabilir ama içerik tarafında bir sorun yok (dosya 200 dönüyor, geçerli XML).
3. URL Denetimi ekranında ana sayfa (`https://origintag.com.tr/`) için **"Dizine Eklenmesini İste"** butonuna tıkla — bu, Google'a sayfayı öncelikli taramasını/indekslemesini söyler. Bu adım henüz yapılmamıştı.
4. Kullanıcıya hatırlat: Google indeksleme ve sıralama garantili/anlık değildir, birkaç gün-hafta sürebilir; bizim yapabileceğimiz teknik altyapı (metadata, sitemap, robots, indeksleme isteği) tamamlandı/tamamlanıyor, geri kalanı Google'ın kendi süreci.

## Bilinen Eksik Özellikler (repo durumu değişmiş olabilir, kontrol et)
- Ödeme/abonelik (Stripe/iyzico yok)
- Vaat edilen public API yok
- Şifremi unuttum akışı yok
- Profil düzenleme sayfası yok
- Peynir/süt/şarap için hero videosu yok (SVG illüstrasyona düşüyor) — kahve/peynir/süt/sebze-meyve videoları eklenip sonra GERİ ALINDI, o yüzden hâlâ yok.
- TÜRKPATENT numarası About sayfasında görünmüyor

## Diğer Notlar
- `DESIGN.md` (repo içinde) tasarım sistemi referansı — UI değişikliği yapmadan önce oraya bak.
- Olba diye ayrı bir proje var (`C:\Users\kaanc\Desktop\programlar\olba`) — zeytinyağı markası, OriginTag'le KARIŞTIRMA, tamamen ayrı bir iş.
