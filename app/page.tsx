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
        color: { dark: '#1a1a0f', light: '#f2ede0' },
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
    <main style={{ margin: 0, padding: 0, background: 'var(--bg)' }}>

      {/* HERO — tek video (zeytin dali), metin sol / QR sag */}
      <section style={{ position: 'relative', overflow: 'hidden', color: 'var(--cream)', minHeight: '100vh' }}>
        <video
          autoPlay muted loop playsInline preload="auto"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        >
          <source src="/videos/landing-hero.mp4" type="video/mp4" />
        </video>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(26,26,15,0.55) 0%, rgba(26,26,15,0.62) 45%, rgba(26,26,15,0.94) 100%)',
        }} />
        <div style={{ position: 'absolute', inset: '20px', border: '1px solid rgba(242,237,224,0.14)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

          <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2rem 2.75rem' }}>
            <img src="/origin.png" alt="OriginTag" style={{ height: '30px', filter: 'brightness(0) invert(1)', opacity: 0.94 }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
              <a href="/login" className="ot-btn-outline" style={{ padding: '0.55rem 1.2rem', fontSize: '0.85rem' }}>
                {lang === 'tr' ? 'Giriş Yap' : 'Sign In'}
              </a>
              <a href="/register" className="ot-btn-solid" style={{ padding: '0.55rem 1.2rem', fontSize: '0.85rem' }}>
                {lang === 'tr' ? 'Ücretsiz Başla' : 'Get Started Free'}
              </a>
              <LanguageSwitcher />
            </div>
          </nav>

          <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '2rem 2.75rem 4rem', flexWrap: 'wrap', gap: '3rem' }}>
            <div style={{ flex: '1 1 480px', minWidth: '320px' }}>
              <p className="mono-label" style={{ color: 'var(--gold)', marginBottom: '1.5rem' }}>
                {lang === 'tr' ? 'Coğrafi İşaretli Ürünler İçin' : 'For Geographically Indicated Products'}
              </p>
              <h1 className="font-display" style={{ fontSize: 'clamp(2.4rem, 5vw, 4rem)', fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1.05, margin: '0 0 1.5rem' }}>
                {lang === 'tr'
                  ? <>Ürününüzün hikayesini <span style={{ color: 'var(--gold)' }}>tarladan sofraya</span> belgeleyin</>
                  : <>Document your product&apos;s <span style={{ color: 'var(--gold)' }}>story from farm to table</span></>}
              </h1>
              <p style={{ fontSize: '1.05rem', color: 'var(--cream-dim)', maxWidth: '480px', margin: '0 0 2.5rem', lineHeight: 1.7, fontWeight: 300 }}>
                {lang === 'tr'
                  ? 'Zeytinyağından bala, peynirden şaraba — her adım blockchain\'e yazılır, değiştirilemez ve tek bir QR kod ile doğrulanır.'
                  : 'From olive oil to honey, cheese to wine — every step is written to the blockchain, immutable, and verifiable with a single QR code.'}
              </p>
              <a href="/register" className="ot-btn-solid" style={{ fontSize: '0.95rem' }}>
                {lang === 'tr' ? 'Hemen Başla — Ücretsiz' : 'Get Started — Free'}
              </a>
            </div>

            <a href="#vitrin" onClick={(e) => { e.preventDefault(); setVitrinAcik(true); }} style={{
              flex: '0 0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem',
              padding: '1.75rem', border: '1px solid var(--line-strong)', background: 'rgba(0,0,0,0.18)',
              textDecoration: 'none', color: 'var(--cream)', cursor: 'pointer',
            }}>
              <div style={{ background: 'var(--cream)', padding: '10px', lineHeight: 0 }}>
                <canvas ref={qrRef} style={{ display: 'block' }} />
              </div>
              <div className="mono-label" style={{ fontSize: '0.7rem', color: 'var(--cream-dim)' }}>{lang === 'tr' ? "QR'ı tarat" : 'Scan the QR'}</div>
            </a>
          </div>
        </div>
      </section>

      {/* VİTRİN — sadece QR'a tiklaninca acilir, hero'dan ayri, reels tarzi kart */}
      <div ref={vitrinRef} style={{ scrollMarginTop: '2rem' }}>
        {vitrinAcik && (
          <section id="vitrin" style={{ padding: '5rem 2rem', background: 'var(--bg)', borderTop: '1px solid var(--line)' }}>
            <p className="mono-label" style={{ textAlign: 'center', color: 'var(--gold)', marginBottom: '3rem' }}>
              {lang === 'tr' ? 'Blockchain İzlenebilirlik Vitrini' : 'Blockchain Traceability Showcase'}
            </p>
            <div style={{
              display: 'flex', gap: '2.5rem', maxWidth: '820px', margin: '0 auto',
              alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center',
            }}>
              <div style={{
                width: '260px', height: '460px', overflow: 'hidden', position: 'relative',
                border: '1px solid var(--line-strong)', flexShrink: 0, background: 'var(--bg-elevated)',
              }}>
                <VideoKatmanlari videos={VITRIN_ICERIK.map(v => v.video)} intervalMs={7000} onIndexChange={setAktifIndex} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 55%, rgba(20,20,12,0.75) 100%)' }} />
              </div>

              <div style={{ flex: '1 1 260px', minWidth: '220px' }}>
                <h3 key={aktifIndex} className="font-display" style={{ fontSize: '1.7rem', fontWeight: 500, color: 'var(--cream)', marginBottom: '0.75rem' }}>
                  {lang === 'tr' ? aktif.baslik.tr : aktif.baslik.en}
                </h3>
                <p style={{ color: 'var(--cream-dim)', lineHeight: 1.7, fontSize: '0.95rem', marginBottom: '1.75rem', fontWeight: 300 }}>
                  {lang === 'tr' ? aktif.aciklama.tr : aktif.aciklama.en}
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {VITRIN_ICERIK.map((_, i) => (
                    <div key={i} style={{
                      width: i === aktifIndex ? '26px' : '8px', height: '2px',
                      background: i === aktifIndex ? 'var(--gold)' : 'var(--line-strong)', transition: 'all 0.4s ease',
                    }} />
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* ÜRÜNLER */}
      <section style={{ padding: '3.5rem 2rem', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
        <p className="mono-label" style={{ textAlign: 'center', color: 'var(--cream-faint)', marginBottom: '1.75rem' }}>
          {lang === 'tr' ? 'Her Tür Tarım Ürünü İçin' : 'For All Agricultural Products'}
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.6rem', flexWrap: 'wrap', maxWidth: '820px', margin: '0 auto' }}>
          {urunler.map((u, i) => (
            <span key={i} className="mono-label" style={{ padding: '0.55rem 1.15rem', border: '1px solid var(--line-strong)', fontSize: '0.72rem', letterSpacing: '0.1em', color: 'var(--cream-dim)', textTransform: 'none' }}>{u}</span>
          ))}
        </div>
      </section>

      {/* ÖZELLİKLER */}
      <section style={{ padding: '7rem 2rem', maxWidth: '1080px', margin: '0 auto' }}>
        <p className="mono-label" style={{ textAlign: 'center', color: 'var(--gold)', marginBottom: '1.25rem' }}>
          {lang === 'tr' ? 'Neden OriginTag' : 'Why OriginTag'}
        </p>
        <h2 className="font-display" style={{ textAlign: 'center', fontSize: 'clamp(2.1rem, 4.4vw, 3.1rem)', fontWeight: 500, letterSpacing: '-0.02em', marginBottom: '4rem', color: 'var(--cream)' }}>
          {lang === 'tr' ? 'Şeffaflık, kanıtla birlikte gelir' : 'Transparency, backed by proof'}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1px', background: 'var(--line)', border: '1px solid var(--line)' }}>
          {ozellikler.map((f, i) => (
            <div key={i} style={{ padding: '2.75rem 2.25rem', background: 'var(--bg)' }}>
              <div style={{ width: '28px', height: '1px', background: 'var(--gold)', marginBottom: '1.5rem' }} />
              <h3 className="font-display" style={{ color: 'var(--cream)', fontWeight: 500, fontSize: '1.25rem', marginBottom: '0.85rem' }}>{f.title}</h3>
              <p style={{ color: 'var(--cream-dim)', lineHeight: 1.7, fontSize: '0.95rem', margin: 0, fontWeight: 300 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ textAlign: 'center', padding: '3.5rem 2rem', color: 'var(--cream-faint)', borderTop: '1px solid var(--line)' }}>
        <img src="/origin.png" alt="OriginTag" style={{ height: '24px', marginBottom: '0.9rem', filter: 'brightness(0) invert(1)', opacity: 0.45 }} />
        <p className="mono-label" style={{ color: 'var(--cream-faint)', fontSize: '0.66rem' }}>© 2026 OriginTag — Geographical Indicator & Traceability</p>
      </footer>

    </main>
  );
}
