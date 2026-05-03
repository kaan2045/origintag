'use client';
import { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import jsPDF from 'jspdf';

export default function UrunEkle() {
    const [form, setForm] = useState({
        urunAdi: '', urunTipi: '', bolge: '', hasat: '', miktar: '', birim: 'kg', aciklama: ''
    });
    const [detaylar, setDetaylar] = useState<any>({});
    const [yukleniyor, setYukleniyor] = useState(false);
    const [tamamlandi, setTamamlandi] = useState(false);
    const [hash, setHash] = useState('');
    const [urunAdiSonuc, setUrunAdiSonuc] = useState('');
    const qrRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (tamamlandi && hash && qrRef.current) {
            QRCode.toCanvas(qrRef.current, `https://origintag.com.tr/dogrula/${hash}`, {
                width: 160, margin: 2,
                color: { dark: '#2D5A27', light: '#ffffff' }
            });
        }
    }, [tamamlandi, hash]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setYukleniyor(true);
        try {
            const kullaniciId = localStorage.getItem('kullanici_id');
            const res = await fetch('/api/urun-ekle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...form, kullaniciId, detaylar }),
            });
            const data = await res.json();
            if (data.basari) {
                setHash(data.hash);
                setUrunAdiSonuc(form.urunAdi);
                setYukleniyor(false);
                setTamamlandi(true);
            } else {
                alert('Hata: ' + data.hata);
                setYukleniyor(false);
            }
        } catch {
            alert('Baglanti hatasi!');
            setYukleniyor(false);
        }
    };

    const pdfIndir = () => {
        const canvas = qrRef.current;
        if (!canvas) return;
        const qrImage = canvas.toDataURL('image/png');
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [80, 80] });
        pdf.setFillColor(255, 255, 255);
        pdf.rect(0, 0, 80, 80, 'F');
        pdf.addImage(qrImage, 'PNG', 10, 5, 60, 60);
        pdf.setTextColor(45, 90, 39);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'bold');
        pdf.text('OriginTag', 30, 70);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(6);
        pdf.setTextColor(136, 136, 136);
        pdf.text(urunAdiSonuc, 40, 76, { align: 'center' });
        pdf.save(`${urunAdiSonuc}-qr.pdf`);
    };

    const paylasUrl = `https://origintag.com.tr/dogrula/${hash}`;
    const paylasMetin = `${urunAdiSonuc} urunumun blockchain dogrulamasi: ${paylasUrl}`;

    const zeytinCinsleri = ['Memecik', 'Ayvalik', 'Gemlik', 'Uslu', 'Domat', 'Nizip Yaglik', 'Diger'];

    if (tamamlandi) {
        return (
            <main style={{ fontFamily: 'sans-serif', minHeight: '100vh', background: '#f9f7f4' }}>
                <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', background: '#fff', borderBottom: '1px solid #eee' }}>
                    <img src="/origin.png" alt="OriginTag" style={{ height: '50px' }} />
                    <a href="/dashboard" style={{ color: '#2D5A27', textDecoration: 'none' }}>Dashboard'a Don</a>
                </nav>
                <div style={{ maxWidth: '500px', margin: '3rem auto', textAlign: 'center' }}>
                    <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: '16px', padding: '2.5rem' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
                        <h2 style={{ color: '#2D5A27', marginBottom: '0.5rem' }}>Blockchain'e Kaydedildi!</h2>
                        <p style={{ color: '#888', marginBottom: '1.5rem' }}>{urunAdiSonuc} basariyla zincire eklendi.</p>
                        <div style={{ background: '#f9f7f4', borderRadius: '8px', padding: '1rem', marginBottom: '1rem', textAlign: 'left' }}>
                            <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: '4px' }}>SHA-256 Hash</div>
                            <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#8B6914', wordBreak: 'break-all' }}>{hash}</div>
                        </div>
                        <div style={{ background: '#f9f7f4', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
                            <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: '8px' }}>QR Kod</div>
                            <canvas ref={qrRef} style={{ borderRadius: '8px' }} />
                        </div>
                        <button onClick={pdfIndir} style={{ width: '100%', padding: '0.85rem', background: '#2D5A27', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', marginBottom: '0.75rem', fontWeight: 'bold' }}>
                            PDF Olarak Indir
                        </button>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <div style={{ fontSize: '0.85rem', color: '#888', marginBottom: '0.75rem' }}>Paylas</div>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <a href={'https://wa.me/?text=' + encodeURIComponent(paylasMetin)} target="_blank" style={{ flex: 1, padding: '0.6rem', background: '#25D366', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontSize: '0.85rem', textAlign: 'center' }}>WhatsApp</a>
                                <button onClick={() => { navigator.clipboard.writeText(paylasUrl); alert('Link kopyalandi!'); }} style={{ flex: 1, padding: '0.6rem', background: '#f0f0f0', color: '#333', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>Kopyala</button>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button onClick={() => { setTamamlandi(false); setForm({ urunAdi: '', urunTipi: '', bolge: '', hasat: '', miktar: '', birim: 'kg', aciklama: '' }); setDetaylar({}); }} style={{ flex: 1, padding: '0.75rem', background: 'transparent', color: '#2D5A27', border: '1px solid #2D5A27', borderRadius: '8px', cursor: 'pointer' }}>
                                + Yeni Urun
                            </button>
                            <a href="/dashboard" style={{ flex: 1, padding: '0.75rem', background: '#2D5A27', color: '#fff', borderRadius: '8px', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Dashboard</a>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main style={{ fontFamily: 'sans-serif', minHeight: '100vh', background: '#f9f7f4' }}>
            <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', background: '#fff', borderBottom: '1px solid #eee' }}>
                <img src="/origin.png" alt="OriginTag" style={{ height: '50px' }} />
                <a href="/dashboard" style={{ color: '#2D5A27', textDecoration: 'none' }}>Dashboard'a Don</a>
            </nav>

            <div style={{ maxWidth: '600px', margin: '3rem auto', background: '#fff', borderRadius: '16px', border: '1px solid #eee', padding: '2.5rem' }}>
                <h1 style={{ fontSize: '1.8rem', color: '#1a1a1a', marginBottom: '0.5rem' }}>Yeni Urun Ekle</h1>
                <p style={{ color: '#888', marginBottom: '2rem', fontSize: '0.95rem' }}>Urun bilgilerini gir, blockchain'e kaydet.</p>

                <form onSubmit={handleSubmit}>

                    {/* TEMEL BİLGİLER */}
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ fontSize: '0.85rem', color: '#555', display: 'block', marginBottom: '4px' }}>Urun Adi</label>
                        <input type="text" required placeholder="Mut Sizme Zeytinyagi"
                            value={form.urunAdi} onChange={e => setForm({ ...form, urunAdi: e.target.value })}
                            style={{ width: '100%', padding: '0.6rem 0.8rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.95rem', boxSizing: 'border-box' }}
                        />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ fontSize: '0.85rem', color: '#555', display: 'block', marginBottom: '4px' }}>Urun Tipi</label>
                        <select required value={form.urunTipi} onChange={e => { setForm({ ...form, urunTipi: e.target.value }); setDetaylar({}); }}
                            style={{ width: '100%', padding: '0.6rem 0.8rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.95rem', boxSizing: 'border-box', background: '#fff' }}>
                            <option value="">Seciniz...</option>
                            <option>Zeytinyagi</option>
                            <option>Bal</option>
                            <option>Peynir</option>
                            <option>Sut Urunleri</option>
                            <option>Sebze & Meyve</option>
                            <option>Tahil</option>
                            <option>Diger</option>
                        </select>
                    </div>

                    {/* ZEYTİNYAĞI DETAYLARI */}
                    {form.urunTipi === 'Zeytinyagi' && (
                        <div style={{ background: '#f9f7f4', borderRadius: '12px', padding: '1.25rem', marginBottom: '1rem', border: '1px solid #e8e4dc' }}>
                            <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#2D5A27', marginBottom: '1rem' }}>Uretici Bilgileri</div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                <div>
                                    <label style={{ fontSize: '0.8rem', color: '#666', display: 'block', marginBottom: '3px' }}>Uretici Ad Soyad</label>
                                    <input type="text" placeholder="Ahmet Yilmaz"
                                        value={detaylar.ureticiAd || ''} onChange={e => setDetaylar({ ...detaylar, ureticiAd: e.target.value })}
                                        style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.9rem', boxSizing: 'border-box' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.8rem', color: '#666', display: 'block', marginBottom: '3px' }}>TC Kimlik No</label>
                                    <input type="text" placeholder="12345678901" maxLength={11}
                                        value={detaylar.tc || ''} onChange={e => setDetaylar({ ...detaylar, tc: e.target.value })}
                                        style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.9rem', boxSizing: 'border-box' }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                <div>
                                    <label style={{ fontSize: '0.8rem', color: '#666', display: 'block', marginBottom: '3px' }}>Telefon</label>
                                    <input type="tel" placeholder="0532 000 00 00"
                                        value={detaylar.telefon || ''} onChange={e => setDetaylar({ ...detaylar, telefon: e.target.value })}
                                        style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.9rem', boxSizing: 'border-box' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.8rem', color: '#666', display: 'block', marginBottom: '3px' }}>Koy / Mahalle</label>
                                    <input type="text" placeholder="Gokce Mahallesi"
                                        value={detaylar.koy || ''} onChange={e => setDetaylar({ ...detaylar, koy: e.target.value })}
                                        style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.9rem', boxSizing: 'border-box' }}
                                    />
                                </div>
                            </div>

                            <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#2D5A27', margin: '1rem 0 0.75rem' }}>Bahce / Kadastro Bilgileri</div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                <div>
                                    <label style={{ fontSize: '0.8rem', color: '#666', display: 'block', marginBottom: '3px' }}>Ada No</label>
                                    <input type="text" placeholder="123"
                                        value={detaylar.adaNo || ''} onChange={e => setDetaylar({ ...detaylar, adaNo: e.target.value })}
                                        style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.9rem', boxSizing: 'border-box' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.8rem', color: '#666', display: 'block', marginBottom: '3px' }}>Parsel No</label>
                                    <input type="text" placeholder="45"
                                        value={detaylar.parselNo || ''} onChange={e => setDetaylar({ ...detaylar, parselNo: e.target.value })}
                                        style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.9rem', boxSizing: 'border-box' }}
                                    />
                                </div>
                            </div>

                            <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#2D5A27', margin: '1rem 0 0.75rem' }}>Urun Ozellikleri</div>

                            <div style={{ marginBottom: '0.75rem' }}>
                                <label style={{ fontSize: '0.8rem', color: '#666', display: 'block', marginBottom: '6px' }}>Zeytin Cinsi</label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                    {zeytinCinsleri.map(cins => (
                                        <button key={cins} type="button"
                                            onClick={() => {
                                                const secili = detaylar.zeytinCinsi || [];
                                                const yeni = secili.includes(cins) ? secili.filter((c: string) => c !== cins) : [...secili, cins];
                                                setDetaylar({ ...detaylar, zeytinCinsi: yeni });
                                            }}
                                            style={{
                                                padding: '5px 12px', borderRadius: '20px', border: '1px solid', fontSize: '0.8rem', cursor: 'pointer',
                                                background: (detaylar.zeytinCinsi || []).includes(cins) ? '#2D5A27' : '#fff',
                                                color: (detaylar.zeytinCinsi || []).includes(cins) ? '#fff' : '#555',
                                                borderColor: (detaylar.zeytinCinsi || []).includes(cins) ? '#2D5A27' : '#ddd'
                                            }}>
                                            {cins}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div>
                                    <label style={{ fontSize: '0.8rem', color: '#666', display: 'block', marginBottom: '3px' }}>Cekim Tipi</label>
                                    <select value={detaylar.cekimTipi || ''} onChange={e => setDetaylar({ ...detaylar, cekimTipi: e.target.value })}
                                        style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.9rem', background: '#fff', boxSizing: 'border-box' }}>
                                        <option value="">Seciniz</option>
                                        <option value="soguk">Soguk Sikim</option>
                                        <option value="ikinci">Ikinci Sikim</option>
                                        <option value="rafine">Rafine</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.8rem', color: '#666', display: 'block', marginBottom: '3px' }}>Randiman (%)</label>
                                    <input type="number" placeholder="18"
                                        value={detaylar.randiman || ''} onChange={e => setDetaylar({ ...detaylar, randiman: e.target.value })}
                                        style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.9rem', boxSizing: 'border-box' }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* BAL DETAYLARI */}
                    {form.urunTipi === 'Bal' && (
                        <div style={{ background: '#fdf8e8', borderRadius: '12px', padding: '1.25rem', marginBottom: '1rem', border: '1px solid #f2d88e' }}>
                            <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#8B6914', marginBottom: '1rem' }}>Bal Detaylari</div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                <div>
                                    <label style={{ fontSize: '0.8rem', color: '#666', display: 'block', marginBottom: '3px' }}>Uretici Ad Soyad</label>
                                    <input type="text" placeholder="Ahmet Yilmaz"
                                        value={detaylar.ureticiAd || ''} onChange={e => setDetaylar({ ...detaylar, ureticiAd: e.target.value })}
                                        style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.9rem', boxSizing: 'border-box' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.8rem', color: '#666', display: 'block', marginBottom: '3px' }}>Telefon</label>
                                    <input type="tel" placeholder="0532 000 00 00"
                                        value={detaylar.telefon || ''} onChange={e => setDetaylar({ ...detaylar, telefon: e.target.value })}
                                        style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.9rem', boxSizing: 'border-box' }}
                                    />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div>
                                    <label style={{ fontSize: '0.8rem', color: '#666', display: 'block', marginBottom: '3px' }}>Bal Turu</label>
                                    <select value={detaylar.balTuru || ''} onChange={e => setDetaylar({ ...detaylar, balTuru: e.target.value })}
                                        style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.9rem', background: '#fff', boxSizing: 'border-box' }}>
                                        <option value="">Seciniz</option>
                                        <option>Cicek Bali</option>
                                        <option>Cam Bali</option>
                                        <option>Kestane Bali</option>
                                        <option>Ihlamur Bali</option>
                                        <option>Anzer Bali</option>
                                        <option>Diger</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.8rem', color: '#666', display: 'block', marginBottom: '3px' }}>Arlik Bolgesi</label>
                                    <input type="text" placeholder="Kackar Daglari"
                                        value={detaylar.arlikBolgesi || ''} onChange={e => setDetaylar({ ...detaylar, arlikBolgesi: e.target.value })}
                                        style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.9rem', boxSizing: 'border-box' }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* PEYNIR DETAYLARI */}
                    {form.urunTipi === 'Peynir' && (
                        <div style={{ background: '#faf9f5', borderRadius: '12px', padding: '1.25rem', marginBottom: '1rem', border: '1px solid #e0dbd0' }}>
                            <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#555', marginBottom: '1rem' }}>Peynir Detaylari</div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                <div>
                                    <label style={{ fontSize: '0.8rem', color: '#666', display: 'block', marginBottom: '3px' }}>Uretici Ad Soyad</label>
                                    <input type="text" value={detaylar.ureticiAd || ''} onChange={e => setDetaylar({ ...detaylar, ureticiAd: e.target.value })}
                                        style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.9rem', boxSizing: 'border-box' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.8rem', color: '#666', display: 'block', marginBottom: '3px' }}>Sut Turu</label>
                                    <select value={detaylar.sutTuru || ''} onChange={e => setDetaylar({ ...detaylar, sutTuru: e.target.value })}
                                        style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.9rem', background: '#fff', boxSizing: 'border-box' }}>
                                        <option value="">Seciniz</option>
                                        <option>Inek Sutu</option>
                                        <option>Koyun Sutu</option>
                                        <option>Keci Sutu</option>
                                        <option>Karisim</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', color: '#666', display: 'block', marginBottom: '3px' }}>Olgunlasma Suresi</label>
                                <input type="text" placeholder="3 ay"
                                    value={detaylar.olgunlasma || ''} onChange={e => setDetaylar({ ...detaylar, olgunlasma: e.target.value })}
                                    style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.9rem', boxSizing: 'border-box' }}
                                />
                            </div>
                        </div>
                    )}

                    {/* ORTAK ALANLAR */}
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ fontSize: '0.85rem', color: '#555', display: 'block', marginBottom: '4px' }}>Uretim Bolgesi</label>
                        <input type="text" required placeholder="Mut / Mersin"
                            value={form.bolge} onChange={e => setForm({ ...form, bolge: e.target.value })}
                            style={{ width: '100%', padding: '0.6rem 0.8rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.95rem', boxSizing: 'border-box' }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                        <div>
                            <label style={{ fontSize: '0.85rem', color: '#555', display: 'block', marginBottom: '4px' }}>Hasat Tarihi</label>
                            <input type="date" required value={form.hasat} onChange={e => setForm({ ...form, hasat: e.target.value })}
                                style={{ width: '100%', padding: '0.6rem 0.8rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.95rem', boxSizing: 'border-box' }}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.85rem', color: '#555', display: 'block', marginBottom: '4px' }}>Miktar</label>
                            <div style={{ display: 'flex', gap: '4px' }}>
                                <input type="number" required placeholder="500" value={form.miktar} onChange={e => setForm({ ...form, miktar: e.target.value })}
                                    style={{ flex: 1, padding: '0.6rem 0.8rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.95rem', boxSizing: 'border-box' }}
                                />
                                <select value={form.birim} onChange={e => setForm({ ...form, birim: e.target.value })}
                                    style={{ padding: '0.6rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.9rem', background: '#fff' }}>
                                    <option>kg</option>
                                    <option>lt</option>
                                    <option>adet</option>
                                    <option>ton</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ fontSize: '0.85rem', color: '#555', display: 'block', marginBottom: '4px' }}>Aciklama</label>
                        <textarea placeholder="Ek bilgi..." value={form.aciklama} onChange={e => setForm({ ...form, aciklama: e.target.value })}
                            rows={3} style={{ width: '100%', padding: '0.6rem 0.8rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.95rem', boxSizing: 'border-box', resize: 'none' }}
                        />
                    </div>

                    <button type="submit" disabled={yukleniyor}
                        style={{ width: '100%', padding: '0.85rem', background: yukleniyor ? '#888' : '#2D5A27', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '1rem', cursor: yukleniyor ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}>
                        {yukleniyor ? 'Blockchain\'e Kaydediliyor...' : 'Blockchain\'e Kaydet & QR Olustur'}
                    </button>
                </form>
            </div>
        </main>
    );
}