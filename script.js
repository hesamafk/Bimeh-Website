/* ==========================================================================
   بیمه ایران عطایی — script.js
   منطق مشترک سایت: منو، اسکرول، فرم‌ها، LocalStorage، پنل مدیریت
   ========================================================================== */

/* -------------------- کلیدهای ذخیره‌سازی -------------------- */
const LS_KEYS = {
  RATINGS: 'bia_ratings',
  MESSAGES: 'bia_messages',
  QUOTES: 'bia_quotes',
  ARTICLES: 'bia_articles',
  ADMIN_SESSION: 'bia_admin_session'
};

/* -------------------- مقالات پیش‌فرض -------------------- */
const SEED_ARTICLES = [
  {
    id: 'a1',
    title: 'راهنمای انتخاب بیمه شخص ثالث مناسب خودرو',
    excerpt: 'قبل از خرید بیمه شخص ثالث به این نکات کلیدی توجه کنید تا در زمان حادثه دچار مشکل نشوید.',
    date: '1404/03/12',
    img: 'https://picsum.photos/seed/bia-article1/600/400',
    content: 'بیمه شخص ثالث یکی از الزامی‌ترین بیمه‌نامه‌های خودرو در ایران است که خسارات جانی و مالی وارد شده به اشخاص ثالث در اثر حوادث رانندگی را جبران می‌کند. هنگام انتخاب این بیمه‌نامه باید به میزان تعهدات مالی، اعتبار شرکت بیمه‌گر و شرایط تخفیف عدم خسارت توجه ویژه‌ای داشته باشید. کارشناسان نمایندگی بیمه ایران عطایی با بررسی دقیق نیاز شما، مناسب‌ترین سطح پوشش را پیشنهاد می‌دهند تا هم از نظر هزینه و هم از نظر پوشش، بهترین انتخاب را داشته باشید.'
  },
  {
    id: 'a2',
    title: 'چرا بیمه عمر یک سرمایه‌گذاری هوشمندانه است؟',
    excerpt: 'بیمه عمر علاوه بر پوشش حمایتی، یک ابزار پس‌انداز و سرمایه‌گذاری بلندمدت برای آینده خانواده شماست.',
    date: '1404/02/25',
    img: 'https://picsum.photos/seed/bia-article2/600/400',
    content: 'بیمه‌های عمر و سرمایه‌گذاری در کنار پوشش‌های حمایتی مانند فوت و از کارافتادگی، امکان پس‌انداز تدریجی و بهره‌مندی از سود مشارکت در منافع را نیز فراهم می‌کنند. این نوع بیمه‌نامه به‌ویژه برای افرادی که به دنبال تأمین آینده مالی فرزندان یا برنامه‌ریزی برای دوران بازنشستگی هستند، گزینه‌ای بسیار مناسب محسوب می‌شود. تیم مشاوره بیمه ایران عطایی می‌تواند طرح مناسب با بودجه و اهداف شما را طراحی کند.'
  },
  {
    id: 'a3',
    title: 'مراحل دریافت خسارت بیمه بدنه به زبان ساده',
    excerpt: 'در صورت وقوع حادثه، رعایت این مراحل به شما کمک می‌کند خسارت خود را سریع‌تر و بدون دردسر دریافت کنید.',
    date: '1404/01/18',
    img: 'https://picsum.photos/seed/bia-article3/600/400',
    content: 'پس از وقوع حادثه، نخستین قدم تماس با کارشناس ارزیاب و تنظیم صورت‌جلسه راهنمایی و رانندگی است. سپس مدارک لازم شامل کروکی، بیمه‌نامه معتبر و مدارک هویتی باید به نمایندگی بیمه تحویل داده شود. رعایت مهلت اعلام خسارت (معمولاً پنج روز کاری) نیز اهمیت زیادی دارد. همکاران ما در بیمه ایران عطایی در تمام مراحل، از اعلام حادثه تا دریافت خسارت، همراه شما خواهند بود.'
  }
];

/* -------------------- کمک‌کننده‌های LocalStorage -------------------- */
function lsGet(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    const value = JSON.parse(raw);
    return Array.isArray(fallback) && !Array.isArray(value) ? fallback : value;
  } catch (e) {
    return fallback;
  }
}
function lsSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    showStorageError();
    return false;
  }
}
function showStorageError() {
  let notice = document.getElementById('storage-error');
  if (!notice) {
    notice = document.createElement('p');
    notice.id = 'storage-error';
    notice.className = 'storage-error';
    notice.setAttribute('role', 'alert');
    document.body.appendChild(notice);
  }
  notice.textContent = 'ذخیره نشد. فضای مرورگر پر است یا دسترسی ذخیره‌سازی بسته است. اطلاعات فرم را نگه دارید و دوباره تلاش کنید.';
}
function ensureArticlesSeeded() {
  try {
    if (localStorage.getItem(LS_KEYS.ARTICLES) === null) lsSet(LS_KEYS.ARTICLES, SEED_ARTICLES);
  } catch { /* The default articles remain available without browser storage. */ }
}
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
function todayFa() {
  return new Date().toLocaleDateString('fa-IR');
}

/* ============================================================
   منوی همبرگری موبایل
   ============================================================ */
function initNav() {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.main-nav');
  const scrim = document.querySelector('.nav-scrim');
  if (!toggle || !nav) return;

  function closeNav() {
    nav.classList.remove('open');
    scrim && scrim.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  }
  function openNav() {
    nav.classList.add('open');
    scrim && scrim.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
  }
  toggle.addEventListener('click', () => {
    nav.classList.contains('open') ? closeNav() : openNav();
  });
  scrim && scrim.addEventListener('click', closeNav);
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeNav));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeNav(); });

  // فعال‌سازی لینک صفحه جاری
  const path = location.pathname.split('/').pop() || 'index.html';
  nav.querySelectorAll('a[data-page]').forEach(a => {
    if (a.getAttribute('data-page') === path) a.classList.add('active');
  });
}

/* ============================================================
   دکمه بازگشت به بالا
   ============================================================ */
function initToTop() {
  const btn = document.querySelector('.to-top');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    if (window.scrollY > 420) btn.classList.add('show');
    else btn.classList.remove('show');
  }, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ============================================================
   انیمیشن ورود عناصر هنگام اسکرول
   ============================================================ */
function initReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;
  if (!('IntersectionObserver' in window)) {
    items.forEach(el => el.classList.add('in'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  items.forEach(el => io.observe(el));
}

/* ============================================================
   اعتبارسنجی عمومی فرم‌ها
   ============================================================ */
function showFieldError(fieldEl, message) {
  fieldEl.querySelector('input, textarea, select')?.setAttribute('aria-invalid', 'true');
  fieldEl.classList.add('invalid');
  const err = fieldEl.querySelector('.field-error');
  if (err && message) err.textContent = message;
}
function clearFieldError(fieldEl) {
  fieldEl.classList.remove('invalid');
  fieldEl.querySelector('input, textarea, select')?.removeAttribute('aria-invalid');
}
function validateRequired(form) {
  let valid = true;
  form.querySelectorAll('[data-field]').forEach(fieldEl => {
    const input = fieldEl.querySelector('input,textarea,select');
    if (!input) return;
    clearFieldError(fieldEl);
    const val = (input.value || '').trim();

    if (input.hasAttribute('required') && !val) {
      showFieldError(fieldEl, 'این فیلد الزامی است.');
      valid = false;
      return;
    }
    if (val && input.type === 'email') {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!re.test(val)) {
        showFieldError(fieldEl, 'ایمیل وارد شده معتبر نیست.');
        valid = false;
      }
    }
    if (val && input.dataset.pattern === 'phone') {
      const re = /^(?:0?9\d{9}|0\d{10})$/;
      const normalized = val.replace(/[۰-۹]/g, d => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d))).replace(/[٠-٩]/g, d => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))).replace(/[\s-]/g, '');
      input.value = normalized;
      if (!re.test(normalized)) {
        showFieldError(fieldEl, 'شماره تماس را به‌درستی وارد کنید.');
        valid = false;
      }
    }
  });
  if (!valid) form.querySelector('.invalid input, .invalid textarea, .invalid select')?.focus();
  return valid;
}

/* ============================================================
   فرم تماس با ما
   ============================================================ */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  const successBox = document.getElementById('contact-success');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateRequired(form)) return;

    const data = {
      id: uid(),
      name: form.querySelector('#c-name').value.trim(),
      phone: form.querySelector('#c-phone').value.trim(),
      email: form.querySelector('#c-email').value.trim(),
      subject: form.querySelector('#c-subject').value.trim(),
      message: form.querySelector('#c-message').value.trim(),
      date: todayFa()
    };
    const list = lsGet(LS_KEYS.MESSAGES, []);
    list.unshift(data);
    if (!lsSet(LS_KEYS.MESSAGES, list)) return;

    form.reset();
    if (successBox) {
      successBox.classList.add('show');
      successBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });
}

/* ============================================================
   فرم استعلام بیمه
   ============================================================ */
function initQuoteForm() {
  const form = document.getElementById('quote-form');
  if (!form) return;
  const successBox = document.getElementById('quote-success');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateRequired(form)) return;

    const data = {
      id: uid(),
      name: form.querySelector('#q-name').value.trim(),
      phone: form.querySelector('#q-phone').value.trim(),
      type: form.querySelector('#q-type').value,
      message: form.querySelector('#q-message').value.trim(),
      date: todayFa()
    };
    const list = lsGet(LS_KEYS.QUOTES, []);
    list.unshift(data);
    if (!lsSet(LS_KEYS.QUOTES, list)) return;

    form.reset();
    if (successBox) {
      successBox.classList.add('show');
      successBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });
}

/* ============================================================
   صفحه امتیازدهی
   ============================================================ */
function initRatingPage() {
  const form = document.getElementById('rating-form');
  if (!form) return;

  const starSelect = document.getElementById('star-select');
  const stars = starSelect ? Array.from(starSelect.querySelectorAll('i')) : [];
  let chosenStars = 0;
  const starInputHidden = document.getElementById('r-stars-value');

  function paintStars(n) {
    stars.forEach((s, idx) => s.classList.toggle('active', idx < n));
  }
  starSelect?.setAttribute('role', 'radiogroup');
  starSelect?.setAttribute('aria-label', 'امتیاز شما');
  stars.forEach((s, idx) => {
    s.textContent = '★';
    s.setAttribute('role', 'radio');
    s.setAttribute('tabindex', idx === 0 ? '0' : '-1');
    s.setAttribute('aria-label', (idx + 1) + ' ستاره');
    s.setAttribute('aria-checked', 'false');
    s.addEventListener('keydown', event => {
      if (event.key === ' ' || event.key === 'Enter') { event.preventDefault(); s.click(); }
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
        event.preventDefault();
        const next = (idx + (['ArrowLeft', 'ArrowDown'].includes(event.key) ? 1 : 4)) % 5;
        stars[next].click(); stars[next].focus();
      }
    });
    s.addEventListener('click', () => {
      chosenStars = idx + 1;
      starInputHidden.value = chosenStars;
      paintStars(chosenStars);
      stars.forEach((star, i) => {
        star.setAttribute('aria-checked', String(i === idx));
        star.setAttribute('tabindex', i === idx ? '0' : '-1');
      });
      const starField = starSelect.closest('[data-field]');
      if (starField) clearFieldError(starField);
    });
    s.addEventListener('mouseenter', () => paintStars(idx + 1));
  });
  starSelect && starSelect.addEventListener('mouseleave', () => paintStars(chosenStars));

  const successBox = document.getElementById('rating-success');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = validateRequired(form);

    if (!chosenStars) {
      const starField = starSelect.closest('[data-field]');
      showFieldError(starField, 'لطفاً امتیاز خود را انتخاب کنید.');
      valid = false;
    }
    if (!valid) return;

    const data = {
      id: uid(),
      name: form.querySelector('#r-name').value.trim() || 'کاربر ناشناس',
      stars: chosenStars,
      comment: form.querySelector('#r-comment').value.trim(),
      date: todayFa(),
      approved: false
    };
    const list = lsGet(LS_KEYS.RATINGS, []);
    list.unshift(data);
    if (!lsSet(LS_KEYS.RATINGS, list)) return;

    form.reset();
    chosenStars = 0;
    paintStars(0);
    stars.forEach((star, i) => { star.setAttribute('aria-checked', 'false'); star.setAttribute('tabindex', i === 0 ? '0' : '-1'); });
    if (successBox) {
      successBox.classList.add('show');
      successBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    renderRatingSummary();
  });

  renderRatingSummary();
}

function renderRatingSummary() {
  const wrap = document.getElementById('rating-summary-wrap');
  const listWrap = document.getElementById('rating-list');
  if (!wrap && !listWrap) return;

  const all = lsGet(LS_KEYS.RATINGS, []);
  const approved = all.filter(r => r.approved);

  const total = approved.length;
  const avg = total ? (approved.reduce((s, r) => s + r.stars, 0) / total) : 0;

  if (wrap) {
    const counts = [5, 4, 3, 2, 1].map(n => approved.filter(r => r.stars === n).length);
    wrap.innerHTML = `
      <div class="rating-avg">
        <div class="num">${total ? avg.toFixed(1) : '—'}</div>
        <div class="stars">${renderStarString(Math.round(avg))}</div>
        <div class="count">${total} نظر ثبت‌شده</div>
      </div>
      <div class="rating-bars">
        ${[5,4,3,2,1].map((n, i) => `
          <div class="rating-bar-row">
            <span>${n} ستاره</span>
            <div class="rating-bar-track"><div class="rating-bar-fill" style="width:${total ? (counts[i]/total*100) : 0}%"></div></div>
            <span>${counts[i]}</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  if (listWrap) {
    if (!approved.length) {
      listWrap.innerHTML = `<p class="empty-note">هنوز نظری ثبت نشده است. اولین نفری باشید که تجربه خود را به اشتراک می‌گذارد.</p>`;
    } else {
      listWrap.innerHTML = approved.slice(0, 20).map(r => `
        <div class="review-item">
          <div class="stars">${renderStarString(r.stars)}</div>
          <span class="who">${escapeHtml(r.name)}</span><span class="when">${escapeHtml(r.date)}</span>
          ${r.comment ? `<p>${escapeHtml(r.comment)}</p>` : ''}
        </div>
      `).join('');
    }
  }
}

function renderStarString(n) {
  let out = '';
  for (let i = 0; i < 5; i++) out += i < n ? '★' : '☆';
  return out;
}
function safeImageUrl(value) {
  try {
    const url = new URL(value, window.location.href);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
  } catch { return ''; }
}
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML.replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

/* ============================================================
   صفحه مقالات (بلاگ)
   ============================================================ */
function initBlogPage() {
  const grid = document.getElementById('blog-grid');
  if (!grid) return;
  ensureArticlesSeeded();
  const articles = lsGet(LS_KEYS.ARTICLES, SEED_ARTICLES);

  if (!articles.length) {
    grid.innerHTML = `<p class="empty-note">در حال حاضر مقاله‌ای موجود نیست.</p>`;
    return;
  }

  grid.innerHTML = articles.map(a => `
    <article class="blog-card reveal">
      <div class="blog-thumb"><img src="${escapeHtml(safeImageUrl(a.img))}" alt="${escapeHtml(a.title)}" loading="lazy"></div>
      <div class="blog-body">
        <span class="blog-date"><i class="fa-regular fa-calendar"></i> ${escapeHtml(a.date)}</span>
        <h3>${escapeHtml(a.title)}</h3>
        <p>${escapeHtml(a.excerpt)}</p>
        <a class="blog-more" href="#article-modal" data-action="openArticleModal" data-id="${escapeHtml(a.id)}">بیشتر بخوانید <i class="fa-solid fa-arrow-left"></i></a>
      </div>
    </article>
  `).join('');

  initReveal();
}

function openArticleModal(id) {
  const articles = lsGet(LS_KEYS.ARTICLES, SEED_ARTICLES);
  const a = articles.find(x => x.id === id);
  if (!a) return;
  let modal = document.getElementById('article-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.className = 'modal-backdrop';
    modal.id = 'article-modal';
    modal.innerHTML = `<div class="modal-box" role="dialog" aria-modal="true">
      <div id="article-modal-content"></div>
      <button class="btn btn-secondary btn-block mt-lg" id="article-modal-close">بستن</button>
    </div>`;
    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeArticleModal(); });
    modal.querySelector('#article-modal-close').addEventListener('click', closeArticleModal);
  }
  modal.querySelector('#article-modal-content').innerHTML = `
    <img src="${escapeHtml(safeImageUrl(a.img))}" alt="${escapeHtml(a.title)}" style="border-radius:14px;margin-bottom:18px">
    <span class="blog-date"><i class="fa-regular fa-calendar"></i> ${escapeHtml(a.date)}</span>
    <h3 style="color:var(--blue-900);font-size:1.2rem;margin:10px 0">${escapeHtml(a.title)}</h3>
    <p style="color:var(--gray-600);line-height:1.9">${escapeHtml(a.content || a.excerpt)}</p>
  `;
  modal.classList.add('open');
  modal.querySelector('#article-modal-close')?.focus();
}
function closeArticleModal() {
  const modal = document.getElementById('article-modal');
  if (modal) modal.classList.remove('open');
}

/* ============================================================
   صفحه خدمات: فیلتر و جستجو
   ============================================================ */
function initServicesFilter() {
  const chips = document.querySelectorAll('.filter-chip');
  const searchInput = document.getElementById('service-search');
  const cards = document.querySelectorAll('.service-card[data-cat]');
  if (!cards.length) return;

  let activeCat = 'all';

  function applyFilter() {
    const q = (searchInput ? searchInput.value.trim() : '').toLowerCase();
    cards.forEach(card => {
      const cat = card.dataset.cat;
      const text = card.textContent.toLowerCase();
      const matchCat = activeCat === 'all' || cat === activeCat;
      const matchSearch = !q || text.includes(q);
      card.closest('.grid-3, .grid-2, div').style.display = '';
      card.style.display = (matchCat && matchSearch) ? '' : 'none';
    });
  }
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activeCat = chip.dataset.cat;
      applyFilter();
    });
  });
  searchInput && searchInput.addEventListener('input', applyFilter);
}

/* ============================================================
   پنل مدیریت
   ============================================================ */
const ADMIN_USER = 'admin';
const ADMIN_PASS = '123456';

function isAdminLoggedIn() {
  try { return sessionStorage.getItem(LS_KEYS.ADMIN_SESSION) === 'true'; }
  catch { return false; }
}

function initAdminLogin() {
  const form = document.getElementById('admin-login-form');
  if (!form) return;

  if (isAdminLoggedIn()) {
    showAdminShell();
    return;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const u = form.querySelector('#a-user').value.trim();
    const p = form.querySelector('#a-pass').value;
    const errBox = document.getElementById('admin-login-error');

    if (u === ADMIN_USER && p === ADMIN_PASS) {
      try { sessionStorage.setItem(LS_KEYS.ADMIN_SESSION, 'true'); }
      catch { showStorageError(); return; }
      errBox.style.display = 'none';
      showAdminShell();
    } else {
      errBox.style.display = 'block';
      errBox.textContent = 'نام کاربری یا رمز عبور اشتباه است.';
    }
  });
}

function showAdminShell() {
  const loginWrap = document.getElementById('admin-login-wrap');
  const shell = document.getElementById('admin-shell');
  if (loginWrap) loginWrap.style.display = 'none';
  if (shell) shell.style.display = 'grid';

  renderAdminArticles();
  renderAdminRatings();
  renderAdminMessages();
  renderAdminQuotes();
  updateAdminBadges();
}

function initAdminLogout() {
  const btn = document.getElementById('admin-logout');
  if (!btn) return;
  btn.addEventListener('click', () => {
    sessionStorage.removeItem(LS_KEYS.ADMIN_SESSION);
    location.reload();
  });
}

function initAdminTabs() {
  const tabs = document.querySelectorAll('.admin-nav-btn[data-panel]');
  if (!tabs.length) return;
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
      const panel = document.getElementById('panel-' + tab.dataset.panel);
      if (panel) panel.classList.add('active');
    });
  });
}

function updateAdminBadges() {
  const ratings = lsGet(LS_KEYS.RATINGS, []);
  const pending = ratings.filter(r => !r.approved).length;
  const badge = document.getElementById('badge-pending-ratings');
  if (badge) {
    badge.textContent = pending;
    badge.style.display = pending ? 'inline-flex' : 'none';
  }
  const msgCount = document.getElementById('badge-messages');
  if (msgCount) msgCount.textContent = lsGet(LS_KEYS.MESSAGES, []).length;
}

/* ---- مدیریت مقالات ---- */
function renderAdminArticles() {
  const tbody = document.getElementById('admin-articles-body');
  if (!tbody) return;
  ensureArticlesSeeded();
  const articles = lsGet(LS_KEYS.ARTICLES, SEED_ARTICLES);

  if (!articles.length) {
    tbody.innerHTML = `<tr><td colspan="4" class="empty-admin">مقاله‌ای ثبت نشده است.</td></tr>`;
    return;
  }
  tbody.innerHTML = articles.map(a => `
    <tr>
      <td>${escapeHtml(a.title)}</td>
      <td>${escapeHtml(a.date)}</td>
      <td>${escapeHtml((a.excerpt || '').slice(0, 40))}...</td>
      <td class="admin-actions-cell">
        <button class="btn btn-sm btn-secondary" data-action="editArticlePrompt" data-id="${escapeHtml(a.id)}"><i class="fa-solid fa-pen"></i> ویرایش</button>
        <button class="btn btn-sm btn-danger" data-action="deleteArticle" data-id="${escapeHtml(a.id)}"><i class="fa-solid fa-trash"></i> حذف</button>
      </td>
    </tr>
  `).join('');
}

function openArticleForm(existing) {
  let modal = document.getElementById('article-form-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.className = 'modal-backdrop';
    modal.id = 'article-form-modal';
    document.body.appendChild(modal);
  }
  modal.innerHTML = `
    <div class="modal-box">
      <h3>${existing ? 'ویرایش مقاله' : 'افزودن مقاله جدید'}</h3>
      <form id="article-form">
        <div class="field" data-field>
          <label>عنوان مقاله <span class="req">*</span></label>
          <input type="text" id="af-title" required value="${existing ? escapeHtml(existing.title) : ''}">
          <div class="field-error"></div>
        </div>
        <div class="field" data-field>
          <label>چکیده <span class="req">*</span></label>
          <textarea id="af-excerpt" required style="min-height:70px">${existing ? escapeHtml(existing.excerpt) : ''}</textarea>
          <div class="field-error"></div>
        </div>
        <div class="field" data-field>
          <label>متن کامل مقاله <span class="req">*</span></label>
          <textarea id="af-content" required>${existing ? escapeHtml(existing.content || '') : ''}</textarea>
          <div class="field-error"></div>
        </div>
        <div class="field" data-field>
          <label>آدرس تصویر شاخص</label>
          <input type="text" id="af-img" value="${existing ? escapeHtml(existing.img) : 'https://picsum.photos/seed/' + Math.random().toString(36).slice(2,8) + '/600/400'}">
        </div>
        <div style="display:flex;gap:10px;margin-top:10px">
          <button type="submit" class="btn btn-primary btn-block">ذخیره مقاله</button>
          <button type="button" class="btn btn-secondary btn-block" id="article-form-cancel">انصراف</button>
        </div>
      </form>
    </div>
  `;
  modal.classList.add('open');
  modal.querySelector('#article-form-cancel').addEventListener('click', () => modal.classList.remove('open'));
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('open'); });

  modal.querySelector('#article-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const form = e.target;
    if (!validateRequired(form)) return;

    const articles = lsGet(LS_KEYS.ARTICLES, SEED_ARTICLES);
    const title = form.querySelector('#af-title').value.trim();
    const excerpt = form.querySelector('#af-excerpt').value.trim();
    const content = form.querySelector('#af-content').value.trim();
    const img = form.querySelector('#af-img').value.trim();

    if (existing) {
      const idx = articles.findIndex(a => a.id === existing.id);
      if (idx > -1) articles[idx] = { ...articles[idx], title, excerpt, content, img };
    } else {
      articles.unshift({ id: uid(), title, excerpt, content, img, date: todayFa() });
    }
    if (!lsSet(LS_KEYS.ARTICLES, articles)) return;
    modal.classList.remove('open');
    renderAdminArticles();
  });
}
function editArticlePrompt(id) {
  const articles = lsGet(LS_KEYS.ARTICLES, SEED_ARTICLES);
  const a = articles.find(x => x.id === id);
  if (a) openArticleForm(a);
}
function deleteArticle(id) {
  if (!confirm('آیا از حذف این مقاله مطمئن هستید؟')) return;
  let articles = lsGet(LS_KEYS.ARTICLES, SEED_ARTICLES);
  articles = articles.filter(a => a.id !== id);
  if (!lsSet(LS_KEYS.ARTICLES, articles)) return;
  renderAdminArticles();
}

/* ---- مدیریت نظرات ---- */
function renderAdminRatings() {
  const tbody = document.getElementById('admin-ratings-body');
  if (!tbody) return;
  const ratings = lsGet(LS_KEYS.RATINGS, []);
  if (!ratings.length) {
    tbody.innerHTML = `<tr><td colspan="5" class="empty-admin">نظری ثبت نشده است.</td></tr>`;
    return;
  }
  tbody.innerHTML = ratings.map(r => `
    <tr>
      <td>${escapeHtml(r.name)}</td>
      <td>${renderStarString(r.stars)}</td>
      <td>${escapeHtml(r.comment || '—')}</td>
      <td>${r.approved ? '<span class="pill pill-ok">تاییدشده</span>' : '<span class="pill pill-wait">در انتظار</span>'}</td>
      <td class="admin-actions-cell">
        ${!r.approved ? `<button class="btn btn-sm btn-secondary" data-action="approveRating" data-id="${escapeHtml(r.id)}"><i class="fa-solid fa-check"></i> تایید</button>` : ''}
        <button class="btn btn-sm btn-danger" data-action="deleteRating" data-id="${escapeHtml(r.id)}"><i class="fa-solid fa-trash"></i> حذف</button>
      </td>
    </tr>
  `).join('');
}
function approveRating(id) {
  const ratings = lsGet(LS_KEYS.RATINGS, []);
  const idx = ratings.findIndex(r => r.id === id);
  if (idx > -1) ratings[idx].approved = true;
  if (!lsSet(LS_KEYS.RATINGS, ratings)) return;
  renderAdminRatings();
  updateAdminBadges();
}
function deleteRating(id) {
  if (!confirm('آیا از حذف این نظر مطمئن هستید؟')) return;
  let ratings = lsGet(LS_KEYS.RATINGS, []);
  ratings = ratings.filter(r => r.id !== id);
  if (!lsSet(LS_KEYS.RATINGS, ratings)) return;
  renderAdminRatings();
  updateAdminBadges();
}

/* ---- پیام‌های تماس ---- */
function renderAdminMessages() {
  const tbody = document.getElementById('admin-messages-body');
  if (!tbody) return;
  const messages = lsGet(LS_KEYS.MESSAGES, []);
  if (!messages.length) {
    tbody.innerHTML = `<tr><td colspan="5" class="empty-admin">پیامی دریافت نشده است.</td></tr>`;
    return;
  }
  tbody.innerHTML = messages.map(m => `
    <tr>
      <td>${escapeHtml(m.name)}</td>
      <td>${escapeHtml(m.phone)}</td>
      <td>${escapeHtml(m.subject)}</td>
      <td>${escapeHtml(m.date)}</td>
      <td class="admin-actions-cell">
        <button class="btn btn-sm btn-secondary" data-action="viewMessage" data-id="${escapeHtml(m.id)}"><i class="fa-solid fa-eye"></i> مشاهده</button>
        <button class="btn btn-sm btn-danger" data-action="deleteMessage" data-id="${escapeHtml(m.id)}"><i class="fa-solid fa-trash"></i> حذف</button>
      </td>
    </tr>
  `).join('');
}
function viewMessage(id) {
  const messages = lsGet(LS_KEYS.MESSAGES, []);
  const m = messages.find(x => x.id === id);
  if (!m) return;
  alert(`نام: ${m.name}\nتلفن: ${m.phone}\nایمیل: ${m.email}\nموضوع: ${m.subject}\nتاریخ: ${escapeHtml(m.date)}\n\nپیام:\n${m.message}`);
}
function deleteMessage(id) {
  if (!confirm('آیا از حذف این پیام مطمئن هستید؟')) return;
  let messages = lsGet(LS_KEYS.MESSAGES, []);
  messages = messages.filter(m => m.id !== id);
  if (!lsSet(LS_KEYS.MESSAGES, messages)) return;
  renderAdminMessages();
  updateAdminBadges();
}

/* ---- درخواست‌های استعلام بیمه ---- */
function renderAdminQuotes() {
  const tbody = document.getElementById('admin-quotes-body');
  if (!tbody) return;
  const quotes = lsGet(LS_KEYS.QUOTES, []);
  if (!quotes.length) {
    tbody.innerHTML = `<tr><td colspan="4" class="empty-admin">درخواستی ثبت نشده است.</td></tr>`;
    return;
  }
  tbody.innerHTML = quotes.map(q => `
    <tr>
      <td>${escapeHtml(q.name)}</td>
      <td>${escapeHtml(q.phone)}</td>
      <td>${escapeHtml(q.type)}</td>
      <td>${escapeHtml(q.date)}</td>
    </tr>
  `).join('');
}

/* ============================================================
   نظرات نمونه صفحه اصلی (استاتیک - جدا از LocalStorage)
   ============================================================ */

/* ============================================================
   راه‌اندازی کلی هنگام لود صفحه
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initToTop();
  initReveal();
  initContactForm();
  initQuoteForm();
  initRatingPage();
  renderRatingSummary();
  initBlogPage();
  initServicesFilter();
  initAdminLogin();
  initAdminLogout();
  initAdminTabs();

  // دکمه افزودن مقاله در پنل ادمین
  const addArticleBtn = document.getElementById('admin-add-article');
  if (addArticleBtn) addArticleBtn.addEventListener('click', () => openArticleForm(null));
});

const articleActions = { openArticleModal, editArticlePrompt, deleteArticle, approveRating, deleteRating, viewMessage, deleteMessage };
document.addEventListener('click', event => {
  const control = event.target.closest('[data-action]');
  if (!control || !Object.hasOwn(articleActions, control.dataset.action)) return;
  event.preventDefault();
  if (control.dataset.action !== 'openArticleModal' && !isAdminLoggedIn()) return;
  articleActions[control.dataset.action](control.dataset.id);
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') document.querySelectorAll('.modal-backdrop.open').forEach(modal => modal.classList.remove('open'));
});
window.addEventListener('storage', () => {
  renderRatingSummary();
  if (document.getElementById('blog-grid')) initBlogPage();
  if (isAdminLoggedIn()) showAdminShell();
});
