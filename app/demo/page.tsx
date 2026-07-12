'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '../context/LanguageContext';

const VITRIN = [
    {
        video: '/videos/bugday-hero.mp4',
        baslik: { tr: 'Buğday Tarlası', en: 'Wheat Field' },
        aciklama: { tr: 'Altın başaklar, hasat öncesi son günler.', en: 'Golden stalks in the final days before harvest.' },
    },
    {
        video: '/videos/landing-hero.mp4',
        baslik: { tr: 'Zeytin Bahçesi', en: 'Olive Grove' },
        aciklama: { tr: 'Toroslar eteklerinde, ilaçlamasız zeytin ağaçları.', en: 'Pesticide-free olive trees at the foot of the Taurus mountains.' },
    },
    {
        video: '/videos/bal-hero.mp4',
        baslik: { tr: 'Bal Üretimi', en: 'Honey Production' },
        aciklama: { tr: 'Kovanlardan doğal, katkısız bal — el emeği, göz nuru.', en: 'Natural, unadulterated honey straight from the hive.' },
    },
];

export default function DemoPage() {
    const { lang } = useLanguage();
    const [index, setIndex] = useState(0);
    const aktif = VITRIN[index];

    const onceki = () => setIndex(i => (i - 1 + VITRIN.length) % VITRIN.length);
    const sonraki = () => setIndex(i => (i + 1) % VITRIN.length);

    return (
        <main style={{ minHeight: '100vh', background: 'var(--parchment)' }}>
            <nav style={{ padding: '1.75rem 2.5rem' }}>
                <Link href="/">
                    <img src="/origin.png" alt="OriginTag" style={{ height: '32px' }} />
                </Link>
            </nav>

            <div style={{ padding: '2rem 2rem 5rem', maxWidth: '900px', margin: '0 auto' }}>
                <p className="mono-label" style={{ textAlign: 'center', color: '#9a8f78', marginBottom: '2.5rem' }}>
                    {lang === 'tr' ? 'Blockchain İzlenebilirlik Vitrini' : 'Blockchain Traceability Showcase'}
                </p>

                <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>

                    {/* Video karti + ok tuslari */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button
                            onClick={onceki}
                            aria-label={lang === 'tr' ? 'Önceki video' : 'Previous video'}
                            style={{
                                width: '40px', height: '40px', borderRadius: '50%', border: '1px solid #d8cfb8',
                                background: '#fff', cursor: 'pointer', fontSize: '1.1rem', color: 'var(--ink)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                            }}
                        >‹</button>

                        <div style={{
                            width: '260px', height: '460px', borderRadius: '20px', overflow: 'hidden', position: 'relative',
                            boxShadow: '0 24px 60px -12px rgba(35,38,30,0.35)', flexShrink: 0, background: '#23261e',
                        }}>
                            <video
                                key={aktif.video}
                                autoPlay muted loop playsInline preload="auto"
                                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                            >
                                <source src={aktif.video} type="video/mp4" />
                            </video>
                        </div>

                        <button
                            onClick={sonraki}
                            aria-label={lang === 'tr' ? 'Sonraki video' : 'Next video'}
                            style={{
                                width: '40px', height: '40px', borderRadius: '50%', border: '1px solid #d8cfb8',
                                background: '#fff', cursor: 'pointer', fontSize: '1.1rem', color: 'var(--ink)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                            }}
                        >›</button>
                    </div>

                    {/* Metin */}
                    <div style={{ flex: '1 1 260px', minWidth: '220px' }}>
                        <h3 className="font-display" style={{ fontSize: '1.6rem', fontWeight: 600, color: 'var(--ink)', marginBottom: '0.6rem' }}>
                            {lang === 'tr' ? aktif.baslik.tr : aktif.baslik.en}
                        </h3>
                        <p style={{ color: '#6b6558', lineHeight: 1.6, fontSize: '0.95rem', marginBottom: '1.5rem' }}>
                            {lang === 'tr' ? aktif.aciklama.tr : aktif.aciklama.en}
                        </p>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            {VITRIN.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setIndex(i)}
                                    aria-label={`${i + 1}`}
                                    style={{
                                        width: i === index ? '24px' : '8px', height: '4px', borderRadius: '2px',
                                        background: i === index ? '#5c6b2e' : '#d8cfb8', border: 'none', padding: 0,
                                        cursor: 'pointer', transition: 'all 0.3s ease',
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
