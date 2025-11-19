// Lazy loading fonksiyonu
class LazyLoader {
  constructor() {
    this.imageObserver = null;
    this.videoObserver = null;
    this.init();
  }

  init() {
    // Intersection Observer desteği kontrolü
    if ('IntersectionObserver' in window) {
      this.setupImageObserver();
      this.setupVideoObserver();
    } else {
      // Fallback: Tüm görselleri yükle
      this.loadAllImages();
    }
  }

  setupImageObserver() {
    const options = {
      root: null,
      rootMargin: '50px',
      threshold: 0.01
    };

    this.imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadImage(entry.target);
          this.imageObserver.unobserve(entry.target);
        }
      });
    }, options);

    // Tüm lazy görselleri gözle
    document.querySelectorAll('img[loading="lazy"]').forEach(img => {
      this.imageObserver.observe(img);
    });
  }

  setupVideoObserver() {
    const options = {
      root: null,
      rootMargin: '100px',
      threshold: 0.01
    };

    this.videoObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadVideo(entry.target);
          this.videoObserver.unobserve(entry.target);
        }
      });
    }, options);

    // Tüm lazy videoları gözle
    document.querySelectorAll('video[loading="lazy"]').forEach(video => {
      this.videoObserver.observe(video);
    });
  }

  loadImage(img) {
    if (img.dataset.src) {
      img.src = img.dataset.src;
      delete img.dataset.src;
    }
    
    if (img.dataset.srcset) {
      img.srcset = img.dataset.srcset;
      delete img.dataset.srcset;
    }

    img.addEventListener('load', () => {
      img.classList.add('loaded');
    });

    img.addEventListener('error', () => {
      img.style.opacity = '1';
      img.alt = 'Görsel yüklenemedi';
    });
  }

  loadVideo(video) {
    if (video.dataset.src) {
      const source = video.querySelector('source');
      if (source) {
        source.src = video.dataset.src;
        video.load();
      }
    }

    video.addEventListener('loadeddata', () => {
      video.classList.add('loaded');
    });
  }

  loadAllImages() {
    document.querySelectorAll('img[loading="lazy"]').forEach(img => {
      if (img.dataset.src) {
        img.src = img.dataset.src;
        img.classList.add('loaded');
      }
    });
  }
}

// Sayfa yüklendiğinde lazy loader'ı başlat
(function() {
  function initLazyLoad() {
    try {
      new LazyLoader();
    } catch (error) {
      console.error('Lazy loading başlatılamadı:', error);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLazyLoad);
  } else {
    setTimeout(initLazyLoad, 50);
  }
})();

