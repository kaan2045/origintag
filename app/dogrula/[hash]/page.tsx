'use client';
import { useState, useEffect, use } from 'react';

export default function DogrulamaPage({ params }: { params: Promise<{ hash: string }> }) {
    const { hash } = use(params);
    const [urun, setUrun] = useState<any>(null);
    const [yukleniyor, setYukleniyor] = useState(true);
    const [bulunamadi, setBulunamadi] = useState(false);

    useEffect(() => {
        fetch(`/api/urun-dogrula/${hash}`)
            .then(res => res.json())
            .then(data => {
                if (data.basari) {
                    setUrun(data.urun);
                } else {
                    setBulunamadi(true);
                }
                setYukleniyor(false);
            })
            .catch(() => { setBulunamadi(true); setYukleniyor(false); });
    }, [hash]);

    if (yukleniyor) {
        return (
            <main style={{ fontFamily: 'sans-serif', minHeight: '100vh', background: '#f9f7f4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
                    <p style={{ color: '#888' }}>Blockchain'de dogrulanıyor...</p>
                </div>
            </main>
        );
    }

    if (bulunamadi) {
        return (
            <main style={{ fontFamily: 'sans-serif', minHeight: '100vh', background: '#f9f7f4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center', background: '#fff', padding: '3rem', borderRadius: '16px', border: '1px solid #eee' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
                    <h2 style={{ color: '#c0392b' }}>Urun Bulunamadi</h2>
                    <p style={{ color: '#888' }}>Bu QR kod gecersiz veya kayit bulunamadi.</p>
                </div>
            </main>
        );
    }

    return (
        <main style={{ fontFamily: 'sans-serif', minHeight: '100vh', background: '#f9f7f4' }}>

            <nav style={{ background: '#2D5A27', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <img src="/origin.png" alt="OriginTag" style={{ height: '45px' }} />
                <div style={{ background: '#fff', color: '#2D5A27', padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                    ✓ Blockchain Dogrulandi
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
                        <div style={{ fontWeight: 'bold', color: '#2D5A27', marginBottom: '4px' }}>Blockchain'de Kayitli</div>
                        <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#3B6D11', wordBreak: 'break-all' }}>{hash}</div>
                    </div>
                </div>

                <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.1rem', color: '#1a1a1a', marginBottom: '1.25rem', borderBottom: '1px solid #eee', paddingBottom: '0.75rem' }}>Uretim Bilgileri</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                        {[
                            { etiket: 'Urun Adi', deger: urun.urun_adi },
                            { etiket: 'Urun Tipi', deger: urun.urun_tipi },
                            { etiket: 'Uretim Bolgesi', deger: urun.bolge },
                            { etiket: 'Hasat Tarihi', deger: urun.hasat_tarihi ? new Date(urun.hasat_tarihi).toLocaleDateString('tr-TR') : '-' },
                            { etiket: 'Miktar', deger: `${urun.miktar} ${urun.birim}` },
                            { etiket: 'Kayit Tarihi', deger: new Date(urun.olusturma_tarihi).toLocaleDateString('tr-TR') },
                        ].map((b, i) => (
                            <div key={i}>
                                <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: '2px' }}>{b.etiket}</div>
                                <div style={{ fontWeight: 'bold', color: '#1a1a1a' }}>{b.deger || '-'}</div>
                            </div>
                        ))}
                    </div>
                    {urun.aciklama && (
                        <div style={{ marginTop: '1.25rem', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
                            <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: '4px' }}>Aciklama</div>
                            <div style={{ color: '#333', lineHeight: 1.6 }}>{urun.aciklama}</div>
                        </div>
                    )}
                </div>

                <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.1rem', color: '#1a1a1a', marginBottom: '1.25rem', borderBottom: '1px solid #eee', paddingBottom: '0.75rem' }}>Uretim Sureci</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        {[
                            { baslik: 'Hasat', emoji: '🌿' },
                            { baslik: 'Islem', emoji: '⚙️' },
                            { baslik: 'Kalite Testi', emoji: '🔬' },
                            { baslik: 'Ambalaj', emoji: '📦' },
                        ].map((v, i) => (
                            <div key={i} style={{ background: '#f9f7f4', borderRadius: '8px', padding: '1rem', textAlign: 'center', border: '1px dashed #ddd' }}>
                                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{v.emoji}</div>
                                <div style={{ fontSize: '0.85rem', color: '#555', fontWeight: 'bold' }}>{v.baslik}</div>
                                <div style={{ fontSize: '0.75rem', color: '#aaa', marginTop: '4px' }}>Video eklenecek</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.1rem', color: '#1a1a1a', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.75rem' }}>Uretici Hakkinda</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#EAF3DE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>🌿</div>
                        <div>
                            <div style={{ fontWeight: 'bold', color: '#1a1a1a' }}>{urun.bolge} Ureticisi</div>
                            <div style={{ fontSize: '0.85rem', color: '#888' }}>OriginTag Dogrulandi Uretici</div>
                        </div>
                    </div>
                </div>

                <div style={{ textAlign: 'center', padding: '1rem' }}>
                    <img src="/origin.png" alt="OriginTag" style={{ height: '35px', marginBottom: '0.5rem' }} />
                    <p style={{ fontSize: '0.8rem', color: '#aaa' }}>Bu urun OriginTag blockchain sistemi ile dogrulandi.</p>
                    <p style={{ fontSize: '0.75rem', color: '#bbb' }}>origintag.com</p>
                </div>

            </div>
        </main>
    );
}