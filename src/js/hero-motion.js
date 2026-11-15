// Call initHeroCarousel() after rendering the existing hero markup.
// It returns an optional cleanup function. No stylesheet or animation library is required.
const revealMaskUrl = new URL('../../assets/images/hero-reveal-mask.png', import.meta.url).href;
const instances = new WeakMap();

// MARNON's CustomEase path: M0,0 C0.25,0.76 0.56,0.91 1,1.
function revealEase(progress) {
  if (progress <= 0 || progress >= 1) return progress;
  const bezier = (t, a, b) => 3 * (1 - t) ** 2 * t * a + 3 * (1 - t) * t ** 2 * b + t ** 3;
  let low = 0;
  let high = 1;
  for (let iteration = 0; iteration < 16; iteration += 1) {
    const middle = (low + high) / 2;
    if (bezier(middle, 0.25, 0.56) < progress) low = middle;
    else high = middle;
  }
  return bezier((low + high) / 2, 0.76, 0.91);
}

function imageReady(image) {
  if (!image) return Promise.resolve(false);
  const loaded = image.complete
    ? Promise.resolve(image.naturalWidth > 0)
    : new Promise(resolve => {
      const finish = () => {
        image.removeEventListener('load', finish);
        image.removeEventListener('error', finish);
        resolve(image.naturalWidth > 0);
      };
      image.addEventListener('load', finish, { once: true });
      image.addEventListener('error', finish, { once: true });
    });
  return loaded.then(async success => {
    if (!success) return false;
    if (typeof image.decode === 'function') {
      try { await image.decode(); } catch { return image.naturalWidth > 0; }
    }
    return true;
  });
}

export function initHeroCarousel() {
  const stage = document.querySelector('.hero-photo-stage');
  if (!stage) return () => {};
  const slides = [...stage.querySelectorAll('.hero-slide')];
  const photos = slides.map(slide => slide.querySelector('img'));
  if (!slides.length || photos.some(photo => !photo)) return () => {};
  instances.get(stage)?.();

  const nextButton = document.querySelector('[data-hero-next]');
  const previousButton = document.querySelector('[data-hero-prev]');
  const counter = document.querySelector('#hero-current');
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const originalCounter = counter?.textContent;
  const slideProperties = ['opacity', 'z-index', 'transition', 'mask-image', '-webkit-mask-image',
    'mask-size', '-webkit-mask-size', 'mask-position', '-webkit-mask-position',
    'mask-repeat', '-webkit-mask-repeat', 'mask-mode'];
  const snapshots = slides.map((slide, i) => ({
    active: slide.classList.contains('is-active'),
    hidden: slide.getAttribute('aria-hidden'),
    styles: slideProperties.map(name => [name, slide.style.getPropertyValue(name), slide.style.getPropertyPriority(name)]),
    imageTransform: photos[i].style.getPropertyValue('transform'),
    imageTransformPriority: photos[i].style.getPropertyPriority('transform'),
    computedTransform: getComputedStyle(photos[i]).transform,
  }));

  let index = Math.max(0, slides.findIndex(slide => slide.classList.contains('is-active')));
  let pendingIndex = null;
  let destroyed = false;
  let busy = !preference.matches;
  let ready = preference.matches;
  let maskReady = false;
  let operation = 0;
  let timer = 0;
  let motion = null;
  let pointer = null;
  let loadingTimeout = 0;
  let paused = isPaused();

  function isPaused() {
    return document.hidden || document.body.classList.contains('has-dialog')
      || Boolean(document.querySelector('dialog[open]'));
  }

  function setMask(slide, position) {
    slide.style.maskImage = `url("${revealMaskUrl}")`;
    slide.style.webkitMaskImage = `url("${revealMaskUrl}")`;
    slide.style.maskSize = '100% 200%';
    slide.style.webkitMaskSize = '100% 200%';
    slide.style.maskRepeat = 'no-repeat';
    slide.style.webkitMaskRepeat = 'no-repeat';
    slide.style.maskMode = 'alpha';
    slide.style.maskPosition = position;
    slide.style.webkitMaskPosition = position;
  }

  function removeMask(slide) {
    slide.style.maskImage = 'none';
    slide.style.webkitMaskImage = 'none';
  }

  function restoreScale(i) {
    const snapshot = snapshots[i];
    if (snapshot.imageTransform) {
      photos[i].style.setProperty('transform', snapshot.imageTransform, snapshot.imageTransformPriority);
    } else photos[i].style.removeProperty('transform');
  }

  function setScale(i, scale) {
    const base = snapshots[i].computedTransform;
    photos[i].style.transform = `${base === 'none' ? '' : `${base} `}scale(${scale})`;
  }

  function renderVisible() {
    slides.forEach((slide, i) => {
      const active = i === index;
      slide.classList.toggle('is-active', active);
      slide.setAttribute('aria-hidden', String(!active));
      slide.style.opacity = active ? '1' : '0';
      slide.style.zIndex = active ? '2' : '0';
      slide.style.transition = 'none';
      restoreScale(i);
      if (maskReady && !preference.matches) setMask(slide, '0 50%');
      else removeMask(slide);
    });
    if (counter) counter.textContent = String(index + 1);
  }

  function stopTimer() {
    clearTimeout(timer);
    timer = 0;
  }

  function armAutoplay() {
    stopTimer();
    if (destroyed || !ready || busy || paused || preference.matches || slides.length < 2) return;
    timer = setTimeout(() => { void changeSlide(1); }, 6000);
  }

  function cancelMotion() {
    if (!motion) return;
    const cancelled = motion;
    motion = null;
    cancelAnimationFrame(cancelled.frame);
    cancelled.resolve(false);
  }

  function queueFrame() {
    if (!motion || motion.frame || paused) return;
    motion.frame = requestAnimationFrame(tick);
  }

  function tick(timestamp) {
    if (!motion) return;
    motion.frame = 0;
    if (paused) { motion.lastTime = null; return; }
    if (motion.lastTime !== null) motion.elapsed += timestamp - motion.lastTime;
    motion.lastTime = timestamp;
    const current = motion;
    current.update(Math.min(current.elapsed, current.duration));
    if (current.elapsed >= current.duration) {
      motion = null;
      current.resolve(true);
    } else queueFrame();
  }

  function animate(duration, update) {
    cancelMotion();
    return new Promise(resolve => {
      motion = { duration, update, resolve, elapsed: 0, lastTime: null, frame: 0 };
      update(0);
      queueFrame();
    });
  }

  function pauseChanged() {
    const nextPaused = isPaused();
    if (nextPaused === paused) return;
    paused = nextPaused;
    stopTimer();
    if (motion) {
      cancelAnimationFrame(motion.frame);
      motion.frame = 0;
      motion.lastTime = null;
      if (!paused) queueFrame();
    }
    if (!paused) armAutoplay();
  }

  async function changeSlide(direction) {
    if (destroyed || busy || slides.length < 2) return;
    stopTimer();
    busy = true;
    const token = ++operation;
    const from = index;
    const to = (from + direction + slides.length) % slides.length;
    photos[to].loading = 'eager';
    const decoded = await imageReady(photos[to]);
    if (destroyed || token !== operation) return;
    if (!decoded) {
      pendingIndex = null;
      busy = false;
      armAutoplay();
      return;
    }
    pendingIndex = to;
    if (!maskReady || preference.matches) {
      index = to;
      pendingIndex = null;
      busy = false;
      renderVisible();
      armAutoplay();
      return;
    }

    // The incoming photograph is already visible underneath the outgoing mask.
    slides[to].style.opacity = '1';
    slides[to].style.zIndex = '1';
    setMask(slides[to], '0 50%');
    slides[from].style.zIndex = '2';
    const destination = direction > 0 ? -100 : 200;
    const completed = await animate(1200, elapsed => {
      const position = 50 + (destination - 50) * revealEase(elapsed / 1200);
      setMask(slides[from], `0 ${position}%`);
    });
    if (!completed || destroyed || token !== operation) return;
    index = to;
    pendingIndex = null;
    busy = false;
    renderVisible();
    armAutoplay();
  }

  function next() { void changeSlide(1); }
  function previous() { void changeSlide(-1); }
  function keydown(event) {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault(); next();
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault(); previous();
    }
  }

  function pointerdown(event) {
    if (!event.isPrimary || event.button !== 0 || busy
      || event.target.closest('a,button,input,select,textarea')) return;
    pointer = { id: event.pointerId, x: event.clientX, y: event.clientY };
    stage.setPointerCapture?.(event.pointerId);
  }

  function pointerup(event) {
    if (!pointer || pointer.id !== event.pointerId) return;
    const dx = event.clientX - pointer.x;
    const dy = event.clientY - pointer.y;
    pointer = null;
    if (Math.abs(dx) >= 40 && Math.abs(dx) > Math.abs(dy) * 1.25) {
      if (dx < 0) next();
      else previous();
    }
  }

  function pointercancel() { pointer = null; }

  function preferenceChanged() {
    operation += 1;
    cancelMotion();
    stopTimer();
    if (pendingIndex !== null) index = pendingIndex;
    pendingIndex = null;
    busy = false;
    ready = true;
    renderVisible();
    armAutoplay();
  }

  nextButton?.addEventListener('click', next);
  previousButton?.addEventListener('click', previous);
  stage.addEventListener('keydown', keydown);
  stage.addEventListener('pointerdown', pointerdown);
  stage.addEventListener('pointerup', pointerup);
  stage.addEventListener('pointercancel', pointercancel);
  document.addEventListener('visibilitychange', pauseChanged);
  preference.addEventListener('change', preferenceChanged);
  const modalObserver = new MutationObserver(pauseChanged);
  modalObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });
  document.querySelectorAll('dialog').forEach(dialog => {
    modalObserver.observe(dialog, { attributes: true, attributeFilter: ['open'] });
  });

  renderVisible();
  // The HTML stays visible without JS. Only the initialized module hides the first image.
  if (!preference.matches) {
    slides[index].style.opacity = '0';
    setMask(slides[index], '0 200%');
  }
  const mask = new Image();
  mask.src = revealMaskUrl;
  const maskLoaded = imageReady(mask).then(success => { maskReady = success; return success; });

  async function revealFirst() {
    const token = operation;
    const loaded = await Promise.race([
      Promise.all([imageReady(photos[index]), maskLoaded]),
      new Promise(resolve => { loadingTimeout = setTimeout(() => resolve(null), 8000); }),
    ]);
    clearTimeout(loadingTimeout);
    loadingTimeout = 0;
    if (destroyed || token !== operation) return;
    if (!loaded || !loaded[0] || !loaded[1] || preference.matches) {
      busy = false;
      ready = true;
      renderVisible();
      armAutoplay();
      return;
    }
    setMask(slides[index], '0 200%');
    setScale(index, 1.1);
    slides[index].style.opacity = '1';
    const completed = await animate(2000, elapsed => {
      setMask(slides[index], `0 ${200 - 150 * revealEase(elapsed / 2000)}%`);
      setScale(index, 1.1 - 0.1 * revealEase(Math.min(elapsed / 1500, 1)));
    });
    if (!completed || destroyed || token !== operation) return;
    busy = false;
    ready = true;
    renderVisible();
    armAutoplay();
  }

  if (preference.matches) {
    // Retain immediate, operable slides; a later preference change can enable the loaded mask.
    void maskLoaded;
  } else void revealFirst();

  function cleanup() {
    if (destroyed) return;
    destroyed = true;
    operation += 1;
    stopTimer();
    clearTimeout(loadingTimeout);
    cancelMotion();
    modalObserver.disconnect();
    nextButton?.removeEventListener('click', next);
    previousButton?.removeEventListener('click', previous);
    stage.removeEventListener('keydown', keydown);
    stage.removeEventListener('pointerdown', pointerdown);
    stage.removeEventListener('pointerup', pointerup);
    stage.removeEventListener('pointercancel', pointercancel);
    document.removeEventListener('visibilitychange', pauseChanged);
    preference.removeEventListener('change', preferenceChanged);
    slides.forEach((slide, i) => {
      const snapshot = snapshots[i];
      slide.classList.toggle('is-active', snapshot.active);
      if (snapshot.hidden === null) slide.removeAttribute('aria-hidden');
      else slide.setAttribute('aria-hidden', snapshot.hidden);
      snapshot.styles.forEach(([name, value, priority]) => {
        if (value) slide.style.setProperty(name, value, priority);
        else slide.style.removeProperty(name);
      });
      restoreScale(i);
    });
    if (counter) counter.textContent = originalCounter;
    if (instances.get(stage) === cleanup) instances.delete(stage);
  }
  instances.set(stage, cleanup);
  return cleanup;
}
