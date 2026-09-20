'use client';
import { useState } from 'react';
import SayfaNav from '../components/SayfaNav';
import { useLanguage } from '../context/LanguageContext';

export default function Login() {
    const { lang } = useLanguage();
    const [form, setForm] = useState({ email: '', sifre: '' });
    const [yukleniyor, setYukleniyor] = useState(false);
    const [hata, setHata] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setYukleniyor(true);
        setHata(null);
        try {
            const res = await fetch('/api/giris', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (data.basari) {
                localStorage.setItem('kullanici_id', data.kullanici_id);
                localStorage.setItem('kullanici_ad', data.ad);
                localStorage.setItem('kullanici_email', form.email);
                window.location.href = '/dashboard';
                return;
            }
            setHata(data.hata || (lang === 'tr' ? 'Giriş yapılamadı' : 'Sign-in failed'));
        } catch {
            setHata(lang === 'tr' ? 'Bağlantı hatası' : 'Connection error');
        }
        setYukleniyor(false);
    };

    return (
        <main className="theme-light">
            <SayfaNav baglantilar={[
                { etiket: lang === 'tr' ? 'Hesabın yok mu?' : "Don't have an account?", href: '/register' },
                { etiket: lang === 'tr' ? 'Ücretsiz Başla' : 'Get Started Free', href: '/register', vurgulu: true },
            ]} />

            <div className="ld-wrap pg-split" style={{ padding: 'clamp(3rem, 7vw, 6rem) 1.5rem 6rem', maxWidth: '1080px' }}>
                <div>
                    <p className="pg-eyebrow">{lang === 'tr' ? 'Hoş geldiniz' : 'Welcome back'}</p>
                    <h1 className="pg-h1">{lang === 'tr' ? 'Giriş Yap' : 'Sign In'}</h1>
                    <p className="pg-lead">
                        {lang === 'tr'
                            ? 'Hesabınıza girin; ürünlerinizi, QR kodlarınızı ve pasaportlarınızı yönetin.'
                            : 'Sign in to manage your products, QR codes and passports.'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="od-glass" style={{ padding: 'clamp(1.75rem, 4vw, 2.75rem)', borderRadius: '20px' }}>
                    <div style={{ marginBottom: '1.25rem' }}>
                        <label className="mono-label" style={{ color: 'var(--on-surface-variant)', display: 'block', marginBottom: '8px', fontSize: '0.66rem' }}>
                            {lang === 'tr' ? 'E-posta' : 'Email'}
                        </label>
                        <input type="email" required placeholder="ahmet@firma.com"
                            value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                            className="od-field" />
                    </div>
                    <div style={{ marginBottom: '1.75rem' }}>
                        <label className="mono-label" style={{ color: 'var(--on-surface-variant)', display: 'block', marginBottom: '8px', fontSize: '0.66rem' }}>
                            {lang === 'tr' ? 'Şifre' : 'Password'}
                        </label>
                        <input type="password" required placeholder={lang === 'tr' ? 'Şifrenizi girin' : 'Enter your password'}
                            value={form.sifre} onChange={e => setForm({ ...form, sifre: e.target.value })}
                            className="od-field" />
                    </div>

                    {hata && <p style={{ color: 'var(--error)', fontSize: '0.86rem', margin: '0 0 1.25rem' }}>{hata}</p>}

                    <button type="submit" disabled={yukleniyor} className="od-btn-primary" style={{ width: '100%', padding: '0.95rem' }}>
                        {yukleniyor ? (lang === 'tr' ? 'Giriş yapılıyor…' : 'Signing in…') : (lang === 'tr' ? 'Giriş Yap' : 'Sign In')}
                    </button>

                    <p style={{ fontSize: '0.86rem', color: 'var(--on-surface-variant)', marginTop: '1.75rem', marginBottom: 0 }}>
                        {lang === 'tr' ? 'Hesabın yok mu?' : "Don't have an account?"}{' '}
                        <a href="/register" className="od-link">{lang === 'tr' ? 'Ücretsiz başla' : 'Get started free'}</a>
                    </p>
                </form>
            </div>
        </main>
    );
}
