'use client';
import LanguageSwitcher from './components/LanguageSwitcher';
import { useLanguage } from './context/LanguageContext';

export default function Home() {
  const { lang } = useLanguage();

  const urunler = lang === 'tr'
    ? ['Zeytinyağı', 'Süt & Süt Ürünleri', 'Peynir', 'Bal', 'Sebze & Meyve', 'Tahıl', 'Şarap', 'Turşu & Reçel']
    : ['Olive Oil', 'Dairy Products', 'Cheese', 'Honey', 'Vegetables & Fruits', 'Grain', 'Wine', 'Pickles & Jam'];

  const ozellikler = lang === 'tr' ? [
    { title: 'Blockchain Güvencesi', desc: 'Verileriniz SHA-256 ile şifrelenir ve Polygon ağına yazılır — kimse geriye dönüp değiştiremez.' },
    { title: 'Coğrafi İşaret', desc: 'Ürününüzün nereden geldiğini kanıtlayın, taklit ürünleri müşterinin gözünde ayırt edilir kılın.' },
    { title: 'QR Kod Takibi', desc: 'Her ürüne özel bir QR — müşteri taratır, hasat gününden bugüne tüm yolculuğu görür.' },
    { title: 'Tarama Analitiği', desc: 'Hangi ürün, nerede, ne zaman taratıldı — ve şüpheli tarama örüntüleri otomatik işaretlenir.' },
    { title: 'İhracata Hazır', desc: 'AB ve uluslararası pazarlar için coğrafi işaret belgesi ile uyumlu altyapı.' },
    { title: 'Kolay Kurulum', desc: 'Teknik bilgi gerekmez. Kayıt olun, ürününüzü ekleyin, QR kodunuzu alın.' },
  ] : [
    { title: 'Blockchain Security', desc: 'Your data is hashed with SHA-256 and written to the Polygon network — no one can alter it after the fact.' },
    { title: 'Geographic Origin', desc: 'Prove where your product comes from, and make counterfeits visibly distinguishable to buyers.' },
    { title: 'QR Code Tracking', desc: 'One QR per product — customers scan and see the full journey, from harvest day to today.' },
    { title: 'Scan Analytics', desc: 'Which product, where, and when it was scanned — with suspicious scan patterns flagged automatically.' },
    { title: 'Export Ready', desc: 'Infrastructure aligned with geographic indication documentation for EU and international markets.' },
    { title: 'Easy Setup', desc: 'No technical knowledge required. Register, add your product, get your QR code.' },
  ];

  return (
    <main style={{ margin: 0, padding: 0, background: 'var(--parchment)' }}>

      {/* NAVBAR */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 2.5rem', background: 'var(--parchment)', borderBottom: '1px solid #ece6d8' }}>
        <img src="/origin.png" alt="OriginTag" style={{ height: '34px' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
          <a href="/login" style={{ padding: '0.6rem 1.2rem', border: '1px solid #d8cfb8', borderRadius: '2px', color: 'var(--ink)', textDecoration: 'none', fontSize: '0.92rem', fontWeight: 500 }}>
            {lang === 'tr' ? 'Giriş Yap' : 'Sign In'}
          </a>
          <a href="/register" style={{ padding: '0.6rem 1.2rem', background: 'var(--ink)', borderRadius: '2px', color: '#fff', textDecoration: 'none', fontWeight: 600, fontSize: '0.92rem' }}>
            {lang === 'tr' ? 'Ücretsiz Başla' : 'Get Started Free'}
          </a>
          <LanguageSwitcher />
        </div>
      </nav>

      {/* HERO — video arka plan */}
      <section style={{ position: 'relative', overflow: 'hidden', color: '#f0eadd', minHeight: '640px', display: 'flex', flexDirection: 'column' }}>
        <video
          autoPlay muted loop playsInline preload="auto"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        >
          <source src="/videos/landing-hero.mp4" type="video/mp4" />
        </video>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(20,22,15,0.55) 0%, rgba(20,22,15,0.72) 55%, #23261e 100%)',
        }} />
        <div style={{ position: 'absolute', inset: '20px', border: '1px solid rgba(240,234,221,0.14)', borderRadius: '2px', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center', padding: '7rem 2rem 6rem', maxWidth: '840px', margin: '0 auto' }}>
          <p className="mono-label" style={{ opacity: 0.75, marginBottom: '1.5rem' }}>
            {lang === 'tr' ? 'Coğrafi İşaretli Ürünler İçin' : 'For Geographically Indicated Products'}
          </p>
          <h1 className="font-display" style={{ fontSize: 'clamp(2.8rem, 7vw, 5rem)', fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.0, margin: '0 0 1.5rem' }}>
            {lang === 'tr'
              ? <>Ürününüzün hikayesini<br /><span style={{ color: '#c9a15a' }}>tarladan sofraya</span> belgeleyin</>
              : <>Document your product&apos;s story<br /><span style={{ color: '#c9a15a' }}>from farm to table</span></>}
          </h1>
          <p style={{ fontSize: '1.1rem', opacity: 0.85, maxWidth: '540px', margin: '0 auto 2.5rem', lineHeight: 1.6 }}>
            {lang === 'tr'
              ? 'Zeytinyağından bala, peynirden şaraba — her adım blockchain\'e yazılır, değiştirilemez ve tek bir QR kod ile doğrulanır.'
              : 'From olive oil to honey, cheese to wine — every step is written to the blockchain, immutable, and verifiable with a single QR code.'}
          </p>
          <div>
            <a href="/register" style={{ display: 'inline-block', padding: '1rem 2.4rem', background: '#f0eadd', color: '#23261e', borderRadius: '2px', textDecoration: 'none', fontSize: '1rem', fontWeight: 600 }}>
              {lang === 'tr' ? 'Hemen Başla — Ücretsiz' : 'Get Started — Free'}
            </a>
          </div>
        </div>
      </section>

      {/* ÜRÜNLER */}
      <section style={{ padding: '3rem 2rem', borderBottom: '1px solid #ece6d8' }}>
        <p className="mono-label" style={{ textAlign: 'center', color: '#a49c8c', marginBottom: '1.5rem' }}>
          {lang === 'tr' ? 'Her Tür Tarım Ürünü İçin' : 'For All Agricultural Products'}
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.6rem', flexWrap: 'wrap', maxWidth: '800px', margin: '0 auto' }}>
          {urunler.map((u, i) => (
            <span key={i} style={{ padding: '0.5rem 1.1rem', background: '#fff', border: '1px solid #ece6d8', borderRadius: '2px', fontSize: '0.9rem', color: '#3a362c' }}>{u}</span>
          ))}
        </div>
      </section>

      {/* ÖZELLİKLER */}
      <section style={{ padding: '6rem 2rem', maxWidth: '1040px', margin: '0 auto' }}>
        <p className="mono-label" style={{ textAlign: 'center', color: '#9a8f78', marginBottom: '1rem' }}>
          {lang === 'tr' ? 'Neden OriginTag' : 'Why OriginTag'}
        </p>
        <h2 className="font-display" style={{ textAlign: 'center', fontSize: 'clamp(2rem, 4vw, 2.75rem)', fontWeight: 600, letterSpacing: '-0.01em', marginBottom: '3.5rem', color: 'var(--ink)' }}>
          {lang === 'tr' ? 'Şeffaflık, kanıtla birlikte gelir' : 'Transparency, backed by proof'}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1px', background: '#ece6d8', border: '1px solid #ece6d8' }}>
          {ozellikler.map((f, i) => (
            <div key={i} style={{ padding: '2.5rem 2rem', background: '#fff' }}>
              <div style={{ width: '28px', height: '3px', background: '#5c6b2e', marginBottom: '1.25rem' }} />
              <h3 className="font-display" style={{ color: 'var(--ink)', fontWeight: 600, fontSize: '1.25rem', marginBottom: '0.75rem' }}>{f.title}</h3>
              <p style={{ color: '#6b6558', lineHeight: 1.65, fontSize: '0.95rem', margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ textAlign: 'center', padding: '3rem 2rem', color: '#a49c8c', borderTop: '1px solid #ece6d8' }}>
        <img src="/origin.png" alt="OriginTag" style={{ height: '26px', marginBottom: '0.75rem', opacity: 0.6 }} />
        <p className="mono-label" style={{ color: '#b3ac9a' }}>© 2026 OriginTag — Geographical Indicator & Traceability</p>
      </footer>

    </main>
  );
}
