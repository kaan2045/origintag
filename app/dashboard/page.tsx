'use client';
import { useState, useEffect } from 'react';
import SayfaNav from '../components/SayfaNav';
import { useLanguage } from '../context/LanguageContext';
import { skorHesapla } from '../lib/surdurulebilirlik';
import { urunIcinOnerilerUret, onerileriGrupla } from '../lib/oneriler';

export default function Dashboard() {
    const { t, lang } = useLanguage();
    const [urunler, setUrunler] = useState<any[]>([]);
    const [yukleniyor, setYukleniyor] = useState(true);
    const [kullaniciAd, setKullaniciAd] = useState('');
    const [kullaniciId, setKullaniciId] = useState('');
    const [yaziliyorHash, setYaziliyorHash] = useState<string | null>(null);
    const [yazimSonucu, setYazimSonucu] = useState<Record<string, string>>({});

    useEffect(() => {
        const ad = localStorage.getItem('kullanici_ad') || '';
        const id = localStorage.getItem('kullanici_id') || '';
        setKullaniciAd(ad);
        setKullaniciId(id);

        if (!id) {
            window.location.href = '/login';
            return;
        }

        fetch('/api/urunlerim?kullanici_id=' + id)
            .then(res => res.json())
            .then(data => {
                if (data.basari) setUrunler(data.urunler);
                setYukleniyor(false);
            })
            .catch(() => setYukleniyor(false));
    }, []);

    const blockchaineYaz = async (hash: string) => {
        setYaziliyorHash(hash);
        setYazimSonucu(prev => ({ ...prev, [hash]: '' }));
        try {
            const res = await fetch('/api/blockchain-tamamla', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ hash }),
            });
            const data = await res.json();
            if (data.basari) {
                setUrunler(prev => prev.map(u => u.hash === hash
                    ? { ...u, polygon_tx_hash: data.txHash || u.polygon_tx_hash || 'zincirde-kayitli-tx-bilinmiyor' }
                    : u));
                setYazimSonucu(prev => ({ ...prev, [hash]: 'basarili' }));
            } else {
                setYazimSonucu(prev => ({ ...prev, [hash]: data.hata || (lang === 'tr' ? 'Bilinmeyen hata' : 'Unknown error') }));
            }
        } catch {
            setYazimSonucu(prev => ({ ...prev, [hash]: lang === 'tr' ? 'Bağlantı hatası' : 'Connection error' }));
        }
        setYaziliyorHash(null);
    };

    const cikisYap = () => {
        fetch('/api/cikis', { method: 'POST' }).finally(() => {
            localStorage.removeItem('kullanici_email');
            localStorage.removeItem('kullanici_id');
            localStorage.removeItem('kullanici_ad');
            window.location.href = '/login';
        });
    };

    const gruplanmisOneriler = onerileriGrupla(
        urunler.flatMap(urun => urunIcinOnerilerUret(urun).map(o => ({ ...o, urunHash: urun.hash })))
    );

    const kartlar = [
        { label: lang === 'tr' ? 'Toplam Ürün' : 'Total Products', value: urunler.length.toString() },
        { label: lang === 'tr' ? 'Blockchain Kaydı' : 'Blockchain Records', value: urunler.length.toString() },
    ];

    return (
        <main className="theme-light">
            <SayfaNav baglantilar={[
                { etiket: lang === 'tr' ? 'Seyahat Pasaportları' : 'Travel Passports', href: '/dashboard/travel-passports' },
                { etiket: 'Hotels', href: '/dashboard/hotels' },
                { etiket: t('nav.logout'), onClick: cikisYap },
            ]} />

            <div className="ld-wrap" style={{ paddingTop: '3rem', paddingBottom: '5rem' }}>
                <div style={{ marginBottom: '2.5rem' }}>
                    <p className="pg-eyebrow">{lang === 'tr' ? 'Panel' : 'Dashboard'}</p>
                    <h1 className="pg-h1">{kullaniciAd || (lang === 'tr' ? 'Hoş geldiniz' : 'Welcome')}</h1>
                </div>


                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem', marginBottom: '2rem' }}>
                    {kartlar.map((k, i) => (
                        <div key={i} className="od-glass" style={{ padding: '1.75rem 1.5rem' }}>
                            <div className="font-display" style={{ fontSize: '2.6rem', fontWeight: 300, letterSpacing: '-0.02em', color: 'var(--on-surface)' }}>{k.value}</div>
                            <div className="mono-label" style={{ fontSize: '0.66rem', color: 'var(--on-surface-variant)', marginTop: '0.5rem' }}>{k.label}</div>
                        </div>
                    ))}
                </div>

                <div className="od-glass" style={{ padding: '2.25rem', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
                        <h2 className="pg-h2">{t('dashboard.title')}</h2>
                        <button onClick={() => window.location.href = '/urun-ekle'} className="od-btn-primary" style={{ padding: '0.6rem 1.3rem', fontSize: '0.85rem' }}>
                            + {t('dashboard.addNew')}
                        </button>
                    </div>

                    {yukleniyor ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--on-surface-variant)' }}>
                            <p>{lang === 'tr' ? 'Yükleniyor...' : 'Loading...'}</p>
                        </div>
                    ) : urunler.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem' }}>
                            <p style={{ color: 'var(--on-surface-variant)', marginBottom: '1.25rem' }}>{t('dashboard.noProducts')}</p>
                            <button onClick={() => window.location.href = '/urun-ekle'} className="od-btn-secondary">
                                {lang === 'tr' ? 'İlk Ürününü Ekle' : 'Add Your First Product'}
                            </button>
                        </div>
                    ) : (
                        <div>
                            <div className="mono-label" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: '1rem', padding: '0 0.75rem 0.9rem', borderBottom: '1px solid var(--outline-variant)', marginBottom: '0.25rem', fontSize: '0.64rem', color: 'var(--on-surface-variant)' }}>
                                <span>{lang === 'tr' ? 'ÜRÜN ADI' : 'PRODUCT NAME'}</span>
                                <span>{lang === 'tr' ? 'TİP' : 'TYPE'}</span>
                                <span>{lang === 'tr' ? 'BÖLGE' : 'REGION'}</span>
                                <span>{lang === 'tr' ? 'MİKTAR' : 'AMOUNT'}</span>
                                <span>{lang === 'tr' ? 'İŞLEM' : 'ACTION'}</span>
                            </div>
                            {urunler.map((urun, i) => (
                                <div key={i} className="od-row-hover" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: '1rem', padding: '1.1rem 0.75rem', borderBottom: '1px solid rgba(16,20,21,0.07)', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <span style={{ fontWeight: 700, color: 'var(--on-surface)' }}>{urun.urun_adi}</span>
                                            {skorHesapla(urun.surdurulebilirlik) > 0 && (
                                                <span className="mono-label" title={lang === 'tr' ? 'Sürdürülebilirlik skoru (üretici beyanı)' : 'Sustainability score (self-declared)'}
                                                    style={{
                                                        fontSize: '0.6rem', fontWeight: 700, color: 'var(--secondary)',
                                                        border: '1px solid var(--secondary)', borderRadius: 'var(--radius-full)',
                                                        padding: '0.1rem 0.5rem',
                                                    }}>
                                                    🌱 {skorHesapla(urun.surdurulebilirlik)}
                                                </span>
                                            )}
                                        </div>
                                        <div style={{ fontSize: '0.72rem', color: 'var(--on-surface-variant)' }}>{urun.hash.slice(0, 16)}...</div>
                                    </div>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)' }}>{urun.urun_tipi}</span>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)' }}>{urun.bolge}</span>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)' }}>{urun.miktar} {urun.birim}</span>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.35rem' }}>
                                        <a href={'/dogrula/' + urun.hash} className="od-link mono-label"
                                            style={{ fontSize: '0.68rem', letterSpacing: '0.06em' }}>
                                            {lang === 'tr' ? 'Görüntüle →' : 'View →'}
                                        </a>
                                        {!urun.polygon_tx_hash && (
                                            <button
                                                onClick={() => blockchaineYaz(urun.hash)}
                                                disabled={yaziliyorHash === urun.hash}
                                                className="mono-label"
                                                style={{
                                                    fontSize: '0.62rem', letterSpacing: '0.05em', color: 'var(--error)',
                                                    background: 'transparent', border: '1px solid rgba(255,180,171,0.4)',
                                                    borderRadius: 'var(--radius-full)', padding: '0.2rem 0.6rem',
                                                    cursor: yaziliyorHash === urun.hash ? 'not-allowed' : 'pointer',
                                                    opacity: yaziliyorHash === urun.hash ? 0.6 : 1,
                                                }}
                                            >
                                                {yaziliyorHash === urun.hash
                                                    ? (lang === 'tr' ? 'Yazılıyor...' : 'Writing...')
                                                    : (lang === 'tr' ? '⛓ Blockchain\'e Yaz' : '⛓ Write to Blockchain')}
                                            </button>
                                        )}
                                        {yazimSonucu[urun.hash] && yazimSonucu[urun.hash] !== 'basarili' && (
                                            <span style={{ fontSize: '0.62rem', color: 'var(--error)', maxWidth: '160px' }}>
                                                {yazimSonucu[urun.hash]}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="od-glass" style={{ padding: '2.25rem', marginBottom: '1.5rem' }}>
                    <h2 className="pg-h2" style={{ marginBottom: '1.75rem' }}>
                        {lang === 'tr' ? 'Son İşlemler' : 'Recent Transactions'}
                    </h2>
                    {urunler.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--on-surface-variant)' }}>
                            <p>{lang === 'tr' ? 'Henüz blockchain kaydı yok.' : 'No blockchain records yet.'}</p>
                        </div>
                    ) : (
                        <div>
                            {urunler.slice(0, 5).map((urun, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.9rem 0', borderBottom: '1px solid rgba(16,20,21,0.07)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
                                        <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--secondary)' }}></div>
                                        <div>
                                            <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--on-surface)' }}>{urun.urun_adi}</div>
                                            <div style={{ fontSize: '0.74rem', color: 'var(--on-surface-variant)' }}>
                                                {lang === 'tr' ? 'Blockchain kaydedildi' : 'Recorded on blockchain'}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)' }}>
                                        {new Date(urun.olusturma_tarihi).toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-GB')}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {gruplanmisOneriler.length > 0 && (
                    <div className="od-glass" style={{ padding: '2.25rem' }}>
                        <h2 className="pg-h2" style={{ marginBottom: '0.6rem' }}>
                            🌱 {lang === 'tr' ? 'Öneriler' : 'Recommendations'}
                        </h2>
                        <p style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                            {lang === 'tr'
                                ? 'Ürünlerinizin mevcut verilerine göre otomatik oluşturulan, kural tabanlı öneriler.'
                                : 'Rule-based suggestions automatically generated from your products\' current data.'}
                        </p>
                        <div>
                            {gruplanmisOneriler.map((oneri, i) => {
                                const renk = oneri.onem === 'yuksek' ? 'var(--error)' : oneri.onem === 'orta' ? 'var(--secondary)' : 'var(--on-surface-variant)';
                                return (
                                    <a key={i} href={'/dogrula/' + oneri.ilkUrunHash}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '0.9rem',
                                            padding: '0.85rem 0', textDecoration: 'none',
                                            borderBottom: i < gruplanmisOneriler.length - 1 ? '1px solid rgba(16,20,21,0.07)' : 'none',
                                        }}
                                    >
                                        <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: renk, flexShrink: 0 }} />
                                        <span style={{ fontSize: '0.9rem', color: 'var(--on-surface)' }}>{oneri.mesaj}</span>
                                    </a>
                                );
                            })}
                        </div>
                    </div>
                )}

            </div>
        </main>
    );
}
