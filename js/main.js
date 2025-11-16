function initApp() {
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!expanded));
      navLinks.setAttribute('aria-expanded', String(!expanded));
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
    heroSlideshowInterval = setInterval(updateHeroContent, 10000);
  } catch (error) {
    console.error('Hero slideshow başlatılamadı:', error);
  }
}


