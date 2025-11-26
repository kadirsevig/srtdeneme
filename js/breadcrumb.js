// Breadcrumb navigasyon fonksiyonu
class BreadcrumbNavigation {
  constructor() {
    this.init();
  }

  init() {
    // Breadcrumb zaten varsa tekrar ekleme
    if (document.querySelector('.breadcrumb')) {
      return;
    }

    const main = document.querySelector('main');
    if (!main) {
      // Main henüz yüklenmemişse tekrar dene
      setTimeout(() => this.init(), 100);
      return;
    }

    const breadcrumb = this.createBreadcrumb();
    if (breadcrumb) {
      main.insertBefore(breadcrumb, main.firstChild);
    }
  }

  createBreadcrumb() {
    const currentPath = window.location.pathname;
    const currentPage = currentPath.split('/').pop() || 'index.html';
    
    // Breadcrumb yapısı
    const breadcrumbData = this.getBreadcrumbData(currentPage);
    if (!breadcrumbData || breadcrumbData.length === 0) return null;

    const nav = document.createElement('nav');
    nav.className = 'breadcrumb';
    nav.setAttribute('aria-label', 'Breadcrumb');

    const list = document.createElement('ol');
    list.className = 'breadcrumb-list';

    breadcrumbData.forEach((item, index) => {
      const listItem = document.createElement('li');
      listItem.className = 'breadcrumb-item';

      if (index === breadcrumbData.length - 1) {
        // Son öğe (mevcut sayfa)
        const span = document.createElement('span');
        span.className = 'breadcrumb-current';
        span.textContent = item.title;
        listItem.appendChild(span);
      } else {
        // Link
        const link = document.createElement('a');
        link.className = 'breadcrumb-link';
        link.href = item.url;
        link.textContent = item.title;
        listItem.appendChild(link);
      }

      list.appendChild(listItem);
    });

    nav.appendChild(list);
    return nav;
  }

  getBreadcrumbData(currentPage) {
    // Ana sayfa ve haberler sayfasında breadcrumb gösterme
    if (currentPage === 'index.html' || currentPage === 'haberler.html') {
      return null;
    }
    
    const breadcrumbs = {
      'kurumsal.html': [
        { title: 'Anasayfa', url: 'index.html' },
        { title: 'Kurumsal', url: 'kurumsal.html' }
      ],
      'urunler.html': [
        { title: 'Anasayfa', url: 'index.html' },
        { title: 'Ürünler', url: 'urunler.html' }
      ],
      'hemogram.html': [
        { title: 'Anasayfa', url: 'index.html' },
        { title: 'Ürünler', url: 'urunler.html' },
        { title: 'Hemogram Çözümleri', url: 'hemogram.html' }
      ],
      'biyokimya.html': [
        { title: 'Anasayfa', url: 'index.html' },
        { title: 'Ürünler', url: 'urunler.html' },
        { title: 'Biyokimya Çözümleri', url: 'biyokimya.html' }
      ],
      'kangazi.html': [
        { title: 'Anasayfa', url: 'index.html' },
        { title: 'Ürünler', url: 'urunler.html' },
        { title: 'Kan Gazı Çözümleri', url: 'kangazi.html' }
      ],
      'idraranalizor.html': [
        { title: 'Anasayfa', url: 'index.html' },
        { title: 'Ürünler', url: 'urunler.html' },
        { title: 'İdrar Analizörü Çözümleri', url: 'idraranalizor.html' }
      ],
      'kemiluminesans.html': [
        { title: 'Anasayfa', url: 'index.html' },
        { title: 'Ürünler', url: 'urunler.html' },
        { title: 'Hormon Çözümleri', url: 'kemiluminesans.html' }
      ],
      'koagulasyon.html': [
        { title: 'Anasayfa', url: 'index.html' },
        { title: 'Ürünler', url: 'urunler.html' },
        { title: 'Koagülasyon Analizörleri', url: 'koagulasyon.html' }
      ],
      'referanslar.html': [
        { title: 'Anasayfa', url: 'index.html' },
        { title: 'Referanslar', url: 'referanslar.html' }
      ],
      'iletisim.html': [
        { title: 'Anasayfa', url: 'index.html' },
        { title: 'İletişim', url: 'iletisim.html' }
      ],
      'haberler.html': [
        { title: 'Anasayfa', url: 'index.html' },
        { title: 'Haberler', url: 'haberler.html' }
      ]
    };

    return breadcrumbs[currentPage] || breadcrumbs['index.html'];
  }
}

// Sayfa yüklendiğinde breadcrumb'u oluştur
(function() {
  function initBreadcrumb() {
    try {
      if (!window.breadcrumbNav) {
        window.breadcrumbNav = new BreadcrumbNavigation();
      }
    } catch (error) {
      console.error('Breadcrumb oluşturulamadı:', error);
    }
  }

  // DOM yüklendikten sonra başlat
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(initBreadcrumb, 150);
    });
  } else {
    setTimeout(initBreadcrumb, 150);
  }
})();

