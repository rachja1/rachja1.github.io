// Portfolio Carousel
(function() {
  'use strict';

  function initCarousel() {
    const track = document.querySelector('.carousel-track');
    if (!track) return;

    const slides = track.querySelectorAll('.carousel-slide');
    const prevBtn = document.querySelector('.carousel-prev');
    const nextBtn = document.querySelector('.carousel-next');
    const dotsContainer = document.querySelector('.carousel-dots');

    if (slides.length === 0) return;

    let currentIndex = 0;
    let autoplayInterval;

    // Create dots
    if (dotsContainer && slides.length > 1) {
      slides.forEach((_, index) => {
        const dot = document.createElement('button');
        dot.className = 'carousel-dot';
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
      const dots = dotsContainer?.querySelectorAll('.carousel-dot');
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

    // Pause autoplay on hover
    if (track) {
      track.addEventListener('mouseenter', stopAutoplay);
      track.addEventListener('mouseleave', startAutoplay);
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') prevSlide();
      if (e.key === 'ArrowRight') nextSlide();
    });

    // Initialize
    updateCarousel();
    startAutoplay();
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCarousel);
  } else {
    initCarousel();
  }
})();

