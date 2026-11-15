import * as THREE from '../../assets/vendor/three/three.module.js';
import { createBalletMannequin } from './about-mannequin.js';

const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
const between = (value, start, end) => clamp((value - start) / (end - start));
const inOutQuad = value => value < .5 ? 2 * value * value : 1 - (-2 * value + 2) ** 2 / 2;
const mix = (a, b, value) => a + (b - a) * value;

export function mountAboutScene(section, reduced) {
  const slot = section.querySelector('.about-scene');
  const scroll = section.querySelector('.about-scroll');
  const stage = section.querySelector('.about-visual');
  const quote = section.querySelector('.about-quote');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  let renderer;
  let model;
  try {
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    model = createBalletMannequin(THREE);
  } catch {
    renderer?.dispose();
    section.classList.remove('has-about-3d', 'is-about-scene-ready');
    return;
  }
  const scene = new THREE.Scene();
  scene.add(new THREE.HemisphereLight(0xfffcf8, 0x9d8f8d, .9));
  const light = (color, intensity, x, y, z) => {
    const lamp = new THREE.DirectionalLight(color, intensity);
    lamp.position.set(x, y, z);
    scene.add(lamp);
    return lamp;
  };
  const key = light(0xfff8f2, 3.5, -3, 5, 5);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4, near: .5, far: 20 });
  key.shadow.camera.updateProjectionMatrix();
  key.shadow.normalBias = .008;
  key.shadow.bias = -.0001;
  light(0xe6edff, .3, 4, 1, 2);
  light(0xffffff, 1.1, 0, 3, -4);
  const pivot = new THREE.Group();
  pivot.add(model);
  scene.add(pivot);
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, .1, 40);
  camera.position.set(0, 1, 10);
  const canvas = renderer.domElement;
  canvas.className = 'about-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  slot.append(canvas);

  let enabled = false;
  let contextLost = false;
  let visible = false;
  let frame = 0;
  let lastTime = 0;
  let start = 0;
  let travel = 1;
  let width = 1;
  let height = 1;
  let progress = 0;
  let dirty = true;
  let pointerX = 0;
  let pointerY = 0;
  let tiltX = 0;
  let tiltY = 0;

  const request = () => {
    dirty = true;
    if (!frame && enabled && visible && !document.hidden) frame = requestAnimationFrame(render);
  };
  function render(time) {
    frame = 0;
    if (!enabled || !visible || document.hidden) return;
    const elapsed = lastTime ? Math.min(time - lastTime, 50) : 16.67;
    lastTime = time;
    progress = clamp((window.scrollY - start) / travel);
    const timeline = mix(50, 350, progress);
    const damp = 1 - Math.exp(-.003 * elapsed);
    tiltX += (pointerY * Math.PI * .01 - tiltX) * damp;
    tiltY += (pointerX * Math.PI * .05 - tiltY) * damp;
    pivot.rotation.set(tiltX, -Math.PI * 2 * progress + tiltY, 0);

    // Match Vero's orthographic sweep from the bodice down to the tulle hem.
    const cameraProgress = between(timeline, 50, 337);
    const cameraY = mix(1.05, -1.15, cameraProgress);
    camera.position.y = cameraY + .65;
    const viewHeight = mix(3.6, 4.2, between(timeline, 200, 300));
    const halfHeight = viewHeight / 2;
    camera.left = -halfHeight * width / height;
    camera.right = halfHeight * width / height;
    camera.top = halfHeight;
    camera.bottom = -halfHeight;
    camera.updateProjectionMatrix();
    camera.lookAt(0, cameraY, 0);

    const enter = inOutQuad(between(timeline, 96, 133));
    const rise = inOutQuad(between(timeline, 208, 298));
    const fade = 1 - inOutQuad(between(timeline, 240, 280));
    quote.style.transform = `translate3d(-50%, ${mix(100, 0, enter) - rise * Math.min(620, height * .62)}px, 0)`;
    quote.style.opacity = String(enter * fade);
    renderer.render(scene, camera);
    section.classList.add('is-about-scene-ready');
    // Useful for inspecting the scrub state without holding WebGL objects globally.
    slot.dataset.progress = progress.toFixed(4);
    slot.dataset.rotation = pivot.rotation.y.toFixed(4);
    dirty = false;
    if (Math.abs(pointerX * Math.PI * .05 - tiltY) + Math.abs(pointerY * Math.PI * .01 - tiltX) > .0001) request();
  }
  const measure = () => {
    if (!enabled) return;
    const rect = stage.getBoundingClientRect();
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    start = window.scrollY + scroll.getBoundingClientRect().top;
    travel = Math.max(1, scroll.offsetHeight - height);
    renderer.setSize(width, height, false);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
    request();
  };
  const syncMode = () => {
    enabled = !reduced.matches && !contextLost;
    section.classList.toggle('has-about-3d', enabled);
    if (enabled) measure();
    else {
      section.classList.remove('is-about-scene-ready');
      cancelAnimationFrame(frame);
      frame = 0;
      lastTime = 0;
      quote.style.removeProperty('transform');
      quote.style.removeProperty('opacity');
    }
  };
  const visibility = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    lastTime = 0;
    if (visible) request();
    else { cancelAnimationFrame(frame); frame = 0; }
  });
  visibility.observe(stage);
  const resize = new ResizeObserver(measure);
  resize.observe(stage);
  window.addEventListener('resize', measure);
  window.addEventListener('scroll', request, { passive: true });
  stage.addEventListener('pointermove', event => {
    if (!finePointer.matches || event.pointerType === 'touch') return;
    const rect = stage.getBoundingClientRect();
    pointerX = clamp((event.clientX - rect.left) / width * 2 - 1, -1, 1);
    pointerY = clamp((event.clientY - rect.top) / height * 2 - 1, -1, 1);
    request();
  }, { passive: true });
  const resetPointer = () => { pointerX = 0; pointerY = 0; request(); };
  stage.addEventListener('pointerleave', resetPointer);
  finePointer.addEventListener('change', resetPointer);
  reduced.addEventListener('change', syncMode);
  document.addEventListener('visibilitychange', () => {
    lastTime = 0;
    if (document.hidden) { cancelAnimationFrame(frame); frame = 0; }
    else if (dirty) request();
  });
  canvas.addEventListener('webglcontextlost', event => {
    event.preventDefault();
    contextLost = true;
    syncMode();
  });
  canvas.addEventListener('webglcontextrestored', () => {
    contextLost = false;
    syncMode();
  });
  document.fonts.ready.then(measure);
  window.addEventListener('pagehide', event => {
    if (event.persisted) return;
    cancelAnimationFrame(frame);
    visibility.disconnect();
    resize.disconnect();
    model.userData.dispose?.();
    renderer.dispose();
  });
  syncMode();
}
