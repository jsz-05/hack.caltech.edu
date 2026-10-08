(() => {
  const gallery = document.querySelector(".gallery-container");
  if (!gallery) return;
  const images = [...gallery.querySelectorAll(".gallery-image")];
  const dots = [...gallery.querySelectorAll(".gallery-dot")];
  const pauseButton = gallery.querySelector(".gallery-pause");
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let current = 0;
  let timer;
  let paused = false;
  let hovered = false;
  let visible = false;

  function show(index) {
    current = (index + images.length) % images.length;
    images.forEach((image, i) => {
      image.classList.toggle("active", i === current);
      image.setAttribute("aria-hidden", String(i !== current));
    });
    dots.forEach((dot, i) => {
      dot.classList.toggle("active", i === current);
      dot.setAttribute("aria-pressed", String(i === current));
    });
  }
  function updateAutoplay() {
    clearInterval(timer);
    const focused =
      gallery.contains(document.activeElement) &&
      document.activeElement !== pauseButton;
    if (
      paused ||
      hovered ||
      focused ||
      motion.matches ||
      !visible ||
      document.hidden
    )
      return;
    timer = setInterval(() => show(current + 1), 4000);
  }
  gallery.querySelector(".gallery-prev")?.addEventListener("click", () => {
    show(current - 1);
    updateAutoplay();
  });
  gallery.querySelector(".gallery-next")?.addEventListener("click", () => {
    show(current + 1);
    updateAutoplay();
  });
  dots.forEach((dot, index) =>
    dot.addEventListener("click", () => {
      show(index);
      updateAutoplay();
    }),
  );
  if (pauseButton) {
    pauseButton.hidden = false;
    pauseButton.addEventListener("click", () => {
      paused = !paused;
      pauseButton.textContent = paused ? "Play" : "Pause";
      pauseButton.setAttribute(
        "aria-label",
        paused ? "Play photo slideshow" : "Pause photo slideshow",
      );
      pauseButton.setAttribute("aria-pressed", String(paused));
      updateAutoplay();
    });
  }
  gallery.addEventListener("mouseenter", () => {
    hovered = true;
    updateAutoplay();
  });
  gallery.addEventListener("mouseleave", () => {
    hovered = false;
    updateAutoplay();
  });
  gallery.addEventListener("focusin", updateAutoplay);
  gallery.addEventListener("focusout", () =>
    requestAnimationFrame(updateAutoplay),
  );
  gallery.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
    event.preventDefault();
    show(current + (event.key === "ArrowLeft" ? -1 : 1));
    updateAutoplay();
  });
  document.addEventListener("visibilitychange", updateAutoplay);
  motion.addEventListener("change", updateAutoplay);
  if ("IntersectionObserver" in window) {
    new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
      updateAutoplay();
    }).observe(gallery);
  } else {
    visible = true;
    updateAutoplay();
  }
  show(0);
})();
