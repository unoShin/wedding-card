document.addEventListener('DOMContentLoaded', () => {
  let configData = null;
  let galleryImages = [];
  const maxInitialGallery = 9;
  let galleryShowingAll = false;

  // Initialize App
  init();

  async function init() {
    try {
      const response = await fetch('data/config.json');
      configData = await response.json();
      
      renderDynamicContent();
      setupEventListeners();
      startCountdown();
      renderCalendar();
      setupScrollAnimations();
      initMockGallery();
      loadGuestbook();
    } catch (error) {
      console.error('Error loading configuration:', error);
      // Fallback data if fetch fails (e.g. running directly via file://)
      configData = getFallbackConfig();
      renderDynamicContent();
      setupEventListeners();
      startCountdown();
      renderCalendar();
      setupScrollAnimations();
      initMockGallery();
      loadGuestbook();
    }
  }

  // 1. Render content from Config JSON
  function renderDynamicContent() {
    if (!configData) return;

    const { groom, bride, wedding, accounts, transport } = configData;

    // Names
    document.getElementById('main-groom-name').textContent = groom.firstName;
    document.getElementById('main-bride-name').textContent = bride.firstName;

    // Date & Place
    document.getElementById('main-date-string').innerHTML = `${formatWeddingDate(wedding.date)}<br>${wedding.hall}`;
    document.getElementById('main-place-string').textContent = wedding.place;
    document.getElementById('map-hall-name').textContent = `${wedding.place} ${wedding.hall}`;
    document.getElementById('map-address-text').textContent = wedding.address;

    // Greeting Section Parents
    const parentsContainer = document.getElementById('greeting-parents-container');
    parentsContainer.innerHTML = `
      <div class="parents-grid">
        <div class="parents-row">
          <div class="parents-names">
            ${groom.father.name} <span style="font-size:0.85rem;color:var(--theme-text-muted);">·</span> ${groom.mother.name}
          </div>
          <div class="parents-relation">의 아들</div>
          <div class="parents-child"><b>${groom.firstName}</b></div>
        </div>
        <div class="parents-row">
          <div class="parents-names">
            ${bride.father.name} <span style="font-size:0.85rem;color:var(--theme-text-muted);">·</span> ${bride.mother.name} ${bride.mother.deceased ? '<span class="deceased">故</span>' : ''}
          </div>
          <div class="parents-relation">의 딸</div>
          <div class="parents-child"><b>${bride.firstName}</b></div>
        </div>
      </div>
    `;

    // Contact Section
    const contactContainer = document.getElementById('contact-container');
    contactContainer.innerHTML = `
      <!-- Groom Side -->
      <div class="contact-card groom-side">
        <h4>신랑측 연락처</h4>
        <div class="contact-buttons">
          <div class="contact-row">
            <span>신랑 <b>${groom.firstName}</b></span>
            <div class="contact-actions">
              <a href="tel:${groom.phoneNumber}" class="contact-btn">📞</a>
              <a href="sms:${groom.phoneNumber}" class="contact-btn">✉️</a>
            </div>
          </div>
          <div class="contact-row">
            <span>아버지 <b>${groom.father.name}</b></span>
            <div class="contact-actions">
              <a href="tel:${groom.father.phoneNumber}" class="contact-btn">📞</a>
              <a href="sms:${groom.father.phoneNumber}" class="contact-btn">✉️</a>
            </div>
          </div>
          <div class="contact-row">
            <span>어머니 <b>${groom.mother.name}</b></span>
            <div class="contact-actions">
              <a href="tel:${groom.mother.phoneNumber}" class="contact-btn">📞</a>
              <a href="sms:${groom.mother.phoneNumber}" class="contact-btn">✉️</a>
            </div>
          </div>
        </div>
      </div>

      <!-- Bride Side -->
      <div class="contact-card bride-side">
        <h4>신부측 연락처</h4>
        <div class="contact-buttons">
          <div class="contact-row">
            <span>신부 <b>${bride.firstName}</b></span>
            <div class="contact-actions">
              <a href="tel:${bride.phoneNumber}" class="contact-btn">📞</a>
              <a href="sms:${bride.phoneNumber}" class="contact-btn">✉️</a>
            </div>
          </div>
          <div class="contact-row">
            <span>아버지 <b>${bride.father.name}</b></span>
            <div class="contact-actions">
              <a href="tel:${bride.father.phoneNumber}" class="contact-btn">📞</a>
              <a href="sms:${bride.father.phoneNumber}" class="contact-btn">✉️</a>
            </div>
          </div>
          <div class="contact-row">
            <span>어머니 <b>${bride.mother.name}</b> ${bride.mother.deceased ? '<span class="deceased">故</span>' : ''}</span>
            <div class="contact-actions">
              ${bride.mother.deceased ? '<span style="font-size:0.75rem; color:var(--theme-text-muted);">부재중</span>' : `
                <a href="tel:${bride.mother.phoneNumber}" class="contact-btn">📞</a>
                <a href="sms:${bride.mother.phoneNumber}" class="contact-btn">✉️</a>
              `}
            </div>
          </div>
        </div>
      </div>
    `;

    // Account Lists
    renderAccountList('groom-accounts-list', accounts.groom);
    renderAccountList('bride-accounts-list', accounts.bride);

    // Transport Details
    const transportList = document.getElementById('transport-list');
    transportList.innerHTML = transport.map(item => `
      <div class="transport-item">
        <div class="transport-title">${item.title}</div>
        <div class="transport-body">${item.body}</div>
      </div>
    `).join('');
  }

  function renderAccountList(elementId, accountArray) {
    const listEl = document.getElementById(elementId);
    listEl.innerHTML = accountArray.map(acc => `
      <div class="account-item">
        <div class="account-info">
          <div class="account-meta">${acc.relation} ${acc.owner}</div>
          <div class="account-number">${acc.bank} ${acc.number}</div>
        </div>
        <div class="account-actions">
          <button class="btn-secondary copy-account-btn" data-account="${acc.bank} ${acc.number}">복사</button>
        </div>
      </div>
    `).join('');
  }

  function formatWeddingDate(dateStr) {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    const weekday = weekdays[date.getDay()];
    
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? '오후' : '오전';
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 hours should be 12
    
    return `${year}년 ${month}월 ${day}일 ${weekday}요일 ${ampm} ${hours}시 ${minutes.toString().padStart(2, '0')}분`;
  }

  // 2. Countdown and D-Day Calculation
  function startCountdown() {
    if (!configData) return;
    const targetDate = new Date(configData.wedding.date).getTime();

    // Together count (e.g. 2021-12-11)
    const togetherStart = new Date('2021-12-11').getTime();
    const nowTime = new Date().getTime();
    const diffDays = Math.floor((nowTime - togetherStart) / (1000 * 60 * 60 * 24));
    document.getElementById('together-count').textContent = diffDays;

    function updateTimer() {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        clearInterval(timerInterval);
        document.getElementById('countdown-box').innerHTML = "<p style='font-size: 1.1rem; color: var(--theme-color-accent); font-weight: 500;'>결혼식이 시작되었습니다! 🎉</p>";
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      document.getElementById('dday-days').textContent = days.toString().padStart(2, '0');
      document.getElementById('dday-hours').textContent = hours.toString().padStart(2, '0');
      document.getElementById('dday-mins').textContent = minutes.toString().padStart(2, '0');
      document.getElementById('dday-secs').textContent = seconds.toString().padStart(2, '0');
    }

    updateTimer();
    const timerInterval = setInterval(updateTimer, 1000);
  }

  // 3. Render Calendar dynamically
  function renderCalendar() {
    if (!configData) return;
    const dateObj = new Date(configData.wedding.date);
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth(); // 0-indexed
    const targetDay = dateObj.getDate();

    document.getElementById('calendar-title').textContent = `${year}.${(month + 1).toString().padStart(2, '0')}`;

    // Get first day of the month & total days
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    const grid = document.getElementById('calendar-grid');

    // Add empty slots for days before 1st of the month
    for (let i = 0; i < firstDay; i++) {
      const emptyCell = document.createElement('div');
      emptyCell.className = 'cal-date empty';
      grid.appendChild(emptyCell);
    }

    // Add date cells
    for (let day = 1; day <= totalDays; day++) {
      const dateCell = document.createElement('div');
      dateCell.className = 'cal-date';
      dateCell.textContent = day;

      const currentDayOfWeek = (firstDay + day - 1) % 7;
      if (currentDayOfWeek === 0) {
        dateCell.classList.add('sunday');
      }

      if (day === targetDay) {
        dateCell.classList.add('wedding-day');
      }

      grid.appendChild(dateCell);
    }
  }

  // 4. Load Mock Gallery
  function initMockGallery() {
    // Creating 15 mock pictures
    galleryImages = Array.from({ length: 15 }, (_, i) => {
      // SVGs representing stylish placeholders for photographs
      const color1 = ['#f5e6e8', '#e8e8e8', '#eae0db', '#e3ebf0', '#ebdff0'][i % 5];
      const color2 = ['#d099a1', '#ad868b', '#dab1b6', '#a1b8d0', '#ad86ab'][i % 5];
      return `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='600' viewBox='0 0 600 600'><rect width='100%' height='100%' fill='%23${color1.slice(1)}'/><circle cx='300' cy='300' r='120' fill='%23${color2.slice(1)}' opacity='0.3'/><text x='50%' y='50%' font-family='Noto Serif KR, sans-serif' font-size='24' fill='%23555' text-anchor='middle' dominant-baseline='middle'>Moments ${i+1}</text></svg>`;
    });

    renderGallery();
  }

  function renderGallery() {
    const grid = document.getElementById('gallery-grid');
    grid.innerHTML = '';
    const limit = galleryShowingAll ? galleryImages.length : maxInitialGallery;

    for (let i = 0; i < limit; i++) {
      const item = document.createElement('div');
      item.className = 'gallery-item';
      item.dataset.index = i;
      item.innerHTML = `<img src="${galleryImages[i]}" alt="Moment ${i + 1}" class="gallery-thumb" loading="lazy">`;
      item.addEventListener('click', () => openLightbox(i));
      grid.appendChild(item);
    }

    const moreBtn = document.getElementById('btn-gallery-more');
    if (galleryShowingAll) {
      moreBtn.textContent = '사진 접기';
    } else {
      moreBtn.textContent = '사진 더보기';
    }
  }

  // 5. Lightbox Functionality
  let lightboxIndex = 0;
  const lightboxModal = document.getElementById('lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-img');

  function openLightbox(index) {
    lightboxIndex = index;
    lightboxImg.src = galleryImages[lightboxIndex];
    lightboxModal.classList.add('active');
  }

  function closeLightbox() {
    lightboxModal.classList.remove('active');
  }

  function prevLightbox() {
    lightboxIndex = (lightboxIndex - 1 + galleryImages.length) % galleryImages.length;
    lightboxImg.src = galleryImages[lightboxIndex];
  }

  function nextLightbox() {
    lightboxIndex = (lightboxIndex + 1) % galleryImages.length;
    lightboxImg.src = galleryImages[lightboxIndex];
  }

  // 6. Accordion Toggles
  function setupAccordion(accordionId) {
    const acc = document.getElementById(accordionId);
    acc.querySelector('.accordion-header').addEventListener('click', () => {
      acc.classList.toggle('active');
    });
  }

  // 7. Scroll Fade-in Observer
  function setupScrollAnimations() {
    const faders = document.querySelectorAll('.fade-up');
    const options = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, options);

    faders.forEach(fader => observer.observe(fader));
  }

  // 8. Clipboard Copy
  function setupCopyButton(btnSelector, textToCopy, successMsg) {
    const btn = document.querySelector(btnSelector);
    if (btn) {
      btn.addEventListener('click', () => {
        copyToClipboard(textToCopy, successMsg);
      });
    }
  }

  function copyToClipboard(text, successMsg) {
    navigator.clipboard.writeText(text).then(() => {
      showToast(successMsg);
    }).catch(err => {
      console.error('Copy failed:', err);
    });
  }

  function showToast(message) {
    const toast = document.getElementById('toast-container');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2500);
  }

  // 9. LocalStorage Database for Guestbook and RSVP
  function loadGuestbook() {
    const listEl = document.getElementById('guestbook-list');
    const stored = localStorage.getItem('wedding_guestbook');
    const posts = stored ? JSON.parse(stored) : getInitialGuestbook();
    
    listEl.innerHTML = posts.map((post, idx) => `
      <div class="guestbook-item">
        <div class="guestbook-meta">
          <span class="guestbook-name">${escapeHTML(post.name)}</span>
          <span style="display:flex; gap:10px;">
            <span>${post.date}</span>
            <span class="delete-gb" data-index="${idx}" style="cursor:pointer; color:var(--theme-text-muted);">삭제</span>
          </span>
        </div>
        <div class="guestbook-content">${escapeHTML(post.message)}</div>
      </div>
    `).join('');

    // Setup delete actions
    document.querySelectorAll('.delete-gb').forEach(el => {
      el.addEventListener('click', (e) => {
        const index = e.target.dataset.index;
        const password = prompt('작성 시 입력한 비밀번호를 입력해주세요:');
        if (password) {
          deleteGuestbookEntry(index, password);
        }
      });
    });
  }

  function deleteGuestbookEntry(index, password) {
    const stored = localStorage.getItem('wedding_guestbook');
    if (!stored) return;
    const posts = JSON.parse(stored);
    
    if (posts[index] && posts[index].password === password) {
      posts.splice(index, 1);
      localStorage.setItem('wedding_guestbook', JSON.stringify(posts));
      showToast('방명록이 삭제되었습니다.');
      loadGuestbook();
    } else {
      alert('비밀번호가 올바르지 않습니다.');
    }
  }

  function addGuestbookEntry(name, password, message) {
    const stored = localStorage.getItem('wedding_guestbook');
    const posts = stored ? JSON.parse(stored) : getInitialGuestbook();
    
    const now = new Date();
    const dateStr = `${now.getMonth() + 1}.${now.getDate()}`;
    
    posts.unshift({ name, password, message, date: dateStr });
    localStorage.setItem('wedding_guestbook', JSON.stringify(posts));
    showToast('메시지가 등록되었습니다.');
    loadGuestbook();
  }

  function submitRSVP(side, name, count, meal, message) {
    const stored = localStorage.getItem('wedding_rsvp');
    const list = stored ? JSON.parse(stored) : [];
    
    list.push({ side, name, count, meal, message, date: new Date().toISOString() });
    localStorage.setItem('wedding_rsvp', JSON.stringify(list));
    showToast('참석 여부가 성공적으로 전달되었습니다.');
  }

  // Event Listeners Setup
  function setupEventListeners() {
    // Gallery More Toggle
    document.getElementById('btn-gallery-more').addEventListener('click', () => {
      galleryShowingAll = !galleryShowingAll;
      renderGallery();
    });

    // Accordions
    setupAccordion('acc-groom-accordion');
    setupAccordion('acc-bride-accordion');

    // Clipboard copy actions (Event delegation for dynamic account list buttons)
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('copy-account-btn')) {
        const acc = e.target.dataset.account;
        copyToClipboard(acc, '계좌번호가 복사되었습니다.');
      }
    });

    // Copy Address Button
    if (configData) {
      setupCopyButton('#btn-copy-address', configData.wedding.address, '주소가 복사되었습니다.');
    }

    // Lightbox Controls
    document.getElementById('btn-lightbox-close').addEventListener('click', closeLightbox);
    document.getElementById('btn-lightbox-prev').addEventListener('click', prevLightbox);
    document.getElementById('btn-lightbox-next').addEventListener('click', nextLightbox);
    // Click outside to close lightbox
    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) closeLightbox();
    });

    // RSVP Modal Toggles
    const rsvpModal = document.getElementById('rsvp-modal');
    document.getElementById('btn-rsvp-open').addEventListener('click', () => rsvpModal.classList.add('active'));
    document.getElementById('btn-rsvp-close').addEventListener('click', () => rsvpModal.classList.remove('active'));
    document.getElementById('btn-rsvp-cancel').addEventListener('click', () => rsvpModal.classList.remove('active'));
    
    // RSVP Submit
    document.getElementById('btn-rsvp-submit').addEventListener('click', () => {
      const form = document.getElementById('rsvp-form');
      if (!form.reportValidity()) return;

      const side = form.elements['rsvp_side'].value;
      const name = document.getElementById('rsvp_name').value;
      const count = document.getElementById('rsvp_count').value;
      const meal = form.elements['rsvp_meal'].value;
      const message = document.getElementById('rsvp_message').value;

      submitRSVP(side, name, count, meal, message);
      form.reset();
      rsvpModal.classList.remove('active');
    });

    // Guestbook Modal Toggles
    const gbModal = document.getElementById('guestbook-modal');
    document.getElementById('btn-guestbook-open').addEventListener('click', () => gbModal.classList.add('active'));
    document.getElementById('btn-guestbook-close').addEventListener('click', () => gbModal.classList.remove('active'));
    document.getElementById('btn-guestbook-cancel').addEventListener('click', () => gbModal.classList.remove('active'));

    // Guestbook Submit
    document.getElementById('btn-guestbook-submit').addEventListener('click', () => {
      const form = document.getElementById('guestbook-form');
      if (!form.reportValidity()) return;

      const name = document.getElementById('gb_name').value;
      const password = document.getElementById('gb_password').value;
      const message = document.getElementById('gb_message').value;

      addGuestbookEntry(name, password, message);
      form.reset();
      gbModal.classList.remove('active');
    });

    // Share buttons
    document.getElementById('btn-share-link').addEventListener('click', () => {
      copyToClipboard(window.location.href, '청첩장 링크가 복사되었습니다.');
    });

    document.getElementById('btn-share-kakao').addEventListener('click', () => {
      showToast('카카오톡 SDK 공유기능 데모입니다.');
    });
  }

  // Helpers
  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }

  function getInitialGuestbook() {
    return [
      { name: "민우 & 지현", date: "6.14", message: "준호야, 채원아! 결혼 진심으로 축하해! 평생 행복하고 예쁘게 살아라!! ♥" },
      { name: "김부장님", date: "6.12", message: "준호 대리 결혼을 축하하네. 인생의 새로운 2막을 응원하네. 행복이 가득하길." },
      { name: "혜원 (플라워샵)", date: "6.10", message: "채원언니! 드디어 가네 ㅠㅠ 너무너무 축하해!! 당일에 세상에서 제일 예쁠 신부 기대할게!" }
    ];
  }

  function getFallbackConfig() {
    return {
      "groom": {
        "lastName": "신", "firstName": "준호", "phoneNumber": "010-1234-5678",
        "father": { "name": "신재근", "phoneNumber": "010-1111-2222" },
        "mother": { "name": "이정희", "phoneNumber": "010-3333-4444" }
      },
      "bride": {
        "lastName": "송", "firstName": "채원", "phoneNumber": "010-9876-5432",
        "father": { "name": "송준호", "phoneNumber": "010-5555-6666" },
        "mother": { "name": "조은희", "deceased": true, "phoneNumber": "010-7777-8888" }
      },
      "wedding": {
        "date": "2026-08-29T17:40:00+09:00",
        "place": "더컨벤션 잠실", "hall": "1층 그랜드볼룸",
        "address": "서울 송파구 올림픽로 319"
      },
      "accounts": {
        "groom": [
          { "relation": "신랑", "bank": "신한", "number": "110-412-489830", "owner": "신준호" }
        ],
        "bride": [
          { "relation": "신부", "bank": "신한", "number": "110-269-163200", "owner": "송채원" }
        ]
      },
      "transport": [
        { "type": "subway", "title": "지하철", "body": "2호선 잠실역 8번 출구 도보 5분" }
      ]
    };
  }
});
