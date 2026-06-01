/* ============================================================
   App engine — chrome injection, theme, progress, TOC, hub
   ============================================================ */
(function () {
  const LS_THEME = "aa_theme";
  const LS_PROGRESS = "aa_progress";
  const COURSES = window.COURSES || [];
  const CATS = window.CATEGORIES || {};
  const byCat = (c) => COURSES.filter((x) => x.cat === c);
  const findCourse = (slug) => COURSES.findIndex((x) => x.slug === slug);

  /* ---------- paths (depth-aware: hub at root, courses in /courses/) ---------- */
  const page = document.body.dataset.page || "course";
  // Hub lives at root; course pages live inside /courses/
  const courseHref = (slug) => (page === "hub" ? `courses/${slug}.html` : `${slug}.html`);
  const homeHref = page === "hub" ? "index.html" : "../index.html";

  /* ---------- Claude burst mark (radiating sunburst, à la Claude) ---------- */
  const CLAUDE_MARK = `<svg viewBox="0 0 100 100" width="20" height="20" aria-hidden="true" focusable="false">
    <g stroke="#fff" stroke-width="8" stroke-linecap="round">
      <line x1="50" y1="50" x2="90" y2="50"/><line x1="50" y1="50" x2="77.7" y2="34"/>
      <line x1="50" y1="50" x2="70" y2="15.4"/><line x1="50" y1="50" x2="50" y2="18"/>
      <line x1="50" y1="50" x2="30" y2="15.4"/><line x1="50" y1="50" x2="22.3" y2="34"/>
      <line x1="50" y1="50" x2="10" y2="50"/><line x1="50" y1="50" x2="22.3" y2="66"/>
      <line x1="50" y1="50" x2="30" y2="84.6"/><line x1="50" y1="50" x2="50" y2="82"/>
      <line x1="50" y1="50" x2="70" y2="84.6"/><line x1="50" y1="50" x2="77.7" y2="66"/>
    </g></svg>`;

  /* ---------- progress ---------- */
  const getProgress = () => {
    try { return new Set(JSON.parse(localStorage.getItem(LS_PROGRESS) || "[]")); }
    catch { return new Set(); }
  };
  const saveProgress = (set) => localStorage.setItem(LS_PROGRESS, JSON.stringify([...set]));

  /* ---------- theme ---------- */
  function applyTheme(t) {
    document.documentElement.setAttribute("data-theme", t);
    localStorage.setItem(LS_THEME, t);
    document.querySelectorAll("[data-theme-icon]").forEach((el) => (el.textContent = t === "dark" ? "☀️" : "🌙"));
  }
  function initTheme() {
    const saved = localStorage.getItem(LS_THEME) ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    applyTheme(saved);
  }

  /* ---------- navbar ---------- */
  function buildNav() {
    const nav = document.createElement("header");
    nav.className = "nav";
    nav.innerHTML = `
      <button class="icon-btn menu-btn" aria-label="เมนู" id="menuBtn">☰</button>
      <a class="brand" href="${homeHref}">
        <span class="logo">${CLAUDE_MARK}</span>
        <span>Anthropic Academy <small>คอร์สเรียน Claude (ภาษาไทย)</small></span>
      </a>
      <div class="spacer"></div>
      ${page === "hub" ? `
      <label class="nav-search">
        <span>🔎</span>
        <input id="hubSearch" type="search" placeholder="ค้นหาคอร์ส..." autocomplete="off">
        <kbd>/</kbd>
      </label>` : `
      <a class="icon-btn" href="${homeHref}" title="หน้ารวมคอร์ส" aria-label="หน้าหลัก">🏠</a>`}
      <button class="icon-btn" id="themeBtn" aria-label="สลับธีม"><span data-theme-icon>🌙</span></button>
    `;
    document.body.prepend(nav);
    document.getElementById("themeBtn").addEventListener("click", () => {
      applyTheme(document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark");
    });
  }

  /* ---------- reading progress bar ---------- */
  function buildReadBar() {
    const b = document.createElement("div");
    b.id = "read-progress";
    document.body.prepend(b);
    const update = () => {
      const h = document.documentElement;
      const sc = h.scrollTop || document.body.scrollTop;
      const max = h.scrollHeight - h.clientHeight;
      b.style.width = (max > 0 ? (sc / max) * 100 : 0) + "%";
    };
    window.addEventListener("scroll", update, { passive: true });
    update();
  }

  /* ---------- sidebar (course pages) ---------- */
  function buildSidebar(currentSlug) {
    const prog = getProgress();
    const aside = document.createElement("aside");
    aside.className = "sidebar";
    aside.id = "sidebar";
    let html = `<a class="side-home" href="${homeHref}">← หน้ารวมคอร์สทั้งหมด</a>`;
    Object.keys(CATS).forEach((catKey) => {
      const cat = CATS[catKey];
      const list = byCat(catKey);
      if (!list.length) return;
      html += `<div class="side-group"><div class="side-group-title"><span>${cat.ico}</span> ${cat.title}</div>`;
      list.forEach((c) => {
        const active = c.slug === currentSlug ? "active" : "";
        const done = prog.has(c.slug) ? "done" : "";
        html += `<a class="side-link ${active} ${done}" href="${courseHref(c.slug)}">
          <span class="num">${c.num}</span>
          <span>${c.title}</span>
          <span class="check">✓</span>
        </a>`;
      });
      html += `</div>`;
    });
    aside.innerHTML = html;
    return aside;
  }

  /* ---------- TOC from headings ---------- */
  function buildTOC(article) {
    const heads = article.querySelectorAll("h2, h3");
    if (heads.length < 2) return null;
    const toc = document.createElement("nav");
    toc.className = "toc";
    let html = `<div class="toc-title">ในหน้านี้</div>`;
    heads.forEach((h, i) => {
      if (!h.id) h.id = "sec-" + i;
      const lvl = h.tagName === "H3" ? "lvl-3" : "";
      const txt = h.dataset.toc || h.textContent.replace(/^[^\wก-๙]+/, "").trim();
      html += `<a href="#${h.id}" class="${lvl}" data-target="${h.id}">${txt}</a>`;
    });
    toc.innerHTML = html;
    // scrollspy
    const links = () => toc.querySelectorAll("a");
    const spy = () => {
      let cur = heads[0];
      heads.forEach((h) => { if (h.getBoundingClientRect().top < 140) cur = h; });
      links().forEach((a) => a.classList.toggle("active", a.dataset.target === cur.id));
    };
    window.addEventListener("scroll", spy, { passive: true });
    setTimeout(spy, 50);
    return toc;
  }

  /* ---------- prev / next ---------- */
  function buildCourseNav(idx) {
    const prev = COURSES[idx - 1], next = COURSES[idx + 1];
    const nav = document.createElement("nav");
    nav.className = "course-nav";
    nav.innerHTML = `
      ${prev ? `<a class="prev" href="${courseHref(prev.slug)}"><small>← ก่อนหน้า</small><div class="t">${prev.title}</div></a>` : `<span></span>`}
      ${next ? `<a class="next" href="${courseHref(next.slug)}"><small>ถัดไป →</small><div class="t">${next.title}</div></a>` : `<span></span>`}
    `;
    return nav;
  }

  /* ---------- complete bar ---------- */
  function buildCompleteBar(slug) {
    const prog = getProgress();
    const bar = document.createElement("div");
    bar.className = "complete-bar";
    const done = prog.has(slug);
    bar.innerHTML = `
      <div><strong style="font-size:1.05rem">เรียนจบบทนี้แล้ว?</strong>
        <div style="color:var(--fg-muted);font-size:.9rem">ทำเครื่องหมายเพื่อบันทึกความคืบหน้า (เก็บไว้ในเบราว์เซอร์)</div></div>
      <button class="btn ${done ? "done-state" : "btn-primary"}" id="markBtn">
        ${done ? "✓ เรียนจบแล้ว" : "ทำเครื่องหมายว่าเรียนจบ"}
      </button>`;
    bar.querySelector("#markBtn").addEventListener("click", function () {
      const p = getProgress();
      if (p.has(slug)) { p.delete(slug); this.className = "btn btn-primary"; this.textContent = "ทำเครื่องหมายว่าเรียนจบ"; }
      else { p.add(slug); this.className = "btn done-state"; this.textContent = "✓ เรียนจบแล้ว"; }
      saveProgress(p);
      document.querySelectorAll(`.side-link[href$="${slug}.html"]`).forEach((el) => el.classList.toggle("done", p.has(slug)));
    });
    return bar;
  }

  /* ---------- copy buttons on <pre> ---------- */
  function addCopyButtons() {
    document.querySelectorAll("pre").forEach((pre) => {
      const btn = document.createElement("button");
      btn.className = "copy-btn"; btn.textContent = "คัดลอก";
      btn.addEventListener("click", () => {
        navigator.clipboard.writeText(pre.querySelector("code")?.innerText || pre.innerText);
        btn.textContent = "คัดลอกแล้ว ✓";
        setTimeout(() => (btn.textContent = "คัดลอก"), 1500);
      });
      pre.appendChild(btn);
    });
  }

  /* ---------- YouTube facade (click-to-play, works offline/file://) ---------- */
  function initVideos() {
    document.querySelectorAll(".yt-facade").forEach((el) => {
      const id = el.dataset.yt;
      if (!id) return;
      const title = el.dataset.title || "วิดีโอ YouTube";
      const watch = `https://www.youtube.com/watch?v=${id}`;
      el.style.backgroundImage = `url(https://i.ytimg.com/vi/${id}/hqdefault.jpg)`;
      el.setAttribute("role", "button");
      el.setAttribute("aria-label", "เล่นวิดีโอ: " + title);
      el.innerHTML =
        `<span class="yt-play" aria-hidden="true">▶</span>` +
        `<a class="yt-ext" href="${watch}" target="_blank" rel="noopener" title="เปิดบน YouTube">YouTube ↗</a>`;
      // YouTube embeds are blocked over file:// (Error 153). Inline only works on http(s);
      // otherwise open the watch page in a new tab so the video always plays.
      const canEmbed = location.protocol === "http:" || location.protocol === "https:";
      const play = () => {
        if (!canEmbed) { window.open(watch, "_blank", "noopener"); return; }
        el.innerHTML =
          `<iframe src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0" title="${title}" ` +
          `allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" ` +
          `referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`;
      };
      if (!canEmbed) el.classList.add("yt-ext-mode");
      el.addEventListener("click", (e) => {
        if (e.target.closest(".yt-ext")) return; // let the external link work
        play();
      });
    });
  }

  /* ---------- keep sidebar scroll stable across page navigations ---------- */
  const SB_SCROLL_KEY = "aa_sb_scroll";
  function initSidebarScroll(sidebar) {
    if (!sidebar) return;
    const centerActive = () => {
      const act = sidebar.querySelector(".side-link.active");
      if (act) sidebar.scrollTop = Math.max(0, act.offsetTop - sidebar.clientHeight / 2);
    };
    try {
      const saved = sessionStorage.getItem(SB_SCROLL_KEY);
      if (saved !== null) {
        sidebar.scrollTop = parseInt(saved, 10) || 0;
        // if the active item isn't visible at the restored position, center it
        const act = sidebar.querySelector(".side-link.active");
        if (act) {
          const top = act.offsetTop, bot = top + act.offsetHeight;
          if (top < sidebar.scrollTop || bot > sidebar.scrollTop + sidebar.clientHeight) centerActive();
        }
      } else centerActive();
    } catch (e) { centerActive(); }
    // remember position right before navigating away (so the menu doesn't jump to top)
    sidebar.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        try { sessionStorage.setItem(SB_SCROLL_KEY, String(sidebar.scrollTop)); } catch (e) {}
      })
    );
  }

  /* ---------- image lightbox (click figure to enlarge) ---------- */
  function initLightbox() {
    const imgs = document.querySelectorAll(".fig img");
    if (!imgs.length) return;
    const ov = document.createElement("div");
    ov.className = "lightbox";
    ov.innerHTML = `<button class="lb-close" aria-label="ปิด">✕</button><img alt=""><div class="lb-cap"></div>`;
    document.body.appendChild(ov);
    const big = ov.querySelector("img");
    const cap = ov.querySelector(".lb-cap");
    const close = () => ov.classList.remove("show");
    ov.addEventListener("click", (e) => { if (e.target === big) return; close(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
    imgs.forEach((im) => {
      // add a hover hint inside the figure
      const fig = im.closest(".fig");
      if (fig && !fig.querySelector(".zoom-hint")) {
        const h = document.createElement("span");
        h.className = "zoom-hint"; h.textContent = "🔍 คลิกเพื่อขยาย";
        fig.appendChild(h);
      }
      im.addEventListener("click", () => {
        big.src = im.src;
        const fc = im.closest(".fig")?.querySelector("figcaption");
        cap.textContent = fc ? fc.textContent : "";
        ov.classList.add("show");
      });
    });
  }

  /* ---------- reveal on scroll ---------- */
  function initReveal() {
    const els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) { els.forEach((e) => e.classList.add("in")); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    els.forEach((e) => io.observe(e));
  }

  /* ---------- mobile sidebar ---------- */
  function initMobile() {
    const menuBtn = document.getElementById("menuBtn");
    if (!menuBtn) return;
    const sb = document.getElementById("sidebar");
    const bd = document.createElement("div"); bd.className = "backdrop"; document.body.appendChild(bd);
    const close = () => { sb?.classList.remove("open"); bd.classList.remove("show"); };
    menuBtn.addEventListener("click", () => { sb?.classList.toggle("open"); bd.classList.toggle("show"); });
    bd.addEventListener("click", close);
    sb?.querySelectorAll("a").forEach((a) => a.addEventListener("click", close));
  }

  /* ============================================================
     COURSE PAGE assembly
     ============================================================ */
  function initCoursePage() {
    const slug = document.body.dataset.course;
    const idx = findCourse(slug);
    const article = document.getElementById("article");

    const layout = document.createElement("div");
    layout.className = "layout";
    const main = document.createElement("main");
    main.className = "main";
    const wrap = document.createElement("div");
    wrap.className = "content-wrap";

    const sidebar = buildSidebar(slug);
    const toc = buildTOC(article);

    // breadcrumb + complete bar + course nav appended into article
    if (idx >= 0) {
      article.appendChild(buildCompleteBar(slug));
      article.appendChild(buildCourseNav(idx));
    }

    wrap.appendChild(article);
    if (toc) wrap.appendChild(toc);
    main.appendChild(wrap);
    layout.appendChild(sidebar);
    layout.appendChild(main);
    document.body.appendChild(layout);

    addCopyButtons();
    initVideos();
    initLightbox();
    initMobile();
    initSidebarScroll(sidebar);
    initReveal();
  }

  /* ============================================================
     HUB PAGE assembly
     ============================================================ */
  function initHubPage() {
    const prog = getProgress();
    // progress ring
    const ringHolder = document.getElementById("hubProgress");
    if (ringHolder) {
      const pct = Math.round((prog.size / COURSES.length) * 100);
      ringHolder.innerHTML = `
        <div class="bar-wrap">
          <div class="ring-wrap"><div class="ring" style="--p:${pct}"></div><span class="ring-num">${pct}%</span></div>
          <div>
            <strong>ความคืบหน้าของคุณ</strong>
            <div style="color:var(--fg-muted);font-size:.9rem">เรียนจบแล้ว ${prog.size} จาก ${COURSES.length} คอร์ส — เก็บความคืบหน้าไว้ในเบราว์เซอร์นี้</div>
          </div>
        </div>`;
    }

    // catalog
    const root = document.getElementById("catalog");
    if (root) {
      let html = `
      <div class="filter-bar" id="filterBar">
        <button class="chip active" data-filter="all">ทั้งหมด</button>
        ${Object.keys(CATS).map((k) => `<button class="chip" data-filter="${k}">${CATS[k].ico} ${CATS[k].title}</button>`).join("")}
      </div>
      <div class="no-results" id="noResults">ไม่พบคอร์สที่ตรงกับคำค้นหา 🔍</div>`;
      Object.keys(CATS).forEach((catKey) => {
        const cat = CATS[catKey];
        const list = byCat(catKey);
        if (!list.length) return;
        html += `
        <section class="cat-section reveal" data-cat="${catKey}">
          <div class="cat-head">
            <div class="cat-ico" style="background:${cat.color}22;color:${cat.color}">${cat.ico}</div>
            <div><h2>${cat.title}</h2><p>${cat.desc}</p></div>
          </div>
          <div class="course-grid">
            ${list.map((c) => courseCard(c, prog.has(c.slug), cat.color)).join("")}
          </div>
        </section>`;
      });
      root.innerHTML = html;
    }

    initFilters();
    initSearch();
    initReveal();
  }

  function courseCard(c, done, color) {
    return `
    <a class="course-card ${done ? "done" : ""}" href="${courseHref(c.slug)}"
       data-title="${c.title.toLowerCase()}" data-desc="${c.desc.toLowerCase()}" data-cat="${c.cat}"
       style="--ccolor:${color}">
      <div class="done-badge">✓</div>
      <div class="cc-top">
        <div class="cc-ico" style="background:${color}1f">${c.ico}</div>
        <span class="level">${c.level}</span>
      </div>
      <h3>${c.title}</h3>
      <p class="cc-desc">${c.desc}</p>
      <div class="cc-foot">
        <span>⏱️ ${c.time}</span>
        <span class="go">เริ่มเรียน <span>→</span></span>
      </div>
    </a>`;
  }

  function initFilters() {
    const bar = document.getElementById("filterBar");
    if (!bar) return;
    bar.addEventListener("click", (e) => {
      const chip = e.target.closest(".chip");
      if (!chip) return;
      bar.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      const f = chip.dataset.filter;
      document.querySelectorAll(".cat-section").forEach((s) => {
        s.style.display = f === "all" || s.dataset.cat === f ? "" : "none";
      });
      const si = document.getElementById("hubSearch"); if (si) si.value = "";
      document.querySelectorAll(".course-card").forEach((c) => (c.hidden = false));
      document.getElementById("noResults").style.display = "none";
    });
  }

  function initSearch() {
    const input = document.getElementById("hubSearch");
    if (!input) return;
    document.addEventListener("keydown", (e) => {
      if (e.key === "/" && document.activeElement !== input) { e.preventDefault(); input.focus(); }
    });
    input.addEventListener("input", () => {
      const q = input.value.trim().toLowerCase();
      let visible = 0;
      document.querySelectorAll(".course-card").forEach((c) => {
        const hit = !q || c.dataset.title.includes(q) || c.dataset.desc.includes(q);
        c.hidden = !hit; if (hit) visible++;
      });
      document.querySelectorAll(".cat-section").forEach((s) => {
        const any = [...s.querySelectorAll(".course-card")].some((c) => !c.hidden);
        s.style.display = any ? "" : "none";
      });
      if (q) document.querySelectorAll(".chip").forEach((c, i) => c.classList.toggle("active", i === 0));
      document.getElementById("noResults").style.display = visible === 0 ? "block" : "none";
    });
  }

  /* ---------- boot ---------- */
  const reveal = () => document.body && document.body.classList.add("cc-ready");
  initTheme();
  document.addEventListener("DOMContentLoaded", () => {
    try {
      buildReadBar();
      buildNav();
      if (page === "hub") initHubPage();
      else initCoursePage();
    } finally {
      reveal(); // show the fully-assembled page in one paint (no flicker)
    }
  });
  // failsafes: never leave the page hidden even if something throws
  window.addEventListener("load", reveal);
  setTimeout(reveal, 2000);
})();
