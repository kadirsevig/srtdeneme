# Haber Sistemi Kullanım Kılavuzu

## Otomatik Kayıt Sistemi (Önerilen)

### Kurulum

1. **PHP Desteği**: Hosting'inizde PHP desteği olduğundan emin olun (çoğu hosting'de vardır).

2. **API Dosyasını Yükleyin**: 
   - `api/save-news.php` dosyasını hosting'inize yükleyin
   - Dosya yolu: `yourdomain.com/api/save-news.php` şeklinde erişilebilir olmalı

3. **data/ Klasörü İzinleri**:
   - Hosting'inizde `data/` klasörüne yazma izni verin (CHMOD 755 veya 777)
   - `data/news.json` dosyasına yazma izni verin (CHMOD 644 veya 666)

### Kullanım

Artık haber eklediğinizde **otomatik olarak** tüm cihazlarda görünecek! 

- Haber ekleyip kaydettiğinizde otomatik olarak `data/news.json` dosyasına kaydedilir
- Masaüstü, mobil, tablet - tüm cihazlarda aynı anda görünür
- Manuel işlem yapmanıza gerek yok

---

## Manuel Kayıt Sistemi (Alternatif)

Eğer PHP desteği yoksa veya otomatik sistem çalışmazsa:

1. Admin panelde **"JSON İndir"** butonuna tıklayın
2. İndirilen `news.json` dosyasını hosting'inizdeki `data/news.json` yerine yükleyin
3. Bu işlemi her haber ekledikten sonra tekrarlayın

---

## Sorun Giderme

### Haberler mobilde görünmüyor

1. PHP script çalışıyor mu kontrol edin: `yourdomain.com/api/save-news.php` adresine gidin
   - JSON görüyorsanız çalışıyor demektir
   - Hata görüyorsanız PHP desteği veya izin sorunu olabilir

2. `data/` klasörüne yazma izni verin

3. Tarayıcı konsolunu kontrol edin (F12) - hata mesajlarını görebilirsiniz

### Otomatik kayıt çalışmıyor

- Manuel olarak "JSON İndir" butonunu kullanın
- İndirilen dosyayı `data/news.json` yerine yükleyin

---

## Notlar

- **Otomatik sistem** en pratik yöntemdir (PHP gerekli)
- **Manuel sistem** her zaman çalışır ama her seferinde indirip yüklemeniz gerekir
- Haberler hem `localStorage` hem de `data/news.json` dosyasında saklanır

