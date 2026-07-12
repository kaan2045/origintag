'use client';
import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import LanguageSwitcher from './components/LanguageSwitcher';
import VideoKatmanlari from './components/VideoKatmanlari';
import { useLanguage } from './context/LanguageContext';

const VITRIN_VIDEOLARI = ['/videos/landing-hero.mp4', '/videos/bal-hero.mp4'];

export default function Home() {
  const { lang } = useLanguage();
  const qrRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (qrRef.current) {
      QRCode.toCanvas(qrRef.current, 'https://origintag.com.tr/#vitrin', {
        width: 130, margin: 1,
        color: { dark: '#23261e', light: '#ffffff' },
      });
    }
  }, []);

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

      {/* HERO — tek video (zeytin dali), metin sol / QR sag */}
      <section style={{ position: 'relative', overflow: 'hidden', color: '#f0eadd', minHeight: '100vh' }}>
        <video
          autoPlay muted loop playsInline preload="auto"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        >
          <source src="/videos/landing-hero.mp4" type="video/mp4" />
        </video>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(20,22,15,0.45) 0%, rgba(20,22,15,0.55) 50%, rgba(20,22,15,0.85) 100%)',
        }} />
        <div style={{ position: 'absolute', inset: '20px', border: '1px solid rgba(240,234,221,0.14)', borderRadius: '2px', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

          <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2rem 2.75rem' }}>
            <img src="/origin.png" alt="OriginTag" style={{ height: '34px', filter: 'drop-shadow(0 1px 4px rgba(0,0,0,0.5))' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
              <a href="/login" style={{ padding: '0.55rem 1.15rem', border: '1px solid rgba(240,234,221,0.35)', borderRadius: '2px', color: '#f0eadd', textDecoration: 'none', fontSize: '0.88rem', fontWeight: 500 }}>
                {lang === 'tr' ? 'Giriş Yap' : 'Sign In'}
              </a>
              <a href="/register" style={{ padding: '0.55rem 1.15rem', background: '#f0eadd', borderRadius: '2px', color: '#23261e', textDecoration: 'none', fontWeight: 600, fontSize: '0.88rem' }}>
                {lang === 'tr' ? 'Ücretsiz Başla' : 'Get Started Free'}
              </a>
              <LanguageSwitcher />
            </div>
          </nav>

          <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '2rem 2.75rem 4rem', flexWrap: 'wrap', gap: '3rem' }}>
            <div style={{ flex: '1 1 480px', minWidth: '320px' }}>
              <p className="mono-label" style={{ opacity: 0.75, marginBottom: '1.25rem' }}>
                {lang === 'tr' ? 'Coğrafi İşaretli Ürünler İçin' : 'For Geographically Indicated Products'}
              </p>
              <h1 className="font-display" style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.4rem)', fontWeight: 600, letterSpacing: '-0.01em', lineHeight: 1.08, margin: '0 0 1.25rem' }}>
                {lang === 'tr'
                  ? <>Ürününüzün hikayesini <span style={{ color: '#c9a15a' }}>tarladan sofraya</span> belgeleyin</>
                  : <>Document your product&apos;s <span style={{ color: '#c9a15a' }}>story from farm to table</span></>}
              </h1>
              <p style={{ fontSize: '1.05rem', opacity: 0.85, maxWidth: '480px', margin: '0 0 2.25rem', lineHeight: 1.6 }}>
                {lang === 'tr'
                  ? 'Zeytinyağından bala, peynirden şaraba — her adım blockchain\'e yazılır, değiştirilemez ve tek bir QR kod ile doğrulanır.'
                  : 'From olive oil to honey, cheese to wine — every step is written to the blockchain, immutable, and verifiable with a single QR code.'}
              </p>
              <a href="/register" style={{ display: 'inline-block', padding: '0.95rem 2.3rem', background: '#f0eadd', color: '#23261e', borderRadius: '2px', textDecoration: 'none', fontSize: '1rem', fontWeight: 600 }}>
                {lang === 'tr' ? 'Hemen Başla — Ücretsiz' : 'Get Started — Free'}
              </a>
            </div>

            <a href="#vitrin" style={{
              flex: '0 0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.9rem',
              padding: '1.5rem', border: '1px solid rgba(240,234,221,0.18)', borderRadius: '4px', background: 'rgba(0,0,0,0.14)',
              textDecoration: 'none', color: '#f0eadd',
            }}>
              <div style={{ background: '#fff', padding: '10px', borderRadius: '2px', lineHeight: 0 }}>
                <canvas ref={qrRef} style={{ display: 'block' }} />
              </div>
              <div style={{ fontSize: '0.88rem' }}>{lang === 'tr' ? "QR'ı tarat" : 'Scan the QR'}</div>
            </a>
          </div>
        </div>
      </section>

      {/* VİTRİN — asagi kaydirilinca (veya QR'a tiklaninca) gorunur, 2 video crossfade */}
      <section id="vitrin" style={{ position: 'relative', overflow: 'hidden', color: '#f0eadd', minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', scrollMarginTop: '0' }}>
        <VideoKatmanlari videos={VITRIN_VIDEOLARI} intervalMs={7000} />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(20,22,15,0.5)' }} />
        <div style={{ position: 'absolute', inset: '20px', border: '1px solid rgba(240,234,221,0.14)', borderRadius: '2px', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '3rem 2rem' }}>
          <p className="mono-label" style={{ opacity: 0.75 }}>
            {lang === 'tr' ? 'Blockchain İzlenebilirlik Vitrini' : 'Blockchain Traceability Showcase'}
          </p>
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
