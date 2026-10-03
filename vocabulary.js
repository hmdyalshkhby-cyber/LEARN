/* ==========================================================================
   vocabulary.js — renders the vocabulary table (search + sort + responsive)
   ========================================================================== */

function renderVocabulary(mount, vocabulary) {
  let sortKey = null;
  let sortDir = 1;
  let query = "";

  function draw() {
    let rows = vocabulary.filter((v) =>
      !query || (v.word + v.translation + v.example).toLowerCase().includes(query.toLowerCase())
    );
    if (sortKey) {
      rows = [...rows].sort((a, b) => a[sortKey].localeCompare(b[sortKey], "ar") * sortDir);
    }
    const tbody = $("tbody", mount);
    if (!rows.length) {
      tbody.innerHTML = `<tr><td colspan="3"><div class="empty-state" style="padding:36px 0;"><i class="fa-solid fa-magnifying-glass-minus"></i><h4>لا توجد نتائج</h4></div></td></tr>`;
      return;
    }
    tbody.innerHTML = rows.map((v) => `
      <tr>
        <td class="word-en">${escapeHtml(v.word)}</td>
        <td>${escapeHtml(v.translation)}</td>
        <td>${escapeHtml(v.example)}</td>
      </tr>
    `).join("");
  }

  mount.innerHTML = `
    <div class="vocab-toolbar">
      <div class="vocab-search">
        <input type="text" placeholder="ابحث في الكلمات..." aria-label="بحث في المفردات" />
        <i class="fa-solid fa-magnifying-glass"></i>
      </div>
      <span class="badge badge-primary"><i class="fa-solid fa-spell-check"></i> ${vocabulary.length} كلمة</span>
    </div>
    <div class="table-wrap">
      <table class="vocab-table">
        <thead>
          <tr>
            <th data-key="word">English <i class="fa-solid fa-sort"></i></th>
            <th data-key="translation">Arabic <i class="fa-solid fa-sort"></i></th>
            <th>Example</th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
    </div>
  `;

  $(".vocab-search input", mount).addEventListener("input", debounce((e) => { query = e.target.value; draw(); }, 150));
  $$("thead th[data-key]", mount).forEach((th) => {
    th.addEventListener("click", () => {
      const key = th.dataset.key;
      sortDir = sortKey === key ? -sortDir : 1;
      sortKey = key;
      draw();
    });
  });

  draw();
}
