'use client';
import { useState } from 'react';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { useLanguage } from '../context/LanguageContext';

export default function Register() {
    const { lang } = useLanguage();
    const [adim, setAdim] = useState<'form' | 'otp'>('form');
    const [form, setForm] = useState({
        ad: '', soyad: '', email: '', firma: '', sifre: '', sifreTekrar: ''
    });
    const [otp, setOtp] = useState('');
    const [yukleniyor, setYukleniyor] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (form.sifre !== form.sifreTekrar) {
            alert(lang === 'tr' ? 'Şifreler eşleşmiyor!' : 'Passwords do not match!');
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
                alert((lang === 'tr' ? 'Hata: ' : 'Error: ') + data.hata);
            }
        } catch {
            alert(lang === 'tr' ? 'Bağlantı hatası!' : 'Connection error!');
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
                alert(lang === 'tr' ? 'Kod hatalı! Tekrar deneyin.' : 'Invalid code! Please try again.');
                setOtp('');
                setYukleniyor(false);
                return;
            }

            const kayitRes = await fetch('/api/kayit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ad: form.ad, soyad: form.soyad,
                    email: form.email, firma: form.firma, sifre: form.sifre,
                }),
            });
            const kayitData = await kayitRes.json();

            if (kayitData.basari) {
                localStorage.setItem('kullanici_id', kayitData.kullanici_id);
                localStorage.setItem('kullanici_ad', kayitData.ad);
                localStorage.setItem('kullanici_email', form.email);
                window.location.href = '/dashboard';
            } else {
                alert((lang === 'tr' ? 'Hata: ' : 'Error: ') + kayitData.hata);
            }
        } catch {
            alert(lang === 'tr' ? 'Bağlantı hatası!' : 'Connection error!');
        }
        setYukleniyor(false);
    };

    if (adim === 'otp') {
        return (
            <main style={{ minHeight: '100vh', background: 'var(--parchment)' }}>
                <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 2.5rem', borderBottom: '1px solid #ece6d8' }}>
                    <a href="/"><img src="/origin.png" alt="OriginTag" style={{ height: '32px' }} /></a>
                    <LanguageSwitcher />
                </nav>

                <div style={{ maxWidth: '420px', margin: '5rem auto', background: '#fff', border: '1px solid #ece6d8', padding: '2.5rem' }}>
                    <h1 className="font-display" style={{ fontSize: '2rem', fontWeight: 600, letterSpacing: '-0.01em', color: 'var(--ink)', marginBottom: '0.5rem' }}>
                        {lang === 'tr' ? 'Email Doğrulama' : 'Email Verification'}
                    </h1>
                    <p style={{ color: '#888', marginBottom: '2rem', fontSize: '0.95rem' }}>
                        <strong>{form.email}</strong>{' '}
                        {lang === 'tr' ? 'adresine 6 haneli kod gönderildi.' : 'A 6-digit code has been sent to this address.'}
                    </p>

                    <form onSubmit={otpDogrula}>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ fontSize: '0.85rem', color: '#555', display: 'block', marginBottom: '4px' }}>
                                {lang === 'tr' ? 'Doğrulama Kodu' : 'Verification Code'}
                            </label>
                            <input type="text" required placeholder="000000" maxLength={6}
                                value={otp} onChange={e => setOtp(e.target.value)}
                                style={{ width: '100%', padding: '0.8rem', border: '2px solid var(--ink)', borderRadius: '2px', fontSize: '1.5rem', textAlign: 'center', letterSpacing: '0.5rem', boxSizing: 'border-box' }}
                            />
                        </div>
                        <button type="submit" disabled={yukleniyor}
                            style={{ width: '100%', padding: '0.85rem', background: 'var(--ink)', color: '#fff', border: 'none', borderRadius: '2px', fontSize: '1rem', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                            {yukleniyor
                                ? (lang === 'tr' ? 'Doğrulanıyor...' : 'Verifying...')
                                : (lang === 'tr' ? 'Doğrula & Kayıt Ol' : 'Verify & Register')}
                        </button>
                        <button type="button" onClick={() => setAdim('form')}
                            style={{ width: '100%', padding: '0.75rem', background: 'transparent', color: '#888', border: 'none', fontSize: '0.9rem', cursor: 'pointer', marginTop: '0.5rem' }}
                        >
                            {lang === 'tr' ? 'Geri Dön' : 'Go Back'}
                        </button>
                    </form>
                </div>
            </main>
        );
    }

    return (
        <main style={{ minHeight: '100vh', background: 'var(--parchment)' }}>
            <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 2.5rem', borderBottom: '1px solid #ece6d8' }}>
                <a href="/"><img src="/origin.png" alt="OriginTag" style={{ height: '32px' }} /></a>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <a href="/login" style={{ color: '#6b6558', textDecoration: 'none', fontSize: '0.9rem' }}>
                        {lang === 'tr' ? 'Zaten hesabın var mı?' : 'Already have an account?'}{' '}
                        <strong>{lang === 'tr' ? 'Giriş Yap' : 'Sign In'}</strong>
                    </a>
                    <LanguageSwitcher />
                </div>
            </nav>

            <div style={{ maxWidth: '500px', margin: '3rem auto', background: '#fff', border: '1px solid #ece6d8', padding: '2.5rem' }}>
                <h1 className="font-display" style={{ fontSize: '2rem', fontWeight: 600, letterSpacing: '-0.01em', color: 'var(--ink)', marginBottom: '0.5rem' }}>
                    {lang === 'tr' ? 'Hesap Oluştur' : 'Create Account'}
                </h1>
                <p style={{ color: '#888', marginBottom: '2rem', fontSize: '0.95rem' }}>
                    {lang === 'tr' ? 'Ücretsiz başla, istediğin zaman yükselt.' : 'Start for free, upgrade anytime.'}
                </p>

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                        <div>
                            <label style={{ fontSize: '0.85rem', color: '#555', display: 'block', marginBottom: '4px' }}>
                                {lang === 'tr' ? 'Ad' : 'First Name'}
                            </label>
                            <input type="text" required placeholder={lang === 'tr' ? 'Ahmet' : 'John'}
                                value={form.ad} onChange={e => setForm({ ...form, ad: e.target.value })}
                                style={{ width: '100%', padding: '0.6rem 0.8rem', border: '1px solid #d8cfb8', borderRadius: '2px', fontSize: '0.95rem', boxSizing: 'border-box' }}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.85rem', color: '#555', display: 'block', marginBottom: '4px' }}>
                                {lang === 'tr' ? 'Soyad' : 'Last Name'}
                            </label>
                            <input type="text" required placeholder={lang === 'tr' ? 'Yılmaz' : 'Smith'}
                                value={form.soyad} onChange={e => setForm({ ...form, soyad: e.target.value })}
                                style={{ width: '100%', padding: '0.6rem 0.8rem', border: '1px solid #d8cfb8', borderRadius: '2px', fontSize: '0.95rem', boxSizing: 'border-box' }}
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ fontSize: '0.85rem', color: '#555', display: 'block', marginBottom: '4px' }}>
                            {lang === 'tr' ? 'E-posta' : 'Email'}
                        </label>
                        <input type="email" required placeholder="ahmet@firma.com"
                            value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                            style={{ width: '100%', padding: '0.6rem 0.8rem', border: '1px solid #d8cfb8', borderRadius: '2px', fontSize: '0.95rem', boxSizing: 'border-box' }}
                        />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ fontSize: '0.85rem', color: '#555', display: 'block', marginBottom: '4px' }}>
                            {lang === 'tr' ? 'Firma / Çiftlik Adı' : 'Company / Farm Name'}
                        </label>
                        <input type="text" placeholder={lang === 'tr' ? 'Yılmaz Çiftliği' : 'Smith Farm'}
                            value={form.firma} onChange={e => setForm({ ...form, firma: e.target.value })}
                            style={{ width: '100%', padding: '0.6rem 0.8rem', border: '1px solid #d8cfb8', borderRadius: '2px', fontSize: '0.95rem', boxSizing: 'border-box' }}
                        />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ fontSize: '0.85rem', color: '#555', display: 'block', marginBottom: '4px' }}>
                            {lang === 'tr' ? 'Şifre' : 'Password'}
                        </label>
                        <input type="password" required placeholder={lang === 'tr' ? 'En az 8 karakter' : 'At least 8 characters'}
                            value={form.sifre} onChange={e => setForm({ ...form, sifre: e.target.value })}
                            style={{ width: '100%', padding: '0.6rem 0.8rem', border: '1px solid #d8cfb8', borderRadius: '2px', fontSize: '0.95rem', boxSizing: 'border-box' }}
                        />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ fontSize: '0.85rem', color: '#555', display: 'block', marginBottom: '4px' }}>
                            {lang === 'tr' ? 'Şifre Tekrar' : 'Confirm Password'}
                        </label>
                        <input type="password" required placeholder={lang === 'tr' ? 'Şifrenizi tekrar girin' : 'Repeat your password'}
                            value={form.sifreTekrar} onChange={e => setForm({ ...form, sifreTekrar: e.target.value })}
                            style={{ width: '100%', padding: '0.6rem 0.8rem', border: '1px solid #d8cfb8', borderRadius: '2px', fontSize: '0.95rem', boxSizing: 'border-box' }}
                        />
                    </div>

                    <button type="submit" disabled={yukleniyor}
                        style={{ width: '100%', padding: '0.85rem', background: 'var(--ink)', color: '#fff', border: 'none', borderRadius: '2px', fontSize: '1rem', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        {yukleniyor
                            ? (lang === 'tr' ? 'Gönderiliyor...' : 'Sending...')
                            : (lang === 'tr' ? 'Devam Et' : 'Continue')}
                    </button>
                </form>
            </div>
        </main>
    );
}
