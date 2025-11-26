// Ana Sayfa Haberler JavaScript
class HomeNews {
  constructor() {
    this.storageKey = 'srt_medikal_news';
    this.init();
  }

  async init() {
    // Önce JSON'dan yükle, sonra localStorage'dan
    await this.loadFromJSON();
    this.loadLatestNews();
  }

  async loadFromJSON() {
    if (window.location.protocol === 'file:') {
      return;
    }
    
    try {
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
          const localNews = this.getAllNews();
          const jsonIds = new Set(data.news.map(n => n.id));
          const localOnlyNews = localNews.filter(n => !jsonIds.has(n.id));
          const combinedNews = [...data.news, ...localOnlyNews];
          
          if (combinedNews.length > 0) {
            localStorage.setItem(this.storageKey, JSON.stringify(combinedNews));
          }
        }
      }
    } catch (error) {
      console.log('JSON yüklenemedi:', error.message);
    }
  }

  getAllNews() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const news = JSON.parse(stored);
        if (Array.isArray(news) && news.length > 0) {
          // Tarihe göre sırala (en yeni önce)
          return news.sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return dateB - dateA;
          });
        }
      }
    } catch (error) {
      console.error('Haberler yüklenemedi:', error);
    }
    return [];
  }

  loadLatestNews() {
    const container = document.getElementById('latest-news-container');
    const loadingDiv = document.getElementById('latest-news-loading');
    if (!container) return;

    // Loading mesajını gizle
    if (loadingDiv) {
      loadingDiv.style.display = 'none';
    }

    const allNews = this.getAllNews();
    const latestNews = allNews.slice(0, 3); // Son 3 haber

    if (latestNews.length === 0) {
      // Haber yoksa container'ı boşalt
      container.innerHTML = '';
      
      // Empty mesajını göster
      const emptyDiv = document.getElementById('latest-news-empty');
      if (emptyDiv) {
        emptyDiv.style.display = 'block';
      }
      
      return;
    }
    
    // Empty mesajını gizle
    const emptyDiv = document.getElementById('latest-news-empty');
    if (emptyDiv) {
      emptyDiv.style.display = 'none';
    }

    container.innerHTML = latestNews.map(news => {
      const date = new Date(news.date);
      const formattedDate = date.toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });

      // İlk resmi göster
      const displayImage = (news.images && news.images.length > 0) ? news.images[0] : news.image;
      
      // İlk 60 karakteri göster (çok kompakt)
      const excerpt = news.excerpt.length > 60 
        ? news.excerpt.substring(0, 60) + '...' 
        : news.excerpt;

      return `
        <article class="latest-news-card" onclick="window.location.href='haberler.html'">
          <div class="latest-news-image-wrapper">
            <img 
              src="${displayImage || 'https://via.placeholder.com/400x250?text=Resim+Yok'}" 
              alt="${news.title}" 
              class="latest-news-image"
              loading="lazy"
              onerror="this.src='https://via.placeholder.com/400x250?text=Resim+Yüklenemedi'" 
            />
            <div class="latest-news-date-badge">
              <span>${formattedDate}</span>
            </div>
            <div class="latest-news-overlay"></div>
          </div>
          <div class="latest-news-content">
            <h3 class="latest-news-title">${news.title}</h3>
            <p class="latest-news-excerpt">${excerpt}</p>
            <span class="latest-news-read-more">Devamını Oku →</span>
          </div>
        </article>
      `;
    }).join('');
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

