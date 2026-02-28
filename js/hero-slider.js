// Hero Slider - Basit ve çalışan slider
(function() {
  let currentSlide = 0;
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.hero-dot');
  let slideInterval = null;

  function showSlide(index) {
    // Remove active from all slides
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));
    
    // Add active to current slide
    if (slides[index]) {
      slides[index].classList.add('active');
      currentSlide = index;
    }
    
    if (dots[index]) {
      dots[index].classList.add('active');
    }
  }

  function nextSlide() {
    const next = (currentSlide + 1) % slides.length;
    showSlide(next);
  }

  function startSlider() {
    // Auto slide every 5 seconds
    slideInterval = setInterval(nextSlide, 5000);
  }

  function stopSlider() {
    if (slideInterval) {
      clearInterval(slideInterval);
      slideInterval = null;
    }
  }

  // Dot click handlers
  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      stopSlider();
      showSlide(index);
      startSlider();
    });
  });

  // Pause on hover
  const slider = document.querySelector('.hero-slider');
  if (slider) {
    slider.addEventListener('mouseenter', stopSlider);
    slider.addEventListener('mouseleave', startSlider);
  }

  // Initialize
  if (slides.length > 0) {
    showSlide(0);
    startSlider();
  }
})();




