'use client';
import UrunIllustrasyonu from './UrunIllustrasyonu';
import { UrunTema } from '../lib/urunTema';

/**
 * Hero arka planı: temada video tanımlıysa videoyu oynatır (sessiz, döngülü,
 * otomatik başlar), tanımlı değilse SVG illüstrasyona düşer. Bu sayede video
 * henüz üretilmemiş ürün tipleri (peynir, süt, şarap vb.) sorunsuz çalışmaya
 * devam eder — video eklendikçe urunTema.ts üzerinden kademeli olarak bağlanır.
 */
export default function HeroSahne({ tema }: { tema: UrunTema }) {
    if (tema.video) {
        return (
            <video
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            >
                <source src={tema.video} type="video/mp4" />
            </video>
        );
    }
    return <UrunIllustrasyonu tema={tema.anahtar} />;
}
