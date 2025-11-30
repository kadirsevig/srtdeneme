/**
 * Admin Panel - Haber Yönetim Sistemi (PHP API ile)
 */

class AdminPanel {
  constructor() {
    this.apiUrl = 'api/news.php';
    this.uploadUrl = 'api/upload.php';
    this.news = [];
    this.editingId = null;
    this.selectedImages = []; // Seçilen/mevcut görseller
    this.init();
  }

  init() {
    this.setupLoginForm();
    this.checkAuth();
  }

  /**
   * Login form ayarla
   */
  setupLoginForm() {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.login();
      });
    }
  }

  /**
   * Oturum kontrolü
   */
  checkAuth() {
    const isLoggedIn = sessionStorage.getItem('adminLoggedIn') === 'true';
    if (isLoggedIn) {
      this.showAdminPanel();
    }
  }

  /**
   * Giriş yap
   */
  login() {
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('login-error');
    
    // Basit şifre kontrolü (gerçek uygulamada sunucu tarafında yapılmalı)
    if (password === 'srt2025') {
      sessionStorage.setItem('adminLoggedIn', 'true');
      this.showAdminPanel();
    } else {
      errorDiv.textContent = 'Hatalı şifre!';
      errorDiv.classList.remove('hidden');
    }
  }

  /**
   * Admin panelini göster
   */
  showAdminPanel() {
    document.getElementById('login-section').classList.add('hidden');
    document.getElementById('admin-section').classList.remove('hidden');
    this.loadNews();
    this.setupNewsForm();
    this.setupImageUpload();
  }

  /**
   * Haberleri yükle
   */
  async loadNews() {
    try {
      const response = await fetch(this.apiUrl);
      const result = await response.json();
      
      if (result.success) {
        this.news = result.data || [];
        this.renderNewsList();
      } else {
        this.showAlert('Haberler yüklenemedi: ' + result.error, 'error');
      }
    } catch (error) {
      console.error('Haberler yüklenirken hata:', error);
      this.showAlert('Haberler yüklenirken bir hata oluştu.', 'error');
    }
  }

  /**
   * Haber listesini render et
   */
  renderNewsList() {
    const container = document.getElementById('news-list');
    if (!container) return;

    if (this.news.length === 0) {
      container.innerHTML = '<p style="text-align: center; color: var(--gray-600);">Henüz haber eklenmemiş.</p>';
      return;
    }

    container.innerHTML = this.news.map(news => {
      // Null kontrolü
      if (!news || !news.id) return '';
      
      const title = news.title || 'Başlıksız Haber';
      
      // Tarih formatı
      let formattedDate = '';
      if (news.date) {
        const date = new Date(news.date);
        if (!isNaN(date.getTime())) {
          formattedDate = date.toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          });
        }
      }

      // Görsel yolu - src veya doğrudan string olabilir
      let displayImage = '';
      let imageCount = 0;
      if (news.images && Array.isArray(news.images) && news.images.length > 0) {
        const firstImage = news.images[0];
        displayImage = typeof firstImage === 'string' ? firstImage : (firstImage.src || '');
        imageCount = news.images.length;
      }

      return `
        <div class="news-item">
          <div style="position: relative; flex-shrink: 0;">
            ${displayImage ? `
              <img src="${displayImage}" alt="${title}" class="news-item-image" onerror="this.classList.add('image-error')" />
              ${imageCount > 1 ? `<span style="position: absolute; top: 0.5rem; right: 0.5rem; background: rgba(0, 135, 212, 0.9); color: white; padding: 0.25rem 0.5rem; border-radius: var(--radius-sm); font-size: 0.75rem; font-weight: 600;">+${imageCount - 1}</span>` : ''}
            ` : `
              <div class="news-item-image" style="display: flex; align-items: center; justify-content: center; color: var(--gray-400);">📷 Görsel Yok</div>
            `}
          </div>
          <div class="news-item-content">
            <h3 class="news-item-title">${title}</h3>
            <div class="news-item-date">${formattedDate}</div>
            <p class="news-item-excerpt">${news.excerpt || ''}</p>
            <div class="news-item-actions">
              <button class="btn-primary" onclick="admin.editNews('${news.id}')">✏️ Düzenle</button>
              <button class="btn-danger" onclick="admin.deleteNews('${news.id}')">🗑️ Sil</button>
            </div>
          </div>
        </div>
      `;
    }).filter(html => html !== '').join('');
  }

  /**
   * Haber formunu ayarla
   */
  setupNewsForm() {
    const form = document.getElementById('news-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      if (this.editingId) {
        await this.updateNews();
      } else {
        await this.addNews();
      }
    });

    // Bugünün tarihini varsayılan olarak ayarla
    const dateInput = document.getElementById('news-date');
    if (dateInput && !dateInput.value) {
      dateInput.value = new Date().toISOString().split('T')[0];
    }
  }

  /**
   * Görsel yükleme ayarla
   */
  setupImageUpload() {
    const imageInput = document.getElementById('news-image');
    if (!imageInput) return;

    imageInput.addEventListener('change', async (e) => {
      const files = Array.from(e.target.files);
      if (files.length === 0) return;

      console.log('📁 Seçilen dosyalar:', files.length);

      // Maksimum 5 görsel kontrolü
      const totalImages = this.selectedImages.length + files.length;
      if (totalImages > 5) {
        this.showAlert('En fazla 5 görsel ekleyebilirsiniz.', 'error');
        imageInput.value = '';
        return;
      }

      const loadingDiv = document.getElementById('image-loading');
      loadingDiv.classList.remove('hidden');

      for (const file of files) {
        console.log('📤 Yükleniyor:', file.name, file.size, 'bytes');
        
        // Boyut kontrolü (5MB)
        if (file.size > 5 * 1024 * 1024) {
          this.showAlert(`${file.name} dosyası 5MB'dan büyük.`, 'error');
          continue;
        }

        try {
          const formData = new FormData();
          formData.append('image', file);

          console.log('🌐 API çağrısı:', this.uploadUrl);
          const response = await fetch(this.uploadUrl, {
            method: 'POST',
            body: formData
          });

          console.log('📡 Response status:', response.status);
          const responseText = await response.text();
          console.log('📝 Response text:', responseText);

          let result;
          try {
            result = JSON.parse(responseText);
          } catch (parseError) {
            console.error('❌ JSON parse hatası:', parseError);
            this.showAlert('Sunucu yanıtı geçersiz. PHP çalışıyor mu?', 'error');
            continue;
          }

          if (result.success) {
            console.log('✅ Yükleme başarılı:', result.path);
            this.selectedImages.push({
              src: result.path,
              alt: document.getElementById('news-title').value || 'Haber görseli'
            });
          } else {
            console.error('❌ Yükleme hatası:', result.error);
            this.showAlert(result.error || 'Görsel yüklenemedi.', 'error');
          }
        } catch (error) {
          console.error('❌ Görsel yüklenirken hata:', error);
          this.showAlert('Görsel yüklenirken bir hata oluştu. Konsolu kontrol edin.', 'error');
        }
      }

      loadingDiv.classList.add('hidden');
      imageInput.value = '';
      this.renderImageGallery();
      console.log('📸 Seçilen görseller:', this.selectedImages);
    });
  }

  /**
   * Görsel galerisini render et
   */
  renderImageGallery() {
    const gallery = document.getElementById('images-gallery');
    if (!gallery) return;

    if (this.selectedImages.length === 0) {
      gallery.innerHTML = '';
      return;
    }

    gallery.innerHTML = this.selectedImages.map((img, index) => {
      // img string veya object olabilir
      const imgSrc = typeof img === 'string' ? img : (img.src || '');
      const imgAlt = typeof img === 'string' ? 'Görsel' : (img.alt || 'Görsel');
      
      if (!imgSrc) return '';
      
      return `
        <div class="image-preview-item">
          <img src="${imgSrc}" alt="${imgAlt}" />
          <button type="button" class="image-remove-btn" onclick="admin.removeImage(${index})">×</button>
          <span class="image-index">${index + 1}</span>
        </div>
      `;
    }).filter(html => html !== '').join('');
  }

  /**
   * Görsel kaldır
   */
  removeImage(index) {
    this.selectedImages.splice(index, 1);
    this.renderImageGallery();
  }

  /**
   * Yeni haber ekle
   */
  async addNews() {
    const title = document.getElementById('news-title').value.trim();
    const excerpt = document.getElementById('news-excerpt').value.trim();
    const content = document.getElementById('news-content').value.trim();
    const date = document.getElementById('news-date').value;

    if (!title || !excerpt || !content || !date) {
      this.showAlert('Lütfen tüm zorunlu alanları doldurun.', 'error');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('excerpt', excerpt);
      formData.append('content', content);
      formData.append('date', date);
      
      if (this.selectedImages.length > 0) {
        formData.append('existing_images', JSON.stringify(this.selectedImages));
      }

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        this.showAlert('Haber başarıyla eklendi!', 'success');
        this.resetForm();
        await this.loadNews();
      } else {
        this.showAlert(result.error || 'Haber eklenemedi.', 'error');
      }
    } catch (error) {
      console.error('Haber eklenirken hata:', error);
      this.showAlert('Haber eklenirken bir hata oluştu.', 'error');
    }
  }

  /**
   * Haber düzenle
   */
  editNews(id) {
    const news = this.news.find(n => n.id === id);
    if (!news) {
      this.showAlert('Haber bulunamadı.', 'error');
      return;
    }

    this.editingId = id;
    
    // Form alanlarını doldur
    document.getElementById('news-id').value = id;
    document.getElementById('news-title').value = news.title || '';
    document.getElementById('news-excerpt').value = news.excerpt || '';
    document.getElementById('news-content').value = news.content || '';
    document.getElementById('news-date').value = news.date || '';

    // Görselleri yükle
    this.selectedImages = news.images ? [...news.images] : [];
    this.renderImageGallery();

    // Form başlığını güncelle
    document.getElementById('form-title').textContent = 'Haber Düzenle';
    document.getElementById('submit-btn').textContent = 'Güncelle';
    document.getElementById('cancel-btn').style.display = 'inline-block';
    document.getElementById('image-required').style.display = 'none';
    document.getElementById('image-note').style.display = 'inline';

    // Forma scroll
    document.querySelector('.add-news-form').scrollIntoView({ behavior: 'smooth' });
  }

  /**
   * Haber güncelle
   */
  async updateNews() {
    const id = this.editingId;
    const title = document.getElementById('news-title').value.trim();
    const excerpt = document.getElementById('news-excerpt').value.trim();
    const content = document.getElementById('news-content').value.trim();
    const date = document.getElementById('news-date').value;

    if (!title || !excerpt || !content || !date) {
      this.showAlert('Lütfen tüm zorunlu alanları doldurun.', 'error');
      return;
    }

    try {
      const data = {
        id,
        title,
        excerpt,
        content,
        date,
        images: this.selectedImages
      };

      const response = await fetch(this.apiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (result.success) {
        this.showAlert('Haber başarıyla güncellendi!', 'success');
        this.resetForm();
        await this.loadNews();
      } else {
        this.showAlert(result.error || 'Haber güncellenemedi.', 'error');
      }
    } catch (error) {
      console.error('Haber güncellenirken hata:', error);
      this.showAlert('Haber güncellenirken bir hata oluştu.', 'error');
    }
  }

  /**
   * Haber sil
   */
  async deleteNews(id) {
    if (!confirm('Bu haberi silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await fetch(`${this.apiUrl}?id=${id}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.success) {
        this.showAlert('Haber başarıyla silindi!', 'success');
        await this.loadNews();
      } else {
        this.showAlert(result.error || 'Haber silinemedi.', 'error');
      }
    } catch (error) {
      console.error('Haber silinirken hata:', error);
      this.showAlert('Haber silinirken bir hata oluştu.', 'error');
    }
  }

  /**
   * Formu sıfırla
   */
  resetForm() {
    this.editingId = null;
    this.selectedImages = [];
    
    document.getElementById('news-form').reset();
    document.getElementById('news-id').value = '';
    document.getElementById('form-title').textContent = 'Yeni Haber Ekle';
    document.getElementById('submit-btn').textContent = 'Haber Ekle';
    document.getElementById('cancel-btn').style.display = 'none';
    document.getElementById('image-required').style.display = 'inline';
    document.getElementById('image-note').style.display = 'none';
    
    // Bugünün tarihini ayarla
    document.getElementById('news-date').value = new Date().toISOString().split('T')[0];
    
    this.renderImageGallery();
  }

  /**
   * JSON olarak dışa aktar
   */
  exportToJSON() {
    const dataStr = JSON.stringify(this.news, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `haberler-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    this.showAlert('Haberler JSON olarak indirildi.', 'success');
  }

  /**
   * JSON'dan içe aktar
   */
  async importFromJSON(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const importedNews = JSON.parse(text);

      if (!Array.isArray(importedNews)) {
        throw new Error('Geçersiz JSON formatı');
      }

      if (!confirm(`${importedNews.length} haber içe aktarılacak. Mevcut haberler korunacak. Devam etmek istiyor musunuz?`)) {
        event.target.value = '';
        return;
      }

      // Her haberi API üzerinden ekle
      let successCount = 0;
      for (const news of importedNews) {
        try {
          const formData = new FormData();
          formData.append('title', news.title || '');
          formData.append('excerpt', news.excerpt || '');
          formData.append('content', news.content || '');
          formData.append('date', news.date || new Date().toISOString().split('T')[0]);
          
          if (news.images && news.images.length > 0) {
            formData.append('existing_images', JSON.stringify(news.images));
          }

          const response = await fetch(this.apiUrl, {
            method: 'POST',
            body: formData
          });

          const result = await response.json();
          if (result.success) {
            successCount++;
          }
        } catch (e) {
          console.error('Haber içe aktarılırken hata:', e);
        }
      }

      this.showAlert(`${successCount}/${importedNews.length} haber başarıyla içe aktarıldı.`, 'success');
      await this.loadNews();
    } catch (error) {
      console.error('JSON içe aktarılırken hata:', error);
      this.showAlert('JSON dosyası okunamadı veya geçersiz format.', 'error');
    }

    event.target.value = '';
  }

  /**
   * Uyarı göster
   */
  showAlert(message, type) {
    const container = document.getElementById('alert-container');
    if (!container) return;

    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    
    container.innerHTML = '';
    container.appendChild(alert);

    setTimeout(() => {
      alert.remove();
    }, 5000);
  }
}

// Global instance
let admin;

// Düzenlemeyi iptal et
function cancelEdit() {
  if (admin) {
    admin.resetForm();
  }
}

// Çıkış yap
function logout() {
  sessionStorage.removeItem('adminLoggedIn');
  location.reload();
}

// Sayfa yüklendiğinde başlat
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    admin = new AdminPanel();
  });
} else {
  admin = new AdminPanel();
}
