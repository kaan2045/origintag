'use client';
import { useState } from 'react';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { useLanguage } from '../context/LanguageContext';

export default function Login() {
    const { lang } = useLanguage();
    const [form, setForm] = useState({ email: '', sifre: '' });
    const [yukleniyor, setYukleniyor] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setYukleniyor(true);
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
            } else {
                alert((lang === 'tr' ? 'Hata: ' : 'Error: ') + data.hata);
            }
        } catch {
            alert(lang === 'tr' ? 'Bağlantı hatası!' : 'Connection error!');
        }
        setYukleniyor(false);
    };

    return (
        <main style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--cream)' }}>
            <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.75rem 2.5rem', borderBottom: '1px solid var(--line)' }}>
                <a href="/"><img src="/origin.png" alt="OriginTag" style={{ height: '28px', filter: 'brightness(0) invert(1)', opacity: 0.92 }} /></a>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <span style={{ fontSize: '0.88rem', color: 'var(--cream-dim)' }}>
                        {lang === 'tr' ? 'Hesabın yok mu?' : "Don't have an account?"}{' '}
                        <a href="/register" className="ot-link-gold" style={{ fontWeight: 600 }}>
                            {lang === 'tr' ? 'Ücretsiz Başla' : 'Get Started'}
                        </a>
                    </span>
                    <LanguageSwitcher />
                </div>
            </nav>

            <div style={{ maxWidth: '440px', margin: '7rem auto', padding: '0 1.5rem' }}>
                <p className="mono-label" style={{ color: 'var(--gold)', marginBottom: '1rem' }}>
                    {lang === 'tr' ? 'Hoş geldiniz' : 'Welcome back'}
                </p>
                <h1 className="font-display" style={{ fontSize: '2.5rem', fontWeight: 500, letterSpacing: '-0.02em', color: 'var(--cream)', marginBottom: '0.6rem' }}>
                    {lang === 'tr' ? 'Giriş Yap' : 'Sign In'}
                </h1>
                <p style={{ color: 'var(--cream-dim)', marginBottom: '3rem', fontSize: '0.98rem', fontWeight: 300 }}>
                    {lang === 'tr' ? 'Hesabına giriş yap ve devam et.' : 'Sign in to your account and continue.'}
                </p>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1.75rem' }}>
                        <label className="mono-label" style={{ color: 'var(--cream-faint)', display: 'block', marginBottom: '10px', fontSize: '0.66rem' }}>
                            {lang === 'tr' ? 'E-posta' : 'Email'}
                        </label>
                        <input type="email" required placeholder="ahmet@firma.com"
                            value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                            className="ot-field"
                        />
                    </div>

                    <div style={{ marginBottom: '2.75rem' }}>
                        <label className="mono-label" style={{ color: 'var(--cream-faint)', display: 'block', marginBottom: '10px', fontSize: '0.66rem' }}>
                            {lang === 'tr' ? 'Şifre' : 'Password'}
                        </label>
                        <input type="password" required placeholder={lang === 'tr' ? 'Şifrenizi girin' : 'Enter your password'}
                            value={form.sifre} onChange={e => setForm({ ...form, sifre: e.target.value })}
                            className="ot-field"
                        />
                    </div>

                    <button type="submit" disabled={yukleniyor} className="ot-btn-solid" style={{ width: '100%' }}>
                        {yukleniyor
                            ? (lang === 'tr' ? 'Giriş Yapılıyor...' : 'Signing in...')
                            : (lang === 'tr' ? 'Giriş Yap' : 'Sign In')}
                    </button>

                    <p style={{ textAlign: 'center', fontSize: '0.88rem', color: 'var(--cream-faint)', marginTop: '2.25rem' }}>
                        {lang === 'tr' ? 'Hesabın yok mu?' : "Don't have an account?"}{' '}
                        <a href="/register" className="ot-link-gold" style={{ fontWeight: 600 }}>
                            {lang === 'tr' ? 'Ücretsiz Başla' : 'Get Started Free'}
                        </a>
                    </p>
                </form>
            </div>
        </main>
    );
}
