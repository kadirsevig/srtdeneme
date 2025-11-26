// Admin Panel JavaScript
class NewsAdmin {
  constructor() {
    this.storageKey = 'srt_medikal_news';
    this.passwordKey = 'srt_admin_password';
    this.defaultPassword = 'admin123'; // İlk kurulumda kullanılacak şifre
    this.isLoggedIn = false;
    this.editingId = null;
    this.currentImages = []; // Çoklu resim desteği
    this.init();
  }

  init() {
    // Şifre kontrolü
    this.checkLogin();
    this.setupLoginForm();
    
    // Form event listener'larını her zaman kur (form DOM'da var, sadece gizli)
    this.setupNewsForm();
    this.setupImagePreview();
    
    // Admin paneli görünürse haberleri yükle
    const adminSection = document.getElementById('admin-section');
    if (adminSection && !adminSection.classList.contains('hidden')) {
      this.loadNews();
    }
  }

  checkLogin() {
    const savedPassword = localStorage.getItem(this.passwordKey);
    if (!savedPassword) {
      // İlk kurulum - varsayılan şifre kaydet
      localStorage.setItem(this.passwordKey, this.defaultPassword);
    }
    
    const session = sessionStorage.getItem('admin_logged_in');
    if (session === 'true') {
      this.showAdminPanel();
    } else {
      this.showLoginForm();
    }
  }

  setupLoginForm() {
    const loginForm = document.getElementById('login-form');
    if (!loginForm) return;

    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const password = document.getElementById('password').value;
      const savedPassword = localStorage.getItem(this.passwordKey);
      const errorDiv = document.getElementById('login-error');

      if (password === savedPassword) {
        sessionStorage.setItem('admin_logged_in', 'true');
        this.isLoggedIn = true;
        this.showAdminPanel();
        errorDiv.classList.add('hidden');
      } else {
        errorDiv.textContent = 'Hatalı şifre!';
        errorDiv.classList.remove('hidden');
        document.getElementById('password').value = '';
      }
    });
  }

  showLoginForm() {
    document.getElementById('login-section').classList.remove('hidden');
    document.getElementById('admin-section').classList.add('hidden');
  }

  showAdminPanel() {
    document.getElementById('login-section').classList.add('hidden');
    document.getElementById('admin-section').classList.remove('hidden');
    this.currentImages = []; // Resimleri temizle
    this.loadNews();
  }

  setupImagePreview() {
    const imageInput = document.getElementById('news-image');
    if (!imageInput) return;

    // Mevcut resimleri saklamak için (zaten constructor'da initialize edildi)

    imageInput.addEventListener('change', (e) => {
      const files = Array.from(e.target.files);
      if (files.length === 0) return;

      // Toplam resim sayısı kontrolü (mevcut + yeni)
      const currentCount = this.currentImages.length;
      if (currentCount + files.length > 5) {
        this.showAlert(`En fazla 5 resim ekleyebilirsiniz! Şu anda ${currentCount} resim var.`, 'error');
        e.target.value = '';
        return;
      }

      const loadingDiv = document.getElementById('image-loading');
      loadingDiv.classList.remove('hidden');

      let loadedCount = 0;
      const totalFiles = files.length;
      const newImages = [];

      files.forEach((file) => {
        // Dosya boyutu kontrolü (2MB)
        if (file.size > 2 * 1024 * 1024) {
          this.showAlert(`${file.name} dosyası 2MB'dan büyük!`, 'error');
          loadedCount++;
          if (loadedCount === totalFiles) {
            loadingDiv.classList.add('hidden');
            e.target.value = '';
          }
          return;
        }

        // Dosya tipi kontrolü
        if (!file.type.match('image.*')) {
          this.showAlert(`${file.name} geçerli bir resim dosyası değil!`, 'error');
          loadedCount++;
          if (loadedCount === totalFiles) {
            loadingDiv.classList.add('hidden');
            e.target.value = '';
          }
          return;
        }

        const reader = new FileReader();
        
        reader.onload = (event) => {
          const base64String = event.target.result;
          newImages.push(base64String);
          
          loadedCount++;
          console.log(`Resim ${loadedCount}/${totalFiles} yüklendi`);
          
          if (loadedCount === totalFiles) {
            // Tüm resimler yüklendi
            this.currentImages = [...this.currentImages, ...newImages];
            console.log('Tüm resimler yüklendi. Toplam resim sayısı:', this.currentImages.length);
            this.updateImagesGallery();
            loadingDiv.classList.add('hidden');
            e.target.value = ''; // Input'u temizle
            
            // Başarı mesajı göster
            this.showAlert(`${newImages.length} resim başarıyla yüklendi!`, 'success');
          }
        };
        
        reader.onerror = () => {
          this.showAlert(`${file.name} yüklenirken hata oluştu!`, 'error');
          loadedCount++;
          if (loadedCount === totalFiles) {
            loadingDiv.classList.add('hidden');
            e.target.value = '';
          }
        };
        
        reader.readAsDataURL(file);
      });
    });
  }

  updateImagesGallery() {
    const gallery = document.getElementById('images-gallery');
    if (!gallery) return;

    if (this.currentImages.length === 0) {
      gallery.innerHTML = '';
      gallery.style.display = 'none';
      return;
    }

    gallery.style.display = 'grid';
    gallery.innerHTML = this.currentImages.map((imageData, index) => {
      return `
        <div class="image-preview-item">
          <img src="${imageData}" alt="Resim ${index + 1}" />
          <button type="button" class="image-remove-btn" onclick="admin.removeImage(${index})" aria-label="Resmi Sil">×</button>
          <span class="image-index">${index + 1}</span>
        </div>
      `;
    }).join('');

    // Gizli input'a kaydet
    const imageDataInput = document.getElementById('news-images-data');
    if (imageDataInput) {
      imageDataInput.value = JSON.stringify(this.currentImages);
    }
  }

  removeImage(index) {
    if (confirm('Bu resmi silmek istediğinize emin misiniz?')) {
      this.currentImages.splice(index, 1);
      this.updateImagesGallery();
    }
  }

  isValidImageUrl(url) {
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(url) || url.startsWith('http');
  }

  setupNewsForm() {
    const form = document.getElementById('news-form');
    if (!form) {
      console.error('news-form bulunamadı! Form yüklenene kadar bekleniyor...');
      // Form yüklenene kadar bekle
      setTimeout(() => this.setupNewsForm(), 200);
      return;
    }

    console.log('Form bulundu, event listener kuruluyor...');

    // Form submit event
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      console.log('Form submit event tetiklendi');
      this.handleFormSubmit();
    });

    // Submit butonuna direkt click event (yedek)
    const submitBtn = document.getElementById('submit-btn');
    if (submitBtn) {
      submitBtn.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('Submit butonu tıklandı');
        this.handleFormSubmit();
      });
    }
  }

  handleFormSubmit() {
    console.log('handleFormSubmit çağrıldı');
    try {
      this.saveNews();
    } catch (error) {
      console.error('Haber kaydetme hatası:', error);
      this.showAlert('Bir hata oluştu: ' + error.message, 'error');
    }
  }

  saveNews() {
    console.log('saveNews() çağrıldı');
    
    // Resim kontrolü - mevcut resimler varsa onları kullan
    let images = this.currentImages || [];
    console.log('Mevcut resim sayısı:', images.length);
    
    // Yeni resim eklenmediyse ve düzenleme modundaysak, mevcut resimleri kullan
    if (images.length === 0 && this.editingId) {
      const existingNews = this.getNewsById(this.editingId);
      if (existingNews) {
        // Eski formatı destekle (tek resim)
        if (existingNews.image && typeof existingNews.image === 'string') {
          images = [existingNews.image];
        }
        // Yeni format (çoklu resim)
        else if (existingNews.images && Array.isArray(existingNews.images)) {
          images = existingNews.images;
        }
      }
    }

    // Form alanlarını al
    const titleInput = document.getElementById('news-title');
    const dateInput = document.getElementById('news-date');
    const excerptInput = document.getElementById('news-excerpt');
    const contentInput = document.getElementById('news-content');
    
    if (!titleInput || !dateInput || !excerptInput || !contentInput) {
      console.error('Form alanları bulunamadı!', { titleInput, dateInput, excerptInput, contentInput });
      this.showAlert('Form alanları bulunamadı! Sayfayı yenileyin.', 'error');
      return;
    }

    const news = {
      id: this.editingId || Date.now().toString(),
      title: titleInput.value.trim(),
      image: images[0] || '', // İlk resmi ana resim olarak sakla (geriye dönük uyumluluk)
      images: images, // Tüm resimler
      date: dateInput.value,
      excerpt: excerptInput.value.trim(),
      content: contentInput.value.trim(),
      createdAt: this.editingId ? this.getNewsById(this.editingId)?.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    console.log('Haber verisi hazırlandı:', {
      title: news.title,
      date: news.date,
      images: images.length,
      excerpt: news.excerpt.substring(0, 50) + '...',
      content: news.content.substring(0, 50) + '...'
    });

    // Zorunlu alan kontrolü
    if (!news.title || !news.date || !news.excerpt || !news.content) {
      const missingFields = [];
      if (!news.title) missingFields.push('Başlık');
      if (!news.date) missingFields.push('Tarih');
      if (!news.excerpt) missingFields.push('Kısa Açıklama');
      if (!news.content) missingFields.push('İçerik');
      
      console.warn('Eksik alanlar:', missingFields);
      this.showAlert(`Lütfen tüm zorunlu alanları doldurun! Eksik: ${missingFields.join(', ')}`, 'error');
      return;
    }

    // Yeni eklemede en az bir resim zorunlu
    if (images.length === 0 && !this.editingId) {
      console.warn('Resim seçilmedi! Mevcut resim sayısı:', images.length);
      this.showAlert('Yeni haber için en az bir resim seçmelisiniz! Lütfen resim seçin ve yüklenmesini bekleyin.', 'error');
      return;
    }

    try {
      const allNews = this.getAllNews();
      console.log('Mevcut haber sayısı:', allNews.length);
      
      if (this.editingId) {
        // Güncelleme
        const index = allNews.findIndex(n => n.id === this.editingId);
        if (index !== -1) {
          allNews[index] = news;
          this.showAlert('Haber başarıyla güncellendi!', 'success');
          console.log('Haber güncellendi, index:', index);
        } else {
          console.error('Güncellenecek haber bulunamadı, ID:', this.editingId);
          this.showAlert('Haber bulunamadı!', 'error');
          return;
        }
      } else {
        // Yeni ekleme
        allNews.unshift(news);
        this.showAlert('Haber başarıyla eklendi!', 'success');
        console.log('Yeni haber eklendi');
      }

      this.saveAllNews(allNews);
      console.log('Haber kaydedildi. Toplam haber sayısı:', allNews.length);
      this.loadNews();
      this.resetForm();
    } catch (error) {
      console.error('Haber kaydetme hatası:', error);
      this.showAlert('Haber kaydedilirken bir hata oluştu: ' + error.message, 'error');
    }
  }

  getAllNews() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Array kontrolü
        if (Array.isArray(parsed)) {
          return parsed;
        } else {
          console.warn('localStorage\'daki veri array değil:', typeof parsed);
          return [];
        }
      }
      // localStorage boşsa boş array döndür
      return [];
    } catch (error) {
      console.error('Haberler yüklenemedi:', error);
      return [];
    }
  }

  async loadFromJSON() {
    // file:// protokolünde fetch çalışmaz
    if (window.location.protocol === 'file:') {
      return [];
    }
    
    try {
      const response = await fetch('data/news.json');
      if (response.ok) {
        const data = await response.json();
        if (data.news && Array.isArray(data.news)) {
          // JSON'dan localStorage'a kopyala
          localStorage.setItem(this.storageKey, JSON.stringify(data.news));
          return data.news;
        }
      }
    } catch (error) {
      console.log('JSON dosyası yüklenemedi, localStorage kullanılıyor');
    }
    return [];
  }

  async saveAllNews(news) {
    try {
      // Önce localStorage'a kaydet (hızlı erişim için)
      const newsString = JSON.stringify(news);
      localStorage.setItem(this.storageKey, newsString);
      console.log('Haberler localStorage\'a kaydedildi:', {
        anahtar: this.storageKey,
        haberSayisi: news.length,
        veriUzunlugu: newsString.length
      });
      
      // Doğrulama: Kaydedilen veriyi tekrar oku
      const verify = localStorage.getItem(this.storageKey);
      if (verify) {
        const parsed = JSON.parse(verify);
        console.log('Doğrulama: localStorage\'dan okunan haber sayısı:', parsed.length);
      } else {
        console.error('HATA: Haberler kaydedilemedi!');
      }
      
      // Önce sunucuya kaydetmeyi dene (PHP script varsa otomatik çalışır)
      const serverSaved = await this.saveToServer(news);
      
      // Eğer PHP script yoksa, JSON dosyasını otomatik indir
      // (Kullanıcı bunu hosting'e yükleyecek - ama PHP script bir kez yüklenirse buna gerek kalmaz)
      if (!serverSaved) {
        this.autoDownloadJSON(news);
      }
      
    } catch (error) {
      console.error('Haberler kaydedilirken hata:', error);
      alert('Haberler kaydedilirken bir hata oluştu: ' + error.message);
    }
  }

  autoDownloadJSON(news) {
    // Otomatik olarak JSON dosyasını indir
    const jsonData = {
      news: news
    };

    const jsonString = JSON.stringify(jsonData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'news.json';
    
    // Sessizce indir (kullanıcıya rahatsızlık vermeden)
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Kullanıcıya bilgi ver
    this.showAlert(`✅ Haber kaydedildi! JSON dosyası otomatik indirildi. Bu dosyayı hosting'inizdeki "data/news.json" dosyasının yerine yükleyin. Böylece tüm cihazlarda görünecek. (${news.length} haber)`, 'success');
  }

  async saveToServer(news) {
    // file:// protokolünde çalışmaz
    if (window.location.protocol === 'file:') {
      return;
    }

    try {
      const jsonData = {
        news: news
      };

      // API endpoint'ini dene (farklı yollar)
      let response;
      const endpoints = [
        'api/save-news.php',
        '/api/save-news.php',
        './api/save-news.php'
      ];

      for (const endpoint of endpoints) {
        try {
          response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(jsonData)
          });
          
          if (response.ok) {
            const result = await response.json();
            console.log('✅ Haberler sunucuya kaydedildi:', result);
            this.showAlert(`✅ Haberler otomatik olarak sunucuya kaydedildi! Tüm cihazlarda görünecek.`, 'success');
            return true;
          }
        } catch (err) {
          continue;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Sunucuya kaydetme hatası:', error);
      return false;
    }
  }

  loadNews() {
    const newsList = document.getElementById('news-list');
    if (!newsList) return;

    const allNews = this.getAllNews();

    if (allNews.length === 0) {
      newsList.innerHTML = '<p style="text-align: center; color: var(--gray-600);">Henüz haber eklenmemiş.</p>';
      return;
    }

    newsList.innerHTML = allNews.map(news => {
      const date = new Date(news.date);
      const formattedDate = date.toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });

      // İlk resmi göster (çoklu resim desteği)
      const displayImage = (news.images && news.images.length > 0) ? news.images[0] : news.image;
      const imageCount = (news.images && news.images.length > 0) ? news.images.length : (news.image ? 1 : 0);
      
      return `
        <div class="news-item">
          <div style="position: relative;">
            <img src="${displayImage}" alt="${news.title}" class="news-item-image" onerror="this.src='https://via.placeholder.com/200x150?text=Resim+Yüklenemedi'" />
            ${imageCount > 1 ? `<span style="position: absolute; top: 0.5rem; right: 0.5rem; background: rgba(0, 135, 212, 0.9); color: white; padding: 0.25rem 0.5rem; border-radius: var(--radius-sm); font-size: 0.75rem; font-weight: 600;">+${imageCount - 1}</span>` : ''}
          </div>
          <div class="news-item-content">
            <h3 class="news-item-title">${news.title}</h3>
            <div class="news-item-date">${formattedDate}</div>
            <p class="news-item-excerpt">${news.excerpt}</p>
            <div class="news-item-actions">
              <button class="btn-primary" onclick="admin.editNews('${news.id}')">Düzenle</button>
              <button class="btn-danger" onclick="admin.deleteNews('${news.id}')">Sil</button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  editNews(id) {
    const news = this.getNewsById(id);
    if (!news) return;

    this.editingId = id;
    document.getElementById('news-id').value = id;
    document.getElementById('news-title').value = news.title;
    document.getElementById('news-image').value = ''; // File input'u temizle
    document.getElementById('news-date').value = news.date;
    document.getElementById('news-excerpt').value = news.excerpt;
    document.getElementById('news-content').value = news.content;
    
    document.getElementById('form-title').textContent = 'Haberi Düzenle';
    document.getElementById('submit-btn').textContent = 'Güncelle';
    document.getElementById('cancel-btn').style.display = 'block';
    
    // Resim zorunluluğunu kaldır (düzenleme modunda)
    document.getElementById('image-required').textContent = '';
    document.getElementById('image-note').style.display = 'block';
    
    // Mevcut resimleri yükle
    if (news.images && Array.isArray(news.images)) {
      this.currentImages = [...news.images];
    } else if (news.image) {
      // Eski formatı destekle (tek resim)
      this.currentImages = [news.image];
    } else {
      this.currentImages = [];
    }
    
    this.updateImagesGallery();

    // Forma scroll
    document.querySelector('.add-news-form').scrollIntoView({ behavior: 'smooth' });
  }

  deleteNews(id) {
    if (!confirm('Bu haberi silmek istediğinize emin misiniz?')) {
      return;
    }

    const allNews = this.getAllNews();
    const filtered = allNews.filter(n => n.id !== id);
    this.saveAllNews(filtered);
    this.loadNews();
    this.showAlert('Haber başarıyla silindi!', 'success');
  }

  getNewsById(id) {
    const allNews = this.getAllNews();
    return allNews.find(n => n.id === id);
  }

  resetForm() {
    this.editingId = null;
    this.currentImages = [];
    document.getElementById('news-form').reset();
    document.getElementById('form-title').textContent = 'Yeni Haber Ekle';
    document.getElementById('submit-btn').textContent = 'Haber Ekle';
    document.getElementById('cancel-btn').style.display = 'none';
    document.getElementById('news-id').value = '';
    document.getElementById('news-images-data').value = '';
    document.getElementById('image-required').textContent = '*';
    document.getElementById('image-note').style.display = 'none';
    this.updateImagesGallery();
  }

  showAlert(message, type = 'success') {
    const container = document.getElementById('alert-container');
    if (!container) {
      console.error('alert-container bulunamadı!');
      alert(message); // Fallback olarak alert kullan
      return;
    }
    
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    container.innerHTML = '';
    container.appendChild(alert);
    container.style.display = 'block';

    setTimeout(() => {
      if (alert.parentNode) {
        alert.remove();
      }
      if (container.children.length === 0) {
        container.style.display = 'none';
      }
    }, 5000);
  }

  // JSON Export - Haberleri JSON dosyası olarak indir
  exportToJSON() {
    const allNews = this.getAllNews();
    if (allNews.length === 0) {
      this.showAlert('İndirilecek haber bulunamadı!', 'error');
      return;
    }

    const jsonData = {
      news: allNews
    };

    const jsonString = JSON.stringify(jsonData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'news.json';
    link.click();
    URL.revokeObjectURL(url);

    this.showAlert(`✅ ${allNews.length} haber JSON dosyası olarak indirildi! Şimdi bu dosyayı hosting'inizdeki "data/news.json" dosyasının yerine yükleyin. Böylece tüm cihazlarda görünecektir.`, 'success');
  }

  // JSON Import - JSON dosyasından haberleri yükle
  importFromJSON(event) {
    const file = event.target.files[0];
    if (!file) {
      return;
    }

    if (!file.name.endsWith('.json')) {
      this.showAlert('Lütfen geçerli bir JSON dosyası seçin!', 'error');
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target.result);
        
        if (!jsonData.news || !Array.isArray(jsonData.news)) {
          this.showAlert('JSON dosyası geçersiz format! "news" anahtarı bir array olmalı.', 'error');
          event.target.value = '';
          return;
        }

        // Mevcut haberleri JSON'dakilerle birleştir (ID'ye göre çakışma kontrolü)
        const currentNews = this.getAllNews();
        const existingIds = new Set(currentNews.map(n => n.id));
        
        const newNews = jsonData.news.filter(n => !existingIds.has(n.id));
        const updatedNews = [...currentNews, ...newNews];

        // localStorage'a kaydet
        this.saveAllNews(updatedNews);
        
        // Haberleri yeniden yükle
        this.loadNews();
        
        this.showAlert(`✅ ${newNews.length} yeni haber yüklendi! Toplam ${updatedNews.length} haber.`, 'success');
        event.target.value = '';
      } catch (error) {
        this.showAlert('JSON dosyası okunamadı: ' + error.message, 'error');
        event.target.value = '';
      }
    };

    reader.onerror = () => {
      this.showAlert('Dosya okunurken hata oluştu!', 'error');
      event.target.value = '';
    };

    reader.readAsText(file);
  }
}

// Global fonksiyonlar
function logout() {
  sessionStorage.removeItem('admin_logged_in');
  window.location.reload();
}

function cancelEdit() {
  if (window.admin) {
    window.admin.resetForm();
  }
}

// Sayfa yüklendiğinde başlat
let admin;
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    admin = new NewsAdmin();
    window.admin = admin;
  });
} else {
  admin = new NewsAdmin();
  window.admin = admin;
}

