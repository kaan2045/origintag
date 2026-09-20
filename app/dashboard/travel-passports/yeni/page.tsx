'use client';
import { useState, useRef, useEffect } from 'react';
import { upload } from '@vercel/blob/client';
import SayfaNav from '../../../components/SayfaNav';
import { useLanguage } from '../../../context/LanguageContext';
import { pasaportKartiIndir } from '../../../lib/pasaportKart';
import { qrCiz } from '../../../lib/qrLogo';
import { resmiSikistir } from '../../../lib/resimSikistir';

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

    const [oteller, setOteller] = useState<any[]>([]);
    const [secilenOtelId, setSecilenOtelId] = useState('');

    const [rota, setRota] = useState<RotaDurag[]>([{ yer: '', tarih: '' }]);
    const [deneyimler, setDeneyimler] = useState<Deneyim[]>([]);

    const [yukleniyor, setYukleniyor] = useState(false);
    const [hata, setHata] = useState<string | null>(null);
    const [sonucPasaport, setSonucPasaport] = useState<any>(null);
    const [linkKopyalandi, setLinkKopyalandi] = useState(false);

    useEffect(() => {
        fetch('/api/otel-olustur')
            .then(res => res.json())
            .then(data => { if (data.basari) setOteller(data.oteller); })
            .catch(() => { });
    }, []);

    useEffect(() => {
        if (sonucPasaport && qrRef.current) {
            qrCiz(qrRef.current, `https://origintag.com.tr/memory/${sonucPasaport.pasaport_id}`, 180, { dark: '#101415', light: '#e0e3e5' });
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
                const sikistirilmis = await resmiSikistir(kapakDosya);
                const blob = await upload(`travel-passports/${Date.now()}-${sikistirilmis.name}`, sikistirilmis, {
                    access: 'public',
                    handleUploadUrl: '/api/medya-yukle',
                });
                kapakGorselUrl = blob.url;
            }

            const secilenOtel = oteller.find(o => String(o.id) === secilenOtelId);

            const res = await fetch('/api/travel-passport-olustur', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    misafirAdi, destinasyon, ulke, girisTarihi, cikisTarihi, mesaj, demoMu,
                    kapakGorselUrl,
                    otelId: secilenOtel?.id || null,
                    otel: secilenOtel ? {
                        ad: secilenOtel.ad, konum: secilenOtel.sehir, checkIn: girisTarihi, checkOut: cikisTarihi,
                        logoUrl: secilenOtel.logo_url, gorselUrl: secilenOtel.kapak_gorsel_url,
                        haritaUrl: secilenOtel.harita_url, telefon: secilenOtel.telefon,
                        website: secilenOtel.website, instagram: secilenOtel.instagram,
                    } : {},
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

    const navbar = <SayfaNav geri={{ etiket: lang === 'tr' ? 'Pasaportlar' : 'Passports', href: '/dashboard/travel-passports' }} />;

    const subPanelStyle: React.CSSProperties = {
        background: 'rgba(16,20,21,0.035)', borderRadius: 'var(--radius-md)',
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
            <main className="theme-light">
                {navbar}
                <div style={{ display: 'flex', justifyContent: 'center', padding: '3.5rem 1.5rem' }}>
                    <div className="od-glass" style={{ width: '100%', maxWidth: '460px', padding: '2.75rem', textAlign: 'center' }}>
                        <div style={{ width: '52px', height: '52px', margin: '0 auto 1.25rem', borderRadius: '50%', background: 'rgba(178,230,48,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary)', fontSize: '1.5rem' }}>✓</div>
                        <h2 className="pg-h1" style={{ fontSize: "1.9rem", marginBottom: "0.5rem" }}>
                            Passport Created!
                        </h2>
                        <p style={{ color: 'var(--on-surface-variant)', marginBottom: '1.75rem' }}>
                            {sonucPasaport.misafir_adi} — {sonucPasaport.pasaport_id}
                        </p>
                        <div style={{ background: 'rgba(16,20,21,0.035)', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius)', padding: '1rem', marginBottom: '1.25rem' }}>
                            <div style={{ display: 'inline-block', padding: '10px', borderRadius: 'var(--radius)', background: 'var(--on-surface)', textAlign: 'center' }}>
                                <img src="/origin.png" alt="OriginTag" style={{ height: '20px', marginBottom: '8px' }} />
                                <canvas ref={qrRef} style={{ display: 'block' }} />
                            </div>
                        </div>
                        <a href={`/memory/${sonucPasaport.pasaport_id}`} target="_blank" rel="noreferrer" className="od-btn-secondary" style={{ width: '100%', display: 'block', marginBottom: '0.75rem' }}>
                            🔗 {lang === 'tr' ? 'SHOW QR — Sayfayı Görüntüle' : 'SHOW QR — View Passport Page'}
                        </a>
                        <button
                            onClick={() => {
                                const url = `https://origintag.com.tr/memory/${sonucPasaport.pasaport_id}`;
                                navigator.clipboard.writeText(url);
                                setLinkKopyalandi(true);
                                setTimeout(() => setLinkKopyalandi(false), 2000);
                            }}
                            className="od-btn-secondary" style={{ width: '100%', marginBottom: '0.75rem' }}
                        >
                            📤 {linkKopyalandi ? (lang === 'tr' ? 'Kopyalandı!' : 'Copied!') : (lang === 'tr' ? 'SEND LINK — Linki Kopyala' : 'SEND LINK — Copy Link')}
                        </button>
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
                            🖨 {lang === 'tr' ? 'PRINT CARD — Kartı İndir (PDF)' : 'PRINT CARD — Download PDF'}
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
        <main className="theme-light">
            {navbar}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3.5rem 1.5rem' }}>
                <div className="od-glass" style={{ width: '100%', maxWidth: '680px', padding: '2.75rem' }}>
                    <h1 className="pg-h1" style={{ fontSize: "2.2rem", marginBottom: "0.5rem" }}>
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
                            <label style={fieldLabelStyle}>Hotel</label>
                            <select value={secilenOtelId} onChange={e => setSecilenOtelId(e.target.value)} className="od-field">
                                <option value="">{lang === 'tr' ? 'Otel seçin...' : 'Select a hotel...'}</option>
                                {oteller.map(o => <option key={o.id} value={o.id}>{o.ad}</option>)}
                            </select>
                            {oteller.length === 0 && (
                                <p style={{ fontSize: '0.78rem', color: 'var(--on-surface-variant)', marginTop: '0.6rem' }}>
                                    {lang === 'tr' ? 'Henüz otel eklenmedi.' : 'No hotels added yet.'}{' '}
                                    <a href="/dashboard/hotels/yeni" className="od-link">{lang === 'tr' ? 'Otel ekle' : 'Add a hotel'}</a>
                                </p>
                            )}
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
                            {lang === 'tr' ? 'Bu bir demo pasaport (sayfada "DEMO PASSPORT" rozeti gösterilir)' : 'This is a demo passport (shows a "DEMO PASSPORT" badge on the page)'}
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
