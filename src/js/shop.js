import { createShoeColorPreview } from './shoe-colorways.js';

const modulo = (value, length) => (value % length + length) % length;

export function initShopCarousel() {
  const viewport = document.querySelector('.shop-viewport');
  const track = viewport.querySelector('.shop-track');
  const originals = [...track.children];
  const count = originals.length;
  const number = document.querySelector('#shop-current');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const colorPreview = createShoeColorPreview(reducedMotion);
  const finePointer = matchMedia('(min-width: 769px) and (hover: hover) and (pointer: fine)');
  const cursor = document.querySelector('.drag-cursor');
  const ringPosition = cursor.querySelector('.drag-cursor-ring-position');
  const textPosition = cursor.querySelector('.drag-cursor-text-position');

  function cloneSlide(slide) {
    const clone = slide.cloneNode(true);
    clone.classList.remove('is-active');
    clone.setAttribute('aria-hidden', 'true');
    clone.dataset.clone = 'true';
    return clone;
  }
  track.prepend(...originals.map(cloneSlide));
  track.append(...originals.map(cloneSlide));
  const slides = [...track.children];
  let physical = count + 1;
  let step = 0;
  let drag = null;
  let autoplayTimer;
  let settleTimer;
  let suppressClick = false;
  let pointer = null;
  let hasPointer = false;
  let hovered = false;
  let hoveredSlide = null;
  let windowActive = true;

  function stopAutoplay() { clearTimeout(autoplayTimer); }
  function scheduleAutoplay() {
    stopAutoplay();
    if (drag || hovered || !windowActive || reducedMotion.matches || document.hidden || viewport.matches(':focus-visible') || document.querySelector('dialog[open]')) return;
    autoplayTimer = setTimeout(() => {
      if (!document.querySelector('dialog[open]')) goTo(physical + 1);
    }, 2200);
  }
  function updateStatus() {
    const selected = modulo(physical - count, count);
    number.textContent = String(selected + 1);
    slides.forEach((slide, index) => {
      slide.classList.toggle('is-active', index === physical);
      if (!slide.dataset.clone) slide.setAttribute('aria-hidden', String(Number(slide.dataset.product) !== selected));
    });
  }
  function translate(x, instant = false) {
    track.style.transition = instant ? 'none' : 'transform 1000ms ease';
    track.style.transform = `translate3d(${x}px,0,0)`;
  }
  function restPosition() { return -(physical - 1) * step; }
  function settle() {
    clearTimeout(settleTimer);
    if (physical < count || physical >= count * 2) {
      physical = count + modulo(physical - count, count);
      translate(restPosition(), true);
    }
    updateStatus();
    updateCursorVisibility();
    scheduleAutoplay();
  }
  function goTo(next) {
    stopAutoplay();
    colorPreview.clear();
    hoveredSlide = null;
    clearTimeout(settleTimer);
    physical = Math.max(0, Math.min(slides.length - 1, next));
    updateStatus();
    translate(restPosition(), reducedMotion.matches);
    if (reducedMotion.matches) settle();
    else settleTimer = setTimeout(settle, 1050);
  }
  function resize() {
    const a = originals[0].getBoundingClientRect();
    const b = originals[1].getBoundingClientRect();
    step = b.left - a.left;
    physical = count + modulo(physical - count, count);
    drag = null;
    viewport.classList.remove('is-dragging');
    clearTimeout(settleTimer);
    translate(restPosition(), true);
    updateStatus();
    updateCursorVisibility();
    scheduleAutoplay();
  }
  track.addEventListener('transitionend', event => {
    if (event.target === track && event.propertyName === 'transform' && !drag) settle();
  });
  document.querySelector('.shop-count').addEventListener('click', () => goTo(physical + 1));
  viewport.addEventListener('keydown', event => {
    const targets = { ArrowLeft: physical - 1, ArrowRight: physical + 1, Home: count, End: count * 2 - 1 };
    if (!(event.key in targets)) return;
    event.preventDefault();
    goTo(targets[event.key]);
  });
  viewport.addEventListener('dragstart', event => event.preventDefault());
  viewport.addEventListener('pointerdown', event => {
    if (event.button !== 0 || !event.isPrimary) return;
    stopAutoplay();
    clearTimeout(settleTimer);
    const x = new DOMMatrixReadOnly(getComputedStyle(track).transform).m41;
    translate(x, true);
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY, translate: x, time: performance.now(), axis: null, moved: false };
    colorPreview.clear();
    hoveredSlide = null;
    suppressClick = false;
    viewport.classList.add('is-dragging');
  });
  viewport.addEventListener('pointermove', event => {
    if (!drag || event.pointerId !== drag.id) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    if (!drag.axis && Math.hypot(dx, dy) > 4) drag.axis = Math.abs(dx) >= Math.abs(dy) ? 'x' : 'y';
    if (drag.axis === 'y') {
      drag = null;
      viewport.classList.remove('is-dragging');
      goTo(physical);
      return;
    }
    if (drag.axis !== 'x') return;
    event.preventDefault();
    drag.moved = true;
    if (!viewport.hasPointerCapture(event.pointerId)) viewport.setPointerCapture(event.pointerId);
    translate(drag.translate + dx, true);
  });
  function endDrag(event, cancelled = false) {
    if (!drag || event.pointerId !== drag.id) return;
    const previous = drag;
    drag = null;
    viewport.classList.remove('is-dragging');
    if (viewport.hasPointerCapture(event.pointerId)) viewport.releasePointerCapture(event.pointerId);
    const delta = cancelled ? 0 : event.clientX - previous.x;
    const position = 1 - (previous.translate + delta) / step;
    let target = Math.round(position);
    if (!cancelled && previous.moved && performance.now() - previous.time < 300) target = delta < 0 ? Math.ceil(position) : Math.floor(position);
    suppressClick = previous.moved;
    goTo(target);
  }
  window.addEventListener('pointerup', event => endDrag(event));
  viewport.addEventListener('pointercancel', event => endDrag(event, true));
  viewport.addEventListener('click', event => {
    if (!suppressClick) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    suppressClick = false;
  }, true);

  function hideCursor() {
    cursor.classList.remove('is-visible');
    const wasHovered = hovered;
    hovered = false;
    hoveredSlide = null;
    colorPreview.clear();
    if (wasHovered) scheduleAutoplay();
  }
  function updateCursorVisibility() {
    if (!finePointer.matches || !pointer || !windowActive || document.hidden || document.querySelector('dialog[open]')) { hideCursor(); return; }
    const target = document.elementFromPoint(pointer.x, pointer.y);
    const inside = Boolean(target && viewport.contains(target));
    if (!inside) { hideCursor(); return; }
    hovered = true;
    stopAutoplay();
    cursor.classList.add('is-visible');
    const slide = drag ? null : target.closest('.product');
    if (slide !== hoveredSlide) {
      hoveredSlide = slide;
      colorPreview.show(slide);
    }
  }
  function moveCursor(event) {
    if (event.pointerType !== 'mouse' || !finePointer.matches) { hideCursor(); return; }
    pointer = { x: event.clientX, y: event.clientY };
    const transform = `translate3d(${event.clientX - 90}px,${event.clientY - 90}px,0)`;
    ringPosition.style.transform = transform;
    textPosition.style.transform = transform;
    if (!hasPointer) {
      ringPosition.getBoundingClientRect();
      cursor.classList.add('is-tracking');
      hasPointer = true;
    }
    updateCursorVisibility();
  }
  window.addEventListener('pointermove', moveCursor, { passive: true });
  viewport.addEventListener('pointerenter', moveCursor);
  viewport.addEventListener('pointerleave', hideCursor);
  window.addEventListener('scroll', updateCursorVisibility, { passive: true });
  window.addEventListener('blur', () => { windowActive = false; hideCursor(); stopAutoplay(); });
  window.addEventListener('focus', () => { windowActive = true; updateCursorVisibility(); scheduleAutoplay(); });
  document.documentElement.addEventListener('pointerleave', hideCursor);
  viewport.addEventListener('focusin', () => { if (viewport.matches(':focus-visible')) { hideCursor(); stopAutoplay(); } });
  viewport.addEventListener('focusout', () => queueMicrotask(scheduleAutoplay));
  const dialogs = document.querySelectorAll('dialog');
  const dialogObserver = new MutationObserver(() => { updateCursorVisibility(); scheduleAutoplay(); });
  dialogs.forEach(dialog => {
    dialogObserver.observe(dialog, { attributes: true, attributeFilter: ['open'] });
    dialog.addEventListener('close', () => { updateCursorVisibility(); scheduleAutoplay(); });
  });
  finePointer.addEventListener('change', hideCursor);
  document.addEventListener('visibilitychange', () => {
    hideCursor();
    scheduleAutoplay();
  });
  reducedMotion.addEventListener('change', () => {
    colorPreview.clear();
    hoveredSlide = null;
    settle();
  });
  new ResizeObserver(resize).observe(viewport);
  resize();
}
