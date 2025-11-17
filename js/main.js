function initApp() {
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      const newState = !expanded;
      navToggle.setAttribute('aria-expanded', String(newState));
      navLinks.setAttribute('aria-expanded', String(newState));
      
      // Debug için
      console.log('Menu toggled:', newState);
    });

    // Dışarı tıklandığında menüyü kapat
    document.addEventListener('click', (e) => {
      if (navLinks.getAttribute('aria-expanded') === 'true') {
        if (!navLinks.contains(e.target) && !navToggle.contains(e.target)) {
          navToggle.setAttribute('aria-expanded', 'false');
          navLinks.setAttribute('aria-expanded', 'false');
        }
      }
    });

    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
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
      subtitle: 'Mindray BC-6000 ile 6-diff CBC ve NRBC ölçümü. Yoğun laboratuvarlar için yüksek verimlilik ve güvenilirlik.'
    },
    {
      image: 'https://www.novabiomedical.com/prime-plus-critical-care-blood-gas-analyzer/img/Critical_Care_Blood_Gas_Analyzer.jpg',
      title: 'Kan Gazı Analiz Sistemleri',
      subtitle: 'Stat Profile Prime Plus ile 90 saniyede kapsamlı kritik bakım paneli. Otomatik sıvı QC desteği ile kesintisiz operasyon.'
    },
    {
      image: 'https://www.mindray.com/content/dam/xpace/en/products-solutions/products/laboratory-diagnostics/chemistry/medium-test-volume/bs-600m/bs-600m-fig2-pc.jpg',
      title: 'Biyokimya Analiz Platformları',
      subtitle: 'Mindray BS-600M ile modüler tasarım ve düşük reaktif tüketimi. Verimli laboratuvar operasyonları için ideal çözüm.'
    },
    {
      image: 'https://static.wixstatic.com/media/48ddcc_31ad8bd85962411aba14ca8b6271fc6b~mv2.jpg/v1/crop/x_0,y_85,w_2560,h_1429/fill/w_1210,h_678,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/TRIchem-FRONT.jpg',
      title: 'İdrar Analiz Çözümleri',
      subtitle: 'Tam otomatik idrar mikroskopisi ve kimyasal analiz sistemleri. Hızlı ve güvenilir sonuçlar için gelişmiş teknoloji.'
    },
    {
      image: 'https://www.mindray.com/content/dam/xpace/en/products-solutions/products/laboratory-diagnostics/chemistry/medium-test-volume/bs-480/glp38-s1-web.jpg',
      title: 'Klinik Kimya Analizörleri',
      subtitle: 'Mindray BS-480 ile orta hacimli laboratuvarlar için optimize edilmiş performans ve güvenilirlik. Saatte 300 test kapasitesi.'
    },
    {
      image: 'https://www.mindray.com/content/dam/xpace/en/products-solutions/products/laboratory-diagnostics/chemiluminescence-immunoassay/large-test-volume/sal-6000/glp96-s2.jpg',
      title: 'Entegre Laboratuvar Sistemleri',
      subtitle: 'SAL 6000 ile kimya ve immünoassay entegrasyonu. Yüksek hacimli laboratuvarlar için ideal çözüm ve otomasyon.'
    },
    {
      image: 'https://www.succeeder.com/uploads/SF9200_20220713095902.jpg',
      title: 'Koagülasyon Analizörleri',
      subtitle: 'Succeeder SF-9200 ile tam otomatik pıhtılaşma analizi. Büyük düzey laboratuvarlar için yüksek kapasiteli sistem ve geniş test menüsü.'
    },
    {
      image: 'https://www.mindray.com/content/dam/xpace/en/products-solutions/products/laboratory-diagnostics/chemiluminescence-immunoassay/large-test-volume/cl-6000i/glp60-s2.jpg',
      title: 'Hormon Çözümleri',
      subtitle: 'Mindray CL-6000i kemilüminesans immünoassay analizörü. Yüksek test hacmi laboratuvarlar için tam otomatik ve güvenilir sonuçlar.'
    },
    {
      image: 'https://www.novabiomedical.com/statstrip-new-gen/img/stat-glu-new-gen_2.jpg',
      title: 'Hospital Glukoz/Keton Metre',
      subtitle: 'StatStrip Yeni Nesil ile Linux tabanlı işletim sistemi ve gelişmiş siber güvenlik. Tüm kritik hasta örnekleri için FDA onaylı tek glukoz metre.'
    },
    {
      image: 'https://static.wixstatic.com/media/48ddcc_e982a02749e948119611a377b3e0fdd2~mv2.jpg/v1/fill/w_720,h_450,al_c,lg_1,q_80,enc_avif,quality_auto/48ddcc_e982a02749e948119611a377b3e0fdd2~mv2.jpg',
      title: 'İdrar Mikroskopisi Analizörü',
      subtitle: 'TRIsed-200 ile yapay zeka destekli tam otomatik idrar mikroskopisi. Akış hücresi teknolojisi ve 120 test/saat kapasitesi.'
    }
  ];

  let heroIndex = 0;
  const fadeDuration = 1000;

  const updateHeroContent = () => {
    hero.style.setProperty('--hero-photo-opacity', '0');
    if (heroTitle) {
      heroTitle.style.opacity = '0';
      heroTitle.style.transform = 'translateY(20px)';
    }
    if (heroSubtitle) {
      heroSubtitle.style.opacity = '0';
      heroSubtitle.style.transform = 'translateY(15px)';
    }

    setTimeout(() => {
      const content = heroContent[heroIndex];
      hero.style.setProperty('--hero-photo', `url('${content.image}')`);
      hero.style.setProperty('--hero-photo-opacity', '1');

      if (heroTitle) {
        heroTitle.textContent = content.title;
        setTimeout(() => {
          heroTitle.style.opacity = '1';
          heroTitle.style.transform = 'translateY(0)';
        }, 150);
      }
      if (heroSubtitle) {
        heroSubtitle.textContent = content.subtitle;
        setTimeout(() => {
          heroSubtitle.style.opacity = '1';
          heroSubtitle.style.transform = 'translateY(0)';
        }, 250);
      }

      heroIndex = (heroIndex + 1) % heroContent.length;
    }, fadeDuration);
  };

  // İlk görüntüyü hemen ayarla
  try {
    const firstContent = heroContent[0];
    hero.style.setProperty('--hero-photo', `url('${firstContent.image}')`);
    hero.style.setProperty('--hero-photo-opacity', '1');
    if (heroTitle) heroTitle.textContent = firstContent.title;
    if (heroSubtitle) heroSubtitle.textContent = firstContent.subtitle;
    heroIndex = 1;
    
    // İlk geçişi başlat
    setTimeout(updateHeroContent, 1200);
    heroSlideshowInterval = setInterval(updateHeroContent, 5000);
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
          
          // Daha yumuşak geçiş
          hero.style.setProperty('--hero-photo-opacity', '0');
          
          setTimeout(() => {
            hero.style.setProperty('--hero-photo', `url('${content.image}')`);
            hero.style.setProperty('--hero-photo-opacity', '1');
            
            if (heroTitle) {
              heroTitle.style.opacity = '0';
              heroTitle.style.transform = 'translateY(10px)';
              setTimeout(() => {
                heroTitle.textContent = content.title;
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
          }, 200);
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
            heroSlideshowInterval = setInterval(updateHeroContent, 5000);
          }
        }
      }, 800);
    });
    });
  }

  // Scroll indicator click handler
  const scrollIndicator = document.querySelector('.hero-scroll-indicator');
  if (scrollIndicator) {
    scrollIndicator.addEventListener('click', () => {
      const nextSection = document.querySelector('.hero-home').nextElementSibling;
      if (nextSection) {
        nextSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }
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


