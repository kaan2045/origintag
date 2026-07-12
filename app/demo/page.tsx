'use client';
import { useLanguage } from '../context/LanguageContext';
import { useVideoRotasyonu } from '../lib/useVideoRotasyonu';

const VITRIN = [
    { video: '/videos/zeytinyagi-hero.mp4', ad: { tr: 'Zeytinyağı', en: 'Olive Oil' } },
    { video: '/videos/bal-hero.mp4', ad: { tr: 'Bal', en: 'Honey' } },
    { video: '/videos/landing-hero.mp4', ad: { tr: 'Zeytin Bahçesi', en: 'Olive Grove' } },
];

export default function DemoPage() {
    const { lang } = useLanguage();
    const { src, index, sonuyor } = useVideoRotasyonu(VITRIN.map(v => v.video), 7000);
    const aktif = VITRIN[index];

    return (
        <main style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: '#23261e', color: '#f0eadd' }}>
            <video
                key={src}
                autoPlay muted loop playsInline preload="auto"
                style={{
                    position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
                    opacity: sonuyor ? 0 : 1, transition: 'opacity 0.7s ease',
                }}
            >
                <source src={src} type="video/mp4" />
            </video>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(20,22,15,0.35) 0%, rgba(20,22,15,0.15) 40%, rgba(20,22,15,0.75) 100%)' }} />
            <div style={{ position: 'absolute', inset: '20px', border: '1px solid rgba(240,234,221,0.16)', borderRadius: '2px', pointerEvents: 'none' }} />

            <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ padding: '2rem 2.5rem' }}>
                    <img src="/origin.png" alt="OriginTag" style={{ height: '30px', filter: 'brightness(0) invert(1)', opacity: 0.95 }} />
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '2rem 2.5rem 3.5rem', textAlign: 'center' }}>
                    <p className="mono-label" style={{ opacity: 0.75, marginBottom: '1rem' }}>
                        {lang === 'tr' ? 'Blockchain İzlenebilirlik Vitrini' : 'Blockchain Traceability Showcase'}
                    </p>
                    <h1
                        key={index}
                        className="font-display"
                        style={{
                            fontSize: 'clamp(2.4rem, 6vw, 4rem)', fontWeight: 600, letterSpacing: '-0.02em', margin: 0,
                            opacity: sonuyor ? 0 : 1, transition: 'opacity 0.7s ease',
                        }}
                    >
                        {lang === 'tr' ? aktif.ad.tr : aktif.ad.en}
                    </h1>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '2rem' }}>
                        {VITRIN.map((_, i) => (
                            <div key={i} style={{
                                width: i === index ? '28px' : '8px', height: '4px', borderRadius: '2px',
                                background: i === index ? '#c9a15a' : 'rgba(240,234,221,0.35)',
                                transition: 'all 0.4s ease',
                            }} />
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
}
