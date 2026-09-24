import SayfaNav from '../components/SayfaNav';

export const metadata = {
    title: 'Gizlilik Politikası',
    description: 'OriginTag gizlilik politikası — hangi verileri topluyoruz, neden topluyoruz ve haklarınız.',
};

export default function GizlilikPolitikasi() {
    return (
        <main className="theme-light">
            <SayfaNav geri={{ etiket: "Ana sayfa", href: "/" }} />

            <div style={{ maxWidth: '760px', margin: '0 auto', padding: '2rem 1.5rem 6rem', lineHeight: 1.7, fontSize: '0.98rem' }}>
                <p className="pg-eyebrow">Yasal</p>
                <h1 className="pg-h1" style={{ marginBottom: '0.5rem' }}>Gizlilik Politikası</h1>
                <p style={{ color: 'var(--on-surface-variant)', marginBottom: '2.5rem' }}>Son güncelleme: Eylül 2026</p>

                <p style={{ marginBottom: '1.5rem' }}>
                    Bu gizlilik politikası, OriginTag web sitesi (origintag.com.tr) ve OriginTag mobil uygulaması
                    (iOS/Android) için geçerlidir. OriginTag, tarım ürünleri için blockchain tabanlı QR izlenebilirlik
                    ve doğrulama hizmeti sunar.
                </p>

                <h2 className="pg-h2" style={{ marginTop: "2.5rem", marginBottom: "0.75rem" }}>
                    1. Topladığımız Veriler
                </h2>
                <p style={{ marginBottom: '0.75rem' }}><strong>Hesap sahipleri (üretici/firma) için:</strong></p>
                <ul style={{ marginBottom: '1.25rem', paddingLeft: '1.25rem' }}>
                    <li>Ad, soyad, e-posta adresi, firma/çiftlik adı</li>
                    <li>Şifre (geri döndürülemez şekilde şifrelenmiş olarak saklanır, düz metin olarak asla tutulmaz)</li>
                    <li>Eklediğiniz ürün bilgileri (ürün adı, tipi, bölge, hasat tarihi, miktar, açıklama, fotoğraf/video)</li>
                </ul>
                <h2 className="pg-h2" style={{ marginTop: "2.5rem", marginBottom: "0.75rem" }}>
                    2. Verileri Nasıl Kullanıyoruz
                </h2>
                <ul style={{ paddingLeft: '1.25rem' }}>
                    <li>Hesabınızla giriş yapmanızı ve ürünlerinizi yönetmenizi sağlamak</li>
                    <li>Ürün doğrulama sayfalarını (QR kod okutulduğunda açılan sayfa) oluşturmak</li>
                    <li>Ürün kayıtlarını Polygon blok zincirine (kamuya açık, değiştirilemez bir kayıt defteri) yazmak</li>
                </ul>

                <h2 className="pg-h2" style={{ marginTop: "2.5rem", marginBottom: "0.75rem" }}>
                    3. Üçüncü Taraflarla Paylaşım
                </h2>
                <p style={{ marginBottom: '0.75rem' }}>Verileriniz aşağıdaki hizmet sağlayıcılar aracılığıyla işlenir:</p>
                <ul style={{ paddingLeft: '1.25rem' }}>
                    <li><strong>Vercel</strong> — barındırma, dosya (fotoğraf/video) depolama</li>
                    <li><strong>Neon</strong> — veritabanı barındırma</li>
                    <li><strong>Sentry</strong> — mobil uygulamanın hata raporları. Bir hata olduğunda yalnızca hata
                        ayrıntısı, cihaz/uygulama sürümü ve sayısal hesap numaranız gönderilir; adınız, e-posta
                        adresiniz, şifreniz ve girdiğiniz form bilgileri gönderilmez.</li>
                    <li><strong>Polygon (blok zinciri ağı)</strong> — ürün hash&apos;i, ürün adı ve tipi kamuya açık ve
                        kalıcı olarak zincire yazılır; bu kayıt hiçbir zaman silinemez</li>
                </ul>
                <p style={{ marginTop: '0.75rem' }}>Verileriniz reklam amacıyla satılmaz veya kiralanmaz.</p>

                <h2 className="pg-h2" style={{ marginTop: "2.5rem", marginBottom: "0.75rem" }}>
                    4. Veri Saklama
                </h2>
                <p>
                    Hesap ve ürün verileri, hesabınız aktif olduğu sürece saklanır. Blok zincirine yazılan veriler
                    (hash, ürün adı, tipi, işlem zamanı) blok zincirinin doğası gereği kalıcıdır ve silinemez.
                </p>

                <h2 className="pg-h2" style={{ marginTop: "2.5rem", marginBottom: "0.75rem" }}>
                    5. Haklarınız (KVKK)
                </h2>
                <p style={{ marginBottom: '0.75rem' }}>
                    6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında; kişisel verilerinizin işlenip
                    işlenmediğini öğrenme, işlenmişse buna ilişkin bilgi talep etme, verilerinizin düzeltilmesini
                    veya (blok zincirine yazılanlar hariç, yukarıda açıklanan kalıcılık nedeniyle) silinmesini talep
                    etme haklarına sahipsiniz.
                </p>
                <p style={{ marginBottom: '0.75rem' }}>
                    Hesabınızı ve ona bağlı bütün verileri (ürünler, fotoğraflar, profil bilgileri) mobil uygulamada
                    Profil &gt; Hesabı Sil, web panelinde Hesap &gt; Hesabı Sil adımıyla kendiniz, anında ve kalıcı olarak silebilirsiniz. Silinen ürünlerin
                    QR kodları artık doğrulama sayfası göstermez.
                </p>
                <p>Bu haklarınızı kullanmak için aşağıdaki iletişim bilgilerinden bize ulaşabilirsiniz.</p>

                <h2 className="pg-h2" style={{ marginTop: "2.5rem", marginBottom: "0.75rem" }}>
                    6. Mobil Uygulama İzinleri
                </h2>
                <p>
                    OriginTag mobil uygulaması, ürün eklerken fotoğraf seçebilmeniz için galeri erişim izni; ürün
                    fotoğrafı çekmeniz ve etiketlerdeki QR kodları okutmanız için kamera izni ister. İzinler yalnızca
                    siz bu işlemleri başlattığınızda kullanılır, arka planda veri toplamaz. QR okuturken kamera
                    görüntüsü yalnızca telefonda kodu çözmek için işlenir, hiçbir yere gönderilmez. İnternet yokken
                    eklediğiniz ürünler, gönderilene kadar yalnızca kendi telefonunuzda saklanır.
                </p>

                <h2 className="pg-h2" style={{ marginTop: "2.5rem", marginBottom: "0.75rem" }}>
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
