'use client';
import Belir from './Belir';
import type { LandingIcerik } from './icerik';

/** Neden OriginTag: kart ızgarası yerine iki sütunlu, çizgili bir kanıt listesi. */
export default function Kanit({ c }: { c: LandingIcerik['kanit'] }) {
    return (
        <section style={{ background: 'var(--surface)', padding: 'clamp(6rem, 10vw, 9rem) 0' }}>
            <div className="ld-wrap">
                <Belir>
                    <p className="ld-eyebrow">{c.eyebrow}</p>
                    <h2 className="ld-h2" style={{ marginTop: '1.1rem', maxWidth: '40rem' }}>{c.baslik}</h2>
                </Belir>
                <div className="ld-kanit" style={{ marginTop: '3.5rem' }}>
                    {c.maddeler.map((m, i) => (
                        <Belir key={m.baslik} gecikme={(i % 2) * 90}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1.6rem 1fr', gap: '1rem' }}>
                                <span aria-hidden="true" style={{ color: 'var(--secondary)', fontSize: '0.9rem', lineHeight: '1.6rem' }}>⬡</span>
                                <div>
                                    <h3 className="font-display" style={{ margin: 0, fontSize: '1.15rem', fontWeight: 500, letterSpacing: '-0.01em', color: 'var(--on-surface)' }}>{m.baslik}</h3>
                                    <p style={{ margin: '0.55rem 0 0', color: 'var(--on-surface-variant)', lineHeight: 1.65, fontSize: '0.95rem', maxWidth: '30rem' }}>{m.metin}</p>
                                </div>
                            </div>
                        </Belir>
                    ))}
                </div>
            </div>
        </section>
    );
}
