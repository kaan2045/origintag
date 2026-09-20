'use client';
import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import Belir from './Belir';
import DogrulamaYolculugu from '../DogrulamaYolculugu';
import type { LandingIcerik } from './icerik';

type Durum = 'bekliyor' | 'taraniyor' | 'dogrulandi';

/**
 * Ürün pasaportu, okuyucunun elinde denenebilir bir jest olarak:
 * QR → "Tarat" → tarama çizgisi → /dogrula sayfasının kendisi, satır satır yazılır.
 */
export default function PasaportDemo({ c }: { c: LandingIcerik['pasaport'] }) {
    const [durum, setDurum] = useState<Durum>('bekliyor');
    const [gosterilen, setGosterilen] = useState(0);
    const qrRef = useRef<HTMLCanvasElement>(null);
    const zamanlayicilar = useRef<number[]>([]);

    useEffect(() => {
        if (qrRef.current) {
            QRCode.toCanvas(qrRef.current, 'https://origintag.com.tr/#pasaport', {
                width: 132, margin: 1, color: { dark: '#101415', light: '#ffffff' },
            });
        }
    }, []);

    const temizle = () => { zamanlayicilar.current.forEach(t => window.clearTimeout(t)); zamanlayicilar.current = []; };
    useEffect(() => () => temizle(), []);

    const tarat = () => {
        temizle();
        setGosterilen(0);
        setDurum('taraniyor');
        zamanlayicilar.current.push(window.setTimeout(() => setDurum('dogrulandi'), 1400));
        for (let i = 1; i <= 5; i++) {
            zamanlayicilar.current.push(window.setTimeout(() => setGosterilen(i), 1400 + 160 * i));
        }
    };
    const sifirla = () => { temizle(); setGosterilen(0); setDurum('bekliyor'); };

    const satir = (i: number): React.CSSProperties => ({
        opacity: gosterilen >= i ? 1 : 0,
        transform: gosterilen >= i ? 'translateY(0)' : 'translateY(10px)',
        transition: 'opacity 600ms var(--ease-out-expo), transform 800ms var(--ease-out-expo)',
    });

    return (
        <section id="pasaport" style={{ background: 'var(--surface)', padding: 'clamp(6rem, 10vw, 9rem) 0', scrollMarginTop: '4rem' }}>
            <div className="ld-wrap ld-split">
                <div className="ld-sticky">
                    <Belir>
                        <p className="ld-eyebrow">{c.eyebrow}</p>
                        <h2 className="ld-h2" style={{ marginTop: '1.1rem' }}>
                            {c.baslik1}<br />{c.baslik2}
                        </h2>
                        <p className="ld-lead" style={{ marginTop: '1.25rem' }}>{c.aciklama}</p>
                    </Belir>
                    <Belir gecikme={120}>
                        <div style={{ marginTop: '2.2rem', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                            {durum === 'dogrulandi' ? (
                                <button onClick={sifirla} className="od-btn-secondary">{c.yeniden}</button>
                            ) : (
                                <button onClick={tarat} disabled={durum === 'taraniyor'} className="od-btn-primary" style={{ padding: '0.95rem 1.9rem' }}>
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                        <path d="M4 8V4h4M16 4h4v4M20 16v4h-4M8 20H4v-4M4 12h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                                    </svg>
                                    {durum === 'taraniyor' ? c.taraniyor : c.tarat}
                                </button>
                            )}
                            <span style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)', maxWidth: '18rem' }}>{c.not}</span>
                        </div>
                    </Belir>
                </div>

                {/* Telefon çerçevesi içinde pasaport */}
                <Belir gecikme={160}>
                    <div style={{ position: 'relative', maxWidth: '440px', margin: '0 auto' }}>
                        <div className="od-glass" style={{ position: 'relative', overflow: 'hidden', borderRadius: '2rem', padding: 0, minHeight: '640px' }}>
                            {/* Bekleyen durum: QR */}
                            <div style={{
                                position: 'absolute', inset: 0, zIndex: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.1rem',
                                background: 'linear-gradient(180deg, rgba(247,246,242,0.82), rgba(247,246,242,0.97))',
                                opacity: durum === 'dogrulandi' ? 0 : 1, pointerEvents: durum === 'dogrulandi' ? 'none' : 'auto',
                                transition: 'opacity 700ms var(--ease-out-expo)',
                            }}>
                                <div style={{ position: 'relative', background: '#ffffff', border: '1px solid rgba(16,20,21,0.1)', padding: '14px 14px 12px', borderRadius: 'var(--radius)', lineHeight: 0, textAlign: 'center' }}>
                                    <img src="/origin.png" alt="OriginTag" style={{ height: '30px', display: 'block', margin: '0 auto 10px' }} />
                                    <canvas ref={qrRef} style={{ display: 'block' }} />
                                    {durum === 'taraniyor' && (
                                        <span style={{ position: 'absolute', left: 6, right: 6, height: '2px', background: 'var(--secondary)', boxShadow: '0 0 16px 3px rgba(109,154,0,0.5)', animation: 'ld-scan 1.4s ease-in-out forwards' }} />
                                    )}
                                </div>
                                <p className="mono-label" style={{ fontSize: '0.66rem', color: 'var(--on-surface-variant)', margin: 0 }}>
                                    {durum === 'taraniyor' ? c.taraniyor : 'origintag.com.tr/dogrula/…'}
                                </p>
                            </div>

                            {/* Pasaport sayfası */}
                            <div style={{ position: 'relative', zIndex: 1 }}>
                                <div style={{ position: 'relative', padding: '2.6rem 1.5rem 1.6rem', background: 'linear-gradient(160deg, #1f1a0d 0%, #33260f 42%, #5c6b2e 100%)', color: '#eee9d8', minHeight: '220px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', textAlign: 'center' }}>
                                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, transparent 40%, rgba(51,38,15,0.85) 100%)' }} />
                                    <div style={{ position: 'absolute', top: '1rem', left: '1rem', right: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <img src="/origin.png" alt="" style={{ height: '16px', filter: 'brightness(0) invert(1)', opacity: 0.9 }} />
                                        <span className="mono-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.56rem', ...satir(1) }}>
                                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#b2e630' }} />
                                            {c.dogrulandi}
                                        </span>
                                    </div>
                                    <div style={{ position: 'relative' }}>
                                        <p className="mono-label" style={{ fontSize: '0.6rem', opacity: 0.8, margin: 0 }}>{c.urun.bolge}</p>
                                        <h3 className="font-display" style={{ fontSize: '1.7rem', fontWeight: 700, letterSpacing: '-0.02em', margin: '0.5rem 0 0', lineHeight: 1.05 }}>{c.urun.ad}</h3>
                                        <p className="mono-label" style={{ fontSize: '0.56rem', opacity: 0.75, margin: '0.6rem 0 0' }}>{c.urun.tip}</p>
                                    </div>
                                </div>

                                <div style={{ padding: '0 1rem 1.25rem' }}>
                                    <div className="od-glass" style={{ padding: '1.2rem 1.1rem', marginTop: '-1.2rem', position: 'relative', zIndex: 2, ...satir(2) }}>
                                        <DogrulamaYolculugu adimlar={c.adimlar.map(a => ({ ...a }))} accentColor="var(--secondary)" />
                                    </div>

                                    <div className="od-glass" style={{ padding: '1rem 1.1rem', marginTop: '0.8rem', display: 'flex', gap: '0.9rem', alignItems: 'center', ...satir(3) }}>
                                        <span style={{ fontSize: '1.3rem', color: 'var(--secondary)' }}>⬡</span>
                                        <div style={{ minWidth: 0 }}>
                                            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--on-surface)' }}>{c.hashEtiket}</div>
                                            <div style={{ fontSize: '0.62rem', color: 'var(--on-surface-variant)', wordBreak: 'break-all', marginTop: 2 }}>{c.hash}</div>
                                        </div>
                                    </div>

                                    <div className="od-glass" style={{ padding: '1.1rem', marginTop: '0.8rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.9rem', ...satir(4) }}>
                                        {c.alanlar.map(a => (
                                            <div key={a.k}>
                                                <div className="mono-label" style={{ fontSize: '0.56rem', color: 'var(--on-surface-variant)' }}>{a.k}</div>
                                                <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--on-surface)', marginTop: 3 }}>{a.v}</div>
                                            </div>
                                        ))}
                                    </div>

                                    <p className="mono-label" style={{ textAlign: 'center', fontSize: '0.56rem', color: 'var(--on-surface-variant)', opacity: 0.7, margin: '1.1rem 0 0', ...satir(5) }}>
                                        origintag.com.tr
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </Belir>
            </div>
        </section>
    );
}
