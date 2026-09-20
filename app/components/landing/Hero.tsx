'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useScrollProgress } from './useScrollProgress';
import type { LandingIcerik } from './icerik';

/**
 * Hero = portal. Sağda ince, uzun, ışıklı bir kapı; içi şeffaf (arkadaki vadi görünür).
 * Kaydırdıkça kapı bize gelir ve içi beyaz ışıkla dolar; ekranı kaplayınca beyaz söner
 * ve sitenin koyu bölümleri açılır. Fotoğraf sabittir, büyümez.
 */
const KAPI_X = 68;   // % — kapının başlangıç merkezi (yatay)
const KAPI_Y = 50;   // % — (dikey)

const kolay = (t: number) => t * t * (3 - 2 * t);
const aralik = (p: number, a: number, b: number) => Math.min(1, Math.max(0, (p - a) / (b - a)));

export default function Hero({ c }: { c: LandingIcerik['hero'] }) {
    const ref = useRef<HTMLElement>(null);
    const p = useScrollProgress(ref, 'pin');
    const [vp, setVp] = useState({ w: 1440, h: 900 });

    useEffect(() => {
        const olc = () => setVp({ w: window.innerWidth, h: window.innerHeight });
        olc();
        window.addEventListener('resize', olc);
        return () => window.removeEventListener('resize', olc);
    }, []);

    const s = useMemo(() => {
        const mobil = vp.w < 640;
        const yaklasma = kolay(aralik(p, 0, 0.88));
        // Kapının dinlenme boyutu: masaüstünde genişliğin ~%23'ü, telefonda ~%58'i; boy/en ≈ 2.2
        const tabanW = mobil ? vp.w * 0.46 : Math.min(Math.max(vp.w * 0.16, 170), 250);
        const tabanH = Math.min(tabanW * 2.75, vp.h * 0.66);
        const hedefOlcek = Math.max((vp.w * 1.12) / tabanW, (vp.h * 1.12) / tabanH);
        const olcek = 1 + Math.pow(yaklasma, 1.5) * (hedefOlcek - 1);
        const cx = mobil ? 50 : KAPI_X;
        const cy = mobil ? 44 : KAPI_Y;
        const merkezX = (cx + (50 - cx) * yaklasma) / 100 * vp.w;
        const merkezY = (cy + (50 - cy) * yaklasma) / 100 * vp.h;
        const w = tabanW * olcek, h = tabanH * olcek;
        const metin = 1 - kolay(aralik(p, 0.02, 0.3));
        const beyaz = kolay(aralik(p, 0.22, 0.72));      // kapının içi beyaza döner
        const beyazTam = kolay(aralik(p, 0.7, 0.82));   // beyaz tüm ekranı kaplar
        const bitis = kolay(aralik(p, 0.86, 1));        // beyaz söner, koyu bölüm açılır
        const parla = 0.7 + 0.3 * Math.sin(Math.min(1, p / 0.7) * Math.PI);
        const g = Math.pow(olcek, 0.35); // ışık, kapıyla birlikte ama daha yavaş büyür
        return { w, h, left: merkezX - w / 2, top: merkezY - h / 2, metin, beyaz, beyazTam, bitis, parla, g, cx, cy, mobil };
    }, [p, vp]);

    return (
        <section id="top" ref={ref} style={{ position: 'relative', height: '320vh', background: 'var(--surface)', color: 'var(--on-surface)' }}>
            <div style={{ position: 'sticky', top: 0, height: '100svh', overflow: 'hidden' }}>
                {/* Vadi — sabit fotoğraf; sahne büyümez, kapı bize gelir */}
                <div aria-hidden="true" style={{ position: 'absolute', inset: 0, backgroundImage: 'url(/hero-zeytinlik.jpg)', backgroundSize: 'cover', backgroundPosition: 'center 48%' }} />
                <div aria-hidden="true" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(10,15,16,0.28) 0%, rgba(10,15,16,0.02) 30%, rgba(16,20,21,0.18) 70%, rgba(16,20,21,0.82) 100%)' }} />
                <div aria-hidden="true" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(10,15,16,0.5) 0%, rgba(10,15,16,0.14) 38%, rgba(10,15,16,0) 60%)', opacity: s.metin }} />

                {/* KAPI */}
                <div
                    aria-hidden="true"
                    style={{
                        position: 'absolute', left: s.left, top: s.top, width: s.w, height: s.h,
                        borderRadius: Math.max(10, 14 * s.g),
                        border: `${Math.max(1.5, 1.5 * s.g)}px solid rgba(255,255,255,${0.85 + s.parla * 0.15})`,
                        boxShadow: `
                            0 0 ${22 * s.g}px ${4 * s.g}px rgba(255,255,255,${0.35 + s.parla * 0.3}),
                            0 0 ${110 * s.g}px ${26 * s.g}px rgba(255,236,214,${0.12 + s.parla * 0.14}),
                            inset 0 0 ${22 * s.g}px rgba(255,255,255,${0.18 + s.parla * 0.18})`,
                        overflow: 'hidden', pointerEvents: 'none', willChange: 'left, top, width, height',
                    }}
                >
                    {/* Yaklaştıkça kapının içi beyaz ışıkla dolar */}
                    <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 60%, rgba(255,255,255,1) 0%, rgba(255,255,255,0.96) 55%, rgba(255,255,255,0.9) 100%)', opacity: s.beyaz }} />
                    <div style={{ position: 'absolute', inset: 0, boxShadow: `inset 0 0 ${30 * s.g}px ${4 * s.g}px rgba(255,255,255,0.3)` }} />
                </div>

                <div aria-hidden="true" style={{ position: 'absolute', inset: 0, background: '#ffffff', opacity: s.beyazTam, pointerEvents: 'none' }} />
                <div aria-hidden="true" style={{ position: 'absolute', inset: 0, background: 'var(--surface)', opacity: s.bitis, pointerEvents: 'none' }} />

                {/* Metin */}
                <div
                    className="ld-wrap"
                    style={{
                        position: 'relative', zIndex: 2, height: '100svh', display: 'flex', flexDirection: 'column', justifyContent: s.mobil ? 'flex-end' : 'center',
                        paddingTop: s.mobil ? '8rem' : '6rem', paddingBottom: s.mobil ? '3.5rem' : '4rem',
                        opacity: s.metin, transform: `translateY(${(1 - s.metin) * -24}px)`,
                        pointerEvents: s.metin < 0.2 ? 'none' : 'auto',
                    }}
                >
                    <div style={{ maxWidth: s.mobil ? '100%' : '58%' }}>
                        <p className="ld-fade-up" style={{ animationDelay: '120ms', display: 'flex', alignItems: 'center', gap: '0.7rem', margin: 0, fontSize: '0.7rem', letterSpacing: '0.22em', textTransform: 'uppercase', fontWeight: 600, color: 'rgba(255,255,255,0.95)' }}>
                            <span aria-hidden="true" style={{ width: 7, height: 7, background: 'var(--secondary)' }} />
                            {c.eyebrow}
                        </p>
                        <h1 className="ld-fade-up" style={{ animationDelay: '220ms', fontFamily: 'var(--font-display), ui-sans-serif, system-ui, sans-serif', fontWeight: 400, letterSpacing: '-0.025em', lineHeight: 1.04, fontSize: 'clamp(2.2rem, 4.4vw, 4.1rem)', margin: '1.4rem 0 0', color: '#ffffff' }}>
                            {c.satir1}<br />{c.satir2}<br />{c.satir3}
                        </h1>
                        <p className="ld-fade-up" style={{ animationDelay: '340ms', margin: '1.6rem 0 0', maxWidth: '24rem', fontSize: '1.02rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.92)' }}>
                            {c.aciklama}
                        </p>
                        <a
                            href="#nasil"
                            className="ld-fade-up"
                            style={{ animationDelay: '450ms', display: 'inline-flex', alignItems: 'center', gap: '0.7rem', marginTop: '2.2rem', paddingBottom: '0.35rem', borderBottom: '1px solid rgba(255,255,255,0.8)', color: '#fff', textDecoration: 'none', fontSize: '0.74rem', letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 600 }}
                        >
                            {c.link}
                            <span aria-hidden="true">→</span>
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}
