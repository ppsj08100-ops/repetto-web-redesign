import { renderSections, initSections } from './sections.js';
import { renderSavoirFaire, initSavoirFaire } from './savoir.js';
import { renderBrandNews } from './news.js';
import { renderFooter } from './footer.js';
import { initShopCarousel } from './shop.js';
import { renderShoeImage, renderShoeColorPreview } from './shoe-images.js';
import { initHeroCarousel } from './hero-motion.js';
import { initSiteIntro } from './site-intro.js';

const image = name => `./assets/images/${name}`;
const heroImages = ['hero-01.png', 'hero-02.png', 'hero-03.png', 'hero-04.png'];
const products = [
  ['shop-01-image84.png', '분홍 리본 스트랩 발레 플랫', 31, -233, 909, 909, 'SOPHIA'],
  ['shop-02-image82.png', '크림색 리본 발레 플랫', 0, -349, 971, 971, 'CENDRILLON'],
  ['shop-03-image83.png', '진주 스트랩 블랙 메리제인 슈즈', 0, -374, 971, 971, 'ROSE PERLE'],
  ['shop-04-image205.png', '레드 페이턴트 발레 펌프스', 0, -532, 960, 1200, 'CAMILLE'],
  ['shop-05-image206.png', '브라운 가죽 앵클 부츠', 56, -360, 860, 1075, 'PHOEBE METALLIC BOW ANKLE BOOTS'],
  ['shop-06-image204.png', '베이지 스웨이드 레이스업 슈즈', 86, 124, 957, 373, 'ZIZI GOMME'],
  ['shop-07-image229.png', '아일렛 장식 네이비 데님 뮬', 13, -324, 946, 946, 'CAMILLE MULES'],
  ['shop-08-image230.png', '화이트 크로스밴드 슬립온', 103, -219, 765, 765, 'DANCE SNEAKERS'],
  ['shop-09-image231.png', '연분홍 패딩 스노 부츠', 66, -154, 840, 840, 'GENTIANE BOOTS'],
  ['shop-10-image232.png', '블랙 시스루 패널 펌프스', 93, -219, 763, 763, 'LAURINE'],
];
const menuItems = [['POP UP SHOP', '#try-on'], ['MAISON REPETTO', '#try-on'], ['BALLET STUDIO', '#balletwear'], ['BALLETWEAR', '#balletwear'], ['ESSENTIAL', '#essential'], ['ABOUT', '#about'], ['SAVOIR FAIRE', '#savoir-faire'], ['BRAND NEWS', '#news']];

document.querySelector('#app').innerHTML = `
  <header class="site-header" id="top" data-node-id="639:330">
    <div class="header-inner">
    <a class="wordmark" href="#top" aria-label="Repetto 홈">REPETTO</a>
    <nav class="desktop-nav" aria-label="주요 메뉴">
      <div><a href="#try-on">POP UP SHOP</a><a href="#news">NEWS</a></div>
      <div><a href="#try-on">MAISON REPETTO</a><a href="#balletwear">BALLET STUDIO</a></div>
      <div><a href="#balletwear">BALLETWEAR</a><a href="#essential">ESSENTIAL</a></div>
      <div><a href="#about">ABOUT</a><a href="#savoir-faire">SAVOIR FAIRE</a></div>
    </nav>
    <button class="menu-toggle" type="button" aria-haspopup="dialog" aria-controls="site-menu" aria-expanded="false"><span class="menu-dot" aria-hidden="true"></span>MENU</button>
    </div>
  </header>
  <main id="main">
    <div class="opening">
      <section class="hero" aria-label="Repetto 컬렉션" aria-roledescription="carousel">
        <h1 class="visually-hidden">REPETTO — Movement, Grace & Freedom</h1>
        <div class="hero-visual" data-node-id="639:365">
          <div class="hero-photo-stage" tabindex="0" aria-label="컬렉션 이미지. 방향키로 사진 변경" data-node-id="639:371">
            ${heroImages.map((src, i) => `<div class="hero-slide ${i === 0 ? 'is-active' : ''}" data-slide="${i}" aria-hidden="${i !== 0}"><img src="${image(src)}" alt="핑크빛 발레 의상과 Repetto 슈즈를 착용한 모델 — 컬렉션 ${i + 1}" ${i ? 'loading="lazy"' : 'fetchpriority="high"'} draggable="false" /></div>`).join('')}
          </div>
          <div class="hero-brand-panel" data-node-id="639:366"><p class="hero-brand">REPETTO</p><div class="hero-caption"><span>BALLET HERITAGE SINCE 1947</span><span>FRENCH ARTISANAL SPIRIT</span></div></div>
          <div class="hero-side-track">
            <div class="hero-side">
              <div class="hero-controls"><button type="button" data-hero-prev aria-label="이전 컬렉션 이미지">Prev</button><button type="button" data-hero-next aria-label="다음 컬렉션 이미지">Next</button></div>
              <p class="hero-count slide-counter" aria-live="polite" aria-atomic="true"><span class="counter-value" id="hero-current">1</span><span class="hero-count-divider counter-divider" aria-hidden="true">/</span><span class="counter-value">${heroImages.length}</span></p>
            </div>
          </div>
        </div>
      </section>
      <section class="shop" id="shop" aria-label="Repetto 슈즈 컬렉션" data-node-id="639:332">
        <div class="shop-intro"><p lang="ko">프랑스 장인의 섬세한 손끝에서 탄생한 레페토의 발레 슈즈<br /> 무대의 우아함을 일상으로, 당신의 걸음에 가벼움을 더합니다</p><a class="ring-link about-link" href="#about"><span class="ring" aria-hidden="true"></span>ABOUT US</a></div>
        <button class="shop-count slide-counter" type="button" aria-label="다음 슈즈 보기"><span class="counter-value" id="shop-current">1</span><span class="counter-divider" aria-hidden="true">/</span><span class="shop-count-total counter-value">${products.length}</span></button>
        <div class="shop-viewport" tabindex="0" role="region" aria-roledescription="carousel" aria-label="슈즈 컬렉션. 드래그하거나 방향키로 탐색">
          <div class="shop-track">${products.map(([src, alt, x, y, width, height], i) => `<div class="product ${i === 1 ? 'is-active' : ''}" data-product="${i}" role="group" aria-roledescription="slide" aria-label="${i + 1} / ${products.length}: ${products[i][6]}"><span class="product-image ${i === 5 ? 'product-image-cropped' : ''}" style="--ix:${x};--iy:${y};--iw:${width};--ih:${height}">${renderShoeColorPreview(src, alt)}</span></div>`).join('')}</div>
        </div>
        <p class="shop-description" lang="en">${products.map(product => `<span class="shop-product-name">${product[6]}</span>`).join(' · ')}</p>
        <button class="ring-link shopping-link" type="button"><span class="ring" aria-hidden="true"></span><span>GO<br />SHOPPING</span></button>
      </section>
    </div>
    ${renderSections()}
    ${renderSavoirFaire()}
    ${renderBrandNews()}
  </main>
  ${renderFooter()}
  <div class="scroll-track" aria-hidden="true"><span></span></div>
  <div class="drag-cursor" aria-hidden="true"><div class="drag-cursor-ring-position"><span class="drag-cursor-ring"></span></div><div class="drag-cursor-text-position"><span class="drag-cursor-text">DRAG</span></div></div>
  <dialog class="menu-dialog" id="site-menu" aria-labelledby="menu-title">
    <div class="menu-dialog-header"><a class="menu-wordmark" href="#top">REPETTO</a><button class="dialog-close" type="button" aria-label="메뉴 닫기">CLOSE <span aria-hidden="true">×</span></button></div>
    <p class="menu-eyebrow" id="menu-title">EXPLORE THE MAISON</p>
    <nav aria-label="전체 메뉴">${menuItems.map(([label, href], i) => `<a href="${href}"><span class="menu-index">0${i + 1}</span>${label}<span class="menu-arrow" aria-hidden="true">↗</span></a>`).join('')}</nav>
    <p class="menu-signature">Movement, grace & freedom.</p>
  </dialog>
  <dialog class="collection-dialog" aria-labelledby="collection-title"><div class="collection-header"><h2 id="collection-title">The Collection</h2><button class="dialog-close" type="button" aria-label="컬렉션 닫기">CLOSE <span aria-hidden="true">×</span></button></div><div class="collection-grid">${products.map(([src, alt], i) => `<button type="button" class="collection-item" data-zoom="${i}" aria-label="${alt} 확대"><span class="collection-photo">${renderShoeImage(src, alt)}</span><span class="collection-item-label">${products[i][6]}</span></button>`).join('')}</div></dialog>
  <dialog class="image-dialog" aria-label="슈즈 상세 이미지"><button class="dialog-close" type="button" aria-label="상세 이미지 닫기">CLOSE <span aria-hidden="true">×</span></button><div class="image-dialog-photo"></div><div class="image-dialog-controls"><button type="button" data-zoom-prev aria-label="이전 슈즈">←</button><span aria-live="polite"></span><button type="button" data-zoom-next aria-label="다음 슈즈">→</button></div></dialog>
`;

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const menu = document.querySelector('#site-menu');
const menuToggle = document.querySelector('.menu-toggle');
function openDialog(dialog) { dialog.showModal(); document.body.classList.add('has-dialog'); }
function closeDialog(dialog) { dialog.close(); if (!document.querySelector('dialog[open]')) document.body.classList.remove('has-dialog'); }
menuToggle.addEventListener('click', () => { openDialog(menu); menuToggle.setAttribute('aria-expanded', 'true'); });
menu.addEventListener('close', () => menuToggle.setAttribute('aria-expanded', 'false'));
document.querySelectorAll('dialog').forEach(dialog => {
  dialog.querySelector('.dialog-close').addEventListener('click', () => closeDialog(dialog));
  dialog.addEventListener('click', event => { if (event.target === dialog) { const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) closeDialog(dialog); } });
  dialog.addEventListener('close', () => { if (!document.querySelector('dialog[open]')) document.body.classList.remove('has-dialog'); });
});
menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => closeDialog(menu)));

document.querySelector('.shopping-link').addEventListener('click', () => openDialog(document.querySelector('.collection-dialog')));
let zoomIndex = 0;
const zoomDialog = document.querySelector('.image-dialog');
function zoomProduct(index, open = false) {
  zoomIndex = (index + products.length) % products.length;
  const [src, alt] = products[zoomIndex];
  zoomDialog.querySelector('.image-dialog-photo').innerHTML = renderShoeImage(src, alt, 'eager');
  zoomDialog.querySelector('.image-dialog-controls span').textContent = `${zoomIndex + 1} / ${products.length}`;
  if (open) openDialog(zoomDialog);
}
document.querySelectorAll('[data-zoom]').forEach(button => button.addEventListener('click', () => zoomProduct(Number(button.dataset.zoom), true)));
document.querySelector('[data-zoom-prev]').addEventListener('click', () => zoomProduct(zoomIndex - 1));
document.querySelector('[data-zoom-next]').addEventListener('click', () => zoomProduct(zoomIndex + 1));
zoomDialog.addEventListener('keydown', event => { if (event.key === 'ArrowRight') zoomProduct(zoomIndex + 1); if (event.key === 'ArrowLeft') zoomProduct(zoomIndex - 1); });
const scrollProgress = document.querySelector('.scroll-track span');
const backToTop = document.querySelector('.footer-top');
let scrollScheduled = false;
function updateScroll() {
  const range = document.documentElement.scrollHeight - innerHeight;
  const progress = range > 0 ? Math.max(0, Math.min(1, scrollY / range)) : 0;
  scrollProgress.style.height = `${progress * 100}%`;
  const showBackToTop = scrollY > innerHeight * .75;
  if (backToTop.classList.contains('is-visible') !== showBackToTop) {
    backToTop.classList.toggle('is-visible', showBackToTop);
    backToTop.toggleAttribute('inert', !showBackToTop);
    backToTop.setAttribute('aria-hidden', String(!showBackToTop));
  }
  scrollScheduled = false;
}
function scheduleScrollUpdate() {
  if (scrollScheduled) return;
  scrollScheduled = true;
  requestAnimationFrame(updateScroll);
}
window.addEventListener('scroll', scheduleScrollUpdate, { passive: true });
window.addEventListener('resize', scheduleScrollUpdate);
window.addEventListener('pageshow', scheduleScrollUpdate);
new ResizeObserver(scheduleScrollUpdate).observe(document.body);
if (reduceMotion.matches) document.documentElement.classList.add('reduced-motion');
initSections();
initSavoirFaire();
initSiteIntro({ onReveal: initHeroCarousel });
initShopCarousel();
updateScroll();
