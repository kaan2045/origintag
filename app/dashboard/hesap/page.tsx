'use client';
import { useEffect, useState } from 'react';
import SayfaNav from '../../components/SayfaNav';
import { useLanguage } from '../../context/LanguageContext';

type Bilgi = {
    ad: string;
    soyad: string;
    email: string;
    firma: string | null;
    olusturma_tarihi: string;
    urun_sayisi: string;
};

function yerelOturumuTemizle() {
    localStorage.removeItem('kullanici_id');
    localStorage.removeItem('kullanici_ad');
    localStorage.removeItem('kullanici_email');
}

async function postJson(yol: string, govde: unknown) {
    const res = await fetch(yol, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(govde) });
    return { res, data: await res.json().catch(() => ({})) };
}

/**
 * Hesap ayarlari: sifre degistirme, diger cihazlardan cikis, hesap silme. Sunucu uclari
 * mobil ile ortak; oturum cerezle tasiniyor ve surum artinca sunucu yeni cerezi
 * yanitla birlikte yaziyor, bu sayfanin ayrica bir sey saklamasi gerekmiyor.
 */
export default function HesapAyarlari() {
    const { lang } = useLanguage();
    const tr = lang === 'tr';
    const [bilgi, setBilgi] = useState<Bilgi | null>(null);

    const [mevcut, setMevcut] = useState('');
    const [yeni, setYeni] = useState('');
    const [yeniTekrar, setYeniTekrar] = useState('');
    const [sifreDurum, setSifreDurum] = useState<{ tip: 'hata' | 'tamam'; metin: string } | null>(null);
    const [sifreYukleniyor, setSifreYukleniyor] = useState(false);

    const [oturumDurum, setOturumDurum] = useState<{ tip: 'hata' | 'tamam'; metin: string } | null>(null);
    const [oturumYukleniyor, setOturumYukleniyor] = useState(false);

    const [silmeAcik, setSilmeAcik] = useState(false);
    const [silmeSifre, setSilmeSifre] = useState('');
    const [silmeHata, setSilmeHata] = useState<string | null>(null);
    const [siliniyor, setSiliniyor] = useState(false);

    useEffect(() => {
        fetch('/api/kullanici-bilgi')
            .then(async (res) => {
                if (res.status === 401) {
                    yerelOturumuTemizle();
                    window.location.href = '/login';
                    return;
                }
                const data = await res.json();
                if (data.basari) setBilgi(data.kullanici);
            })
            .catch(() => undefined);
    }, []);

    const sifreDegistir = async (e: React.FormEvent) => {
        e.preventDefault();
        setSifreDurum(null);
        if (yeni.length < 8) return setSifreDurum({ tip: 'hata', metin: tr ? 'Yeni şifre en az 8 karakter olmalı' : 'New password must be at least 8 characters' });
        if (yeni !== yeniTekrar) return setSifreDurum({ tip: 'hata', metin: tr ? 'Yeni şifreler eşleşmiyor' : 'New passwords do not match' });
        setSifreYukleniyor(true);
        try {
            const { data } = await postJson('/api/sifre-degistir', { mevcutSifre: mevcut, yeniSifre: yeni });
            if (data.basari) {
                setMevcut(''); setYeni(''); setYeniTekrar('');
                setSifreDurum({ tip: 'tamam', metin: tr ? 'Şifren değiştirildi. Diğer cihazlardaki oturumların kapatıldı.' : 'Password changed. You were signed out on other devices.' });
            } else {
                setSifreDurum({ tip: 'hata', metin: data.hata || (tr ? 'Şifre değiştirilemedi' : 'Could not change password') });
            }
        } catch {
            setSifreDurum({ tip: 'hata', metin: tr ? 'Bağlantı hatası' : 'Connection error' });
        }
        setSifreYukleniyor(false);
    };

    const digerOturumlariKapat = async () => {
        if (!window.confirm(tr
            ? 'Bu tarayıcı dışındaki bütün cihazlarda (telefonlar, diğer bilgisayarlar) oturumun kapanacak. Devam edilsin mi?'
            : 'You will be signed out on every device except this browser. Continue?')) return;
        setOturumDurum(null);
        setOturumYukleniyor(true);
        try {
            const { data } = await postJson('/api/diger-oturumlari-kapat', {});
            setOturumDurum(data.basari
                ? { tip: 'tamam', metin: tr ? 'Diğer cihazlardaki oturumların kapatıldı.' : 'Signed out on other devices.' }
                : { tip: 'hata', metin: data.hata || (tr ? 'İşlem yapılamadı' : 'Something went wrong') });
        } catch {
            setOturumDurum({ tip: 'hata', metin: tr ? 'Bağlantı hatası' : 'Connection error' });
        }
        setOturumYukleniyor(false);
    };

    const hesabiSil = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!window.confirm(tr ? 'Hesabın ve bütün verilerin kalıcı olarak silinecek. Bu işlem geri alınamaz. Emin misin?' : 'Your account and all data will be permanently deleted. This cannot be undone. Are you sure?')) return;
        setSilmeHata(null);
        setSiliniyor(true);
        try {
            const { data } = await postJson('/api/hesap-sil', { sifre: silmeSifre });
            if (data.basari) {
                yerelOturumuTemizle();
                window.location.href = '/?hesap=silindi';
                return;
            }
            setSilmeHata(data.hata || (tr ? 'Hesap silinemedi' : 'Could not delete account'));
        } catch {
            setSilmeHata(tr ? 'Bağlantı hatası' : 'Connection error');
        }
        setSiliniyor(false);
    };

    const etiket: React.CSSProperties = { color: 'var(--on-surface-variant)', display: 'block', marginBottom: '8px', fontSize: '0.66rem' };
    const kart: React.CSSProperties = { padding: 'clamp(1.5rem, 4vw, 2.25rem)', borderRadius: '20px', marginBottom: '1.5rem' };
    const mesaj = (d: { tip: 'hata' | 'tamam'; metin: string } | null) =>
        d && <p style={{ color: d.tip === 'hata' ? 'var(--error)' : 'var(--secondary)', fontSize: '0.86rem', margin: '0 0 1rem' }}>{d.metin}</p>;
    const urunSayisi = bilgi ? Number(bilgi.urun_sayisi) : null;

    return (
        <main className="theme-light">
            <SayfaNav geri={{ etiket: tr ? 'Panel' : 'Dashboard', href: '/dashboard' }} />

            <div className="ld-wrap" style={{ padding: 'clamp(2.5rem, 6vw, 4rem) 1.5rem 5rem', maxWidth: '720px' }}>
                <p className="pg-eyebrow">{tr ? 'Hesap' : 'Account'}</p>
                <h1 className="pg-h1" style={{ marginBottom: '2rem' }}>{tr ? 'Hesap Ayarları' : 'Account Settings'}</h1>

                <section className="od-glass" style={kart}>
                    <h2 className="pg-h2" style={{ fontSize: '1.2rem', marginBottom: '1.25rem' }}>{tr ? 'Profil' : 'Profile'}</h2>
                    {!bilgi ? (
                        <p style={{ color: 'var(--on-surface-variant)' }}>{tr ? 'Yükleniyor…' : 'Loading…'}</p>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.1rem' }}>
                            {[
                                [tr ? 'Ad Soyad' : 'Name', `${bilgi.ad} ${bilgi.soyad}`],
                                [tr ? 'E-posta' : 'Email', bilgi.email],
                                [tr ? 'Firma' : 'Company', bilgi.firma || '—'],
                                [tr ? 'Üyelik' : 'Member since', new Date(bilgi.olusturma_tarihi).toLocaleDateString(tr ? 'tr-TR' : 'en-GB', { year: 'numeric', month: 'long' })],
                            ].map(([e, d]) => (
                                <div key={e}>
                                    <div className="mono-label" style={{ fontSize: '0.62rem', color: 'var(--on-surface-variant)' }}>{e}</div>
                                    <div style={{ fontWeight: 700, color: 'var(--on-surface)', marginTop: '4px', wordBreak: 'break-word' }}>{d}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                <section className="od-glass" style={kart}>
                    <h2 className="pg-h2" style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{tr ? 'Şifre Değiştir' : 'Change Password'}</h2>
                    <p style={{ fontSize: '0.86rem', color: 'var(--on-surface-variant)', margin: '0 0 1.25rem' }}>
                        {tr ? 'Şifren değişince bu tarayıcı dışındaki bütün cihazlarda oturumun kapanır.' : 'Changing your password signs you out everywhere except this browser.'}
                    </p>
                    <form onSubmit={sifreDegistir}>
                        {[
                            [tr ? 'Mevcut Şifre' : 'Current Password', mevcut, setMevcut, 'current-password'],
                            [tr ? 'Yeni Şifre' : 'New Password', yeni, setYeni, 'new-password'],
                            [tr ? 'Yeni Şifre (Tekrar)' : 'Confirm New Password', yeniTekrar, setYeniTekrar, 'new-password'],
                        ].map(([e, deger, degistir, ac]) => (
                            <div key={e as string} style={{ marginBottom: '1rem' }}>
                                <label className="mono-label" style={etiket}>{e as string}</label>
                                <input type="password" required autoComplete={ac as string} value={deger as string}
                                    onChange={(ev) => (degistir as (v: string) => void)(ev.target.value)} className="od-field" />
                            </div>
                        ))}
                        {mesaj(sifreDurum)}
                        <button type="submit" disabled={sifreYukleniyor} className="od-btn-primary" style={{ padding: '0.8rem 1.4rem' }}>
                            {sifreYukleniyor ? (tr ? 'Kaydediliyor…' : 'Saving…') : (tr ? 'Şifreyi Değiştir' : 'Change Password')}
                        </button>
                    </form>
                </section>

                <section className="od-glass" style={kart}>
                    <h2 className="pg-h2" style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{tr ? 'Diğer Cihazlardan Çıkış' : 'Sign Out Other Devices'}</h2>
                    <p style={{ fontSize: '0.86rem', color: 'var(--on-surface-variant)', margin: '0 0 1.25rem' }}>
                        {tr ? 'Telefonunu kaybettiysen ya da ortak bir bilgisayarda oturumun açık kaldıysa. Şifren değişmez.' : 'If you lost your phone or left a session open on a shared computer. Your password stays the same.'}
                    </p>
                    {mesaj(oturumDurum)}
                    <button type="button" onClick={digerOturumlariKapat} disabled={oturumYukleniyor} className="od-btn-secondary" style={{ padding: '0.8rem 1.4rem' }}>
                        {oturumYukleniyor ? (tr ? 'Kapatılıyor…' : 'Signing out…') : (tr ? 'Diğer cihazlardan çıkış yap' : 'Sign out other devices')}
                    </button>
                </section>

                <section className="od-glass" style={{ ...kart, border: '1px solid rgba(186,26,26,0.35)' }}>
                    <h2 className="pg-h2" style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: 'var(--error)' }}>{tr ? 'Hesabı Sil' : 'Delete Account'}</h2>
                    {!silmeAcik ? (
                        <>
                            <p style={{ fontSize: '0.86rem', color: 'var(--on-surface-variant)', margin: '0 0 1.25rem' }}>
                                {tr ? 'Hesabını ve ona bağlı bütün verileri kalıcı olarak siler.' : 'Permanently deletes your account and all related data.'}
                            </p>
                            <button type="button" onClick={() => setSilmeAcik(true)} className="od-btn-secondary" style={{ padding: '0.8rem 1.4rem', color: 'var(--error)', borderColor: 'var(--error)' }}>
                                {tr ? 'Hesabımı silmek istiyorum' : 'I want to delete my account'}
                            </button>
                        </>
                    ) : (
                        <form onSubmit={hesabiSil}>
                            <p style={{ fontSize: '0.9rem', color: 'var(--on-surface)', fontWeight: 600, margin: '0 0 0.6rem' }}>
                                {tr ? 'Bu işlem geri alınamaz. Silinecekler:' : 'This cannot be undone. Deleted:'}
                            </p>
                            <ul style={{ fontSize: '0.86rem', color: 'var(--on-surface)', lineHeight: 1.7, margin: '0 0 1rem', paddingLeft: '1.2rem' }}>
                                <li>{urunSayisi === null ? (tr ? 'Bütün ürünlerin' : 'All your products')
                                    : tr ? `${urunSayisi} ürünün ve fotoğrafları` : `Your ${urunSayisi} products and photos`}</li>
                                <li>{tr ? 'Bu ürünler için basılmış QR kodları artık çalışmayacak' : 'Printed QR codes for these products will stop working'}</li>
                                <li>{tr ? 'Profil bilgilerin ve bütün cihazlardaki oturumların' : 'Your profile and sessions on every device'}</li>
                            </ul>
                            <p style={{ fontSize: '0.78rem', color: 'var(--on-surface-variant)', margin: '0 0 1.25rem', lineHeight: 1.55 }}>
                                {tr ? "Blockchain'e yazılmış doğrulama özetleri teknik olarak silinemez; yalnızca ürün adı ve türünü içerir, kişisel bilgi içermez."
                                    : 'Verification hashes written to the blockchain cannot be deleted; they contain only product name and type, no personal data.'}
                            </p>
                            <div style={{ marginBottom: '1rem' }}>
                                <label className="mono-label" style={etiket}>{tr ? 'Onaylamak için şifreni gir' : 'Enter your password to confirm'}</label>
                                <input type="password" required autoComplete="current-password" value={silmeSifre} onChange={(e) => setSilmeSifre(e.target.value)} className="od-field" />
                            </div>
                            {silmeHata && <p style={{ color: 'var(--error)', fontSize: '0.86rem', margin: '0 0 1rem' }}>{silmeHata}</p>}
                            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                <button type="submit" disabled={siliniyor || !silmeSifre} className="od-btn-primary"
                                    style={{ padding: '0.8rem 1.4rem', background: 'var(--error)', borderColor: 'var(--error)', color: '#fff' }}>
                                    {siliniyor ? (tr ? 'Siliniyor…' : 'Deleting…') : (tr ? 'Hesabımı Kalıcı Olarak Sil' : 'Permanently Delete My Account')}
                                </button>
                                <button type="button" onClick={() => { setSilmeAcik(false); setSilmeSifre(''); setSilmeHata(null); }} className="od-btn-secondary" style={{ padding: '0.8rem 1.4rem' }}>
                                    {tr ? 'Vazgeç' : 'Cancel'}
                                </button>
                            </div>
                        </form>
                    )}
                </section>
            </div>
        </main>
    );
}
