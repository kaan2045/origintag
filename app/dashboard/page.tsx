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
        { label: lang === 'tr' ? 'Toplam Ürün' : 'Total Products', value: urunler.length.toString() },
        { label: lang === 'tr' ? 'Blockchain Kaydı' : 'Blockchain Records', value: urunler.length.toString() },
        { label: lang === 'tr' ? 'QR Tarama' : 'QR Scans', value: taramalar.length.toString() },
        {
            label: lang === 'tr' ? 'Şüpheli Aktivite' : 'Suspicious Activity',
            value: supheliTaramalar.length.toString(),
            uyari: supheliTaramalar.length > 0,
        },
    ];

    const filtrelenmisTaramalar = secilenUrun
        ? taramalar.filter(t => t.urun_hash === secilenUrun)
        : taramalar;

    return (
        <main style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--cream)' }}>

            <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.4rem 2.5rem', borderBottom: '1px solid var(--line)' }}>
                <img src="/origin.png" alt="OriginTag" style={{ height: '28px', filter: 'brightness(0) invert(1)', opacity: 0.92 }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <span style={{ fontSize: '0.88rem', color: 'var(--cream-dim)' }}>{kullaniciAd}</span>
                    <LanguageSwitcher />
                    <button onClick={cikisYap} className="ot-btn-outline" style={{ padding: '0.45rem 1.1rem', fontSize: '0.8rem' }}>
                        {t('nav.logout')}
                    </button>
                </div>
            </nav>

            <div style={{ maxWidth: '1140px', margin: '0 auto', padding: '3rem 2rem' }}>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: 'var(--line)', border: '1px solid var(--line)', marginBottom: '3rem' }}>
                    {kartlar.map((k, i) => (
                        <div key={i} style={{
                            background: k.uyari ? 'rgba(201,138,18,0.06)' : 'var(--bg)',
                            padding: '2rem 1.5rem',
                            textAlign: 'center',
                        }}>
                            <div className="font-display" style={{ fontSize: '2.4rem', fontWeight: 500, color: k.uyari ? '#d99a3a' : 'var(--gold)' }}>{k.value}</div>
                            <div className="mono-label" style={{ fontSize: '0.66rem', color: 'var(--cream-faint)', marginTop: '0.5rem' }}>{k.label}</div>
                        </div>
                    ))}
                </div>

                <div style={{ border: '1px solid var(--line)', padding: '2.25rem', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
                        <h2 className="font-display" style={{ fontSize: '1.35rem', fontWeight: 500, color: 'var(--cream)', margin: 0 }}>{t('dashboard.title')}</h2>
                        <button onClick={() => window.location.href = '/urun-ekle'} className="ot-btn-solid" style={{ padding: '0.6rem 1.3rem', fontSize: '0.85rem' }}>
                            + {t('dashboard.addNew')}
                        </button>
                    </div>

                    {yukleniyor ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--cream-faint)' }}>
                            <p>{lang === 'tr' ? 'Yükleniyor...' : 'Loading...'}</p>
                        </div>
                    ) : urunler.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem' }}>
                            <p style={{ color: 'var(--cream-faint)', marginBottom: '1.25rem' }}>{t('dashboard.noProducts')}</p>
                            <button onClick={() => window.location.href = '/urun-ekle'} className="ot-btn-outline">
                                {lang === 'tr' ? 'İlk Ürününü Ekle' : 'Add Your First Product'}
                            </button>
                        </div>
                    ) : (
                        <div>
                            <div className="mono-label" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: '1rem', padding: '0 0 0.9rem', borderBottom: '1px solid var(--line-strong)', marginBottom: '0.25rem', fontSize: '0.64rem', color: 'var(--cream-faint)' }}>
                                <span>{lang === 'tr' ? 'ÜRÜN ADI' : 'PRODUCT NAME'}</span>
                                <span>{lang === 'tr' ? 'TİP' : 'TYPE'}</span>
                                <span>{lang === 'tr' ? 'BÖLGE' : 'REGION'}</span>
                                <span>{lang === 'tr' ? 'MİKTAR' : 'AMOUNT'}</span>
                                <span>{lang === 'tr' ? 'İŞLEM' : 'ACTION'}</span>
                            </div>
                            {urunler.map((urun, i) => (
                                <div key={i} className="ot-row-hover" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: '1rem', padding: '1.1rem 0', borderBottom: '1px solid var(--line)', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontWeight: 600, color: 'var(--cream)' }}>{urun.urun_adi}</div>
                                        <div style={{ fontSize: '0.72rem', color: 'var(--cream-faint)', fontFamily: 'var(--font-mono), monospace' }}>{urun.hash.slice(0, 16)}...</div>
                                    </div>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--cream-dim)' }}>{urun.urun_tipi}</span>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--cream-dim)' }}>{urun.bolge}</span>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--cream-dim)' }}>{urun.miktar} {urun.birim}</span>
                                    <a href={'/dogrula/' + urun.hash} className="ot-link-gold mono-label"
                                        style={{ fontSize: '0.68rem', letterSpacing: '0.08em' }}>
                                        {lang === 'tr' ? 'Görüntüle →' : 'View →'}
                                    </a>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div style={{ border: '1px solid var(--line)', padding: '2.25rem', marginBottom: '2rem' }}>
                    <h2 className="font-display" style={{ fontSize: '1.35rem', fontWeight: 500, color: 'var(--cream)', marginBottom: '1.75rem' }}>
                        {lang === 'tr' ? 'Son İşlemler' : 'Recent Transactions'}
                    </h2>
                    {urunler.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--cream-faint)' }}>
                            <p>{lang === 'tr' ? 'Henüz blockchain kaydı yok.' : 'No blockchain records yet.'}</p>
                        </div>
                    ) : (
                        <div>
                            {urunler.slice(0, 5).map((urun, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.9rem 0', borderBottom: '1px solid var(--line)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
                                        <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--gold)' }}></div>
                                        <div>
                                            <div style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--cream)' }}>{urun.urun_adi}</div>
                                            <div style={{ fontSize: '0.74rem', color: 'var(--cream-faint)' }}>
                                                {lang === 'tr' ? 'Blockchain kaydedildi' : 'Recorded on blockchain'}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--cream-faint)' }}>
                                        {new Date(urun.olusturma_tarihi).toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-GB')}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {supheliTaramalar.length > 0 && (
                    <div style={{ border: '1px solid rgba(201,138,18,0.4)', background: 'rgba(201,138,18,0.05)', padding: '2.25rem', marginBottom: '2rem' }}>
                        <h2 className="font-display" style={{ fontSize: '1.35rem', fontWeight: 500, color: '#d99a3a', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            ⚠ {lang === 'tr' ? 'Şüpheli Tarama Aktivitesi' : 'Suspicious Scan Activity'}
                        </h2>
                        <p style={{ fontSize: '0.85rem', color: '#c2a06a', marginBottom: '1.75rem', lineHeight: 1.65, fontWeight: 300 }}>
                            {lang === 'tr'
                                ? 'Bu taramalar, normal kullanım örüntüsünden saptığı için otomatik olarak işaretlendi. Konum tespiti VPN/proxy kullanımında hatalı sonuç verebilir, bu nedenle her işaret kesin bir sahtecilik kanıtı değil, incelenmesi gereken bir sinyaldir.'
                                : 'These scans were automatically flagged for deviating from normal usage patterns. Location detection can be inaccurate with VPN/proxy use, so each flag is a signal to investigate, not definitive proof of counterfeiting.'}
                        </p>
                        <div>
                            {supheliTaramalar.slice(0, 20).map((tarama, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.9rem 0', borderBottom: i < supheliTaramalar.length - 1 ? '1px solid rgba(201,138,18,0.22)' : 'none', gap: '1rem' }}>
                                    <div>
                                        <div style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--cream)' }}>
                                            {tarama.urun_adi}
                                            <span className="mono-label" style={{
                                                marginLeft: '0.7rem',
                                                fontSize: '0.6rem',
                                                fontWeight: 500,
                                                color: '#d99a3a',
                                                border: '1px solid rgba(201,138,18,0.5)',
                                                borderRadius: '999px',
                                                padding: '0.15rem 0.65rem',
                                            }}>
                                                {tarama.supheli_tip === 'imkansiz_hiz'
                                                    ? (lang === 'tr' ? 'İmkansız Hız' : 'Impossible Speed')
                                                    : (lang === 'tr' ? 'Yüksek Frekans' : 'High Frequency')}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: '#c2a06a', marginTop: '0.25rem' }}>
                                            {tarama.supheli_detay}
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: '#c2a06a', whiteSpace: 'nowrap' }}>
                                        {new Date(tarama.tarama_tarihi).toLocaleString(lang === 'tr' ? 'tr-TR' : 'en-GB', {
                                            day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div style={{ border: '1px solid var(--line)', padding: '2.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
                        <h2 className="font-display" style={{ fontSize: '1.35rem', fontWeight: 500, color: 'var(--cream)', margin: 0 }}>
                            {lang === 'tr' ? 'Son Taramalar' : 'Recent Scans'}
                        </h2>
                        {urunler.length > 0 && (
                            <select value={secilenUrun} onChange={e => setSecilenUrun(e.target.value)}
                                style={{ padding: '0.55rem 0.8rem', border: '1px solid var(--line-strong)', fontSize: '0.85rem', background: 'var(--bg)', color: 'var(--cream)' }}>
                                <option value="">{lang === 'tr' ? 'Tüm Ürünler' : 'All Products'}</option>
                                {urunler.map((u, i) => (
                                    <option key={i} value={u.hash}>{u.urun_adi}</option>
                                ))}
                            </select>
                        )}
                    </div>

                    {filtrelenmisTaramalar.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--cream-faint)' }}>
                            <p>{lang === 'tr' ? 'Henüz QR taraması yapılmadı.' : 'No QR scans yet.'}</p>
                        </div>
                    ) : (
                        <div>
                            <div className="mono-label" style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr', gap: '1rem', padding: '0 0 0.9rem', borderBottom: '1px solid var(--line-strong)', marginBottom: '0.25rem', fontSize: '0.64rem', color: 'var(--cream-faint)' }}>
                                <span>{lang === 'tr' ? 'ÜRÜN' : 'PRODUCT'}</span>
                                <span>{lang === 'tr' ? 'KONUM' : 'LOCATION'}</span>
                                <span>{lang === 'tr' ? 'CİHAZ' : 'DEVICE'}</span>
                                <span>{lang === 'tr' ? 'TARİH & SAAT' : 'DATE & TIME'}</span>
                            </div>
                            {filtrelenmisTaramalar.slice(0, 50).map((tarama, i) => (
                                <div key={i} className="ot-row-hover" style={{
                                    display: 'grid',
                                    gridTemplateColumns: '2fr 1.5fr 1fr 1fr',
                                    gap: '1rem',
                                    padding: '0.9rem 0.75rem',
                                    borderBottom: '1px solid var(--line)',
                                    alignItems: 'center',
                                    background: tarama.supheli ? 'rgba(201,138,18,0.05)' : 'transparent',
                                    borderLeft: tarama.supheli ? '2px solid #d99a3a' : '2px solid transparent',
                                }}
                                    title={tarama.supheli ? tarama.supheli_detay : undefined}
                                >
                                    <div style={{ fontWeight: 600, color: 'var(--cream)', fontSize: '0.9rem' }}>
                                        {tarama.supheli && <span style={{ marginRight: '0.4rem' }}>⚠</span>}
                                        {tarama.urun_adi}
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--cream-dim)' }}>
                                        {tarama.ilce || tarama.sehir
                                            ? `${[tarama.ilce, tarama.sehir].filter(Boolean).join(', ')}`
                                            : (lang === 'tr' ? 'Bilinmiyor' : 'Unknown')}
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--cream-dim)' }}>
                                        {tarama.cihaz_tipi}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--cream-faint)' }}>
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
