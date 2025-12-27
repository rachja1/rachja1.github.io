// Portfolio Carousel - Multiple carousels support
(function() {
  'use strict';

  function initCarousel(carouselContainer) {
    // Only initialize if carousel is expanded
    if (carouselContainer.classList.contains('collapsed')) {
      return;
    }

    const track = carouselContainer.querySelector('.portfolio-carousel-track');
    if (!track) return;

    const slides = track.querySelectorAll('.portfolio-carousel-slide');
    const prevBtn = carouselContainer.querySelector('.portfolio-carousel-prev');
    const nextBtn = carouselContainer.querySelector('.portfolio-carousel-next');
    const dotsContainer = carouselContainer.querySelector('.portfolio-carousel-dots');

    if (slides.length === 0) return;

    // Check if already initialized
    if (carouselContainer.dataset.initialized === 'true') {
      return;
    }
    carouselContainer.dataset.initialized = 'true';

    let currentIndex = 0;
    let autoplayInterval;

    // Create dots
    if (dotsContainer && slides.length > 1) {
      slides.forEach((_, index) => {
        const dot = document.createElement('button');
        dot.className = 'portfolio-carousel-dot';
        if (index === 0) dot.classList.add('active');
        dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
        dot.addEventListener('click', () => goToSlide(index));
        dotsContainer.appendChild(dot);
      });
    } else if (dotsContainer) {
      dotsContainer.style.display = 'none';
    }

    // Hide navigation if only one slide
    if (slides.length <= 1) {
      if (prevBtn) prevBtn.style.display = 'none';
      if (nextBtn) nextBtn.style.display = 'none';
      if (dotsContainer) dotsContainer.style.display = 'none';
      return;
    }

    function updateCarousel() {
      slides.forEach((slide, index) => {
        slide.classList.remove('active');
        if (index === currentIndex) {
          slide.classList.add('active');
        }
      });

      // Update dots
      const dots = dotsContainer?.querySelectorAll('.portfolio-carousel-dot');
      if (dots) {
        dots.forEach((dot, index) => {
          dot.classList.toggle('active', index === currentIndex);
        });
      }
    }

    function goToSlide(index) {
      currentIndex = index;
      if (currentIndex < 0) currentIndex = slides.length - 1;
      if (currentIndex >= slides.length) currentIndex = 0;
      updateCarousel();
      resetAutoplay();
    }

    function nextSlide() {
      goToSlide(currentIndex + 1);
    }

    function prevSlide() {
      goToSlide(currentIndex - 1);
    }

    function startAutoplay() {
      stopAutoplay();
      autoplayInterval = setInterval(nextSlide, 5000); // Change slide every 5 seconds
    }

    function stopAutoplay() {
      if (autoplayInterval) {
        clearInterval(autoplayInterval);
        autoplayInterval = null;
      }
    }

    function resetAutoplay() {
      stopAutoplay();
      startAutoplay();
    }

    // Event listeners
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        nextSlide();
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        prevSlide();
      });
    }

    // Pause autoplay on hover (only for this specific carousel)
    if (track) {
      track.addEventListener('mouseenter', stopAutoplay);
      track.addEventListener('mouseleave', startAutoplay);
    }

    // Initialize
    updateCarousel();
    startAutoplay();
  }

  function setupExpandableCategories() {
    const headers = document.querySelectorAll('.portfolio-category-header');
    
    headers.forEach(header => {
      const categorySlug = header.dataset.category;
      const carousel = document.querySelector(`.portfolio-category-carousel[data-category="${categorySlug}"]`);
      
      if (!carousel) return;
      
      header.addEventListener('click', () => {
        const isExpanded = carousel.classList.contains('expanded');
        
        if (isExpanded) {
          // Collapse
          carousel.classList.remove('expanded');
          carousel.classList.add('collapsed');
        } else {
          // Expand
          carousel.classList.remove('collapsed');
          carousel.classList.add('expanded');
          
          // Initialize carousel after expansion animation
          setTimeout(() => {
            initCarousel(carousel);
          }, 300);
        }
      });
    });
  }

  function initAllCarousels() {
    // Find all portfolio category carousels
    const carousels = document.querySelectorAll('.portfolio-category-carousel.expanded');
    
    if (carousels.length === 0) {
      // Fallback: try old single carousel structure
      const oldCarousel = document.querySelector('.portfolio-carousel');
      if (oldCarousel) {
        initCarousel(oldCarousel);
      }
      return;
    }

    // Initialize only expanded carousels
    carousels.forEach((carousel) => {
      initCarousel(carousel);
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setupExpandableCategories();
      initAllCarousels();
    });
  } else {
    setupExpandableCategories();
    initAllCarousels();
  }
})();

