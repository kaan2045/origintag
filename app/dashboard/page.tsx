'use client';
import { useState, useEffect } from 'react';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { useLanguage } from '../context/LanguageContext';

export default function Dashboard() {
    const { t, lang } = useLanguage();
    const [urunler, setUrunler] = useState<any[]>([]);
    const [taramalar, setTaramalar] = useState<any[]>([]);
    const [yukleniyor, setYukleniyor] = useState(true);
    const [kullaniciAd, setKullaniciAd] = useState('');
    const [kullaniciId, setKullaniciId] = useState('');
    const [secilenUrun, setSecilenUrun] = useState<string>('');

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

        fetch('/api/taramalarim?kullanici_id=' + id)
            .then(res => res.json())
            .then(data => {
                if (data.basari) setTaramalar(data.taramalar);
            })
            .catch(() => { });
    }, []);

    const cikisYap = () => {
        localStorage.removeItem('kullanici_email');
        localStorage.removeItem('kullanici_id');
        localStorage.removeItem('kullanici_ad');
        window.location.href = '/login';
    };

    const supheliTaramalar = taramalar.filter(t => t.supheli);

    const kartlar = [
        { label: lang === 'tr' ? 'Toplam Ürün' : 'Total Products', value: urunler.length.toString(), icon: '📦' },
        { label: lang === 'tr' ? 'Blockchain Kaydı' : 'Blockchain Records', value: urunler.length.toString(), icon: '🔗' },
        { label: lang === 'tr' ? 'QR Tarama' : 'QR Scans', value: taramalar.length.toString(), icon: '📱' },
        {
            label: lang === 'tr' ? 'Şüpheli Aktivite' : 'Suspicious Activity',
            value: supheliTaramalar.length.toString(),
            icon: '⚠️',
            uyari: supheliTaramalar.length > 0,
        },
    ];

    const filtrelenmisTaramalar = secilenUrun
        ? taramalar.filter(t => t.urun_hash === secilenUrun)
        : taramalar;

    return (
        <main style={{ minHeight: '100vh', background: 'var(--parchment)' }}>

            <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.1rem 2rem', background: 'var(--ink)', borderBottom: '1px solid #33301f' }}>
                <img src="/origin.png" alt="OriginTag" style={{ height: '34px', filter: 'brightness(0) invert(1)', opacity: 0.92 }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontSize: '0.88rem', color: '#eee9d8' }}>{kullaniciAd}</span>
                    <LanguageSwitcher />
                    <button onClick={cikisYap} style={{ padding: '0.4rem 1rem', border: '1px solid rgba(255,255,255,0.25)', borderRadius: '6px', color: '#eee9d8', background: 'none', cursor: 'pointer', fontSize: '0.85rem' }}>
                        {t('nav.logout')}
                    </button>
                </div>
            </nav>

            <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem' }}>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                    {kartlar.map((k, i) => (
                        <div key={i} style={{
                            background: '#fff',
                            border: k.uyari ? '1px solid #e8a33d' : '1px solid #eee',
                            borderRadius: '16px',
                            padding: '1.5rem',
                            textAlign: 'center',
                        }}>
                            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{k.icon}</div>
                            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: k.uyari ? '#c2790f' : '#2D5A27' }}>{k.value}</div>
                            <div style={{ fontSize: '0.85rem', color: '#888' }}>{k.label}</div>
                        </div>
                    ))}
                </div>

                <div style={{ background: '#fff', border: '1px solid #ece6d8', borderRadius: '16px', padding: '2rem', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2 className="font-display" style={{ fontSize: '1.3rem', fontWeight: 600, color: 'var(--ink)', margin: 0 }}>{t('dashboard.title')}</h2>
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
                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: '1rem', padding: '0.75rem 1rem', background: 'var(--parchment)', borderRadius: '8px', marginBottom: '0.5rem', fontSize: '0.8rem', color: '#888' }}>
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

                <div style={{ background: '#fff', border: '1px solid #ece6d8', borderRadius: '16px', padding: '2rem' }}>
                    <h2 className="font-display" style={{ fontSize: '1.3rem', fontWeight: 600, color: 'var(--ink)', marginBottom: '1.5rem' }}>
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

                {supheliTaramalar.length > 0 && (
                    <div style={{ background: '#FDF3E3', border: '1px solid #e8a33d', borderRadius: '16px', padding: '2rem', marginBottom: '2rem' }}>
                        <h2 className="font-display" style={{ fontSize: '1.3rem', fontWeight: 600, color: '#a86a0a', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            ⚠️ {lang === 'tr' ? 'Şüpheli Tarama Aktivitesi' : 'Suspicious Scan Activity'}
                        </h2>
                        <p style={{ fontSize: '0.85rem', color: '#9c6a17', marginBottom: '1.5rem' }}>
                            {lang === 'tr'
                                ? 'Bu taramalar, normal kullanım örüntüsünden saptığı için otomatik olarak işaretlendi. Konum tespiti VPN/proxy kullanımında hatalı sonuç verebilir, bu nedenle her işaret kesin bir sahtecilik kanıtı değil, incelenmesi gereken bir sinyaldir.'
                                : 'These scans were automatically flagged for deviating from normal usage patterns. Location detection can be inaccurate with VPN/proxy use, so each flag is a signal to investigate, not definitive proof of counterfeiting.'}
                        </p>
                        <div>
                            {supheliTaramalar.slice(0, 20).map((tarama, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: i < supheliTaramalar.length - 1 ? '1px solid #f3e0bb' : 'none', gap: '1rem' }}>
                                    <div>
                                        <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#1a1a1a' }}>
                                            {tarama.urun_adi}
                                            <span style={{
                                                marginLeft: '0.6rem',
                                                fontSize: '0.7rem',
                                                fontWeight: 'normal',
                                                color: '#a86a0a',
                                                background: '#fff',
                                                border: '1px solid #e8a33d',
                                                borderRadius: '999px',
                                                padding: '0.1rem 0.6rem',
                                            }}>
                                                {tarama.supheli_tip === 'imkansiz_hiz'
                                                    ? (lang === 'tr' ? 'İmkansız Hız' : 'Impossible Speed')
                                                    : (lang === 'tr' ? 'Yüksek Frekans' : 'High Frequency')}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: '#9c6a17', marginTop: '0.2rem' }}>
                                            {tarama.supheli_detay}
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: '#a86a0a', whiteSpace: 'nowrap' }}>
                                        {new Date(tarama.tarama_tarihi).toLocaleString(lang === 'tr' ? 'tr-TR' : 'en-GB', {
                                            day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div style={{ background: '#fff', border: '1px solid #ece6d8', borderRadius: '16px', padding: '2rem', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                        <h2 className="font-display" style={{ fontSize: '1.3rem', fontWeight: 600, color: 'var(--ink)', margin: 0 }}>
                            {lang === 'tr' ? 'Son Taramalar' : 'Recent Scans'}
                        </h2>
                        {urunler.length > 0 && (
                            <select value={secilenUrun} onChange={e => setSecilenUrun(e.target.value)}
                                style={{ padding: '0.5rem 0.75rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.85rem', background: '#fff' }}>
                                <option value="">{lang === 'tr' ? 'Tüm Ürünler' : 'All Products'}</option>
                                {urunler.map((u, i) => (
                                    <option key={i} value={u.hash}>{u.urun_adi}</option>
                                ))}
                            </select>
                        )}
                    </div>

                    {filtrelenmisTaramalar.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: '#aaa' }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📱</div>
                            <p>{lang === 'tr' ? 'Henüz QR taraması yapılmadı.' : 'No QR scans yet.'}</p>
                        </div>
                    ) : (
                        <div>
                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr', gap: '1rem', padding: '0.75rem 1rem', background: 'var(--parchment)', borderRadius: '8px', marginBottom: '0.5rem', fontSize: '0.8rem', color: '#888' }}>
                                <span>{lang === 'tr' ? 'ÜRÜN' : 'PRODUCT'}</span>
                                <span>{lang === 'tr' ? 'KONUM' : 'LOCATION'}</span>
                                <span>{lang === 'tr' ? 'CİHAZ' : 'DEVICE'}</span>
                                <span>{lang === 'tr' ? 'TARİH & SAAT' : 'DATE & TIME'}</span>
                            </div>
                            {filtrelenmisTaramalar.slice(0, 50).map((tarama, i) => (
                                <div key={i} style={{
                                    display: 'grid',
                                    gridTemplateColumns: '2fr 1.5fr 1fr 1fr',
                                    gap: '1rem',
                                    padding: '0.75rem 1rem',
                                    borderBottom: '1px solid #f0f0f0',
                                    alignItems: 'center',
                                    background: tarama.supheli ? '#FDF3E3' : 'transparent',
                                    borderLeft: tarama.supheli ? '3px solid #e8a33d' : '3px solid transparent',
                                }}
                                    title={tarama.supheli ? tarama.supheli_detay : undefined}
                                >
                                    <div style={{ fontWeight: 'bold', color: '#1a1a1a', fontSize: '0.9rem' }}>
                                        {tarama.supheli && <span style={{ marginRight: '0.4rem' }}>⚠️</span>}
                                        {tarama.urun_adi}
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: '#555' }}>
                                        {tarama.ilce || tarama.sehir
                                            ? `📍 ${[tarama.ilce, tarama.sehir].filter(Boolean).join(', ')}`
                                            : (lang === 'tr' ? 'Bilinmiyor' : 'Unknown')}
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: '#555' }}>
                                        {tarama.cihaz_tipi === 'Mobil' ? '📱' : '💻'} {tarama.cihaz_tipi}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: '#888' }}>
                                        {new Date(tarama.tarama_tarihi).toLocaleString(lang === 'tr' ? 'tr-TR' : 'en-GB', {
                                            day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                        })}
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
