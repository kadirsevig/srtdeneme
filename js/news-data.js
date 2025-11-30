(function () {
  class NewsDataLoader {
    constructor() {
      this.cache = null;
      this.apiUrl = 'api/news.php';
      this.isFileProtocol = window.location.protocol === 'file:';
    }

    async getAll(forceRefresh = false) {
      // forceRefresh true ise cache'i temizle
      if (forceRefresh) {
        this.cache = null;
      }
      
      if (Array.isArray(this.cache)) {
        return this.cache;
      }

      this.cache = await this.fetchNews();
      return this.cache;
    }

    async fetchNews() {
      // file:// protokolünde CORS kısıtlaması var
      if (this.isFileProtocol) {
        console.warn('⚠️ Haberler file:// protokolünde yüklenemiyor. Lütfen siteyi WAMP üzerinden açın: http://localhost/srt%20web/');
        return [];
      }

      try {
        // PHP API'den haberleri çek
        const response = await fetch(this.apiUrl + '?_=' + Date.now(), { 
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache'
          }
        });
        
        if (!response.ok) {
          throw new Error('API yanıt vermedi: ' + response.status);
        }
        
        const result = await response.json();
        
        if (result.success && Array.isArray(result.data)) {
          console.log('✅ Haberler API\'den yüklendi:', result.data.length, 'haber');
          return result.data;
        } else {
          console.error('API hata döndü:', result.error || 'Bilinmeyen hata');
          return [];
        }
      } catch (error) {
        console.error('❌ Haberler yüklenirken hata:', error);
        return [];
      }
    }

    /**
     * Cache'i temizle (yeni haber eklendiğinde kullanılır)
     */
    clearCache() {
      this.cache = null;
    }
  }

  window.NewsDataLoader = new NewsDataLoader();
})();
