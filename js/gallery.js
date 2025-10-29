(function() {
  const images = document.querySelectorAll('.gallery-image');
  const prevBtn = document.querySelector('.gallery-prev');
  const nextBtn = document.querySelector('.gallery-next');
  const dots = document.querySelectorAll('.gallery-dot');
  const galleryContainer = document.querySelector('.gallery-container');
  
  let currentIdx = 0;
  let autoplayInterval = null;
  let isTransitioning = false;
  
  const AUTOPLAY_TIME = 4000;
  const TRANSITION_TIME = 400;

  function updateGallery(newIdx) {
    if (newIdx === currentIdx || isTransitioning) return;
    
    isTransitioning = true;
    
    // Remove active class from current
    images[currentIdx].classList.remove('active');
    dots[currentIdx].classList.remove('active');
    
    // Add active class to new
    currentIdx = newIdx;
    images[currentIdx].classList.add('active');
    dots[currentIdx].classList.add('active');
    
    // Prevent rapid clicking
    setTimeout(() => {
      isTransitioning = false;
    }, TRANSITION_TIME);
  }

  function nextImage() {
    const newIdx = (currentIdx + 1) % images.length;
    updateGallery(newIdx);
  }

  function prevImage() {
    const newIdx = (currentIdx - 1 + images.length) % images.length;
    updateGallery(newIdx);
  }

  function startAutoplay() {
    stopAutoplay();
    autoplayInterval = setInterval(nextImage, AUTOPLAY_TIME);
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
  prevBtn.addEventListener('click', () => {
    prevImage();
    resetAutoplay();
  });

  nextBtn.addEventListener('click', () => {
    nextImage();
    resetAutoplay();
  });

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const newIdx = parseInt(dot.getAttribute('data-index'));
      updateGallery(newIdx);
      resetAutoplay();
    });
  });

  // Pause autoplay on hover
  galleryContainer.addEventListener('mouseenter', stopAutoplay);
  galleryContainer.addEventListener('mouseleave', startAutoplay);

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      prevImage();
      resetAutoplay();
    }
    if (e.key === 'ArrowRight') {
      nextImage();
      resetAutoplay();
    }
  });

  // Start autoplay
  startAutoplay();
})();