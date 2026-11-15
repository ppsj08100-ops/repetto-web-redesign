import { editorialImage } from './sections.js';

const stories = [
  {
    key: 'atelier', node: '647:891', name: 'Athlier', nameNode: '640:625',
    stackNode: '639:462', frameNodes: ['639:463', '639:464', '639:465'],
    location: 'DORDOGNE, FRANCE', locationNode: '647:862',
    title: '손에서 손으로', titleNode: '647:886', descriptionNode: '647:887',
    description: ['레페토의 장인들은 가죽을 다듬고', '마감하는 법을 다음 세대에 전합니다.'],
    alt: '작업대에서 발레 슈즈를 살펴보며 기술을 전하는 두 장인',
    back: { node: '652:986', x: .14, y: -1.25, width: 392, height: 587 },
    middle: { node: '653:989', x: -4.82, y: -3.86, width: 403.633, height: 601.278, imageWidth: 398.641, imageHeight: 597.961, rotate: -.48 },
    front: { node: '652:980', x: -8.96, y: -.36, width: 340, height: 510 },
  },
  {
    key: 'making', node: '652:903', name: 'Making', nameNode: '652:909',
    stackNode: '652:904', frameNodes: ['652:905', '652:906', '652:907'],
    location: 'COUSU-RETOURNÉ', locationNode: '652:913',
    title: '한 번의 뒤집기', titleNode: '652:911', descriptionNode: '652:912',
    description: ['갑피와 밑창을 안쪽에서 꿰맨 뒤 뒤집어', '발을 부드럽게 감싸는 슈즈를 만듭니다.'],
    alt: '장인이 손으로 가죽 슈즈의 모양을 다듬는 모습',
    back: { node: '653:998', x: .14, y: -1.25, width: 392, height: 588 },
    middle: { node: '653:995', x: -3.71, y: -3.02, width: 398.266, height: 595.356, imageWidth: 395.817, imageHeight: 593.726, rotate: -.24 },
    front: { node: '653:992', x: -.96, y: -.36, width: 340, height: 510 },
  },
  {
    key: 'materials', node: '652:914', name: 'Materials', nameNode: '652:920',
    stackNode: '652:915', frameNodes: ['652:916', '652:917', '652:918'],
    location: 'LEATHER &amp; FINISH', locationNode: '652:924',
    title: '결을 살리는 마감', titleNode: '652:922', descriptionNode: '652:923',
    description: ['장인은 부드러운 가죽을 고르고', '슈즈의 가장자리까지 매끄럽게 다듬습니다.'],
    alt: '매끄럽게 마감한 검정 페이턴트 리본 발레 플랫',
    back: { node: '653:1007', x: .14, y: -4.25, width: 393, height: 590 },
    middle: { node: '653:1004', x: -9.75, y: -12.95, width: 414.234, height: 610.675, imageWidth: 401.514, imageHeight: 602.271, rotate: -1.22 },
    front: { node: '653:1001', x: -13.96, y: -.36, width: 340, height: 510 },
  },
];

const percent = (value, total) => `${(value / total * 100).toFixed(6)}%`;
const box = (image, width, height) => `left:${percent(image.x, width)};top:${percent(image.y, height)};width:${percent(image.width, width)};height:${percent(image.height, height)}`;

function photo(story, layer, alt, style) {
  const asset = story[layer];
  return editorialImage(`savoir-${story.key}-${layer}.png`, alt, 'savoir-card-image', asset.node, 1024, 1536, style);
}

function cardStack(story) {
  const middle = story.middle;
  return `<figure class="savoir-stack" data-node-id="${story.stackNode}">
    <div class="savoir-card savoir-card-back" data-node-id="${story.frameNodes[0]}">${photo(story, 'back', '', box(story.back, 392.635, 585.851))}</div>
    <div class="savoir-middle-slot"><div class="savoir-card savoir-card-middle" data-node-id="${story.frameNodes[1]}">
      <div class="savoir-middle-image" style="${box(middle, 393.921, 585.829)}">${photo(story, 'middle', '', `left:50%;top:50%;width:${percent(middle.imageWidth, middle.width)};height:${percent(middle.imageHeight, middle.height)};transform:translate(-50%,-50%) rotate(${middle.rotate}deg)`)}</div>
    </div></div>
    <div class="savoir-card savoir-card-front" data-node-id="${story.frameNodes[2]}">${photo(story, 'front', story.alt, box(story.front, 312.424, 509.628))}</div>
  </figure>`;
}

export function renderSavoirFaire() {
  return `<section id="savoir-faire" class="editorial-section section-savoir-faire" aria-labelledby="savoir-faire-title" data-node-id="639:460">
    <h2 id="savoir-faire-title" class="savoir-title" data-node-id="639:461"><span>Savoir</span><span>Faire</span></h2>
    <div class="savoir-scroll"><div class="savoir-pin">
    <div class="savoir-viewport" id="savoir-stories" tabindex="0" role="region" aria-label="장인의 작업 이야기. 스크롤하거나 좌우 방향키로 탐색">
      <div class="savoir-track">${stories.map((story, i) => `<article class="savoir-story" role="group" aria-roledescription="slide" aria-label="${i + 1} / ${stories.length}: ${story.name}" aria-hidden="${i !== 0}" data-node-id="${story.node}">
        <h3 class="savoir-name" data-node-id="${story.nameNode}">${story.name}</h3>
        ${cardStack(story)}
        <div class="savoir-copy ${i === 0 ? 'savoir-copy-atelier' : ''}">
          <p class="savoir-location" data-node-id="${story.locationNode}">${story.location}</p>
          <h4 class="savoir-heading" data-node-id="${story.titleNode}">${story.title}</h4>
          <p class="savoir-description" data-node-id="${story.descriptionNode}">${story.description.join('<br> ')}</p>
        </div>
      </article>`).join('')}</div>
    </div>
    <div class="savoir-navigation">
      <p class="savoir-status slide-counter" aria-live="polite" aria-atomic="true"><span class="counter-value" data-savoir-current>1</span><span class="counter-divider" aria-hidden="true">/</span><span class="counter-value">3</span><span class="visually-hidden">번째 이야기</span></p>
      <div class="savoir-buttons"><button type="button" data-savoir-prev aria-controls="savoir-stories" aria-label="이전 장인 이야기" disabled>Prev</button><button type="button" data-savoir-next aria-controls="savoir-stories" aria-label="다음 장인 이야기">Next</button></div>
    </div>
    </div></div>
  </section>`;
}

export function initSavoirFaire() {
  const viewport = document.querySelector('.savoir-viewport');
  if (!viewport) return;
  const runway = viewport.closest('.savoir-scroll');
  const pin = viewport.closest('.savoir-pin');
  const slides = [...viewport.querySelectorAll('.savoir-story')];
  // Each group exposes its front, middle, then back photograph.
  const cards = slides.flatMap(slide => ['front', 'middle', 'back'].map(layer => slide.querySelector(`.savoir-card-${layer}`)));
  const prev = document.querySelector('[data-savoir-prev]');
  const next = document.querySelector('[data-savoir-next]');
  const current = document.querySelector('[data-savoir-current]');
  const staticMode = matchMedia('(prefers-reduced-motion: reduce), (max-height: 539px)');
  const clamp = value => Math.max(0, Math.min(1, value));
  const ease = value => value * value * (3 - 2 * value);
  const chapterHold = .6;
  const chapterPosition = index => index === 0 ? 0 : index * 3 + (index - 1) * chapterHold + chapterHold / 2;
  let active = 0;
  let enabled = false;
  let geometry;
  let frame = 0;
  let requested = null;
  let navigationTimer;
  let renderedState = '';
  let lastPhase = NaN;
  let sceneState = { inside: false, visible: false, distance: 0 };
  let measureFrame = 0;

  function updateActive(index) {
    active = index;
    const state = `${enabled}:${index}`;
    if (state === renderedState) return;
    renderedState = state;
    const label = String(active + 1);
    if (current.textContent !== label) current.textContent = label;
    prev.disabled = active === 0;
    next.disabled = active === slides.length - 1;
    slides.forEach((slide, i) => slide.setAttribute('aria-hidden', String(enabled && i !== active)));
  }

  function startY() {
    return runway.getBoundingClientRect().top + scrollY;
  }

  function paint() {
    frame = 0;
    if (enabled === staticMode.matches || (enabled && (geometry.width !== innerWidth || geometry.viewportHeight !== innerHeight))) {
      scheduleMeasure();
      return;
    }
    if (!enabled) {
      const center = innerHeight / 2;
      const rects = slides.map(slide => slide.getBoundingClientRect());
      const distances = rects.map(rect => Math.abs(rect.top + rect.height / 2 - center));
      sceneState = { inside: false, visible: rects.some(rect => rect.top < innerHeight && rect.bottom > 0), distance: 0 };
      updateActive(distances.indexOf(Math.min(...distances)));
      return;
    }

    const distance = scrollY - startY();
    sceneState = { inside: distance >= 0 && distance <= geometry.travel, visible: distance > -innerHeight && distance < geometry.travel + innerHeight, distance };
    const timeline = Math.max(0, (distance - geometry.lead) / geometry.step);
    let phase = timeline;
    // Let each new story settle before the next photograph starts moving.
    for (let chapter = 1; chapter < slides.length; chapter += 1) {
      phase -= Math.min(chapterHold, Math.max(0, timeline - (chapter * 3 + (chapter - 1) * chapterHold)));
    }
    phase = Math.min(cards.length - 1, phase);
    runway.dataset.timeline = timeline.toFixed(3);
    if (phase === lastPhase) return;
    lastPhase = phase;
    runway.dataset.phase = phase.toFixed(3);
    cards.forEach((card, i) => {
      const progress = clamp((phase - i - .16) / .72);
      const fly = ease(progress);
      card.style.setProperty('--fly-x', `${geometry.exitX * fly}px`);
      card.style.setProperty('--fly-y', `${geometry.exitY * fly}px`);
      card.style.setProperty('--fly-turn', `${-26 * fly}deg`);
      card.style.setProperty('--fly-scale', String(1 - .12 * fly));
      card.style.visibility = progress === 1 ? 'hidden' : 'visible';
      card.classList.toggle('is-flying', progress > 0 && progress < 1);
    });

    slides.forEach((slide, i) => {
      const boundary = i * 3;
      const nextBoundary = (i + 1) * 3;
      const stackEnter = i === 0 ? 1 : ease(clamp((phase - (boundary - .9)) / .8));
      const nameEnter = i === 0 ? 1 : ease(clamp((phase - (boundary - .45)) / .33));
      const copyEnter = i === 0 ? 1 : ease(clamp((phase - (boundary - .36)) / .34));
      const nameLeave = i === slides.length - 1 ? 0 : ease(clamp((phase - (nextBoundary - .7)) / .25));
      const copyLeave = i === slides.length - 1 ? 0 : ease(clamp((phase - (nextBoundary - .62)) / .26));
      slide.style.setProperty('--stack-opacity', String(stackEnter));
      slide.style.setProperty('--stack-x', `${(1 - stackEnter) * 24}px`);
      slide.style.setProperty('--stack-y', `${(1 - stackEnter) * 40}px`);
      slide.style.setProperty('--stack-turn', `${(1 - stackEnter) * -2}deg`);
      slide.style.setProperty('--stack-scale', String(.96 + stackEnter * .04));
      slide.style.setProperty('--name-opacity', String(nameEnter * (1 - nameLeave)));
      slide.style.setProperty('--copy-opacity', String(copyEnter * (1 - copyLeave)));
      slide.style.setProperty('--name-shift', `${(1 - nameEnter) * 14 - nameLeave * 10}px`);
      slide.style.setProperty('--copy-shift', `${(1 - copyEnter) * 12 - copyLeave * 8}px`);
    });
    updateActive(Math.min(slides.length - 1, Math.floor((phase + .28) / 3)));
  }

  function schedule() {
    if (!frame) frame = requestAnimationFrame(paint);
  }

  function scheduleMeasure() {
    if (!measureFrame) measureFrame = requestAnimationFrame(measure);
  }

  function measure() {
    measureFrame = 0;
    lastPhase = NaN;
    const previous = geometry;
    // Resize can reflow every preceding section and move the browser's scroll anchor.
    // Preserve the last painted position instead of reading a now-invalid old offset.
    const local = sceneState.distance;
    const inside = enabled && sceneState.inside;
    const wasEnabled = enabled;
    const visibleStory = !wasEnabled && sceneState.visible;
    enabled = !staticMode.matches;
    runway.classList.toggle('is-scroll-ready', enabled);
    runway.classList.toggle('is-static', !enabled);

    if (enabled) {
      const height = pin.clientHeight;
      const lead = height * .3;
      const step = Math.max(240, height * .58);
      const travel = lead + step * (cards.length - 1 + (slides.length - 1) * chapterHold) + height * .45;
      runway.style.setProperty('--savoir-travel', `${travel}px`);
      geometry = {
        start: startY(), lead, step, travel,
        width: innerWidth, viewportHeight: innerHeight,
        exitX: -innerWidth * .65 - 160,
        exitY: -height * .65 - 160,
      };
      if (inside) {
        scrollTo({ top: geometry.start + local / previous.travel * travel, behavior: 'instant' });
      } else if (!wasEnabled && visibleStory) {
        scrollTo({ top: geometry.start + lead + chapterPosition(active) * step, behavior: 'instant' });
      }
    } else {
      runway.style.removeProperty('--savoir-travel');
      delete runway.dataset.phase;
      delete runway.dataset.timeline;
      cards.forEach(card => {
        ['--fly-x', '--fly-y', '--fly-turn', '--fly-scale', 'visibility'].forEach(property => card.style.removeProperty(property));
        card.classList.remove('is-flying');
      });
      slides.forEach(slide => {
        ['--stack-opacity', '--stack-x', '--stack-y', '--stack-turn', '--stack-scale', '--name-opacity', '--copy-opacity', '--name-shift', '--copy-shift'].forEach(property => slide.style.removeProperty(property));
      });
      geometry = null;
      if (inside) slides[active].scrollIntoView({ block: 'center', behavior: 'instant' });
    }
    paint();
  }

  function goTo(index) {
    requested = Math.max(0, Math.min(slides.length - 1, index));
    if (enabled) {
      scrollTo({ top: startY() + geometry.lead + chapterPosition(requested) * geometry.step, behavior: 'smooth' });
    } else {
      slides[requested].scrollIntoView({ block: 'center', behavior: 'instant' });
    }
    clearTimeout(navigationTimer);
    navigationTimer = setTimeout(() => { requested = null; }, 1200);
  }

  prev.addEventListener('click', () => goTo((requested ?? active) - 1));
  next.addEventListener('click', () => goTo((requested ?? active) + 1));
  viewport.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    if (event.key === 'Home') goTo(0);
    else if (event.key === 'End') goTo(slides.length - 1);
    else goTo((requested ?? active) + (event.key === 'ArrowRight' ? 1 : -1));
  });
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', scheduleMeasure, { passive: true });
  window.addEventListener('scrollend', () => { requested = null; });
  staticMode.addEventListener('change', scheduleMeasure);
  // Prepare the hidden layers shortly before entry, without loading them at the hero.
  const preload = new IntersectionObserver(entries => {
    if (!entries.some(entry => entry.isIntersecting)) return;
    viewport.querySelectorAll('img').forEach(image => { image.loading = 'eager'; });
    preload.disconnect();
  }, { rootMargin: '120% 0px' });
  preload.observe(runway);
  document.fonts.ready.then(scheduleMeasure);
  measure();
}
