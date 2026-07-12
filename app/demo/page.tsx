'use client';
import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import VideoKatmanlari from '../components/VideoKatmanlari';

const VITRIN = [
    { video: '/videos/landing-hero.mp4', ad: { tr: 'Zeytin Bahçesi', en: 'Olive Grove' } },
    { video: '/videos/bal-hero.mp4', ad: { tr: 'Bal', en: 'Honey' } },
];

export default function DemoPage() {
    const { lang } = useLanguage();
    const [index, setIndex] = useState(0);
    const aktif = VITRIN[index];

    return (
        <main style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: '#23261e', color: '#f0eadd' }}>
            <VideoKatmanlari videos={VITRIN.map(v => v.video)} intervalMs={7000} onIndexChange={setIndex} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(20,22,15,0.35) 0%, rgba(20,22,15,0.15) 40%, rgba(20,22,15,0.75) 100%)' }} />
            <div style={{ position: 'absolute', inset: '20px', border: '1px solid rgba(240,234,221,0.16)', borderRadius: '2px', pointerEvents: 'none' }} />

            <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ padding: '2rem 2.5rem' }}>
                    <img src="/origin.png" alt="OriginTag" style={{ height: '30px', filter: 'drop-shadow(0 1px 4px rgba(0,0,0,0.5))' }} />
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '2rem 2.5rem 3.5rem', textAlign: 'center' }}>
                    <p className="mono-label" style={{ opacity: 0.75, marginBottom: '1rem' }}>
                        {lang === 'tr' ? 'Blockchain İzlenebilirlik Vitrini' : 'Blockchain Traceability Showcase'}
                    </p>
                    <h1
                        key={index}
                        className="font-display"
                        style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 600, letterSpacing: '-0.02em', margin: 0 }}
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
