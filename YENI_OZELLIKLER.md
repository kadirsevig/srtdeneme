# Yeni Eklenen Özellikler

SRT Medikal web sitesine eklenen yeni özellikler ve kullanım kılavuzu.

## ✅ Eklenen Özellikler

### 1. 🔍 Site İçi Arama
- **Dosya:** `js/search.js`, `data/search-index.json`
- **Özellikler:**
  - Ürünler, sayfalar ve içerik için tam metin arama
  - Gerçek zamanlı sonuç gösterimi
  - Vurgulanmış arama terimleri
  - Klavye kısayolları (ESC ile kapatma, Enter ile ilk sonuca gitme)
- **Kullanım:** Header'da arama ikonuna tıklayın

### 2. 🎯 Ürün Filtreleme
- **Dosya:** `js/filters.js`
- **Özellikler:**
  - Kategori bazlı filtreleme
  - Marka bazlı filtreleme
  - Özellik bazlı filtreleme
  - Çoklu filtre kombinasyonu
  - Sonuç sayısı gösterimi
- **Kullanım:** Ürünler sayfasında filtreleme panelini kullanın

### 3. ⚖️ Ürün Karşılaştırma
- **Dosya:** `js/comparison.js`
- **Özellikler:**
  - En fazla 4 ürün karşılaştırma
  - Karşılaştırma tablosu
  - LocalStorage ile kalıcı saklama
  - Ürün kartlarında "Karşılaştırmaya Ekle" butonu
- **Kullanım:** Ürün kartlarındaki "Karşılaştır" butonuna tıklayın

### 4. 🧭 Breadcrumb Navigasyon
- **Dosya:** `js/breadcrumb.js`
- **Özellikler:**
  - Otomatik sayfa hiyerarşisi gösterimi
  - Tüm sayfalarda otomatik ekleme
  - SEO dostu yapı
- **Kullanım:** Her sayfanın üst kısmında otomatik görünür

### 5. 🔎 SEO İyileştirmeleri
- **Dosya:** `js/seo.js`
- **Özellikler:**
  - Schema.org structured data
  - Organization schema
  - Product schema
  - BreadcrumbList schema
  - WebSite schema (arama özelliği için)
- **Kullanım:** Otomatik çalışır, ekstra işlem gerekmez

### 6. 🌐 Çoklu Dil Desteği (i18n)
- **Dosya:** `js/i18n.js`, `data/translations.json`
- **Özellikler:**
  - Türkçe ve İngilizce desteği
  - URL parametresi ile dil değiştirme (?lang=en)
  - LocalStorage ile tercih saklama
  - Header'da dil seçici
- **Kullanım:** Header'daki TR/EN butonlarına tıklayın

### 7. ⚡ Lazy Loading
- **Dosya:** `js/lazy-load.js`
- **Özellikler:**
  - Görseller için lazy loading
  - Videolar için lazy loading
  - Intersection Observer API kullanımı
  - Performans optimizasyonu
- **Kullanım:** Otomatik çalışır, `loading="lazy"` attribute'u ile kullanın

### 8. 📱 Progressive Web App (PWA)
- **Dosyalar:** `manifest.json`, `sw.js`, `js/pwa.js`
- **Özellikler:**
  - Service Worker ile offline desteği
  - Uygulama yükleme özelliği
  - Manifest dosyası
  - Cache stratejisi
  - Güncelleme bildirimleri
- **Kullanım:** Tarayıcı yükleme önerisini gösterir

### 9. 📊 Google Analytics Entegrasyonu
- **Dosya:** `js/analytics.js`
- **Özellikler:**
  - Google Analytics 4 (GA4) entegrasyonu
  - Sayfa görüntüleme takibi
  - Olay takibi (arama, filtreleme, karşılaştırma)
  - Video oynatma takibi
  - Form gönderim takibi
- **Kullanım:** `js/analytics.js` dosyasındaki `gaId` değerini kendi Google Analytics ID'niz ile değiştirin

## 📁 Dosya Yapısı

```
srt web/
├── data/
│   ├── search-index.json      # Arama indeksi
│   └── translations.json      # Çeviri dosyası
├── js/
│   ├── search.js              # Arama fonksiyonu
│   ├── filters.js             # Filtreleme fonksiyonu
│   ├── comparison.js          # Karşılaştırma fonksiyonu
│   ├── breadcrumb.js          # Breadcrumb navigasyon
│   ├── lazy-load.js           # Lazy loading
│   ├── seo.js                 # SEO iyileştirmeleri
│   ├── analytics.js           # Google Analytics
│   ├── pwa.js                 # PWA özellikleri
│   └── i18n.js                # Çoklu dil desteği
├── css/
│   └── styles.css             # Tüm yeni stiller eklendi
├── manifest.json              # PWA manifest
└── sw.js                      # Service Worker
```

## ⚙️ Yapılandırma

### Google Analytics
`js/analytics.js` dosyasında `gaId` değerini kendi Google Analytics Measurement ID'niz ile değiştirin:
```javascript
this.gaId = 'G-XXXXXXXXXX'; // Kendi ID'nizi buraya yazın
```

### PWA Manifest
`manifest.json` dosyasındaki bilgileri güncelleyebilirsiniz:
- `name`: Uygulama adı
- `short_name`: Kısa ad
- `theme_color`: Tema rengi
- `icons`: Uygulama ikonları

### Arama İndeksi
`data/search-index.json` dosyasına yeni ürünler ve sayfalar ekleyebilirsiniz.

### Çeviriler
`data/translations.json` dosyasına yeni çeviriler ekleyebilirsiniz.

## 🎨 CSS Sınıfları

### Arama
- `.search-toggle` - Arama butonu
- `.search-modal` - Arama modalı
- `.search-result-item` - Arama sonuç öğesi

### Filtreleme
- `.product-filters` - Filtreleme konteyneri
- `.filter-group` - Filtre grubu
- `.filter-checkbox` - Filtre checkbox'ı

### Karşılaştırma
- `.product-comparison` - Karşılaştırma paneli
- `.comparison-add-btn` - Karşılaştırmaya ekle butonu
- `.comparison-modal` - Karşılaştırma modalı

### Breadcrumb
- `.breadcrumb` - Breadcrumb navigasyon
- `.breadcrumb-item` - Breadcrumb öğesi

## 🚀 Kullanım Örnekleri

### Arama Özelliği
```javascript
// Otomatik çalışır, ekstra kod gerekmez
// Header'da arama ikonuna tıklayın
```

### Filtreleme
```html
<!-- Ürünler sayfasına filtreleme paneli ekleyin -->
<div class="product-filters"></div>
```

### Karşılaştırma
```javascript
// Ürün ekleme
window.productComparison.addToComparison(productId, productName, productData);

// Karşılaştırmayı göster
window.productComparison.showComparison();
```

### Çeviri
```javascript
// Çeviri alma
const text = window.i18n.t('nav.home'); // "Anasayfa" veya "Home"

// Dil değiştirme
window.i18n.switchLanguage('en');
```

## 📝 Notlar

1. **Google Analytics:** Analytics.js dosyasındaki ID'yi mutlaka güncelleyin
2. **Service Worker:** HTTPS gereklidir (localhost hariç)
3. **Lazy Loading:** Görsellerde `loading="lazy"` attribute'u kullanın
4. **PWA:** Manifest ve Service Worker dosyalarının root dizinde olması gerekir

## 🔧 Sorun Giderme

### Arama çalışmıyor
- `data/search-index.json` dosyasının doğru yüklendiğinden emin olun
- Browser console'da hata kontrolü yapın

### Filtreleme çalışmıyor
- Ürünler sayfasında `.product-filters` div'inin olduğundan emin olun
- `data/search-index.json` dosyasının doğru yüklendiğinden emin olun

### PWA yüklenmiyor
- HTTPS bağlantısı gereklidir
- Service Worker dosyasının root dizinde olduğundan emin olun
- Manifest dosyasının doğru yüklendiğinden emin olun

## 📞 Destek

Herhangi bir sorun veya soru için:
- Email: info@srtmedikal.com
- Tel: 0342 335 02 00





