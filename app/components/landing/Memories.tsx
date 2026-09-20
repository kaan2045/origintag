'use client';
import Link from 'next/link';
import Belir from './Belir';
import type { LandingIcerik } from './icerik';

/** Kısa ara bölüm: aynı pasaport altyapısının oteller için ikinci hayatı. */
export default function Memories({ c }: { c: LandingIcerik['memories'] }) {
    return (
        <section style={{ background: 'var(--surface)', padding: 'clamp(4rem, 7vw, 6rem) 0' }}>
            <div className="ld-wrap">
                <Belir>
                    <div className="od-glass" style={{ padding: 'clamp(1.75rem, 4vw, 3rem)', display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', alignItems: 'center' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: '1.5rem 3rem' }}>
                            <div style={{ maxWidth: '38rem' }}>
                                <p className="ld-eyebrow" style={{ color: 'var(--on-surface-variant)' }}>{c.eyebrow}</p>
                                <h2 className="ld-h2" style={{ marginTop: '0.9rem', fontSize: 'clamp(1.7rem, 3vw, 2.4rem)' }}>{c.baslik}</h2>
                                <p className="ld-lead" style={{ marginTop: '0.9rem', fontSize: '0.98rem' }}>{c.aciklama}</p>
                            </div>
                            <Link href="/memory/CAP-2026-000001" className="ld-linkline" style={{ flexShrink: 0 }}>{c.link}</Link>
                        </div>
                    </div>
                </Belir>
            </div>
        </section>
    );
}
