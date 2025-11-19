// Basit çoklu dil desteği (i18n)
class I18n {
  constructor() {
    this.currentLang = this.getCurrentLanguage();
    this.translations = {};
    this.init();
  }

  init() {
    this.loadTranslations();
    this.setupLanguageSelector();
    this.applyLanguage(this.currentLang);
  }

  getCurrentLanguage() {
    // URL parametresinden dil al
    const urlParams = new URLSearchParams(window.location.search);
    const lang = urlParams.get('lang');
    if (lang && (lang === 'tr' || lang === 'en')) {
      localStorage.setItem('preferredLanguage', lang);
      return lang;
    }
    
    // LocalStorage'dan dil al
    const stored = localStorage.getItem('preferredLanguage');
    if (stored && (stored === 'tr' || stored === 'en')) {
      return stored;
    }
    
    // Varsayılan dil
    return 'tr';
  }

  async loadTranslations() {
    try {
      // Farklı yolları dene
      let response = await fetch('data/translations.json');
      if (!response.ok) {
        response = await fetch('/data/translations.json');
      }
      if (!response.ok) {
        response = await fetch('./data/translations.json');
      }
      if (response.ok) {
        this.translations = await response.json();
      } else {
        // Varsayılan çeviriler
        this.translations = {
          tr: {},
          en: {}
        };
      }
    } catch (error) {
      console.warn('Çeviriler yüklenemedi:', error);
      this.translations = {
        tr: {},
        en: {}
      };
    }
  }

  setupLanguageSelector() {
    const nav = document.querySelector('.primary-nav');
    if (!nav) return;

    const langSelector = document.createElement('div');
    langSelector.className = 'language-selector';
    langSelector.innerHTML = `
      <a href="?lang=tr" class="language-btn ${this.currentLang === 'tr' ? 'is-active' : ''}" data-lang="tr">TR</a>
      <a href="?lang=en" class="language-btn ${this.currentLang === 'en' ? 'is-active' : ''}" data-lang="en">EN</a>
    `;

    // Event listener'lar
    langSelector.querySelectorAll('.language-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const lang = btn.dataset.lang;
        this.switchLanguage(lang);
      });
    });

    nav.appendChild(langSelector);
  }

  switchLanguage(lang) {
    localStorage.setItem('preferredLanguage', lang);
    this.currentLang = lang;
    
    // URL'yi güncelle
    const url = new URL(window.location);
    url.searchParams.set('lang', lang);
    window.history.pushState({}, '', url);
    
    this.applyLanguage(lang);
  }

  applyLanguage(lang) {
    // HTML lang attribute'unu güncelle
    document.documentElement.lang = lang;
    
    // Tüm çevrilebilir elementleri güncelle
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      const translation = this.t(key, lang);
      if (translation) {
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
          element.placeholder = translation;
        } else {
          element.textContent = translation;
        }
      }
    });

    // Language selector'ı güncelle
    document.querySelectorAll('.language-btn').forEach(btn => {
      if (btn.dataset.lang === lang) {
        btn.classList.add('is-active');
      } else {
        btn.classList.remove('is-active');
      }
    });
  }

  t(key, lang = null) {
    const targetLang = lang || this.currentLang;
    const keys = key.split('.');
    let value = this.translations[targetLang];
    
    for (const k of keys) {
      if (value && value[k]) {
        value = value[k];
      } else {
        // Fallback to Turkish
        value = this.translations.tr;
        for (const k2 of keys) {
          if (value && value[k2]) {
            value = value[k2];
          } else {
            return key; // Return key if translation not found
          }
        }
        break;
      }
    }
    
    return typeof value === 'string' ? value : key;
  }
}

// Global instance - güvenli başlatma
(function() {
  function initI18n() {
    try {
      window.i18n = new I18n();
      // Helper function
      window.t = function(key) {
        return window.i18n ? window.i18n.t(key) : key;
      };
    } catch (error) {
      console.error('Dil desteği başlatılamadı:', error);
      // Fallback
      window.i18n = { t: (key) => key };
      window.t = (key) => key;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initI18n);
  } else {
    setTimeout(initI18n, 100);
  }
})();

