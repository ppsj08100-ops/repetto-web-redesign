// The renderer is loaded near About, keeping the initial hero free of WebGL work.
export function initAboutMotion(section) {
  if (!section) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let settled = false;
  // Reserve the pinned story before anchor links are measured; show the original
  // photograph until its first rendered frame so loading never leaves a hole.
  if (!reduced.matches && typeof WebGL2RenderingContext !== 'undefined') section.classList.add('has-about-3d');
  let requested = false;
  let nearby = false;
  const load = async () => {
    if (requested || reduced.matches || !nearby) return;
    requested = true;
    try {
      const { mountAboutScene } = await import('./about-3d.js');
      mountAboutScene(section, reduced);
      settled = true;
    } catch {
      // The high-resolution original remains the complete no-WebGL fallback.
      section.classList.remove('has-about-3d', 'is-about-scene-ready');
      settled = true;
    }
  };
  const observer = new IntersectionObserver(([entry]) => {
    nearby = entry.isIntersecting;
    load();
  }, { rootMargin: '120% 0px' });
  observer.observe(section);
  reduced.addEventListener('change', () => {
    if (!settled) section.classList.toggle('has-about-3d', !reduced.matches && typeof WebGL2RenderingContext !== 'undefined');
    load();
  });
}
