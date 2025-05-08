  (function() {
    const imgEl = document.getElementById('about-gallery-img');
    const total = 6;
    let idx = 1;

    const intervalTime   = 5000; // time each image stays visible (ms)
    const transitionTime = 1000; // must match CSS transition duration (ms)

    function rotateImage() {
      // calculate next index
      const nextIdx = idx < total ? idx + 1 : 1;
      const nextSrc = `/2025/previews/${nextIdx}.png`;

      // preload next image
      const preloader = new Image();
      preloader.src = nextSrc;

      preloader.onload = () => {
        // fade out current
        imgEl.style.opacity = 0;

        // after fade-out, swap and fade back in
        setTimeout(() => {
          imgEl.src = nextSrc;
          imgEl.style.opacity = 1;
          idx = nextIdx;
        }, transitionTime);
      };
    }

    // start the cycle
    setInterval(rotateImage, intervalTime);
  })();
