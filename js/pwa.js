// Progressive Web App (PWA) özellikleri
class PWAInstaller {
  constructor() {
    this.deferredPrompt = null;
    this.init();
  }

  init() {
    // Service Worker kaydı
    this.registerServiceWorker();
    
    // Install prompt
    this.setupInstallPrompt();
    
    // Manifest kontrolü
    this.checkManifest();
  }

  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('Service Worker kayıtlı:', registration.scope);
            
            // Güncelleme kontrolü
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // Yeni versiyon mevcut
                  this.showUpdateNotification();
                }
              });
            });
          })
          .catch((error) => {
            console.error('Service Worker kayıt hatası:', error);
          });
      });
    }
  }

  setupInstallPrompt() {
    // Beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.showInstallButton();
    });

    // App yüklendiyse install butonunu gizle
    if (window.matchMedia('(display-mode: standalone)').matches) {
      this.hideInstallButton();
    }
  }

  showInstallButton() {
    let installBtn = document.querySelector('.pwa-install-btn');
    if (!installBtn) {
      installBtn = document.createElement('button');
      installBtn.className = 'pwa-install-btn';
      installBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Uygulamayı Yükle
      `;
      installBtn.addEventListener('click', () => this.installApp());
      
      const header = document.querySelector('.header-inner');
      if (header) {
        header.appendChild(installBtn);
      }
    }
    installBtn.style.display = 'flex';
  }

  hideInstallButton() {
    const installBtn = document.querySelector('.pwa-install-btn');
    if (installBtn) {
      installBtn.style.display = 'none';
    }
  }

  async installApp() {
    if (!this.deferredPrompt) {
      return;
    }

    this.deferredPrompt.prompt();
    const { outcome } = await this.deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('Kullanıcı uygulamayı yükledi');
      if (window.analytics) {
        window.analytics.trackEvent('pwa', 'install', 'accepted');
      }
    } else {
      console.log('Kullanıcı yüklemeyi reddetti');
    }
    
    this.deferredPrompt = null;
    this.hideInstallButton();
  }

  checkManifest() {
    const link = document.querySelector('link[rel="manifest"]');
    if (!link) {
      const manifestLink = document.createElement('link');
      manifestLink.rel = 'manifest';
      manifestLink.href = '/manifest.json';
      document.head.appendChild(manifestLink);
    }
  }

  showUpdateNotification() {
    // Yeni versiyon bildirimi göster
    const notification = document.createElement('div');
    notification.className = 'pwa-update-notification';
    notification.innerHTML = `
      <p>Yeni versiyon mevcut!</p>
      <button onclick="window.location.reload()">Yenile</button>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('show');
    }, 100);
  }
}

// Sayfa yüklendiğinde PWA özelliklerini başlat
(function() {
  function initPWA() {
    try {
      new PWAInstaller();
    } catch (error) {
      console.error('PWA özellikleri başlatılamadı:', error);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPWA);
  } else {
    setTimeout(initPWA, 100);
  }
})();

