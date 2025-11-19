// SEO iyileştirmeleri - Structured Data (Schema.org)
class SEOEnhancer {
  constructor() {
    this.init();
  }

  init() {
    this.addOrganizationSchema();
    this.addBreadcrumbSchema();
    this.addProductSchemas();
    this.addWebSiteSchema();
  }

  addOrganizationSchema() {
    const schema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "SRT Medikal",
      "url": window.location.origin,
      "logo": window.location.origin + "/logo.png",
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+90-342-335-02-00",
        "contactType": "customer service",
        "email": "info@srtmedikal.com",
        "areaServed": "TR",
        "availableLanguage": ["Turkish", "English"]
      },
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "BİNEVLER MAH. ABDULKADİR AKSU BLV. EFE REZİDANS APT. NO:47 AB/1",
        "addressLocality": "ŞAHİNBEY",
        "addressRegion": "GAZİANTEP",
        "addressCountry": "TR"
      },
      "sameAs": []
    };

    this.addSchema(schema);
  }

  addWebSiteSchema() {
    const schema = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "SRT Medikal",
      "url": window.location.origin,
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": window.location.origin + "/?q={search_term_string}"
        },
        "query-input": "required name=search_term_string"
      }
    };

    this.addSchema(schema);
  }

  addBreadcrumbSchema() {
    const breadcrumbItems = document.querySelectorAll('.breadcrumb-item');
    if (breadcrumbItems.length === 0) return;

    const items = Array.from(breadcrumbItems).map((item, index) => {
      const link = item.querySelector('.breadcrumb-link');
      const current = item.querySelector('.breadcrumb-current');
      
      return {
        "@type": "ListItem",
        "position": index + 1,
        "name": link ? link.textContent.trim() : (current ? current.textContent.trim() : ''),
        "item": link ? window.location.origin + '/' + link.getAttribute('href') : window.location.href
      };
    });

    const schema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": items
    };

    this.addSchema(schema);
  }

  addProductSchemas() {
    // Ürün sayfalarında ürün şemaları ekle
    const productCards = document.querySelectorAll('.model-card, .product-compact-card');
    
    productCards.forEach((card, index) => {
      const name = card.querySelector('.model-name, .product-compact-title')?.textContent;
      const description = card.querySelector('.model-meta, .product-compact-desc')?.textContent;
      const image = card.querySelector('img')?.src;
      const link = card.querySelector('a')?.href;

      if (name) {
        const schema = {
          "@context": "https://schema.org",
          "@type": "Product",
          "name": name,
          "description": description || name,
          "image": image || window.location.origin + "/logo.png",
          "url": link ? (link.startsWith('http') ? link : window.location.origin + '/' + link) : window.location.href,
          "brand": {
            "@type": "Brand",
            "name": name.includes('Mindray') ? 'Mindray' : (name.includes('Nova') ? 'Nova Biomedical' : 'SRT Medikal')
          },
          "offers": {
            "@type": "Offer",
            "availability": "https://schema.org/InStock",
            "priceCurrency": "TRY",
            "seller": {
              "@type": "Organization",
              "name": "SRT Medikal"
            }
          }
        };

        this.addSchema(schema, `product-${index}`);
      }
    });
  }

  addSchema(schema, id = null) {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema);
    if (id) {
      script.id = id;
    }
    document.head.appendChild(script);
  }
}

// Sayfa yüklendiğinde SEO iyileştirmelerini uygula
(function() {
  function initSEO() {
    try {
      new SEOEnhancer();
    } catch (error) {
      console.error('SEO iyileştirmeleri uygulanamadı:', error);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSEO);
  } else {
    setTimeout(initSEO, 100);
  }
})();

