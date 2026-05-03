'use client';
import { useState, useEffect } from 'react';

export default function Dashboard() {
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

    return (
        <main style={{ fontFamily: 'sans-serif', minHeight: '100vh', background: '#f9f7f4' }}>

            <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', background: '#fff', borderBottom: '1px solid #eee' }}>
                <img src="/origin.png" alt="OriginTag" style={{ height: '50px' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontSize: '0.9rem', color: '#555' }}>{kullaniciAd}</span>
                    <button onClick={cikisYap} style={{ padding: '0.4rem 1rem', border: '1px solid #ddd', borderRadius: '6px', color: '#888', background: 'none', cursor: 'pointer', fontSize: '0.85rem' }}>Cikis</button>
                </div>
            </nav>

            <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem' }}>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                    {[
                        { label: 'Toplam Urun', value: urunler.length.toString(), icon: '📦' },
                        { label: 'Blockchain Kaydi', value: urunler.length.toString(), icon: '🔗' },
                        { label: 'QR Tarama', value: '0', icon: '📱' },
                        { label: 'Abonelik', value: 'Baslangic', icon: '⭐' },
                    ].map((k, i) => (
                        <div key={i} style={{ background: '#fff', border: '1px solid #eee', borderRadius: '12px', padding: '1.5rem', textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{k.icon}</div>
                            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#2D5A27' }}>{k.value}</div>
                            <div style={{ fontSize: '0.85rem', color: '#888' }}>{k.label}</div>
                        </div>
                    ))}
                </div>

                <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: '12px', padding: '2rem', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.3rem', color: '#1a1a1a', margin: 0 }}>Urunlerim</h2>
                        <button onClick={() => window.location.href = '/urun-ekle'}
                            style={{ padding: '0.6rem 1.2rem', background: '#2D5A27', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                            + Yeni Urun Ekle
                        </button>
                    </div>

                    {yukleniyor ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: '#aaa' }}>
                            <p>Yukleniyor...</p>
                        </div>
                    ) : urunler.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: '#aaa' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
                            <p>Henuz urun eklenmedi.</p>
                            <button onClick={() => window.location.href = '/urun-ekle'}
                                style={{ padding: '0.75rem 1.5rem', background: '#2D5A27', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', marginTop: '1rem' }}>
                                Ilk Urununu Ekle
                            </button>
                        </div>
                    ) : (
                        <div>
                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: '1rem', padding: '0.75rem 1rem', background: '#f9f7f4', borderRadius: '8px', marginBottom: '0.5rem', fontSize: '0.8rem', color: '#888' }}>
                                <span>URUN ADI</span>
                                <span>TIP</span>
                                <span>BOLGE</span>
                                <span>MIKTAR</span>
                                <span>ISLEM</span>
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
                                        Goruntule
                                    </a>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: '12px', padding: '2rem' }}>
                    <h2 style={{ fontSize: '1.3rem', color: '#1a1a1a', marginBottom: '1.5rem' }}>Son Islemler</h2>
                    {urunler.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: '#aaa' }}>
                            <p>Henuz blockchain kaydi yok.</p>
                        </div>
                    ) : (
                        <div>
                            {urunler.slice(0, 5).map((urun, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid #f0f0f0' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2D5A27' }}></div>
                                        <div>
                                            <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#1a1a1a' }}>{urun.urun_adi}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#aaa' }}>Blockchain kaydedildi</div>
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: '#888' }}>
                                        {new Date(urun.olusturma_tarihi).toLocaleDateString('tr-TR')}
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