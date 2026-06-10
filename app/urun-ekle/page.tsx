'use client';
import { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import jsPDF from 'jspdf';
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
                color: { dark: '#2D5A27', light: '#ffffff' }
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

            // Önce medya dosyalarını yükle
            let medyaUrls: string[] = [];
            if (medyaDosyalar.length > 0) {
                setMedyaYukleniyor(true);
                const formData = new FormData();
                medyaDosyalar.forEach(f => formData.append('dosyalar', f));
                const medyaRes = await fetch('/api/medya-yukle', { method: 'POST', body: formData });
                const medyaData = await medyaRes.json();
                setMedyaYukleniyor(false);
                if (medyaData.basari) {
                    medyaUrls = medyaData.urls;
                } else {
                    alert(lang === 'tr' ? 'Medya yükleme hatası: ' + medyaData.hata : 'Media upload error: ' + medyaData.hata);
                    setYukleniyor(false);
                    return;
                }
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

    // Tamamlandı ekranı
    if (tamamlandi) {
        return (
            <main style={{ fontFamily: 'sans-serif', minHeight: '100vh', background: '#f9f7f4' }}>
                <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', background: '#2D5A27', borderBottom: '1px solid #1a3d18' }}>
                    <img src="/origin.png" alt="OriginTag" style={{ height: '50px' }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <a href="/dashboard" style={{ color: '#fff', textDecoration: 'none' }}>
                            {lang === 'tr' ? "Dashboard'a Dön" : 'Back to Dashboard'}
                        </a>
                        <LanguageSwitcher />
                    </div>
                </nav>
                <div style={{ maxWidth: '500px', margin: '3rem auto', textAlign: 'center' }}>
                    <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: '16px', padding: '2.5rem' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
                        <h2 style={{ color: '#2D5A27', marginBottom: '0.5rem' }}>
                            {lang === 'tr' ? "Blockchain'e Kaydedildi!" : 'Recorded on Blockchain!'}
                        </h2>
                        <p style={{ color: '#888', marginBottom: '1.5rem' }}>
                            {lang === 'tr'
                                ? `${urunAdiSonuc} başarıyla zincire eklendi.`
                                : `${urunAdiSonuc} has been successfully added to the chain.`}
                        </p>
                        <div style={{ background: '#f9f7f4', borderRadius: '8px', padding: '1rem', marginBottom: '1rem', textAlign: 'left' }}>
                            <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: '4px' }}>SHA-256 Hash</div>
                            <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#8B6914', wordBreak: 'break-all' }}>{hash}</div>
                        </div>
                        <div style={{ background: '#f9f7f4', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
                            <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: '8px' }}>QR {lang === 'tr' ? 'Kod' : 'Code'}</div>
                            <canvas ref={qrRef} style={{ borderRadius: '8px' }} />
                        </div>
                        <button onClick={pdfIndir} style={{ width: '100%', padding: '0.85rem', background: '#2D5A27', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', marginBottom: '0.75rem', fontWeight: 'bold' }}>
                            {lang === 'tr' ? 'PDF Olarak İndir' : 'Download as PDF'}
                        </button>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <div style={{ fontSize: '0.85rem', color: '#888', marginBottom: '0.75rem' }}>
                                {lang === 'tr' ? 'Paylaş' : 'Share'}
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <a href={'https://wa.me/?text=' + encodeURIComponent(paylasMetin)} target="_blank"
                                    style={{ flex: 1, padding: '0.6rem', background: '#25D366', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontSize: '0.85rem', textAlign: 'center' }}>
                                    WhatsApp
                                </a>
                                <button onClick={() => { navigator.clipboard.writeText(paylasUrl); alert(lang === 'tr' ? 'Link kopyalandı!' : 'Link copied!'); }}
                                    style={{ flex: 1, padding: '0.6rem', background: '#f0f0f0', color: '#333', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                                    {lang === 'tr' ? 'Kopyala' : 'Copy Link'}
                                </button>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button onClick={() => { setTamamlandi(false); setForm({ urunAdi: '', urunTipi: '', bolge: '', hasat: '', miktar: '', birim: 'kg', aciklama: '' }); setDetaylar({}); }}
                                style={{ flex: 1, padding: '0.75rem', background: 'transparent', color: '#2D5A27', border: '1px solid #2D5A27', borderRadius: '8px', cursor: 'pointer' }}>
                                + {lang === 'tr' ? 'Yeni Ürün' : 'New Product'}
                            </button>
                            <a href="/dashboard"
                                style={{ flex: 1, padding: '0.75rem', background: '#2D5A27', color: '#fff', borderRadius: '8px', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
        <main style={{ fontFamily: 'sans-serif', minHeight: '100vh', background: '#f9f7f4' }}>
            <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', background: '#2D5A27', borderBottom: '1px solid #1a3d18' }}>
                <img src="/origin.png" alt="OriginTag" style={{ height: '50px' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <a href="/dashboard" style={{ color: '#fff', textDecoration: 'none' }}>
                        {lang === 'tr' ? "Dashboard'a Dön" : 'Back to Dashboard'}
                    </a>
                    <LanguageSwitcher />
                </div>
            </nav>

            <div style={{ maxWidth: '600px', margin: '3rem auto', background: '#fff', borderRadius: '16px', border: '1px solid #eee', padding: '2.5rem' }}>
                <h1 style={{ fontSize: '1.8rem', color: '#1a1a1a', marginBottom: '0.5rem' }}>
                    {lang === 'tr' ? 'Yeni Ürün Ekle' : 'Add New Product'}
                </h1>
                <p style={{ color: '#888', marginBottom: '2rem', fontSize: '0.95rem' }}>
                    {lang === 'tr' ? "Ürün bilgilerini gir, blockchain'e kaydet." : 'Enter product details and record on blockchain.'}
                </p>

                <form onSubmit={handleSubmit}>

                    {/* ÜRÜN ADI */}
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ fontSize: '0.85rem', color: '#555', display: 'block', marginBottom: '4px' }}>
                            {lang === 'tr' ? 'Ürün Adı' : 'Product Name'}
                        </label>
                        <input type="text" required placeholder={lang === 'tr' ? 'Mut Sızma Zeytinyağı' : 'Mut Extra Virgin Olive Oil'}
                            value={form.urunAdi} onChange={e => setForm({ ...form, urunAdi: e.target.value })}
                            style={{ width: '100%', padding: '0.6rem 0.8rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.95rem', boxSizing: 'border-box' }}
                        />
                    </div>

                    {/* ÜRÜN TİPİ */}
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ fontSize: '0.85rem', color: '#555', display: 'block', marginBottom: '4px' }}>
                            {lang === 'tr' ? 'Ürün Tipi' : 'Product Type'}
                        </label>
                        <select required value={form.urunTipi} onChange={e => { setForm({ ...form, urunTipi: e.target.value }); setDetaylar({}); }}
                            style={{ width: '100%', padding: '0.6rem 0.8rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.95rem', boxSizing: 'border-box', background: '#fff' }}>
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
                        <div style={{ background: '#f9f7f4', borderRadius: '12px', padding: '1.25rem', marginBottom: '1rem', border: '1px solid #e8e4dc' }}>
                            <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#2D5A27', marginBottom: '1rem' }}>
                                {lang === 'tr' ? 'Üretici Bilgileri' : 'Producer Information'}
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                <div>
                                    <label style={{ fontSize: '0.8rem', color: '#666', display: 'block', marginBottom: '3px' }}>
                                        {lang === 'tr' ? 'Üretici Ad Soyad' : 'Producer Full Name'}
                                    </label>
                                    <input type="text" placeholder={lang === 'tr' ? 'Ahmet Yılmaz' : 'John Smith'}
                                        value={detaylar.ureticiAd || ''} onChange={e => setDetaylar({ ...detaylar, ureticiAd: e.target.value })}
                                        style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.9rem', boxSizing: 'border-box' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.8rem', color: '#666', display: 'block', marginBottom: '3px' }}>
                                        {lang === 'tr' ? 'TC Kimlik No' : 'ID Number'}
                                    </label>
                                    <input type="text" placeholder="12345678901" maxLength={11}
                                        value={detaylar.tc || ''} onChange={e => setDetaylar({ ...detaylar, tc: e.target.value })}
                                        style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.9rem', boxSizing: 'border-box' }}
                                    />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                <div>
                                    <label style={{ fontSize: '0.8rem', color: '#666', display: 'block', marginBottom: '3px' }}>
                                        {lang === 'tr' ? 'Telefon' : 'Phone'}
                                    </label>
                                    <input type="tel" placeholder="0532 000 00 00"
                                        value={detaylar.telefon || ''} onChange={e => setDetaylar({ ...detaylar, telefon: e.target.value })}
                                        style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.9rem', boxSizing: 'border-box' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.8rem', color: '#666', display: 'block', marginBottom: '3px' }}>
                                        {lang === 'tr' ? 'Köy / Mahalle' : 'Village / District'}
                                    </label>
                                    <input type="text" placeholder={lang === 'tr' ? 'Gökçe Mahallesi' : 'Gokce District'}
                                        value={detaylar.koy || ''} onChange={e => setDetaylar({ ...detaylar, koy: e.target.value })}
                                        style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.9rem', boxSizing: 'border-box' }}
                                    />
                                </div>
                            </div>
                            <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#2D5A27', margin: '1rem 0 0.75rem' }}>
                                {lang === 'tr' ? 'Bahçe / Kadastro Bilgileri' : 'Garden / Cadastral Information'}
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                <div>
                                    <label style={{ fontSize: '0.8rem', color: '#666', display: 'block', marginBottom: '3px' }}>
                                        {lang === 'tr' ? 'Ada No' : 'Block No'}
                                    </label>
                                    <input type="text" placeholder="123"
                                        value={detaylar.adaNo || ''} onChange={e => setDetaylar({ ...detaylar, adaNo: e.target.value })}
                                        style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.9rem', boxSizing: 'border-box' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.8rem', color: '#666', display: 'block', marginBottom: '3px' }}>
                                        {lang === 'tr' ? 'Parsel No' : 'Parcel No'}
                                    </label>
                                    <input type="text" placeholder="45"
                                        value={detaylar.parselNo || ''} onChange={e => setDetaylar({ ...detaylar, parselNo: e.target.value })}
                                        style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.9rem', boxSizing: 'border-box' }}
                                    />
                                </div>
                            </div>
                            <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#2D5A27', margin: '1rem 0 0.75rem' }}>
                                {lang === 'tr' ? 'Ürün Özellikleri' : 'Product Characteristics'}
                            </div>
                            <div style={{ marginBottom: '0.75rem' }}>
                                <label style={{ fontSize: '0.8rem', color: '#666', display: 'block', marginBottom: '6px' }}>
                                    {lang === 'tr' ? 'Zeytin Cinsi' : 'Olive Variety'}
                                </label>
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
                                    <label style={{ fontSize: '0.8rem', color: '#666', display: 'block', marginBottom: '3px' }}>
                                        {lang === 'tr' ? 'Çekim Tipi' : 'Extraction Type'}
                                    </label>
                                    <select value={detaylar.cekimTipi || ''} onChange={e => setDetaylar({ ...detaylar, cekimTipi: e.target.value })}
                                        style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.9rem', background: '#fff', boxSizing: 'border-box' }}>
                                        <option value="">{lang === 'tr' ? 'Seçiniz' : 'Select'}</option>
                                        <option value="soguk">{lang === 'tr' ? 'Soğuk Sıkım' : 'Cold Press'}</option>
                                        <option value="ikinci">{lang === 'tr' ? 'İkinci Sıkım' : 'Second Press'}</option>
                                        <option value="rafine">{lang === 'tr' ? 'Rafine' : 'Refined'}</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.8rem', color: '#666', display: 'block', marginBottom: '3px' }}>
                                        {lang === 'tr' ? 'Randıman (%)' : 'Yield (%)'}
                                    </label>
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
                            <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#8B6914', marginBottom: '1rem' }}>
                                {lang === 'tr' ? 'Bal Detayları' : 'Honey Details'}
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                <div>
                                    <label style={{ fontSize: '0.8rem', color: '#666', display: 'block', marginBottom: '3px' }}>
                                        {lang === 'tr' ? 'Üretici Ad Soyad' : 'Producer Full Name'}
                                    </label>
                                    <input type="text" placeholder={lang === 'tr' ? 'Ahmet Yılmaz' : 'John Smith'}
                                        value={detaylar.ureticiAd || ''} onChange={e => setDetaylar({ ...detaylar, ureticiAd: e.target.value })}
                                        style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.9rem', boxSizing: 'border-box' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.8rem', color: '#666', display: 'block', marginBottom: '3px' }}>
                                        {lang === 'tr' ? 'Telefon' : 'Phone'}
                                    </label>
                                    <input type="tel" placeholder="0532 000 00 00"
                                        value={detaylar.telefon || ''} onChange={e => setDetaylar({ ...detaylar, telefon: e.target.value })}
                                        style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.9rem', boxSizing: 'border-box' }}
                                    />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div>
                                    <label style={{ fontSize: '0.8rem', color: '#666', display: 'block', marginBottom: '3px' }}>
                                        {lang === 'tr' ? 'Bal Türü' : 'Honey Type'}
                                    </label>
                                    <select value={detaylar.balTuru || ''} onChange={e => setDetaylar({ ...detaylar, balTuru: e.target.value })}
                                        style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.9rem', background: '#fff', boxSizing: 'border-box' }}>
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
                                    <label style={{ fontSize: '0.8rem', color: '#666', display: 'block', marginBottom: '3px' }}>
                                        {lang === 'tr' ? 'Arılık Bölgesi' : 'Apiary Region'}
                                    </label>
                                    <input type="text" placeholder={lang === 'tr' ? 'Kaçkar Dağları' : 'Kackar Mountains'}
                                        value={detaylar.arlikBolgesi || ''} onChange={e => setDetaylar({ ...detaylar, arlikBolgesi: e.target.value })}
                                        style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.9rem', boxSizing: 'border-box' }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* PEYNİR DETAYLARI */}
                    {form.urunTipi === 'Peynir' && (
                        <div style={{ background: '#faf9f5', borderRadius: '12px', padding: '1.25rem', marginBottom: '1rem', border: '1px solid #e0dbd0' }}>
                            <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#555', marginBottom: '1rem' }}>
                                {lang === 'tr' ? 'Peynir Detayları' : 'Cheese Details'}
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                <div>
                                    <label style={{ fontSize: '0.8rem', color: '#666', display: 'block', marginBottom: '3px' }}>
                                        {lang === 'tr' ? 'Üretici Ad Soyad' : 'Producer Full Name'}
                                    </label>
                                    <input type="text" value={detaylar.ureticiAd || ''} onChange={e => setDetaylar({ ...detaylar, ureticiAd: e.target.value })}
                                        style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.9rem', boxSizing: 'border-box' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.8rem', color: '#666', display: 'block', marginBottom: '3px' }}>
                                        {lang === 'tr' ? 'Süt Türü' : 'Milk Type'}
                                    </label>
                                    <select value={detaylar.sutTuru || ''} onChange={e => setDetaylar({ ...detaylar, sutTuru: e.target.value })}
                                        style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.9rem', background: '#fff', boxSizing: 'border-box' }}>
                                        <option value="">{lang === 'tr' ? 'Seçiniz' : 'Select'}</option>
                                        <option>{lang === 'tr' ? 'İnek Sütü' : "Cow's Milk"}</option>
                                        <option>{lang === 'tr' ? 'Koyun Sütü' : "Sheep's Milk"}</option>
                                        <option>{lang === 'tr' ? 'Keçi Sütü' : "Goat's Milk"}</option>
                                        <option>{lang === 'tr' ? 'Karışım' : 'Mixed'}</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', color: '#666', display: 'block', marginBottom: '3px' }}>
                                    {lang === 'tr' ? 'Olgunlaşma Süresi' : 'Aging Period'}
                                </label>
                                <input type="text" placeholder={lang === 'tr' ? '3 ay' : '3 months'}
                                    value={detaylar.olgunlasma || ''} onChange={e => setDetaylar({ ...detaylar, olgunlasma: e.target.value })}
                                    style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.9rem', boxSizing: 'border-box' }}
                                />
                            </div>
                        </div>
                    )}

                    {/* ORTAK ALANLAR */}
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ fontSize: '0.85rem', color: '#555', display: 'block', marginBottom: '4px' }}>
                            {lang === 'tr' ? 'Üretim Bölgesi' : 'Production Region'}
                        </label>
                        <input type="text" required placeholder="Mut / Mersin"
                            value={form.bolge} onChange={e => setForm({ ...form, bolge: e.target.value })}
                            style={{ width: '100%', padding: '0.6rem 0.8rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.95rem', boxSizing: 'border-box' }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                        <div>
                            <label style={{ fontSize: '0.85rem', color: '#555', display: 'block', marginBottom: '4px' }}>
                                {lang === 'tr' ? 'Hasat Tarihi' : 'Harvest Date'}
                            </label>
                            <input type="date" required value={form.hasat} onChange={e => setForm({ ...form, hasat: e.target.value })}
                                style={{ width: '100%', padding: '0.6rem 0.8rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.95rem', boxSizing: 'border-box' }}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.85rem', color: '#555', display: 'block', marginBottom: '4px' }}>
                                {lang === 'tr' ? 'Miktar' : 'Amount'}
                            </label>
                            <div style={{ display: 'flex', gap: '4px' }}>
                                <input type="number" required placeholder="500" value={form.miktar} onChange={e => setForm({ ...form, miktar: e.target.value })}
                                    style={{ flex: 1, padding: '0.6rem 0.8rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.95rem', boxSizing: 'border-box' }}
                                />
                                <select value={form.birim} onChange={e => setForm({ ...form, birim: e.target.value })}
                                    style={{ padding: '0.6rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.9rem', background: '#fff' }}>
                                    <option>kg</option>
                                    <option>lt</option>
                                    <option>{lang === 'tr' ? 'adet' : 'pcs'}</option>
                                    <option>ton</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ fontSize: '0.85rem', color: '#555', display: 'block', marginBottom: '4px' }}>
                            {lang === 'tr' ? 'Açıklama' : 'Description'}
                        </label>
                        <textarea placeholder={lang === 'tr' ? 'Ek bilgi...' : 'Additional info...'}
                            value={form.aciklama} onChange={e => setForm({ ...form, aciklama: e.target.value })}
                            rows={3} style={{ width: '100%', padding: '0.6rem 0.8rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.95rem', boxSizing: 'border-box', resize: 'none' }}
                        />
                    </div>

                    {/* MEDYA YÜKLEME */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ fontSize: '0.85rem', color: '#555', display: 'block', marginBottom: '8px' }}>
                            {lang === 'tr' ? 'Fotoğraf & Video (max 10 dosya)' : 'Photos & Videos (max 10 files)'}
                        </label>

                        {/* Yükleme alanı */}
                        <label style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                            border: '2px dashed #c0dd97', borderRadius: '12px', padding: '1.5rem',
                            cursor: 'pointer', background: '#f9fdf5', marginBottom: '1rem',
                            transition: 'background 0.2s'
                        }}>
                            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📷</div>
                            <span style={{ fontSize: '0.9rem', color: '#2D5A27', fontWeight: 'bold' }}>
                                {lang === 'tr' ? 'Dosya Seç veya Sürükle' : 'Select or Drop Files'}
                            </span>
                            <span style={{ fontSize: '0.8rem', color: '#888', marginTop: '4px' }}>
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
                                    <div key={i} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', border: '1px solid #ddd', aspectRatio: '1' }}>
                                        {medyaDosyalar[i]?.type.startsWith('video/') ? (
                                            <div style={{ width: '100%', height: '100%', background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>▶️</div>
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
                                        <div style={{ position: 'absolute', bottom: '4px', left: '4px', background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: '10px', padding: '1px 5px', borderRadius: '4px' }}>
                                            {medyaDosyalar[i]?.type.startsWith('video/') ? '🎥' : '🖼️'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {medyaYukleniyor && (
                            <div style={{ textAlign: 'center', padding: '1rem', color: '#2D5A27', fontSize: '0.9rem' }}>
                                ☁️ {lang === 'tr' ? 'Cloudinary\'ye yükleniyor...' : 'Uploading to Cloudinary...'}
                            </div>
                        )}
                    </div>

                    <button type="submit" disabled={yukleniyor || medyaYukleniyor}
                        style={{ width: '100%', padding: '0.85rem', background: (yukleniyor || medyaYukleniyor) ? '#888' : '#2D5A27', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '1rem', cursor: (yukleniyor || medyaYukleniyor) ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}>
                        {medyaYukleniyor
                            ? (lang === 'tr' ? '☁️ Medya Yükleniyor...' : '☁️ Uploading Media...')
                            : yukleniyor
                                ? (lang === 'tr' ? "Blockchain'e Kaydediliyor..." : 'Recording on Blockchain...')
                                : (lang === 'tr' ? "Blockchain'e Kaydet & QR Oluştur" : 'Save to Blockchain & Create QR')}
                    </button>
                </form>
            </div>
        </main>
    );
}
