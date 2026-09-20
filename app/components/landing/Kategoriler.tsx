'use client';
import Belir from './Belir';
import type { LandingIcerik } from './icerik';

/** Ürün kategorileri: chip yığını yerine tipografik bir liste — her satırda gerçek coğrafi işaret örnekleri. */
export default function Kategoriler({ c }: { c: LandingIcerik['kategoriler'] }) {
    return (
        <section id="urunler" style={{ background: 'var(--surface-container-lowest)', padding: 'clamp(6rem, 10vw, 9rem) 0', scrollMarginTop: '4rem' }}>
            <div className="ld-wrap ld-split">
                <div className="ld-sticky">
                    <Belir>
                        <p className="ld-eyebrow">{c.eyebrow}</p>
                        <h2 className="ld-h2" style={{ marginTop: '1.1rem' }}>{c.baslik}</h2>
                        <p className="ld-lead" style={{ marginTop: '1.25rem' }}>{c.aciklama}</p>
                    </Belir>
                </div>
                <Belir gecikme={120}>
                    <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                        {c.liste.map((k, i) => (
                            <li key={k.ad} className="ld-row">
                                <span className="mono-label" style={{ fontSize: '0.62rem', color: 'var(--on-surface-variant)', opacity: 0.7 }}>{String(i + 1).padStart(2, '0')}</span>
                                <span className="ld-row-ad font-display" style={{ fontSize: 'clamp(1.35rem, 2.4vw, 1.9rem)', fontWeight: 400, letterSpacing: '-0.02em', color: 'var(--on-surface)' }}>{k.ad}</span>
                                <span className="ld-row-ornek" style={{ fontSize: '0.82rem', color: 'var(--on-surface-variant)', textAlign: 'right' }}>{k.ornek}</span>
                            </li>
                        ))}
                    </ul>
                </Belir>
            </div>
        </section>
    );
}
