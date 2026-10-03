/* ==========================================================================
   utils.js — shared helper functions (DOM, storage, formatting, effects)
   ========================================================================== */

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

const Store = {
  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch (e) { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* storage full/unavailable */ }
  }
};

function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function debounce(fn, wait = 200) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait); };
}

function escapeHtml(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function showToast(message, icon = "fa-circle-check") {
  let stack = $(".toast-stack");
  if (!stack) {
    stack = document.createElement("div");
    stack.className = "toast-stack";
    document.body.appendChild(stack);
  }
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `<i class="fa-solid ${icon}"></i><span>${escapeHtml(message)}</span>`;
  stack.appendChild(toast);
  setTimeout(() => {
    toast.style.transition = "opacity .3s ease";
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 300);
  }, 2600);
}

/* Ripple effect for .btn elements */
function initRipples() {
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn, .btn-icon");
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const ripple = document.createElement("span");
    const size = Math.max(rect.width, rect.height);
    ripple.className = "ripple";
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
    btn.style.position = btn.style.position || "relative";
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 650);
  });
}

/* Scroll-reveal via IntersectionObserver */
function initScrollReveal() {
  const items = $$(".reveal");
  if (!items.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  items.forEach((el) => io.observe(el));
}

function performanceMessage(pct) {
  if (pct >= 90) return { label: "ممتاز", cls: "badge-success", icon: "fa-trophy" };
  if (pct >= 70) return { label: "جيد جدًا", cls: "badge-primary", icon: "fa-star" };
  if (pct >= 50) return { label: "جيد", cls: "badge-accent", icon: "fa-thumbs-up" };
  return { label: "واصل التدريب", cls: "badge-accent", icon: "fa-rotate" };
}

function totalStats() {
  const sections = platformData.sections;
  const lectures = sections.reduce((sum, s) => sum + s.lectures.length, 0);
  const quizzes = sections.reduce((sum, s) => sum + s.lectures.length, 0) + platformData.languages.lectures.length;
  const vocabWords = sections.reduce((sum, s) => sum + s.lectures.reduce((a, l) => a + l.vocabulary.length, 0), 0);
  return { sectionsCount: sections.length, lectures, quizzes, vocabWords };
}

function findSection(sectionId) {
  return platformData.sections.find((s) => String(s.id) === String(sectionId));
}
function findLecture(sectionId, lectureId) {
  const section = findSection(sectionId);
  if (!section) return null;
  return section.lectures.find((l) => String(l.id) === String(lectureId)) || null;
}
function sectionComprehensiveQuiz(section) {
  return section.lectures.flatMap((l) => l.quiz.map((q) => ({ ...q, _lecture: l.title })));
}
/* Shuffle an array randomly */
function shuffleArray(array) {
  let shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}