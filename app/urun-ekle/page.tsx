'use client';
import { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import jsPDF from 'jspdf';
import { upload } from '@vercel/blob/client';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { useLanguage } from '../context/LanguageContext';

export default function UrunEkle() {
    const { lang } = useLanguage();
    const [form, setForm] = useState({
        urunAdi: '', urunTipi: '', bolge: '', hasat: '', miktar: '', birim: 'kg', aciklama: ''
    });
    const [detaylar, setDetaylar] = useState<any>({});
    const [yukleniyor, setYukleniyor] = useState(false);
    const [tamamlandi, setTamamlandi] = useState(false);
    const [hash, setHash] = useState('');
    const [urunAdiSonuc, setUrunAdiSonuc] = useState('');
    const qrRef = useRef<HTMLCanvasElement>(null);
    const [medyaDosyalar, setMedyaDosyalar] = useState<File[]>([]);
    const [medyaOnizleme, setMedyaOnizleme] = useState<string[]>([]);
    const [medyaYukleniyor, setMedyaYukleniyor] = useState(false);

    useEffect(() => {
        if (tamamlandi && hash && qrRef.current) {
            QRCode.toCanvas(qrRef.current, `https://origintag.com.tr/dogrula/${hash}`, {
                width: 160, margin: 2,
                color: { dark: '#101415', light: '#e0e3e5' }
            });
        }
    }, [tamamlandi, hash]);

    const handleMedyaSec = (e: React.ChangeEvent<HTMLInputElement>) => {
        const secilen = Array.from(e.target.files || []);
        if (medyaDosyalar.length + secilen.length > 10) {
            alert(lang === 'tr' ? 'En fazla 10 dosya yükleyebilirsiniz.' : 'You can upload up to 10 files.');
            return;
        }
        const yeniDosyalar = [...medyaDosyalar, ...secilen];
        setMedyaDosyalar(yeniDosyalar);
        const yeniOnizlemeler = secilen.map(f => URL.createObjectURL(f));
        setMedyaOnizleme(prev => [...prev, ...yeniOnizlemeler]);
    };

    const medyaSil = (index: number) => {
        setMedyaDosyalar(prev => prev.filter((_, i) => i !== index));
        setMedyaOnizleme(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setYukleniyor(true);
        try {
            const kullaniciId = localStorage.getItem('kullanici_id');

            // Önce medya dosyalarını tarayıcıdan doğrudan Vercel Blob'a yükle
            // (sunucu sadece /api/medya-yukle üzerinden token üretir, dosya baytları sunucuya uğramaz)
            let medyaUrls: string[] = [];
            if (medyaDosyalar.length > 0) {
                setMedyaYukleniyor(true);
                try {
                    medyaUrls = await Promise.all(
                        medyaDosyalar.map(async (dosya) => {
                            const dosyaAdi = `urunler/${Date.now()}-${Math.random().toString(36).slice(2)}-${dosya.name}`;
                            const blob = await upload(dosyaAdi, dosya, {
                                access: 'public',
                                handleUploadUrl: '/api/medya-yukle',
                            });
                            return blob.url;
                        })
                    );
                } catch (err) {
                    const message = err instanceof Error ? err.message : 'Bilinmeyen hata';
                    alert((lang === 'tr' ? 'Medya yükleme hatası: ' : 'Media upload error: ') + message);
                    setMedyaYukleniyor(false);
                    setYukleniyor(false);
                    return;
                }
                setMedyaYukleniyor(false);
            }

            const res = await fetch('/api/urun-ekle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...form, kullaniciId, detaylar, medyaUrls }),
            });
            const data = await res.json();
            if (data.basari) {
                setHash(data.hash);
                setUrunAdiSonuc(form.urunAdi);
                setYukleniyor(false);
                setTamamlandi(true);
            } else {
                alert((lang === 'tr' ? 'Hata: ' : 'Error: ') + data.hata);
                setYukleniyor(false);
            }
        } catch {
            alert(lang === 'tr' ? 'Bağlantı hatası!' : 'Connection error!');
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
    const paylasMetin = lang === 'tr'
        ? `${urunAdiSonuc} ürünümün blockchain doğrulaması: ${paylasUrl}`
        : `Blockchain verification for ${urunAdiSonuc}: ${paylasUrl}`;

    const zeytinCinsleri = ['Memecik', 'Ayvalık', 'Gemlik', 'Uslu', 'Domat', 'Nizip Yağlık', lang === 'tr' ? 'Diğer' : 'Other'];

    const navbar = (
        <div style={{ position: 'sticky', top: '1.25rem', zIndex: 50, display: 'flex', justifyContent: 'center', padding: '0 1.5rem' }}>
            <nav className="od-navbar" style={{ width: '100%', maxWidth: 'var(--container-max)' }}>
                <a href="/dashboard"><img src="/origin.png" alt="OriginTag" style={{ height: '26px', filter: 'brightness(0) invert(1)', opacity: 0.92 }} /></a>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <a href="/dashboard" className="od-btn-ghost">
                        {lang === 'tr' ? "Dashboard'a Dön" : 'Back to Dashboard'}
                    </a>
                    <LanguageSwitcher />
                </div>
            </nav>
        </div>
    );

    const subPanelStyle: React.CSSProperties = {
        background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)',
        padding: '1.4rem', marginBottom: '1.25rem', border: '1px solid var(--outline-variant)',
    };
    const subHeadingStyle: React.CSSProperties = {
        fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700,
        color: 'var(--secondary)', marginBottom: '1.1rem',
    };
    const fieldLabelStyle: React.CSSProperties = {
        fontSize: '0.68rem', color: 'var(--on-surface-variant)', display: 'block', marginBottom: '6px',
    };

    // Tamamlandı ekranı
    if (tamamlandi) {
        return (
            <main style={{ minHeight: '100vh', background: 'var(--surface)', color: 'var(--on-surface)' }}>
                {navbar}
                <div style={{ display: 'flex', justifyContent: 'center', padding: '3.5rem 1.5rem' }}>
                    <div className="od-glass" style={{ width: '100%', maxWidth: '460px', padding: '2.75rem', textAlign: 'center' }}>
                        <div style={{ width: '52px', height: '52px', margin: '0 auto 1.25rem', borderRadius: '50%', background: 'rgba(178,230,48,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary)', fontSize: '1.5rem' }}>✓</div>
                        <h2 className="font-display" style={{ color: 'var(--on-surface)', fontSize: '1.6rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                            {lang === 'tr' ? "Blockchain'e Kaydedildi!" : 'Recorded on Blockchain!'}
                        </h2>
                        <p style={{ color: 'var(--on-surface-variant)', marginBottom: '1.75rem' }}>
                            {lang === 'tr'
                                ? `${urunAdiSonuc} başarıyla zincire eklendi.`
                                : `${urunAdiSonuc} has been successfully added to the chain.`}
                        </p>
                        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius)', padding: '1rem', marginBottom: '1rem', textAlign: 'left' }}>
                            <div className="mono-label" style={{ fontSize: '0.6rem', color: 'var(--on-surface-variant)', marginBottom: '4px' }}>SHA-256 Hash</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--secondary)', wordBreak: 'break-all' }}>{hash}</div>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius)', padding: '1rem', marginBottom: '1rem' }}>
                            <div className="mono-label" style={{ fontSize: '0.6rem', color: 'var(--on-surface-variant)', marginBottom: '8px' }}>QR {lang === 'tr' ? 'Kod' : 'Code'}</div>
                            <div style={{ display: 'inline-block', padding: '10px', borderRadius: 'var(--radius)', background: 'var(--on-surface)' }}>
                                <canvas ref={qrRef} style={{ display: 'block' }} />
                            </div>
                        </div>
                        <button onClick={pdfIndir} className="od-btn-primary" style={{ width: '100%', marginBottom: '0.75rem' }}>
                            {lang === 'tr' ? 'PDF Olarak İndir' : 'Download as PDF'}
                        </button>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <div className="mono-label" style={{ fontSize: '0.66rem', color: 'var(--on-surface-variant)', marginBottom: '0.75rem' }}>
                                {lang === 'tr' ? 'Paylaş' : 'Share'}
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <a href={'https://wa.me/?text=' + encodeURIComponent(paylasMetin)} target="_blank" rel="noreferrer"
                                    style={{ flex: 1, padding: '0.65rem', background: '#25D366', color: '#0b1a0e', borderRadius: 'var(--radius)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 700, textAlign: 'center' }}>
                                    WhatsApp
                                </a>
                                <button onClick={() => { navigator.clipboard.writeText(paylasUrl); alert(lang === 'tr' ? 'Link kopyalandı!' : 'Link copied!'); }}
                                    className="od-btn-secondary" style={{ flex: 1 }}>
                                    {lang === 'tr' ? 'Kopyala' : 'Copy Link'}
                                </button>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button onClick={() => { setTamamlandi(false); setForm({ urunAdi: '', urunTipi: '', bolge: '', hasat: '', miktar: '', birim: 'kg', aciklama: '' }); setDetaylar({}); }}
                                className="od-btn-secondary" style={{ flex: 1 }}>
                                + {lang === 'tr' ? 'Yeni Ürün' : 'New Product'}
                            </button>
                            <a href="/dashboard" className="od-btn-primary" style={{ flex: 1 }}>
                                Dashboard
                            </a>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    // Ana form ekranı
    return (
        <main style={{ minHeight: '100vh', background: 'var(--surface)', color: 'var(--on-surface)' }}>
            {navbar}

            <div style={{ display: 'flex', justifyContent: 'center', padding: '3.5rem 1.5rem' }}>
                <div className="od-glass" style={{ width: '100%', maxWidth: '640px', padding: '2.75rem' }}>
                    <h1 className="font-display" style={{ fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--on-surface)', marginBottom: '0.5rem' }}>
                        {lang === 'tr' ? 'Yeni Ürün Ekle' : 'Add New Product'}
                    </h1>
                    <p style={{ color: 'var(--on-surface-variant)', marginBottom: '2.25rem', fontSize: '0.95rem' }}>
                        {lang === 'tr' ? "Ürün bilgilerini gir, blockchain'e kaydet." : 'Enter product details and record on blockchain.'}
                    </p>

                    <form onSubmit={handleSubmit}>

                        {/* ÜRÜN ADI */}
                        <div style={{ marginBottom: '1.25rem' }}>
                            <label className="mono-label" style={fieldLabelStyle}>
                                {lang === 'tr' ? 'Ürün Adı' : 'Product Name'}
                            </label>
                            <input type="text" required placeholder={lang === 'tr' ? 'Mut Sızma Zeytinyağı' : 'Mut Extra Virgin Olive Oil'}
                                value={form.urunAdi} onChange={e => setForm({ ...form, urunAdi: e.target.value })}
                                className="od-field"
                            />
                        </div>

                        {/* ÜRÜN TİPİ */}
                        <div style={{ marginBottom: '1.25rem' }}>
                            <label className="mono-label" style={fieldLabelStyle}>
                                {lang === 'tr' ? 'Ürün Tipi' : 'Product Type'}
                            </label>
                            <select required value={form.urunTipi} onChange={e => { setForm({ ...form, urunTipi: e.target.value }); setDetaylar({}); }}
                                className="od-field">
                                <option value="">{lang === 'tr' ? 'Seçiniz...' : 'Select...'}</option>
                                <option value="Zeytinyagi">{lang === 'tr' ? 'Zeytinyağı' : 'Olive Oil'}</option>
                                <option value="Bal">{lang === 'tr' ? 'Bal' : 'Honey'}</option>
                                <option value="Peynir">{lang === 'tr' ? 'Peynir' : 'Cheese'}</option>
                                <option value="Sut Urunleri">{lang === 'tr' ? 'Süt Ürünleri' : 'Dairy Products'}</option>
                                <option value="Sebze & Meyve">{lang === 'tr' ? 'Sebze & Meyve' : 'Vegetables & Fruits'}</option>
                                <option value="Tahil">{lang === 'tr' ? 'Tahıl' : 'Grain'}</option>
                                <option value="Diger">{lang === 'tr' ? 'Diğer' : 'Other'}</option>
                            </select>
                        </div>

                        {/* ZEYTİNYAĞI DETAYLARI */}
                        {form.urunTipi === 'Zeytinyagi' && (
                            <div style={subPanelStyle}>
                                <div style={subHeadingStyle}>
                                    {lang === 'tr' ? 'Üretici Bilgileri' : 'Producer Information'}
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.9rem', marginBottom: '0.9rem' }}>
                                    <div>
                                        <label style={fieldLabelStyle}>
                                            {lang === 'tr' ? 'Üretici Ad Soyad' : 'Producer Full Name'}
                                        </label>
                                        <input type="text" placeholder={lang === 'tr' ? 'Ahmet Yılmaz' : 'John Smith'}
                                            value={detaylar.ureticiAd || ''} onChange={e => setDetaylar({ ...detaylar, ureticiAd: e.target.value })}
                                            className="od-field"
                                        />
                                    </div>
                                    <div>
                                        <label style={fieldLabelStyle}>
                                            {lang === 'tr' ? 'TC Kimlik No' : 'ID Number'}
                                        </label>
                                        <input type="text" placeholder="12345678901" maxLength={11}
                                            value={detaylar.tc || ''} onChange={e => setDetaylar({ ...detaylar, tc: e.target.value })}
                                            className="od-field"
                                        />
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.9rem', marginBottom: '0.9rem' }}>
                                    <div>
                                        <label style={fieldLabelStyle}>
                                            {lang === 'tr' ? 'Telefon' : 'Phone'}
                                        </label>
                                        <input type="tel" placeholder="0532 000 00 00"
                                            value={detaylar.telefon || ''} onChange={e => setDetaylar({ ...detaylar, telefon: e.target.value })}
                                            className="od-field"
                                        />
                                    </div>
                                    <div>
                                        <label style={fieldLabelStyle}>
                                            {lang === 'tr' ? 'Köy / Mahalle' : 'Village / District'}
                                        </label>
                                        <input type="text" placeholder={lang === 'tr' ? 'Gökçe Mahallesi' : 'Gokce District'}
                                            value={detaylar.koy || ''} onChange={e => setDetaylar({ ...detaylar, koy: e.target.value })}
                                            className="od-field"
                                        />
                                    </div>
                                </div>
                                <div style={{ ...subHeadingStyle, marginTop: '0.5rem' }}>
                                    {lang === 'tr' ? 'Bahçe / Kadastro Bilgileri' : 'Garden / Cadastral Information'}
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.9rem', marginBottom: '0.9rem' }}>
                                    <div>
                                        <label style={fieldLabelStyle}>
                                            {lang === 'tr' ? 'Ada No' : 'Block No'}
                                        </label>
                                        <input type="text" placeholder="123"
                                            value={detaylar.adaNo || ''} onChange={e => setDetaylar({ ...detaylar, adaNo: e.target.value })}
                                            className="od-field"
                                        />
                                    </div>
                                    <div>
                                        <label style={fieldLabelStyle}>
                                            {lang === 'tr' ? 'Parsel No' : 'Parcel No'}
                                        </label>
                                        <input type="text" placeholder="45"
                                            value={detaylar.parselNo || ''} onChange={e => setDetaylar({ ...detaylar, parselNo: e.target.value })}
                                            className="od-field"
                                        />
                                    </div>
                                </div>
                                <div style={{ ...subHeadingStyle, marginTop: '0.5rem' }}>
                                    {lang === 'tr' ? 'Ürün Özellikleri' : 'Product Characteristics'}
                                </div>
                                <div style={{ marginBottom: '0.9rem' }}>
                                    <label style={{ ...fieldLabelStyle, marginBottom: '8px' }}>
                                        {lang === 'tr' ? 'Zeytin Cinsi' : 'Olive Variety'}
                                    </label>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                        {zeytinCinsleri.map(cins => {
                                            const secili = (detaylar.zeytinCinsi || []).includes(cins);
                                            return (
                                                <button key={cins} type="button"
                                                    onClick={() => {
                                                        const seciliListe = detaylar.zeytinCinsi || [];
                                                        const yeni = seciliListe.includes(cins) ? seciliListe.filter((c: string) => c !== cins) : [...seciliListe, cins];
                                                        setDetaylar({ ...detaylar, zeytinCinsi: yeni });
                                                    }}
                                                    style={{
                                                        padding: '5px 14px', borderRadius: 'var(--radius-full)', border: '1px solid', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                                                        background: secili ? 'var(--secondary)' : 'transparent',
                                                        color: secili ? 'var(--on-secondary)' : 'var(--on-surface-variant)',
                                                        borderColor: secili ? 'var(--secondary)' : 'var(--outline-variant)'
                                                    }}>
                                                    {cins}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                                <div>
                                    <label style={fieldLabelStyle}>
                                        {lang === 'tr' ? 'Çekim Tipi' : 'Extraction Type'}
                                    </label>
                                    <select value={detaylar.cekimTipi || ''} onChange={e => setDetaylar({ ...detaylar, cekimTipi: e.target.value })}
                                        className="od-field">
                                        <option value="">{lang === 'tr' ? 'Seçiniz' : 'Select'}</option>
                                        <option value={lang === 'tr' ? 'Normal Sıkım' : 'Normal Press'}>{lang === 'tr' ? 'Normal Sıkım' : 'Normal Press'}</option>
                                        <option value={lang === 'tr' ? 'Soğuk Sıkım' : 'Cold Press'}>{lang === 'tr' ? 'Soğuk Sıkım' : 'Cold Press'}</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        {/* BAL DETAYLARI */}
                        {form.urunTipi === 'Bal' && (
                            <div style={subPanelStyle}>
                                <div style={subHeadingStyle}>
                                    {lang === 'tr' ? 'Bal Detayları' : 'Honey Details'}
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.9rem', marginBottom: '0.9rem' }}>
                                    <div>
                                        <label style={fieldLabelStyle}>
                                            {lang === 'tr' ? 'Üretici Ad Soyad' : 'Producer Full Name'}
                                        </label>
                                        <input type="text" placeholder={lang === 'tr' ? 'Ahmet Yılmaz' : 'John Smith'}
                                            value={detaylar.ureticiAd || ''} onChange={e => setDetaylar({ ...detaylar, ureticiAd: e.target.value })}
                                            className="od-field"
                                        />
                                    </div>
                                    <div>
                                        <label style={fieldLabelStyle}>
                                            {lang === 'tr' ? 'Telefon' : 'Phone'}
                                        </label>
                                        <input type="tel" placeholder="0532 000 00 00"
                                            value={detaylar.telefon || ''} onChange={e => setDetaylar({ ...detaylar, telefon: e.target.value })}
                                            className="od-field"
                                        />
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.9rem' }}>
                                    <div>
                                        <label style={fieldLabelStyle}>
                                            {lang === 'tr' ? 'Bal Türü' : 'Honey Type'}
                                        </label>
                                        <select value={detaylar.balTuru || ''} onChange={e => setDetaylar({ ...detaylar, balTuru: e.target.value })}
                                            className="od-field">
                                            <option value="">{lang === 'tr' ? 'Seçiniz' : 'Select'}</option>
                                            <option>{lang === 'tr' ? 'Çiçek Balı' : 'Flower Honey'}</option>
                                            <option>{lang === 'tr' ? 'Çam Balı' : 'Pine Honey'}</option>
                                            <option>{lang === 'tr' ? 'Kestane Balı' : 'Chestnut Honey'}</option>
                                            <option>{lang === 'tr' ? 'Ihlamur Balı' : 'Linden Honey'}</option>
                                            <option>{lang === 'tr' ? 'Anzer Balı' : 'Anzer Honey'}</option>
                                            <option>{lang === 'tr' ? 'Diğer' : 'Other'}</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={fieldLabelStyle}>
                                            {lang === 'tr' ? 'Arılık Bölgesi' : 'Apiary Region'}
                                        </label>
                                        <input type="text" placeholder={lang === 'tr' ? 'Kaçkar Dağları' : 'Kackar Mountains'}
                                            value={detaylar.arlikBolgesi || ''} onChange={e => setDetaylar({ ...detaylar, arlikBolgesi: e.target.value })}
                                            className="od-field"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* PEYNİR DETAYLARI */}
                        {form.urunTipi === 'Peynir' && (
                            <div style={subPanelStyle}>
                                <div style={subHeadingStyle}>
                                    {lang === 'tr' ? 'Peynir Detayları' : 'Cheese Details'}
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.9rem', marginBottom: '0.9rem' }}>
                                    <div>
                                        <label style={fieldLabelStyle}>
                                            {lang === 'tr' ? 'Üretici Ad Soyad' : 'Producer Full Name'}
                                        </label>
                                        <input type="text" value={detaylar.ureticiAd || ''} onChange={e => setDetaylar({ ...detaylar, ureticiAd: e.target.value })}
                                            className="od-field"
                                        />
                                    </div>
                                    <div>
                                        <label style={fieldLabelStyle}>
                                            {lang === 'tr' ? 'Süt Türü' : 'Milk Type'}
                                        </label>
                                        <select value={detaylar.sutTuru || ''} onChange={e => setDetaylar({ ...detaylar, sutTuru: e.target.value })}
                                            className="od-field">
                                            <option value="">{lang === 'tr' ? 'Seçiniz' : 'Select'}</option>
                                            <option>{lang === 'tr' ? 'İnek Sütü' : "Cow's Milk"}</option>
                                            <option>{lang === 'tr' ? 'Koyun Sütü' : "Sheep's Milk"}</option>
                                            <option>{lang === 'tr' ? 'Keçi Sütü' : "Goat's Milk"}</option>
                                            <option>{lang === 'tr' ? 'Karışım' : 'Mixed'}</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label style={fieldLabelStyle}>
                                        {lang === 'tr' ? 'Olgunlaşma Süresi' : 'Aging Period'}
                                    </label>
                                    <input type="text" placeholder={lang === 'tr' ? '3 ay' : '3 months'}
                                        value={detaylar.olgunlasma || ''} onChange={e => setDetaylar({ ...detaylar, olgunlasma: e.target.value })}
                                        className="od-field"
                                    />
                                </div>
                            </div>
                        )}

                        {/* ORTAK ALANLAR */}
                        <div style={{ marginBottom: '1.25rem' }}>
                            <label className="mono-label" style={fieldLabelStyle}>
                                {lang === 'tr' ? 'Üretim Bölgesi' : 'Production Region'}
                            </label>
                            <input type="text" required placeholder="Mut / Mersin"
                                value={form.bolge} onChange={e => setForm({ ...form, bolge: e.target.value })}
                                className="od-field"
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                            <div>
                                <label className="mono-label" style={fieldLabelStyle}>
                                    {lang === 'tr' ? 'Hasat Tarihi' : 'Harvest Date'}
                                </label>
                                <input type="date" required value={form.hasat} onChange={e => setForm({ ...form, hasat: e.target.value })}
                                    className="od-field"
                                />
                            </div>
                            <div>
                                <label className="mono-label" style={fieldLabelStyle}>
                                    {lang === 'tr' ? 'Miktar' : 'Amount'}
                                </label>
                                <div style={{ display: 'flex', gap: '6px' }}>
                                    <input type="number" required placeholder="500" value={form.miktar} onChange={e => setForm({ ...form, miktar: e.target.value })}
                                        className="od-field" style={{ flex: 1 }}
                                    />
                                    <select value={form.birim} onChange={e => setForm({ ...form, birim: e.target.value })}
                                        className="od-field" style={{ width: 'auto' }}>
                                        <option>kg</option>
                                        <option>lt</option>
                                        <option>{lang === 'tr' ? 'adet' : 'pcs'}</option>
                                        <option>ton</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {form.urunTipi === 'Zeytinyagi' && (
                            <div style={{ marginBottom: '1.25rem' }}>
                                <label className="mono-label" style={fieldLabelStyle}>
                                    {lang === 'tr' ? 'Çıkan Yağ Miktarı (lt)' : 'Extracted Oil Amount (lt)'}
                                </label>
                                <input type="number" placeholder="90"
                                    value={detaylar.cikanYagMiktari || ''} onChange={e => setDetaylar({ ...detaylar, cikanYagMiktari: e.target.value })}
                                    className="od-field"
                                />
                            </div>
                        )}

                        <div style={{ marginBottom: '1.75rem' }}>
                            <label className="mono-label" style={fieldLabelStyle}>
                                {lang === 'tr' ? 'Açıklama' : 'Description'}
                            </label>
                            <textarea placeholder={lang === 'tr' ? 'Ek bilgi...' : 'Additional info...'}
                                value={form.aciklama} onChange={e => setForm({ ...form, aciklama: e.target.value })}
                                rows={3} className="od-field" style={{ resize: 'none' }}
                            />
                        </div>

                        {/* MEDYA YÜKLEME */}
                        <div style={{ marginBottom: '1.75rem' }}>
                            <label className="mono-label" style={{ ...fieldLabelStyle, marginBottom: '10px' }}>
                                {lang === 'tr' ? 'Fotoğraf & Video (max 10 dosya)' : 'Photos & Videos (max 10 files)'}
                            </label>

                            {/* Yükleme alanı */}
                            <label style={{
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                border: '1px dashed var(--outline-variant)', borderRadius: 'var(--radius-md)', padding: '1.75rem',
                                cursor: 'pointer', background: 'rgba(178,230,48,0.03)', marginBottom: '1rem',
                                transition: 'background 0.2s, border-color 0.2s'
                            }}>
                                <span style={{ fontSize: '0.9rem', color: 'var(--secondary)', fontWeight: 700 }}>
                                    {lang === 'tr' ? 'Dosya Seç veya Sürükle' : 'Select or Drop Files'}
                                </span>
                                <span style={{ fontSize: '0.78rem', color: 'var(--on-surface-variant)', marginTop: '4px' }}>
                                    {lang === 'tr' ? 'JPG, PNG, MP4, MOV — max 50MB' : 'JPG, PNG, MP4, MOV — max 50MB'}
                                </span>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*,video/*"
                                    onChange={handleMedyaSec}
                                    style={{ display: 'none' }}
                                />
                            </label>

                            {/* Önizlemeler */}
                            {medyaOnizleme.length > 0 && (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                                    {medyaOnizleme.map((url, i) => (
                                        <div key={i} style={{ position: 'relative', borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--outline-variant)', aspectRatio: '1' }}>
                                            {medyaDosyalar[i]?.type.startsWith('video/') ? (
                                                <div style={{ width: '100%', height: '100%', background: 'var(--surface-container-low)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', color: 'var(--on-surface)' }}>▶</div>
                                            ) : (
                                                <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => medyaSil(i)}
                                                style={{
                                                    position: 'absolute', top: '4px', right: '4px',
                                                    background: 'rgba(0,0,0,0.6)', color: '#fff',
                                                    border: 'none', borderRadius: '50%', width: '22px', height: '22px',
                                                    cursor: 'pointer', fontSize: '12px', lineHeight: '22px', textAlign: 'center'
                                                }}
                                            >✕</button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {medyaYukleniyor && (
                                <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--secondary)', fontSize: '0.9rem' }}>
                                    {lang === 'tr' ? 'Cloudinary\'ye yükleniyor...' : 'Uploading to Cloudinary...'}
                                </div>
                            )}
                        </div>

                        <button type="submit" disabled={yukleniyor || medyaYukleniyor}
                            className="od-btn-primary" style={{ width: '100%' }}>
                            {medyaYukleniyor
                                ? (lang === 'tr' ? 'Medya Yükleniyor...' : 'Uploading Media...')
                                : yukleniyor
                                    ? (lang === 'tr' ? "Blockchain'e Kaydediliyor..." : 'Recording on Blockchain...')
                                    : (lang === 'tr' ? "Blockchain'e Kaydet & QR Oluştur" : 'Save to Blockchain & Create QR')}
                        </button>
                    </form>
                </div>
            </div>
        </main>
    );
}
