const clamp = value => Math.max(0, Math.min(1, value));
const between = (value, start, end) => clamp((value - start) / (end - start));
const inOutQuad = value => value < .5 ? 2 * value * value : 1 - (-2 * value + 2) ** 2 / 2;

// Vero's word masks and 351-unit scroll clock, using the original photograph.
// This module has no WebGL/model dependency and never changes the silhouette.
export function initAboutTypeMotion(section) {
  if (!section) return;
  const story = section.querySelector('.about-story');
  const stage = section.querySelector('.about-visual');
  const first = section.querySelector('.about-statement-first');
  const second = section.querySelector('.about-statement-second');
  const copy = section.querySelector('.about-copy');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const short = matchMedia('(max-height: 539px)');
  let enabled = false;
  let visible = true;
  let frame = 0;
  let top = 0;
  let height = 1;
  let viewport = 1;
  let firstState = '';
  let secondState = '';
  let copyVisible = null;

  function setState(element, state, previous) {
    if (state === previous) return previous;
    element.classList.toggle('is-visible', state === 'visible');
    element.classList.toggle('is-up', state === 'up');
    return state;
  }
  function draw() {
    frame = 0;
    if (!enabled || !visible || document.hidden) return;
    const clock = 351 * clamp((scrollY - top + viewport) / (height + viewport));
    firstState = setState(first, clock < 51 ? 'down' : clock < 113 ? 'visible' : 'up', firstState);
    secondState = setState(second, clock < 113 ? 'down' : clock < 217 ? 'visible' : 'up', secondState);
    const showCopy = clock >= 217;
    if (copyVisible !== showCopy) {
      copyVisible = showCopy;
      section.classList.toggle('is-about-copy-visible', showCopy);
      copy.toggleAttribute('inert', !showCopy);
      copy.setAttribute('aria-hidden', String(!showCopy));
    }
    stage.style.setProperty('--about-second-y', `${-620 * inOutQuad(between(clock, 208, 298))}px`);
    stage.style.setProperty('--about-second-opacity', String(1 - inOutQuad(between(clock, 240, 280))));
    stage.style.setProperty('--about-photo-y', `${-.4 * viewport * between(clock, 50, 337)}px`);
    stage.style.setProperty('--about-photo-opacity', String(1 - between(clock, 280, 350)));
    stage.style.setProperty('--about-scrim', String(inOutQuad(between(clock, 200, 265))));
    story.dataset.timeline = clock.toFixed(3);
  }
  const schedule = () => {
    if (!frame && enabled && visible && !document.hidden) frame = requestAnimationFrame(draw);
  };
  function measure() {
    section.style.removeProperty('--about-type-size');
    const size = Number.parseFloat(getComputedStyle(first).fontSize);
    const available = first.getBoundingClientRect().width;
    const widest = Math.max(...Array.from(section.querySelectorAll('.about-type-line'), line => line.getBoundingClientRect().width));
    if (widest > available && available > 0) section.style.setProperty('--about-type-size', `${Math.floor(size * available / widest * 10) / 10}px`);
    top = scrollY + story.getBoundingClientRect().top;
    height = story.offsetHeight;
    viewport = stage.offsetHeight;
    if (enabled) schedule();
  }
  function syncMode() {
    enabled = !reduced.matches && !short.matches;
    section.classList.toggle('has-about-type-motion', enabled);
    if (!enabled) {
      cancelAnimationFrame(frame);
      frame = 0;
      firstState = secondState = '';
      copyVisible = null;
      first.classList.remove('is-up', 'is-visible');
      second.classList.remove('is-up', 'is-visible');
      section.classList.remove('is-about-copy-visible');
      copy.removeAttribute('inert');
      copy.removeAttribute('aria-hidden');
      stage.removeAttribute('style');
    }
    measure();
  }
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) schedule();
  }, { rootMargin: '100% 0px' });
  observer.observe(story);
  const resize = new ResizeObserver(measure);
  resize.observe(stage);
  resize.observe(section.querySelector('.about-title'));
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', measure);
  document.addEventListener('visibilitychange', schedule);
  reduced.addEventListener('change', syncMode);
  short.addEventListener('change', syncMode);
  document.fonts.ready.then(measure);
  syncMode();
}
