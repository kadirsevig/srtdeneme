# Haberler Sistemi Kullanım Kılavuzu

## 📋 Genel Bakış

SRT Medikal web sitesine admin paneli üzerinden haber ekleme, düzenleme ve silme özellikleri eklendi. Haberler localStorage'da saklanır ve tüm ziyaretçiler tarafından görüntülenebilir.

## 🔐 Admin Paneli Girişi

1. Tarayıcınızda `admin.html` sayfasını açın
2. **Varsayılan şifre:** `admin123`
3. Şifrenizi değiştirmek için `js/admin.js` dosyasındaki `defaultPassword` değerini düzenleyebilirsiniz

## ✏️ Haber Ekleme

1. Admin paneline giriş yapın
2. "Yeni Haber Ekle" formunu doldurun:
   - **Başlık:** Haber başlığı (zorunlu)
   - **Resim Seç:** Bilgisayarınızdan resim seçin (zorunlu, en fazla 5 resim, max 2MB/resim)
     - JPG, PNG, GIF veya WebP formatları desteklenir
     - Birden fazla resim seçebilirsiniz (Ctrl/Cmd + tıklama ile)
     - Resimler otomatik olarak yüklenir ve galeri önizleme gösterilir
     - Her resmi silmek için üzerindeki "×" butonunu kullanabilirsiniz
   - **Tarih:** Haber tarihi (zorunlu)
   - **Kısa Açıklama:** Haber özeti (zorunlu)
   - **İçerik:** Haberin detaylı içeriği (zorunlu)
3. "Haber Ekle" butonuna tıklayın

## 📝 Haber Düzenleme

1. Haberler listesinde "Düzenle" butonuna tıklayın
2. Form otomatik olarak doldurulur
3. İstediğiniz alanları değiştirin
   - **Resimler:** 
     - Mevcut resimler galeride gösterilir
     - Yeni resimler ekleyebilirsiniz (toplam 5'e kadar)
     - Mevcut resimleri "×" butonu ile silebilirsiniz
     - Yeni resim seçmezseniz mevcut resimler korunur
   - Diğer tüm alanlar değiştirilebilir
4. "Güncelle" butonuna tıklayın

## 🗑️ Haber Silme

1. Haberler listesinde "Sil" butonuna tıklayın
2. Onay mesajında "Tamam"ı seçin

## 📱 Haberler Sayfası

- Ziyaretçiler `haberler.html` sayfasından tüm haberleri görüntüleyebilir
- Haberlerde birden fazla resim varsa, ilk resim ana resim olarak gösterilir
- Çoklu resimli haberlerde "X Resim" badge'i görünür
- Haberlere tıklayarak detaylı içeriği modal pencerede görebilirler
  - Birden fazla resim varsa slider ile resimler arasında gezinebilirler
  - Ok tuşları (← →) veya thumbnail'lere tıklayarak resim değiştirebilirler
  - Alt kısımda tüm resimlerin küçük önizlemeleri (thumbnail) gösterilir
- Haberler en yeni tarihe göre sıralanır

## 💾 Veri Saklama

- Haberler tarayıcının **localStorage**'ında saklanır
- Bu veriler sadece o tarayıcıda kalır
- Sunucuya yüklemek için:
  1. Admin panelinde haberleri ekleyin
  2. Tarayıcı konsolunda (F12) şu komutu çalıştırın:
     ```javascript
     JSON.stringify(window.newsDataForExport)
     ```
  3. Çıkan JSON'u kopyalayın
  4. `data/news.json` dosyasına yapıştırın

## 🔧 Özellikler

- ✅ Şifre korumalı admin paneli
- ✅ Haber ekleme/düzenleme/silme
- ✅ **Çoklu resim desteği (en fazla 5 resim)**
- ✅ Resim galeri önizleme
- ✅ Resim silme özelliği
- ✅ Responsive tasarım
- ✅ Modal ile detaylı haber görüntüleme
- ✅ **Resim slider/galeri görünümü (çoklu resimler için)**
- ✅ Thumbnail navigasyonu
- ✅ Klavye ile resim değiştirme (ok tuşları)
- ✅ Otomatik tarih formatlama
- ✅ Tarih bazlı sıralama (en yeni önce)

## 📂 Dosya Yapısı

```
srt web/
├── admin.html              # Admin paneli sayfası
├── haberler.html           # Haberler sayfası
├── data/
│   └── news.json          # Haberler verisi (opsiyonel)
└── js/
    ├── admin.js           # Admin paneli JavaScript
    └── news.js            # Haberler sayfası JavaScript
```

## 🎨 Tasarım

Haberler sayfası örnek görsellere benzer şekilde tasarlanmıştır:
- Kart tabanlı haber gösterimi
- Resim önizleme
- Tarih badge'i
- "DAHA FAZLA OKU" butonu
- Modal ile detaylı görüntüleme

## ⚠️ Notlar

- **Resim Yükleme:** Resimler doğrudan bilgisayarınızdan seçilir ve Base64 formatında saklanır
- **Resim Sayısı:** Her haber için en fazla 5 resim eklenebilir
- **Resim Boyutu:** Resim başına maksimum 2MB (daha büyük resimler sıkıştırılmalıdır)
- **Desteklenen Formatlar:** JPG, PNG, GIF, WebP
- **Çoklu Seçim:** Birden fazla resim seçmek için Ctrl (Windows) veya Cmd (Mac) tuşuna basılı tutarak tıklayın
- **LocalStorage Limiti:** Yaklaşık 5-10MB (çok sayıda resimli haber için dikkatli olun)
- Haberler sadece eklenen tarayıcıda görünür (sunucuya yüklenmediyse)
- Çok sayıda haber için `data/news.json` dosyasını kullanmanız önerilir
- Resimler otomatik olarak optimize edilmez, büyük resimler localStorage'ı hızlıca doldurabilir

## 🚀 İleride Geliştirilebilir Özellikler

- Sunucu tabanlı veri saklama
- Haber kategorileri
- Haber etiketleri
- Arama özelliği
- Sayfalama (pagination)
- Haber öne çıkarma

