// Haberler sayfası JavaScript
class NewsDisplay {
  constructor() {
    this.storageKey = 'srt_medikal_news';
    this.init();
  }

  init() {
    // localStorage'dan haberleri yükle
    const allNews = this.getAllNews();
    console.log('Haberler yükleniyor. Bulunan haber sayısı:', allNews.length);
    
    // Haberleri göster
    this.loadNews();
    
    // JSON dosyasından da yüklemeyi dene (asenkron)
    this.loadFromJSON();
  }

  async loadFromJSON() {
    // file:// protokolünde fetch çalışmaz, sadece localStorage kullan
    if (window.location.protocol === 'file:') {
      console.log('file:// protokolü tespit edildi, sadece localStorage kullanılıyor');
      return;
    }
    
    try {
      // Farklı yolları dene
      let response = await fetch('data/news.json');
      if (!response.ok) {
        response = await fetch('/data/news.json');
      }
      if (!response.ok) {
        response = await fetch('./data/news.json');
      }
      
      if (response.ok) {
        const data = await response.json();
        if (data.news && Array.isArray(data.news) && data.news.length > 0) {
          // JSON'dan gelen haberleri öncelikli olarak kullan
          // localStorage ile birleştir (JSON öncelikli)
          const jsonNews = data.news;
          const localNews = this.getAllNews();
          
          // JSON'daki haberleri öncelik vererek birleştir
          // JSON'daki haberlerin ID'lerini al
          const jsonIds = new Set(jsonNews.map(n => n.id));
          
          // localStorage'daki JSON'da olmayan haberleri ekle
          const localOnlyNews = localNews.filter(n => !jsonIds.has(n.id));
          
          // Önce JSON'dakiler, sonra localStorage'dakiler
          const combinedNews = [...jsonNews, ...localOnlyNews];
          
          // localStorage'a da kaydet (geriye dönük uyumluluk için)
          if (combinedNews.length > 0) {
            localStorage.setItem(this.storageKey, JSON.stringify(combinedNews));
            this.loadNews();
            console.log(`JSON'dan ${jsonNews.length} haber yüklendi. Toplam: ${combinedNews.length}`);
          }
        } else {
          console.log('JSON dosyası boş veya geçersiz format');
        }
      } else {
        console.log('JSON dosyası bulunamadı (404), sadece localStorage kullanılıyor');
      }
    } catch (error) {
      // JSON dosyası yoksa sadece localStorage kullan
      console.log('JSON dosyası yüklenemedi, localStorage kullanılıyor:', error.message);
    }
  }

  getAllNews() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      console.log('localStorage\'dan okunan veri:', stored ? 'Var' : 'Yok');
      
      if (stored) {
        const news = JSON.parse(stored);
        console.log('Parse edilen haber sayısı:', Array.isArray(news) ? news.length : 'Array değil');
        
        // Array kontrolü
        if (Array.isArray(news) && news.length > 0) {
          // Tarihe göre sırala (en yeni önce)
          const sorted = news.sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return dateB - dateA;
          });
          console.log('Sıralanmış haberler:', sorted);
          return sorted;
        } else if (Array.isArray(news)) {
          console.log('Haberler array ama boş');
        } else {
          console.log('Haberler array değil:', typeof news);
        }
      } else {
        console.log('localStorage\'da veri yok, anahtar:', this.storageKey);
      }
    } catch (error) {
      console.error('Haberler yüklenemedi:', error);
    }
    return [];
  }

  loadNews() {
    const container = document.getElementById('news-container');
    const emptyDiv = document.getElementById('news-empty');
    const loadingDiv = document.getElementById('news-loading');
    
    if (!container) {
      console.error('news-container bulunamadı!');
      return;
    }

    const allNews = this.getAllNews();
    console.log('Yüklenen haber sayısı:', allNews.length);

    // Loading mesajını gizle
    if (loadingDiv) {
      loadingDiv.style.display = 'none';
      loadingDiv.remove(); // DOM'dan tamamen kaldır
    }

    // Önce empty mesajını gizle (haberler varsa görünmemeli)
    if (emptyDiv) {
      emptyDiv.classList.add('hidden');
      emptyDiv.style.display = 'none';
    }

    if (allNews.length === 0) {
      // Haber yoksa container'ı temizle ve empty mesajını göster
      container.innerHTML = '';
      if (emptyDiv) {
        emptyDiv.classList.remove('hidden');
        emptyDiv.style.display = 'block';
      }
      return;
    }

    // Haberler varsa container'a ekle
    container.innerHTML = allNews.map(news => {
      const date = new Date(news.date);
      const formattedDate = date.toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      
      // Kısa tarih (örnek: "18 Kas-24")
      const shortDate = date.toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'short'
      }).replace(' ', ' ');

      // İlk 150 karakteri göster
      const excerpt = news.excerpt.length > 150 
        ? news.excerpt.substring(0, 150) + '...' 
        : news.excerpt;

      // İlk resmi göster (çoklu resim desteği)
      const displayImage = (news.images && news.images.length > 0) ? news.images[0] : news.image;
      const imageCount = (news.images && news.images.length > 0) ? news.images.length : (news.image ? 1 : 0);

      return `
        <article class="news-card" onclick="openNewsModal('${news.id}')">
          <div class="news-card-image-wrapper">
            <img 
              src="${displayImage}" 
              alt="${news.title}" 
              class="news-card-image"
              loading="lazy"
              onerror="this.src='https://via.placeholder.com/600x400?text=Resim+Yüklenemedi'" 
            />
            <div class="news-card-date-badge">
              <span>${shortDate}</span>
            </div>
          </div>
          <div class="news-card-content">
            <h3 class="news-card-title">${news.title}</h3>
            <p class="news-card-excerpt">${excerpt}</p>
            <div class="news-card-footer">
              <button class="news-card-read-more">Devamını Oku</button>
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  getNewsById(id) {
    const allNews = this.getAllNews();
    return allNews.find(n => n.id === id);
  }

  displayNewsDetail(news) {
    const modalBody = document.getElementById('news-modal-body');
    if (!modalBody) return;

    const date = new Date(news.date);
    const formattedDate = date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    // Çoklu resim desteği
    const images = (news.images && news.images.length > 0) ? news.images : (news.image ? [news.image] : []);
    const hasMultipleImages = images.length > 1;

    let imagesHTML = '';
    if (hasMultipleImages) {
      // Resim slider/galeri
      imagesHTML = `
        <div class="news-images-gallery">
          <div class="news-images-main">
            <img id="news-main-image" src="${images[0]}" alt="${news.title}" />
            <button class="news-image-nav news-image-prev" onclick="changeNewsImage(-1)">‹</button>
            <button class="news-image-nav news-image-next" onclick="changeNewsImage(1)">›</button>
            <div class="news-image-counter">
              <span id="news-image-current">1</span> / <span id="news-image-total">${images.length}</span>
            </div>
          </div>
          ${images.length > 1 ? `
          <div class="news-images-thumbnails">
            ${images.map((img, index) => `
              <img 
                src="${img}" 
                alt="Resim ${index + 1}" 
                class="news-thumbnail ${index === 0 ? 'active' : ''}"
                onclick="setNewsImage(${index})"
              />
            `).join('')}
          </div>
          ` : ''}
        </div>
      `;
      window.currentNewsImages = images;
      window.currentNewsImageIndex = 0;
    } else {
      // Tek resim
      imagesHTML = `
        <div class="news-detail-image">
          <img src="${images[0] || 'https://via.placeholder.com/800x400?text=Resim+Yok'}" alt="${news.title}" />
        </div>
      `;
    }

    modalBody.innerHTML = `
      ${imagesHTML}
      <div class="news-detail-content">
        <div class="news-detail-date">${formattedDate}</div>
        <h2 class="news-detail-title">${news.title}</h2>
        <div class="news-detail-text">
          ${news.content.split('\n').map(p => `<p>${p}</p>`).join('')}
        </div>
      </div>
    `;
  }
}

// Global fonksiyonlar
let newsDisplay;

function openNewsModal(id) {
  if (!newsDisplay) return;
  
  const news = newsDisplay.getNewsById(id);
  if (!news) return;

  const modal = document.getElementById('news-modal');
  newsDisplay.displayNewsDetail(news);
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeNewsModal() {
  const modal = document.getElementById('news-modal');
  modal.classList.add('hidden');
  document.body.style.overflow = '';
}

// Resim değiştirme fonksiyonları
function changeNewsImage(direction) {
  if (!window.currentNewsImages || window.currentNewsImages.length <= 1) return;
  
  window.currentNewsImageIndex += direction;
  
  if (window.currentNewsImageIndex < 0) {
    window.currentNewsImageIndex = window.currentNewsImages.length - 1;
  } else if (window.currentNewsImageIndex >= window.currentNewsImages.length) {
    window.currentNewsImageIndex = 0;
  }
  
  setNewsImage(window.currentNewsImageIndex);
}

function setNewsImage(index) {
  if (!window.currentNewsImages || !window.currentNewsImages[index]) return;
  
  window.currentNewsImageIndex = index;
  const mainImage = document.getElementById('news-main-image');
  const currentSpan = document.getElementById('news-image-current');
  const thumbnails = document.querySelectorAll('.news-thumbnail');
  
  if (mainImage) {
    mainImage.src = window.currentNewsImages[index];
  }
  
  if (currentSpan) {
    currentSpan.textContent = index + 1;
  }
  
  // Thumbnail'leri güncelle
  thumbnails.forEach((thumb, i) => {
    if (i === index) {
      thumb.classList.add('active');
    } else {
      thumb.classList.remove('active');
    }
  });
}

// ESC tuşu ile modal kapat
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeNewsModal();
  } else if (e.key === 'ArrowLeft' && window.currentNewsImages && window.currentNewsImages.length > 1) {
    changeNewsImage(-1);
  } else if (e.key === 'ArrowRight' && window.currentNewsImages && window.currentNewsImages.length > 1) {
    changeNewsImage(1);
  }
});

// Sayfa yüklendiğinde başlat
function initNewsDisplay() {
  // Biraz gecikme ile başlat (DOM'un tam yüklenmesi için)
  setTimeout(() => {
    try {
      const storageKey = 'srt_medikal_news';
      
      // Önce localStorage'ı kontrol et
      console.log('=== HABERLER SİSTEMİ BAŞLATILIYOR ===');
      console.log('Storage anahtarı:', storageKey);
      console.log('Sayfa URL:', window.location.href);
      console.log('Protokol:', window.location.protocol);
      
      const stored = localStorage.getItem(storageKey);
      console.log('localStorage\'dan okunan ham veri:', stored ? 'Var (' + stored.length + ' karakter)' : 'YOK');
      
      if (stored) {
        try {
          const news = JSON.parse(stored);
          console.log('Parse edilen veri tipi:', Array.isArray(news) ? 'Array' : typeof news);
          console.log('Haber sayısı:', Array.isArray(news) ? news.length : 'N/A');
          if (Array.isArray(news) && news.length > 0) {
            console.log('İlk haber:', news[0]);
          }
        } catch (parseError) {
          console.error('Parse hatası:', parseError);
        }
      } else {
        console.warn('⚠️ localStorage\'da HABER BULUNAMADI!');
        console.log('Tüm localStorage anahtarları:', Object.keys(localStorage));
      }
      
      newsDisplay = new NewsDisplay();
      window.newsDisplay = newsDisplay;
      console.log('Haberler sistemi başlatıldı');
    } catch (error) {
      console.error('Haberler sistemi başlatılamadı:', error);
    }
  }, 200);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initNewsDisplay);
} else {
  initNewsDisplay();
}

