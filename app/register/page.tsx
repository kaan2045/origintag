'use client';
import { useState } from 'react';

export default function Register() {
    const [adim, setAdim] = useState<'form' | 'otp'>('form');
    const [form, setForm] = useState({
        ad: '', soyad: '', email: '', firma: '', sifre: '', sifreTekrar: ''
    });
    const [otp, setOtp] = useState('');
    const [yukleniyor, setYukleniyor] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (form.sifre !== form.sifreTekrar) {
            alert('Sifreler eslesmiyor!');
            return;
        }
        setYukleniyor(true);
        try {
            const res = await fetch('/api/otp-gonder', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: form.email }),
            });
            const data = await res.json();
            if (data.basari) {
                setAdim('otp');
            } else {
                alert('Hata: ' + data.hata);
            }
        } catch {
            alert('Baglanti hatasi!');
        }
        setYukleniyor(false);
    };

    const otpDogrula = async (e: React.FormEvent) => {
        e.preventDefault();
        setYukleniyor(true);
        try {
            const otpRes = await fetch('/api/otp-dogrula', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: form.email, kod: otp }),
            });
            const otpData = await otpRes.json();

            if (!otpData.basari) {
                alert('Kod hatali! Tekrar deneyin.');
                setOtp('');
                setYukleniyor(false);
                return;
            }

            const kayitRes = await fetch('/api/kayit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ad: form.ad,
                    soyad: form.soyad,
                    email: form.email,
                    firma: form.firma,
                    sifre: form.sifre,
                }),
            });
            const kayitData = await kayitRes.json();

            if (kayitData.basari) {
                localStorage.setItem('kullanici_id', kayitData.kullanici_id);
                localStorage.setItem('kullanici_ad', kayitData.ad);
                localStorage.setItem('kullanici_email', form.email);
                window.location.href = '/dashboard';
            } else {
                alert('Hata: ' + kayitData.hata);
            }
        } catch {
            alert('Baglanti hatasi!');
        }
        setYukleniyor(false);
    };

    if (adim === 'otp') {
        return (
            <main style={{ fontFamily: 'sans-serif', minHeight: '100vh', background: '#f9f7f4' }}>
                <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', background: '#fff', borderBottom: '1px solid #eee' }}>
                    <a href="/"><img src="/origin.png" alt="OriginTag" style={{ height: '50px' }} /></a>
                </nav>

                <div style={{ maxWidth: '420px', margin: '5rem auto', background: '#fff', borderRadius: '16px', border: '1px solid #eee', padding: '2.5rem' }}>
                    <h1 style={{ fontSize: '1.8rem', color: '#1a1a1a', marginBottom: '0.5rem' }}>Email Dogrulama</h1>
                    <p style={{ color: '#888', marginBottom: '2rem', fontSize: '0.95rem' }}><strong>{form.email}</strong> adresine 6 haneli kod gonderildi.</p>

                    <form onSubmit={otpDogrula}>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ fontSize: '0.85rem', color: '#555', display: 'block', marginBottom: '4px' }}>Dogrulama Kodu</label>
                            <input type="text" required placeholder="000000" maxLength={6}
                                value={otp} onChange={e => setOtp(e.target.value)}
                                style={{ width: '100%', padding: '0.8rem', border: '2px solid #2D5A27', borderRadius: '8px', fontSize: '1.5rem', textAlign: 'center', letterSpacing: '0.5rem', boxSizing: 'border-box' }}
                            />
                        </div>
                        <button type="submit" disabled={yukleniyor}
                            style={{ width: '100%', padding: '0.85rem', background: '#2D5A27', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '1rem', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                            {yukleniyor ? 'Dogrulanıyor...' : 'Dogrula & Kayit Ol'}
                        </button>
                        <button type="button" onClick={() => setAdim('form')}
                            style={{ width: '100%', padding: '0.75rem', background: 'transparent', color: '#888', border: 'none', fontSize: '0.9rem', cursor: 'pointer', marginTop: '0.5rem' }}
                        >
                            Geri Don
                        </button>
                    </form>
                </div>
            </main>
        );
    }

    return (
        <main style={{ fontFamily: 'sans-serif', minHeight: '100vh', background: '#f9f7f4' }}>
            <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', background: '#fff', borderBottom: '1px solid #eee' }}>
                <a href="/"><img src="/origin.png" alt="OriginTag" style={{ height: '50px' }} /></a>
                <a href="/login" style={{ color: '#2D5A27', textDecoration: 'none', fontSize: '0.95rem' }}>Zaten hesabin var mi? <strong>Giris Yap</strong></a>
            </nav>

            <div style={{ maxWidth: '500px', margin: '3rem auto', background: '#fff', borderRadius: '16px', border: '1px solid #eee', padding: '2.5rem' }}>
                <h1 style={{ fontSize: '1.8rem', color: '#1a1a1a', marginBottom: '0.5rem' }}>Hesap Olustur</h1>
                <p style={{ color: '#888', marginBottom: '2rem', fontSize: '0.95rem' }}>Ucretsiz basla, istedigin zaman yukselt.</p>

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                        <div>
                            <label style={{ fontSize: '0.85rem', color: '#555', display: 'block', marginBottom: '4px' }}>Ad</label>
                            <input type="text" required placeholder="Ahmet"
                                value={form.ad} onChange={e => setForm({ ...form, ad: e.target.value })}
                                style={{ width: '100%', padding: '0.6rem 0.8rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.95rem', boxSizing: 'border-box' }}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.85rem', color: '#555', display: 'block', marginBottom: '4px' }}>Soyad</label>
                            <input type="text" required placeholder="Yilmaz"
                                value={form.soyad} onChange={e => setForm({ ...form, soyad: e.target.value })}
                                style={{ width: '100%', padding: '0.6rem 0.8rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.95rem', boxSizing: 'border-box' }}
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ fontSize: '0.85rem', color: '#555', display: 'block', marginBottom: '4px' }}>E-posta</label>
                        <input type="email" required placeholder="ahmet@firma.com"
                            value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                            style={{ width: '100%', padding: '0.6rem 0.8rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.95rem', boxSizing: 'border-box' }}
                        />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ fontSize: '0.85rem', color: '#555', display: 'block', marginBottom: '4px' }}>Firma / Ciftlik Adi</label>
                        <input type="text" placeholder="Yilmaz Ciftligi"
                            value={form.firma} onChange={e => setForm({ ...form, firma: e.target.value })}
                            style={{ width: '100%', padding: '0.6rem 0.8rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.95rem', boxSizing: 'border-box' }}
                        />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ fontSize: '0.85rem', color: '#555', display: 'block', marginBottom: '4px' }}>Sifre</label>
                        <input type="password" required placeholder="En az 8 karakter"
                            value={form.sifre} onChange={e => setForm({ ...form, sifre: e.target.value })}
                            style={{ width: '100%', padding: '0.6rem 0.8rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.95rem', boxSizing: 'border-box' }}
                        />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ fontSize: '0.85rem', color: '#555', display: 'block', marginBottom: '4px' }}>Sifre Tekrar</label>
                        <input type="password" required placeholder="Sifrenizi tekrar girin"
                            value={form.sifreTekrar} onChange={e => setForm({ ...form, sifreTekrar: e.target.value })}
                            style={{ width: '100%', padding: '0.6rem 0.8rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.95rem', boxSizing: 'border-box' }}
                        />
                    </div>

                    <button type="submit" disabled={yukleniyor}
                        style={{ width: '100%', padding: '0.85rem', background: '#2D5A27', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '1rem', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        {yukleniyor ? 'Gonderiliyor...' : 'Devam Et'}
                    </button>
                </form>
            </div>
        </main>
    );
}