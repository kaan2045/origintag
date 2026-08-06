export type UrunTemaAnahtari = 'bal' | 'zeytinyagi' | 'kahve' | 'peynir' | 'sutUrunleri' | 'sebzeMeyve' | 'tahil' | 'genel';

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
    kahve: {
        anahtar: 'kahve',
        accent: 'var(--kahve-accent)',
        deep: 'var(--kahve-deep)',
        tint: 'var(--kahve-tint)',
        gradient: 'linear-gradient(160deg, #2e1b0f 0%, #4a2f1c 42%, #8b5a2b 100%)',
        video: '/videos/kahve-hero.mp4',
    },
    peynir: {
        anahtar: 'peynir',
        accent: 'var(--peynir-accent)',
        deep: 'var(--peynir-deep)',
        tint: 'var(--peynir-tint)',
        gradient: 'linear-gradient(160deg, #241d12 0%, #4a3c28 42%, #c9a66b 100%)',
        video: '/videos/peynir-hero.mp4',
    },
    sutUrunleri: {
        anahtar: 'sutUrunleri',
        accent: 'var(--sut-accent)',
        deep: 'var(--sut-deep)',
        tint: 'var(--sut-tint)',
        gradient: 'linear-gradient(160deg, #16201d 0%, #26332f 42%, #8fa39d 100%)',
        video: '/videos/sut-hero.mp4',
    },
    sebzeMeyve: {
        anahtar: 'sebzeMeyve',
        accent: 'var(--sebze-meyve-accent)',
        deep: 'var(--sebze-meyve-deep)',
        tint: 'var(--sebze-meyve-tint)',
        gradient: 'linear-gradient(160deg, #19230d 0%, #2b3a17 42%, #7a9b3f 100%)',
        video: '/videos/sebze-meyve-hero.mp4',
    },
    tahil: {
        anahtar: 'tahil',
        accent: 'var(--tahil-accent)',
        deep: 'var(--tahil-deep)',
        tint: 'var(--tahil-tint)',
        gradient: 'linear-gradient(160deg, #241c09 0%, #4a3c10 42%, #c9a227 100%)',
        video: '/videos/tahil-hero.mp4',
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
    if (normalize.includes('kahve')) return TEMALAR.kahve;
    if (normalize.includes('peynir')) return TEMALAR.peynir;
    if (normalize.includes('sut')) return TEMALAR.sutUrunleri;
    if (normalize.includes('sebze') || normalize.includes('meyve')) return TEMALAR.sebzeMeyve;
    if (normalize.includes('tahil')) return TEMALAR.tahil;
    return TEMALAR.genel;
}
