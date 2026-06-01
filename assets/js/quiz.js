/* ============================================================
   Quiz engine — reads window.QUIZ, mounts into #quiz-mount
   QUIZ = [{ q, opts:[...], answer: <index>, explain }]
   ============================================================ */
(function () {
  function render() {
    const data = window.QUIZ;
    const mount = document.getElementById("quiz-mount");
    if (!data || !mount) return;

    const state = new Array(data.length).fill(null);

    let html = `
      <div class="quiz">
        <h3><span>📝</span> ทบทวนความเข้าใจ</h3>
        <p class="quiz-sub">ตอบให้ครบทุกข้อแล้วกด “ตรวจคำตอบ” — ใช้ซ้อมก่อนสอบ certificate ของคอร์สนี้</p>
        <form id="quizForm">`;

    data.forEach((item, qi) => {
      html += `<div class="q" data-q="${qi}">
        <div class="q-text"><span class="qn">Q${qi + 1}</span>${item.q}</div>`;
      item.opts.forEach((opt, oi) => {
        html += `<label class="opt" data-q="${qi}" data-o="${oi}">
          <span class="marker">✓</span><span>${opt}</span>
        </label>`;
      });
      html += `<div class="q-explain" data-explain="${qi}"><strong>เฉลย:</strong> ${item.explain}</div></div>`;
    });

    html += `</form>
      <div class="quiz-actions">
        <button class="btn btn-primary" id="quizCheck">ตรวจคำตอบ</button>
        <button class="btn btn-ghost" id="quizReset" style="display:none">ทำใหม่</button>
      </div>
      <div class="quiz-result" id="quizResult">
        <div class="score" id="quizScore"></div>
        <div id="quizMsg" style="color:var(--fg-muted)"></div>
      </div>
    </div>`;

    mount.innerHTML = html;

    const form = mount.querySelector("#quizForm");
    let checked = false;

    form.addEventListener("click", (e) => {
      const opt = e.target.closest(".opt");
      if (!opt || checked) return;
      const qi = +opt.dataset.q;
      form.querySelectorAll(`.opt[data-q="${qi}"]`).forEach((o) => o.classList.remove("selected"));
      opt.classList.add("selected");
      state[qi] = +opt.dataset.o;
    });

    mount.querySelector("#quizCheck").addEventListener("click", () => {
      if (state.includes(null)) {
        const first = state.indexOf(null);
        mount.querySelector(`.q[data-q="${first}"]`).scrollIntoView({ behavior: "smooth", block: "center" });
        flash(mount.querySelector("#quizCheck"), "ยังตอบไม่ครบ");
        return;
      }
      checked = true;
      let score = 0;
      data.forEach((item, qi) => {
        const sel = state[qi];
        if (sel === item.answer) score++;
        form.querySelectorAll(`.opt[data-q="${qi}"]`).forEach((o) => {
          const oi = +o.dataset.o;
          if (oi === item.answer) o.classList.add("correct");
          else if (oi === sel) o.classList.add("wrong");
        });
        mount.querySelector(`[data-explain="${qi}"]`).classList.add("show");
      });
      const pct = Math.round((score / data.length) * 100);
      const res = mount.querySelector("#quizResult");
      res.classList.add("show");
      mount.querySelector("#quizScore").textContent = `${score}/${data.length} (${pct}%)`;
      mount.querySelector("#quizScore").style.color = pct >= 70 ? "var(--green)" : "var(--clay-strong)";
      mount.querySelector("#quizMsg").textContent =
        pct === 100 ? "เยี่ยมมาก! เข้าใจครบทุกข้อ 🎉" :
        pct >= 70 ? "ผ่านเกณฑ์! ทบทวนข้อที่ผิดอีกนิดก็พร้อมสอบ 💪" :
        "ลองทบทวนเนื้อหาด้านบนแล้วทำใหม่อีกครั้งนะ 📖";
      mount.querySelector("#quizCheck").style.display = "none";
      mount.querySelector("#quizReset").style.display = "inline-flex";
      res.scrollIntoView({ behavior: "smooth", block: "center" });
    });

    mount.querySelector("#quizReset").addEventListener("click", () => render());

    function flash(btn, txt) {
      const old = btn.textContent; btn.textContent = txt;
      setTimeout(() => (btn.textContent = old), 1400);
    }
  }

  document.addEventListener("DOMContentLoaded", render);
})();
