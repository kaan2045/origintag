'use client';
import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import LanguageSwitcher from './components/LanguageSwitcher';
import VideoKatmanlari from './components/VideoKatmanlari';
import { useLanguage } from './context/LanguageContext';

const VITRIN_ICERIK = [
  {
    video: '/videos/landing-hero.mp4',
    baslik: { tr: 'Zeytin Bahçesi', en: 'Olive Grove' },
    aciklama: { tr: 'Toroslar eteklerinde, ilaçlamasız zeytin ağaçları.', en: 'Pesticide-free olive trees at the foot of the Taurus mountains.' },
  },
  {
    video: '/videos/bal-hero.mp4',
    baslik: { tr: 'Bal Üretimi', en: 'Honey Production' },
    aciklama: { tr: 'Kovanlardan doğal, katkısız bal — el emeği, göz nuru.', en: 'Natural, unadulterated honey straight from the hive.' },
  },
];

export default function Home() {
  const { lang } = useLanguage();
  const qrRef = useRef<HTMLCanvasElement>(null);
  const vitrinRef = useRef<HTMLDivElement>(null);
  const [vitrinAcik, setVitrinAcik] = useState(() => {
    // QR telefonla taranıp doğrudan #vitrin'e gelindiyse, vitrini baştan açık göster
    if (typeof window !== 'undefined') return window.location.hash === '#vitrin';
    return false;
  });
  const [aktifIndex, setAktifIndex] = useState(0);

  useEffect(() => {
    if (qrRef.current) {
      QRCode.toCanvas(qrRef.current, 'https://origintag.com.tr/#vitrin', {
        width: 128, margin: 1,
        color: { dark: '#101415', light: '#e0e3e5' },
      });
    }
  }, []);

  useEffect(() => {
    if (vitrinAcik) {
      vitrinRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [vitrinAcik]);

  const aktif = VITRIN_ICERIK[aktifIndex];

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
    <main style={{ margin: 0, padding: 0, background: 'var(--surface)' }}>

      {/* HERO — tek video (zeytin dali), yüzen hap navbar üstte */}
      <section style={{ position: 'relative', overflow: 'hidden', color: 'var(--on-surface)', minHeight: '100vh' }}>
        <video
          autoPlay muted loop playsInline preload="auto"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        >
          <source src="/videos/landing-hero.mp4" type="video/mp4" />
        </video>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(10,15,16,0.6) 0%, rgba(6,10,10,0.55) 45%, rgba(6,10,10,0.92) 100%)',
        }} />

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

          {/* YÜZEN HAP NAVBAR */}
          <div style={{ position: 'sticky', top: '1.25rem', zIndex: 50, display: 'flex', justifyContent: 'center', padding: '0 1.5rem' }}>
            <nav className="od-navbar" style={{ width: '100%', maxWidth: 'var(--container-max)' }}>
              <img src="/origin.png" alt="OriginTag" style={{ height: '26px', filter: 'brightness(0) invert(1)', opacity: 0.94 }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <a href="/login" className="od-btn-ghost">
                  {lang === 'tr' ? 'Giriş Yap' : 'Sign In'}
                </a>
                <a href="/register" className="od-btn-primary">
                  {lang === 'tr' ? 'Ücretsiz Başla' : 'Get Started Free'}
                </a>
                <LanguageSwitcher />
              </div>
            </nav>
          </div>

          <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '2rem 2.75rem 4rem', flexWrap: 'wrap', gap: '3rem' }}>
            <div style={{ flex: '1 1 480px', minWidth: '320px' }}>
              <span className="od-chip" style={{ marginBottom: '1.5rem' }}>
                {lang === 'tr' ? 'Coğrafi İşaretli Ürünler İçin' : 'For Geographically Indicated Products'}
              </span>
              <h1 className="font-display" style={{ fontSize: 'clamp(2.4rem, 5vw, 3.75rem)', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.08, margin: '1.25rem 0 1.5rem' }}>
                {lang === 'tr'
                  ? <>Ürününüzün hikayesini <span style={{ color: 'var(--secondary)' }}>tarladan sofraya</span> belgeleyin</>
                  : <>Document your product&apos;s <span style={{ color: 'var(--secondary)' }}>story from farm to table</span></>}
              </h1>
              <p style={{ fontSize: '1.125rem', color: 'var(--on-surface-variant)', maxWidth: '480px', margin: '0 0 2.5rem', lineHeight: 1.7, fontWeight: 400 }}>
                {lang === 'tr'
                  ? 'Zeytinyağından bala, peynirden şaraba — her adım blockchain\'e yazılır, değiştirilemez ve tek bir QR kod ile doğrulanır.'
                  : 'From olive oil to honey, cheese to wine — every step is written to the blockchain, immutable, and verifiable with a single QR code.'}
              </p>
              <a href="/register" className="od-btn-primary" style={{ fontSize: '1rem', padding: '1rem 2.2rem' }}>
                {lang === 'tr' ? 'Hemen Başla — Ücretsiz' : 'Get Started — Free'}
              </a>
            </div>

            <a href="#vitrin" onClick={(e) => { e.preventDefault(); setVitrinAcik(true); }}
              className="od-glass od-glass-interactive"
              style={{
                flex: '0 0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem',
                padding: '1.75rem', textDecoration: 'none', color: 'var(--on-surface)',
              }}>
              <div style={{ background: 'var(--on-surface)', padding: '10px', borderRadius: 'var(--radius)', lineHeight: 0 }}>
                <canvas ref={qrRef} style={{ display: 'block' }} />
              </div>
              <div className="mono-label" style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)' }}>{lang === 'tr' ? "QR'ı tarat" : 'Scan the QR'}</div>
            </a>
          </div>
        </div>
      </section>

      {/* VİTRİN — sadece QR'a tiklaninca acilir, reels tarzi glass kart */}
      <div ref={vitrinRef} style={{ scrollMarginTop: '2rem' }}>
        {vitrinAcik && (
          <section id="vitrin" style={{ padding: '5rem 1.5rem' }}>
            <p className="mono-label" style={{ textAlign: 'center', color: 'var(--secondary)', marginBottom: '3rem' }}>
              {lang === 'tr' ? 'Blockchain İzlenebilirlik Vitrini' : 'Blockchain Traceability Showcase'}
            </p>
            <div className="od-glass" style={{
              display: 'flex', gap: '2.5rem', maxWidth: '860px', margin: '0 auto',
              alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center', padding: '2.5rem',
            }}>
              <div style={{
                width: '250px', height: '440px', overflow: 'hidden', position: 'relative',
                borderRadius: 'var(--radius-md)', flexShrink: 0, background: 'var(--surface-container-low)',
              }}>
                <VideoKatmanlari videos={VITRIN_ICERIK.map(v => v.video)} intervalMs={7000} onIndexChange={setAktifIndex} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 55%, rgba(6,10,10,0.8) 100%)' }} />
              </div>

              <div style={{ flex: '1 1 260px', minWidth: '220px' }}>
                <h3 key={aktifIndex} className="font-display" style={{ fontSize: '1.7rem', fontWeight: 700, color: 'var(--on-surface)', marginBottom: '0.75rem' }}>
                  {lang === 'tr' ? aktif.baslik.tr : aktif.baslik.en}
                </h3>
                <p style={{ color: 'var(--on-surface-variant)', lineHeight: 1.7, fontSize: '0.98rem', marginBottom: '1.75rem' }}>
                  {lang === 'tr' ? aktif.aciklama.tr : aktif.aciklama.en}
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {VITRIN_ICERIK.map((_, i) => (
                    <div key={i} style={{
                      width: i === aktifIndex ? '26px' : '8px', height: '4px', borderRadius: 'var(--radius-full)',
                      background: i === aktifIndex ? 'var(--secondary)' : 'var(--outline-variant)', transition: 'all 0.4s ease',
                    }} />
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* ÜRÜNLER */}
      <section style={{ padding: '3.5rem 1.5rem' }}>
        <p className="mono-label" style={{ textAlign: 'center', color: 'var(--on-surface-variant)', marginBottom: '1.75rem' }}>
          {lang === 'tr' ? 'Her Tür Tarım Ürünü İçin' : 'For All Agricultural Products'}
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.6rem', flexWrap: 'wrap', maxWidth: '860px', margin: '0 auto' }}>
          {urunler.map((u, i) => (
            <span key={i} className="od-chip" style={{ background: 'var(--surface-container)', textTransform: 'none', fontWeight: 500 }}>{u}</span>
          ))}
        </div>
      </section>

      {/* ÖZELLİKLER */}
      <section style={{ padding: '6rem 1.5rem', maxWidth: 'var(--container-max)', margin: '0 auto' }}>
        <p className="mono-label" style={{ textAlign: 'center', color: 'var(--secondary)', marginBottom: '1.25rem' }}>
          {lang === 'tr' ? 'Neden OriginTag' : 'Why OriginTag'}
        </p>
        <h2 className="font-display" style={{ textAlign: 'center', fontSize: 'clamp(2rem, 4.4vw, 3rem)', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '3.5rem', color: 'var(--on-surface)' }}>
          {lang === 'tr' ? 'Şeffaflık, kanıtla birlikte gelir' : 'Transparency, backed by proof'}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {ozellikler.map((f, i) => (
            <div key={i} className="od-glass od-glass-interactive" style={{ padding: '2.25rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius)', background: 'rgba(178,230,48,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary)', fontSize: '1rem', marginBottom: '1.5rem' }}>⬡</div>
              <h3 className="font-display" style={{ color: 'var(--on-surface)', fontWeight: 700, fontSize: '1.2rem', marginBottom: '0.75rem' }}>{f.title}</h3>
              <p style={{ color: 'var(--on-surface-variant)', lineHeight: 1.7, fontSize: '0.95rem', margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ textAlign: 'center', padding: '3.5rem 1.5rem', borderTop: '1px solid var(--outline-variant)' }}>
        <img src="/origin.png" alt="OriginTag" style={{ height: '24px', marginBottom: '0.9rem', filter: 'brightness(0) invert(1)', opacity: 0.45 }} />
        <p className="mono-label" style={{ color: 'var(--on-surface-variant)', fontSize: '0.7rem' }}>© 2026 OriginTag — Geographical Indicator & Traceability</p>
      </footer>

    </main>
  );
}
