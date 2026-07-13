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
            <main style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--cream)' }}>
                <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.75rem 2.5rem', borderBottom: '1px solid var(--line)' }}>
                    <a href="/"><img src="/origin.png" alt="OriginTag" style={{ height: '28px', filter: 'brightness(0) invert(1)', opacity: 0.92 }} /></a>
                    <LanguageSwitcher />
                </nav>

                <div style={{ maxWidth: '440px', margin: '6rem auto', padding: '0 1.5rem' }}>
                    <p className="mono-label" style={{ color: 'var(--gold)', marginBottom: '1rem' }}>
                        {lang === 'tr' ? 'Son adım' : 'Final step'}
                    </p>
                    <h1 className="font-display" style={{ fontSize: '2.3rem', fontWeight: 500, letterSpacing: '-0.02em', color: 'var(--cream)', marginBottom: '0.6rem' }}>
                        {lang === 'tr' ? 'Email Doğrulama' : 'Email Verification'}
                    </h1>
                    <p style={{ color: 'var(--cream-dim)', marginBottom: '2.75rem', fontSize: '0.95rem', fontWeight: 300, lineHeight: 1.7 }}>
                        <strong style={{ color: 'var(--cream)', fontWeight: 600 }}>{form.email}</strong>{' '}
                        {lang === 'tr' ? 'adresine 6 haneli kod gönderildi.' : 'A 6-digit code has been sent to this address.'}
                    </p>

                    <form onSubmit={otpDogrula}>
                        <div style={{ marginBottom: '2rem' }}>
                            <label className="mono-label" style={{ color: 'var(--cream-faint)', display: 'block', marginBottom: '10px', fontSize: '0.66rem' }}>
                                {lang === 'tr' ? 'Doğrulama Kodu' : 'Verification Code'}
                            </label>
                            <input type="text" required placeholder="000000" maxLength={6}
                                value={otp} onChange={e => setOtp(e.target.value)}
                                className="ot-field"
                                style={{ fontSize: '1.6rem', textAlign: 'center', letterSpacing: '0.6rem', fontFamily: 'var(--font-mono), ui-monospace, monospace', padding: '0.9rem 0.1rem' }}
                            />
                        </div>
                        <button type="submit" disabled={yukleniyor} className="ot-btn-solid" style={{ width: '100%' }}>
                            {yukleniyor
                                ? (lang === 'tr' ? 'Doğrulanıyor...' : 'Verifying...')
                                : (lang === 'tr' ? 'Doğrula & Kayıt Ol' : 'Verify & Register')}
                        </button>
                        <button type="button" onClick={() => setAdim('form')}
                            className="mono-label"
                            style={{ width: '100%', padding: '0.85rem', background: 'transparent', color: 'var(--cream-faint)', border: 'none', fontSize: '0.7rem', cursor: 'pointer', marginTop: '0.75rem', letterSpacing: '0.12em' }}
                        >
                            {lang === 'tr' ? 'Geri Dön' : 'Go Back'}
                        </button>
                    </form>
                </div>
            </main>
        );
    }

    return (
        <main style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--cream)' }}>
            <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.75rem 2.5rem', borderBottom: '1px solid var(--line)' }}>
                <a href="/"><img src="/origin.png" alt="OriginTag" style={{ height: '28px', filter: 'brightness(0) invert(1)', opacity: 0.92 }} /></a>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <a href="/login" style={{ color: 'var(--cream-dim)', textDecoration: 'none', fontSize: '0.9rem' }}>
                        {lang === 'tr' ? 'Zaten hesabın var mı?' : 'Already have an account?'}{' '}
                        <span className="ot-link-gold" style={{ fontWeight: 600 }}>{lang === 'tr' ? 'Giriş Yap' : 'Sign In'}</span>
                    </a>
                    <LanguageSwitcher />
                </div>
            </nav>

            <div style={{ maxWidth: '540px', margin: '4rem auto', padding: '0 1.5rem 3rem' }}>
                <p className="mono-label" style={{ color: 'var(--gold)', marginBottom: '1rem' }}>
                    {lang === 'tr' ? 'Ücretsiz kayıt' : 'Free registration'}
                </p>
                <h1 className="font-display" style={{ fontSize: '2.5rem', fontWeight: 500, letterSpacing: '-0.02em', color: 'var(--cream)', marginBottom: '0.6rem' }}>
                    {lang === 'tr' ? 'Hesap Oluştur' : 'Create Account'}
                </h1>
                <p style={{ color: 'var(--cream-dim)', marginBottom: '2.75rem', fontSize: '0.98rem', fontWeight: 300 }}>
                    {lang === 'tr' ? 'Ücretsiz başla, istediğin zaman yükselt.' : 'Start for free, upgrade anytime.'}
                </p>

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.75rem' }}>
                        <div>
                            <label className="mono-label" style={{ color: 'var(--cream-faint)', display: 'block', marginBottom: '10px', fontSize: '0.66rem' }}>
                                {lang === 'tr' ? 'Ad' : 'First Name'}
                            </label>
                            <input type="text" required placeholder={lang === 'tr' ? 'Ahmet' : 'John'}
                                value={form.ad} onChange={e => setForm({ ...form, ad: e.target.value })}
                                className="ot-field"
                            />
                        </div>
                        <div>
                            <label className="mono-label" style={{ color: 'var(--cream-faint)', display: 'block', marginBottom: '10px', fontSize: '0.66rem' }}>
                                {lang === 'tr' ? 'Soyad' : 'Last Name'}
                            </label>
                            <input type="text" required placeholder={lang === 'tr' ? 'Yılmaz' : 'Smith'}
                                value={form.soyad} onChange={e => setForm({ ...form, soyad: e.target.value })}
                                className="ot-field"
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '1.75rem' }}>
                        <label className="mono-label" style={{ color: 'var(--cream-faint)', display: 'block', marginBottom: '10px', fontSize: '0.66rem' }}>
                            {lang === 'tr' ? 'E-posta' : 'Email'}
                        </label>
                        <input type="email" required placeholder="ahmet@firma.com"
                            value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                            className="ot-field"
                        />
                    </div>

                    <div style={{ marginBottom: '1.75rem' }}>
                        <label className="mono-label" style={{ color: 'var(--cream-faint)', display: 'block', marginBottom: '10px', fontSize: '0.66rem' }}>
                            {lang === 'tr' ? 'Firma / Çiftlik Adı' : 'Company / Farm Name'}
                        </label>
                        <input type="text" placeholder={lang === 'tr' ? 'Yılmaz Çiftliği' : 'Smith Farm'}
                            value={form.firma} onChange={e => setForm({ ...form, firma: e.target.value })}
                            className="ot-field"
                        />
                    </div>

                    <div style={{ marginBottom: '1.75rem' }}>
                        <label className="mono-label" style={{ color: 'var(--cream-faint)', display: 'block', marginBottom: '10px', fontSize: '0.66rem' }}>
                            {lang === 'tr' ? 'Şifre' : 'Password'}
                        </label>
                        <input type="password" required placeholder={lang === 'tr' ? 'En az 8 karakter' : 'At least 8 characters'}
                            value={form.sifre} onChange={e => setForm({ ...form, sifre: e.target.value })}
                            className="ot-field"
                        />
                    </div>

                    <div style={{ marginBottom: '2.75rem' }}>
                        <label className="mono-label" style={{ color: 'var(--cream-faint)', display: 'block', marginBottom: '10px', fontSize: '0.66rem' }}>
                            {lang === 'tr' ? 'Şifre Tekrar' : 'Confirm Password'}
                        </label>
                        <input type="password" required placeholder={lang === 'tr' ? 'Şifrenizi tekrar girin' : 'Repeat your password'}
                            value={form.sifreTekrar} onChange={e => setForm({ ...form, sifreTekrar: e.target.value })}
                            className="ot-field"
                        />
                    </div>

                    <button type="submit" disabled={yukleniyor} className="ot-btn-solid" style={{ width: '100%' }}>
                        {yukleniyor
                            ? (lang === 'tr' ? 'Gönderiliyor...' : 'Sending...')
                            : (lang === 'tr' ? 'Devam Et' : 'Continue')}
                    </button>
                </form>
            </div>
        </main>
    );
}
