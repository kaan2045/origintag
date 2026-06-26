'use client';
import { useState, useEffect } from 'react';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { useLanguage } from '../context/LanguageContext';

export default function Dashboard() {
    const { t, lang } = useLanguage();
    const [urunler, setUrunler] = useState<any[]>([]);
    const [yukleniyor, setYukleniyor] = useState(true);
    const [kullaniciAd, setKullaniciAd] = useState('');
    const [kullaniciId, setKullaniciId] = useState('');

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

    const cikisYap = () => {
        localStorage.removeItem('kullanici_email');
        localStorage.removeItem('kullanici_id');
        localStorage.removeItem('kullanici_ad');
        window.location.href = '/login';
    };

    const kartlar = [
        { label: lang === 'tr' ? 'Toplam Ürün' : 'Total Products', value: urunler.length.toString(), icon: '📦' },
        { label: lang === 'tr' ? 'Blockchain Kaydı' : 'Blockchain Records', value: urunler.length.toString(), icon: '🔗' },
        { label: lang === 'tr' ? 'QR Tarama' : 'QR Scans', value: '0', icon: '📱' },
        { label: lang === 'tr' ? 'Abonelik' : 'Subscription', value: lang === 'tr' ? 'Başlangıç' : 'Starter', icon: '⭐' },
    ];

    return (
        <main style={{ fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif", fontWeight: 'bold', minHeight: '100vh', background: '#f9f7f4' }}>

            <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', background: '#2D5A27', borderBottom: '1px solid #1a3d18' }}>
                <img src="/origin.png" alt="OriginTag" style={{ height: '50px' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontSize: '0.9rem', color: '#fff' }}>{kullaniciAd}</span>
                    <LanguageSwitcher />
                    <button onClick={cikisYap} style={{ padding: '0.4rem 1rem', border: '1px solid rgba(255,255,255,0.4)', borderRadius: '6px', color: '#fff', background: 'none', cursor: 'pointer', fontSize: '0.85rem' }}>
                        {t('nav.logout')}
                    </button>
                </div>
            </nav>

            <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem' }}>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                    {kartlar.map((k, i) => (
                        <div key={i} style={{ background: '#fff', border: '1px solid #eee', borderRadius: '12px', padding: '1.5rem', textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{k.icon}</div>
                            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#2D5A27' }}>{k.value}</div>
                            <div style={{ fontSize: '0.85rem', color: '#888' }}>{k.label}</div>
                        </div>
                    ))}
                </div>

                <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: '12px', padding: '2rem', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.3rem', color: '#1a1a1a', margin: 0 }}>{t('dashboard.title')}</h2>
                        <button onClick={() => window.location.href = '/urun-ekle'}
                            style={{ padding: '0.6rem 1.2rem', background: '#2D5A27', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                            + {t('dashboard.addNew')}
                        </button>
                    </div>

                    {yukleniyor ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: '#aaa' }}>
                            <p>{lang === 'tr' ? 'Yükleniyor...' : 'Loading...'}</p>
                        </div>
                    ) : urunler.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: '#aaa' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
                            <p>{t('dashboard.noProducts')}</p>
                            <button onClick={() => window.location.href = '/urun-ekle'}
                                style={{ padding: '0.75rem 1.5rem', background: '#2D5A27', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', marginTop: '1rem' }}>
                                {lang === 'tr' ? 'İlk Ürününü Ekle' : 'Add Your First Product'}
                            </button>
                        </div>
                    ) : (
                        <div>
                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: '1rem', padding: '0.75rem 1rem', background: '#f9f7f4', borderRadius: '8px', marginBottom: '0.5rem', fontSize: '0.8rem', color: '#888' }}>
                                <span>{lang === 'tr' ? 'ÜRÜN ADI' : 'PRODUCT NAME'}</span>
                                <span>{lang === 'tr' ? 'TİP' : 'TYPE'}</span>
                                <span>{lang === 'tr' ? 'BÖLGE' : 'REGION'}</span>
                                <span>{lang === 'tr' ? 'MİKTAR' : 'AMOUNT'}</span>
                                <span>{lang === 'tr' ? 'İŞLEM' : 'ACTION'}</span>
                            </div>
                            {urunler.map((urun, i) => (
                                <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: '1rem', padding: '1rem', borderBottom: '1px solid #f0f0f0', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontWeight: 'bold', color: '#1a1a1a' }}>{urun.urun_adi}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#aaa', fontFamily: 'monospace' }}>{urun.hash.slice(0, 16)}...</div>
                                    </div>
                                    <span style={{ fontSize: '0.85rem', color: '#555' }}>{urun.urun_tipi}</span>
                                    <span style={{ fontSize: '0.85rem', color: '#555' }}>{urun.bolge}</span>
                                    <span style={{ fontSize: '0.85rem', color: '#555' }}>{urun.miktar} {urun.birim}</span>
                                    <a href={'/dogrula/' + urun.hash}
                                        style={{ padding: '0.3rem 0.75rem', background: '#EAF3DE', color: '#2D5A27', borderRadius: '6px', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                        {lang === 'tr' ? 'Görüntüle' : 'View'}
                                    </a>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: '12px', padding: '2rem' }}>
                    <h2 style={{ fontSize: '1.3rem', color: '#1a1a1a', marginBottom: '1.5rem' }}>
                        {lang === 'tr' ? 'Son İşlemler' : 'Recent Transactions'}
                    </h2>
                    {urunler.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: '#aaa' }}>
                            <p>{lang === 'tr' ? 'Henüz blockchain kaydı yok.' : 'No blockchain records yet.'}</p>
                        </div>
                    ) : (
                        <div>
                            {urunler.slice(0, 5).map((urun, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid #f0f0f0' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2D5A27' }}></div>
                                        <div>
                                            <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#1a1a1a' }}>{urun.urun_adi}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#aaa' }}>
                                                {lang === 'tr' ? 'Blockchain kaydedildi' : 'Recorded on blockchain'}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: '#888' }}>
                                        {new Date(urun.olusturma_tarihi).toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-GB')}
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
