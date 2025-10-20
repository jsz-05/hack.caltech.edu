(function() {
  const imgEl = document.getElementById('about-gallery-img');
  const prevBtn = document.querySelector('.gallery-prev');
  const nextBtn = document.querySelector('.gallery-next');
  const dots = document.querySelectorAll('.gallery-dot');
  
  const total = 6;
  let currentIdx = 1;
  let autoplayInterval = null;
  let isTransitioning = false;
  
  const AUTOPLAY_TIME = 5000;

  // Preload all images
  for (let i = 1; i <= total; i++) {
    const img = new Image();
    img.src = `/2025/previews/${i}.png`;
  }

  function updateDots() {
    dots.forEach((dot) => {
      const dotIndex = parseInt(dot.getAttribute('data-index'));
      if (dotIndex === currentIdx) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
  }

  function changeImage(newIdx) {
    if (newIdx === currentIdx || isTransitioning) return;
    isTransitioning = true;
    currentIdx = newIdx;
    
    // Fade out current image
    imgEl.classList.add('fade-out');
    imgEl.src = `/2025/previews/${newIdx}.png`;

    // Wait for fade out, then change src and fade in
    setTimeout(() => {
      updateDots();
      
      // Force reflow to ensure the new image is loaded before fading in
      imgEl.offsetHeight;
      
      imgEl.classList.remove('fade-out');
      isTransitioning = false;
    }, 750);
  }

  function nextImage() {
    const newIdx = currentIdx < total ? currentIdx + 1 : 1;
    changeImage(newIdx);
    resetAutoplay();
  }

  function prevImage() {
    const newIdx = currentIdx > 1 ? currentIdx - 1 : total;
    changeImage(newIdx);
    resetAutoplay();
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
  nextBtn.addEventListener('click', nextImage);
  prevBtn.addEventListener('click', prevImage);

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const newIdx = parseInt(dot.getAttribute('data-index'));
      changeImage(newIdx);
      resetAutoplay();
    });
  });

  // Pause autoplay on hover
  const galleryContainer = document.querySelector('.gallery-container');
  galleryContainer.addEventListener('mouseenter', stopAutoplay);
  galleryContainer.addEventListener('mouseleave', startAutoplay);

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') prevImage();
    if (e.key === 'ArrowRight') nextImage();
  });

  // Initialize
  updateDots();
  startAutoplay();
})();