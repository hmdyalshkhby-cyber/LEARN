/* ==========================================================================
   navigation.js — header interactions, mobile drawer, breadcrumbs
   ========================================================================== */

function initMobileNav() {
  const toggle = $(".nav-toggle");
  const drawer = $(".mobile-nav-drawer");
  if (!toggle || !drawer) return;
  toggle.addEventListener("click", () => {
    drawer.classList.toggle("open");
    const isOpen = drawer.classList.contains("open");
    toggle.innerHTML = `<i class="fa-solid ${isOpen ? "fa-xmark" : "fa-bars"}"></i>`;
  });
  $$("a", drawer).forEach((a) => a.addEventListener("click", () => {
    drawer.classList.remove("open");
    toggle.innerHTML = `<i class="fa-solid fa-bars"></i>`;
  }));
}

function markActiveNav() {
  const path = window.location.pathname.split("/").pop() || "index.html";
  $$(".main-nav a, .mobile-nav-drawer a").forEach((a) => {
    const href = a.getAttribute("href")?.split("?")[0];
    if (href === path) a.classList.add("active");
  });
}

/**
 * Renders breadcrumb trail.
 * items: [{ label, href }] — last item has no href (current page).
 */
function renderBreadcrumbs(items) {
  const el = $(".breadcrumbs ol");
  if (!el) return;
  el.innerHTML = items.map((item, i) => {
    const isLast = i === items.length - 1;
    const icon = i === 0 ? '<i class="fa-solid fa-house"></i>' : "";
    if (isLast || !item.href) {
      return `<li>${icon}${escapeHtml(item.label)}</li>`;
    }
    return `<li><a href="${item.href}">${icon}${escapeHtml(item.label)}</a></li><li><i class="fa-solid fa-chevron-left"></i></li>`;
  }).join("");
}

function setLastVisitedLecture(sectionId, lectureId, sectionTitle, lectureTitle) {
  Store.set("masar_last_lecture", { sectionId, lectureId, sectionTitle, lectureTitle, at: Date.now() });
}

document.addEventListener("DOMContentLoaded", () => {
  initMobileNav();
  markActiveNav();
  initRipples();
});
