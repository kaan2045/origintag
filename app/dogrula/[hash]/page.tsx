'use client';
import { useState, useEffect, use, useRef } from 'react';
import QRCode from 'qrcode';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import { useLanguage } from '../../context/LanguageContext';

function MedyaGalerisi({ urls, lang }: { urls: string[], lang: string }) {
    const [acik, setAcik] = useState<string | null>(null);

    const isVideo = (url: string) =>
        url.includes('/video/') || url.match(/\.(mp4|mov|avi|webm)(\?|$)/i);

    return (
        <>
            <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.1rem', color: '#1a1a1a', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.75rem' }}>
                    {lang === 'tr' ? '📷 Fotoğraf & Video' : '📷 Photos & Videos'}
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                    {urls.map((url, i) => (
                        <div
                            key={i}
                            onClick={() => setAcik(url)}
                            style={{
                                borderRadius: '8px', overflow: 'hidden', cursor: 'pointer',
                                border: '1px solid #eee', aspectRatio: '1', position: 'relative',
                                background: '#f0f0f0'
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
                                        background: 'rgba(0,0,0,0.3)'
                                    }}>
                                        <div style={{
                                            width: '40px', height: '40px', background: 'rgba(255,255,255,0.9)',
                                            borderRadius: '50%', display: 'flex', alignItems: 'center',
                                            justifyContent: 'center', fontSize: '16px'
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
                        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)',
                        zIndex: 9999, display: 'flex', alignItems: 'center',
                        justifyContent: 'center', padding: '1rem'
                    }}
                >
                    <button
                        onClick={() => setAcik(null)}
                        style={{
                            position: 'absolute', top: '1rem', right: '1rem',
                            background: 'rgba(255,255,255,0.15)', border: 'none',
                            color: '#fff', width: '40px', height: '40px',
                            borderRadius: '50%', fontSize: '18px', cursor: 'pointer'
                        }}
                    >✕</button>
                    {isVideo(acik) ? (
                        <video
                            src={acik}
                            controls
                            autoPlay
                            onClick={e => e.stopPropagation()}
                            style={{ maxWidth: '100%', maxHeight: '90vh', borderRadius: '8px' }}
                        />
                    ) : (
                        <img
                            src={acik}
                            alt=""
                            onClick={e => e.stopPropagation()}
                            style={{ maxWidth: '100%', maxHeight: '90vh', borderRadius: '8px', objectFit: 'contain' }}
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
                if (data.basari) setUrun(data.urun);
                else setBulunamadi(true);
                setYukleniyor(false);
            })
            .catch(() => { setBulunamadi(true); setYukleniyor(false); });
    }, [hash]);

    useEffect(() => {
        if (urun && qrRef.current) {
            QRCode.toCanvas(qrRef.current, `https://origintag.com.tr/dogrula/${hash}`, {
                width: 180, margin: 2,
                color: { dark: '#2D5A27', light: '#ffffff' }
            });
        }
    }, [urun, hash]);

    if (yukleniyor) return (
        <main style={{ fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif", fontWeight: 'bold', minHeight: '100vh', background: '#f9f7f4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
                <p style={{ color: '#888' }}>
                    {lang === 'tr' ? "Blockchain'de doğrulanıyor..." : 'Verifying on blockchain...'}
                </p>
            </div>
        </main>
    );

    if (bulunamadi) return (
        <main style={{ fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif", fontWeight: 'bold', minHeight: '100vh', background: '#f9f7f4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center', background: '#fff', padding: '3rem', borderRadius: '16px', border: '1px solid #eee' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
                <h2 style={{ color: '#c0392b' }}>
                    {lang === 'tr' ? 'Ürün Bulunamadı' : 'Product Not Found'}
                </h2>
                <p style={{ color: '#888' }}>
                    {lang === 'tr' ? 'Bu QR kod geçersiz veya kayıt bulunamadı.' : 'This QR code is invalid or no record was found.'}
                </p>
            </div>
        </main>
    );

    const d = urun.detaylar || {};

    return (
        <main style={{ fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif", fontWeight: 'bold', minHeight: '100vh', background: '#f9f7f4' }}>

            <nav style={{ background: '#2D5A27', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <img src="/origin.png" alt="OriginTag" style={{ height: '45px' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: '#fff', color: '#2D5A27', padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                        ✓ {lang === 'tr' ? 'Blockchain Doğrulandı' : 'Blockchain Verified'}
                    </div>
                    <LanguageSwitcher />
                </div>
            </nav>

            <div style={{ background: '#2D5A27', padding: '2rem', textAlign: 'center', color: '#fff' }}>
                <h1 style={{ fontSize: '2rem', margin: '0 0 0.5rem' }}>{urun.urun_adi}</h1>
                <p style={{ opacity: 0.8, margin: 0 }}>{urun.urun_tipi} · {urun.bolge}</p>
            </div>

            <div style={{ maxWidth: '700px', margin: '0 auto', padding: '2rem' }}>

                <div style={{ background: '#EAF3DE', border: '1px solid #c0dd97', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ fontSize: '2.5rem' }}>🔗</div>
                    <div>
                        <div style={{ fontWeight: 'bold', color: '#2D5A27', marginBottom: '4px' }}>
                            {lang === 'tr' ? "Blockchain'de Kayıtlı" : 'Recorded on Blockchain'}
                        </div>
                        <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#3B6D11', wordBreak: 'break-all' }}>{hash}</div>
                    </div>
                </div>

                {/* QR KOD */}
                <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>
                    <h2 style={{ fontSize: '1.1rem', color: '#1a1a1a', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.75rem', textAlign: 'left' }}>
                        QR {lang === 'tr' ? 'Kod' : 'Code'}
                    </h2>
                    <canvas ref={qrRef} style={{ borderRadius: '8px' }} />
                    <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.75rem' }}>
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
                        style={{ marginTop: '0.75rem', padding: '0.5rem 1.5rem', background: '#2D5A27', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem' }}
                    >
                        {lang === 'tr' ? 'QR İndir' : 'Download QR'}
                    </button>
                </div>

                {/* TEMEL BİLGİLER */}
                <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.1rem', color: '#1a1a1a', marginBottom: '1.25rem', borderBottom: '1px solid #eee', paddingBottom: '0.75rem' }}>
                        {lang === 'tr' ? 'Ürün Bilgileri' : 'Product Information'}
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                        {[
                            { etiket: lang === 'tr' ? 'Ürün Adı' : 'Product Name', deger: urun.urun_adi },
                            { etiket: lang === 'tr' ? 'Ürün Tipi' : 'Product Type', deger: urun.urun_tipi },
                            { etiket: lang === 'tr' ? 'Üretim Bölgesi' : 'Production Region', deger: urun.bolge },
                            { etiket: lang === 'tr' ? 'Hasat Tarihi' : 'Harvest Date', deger: urun.hasat_tarihi ? new Date(urun.hasat_tarihi).toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-GB') : '-' },
                            { etiket: lang === 'tr' ? 'Miktar' : 'Amount', deger: `${urun.miktar} ${urun.birim}` },
                            { etiket: lang === 'tr' ? 'Kayıt Tarihi' : 'Record Date', deger: new Date(urun.olusturma_tarihi).toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-GB') },
                        ].map((b, i) => (
                            <div key={i}>
                                <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: '2px' }}>{b.etiket}</div>
                                <div style={{ fontWeight: 'bold', color: '#1a1a1a' }}>{b.deger || '-'}</div>
                            </div>
                        ))}
                    </div>
                    {urun.aciklama && (
                        <div style={{ marginTop: '1rem', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
                            <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: '4px' }}>
                                {lang === 'tr' ? 'Açıklama' : 'Description'}
                            </div>
                            <div style={{ color: '#333' }}>{urun.aciklama}</div>
                        </div>
                    )}
                </div>

                {/* ZEYTİNYAĞI DETAYLARI */}
                {urun.urun_tipi === 'Zeytinyagi' && Object.keys(d).length > 0 && (
                    <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.1rem', color: '#1a1a1a', marginBottom: '1.25rem', borderBottom: '1px solid #eee', paddingBottom: '0.75rem' }}>
                            {lang === 'tr' ? 'Üretici & Ürün Detayları' : 'Producer & Product Details'}
                        </h2>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            {d.ureticiAd && <div><div style={{ fontSize: '0.8rem', color: '#888' }}>{lang === 'tr' ? 'Üretici' : 'Producer'}</div><div style={{ fontWeight: 'bold' }}>{d.ureticiAd}</div></div>}
                            {d.telefon && <div><div style={{ fontSize: '0.8rem', color: '#888' }}>{lang === 'tr' ? 'Telefon' : 'Phone'}</div><div style={{ fontWeight: 'bold' }}>{d.telefon}</div></div>}
                            {d.koy && <div><div style={{ fontSize: '0.8rem', color: '#888' }}>{lang === 'tr' ? 'Köy / Mahalle' : 'Village / District'}</div><div style={{ fontWeight: 'bold' }}>{d.koy}</div></div>}
                            {d.adaNo && <div><div style={{ fontSize: '0.8rem', color: '#888' }}>{lang === 'tr' ? 'Ada / Parsel' : 'Block / Parcel'}</div><div style={{ fontWeight: 'bold' }}>{d.adaNo} / {d.parselNo}</div></div>}
                            {d.cekimTipi && <div><div style={{ fontSize: '0.8rem', color: '#888' }}>{lang === 'tr' ? 'Çekim Tipi' : 'Extraction Type'}</div><div style={{ fontWeight: 'bold' }}>{d.cekimTipi}</div></div>}
                            {d.randiman && <div><div style={{ fontSize: '0.8rem', color: '#888' }}>{lang === 'tr' ? 'Randıman' : 'Yield'}</div><div style={{ fontWeight: 'bold' }}>%{d.randiman}</div></div>}
                        </div>
                        {d.zeytinCinsi && d.zeytinCinsi.length > 0 && (
                            <div style={{ marginTop: '1rem' }}>
                                <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: '6px' }}>
                                    {lang === 'tr' ? 'Zeytin Cinsi' : 'Olive Variety'}
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                    {d.zeytinCinsi.map((c: string, i: number) => (
                                        <span key={i} style={{ padding: '4px 12px', background: '#EAF3DE', color: '#2D5A27', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' }}>{c}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* BAL DETAYLARI */}
                {urun.urun_tipi === 'Bal' && Object.keys(d).length > 0 && (
                    <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.1rem', color: '#1a1a1a', marginBottom: '1.25rem', borderBottom: '1px solid #eee', paddingBottom: '0.75rem' }}>
                            {lang === 'tr' ? 'Bal Detayları' : 'Honey Details'}
                        </h2>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            {d.ureticiAd && <div><div style={{ fontSize: '0.8rem', color: '#888' }}>{lang === 'tr' ? 'Üretici' : 'Producer'}</div><div style={{ fontWeight: 'bold' }}>{d.ureticiAd}</div></div>}
                            {d.telefon && <div><div style={{ fontSize: '0.8rem', color: '#888' }}>{lang === 'tr' ? 'Telefon' : 'Phone'}</div><div style={{ fontWeight: 'bold' }}>{d.telefon}</div></div>}
                            {d.balTuru && <div><div style={{ fontSize: '0.8rem', color: '#888' }}>{lang === 'tr' ? 'Bal Türü' : 'Honey Type'}</div><div style={{ fontWeight: 'bold' }}>{d.balTuru}</div></div>}
                            {d.arlikBolgesi && <div><div style={{ fontSize: '0.8rem', color: '#888' }}>{lang === 'tr' ? 'Arılık Bölgesi' : 'Apiary Region'}</div><div style={{ fontWeight: 'bold' }}>{d.arlikBolgesi}</div></div>}
                        </div>
                    </div>
                )}

                {/* PEYNİR DETAYLARI */}
                {urun.urun_tipi === 'Peynir' && Object.keys(d).length > 0 && (
                    <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.1rem', color: '#1a1a1a', marginBottom: '1.25rem', borderBottom: '1px solid #eee', paddingBottom: '0.75rem' }}>
                            {lang === 'tr' ? 'Peynir Detayları' : 'Cheese Details'}
                        </h2>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            {d.ureticiAd && <div><div style={{ fontSize: '0.8rem', color: '#888' }}>{lang === 'tr' ? 'Üretici' : 'Producer'}</div><div style={{ fontWeight: 'bold' }}>{d.ureticiAd}</div></div>}
                            {d.sutTuru && <div><div style={{ fontSize: '0.8rem', color: '#888' }}>{lang === 'tr' ? 'Süt Türü' : 'Milk Type'}</div><div style={{ fontWeight: 'bold' }}>{d.sutTuru}</div></div>}
                            {d.olgunlasma && <div><div style={{ fontSize: '0.8rem', color: '#888' }}>{lang === 'tr' ? 'Olgunlaşma' : 'Aging Period'}</div><div style={{ fontWeight: 'bold' }}>{d.olgunlasma}</div></div>}
                        </div>
                    </div>
                )}

                {/* MEDYA GALERİSİ */}
                {urun.medya_urls && urun.medya_urls.length > 0 && (
                    <MedyaGalerisi urls={urun.medya_urls} lang={lang} />
                )}

                <div style={{ textAlign: 'center', padding: '1rem' }}>
                    <img src="/origin.png" alt="OriginTag" style={{ height: '35px', marginBottom: '0.5rem' }} />
                    <p style={{ fontSize: '0.8rem', color: '#aaa' }}>
                        {lang === 'tr' ? 'Bu ürün OriginTag blockchain sistemi ile doğrulandı.' : 'This product has been verified by the OriginTag blockchain system.'}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: '#bbb' }}>origintag.com.tr</p>
                </div>

            </div>
        </main>
    );
}
