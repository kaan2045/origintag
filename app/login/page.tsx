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
        <main style={{ minHeight: '100vh', background: 'var(--surface)', color: 'var(--on-surface)' }}>
            <div style={{ position: 'sticky', top: '1.25rem', zIndex: 50, display: 'flex', justifyContent: 'center', padding: '0 1.5rem' }}>
                <nav className="od-navbar" style={{ width: '100%', maxWidth: 'var(--container-max)' }}>
                    <a href="/"><img src="/origin.png" alt="OriginTag" style={{ height: '26px', filter: 'brightness(0) invert(1)', opacity: 0.92 }} /></a>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ fontSize: '0.88rem', color: 'var(--on-surface-variant)' }}>
                            {lang === 'tr' ? 'Hesabın yok mu?' : "Don't have an account?"}{' '}
                            <a href="/register" className="od-link" style={{ fontWeight: 700 }}>
                                {lang === 'tr' ? 'Ücretsiz Başla' : 'Get Started'}
                            </a>
                        </span>
                        <LanguageSwitcher />
                    </div>
                </nav>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem 1.5rem' }}>
                <div className="od-glass" style={{ width: '100%', maxWidth: '460px', padding: '3rem' }}>
                    <span className="od-chip" style={{ marginBottom: '1.25rem' }}>
                        {lang === 'tr' ? 'Hoş geldiniz' : 'Welcome back'}
                    </span>
                    <h1 className="font-display" style={{ fontSize: '2.25rem', fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--on-surface)', margin: '1.1rem 0 0.6rem' }}>
                        {lang === 'tr' ? 'Giriş Yap' : 'Sign In'}
                    </h1>
                    <p style={{ color: 'var(--on-surface-variant)', marginBottom: '2.5rem', fontSize: '0.98rem' }}>
                        {lang === 'tr' ? 'Hesabına giriş yap ve devam et.' : 'Sign in to your account and continue.'}
                    </p>

                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '1.25rem' }}>
                            <label className="mono-label" style={{ color: 'var(--on-surface-variant)', display: 'block', marginBottom: '8px', fontSize: '0.68rem' }}>
                                {lang === 'tr' ? 'E-posta' : 'Email'}
                            </label>
                            <input type="email" required placeholder="ahmet@firma.com"
                                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                                className="od-field"
                            />
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <label className="mono-label" style={{ color: 'var(--on-surface-variant)', display: 'block', marginBottom: '8px', fontSize: '0.68rem' }}>
                                {lang === 'tr' ? 'Şifre' : 'Password'}
                            </label>
                            <input type="password" required placeholder={lang === 'tr' ? 'Şifrenizi girin' : 'Enter your password'}
                                value={form.sifre} onChange={e => setForm({ ...form, sifre: e.target.value })}
                                className="od-field"
                            />
                        </div>

                        <button type="submit" disabled={yukleniyor} className="od-btn-primary" style={{ width: '100%' }}>
                            {yukleniyor
                                ? (lang === 'tr' ? 'Giriş Yapılıyor...' : 'Signing in...')
                                : (lang === 'tr' ? 'Giriş Yap' : 'Sign In')}
                        </button>

                        <p style={{ textAlign: 'center', fontSize: '0.88rem', color: 'var(--on-surface-variant)', marginTop: '2rem' }}>
                            {lang === 'tr' ? 'Hesabın yok mu?' : "Don't have an account?"}{' '}
                            <a href="/register" className="od-link" style={{ fontWeight: 700 }}>
                                {lang === 'tr' ? 'Ücretsiz Başla' : 'Get Started Free'}
                            </a>
                        </p>
                    </form>
                </div>
            </div>
        </main>
    );
}
