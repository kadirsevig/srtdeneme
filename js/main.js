function initApp() {
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (navToggle && navLinks) {
    // Menü toggle fonksiyonu
    function toggleMenu() {
      const isOpen = navLinks.classList.contains('is-open');
      
      if (isOpen) {
        navLinks.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
        navLinks.setAttribute('aria-expanded', 'false');
      } else {
        navLinks.classList.add('is-open');
        navToggle.setAttribute('aria-expanded', 'true');
        navLinks.setAttribute('aria-expanded', 'true');
      }
    }

    // Buton tıklama eventi
    navToggle.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      toggleMenu();
    });

    // Dışarı tıklandığında menüyü kapat
    document.addEventListener('click', function(e) {
      if (navLinks.classList.contains('is-open')) {
        if (!navLinks.contains(e.target) && !navToggle.contains(e.target)) {
          navLinks.classList.remove('is-open');
          navToggle.setAttribute('aria-expanded', 'false');
          navLinks.setAttribute('aria-expanded', 'false');
        }
      }
    });

    // Menü linklerine tıklandığında menüyü kapat
    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', function() {
        navLinks.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
        navLinks.setAttribute('aria-expanded', 'false');
      });
    });
  }

  document.querySelectorAll('[data-form]').forEach((form) => {
    const successMessage = form.querySelector('.form-success');

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      form.reset();
      if (successMessage) {
        successMessage.hidden = false;
        setTimeout(() => {
          successMessage.hidden = true;
        }, 5000);
      }
    });
  });

  document.querySelectorAll('[data-model-toggle]').forEach((button) => {
    const targetSelector = button.getAttribute('data-model-toggle');
    const panel = document.querySelector(targetSelector);

    if (!panel) return;

    button.addEventListener('click', () => {
      const isOpen = panel.classList.contains('is-open');
      document.querySelectorAll('.model-panel.is-open').forEach((openPanel) => {
        openPanel.classList.remove('is-open');
        openPanel.hidden = true;
      });
      if (!isOpen) {
        panel.hidden = false;
        panel.classList.add('is-open');
        panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  renderTurkeyMap();
  initHeroSlideshow();
  initVideoModal();
  initVideoAccordion();
}

// Hem DOMContentLoaded hem de window.onload'da çalıştır
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

// Ek güvenlik için window.onload'da da çalıştır
window.addEventListener('load', () => {
  // Hero slideshow çalışmıyorsa tekrar dene
  const hero = document.querySelector('.hero-home');
  const heroTitle = document.getElementById('hero-title');
  if (hero && heroTitle && heroSlideshowInterval === null) {
    // Eğer başlık hala varsayılan metindeyse slideshow çalışmamış demektir
    const defaultTitle = 'Laboratuvar ve Yoğun Bakım Çözümlerinde Güvenilir İş Ortağınız';
    if (heroTitle.textContent === defaultTitle) {
      initHeroSlideshow();
    }
  }
});


function renderTurkeyMap() {
  const mapPanel = document.querySelector('[data-turkey-map]');
  if (!mapPanel || typeof d3 === 'undefined') {
    return;
  }

  const loadingOverlay = mapPanel.querySelector('.map-loading');
  // Aktif şehirler listesi - hem orijinal isim hem slug hem de normalize edilmiş isimleri tut
  const activeProvincesRaw = (mapPanel.dataset.activeProvinces || '')
    .split(',')
    .map(p => p.trim())
    .filter(Boolean);
  
  // Her aktif şehir için slug ve normalize edilmiş versiyonlar oluştur
  const activeProvincesData = activeProvincesRaw.map(province => {
    const slug = slugifyProvince(province);
    const normalized = province
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, '');
    
    return {
      original: province,
      slug: slug,
      normalized: normalized
    };
  });
  

  const mapWidth = mapPanel.clientWidth || 960;
  const mapHeight = Math.max(400, Math.round(mapWidth * 0.42));

  fetch('https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/turkey.geojson')
    .then((response) => {
      if (!response.ok) {
        throw new Error('Harita verisi alınamadı');
      }
      return response.json();
    })
    .then((geojson) => {
      mapPanel.classList.add('is-ready');
      mapPanel.classList.remove('is-error');

      const projection = d3.geoMercator().fitSize([mapWidth, mapHeight], geojson);
      const geoPath = d3.geoPath(projection);
      

      const svg = d3
        .select(mapPanel)
        .append('svg')
        .attr('viewBox', `0 0 ${mapWidth} ${mapHeight}`)
        .attr('role', 'img')
        .attr('aria-label', 'Türkiye iller haritası');

      const provincesGroup = svg.append('g').attr('class', 'turkey-provinces');

      const provincesPaths = provincesGroup
        .selectAll('path')
        .data(geojson.features)
        .join('path')
        .attr('d', geoPath)
        .attr('data-province', (feature) => feature.properties.name)
        .attr('class', (feature) => {
          const provinceName = feature.properties.name;
          const slug = slugifyProvince(provinceName);
          const classes = ['province', `province-${slug}`];
          
          // Çoklu eşleştirme yöntemi - her şehir için tüm yöntemleri dene
          let isActive = false;
          
          // 1. Orijinal isim ile direkt eşleşme (case-insensitive, trim)
          const provinceNameLower = provinceName.toLowerCase().trim();
          isActive = activeProvincesRaw.some(active => 
            active.toLowerCase().trim() === provinceNameLower
          );
          
          // 2. Slug ile eşleşme
          if (!isActive) {
            isActive = activeProvincesData.some(activeData => activeData.slug === slug);
          }
          
          // 3. Normalize edilmiş isim ile eşleşme
          if (!isActive) {
            const normalizedName = provinceName
              .toLowerCase()
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .replace(/[^\w\s]/g, '')
              .replace(/\s+/g, '');
            
            isActive = activeProvincesData.some(activeData => {
              if (activeData.normalized === normalizedName) return true;
              
              // Kahramanmaraş için özel kontrol - kısmi eşleşme
              if (normalizedName.includes('kahramanmaras') || normalizedName === 'kahramanmaras') {
                if (activeData.normalized.includes('kahramanmaras') || 
                    activeData.normalized.includes('kmaras') ||
                    activeData.original.toLowerCase().includes('kahraman') ||
                    activeData.original.toLowerCase().includes('maraş')) {
                  return true;
                }
              }
              
              return false;
            });
          }
          
          // 4. Kahramanmaraş için özel manuel kontrol
          if (!isActive) {
            const provinceLower = provinceName.toLowerCase();
            if (provinceLower.includes('kahraman') || provinceLower.includes('maraş') || 
                provinceLower.includes('maras')) {
              isActive = activeProvincesRaw.some(active => {
                const activeLower = active.toLowerCase();
                return activeLower.includes('kahraman') || 
                       activeLower.includes('maraş') || 
                       activeLower.includes('maras') ||
                       activeLower.includes('k.maraş') ||
                       activeLower.includes('k.maras');
              });
            }
          }
          
          if (isActive) {
            classes.push('is-active');
          }
          return classes.join(' ');
        })
        .each(function appendTitle(feature) {
          d3.select(this).append('title').text(feature.properties.name);
        });

      // Tüm şehirler için isim etiketleri ekle
      const labelsGroup = svg.append('g').attr('class', 'province-labels');
      
      provincesPaths.each(function() {
        const feature = d3.select(this).datum();
        const provinceName = feature.properties.name;
        const slug = slugifyProvince(provinceName);
        
        // Bu şehir aktif mi kontrol et
        let isActive = false;
        
        // 1. Orijinal isim ile direkt eşleşme (case-insensitive, trim)
        const provinceNameLower = provinceName.toLowerCase().trim();
        isActive = activeProvincesRaw.some(active => 
          active.toLowerCase().trim() === provinceNameLower
        );
        
        // 2. Slug ile eşleşme
        if (!isActive) {
          isActive = activeProvincesData.some(activeData => activeData.slug === slug);
        }
        
        // 3. Normalize edilmiş isim ile eşleşme
        if (!isActive) {
          const normalizedName = provinceName
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^\w\s]/g, '')
            .replace(/\s+/g, '');
          
          isActive = activeProvincesData.some(activeData => {
            if (activeData.normalized === normalizedName) return true;
            
            // Kahramanmaraş için özel kontrol - kısmi eşleşme
            if (normalizedName.includes('kahramanmaras') || normalizedName === 'kahramanmaras') {
              if (activeData.normalized.includes('kahramanmaras') || 
                  activeData.normalized.includes('kmaras') ||
                  activeData.original.toLowerCase().includes('kahraman') ||
                  activeData.original.toLowerCase().includes('maraş')) {
                return true;
              }
            }
            
            return false;
          });
        }
        
        // 4. Kahramanmaraş için özel manuel kontrol
        if (!isActive) {
          const provinceLower = provinceName.toLowerCase();
          if (provinceLower.includes('kahraman') || provinceLower.includes('maraş') || 
              provinceLower.includes('maras')) {
            isActive = activeProvincesRaw.some(active => {
              const activeLower = active.toLowerCase();
              return activeLower.includes('kahraman') || 
                     activeLower.includes('maraş') || 
                     activeLower.includes('maras') ||
                     activeLower.includes('k.maraş') ||
                     activeLower.includes('k.maras');
            });
          }
        }
        
        // Etiket ekle
        const centroid = geoPath.centroid(feature);
        if (centroid && !isNaN(centroid[0]) && !isNaN(centroid[1])) {
          const displayName = getDisplayName(feature.properties.name);
          const labelClass = isActive ? 'province-label province-label-active' : 'province-label province-label-inactive';
          
          labelsGroup
            .append('text')
            .attr('x', centroid[0])
            .attr('y', centroid[1])
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .attr('class', labelClass)
            .text(displayName);
        }
        });

      if (loadingOverlay) {
        loadingOverlay.remove();
      }
    })
    .catch((error) => {
      console.error('Harita yüklemesi başarısız:', error);
      mapPanel.classList.add('is-error');
      if (loadingOverlay) {
        loadingOverlay.textContent = 'Harita verisi yüklenemedi.';
        loadingOverlay.classList.add('map-error');
      } else {
        const errorNode = document.createElement('div');
        errorNode.className = 'map-error';
        errorNode.textContent = 'Harita verisi yüklenemedi.';
        mapPanel.appendChild(errorNode);
      }
    });
}

function slugifyProvince(value) {
  return value
    .toString()
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w]+/g, '-');
}

function getDisplayName(provinceName) {
  // Şehir isimlerini haritada gösterirken kısaltılmış versiyonlarını kullan
  const displayNames = {
    'Kahramanmaraş': 'K.Maraş',
    'Kahramanmaras': 'K.Maraş',
    'k.maraş': 'K.Maraş',
    'k.maras': 'K.Maraş'
  };
  
  const normalized = provinceName
    .toString()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
  
  // Tam eşleşme kontrolü
  for (const [key, value] of Object.entries(displayNames)) {
    if (normalized === key.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()) {
      return value;
    }
  }
  
  // Kahramanmaraş için özel kontrol
  if (normalized.includes('kahramanmaras')) {
    return 'K.Maraş';
  }
  
  return provinceName;
}

let heroSlideshowInterval = null;

function initHeroSlideshow() {
  // Zaten çalışıyorsa tekrar başlatma
  if (heroSlideshowInterval !== null) {
    return;
  }

  const hero = document.querySelector('.hero-home');
  if (!hero) {
    console.warn('Hero section bulunamadı');
    return;
  }

  const heroTitle = document.getElementById('hero-title');
  const heroSubtitle = document.getElementById('hero-subtitle');
  
  if (!heroTitle || !heroSubtitle) {
    console.warn('Hero title veya subtitle bulunamadı');
    return;
  }

  const heroContent = [
    {
      image: 'https://www.mindray.com/content/dam/xpace/en/products-solutions/products/laboratory-diagnostics/hematology/medium-test-volume/bc-6000/glp18-s3.jpg',
      title: 'Hematoloji Çözümleri',
      subtitle: 'Mindray BC-6000 ile 6-diff CBC ve NRBC ölçümü. Yoğun laboratuvarlar için yüksek verimlilik ve güvenilirlik.',
      icon: '🔬',
      shortDesc: '6-diff CBC'
    },
    {
      image: 'https://www.novabiomedical.com/prime-plus-critical-care-blood-gas-analyzer/img/Critical_Care_Blood_Gas_Analyzer.jpg',
      title: 'Kan Gazı Analiz Sistemleri',
      subtitle: 'Stat Profile Prime Plus ile 90 saniyede kapsamlı kritik bakım paneli. Otomatik sıvı QC desteği ile kesintisiz operasyon.',
      icon: '💉',
      shortDesc: '90 saniye'
    },
    {
      image: 'https://www.mindray.com/content/dam/xpace/en/products-solutions/products/laboratory-diagnostics/chemistry/medium-test-volume/bs-600m/bs-600m-fig2-pc.jpg',
      title: 'Biyokimya Analiz Platformları',
      subtitle: 'Mindray BS-600M ile modüler tasarım ve düşük reaktif tüketimi. Verimli laboratuvar operasyonları için ideal çözüm.',
      icon: '🧪',
      shortDesc: 'Modüler'
    },
    {
      image: 'https://static.wixstatic.com/media/48ddcc_31ad8bd85962411aba14ca8b6271fc6b~mv2.jpg/v1/crop/x_0,y_85,w_2560,h_1429/fill/w_1210,h_678,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/TRIchem-FRONT.jpg',
      title: 'İdrar Analiz Çözümleri',
      subtitle: 'Tam otomatik idrar mikroskopisi ve kimyasal analiz sistemleri. Hızlı ve güvenilir sonuçlar için gelişmiş teknoloji.',
      icon: '🔍',
      shortDesc: 'Tam Otomatik'
    },
    {
      image: 'https://www.mindray.com/content/dam/xpace/en/products-solutions/products/laboratory-diagnostics/chemistry/large-test-volume/bs-2000m/glp29-s1-web.jpg',
      title: 'Yüksek Hacimli Biyokimya',
      subtitle: 'Mindray BS-2000M ile yüksek hacimli laboratuvarlar için gelişmiş biyokimya analizi. Tam otomatik işlem ve yüksek verimlilik.',
      icon: '🧪',
      shortDesc: 'Yüksek Hacim'
    },
    {
      image: 'https://www.mindray.com/content/dam/xpace/en/products-solutions/products/laboratory-diagnostics/chemiluminescence-immunoassay/large-test-volume/sal-6000/glp96-s2.jpg',
      title: 'Entegre Laboratuvar Sistemleri',
      subtitle: 'SAL 6000 ile kimya ve immünoassay entegrasyonu. Yüksek hacimli laboratuvarlar için ideal çözüm ve otomasyon.',
      icon: '⚙️',
      shortDesc: 'Entegre Sistem'
    },
    {
      image: 'https://www.succeeder.com/uploads/SF9200_20220713095902.jpg',
      title: 'Koagülasyon Analizörleri',
      subtitle: 'Succeeder SF-9200 ile tam otomatik pıhtılaşma analizi. Büyük düzey laboratuvarlar için yüksek kapasiteli sistem ve geniş test menüsü.',
      icon: '🩸',
      shortDesc: 'Tam Otomatik'
    },
    {
      image: 'https://www.mindray.com/content/dam/xpace/en/products-solutions/products/laboratory-diagnostics/chemiluminescence-immunoassay/large-test-volume/cl-6000i/glp60-s2.jpg',
      title: 'Hormon Çözümleri',
      subtitle: 'Mindray CL-6000i kemilüminesans immünoassay analizörü. Yüksek test hacmi laboratuvarlar için tam otomatik ve güvenilir sonuçlar.',
      icon: '📊',
      shortDesc: 'Yüksek Hacim'
    },
    {
      image: 'https://www.novabiomedical.com/statstrip-new-gen/img/stat-glu-new-gen_2.jpg',
      title: 'Hospital Glukoz/Keton Metre',
      subtitle: 'StatStrip Yeni Nesil ile Linux tabanlı işletim sistemi ve gelişmiş siber güvenlik. Tüm kritik hasta örnekleri için FDA onaylı tek glukoz metre.',
      icon: '📱',
      shortDesc: 'FDA Onaylı'
    },
    {
      image: 'https://static.wixstatic.com/media/48ddcc_e982a02749e948119611a377b3e0fdd2~mv2.jpg/v1/fill/w_720,h_450,al_c,lg_1,q_80,enc_avif,quality_auto/48ddcc_e982a02749e948119611a377b3e0fdd2~mv2.jpg',
      title: 'İdrar Mikroskopisi Analizörü',
      subtitle: 'TRIsed-200 ile yapay zeka destekli tam otomatik idrar mikroskopisi. Akış hücresi teknolojisi ve 120 test/saat kapasitesi.',
      icon: '🔬',
      shortDesc: 'AI Destekli'
    }
  ];

  // Hero slideshow - yeni yapıya uygun
  let heroIndex = 0;
  const slideDuration = 4000; // 4 saniye - daha tutarlı geçiş için
  const fadeDuration = 600; // Fade süresi
  window.carouselRotateFn = null;
  let isTransitioning = false; // Geçiş sırasında çakışmayı önlemek için

  const updateHeroContent = (targetIndex = null) => {
    if (!heroTitle || !heroSubtitle || isTransitioning) return;
    
    // Eğer targetIndex belirtilmişse onu kullan, yoksa heroIndex'i artır
    if (targetIndex !== null) {
      heroIndex = targetIndex;
    } else {
      heroIndex = (heroIndex + 1) % heroContent.length;
    }
    
    isTransitioning = true;

    // Fade out
    heroTitle.style.transition = `opacity ${fadeDuration}ms ease, transform ${fadeDuration}ms ease`;
    heroSubtitle.style.transition = `opacity ${fadeDuration}ms ease, transform ${fadeDuration}ms ease`;
    heroTitle.style.opacity = '0';
    heroTitle.style.transform = 'translateY(20px)';
    heroSubtitle.style.opacity = '0';
    heroSubtitle.style.transform = 'translateY(15px)';

    setTimeout(() => {
      const content = heroContent[heroIndex];
      
      // İçeriği güncelle
      const titleMain = heroTitle.querySelector('.title-main');
      if (titleMain) {
        titleMain.textContent = content.title;
      }
      heroSubtitle.textContent = content.subtitle;

      // Carousel'i güncelle - slideshow ile senkronize
      if (window.setCarouselActiveIndex) {
        window.setCarouselActiveIndex(heroIndex);
      }

      // Fade in
      setTimeout(() => {
        heroTitle.style.opacity = '1';
        heroTitle.style.transform = 'translateY(0)';
        heroSubtitle.style.opacity = '1';
        heroSubtitle.style.transform = 'translateY(0)';
        
        setTimeout(() => {
          isTransitioning = false;
        }, fadeDuration);
      }, 50);
    }, fadeDuration);
  };

    // İlk içeriği ayarla
  try {
    const firstContent = heroContent[0];
    const titleMain = heroTitle?.querySelector('.title-main');
    if (titleMain) {
      titleMain.textContent = firstContent.title;
    }
    if (heroSubtitle) {
      heroSubtitle.textContent = firstContent.subtitle;
    }
    heroIndex = 0;
    
    // İlk kartı aktif yap
    setTimeout(() => {
      if (window.setCarouselActiveIndex) {
        window.setCarouselActiveIndex(0);
      }
    }, 1000);
    
    // Slideshow'u başlat - tek merkezi kontrol
    setTimeout(() => {
      heroSlideshowInterval = setInterval(() => {
        if (!isTransitioning) {
          updateHeroContent();
        }
      }, slideDuration);
    }, 2500);
  } catch (error) {
    console.error('Hero slideshow başlatılamadı:', error);
  }

  // Menü öğelerine hover efekti ekle (hero üzerinde değilse çalışmaz)
  const navLinks = document.querySelectorAll('.nav-links a[data-hero-image]');
  if (navLinks.length > 0) {
    let hoverTimeout = null;
    let changeTimeout = null;
    let currentHoverIndex = null;
    let isHovering = false;

    navLinks.forEach((link) => {
    link.addEventListener('mouseenter', () => {
      isHovering = true;
      
      // Eğer zaten hover yapılmışsa, sadece timeout'u iptal et
      if (changeTimeout) {
        clearTimeout(changeTimeout);
      }
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }

      const imageIndex = parseInt(link.getAttribute('data-hero-image'), 10);
      
      // Aynı resme geçiş yapıyorsak işlem yapma
      if (currentHoverIndex === imageIndex) {
        return;
      }
      
      if (imageIndex >= 0 && imageIndex < heroContent.length) {
        // Otomatik geçişi durdur
        if (heroSlideshowInterval) {
          clearInterval(heroSlideshowInterval);
          heroSlideshowInterval = null;
        }

        // Kısa bir gecikme ile değişikliği yap (hızlı geçişlerde animasyon olmasın)
        changeTimeout = setTimeout(() => {
          if (!isHovering) return;
          
          currentHoverIndex = imageIndex;
          const content = heroContent[imageIndex];
          
          // Başlık ve alt başlığı güncelle
          if (heroTitle) {
            heroTitle.style.opacity = '0';
            heroTitle.style.transform = 'translateY(10px)';
            setTimeout(() => {
              const titleMain = heroTitle.querySelector('.title-main');
              if (titleMain) {
                titleMain.textContent = content.title;
              }
              heroTitle.style.opacity = '1';
              heroTitle.style.transform = 'translateY(0)';
            }, 100);
          }
          
          if (heroSubtitle) {
            heroSubtitle.style.opacity = '0';
            heroSubtitle.style.transform = 'translateY(8px)';
            setTimeout(() => {
              heroSubtitle.textContent = content.subtitle;
              heroSubtitle.style.opacity = '1';
              heroSubtitle.style.transform = 'translateY(0)';
            }, 150);
          }
        }, 150); // Kısa bir gecikme ile animasyonu başlat
      }
    });

    link.addEventListener('mouseleave', () => {
      isHovering = false;
      currentHoverIndex = null;
      
      // Hover timeout'ları temizle
      if (changeTimeout) {
        clearTimeout(changeTimeout);
        changeTimeout = null;
      }
      
      // Tüm menülerden çıkıldığında slideshow'a dön
      hoverTimeout = setTimeout(() => {
        if (!isHovering) {
          // Otomatik geçişi yeniden başlat
          if (!heroSlideshowInterval) {
            heroSlideshowInterval = setInterval(updateHeroContent, slideDuration);
          }
        }
      }, 800);
    });
    });
  }

  // Scroll indicator click handler
  const scrollIndicator = document.querySelector('.hero-scroll-modern');
  if (scrollIndicator) {
    scrollIndicator.addEventListener('click', () => {
      const nextSection = document.querySelector('.hero-home').nextElementSibling;
      if (nextSection) {
        nextSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // Animasyonlu sayılar (Count-up)
  function animateNumbers() {
    const statNumbers = document.querySelectorAll('.stat-number-modern[data-count]');
    
    const observerOptions = {
      threshold: 0.5,
      rootMargin: '0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
          entry.target.classList.add('animated');
          const target = parseInt(entry.target.getAttribute('data-count'), 10);
          const duration = 2000;
          const increment = target / (duration / 16);
          let current = 0;

          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              current = target;
              clearInterval(timer);
            }
            entry.target.textContent = Math.floor(current);
          }, 16);
        }
      });
    }, observerOptions);

    statNumbers.forEach(stat => observer.observe(stat));
  }


  // Parallax scrolling - kaldırıldı, hero sabit kalacak

  // Ürün kartlarını elips şeklinde oluştur
  function createProductCards() {
    const container = document.getElementById('product-cards-container');
    if (!container) return;

    const totalCards = heroContent.length;

    heroContent.forEach((product, index) => {
      const card = document.createElement('div');
      card.className = `floating-card product-card card-${index + 1}`;
      card.setAttribute('data-product-index', index);
      
      // Kartlar merkeze yerleştirilecek, stack yapısı JavaScript'te ayarlanacak
      card.style.left = '50%';
      card.style.top = '50%';
      card.style.marginLeft = '-230px'; // Kart genişliğinin yarısı (460px / 2)
      card.style.marginTop = '-190px'; // Kart yüksekliğinin yarısı (380px / 2) - merkeze hizala
      
      card.innerHTML = `
        <div class="card-image-wrapper">
          <img src="${product.image}" alt="${product.title}" class="card-image" loading="eager" onerror="this.onerror=null; this.src='https://www.mindray.com/content/dam/xpace/en/products-solutions/products/laboratory-diagnostics/chemistry/medium-test-volume/bs-600m/bs-600m-fig2-pc.jpg';" />
          <div class="card-image-overlay"></div>
        </div>
      `;
      
      // Resim yükleme kontrolü
      const img = card.querySelector('.card-image');
      img.addEventListener('error', function() {
        console.warn(`Resim yüklenemedi: ${product.image} - ${product.title}`);
        // Alternatif resim dene
        if (this.src !== 'https://www.mindray.com/content/dam/xpace/en/products-solutions/products/laboratory-diagnostics/chemistry/medium-test-volume/bs-600m/bs-600m-fig2-pc.jpg') {
          this.src = 'https://www.mindray.com/content/dam/xpace/en/products-solutions/products/laboratory-diagnostics/chemistry/medium-test-volume/bs-600m/bs-600m-fig2-pc.jpg';
        }
      });

      container.appendChild(card);
    });

    // Modern Card Stack - kartlar üst üste, en üstteki öne çıkar
    let currentActiveIndex = 0;
    const stackOffset = 15; // Her kart arası offset
    const maxVisibleCards = 5; // Maksimum görünen kart sayısı
    
    // Aktif index'i dışarıdan set etme fonksiyonu
    window.setCarouselActiveIndex = (index) => {
      currentActiveIndex = index;
      updateCardStack();
    };
    
    function updateCardStack() {
      const cards = container.querySelectorAll('.product-card');
      
      cards.forEach((card, index) => {
        const distance = Math.abs(index - currentActiveIndex);
        const isActive = index === currentActiveIndex;
        const isBehind = index < currentActiveIndex;
        
        // Sadece yakındaki kartları göster
        if (distance > maxVisibleCards) {
          card.style.opacity = '0';
          card.style.pointerEvents = 'none';
          card.style.transform = 'translateY(100px) scale(0.8)';
          return;
        }
        
        card.style.opacity = '1';
        card.style.pointerEvents = 'auto';
        
        // Z-index: aktif kart en üstte
        if (isActive) {
          card.style.zIndex = totalCards + 10;
          card.classList.add('active');
        } else {
          card.style.zIndex = totalCards - distance;
          card.classList.remove('active');
        }
        
        // Pozisyon: kartlar üst üste, aktif kart önde
        const offsetY = distance * stackOffset;
        const offsetX = (index - currentActiveIndex) * 8;
        const scale = isActive ? 1 : 0.85 - (distance * 0.05);
        const opacity = isActive ? 1 : 0.6 - (distance * 0.1);
        
        card.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
        card.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
        card.style.opacity = Math.max(opacity, 0.3);
      });
    }
    
    // Global fonksiyon (geriye dönük uyumluluk için)
    window.carouselRotateFn = (index) => {
      currentActiveIndex = index;
      updateCardStack();
    };
    
    // İlk pozisyonu ayarla
    updateCardStack();
    
    // Kart tıklama - hero slideshow ile senkronize
    const cards = container.querySelectorAll('.product-card');
    cards.forEach((card, index) => {
      card.addEventListener('click', () => {
        // Mevcut interval'ı temizle
        if (heroSlideshowInterval) {
          clearInterval(heroSlideshowInterval);
          heroSlideshowInterval = null;
        }
        
        // Kartı ve hero içeriğini güncelle
        currentActiveIndex = index;
        updateCardStack();
        updateHeroContent(index);
        
        // Interval'ı yeniden başlat
        setTimeout(() => {
          heroSlideshowInterval = setInterval(() => {
            if (!isTransitioning) {
              updateHeroContent();
            }
          }, slideDuration);
        }, slideDuration);
      });
    });
  }

  // Sayfa yüklendiğinde başlat
  setTimeout(() => {
    createProductCards();
  }, 500);
}

function initVideoAccordion() {
  const accordionButtons = document.querySelectorAll('.video-accordion-button');
  
  accordionButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const isExpanded = button.getAttribute('aria-expanded') === 'true';
      const content = button.nextElementSibling;
      const video = content?.querySelector('video');
      
      // Tüm accordion'ları kapat
      accordionButtons.forEach((btn) => {
        if (btn !== button) {
          btn.setAttribute('aria-expanded', 'false');
          const otherContent = btn.nextElementSibling;
          const otherVideo = otherContent?.querySelector('video');
          if (otherVideo) {
            otherVideo.pause();
            otherVideo.currentTime = 0;
          }
        }
      });
      
      // Mevcut accordion'u aç/kapat
      if (isExpanded) {
        button.setAttribute('aria-expanded', 'false');
        if (video) {
          video.pause();
          video.currentTime = 0;
        }
      } else {
        button.setAttribute('aria-expanded', 'true');
      }
    });
  });
  
  // Video kaynaklarını URL encode et
  const videoSources = document.querySelectorAll('.video-accordion-content video source');
  videoSources.forEach((source) => {
    const originalSrc = source.getAttribute('src');
    if (originalSrc && originalSrc.includes(' ')) {
      const encodedSrc = originalSrc.replace(/ /g, '%20');
      source.setAttribute('src', encodedSrc);
      const video = source.closest('video');
      if (video) {
        video.load();
      }
    }
  });
}

function initVideoModal() {
  // Video kaynaklarını URL encode et (sadece boşlukları)
  const videoSources = document.querySelectorAll('.video-card video source');
  videoSources.forEach((source) => {
    const originalSrc = source.getAttribute('src');
    if (originalSrc && originalSrc.includes(' ')) {
      // Dosya adındaki boşlukları %20 ile değiştir
      const encodedSrc = originalSrc.replace(/ /g, '%20');
      source.setAttribute('src', encodedSrc);
      // Video elementinin src'sini de güncelle
      const video = source.closest('video');
      if (video) {
        video.load(); // Video kaynağını yeniden yükle
      }
    }
  });

  const videoCards = document.querySelectorAll('.video-card');

  // Video kartlarına tıklama eventi ekle
  videoCards.forEach((card) => {
    const video = card.querySelector('video');
    const overlay = card.querySelector('.video-play-overlay');
    const thumbnail = card.querySelector('.video-card-thumbnail');
    
    if (!video || !overlay) return;

    // Overlay'e tıklandığında
    overlay.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      // Overlay'i gizle
      overlay.style.display = 'none';
      overlay.style.pointerEvents = 'none';
      
      // Video'yu göster
      video.style.opacity = '1';
      video.style.zIndex = '10';
      
      // Video'yu oynat
      const playPromise = video.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            // Video başarıyla oynatıldı
            card.classList.add('is-playing');
          })
          .catch(err => {
            console.error('Video oynatılamadı:', err);
            // Hata durumunda overlay'i geri göster
            overlay.style.display = 'flex';
            overlay.style.pointerEvents = 'auto';
          });
      }
    });

    // Video oynatıldığında overlay'i gizle ve playing class'ı ekle
    video.addEventListener('play', () => {
      video.classList.add('playing');
      card.classList.add('is-playing');
      video.style.opacity = '1';
      video.style.zIndex = '10';
      overlay.style.display = 'none';
      overlay.style.pointerEvents = 'none';
    });

    // Video duraklatıldığında overlay'i göster
    video.addEventListener('pause', () => {
      if (video.currentTime > 0 && !video.ended) {
        video.classList.remove('playing');
        card.classList.remove('is-playing');
        overlay.style.display = 'flex';
        overlay.style.pointerEvents = 'auto';
        overlay.style.zIndex = '2';
      }
    });

    // Video başlangıca döndüğünde overlay'i göster
    video.addEventListener('ended', () => {
      video.classList.remove('playing');
      card.classList.remove('is-playing');
      overlay.style.display = 'flex';
      overlay.style.pointerEvents = 'auto';
      overlay.style.zIndex = '2';
    });

    // Video yüklendiğinde kontrollerin görünür olmasını sağla
    video.addEventListener('loadedmetadata', () => {
      video.style.pointerEvents = 'auto';
    });
  });
}


