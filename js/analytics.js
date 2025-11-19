// Google Analytics entegrasyonu
class Analytics {
  constructor() {
    // Google Analytics Measurement ID - Buraya kendi ID'nizi ekleyin
    this.gaId = 'G-XXXXXXXXXX'; // Örnek ID, gerçek ID ile değiştirin
    this.init();
  }

  init() {
    try {
      // Google Analytics 4 (GA4) yükleme
      if (this.gaId && this.gaId !== 'G-XXXXXXXXXX') {
        this.loadGA4();
        this.trackPageView();
        this.setupEventTracking();
      }
      // ID yoksa sessizce devam et
    } catch (error) {
      console.error('Analytics başlatılamadı:', error);
    }
  }

  loadGA4() {
    // Google Analytics 4 script'ini yükle
    const script1 = document.createElement('script');
    script1.async = true;
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${this.gaId}`;
    document.head.appendChild(script1);

    // gtag fonksiyonunu tanımla
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    window.gtag = gtag;

    gtag('js', new Date());
    gtag('config', this.gaId, {
      page_path: window.location.pathname,
      send_page_view: true
    });
  }

  trackPageView() {
    // Sayfa görüntüleme takibi
    if (window.gtag) {
      window.gtag('config', this.gaId, {
        page_path: window.location.pathname,
        page_title: document.title
      });
    }
  }

  setupEventTracking() {
    // Arama olayları
    document.addEventListener('click', (e) => {
      const target = e.target.closest('.search-toggle, .search-result-item');
      if (target) {
        this.trackEvent('search', 'click', target.textContent || 'search');
      }
    });

    // Ürün karşılaştırma olayları
    document.addEventListener('click', (e) => {
      const target = e.target.closest('.comparison-add-btn, .comparison-btn-primary');
      if (target) {
        this.trackEvent('comparison', 'add_product', target.textContent || 'comparison');
      }
    });

    // Filtreleme olayları
    document.addEventListener('change', (e) => {
      if (e.target.classList.contains('filter-checkbox')) {
        this.trackEvent('filter', 'apply', e.target.value);
      }
    });

    // Form gönderimleri
    document.querySelectorAll('form').forEach(form => {
      form.addEventListener('submit', () => {
        this.trackEvent('form', 'submit', form.id || 'contact_form');
      });
    });

    // Video oynatma
    document.querySelectorAll('video').forEach(video => {
      video.addEventListener('play', () => {
        this.trackEvent('video', 'play', video.src || 'video');
      });
    });

    // Dış link tıklamaları
    document.querySelectorAll('a[target="_blank"]').forEach(link => {
      link.addEventListener('click', () => {
        this.trackEvent('outbound', 'click', link.href);
      });
    });
  }

  trackEvent(category, action, label = '') {
    if (window.gtag) {
      window.gtag('event', action, {
        event_category: category,
        event_label: label
      });
    }
  }

  // Özel olay takibi için public metod
  trackCustomEvent(category, action, label = '', value = null) {
    if (window.gtag) {
      const eventData = {
        event_category: category,
        event_label: label
      };
      if (value !== null) {
        eventData.value = value;
      }
      window.gtag('event', action, eventData);
    }
  }
}

// Global instance
window.analytics = new Analytics();

// Sayfa değişikliklerini takip et (SPA için)
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    window.analytics.trackPageView();
  }
}).observe(document, { subtree: true, childList: true });

