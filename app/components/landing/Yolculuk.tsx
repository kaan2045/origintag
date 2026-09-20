'use client';
import { useRef } from 'react';
import Belir from './Belir';
import GorunurVideo from './GorunurVideo';
import { useScrollProgress } from './useScrollProgress';
import type { LandingIcerik } from './icerik';

/**
 * Yolculuk: sabitlenmiş sahnede, kaydırdıkça dört adım tek tek "zincire yazılır".
 * Solda adım listesi + kayıt defteri satırı, sağda o adımın videosu.
 * (#vitrin: basılı QR'lar buraya iner — eski vitrin bağlantısı korunur.)
 */
export default function Yolculuk({ c }: { c: LandingIcerik['yolculuk'] }) {
    const ref = useRef<HTMLElement>(null);
    const p = useScrollProgress(ref, 'pin');
    const n = c.adimlar.length;
    const t = Math.max(0, (p - 0.06) / 0.94);
    const aktif = Math.min(n - 1, Math.floor(t * n));

    return (
        <section id="nasil" ref={ref} style={{ position: 'relative', background: 'var(--surface-container-lowest)', color: 'var(--on-surface)', scrollMarginTop: '5rem' }} className="ld-yolculuk">
            <span id="vitrin" style={{ position: 'absolute', top: 0 }} aria-hidden="true" />

            {/* ---- Masaüstü: sabit sahne ---- */}
            <div className="ld-only-desktop">
                <div style={{ height: '420vh' }}>
                    <div style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden' }}>
                        <div className="ld-wrap" style={{ height: '100%', display: 'grid', gridTemplateColumns: '5fr 7fr', gap: '3rem', alignItems: 'center', paddingTop: '5.5rem', paddingBottom: '2.5rem' }}>
                            <div>
                                <p className="ld-eyebrow">{c.eyebrow}</p>
                                <h2 className="ld-h2" style={{ marginTop: '0.9rem', fontSize: 'clamp(1.8rem, 2.6vw, 2.5rem)' }}>{c.baslik}</h2>
                                <p className="ld-lead" style={{ marginTop: '0.9rem', fontSize: '0.92rem', lineHeight: 1.6, maxWidth: '27rem' }}>{c.aciklama}</p>

                                <ol style={{ listStyle: 'none', margin: '1.9rem 0 0', padding: 0, position: 'relative' }}>
                                    <span aria-hidden="true" style={{ position: 'absolute', left: '9px', top: '0.5rem', bottom: '0.5rem', width: '1px', background: 'rgba(16,20,21,0.12)' }} />
                                    <span aria-hidden="true" style={{ position: 'absolute', left: '9px', top: '0.5rem', width: '1px', background: 'var(--secondary)', height: `calc(${(aktif / (n - 1)) * 100}% - 1rem)`, transition: 'height 700ms var(--ease-out-expo)' }} />
                                    {c.adimlar.map((a, i) => {
                                        const bitti = i <= aktif;
                                        const bu = i === aktif;
                                        return (
                                            <li key={a.anahtar} style={{ position: 'relative', paddingLeft: '2.5rem', paddingBottom: i === n - 1 ? 0 : '1.25rem' }}>
                                                <span style={{
                                                    position: 'absolute', left: 0, top: '0.35rem', width: '19px', height: '19px', borderRadius: '4px',
                                                    border: `1px solid ${bitti ? 'var(--secondary)' : 'rgba(16,20,21,0.3)'}`,
                                                    background: bitti ? 'var(--secondary)' : 'transparent',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    transition: 'all 450ms ease',
                                                }}>
                                                    {bitti && <span style={{ width: '6px', height: '6px', background: 'var(--on-secondary)', borderRadius: '1px' }} />}
                                                </span>
                                                <div style={{ opacity: bitti ? 1 : 0.38, transition: 'opacity 450ms ease' }}>
                                                    <h3 className="font-display" style={{ margin: 0, fontSize: '1.2rem', fontWeight: 500, letterSpacing: '-0.01em' }}>{a.baslik}</h3>
                                                    <div style={{ display: 'grid', gridTemplateRows: bu ? '1fr' : '0fr', opacity: bu ? 1 : 0, transition: 'grid-template-rows 700ms var(--ease-out-expo), opacity 500ms ease' }}>
                                                        <div style={{ overflow: 'hidden' }}>
                                                            <p style={{ margin: '0.4rem 0 0', color: 'var(--on-surface-variant)', fontSize: '0.88rem', lineHeight: 1.6, maxWidth: '26rem' }}>{a.metin}</p>
                                                            <p className="mono-label" style={{ margin: '0.75rem 0 0', fontSize: '0.64rem', letterSpacing: '0.06em', textTransform: 'none', color: 'var(--secondary)' }}>
                                                                <span style={{ color: 'rgba(16,20,21,0.35)' }}>›</span> {a.defter}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ol>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <div style={{ position: 'relative', height: 'min(76vh, 720px)', aspectRatio: '4 / 5', maxWidth: '100%', overflow: 'hidden', borderRadius: 'var(--radius-xl)', border: '1px solid rgba(16,20,21,0.1)', background: 'var(--surface-container-low)', boxShadow: '0 40px 90px -40px rgba(16,20,21,0.45)' }}>
                                    {c.adimlar.map((a, i) => (
                                        <div key={a.anahtar} style={{ position: 'absolute', inset: 0, opacity: i === aktif ? 1 : 0, transform: i === aktif ? 'scale(1)' : 'scale(1.05)', transition: 'opacity 900ms var(--ease-out-expo), transform 1200ms var(--ease-out-expo)' }}>
                                            <GorunurVideo src={a.video} aktif={i === aktif} />
                                        </div>
                                    ))}
                                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(10,15,16,0.25) 0%, transparent 35%, rgba(10,15,16,0.75) 100%)' }} />
                                    <div className="mono-label" style={{ position: 'absolute', left: '1.4rem', top: '1.3rem', fontSize: '0.64rem', color: 'rgba(224,227,229,0.8)' }}>
                                        {String(aktif + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}
                                    </div>
                                    <div style={{ position: 'absolute', left: '1.4rem', right: '1.4rem', bottom: '1.4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '1rem' }}>
                                        <span className="font-display" style={{ fontSize: '1.15rem', fontWeight: 600, color: '#fff' }}>{c.adimlar[aktif].baslik}</span>
                                        <span style={{ display: 'flex', gap: '6px' }}>
                                            {c.adimlar.map((_, i) => (
                                                <span key={i} style={{ width: i === aktif ? '22px' : '6px', height: '4px', borderRadius: 'var(--radius-full)', background: i <= aktif ? '#b2e630' : 'rgba(255,255,255,0.35)', transition: 'all 400ms var(--ease-out-expo)' }} />
                                            ))}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ---- Mobil / tablet: sıralı ---- */}
            <div className="ld-only-mobile">
                <div className="ld-wrap" style={{ padding: '5.5rem 1.5rem' }}>
                    <Belir>
                        <p className="ld-eyebrow">{c.eyebrow}</p>
                        <h2 className="ld-h2" style={{ marginTop: '1rem' }}>{c.baslik}</h2>
                        <p className="ld-lead" style={{ marginTop: '1rem' }}>{c.aciklama}</p>
                    </Belir>
                    <ol style={{ listStyle: 'none', padding: 0, margin: '3rem 0 0', display: 'grid', gap: '3rem' }}>
                        {c.adimlar.map((a, i) => (
                            <li key={a.anahtar}>
                                <Belir>
                                    <div style={{ position: 'relative', aspectRatio: '4 / 3', overflow: 'hidden', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(16,20,21,0.1)', background: 'var(--surface-container-low)' }}>
                                        <GorunurVideo src={a.video} />
                                        <div className="mono-label" style={{ position: 'absolute', left: '1rem', top: '0.9rem', fontSize: '0.62rem', color: 'rgba(224,227,229,0.85)' }}>
                                            {String(i + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}
                                        </div>
                                    </div>
                                    <h3 className="font-display" style={{ margin: '1.2rem 0 0', fontSize: '1.35rem', fontWeight: 500 }}>{a.baslik}</h3>
                                    <p style={{ margin: '0.5rem 0 0', color: 'var(--on-surface-variant)', lineHeight: 1.65, fontSize: '0.95rem' }}>{a.metin}</p>
                                    <p className="mono-label" style={{ margin: '0.7rem 0 0', fontSize: '0.64rem', letterSpacing: '0.06em', textTransform: 'none', color: 'var(--secondary)' }}>
                                        <span style={{ color: 'rgba(16,20,21,0.35)' }}>›</span> {a.defter}
                                    </p>
                                </Belir>
                            </li>
                        ))}
                    </ol>
                </div>
            </div>
        </section>
    );
}
