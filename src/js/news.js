import { ringLink } from './sections.js';

// Publication dates and destinations verified against Repetto Korea on 2026-11-09.
// Korean display titles are condensed from the linked official announcements.
export const brandNews = [
  {
    date: '2026-11-04', category: 'COLLECTION',
    title: '26F/W 까미유 발레 플랫 컬렉션 공개',
    href: 'https://www.repetto.kr/news/view.asp?no=517', node: '639:454',
  },
  {
    date: '2026-10-21', category: 'COLLECTION',
    title: '레페토 26F/W 발레 웜 컬렉션 공개',
    href: 'https://www.repetto.kr/news/view.asp?no=515', node: '639:455',
  },
  {
    date: '2026-09-10', category: 'COLLAB',
    title: '레페토 × 요지 야마모토 캡슐 컬렉션',
    href: 'https://www.repetto.kr/news/view.asp?no=513', node: '639:456',
  },
  {
    date: '2026-07-16', category: 'COLLAB',
    title: '레페토 × 버켄스탁 협업 컬렉션 공개',
    href: 'https://www.repetto.kr/news/view.asp?no=509', node: '639:457',
  },
];

export function renderBrandNews() {
  return `<section id="news" class="editorial-section section-news" aria-labelledby="news-title" data-node-id="639:452">
    <h2 id="news-title" class="news-heading" data-node-id="639:458">BRAND NEWS</h2>
    <ul class="news-list" data-node-id="639:453">${brandNews.map(item => `
      <li><a class="news-row" href="${item.href}" target="_blank" rel="noopener noreferrer" data-node-id="${item.node}" aria-label="${item.title} — 레페토 공식 뉴스, 새 탭에서 열기">
        <span class="news-row-content">
          <time class="news-date" datetime="${item.date}">${item.date.replaceAll('-', '.')}</time>
          <span class="news-category">${item.category}</span>
          <span class="news-title">${item.title}</span>
        </span>
        <svg class="news-row-arrow" viewBox="0 0 18 13" fill="none" aria-hidden="true" focusable="false"><path class="news-arrow-shaft" d="M1 6.5h16" pathLength="1"/><path class="news-arrow-head" d="m17 6.5-5.657-5.657" pathLength="1"/><path class="news-arrow-head" d="m17 6.5-5.657 5.657" pathLength="1"/></svg>
      </a></li>`).join('')}
    </ul>
    ${ringLink('https://www.repetto.kr/news/main.asp', 'VIEW ALL', 'news-view-all', '639:459', true)}
  </section>`;
}
