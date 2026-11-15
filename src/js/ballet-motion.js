// Match MARNON Wedding's entrance and independent 1.04 / 1.08 photo speeds.
export function initBalletMotion(section) {
  if (!section) return;
  const text = section.querySelector('.ballet-text');
  const layers = [
    { element: section.querySelector('.ballet-film-window'), speed: .04, offset: 0 },
    { element: section.querySelector('.ballet-ellipse'), speed: .08, offset: 0 },
  ];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let observer;
  let frame = 0;

  function paint() {
    frame = 0;
    if (reducedMotion.matches) {
      layers.forEach(layer => {
        layer.element.style.removeProperty('--ballet-parallax-y');
        layer.offset = 0;
      });
      return;
    }
    // Read all geometry before applying transforms; subtract our own previous offset.
    const positions = layers.map(layer => {
      const rect = layer.element.getBoundingClientRect();
      const center = rect.top - layer.offset + rect.height / 2;
      const limit = (innerHeight + rect.height) * layer.speed / 2;
      return Math.max(-limit, Math.min(limit, (center - innerHeight / 2) * layer.speed));
    });
    layers.forEach((layer, i) => {
      if (positions[i] === layer.offset) return;
      layer.offset = positions[i];
      layer.element.style.setProperty('--ballet-parallax-y', `${layer.offset}px`);
    });
  }

  function refresh() {
    if (!frame) frame = requestAnimationFrame(paint);
  }

  function configure() {
    observer?.disconnect();
    section.classList.toggle('is-motion-ready', !reducedMotion.matches);
    if (reducedMotion.matches) {
      section.classList.add('is-view');
      text.classList.add('is-view');
    } else {
      observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-view');
          observer.unobserve(entry.target);
        });
      }, { rootMargin: '-30% 0px', threshold: 0 });
      [section, text].forEach(element => {
        if (!element.classList.contains('is-view')) observer.observe(element);
      });
    }
    refresh();
  }

  const resize = new ResizeObserver(refresh);
  layers.forEach(layer => resize.observe(layer.element));
  window.addEventListener('scroll', refresh, { passive: true });
  window.addEventListener('resize', refresh, { passive: true });
  reducedMotion.addEventListener('change', configure);
  document.fonts.ready.then(refresh);
  configure();
}
