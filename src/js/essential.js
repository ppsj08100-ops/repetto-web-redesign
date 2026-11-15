// A compact fan based on Figma 639:397, keeping its six frames and stacking order.
// Order follows the existing gallery: pink, black, dancer, boot, sandal, red.
const pile = {
  width: 757.981323,
  height: 799.377991,
  cards: [
    { x: 0, y: 20, angle: -1.2, z: 6, delay: 620, ratio: 1086 / 1448 },
    { x: -16, y: 6, angle: -5, z: 5, delay: 680, ratio: 1086 / 1448 },
    { x: 3, y: -48, angle: 1, z: 1, delay: 660, ratio: 2667 / 3334 },
    { x: 18, y: -6, angle: 4, z: 4, delay: 600, ratio: 1086 / 1449 },
    { x: -28, y: -24, angle: -8, z: 2, delay: 700, ratio: 768 / 1024 },
    { x: 30, y: -16, angle: 8, z: 3, delay: 640, ratio: 1086 / 1448 },
  ],
};

function easeOut(progress) {
  if (progress <= 0 || progress >= 1) return progress;
  // cubic-bezier(.25,1,.5,1), matching the existing card flight.
  let low = 0;
  let high = 1;
  for (let i = 0; i < 16; i++) {
    const t = (low + high) / 2;
    const x = 3 * (1 - t) ** 2 * t * .25 + 3 * (1 - t) * t ** 2 * .5 + t ** 3;
    if (x < progress) low = t;
    else high = t;
  }
  return 1 - (1 - (low + high) / 2) ** 3;
}

export function initEssentialGallery() {
  const section = document.querySelector('.section-essential');
  if (!section) return;
  const surface = section.querySelector('.essential-surface');
  const layout = section.querySelector('.essential-layout');
  const columns = [...section.querySelectorAll('.essential-column')];
  const records = [...section.querySelectorAll('[data-essential-card]')].map((card, index) => ({
    card, pose: pile.cards[index], slot: null, start: null, originalStyle: card.getAttribute('style'),
  }));
  const mobile = matchMedia('(max-width: 768px)');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const duration = 1900;
  let frame = 0;
  let flightFrame = 0;
  let lastTime = 0;
  let cursor = 0;
  let target = 0;
  let ready = false;
  let lastProgress = -1;
  let layer = null;
  let trigger = null;

  function paint(record, box) {
    Object.assign(record.card.style, {
      left: `${box.x}px`, top: `${box.y}px`, width: `${box.width}px`, height: `${box.height}px`,
      transform: `rotate(${box.angle}deg)`, zIndex: String(record.pose.z),
    });
  }

  function measurePile() {
    const area = layout.getBoundingClientRect();
    const origin = section.getBoundingClientRect();
    const scale = mobile.matches ? Math.min(1, area.width * .94 / pile.width) : innerWidth / 1920;
    const x = area.left - origin.left + area.width / 2;
    const y = area.top - origin.top - 170 * scale + pile.height / 2 * scale;
    if (layer) {
      layer.dataset.pileScale = String(scale);
      trigger.style.left = `${x}px`;
      trigger.style.top = `${y}px`;
    }
    records.forEach(record => {
      record.start = {
        x: x + record.pose.x * scale - 247 * scale,
        y: y + record.pose.y * scale - 329.5 * scale,
        width: 494 * scale,
        height: 659 * scale,
        angle: record.pose.angle,
      };
    });
    // This marker also exists geometrically after the temporary layer is removed.
    return { center: origin.top + y, scale };
  }

  function paintFlight() {
    if (!layer) return;
    const origin = layer.getBoundingClientRect();
    records.forEach(record => {
      const destination = record.slot.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, (cursor - record.pose.delay) / 1200));
      const eased = easeOut(progress);
      const start = record.start;
      const mix = (a, b) => a + (b - a) * eased;
      paint(record, {
        x: mix(start.x, destination.left - origin.left),
        y: mix(start.y, destination.top - origin.top),
        width: mix(start.width, destination.width),
        height: mix(start.height, destination.height),
        angle: start.angle * (1 - eased),
      });
    });
  }

  function preparePile() {
    section.classList.remove('is-settled');
    layer = document.createElement('div');
    layer.className = 'essential-flight-layer';
    section.append(layer);
    trigger = document.createElement('span');
    trigger.className = 'essential-pile-trigger';
    trigger.setAttribute('aria-hidden', 'true');
    layer.append(trigger);
    records.forEach(record => {
      const slot = document.createElement('div');
      slot.className = 'essential-slot';
      slot.setAttribute('aria-hidden', 'true');
      slot.style.aspectRatio = String(record.pose.ratio);
      record.card.replaceWith(slot);
      record.slot = slot;
      record.card.querySelector('img').loading = 'eager';
      layer.append(record.card);
    });
    measurePile();
    // Reopening the portal at cursor 1900 paints the grid before anything moves.
    paintFlight();
  }

  function finishGrid() {
    cancelAnimationFrame(flightFrame);
    flightFrame = 0;
    cursor = target = duration;
    records.forEach(record => {
      if (record.slot) {
        record.slot.replaceWith(record.card);
        record.slot = null;
      }
      if (record.originalStyle === null) record.card.removeAttribute('style');
      else record.card.setAttribute('style', record.originalStyle);
    });
    layer?.remove();
    layer = null;
    trigger = null;
    section.classList.add('is-settled');
    lastProgress = -1;
    scheduleParallax();
  }

  function fly(now) {
    flightFrame = 0;
    if (!layer) return;
    const direction = target === duration ? 1 : -1;
    cursor = Math.max(0, Math.min(duration, cursor + direction * (now - lastTime)));
    lastTime = now;
    measurePile();
    paintFlight();
    if (cursor === target) {
      if (target === duration) finishGrid();
    } else flightFrame = requestAnimationFrame(fly);
  }

  function moveTo(endpoint, immediate = false) {
    target = endpoint;
    if (!layer) {
      if (endpoint === duration) return;
      preparePile();
    }
    if (immediate) {
      cancelAnimationFrame(flightFrame);
      flightFrame = 0;
      cursor = endpoint;
      paintFlight();
      if (endpoint === duration) finishGrid();
    } else if (cursor !== target && !flightFrame) {
      lastTime = performance.now();
      flightFrame = requestAnimationFrame(fly);
    }
  }

  function updateParallax() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    const box = surface.getBoundingClientRect();
    const progress = reducedMotion.matches ? 0 : Math.max(0, Math.min(1, (innerHeight / 2 - box.top) / box.height));
    if (progress !== lastProgress) {
      lastProgress = progress;
      const distance = 100 * (1 - (1 - progress) ** 2);
      const directions = mobile.matches ? [-1, 1, 0] : [1, -1, 1];
      columns.forEach((column, index) => column.style.setProperty('--column-y', `${distance * directions[index]}px`));
    }
    if (!ready) return;
    if (reducedMotion.matches) {
      if (layer) finishGrid();
      return;
    }
    const marker = measurePile();
    const unfoldAt = innerHeight * .7;
    if (marker.center <= unfoldAt) {
      section.classList.add('is-view');
      // Preserve the original fast-jump fallback for an idle, unopened pile.
      const skippedEntry = cursor === 0 && !flightFrame && marker.center < innerHeight * .3;
      moveTo(duration, skippedEntry);
    } else if (marker.center >= unfoldAt + 24) {
      // A small dead band prevents repeated direction changes at the boundary.
      const offscreen = marker.center - pile.height * marker.scale / 2 > innerHeight;
      moveTo(0, offscreen);
    }
    if (layer && !flightFrame) paintFlight();
  }
  function scheduleParallax() { if (!frame) frame = requestAnimationFrame(updateParallax); }

  function arrangeColumns() {
    section.classList.add('is-preparing');
    const perColumn = mobile.matches ? 3 : 2;
    records.forEach((record, index) => columns[Math.floor(index / perColumn)].append(record.slot || record.card));
    lastProgress = -1;
    updateParallax();
    measurePile();
    paintFlight();
    section.getBoundingClientRect();
    section.classList.remove('is-preparing');
  }

  section.classList.add('is-motion-ready');
  arrangeColumns();
  if (reducedMotion.matches) {
    section.classList.add('is-view');
    finishGrid();
  } else preparePile();
  ready = true;
  updateParallax();

  if ('IntersectionObserver' in window) {
    const titleObserver = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        section.classList.add('is-view');
        titleObserver.disconnect();
      }
    }, { root: null, rootMargin: '-30% 0px', threshold: 0 });
    titleObserver.observe(section);
  } else section.classList.add('is-view');

  mobile.addEventListener('change', arrangeColumns);
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) {
      section.classList.add('is-view');
      finishGrid();
    }
    lastProgress = -1;
    scheduleParallax();
  });
  window.addEventListener('scroll', scheduleParallax, { passive: true });
  window.addEventListener('resize', scheduleParallax);
  window.addEventListener('pageshow', scheduleParallax);
  new ResizeObserver(scheduleParallax).observe(surface);
  document.fonts.ready.then(scheduleParallax);
}
