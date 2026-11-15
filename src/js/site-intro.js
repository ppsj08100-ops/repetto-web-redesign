const seenKey = 'repetto:intro:v1';

// Keep the optional opening separate from the page and its carousel clocks.
export function initSiteIntro({ onReveal = () => {} } = {}) {
  const overlay = document.querySelector('#site-intro');
  const stage = overlay?.querySelector('.intro-stage');
  const app = document.querySelector('#app');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let seen = false;
  try { seen = sessionStorage.getItem(seenKey) === '1'; } catch {}

  if (!overlay || !stage || seen || reduced.matches || location.hash || document.hidden) {
    overlay?.remove();
    document.documentElement.dataset.introState = 'skipped';
    onReveal();
    return Promise.resolve();
  }

  try { sessionStorage.setItem(seenKey, '1'); } catch {}
  const skip = overlay.querySelector('.intro-skip');
  const wasInert = app.inert;
  const root = document.documentElement;
  let finishPromise;
  const complete = new Promise(resolve => { finishPromise = resolve; });
  let finished = false;
  let cleaned = false;
  let frame = 0;
  let renderer;
  let musicBox;
  let environment;
  let lightMap;
  let floor;
  let canvas;
  let watchdog;
  let fadeTimer;
  let resize = () => {};

  overlay.hidden = false;
  app.inert = true;
  root.classList.add('has-site-intro');
  root.dataset.introState = 'loading';

  function cleanup() {
    if (cleaned) return;
    cleaned = true;
    cancelAnimationFrame(frame);
    clearTimeout(watchdog);
    clearTimeout(fadeTimer);
    window.removeEventListener('resize', onResize);
    window.removeEventListener('pagehide', onPageHide);
    document.removeEventListener('keydown', onKeyDown);
    document.removeEventListener('visibilitychange', onVisibility);
    reduced.removeEventListener('change', onMotionChange);
    skip.removeEventListener('click', onSkip);
    canvas?.removeEventListener('webglcontextlost', onContextLost);
    const restoreFocus = overlay.contains(document.activeElement);
    try {
      musicBox?.dispose?.();
      environment?.dispose();
      lightMap?.dispose();
      floor?.geometry.dispose();
      floor?.material.map?.dispose();
      floor?.material.dispose();
      renderer?.dispose();
      renderer?.forceContextLoss();
    } finally {
      overlay.remove();
      app.inert = wasInert;
      root.classList.remove('has-site-intro');
      root.dataset.introState = 'complete';
      if (restoreFocus) document.querySelector('.menu-toggle')?.focus({ preventScroll: true });
      finishPromise();
    }
  }

  function reveal(immediate = false) {
    if (finished) {
      if (immediate) cleanup();
      return;
    }
    finished = true;
    clearTimeout(watchdog);
    cancelAnimationFrame(frame);
    root.dataset.introState = 'revealing';
    overlay.classList.add('is-leaving');
    // Start the existing photograph reveal underneath the fading ivory screen.
    try { onReveal(); } finally {
      if (immediate || reduced.matches) cleanup();
      else fadeTimer = setTimeout(cleanup, 580);
    }
  }

  const onSkip = () => reveal();
  const onResize = () => resize();
  const onKeyDown = event => {
    if (event.key === 'Escape') {
      event.preventDefault();
      reveal();
    }
  };
  const onVisibility = () => { if (document.hidden) reveal(true); };
  const onPageHide = () => reveal(true);
  const onMotionChange = () => { if (reduced.matches) reveal(true); };
  const onContextLost = event => { event.preventDefault(); reveal(true); };

  skip.addEventListener('click', onSkip);
  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('visibilitychange', onVisibility);
  window.addEventListener('pagehide', onPageHide);
  window.addEventListener('resize', onResize);
  reduced.addEventListener('change', onMotionChange);
  watchdog = setTimeout(() => reveal(true), 4200);

  async function start() {
    try {
      const [THREE, { createMusicBox }] = await Promise.all([
        import('../../assets/vendor/three/three.module.js'),
        import('./music-box-model.js'),
      ]);
      if (finished) return;

      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
      renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
      renderer.setClearColor(0x000000, 0);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = .9;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      canvas = renderer.domElement;
      canvas.setAttribute('aria-hidden', 'true');
      canvas.addEventListener('webglcontextlost', onContextLost);
      stage.append(canvas);

      const scene = new THREE.Scene();
      scene.environmentIntensity = .7;
      const camera = new THREE.OrthographicCamera(-1.68, 1.68, 1.68, -1.68, .1, 30);
      camera.position.set(3.4, 3, 5.2);
      camera.lookAt(0, 1, 0);
      scene.add(new THREE.HemisphereLight(0xfffcf5, 0xc8bdaf, 1.2));
      const key = new THREE.DirectionalLight(0xfff7e9, 2.2);
      key.position.set(-3, 5, 5);
      key.castShadow = true;
      key.shadow.mapSize.set(1024, 1024);
      Object.assign(key.shadow.camera, { left: -3, right: 3, top: 3, bottom: -3, near: .1, far: 14 });
      key.shadow.bias = -.0003;
      key.shadow.normalBias = .015;
      key.shadow.radius = 4;
      scene.add(key);
      const fill = new THREE.DirectionalLight(0xf5f2ff, .7);
      fill.position.set(4, 2.5, -3);
      scene.add(fill);

      // Broad studio reflections give the lacquer and fine metal a soft finish.
      const faces = Array.from({ length: 6 }, (_, index) => {
        const face = document.createElement('canvas');
        face.width = face.height = 128;
        const context = face.getContext('2d');
        const wash = context.createLinearGradient(0, 0, 0, 128);
        wash.addColorStop(0, '#fffdf8');
        wash.addColorStop(.55, index === 3 ? '#b7ada2' : '#e5ddd1');
        wash.addColorStop(1, '#c8bbaa');
        context.fillStyle = wash;
        context.fillRect(0, 0, 128, 128);
        if (index !== 3) {
          context.fillStyle = '#ffffff';
          context.fillRect(20, 8, 32, 85);
          context.fillStyle = '#f5f1e9';
          context.fillRect(84, 16, 20, 76);
        }
        return face;
      });
      lightMap = new THREE.CubeTexture(faces);
      lightMap.colorSpace = THREE.SRGBColorSpace;
      lightMap.needsUpdate = true;
      const pmrem = new THREE.PMREMGenerator(renderer);
      environment = pmrem.fromCubemap(lightMap);
      scene.environment = environment.texture;
      pmrem.dispose();

      musicBox = createMusicBox();
      scene.add(musicBox.group);
      const shadowCanvas = document.createElement('canvas');
      shadowCanvas.width = shadowCanvas.height = 128;
      const shadowContext = shadowCanvas.getContext('2d');
      const shadow = shadowContext.createRadialGradient(64, 64, 6, 64, 64, 64);
      shadow.addColorStop(0, 'rgba(62, 48, 36, .2)');
      shadow.addColorStop(.5, 'rgba(62, 48, 36, .1)');
      shadow.addColorStop(1, 'rgba(62, 48, 36, 0)');
      shadowContext.fillStyle = shadow;
      shadowContext.fillRect(0, 0, 128, 128);
      const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
      floor = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 2.7), new THREE.MeshBasicMaterial({
        map: shadowTexture, transparent: true, depthWrite: false, toneMapped: false,
      }));
      floor.rotation.x = -Math.PI / 2;
      floor.position.y = .01;
      scene.add(floor);

      resize = () => renderer.setSize(stage.clientWidth, stage.clientHeight, false);
      resize();
      overlay.classList.add('is-ready');
      root.dataset.introState = 'playing';
      const started = performance.now();
      const duration = 2300;
      const draw = now => {
        if (finished) return;
        const elapsed = now - started;
        musicBox.update(Math.min(elapsed / duration, 1), elapsed / 1000);
        renderer.render(scene, camera);
        if (elapsed >= duration) reveal();
        else frame = requestAnimationFrame(draw);
      };
      draw(started);
    } catch (error) {
      // An unavailable renderer must never keep the actual site covered.
      root.dataset.introFallback = error?.name || 'unavailable';
      reveal(true);
    }
  }

  start();
  return complete;
}
