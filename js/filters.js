// Ürün filtreleme fonksiyonu
class ProductFilters {
  constructor() {
    this.filters = {
      category: [],
      brand: [],
      feature: []
    };
    this.allProducts = [];
    this.filteredProducts = [];
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
        const data = await response.json();
        this.allProducts = data.products || [];
        this.filteredProducts = [...this.allProducts];
        this.setupFilters();
        this.renderProducts();
      } else {
        console.warn('Filtre verileri bulunamadı');
      }
    } catch (error) {
      console.warn('Filtre verileri yüklenemedi:', error);
    }
  }

  setupFilters() {
    const filterContainer = document.querySelector('.product-filters');
    if (!filterContainer) {
      // Container henüz yüklenmemişse tekrar dene
      setTimeout(() => this.setupFilters(), 200);
      return;
    }

    // Zaten filtreler varsa tekrar ekleme
    if (filterContainer.querySelector('.filter-group')) {
      return;
    }

    // Kategorileri topla
    const categories = [...new Set(this.allProducts.map(p => p.category))];
    const brands = [...new Set(this.allProducts.map(p => p.brand))];
    const allFeatures = this.allProducts.flatMap(p => p.features || []);
    const features = [...new Set(allFeatures)];

    // Kategori filtresi
    const categoryGroup = this.createFilterGroup('Kategori', 'category', categories);
    filterContainer.appendChild(categoryGroup);

    // Marka filtresi
    const brandGroup = this.createFilterGroup('Marka', 'brand', brands);
    filterContainer.appendChild(brandGroup);

    // Özellik filtresi
    const featureGroup = this.createFilterGroup('Özellikler', 'feature', features.slice(0, 10));
    filterContainer.appendChild(featureGroup);

    // Reset butonu
    const resetBtn = document.createElement('button');
    resetBtn.className = 'filter-reset';
    resetBtn.textContent = 'Filtreleri Temizle';
    resetBtn.addEventListener('click', () => this.resetFilters());
    filterContainer.appendChild(resetBtn);

    // Sonuç sayısı
    const resultsCount = document.createElement('div');
    resultsCount.className = 'filter-results-count';
    filterContainer.appendChild(resultsCount);
    this.resultsCountEl = resultsCount;
  }

  createFilterGroup(label, filterType, options) {
    const group = document.createElement('div');
    group.className = 'filter-group';

    const labelEl = document.createElement('label');
    labelEl.className = 'filter-label';
    labelEl.textContent = label;
    group.appendChild(labelEl);

    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'filter-options';

    options.forEach(option => {
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'filter-checkbox';
      checkbox.id = `filter-${filterType}-${option.replace(/\s+/g, '-').toLowerCase()}`;
      checkbox.value = option;
      checkbox.dataset.filterType = filterType;

      const checkboxLabel = document.createElement('label');
      checkboxLabel.className = 'filter-checkbox-label';
      checkboxLabel.htmlFor = checkbox.id;
      checkboxLabel.textContent = option;

      checkbox.addEventListener('change', () => this.handleFilterChange());

      const wrapper = document.createElement('div');
      wrapper.appendChild(checkbox);
      wrapper.appendChild(checkboxLabel);
      optionsContainer.appendChild(wrapper);
    });

    group.appendChild(optionsContainer);
    return group;
  }

  handleFilterChange() {
    const checkboxes = document.querySelectorAll('.filter-checkbox:checked');
    
    this.filters = {
      category: [],
      brand: [],
      feature: []
    };

    checkboxes.forEach(checkbox => {
      const filterType = checkbox.dataset.filterType;
      if (this.filters[filterType]) {
        this.filters[filterType].push(checkbox.value);
      }
    });

    this.applyFilters();
  }

  applyFilters() {
    this.filteredProducts = this.allProducts.filter(product => {
      // Kategori filtresi
      if (this.filters.category.length > 0) {
        if (!this.filters.category.includes(product.category)) {
          return false;
        }
      }

      // Marka filtresi
      if (this.filters.brand.length > 0) {
        if (!this.filters.brand.includes(product.brand)) {
          return false;
        }
      }

      // Özellik filtresi
      if (this.filters.feature.length > 0) {
        const productFeatures = product.features || [];
        const hasFeature = this.filters.feature.some(f => 
          productFeatures.some(pf => pf.toLowerCase().includes(f.toLowerCase()))
        );
        if (!hasFeature) {
          return false;
        }
      }

      return true;
    });

    this.renderProducts();
    this.updateResultsCount();
  }

  renderProducts() {
    const container = document.querySelector('.product-compact-grid, .model-grid');
    if (!container) return;

    // Mevcut ürünleri temizle (sadece data-filterable olanları)
    const existingItems = container.querySelectorAll('[data-filterable]');
    existingItems.forEach(item => item.remove());

    // Filtrelenmiş ürünleri göster
    this.filteredProducts.forEach(product => {
      const item = this.createProductCard(product);
      if (item) {
        container.appendChild(item);
      }
    });
  }

  createProductCard(product) {
    // Mevcut kart yapısına uygun kart oluştur
    const card = document.createElement('article');
    card.className = 'product-compact-card';
    card.setAttribute('data-filterable', 'true');
    card.setAttribute('data-category', product.category);
    card.setAttribute('data-brand', product.brand);

    card.innerHTML = `
      <a href="${product.url}" class="product-compact-media">
        <img src="https://via.placeholder.com/120" alt="${product.name}" loading="lazy" />
      </a>
      <div class="product-compact-info">
        <h3 class="product-compact-title">${product.name}</h3>
        <p class="product-compact-desc">${product.description}</p>
      </div>
      <a class="product-compact-link" href="${product.url}">Detayları Gör</a>
    `;

    return card;
  }

  resetFilters() {
    document.querySelectorAll('.filter-checkbox').forEach(cb => {
      cb.checked = false;
    });
    this.filters = {
      category: [],
      brand: [],
      feature: []
    };
    this.filteredProducts = [...this.allProducts];
    this.renderProducts();
    this.updateResultsCount();
  }

  updateResultsCount() {
    if (this.resultsCountEl) {
      const count = this.filteredProducts.length;
      const total = this.allProducts.length;
      this.resultsCountEl.textContent = `${count} ürün bulundu (Toplam: ${total})`;
    }
  }
}

// Sayfa yüklendiğinde filtreleri başlat
(function() {
  function initFilters() {
    try {
      if (document.querySelector('.product-filters')) {
        if (!window.productFilters) {
          window.productFilters = new ProductFilters();
        }
      }
    } catch (error) {
      console.error('Filtreleme özelliği başlatılamadı:', error);
    }
  }

  // DOM yüklendikten sonra başlat
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(initFilters, 300);
    });
  } else {
    setTimeout(initFilters, 300);
  }
})();

