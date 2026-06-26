'use client';
import LanguageSwitcher from './components/LanguageSwitcher';
import { useLanguage } from './context/LanguageContext';

export default function Home() {
  const { lang } = useLanguage();

  const urunler = lang === 'tr'
    ? ['🫒 Zeytinyağı', '🥛 Süt & Süt Ürünleri', '🧀 Peynir', '🍯 Bal', '🍅 Sebze & Meyve', '🌾 Tahıl', '🍷 Şarap', '🫙 Turşu & Reçel']
    : ['🫒 Olive Oil', '🥛 Dairy Products', '🧀 Cheese', '🍯 Honey', '🍅 Vegetables & Fruits', '🌾 Grain', '🍷 Wine', '🫙 Pickles & Jam'];

  const ozellikler = lang === 'tr' ? [
    { icon: '🔗', title: 'Blockchain Güvencesi', desc: 'Verileriniz SHA-256 ile şifrelenir, kimse değiştiremez.' },
    { icon: '📍', title: 'Coğrafi İşaret', desc: 'Ürününüzün nereden geldiğini kanıtlayın, sahte ürünleri önleyin.' },
    { icon: '📱', title: 'QR Kod Takibi', desc: 'Her ürüne özel QR kod, müşteri taratır ve anında doğrular.' },
    { icon: '📊', title: 'Analiz & Raporlama', desc: 'Ürün bazlı takip, satış ve doğrulama istatistikleri.' },
    { icon: '🌍', title: 'İhracat Hazır', desc: 'AB ve uluslararası pazarlar için coğrafi işaret belgesi desteği.' },
    { icon: '⚡', title: 'Kolay Kullanım', desc: 'Teknik bilgi gerekmez. Kayıt ol, ürününü ekle, QR al.' },
  ] : [
    { icon: '🔗', title: 'Blockchain Security', desc: 'Your data is encrypted with SHA-256 — no one can alter it.' },
    { icon: '📍', title: 'Geographic Origin', desc: 'Prove where your product comes from and prevent counterfeits.' },
    { icon: '📱', title: 'QR Code Tracking', desc: 'Unique QR per product — customers scan and verify instantly.' },
    { icon: '📊', title: 'Analytics & Reports', desc: 'Per-product tracking, sales and verification statistics.' },
    { icon: '🌍', title: 'Export Ready', desc: 'Geographic indication support for EU and international markets.' },
    { icon: '⚡', title: 'Easy to Use', desc: 'No technical knowledge needed. Register, add product, get QR.' },
  ];

  return (
    <main style={{ fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif", fontWeight: 'bold', margin: 0, padding: 0 }}>

      {/* NAVBAR */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', background: '#2D5A27', borderBottom: '1px solid #1a3d18' }}>
        <img src="/origin.png" alt="OriginTag" style={{ height: '50px' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <a href="/login" style={{ padding: '0.5rem 1rem', border: '1px solid rgba(255,255,255,0.5)', borderRadius: '6px', color: '#fff', textDecoration: 'none' }}>
            {lang === 'tr' ? 'Giriş Yap' : 'Sign In'}
          </a>
          <a href="/register" style={{ padding: '0.5rem 1rem', background: '#fff', borderRadius: '6px', color: '#2D5A27', textDecoration: 'none', fontWeight: 'bold' }}>
            {lang === 'tr' ? 'Ücretsiz Başla' : 'Get Started Free'}
          </a>
          <LanguageSwitcher />
        </div>
      </nav>

      {/* HERO */}
      <section style={{ textAlign: 'center', padding: '5rem 2rem', background: '#f9f7f4' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '1rem' }}>
          {lang === 'tr' ? <>Ürününüzün Hikayesini<br /><span style={{ color: '#2D5A27' }}>Blockchain ile Belgeleyin</span></> : <>Document Your Product's Story<br /><span style={{ color: '#2D5A27' }}>with Blockchain</span></>}
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#555', maxWidth: '600px', margin: '0 auto 2rem' }}>
          {lang === 'tr'
            ? 'Zeytinyağından süte, peynirden bala — tarladan sofraya her adımı şeffaf, değiştirilemez ve QR kod ile doğrulanabilir hale getirin.'
            : 'From olive oil to milk, from cheese to honey — make every step from farm to table transparent, immutable and QR-verifiable.'}
        </p>
        <a href="/register" style={{ padding: '1rem 2rem', background: '#2D5A27', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontSize: '1.1rem' }}>
          {lang === 'tr' ? 'Hemen Başla — Ücretsiz' : 'Get Started — Free'}
        </a>
      </section>

      {/* ÜRÜNLER */}
      <section style={{ padding: '3rem 2rem', borderBottom: '1px solid #eee' }}>
        <p style={{ textAlign: 'center', color: '#999', fontSize: '0.9rem', marginBottom: '1.5rem', letterSpacing: '0.1em' }}>
          {lang === 'tr' ? 'HER TÜRLÜ TARIM ÜRÜNİ İÇİN' : 'FOR ALL AGRICULTURAL PRODUCTS'}
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
          {urunler.map((u, i) => (
            <span key={i} style={{ padding: '0.5rem 1rem', background: '#f9f7f4', borderRadius: '20px', fontSize: '0.95rem', color: '#555' }}>{u}</span>
          ))}
        </div>
      </section>

      {/* ÖZELLİKLER */}
      <section style={{ padding: '4rem 2rem', maxWidth: '900px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '3rem', color: '#1a1a1a' }}>
          {lang === 'tr' ? 'Neden OriginTag?' : 'Why OriginTag?'}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
          {ozellikler.map((f, i) => (
            <div key={i} style={{ textAlign: 'center', padding: '2rem', border: '1px solid #eee', borderRadius: '12px' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{f.icon}</div>
              <h3 style={{ color: '#2D5A27', marginBottom: '0.5rem' }}>{f.title}</h3>
              <p style={{ color: '#666', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ textAlign: 'center', padding: '2rem', color: '#999', borderTop: '1px solid #eee' }}>
        <img src="/origin.png" alt="OriginTag" style={{ height: '35px', marginBottom: '0.5rem' }} />
        <p>© 2026 OriginTag — Geographical Indicator & Traceability</p>
      </footer>

    </main>
  );
}
