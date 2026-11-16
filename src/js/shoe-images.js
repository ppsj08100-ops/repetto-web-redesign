// Official source pixels, positioned inside the original transparent silhouettes.
const sources = {
  'shop-01-image84.png': ['shop-01-hq.jpg', 894, 894, 490, 490, 100, 100, 0, 0],
  'shop-03-image83.png': ['shop-03-hq.jpg', 2000, 2500, 490, 490, 100.498609, 125.623261, .192138, -16.311224],
  'shop-04-image205.png': ['shop-04-hq.jpg', 2000, 2500, 960, 1200, 100, 100, 0, 0],
  'shop-05-image206.png': ['shop-05-hq.jpg', 2000, 2500, 960, 1200, 100, 100, 0, 0],
  'shop-07-image229.png': ['shop-07-hq.jpg', 2000, 2500, 490, 490, 100.331284, 125.414105, -.238511, -16.275536],
  'shop-08-image230.png': ['shop-08-hq.jpg', 1800, 2250, 490, 490, 102.015251, 127.519064, -1.213387, -8.434645],
  'shop-09-image231.png': ['shop-09-hq.jpg', 1800, 2250, 490, 490, 75.473024, 94.34128, 13.358378, 7.908267],
  'shop-10-image232.png': ['shop-10-hq.jpg', 2000, 2500, 490, 490, 100.424502, 125.530627, -.595616, -16.804268],
};

export function renderShoeImage(original, alt, loading = 'lazy') {
  const source = sources[original];
  const fallback = original === 'shop-06-image204.png' ? [960, 1200] : [490, 490];
  const [file, width, height, canvasWidth, canvasHeight, fitWidth, fitHeight, left, top] = source || [original, ...fallback, ...fallback, 100, 100, 0, 0];
  const maskUrl = source ? new URL(`../../assets/images/${original}`, import.meta.url).href : '';
  const mask = source ? `--shoe-frame-mask:url('${maskUrl}');` : '';
  return `<span class="shoe-photo" style="--shoe-ratio:${canvasWidth / canvasHeight};${mask}"><img src="./assets/images/${file}" alt="${alt}" width="${width}" height="${height}" loading="${loading}" decoding="async" draggable="false" style="width:${fitWidth}%;height:${fitHeight}%;left:${left}%;top:${top}%" /></span>`;
}

export function renderShoeColorPreview(original, alt) {
  return `<span class="shoe-color-preview" data-shoe-colors="${original}">${renderShoeImage(original, alt)}</span>`;
}
