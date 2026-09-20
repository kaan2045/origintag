'use client';
import { useState } from 'react';
import { upload } from '@vercel/blob/client';
import SayfaNav from '../../../components/SayfaNav';
import { useLanguage } from '../../../context/LanguageContext';
import { resmiSikistir } from '../../../lib/resimSikistir';

export default function YeniOtel() {
    const { lang } = useLanguage();

    const [ad, setAd] = useState('');
    const [sehir, setSehir] = useState('');
    const [haritaUrl, setHaritaUrl] = useState('');
    const [telefon, setTelefon] = useState('');
    const [website, setWebsite] = useState('');
    const [instagram, setInstagram] = useState('');
    const [checkinSaat, setCheckinSaat] = useState('14:00');
    const [checkoutSaat, setCheckoutSaat] = useState('12:00');

    const [logoDosya, setLogoDosya] = useState<File | null>(null);
    const [kapakDosya, setKapakDosya] = useState<File | null>(null);
    const [logoOnizleme, setLogoOnizleme] = useState('');
    const [kapakOnizleme, setKapakOnizleme] = useState('');

    const [yukleniyor, setYukleniyor] = useState(false);
    const [hata, setHata] = useState<string | null>(null);
    const [tamamlandi, setTamamlandi] = useState(false);

    const fieldLabelStyle: React.CSSProperties = {
        fontSize: '0.68rem', color: 'var(--on-surface-variant)', display: 'block', marginBottom: '6px',
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!ad) {
            setHata(lang === 'tr' ? 'Otel adı zorunlu' : 'Hotel name is required');
            return;
        }
        setHata(null);
        setYukleniyor(true);
        try {
            let logoUrl = '';
            let kapakGorselUrl = '';
            if (logoDosya) {
                const sikistirilmis = await resmiSikistir(logoDosya);
                const blob = await upload(`hotels/${Date.now()}-logo-${sikistirilmis.name}`, sikistirilmis, {
                    access: 'public', handleUploadUrl: '/api/medya-yukle',
                });
                logoUrl = blob.url;
            }
            if (kapakDosya) {
                const sikistirilmis = await resmiSikistir(kapakDosya);
                const blob = await upload(`hotels/${Date.now()}-kapak-${sikistirilmis.name}`, sikistirilmis, {
                    access: 'public', handleUploadUrl: '/api/medya-yukle',
                });
                kapakGorselUrl = blob.url;
            }

            const res = await fetch('/api/otel-olustur', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ad, sehir, haritaUrl, telefon, website, instagram, checkinSaat, checkoutSaat, logoUrl, kapakGorselUrl }),
            });
            const data = await res.json();
            if (data.basari) {
                setTamamlandi(true);
            } else {
                setHata(data.hata || (lang === 'tr' ? 'Bilinmeyen hata' : 'Unknown error'));
            }
        } catch {
            setHata(lang === 'tr' ? 'Bağlantı hatası' : 'Connection error');
        }
        setYukleniyor(false);
    };

    const navbar = <SayfaNav geri={{ etiket: lang === 'tr' ? 'Oteller' : 'Hotels', href: '/dashboard/hotels' }} />;

    if (tamamlandi) {
        return (
            <main className="theme-light">
                {navbar}
                <div style={{ display: 'flex', justifyContent: 'center', padding: '3.5rem 1.5rem' }}>
                    <div className="od-glass" style={{ width: '100%', maxWidth: '440px', padding: '2.75rem', textAlign: 'center' }}>
                        <div style={{ width: '52px', height: '52px', margin: '0 auto 1.25rem', borderRadius: '50%', background: 'rgba(178,230,48,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary)', fontSize: '1.5rem' }}>✓</div>
                        <h2 className="pg-h1" style={{ fontSize: "1.9rem", marginBottom: "1.5rem" }}>{ad}</h2>
                        <a href="/dashboard/hotels" className="od-btn-primary" style={{ width: '100%', display: 'block' }}>
                            {lang === 'tr' ? 'Otel Listesine Dön' : 'Back to Hotels'}
                        </a>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="theme-light">
            {navbar}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3.5rem 1.5rem' }}>
                <div className="od-glass" style={{ width: '100%', maxWidth: '600px', padding: '2.75rem' }}>
                    <h1 className="pg-h1" style={{ fontSize: "2.2rem", marginBottom: "0.5rem" }}>Add Hotel</h1>

                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '1.25rem' }}>
                            <label className="mono-label" style={fieldLabelStyle}>Hotel Name</label>
                            <input type="text" required placeholder="Sierra Cave Cappadocia" value={ad} onChange={e => setAd(e.target.value)} className="od-field" />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.1rem', marginBottom: '1.25rem' }}>
                            <div>
                                <label className="mono-label" style={fieldLabelStyle}>Logo</label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', border: '1px dashed var(--outline-variant)', borderRadius: 'var(--radius-md)', padding: '0.7rem', cursor: 'pointer' }}>
                                    {logoOnizleme ? <img src={logoOnizleme} alt="" style={{ width: '32px', height: '32px', objectFit: 'cover', borderRadius: '6px' }} /> : <span>🏨</span>}
                                    <span style={{ fontSize: '0.78rem', color: 'var(--on-surface-variant)' }}>{logoDosya ? logoDosya.name : 'Select logo'}</span>
                                    <input type="file" accept="image/*" style={{ display: 'none' }}
                                        onChange={e => { const f = e.target.files?.[0]; if (f) { setLogoDosya(f); setLogoOnizleme(URL.createObjectURL(f)); } }} />
                                </label>
                            </div>
                            <div>
                                <label className="mono-label" style={fieldLabelStyle}>Cover Photo</label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', border: '1px dashed var(--outline-variant)', borderRadius: 'var(--radius-md)', padding: '0.7rem', cursor: 'pointer' }}>
                                    {kapakOnizleme ? <img src={kapakOnizleme} alt="" style={{ width: '32px', height: '32px', objectFit: 'cover', borderRadius: '6px' }} /> : <span>🖼</span>}
                                    <span style={{ fontSize: '0.78rem', color: 'var(--on-surface-variant)' }}>{kapakDosya ? kapakDosya.name : 'Select photo'}</span>
                                    <input type="file" accept="image/*" style={{ display: 'none' }}
                                        onChange={e => { const f = e.target.files?.[0]; if (f) { setKapakDosya(f); setKapakOnizleme(URL.createObjectURL(f)); } }} />
                                </label>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.1rem', marginBottom: '1.25rem' }}>
                            <div>
                                <label className="mono-label" style={fieldLabelStyle}>City / Destination</label>
                                <input type="text" placeholder="Göreme, Cappadocia" value={sehir} onChange={e => setSehir(e.target.value)} className="od-field" />
                            </div>
                            <div>
                                <label className="mono-label" style={fieldLabelStyle}>Google Maps URL</label>
                                <input type="text" placeholder="https://maps.google.com/..." value={haritaUrl} onChange={e => setHaritaUrl(e.target.value)} className="od-field" />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.1rem', marginBottom: '1.25rem' }}>
                            <div>
                                <label className="mono-label" style={fieldLabelStyle}>Phone / WhatsApp</label>
                                <input type="text" placeholder="+90 532 000 00 00" value={telefon} onChange={e => setTelefon(e.target.value)} className="od-field" />
                            </div>
                            <div>
                                <label className="mono-label" style={fieldLabelStyle}>Website</label>
                                <input type="text" placeholder="sierracavecappadocia.com" value={website} onChange={e => setWebsite(e.target.value)} className="od-field" />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.1rem', marginBottom: '1.75rem' }}>
                            <div>
                                <label className="mono-label" style={fieldLabelStyle}>Instagram</label>
                                <input type="text" placeholder="@sierracave" value={instagram} onChange={e => setInstagram(e.target.value)} className="od-field" />
                            </div>
                            <div>
                                <label className="mono-label" style={fieldLabelStyle}>Check-in</label>
                                <input type="time" value={checkinSaat} onChange={e => setCheckinSaat(e.target.value)} className="od-field" />
                            </div>
                            <div>
                                <label className="mono-label" style={fieldLabelStyle}>Check-out</label>
                                <input type="time" value={checkoutSaat} onChange={e => setCheckoutSaat(e.target.value)} className="od-field" />
                            </div>
                        </div>

                        {hata && <p style={{ color: 'var(--error)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>{hata}</p>}

                        <button type="submit" disabled={yukleniyor} className="od-btn-primary" style={{ width: '100%' }}>
                            {yukleniyor ? (lang === 'tr' ? 'Kaydediliyor...' : 'Saving...') : (lang === 'tr' ? 'Oteli Kaydet' : 'Save Hotel')}
                        </button>
                    </form>
                </div>
            </div>
        </main>
    );
}
