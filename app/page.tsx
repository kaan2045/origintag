'use client';
import LanguageSwitcher from './components/LanguageSwitcher';
import UrunIllustrasyonu from './components/UrunIllustrasyonu';
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
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 2rem', background: 'var(--parchment)', borderBottom: '1px solid #ece6d8' }}>
        <img src="/origin.png" alt="OriginTag" style={{ height: '38px' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <a href="/login" style={{ padding: '0.55rem 1.1rem', border: '1px solid #d8cfb8', borderRadius: '8px', color: 'var(--ink)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>
            {lang === 'tr' ? 'Giriş Yap' : 'Sign In'}
          </a>
          <a href="/register" style={{ padding: '0.55rem 1.1rem', background: 'var(--ink)', borderRadius: '8px', color: '#fff', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>
            {lang === 'tr' ? 'Ücretsiz Başla' : 'Get Started Free'}
          </a>
          <LanguageSwitcher />
        </div>
      </nav>

      {/* HERO */}
      <section style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(160deg, #1f1a0d 0%, #33260f 42%, #5c6b2e 100%)', color: '#eee9d8' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.85, pointerEvents: 'none' }}>
          <UrunIllustrasyonu tema="zeytinyagi" />
        </div>
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '6rem 2rem 5rem', maxWidth: '760px', margin: '0 auto' }}>
          <p style={{ fontSize: '0.78rem', letterSpacing: '0.16em', textTransform: 'uppercase', opacity: 0.7, marginBottom: '1.25rem' }}>
            {lang === 'tr' ? 'Coğrafi İşaretli Ürünler İçin' : 'For Geographically Indicated Products'}
          </p>
          <h1 className="font-display" style={{ fontSize: 'clamp(2.4rem, 6vw, 3.6rem)', fontWeight: 500, lineHeight: 1.12, margin: '0 0 1.25rem' }}>
            {lang === 'tr'
              ? <>Ürününüzün hikayesini<br /><span style={{ fontStyle: 'italic', color: '#d8c37a' }}>tarladan sofraya</span> belgeleyin</>
              : <>Document your product&apos;s story<br /><span style={{ fontStyle: 'italic', color: '#d8c37a' }}>from farm to table</span></>}
          </h1>
          <p style={{ fontSize: '1.05rem', opacity: 0.82, maxWidth: '520px', margin: '0 auto 2.25rem', lineHeight: 1.6 }}>
            {lang === 'tr'
              ? 'Zeytinyağından bala, peynirden şaraba — her adım blockchain\'e yazılır, değiştirilemez ve tek bir QR kod ile doğrulanır.'
              : 'From olive oil to honey, cheese to wine — every step is written to the blockchain, immutable, and verifiable with a single QR code.'}
          </p>
          <a href="/register" style={{ display: 'inline-block', padding: '0.9rem 2.1rem', background: '#eee9d8', color: '#211f1a', borderRadius: '8px', textDecoration: 'none', fontSize: '1rem', fontWeight: 600 }}>
            {lang === 'tr' ? 'Hemen Başla — Ücretsiz' : 'Get Started — Free'}
          </a>
        </div>
      </section>

      {/* ÜRÜNLER */}
      <section style={{ padding: '2.5rem 2rem', borderBottom: '1px solid #ece6d8' }}>
        <p style={{ textAlign: 'center', color: '#a49c8c', fontSize: '0.78rem', marginBottom: '1.25rem', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
          {lang === 'tr' ? 'Her Tür Tarım Ürünü İçin' : 'For All Agricultural Products'}
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.6rem', flexWrap: 'wrap', maxWidth: '760px', margin: '0 auto' }}>
          {urunler.map((u, i) => (
            <span key={i} style={{ padding: '0.45rem 1rem', background: '#fff', border: '1px solid #ece6d8', borderRadius: '20px', fontSize: '0.88rem', color: '#3a362c' }}>{u}</span>
          ))}
        </div>
      </section>

      {/* ÖZELLİKLER */}
      <section style={{ padding: '5rem 2rem', maxWidth: '980px', margin: '0 auto' }}>
        <h2 className="font-display" style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 500, marginBottom: '3rem', color: 'var(--ink)' }}>
          {lang === 'tr' ? 'Neden OriginTag?' : 'Why OriginTag?'}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1px', background: '#ece6d8', border: '1px solid #ece6d8', borderRadius: '16px', overflow: 'hidden' }}>
          {ozellikler.map((f, i) => (
            <div key={i} style={{ padding: '2rem', background: '#fff' }}>
              <div style={{ width: '28px', height: '3px', background: '#5c6b2e', marginBottom: '1rem', borderRadius: '2px' }} />
              <h3 className="font-display" style={{ color: 'var(--ink)', fontWeight: 600, fontSize: '1.15rem', marginBottom: '0.6rem' }}>{f.title}</h3>
              <p style={{ color: '#6b6558', lineHeight: 1.6, fontSize: '0.92rem', margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ textAlign: 'center', padding: '2.5rem 2rem', color: '#a49c8c', borderTop: '1px solid #ece6d8' }}>
        <img src="/origin.png" alt="OriginTag" style={{ height: '28px', marginBottom: '0.6rem', opacity: 0.6 }} />
        <p style={{ fontSize: '0.85rem', margin: 0 }}>© 2026 OriginTag — Geographical Indicator & Traceability</p>
      </footer>

    </main>
  );
}
