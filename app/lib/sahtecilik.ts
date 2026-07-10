/**
 * Sahtecilik / anomali tespit mantığı.
 *
 * Kapsam (v1):
 *  1. İmkansız hız: aynı ürün hash'inin iki ardışık taraması arasındaki
 *     hesaplanan hız, gerçekçi hiçbir ulaşım aracıyla açıklanamayacak
 *     kadar yüksekse (varsayılan eşik: 900 km/sa) şüpheli işaretlenir.
 *  2. Yüksek frekans: aynı ürün hash'i kısa bir zaman penceresinde
 *     (varsayılan: 1 saat) anormal sayıda taranıyorsa (varsayılan eşik: 50)
 *     şüpheli işaretlenir.
 *
 * Not: Konum tespiti ücretsiz IP geolocation servisi (ip-api.com) ile
 * yapılıyor. Bu servis VPN/proxy kullanan kullanıcılarda hatalı konum
 * verebilir, dolayısıyla "imkansız hız" sinyali %100 kesin bir sahtecilik
 * kanıtı değil, incelenmesi gereken bir sinyaldir. Dashboard'da bu nüans
 * açıkça belirtilmelidir.
 */

export const SAHTECILIK_ESIKLERI = {
    /** km/sa - bu hızın üstü "imkansız" kabul edilir */
    IMKANSIZ_HIZ_KMH: 900,
    /** Yüksek frekans kontrolü için zaman penceresi (dakika) */
    FREKANS_PENCERE_DAKIKA: 60,
    /** Bu pencere içinde bu sayının üstü tarama "anormal" kabul edilir */
    FREKANS_ESIK_SAYI: 50,
} as const;

export type SupheliTip = 'imkansiz_hiz' | 'yuksek_frekans';

export interface TaramaNoktasi {
    enlem: number | null;
    boylam: number | null;
    tarama_tarihi: string | Date;
}

export interface SahtecilikSonucu {
    supheli: boolean;
    tip: SupheliTip | null;
    detay: string | null;
}

/**
 * İki coğrafi nokta arası mesafeyi km cinsinden hesaplar (Haversine formülü).
 */
export function haversineMesafeKm(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number {
    const R = 6371; // Dünya yarıçapı (km)
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

/**
 * Yeni bir taramayı, aynı ürünün önceki taramalarıyla karşılaştırarak
 * şüpheli olup olmadığını belirler.
 *
 * @param yeniTarama Az önce kaydedilecek taramanın konum + zaman bilgisi
 * @param oncekiTaramalar Aynı ürün hash'inin geçmiş taramaları (en yeni ilk sırada olması beklenmez, fonksiyon kendi sıralar)
 */
export function sahtecilikKontrolEt(
    yeniTarama: TaramaNoktasi,
    oncekiTaramalar: TaramaNoktasi[]
): SahtecilikSonucu {
    const yeniZaman = new Date(yeniTarama.tarama_tarihi).getTime();

    // --- Kural 1: İmkansız hız ---
    if (yeniTarama.enlem !== null && yeniTarama.boylam !== null) {
        const konumluGecmis = oncekiTaramalar
            .filter(t => t.enlem !== null && t.boylam !== null)
            .sort((a, b) => new Date(b.tarama_tarihi).getTime() - new Date(a.tarama_tarihi).getTime());

        const sonTarama = konumluGecmis[0];
        if (sonTarama) {
            const sonZaman = new Date(sonTarama.tarama_tarihi).getTime();
            const gecenSaat = Math.abs(yeniZaman - sonZaman) / (1000 * 60 * 60);

            const efektifSaat = Math.max(gecenSaat, 1 / 3600);

            const mesafeKm = haversineMesafeKm(
                yeniTarama.enlem,
                yeniTarama.boylam,
                sonTarama.enlem as number,
                sonTarama.boylam as number
            );

            const hizKmh = mesafeKm / efektifSaat;

            if (hizKmh > SAHTECILIK_ESIKLERI.IMKANSIZ_HIZ_KMH && mesafeKm > 50) {
                return {
                    supheli: true,
                    tip: 'imkansiz_hiz',
                    detay: `${Math.round(mesafeKm)} km mesafe, ${gecenSaat < 1 ? Math.round(gecenSaat * 60) + ' dk' : gecenSaat.toFixed(1) + ' sa'} içinde tarandı (~${Math.round(hizKmh)} km/sa)`,
                };
            }
        }
    }

    // --- Kural 2: Yüksek frekans ---
    const pencereMs = SAHTECILIK_ESIKLERI.FREKANS_PENCERE_DAKIKA * 60 * 1000;
    const pencereIciSayi = oncekiTaramalar.filter(t => {
        const fark = Math.abs(yeniZaman - new Date(t.tarama_tarihi).getTime());
        return fark <= pencereMs;
    }).length + 1;

    if (pencereIciSayi >= SAHTECILIK_ESIKLERI.FREKANS_ESIK_SAYI) {
        return {
            supheli: true,
            tip: 'yuksek_frekans',
            detay: `Son ${SAHTECILIK_ESIKLERI.FREKANS_PENCERE_DAKIKA} dakika içinde ${pencereIciSayi} tarama`,
        };
    }

    return { supheli: false, tip: null, detay: null };
}