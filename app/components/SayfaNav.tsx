'use client';
import Link from 'next/link';
import LanguageSwitcher from './LanguageSwitcher';

export interface NavBaglanti {
    etiket: string;
    href?: string;
    onClick?: () => void;
    vurgulu?: boolean;
}

/**
 * Site içi sayfaların sade üst çubuğu (açık tema): solda logo, sağda düz metin bağlantılar.
 * Ana sayfadaki hero navbar'ın açık zemin karşılığı.
 */
export default function SayfaNav({ baglantilar = [], geri }: { baglantilar?: NavBaglanti[]; geri?: { etiket: string; href: string } }) {
    const stil: React.CSSProperties = {
        color: 'rgba(16,20,21,0.72)', textDecoration: 'none', fontSize: '0.86rem', fontWeight: 500,
        background: 'none', border: 'none', cursor: 'pointer', padding: 0, whiteSpace: 'nowrap',
        fontFamily: 'inherit', transition: 'color 0.2s ease',
    };

    return (
        <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'linear-gradient(180deg, rgba(247,246,242,0.96), rgba(247,246,242,0.85))', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(16,20,21,0.06)' }}>
            <div className="ld-wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem', paddingTop: '1.1rem', paddingBottom: '1.1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <Link href="/" aria-label="OriginTag" style={{ display: 'flex', alignItems: 'center' }}>
                        <img src="/origin.png" alt="OriginTag" style={{ height: '24px' }} />
                    </Link>
                    {geri && (
                        <a href={geri.href} style={{ ...stil, display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}>
                            <span aria-hidden="true">←</span> {geri.etiket}
                        </a>
                    )}
                </div>
                <nav style={{ display: 'flex', alignItems: 'center', gap: 'clamp(0.9rem, 2vw, 1.8rem)' }}>
                    {baglantilar.map((b) => {
                        const s = { ...stil, ...(b.vurgulu ? { color: '#101415', fontWeight: 600 } : {}) };
                        return b.href
                            ? <a key={b.etiket} href={b.href} style={s}>{b.etiket}</a>
                            : <button key={b.etiket} type="button" onClick={b.onClick} style={s}>{b.etiket}</button>;
                    })}
                    <LanguageSwitcher />
                </nav>
            </div>
        </header>
    );
}
