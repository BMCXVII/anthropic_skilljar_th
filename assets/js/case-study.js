/* ============================================================
   Case Study engine — interactive agent-team simulation
   Reads window.CASE_STUDY = {
     accent, deliverableLabel,
     agents: [{id,name,role,avatar,color}],
     script: [{from, to?, phase, text, deliverable?, kind?}]
       from: agent id | "system" | "tool"
   }
   Mounts into #cs-mount
   ============================================================ */
(function () {
  function init() {
    const CS = window.CASE_STUDY;
    const mount = document.getElementById("cs-mount");
    if (!CS || !mount) return;

    const agents = CS.agents || [];
    const script = CS.script || [];
    const byId = (id) => agents.find((a) => a.id === id);
    const accent = CS.accent || "#2f9e8f";
    const delivLabel = CS.deliverableLabel || "ส่งมอบแล้ว";

    let idx = 0;          // messages shown
    let playing = false;
    let timer = null;
    let deliverables = 0;

    mount.innerHTML = `
      <div class="cs-app" style="--csc:${accent}">
        <div class="cs-dashboard" id="csDash"></div>
        <div class="cs-controls">
          <button class="btn btn-primary" id="csPlay">▶ เริ่มจำลอง</button>
          <button class="btn btn-ghost" id="csStep">ก้าวต่อไป ⏭</button>
          <button class="btn btn-ghost" id="csReset">↺ เริ่มใหม่</button>
          <span class="cs-step-label" id="csStepLabel"></span>
        </div>
        <div class="cs-stage">
          <div class="cs-agents" id="csAgents"></div>
          <div class="cs-feed" id="csFeed"></div>
        </div>
      </div>`;

    const feed = mount.querySelector("#csFeed");
    const agentsEl = mount.querySelector("#csAgents");
    const dash = mount.querySelector("#csDash");

    // roster
    agentsEl.innerHTML = agents.map((a) => `
      <div class="cs-agent" data-id="${a.id}" style="--agc:${a.color || accent}">
        <div class="cs-ava">${a.avatar}</div>
        <div class="cs-who"><div class="cs-name">${a.name}</div><div class="cs-role">${a.role}</div></div>
        <span class="cs-dot"></span>
      </div>`).join("");

    function setActive(id) {
      agentsEl.querySelectorAll(".cs-agent").forEach((el) =>
        el.classList.toggle("active", el.dataset.id === id));
    }

    function curPhase() {
      let p = "เริ่มต้น";
      for (let i = 0; i < idx; i++) if (script[i].phase) p = script[i].phase;
      return p;
    }

    function renderDash() {
      const last = script[idx - 1];
      const activeName = last && byId(last.from) ? byId(last.from).name : "—";
      const pct = Math.round((idx / script.length) * 100);
      dash.innerHTML = `
        <div class="cs-stat" style="--csc:${accent}">
          <div class="cs-stat-label">เฟสปัจจุบัน</div>
          <div class="cs-stat-val" style="font-size:1.05rem;line-height:1.3;margin-top:8px">${curPhase()}</div>
        </div>
        <div class="cs-stat" style="--csc:#5b7a8c">
          <div class="cs-stat-label">Agent ที่ทำงาน</div>
          <div class="cs-stat-val" style="font-size:1.05rem;line-height:1.3;margin-top:8px">${activeName}</div>
        </div>
        <div class="cs-stat" style="--csc:#c08a2e">
          <div class="cs-stat-label">${delivLabel}</div>
          <div class="cs-stat-val">${deliverables}</div>
        </div>
        <div class="cs-stat" style="--csc:var(--green)">
          <div class="cs-stat-label">ความคืบหน้า</div>
          <div class="cs-stat-val">${pct}%</div>
          <div class="cs-progress-track"><div class="cs-progress-fill" style="width:${pct}%"></div></div>
        </div>`;
    }

    function bubble(step) {
      const a = byId(step.from);
      const kind = step.kind || (step.from === "system" ? "system" : step.from === "tool" ? "tool" : "");
      const name = kind === "system" ? "" : kind === "tool" ? (step.name || "tool result") : (a ? a.name : step.from);
      const color = a ? (a.color || accent) : accent;
      const ava = kind === "system" ? "•" : kind === "tool" ? "⚙️" : (a ? a.avatar : "🤖");
      const wrap = document.createElement("div");
      wrap.className = "cs-msg " + kind;
      wrap.style.setProperty("--agc", color);
      wrap.innerHTML = `
        ${kind === "system" ? "" : `<div class="cs-ava">${ava}</div>`}
        <div class="cs-bubble">
          ${name ? `<div class="cs-b-name">${name}</div>` : ""}
          <div class="cs-b-text">${step.text}</div>
        </div>`;
      return wrap;
    }

    function showTyping(step) {
      const a = byId(step.from);
      if (!a) return null;
      const el = document.createElement("div");
      el.className = "cs-msg";
      el.style.setProperty("--agc", a.color || accent);
      el.innerHTML = `<div class="cs-ava">${a.avatar}</div>
        <div class="cs-bubble"><div class="cs-typing"><span></span><span></span><span></span></div></div>`;
      feed.appendChild(el);
      feed.scrollTop = feed.scrollHeight;
      return el;
    }

    function commit(step) {
      if (step.deliverable) deliverables++;
      setActive(step.from && step.from !== "system" && step.from !== "tool" ? step.from : null);
      feed.appendChild(bubble(step));
      feed.scrollTop = feed.scrollHeight;
      idx++;
      renderDash();
      stepLabel();
    }

    function stepLabel() {
      mount.querySelector("#csStepLabel").textContent = `ขั้นที่ ${idx} / ${script.length}`;
      if (idx >= script.length) { stop(); mount.querySelector("#csPlay").textContent = "✓ จบการจำลอง"; }
    }

    function advance(auto) {
      if (idx >= script.length) return;
      const step = script[idx];
      if (auto && step.from && step.from !== "system" && step.from !== "tool") {
        setActive(step.from);
        const t = showTyping(step);
        const delay = Math.min(1400, 500 + step.text.replace(/<[^>]+>/g, "").length * 9);
        timer = setTimeout(() => { if (t) t.remove(); commit(step); if (playing) timer = setTimeout(() => advance(true), 550); }, delay);
      } else {
        commit(step);
        if (auto && playing) timer = setTimeout(() => advance(true), 650);
      }
    }

    function play() { if (idx >= script.length) reset(); playing = true; mount.querySelector("#csPlay").textContent = "⏸ หยุดชั่วคราว"; advance(true); }
    function stop() { playing = false; clearTimeout(timer); const b = mount.querySelector("#csPlay"); if (idx < script.length) b.textContent = "▶ เล่นต่อ"; }
    function reset() { stop(); idx = 0; deliverables = 0; feed.innerHTML = ""; setActive(null); renderDash(); stepLabel(); mount.querySelector("#csPlay").textContent = "▶ เริ่มจำลอง"; }

    mount.querySelector("#csPlay").addEventListener("click", () => playing ? stop() : play());
    mount.querySelector("#csStep").addEventListener("click", () => { stop(); advance(false); });
    mount.querySelector("#csReset").addEventListener("click", reset);

    renderDash(); stepLabel();
  }
  document.addEventListener("DOMContentLoaded", init);
})();
