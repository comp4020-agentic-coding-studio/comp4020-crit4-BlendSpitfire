// Local-only tool: drag/resize the drum kit pieces in a browser, autosaves
// every change to layout.json so Claude can read the result straight off
// disk — nothing to copy-paste. Not part of the built site.
import { createServer } from "node:http";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const LAYOUT_PATH = join(__dirname, "layout.json");
const PORT = 4700;

const PIECES = [
  { name: "crash", label: "Crash", key: "Q", shape: "ring" },
  { name: "hi-tom", label: "Hi tom", key: "W", shape: "petal petal-left" },
  { name: "mid-tom", label: "Mid tom", key: "E", shape: "petal petal-right" },
  { name: "ride", label: "Ride", key: "R", shape: "ring" },
  { name: "open-hihat", label: "Open hi-hat", key: "A", shape: "disc-cymbal" },
  { name: "closed-hihat", label: "Closed hi-hat", key: "S", shape: "notch" },
  { name: "low-tom", label: "Low tom", key: "D", shape: "disc-drum" },
  { name: "snare", label: "Snare", key: "Z", shape: "disc-drum disc-drum-large" },
  { name: "kick", label: "Kick", key: "X", shape: "bar" },
];

// Current values from src/styles/global.css, used as the starting point.
const DEFAULTS = {
  desktop: {
    crash: { left: 14, top: 20, width: 6.6, height: 6.6 },
    "hi-tom": { left: 37, top: 32, width: 4.6, height: 4.6 },
    "mid-tom": { left: 63, top: 32, width: 4.6, height: 4.6 },
    ride: { left: 86, top: 20, width: 6.6, height: 6.6 },
    "open-hihat": { left: 10, top: 46, width: 3.6, height: 3.6 },
    "closed-hihat": { left: 10, top: 66, width: 4.4, height: 4.4 },
    "low-tom": { left: 90, top: 58, width: 6, height: 6 },
    snare: { left: 32, top: 82, width: 5.6, height: 5.6 },
    kick: { left: 68, top: 82, width: 1.6, height: 3.4 },
  },
  mobile: {
    crash: { left: 14, top: 12, width: 4.2, height: 4.2 },
    "hi-tom": { left: 36, top: 33, width: 3.2, height: 3.2 },
    "mid-tom": { left: 64, top: 33, width: 3.2, height: 3.2 },
    ride: { left: 86, top: 12, width: 4.2, height: 4.2 },
    "open-hihat": { left: 16, top: 46, width: 3, height: 3 },
    "closed-hihat": { left: 16, top: 66, width: 3.6, height: 3.6 },
    "low-tom": { left: 86, top: 58, width: 4.2, height: 4.2 },
    snare: { left: 32, top: 84, width: 4, height: 4 },
    kick: { left: 68, top: 84, width: 1.3, height: 2.8 },
  },
};

const initial = existsSync(LAYOUT_PATH)
  ? JSON.parse(readFileSync(LAYOUT_PATH, "utf8"))
  : DEFAULTS;

function page() {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Kit layout editor</title>
<style>
  :root { --kit-bg: #101014; --kit-cymbal: #f4b400; --kit-drum: #3ea6ff; }
  body { margin: 0; font-family: system-ui, sans-serif; background: #12131a; color: #eef0f6; display: flex; height: 100vh; }
  .side { width: 20rem; flex: none; padding: 1rem; overflow-y: auto; box-sizing: border-box; background: #1a1c26; }
  .stage-wrap { flex: 1; display: flex; align-items: center; justify-content: center; overflow: auto; }
  h1 { font-size: 1.1rem; margin: 0 0 0.75rem; }
  .tabs { display: flex; gap: 0.5rem; margin-bottom: 1rem; }
  .tabs button { flex: 1; padding: 0.5rem; border: 1px solid #3a3d4d; background: #23253099; color: #eef0f6; border-radius: 0.4rem; cursor: pointer; }
  .tabs button.active { background: #3ea6ff33; border-color: #3ea6ff; }
  .status { font-size: 0.8rem; color: #9fa2ba; margin-bottom: 1rem; min-height: 1.2em; }
  .row { border: 1px solid #2a2c38; border-radius: 0.5rem; padding: 0.5rem; margin-bottom: 0.5rem; }
  .row.selected { border-color: #3ea6ff; }
  .row-title { font-size: 0.85rem; margin-bottom: 0.4rem; display: flex; justify-content: space-between; }
  .row-title kbd { font-size: 0.7rem; padding: 0 0.3em; border: 1px solid #4a4c5c; border-radius: 0.3em; }
  .fields { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.3rem; }
  .fields label { font-size: 0.65rem; color: #9fa2ba; display: block; }
  .fields input { width: 100%; box-sizing: border-box; background: #101014; border: 1px solid #3a3d4d; color: #eef0f6; border-radius: 0.3rem; padding: 0.2rem; font-size: 0.8rem; }
  #stage { position: relative; background: #0a0a0d; outline: 1px dashed #3a3d4d; }
  .piece { position: absolute; transform: translate(-50%, -50%); display: flex; flex-direction: column; align-items: center; gap: 0.3rem; cursor: grab; touch-action: none; }
  .piece.dragging { cursor: grabbing; z-index: 10; }
  .piece.selected .icon { outline: 2px solid #fff; outline-offset: 3px; }
  .label { font-size: 0.6rem; color: #9fa2ba; white-space: nowrap; pointer-events: none; }
  .icon { transition: none; }
  .ring { border-radius: 50%; background: var(--kit-cymbal); position: relative; }
  .ring::after { content: ""; position: absolute; inset: 32%; border-radius: 50%; background: var(--kit-bg); }
  .petal { background: var(--kit-drum); border-radius: 0% 55% 55% 55%; }
  .petal-left { transform: rotate(20deg); }
  .petal-right { transform: rotate(-110deg); }
  .disc-drum { border-radius: 50%; background: var(--kit-drum); }
  .disc-cymbal { border-radius: 50%; background: var(--kit-cymbal); }
  .notch { border-radius: 50%; background: conic-gradient(transparent 0deg 42deg, var(--kit-cymbal) 42deg 360deg); }
  .bar { border-radius: 0.5rem; background: var(--kit-drum); }
</style>
</head>
<body>
  <div class="side">
    <h1>Kit layout editor</h1>
    <div class="tabs">
      <button id="tab-desktop" class="active">Desktop</button>
      <button id="tab-mobile">Mobile</button>
    </div>
    <div class="status" id="status">Drag a piece, or type numbers. Saves automatically.</div>
    <div id="rows"></div>
  </div>
  <div class="stage-wrap">
    <div id="stage"></div>
  </div>
<script>
const PIECES = ${JSON.stringify(PIECES)};
let state = ${JSON.stringify(initial)};
let mode = "desktop";
let selected = null;

const STAGE_SIZE = { desktop: { w: 672, ar: 16 / 11 }, mobile: { w: 390, ar: 1 / 1.3 } };

const stage = document.getElementById("stage");
const rows = document.getElementById("rows");
const statusEl = document.getElementById("status");
const tabDesktop = document.getElementById("tab-desktop");
const tabMobile = document.getElementById("tab-mobile");

function remToPx(rem) { return rem * 16; }

function layoutStage() {
  const { w, ar } = STAGE_SIZE[mode];
  stage.style.width = w + "px";
  stage.style.height = Math.round(w / ar) + "px";
}

function render() {
  layoutStage();
  stage.innerHTML = "";
  rows.innerHTML = "";
  for (const piece of PIECES) {
    const v = state[mode][piece.name];
    const el = document.createElement("div");
    el.className = "piece" + (selected === piece.name ? " selected" : "");
    el.style.left = v.left + "%";
    el.style.top = v.top + "%";
    el.dataset.name = piece.name;
    el.innerHTML = \`<span class="icon \${piece.shape}" style="width:\${remToPx(v.width)}px;height:\${remToPx(v.height)}px"></span><span class="label">\${piece.label} \${piece.key}</span>\`;
    el.addEventListener("pointerdown", startDrag);
    el.addEventListener("click", () => { selected = piece.name; render(); });
    stage.appendChild(el);

    const row = document.createElement("div");
    row.className = "row" + (selected === piece.name ? " selected" : "");
    row.innerHTML = \`
      <div class="row-title"><span>\${piece.label}</span><kbd>\${piece.key}</kbd></div>
      <div class="fields">
        <div><label>left %</label><input type="number" step="0.5" data-field="left" value="\${v.left}"></div>
        <div><label>top %</label><input type="number" step="0.5" data-field="top" value="\${v.top}"></div>
        <div><label>width rem</label><input type="number" step="0.1" data-field="width" value="\${v.width}"></div>
        <div><label>height rem</label><input type="number" step="0.1" data-field="height" value="\${v.height}"></div>
      </div>\`;
    for (const input of row.querySelectorAll("input")) {
      input.addEventListener("input", () => {
        v[input.dataset.field] = parseFloat(input.value) || 0;
        selected = piece.name;
        save();
        render();
      });
    }
    row.addEventListener("click", (e) => {
      if (e.target.tagName === "INPUT") return;
      selected = piece.name;
      render();
    });
    rows.appendChild(row);
  }
}

let dragging = null;
function startDrag(e) {
  const name = e.currentTarget.dataset.name;
  selected = name;
  dragging = name;
  e.currentTarget.classList.add("dragging");
  e.currentTarget.setPointerCapture(e.pointerId);
}
stage.addEventListener("pointermove", (e) => {
  if (!dragging) return;
  const rect = stage.getBoundingClientRect();
  const left = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
  const top = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
  state[mode][dragging].left = Math.round(left * 10) / 10;
  state[mode][dragging].top = Math.round(top * 10) / 10;
  render();
});
window.addEventListener("pointerup", () => {
  if (dragging) { dragging = null; save(); }
});

let saveTimer;
function save() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    fetch("/save", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(state) })
      .then(() => { statusEl.textContent = "Saved " + new Date().toLocaleTimeString(); })
      .catch(() => { statusEl.textContent = "Save failed — is the server still running?"; });
  }, 150);
}

tabDesktop.addEventListener("click", () => { mode = "desktop"; tabDesktop.classList.add("active"); tabMobile.classList.remove("active"); render(); });
tabMobile.addEventListener("click", () => { mode = "mobile"; tabMobile.classList.add("active"); tabDesktop.classList.remove("active"); render(); });

render();
</script>
</body>
</html>`;
}

createServer((req, res) => {
  if (req.method === "GET" && req.url === "/") {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(page());
    return;
  }
  if (req.method === "POST" && req.url === "/save") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        const data = JSON.parse(body);
        writeFileSync(LAYOUT_PATH, JSON.stringify(data, null, 2));
        res.writeHead(200);
        res.end("ok");
      } catch (err) {
        res.writeHead(400);
        res.end("bad json");
      }
    });
    return;
  }
  res.writeHead(404);
  res.end("not found");
}).listen(PORT, () => {
  console.log(`Kit layout editor: http://localhost:${PORT}`);
});
