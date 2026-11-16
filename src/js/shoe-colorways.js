import { shoeColorPalettes } from './shoe-color-palette.js';

const clamp = (value, low = 0, high = 1) => Math.max(low, Math.min(high, value));
function makeCanvas(width, height, frequentReads = false) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d', { willReadFrequently: frequentReads });
  if (!context) throw new Error('Canvas is unavailable');
  return { canvas, context };
}
async function loadImage(url) {
  const image = new Image();
  image.decoding = 'async';
  image.src = url;
  await image.decode();
  return image;
}
// Solve cubic-bezier(.25, 1, .5, 1), matching the site's existing easing.
function ease(progress) {
  let low = 0;
  let high = 1;
  let t = progress;
  for (let i = 0; i < 9; i += 1) {
    const x = 3 * .25 * (1 - t) ** 2 * t + 3 * .5 * (1 - t) * t ** 2 + t ** 3;
    if (x < progress) low = t;
    else high = t;
    t = (low + high) / 2;
  }
  return 1 - (1 - t) ** 3;
}
async function prepareModel(preview, palette) {
  const original = preview.dataset.shoeColors;
  const photo = preview.querySelector('.shoe-photo');
  const sourceElement = photo?.querySelector('img');
  if (!sourceElement) throw new Error('Product photograph is unavailable');
  const maskUrl = new URL(`../../assets/images/${original}`, import.meta.url).href;
  const [source, originalMask] = await Promise.all([
    loadImage(sourceElement.currentSrc || sourceElement.src), loadImage(maskUrl),
  ]);
  const density = originalMask.naturalWidth === 490 && original !== 'shop-02-image82.png' ? 2 : 1;
  const width = originalMask.naturalWidth * density;
  const height = originalMask.naturalHeight * density;
  const { context } = makeCanvas(width, height, true);
  context.imageSmoothingQuality = 'high';
  const percent = (property, fallback) => Number.parseFloat(sourceElement.style[property]) / 100 || fallback;
  context.drawImage(source,
    width * percent('left', 0), height * percent('top', 0),
    width * percent('width', 1), height * percent('height', 1));
  // HQ photographs need the existing PNG mask. Original PNGs already contain
  // their alpha and must not have that same mask applied twice.
  if (photo.style.getPropertyValue('--shoe-frame-mask')) {
    context.globalCompositeOperation = 'destination-in';
    context.drawImage(originalMask, 0, 0, width, height);
    context.globalCompositeOperation = 'source-over';
  }
  const base = context.getImageData(0, 0, width, height);
  const pixels = base.data;
  const { canvas: alpha, context: alphaContext } = makeCanvas(width, height);
  const alphaData = alphaContext.createImageData(width, height);
  for (let offset = 3; offset < pixels.length; offset += 4) alphaData.data[offset] = pixels[offset];
  alphaContext.putImageData(alphaData, 0, 0);

  function rgbFrame(name, imageData) {
    const { canvas, context: frameContext } = makeCanvas(width, height);
    const data = frameContext.createImageData(width, height);
    data.data.set(imageData.data);
    // Blend opaque photograph RGB first, then apply the original alpha once.
    for (let offset = 3; offset < data.data.length; offset += 4) data.data[offset] = 255;
    frameContext.putImageData(data, 0, 0);
    return { name, canvas };
  }
  const variants = await Promise.all(palette.colors.map(async color => {
    try {
      const url = new URL(`../../assets/images/colorways-fixed/${color.file}`, import.meta.url).href;
      const image = await loadImage(url);
      if (image.naturalWidth !== width || image.naturalHeight !== height) return null;
      context.clearRect(0, 0, width, height);
      context.drawImage(image, 0, 0);
      return rgbFrame(color.name, context.getImageData(0, 0, width, height));
    } catch {
      return null;
    }
  }));
  const frames = [rgbFrame('original', base), ...variants.filter(Boolean)];
  if (frames.length < 2) throw new Error('Registered color photograph is unavailable');
  return { width, height, alpha, frames };
}

export function createShoeColorPreview(reducedMotion) {
  const preparedModels = new Map();
  const surfaces = new WeakMap();
  let current = null, timer, animation, generation = 0;
  function clear() {
    generation += 1;
    clearTimeout(timer); cancelAnimationFrame(animation);
    if (current) {
      current.classList.remove('is-previewing');
      const surface = surfaces.get(current);
      if (surface) {
        // Keep one element per wrapper without retaining clone-sized buffers.
        surface.canvas.width = 0; surface.canvas.height = 0;
        surface.canvas.dataset.color = 'original';
      }
    }
    current = null;
  }
  function load(preview, palette) {
    const key = preview.dataset.shoeColors;
    if (preparedModels.has(key)) {
      const cached = preparedModels.get(key);
      preparedModels.delete(key); preparedModels.set(key, cached);
      return cached;
    }
    const promise = prepareModel(preview, palette).catch(error => {
      if (preparedModels.get(key) === promise) preparedModels.delete(key);
      throw error;
    });
    preparedModels.set(key, promise);
    while (preparedModels.size > 3) preparedModels.delete(preparedModels.keys().next().value);
    return promise;
  }
  async function show(slide) {
    const preview = slide?.querySelector('.shoe-color-preview');
    if (preview === current) return;
    clear();
    const palette = preview && shoeColorPalettes[preview.dataset.shoeColors];
    if (!palette?.colors.length) return;
    current = preview;
    const token = generation;
    let model;
    try { model = await load(preview, palette); }
    catch { return; } // A decoding failure leaves the original photograph visible.
    if (token !== generation) return;
    let surface = surfaces.get(preview);
    if (!surface) {
      surface = makeCanvas(model.width, model.height);
      surface.canvas.className = 'shoe-color-surface';
      surface.canvas.setAttribute('aria-hidden', 'true');
      preview.append(surface.canvas); surfaces.set(preview, surface);
    }
    surface.canvas.width = model.width; surface.canvas.height = model.height;
    const { canvas, context } = surface;
    function render(from, to, progress) {
      context.globalAlpha = 1; context.globalCompositeOperation = 'copy';
      context.drawImage(from.canvas, 0, 0);
      context.globalCompositeOperation = 'source-over'; context.globalAlpha = progress;
      context.drawImage(to.canvas, 0, 0);
      context.globalAlpha = 1; context.globalCompositeOperation = 'destination-in';
      context.drawImage(model.alpha, 0, 0);
      context.globalCompositeOperation = 'source-over';
      canvas.dataset.color = to.name;
    }
    function transition(from, to) {
      cancelAnimationFrame(animation);
      if (reducedMotion.matches) { render(from, to, 1); return; }
      const started = performance.now();
      function tick(now) {
        if (token !== generation) return;
        const progress = clamp((now - started) / 600);
        render(from, to, progress === 1 ? 1 : ease(progress));
        if (progress < 1) animation = requestAnimationFrame(tick);
      }
      animation = requestAnimationFrame(tick);
    }
    render(model.frames[0], model.frames[0], 1);
    preview.classList.add('is-previewing');
    let frame = 1;
    transition(model.frames[0], model.frames[frame]);
    if (reducedMotion.matches) return;
    function advance() {
      if (token !== generation) return;
      const previous = frame;
      frame = (frame + 1) % model.frames.length;
      transition(model.frames[previous], model.frames[frame]);
      timer = setTimeout(advance, 1600);
    }
    timer = setTimeout(advance, 1600);
  }
  return { show, clear };
}
