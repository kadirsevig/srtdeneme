// Site içi arama fonksiyonu
class SiteSearch {
  constructor() {
    this.searchIndex = null;
    this.searchResults = [];
    this.init();
  }

  async init() {
    try {
      // Farklı yolları dene
      let response = await fetch('data/search-index.json');
      if (!response.ok) {
        response = await fetch('/data/search-index.json');
      }
      if (!response.ok) {
        response = await fetch('./data/search-index.json');
      }
      if (response.ok) {
        this.searchIndex = await response.json();
        this.setupSearchUI();
      } else {
        console.warn('Arama indeksi bulunamadı, arama özelliği devre dışı');
      }
    } catch (error) {
      console.warn('Arama indeksi yüklenemedi:', error);
      // Hata olsa bile UI'ı göster (boş sonuçlarla)
      this.searchIndex = { pages: [], products: [] };
      this.setupSearchUI();
    }
  }

  setupSearchUI() {
    // Arama butonu zaten varsa tekrar ekleme
    if (document.querySelector('.search-toggle')) {
      return;
    }

    // Arama butonu ekle
    const nav = document.querySelector('.primary-nav');
    if (!nav) {
      // Nav henüz yüklenmemişse tekrar dene
      setTimeout(() => this.setupSearchUI(), 100);
      return;
    }

    const searchButton = document.createElement('button');
    searchButton.className = 'search-toggle';
    searchButton.setAttribute('aria-label', 'Arama');
    searchButton.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;
    searchButton.addEventListener('click', () => this.openSearchModal());

    // Nav'in başına ekle
    nav.insertBefore(searchButton, nav.firstChild);

    // Arama modalı oluştur
    this.createSearchModal();
  }

  createSearchModal() {
    const modal = document.createElement('div');
    modal.className = 'search-modal';
    modal.innerHTML = `
      <div class="search-modal-overlay"></div>
      <div class="search-modal-content">
        <div class="search-input-wrapper">
          <input 
            type="text" 
            class="search-input" 
            placeholder="Ürün, sayfa veya içerik ara..." 
            autocomplete="off"
            aria-label="Arama"
          />
          <button class="search-close" aria-label="Kapat">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
        <div class="search-results"></div>
      </div>
    `;
    document.body.appendChild(modal);

    const overlay = modal.querySelector('.search-modal-overlay');
    const closeBtn = modal.querySelector('.search-close');
    const input = modal.querySelector('.search-input');
    const resultsContainer = modal.querySelector('.search-results');

    overlay.addEventListener('click', () => this.closeSearchModal());
    closeBtn.addEventListener('click', () => this.closeSearchModal());

    // ESC tuşu ile kapat
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) {
        this.closeSearchModal();
      }
    });

    // Arama input eventi
    let searchTimeout;
    input.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      const query = e.target.value.trim();
      
      if (query.length < 2) {
        resultsContainer.innerHTML = '<div class="search-empty">En az 2 karakter giriniz</div>';
        return;
      }

      searchTimeout = setTimeout(() => {
        this.performSearch(query, resultsContainer);
      }, 300);
    });

    // Enter tuşu ile ilk sonuca git
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && this.searchResults.length > 0) {
        window.location.href = this.searchResults[0].url;
      }
    });
  }

  openSearchModal() {
    const modal = document.querySelector('.search-modal');
    if (modal) {
      modal.classList.add('is-open');
      const input = modal.querySelector('.search-input');
      setTimeout(() => input.focus(), 100);
    }
  }

  closeSearchModal() {
    const modal = document.querySelector('.search-modal');
    if (modal) {
      modal.classList.remove('is-open');
      const input = modal.querySelector('.search-input');
      input.value = '';
    }
  }

  performSearch(query, container) {
    if (!this.searchIndex) return;

    const lowerQuery = query.toLowerCase();
    this.searchResults = [];

    // Sayfaları ara
    this.searchIndex.pages.forEach(page => {
      const score = this.calculateScore(page, lowerQuery);
      if (score > 0) {
        this.searchResults.push({
          ...page,
          score,
          type: 'page'
        });
      }
    });

    // Ürünleri ara
    this.searchIndex.products.forEach(product => {
      const score = this.calculateScore(product, lowerQuery);
      if (score > 0) {
        this.searchResults.push({
          ...product,
          score,
          type: 'product'
        });
      }
    });

    // Skora göre sırala
    this.searchResults.sort((a, b) => b.score - a.score);

    // Sonuçları göster
    this.displayResults(this.searchResults, container, query);
  }

  calculateScore(item, query) {
    let score = 0;
    const title = (item.title || item.name || '').toLowerCase();
    const content = (item.content || item.description || '').toLowerCase();
    const category = (item.category || '').toLowerCase();
    const brand = (item.brand || '').toLowerCase();
    const features = (item.features || []).join(' ').toLowerCase();

    // Başlıkta tam eşleşme
    if (title.includes(query)) {
      score += 100;
      if (title.startsWith(query)) score += 50;
    }

    // İçerikte eşleşme
    if (content.includes(query)) {
      score += 30;
    }

    // Kategori eşleşmesi
    if (category.includes(query)) {
      score += 40;
    }

    // Marka eşleşmesi
    if (brand.includes(query)) {
      score += 35;
    }

    // Özelliklerde eşleşme
    if (features.includes(query)) {
      score += 20;
    }

    // Kelime bazlı eşleşme
    const queryWords = query.split(' ').filter(w => w.length > 2);
    queryWords.forEach(word => {
      if (title.includes(word)) score += 15;
      if (content.includes(word)) score += 5;
      if (category.includes(word)) score += 10;
      if (brand.includes(word)) score += 8;
    });

    return score;
  }

  displayResults(results, container, query) {
    if (results.length === 0) {
      container.innerHTML = `
        <div class="search-empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <p>"${query}" için sonuç bulunamadı</p>
          <span>Farklı anahtar kelimeler deneyin</span>
        </div>
      `;
      return;
    }

    const html = results.slice(0, 10).map(result => {
      const isProduct = result.type === 'product';
      const title = result.title || result.name;
      const badge = isProduct ? `<span class="search-badge search-badge-product">Ürün</span>` : `<span class="search-badge search-badge-page">Sayfa</span>`;
      const category = result.category ? `<span class="search-category">${result.category}</span>` : '';
      const brand = result.brand ? `<span class="search-brand">${result.brand}</span>` : '';

      return `
        <a href="${result.url}" class="search-result-item">
          <div class="search-result-header">
            <h3 class="search-result-title">${this.highlightText(title, query)}</h3>
            ${badge}
          </div>
          <p class="search-result-description">${this.highlightText(result.content || result.description, query)}</p>
          <div class="search-result-meta">
            ${category}
            ${brand}
          </div>
        </a>
      `;
    }).join('');

    container.innerHTML = html;
  }

  highlightText(text, query) {
    if (!text || !query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }
}

// Sayfa yüklendiğinde arama özelliğini başlat
(function() {
  function initSearch() {
    try {
      if (!window.siteSearch) {
        window.siteSearch = new SiteSearch();
      }
    } catch (error) {
      console.error('Arama özelliği başlatılamadı:', error);
    }
  }

  // DOM yüklendikten sonra başlat
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(initSearch, 200);
    });
  } else {
    // DOM zaten yüklüyse kısa bir gecikme ile başlat
    setTimeout(initSearch, 200);
  }
})();

