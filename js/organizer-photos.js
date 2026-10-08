// Desktop keeps every photo visible; mobile is a manual, swipeable photo strip.
const collage = document.querySelector('.photo-collage');
if (collage) {
  const photos = [...collage.querySelectorAll('.polaroid')];
  const controls = document.querySelector('.photo-controls');
  const previous = controls.querySelector('.photo-prev');
  const next = controls.querySelector('.photo-next');
  const count = controls.querySelector('.photo-count');
  const mobile = matchMedia('(max-width: 600px)');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0;

  function update() {
    const viewport = collage.getBoundingClientRect();
    const center = viewport.left + viewport.width / 2;
    current = photos.reduce((nearest, photo, index) => {
      const bounds = photo.getBoundingClientRect();
      const candidate = Math.abs(bounds.left + bounds.width / 2 - center);
      const known = photos[nearest].getBoundingClientRect();
      return candidate < Math.abs(known.left + known.width / 2 - center) ? index : nearest;
    }, 0);
    count.textContent = `${current + 1} / ${photos.length}`;
    previous.disabled = current === 0;
    next.disabled = current === photos.length - 1;
  }

  function show(index) {
    if (!mobile.matches) return;
    const photo = photos[Math.max(0, Math.min(photos.length - 1, index))];
    collage.scrollTo({
      left: photo.offsetLeft - (collage.clientWidth - photo.offsetWidth) / 2,
      behavior: reducedMotion.matches ? 'instant' : 'smooth',
    });
  }

  function layout() {
    controls.hidden = !mobile.matches;
    collage.tabIndex = mobile.matches ? 0 : -1;
    update();
  }
  previous.addEventListener('click', () => show(current - 1));
  next.addEventListener('click', () => show(current + 1));
  collage.addEventListener('scroll', update, { passive: true });
  collage.addEventListener('keydown', event => {
    if (!mobile.matches || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    show(current + (event.key === 'ArrowRight' ? 1 : -1));
  });
  mobile.addEventListener('change', layout);
  window.addEventListener('resize', update, { passive: true });
  layout();
}
