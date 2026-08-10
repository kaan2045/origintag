import Link from 'next/link';

export const metadata = {
    title: 'Gizlilik Politikası',
    description: 'OriginTag gizlilik politikası — hangi verileri topluyoruz, neden topluyoruz ve haklarınız.',
};

export default function GizlilikPolitikasi() {
    return (
        <main style={{ minHeight: '100vh', background: 'var(--surface)', color: 'var(--on-surface)' }}>
            <nav style={{ padding: '1.75rem 2.5rem' }}>
                <Link href="/">
                    <img src="/origin.png" alt="OriginTag" style={{ height: '32px' }} />
                </Link>
            </nav>

            <div style={{ maxWidth: '760px', margin: '0 auto', padding: '2rem 1.5rem 6rem', lineHeight: 1.7, fontSize: '0.98rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Gizlilik Politikası</h1>
                <p style={{ color: 'var(--on-surface-variant)', marginBottom: '2.5rem' }}>Son güncelleme: Ağustos 2026</p>

                <p style={{ marginBottom: '1.5rem' }}>
                    Bu gizlilik politikası, OriginTag web sitesi (origintag.com.tr) ve OriginTag mobil uygulaması
                    (iOS/Android) için geçerlidir. OriginTag, tarım ürünleri için blockchain tabanlı QR izlenebilirlik
                    ve doğrulama hizmeti sunar.
                </p>

                <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginTop: '2.5rem', marginBottom: '0.75rem' }}>
                    1. Topladığımız Veriler
                </h2>
                <p style={{ marginBottom: '0.75rem' }}><strong>Hesap sahipleri (üretici/firma) için:</strong></p>
                <ul style={{ marginBottom: '1.25rem', paddingLeft: '1.25rem' }}>
                    <li>Ad, soyad, e-posta adresi, firma/çiftlik adı</li>
                    <li>Şifre (geri döndürülemez şekilde şifrelenmiş olarak saklanır, düz metin olarak asla tutulmaz)</li>
                    <li>Eklediğiniz ürün bilgileri (ürün adı, tipi, bölge, hasat tarihi, miktar, açıklama, fotoğraf/video)</li>
                </ul>
                <p style={{ marginBottom: '0.75rem' }}><strong>Ürün QR kodunu tarayan son kullanıcılar için:</strong></p>
                <ul style={{ marginBottom: '1.25rem', paddingLeft: '1.25rem' }}>
                    <li>IP adresi ve bu adresten tahmini şehir/bölge/ülke konumu</li>
                    <li>Cihaz tipi (mobil/masaüstü)</li>
                    <li>Tarama tarihi ve saati</li>
                </ul>
                <p>
                    Bu tarama verileri, sahtecilik ve kopya ürün tespiti amacıyla (ör. aynı ürünün kısa sürede
                    birbirinden çok uzak konumlardan taranması gibi anormal örüntüleri fark etmek için) toplanır ve
                    yalnızca o ürünü sisteme ekleyen hesap sahibiyle paylaşılır.
                </p>

                <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginTop: '2.5rem', marginBottom: '0.75rem' }}>
                    2. Verileri Nasıl Kullanıyoruz
                </h2>
                <ul style={{ paddingLeft: '1.25rem' }}>
                    <li>Hesabınızla giriş yapmanızı ve ürünlerinizi yönetmenizi sağlamak</li>
                    <li>Ürün doğrulama sayfalarını (QR kod okutulduğunda açılan sayfa) oluşturmak</li>
                    <li>Sahtecilik/kopya ürün şüphesi tespiti</li>
                    <li>Ürün kayıtlarını Polygon blok zincirine (kamuya açık, değiştirilemez bir kayıt defteri) yazmak</li>
                </ul>

                <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginTop: '2.5rem', marginBottom: '0.75rem' }}>
                    3. Üçüncü Taraflarla Paylaşım
                </h2>
                <p style={{ marginBottom: '0.75rem' }}>Verileriniz aşağıdaki hizmet sağlayıcılar aracılığıyla işlenir:</p>
                <ul style={{ paddingLeft: '1.25rem' }}>
                    <li><strong>Vercel</strong> — barındırma, dosya (fotoğraf/video) depolama</li>
                    <li><strong>Neon</strong> — veritabanı barındırma</li>
                    <li><strong>ipwho.is</strong> — IP adresinden yaklaşık konum tespiti (yalnızca tarama kaydı sırasında)</li>
                    <li><strong>Polygon (blok zinciri ağı)</strong> — ürün hash&apos;i, ürün adı ve tipi kamuya açık ve
                        kalıcı olarak zincire yazılır; bu kayıt hiçbir zaman silinemez</li>
                </ul>
                <p style={{ marginTop: '0.75rem' }}>Verileriniz reklam amacıyla satılmaz veya kiralanmaz.</p>

                <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginTop: '2.5rem', marginBottom: '0.75rem' }}>
                    4. Veri Saklama
                </h2>
                <p>
                    Hesap ve ürün verileri, hesabınız aktif olduğu sürece saklanır. Tarama kayıtları sahtecilik
                    tespiti amacıyla saklanır. Blok zincirine yazılan veriler (hash, ürün adı, tipi, işlem zamanı)
                    blok zincirinin doğası gereği kalıcıdır ve silinemez.
                </p>

                <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginTop: '2.5rem', marginBottom: '0.75rem' }}>
                    5. Haklarınız (KVKK)
                </h2>
                <p style={{ marginBottom: '0.75rem' }}>
                    6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında; kişisel verilerinizin işlenip
                    işlenmediğini öğrenme, işlenmişse buna ilişkin bilgi talep etme, verilerinizin düzeltilmesini
                    veya (blok zincirine yazılanlar hariç, yukarıda açıklanan kalıcılık nedeniyle) silinmesini talep
                    etme haklarına sahipsiniz.
                </p>
                <p>Bu haklarınızı kullanmak için aşağıdaki iletişim bilgilerinden bize ulaşabilirsiniz.</p>

                <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginTop: '2.5rem', marginBottom: '0.75rem' }}>
                    6. Mobil Uygulama İzinleri
                </h2>
                <p>
                    OriginTag mobil uygulaması, ürün eklerken fotoğraf seçebilmeniz için galeri erişim izni ister.
                    Bu izin yalnızca siz bir fotoğraf seçtiğinizde kullanılır, arka planda veri toplamaz.
                </p>

                <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginTop: '2.5rem', marginBottom: '0.75rem' }}>
                    7. İletişim
                </h2>
                <p>
                    Gizlilikle ilgili sorularınız için: <a href="mailto:info@origintag.com.tr" style={{ color: 'var(--secondary)' }}>info@origintag.com.tr</a>
                </p>

                <p style={{ marginTop: '3rem', fontSize: '0.85rem', color: 'var(--on-surface-variant)' }}>
                    Bu metin genel bilgilendirme amaçlıdır ve hukuki danışmanlık yerine geçmez.
                </p>
            </div>
        </main>
    );
}
