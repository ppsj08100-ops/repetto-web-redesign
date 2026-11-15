import { initEssentialGallery } from './essential.js';
import { initCircleHover } from './circle-hover.js';
import { initTryOnMotion } from './try-on-motion.js';
import { initBalletMotion } from './ballet-motion.js';
import { initAboutTypeMotion } from './about-type-motion.js';

const imageRoot = './assets/images/';

export const sectionAssets = [
  { nodeId: '640:631', file: 'about-dress-hq.png', width: 1271, height: 1386, kind: 'figma-export-2x' },
  { nodeId: '639:414', file: 'maison-store.png', width: 622, height: 933 },
  { nodeId: '639:423', file: 'popup-store-pop-up-v4.png', width: 424, height: 635, kind: 'imagegen-generated' },
  { nodeId: '639:385', file: 'essential-dancer.png', width: 494, height: 659 },
  { nodeId: '639:387', file: 'essential-boot.png', width: 494, height: 659 },
  { nodeId: '639:392', file: 'essential-sandal.png', width: 312, height: 416 },
  { nodeId: '639:394', file: 'essential-black.png', width: 312, height: 416 },
  { nodeId: '639:395', file: 'essential-pink.png', width: 312, height: 416 },
  { nodeId: '639:396', file: 'essential-red.png', width: 312, height: 416 },
  { nodeId: '639:440', file: 'ballet-video-poster.png', width: 1095, height: 1180, kind: 'video-poster' },
  { nodeId: '639:450', file: 'ballet-ellipse.png', width: 478, height: 644 },
];

export function ringLink(href, label, extraClass = '', nodeId = '', external = false) {
  return `<a class="editorial-ring-link ${extraClass}" href="${href}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''}${nodeId ? ` data-node-id="${nodeId}"` : ''}><span class="editorial-ring" aria-hidden="true"></span><span>${label}</span></a>`;
}

function storeMoreLink(nodeId) {
  const letters = ['V', 'I', 'E', 'W\u00a0', 'M', 'O', 'R', 'E'];
  return `<a class="editorial-ring-link store-more-link" href="#essential" aria-label="VIEW MORE" data-node-id="${nodeId}"><span class="editorial-ring" aria-hidden="true"></span><span class="store-link-label" aria-hidden="true">${letters.map((letter, i) => `<span class="store-link-letter" data-text="${letter}" style="--letter-index:${i + 1}">${letter}</span>`).join('')}</span></a>`;
}

function circleContents() {
  const letters = ['V', 'I', 'E', 'W', 'M', 'O', 'R', 'E'];
  return `<span class="circle-art" aria-hidden="true"><svg class="circle-svg" viewBox="0 0 264 264" focusable="false"><circle class="circle-outline" cx="132" cy="132" r="130"></circle><circle class="circle-trace" cx="132" cy="132" r="130"></circle></svg></span><span class="circle-text-motion" aria-hidden="true"><span class="circle-text-window">${letters.map((letter, i) => `<span class="circle-letter" data-text="${letter}" style="--character-index:${i + 1}">${letter}${i === 3 ? '&nbsp;' : ''}</span>`).join('')}</span></span>`;
}

export function editorialImage(file, alt, className, nodeId, width, height, style = '') {
  return `<img src="${imageRoot}${file}" alt="${alt}" class="${className}" data-node-id="${nodeId}" width="${width}" height="${height}" loading="lazy" decoding="async"${style ? ` style="${style}"` : ''}>`;
}

const essentialPhotos = [
  ['essential-pink.png', '리본과 깅엄 체크 디테일의 핑크 발레 슈즈', '639:395', 312, 416],
  ['essential-black.png', '진주 장식의 블랙 메리제인 슈즈', '639:394', 312, 416],
  ['essential-dancer.png', '핑크 드레스를 입고 움직이는 발레 무용수', '639:385', 494, 659],
  ['essential-boot.png', '그레이 팬츠와 짙은 가죽 앵클부츠', '639:387', 494, 659],
  ['essential-sandal.png', '깅엄 체크 안감이 있는 크림색 스트랩 슈즈', '639:392', 312, 416],
  ['essential-red.png', '레드 깅엄 배경 위의 버건디 스트랩 슈즈', '639:396', 312, 416],
];

function essentialCard([file, alt, node, width, height], index) {
  return `<figure class="essential-card essential-card-${index + 1}" data-essential-card="${index + 1}">${editorialImage(file, alt, 'essential-photo', node, width, height)}</figure>`;
}

function aboutStatement(lines, className, label) {
  let index = 0;
  return `<p class="about-statement ${className}" lang="en"><span class="visually-hidden">${label}</span>${lines.map(line => `<span class="about-type-line" aria-hidden="true">${line.map(([word, italic]) => `<span class="about-type-word${italic ? ' is-italic' : ''}"><span style="--word-index:${index++}">${word}</span></span>`).join(' ')}</span>`).join('')}</p>`;
}

export function renderSections() {
  return `
  <section id="about" class="editorial-section section-about" aria-labelledby="about-title" data-node-id="640:629">
    <h2 id="about-title" class="about-title" data-node-id="640:632">About</h2>
    <div class="about-story"><div class="about-visual">
      ${aboutStatement([[['YOUR'], ['MOST']], [['beautiful', true], ['MOVES']]], 'about-statement-first', 'Your most beautiful moves')}
      <div class="about-photo-layer">${editorialImage('about-dress-hq.png', '부드러운 블러시 핑크 튤 드레스', 'about-dress', '640:631', 1271, 1386)}</div>
      ${aboutStatement([[['START'], ['WITH']], [['TRUE'], ['freedom.', true]]], 'about-statement-second', 'Start with true freedom.')}
    <div class="about-copy">
      <p class="about-intro" lang="en" data-node-id="640:635">Movement, Grace &amp; Freedom<br>The Identity of Maison Repetto</p>
      <div class="about-body" lang="ko" data-node-id="640:636">
        <p>레페토의 이야기는 무용수의 움직임에서 시작되었습니다.</p>
        <p>춤이 지닌 자유와 감성을 무대 너머의 일상으로 전합니다.</p>
        <p>그 이야기는 오늘도 새로운 움직임과 영감으로 이어집니다.</p>
      </div>
      ${ringLink('#try-on', 'VIEW ALL', 'about-view-all', '640:634')}
    </div></div></div>
  </section>

  <section id="try-on" class="editorial-section section-try-on" aria-labelledby="try-on-title" data-node-id="639:411">
    <h2 id="try-on-title" class="try-on-title" aria-label="Try On" data-node-id="639:420">${['T', 'r', 'y\u00a0', 'O', 'n'].map((letter, i) => `<span aria-hidden="true" style="--letter-index:${i + 1}">${letter}</span>`).join('')}</h2>
    <div class="try-on-cards">
      <article class="store-card store-card-maison" data-node-id="639:412">
        <div class="store-photo" data-node-id="639:413">
          <span class="store-curtain" aria-hidden="true"></span>
          ${editorialImage('maison-store.png', '레페토 매장의 햇빛이 드는 실내와 슈즈 디스플레이', 'store-image maison-image', '639:414', 622, 933)}
        </div>
        <div class="store-copy" data-node-id="639:415">
          <h3 class="store-name" data-node-id="639:416">MAISON REPETTO</h3>
          <div class="store-details">
            <p class="store-description" lang="ko" data-node-id="639:418">매장에서 만나는 레페토</p>
            ${storeMoreLink('639:419')}
          </div>
        </div>
      </article>
      <article class="store-card store-card-popup" data-node-id="639:421">
        <div class="store-photo" data-node-id="639:422">
          <span class="store-curtain" aria-hidden="true"></span>
          ${editorialImage('popup-store-pop-up-v4.png', '피치색 곡선 진열과 발레바, 피팅 공간을 갖춘 레페토 팝업 매장 콘셉트', 'store-image popup-image', '639:423', 424, 635)}
        </div>
        <div class="store-copy" data-node-id="639:424">
          <h3 class="store-name" data-node-id="639:425">POP UP SHOP</h3>
          <div class="store-details">
            <p class="store-description" lang="ko" data-node-id="639:427">리본처럼 펼쳐지는 새로운 만남</p>
            ${storeMoreLink('639:428')}
          </div>
        </div>
      </article>
    </div>
  </section>

  <section id="essential" class="editorial-section section-essential" aria-labelledby="essential-title" data-node-id="639:379">
    <h2 id="essential-title" class="essential-title" aria-label="Essential" data-node-id="639:410">${[...'Essential'].map((letter, i) => `<span aria-hidden="true" style="--letter-index:${i + 1}">${letter}</span>`).join('')}</h2>
    <div class="essential-surface" data-node-id="639:380">
      <div class="essential-layout" data-node-id="639:383">
        <p class="essential-caption" lang="en" data-node-id="639:382">Repetto icons<br>from ballet flats<br>to boots and heels.</p>
        <div class="essential-mosaic">
          ${[0, 1, 2].map(column => `<div class="essential-column">${essentialPhotos.slice(column * 2, column * 2 + 2).map((photo, row) => essentialCard(photo, column * 2 + row)).join('')}</div>`).join('')}
        </div>
        <a href="#balletwear" class="editorial-circle-link essential-view-more" aria-label="VIEW MORE" data-node-id="639:388">${circleContents()}</a>
      </div>
    </div>
  </section>

  <section id="balletwear" class="editorial-section section-balletwear" aria-labelledby="balletwear-title" data-node-id="639:438">
    <h2 id="balletwear-title" class="balletwear-title" aria-label="Balletwear" data-node-id="639:448">${[...'Balletwear'].map((letter, i) => `<span aria-hidden="true" style="--letter-index:${i + 1}">${letter}</span>`).join('')}</h2>
    <div class="ballet-visual">
      <div class="ballet-film-window" data-node-id="639:439">
        <div class="ballet-film" data-node-id="639:440" data-video-src="">
          ${editorialImage('ballet-video-poster.png', '빛을 통과하는 핑크 리본과 Repetto Paris 로고', 'ballet-film-poster', '639:440', 1280, 720)}
        </div>
      </div>
      ${editorialImage('ballet-ellipse.png', '거울에 비치는 새틴 발레 슈즈와 리본', 'ballet-ellipse', '639:450', 478, 644)}
    </div>
    <div class="ballet-copy">
      <div class="ballet-text">
        <h3 class="ballet-subtitle" lang="en" aria-label="Custom Ballet Looks" data-node-id="639:444"><span class="ballet-custom" data-node-id="639:445">Custom</span><span class="ballet-shoes" data-node-id="639:446"><span>Ballet</span> <span>Looks</span></span></h3>
        <div class="ballet-description" lang="ko" data-node-id="639:441">
          <p data-node-id="639:442">다양한 움직임과 스타일을 위한 발레웨어로</p>
          <p data-node-id="639:443">나만의 우아한 발레 룩을 완성해 보세요.</p>
        </div>
      </div>
      <button type="button" class="editorial-circle-link ballet-view-more" aria-label="VIEW MORE" data-node-id="639:451" data-editorial-lightbox="ballet-ellipse.png" data-lightbox-label="Custom Ballet Looks">${circleContents()}</button>
    </div>
  </section>`;
}

export function initSections() {
  initAboutTypeMotion(document.querySelector('.section-about'));
  initEssentialGallery();
  initCircleHover();
  const tryOn = document.querySelector('.section-try-on');
  const tryOnTitle = tryOn?.querySelector('.try-on-title');
  const firstStorePhoto = tryOn?.querySelector('.store-card-maison .store-photo');
  const refreshTryOnMotion = initTryOnMotion(tryOn);
  // Keep the reference's title overlap with the retained Try On photos.
  const alignEditorialAnchors = () => {
    if (tryOnTitle && firstStorePhoto) {
      const section = tryOn.getBoundingClientRect();
      const photo = firstStorePhoto.getBoundingClientRect();
      const lineHeight = Number.parseFloat(getComputedStyle(tryOnTitle).lineHeight);
      // Keep the large title clear of captions when desktop photos become short.
      const top = matchMedia('(max-width: 768px)').matches
        ? photo.bottom - section.top - lineHeight + 15
        : photo.top - section.top + Math.min(400, photo.height - 24) - lineHeight;
      tryOn.style.setProperty('--try-on-title-top', `${top}px`);
      refreshTryOnMotion();
    }
  };
  const editorialResizeObserver = new ResizeObserver(alignEditorialAnchors);
  if (firstStorePhoto) editorialResizeObserver.observe(firstStorePhoto);
  document.fonts.ready.then(alignEditorialAnchors);
  window.addEventListener('resize', alignEditorialAnchors);
  alignEditorialAnchors();

  // Setting data-video-src to a local video path activates the original film.
  // Figma currently supplies its original poster, without the playable source.
  document.querySelectorAll('.ballet-film[data-video-src]').forEach((slot) => {
    const source = slot.dataset.videoSrc;
    if (!source) return;
    const poster = slot.querySelector('img');
    const video = document.createElement('video');
    video.src = source;
    video.poster = poster?.getAttribute('src') || '';
    video.muted = true;
    video.loop = true;
    video.autoplay = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    video.playsInline = true;
    video.controls = true;
    video.setAttribute('aria-label', 'Repetto Balletwear film');
    video.className = 'ballet-film-player';
    slot.replaceChildren(video);
  });
  initBalletMotion(document.querySelector('.section-balletwear'));

  const triggers = document.querySelectorAll('[data-editorial-lightbox]');
  if (!triggers.length) return;
  const dialog = document.createElement('dialog');
  dialog.className = 'editorial-lightbox';
  dialog.setAttribute('aria-labelledby', 'editorial-lightbox-title');
  dialog.innerHTML = '<div class="editorial-lightbox-inner"><button class="editorial-lightbox-close" type="button" aria-label="이미지 닫기">CLOSE <span aria-hidden="true">×</span></button><img alt=""><h2 id="editorial-lightbox-title"></h2></div>';
  document.body.append(dialog);
  let previousOverflow = '';
  triggers.forEach((trigger) => trigger.addEventListener('click', () => {
    dialog.querySelector('img').src = imageRoot + trigger.dataset.editorialLightbox;
    dialog.querySelector('img').alt = trigger.dataset.lightboxLabel;
    dialog.querySelector('h2').textContent = trigger.dataset.lightboxLabel;
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.showModal();
  }));
  dialog.querySelector('button').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.body.style.overflow = previousOverflow;
  });
}
