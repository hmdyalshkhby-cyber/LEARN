/* ==========================================================================
   lectures.js — sections.html (listing) + lecture.html (tabbed detail)
   ========================================================================== */

/* -------------------- sections.html -------------------- */
function initSectionsPage() {
  const root = $("#sectionsPageRoot");
  if (!root) return;
  const sectionId = getParam("section");

  if (!sectionId) {
    renderBreadcrumbs([{ label: "الرئيسية", href: "index.html" }, { label: "الأقسام" }]);
    $("#pageTitle").textContent = "جميع الأقسام التعليمية";
    $("#pageDesc").textContent = "اختر القسم الذي ترغب في دراسته لعرض المحاضرات الخاصة به.";
    const grid = $("#allSectionsGrid");
    grid.classList.remove("empty-hidden");
    grid.innerHTML = platformData.sections.map((s) => `
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
    initScrollReveal();
    return;
  }

  const section = findSection(sectionId);
  if (!section) {
    $("#pageTitle").textContent = "القسم غير موجود";
    $("#pageDesc").textContent = "تعذر العثور على هذا القسم، تحقق من الرابط أو عد إلى الأقسام.";
    return;
  }

  renderBreadcrumbs([
    { label: "الرئيسية", href: "index.html" },
    { label: "الأقسام", href: "sections.html" },
    { label: section.title }
  ]);
  $("#pageTitle").textContent = section.title;
  $("#pageDesc").textContent = section.description;

  const list = $("#lectureList");
  list.classList.remove("empty-hidden");
  // التحقق مما إذا كانت المحاضرات فارغة لعرض رسالة "لا توجد محاضرات"
  if (!section.lectures || section.lectures.length === 0) {
    list.innerHTML = `
      <div class="no-lectures-message" style="text-align: center; padding: 50px 20px; background: var(--bg-card, #fff); border-radius: 16px; box-shadow: var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.1)); width: 100%; grid-column: 1 / -1;">
        <div style="font-size: 48px; color: var(--text-muted, #94a3b8); margin-bottom: 16px;">
          <i class="fa-solid fa-book-open-reader"></i>
        </div>
        <h3 style="font-size: 18px; font-weight: 700; color: var(--text-main, #1e293b); margin-bottom: 8px;">لا توجد محاضرات مضافة لهذا القسم حالياً</h3>
        <p style="font-size: 14px; color: var(--text-muted, #64748b);">ترقبوا إضافة المحاضرات والدروس قريباً.</p>
      </div>
    `;
  } else {
    list.innerHTML = section.lectures.map((l) => `
      <a class="lecture-item reveal stagger-item" href="lecture.html?section=${section.id}&lecture=${l.id}">
        <span class="lecture-index">${String(l.id).padStart(2, "0")}</span>
        <span class="lecture-item-info">
          <h4>${escapeHtml(l.title)}</h4>
          <span><i class="fa-solid fa-clipboard-question"></i> ${l.quiz ? l.quiz.length : 0} أسئلة اختبار</span>
        </span>
        <i class="fa-solid fa-chevron-left"></i>
      </a>
    `).join("");
  }

  const banner = $("#comprehensiveBanner");
  banner.classList.remove("empty-hidden");
  $("#comprehensiveLink", banner).href = `quiz.html?type=comprehensive&section=${section.id}`;
  $("#comprehensiveCount", banner).textContent = sectionComprehensiveQuiz(section).length;

  initScrollReveal();
}

/* -------------------- lecture.html -------------------- */
function initLecturePage() {
  const root = $("#lecturePageRoot");
  if (!root) return;
  const sectionId = getParam("section");
  const lectureId = getParam("lecture");
  const section = findSection(sectionId);
  const lecture = section ? findLecture(sectionId, lectureId) : null;

  if (!section || !lecture) {
    $("#lectureTitle").textContent = "المحاضرة غير موجودة";
    $("#lectureSub").textContent = "تحقق من الرابط أو عد إلى قائمة المحاضرات.";
    $("#lectureShell").classList.add("empty-hidden");
    return;
  }

  renderBreadcrumbs([
    { label: "الرئيسية", href: "index.html" },
    { label: "الأقسام", href: "sections.html" },
    { label: section.title, href: `sections.html?section=${section.id}` },
    { label: lecture.title }
  ]);
  $("#lectureTitle").textContent = lecture.title;
  $("#lectureSub").textContent = section.title;
  setLastVisitedLecture(section.id, lecture.id, section.title, lecture.title);

//  /* Content handling */
//   const textContentEl = $("#tabContentPanel .lecture-text-content");
  
//   if (!lecture.content || lecture.content.trim() === "") {
//     if (textContentEl) {
//       textContentEl.innerHTML = `
//         <div class="no-content-message" style="text-align: center; padding: 40px; color: #6b7280; font-family: 'Cairo', sans-serif;">
//           <i class="fa-solid fa-file-lines" style="font-size: 28px; margin-bottom: 10px; display: block; color: #9ca3af;"></i>
//           <p style="font-size: 16px; font-weight: 600;">لا يوجد محتوى متاح لهذه المحاضرة حالياً</p>
//         </div>
//       `;
//     }
//   } else {
//     if (textContentEl) {
//       textContentEl.textContent = lecture.content;
//     }
//   }
 /* PDF handling */
  const pdfOpenBtn = $("#pdfOpenBtn");
  
  if (!lecture.pdfUrl || lecture.pdfUrl.trim() === "" || lecture.pdfUrl === "#") {
    if (pdfOpenBtn) {
      pdfOpenBtn.href = "#";
      pdfOpenBtn.style.opacity = "0.7";
      pdfOpenBtn.addEventListener("click", (e) => {
        e.preventDefault();
        alert("لا يوجد ملف PDF متاح لهذه المحاضرة حالياً.");
      });
    }
  } else {
    if (pdfOpenBtn) {
      pdfOpenBtn.href = lecture.pdfUrl;
      pdfOpenBtn.style.opacity = "1";
      // إزالة أي حدث قديم قد يمنع الرابط في حال تم التنقل بين المحاضرات
      pdfOpenBtn.onclick = null; 
    }
  }

  /* Important points — show empty message when empty */
  const pointsPanelNavBtn = $('[data-tab="points"]');
  const tabPointsPanel = $("#tabPointsPanel");
  
  if (pointsPanelNavBtn) pointsPanelNavBtn.classList.remove("empty-hidden");
  if (tabPointsPanel) tabPointsPanel.classList.remove("empty-hidden");

  if (!lecture.importantPoints || lecture.importantPoints.length === 0) {
    $("#pointsList").innerHTML = `
      <div class="no-points-message" style="text-align: center; padding: 40px; color: #6b7280; font-family: 'Cairo', sans-serif;">
        <i class="fa-solid fa-circle-info" style="font-size: 24px; margin-bottom: 10px; display: block; color: #9ca3af;"></i>
        <p style="font-size: 16px; font-weight: 600;">لا يوجد نقاط مهمة</p>
      </div>
    `;
  } else {
    $("#pointsList").innerHTML = lecture.importantPoints.map((p, i) => `
      <div class="point-item">
        <span class="point-bullet">${i + 1}</span>
        <p>${escapeHtml(p)}</p>
      </div>
    `).join("");
  }

  /* Vocabulary handling */
  const vocabMount = $("#vocabMount");

  if (!lecture.vocabulary || lecture.vocabulary.length === 0) {
    if (vocabMount) {
      vocabMount.innerHTML = `
        <div class="no-vocab-message" style="text-align: center; padding: 40px; color: #6b7280; font-family: 'Cairo', sans-serif;">
          <i class="fa-solid fa-book-bookmark" style="font-size: 24px; margin-bottom: 10px; display: block; color: #9ca3af;"></i>
          <p style="font-size: 16px; font-weight: 600;">لا يوجد مفردات متاحة لهذه المحاضرة حالياً</p>
        </div>
      `;
    }
  } else {
    renderVocabulary(vocabMount, lecture.vocabulary);
  }

 /* Flashcards handling */
  const flashcardsMount = $("#flashcardsMount");
  const flashcardsTabBtn = $('[data-tab="flashcards"]'); // زر التبويب الخاص بالبطاقات إن وجد

  if (!lecture.flashcards || lecture.flashcards.length === 0) {
    if (flashcardsMount) {
      flashcardsMount.innerHTML = `
        <div class="no-flashcards-message" style="text-align: center; padding: 40px; color: #6b7280; font-family: 'Cairo', sans-serif;">
          <i class="fa-solid fa-layer-group" style="font-size: 24px; margin-bottom: 10px; display: block; color: #9ca3af;"></i>
          <p style="font-size: 16px; font-weight: 600;">لا يوجد بطاقات تعريفية متاحة لهذه المحاضرة حالياً</p>
        </div>
      `;
    }
  } else {
    renderFlashcards(flashcardsMount, lecture.flashcards);
  }

 /* Quiz link handling */
  const quizBtn = $("#lectureQuizBtn");
  const quizCount = $("#lectureQuizCount");
  
  if (quizCount) quizCount.textContent = lecture.quiz ? lecture.quiz.length : 0;

  if (quizBtn) {
    if (!lecture.quiz || lecture.quiz.length === 0) {
      quizBtn.href = "#";
      quizBtn.addEventListener("click", (e) => {
        e.preventDefault();
        alert("لا يوجد اختبار متاح لهذه المحاضرة حالياً.");
      });
      // اختيارياً: يمكنك إضافة تأثير بصري خفيف للإشارة أنه غير متوفر
      quizBtn.style.opacity = "0.7";
    } else {
      quizBtn.href = `quiz.html?type=lecture&section=${section.id}&lecture=${lecture.id}`;
      quizBtn.style.opacity = "1";
    }
  }

  /* Prev / Next lecture nav */
  const idx = section.lectures.findIndex((l) => String(l.id) === String(lecture.id));
  const prev = section.lectures[idx - 1];
  const next = section.lectures[idx + 1];
  const prevBtn = $("#prevLectureBtn");
  const nextBtn = $("#nextLectureBtn");
  if (prev) { prevBtn.href = `lecture.html?section=${section.id}&lecture=${prev.id}`; prevBtn.classList.remove("empty-hidden"); }
  else prevBtn.classList.add("empty-hidden");
  if (next) { nextBtn.href = `lecture.html?section=${section.id}&lecture=${next.id}`; nextBtn.classList.remove("empty-hidden"); }
  else nextBtn.classList.add("empty-hidden");

  initLectureTabs();

  const requestedTab = getParam("tab");
  if (requestedTab) activateTab(requestedTab);
}

function initLectureTabs() {
  $$(".lecture-tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => activateTab(btn.dataset.tab));
  });
}
function activateTab(tab) {
  $$(".lecture-tab-btn").forEach((b) => b.classList.toggle("active", b.dataset.tab === tab));
  $$(".lecture-panel").forEach((p) => p.classList.toggle("active", p.id === `tab${capitalize(tab)}Panel`));
}
function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

/* -------------------- languages.html -------------------- */
function initLanguagesPage() {
  const root = $("#languagesPageRoot");
  if (!root) return;
  renderBreadcrumbs([{ label: "الرئيسية", href: "index.html" }, { label: "Languages" }]);

  // خريطة لربط أسماء اللغات بأكواد الأعلام الصحيحة
  const flagMap = {
    "italian": "it",
    "german": "de",
    "english": "gb",
    "arabic": "sa",
    "french": "fr",
    "spanish": "es"
  };

  const grid = $("#languagesGrid");
  if (!grid) return;

  grid.innerHTML = platformData.languages.lectures.map((l) => {
    // تنظيف الاسم ومعرفة كود الدولة المناسب
    const titleLower = l.title ? l.title.toLowerCase().trim() : "";
    const countryCode = flagMap[titleLower] || "un";

    return `
      <article class="section-card reveal stagger-item" style="text-align:center;">
        <div class="lang-flag" style="margin:0 auto 16px; display:flex; align-items:center; justify-content:center; overflow:hidden;">
          <img src="https://flagcdn.com/w80/${countryCode}.png" alt="${escapeHtml(l.title)}" style="width: 48px; height: 36px; object-fit: cover; border-radius: 4px;">
        </div>
        <h3>${escapeHtml(l.title)}</h3>
        <p>اختبار تفاعلي مخصص لتعلم أساسيات ${escapeHtml(l.title)} — ${l.quiz.length} أسئلة اختيار من متعدد.</p>
        <div class="section-card-foot" style="justify-content:center;">
          <a class="btn btn-primary btn-sm" href="quiz.html?type=language&lang=${l.id}">
            <i class="fa-solid fa-play"></i> ابدأ الاختبار
          </a>
        </div>
      </article>
    `;
  }).join("");
  
  initScrollReveal();
}

document.addEventListener("DOMContentLoaded", () => {
  initSectionsPage();
  initLecturePage();
  initLanguagesPage();
});
