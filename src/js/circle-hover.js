export function initCircleHover() {
  const buttons = [...document.querySelectorAll('.editorial-circle-link')];
  if (!buttons.length) return;
  const parts = buttons.map(button => ({
    button,
    svg: button.querySelector('.circle-svg'),
    circle: button.querySelector('.circle-art'),
    text: button.querySelector('.circle-text-motion'),
  }));
  const finePointer = matchMedia('(min-width: 769px) and (hover: hover) and (pointer: fine)');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  // The reference shares one eased pointer position between its circular CTAs.
  const target = { x: 0, y: 0 };
  const current = { x: 0, y: 0 };
  let frame = 0;

  function enabled() { return finePointer.matches && !reducedMotion.matches; }

  function paint() {
    parts.forEach(({ circle, text }) => {
      circle.style.transform = `translate3d(${current.x * .4}px,${current.y * .4}px,0)`;
      text.style.transform = `translate3d(${current.x * .12}px,${current.y * .12}px,0)`;
    });
  }

  function tick() {
    frame = 0;
    current.x += (target.x - current.x) * .1;
    current.y += (target.y - current.y) * .1;
    const moving = Math.abs(target.x - current.x) + Math.abs(target.y - current.y) > .001;
    if (!moving) { current.x = target.x; current.y = target.y; }
    paint();
    if (moving) frame = requestAnimationFrame(tick);
  }

  function schedule() { if (!frame) frame = requestAnimationFrame(tick); }
  function leave() { target.x = 0; target.y = 0; schedule(); }
  function reset() {
    cancelAnimationFrame(frame);
    frame = 0;
    target.x = current.x = 0;
    target.y = current.y = 0;
    parts.forEach(({ circle, text }) => {
      circle.style.removeProperty('transform');
      text.style.removeProperty('transform');
    });
  }

  parts.forEach(({ button, svg }) => {
    svg.addEventListener('pointermove', event => {
      if (event.pointerType !== 'mouse' || !enabled()) return;
      // Use the moving SVG's center, matching the reference's rotated SVG offsets.
      const box = svg.getBoundingClientRect();
      target.x = event.clientX - box.left - box.width / 2;
      target.y = event.clientY - box.top - box.height / 2;
      schedule();
    });
    svg.addEventListener('pointerleave', leave);
    button.addEventListener('focus', () => {
      if (button.matches(':focus-visible')) reset();
    });
    button.addEventListener('click', leave);
  });
  finePointer.addEventListener('change', reset);
  reducedMotion.addEventListener('change', reset);
  window.addEventListener('resize', reset);
  window.addEventListener('blur', reset);
  window.addEventListener('scroll', () => {
    if (!parts.some(({ button }) => button.matches(':hover'))) leave();
  }, { passive: true });
  document.addEventListener('visibilitychange', () => { if (document.hidden) reset(); });
}
