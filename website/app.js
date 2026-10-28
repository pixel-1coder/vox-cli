/* VOX CLI — landing page interactions */

const termBody = document.getElementById("termBody");

const SCRIPT = [
  { cls: "term-out", text: "hey — make me a cli that auto-selects a model" },
  { cls: "term-think", text: "◆ thinking…" },
  { cls: "term-ok", text: "✓ auto-select ready — best fit chosen" },
  { cls: "term-ok", text: "✓ wired to /models auto" },
  { cls: "term-in", text: "ship it" },
];

let lineIdx = 0;
let charIdx = 0;
let deleting = false;
let timer = null;

function render() {
  termBody.innerHTML = "";
  for (let i = 0; i <= lineIdx; i++) {
    const line = SCRIPT[i];
    const isCurrent = i === lineIdx;
    const text = isCurrent ? line.text.slice(0, charIdx) : line.text;
    const el = document.createElement("div");
    el.className = "term-line " + line.cls;
    el.textContent = text;
    termBody.appendChild(el);
  }
  const input = document.createElement("div");
  input.className = "term-line term-input";
  input.innerHTML = '<span class="prompt">vox&gt;</span><span id="termCursor">▌</span>';
  termBody.appendChild(input);
}

function tick() {
  if (lineIdx >= SCRIPT.length) {
    timer = setTimeout(() => {
      termBody.innerHTML = "";
      lineIdx = 0;
      charIdx = 0;
      deleting = false;
      typeNext();
    }, 5200);
    return;
  }
  const line = SCRIPT[lineIdx];
  if (!deleting) {
    if (charIdx < line.text.length) {
      charIdx++;
      render();
      timer = setTimeout(tick, 22);
    } else {
      timer = setTimeout(() => { deleting = true; charIdx = line.text.length; render(); }, 300);
    }
  } else {
    if (charIdx > 0) {
      charIdx--;
      render();
      timer = setTimeout(tick, 10);
    } else {
      deleting = false;
      lineIdx++;
      charIdx = 0;
      render();
      timer = setTimeout(tick, 320);
    }
  }
}

function typeNext() {
  if (lineIdx >= SCRIPT.length) return;
  render();
  timer = setTimeout(tick, 250);
}

let started = false;
const start = () => {
  if (started) return;
  started = true;
  clearTimeout(timer);
  render();
  timer = setTimeout(tick, 250);
};
const termEl = document.getElementById("terminal");
const termObserver = new IntersectionObserver((entries) => {
  entries.forEach((e) => { if (e.isIntersecting) start(); });
}, { threshold: 0.15 });
termObserver.observe(termEl);
setTimeout(start, 1200);

/* reveal on scroll */
const revealEls = document.querySelectorAll(".reveal, .hero, .section-head, .cmd-card, .feature-card, .code-card, .install-grid");
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("visible"); revealObserver.unobserve(e.target); }
    });
  },
  { threshold: 0.1 }
);
revealEls.forEach((el) => revealObserver.observe(el));

/* copy buttons */
document.querySelectorAll(".copy-btn").forEach((btn) => {
  btn.addEventListener("click", async () => {
    const text = btn.getAttribute("data-copy") || "";
    try {
      await navigator.clipboard.writeText(text);
      const orig = btn.textContent;
      btn.textContent = "copied";
      setTimeout(() => (btn.textContent = orig), 1600);
    } catch (e) {
      btn.textContent = "copy failed";
      setTimeout(() => (btn.textContent = "Copy"), 1600);
    }
  });
});
