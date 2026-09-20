'use client';
import { useState, useEffect, use } from 'react';
import SayfaNav from '../../../components/SayfaNav';
import { useLanguage } from '../../../context/LanguageContext';

export default function OtelDetay({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { lang } = useLanguage();
    const [otel, setOtel] = useState<any>(null);
    const [yukleniyor, setYukleniyor] = useState(true);

    useEffect(() => {
        fetch(`/api/hotel-istatistikleri?otel_id=${id}`)
            .then(res => res.json())
            .then(data => {
                if (data.basari && data.oteller.length > 0) setOtel(data.oteller[0]);
                setYukleniyor(false);
            })
            .catch(() => setYukleniyor(false));
    }, [id]);

    const navbar = <SayfaNav geri={{ etiket: lang === 'tr' ? 'Oteller' : 'Hotels', href: '/dashboard/hotels' }} />;

    if (yukleniyor || !otel) {
        return (
            <main className="theme-light">
                {navbar}
                <div style={{ textAlign: 'center', padding: '5rem 1.5rem', color: 'var(--on-surface-variant)' }}>
                    {yukleniyor ? (lang === 'tr' ? 'Yükleniyor...' : 'Loading...') : (lang === 'tr' ? 'Otel bulunamadı' : 'Hotel not found')}
                </div>
            </main>
        );
    }

    const kartlar = [
        { etiket: 'Passports Created', deger: otel.pasaport_olusturuldu },
        { etiket: 'Passports Opened', deger: otel.pasaport_acildi },
        { etiket: 'Photos Uploaded', deger: otel.foto_yuklendi },
        { etiket: 'Places Added', deger: otel.yer_eklendi },
        { etiket: 'Experience Clicks', deger: otel.deneyim_tiklandi },
        { etiket: 'Hotel Clicks', deger: otel.otel_tiklandi },
        { etiket: 'Share Clicks', deger: otel.paylasildi },
    ];

    return (
        <main className="theme-light">
            {navbar}
            <div className="ld-wrap" style={{ paddingTop: '3rem', paddingBottom: '5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                    {otel.logo_url && <img src={otel.logo_url} alt="" style={{ width: '48px', height: '48px', borderRadius: '10px', objectFit: 'cover' }} />}
                    <div>
                        <h1 className="pg-h1" style={{ fontSize: "2.2rem" }}>{otel.ad}</h1>
                        <p style={{ color: 'var(--on-surface-variant)', margin: 0 }}>{otel.sehir}</p>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1.1rem' }}>
                    {kartlar.map((k, i) => (
                        <div key={i} className="od-glass" style={{ padding: '1.5rem', textAlign: 'center' }}>
                            <div className="font-display" style={{ fontSize: '2.4rem', fontWeight: 300, letterSpacing: '-0.02em', color: 'var(--on-surface)' }}>{k.deger}</div>
                            <div className="mono-label" style={{ fontSize: '0.62rem', color: 'var(--on-surface-variant)', marginTop: '0.5rem' }}>{k.etiket.toUpperCase()}</div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}
