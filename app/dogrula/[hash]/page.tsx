'use client';
import { useState, useEffect, use, useRef } from 'react';
import QRCode from 'qrcode';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import HeroSahne from '../../components/HeroSahne';
import DogrulamaYolculugu from '../../components/DogrulamaYolculugu';
import { useLanguage } from '../../context/LanguageContext';
import { urunTemasiniAl } from '../../lib/urunTema';

function MedyaGalerisi({ urls, lang }: { urls: string[], lang: string }) {
    const [acik, setAcik] = useState<string | null>(null);

    const isVideo = (url: string) =>
        url.includes('/video/') || url.match(/\.(mp4|mov|avi|webm)(\?|$)/i);

    return (
        <>
            <div className="od-glass" style={{ padding: '1.75rem', marginBottom: '1.25rem' }}>
                <h2 className="font-display" style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--on-surface)', marginBottom: '1.1rem' }}>
                    {lang === 'tr' ? 'Fotoğraf & Video' : 'Photos & Videos'}
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.6rem' }}>
                    {urls.map((url, i) => (
                        <div
                            key={i}
                            onClick={() => setAcik(url)}
                            style={{
                                overflow: 'hidden', cursor: 'pointer', borderRadius: 'var(--radius)',
                                aspectRatio: '1', position: 'relative',
                                background: 'var(--surface-container-low)'
                            }}
                        >
                            {isVideo(url) ? (
                                <>
                                    <video
                                        src={url}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        muted
                                        playsInline
                                    />
                                    <div style={{
                                        position: 'absolute', inset: 0, display: 'flex',
                                        alignItems: 'center', justifyContent: 'center',
                                        background: 'rgba(0,0,0,0.35)'
                                    }}>
                                        <div style={{
                                            width: '38px', height: '38px', border: '1px solid rgba(224,227,229,0.6)',
                                            borderRadius: '50%', display: 'flex', alignItems: 'center',
                                            justifyContent: 'center', fontSize: '14px', color: 'var(--on-surface)'
                                        }}>▶</div>
                                    </div>
                                </>
                            ) : (
                                <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Lightbox */}
            {acik && (
                <div
                    onClick={() => setAcik(null)}
                    style={{
                        position: 'fixed', inset: 0, background: 'rgba(6,10,10,0.94)',
                        zIndex: 9999, display: 'flex', alignItems: 'center',
                        justifyContent: 'center', padding: '1rem'
                    }}
                >
                    <button
                        onClick={() => setAcik(null)}
                        style={{
                            position: 'absolute', top: '1.5rem', right: '1.5rem',
                            background: 'transparent', border: '1px solid var(--outline-variant)',
                            color: 'var(--on-surface)', width: '38px', height: '38px',
                            borderRadius: '50%', fontSize: '16px', cursor: 'pointer'
                        }}
                    >✕</button>
                    {isVideo(acik) ? (
                        <video
                            src={acik}
                            controls
                            autoPlay
                            onClick={e => e.stopPropagation()}
                            style={{ maxWidth: '100%', maxHeight: '90vh', borderRadius: 'var(--radius-md)' }}
                        />
                    ) : (
                        <img
                            src={acik}
                            alt=""
                            onClick={e => e.stopPropagation()}
                            style={{ maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain', borderRadius: 'var(--radius-md)' }}
                        />
                    )}
                </div>
            )}
        </>
    );
}

export default function DogrulamaPage({ params }: { params: Promise<{ hash: string }> }) {
    const { hash } = use(params);
    const { lang } = useLanguage();
    const [urun, setUrun] = useState<any>(null);
    const [yukleniyor, setYukleniyor] = useState(true);
    const [bulunamadi, setBulunamadi] = useState(false);
    const qrRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        fetch(`/api/urun-dogrula/${hash}`)
            .then(res => res.json())
            .then(data => {
                if (data.basari) {
                    setUrun(data.urun);
                    // Tarama kaydını arka planda gönder, kullanıcıyı bekletme
                    fetch('/api/tarama-kaydet', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ hash }),
                    }).catch(() => { /* tarama kaydı başarısız olsa da kullanıcı deneyimini bozma */ });
                } else {
                    setBulunamadi(true);
                }
                setYukleniyor(false);
            })
            .catch(() => { setBulunamadi(true); setYukleniyor(false); });
    }, [hash]);

    const tema = urunTemasiniAl(urun?.urun_tipi);

    useEffect(() => {
        if (urun && qrRef.current) {
            QRCode.toCanvas(qrRef.current, `https://origintag.com.tr/dogrula/${hash}`, {
                width: 176, margin: 1,
                color: { dark: '#101415', light: '#e0e3e5' }
            });
        }
    }, [urun, hash]);

    if (yukleniyor) return (
        <main style={{ minHeight: '100vh', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{
                    width: '32px', height: '32px', margin: '0 auto 1.25rem', borderRadius: '50%',
                    border: '1.5px solid var(--outline-variant)', borderTopColor: 'var(--secondary)',
                    animation: 'spin 0.9s linear infinite',
                }} />
                <p className="mono-label" style={{ color: 'var(--on-surface-variant)', fontSize: '0.72rem' }}>
                    {lang === 'tr' ? "Blockchain'de doğrulanıyor..." : 'Verifying on blockchain...'}
                </p>
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </main>
    );

    if (bulunamadi) return (
        <main style={{ minHeight: '100vh', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
            <div className="od-glass" style={{ textAlign: 'center', padding: '3.5rem 2.75rem', maxWidth: '400px', borderColor: 'rgba(255,180,171,0.3)' }}>
                <div style={{ fontSize: '2rem', marginBottom: '1.1rem', color: 'var(--error)' }}>◐</div>
                <h2 className="font-display" style={{ color: 'var(--error)', fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.6rem' }}>
                    {lang === 'tr' ? 'Ürün Bulunamadı' : 'Product Not Found'}
                </h2>
                <p style={{ color: 'var(--on-surface-variant)' }}>
                    {lang === 'tr' ? 'Bu QR kod geçersiz veya kayıt bulunamadı.' : 'This QR code is invalid or no record was found.'}
                </p>
            </div>
        </main>
    );

    const d = urun.detaylar || {};

    const yolculukAdimlari = [
        {
            etiket: lang === 'tr' ? 'Hasat' : 'Harvest',
            tarih: urun.hasat_tarihi ? new Date(urun.hasat_tarihi).toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-GB') : '—',
        },
        {
            etiket: lang === 'tr' ? 'Blockchain Kaydı' : 'Blockchain Record',
            tarih: new Date(urun.olusturma_tarihi).toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-GB'),
        },
        {
            etiket: lang === 'tr' ? 'Bu Doğrulama' : 'This Verification',
            tarih: new Date().toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-GB'),
            aktif: true,
        },
    ];

    return (
        <main style={{ minHeight: '100vh', background: 'var(--surface)' }}>

            {/* HERO — ürün temasına göre renklenen sahne (video varsa video, yoksa illüstrasyon) */}
            <div style={{ position: 'relative', background: tema.gradient, color: tema.tint, overflow: 'hidden', minHeight: '480px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ position: 'absolute', inset: 0, opacity: tema.video ? 0.55 : 0.9, pointerEvents: 'none' }}>
                    <HeroSahne tema={tema} />
                </div>
                <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, rgba(0,0,0,0.35) 0%, transparent 35%, transparent 55%, ${tema.deep} 100%)`, opacity: tema.video ? 0.85 : 0.5, pointerEvents: 'none' }} />

                <div style={{ position: 'relative', zIndex: 4, display: 'flex', justifyContent: 'center', padding: '1.25rem 1.5rem 0' }}>
                    <nav className="od-navbar" style={{ width: '100%', maxWidth: 'var(--container-max)' }}>
                        <img src="/origin.png" alt="OriginTag" style={{ height: '26px', filter: 'brightness(0) invert(1)', opacity: 0.92 }} />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div className="mono-label" style={{
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                fontSize: '0.62rem', color: 'var(--on-surface)',
                            }}>
                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--secondary)', display: 'inline-block' }} />
                                {lang === 'tr' ? 'Blockchain Doğrulandı' : 'Blockchain Verified'}
                            </div>
                            <LanguageSwitcher />
                        </div>
                    </nav>
                </div>

                <div style={{ position: 'relative', zIndex: 4, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '2rem 2.5rem 3.5rem', textAlign: 'center' }}>
                    <p className="mono-label" style={{ opacity: 0.82, marginBottom: '1rem' }}>
                        {urun.bolge || (lang === 'tr' ? 'Menşei Belirtilmemiş' : 'Origin Not Specified')}
                    </p>
                    <h1 className="font-display" style={{ fontSize: 'clamp(2.6rem, 6vw, 4.4rem)', fontWeight: 700, letterSpacing: '-0.02em', margin: 0, lineHeight: 1.02 }}>
                        {urun.urun_adi}
                    </h1>
                    <p className="mono-label" style={{ marginTop: '1.1rem', opacity: 0.75, fontSize: '0.7rem' }}>{urun.urun_tipi}</p>
                </div>
            </div>


            <div style={{ maxWidth: '700px', margin: '0 auto', padding: '0 1.25rem' }}>

                {/* YOLCULUK ZAMAN ÇİZELGESİ */}
                <div className="od-glass" style={{
                    padding: '1.75rem 1.9rem', marginTop: '-1.75rem', marginBottom: '1.25rem',
                    position: 'relative', zIndex: 3,
                }}>
                    <DogrulamaYolculugu adimlar={yolculukAdimlari} accentColor={tema.accent} />
                </div>

                {/* BLOCKCHAIN KAYDI */}
                <div className="od-glass" style={{
                    padding: '1.5rem 1.75rem',
                    marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '1.1rem',
                }}>
                    <div style={{ fontSize: '1.5rem', color: tema.accent }}>⬡</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, color: 'var(--on-surface)', marginBottom: '3px', fontSize: '0.92rem' }}>
                            {lang === 'tr' ? "Blockchain'de Kayıtlı" : 'Recorded on Blockchain'}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--on-surface-variant)', wordBreak: 'break-all' }}>{hash}</div>
                        {urun.polygon_tx_hash && (
                            <a
                                href={`https://amoy.polygonscan.com/tx/${urun.polygon_tx_hash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="od-btn-secondary mono-label"
                                style={{ display: 'inline-flex', marginTop: '12px', fontSize: '0.66rem', padding: '6px 14px' }}
                            >
                                ⬡ {lang === 'tr' ? "Polygon'da Görüntüle" : 'View on Polygon'}
                            </a>
                        )}
                    </div>
                </div>

                {/* QR PASAPORT KARTI */}
                <div className="od-glass" style={{
                    padding: '1.9rem', marginBottom: '1.25rem', textAlign: 'center',
                }}>
                    <h2 className="font-display" style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--on-surface)', marginBottom: '1.25rem' }}>
                        {lang === 'tr' ? 'Ürün Pasaportu' : 'Product Passport'}
                    </h2>
                    <div style={{
                        display: 'inline-block', padding: '14px', borderRadius: 'var(--radius)',
                        background: 'var(--on-surface)',
                    }}>
                        <canvas ref={qrRef} style={{ display: 'block' }} />
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)', marginTop: '1rem' }}>
                        {lang === 'tr' ? 'Bu QR kodu taratarak ürünü doğrulayın' : 'Scan this QR code to verify the product'}
                    </p>
                    <button
                        onClick={() => {
                            const canvas = qrRef.current;
                            if (!canvas) return;
                            const link = document.createElement('a');
                            link.download = `${urun.urun_adi}-qr.png`;
                            link.href = canvas.toDataURL('image/png');
                            link.click();
                        }}
                        className="od-btn-secondary"
                        style={{ marginTop: '1.25rem', fontSize: '0.82rem' }}
                    >
                        {lang === 'tr' ? 'QR İndir' : 'Download QR'}
                    </button>
                </div>

                {/* TEMEL BİLGİLER */}
                <div className="od-glass" style={{ padding: '1.9rem', marginBottom: '1.25rem' }}>
                    <h2 className="font-display" style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--on-surface)', marginBottom: '1.4rem' }}>
                        {lang === 'tr' ? 'Ürün Bilgileri' : 'Product Information'}
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.4rem' }}>
                        {[
                            { etiket: lang === 'tr' ? 'Ürün Adı' : 'Product Name', deger: urun.urun_adi },
                            { etiket: lang === 'tr' ? 'Ürün Tipi' : 'Product Type', deger: urun.urun_tipi },
                            { etiket: lang === 'tr' ? 'Üretim Bölgesi' : 'Production Region', deger: urun.bolge },
                            { etiket: lang === 'tr' ? 'Hasat Tarihi' : 'Harvest Date', deger: urun.hasat_tarihi ? new Date(urun.hasat_tarihi).toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-GB') : '-' },
                            { etiket: lang === 'tr' ? 'Miktar' : 'Amount', deger: `${urun.miktar} ${urun.birim}` },
                            { etiket: lang === 'tr' ? 'Kayıt Tarihi' : 'Record Date', deger: new Date(urun.olusturma_tarihi).toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-GB') },
                        ].map((b, i) => (
                            <div key={i}>
                                <div className="mono-label" style={{ fontSize: '0.62rem', color: 'var(--on-surface-variant)', marginBottom: '4px' }}>{b.etiket}</div>
                                <div style={{ fontWeight: 700, color: 'var(--on-surface)' }}>{b.deger || '-'}</div>
                            </div>
                        ))}
                    </div>
                    {urun.aciklama && (
                        <div style={{ marginTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.25rem' }}>
                            <div className="mono-label" style={{ fontSize: '0.62rem', color: 'var(--on-surface-variant)', marginBottom: '6px' }}>
                                {lang === 'tr' ? 'Açıklama' : 'Description'}
                            </div>
                            <div style={{ color: 'var(--on-surface-variant)', lineHeight: 1.6 }}>{urun.aciklama}</div>
                        </div>
                    )}
                </div>

                {/* ZEYTİNYAĞI DETAYLARI */}
                {urun.urun_tipi === 'Zeytinyagi' && Object.keys(d).length > 0 && (
                    <div className="od-glass" style={{ padding: '1.9rem', marginBottom: '1.25rem' }}>
                        <h2 className="font-display" style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--on-surface)', marginBottom: '1.4rem' }}>
                            {lang === 'tr' ? 'Üretici & Ürün Detayları' : 'Producer & Product Details'}
                        </h2>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.1rem' }}>
                            {d.ureticiAd && <div><div className="mono-label" style={{ fontSize: '0.62rem', color: 'var(--on-surface-variant)' }}>{lang === 'tr' ? 'Üretici' : 'Producer'}</div><div style={{ fontWeight: 700, color: 'var(--on-surface)', marginTop: '4px' }}>{d.ureticiAd}</div></div>}
                            {d.telefon && <div><div className="mono-label" style={{ fontSize: '0.62rem', color: 'var(--on-surface-variant)' }}>{lang === 'tr' ? 'Telefon' : 'Phone'}</div><div style={{ fontWeight: 700, color: 'var(--on-surface)', marginTop: '4px' }}>{d.telefon}</div></div>}
                            {d.koy && <div><div className="mono-label" style={{ fontSize: '0.62rem', color: 'var(--on-surface-variant)' }}>{lang === 'tr' ? 'Köy / Mahalle' : 'Village / District'}</div><div style={{ fontWeight: 700, color: 'var(--on-surface)', marginTop: '4px' }}>{d.koy}</div></div>}
                            {d.adaNo && <div><div className="mono-label" style={{ fontSize: '0.62rem', color: 'var(--on-surface-variant)' }}>{lang === 'tr' ? 'Ada / Parsel' : 'Block / Parcel'}</div><div style={{ fontWeight: 700, color: 'var(--on-surface)', marginTop: '4px' }}>{d.adaNo} / {d.parselNo}</div></div>}
                            {d.cekimTipi && <div><div className="mono-label" style={{ fontSize: '0.62rem', color: 'var(--on-surface-variant)' }}>{lang === 'tr' ? 'Çekim Tipi' : 'Extraction Type'}</div><div style={{ fontWeight: 700, color: 'var(--on-surface)', marginTop: '4px' }}>{d.cekimTipi}</div></div>}
                            {d.randiman && <div><div className="mono-label" style={{ fontSize: '0.62rem', color: 'var(--on-surface-variant)' }}>{lang === 'tr' ? 'Randıman' : 'Yield'}</div><div style={{ fontWeight: 700, color: 'var(--on-surface)', marginTop: '4px' }}>%{d.randiman}</div></div>}
                        </div>
                        {d.zeytinCinsi && d.zeytinCinsi.length > 0 && (
                            <div style={{ marginTop: '1.25rem' }}>
                                <div className="mono-label" style={{ fontSize: '0.62rem', color: 'var(--on-surface-variant)', marginBottom: '8px' }}>
                                    {lang === 'tr' ? 'Zeytin Cinsi' : 'Olive Variety'}
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                    {d.zeytinCinsi.map((c: string, i: number) => (
                                        <span key={i} className="od-chip" style={{ background: 'var(--surface-container-high)', color: tema.accent, textTransform: 'none' }}>{c}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* BAL DETAYLARI */}
                {urun.urun_tipi === 'Bal' && Object.keys(d).length > 0 && (
                    <div className="od-glass" style={{ padding: '1.9rem', marginBottom: '1.25rem' }}>
                        <h2 className="font-display" style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--on-surface)', marginBottom: '1.4rem' }}>
                            {lang === 'tr' ? 'Bal Detayları' : 'Honey Details'}
                        </h2>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.1rem' }}>
                            {d.ureticiAd && <div><div className="mono-label" style={{ fontSize: '0.62rem', color: 'var(--on-surface-variant)' }}>{lang === 'tr' ? 'Üretici' : 'Producer'}</div><div style={{ fontWeight: 700, color: 'var(--on-surface)', marginTop: '4px' }}>{d.ureticiAd}</div></div>}
                            {d.telefon && <div><div className="mono-label" style={{ fontSize: '0.62rem', color: 'var(--on-surface-variant)' }}>{lang === 'tr' ? 'Telefon' : 'Phone'}</div><div style={{ fontWeight: 700, color: 'var(--on-surface)', marginTop: '4px' }}>{d.telefon}</div></div>}
                            {d.balTuru && <div><div className="mono-label" style={{ fontSize: '0.62rem', color: 'var(--on-surface-variant)' }}>{lang === 'tr' ? 'Bal Türü' : 'Honey Type'}</div><div style={{ fontWeight: 700, color: 'var(--on-surface)', marginTop: '4px' }}>{d.balTuru}</div></div>}
                            {d.arlikBolgesi && <div><div className="mono-label" style={{ fontSize: '0.62rem', color: 'var(--on-surface-variant)' }}>{lang === 'tr' ? 'Arılık Bölgesi' : 'Apiary Region'}</div><div style={{ fontWeight: 700, color: 'var(--on-surface)', marginTop: '4px' }}>{d.arlikBolgesi}</div></div>}
                        </div>
                    </div>
                )}

                {/* PEYNİR DETAYLARI */}
                {urun.urun_tipi === 'Peynir' && Object.keys(d).length > 0 && (
                    <div className="od-glass" style={{ padding: '1.9rem', marginBottom: '1.25rem' }}>
                        <h2 className="font-display" style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--on-surface)', marginBottom: '1.4rem' }}>
                            {lang === 'tr' ? 'Peynir Detayları' : 'Cheese Details'}
                        </h2>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.1rem' }}>
                            {d.ureticiAd && <div><div className="mono-label" style={{ fontSize: '0.62rem', color: 'var(--on-surface-variant)' }}>{lang === 'tr' ? 'Üretici' : 'Producer'}</div><div style={{ fontWeight: 700, color: 'var(--on-surface)', marginTop: '4px' }}>{d.ureticiAd}</div></div>}
                            {d.sutTuru && <div><div className="mono-label" style={{ fontSize: '0.62rem', color: 'var(--on-surface-variant)' }}>{lang === 'tr' ? 'Süt Türü' : 'Milk Type'}</div><div style={{ fontWeight: 700, color: 'var(--on-surface)', marginTop: '4px' }}>{d.sutTuru}</div></div>}
                            {d.olgunlasma && <div><div className="mono-label" style={{ fontSize: '0.62rem', color: 'var(--on-surface-variant)' }}>{lang === 'tr' ? 'Olgunlaşma' : 'Aging Period'}</div><div style={{ fontWeight: 700, color: 'var(--on-surface)', marginTop: '4px' }}>{d.olgunlasma}</div></div>}
                        </div>
                    </div>
                )}

                {/* MEDYA GALERİSİ */}
                {urun.medya_urls && urun.medya_urls.length > 0 && (
                    <MedyaGalerisi urls={urun.medya_urls} lang={lang} />
                )}

                <div style={{ textAlign: 'center', padding: '2rem 1rem 3.5rem', borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: '1rem' }}>
                    <img src="/origin.png" alt="OriginTag" style={{ height: '24px', marginBottom: '0.75rem', filter: 'brightness(0) invert(1)', opacity: 0.4 }} />
                    <p style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)' }}>
                        {lang === 'tr' ? 'Bu ürün OriginTag blockchain sistemi ile doğrulandı.' : 'This product has been verified by the OriginTag blockchain system.'}
                    </p>
                    <p className="mono-label" style={{ fontSize: '0.62rem', color: 'var(--on-surface-variant)', opacity: 0.7, marginTop: '4px' }}>origintag.com.tr</p>
                </div>

            </div>
        </main>
    );
}
