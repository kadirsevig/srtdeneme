document.addEventListener('DOMContentLoaded', () => {
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
});


function renderTurkeyMap() {
  const mapPanel = document.querySelector('[data-turkey-map]');
  if (!mapPanel || typeof d3 === 'undefined') {
    return;
  }

  const loadingOverlay = mapPanel.querySelector('.map-loading');
  const activeProvinces = (mapPanel.dataset.activeProvinces || '')
    .split(',')
    .map((province) => slugifyProvince(province))
    .filter(Boolean);

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

      provincesGroup
        .selectAll('path')
        .data(geojson.features)
        .join('path')
        .attr('d', geoPath)
        .attr('data-province', (feature) => feature.properties.name)
        .attr('class', (feature) => {
          const slug = slugifyProvince(feature.properties.name);
          const classes = ['province', `province-${slug}`];
          if (activeProvinces.includes(slug)) {
            classes.push('is-active');
          }
          return classes.join(' ');
        })
        .each(function appendTitle(feature) {
          d3.select(this).append('title').text(feature.properties.name);
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

function initHeroSlideshow() {
  const hero = document.querySelector('.hero-home');
  if (!hero) {
    return;
  }

  const heroTitle = document.getElementById('hero-title');
  const heroSubtitle = document.getElementById('hero-subtitle');

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

  setTimeout(updateHeroContent, 1200);
  setInterval(updateHeroContent, 10000);
}


