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
        <main style={{ minHeight: '100vh', background: 'var(--parchment)' }}>
            <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 2.5rem', borderBottom: '1px solid #ece6d8' }}>
                <a href="/"><img src="/origin.png" alt="OriginTag" style={{ height: '32px' }} /></a>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontSize: '0.9rem', color: '#6b6558' }}>
                        {lang === 'tr' ? 'Hesabın yok mu?' : "Don't have an account?"}{' '}
                        <a href="/register" style={{ color: 'var(--ink)', fontWeight: 600, textDecoration: 'none' }}>
                            {lang === 'tr' ? 'Ücretsiz Başla' : 'Get Started'}
                        </a>
                    </span>
                    <LanguageSwitcher />
                </div>
            </nav>

            <div style={{ maxWidth: '420px', margin: '6rem auto', background: '#fff', border: '1px solid #ece6d8', padding: '3rem' }}>
                <p className="mono-label" style={{ color: '#9a8f78', marginBottom: '0.75rem' }}>
                    {lang === 'tr' ? 'Hoş geldiniz' : 'Welcome back'}
                </p>
                <h1 className="font-display" style={{ fontSize: '2rem', fontWeight: 600, letterSpacing: '-0.01em', color: 'var(--ink)', marginBottom: '0.5rem' }}>
                    {lang === 'tr' ? 'Giriş Yap' : 'Sign In'}
                </h1>
                <p style={{ color: '#8a8377', marginBottom: '2.25rem', fontSize: '0.95rem' }}>
                    {lang === 'tr' ? 'Hesabına giriş yap ve devam et.' : 'Sign in to your account and continue.'}
                </p>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1.1rem' }}>
                        <label className="mono-label" style={{ color: '#6b6558', display: 'block', marginBottom: '6px', fontSize: '0.68rem' }}>
                            {lang === 'tr' ? 'E-posta' : 'Email'}
                        </label>
                        <input type="email" required placeholder="ahmet@firma.com"
                            value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                            style={{ width: '100%', padding: '0.75rem 0.9rem', border: '1px solid #d8cfb8', borderRadius: '2px', fontSize: '0.95rem', boxSizing: 'border-box' }}
                        />
                    </div>

                    <div style={{ marginBottom: '1.75rem' }}>
                        <label className="mono-label" style={{ color: '#6b6558', display: 'block', marginBottom: '6px', fontSize: '0.68rem' }}>
                            {lang === 'tr' ? 'Şifre' : 'Password'}
                        </label>
                        <input type="password" required placeholder={lang === 'tr' ? 'Şifrenizi girin' : 'Enter your password'}
                            value={form.sifre} onChange={e => setForm({ ...form, sifre: e.target.value })}
                            style={{ width: '100%', padding: '0.75rem 0.9rem', border: '1px solid #d8cfb8', borderRadius: '2px', fontSize: '0.95rem', boxSizing: 'border-box' }}
                        />
                    </div>

                    <button type="submit" disabled={yukleniyor}
                        style={{ width: '100%', padding: '0.9rem', background: 'var(--ink)', color: '#fff', border: 'none', borderRadius: '2px', fontSize: '0.98rem', cursor: 'pointer', fontWeight: 600 }}
                    >
                        {yukleniyor
                            ? (lang === 'tr' ? 'Giriş Yapılıyor...' : 'Signing in...')
                            : (lang === 'tr' ? 'Giriş Yap' : 'Sign In')}
                    </button>

                    <p style={{ textAlign: 'center', fontSize: '0.88rem', color: '#a49c8c', marginTop: '1.75rem' }}>
                        {lang === 'tr' ? 'Hesabın yok mu?' : "Don't have an account?"}{' '}
                        <a href="/register" style={{ color: 'var(--ink)', textDecoration: 'none', fontWeight: 600 }}>
                            {lang === 'tr' ? 'Ücretsiz Başla' : 'Get Started Free'}
                        </a>
                    </p>
                </form>
            </div>
        </main>
    );
}
