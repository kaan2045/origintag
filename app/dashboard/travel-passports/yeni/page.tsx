'use client';
import { useState, useRef, useEffect } from 'react';
import { upload } from '@vercel/blob/client';
import LanguageSwitcher from '../../../components/LanguageSwitcher';
import { useLanguage } from '../../../context/LanguageContext';
import { pasaportKartiIndir } from '../../../lib/pasaportKart';
import { logoluQrCiz } from '../../../lib/qrLogo';

type RotaDurag = { yer: string; tarih: string };
type Deneyim = { baslik: string; ikon: string; tarih: string; saat: string; konum: string };

const ONERILEN_DENEYIMLER = [
    { baslik: 'Hot Air Balloon Flight', ikon: '🎈' },
    { baslik: 'Sunset Horse Riding', ikon: '🐎' },
    { baslik: 'Pottery Experience', ikon: '🏺' },
    { baslik: 'Sierra Sunset', ikon: '📸' },
];

export default function YeniTravelPassport() {
    const { lang } = useLanguage();
    const qrRef = useRef<HTMLCanvasElement>(null);

    const [misafirAdi, setMisafirAdi] = useState('');
    const [destinasyon, setDestinasyon] = useState('');
    const [ulke, setUlke] = useState('');
    const [girisTarihi, setGirisTarihi] = useState('');
    const [cikisTarihi, setCikisTarihi] = useState('');
    const [mesaj, setMesaj] = useState('');
    const [demoMu, setDemoMu] = useState(true);

    const [kapakDosya, setKapakDosya] = useState<File | null>(null);
    const [kapakOnizleme, setKapakOnizleme] = useState<string>('');

    const [otelAd, setOtelAd] = useState('');
    const [otelKonum, setOtelKonum] = useState('');

    const [rota, setRota] = useState<RotaDurag[]>([{ yer: '', tarih: '' }]);
    const [deneyimler, setDeneyimler] = useState<Deneyim[]>([]);

    const [yukleniyor, setYukleniyor] = useState(false);
    const [hata, setHata] = useState<string | null>(null);
    const [sonucPasaport, setSonucPasaport] = useState<any>(null);

    useEffect(() => {
        if (sonucPasaport && qrRef.current) {
            logoluQrCiz(qrRef.current, `https://origintag.com.tr/memory/${sonucPasaport.pasaport_id}`, 180, { dark: '#101415', light: '#e0e3e5' });
        }
    }, [sonucPasaport]);

    const rotaGuncelle = (i: number, alan: keyof RotaDurag, deger: string) => {
        setRota(prev => prev.map((r, idx) => idx === i ? { ...r, [alan]: deger } : r));
    };
    const rotaEkle = () => setRota(prev => [...prev, { yer: '', tarih: '' }]);
    const rotaSil = (i: number) => setRota(prev => prev.filter((_, idx) => idx !== i));

    const deneyimSecVeyaKaldir = (oneri: { baslik: string; ikon: string }) => {
        setDeneyimler(prev => {
            const varMi = prev.find(d => d.baslik === oneri.baslik);
            if (varMi) return prev.filter(d => d.baslik !== oneri.baslik);
            return [...prev, { baslik: oneri.baslik, ikon: oneri.ikon, tarih: '', saat: '', konum: '' }];
        });
    };
    const deneyimGuncelle = (baslik: string, alan: keyof Deneyim, deger: string) => {
        setDeneyimler(prev => prev.map(d => d.baslik === baslik ? { ...d, [alan]: deger } : d));
    };

    const kapakSec = (e: React.ChangeEvent<HTMLInputElement>) => {
        const dosya = e.target.files?.[0];
        if (!dosya) return;
        setKapakDosya(dosya);
        setKapakOnizleme(URL.createObjectURL(dosya));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!misafirAdi || !destinasyon) {
            setHata(lang === 'tr' ? 'Misafir adı ve destinasyon zorunlu' : 'Guest name and destination are required');
            return;
        }
        setHata(null);
        setYukleniyor(true);
        try {
            let kapakGorselUrl = '';
            if (kapakDosya) {
                const blob = await upload(`travel-passports/${Date.now()}-${kapakDosya.name}`, kapakDosya, {
                    access: 'public',
                    handleUploadUrl: '/api/medya-yukle',
                });
                kapakGorselUrl = blob.url;
            }

            const res = await fetch('/api/travel-passport-olustur', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    misafirAdi, destinasyon, ulke, girisTarihi, cikisTarihi, mesaj, demoMu,
                    kapakGorselUrl,
                    otel: { ad: otelAd, konum: otelKonum, checkIn: girisTarihi, checkOut: cikisTarihi },
                    rota: rota.filter(r => r.yer),
                    deneyimler,
                }),
            });
            const data = await res.json();
            if (data.basari) {
                setSonucPasaport(data.pasaport);
            } else {
                setHata(data.hata || (lang === 'tr' ? 'Bilinmeyen hata' : 'Unknown error'));
            }
        } catch {
            setHata(lang === 'tr' ? 'Bağlantı hatası' : 'Connection error');
        }
        setYukleniyor(false);
    };

    const navbar = (
        <div style={{ position: 'sticky', top: '1.25rem', zIndex: 50, display: 'flex', justifyContent: 'center', padding: '0 1.5rem' }}>
            <nav className="od-navbar" style={{ width: '100%', maxWidth: 'var(--container-max)' }}>
                <a href="/dashboard/travel-passports"><img src="/origin.png" alt="OriginTag" style={{ height: '26px', filter: 'brightness(0) invert(1)', opacity: 0.92 }} /></a>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <a href="/dashboard/travel-passports" className="od-btn-ghost">
                        {lang === 'tr' ? '← Pasaportlar' : '← Passports'}
                    </a>
                    <LanguageSwitcher />
                </div>
            </nav>
        </div>
    );

    const subPanelStyle: React.CSSProperties = {
        background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)',
        padding: '1.4rem', marginBottom: '1.25rem', border: '1px solid var(--outline-variant)',
    };
    const subHeadingStyle: React.CSSProperties = {
        fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700,
        color: 'var(--secondary)', marginBottom: '1.1rem',
    };
    const fieldLabelStyle: React.CSSProperties = {
        fontSize: '0.68rem', color: 'var(--on-surface-variant)', display: 'block', marginBottom: '6px',
    };

    if (sonucPasaport) {
        return (
            <main style={{ minHeight: '100vh', background: 'var(--surface)', color: 'var(--on-surface)' }}>
                {navbar}
                <div style={{ display: 'flex', justifyContent: 'center', padding: '3.5rem 1.5rem' }}>
                    <div className="od-glass" style={{ width: '100%', maxWidth: '460px', padding: '2.75rem', textAlign: 'center' }}>
                        <div style={{ width: '52px', height: '52px', margin: '0 auto 1.25rem', borderRadius: '50%', background: 'rgba(178,230,48,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary)', fontSize: '1.5rem' }}>✓</div>
                        <h2 className="font-display" style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                            Passport Created!
                        </h2>
                        <p style={{ color: 'var(--on-surface-variant)', marginBottom: '1.75rem' }}>
                            {sonucPasaport.misafir_adi} — {sonucPasaport.pasaport_id}
                        </p>
                        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius)', padding: '1rem', marginBottom: '1.25rem' }}>
                            <div style={{ display: 'inline-block', padding: '10px', borderRadius: 'var(--radius)', background: 'var(--on-surface)' }}>
                                <canvas ref={qrRef} style={{ display: 'block' }} />
                            </div>
                        </div>
                        <a href={`/memory/${sonucPasaport.pasaport_id}`} target="_blank" rel="noreferrer" className="od-btn-secondary" style={{ width: '100%', display: 'block', marginBottom: '0.75rem' }}>
                            {lang === 'tr' ? 'Sayfayı Görüntüle' : 'View Passport Page'}
                        </a>
                        <button
                            onClick={() => pasaportKartiIndir({
                                pasaportId: sonucPasaport.pasaport_id,
                                misafirAdi: sonucPasaport.misafir_adi,
                                destinasyon: sonucPasaport.destinasyon,
                                ulke: sonucPasaport.ulke,
                                girisTarihi: sonucPasaport.giris_tarihi,
                                cikisTarihi: sonucPasaport.cikis_tarihi,
                            })}
                            className="od-btn-primary" style={{ width: '100%', marginBottom: '0.75rem' }}
                        >
                            ⬇ {lang === 'tr' ? 'Hatıra Kartını İndir (PDF)' : 'Download Memory Card (PDF)'}
                        </button>
                        <a href="/dashboard/travel-passports" className="od-link" style={{ display: 'block', fontSize: '0.85rem' }}>
                            {lang === 'tr' ? 'Pasaport Listesine Dön' : 'Back to Passports List'}
                        </a>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main style={{ minHeight: '100vh', background: 'var(--surface)', color: 'var(--on-surface)' }}>
            {navbar}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3.5rem 1.5rem' }}>
                <div className="od-glass" style={{ width: '100%', maxWidth: '680px', padding: '2.75rem' }}>
                    <h1 className="font-display" style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                        Create Passport
                    </h1>
                    <p style={{ color: 'var(--on-surface-variant)', marginBottom: '2.25rem', fontSize: '0.95rem' }}>
                        OriginTag Memories — Digital Travel Passport
                    </p>

                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.1rem', marginBottom: '1.25rem' }}>
                            <div>
                                <label className="mono-label" style={fieldLabelStyle}>Guest Name(s)</label>
                                <input type="text" required placeholder="Okan & Ayşe" value={misafirAdi} onChange={e => setMisafirAdi(e.target.value)} className="od-field" />
                            </div>
                            <div>
                                <label className="mono-label" style={fieldLabelStyle}>Destination</label>
                                <input type="text" required placeholder="Cappadocia" value={destinasyon} onChange={e => setDestinasyon(e.target.value)} className="od-field" />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.1rem', marginBottom: '1.25rem' }}>
                            <div>
                                <label className="mono-label" style={fieldLabelStyle}>Country</label>
                                <input type="text" placeholder="Türkiye" value={ulke} onChange={e => setUlke(e.target.value)} className="od-field" />
                            </div>
                            <div>
                                <label className="mono-label" style={fieldLabelStyle}>Check-in</label>
                                <input type="date" value={girisTarihi} onChange={e => setGirisTarihi(e.target.value)} className="od-field" />
                            </div>
                            <div>
                                <label className="mono-label" style={fieldLabelStyle}>Check-out</label>
                                <input type="date" value={cikisTarihi} onChange={e => setCikisTarihi(e.target.value)} className="od-field" />
                            </div>
                        </div>

                        <div style={{ marginBottom: '1.25rem' }}>
                            <label className="mono-label" style={fieldLabelStyle}>Cover Photo</label>
                            <label style={{
                                display: 'flex', alignItems: 'center', gap: '1rem',
                                border: '1px dashed var(--outline-variant)', borderRadius: 'var(--radius-md)', padding: '1rem',
                                cursor: 'pointer', background: 'rgba(178,230,48,0.03)',
                            }}>
                                {kapakOnizleme ? (
                                    <img src={kapakOnizleme} alt="" style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: 'var(--radius)' }} />
                                ) : (
                                    <span style={{ fontSize: '1.3rem' }}>🎈</span>
                                )}
                                <span style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)' }}>
                                    {kapakDosya ? kapakDosya.name : (lang === 'tr' ? 'Kapak fotoğrafı seç' : 'Select cover photo')}
                                </span>
                                <input type="file" accept="image/*" onChange={kapakSec} style={{ display: 'none' }} />
                            </label>
                        </div>

                        <div style={subPanelStyle}>
                            <div style={subHeadingStyle}>My Stay</div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.9rem' }}>
                                <div>
                                    <label style={fieldLabelStyle}>Hotel Name</label>
                                    <input type="text" placeholder="Sierra Cave Cappadocia" value={otelAd} onChange={e => setOtelAd(e.target.value)} className="od-field" />
                                </div>
                                <div>
                                    <label style={fieldLabelStyle}>Location</label>
                                    <input type="text" placeholder="Göreme, Cappadocia" value={otelKonum} onChange={e => setOtelKonum(e.target.value)} className="od-field" />
                                </div>
                            </div>
                        </div>

                        <div style={subPanelStyle}>
                            <div style={subHeadingStyle}>My Journey</div>
                            {rota.map((durak, i) => (
                                <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: '0.6rem', marginBottom: '0.6rem' }}>
                                    <input type="text" placeholder={lang === 'tr' ? 'Yer (ör. Göreme)' : 'Place (e.g. Göreme)'}
                                        value={durak.yer} onChange={e => rotaGuncelle(i, 'yer', e.target.value)} className="od-field" />
                                    <input type="date" value={durak.tarih} onChange={e => rotaGuncelle(i, 'tarih', e.target.value)} className="od-field" />
                                    <button type="button" onClick={() => rotaSil(i)} className="od-btn-ghost" style={{ padding: '0.5rem 0.8rem' }}>✕</button>
                                </div>
                            ))}
                            <button type="button" onClick={rotaEkle} className="od-btn-secondary" style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}>
                                + {lang === 'tr' ? 'Durak Ekle' : 'Add Stop'}
                            </button>
                        </div>

                        <div style={subPanelStyle}>
                            <div style={subHeadingStyle}>My Experiences</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '1rem' }}>
                                {ONERILEN_DENEYIMLER.map(oneri => {
                                    const secili = deneyimler.some(d => d.baslik === oneri.baslik);
                                    return (
                                        <button key={oneri.baslik} type="button" onClick={() => deneyimSecVeyaKaldir(oneri)}
                                            style={{
                                                padding: '6px 14px', borderRadius: 'var(--radius-full)', border: '1px solid', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
                                                background: secili ? 'var(--secondary)' : 'transparent',
                                                color: secili ? 'var(--on-secondary)' : 'var(--on-surface-variant)',
                                                borderColor: secili ? 'var(--secondary)' : 'var(--outline-variant)',
                                            }}>
                                            {oneri.ikon} {oneri.baslik}
                                        </button>
                                    );
                                })}
                            </div>
                            {deneyimler.map((d, i) => (
                                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: '0.6rem', marginBottom: '0.6rem' }}>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--on-surface)', alignSelf: 'center' }}>{d.ikon} {d.baslik}</span>
                                    <input type="date" value={d.tarih} onChange={e => deneyimGuncelle(d.baslik, 'tarih', e.target.value)} className="od-field" />
                                    <input type="time" value={d.saat} onChange={e => deneyimGuncelle(d.baslik, 'saat', e.target.value)} className="od-field" />
                                    <input type="text" placeholder="Location" value={d.konum} onChange={e => deneyimGuncelle(d.baslik, 'konum', e.target.value)} className="od-field" />
                                </div>
                            ))}
                        </div>

                        <div style={{ marginBottom: '1.75rem' }}>
                            <label className="mono-label" style={fieldLabelStyle}>Our Message</label>
                            <textarea placeholder="Cappadocia was one of those places we promised ourselves we would never forget."
                                value={mesaj} onChange={e => setMesaj(e.target.value)} rows={3} className="od-field" style={{ resize: 'none' }} />
                        </div>

                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--on-surface)', cursor: 'pointer', marginBottom: '1.75rem' }}>
                            <input type="checkbox" checked={demoMu} onChange={e => setDemoMu(e.target.checked)} />
                            {lang === 'tr' ? 'Bu bir demo deneyimi (sayfada "DEMO EXPERIENCE" rozeti gösterilir)' : 'This is a demo experience (shows a "DEMO EXPERIENCE" badge on the page)'}
                        </label>

                        {hata && <p style={{ color: 'var(--error)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>{hata}</p>}

                        <button type="submit" disabled={yukleniyor} className="od-btn-primary" style={{ width: '100%' }}>
                            {yukleniyor ? (lang === 'tr' ? 'Oluşturuluyor...' : 'Creating...') : 'Generate Passport'}
                        </button>
                    </form>
                </div>
            </div>
        </main>
    );
}
