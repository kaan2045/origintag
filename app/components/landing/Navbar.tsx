'use client';
import { useEffect, useState } from 'react';
import LanguageSwitcher from '../LanguageSwitcher';
import type { LandingIcerik } from './icerik';

/**
 * Sade, şeffaf üst çubuk: solda logo, sağda düz metin bağlantılar.
 * Hero fotoğrafının üstünde beyaz; kapıdan geçip beyaz dünyaya girince koyu yazıya döner.
 */
export default function Navbar({ c }: { c: LandingIcerik['nav'] }) {
    const [koyu, setKoyu] = useState(false);

    useEffect(() => {
        // Kapı beyaza döndüğü noktadan itibaren (hero'nun ~1.7 ekran boyu) koyu yazı
        const onScroll = () => setKoyu(window.scrollY > window.innerHeight * 1.7);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const metin = koyu ? 'rgba(16,20,21,0.72)' : 'rgba(224,227,229,0.86)';
    const vurgu = koyu ? '#101415' : '#ffffff';
    const baglanti: React.CSSProperties = {
        color: metin, textDecoration: 'none', fontSize: '0.86rem', fontWeight: 500,
        letterSpacing: '0.01em', transition: 'color 0.3s ease', whiteSpace: 'nowrap',
    };
    const hover = (e: React.MouseEvent<HTMLAnchorElement>, giris: boolean) => {
        e.currentTarget.style.color = giris ? vurgu : metin;
    };

    return (
        <header
            className="ld-nav"
            style={{
                position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 50,
                background: koyu ? 'linear-gradient(180deg, rgba(247,246,242,0.92), rgba(247,246,242,0.7))' : 'transparent',
                backdropFilter: koyu ? 'blur(12px)' : 'none',
                WebkitBackdropFilter: koyu ? 'blur(12px)' : 'none',
                borderBottom: koyu ? '1px solid rgba(16,20,21,0.06)' : '1px solid transparent',
                transition: 'background 0.4s ease, border-color 0.4s ease',
            }}
        >
            <div className="ld-wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem', paddingTop: '1.2rem', paddingBottom: '1.2rem' }}>
                <a href="#top" aria-label="OriginTag" style={{ display: 'flex', alignItems: 'center' }}>
                    <img
                        src="/origin.png"
                        alt="OriginTag"
                        className="logo-acik"
                        style={{ height: '24px', filter: koyu ? 'none' : 'brightness(0) invert(1)', opacity: koyu ? 1 : 0.95, transition: 'filter 0.3s ease' }}
                    />
                </a>

                <nav style={{ display: 'flex', alignItems: 'center', gap: 'clamp(1rem, 2.2vw, 2rem)' }}>
                    <div className="ld-only-desktop">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(1rem, 2.2vw, 2rem)' }}>
                            {[['#nasil', c.nasil], ['#pasaport', c.pasaport], ['#urunler', c.urunler], ['#dunya', c.dunya]].map(([href, etiket]) => (
                                <a key={href} href={href} style={baglanti} onMouseEnter={e => hover(e, true)} onMouseLeave={e => hover(e, false)}>{etiket}</a>
                            ))}
                            <span aria-hidden="true" style={{ width: '1px', height: '14px', background: koyu ? 'rgba(16,20,21,0.18)' : 'rgba(255,255,255,0.22)' }} />
                        </div>
                    </div>
                    <a href="/login" style={baglanti} onMouseEnter={e => hover(e, true)} onMouseLeave={e => hover(e, false)}>{c.giris}</a>
                    <a href="/register" style={{ ...baglanti, color: vurgu, fontWeight: 600 }}>{c.basla}</a>
                    <LanguageSwitcher />
                </nav>
            </div>
        </header>
    );
}
