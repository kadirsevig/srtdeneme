// Ana Sayfa Haberler JavaScript (HTML tabanlı veri kaynağı)
class HomeNews {
  constructor() {
    this.container = document.getElementById('latest-news-container');
    this.loadingDiv = document.getElementById('latest-news-loading');
    this.emptyDiv = document.getElementById('latest-news-empty');
    this.init();
  }

  async init() {
    if (!this.container) return;

    this.setLoading(true);
    try {
      const loader = window.NewsDataLoader;
      if (!loader) {
        throw new Error('NewsDataLoader bulunamadı');
      }
      const news = await loader.getAll();
      this.renderLatestNews(news.slice(0, 3));
    } catch (error) {
      console.error('Ana sayfa haberleri yüklenemedi:', error);
      this.showEmptyState();
    } finally {
      this.setLoading(false);
    }
  }

  setLoading(isLoading) {
    if (this.loadingDiv) {
      this.loadingDiv.style.display = isLoading ? 'block' : 'none';
    }
  }

  showEmptyState() {
    if (this.container) {
      this.container.innerHTML = '';
    }
    if (this.emptyDiv) {
      this.emptyDiv.style.display = 'block';
    }
  }

  renderLatestNews(newsList) {
    if (!this.container) return;

    if (!newsList || newsList.length === 0) {
      this.showEmptyState();
      return;
    }

    if (this.emptyDiv) {
      this.emptyDiv.style.display = 'none';
    }

    this.container.innerHTML = newsList
      .map((news) => {
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
              month: 'short',
              year: 'numeric',
            });
          }
        }

        // Görsel yolu - src veya doğrudan string olabilir
        let displayImage = '';
        if (news.images && Array.isArray(news.images) && news.images.length > 0) {
          const firstImage = news.images[0];
          displayImage = typeof firstImage === 'string' ? firstImage : (firstImage.src || '');
        }

        const excerpt =
          news.excerpt && news.excerpt.length > 60
            ? `${news.excerpt.substring(0, 60)}...`
            : news.excerpt || '';

        return `
        <article class="latest-news-card" onclick="window.location.href='haberler.html'">
          <div class="latest-news-image-wrapper">
            ${displayImage ? `<img 
              src="${displayImage}" 
              alt="${title}" 
              class="latest-news-image"
              loading="lazy"
              onerror="this.classList.add('image-error')" 
            />` : ''}
            ${formattedDate ? `<div class="latest-news-date-badge">
              <span>${formattedDate}</span>
            </div>` : ''}
            <div class="latest-news-overlay"></div>
          </div>
          <div class="latest-news-content">
            <h3 class="latest-news-title">${title}</h3>
            ${excerpt ? `<p class="latest-news-excerpt">${excerpt}</p>` : ''}
            <span class="latest-news-read-more">Devamını Oku →</span>
          </div>
        </article>
      `;
      })
      .filter(html => html !== '')
      .join('');
  }
}

// Sayfa yüklendiğinde başlat
let homeNews;
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    homeNews = new HomeNews();
  });
} else {
  homeNews = new HomeNews();
}

