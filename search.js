/* ==========================================================================
   search.js — global search across sections, lectures, vocabulary, content
   ========================================================================== */

function buildSearchIndex() {
  const index = [];
  platformData.sections.forEach((section) => {
    index.push({
      type: "section", icon: "fa-layer-group",
      title: section.title, meta: `قسم · ${section.lectures.length} محاضرات`,
      href: `sections.html?section=${section.id}`,
      haystack: section.title + " " + section.description
    });
    section.lectures.forEach((lecture) => {
      index.push({
        type: "lecture", icon: "fa-book",
        title: lecture.title, meta: `محاضرة · ${section.title}`,
        href: `lecture.html?section=${section.id}&lecture=${lecture.id}`,
        haystack: lecture.title + " " + lecture.content
      });
      lecture.vocabulary.forEach((v) => {
        index.push({
          type: "vocab", icon: "fa-spell-check",
          title: `${v.word} — ${v.translation}`, meta: `مفردة · ${lecture.title}`,
          href: `lecture.html?section=${section.id}&lecture=${lecture.id}&tab=vocabulary`,
          haystack: v.word + " " + v.translation + " " + v.example
        });
      });
    });
  });
  platformData.languages.lectures.forEach((lec) => {
    index.push({
      type: "language", icon: "fa-language",
      title: lec.title, meta: "لغة · اختبار",
      href: `languages.html?lang=${lec.id}`,
      haystack: lec.title
    });
  });
  return index;
}

let SEARCH_INDEX = null;

function openSearchOverlay() {
  const overlay = $(".search-overlay");
  if (!overlay) return;
  overlay.classList.add("open");
  const input = $(".search-input-row input", overlay);
  input.value = "";
  renderSearchResults("");
  setTimeout(() => input.focus(), 150);
  document.body.style.overflow = "hidden";
}
function closeSearchOverlay() {
  const overlay = $(".search-overlay");
  if (!overlay) return;
  overlay.classList.remove("open");
  document.body.style.overflow = "";
}

function renderSearchResults(query) {
  const resultsEl = $(".search-results");
  if (!resultsEl) return;
  if (!query.trim()) {
    resultsEl.innerHTML = `<div class="search-hint">اكتب اسم قسم، محاضرة، أو كلمة للبحث عنها في المنصة</div>`;
    return;
  }
  const q = query.trim().toLowerCase();
  const matches = SEARCH_INDEX.filter((item) => item.haystack.toLowerCase().includes(q)).slice(0, 30);
  if (!matches.length) {
    resultsEl.innerHTML = `<div class="search-empty"><i class="fa-solid fa-magnifying-glass-minus"></i>لا توجد نتائج مطابقة لـ "${escapeHtml(query)}"</div>`;
    return;
  }
  resultsEl.innerHTML = matches.map((m) => `
    <a class="search-result-item" href="${m.href}">
      <span class="sri-icon"><i class="fa-solid ${m.icon}"></i></span>
      <span>
        <span class="sri-title" style="display:block;">${escapeHtml(m.title)}</span>
        <span class="sri-meta">${escapeHtml(m.meta)}</span>
      </span>
    </a>
  `).join("");
}

function initGlobalSearch() {
  if (!$(".search-overlay")) {
    document.body.insertAdjacentHTML("beforeend", `
      <div class="search-overlay">
        <div class="search-panel">
          <div class="search-input-row">
            <i class="fa-solid fa-magnifying-glass"></i>
            <input type="text" placeholder="ابحث عن قسم، محاضرة، أو كلمة..." autocomplete="off" />
            <button class="search-close" type="button" aria-label="إغلاق البحث"><i class="fa-solid fa-xmark"></i></button>
          </div>
          <div class="search-results"></div>
        </div>
      </div>
    `);
  }
  SEARCH_INDEX = buildSearchIndex();
  const overlay = $(".search-overlay");
  const input = $(".search-input-row input", overlay);
  input.addEventListener("input", debounce((e) => renderSearchResults(e.target.value), 180));
  $(".search-close", overlay).addEventListener("click", closeSearchOverlay);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) closeSearchOverlay(); });

  $$(".search-trigger").forEach((btn) => btn.addEventListener("click", openSearchOverlay));

  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      openSearchOverlay();
    }
    if (e.key === "Escape") closeSearchOverlay();
  });
}

document.addEventListener("DOMContentLoaded", initGlobalSearch);
