import { SurdurulebilirlikProfili } from './surdurulebilirlik';

export type OnemSeviyesi = 'yuksek' | 'orta' | 'dusuk';

export interface Oneri {
    tip: string;
    mesaj: string;
    onem: OnemSeviyesi;
}

interface UrunOneriGirdisi {
    hash: string;
    urun_adi: string;
    polygon_tx_hash: string | null;
    surdurulebilirlik?: SurdurulebilirlikProfili | null;
}

/**
 * Kural tabanli, deterministik oneri motoru -- LLM kullanmiyor. Karar Destek Paneli
 * katmaninin "AI-generated recommendations" kismini karsilar, kayit tutmaz, her
 * cagrida mevcut urun/tarama verisinden hesaplanir (bkz. skorHesapla ile ayni desen).
 */
export function urunIcinOnerilerUret(urun: UrunOneriGirdisi, supheliTaramaVarMi: boolean): Oneri[] {
    const oneriler: Oneri[] = [];
    const s = urun.surdurulebilirlik || {};

    if (!urun.polygon_tx_hash) {
        oneriler.push({
            tip: 'blockchain_yok',
            mesaj: `${urun.urun_adi}: Blockchain'e henüz yazılmadı`,
            onem: 'yuksek',
        });
    }

    if (supheliTaramaVarMi) {
        oneriler.push({
            tip: 'supheli_tarama',
            mesaj: `${urun.urun_adi}: Şüpheli tarama aktivitesi tespit edildi, incelenmesi öneriliyor`,
            onem: 'yuksek',
        });
    }

    if (!s.sertifika || s.sertifika === 'Yok') {
        oneriler.push({
            tip: 'sertifika_yok',
            mesaj: `${urun.urun_adi}: Bir sürdürülebilirlik sertifikası (Organik, Fairtrade vb.) eklemeyi değerlendirin`,
            onem: 'orta',
        });
    }

    if (!s.kimyasalKullanimi || s.kimyasalKullanimi === 'Standart' || s.kimyasalKullanimi === 'Belirtilmedi') {
        oneriler.push({
            tip: 'kimyasal_bilgisi_eksik',
            mesaj: `${urun.urun_adi}: Kimyasal girdi kullanımını azaltıp belgelemeyi düşünün`,
            onem: 'orta',
        });
    }

    if (!s.sulamaYontemi || s.sulamaYontemi !== 'Damla Sulama') {
        oneriler.push({
            tip: 'sulama_verimliligi',
            mesaj: `${urun.urun_adi}: Damla sulamaya geçiş su verimliliğini artırabilir`,
            onem: 'dusuk',
        });
    }

    if (!s.adilCalismaBeyani) {
        oneriler.push({
            tip: 'adil_calisma_beyani_eksik',
            mesaj: `${urun.urun_adi}: Adil çalışma koşulları beyanı eklemeyi düşünün`,
            onem: 'dusuk',
        });
    }

    if (!s.yenilenebilirEnerji) {
        oneriler.push({
            tip: 'yenilenebilir_enerji_eksik',
            mesaj: `${urun.urun_adi}: Yenilenebilir enerji kullanımı beyanı eklemeyi düşünün`,
            onem: 'dusuk',
        });
    }

    return oneriler;
}

const ONEM_SIRASI: Record<OnemSeviyesi, number> = { yuksek: 0, orta: 1, dusuk: 2 };

const TEKIL_ETIKET: Record<string, string> = {
    blockchain_yok: "Blockchain'e yazılmamış",
    supheli_tarama: 'Şüpheli tarama aktivitesi var',
    sertifika_yok: 'Sürdürülebilirlik sertifikası eksik',
    kimyasal_bilgisi_eksik: 'Kimyasal girdi bilgisi eksik/standart',
    sulama_verimliligi: 'Damla sulamaya geçilebilir',
    adil_calisma_beyani_eksik: 'Adil çalışma koşulları beyanı eksik',
    yenilenebilir_enerji_eksik: 'Yenilenebilir enerji beyanı eksik',
};

export interface GruplanmisOneri {
    tip: string;
    onem: OnemSeviyesi;
    mesaj: string;
    etkilenenSayisi: number;
    ilkUrunHash: string;
}

/** Ayni tipteki onerileri tek satirda ozetler (ornegin "3 üründe sertifika eksik"). */
export function onerileriGrupla(tumOneriler: (Oneri & { urunHash: string })[]): GruplanmisOneri[] {
    const gruplar = new Map<string, GruplanmisOneri>();

    for (const oneri of tumOneriler) {
        const mevcut = gruplar.get(oneri.tip);
        if (mevcut) {
            mevcut.etkilenenSayisi += 1;
        } else {
            gruplar.set(oneri.tip, {
                tip: oneri.tip,
                onem: oneri.onem,
                mesaj: TEKIL_ETIKET[oneri.tip] || oneri.mesaj,
                etkilenenSayisi: 1,
                ilkUrunHash: oneri.urunHash,
            });
        }
    }

    return Array.from(gruplar.values())
        .map(g => ({
            ...g,
            mesaj: g.etkilenenSayisi > 1 ? `${g.etkilenenSayisi} üründe: ${g.mesaj}` : g.mesaj,
        }))
        .sort((a, b) => ONEM_SIRASI[a.onem] - ONEM_SIRASI[b.onem]);
}
