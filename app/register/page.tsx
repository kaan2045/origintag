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
            <main style={{ minHeight: '100vh', background: 'var(--surface)', color: 'var(--on-surface)' }}>
                <div style={{ position: 'sticky', top: '1.25rem', zIndex: 50, display: 'flex', justifyContent: 'center', padding: '0 1.5rem' }}>
                    <nav className="od-navbar" style={{ width: '100%', maxWidth: 'var(--container-max)' }}>
                        <a href="/"><img src="/origin.png" alt="OriginTag" style={{ height: '26px', filter: 'brightness(0) invert(1)', opacity: 0.92 }} /></a>
                        <LanguageSwitcher />
                    </nav>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem 1.5rem' }}>
                    <div className="od-glass" style={{ width: '100%', maxWidth: '460px', padding: '2.75rem' }}>
                        <span className="od-chip" style={{ marginBottom: '1.25rem' }}>
                            {lang === 'tr' ? 'Son adım' : 'Final step'}
                        </span>
                        <h1 className="font-display" style={{ fontSize: '2.1rem', fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--on-surface)', margin: '1.1rem 0 0.6rem' }}>
                            {lang === 'tr' ? 'Email Doğrulama' : 'Email Verification'}
                        </h1>
                        <p style={{ color: 'var(--on-surface-variant)', marginBottom: '2.25rem', fontSize: '0.95rem', lineHeight: 1.7 }}>
                            <strong style={{ color: 'var(--on-surface)', fontWeight: 700 }}>{form.email}</strong>{' '}
                            {lang === 'tr' ? 'adresine 6 haneli kod gönderildi.' : 'A 6-digit code has been sent to this address.'}
                        </p>

                        <form onSubmit={otpDogrula}>
                            <div style={{ marginBottom: '1.75rem' }}>
                                <label className="mono-label" style={{ color: 'var(--on-surface-variant)', display: 'block', marginBottom: '8px', fontSize: '0.68rem' }}>
                                    {lang === 'tr' ? 'Doğrulama Kodu' : 'Verification Code'}
                                </label>
                                <input type="text" required placeholder="000000" maxLength={6}
                                    value={otp} onChange={e => setOtp(e.target.value)}
                                    className="od-field"
                                    style={{ fontSize: '1.6rem', textAlign: 'center', letterSpacing: '0.6rem', padding: '0.9rem 0.1rem' }}
                                />
                            </div>
                            <button type="submit" disabled={yukleniyor} className="od-btn-primary" style={{ width: '100%' }}>
                                {yukleniyor
                                    ? (lang === 'tr' ? 'Doğrulanıyor...' : 'Verifying...')
                                    : (lang === 'tr' ? 'Doğrula & Kayıt Ol' : 'Verify & Register')}
                            </button>
                            <button type="button" onClick={() => setAdim('form')} className="od-btn-ghost"
                                style={{ width: '100%', marginTop: '0.75rem' }}
                            >
                                {lang === 'tr' ? 'Geri Dön' : 'Go Back'}
                            </button>
                        </form>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main style={{ minHeight: '100vh', background: 'var(--surface)', color: 'var(--on-surface)' }}>
            <div style={{ position: 'sticky', top: '1.25rem', zIndex: 50, display: 'flex', justifyContent: 'center', padding: '0 1.5rem' }}>
                <nav className="od-navbar" style={{ width: '100%', maxWidth: 'var(--container-max)' }}>
                    <a href="/"><img src="/origin.png" alt="OriginTag" style={{ height: '26px', filter: 'brightness(0) invert(1)', opacity: 0.92 }} /></a>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <a href="/login" style={{ color: 'var(--on-surface-variant)', textDecoration: 'none', fontSize: '0.9rem' }}>
                            {lang === 'tr' ? 'Zaten hesabın var mı?' : 'Already have an account?'}{' '}
                            <span className="od-link" style={{ fontWeight: 700 }}>{lang === 'tr' ? 'Giriş Yap' : 'Sign In'}</span>
                        </a>
                        <LanguageSwitcher />
                    </div>
                </nav>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', padding: '3.5rem 1.5rem' }}>
                <div className="od-glass" style={{ width: '100%', maxWidth: '560px', padding: '3rem' }}>
                    <span className="od-chip" style={{ marginBottom: '1.25rem' }}>
                        {lang === 'tr' ? 'Ücretsiz kayıt' : 'Free registration'}
                    </span>
                    <h1 className="font-display" style={{ fontSize: '2.25rem', fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--on-surface)', margin: '1.1rem 0 0.6rem' }}>
                        {lang === 'tr' ? 'Hesap Oluştur' : 'Create Account'}
                    </h1>
                    <p style={{ color: 'var(--on-surface-variant)', marginBottom: '2.5rem', fontSize: '0.98rem' }}>
                        {lang === 'tr' ? 'Ücretsiz başla, istediğin zaman yükselt.' : 'Start for free, upgrade anytime.'}
                    </p>

                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                            <div>
                                <label className="mono-label" style={{ color: 'var(--on-surface-variant)', display: 'block', marginBottom: '8px', fontSize: '0.68rem' }}>
                                    {lang === 'tr' ? 'Ad' : 'First Name'}
                                </label>
                                <input type="text" required placeholder={lang === 'tr' ? 'Ahmet' : 'John'}
                                    value={form.ad} onChange={e => setForm({ ...form, ad: e.target.value })}
                                    className="od-field"
                                />
                            </div>
                            <div>
                                <label className="mono-label" style={{ color: 'var(--on-surface-variant)', display: 'block', marginBottom: '8px', fontSize: '0.68rem' }}>
                                    {lang === 'tr' ? 'Soyad' : 'Last Name'}
                                </label>
                                <input type="text" required placeholder={lang === 'tr' ? 'Yılmaz' : 'Smith'}
                                    value={form.soyad} onChange={e => setForm({ ...form, soyad: e.target.value })}
                                    className="od-field"
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: '1.25rem' }}>
                            <label className="mono-label" style={{ color: 'var(--on-surface-variant)', display: 'block', marginBottom: '8px', fontSize: '0.68rem' }}>
                                {lang === 'tr' ? 'E-posta' : 'Email'}
                            </label>
                            <input type="email" required placeholder="ahmet@firma.com"
                                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                                className="od-field"
                            />
                        </div>

                        <div style={{ marginBottom: '1.25rem' }}>
                            <label className="mono-label" style={{ color: 'var(--on-surface-variant)', display: 'block', marginBottom: '8px', fontSize: '0.68rem' }}>
                                {lang === 'tr' ? 'Firma / Çiftlik Adı' : 'Company / Farm Name'}
                            </label>
                            <input type="text" placeholder={lang === 'tr' ? 'Yılmaz Çiftliği' : 'Smith Farm'}
                                value={form.firma} onChange={e => setForm({ ...form, firma: e.target.value })}
                                className="od-field"
                            />
                        </div>

                        <div style={{ marginBottom: '1.25rem' }}>
                            <label className="mono-label" style={{ color: 'var(--on-surface-variant)', display: 'block', marginBottom: '8px', fontSize: '0.68rem' }}>
                                {lang === 'tr' ? 'Şifre' : 'Password'}
                            </label>
                            <input type="password" required placeholder={lang === 'tr' ? 'En az 8 karakter' : 'At least 8 characters'}
                                value={form.sifre} onChange={e => setForm({ ...form, sifre: e.target.value })}
                                className="od-field"
                            />
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <label className="mono-label" style={{ color: 'var(--on-surface-variant)', display: 'block', marginBottom: '8px', fontSize: '0.68rem' }}>
                                {lang === 'tr' ? 'Şifre Tekrar' : 'Confirm Password'}
                            </label>
                            <input type="password" required placeholder={lang === 'tr' ? 'Şifrenizi tekrar girin' : 'Repeat your password'}
                                value={form.sifreTekrar} onChange={e => setForm({ ...form, sifreTekrar: e.target.value })}
                                className="od-field"
                            />
                        </div>

                        <button type="submit" disabled={yukleniyor} className="od-btn-primary" style={{ width: '100%' }}>
                            {yukleniyor
                                ? (lang === 'tr' ? 'Gönderiliyor...' : 'Sending...')
                                : (lang === 'tr' ? 'Devam Et' : 'Continue')}
                        </button>
                    </form>
                </div>
            </div>
        </main>
    );
}
