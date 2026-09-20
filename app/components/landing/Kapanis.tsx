'use client';
import Link from 'next/link';
import Belir from './Belir';
import type { LandingIcerik } from './icerik';

/** Kapanış: açılıştaki vadi, bu kez akşam ışığında — döngü kapanır. */
export default function Kapanis({ c, footer }: { c: LandingIcerik['kapanis']; footer: LandingIcerik['footer'] }) {
    return (
        <section style={{ position: 'relative', background: 'var(--surface)', color: 'var(--on-surface)', overflow: 'hidden' }}>
            <div aria-hidden="true" style={{ position: 'absolute', inset: 0, backgroundImage: 'url(/hero-zeytinlik.jpg)', backgroundSize: 'cover', backgroundPosition: 'center 62%' }} />
            <div aria-hidden="true" style={{ position: 'absolute', inset: 0, background: 'rgba(10,15,16,0.62)' }} />
            <div aria-hidden="true" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, var(--surface) 0%, rgba(16,20,21,0.15) 30%, rgba(16,20,21,0.35) 70%, rgba(16,20,21,0.7) 100%)' }} />

            <div className="ld-wrap" style={{ position: 'relative', zIndex: 1, minHeight: '88svh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '8rem 1.5rem 6rem' }}>
                <Belir>
                    <h2 className="ld-display" style={{ fontSize: 'clamp(2.6rem, 6.5vw, 5.6rem)', margin: 0 }}>
                        {c.baslik1}<br />
                        <span style={{ color: 'var(--secondary)' }}>{c.baslik2}</span>
                    </h2>
                    <p className="ld-lead" style={{ margin: '1.5rem auto 0', color: 'rgba(224,227,229,0.8)' }}>{c.aciklama}</p>
                </Belir>
                <Belir gecikme={140}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: '1.25rem 2rem', marginTop: '2.4rem' }}>
                        <a href="/register" className="od-btn-primary" style={{ fontSize: '1rem', padding: '1rem 2.1rem', background: '#ffffff', color: '#101415' }}>{c.cta}</a>
                        <Link href="/dogrula" className="ld-linkline" style={{ color: '#ffffff' }}>{c.ctaIkincil}</Link>
                    </div>
                </Belir>
            </div>

            <footer style={{ position: 'relative', zIndex: 1, borderTop: '1px solid rgba(16,20,21,0.08)', background: 'var(--surface)' }}>
                <div className="ld-wrap" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1.5rem 3rem', padding: '2.25rem 1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <img src="/origin.png" alt="OriginTag" style={{ height: '22px' }} />
                        <span className="mono-label" style={{ fontSize: '0.62rem', color: 'var(--on-surface-variant)', opacity: 0.8 }}>{footer.slogan}</span>
                    </div>
                    <nav style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem 1.6rem' }}>
                        {footer.baglantilar.map(b => (
                            <a key={b.href} href={b.href} className="od-link" style={{ color: 'var(--on-surface-variant)', fontSize: '0.86rem', fontWeight: 600 }}>{b.etiket}</a>
                        ))}
                    </nav>
                    <span className="mono-label" style={{ fontSize: '0.62rem', color: 'var(--on-surface-variant)', opacity: 0.6 }}>{footer.telif}</span>
                </div>
            </footer>
        </section>
    );
}
