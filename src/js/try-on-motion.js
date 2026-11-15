// MARNON's Try On: one-time curtain reveal and title speed 1.1.
export function initTryOnMotion(section) {
  if (!section) return () => {};
  const title = section.querySelector('.try-on-title');
  const firstCaption = section.querySelector('.store-card-maison .store-name');
  const cards = [...section.querySelectorAll('.store-card')];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let observer;
  let frame = 0;
  let lastOffset;

  function paint() {
    frame = 0;
    if (reducedMotion.matches) {
      title.style.removeProperty('--try-on-parallax-y');
      lastOffset = undefined;
      return;
    }
    const height = title.offsetHeight;
    const top = section.getBoundingClientRect().top + title.offsetTop;
    const center = top + height / 2;
    const limit = (innerHeight + height) * .05;
    // The retained, longer Repetto caption must remain clear on narrow screens.
    const captionLimit = firstCaption.getBoundingClientRect().top - (top + height) - 6;
    const offset = Math.min(captionLimit, Math.max(-limit, Math.min(limit, (center - innerHeight / 2) * .1)));
    if (offset !== lastOffset) {
      title.style.setProperty('--try-on-parallax-y', `${offset}px`);
      lastOffset = offset;
    }
  }

  function refresh() {
    if (!frame) frame = requestAnimationFrame(paint);
  }

  function reveal(element) {
    if (!element.classList.contains('store-card')) {
      element.classList.add('is-view');
      return;
    }
    const image = element.querySelector('img');
    image.loading = 'eager';
    // Keep the curtain over a slow-loading image until its actual pixels are ready.
    image.decode().catch(() => {}).then(() => element.classList.add('is-view'));
  }

  function configure() {
    observer?.disconnect();
    section.classList.toggle('is-motion-ready', !reducedMotion.matches);
    if (reducedMotion.matches) {
      section.classList.add('is-view');
      cards.forEach(card => card.classList.add('is-view'));
    } else {
      observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          reveal(entry.target);
          observer.unobserve(entry.target);
        });
      }, { rootMargin: '-30% 0px', threshold: 0 });
      [section, ...cards].forEach(element => {
        if (!element.classList.contains('is-view')) observer.observe(element);
      });
    }
    refresh();
  }

  window.addEventListener('scroll', refresh, { passive: true });
  reducedMotion.addEventListener('change', configure);
  configure();
  return refresh;
}
