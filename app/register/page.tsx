'use client';
import { useState } from 'react';
import SayfaNav from '../components/SayfaNav';
import { useLanguage } from '../context/LanguageContext';

export default function Register() {
    const { lang } = useLanguage();
    const [adim, setAdim] = useState<'form' | 'otp'>('form');
    const [form, setForm] = useState({
        ad: '', soyad: '', email: '', firma: '', sifre: '', sifreTekrar: ''
    });
    const [otp, setOtp] = useState('');
    const [yukleniyor, setYukleniyor] = useState(false);
    const [hata, setHata] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setHata(null);
        if (form.sifre !== form.sifreTekrar) {
            setHata(lang === 'tr' ? 'Şifreler eşleşmiyor.' : 'Passwords do not match.');
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
            if (data.basari) setAdim('otp');
            else setHata(data.hata || (lang === 'tr' ? 'Kod gönderilemedi' : 'Could not send the code'));
        } catch {
            setHata(lang === 'tr' ? 'Bağlantı hatası' : 'Connection error');
        }
        setYukleniyor(false);
    };

    const otpDogrula = async (e: React.FormEvent) => {
        e.preventDefault();
        setHata(null);
        setYukleniyor(true);
        try {
            const otpRes = await fetch('/api/otp-dogrula', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: form.email, kod: otp }),
            });
            const otpData = await otpRes.json();

            if (!otpData.basari) {
                setHata(lang === 'tr' ? 'Kod hatalı. Tekrar deneyin.' : 'Invalid code. Please try again.');
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
                return;
            }
            setHata(kayitData.hata || (lang === 'tr' ? 'Kayıt yapılamadı' : 'Registration failed'));
        } catch {
            setHata(lang === 'tr' ? 'Bağlantı hatası' : 'Connection error');
        }
        setYukleniyor(false);
    };

    const etiket: React.CSSProperties = { color: 'var(--on-surface-variant)', display: 'block', marginBottom: '8px', fontSize: '0.66rem' };

    if (adim === 'otp') {
        return (
            <main className="theme-light">
                <SayfaNav />
                <div className="ld-wrap pg-split" style={{ padding: 'clamp(3rem, 7vw, 6rem) 1.5rem 6rem', maxWidth: '1080px' }}>
                    <div>
                        <p className="pg-eyebrow">{lang === 'tr' ? 'Son adım' : 'Final step'}</p>
                        <h1 className="pg-h1">{lang === 'tr' ? 'E-posta Doğrulama' : 'Email Verification'}</h1>
                        <p className="pg-lead">
                            <strong style={{ color: 'var(--on-surface)', fontWeight: 600 }}>{form.email}</strong>{' '}
                            {lang === 'tr' ? 'adresine 6 haneli bir kod gönderildi.' : '— a 6-digit code has been sent to this address.'}
                        </p>
                    </div>

                    <form onSubmit={otpDogrula} className="od-glass" style={{ padding: 'clamp(1.75rem, 4vw, 2.75rem)', borderRadius: '20px' }}>
                        <div style={{ marginBottom: '1.75rem' }}>
                            <label className="mono-label" style={etiket}>{lang === 'tr' ? 'Doğrulama Kodu' : 'Verification Code'}</label>
                            <input type="text" required placeholder="000000" maxLength={6} inputMode="numeric"
                                value={otp} onChange={e => setOtp(e.target.value)}
                                className="od-field"
                                style={{ fontSize: '1.6rem', textAlign: 'center', letterSpacing: '0.6rem', padding: '0.9rem 0.1rem' }} />
                        </div>
                        {hata && <p style={{ color: 'var(--error)', fontSize: '0.86rem', margin: '0 0 1.25rem' }}>{hata}</p>}
                        <button type="submit" disabled={yukleniyor} className="od-btn-primary" style={{ width: '100%', padding: '0.95rem' }}>
                            {yukleniyor ? (lang === 'tr' ? 'Doğrulanıyor…' : 'Verifying…') : (lang === 'tr' ? 'Doğrula ve Kayıt Ol' : 'Verify & Register')}
                        </button>
                        <button type="button" onClick={() => setAdim('form')} className="od-btn-ghost" style={{ width: '100%', marginTop: '0.75rem' }}>
                            {lang === 'tr' ? 'Geri dön' : 'Go back'}
                        </button>
                    </form>
                </div>
            </main>
        );
    }

    return (
        <main className="theme-light">
            <SayfaNav baglantilar={[
                { etiket: lang === 'tr' ? 'Zaten hesabın var mı?' : 'Already have an account?', href: '/login' },
                { etiket: lang === 'tr' ? 'Giriş Yap' : 'Sign In', href: '/login', vurgulu: true },
            ]} />

            <div className="ld-wrap pg-split" style={{ padding: 'clamp(3rem, 7vw, 6rem) 1.5rem 6rem', maxWidth: '1080px' }}>
                <div>
                    <p className="pg-eyebrow">{lang === 'tr' ? 'Ücretsiz kayıt' : 'Free registration'}</p>
                    <h1 className="pg-h1">{lang === 'tr' ? 'Hesap Oluştur' : 'Create Account'}</h1>
                    <p className="pg-lead">
                        {lang === 'tr'
                            ? 'İki dakikada hesap açın, ilk ürününüzü ekleyin, QR kodunuzu alın. Teknik bilgi gerekmez.'
                            : 'Open an account in two minutes, add your first product, get your QR. No technical knowledge needed.'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="od-glass" style={{ padding: 'clamp(1.75rem, 4vw, 2.75rem)', borderRadius: '20px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                        <div>
                            <label className="mono-label" style={etiket}>{lang === 'tr' ? 'Ad' : 'First Name'}</label>
                            <input type="text" required placeholder={lang === 'tr' ? 'Ahmet' : 'John'}
                                value={form.ad} onChange={e => setForm({ ...form, ad: e.target.value })} className="od-field" />
                        </div>
                        <div>
                            <label className="mono-label" style={etiket}>{lang === 'tr' ? 'Soyad' : 'Last Name'}</label>
                            <input type="text" required placeholder={lang === 'tr' ? 'Yılmaz' : 'Smith'}
                                value={form.soyad} onChange={e => setForm({ ...form, soyad: e.target.value })} className="od-field" />
                        </div>
                    </div>
                    <div style={{ marginBottom: '1.25rem' }}>
                        <label className="mono-label" style={etiket}>{lang === 'tr' ? 'E-posta' : 'Email'}</label>
                        <input type="email" required placeholder="ahmet@firma.com"
                            value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="od-field" />
                    </div>
                    <div style={{ marginBottom: '1.25rem' }}>
                        <label className="mono-label" style={etiket}>{lang === 'tr' ? 'Firma / Çiftlik Adı' : 'Company / Farm Name'}</label>
                        <input type="text" placeholder={lang === 'tr' ? 'Yılmaz Çiftliği' : 'Smith Farm'}
                            value={form.firma} onChange={e => setForm({ ...form, firma: e.target.value })} className="od-field" />
                    </div>
                    <div style={{ marginBottom: '1.25rem' }}>
                        <label className="mono-label" style={etiket}>{lang === 'tr' ? 'Şifre' : 'Password'}</label>
                        <input type="password" required placeholder={lang === 'tr' ? 'En az 8 karakter' : 'At least 8 characters'}
                            value={form.sifre} onChange={e => setForm({ ...form, sifre: e.target.value })} className="od-field" />
                    </div>
                    <div style={{ marginBottom: '1.75rem' }}>
                        <label className="mono-label" style={etiket}>{lang === 'tr' ? 'Şifre Tekrar' : 'Confirm Password'}</label>
                        <input type="password" required placeholder={lang === 'tr' ? 'Şifrenizi tekrar girin' : 'Repeat your password'}
                            value={form.sifreTekrar} onChange={e => setForm({ ...form, sifreTekrar: e.target.value })} className="od-field" />
                    </div>

                    {hata && <p style={{ color: 'var(--error)', fontSize: '0.86rem', margin: '0 0 1.25rem' }}>{hata}</p>}

                    <button type="submit" disabled={yukleniyor} className="od-btn-primary" style={{ width: '100%', padding: '0.95rem' }}>
                        {yukleniyor ? (lang === 'tr' ? 'Gönderiliyor…' : 'Sending…') : (lang === 'tr' ? 'Devam Et' : 'Continue')}
                    </button>
                </form>
            </div>
        </main>
    );
}
