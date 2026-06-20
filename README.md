# DC Robot - Robot Süpürge Tamırı Web Sitesi

## Hakkında
DC Robot, profesyonel robot süpürge tamırı ve bakım hizmetleri sunan bir firma için tasarlanmış modern, responsive web sitesi.

## Özellikler

✅ **Responsive Tasarım** - Tüm cihazlarda mükemmel görünüm (mobil, tablet, desktop)
✅ **Modern UI/UX** - Profesyonel ve kullanıcı dostu arayüz
✅ **Hızlı Yükleme** - Optimize edilmiş CSS ve JavaScript
✅ **SEO Hazır** - Arama motorları için optimize edilmiş
✅ **İnteraktif Menü** - Mobil uyumlu açılır menü
✅ **Form Validasyonu** - E-posta doğrulama ve hata bildirimi
✅ **Scroll Animasyonları** - Sayfada kaydırırken dinamik efektler
✅ **Çok Dilli Hazır** - Türkçe dilinde tam çeviri

## Dosya Yapısı

```
dc robot/
├── index.html      # Ana sayfa ve tüm içerik
├── style.css       # Stil ve tasarım
├── script.js       # İnteraktivite ve animasyonlar
└── README.md       # Bu dosya
```

## Sayfanın Bölümleri

1. **Header/Navigation** - Sabit navigasyon menüsü
2. **Hero Section** - Hoş geldiniz bölümü ve çağrı yapma butonu
3. **Services** - Sunulan 6 farklı hizmet kartı
4. **About** - Firmanın avantajları ve istatistikler
5. **Brands** - Çalışılan marka ve modeller
6. **Contact** - İletişim bilgileri ve form
7. **Footer** - Sosyal medya linkleri ve telif hakkı

## Nasıl Kullanılır

### 1. Dosyaları Açma
Tarayıcında `index.html` dosyasını açmak için:
- Dosyaya çift tıklayın veya
- Tarayıcıya sürükleyip bırakın

### 2. Özelleştirme

#### İletişim Bilgilerini Değiştir
`index.html` dosyasında "Contact Section" bölümünü açın ve aşağıdakileri düzenleyin:
- Telefon: `+905551234567`
- E-posta: `info@dcrobot.com`
- Adres: `Istanbul, Türkiye`
- Çalışma saatleri

#### Renkleri Değiştir
`style.css` dosyasında başındaki renk tanımlarını düzenleyin:
```css
--primary-color: #2c3e50;      /* Ana renk */
--accent-color: #e74c3c;       /* Vurgu rengi */
--secondary-color: #3498db;    /* İkincil renk */
```

#### Hizmetleri Düzenle
`index.html` dosyasında "Services Section" bölümünde hizmet kartlarını düzenleyin.

#### Sosyal Medya Linklerini Ekle
`index.html` dosyasında "Footer" bölümündeki social-links kısmını düzenleyin.

## Teknik Detaylar

### Kullanılan Teknolojiler
- **HTML5** - Semantik markup
- **CSS3** - Modern tasarım ve responsive layout
- **Vanilla JavaScript** - İnteraktivite (jQuery yok, saf JS)
- **Flexbox & Grid** - Responsive layout sistemi

### Tarayıcı Desteği
- Chrome (en yeni)
- Firefox (en yeni)
- Safari (en yeni)
- Edge (en yeni)
- Mobile Safari (iOS)
- Chrome Mobile (Android)

### Performans Optimizasyonu
- Minimize CSS
- Optimize JavaScript
- Responsive images
- Smooth animations
- Fast loading time

## İletişim Formu

Form gönderimi şu anda demo olarak çalışmaktadır. Gerçek e-posta göndermek için:

1. Bir backend servisi kurun (Node.js, PHP vb.)
2. `script.js` dosyasında form submission kodunu değiştirin
3. E-posta gönderimi servisi entegre edin (SendGrid, Mailgun vb.)

## SEO Optimizasyonu

- `<meta>` tags yapılandırılmış
- Semantik HTML5 kullanımı
- Mobile-first responsive design
- Hızlı sayfa yüklemesi

## Geliştirme Ipuçları

### Yerel Test Etme
Basit bir HTTP sunucu başlatmak için:
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Node.js (http-server paketi)
npx http-server
```

Sonra tarayıcıda açın: `http://localhost:8000`

### Deployment

1. **Netlify** - Ücretsiz ve basit
   - GitHub'a push edin
   - Netlify'e bağlayın
   - Otomatik deploy

2. **GitHub Pages** - Ücretsiz
   - Repository'ye push edin
   - Settings > Pages > Enable

3. **Shared Hosting** - Geleneksel hosting
   - FTP ile upload edin
   - DNS ayarlarını yapılandırın

## Lisans
Bu web sitesi DC Robot firma tarafından özel kullanım için tasarlanmıştır.

## Destek ve İletişim
Herhangi bir sorun veya özelleştirme talebiniz için lütfen iletişime geçin.

---
**Son Güncelleme:** 2024
**Versiyon:** 1.0
