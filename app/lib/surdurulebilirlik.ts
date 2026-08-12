export type SertifikaTuru = 'Yok' | 'Organik' | 'Fairtrade' | 'Rainforest Alliance' | 'GlobalG.A.P.' | 'Diger';
export type SulamaYontemi = 'Belirtilmedi' | 'Damla Sulama' | 'Yagmurlama' | 'Salma Sulama';
export type KimyasalKullanimi = 'Belirtilmedi' | 'Kullanilmadi' | 'Az/Kontrollu' | 'Standart';

export interface SurdurulebilirlikProfili {
    sertifika?: SertifikaTuru;
    sertifikaNo?: string;
    sulamaYontemi?: SulamaYontemi;
    kimyasalKullanimi?: KimyasalKullanimi;
    adilCalismaBeyani?: boolean;
    yenilenebilirEnerji?: boolean;
}

/**
 * Uretici beyanina dayali, kural tabanli bir sozde-skor -- ucuncu taraf denetimi degil.
 * Skor kaydedilmez, her okumada bu fonksiyonla hesaplanir (bkz. plan: skorHesapla tek kaynak).
 */
export function skorHesapla(profil: SurdurulebilirlikProfili | null | undefined): number {
    if (!profil) return 0;
    let skor = 0;

    if (profil.sertifika && profil.sertifika !== 'Yok') skor += 35;
    if (profil.sulamaYontemi === 'Damla Sulama') skor += 20;
    if (profil.kimyasalKullanimi === 'Kullanilmadi') skor += 20;
    else if (profil.kimyasalKullanimi === 'Az/Kontrollu') skor += 10;
    if (profil.adilCalismaBeyani) skor += 15;
    if (profil.yenilenebilirEnerji) skor += 10;

    return skor;
}
