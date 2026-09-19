'use client';
import { useState, useEffect, use } from 'react';
import { upload } from '@vercel/blob/client';
import { resmiSikistir } from '../../lib/resimSikistir';

type Dil = 'en' | 'tr';

function pasaportKapagiSvg() {
    return (
        <svg viewBox="0 0 800 480" preserveAspectRatio="xMidYMid slice" style={{ width: '100%', height: '100%' }}>
            <defs>
                <linearGradient id="gokyuzu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ffb27a" />
                    <stop offset="55%" stopColor="#e8935f" />
                    <stop offset="100%" stopColor="#3a2a2f" />
                </linearGradient>
            </defs>
            <rect width="800" height="480" fill="url(#gokyuzu)" />
            {[60, 160, 260, 560, 660, 730].map((x, i) => (
                <path key={i} d={`M${x},430 L${x + 18},${300 - (i % 3) * 20} Q${x + 24},${280 - (i % 3) * 20} ${x + 30},${300 - (i % 3) * 20} L${x + 48},430 Z`} fill="#2c2129" opacity={0.85} />
            ))}
            <ellipse cx="220" cy="140" rx="34" ry="42" fill="#b2e630" opacity="0.92" />
            <ellipse cx="340" cy="90" rx="26" ry="32" fill="#e0e3e5" opacity="0.85" />
            <ellipse cx="470" cy="150" rx="30" ry="38" fill="#a9cfc0" opacity="0.9" />
            <ellipse cx="600" cy="100" rx="22" ry="28" fill="#ffdf9e" opacity="0.85" />
        </svg>
    );
}

export default function HatiraPasaportu({ params }: { params: Promise<{ pasaportId: string }> }) {
    const { pasaportId } = use(params);

    const [dil, setDil] = useState<Dil>('en');
    const [pasaport, setPasaport] = useState<any>(null);
    const [hatiralar, setHatiralar] = useState<any[]>([]);
    const [yukleniyor, setYukleniyor] = useState(true);
    const [bulunamadi, setBulunamadi] = useState(false);

    const [hatiraFormAcik, setHatiraFormAcik] = useState(false);
    const [hatiraDosya, setHatiraDosya] = useState<File | null>(null);
    const [hatiraNot, setHatiraNot] = useState('');
    const [hatiraTarih, setHatiraTarih] = useState('');
    const [hatiraKonum, setHatiraKonum] = useState('');
    const [hatiraDeneyim, setHatiraDeneyim] = useState('');
    const [hatiraGonderiliyor, setHatiraGonderiliyor] = useState(false);
    const [hatiraHata, setHatiraHata] = useState<string | null>(null);

    const [yerFormAcik, setYerFormAcik] = useState(false);
    const [yerAdi, setYerAdi] = useState('');
    const [yerTarihi, setYerTarihi] = useState('');
    const [yerGonderiliyor, setYerGonderiliyor] = useState(false);

    useEffect(() => {
        if (typeof navigator !== 'undefined' && navigator.language?.toLowerCase().startsWith('tr')) {
            setDil('tr');
        }
    }, []);

    const veriGetir = () => {
        fetch(`/api/memory/${pasaportId}`)
            .then(res => res.json())
            .then(data => {
                if (data.basari) {
                    setPasaport(data.pasaport);
                    setHatiralar(data.hatiralar);
                } else {
                    setBulunamadi(true);
                }
                setYukleniyor(false);
            })
            .catch(() => { setBulunamadi(true); setYukleniyor(false); });
    };

    useEffect(() => { veriGetir(); }, [pasaportId]);

    // Sayfa acildiginda bir kez "passport_opened" olayi logla
    useEffect(() => {
        fetch('/api/olay-kaydet', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pasaportId, olayTipi: 'passport_opened' }),
        }).catch(() => { });
    }, [pasaportId]);

    const t = (en: string, tr: string) => (dil === 'tr' ? tr : en);

    const olayGonder = (olayTipi: string, meta: Record<string, unknown> = {}) => {
        fetch('/api/olay-kaydet', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pasaportId, olayTipi, meta }),
        }).catch(() => { });
    };

    const hatiraGonder = async (e: React.FormEvent) => {
        e.preventDefault();
        setHatiraHata(null);
        setHatiraGonderiliyor(true);
        try {
            let url = '';
            if (hatiraDosya) {
                const sikistirilmis = await resmiSikistir(hatiraDosya);
                const blob = await upload(`memories/${pasaportId}/${Date.now()}-${sikistirilmis.name}`, sikistirilmis, {
                    access: 'public',
                    handleUploadUrl: '/api/hatira-medya-yukle',
                    clientPayload: JSON.stringify({ pasaportId }),
                });
                url = blob.url;
            }
            const res = await fetch('/api/hatira-ekle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    pasaportId, tip: 'foto', url,
                    notMetni: hatiraNot || null,
                    tarih: hatiraTarih || null,
                    konum: hatiraKonum || null,
                    deneyimEtiketi: hatiraDeneyim || null,
                }),
            });
            const data = await res.json();
            if (data.basari) {
                setHatiraDosya(null); setHatiraNot(''); setHatiraTarih(''); setHatiraKonum(''); setHatiraDeneyim('');
                setHatiraFormAcik(false);
                veriGetir();
            } else {
                setHatiraHata(data.hata || t('Something went wrong', 'Bir hata oluştu'));
            }
        } catch {
            setHatiraHata(t('Connection error', 'Bağlantı hatası'));
        }
        setHatiraGonderiliyor(false);
    };

    const yerEkle = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!yerAdi.trim()) return;
        setYerGonderiliyor(true);
        try {
            const res = await fetch('/api/hatira-ekle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pasaportId, tip: 'yer', konum: yerAdi, tarih: yerTarihi || null }),
            });
            const data = await res.json();
            if (data.basari) {
                setYerAdi(''); setYerTarihi(''); setYerFormAcik(false);
                veriGetir();
            }
        } catch { /* sessizce basarisiz ol, form acik kalsin */ }
        setYerGonderiliyor(false);
    };

    if (yukleniyor) {
        return (
            <main style={{ minHeight: '100vh', background: '#101415', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    border: '1.5px solid #414845', borderTopColor: '#b2e630',
                    animation: 'spin 0.9s linear infinite',
                }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </main>
        );
    }

    if (bulunamadi) {
        return (
            <main style={{ minHeight: '100vh', background: '#101415', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', color: '#e0e3e5' }}>
                <div style={{ textAlign: 'center', maxWidth: '360px' }}>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.6rem' }}>{t('Passport Not Found', 'Pasaport Bulunamadı')}</h2>
                    <p style={{ color: '#c1c8c4' }}>{t('This passport code is invalid or no longer exists.', 'Bu pasaport kodu geçersiz veya artık mevcut değil.')}</p>
                </div>
            </main>
        );
    }

    const otel = pasaport.otel || {};
    const rotaAdmin: { yer: string; tarih: string }[] = pasaport.rota || [];
    const deneyimler: { baslik: string; ikon: string; tarih: string; saat: string; konum: string }[] = pasaport.deneyimler || [];
    const anilar = hatiralar.filter(h => h.tip === 'foto' || h.tip === 'video' || h.tip === 'not');
    const misafirYerleri = hatiralar.filter(h => h.tip === 'yer');
    const tumYerler = [
        ...rotaAdmin.map(r => ({ yer: r.yer, tarih: r.tarih, misafirEkledi: false })),
        ...misafirYerleri.map(y => ({ yer: y.konum, tarih: y.tarih, misafirEkledi: true })),
    ];

    const tarihFormat = (tarihStr: string) => tarihStr ? new Date(tarihStr).toLocaleDateString(dil === 'tr' ? 'tr-TR' : 'en-GB', { day: '2-digit', month: 'long' }) : '';
    const tarihAraligi = pasaport.giris_tarihi && pasaport.cikis_tarihi
        ? `${new Date(pasaport.giris_tarihi).getDate()}–${new Date(pasaport.cikis_tarihi).getDate()} ${new Date(pasaport.cikis_tarihi).toLocaleDateString('en-US', { month: 'long' })} ${new Date(pasaport.cikis_tarihi).getFullYear()}`
        : '';
    const geceSayisi = pasaport.giris_tarihi && pasaport.cikis_tarihi
        ? Math.round((new Date(pasaport.cikis_tarihi).getTime() - new Date(pasaport.giris_tarihi).getTime()) / 86400000)
        : null;

    const paylasUrl = `https://origintag.com.tr/memory/${pasaportId}`;

    const kart: React.CSSProperties = {
        background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px',
        padding: '1.75rem', marginBottom: '1.1rem',
    };
    const bolumBaslik: React.CSSProperties = { fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700, color: '#b2e630', marginBottom: '1.1rem' };
    const buton: React.CSSProperties = { background: '#b2e630', color: '#1a2400', fontWeight: 700, border: 'none', borderRadius: '999px', padding: '0.75rem 1.5rem', fontSize: '0.85rem', cursor: 'pointer' };
    const butonGhost: React.CSSProperties = { background: 'transparent', color: '#e0e3e5', fontWeight: 600, border: '1px solid rgba(255,255,255,0.2)', borderRadius: '999px', padding: '0.75rem 1.5rem', fontSize: '0.85rem', cursor: 'pointer', textDecoration: 'none', display: 'inline-block' };
    const inputStil: React.CSSProperties = { background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', padding: '0.5rem 0.6rem', color: '#e0e3e5', fontSize: '0.82rem' };

    return (
        <main style={{ minHeight: '100vh', background: '#101415', color: '#e0e3e5', fontFamily: 'inherit' }}>
            {/* KAPAK */}
            <div style={{ position: 'relative', minHeight: '480px', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0 }}>
                    {pasaport.kapak_gorsel_url
                        ? <img src={pasaport.kapak_gorsel_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : pasaportKapagiSvg()}
                </div>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, transparent 35%, rgba(16,20,21,0.96) 100%)' }} />

                {pasaport.demo_mu && (
                    <div style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', zIndex: 3 }}>
                        <span style={{ fontSize: '0.58rem', letterSpacing: '0.08em', fontWeight: 800, color: '#101415', background: '#b2e630', borderRadius: '999px', padding: '0.3rem 0.8rem' }}>
                            DEMO PASSPORT
                        </span>
                    </div>
                )}

                <div style={{ position: 'absolute', top: '1.25rem', left: '1.25rem', zIndex: 3, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <img src="/origin.png" alt="OriginTag" style={{ height: '18px', filter: 'brightness(0) invert(1)' }} />
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, opacity: 0.9 }}>OriginTag Memories</span>
                </div>

                <div style={{ position: 'relative', zIndex: 2, minHeight: '480px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '2rem 1.5rem 2rem', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', opacity: 0.85, marginBottom: '0.6rem' }}>
                        {t('My', 'Benim')} {pasaport.destinasyon}
                    </p>
                    <h1 style={{ fontSize: 'clamp(2rem, 7vw, 3rem)', fontWeight: 800, letterSpacing: '-0.02em', margin: 0, lineHeight: 1.05 }}>
                        {pasaport.misafir_adi}
                    </h1>
                    <p style={{ marginTop: '0.8rem', fontSize: '0.95rem', opacity: 0.9 }}>{tarihAraligi}</p>
                    {otel.ad && (
                        <p style={{ fontSize: '0.8rem', opacity: 0.75, marginTop: '0.2rem' }}>
                            {t('Hosted by', 'Ev sahibi')} {otel.ad}
                        </p>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
                        {geceSayisi !== null && (
                            <span style={{ fontSize: '0.72rem', background: 'rgba(255,255,255,0.1)', borderRadius: '999px', padding: '0.35rem 0.85rem' }}>
                                {geceSayisi} {t(geceSayisi === 1 ? 'Night' : 'Nights', 'Gece')}
                            </span>
                        )}
                        {tumYerler.length > 0 && (
                            <span style={{ fontSize: '0.72rem', background: 'rgba(255,255,255,0.1)', borderRadius: '999px', padding: '0.35rem 0.85rem' }}>
                                {tumYerler.length} {t('Places', 'Yer')}
                            </span>
                        )}
                        {deneyimler.length > 0 && (
                            <span style={{ fontSize: '0.72rem', background: 'rgba(255,255,255,0.1)', borderRadius: '999px', padding: '0.35rem 0.85rem' }}>
                                {deneyimler.length} {t('Experiences', 'Deneyim')}
                            </span>
                        )}
                    </div>

                    <p style={{ fontSize: '0.6rem', letterSpacing: '0.08em', opacity: 0.5, marginTop: '1.1rem', fontFamily: 'monospace' }}>
                        {pasaport.pasaport_id}
                    </p>
                </div>
            </div>

            <div style={{ maxWidth: '620px', margin: '0 auto', padding: '0 1.25rem 4rem' }}>

                {/* MY STAY */}
                {otel.ad && (
                    <div style={{ ...kart, marginTop: '-1.5rem', position: 'relative', zIndex: 3, overflow: 'hidden' }}>
                        {otel.gorselUrl && (
                            <img src={otel.gorselUrl} alt="" style={{ width: 'calc(100% + 3.5rem)', margin: '-1.75rem -1.75rem 1.1rem', height: '140px', objectFit: 'cover', display: 'block' }} />
                        )}
                        <div style={bolumBaslik}>🏨 {t('My Stay', 'Konaklamam')}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.3rem' }}>
                            {otel.logoUrl && <img src={otel.logoUrl} alt="" style={{ width: '32px', height: '32px', borderRadius: '8px', objectFit: 'cover' }} />}
                            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>{otel.ad.toUpperCase()}</h3>
                        </div>
                        <p style={{ color: '#c1c8c4', fontSize: '0.85rem', marginBottom: '1rem' }}>{otel.konum}</p>
                        <div style={{ display: 'flex', gap: '2rem', marginBottom: '1.1rem' }}>
                            <div>
                                <div style={{ fontSize: '0.62rem', color: '#8b928e', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Check-in</div>
                                <div style={{ fontWeight: 700 }}>{pasaport.giris_tarihi ? new Date(pasaport.giris_tarihi).toLocaleDateString(dil === 'tr' ? 'tr-TR' : 'en-GB') : '-'}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.62rem', color: '#8b928e', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Check-out</div>
                                <div style={{ fontWeight: 700 }}>{pasaport.cikis_tarihi ? new Date(pasaport.cikis_tarihi).toLocaleDateString(dil === 'tr' ? 'tr-TR' : 'en-GB') : '-'}</div>
                            </div>
                        </div>
                        <p style={{ fontStyle: 'italic', color: '#c1c8c4', fontSize: '0.85rem', marginBottom: '1.1rem' }}>
                            {t('Where our story began.', 'Hikayemizin başladığı yer.')}
                        </p>
                        <a
                            href={otel.website ? (otel.website.startsWith('http') ? otel.website : `https://${otel.website}`) : (otel.haritaUrl || `mailto:info@origintag.com.tr?subject=${encodeURIComponent('Book Again — ' + otel.ad)}`)}
                            target="_blank" rel="noreferrer"
                            onClick={() => olayGonder('hotel_clicked', { otel: otel.ad })}
                            style={butonGhost}
                        >
                            {t('Visit Hotel', 'Oteli Ziyaret Et')}
                        </a>
                    </div>
                )}

                {/* MY JOURNEY */}
                <div style={kart}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.1rem' }}>
                        <div style={{ ...bolumBaslik, marginBottom: 0 }}>📍 {t('My Journey', 'Yolculuğum')}</div>
                        <button onClick={() => setYerFormAcik(v => !v)} style={{ ...butonGhost, padding: '0.45rem 0.95rem', fontSize: '0.72rem' }}>
                            + {t('Add Place', 'Yer Ekle')}
                        </button>
                    </div>

                    {yerFormAcik && (
                        <form onSubmit={yerEkle} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: '0.6rem', marginBottom: '1.1rem' }}>
                            <input type="text" required placeholder={t('Place name', 'Yer adı')} value={yerAdi} onChange={e => setYerAdi(e.target.value)} style={inputStil} />
                            <input type="date" value={yerTarihi} onChange={e => setYerTarihi(e.target.value)} style={inputStil} />
                            <button type="submit" disabled={yerGonderiliyor} style={{ ...buton, padding: '0.5rem 0.9rem', fontSize: '0.78rem' }}>
                                {yerGonderiliyor ? '…' : '✓'}
                            </button>
                        </form>
                    )}

                    {tumYerler.length === 0 ? (
                        <p style={{ color: '#8b928e', fontSize: '0.85rem' }}>{t('No places yet.', 'Henüz yer eklenmedi.')}</p>
                    ) : (
                        tumYerler.map((durak, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.7rem 0', borderBottom: i < tumYerler.length - 1 ? '1px solid rgba(255,255,255,0.07)' : 'none' }}>
                                <span style={{ fontWeight: 700 }}>{durak.yer}{durak.misafirEkledi && <span style={{ fontSize: '0.65rem', color: '#b2e630', marginLeft: '6px' }}>●</span>}</span>
                                <span style={{ color: '#c1c8c4', fontSize: '0.85rem' }}>{tarihFormat(durak.tarih)}</span>
                            </div>
                        ))
                    )}
                </div>

                {/* MY MAP */}
                {tumYerler.length > 0 && (
                    <div style={kart}>
                        <div style={bolumBaslik}>🗺 {t('My Map', 'Haritam')}</div>
                        <p style={{ fontSize: '0.85rem', color: '#c1c8c4', marginBottom: '1rem' }}>
                            {tumYerler.length} {t('places discovered', 'yer keşfedildi')}
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {tumYerler.map((durak, i) => (
                                <span key={i} style={{ fontSize: '0.8rem', background: 'rgba(178,230,48,0.12)', color: '#b2e630', borderRadius: '999px', padding: '0.4rem 0.9rem' }}>
                                    ✓ {durak.yer}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* MY MEMORIES */}
                <div style={kart}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.1rem' }}>
                        <div style={{ ...bolumBaslik, marginBottom: 0 }}>📸 {t('My Memories', 'Anılarım')}</div>
                        <button onClick={() => setHatiraFormAcik(v => !v)} style={{ ...buton, padding: '0.5rem 1.1rem', fontSize: '0.75rem' }}>
                            + {t('Add Photo', 'Fotoğraf Ekle')}
                        </button>
                    </div>

                    {hatiraFormAcik && (
                        <form onSubmit={hatiraGonder} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '14px', padding: '1.1rem', marginBottom: '1.25rem' }}>
                            <input type="file" accept="image/*" onChange={e => setHatiraDosya(e.target.files?.[0] || null)}
                                style={{ marginBottom: '0.75rem', fontSize: '0.8rem', color: '#c1c8c4' }} />
                            <textarea placeholder={t('Write a note...', 'Bir not yaz...')} value={hatiraNot} onChange={e => setHatiraNot(e.target.value)} rows={2}
                                style={{ width: '100%', ...inputStil, marginBottom: '0.6rem', resize: 'none' }} />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginBottom: '0.6rem' }}>
                                <input type="date" value={hatiraTarih} onChange={e => setHatiraTarih(e.target.value)} style={inputStil} />
                                <input type="text" placeholder={t('Location', 'Konum')} value={hatiraKonum} onChange={e => setHatiraKonum(e.target.value)} style={inputStil} />
                            </div>
                            {deneyimler.length > 0 && (
                                <select value={hatiraDeneyim} onChange={e => setHatiraDeneyim(e.target.value)} style={{ width: '100%', ...inputStil, marginBottom: '0.75rem' }}>
                                    <option value="">{t('Link to an experience (optional)', 'Bir deneyime bağla (opsiyonel)')}</option>
                                    {deneyimler.map((d, i) => <option key={i} value={d.baslik}>{d.ikon} {d.baslik}</option>)}
                                </select>
                            )}
                            {hatiraHata && <p style={{ color: '#ffb4ab', fontSize: '0.8rem', marginBottom: '0.6rem' }}>{hatiraHata}</p>}
                            <button type="submit" disabled={hatiraGonderiliyor} style={{ ...buton, width: '100%' }}>
                                {hatiraGonderiliyor ? t('Uploading...', 'Yükleniyor...') : t('Save Memory', 'Anıyı Kaydet')}
                            </button>
                        </form>
                    )}

                    {anilar.length === 0 ? (
                        <p style={{ color: '#8b928e', fontSize: '0.85rem' }}>{t('No memories yet — be the first to add one.', 'Henüz anı yok — ilk ekleyen sen ol.')}</p>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                            {anilar.filter(a => a.url).map(a => (
                                <img key={a.id} src={a.url} alt="" style={{ width: '100%', aspectRatio: '1', borderRadius: '10px', objectFit: 'cover' }} />
                            ))}
                        </div>
                    )}
                    {anilar.filter(a => a.not_metni).map(a => (
                        <p key={a.id} style={{ fontStyle: 'italic', color: '#c1c8c4', fontSize: '0.85rem', marginTop: '0.9rem', borderLeft: '2px solid #b2e630', paddingLeft: '0.8rem' }}>
                            &ldquo;{a.not_metni}&rdquo;
                        </p>
                    ))}
                    <p style={{ fontSize: '0.7rem', color: '#8b928e', marginTop: '1rem' }}>
                        {anilar.filter(a => a.url).length}/20 {t('photos', 'fotoğraf')}
                    </p>
                </div>

                {/* MY EXPERIENCES */}
                {deneyimler.length > 0 && (
                    <div style={kart}>
                        <div style={bolumBaslik}>✨ {t('My Experiences', 'Deneyimlerim')}</div>
                        {deneyimler.map((deneyim, i) => {
                            const iliskiliAnilar = anilar.filter(a => a.deneyim_etiketi === deneyim.baslik && a.url);
                            return (
                                <div key={i}
                                    onClick={() => olayGonder('experience_clicked', { deneyim: deneyim.baslik })}
                                    style={{ cursor: 'pointer', marginBottom: i < deneyimler.length - 1 ? '1.4rem' : 0, paddingBottom: i < deneyimler.length - 1 ? '1.4rem' : 0, borderBottom: i < deneyimler.length - 1 ? '1px solid rgba(255,255,255,0.07)' : 'none' }}>
                                    <div style={{ fontWeight: 700, fontSize: '0.98rem' }}>{deneyim.ikon} {deneyim.baslik}</div>
                                    <div style={{ color: '#c1c8c4', fontSize: '0.8rem', marginTop: '0.2rem' }}>
                                        {deneyim.konum ? `${deneyim.konum} • ` : ''}{tarihFormat(deneyim.tarih)}{deneyim.saat ? ` • ${deneyim.saat}` : ''}
                                    </div>
                                    {iliskiliAnilar.length > 0 && (
                                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', overflowX: 'auto' }}>
                                            {iliskiliAnilar.map(a => (
                                                <img key={a.id} src={a.url} alt="" style={{ width: '84px', height: '84px', borderRadius: '10px', objectFit: 'cover', flexShrink: 0 }} />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* OUR MESSAGE */}
                {pasaport.mesaj && (
                    <div style={{ ...kart, textAlign: 'center' }}>
                        <div style={bolumBaslik}>💌 {t('Our Message', 'Mesajımız')}</div>
                        <p style={{ fontSize: '1.1rem', fontStyle: 'italic', lineHeight: 1.6, marginBottom: '1rem' }}>
                            &ldquo;{pasaport.mesaj}&rdquo;
                        </p>
                        <p style={{ fontSize: '0.8rem', color: '#8b928e' }}>
                            {pasaport.misafir_adi} — {pasaport.cikis_tarihi ? new Date(pasaport.cikis_tarihi).toLocaleDateString(dil === 'tr' ? 'tr-TR' : 'en-US', { month: 'long', year: 'numeric' }) : ''}
                        </p>
                    </div>
                )}

                {/* SHARE MY PASSPORT */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.5rem' }}>
                    <a
                        href={`https://wa.me/?text=${encodeURIComponent(t('My ', 'Benim ') + pasaport.destinasyon + ' — ' + paylasUrl)}`}
                        target="_blank" rel="noreferrer"
                        onClick={() => olayGonder('passport_shared', { kanal: 'whatsapp' })}
                        style={{ ...buton, textAlign: 'center', textDecoration: 'none' }}
                    >
                        WhatsApp — {t('Share My Passport', 'Pasaportumu Paylaş')}
                    </a>
                    <button
                        onClick={async () => {
                            olayGonder('passport_shared', { kanal: 'link' });
                            if (navigator.share) {
                                try { await navigator.share({ title: `My ${pasaport.destinasyon}`, url: paylasUrl }); } catch { /* kullanici iptal etti */ }
                            } else {
                                navigator.clipboard.writeText(paylasUrl);
                                alert(t('Link copied!', 'Link kopyalandı!'));
                            }
                        }}
                        style={{ ...butonGhost, cursor: 'pointer' }}
                    >
                        {t('Copy Link', 'Linki Kopyala')}
                    </button>
                </div>

                <div style={{ textAlign: 'center', padding: '2.5rem 0 1rem', opacity: 0.5 }}>
                    <p style={{ fontSize: '0.7rem' }}>Secured by OriginTag</p>
                </div>
            </div>
        </main>
    );
}
