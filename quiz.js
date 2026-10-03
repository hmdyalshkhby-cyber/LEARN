/* ==========================================================================
   quiz.js — reusable quiz engine used by lecture quizzes, comprehensive
   section quizzes, and language quizzes.
   ========================================================================== */

class QuizEngine {
  constructor(opts) {
    // التحقق مما إذا كانت الأسئلة فارغة أو غير متوفرة
    if (!opts.questions || opts.questions.length === 0) {
      this.mount = opts.mount;
      this.title = opts.title || "اختبار";
      this.renderNoQuestions();
      return; // إيقاف إكمال بناء الكويز العادي
    }

    this.questions = shuffleArray(opts.questions);    this.mount = opts.mount;
    this.title = opts.title || "اختبار";
    this.storageKey = opts.storageKey || null;
    this.current = 0;
    this.answers = new Array(this.questions.length).fill(null);
    this.locked = false;
    this.render();
  }

  // دالة جديدة لعرض رسالة "لا يوجد أسئلة"
  renderNoQuestions() {
    this.mount.innerHTML = `
      <div class="quiz-shell page-enter">
        <div class="quiz-card quiz-result" style="text-align: center; padding: 40px 20px;">
          <div style="font-size: 50px; color: var(--text-muted, #94a3b8); margin-bottom: 16px;">
            <i class="fa-solid fa-folder-open"></i>
          </div>
          <h3 style="margin-bottom: 8px;">لا توجد أسئلة مضافة لهذا الاختبار حالياً</h3>
          <p class="perf-msg" style="margin-bottom: 24px;">${this.title}</p>
          <div class="result-actions" style="justify-content: center;">
            <a class="btn btn-primary" href="javascript:history.back()">
              <i class="fa-solid fa-arrow-right"></i> رجوع للخلف
            </a>
          </div>
        </div>
      </div>
    `;
  }

  // ... باقي الدوال كما هي (render, updateProgress, renderQuestion, selectAnswer, إلخ)

  render() {
    this.mount.innerHTML = `
      <div class="quiz-shell page-enter">
        <div class="quiz-progress-wrap">
          <div class="quiz-progress-track"><div class="quiz-progress-fill" id="qProgressFill"></div></div>
          <div class="quiz-progress-label" id="qProgressLabel"></div>
        </div>
        <div class="quiz-card" id="qCard"></div>
        <div class="quiz-nav" id="qNav"></div>
      </div>
    `;
    this.renderQuestion();
  }

  updateProgress() {
    const pct = Math.round(((this.current) / this.questions.length) * 100);
    $("#qProgressFill", this.mount).style.width = `${pct}%`;
    $("#qProgressLabel", this.mount).textContent = `السؤال ${this.current + 1} من ${this.questions.length}`;
  }

  renderQuestion() {
    this.updateProgress();
    const q = this.questions[this.current];
    const card = $("#qCard", this.mount);
    const letters = ["A", "B", "C", "D"];
    this.locked = this.answers[this.current] !== null;

    card.innerHTML = `
      <div class="quiz-question-num"><i class="fa-solid fa-circle-question"></i> ${this.title}</div>
      <h3 class="quiz-question">${escapeHtml(q.question)}</h3>
      <div class="quiz-options" role="radiogroup">
        ${q.options.map((opt, i) => `
          <button class="quiz-option" data-index="${i}" role="radio" aria-checked="false">
            <span class="opt-letter">${letters[i]}</span>
            <span class="opt-text">${escapeHtml(opt)}</span>
            <i class="fa-solid fa-circle-check opt-icon icon-correct"></i>
            <i class="fa-solid fa-circle-xmark opt-icon icon-incorrect"></i>
          </button>
        `).join("")}
      </div>
    `;

    $$(".quiz-option", card).forEach((btn) => {
      btn.addEventListener("click", () => this.selectAnswer(Number(btn.dataset.index)));
    });

    if (this.locked) this.showAnswered();
    this.renderNav();
  }

  selectAnswer(index) {
    if (this.locked) return;
    this.locked = true;
    this.answers[this.current] = index;
    this.showAnswered();
    this.renderNav();
  }

  showAnswered() {
    const q = this.questions[this.current];
    const chosen = this.answers[this.current];
    $$(".quiz-option", this.mount).forEach((btn, i) => {
      btn.disabled = true;
      btn.setAttribute("aria-checked", i === chosen ? "true" : "false");
      if (i === q.correct) btn.classList.add("correct");
      if (i === chosen && chosen !== q.correct) btn.classList.add("incorrect");
      if (i === chosen) btn.classList.add("selected");
    });
  }

  renderNav() {
    const nav = $("#qNav", this.mount);
    const isLast = this.current === this.questions.length - 1;
    const answered = this.answers[this.current] !== null;
    nav.innerHTML = `
      <button class="btn btn-ghost" id="qPrev" ${this.current === 0 ? "disabled" : ""}>
        <i class="fa-solid fa-arrow-right"></i> السابق
      </button>
      <button class="btn btn-primary" id="qNext" ${answered ? "" : "disabled"}>
        ${isLast ? "عرض النتيجة" : "التالي"} <i class="fa-solid fa-arrow-left"></i>
      </button>
    `;
    $("#qPrev", nav).addEventListener("click", () => { this.current--; this.renderQuestion(); });
    $("#qNext", nav).addEventListener("click", () => {
      if (isLast) this.renderResult();
      else { this.current++; this.renderQuestion(); }
    });
  }

  renderResult() {
    const correctCount = this.answers.reduce((sum, a, i) => sum + (a === this.questions[i].correct ? 1 : 0), 0);
    const total = this.questions.length;
    const pct = Math.round((correctCount / total) * 100);
    const perf = performanceMessage(pct);
    const circumference = 2 * Math.PI * 78;
    const offset = circumference - (pct / 100) * circumference;

    if (this.storageKey) {
      const prevBest = Store.get(this.storageKey, 0);
      Store.set(this.storageKey, Math.max(prevBest, pct));
      Store.set(`${this.storageKey}_last`, { pct, correctCount, total, at: Date.now() });
    }

    this.mount.innerHTML = `
      <div class="quiz-shell">
        <div class="quiz-card quiz-result page-enter">
          <div class="result-ring">
            <svg viewBox="0 0 180 180">
              <circle class="ring-bg" cx="90" cy="90" r="78"></circle>
              <circle class="ring-fg" cx="90" cy="90" r="78" stroke-dasharray="${circumference}" stroke-dashoffset="${circumference}"></circle>
            </svg>
            <div class="result-ring-inner">
              <span class="rpct">${pct}%</span>
              <span class="rlabel">النتيجة النهائية</span>
            </div>
          </div>
          <span class="badge ${perf.cls}"><i class="fa-solid ${perf.icon}"></i> ${perf.label}</span>
          <h3 style="margin-top:16px;">اكتمل الاختبار!</h3>
          <p class="perf-msg">${this.title}</p>
          <div class="result-stats">
            <div class="result-stat ok"><div class="rs-val">${correctCount}</div><div class="rs-label">إجابات صحيحة</div></div>
            <div class="result-stat bad"><div class="rs-val">${total - correctCount}</div><div class="rs-label">إجابات خاطئة</div></div>
            <div class="result-stat"><div class="rs-val">${total}</div><div class="rs-label">إجمالي الأسئلة</div></div>
          </div>
          <div class="result-actions">
            <button class="btn btn-primary" id="qRetry"><i class="fa-solid fa-rotate-right"></i> إعادة الاختبار</button>
            <a class="btn btn-ghost" href="javascript:history.back()"><i class="fa-solid fa-arrow-right"></i> رجوع</a>
          </div>
        </div>
      </div>
    `;
    requestAnimationFrame(() => {
      const ring = $(".ring-fg", this.mount);
      if (ring) ring.style.strokeDashoffset = String(offset);
    });
    $("#qRetry", this.mount).addEventListener("click", () => {
      this.current = 0;
      this.answers = new Array(this.questions.length).fill(null);
      this.questions = shuffleOptionsPreserved(this.questions.map((q, i) => this._originalRef ? this._originalRef[i] : q));
      this.render();
    });
  }
}

/** Shallow-clones questions (options order kept stable/deterministic on purpose,
 *  so re-marking correctness stays reliable across renders). */
function shuffleOptionsPreserved(questions) {
  return questions.map((q) => ({ question: q.question, options: [...q.options], correct: q.correct, _lecture: q._lecture }));
}
// مثال لتطبيق الخلط على أسئلة محاضرة معينة
let rawQuestions = findLecture(sectionId, lectureId).quiz;
let questions = shuffleArray(rawQuestions);

// مثال لتطبيق الخلط على الاختبار الشامل للقسم
let comprehensiveQuiz = sectionComprehensiveQuiz(section);
let randomComprehensiveQuestions = shuffleArray(comprehensiveQuiz);