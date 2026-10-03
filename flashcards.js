/* ==========================================================================
   flashcards.js — flip-card grid for term / definition / translation
   ========================================================================== */

function renderFlashcards(mount, flashcards) {
  mount.innerHTML = `
    <div class="flashcards-grid">
      ${flashcards.map((fc, i) => `
        <div class="flashcard" data-index="${i}" tabindex="0" role="button" aria-label="بطاقة تعريفية: ${escapeHtml(fc.term)}">
          <div class="flashcard-inner">
            <div class="flashcard-face flashcard-front">
              <h4>${escapeHtml(fc.term)}</h4>
              <span class="fc-hint"><i class="fa-solid fa-arrows-rotate"></i> اضغط لعرض التعريف</span>
            </div>
            <div class="flashcard-face flashcard-back">
              <div class="fc-term">${escapeHtml(fc.translation)}</div>
              <div class="fc-def">${escapeHtml(fc.definition)}</div>
              <div class="fc-example">${escapeHtml(fc.example)}</div>
            </div>
          </div>
        </div>
      `).join("")}
    </div>
  `;

  $$(".flashcard", mount).forEach((card) => {
    const flip = () => card.classList.toggle("flipped");
    card.addEventListener("click", flip);
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); flip(); }
    });
  });
}
