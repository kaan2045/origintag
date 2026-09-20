'use client';
import dynamic from 'next/dynamic';
import Belir from './Belir';
import type { LandingIcerik } from './icerik';

const GlobeSahnesi = dynamic(() => import('../GlobeSahnesi'), { ssr: false });

/** Portalın öbür ucu: fotoğraftaki vadi buradaydı, küre ürünün gideceği her yer. */
export default function Dunya({ c }: { c: LandingIcerik['dunya'] }) {
    return (
        <section id="dunya" style={{ background: 'var(--surface-container-lowest)', padding: 'clamp(6rem, 10vw, 9rem) 0 2rem', scrollMarginTop: '4rem', overflow: 'hidden' }}>
            <div className="ld-wrap">
                <Belir>
                    <p className="ld-eyebrow">{c.eyebrow}</p>
                    <h2 className="ld-h2" style={{ marginTop: '1.1rem', maxWidth: '46rem' }}>{c.baslik}</h2>
                    <p className="ld-lead" style={{ marginTop: '1.25rem' }}>{c.aciklama}</p>
                </Belir>
            </div>
            <Belir gecikme={150}>
                <div style={{ position: 'relative', marginTop: '1rem' }}>
                    <GlobeSahnesi />
                    <p className="mono-label" style={{ position: 'absolute', bottom: '0.5rem', left: 0, right: 0, textAlign: 'center', fontSize: '0.6rem', color: 'var(--on-surface-variant)', opacity: 0.6, pointerEvents: 'none' }}>
                        {c.ipucu}
                    </p>
                </div>
            </Belir>
        </section>
    );
}
