/* ==========================================================================
   quiz-page.js — resolves quiz.html query params into a QuizEngine instance
   ========================================================================== */

function initQuizPage() {
  const root = $("#quizPageRoot");
  if (!root) return;
  const type = getParam("type");

  if (!type) {
    renderBreadcrumbs([{ label: "الرئيسية", href: "index.html" }, { label: "الاختبارات" }]);
    $("#quizTitle").textContent = "اختر اختبارًا لبدء التدريب";
    $("#quizSub").textContent = "يمكنك اختيار اختبار محاضرة، اختبار شامل لقسم كامل، أو اختبار لغة.";
    renderQuizPicker();
    return;
  }

  let questions = [];
  let title = "اختبار";
  let storageKey = null;
  let crumbs = [{ label: "الرئيسية", href: "index.html" }];

  if (type === "lecture") {
    const section = findSection(getParam("section"));
    const lecture = section ? findLecture(getParam("section"), getParam("lecture")) : null;
    if (!lecture) return renderQuizError();
    questions = lecture.quiz;
    title = `اختبار: ${lecture.title}`;
    storageKey = `quiz_score_lec_${section.id}_${lecture.id}`;
    crumbs.push({ label: "الأقسام", href: "sections.html" });
    crumbs.push({ label: section.title, href: `sections.html?section=${section.id}` });
    crumbs.push({ label: lecture.title, href: `lecture.html?section=${section.id}&lecture=${lecture.id}` });
    crumbs.push({ label: "اختبار" });
  } else if (type === "comprehensive") {
    const section = findSection(getParam("section"));
    if (!section) return renderQuizError();
    questions = sectionComprehensiveQuiz(section);
    title = `اختبار ${section.title} الشامل`;
    storageKey = `quiz_score_comp_${section.id}`;
    crumbs.push({ label: "الأقسام", href: "sections.html" });
    crumbs.push({ label: section.title, href: `sections.html?section=${section.id}` });
    crumbs.push({ label: "اختبار شامل" });
  } else if (type === "language") {
    const lecture = platformData.languages.lectures.find((l) => String(l.id) === String(getParam("lang")));
    if (!lecture) return renderQuizError();
    questions = lecture.quiz;
    title = `اختبار ${lecture.title} ${lecture.flag}`;
    storageKey = `quiz_score_lang_${lecture.id}`;
    crumbs.push({ label: "Languages", href: "languages.html" });
    crumbs.push({ label: lecture.title });
  } else {
    return renderQuizError();
  }

  renderBreadcrumbs(crumbs);
  $("#quizTitle").textContent = title;
  $("#quizSub").textContent = `${questions.length} سؤال اختيار من متعدد — أجب عن كل سؤال ثم انتقل للتالي`;
  $("#quizPicker")?.classList.add("empty-hidden");
  $("#quizEngineMount").classList.remove("empty-hidden");

  new QuizEngine({ questions, mount: $("#quizEngineMount"), title, storageKey });
}

function renderQuizError() {
  $("#quizTitle").textContent = "تعذر تحميل الاختبار";
  $("#quizSub").textContent = "الرابط غير صحيح أو المحتوى غير متوفر. عد إلى الأقسام واختر محاضرة صحيحة.";
}

function renderQuizPicker() {
  const mount = $("#quizPicker");
  if (!mount) return;
  mount.classList.remove("empty-hidden");
  let html = `<div class="section-head"><div><span class="eyebrow"><i class="fa-solid fa-layer-group"></i> اختبارات الأقسام الشاملة</span></div></div><div class="quiz-select-grid" style="margin-bottom:44px;">`;
  html += platformData.sections.map((s) => `
    <a class="quiz-select-card reveal stagger-item" href="quiz.html?type=comprehensive&section=${s.id}">
      <i class="fa-solid ${s.icon}"></i>
      <h4>${escapeHtml(s.title)}</h4>
      <p>${sectionComprehensiveQuiz(s).length} سؤال</p>
    </a>
  `).join("");
  html += `</div>`;
  html += `<div class="section-head"><div><span class="eyebrow"><i class="fa-solid fa-language"></i> اختبارات اللغات</span></div></div><div class="quiz-select-grid">`;
  html += platformData.languages.lectures.map((l) => `
    <a class="quiz-select-card reveal stagger-item" href="quiz.html?type=language&lang=${l.id}">
      <span style="font-size:26px; display:block; margin-bottom:10px;">${l.flag}</span>
      <h4>${escapeHtml(l.title)}</h4>
      <p>${l.quiz.length} سؤال</p>
    </a>
  `).join("");
  html += `</div>`;
  mount.innerHTML = html;
  initScrollReveal();
}

document.addEventListener("DOMContentLoaded", initQuizPage);
