// Ürün karşılaştırma fonksiyonu
class ProductComparison {
  constructor() {
    this.comparisonItems = [];
    this.maxItems = 4;
    this.init();
  }

  init() {
    this.loadFromStorage();
    this.createComparisonUI();
    this.attachEventListeners();
    this.updateComparisonUI();
  }

  createComparisonUI() {
    // Karşılaştırma paneli
    const panel = document.createElement('div');
    panel.className = 'product-comparison';
    panel.innerHTML = `
      <div class="comparison-header">
        <h3 class="comparison-title">Karşılaştırma</h3>
        <button class="comparison-close" aria-label="Kapat">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
      <div class="comparison-items"></div>
      <div class="comparison-actions">
        <button class="comparison-btn comparison-btn-primary">Karşılaştır</button>
        <button class="comparison-btn comparison-btn-secondary">Temizle</button>
      </div>
    `;
    document.body.appendChild(panel);
    this.panel = panel;

    // Karşılaştırma modalı
    const modal = document.createElement('div');
    modal.className = 'comparison-modal';
    modal.innerHTML = `
      <div class="comparison-modal-overlay"></div>
      <div class="comparison-modal-content">
        <div style="padding: 24px; border-bottom: 1px solid var(--gray-200); display: flex; justify-content: space-between; align-items: center;">
          <h2 style="margin: 0; color: var(--blue-dark);">Ürün Karşılaştırması</h2>
          <button class="comparison-close" aria-label="Kapat">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
        <div class="comparison-table-wrapper">
          <table class="comparison-table">
            <thead>
              <tr>
                <th>Özellik</th>
              </tr>
            </thead>
            <tbody></tbody>
          </table>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    this.modal = modal;
  }

  attachEventListeners() {
    // Panel kapatma
    this.panel.querySelector('.comparison-close').addEventListener('click', () => {
      this.panel.classList.remove('is-visible');
    });

    // Modal kapatma
    this.modal.querySelectorAll('.comparison-close').forEach(btn => {
      btn.addEventListener('click', () => {
        this.modal.classList.remove('is-open');
      });
    });

    this.modal.querySelector('.comparison-modal-overlay').addEventListener('click', () => {
      this.modal.classList.remove('is-open');
    });

    // Karşılaştır butonu
    this.panel.querySelector('.comparison-btn-primary').addEventListener('click', () => {
      this.showComparison();
    });

    // Temizle butonu
    this.panel.querySelector('.comparison-btn-secondary').addEventListener('click', () => {
      this.clearComparison();
    });
  }

  addToComparison(productId, productName, productData = {}) {
    if (this.comparisonItems.length >= this.maxItems) {
      alert(`En fazla ${this.maxItems} ürün karşılaştırabilirsiniz.`);
      return;
    }

    if (this.comparisonItems.find(item => item.id === productId)) {
      return; // Zaten ekli
    }

    this.comparisonItems.push({
      id: productId,
      name: productName,
      ...productData
    });

    this.saveToStorage();
    this.updateComparisonUI();
    this.showAddButton(productId);
  }

  removeFromComparison(productId) {
    this.comparisonItems = this.comparisonItems.filter(item => item.id !== productId);
    this.saveToStorage();
    this.updateComparisonUI();
    this.hideAddButton(productId);
  }

  updateComparisonUI() {
    const itemsContainer = this.panel.querySelector('.comparison-items');
    itemsContainer.innerHTML = '';

    if (this.comparisonItems.length === 0) {
      this.panel.classList.remove('is-visible');
      return;
    }

    this.panel.classList.add('is-visible');

    this.comparisonItems.forEach(item => {
      const itemEl = document.createElement('div');
      itemEl.className = 'comparison-item';
      itemEl.innerHTML = `
        <span class="comparison-item-name">${item.name}</span>
        <button class="comparison-item-remove" data-id="${item.id}" aria-label="Kaldır">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      `;
      itemsContainer.appendChild(itemEl);
    });

    // Kaldır butonlarına event listener ekle
    itemsContainer.querySelectorAll('.comparison-item-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        this.removeFromComparison(id);
      });
    });
  }

  showComparison() {
    if (this.comparisonItems.length < 2) {
      alert('En az 2 ürün seçmelisiniz.');
      return;
    }

    this.renderComparisonTable();
    this.modal.classList.add('is-open');
  }

  async renderComparisonTable() {
    const tbody = this.modal.querySelector('.comparison-table tbody');
    const thead = this.modal.querySelector('.comparison-table thead tr');
    
    tbody.innerHTML = '';
    thead.innerHTML = '<th>Özellik</th>';

    // Başlık satırı
    this.comparisonItems.forEach(item => {
      const th = document.createElement('th');
      th.textContent = item.name;
      thead.appendChild(th);
    });

    // Özellikler
    const features = ['Kategori', 'Marka', 'Açıklama'];
    
    features.forEach(feature => {
      const row = document.createElement('tr');
      const featureCell = document.createElement('td');
      featureCell.textContent = feature;
      row.appendChild(featureCell);

      this.comparisonItems.forEach(item => {
        const cell = document.createElement('td');
        let value = '-';
        
        switch(feature) {
          case 'Kategori':
            value = item.category || '-';
            break;
          case 'Marka':
            value = item.brand || '-';
            break;
          case 'Açıklama':
            value = item.description || '-';
            break;
        }
        
        cell.textContent = value;
        row.appendChild(cell);
      });

      tbody.appendChild(row);
    });
  }

  clearComparison() {
    this.comparisonItems = [];
    this.saveToStorage();
    this.updateComparisonUI();
    
    // Tüm "Karşılaştırmaya Ekle" butonlarını göster
    document.querySelectorAll('.comparison-add-btn').forEach(btn => {
      btn.style.display = 'inline-flex';
    });
  }

  showAddButton(productId) {
    const btn = document.querySelector(`[data-comparison-id="${productId}"]`);
    if (btn) {
      btn.style.display = 'none';
    }
  }

  hideAddButton(productId) {
    const btn = document.querySelector(`[data-comparison-id="${productId}"]`);
    if (btn) {
      btn.style.display = 'inline-flex';
    }
  }

  saveToStorage() {
    try {
      localStorage.setItem('productComparison', JSON.stringify(this.comparisonItems));
    } catch (e) {
      console.error('LocalStorage kayıt hatası:', e);
    }
  }

  loadFromStorage() {
    try {
      const stored = localStorage.getItem('productComparison');
      if (stored) {
        this.comparisonItems = JSON.parse(stored);
      }
    } catch (e) {
      console.error('LocalStorage okuma hatası:', e);
    }
  }
}

// Global instance - güvenli başlatma
(function() {
  try {
    window.productComparison = new ProductComparison();
  } catch (error) {
    console.error('Karşılaştırma özelliği başlatılamadı:', error);
    // Fallback: Basit bir obje oluştur
    window.productComparison = {
      addToComparison: () => {},
      showComparison: () => {},
      clearComparison: () => {}
    };
  }
})();

// Ürün kartlarına "Karşılaştırmaya Ekle" butonu ekle
function addComparisonButtons() {
  try {
    if (!window.productComparison) {
      setTimeout(addComparisonButtons, 200);
      return;
    }

    document.querySelectorAll('.model-card, .product-compact-card').forEach(card => {
      const name = card.querySelector('.model-name, .product-compact-title')?.textContent;
      if (!name) return;

      const productId = name.toLowerCase().replace(/\s+/g, '-');
      
      // Buton zaten varsa ekleme
      if (card.querySelector('.comparison-add-btn')) return;

      const btn = document.createElement('button');
      btn.className = 'comparison-add-btn';
      btn.setAttribute('data-comparison-id', productId);
      btn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Karşılaştır
      `;
      
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (window.productComparison && window.productComparison.addToComparison) {
          window.productComparison.addToComparison(productId, name);
        }
      });

      // Kartın içine ekle
      const actions = card.querySelector('.product-detail-actions') || card;
      if (actions) {
        actions.appendChild(btn);
      }
    });
  } catch (error) {
    console.error('Karşılaştırma butonları eklenemedi:', error);
  }
}

// Sayfa yüklendiğinde butonları ekle
(function() {
  function initButtons() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(addComparisonButtons, 300);
      });
    } else {
      setTimeout(addComparisonButtons, 300);
    }

    // Dinamik içerik için MutationObserver
    try {
      const observer = new MutationObserver(() => {
        setTimeout(addComparisonButtons, 100);
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    } catch (error) {
      console.error('MutationObserver hatası:', error);
    }
  }

  initButtons();
})();

