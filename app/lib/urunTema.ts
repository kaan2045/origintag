export type UrunTemaAnahtari = 'bal' | 'zeytinyagi' | 'genel';

export interface UrunTema {
    anahtar: UrunTemaAnahtari;
    accent: string;
    deep: string;
    tint: string;
    gradient: string;
    /** Varsa, illüstrasyon yerine hero arka planında oynatılacak video yolu (/public altında) */
    video: string | null;
}

const TEMALAR: Record<UrunTemaAnahtari, UrunTema> = {
    bal: {
        anahtar: 'bal',
        accent: 'var(--bal-accent)',
        deep: 'var(--bal-deep)',
        tint: 'var(--bal-tint)',
        gradient: 'linear-gradient(160deg, #3a2707 0%, #6b4210 42%, #c98a12 100%)',
        video: '/videos/bal-hero.mp4',
    },
    zeytinyagi: {
        anahtar: 'zeytinyagi',
        accent: 'var(--zeytin-accent)',
        deep: 'var(--zeytin-deep)',
        tint: 'var(--zeytin-tint)',
        gradient: 'linear-gradient(160deg, #1f1a0d 0%, #33260f 42%, #5c6b2e 100%)',
        video: '/videos/zeytinyagi-hero.mp4',
    },
    genel: {
        anahtar: 'genel',
        accent: 'var(--genel-accent)',
        deep: 'var(--genel-deep)',
        tint: 'var(--genel-tint)',
        gradient: 'linear-gradient(160deg, #241c0f 0%, #4a3820 42%, #9c7a3c 100%)',
        video: null,
    },
};

/**
 * Veritabanındaki urun_tipi serbest metin olduğu için (Zeytinyagi/Bal/Peynir/...),
 * gelen değeri normalize edip en yakın temayı seçer.
 */
export function urunTemasiniAl(urunTipi: string | undefined | null): UrunTema {
    const normalize = (urunTipi || '')
        .toLocaleLowerCase('tr-TR')
        .replace(/ı/g, 'i');

    if (normalize.includes('bal')) return TEMALAR.bal;
    if (normalize.includes('zeytin')) return TEMALAR.zeytinyagi;
    return TEMALAR.genel;
}
