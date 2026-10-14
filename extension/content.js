// Ambient Toolbar for YouTube — content script
const ROWS = 4;
const INTERVAL = 50;     // ms between samples (~20 fps)

let cfg = { ...AT_DEFAULTS };
browser.storage.local.get(AT_DEFAULTS).then(c => { cfg = c; refresh(); });
browser.storage.onChanged.addListener(ch => {
  for (const k in ch) cfg[k] = ch[k].newValue;
  refresh();
  if (cfg.enabled) sample(true); // show setting changes immediately, even when paused
});

const canvas = document.createElement("canvas");
canvas.height = ROWS;
const ctx = canvas.getContext("2d", { willReadFrequently: true });

let cur = null, lastT = 0, last = 0, active = false, painted = false;

// Letterbox detection: average each row of the frame into a 1x48 column and find where the picture starts.
const barCanvas = document.createElement("canvas");
barCanvas.width = 1; barCanvas.height = 48;
const barCtx = barCanvas.getContext("2d", { willReadFrequently: true });
let barTop = 0, barCheckedAt = 0;
function detectBars(v) {
  const now = performance.now();
  if (now - barCheckedAt < 1000) return barTop;
  barCheckedAt = now;
  barCtx.drawImage(v, 0, 0, 1, 48);
  const d = barCtx.getImageData(0, 0, 1, 48).data;
  let row = 0;
  while (row < 20 && (d[row * 4] + d[row * 4 + 1] + d[row * 4 + 2]) / 3 < 14) row++;
  barTop = row >= 20 ? 0 : row / 48; // all dark = dark scene, not bars
  return barTop;
}
const send = msg => browser.runtime.sendMessage(msg).catch(() => {});

const onVideoPage = () => location.pathname === "/watch" || location.pathname.startsWith("/shorts/");

// The biggest visible video on the page is the one being watched (skips previews/ads overlays).
function getVideo() {
  if (!onVideoPage()) return null;
  let best = null, area = 0;
  for (const v of document.querySelectorAll("video")) {
    const a = v.clientWidth * v.clientHeight;
    if (a > area && v.readyState >= 2) { best = v; area = a; }
  }
  return best;
}

function sample(jump = false) {
  const v = getVideo();
  if (!v || !v.videoWidth || document.hidden || !cfg.enabled) return;
  try {
    const COLS = Math.max(2, Math.round(cfg.zones));
    if (canvas.width !== COLS) { canvas.width = COLS; cur = null; }
    const top = cfg.skipBars ? Math.round(detectBars(v) * v.videoHeight) : 0;
    const picH = v.videoHeight - 2 * top;
    const sh = Math.max(1, Math.round(picH * cfg.sampleArea));
    ctx.drawImage(v, 0, top, v.videoWidth, sh, 0, 0, COLS, ROWS);
    const d = ctx.getImageData(0, 0, COLS, ROWS).data;
    const target = [];
    for (let x = 0; x < COLS; x++) {
      let r = 0, g = 0, b = 0;
      for (let y = 0; y < ROWS; y++) {
        const i = (y * COLS + x) * 4;
        r += d[i]; g += d[i + 1]; b += d[i + 2];
      }
      target.push([r / ROWS, g / ROWS, b / ROWS]);
    }
    const now = performance.now();
    const t = !cur || jump ? 1 : 1 - Math.exp(-(now - lastT) / cfg.fadeMs);
    lastT = now;
    cur = cur ? cur.map((c, x) => c.map((v0, k) => v0 + (target[x][k] - v0) * t)) : target;
    painted = true;
    send({ type: "colors", cols: cur.map(c => c.map(Math.round)) });
  } catch (e) {
    console.warn("[ambient-toolbar] sampling failed:", e);
  }
}

function tick(now) {
  if (!active) return;
  if (now - last >= INTERVAL) { last = now; sample(); }
  schedule();
}

function schedule() {
  const v = getVideo();
  if (v && v.requestVideoFrameCallback) v.requestVideoFrameCallback(tick);
  else requestAnimationFrame(tick);
}

function start() {
  if (active || !cfg.enabled) return;
  active = true;
  lastT = performance.now();
  schedule();
}

// Pause keeps the current color (like Ambient Light); only leaving the video clears it.
function pauseLoop() { active = false; }

function clear() {
  active = false;
  cur = null;
  if (painted) { painted = false; send({ type: "reset" }); }
}

const wired = new WeakSet();
function attach() {
  for (const v of document.querySelectorAll("video")) {
    if (wired.has(v)) continue;
    wired.add(v);
    v.addEventListener("playing", () => { if (v === getVideo()) start(); });
    v.addEventListener("pause", () => { if (v === getVideo()) pauseLoop(); });
    v.addEventListener("ended", () => { if (v === getVideo()) pauseLoop(); });
    v.addEventListener("seeked", () => { if (v === getVideo() && v.paused) sample(true); });
  }
}

// Re-evaluate everything (page change, tab shown, settings changed).
function refresh() {
  attach();
  if (!cfg.enabled || !onVideoPage()) return clear();
  const v = getVideo();
  if (!v) return;
  if (!v.paused && !v.ended) start();
  else sample(true); // paused: repaint the frozen frame (e.g. after switching back to this tab)
}

setInterval(attach, 1000);
document.addEventListener("yt-navigate-finish", () => { cur = null; refresh(); });
document.addEventListener("visibilitychange", () => (document.hidden ? pauseLoop() : refresh()));
window.addEventListener("pagehide", clear);
refresh();
