'use client';
import { useState, useEffect } from 'react';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import { useLanguage } from '../../context/LanguageContext';
import { pasaportKartiIndir } from '../../lib/pasaportKart';

export default function TravelPassportsListesi() {
    const { lang } = useLanguage();
    const [pasaportlar, setPasaportlar] = useState<any[]>([]);
    const [yukleniyor, setYukleniyor] = useState(true);

    useEffect(() => {
        fetch('/api/travel-passport-olustur')
            .then(res => res.json())
            .then(data => {
                if (data.basari) setPasaportlar(data.pasaportlar);
                setYukleniyor(false);
            })
            .catch(() => setYukleniyor(false));
    }, []);

    const navbar = (
        <div style={{ position: 'sticky', top: '1.25rem', zIndex: 50, display: 'flex', justifyContent: 'center', padding: '0 1.5rem' }}>
            <nav className="od-navbar" style={{ width: '100%', maxWidth: 'var(--container-max)' }}>
                <a href="/dashboard"><img src="/origin.png" alt="OriginTag" style={{ height: '26px', filter: 'brightness(0) invert(1)', opacity: 0.92 }} /></a>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <a href="/dashboard" className="od-btn-ghost">{lang === 'tr' ? "Dashboard'a Dön" : 'Back to Dashboard'}</a>
                    <LanguageSwitcher />
                </div>
            </nav>
        </div>
    );

    return (
        <main style={{ minHeight: '100vh', background: 'var(--surface)', color: 'var(--on-surface)' }}>
            {navbar}
            <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto', padding: '3rem 1.5rem' }}>
                <div className="od-glass" style={{ padding: '2.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
                        <div>
                            <h1 className="font-display" style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--on-surface)', margin: 0 }}>
                                🧳 Travel Passports
                            </h1>
                            <p style={{ color: 'var(--on-surface-variant)', marginTop: '0.4rem', fontSize: '0.9rem' }}>
                                {lang === 'tr' ? 'OriginTag Memories — Dijital Seyahat Pasaportu' : 'OriginTag Memories — Digital Travel Passport'}
                            </p>
                        </div>
                        <a href="/dashboard/travel-passports/yeni" className="od-btn-primary" style={{ padding: '0.6rem 1.3rem', fontSize: '0.85rem' }}>
                            + Create Passport
                        </a>
                    </div>

                    {yukleniyor ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--on-surface-variant)' }}>
                            <p>{lang === 'tr' ? 'Yükleniyor...' : 'Loading...'}</p>
                        </div>
                    ) : pasaportlar.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem' }}>
                            <p style={{ color: 'var(--on-surface-variant)', marginBottom: '1.25rem' }}>
                                {lang === 'tr' ? 'Henüz seyahat pasaportu oluşturulmadı.' : 'No travel passports created yet.'}
                            </p>
                            <a href="/dashboard/travel-passports/yeni" className="od-btn-secondary">
                                {lang === 'tr' ? 'İlk Pasaportu Oluştur' : 'Create Your First Passport'}
                            </a>
                        </div>
                    ) : (
                        <div>
                            <div className="mono-label" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr 1fr', gap: '1rem', padding: '0 0.75rem 0.9rem', borderBottom: '1px solid var(--outline-variant)', marginBottom: '0.25rem', fontSize: '0.64rem', color: 'var(--on-surface-variant)' }}>
                                <span>GUEST</span>
                                <span>DESTINATION</span>
                                <span>DATES</span>
                                <span>PASSPORT ID</span>
                                <span>ACTION</span>
                            </div>
                            {pasaportlar.map((p, i) => (
                                <div key={i} className="od-row-hover" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr 1fr', gap: '1rem', padding: '1.1rem 0.75rem', borderBottom: '1px solid rgba(255,255,255,0.06)', alignItems: 'center' }}>
                                    <div style={{ fontWeight: 700, color: 'var(--on-surface)' }}>
                                        {p.misafir_adi}
                                        {p.demo_mu && (
                                            <span className="mono-label" style={{ marginLeft: '0.5rem', fontSize: '0.58rem', color: 'var(--secondary)', border: '1px solid var(--secondary)', borderRadius: 'var(--radius-full)', padding: '0.1rem 0.5rem' }}>
                                                DEMO
                                            </span>
                                        )}
                                    </div>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)' }}>{p.destinasyon}</span>
                                    <span style={{ fontSize: '0.82rem', color: 'var(--on-surface-variant)' }}>
                                        {p.giris_tarihi ? new Date(p.giris_tarihi).toLocaleDateString('en-GB') : '-'}
                                    </span>
                                    <span className="mono-label" style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)' }}>{p.pasaport_id}</span>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', alignItems: 'flex-start' }}>
                                        <a href={`/memory/${p.pasaport_id}`} target="_blank" rel="noreferrer" className="od-link mono-label" style={{ fontSize: '0.68rem' }}>
                                            {lang === 'tr' ? 'Görüntüle →' : 'View →'}
                                        </a>
                                        <button
                                            onClick={() => pasaportKartiIndir({
                                                pasaportId: p.pasaport_id,
                                                misafirAdi: p.misafir_adi,
                                                destinasyon: p.destinasyon,
                                                ulke: p.ulke,
                                                girisTarihi: p.giris_tarihi,
                                                cikisTarihi: p.cikis_tarihi,
                                            })}
                                            className="mono-label"
                                            style={{ fontSize: '0.62rem', color: 'var(--secondary)', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
                                        >
                                            ⬇ {lang === 'tr' ? 'Kart İndir' : 'Download Card'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
