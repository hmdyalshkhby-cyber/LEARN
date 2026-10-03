/* ==========================================================================
   app.js — home page (index.html) rendering
   ========================================================================== */

function renderHomeSections() {
  const mount = $("#sectionsGrid");
  if (!mount) return;
  mount.innerHTML = platformData.sections.map((s) => `
    <article class="section-card reveal stagger-item">
      <div class="section-card-top">
        <span class="section-number-ring" style="--pct:100"><span>${String(s.id).padStart(2, "0")}</span></span>
        <span class="section-icon-badge"><i class="fa-solid ${s.icon}"></i></span>
      </div>
      <h3>${escapeHtml(s.title)}</h3>
      <p>${escapeHtml(s.description)}</p>
      <div class="section-card-foot">
        <span class="lecture-count"><i class="fa-solid fa-book-open"></i> ${s.lectures.length} محاضرات</span>
        <a class="card-link" href="sections.html?section=${s.id}">عرض المحاضرات <i class="fa-solid fa-arrow-left"></i></a>
      </div>
    </article>
  `).join("");
}

function renderHomeLanguages() {
  const mount = $("#langGrid");
  if (!mount) return;

  // خريطة دقيقة تربط اسم اللغة بكود العلم الصحيح في الموقع
  const flagMap = {
    "italian": "it",
    "german": "de",
    "english": "gb",
    "arabic": "sa",
    "french": "fr",
    "spanish": "es"
  };

  mount.innerHTML = platformData.languages.lectures.map((l) => {
    // تنظيف اسم اللغة وجعله حروف صغرى للمقارنة السليمة
    const titleLower = l.title ? l.title.toLowerCase().trim() : "";
    const countryCode = flagMap[titleLower] || "un"; // علم افتراضي في حال لم يتم العثور عليه

    return `
      <a class="lang-card reveal stagger-item" href="languages.html?lang=${l.id}">
        <span class="lang-flag" style="display: flex; align-items: center; justify-content: center; overflow: hidden;">
          <img src="https://flagcdn.com/w80/${countryCode}.png" alt="${l.title}" style="width: 40px; height: 30px; object-fit: cover; border-radius: 4px;">
        </span>
        <span class="lang-info">
          <h4>${escapeHtml(l.title)}</h4>
          <p>اختبار تفاعلي · ${l.quiz.length} أسئلة</p>
        </span>
      </a>
    `;
  }).join("");
}

function animateStatRing(el, value, max) {
  const circle = $(".ring-fg", el);
  const valueEl = $(".stat-ring-value", el);
  const r = 40;
  const circumference = 2 * Math.PI * r;
  const pct = Math.min(1, value / max);
  circle.setAttribute("stroke-dasharray", String(circumference));
  circle.setAttribute("stroke-dashoffset", String(circumference));
  let start = null;
  const duration = 1200;
  function step(ts) {
    if (!start) start = ts;
    const progress = Math.min(1, (ts - start) / duration);
    const eased = 1 - Math.pow(1 - progress, 3);
    circle.setAttribute("stroke-dashoffset", String(circumference - eased * pct * circumference));
    valueEl.textContent = Math.round(eased * value);
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function renderHomeStats() {
  const mount = $("#statsGrid");
  if (!mount) return;
  const stats = totalStats();
  const items = [
    { label: "الأقسام التعليمية", value: stats.sectionsCount, max: stats.sectionsCount, icon: "fa-layer-group" },
    { label: "المحاضرات", value: stats.lectures, max: stats.lectures, icon: "fa-chalkboard" },
    { label: "الاختبارات", value: stats.quizzes, max: stats.quizzes, icon: "fa-clipboard-question" },
    { label: "الكلمات والمفردات", value: stats.vocabWords, max: stats.vocabWords, icon: "fa-spell-check" },
  ];
  mount.innerHTML = items.map((it) => `
    <div class="stat-card reveal stagger-item">
      <div class="stat-ring">
        <svg viewBox="0 0 96 96">
          <circle class="ring-bg" cx="48" cy="48" r="40"></circle>
          <circle class="ring-fg" cx="48" cy="48" r="40"></circle>
        </svg>
        <div class="stat-ring-value">0</div>
      </div>
      <div class="stat-label"><i class="fa-solid ${it.icon}"></i> ${it.label}</div>
    </div>
  `).join("");
  $$(".stat-card", mount).forEach((card, i) => animateStatRing(card, items[i].value, items[i].max || 1));
}

document.addEventListener("DOMContentLoaded", () => {
  renderHomeSections();
  renderHomeLanguages();
  renderHomeStats();
  initScrollReveal();
});
