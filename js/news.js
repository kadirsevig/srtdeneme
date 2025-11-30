// Haberler sayfası JavaScript (tamamen HTML tabanlı veri kaynağı)
class NewsDisplay {
  constructor() {
    this.newsData = [];
    this.container = document.getElementById('news-container');
    this.emptyDiv = document.getElementById('news-empty');
    this.loadingDiv = document.getElementById('news-loading');
    this.init();
  }

  async init() {
    await this.loadNews();
  }

  async loadNews() {
    if (!this.container) {
      console.error('news-container bulunamadı!');
      return;
    }

    this.setLoadingState(true);

    try {
      const loader = window.NewsDataLoader;
      if (!loader) {
        throw new Error('NewsDataLoader bulunamadı');
      }

      this.newsData = await loader.getAll();
      if (!Array.isArray(this.newsData) || this.newsData.length === 0) {
        this.showEmptyState();
        return;
      }

      this.renderNews();
    } catch (error) {
      console.error('Haberler yüklenemedi:', error);
      this.showEmptyState('Haberler yüklenemedi. Lütfen data/news.html dosyasını kontrol edin.');
    } finally {
      this.setLoadingState(false);
    }
  }

  setLoadingState(isLoading) {
    if (this.loadingDiv) {
      this.loadingDiv.style.display = isLoading ? 'block' : 'none';
    }
  }

  showEmptyState(message) {
    if (this.container) {
      this.container.innerHTML = '';
    }
    if (this.emptyDiv) {
      if (message) {
        const paragraph = this.emptyDiv.querySelector('p');
        if (paragraph) {
          paragraph.textContent = message;
        }
      }
      this.emptyDiv.classList.remove('hidden');
      this.emptyDiv.style.display = 'block';
    }
  }

  renderNews() {
    if (!this.container) return;

    if (this.emptyDiv) {
      this.emptyDiv.classList.add('hidden');
      this.emptyDiv.style.display = 'none';
    }

    this.container.innerHTML = this.newsData
      .map((news) => {
        // Null kontrolü
        if (!news || !news.id) return '';
        
        const title = news.title || 'Başlıksız Haber';
        const newsId = news.id || '';
        
        // Tarih formatı
        let shortDate = '';
        if (news.date) {
          const date = new Date(news.date);
          if (!isNaN(date.getTime())) {
            shortDate = date.toLocaleDateString('tr-TR', {
              day: 'numeric',
              month: 'short',
            });
          }
        }

        const excerpt =
          news.excerpt && news.excerpt.length > 150
            ? `${news.excerpt.substring(0, 150)}...`
            : news.excerpt || '';

        // Görsel yolu - src veya doğrudan string olabilir
        let displayImage = '';
        if (news.images && Array.isArray(news.images) && news.images.length > 0) {
          const firstImage = news.images[0];
          displayImage = typeof firstImage === 'string' ? firstImage : (firstImage.src || '');
        }

        return `
        <article class="news-card" onclick="openNewsModal('${newsId}')">
          <div class="news-card-image-wrapper">
            ${displayImage ? `<img 
              src="${displayImage}" 
              alt="${title}" 
              class="news-card-image"
              loading="lazy"
              onerror="this.classList.add('image-error')" 
            />` : ''}
            ${shortDate ? `<div class="news-card-date-badge">
              <span>${shortDate}</span>
            </div>` : ''}
          </div>
          <div class="news-card-content">
            <h3 class="news-card-title">${title}</h3>
            ${excerpt ? `<p class="news-card-excerpt">${excerpt}</p>` : ''}
            <div class="news-card-footer">
              <button class="news-card-read-more">Devamını Oku</button>
            </div>
          </div>
        </article>
      `;
      })
      .filter(html => html !== '')
      .join('');
  }

  getNewsById(id) {
    return this.newsData.find((n) => n.id === id);
  }

  displayNewsDetail(news) {
    const modalBody = document.getElementById('news-modal-body');
    if (!modalBody || !news) return;

    const title = news.title || 'Başlıksız Haber';
    
    // Tarih formatı
    let formattedDate = '';
    if (news.date) {
      const date = new Date(news.date);
      if (!isNaN(date.getTime())) {
        formattedDate = date.toLocaleDateString('tr-TR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });
      }
    }

    // Görseller - src veya doğrudan string olabilir
    const images = Array.isArray(news.images)
      ? news.images.map((img) => typeof img === 'string' ? img : (img.src || '')).filter(src => src)
      : [];
    const hasMultipleImages = images.length > 1;

    let imagesHTML = '';
    if (images.length === 0) {
      imagesHTML = `
        <div class="news-detail-image news-detail-no-image">
          <div class="image-placeholder-detail">📷 Görsel Yok</div>
        </div>
      `;
    } else if (hasMultipleImages) {
      imagesHTML = `
        <div class="news-images-gallery">
          <div class="news-images-main">
            <img id="news-main-image" src="${images[0]}" alt="${title}" />
            <button class="news-image-nav news-image-prev" onclick="changeNewsImage(-1)">‹</button>
            <button class="news-image-nav news-image-next" onclick="changeNewsImage(1)">›</button>
            <div class="news-image-counter">
              <span id="news-image-current">1</span> / <span id="news-image-total">${images.length}</span>
            </div>
          </div>
          <div class="news-images-thumbnails">
            ${images
              .map(
                (img, index) => `
              <img 
                src="${img}" 
                alt="Resim ${index + 1}" 
                class="news-thumbnail ${index === 0 ? 'active' : ''}"
                onclick="setNewsImage(${index})"
              />
            `
              )
              .join('')}
          </div>
        </div>
      `;
      window.currentNewsImages = images;
      window.currentNewsImageIndex = 0;
    } else {
      imagesHTML = `
        <div class="news-detail-image">
          <img src="${images[0]}" alt="${title}" />
        </div>
      `;
    }

    const detailText =
      news.content && news.content.trim().length > 0
        ? news.content
        : `<p>${news.excerpt || 'Bu haber için içerik bulunamadı.'}</p>`;

    modalBody.innerHTML = `
      ${imagesHTML}
      <div class="news-detail-content">
        ${formattedDate ? `<div class="news-detail-date">${formattedDate}</div>` : ''}
        <h2 class="news-detail-title">${title}</h2>
        <div class="news-detail-text">
          ${detailText}
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
  } else if (
    e.key === 'ArrowLeft' &&
    window.currentNewsImages &&
    window.currentNewsImages.length > 1
  ) {
    changeNewsImage(-1);
  } else if (
    e.key === 'ArrowRight' &&
    window.currentNewsImages &&
    window.currentNewsImages.length > 1
  ) {
    changeNewsImage(1);
  }
});

// Sayfa yüklendiğinde başlat
function initNewsDisplay() {
  newsDisplay = new NewsDisplay();
  window.newsDisplay = newsDisplay;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initNewsDisplay);
} else {
  initNewsDisplay();
}

