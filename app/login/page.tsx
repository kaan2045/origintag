'use client';
import { useState } from 'react';

export default function Login() {
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
                alert('Hata: ' + data.hata);
            }
        } catch {
            alert('Baglanti hatasi!');
        }
        setYukleniyor(false);
    };

    return (
        <main style={{ fontFamily: 'sans-serif', minHeight: '100vh', background: '#f9f7f4' }}>
            <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', background: '#fff', borderBottom: '1px solid #eee' }}>
                <a href="/"><img src="/origin.png" alt="OriginTag" style={{ height: '50px' }} /></a>
                <a href="/register" style={{ color: '#2D5A27', textDecoration: 'none', fontSize: '0.95rem' }}>Hesabin yok mu? <strong>Ucretsiz Basla</strong></a>
            </nav>

            <div style={{ maxWidth: '420px', margin: '5rem auto', background: '#fff', borderRadius: '16px', border: '1px solid #eee', padding: '2.5rem' }}>
                <h1 style={{ fontSize: '1.8rem', color: '#1a1a1a', marginBottom: '0.5rem' }}>Giris Yap</h1>
                <p style={{ color: '#888', marginBottom: '2rem', fontSize: '0.95rem' }}>Hesabina giris yap ve devam et.</p>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ fontSize: '0.85rem', color: '#555', display: 'block', marginBottom: '4px' }}>E-posta</label>
                        <input type="email" required placeholder="ahmet@firma.com"
                            value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                            style={{ width: '100%', padding: '0.6rem 0.8rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.95rem', boxSizing: 'border-box' }}
                        />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ fontSize: '0.85rem', color: '#555', display: 'block', marginBottom: '4px' }}>Sifre</label>
                        <input type="password" required placeholder="Sifrenizi girin"
                            value={form.sifre} onChange={e => setForm({ ...form, sifre: e.target.value })}
                            style={{ width: '100%', padding: '0.6rem 0.8rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.95rem', boxSizing: 'border-box' }}
                        />
                    </div>

                    <button type="submit" disabled={yukleniyor}
                        style={{ width: '100%', padding: '0.85rem', background: '#2D5A27', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '1rem', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        {yukleniyor ? 'Giris Yapiliyor...' : 'Giris Yap'}
                    </button>

                    <p style={{ textAlign: 'center', fontSize: '0.85rem', color: '#aaa', marginTop: '1.5rem' }}>
                        Hesabin yok mu? <a href="/register" style={{ color: '#2D5A27', textDecoration: 'none', fontWeight: 'bold' }}>Ucretsiz Basla</a>
                    </p>
                </form>
            </div>
        </main>
    );
}