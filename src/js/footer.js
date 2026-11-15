const groups = [
  { title: 'COLLECTIONS', links: [['SHOP', '#shop'], ['ESSENTIAL', '#essential'], ['BALLETWEAR', '#balletwear']] },
  { title: 'THE MAISON', links: [['ABOUT', '#about'], ['SAVOIR FAIRE', '#savoir-faire'], ['매장찾기', 'https://www.repetto.kr/customer/store.asp']] },
  { title: 'CUSTOMER CARE', links: [['배송 & 환불', 'https://www.repetto.kr/customer/delivery_and_return.asp'], ['FAQ', 'https://www.repetto.kr/customer/faq.asp'], ['고객 서비스', 'https://www.repetto.kr/customer/customer_service2.asp']] },
  { title: 'INFORMATION', links: [['멤버십 혜택', 'https://www.repetto.kr/mypage/level.asp'], ['이용약관', 'https://www.repetto.kr/customer/terms_of_use.asp'], ['개인정보처리방침', 'https://www.repetto.kr/customer/privacy_policy.asp']] },
];

const socials = [
  { name: 'Instagram', file: 'footer-instagram.svg', node: '169:166', href: 'https://www.instagram.com/repettokorea/' },
  { name: 'Kakao', file: 'footer-kakao.svg', node: '186:2275', href: 'https://pf.kakao.com/_gtKKK' },
  { name: 'Facebook', file: 'footer-facebook.svg', node: '186:2273', href: 'https://www.facebook.com/repettokorea/' },
];

export function renderFooter() {
  return `<footer class="site-footer" aria-label="Repetto 사이트 정보" data-node-id="639:466">
    <a class="footer-top" href="#top" aria-label="맨 위로 이동" aria-hidden="true" inert data-node-id="639:496"><svg class="footer-top-icon" viewBox="0 0 20 22" fill="none" aria-hidden="true"><path d="M10 19V3M4.5 8.5 10 3l5.5 5.5" /></svg></a>
    <div class="footer-follow">
      <p class="footer-statement" lang="en"><span>Follow Repetto,</span> <span>and keep dancing.</span></p>
      <div class="footer-socials" role="group" aria-label="Repetto 공식 소셜 채널" data-node-id="639:497">${socials.map(social => `<a href="${social.href}" target="_blank" rel="noopener noreferrer" aria-label="Repetto ${social.name} (새 창)"><img src="./assets/images/${social.file}" alt="" width="30" height="30" loading="lazy" decoding="async" data-node-id="${social.node}"></a>`).join('')}</div>
    </div>
    <div class="footer-main">
      <div class="footer-membership" data-node-id="639:492">
        <h2 class="footer-membership-title" lang="en">Join Repetto</h2>
        <p class="footer-blurb" lang="ko" data-node-id="639:493">회원가입하고 마일리지 혜택과<br>레페토의 새로운 소식을 만나보세요.</p>
        <div class="footer-actions">
          <a class="ring-link footer-join" href="https://www.repetto.kr/member/join1.asp" target="_blank" rel="noopener noreferrer" aria-label="레페토 공식 스토어 회원가입 (새 창)"><span class="ring" aria-hidden="true"></span>JOIN US</a>
        </div>
      </div>
      <nav class="footer-nav" aria-label="푸터 메뉴" data-node-id="639:467">
        ${groups.map((group, i) => `<div class="footer-nav-group" aria-labelledby="footer-group-${i}"><h2 id="footer-group-${i}" class="footer-nav-title">${group.title}</h2><ul>${group.links.map(([label, href]) => `<li><a href="${href}"${/[가-힣]/.test(label) ? ' lang="ko"' : ''}${label === '개인정보처리방침' ? ' class="footer-privacy"' : ''}${href.startsWith('https:') ? ` target="_blank" rel="noopener noreferrer" aria-label="레페토 ${label} (새 창)"` : ''}>${label}</a></li>`).join('')}</ul></div>`).join('')}
      </nav>
    </div>
    <div class="footer-legal"><div class="footer-bottom">
      <div class="footer-company" lang="ko">
        <p class="footer-company-name">(주)스타럭스 레페토코리아</p>
        <p><span>06115 서울특별시 강남구 삼성로 561, 스타럭스 빌딩</span><span class="footer-company-field">대표이사 안종훈</span><span class="footer-company-field">대표전화 <a href="tel:0216885501">02-1688-5501</a></span></p>
        <p><span>사업자등록번호 12086-24028</span><span class="footer-company-field">통신판매신고번호 강남-04364호</span><span class="footer-company-field">개인정보관리책임자 안종훈 <a href="mailto:561_cs@starluxe.co.kr">561_cs@starluxe.co.kr</a></span></p>
      </div>
      <p class="footer-copyright" lang="en" data-node-id="639:495">© 2026. REPETTO KOREA. All rights reserved.</p>
    </div></div>
  </footer>`;
}
