/* ==========================================================================
   theme.js — Dark / Light mode, persisted via localStorage
   ========================================================================== */

const THEME_KEY = "masar_theme";

function applyStoredTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  const preferred = saved || (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  document.documentElement.setAttribute("data-theme", preferred);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
  const next = current === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem(THEME_KEY, next);
}

function initThemeToggleButtons() {
  $$(".theme-toggle").forEach((btn) => {
    btn.addEventListener("click", toggleTheme);
  });
}

/* Apply theme immediately (before DOMContentLoaded) to avoid flash */
applyStoredTheme();
document.addEventListener("DOMContentLoaded", initThemeToggleButtons);
