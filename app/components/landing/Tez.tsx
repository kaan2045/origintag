'use client';
import { useRef } from 'react';
import { useScrollProgress } from './useScrollProgress';
import type { LandingIcerik } from './icerik';

/** Sorun cümlesi: kaydırdıkça kelime kelime belirir — okuma hızı kaydırma hızına bağlanır. */
export default function Tez({ c }: { c: LandingIcerik['tez'] }) {
    const ref = useRef<HTMLElement>(null);
    const p = useScrollProgress(ref, 'pass');
    const t = Math.min(1, Math.max(0, (p - 0.2) / 0.5));

    const kelimeler = c.satirlar.flatMap((s, si) => s.split(' ').map((k, ki) => ({ k, si, id: `${si}-${ki}` })));
    const acik = Math.floor(t * kelimeler.length);
    let sayac = 0;

    return (
        <section ref={ref} style={{ background: 'var(--surface)', padding: 'clamp(6rem, 12vw, 11rem) 0' }}>
            <div className="ld-wrap">
                <p className="ld-eyebrow" style={{ color: 'var(--on-surface-variant)' }}>{c.eyebrow}</p>
                <p className="ld-display" style={{ fontSize: 'clamp(1.7rem, 4.2vw, 3.4rem)', fontWeight: 600, lineHeight: 1.12, letterSpacing: '-0.02em', margin: '1.75rem 0 0', maxWidth: '62rem', color: 'var(--on-surface)' }}>
                    {c.satirlar.map((s, si) => (
                        <span key={si} style={{ display: 'block', color: si === c.satirlar.length - 1 ? 'var(--secondary)' : undefined, marginTop: si === c.satirlar.length - 1 ? '1.2rem' : 0 }}>
                            {s.split(' ').map((k, ki) => {
                                const idx = sayac++;
                                const lit = idx < acik;
                                return (
                                    <span key={ki} style={{
                                        display: 'inline-block',
                                        opacity: lit ? 1 : 0.16,
                                        transform: lit ? 'translateY(0)' : 'translateY(0.12em)',
                                        transition: 'opacity 450ms ease, transform 600ms var(--ease-out-expo)',
                                    }}>
                                        {k}&nbsp;
                                    </span>
                                );
                            })}
                        </span>
                    ))}
                </p>
            </div>
        </section>
    );
}
