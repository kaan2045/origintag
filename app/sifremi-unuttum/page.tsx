'use client';
import { useState } from 'react';
import SayfaNav from '../components/SayfaNav';
import { useLanguage } from '../context/LanguageContext';

type Adim = 'email' | 'kod' | 'sifre' | 'tamam';

export default function SifremiUnuttum() {
    const { lang } = useLanguage();
    const tr = lang === 'tr';
    const [adim, setAdim] = useState<Adim>('email');
    const [email, setEmail] = useState('');
    const [kod, setKod] = useState('');
    const [yeniSifre, setYeniSifre] = useState('');
    const [yeniSifreTekrar, setYeniSifreTekrar] = useState('');
    const [yukleniyor, setYukleniyor] = useState(false);
    const [hata, setHata] = useState<string | null>(null);
    const [bilgi, setBilgi] = useState<string | null>(null);

    const kodIste = async (e?: React.FormEvent) => {
        e?.preventDefault();
        setYukleniyor(true);
        setHata(null);
        setBilgi(null);
        try {
            const res = await fetch('/api/sifre-sifirla-kod', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (data.basari) {
                setAdim('kod');
                // Sunucu hesap var mi yok mu soylemiyor; mesaj da soylememeli.
                setBilgi(tr
                    ? `${email} adresi kayıtlıysa bir kod gönderildi. Gelen kutunu ve spam klasörünü kontrol et.`
                    : `If ${email} is registered, a code has been sent. Check your inbox and spam folder.`);
            } else {
                setHata(data.hata || (tr ? 'Kod gönderilemedi' : 'Could not send code'));
            }
        } catch {
            setHata(tr ? 'Bağlantı hatası' : 'Connection error');
        }
        setYukleniyor(false);
    };

    const koduDogrula = async (e: React.FormEvent) => {
        e.preventDefault();
        setHata(null);
        setYukleniyor(true);
        try {
            const res = await fetch('/api/sifre-sifirla-dogrula', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, kod }),
            });
            const data = await res.json();
            if (data.basari) {
                setAdim('sifre');
            } else {
                setHata(data.hata || (tr ? 'Kod doğrulanamadı' : 'Could not verify code'));
                // Deneme hakki bittiyse bu kodla devam etmenin anlami yok.
                if (res.status === 429) setKod('');
            }
        } catch {
            setHata(tr ? 'Bağlantı hatası' : 'Connection error');
        }
        setYukleniyor(false);
    };

    const sifreyiDegistir = async (e: React.FormEvent) => {
        e.preventDefault();
        setHata(null);
        if (yeniSifre.length < 8) {
            setHata(tr ? 'Şifre en az 8 karakter olmalı' : 'Password must be at least 8 characters');
            return;
        }
        if (yeniSifre !== yeniSifreTekrar) {
            setHata(tr ? 'Şifreler eşleşmiyor' : 'Passwords do not match');
            return;
        }
        setYukleniyor(true);
        try {
            const res = await fetch('/api/sifre-sifirla', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, kod, yeniSifre }),
            });
            const data = await res.json();
            if (data.basari) {
                setAdim('tamam');
            } else {
                setHata(data.hata || (tr ? 'Şifre değiştirilemedi' : 'Could not reset password'));
                // Sifre kurallari istemcide zaten kontrol edildi; buradaki ret koddan
                // (bu arada suresi dolmus olabilir). Kod adimina donup yenisini isteyebilsin.
                if (res.status === 400 || res.status === 429) {
                    setKod('');
                    setAdim('kod');
                }
            }
        } catch {
            setHata(tr ? 'Bağlantı hatası' : 'Connection error');
        }
        setYukleniyor(false);
    };

    const etiketStili: React.CSSProperties = { color: 'var(--on-surface-variant)', display: 'block', marginBottom: '8px', fontSize: '0.66rem' };

    return (
        <main className="theme-light">
            <SayfaNav geri={{ etiket: tr ? 'Giriş' : 'Sign In', href: '/login' }} />

            <div className="ld-wrap pg-split" style={{ padding: 'clamp(3rem, 7vw, 6rem) 1.5rem 6rem', maxWidth: '1080px' }}>
                <div>
                    <p className="pg-eyebrow">{tr ? 'Hesap kurtarma' : 'Account recovery'}</p>
                    <h1 className="pg-h1">{tr ? 'Şifremi Unuttum' : 'Forgot Password'}</h1>
                    <p className="pg-lead">
                        {tr
                            ? 'E-posta adresine 6 haneli bir kod göndereceğiz. Kodla yeni şifreni belirleyebilirsin.'
                            : "We'll email you a 6-digit code. Use it to set a new password."}
                    </p>
                </div>

                <div className="od-glass" style={{ padding: 'clamp(1.75rem, 4vw, 2.75rem)', borderRadius: '20px' }}>
                    {adim === 'email' && (
                        <form onSubmit={kodIste}>
                            <div style={{ marginBottom: '1.75rem' }}>
                                <label className="mono-label" style={etiketStili}>{tr ? 'E-posta' : 'Email'}</label>
                                <input type="email" required placeholder="ahmet@firma.com" autoComplete="email"
                                    value={email} onChange={e => setEmail(e.target.value)} className="od-field" />
                            </div>
                            {hata && <p style={{ color: 'var(--error)', fontSize: '0.86rem', margin: '0 0 1.25rem' }}>{hata}</p>}
                            <button type="submit" disabled={yukleniyor} className="od-btn-primary" style={{ width: '100%', padding: '0.95rem' }}>
                                {yukleniyor ? (tr ? 'Gönderiliyor…' : 'Sending…') : (tr ? 'Kod Gönder' : 'Send Code')}
                            </button>
                        </form>
                    )}

                    {adim === 'kod' && (
                        <form onSubmit={koduDogrula}>
                            {bilgi && <p style={{ fontSize: '0.86rem', color: 'var(--on-surface-variant)', margin: '0 0 1.5rem', lineHeight: 1.55 }}>{bilgi}</p>}
                            <div style={{ marginBottom: '1.75rem' }}>
                                <label className="mono-label" style={etiketStili}>{tr ? 'Doğrulama Kodu' : 'Verification Code'}</label>
                                <input type="text" required inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder="000000" autoFocus
                                    value={kod} onChange={e => setKod(e.target.value.replace(/\D/g, ''))}
                                    className="od-field" style={{ letterSpacing: '0.4em', fontSize: '1.15rem' }} />
                            </div>
                            {hata && <p style={{ color: 'var(--error)', fontSize: '0.86rem', margin: '0 0 1.25rem' }}>{hata}</p>}
                            <button type="submit" disabled={yukleniyor || kod.length !== 6} className="od-btn-primary" style={{ width: '100%', padding: '0.95rem' }}>
                                {yukleniyor ? (tr ? 'Kontrol ediliyor…' : 'Checking…') : (tr ? 'Devam Et' : 'Continue')}
                            </button>
                            <p style={{ fontSize: '0.86rem', color: 'var(--on-surface-variant)', marginTop: '1.5rem', marginBottom: 0 }}>
                                {tr ? 'Kod gelmedi mi?' : "Didn't get a code?"}{' '}
                                <button type="button" onClick={() => kodIste()} disabled={yukleniyor} className="od-link"
                                    style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', font: 'inherit' }}>
                                    {tr ? 'Tekrar gönder' : 'Resend'}
                                </button>
                            </p>
                        </form>
                    )}

                    {adim === 'sifre' && (
                        <form onSubmit={sifreyiDegistir}>
                            <p style={{ fontSize: '0.86rem', color: 'var(--on-surface-variant)', margin: '0 0 1.5rem', lineHeight: 1.55 }}>
                                {tr ? 'Kod doğrulandı. Şimdi yeni şifreni belirle.' : 'Code verified. Now choose a new password.'}
                            </p>
                            <div style={{ marginBottom: '1.25rem' }}>
                                <label className="mono-label" style={etiketStili}>{tr ? 'Yeni Şifre' : 'New Password'}</label>
                                <input type="password" required autoComplete="new-password" placeholder={tr ? 'En az 8 karakter' : 'At least 8 characters'}
                                    value={yeniSifre} onChange={e => setYeniSifre(e.target.value)} className="od-field" />
                            </div>
                            <div style={{ marginBottom: '1.75rem' }}>
                                <label className="mono-label" style={etiketStili}>{tr ? 'Yeni Şifre (Tekrar)' : 'Confirm New Password'}</label>
                                <input type="password" required autoComplete="new-password"
                                    value={yeniSifreTekrar} onChange={e => setYeniSifreTekrar(e.target.value)} className="od-field" />
                            </div>
                            {hata && <p style={{ color: 'var(--error)', fontSize: '0.86rem', margin: '0 0 1.25rem' }}>{hata}</p>}
                            <button type="submit" disabled={yukleniyor} className="od-btn-primary" style={{ width: '100%', padding: '0.95rem' }}>
                                {yukleniyor ? (tr ? 'Kaydediliyor…' : 'Saving…') : (tr ? 'Şifreyi Değiştir' : 'Reset Password')}
                            </button>
                        </form>
                    )}

                    {adim === 'tamam' && (
                        <div>
                            <p style={{ fontSize: '1rem', color: 'var(--on-surface)', margin: '0 0 1.5rem', lineHeight: 1.55 }}>
                                {tr ? 'Şifren değiştirildi. Yeni şifrenle giriş yapabilirsin.' : 'Your password has been reset. You can now sign in with your new password.'}
                            </p>
                            <a href="/login" className="od-btn-primary" style={{ display: 'block', textAlign: 'center', padding: '0.95rem' }}>
                                {tr ? 'Giriş Yap' : 'Sign In'}
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
