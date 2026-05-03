export default function Home() {
  return (
    <main style={{ fontFamily: 'sans-serif', margin: 0, padding: 0 }}>

      {/* NAVBAR */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', borderBottom: '1px solid #eee' }}>
        <img src="/origin.png" alt="OriginTag" style={{ height: '50px' }} />
        <div style={{ display: 'flex', gap: '1rem' }}>
          <a href="/login" style={{ padding: '0.5rem 1rem', border: '1px solid #2D5A27', borderRadius: '6px', color: '#2D5A27', textDecoration: 'none' }}>Giriş Yap</a>
          <a href="/register" style={{ padding: '0.5rem 1rem', background: '#2D5A27', borderRadius: '6px', color: '#fff', textDecoration: 'none' }}>Ücretsiz Başla</a>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ textAlign: 'center', padding: '5rem 2rem', background: '#f9f7f4' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '1rem' }}>
          Ürününüzün Hikayesini<br />
          <span style={{ color: '#2D5A27' }}>Blockchain ile Belgeleyin</span>
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#555', maxWidth: '600px', margin: '0 auto 2rem' }}>
          Zeytinyağından süte, peynirden bala — tarladan sofraya her adımı şeffaf, değiştirilemez ve QR kod ile doğrulanabilir hale getirin.
        </p>
        <a href="/register" style={{ padding: '1rem 2rem', background: '#2D5A27', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontSize: '1.1rem' }}>
          Hemen Başla — Ücretsiz
        </a>
      </section>

      {/* ÜRÜNLER */}
      <section style={{ padding: '3rem 2rem', borderBottom: '1px solid #eee' }}>
        <p style={{ textAlign: 'center', color: '#999', fontSize: '0.9rem', marginBottom: '1.5rem', letterSpacing: '0.1em' }}>HER TÜRLÜ TARIM ÜRÜNİ İÇİN</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
          {['🫒 Zeytinyağı', '🥛 Süt & Süt Ürünleri', '🧀 Peynir', '🍯 Bal', '🍅 Sebze & Meyve', '🌾 Tahıl', '🍷 Şarap', '🫙 Turşu & Reçel'].map((u, i) => (
            <span key={i} style={{ padding: '0.5rem 1rem', background: '#f9f7f4', borderRadius: '20px', fontSize: '0.95rem', color: '#555' }}>{u}</span>
          ))}
        </div>
      </section>

      {/* ÖZELLİKLER */}
      <section style={{ padding: '4rem 2rem', maxWidth: '900px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '3rem', color: '#1a1a1a' }}>Neden OriginTag?</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
          {[
            { icon: '🔗', title: 'Blockchain Güvencesi', desc: 'Verileriniz SHA-256 ile şifrelenir, kimse değiştiremez.' },
            { icon: '📍', title: 'Coğrafi İşaret', desc: 'Ürününüzün nereden geldiğini kanıtlayın, sahte ürünleri önleyin.' },
            { icon: '📱', title: 'QR Kod Takibi', desc: 'Her ürüne özel QR kod, müşteri taratır ve anında doğrular.' },
            { icon: '📊', title: 'Analiz & Raporlama', desc: 'Ürün bazlı takip, satış ve doğrulama istatistikleri.' },
            { icon: '🌍', title: 'İhracat Hazır', desc: 'AB ve uluslararası pazarlar için coğrafi işaret belgesi desteği.' },
            { icon: '⚡', title: 'Kolay Kullanım', desc: 'Teknik bilgi gerekmez. Kayıt ol, ürününü ekle, QR al.' },
          ].map((f, i) => (
            <div key={i} style={{ textAlign: 'center', padding: '2rem', border: '1px solid #eee', borderRadius: '12px' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{f.icon}</div>
              <h3 style={{ color: '#2D5A27', marginBottom: '0.5rem' }}>{f.title}</h3>
              <p style={{ color: '#666', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FİYATLANDIRMA */}
      <section style={{ padding: '4rem 2rem', background: '#f9f7f4' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '3rem', color: '#1a1a1a' }}>Fiyatlandırma</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', maxWidth: '900px', margin: '0 auto' }}>
          {[
            { plan: 'Başlangıç', fiyat: '₺499', periot: '/ay', ozellikler: ['50 ürün kaydı', 'QR kod üretimi', 'Temel analiz', '1 kullanıcı'] },
            { plan: 'Profesyonel', fiyat: '₺999', periot: '/ay', ozellikler: ['500 ürün kaydı', 'Öncelikli destek', 'Gelişmiş analiz', 'API erişimi', '5 kullanıcı'], popular: true },
            { plan: 'Kurumsal', fiyat: 'Özel', periot: '', ozellikler: ['Sınırsız kayıt', 'Özel entegrasyon', '7/24 destek', 'SLA garantisi', 'Sınırsız kullanıcı'] },
          ].map((p, i) => (
            <div key={i} style={{ padding: '2rem', border: p.popular ? '2px solid #2D5A27' : '1px solid #eee', borderRadius: '12px', background: '#fff', textAlign: 'center' }}>
              {p.popular && <div style={{ background: '#2D5A27', color: '#fff', padding: '0.25rem 1rem', borderRadius: '20px', fontSize: '0.8rem', marginBottom: '1rem', display: 'inline-block' }}>En Popüler</div>}
              <h3 style={{ fontSize: '1.3rem', color: '#1a1a1a' }}>{p.plan}</h3>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#2D5A27', margin: '1rem 0' }}>{p.fiyat}<span style={{ fontSize: '1rem', color: '#666' }}>{p.periot}</span></div>
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: '1.5rem' }}>
                {p.ozellikler.map((o, j) => <li key={j} style={{ padding: '0.4rem 0', color: '#555' }}>✓ {o}</li>)}
              </ul>
              <a href="/register" style={{ display: 'block', padding: '0.75rem', background: p.popular ? '#2D5A27' : 'transparent', color: p.popular ? '#fff' : '#2D5A27', border: '1px solid #2D5A27', borderRadius: '8px', textDecoration: 'none' }}>Başla</a>
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