'use client';
import { useState, useEffect } from 'react';
import SayfaNav from '../../components/SayfaNav';
import { useLanguage } from '../../context/LanguageContext';

export default function OtellerListesi() {
    const { lang } = useLanguage();
    const [oteller, setOteller] = useState<any[]>([]);
    const [yukleniyor, setYukleniyor] = useState(true);

    useEffect(() => {
        fetch('/api/hotel-istatistikleri')
            .then(res => res.json())
            .then(data => {
                if (data.basari) setOteller(data.oteller);
                setYukleniyor(false);
            })
            .catch(() => setYukleniyor(false));
    }, []);

    const navbar = <SayfaNav geri={{ etiket: lang === 'tr' ? 'Panel' : 'Dashboard', href: '/dashboard' }} baglantilar={[{ etiket: lang === 'tr' ? 'Pasaportlar' : 'Travel Passports', href: '/dashboard/travel-passports' }]} />;

    const kolonBaslik: React.CSSProperties = { fontSize: '0.64rem', color: 'var(--on-surface-variant)' };

    return (
        <main className="theme-light">
            {navbar}
            <div className="ld-wrap" style={{ paddingTop: '3rem', paddingBottom: '5rem' }}>
                <div className="od-glass" style={{ padding: '2.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
                        <div>
                            <h1 className="pg-h1" style={{ fontSize: "2.2rem" }}>Hotels</h1>
                            <p style={{ color: 'var(--on-surface-variant)', marginTop: '0.4rem', fontSize: '0.9rem' }}>
                                {lang === 'tr' ? 'OriginTag Memories pilot ortakları' : 'OriginTag Memories pilot partners'}
                            </p>
                        </div>
                        <a href="/dashboard/hotels/yeni" className="od-btn-primary" style={{ padding: '0.6rem 1.3rem', fontSize: '0.85rem' }}>
                            + Add Hotel
                        </a>
                    </div>

                    {yukleniyor ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--on-surface-variant)' }}>
                            <p>{lang === 'tr' ? 'Yükleniyor...' : 'Loading...'}</p>
                        </div>
                    ) : oteller.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem' }}>
                            <p style={{ color: 'var(--on-surface-variant)', marginBottom: '1.25rem' }}>
                                {lang === 'tr' ? 'Henüz otel eklenmedi.' : 'No hotels added yet.'}
                            </p>
                            <a href="/dashboard/hotels/yeni" className="od-btn-secondary">
                                {lang === 'tr' ? 'İlk Oteli Ekle' : 'Add Your First Hotel'}
                            </a>
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <div className="mono-label" style={{ display: 'grid', gridTemplateColumns: '1.6fr 0.8fr 0.8fr 0.8fr 0.8fr 0.8fr', gap: '1rem', padding: '0 0.75rem 0.9rem', borderBottom: '1px solid var(--outline-variant)', marginBottom: '0.25rem', minWidth: '700px' }}>
                                <span style={kolonBaslik}>HOTEL</span>
                                <span style={kolonBaslik}>CREATED</span>
                                <span style={kolonBaslik}>OPENED</span>
                                <span style={kolonBaslik}>PHOTOS</span>
                                <span style={kolonBaslik}>PLACES</span>
                                <span style={kolonBaslik}>SHARES</span>
                            </div>
                            {oteller.map((otel, i) => (
                                <a key={i} href={`/dashboard/hotels/${otel.id}`} className="od-row-hover" style={{
                                    display: 'grid', gridTemplateColumns: '1.6fr 0.8fr 0.8fr 0.8fr 0.8fr 0.8fr', gap: '1rem',
                                    padding: '1.1rem 0.75rem', borderBottom: '1px solid rgba(16,20,21,0.07)', alignItems: 'center',
                                    minWidth: '700px', textDecoration: 'none', color: 'inherit',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                                        {otel.logo_url && <img src={otel.logo_url} alt="" style={{ width: '28px', height: '28px', borderRadius: '6px', objectFit: 'cover' }} />}
                                        <div>
                                            <div style={{ fontWeight: 700, color: 'var(--on-surface)' }}>{otel.ad}</div>
                                            <div style={{ fontSize: '0.72rem', color: 'var(--on-surface-variant)' }}>{otel.sehir}</div>
                                        </div>
                                    </div>
                                    <span style={{ fontWeight: 700 }}>{otel.pasaport_olusturuldu}</span>
                                    <span style={{ fontWeight: 700 }}>{otel.pasaport_acildi}</span>
                                    <span style={{ fontWeight: 700 }}>{otel.foto_yuklendi}</span>
                                    <span style={{ fontWeight: 700 }}>{otel.yer_eklendi}</span>
                                    <span style={{ fontWeight: 700 }}>{otel.paylasildi}</span>
                                </a>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
