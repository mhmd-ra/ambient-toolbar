// Ambient Toolbar for YouTube — background
const FRAME_MS = 80;        // max color updates per window (~12/s)
const MIN_DELTA = 2;        // skip invisible changes

let cfg = { ...AT_DEFAULTS };
browser.storage.local.get(AT_DEFAULTS).then(c => (cfg = c));
browser.storage.onChanged.addListener(ch => {
  for (const k in ch) cfg[k] = ch[k].newValue;
  lastSent.clear(); // repaint with new settings
  imgCache.clear();
  if (!cfg.enabled) browser.windows.getAll().then(ws => ws.forEach(w => resetWindow(w.id)));
});

const pending = new Map(), timers = new Map(), lastSent = new Map(), gen = new Map();
// Gradient mode, flicker-free:
//  1) The picture is a 1-px-tall strip repeated downward (tiny = encodes and decodes almost instantly).
//  2) Double buffering: the new strip is layered ON TOP of the previous one. The previous one is
//     already decoded, so if the new one needs a moment, the old frame shows instead of a blank gap.
const imgCache = new Map();  // windowId -> { cur, prev, t }

const clamp = v => Math.max(0, Math.min(255, Math.round(v)));
const css = c => `rgb(${c.map(clamp).join(",")})`;
const lum = c => (0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]) / 255;
const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);

// Saturation boost + brightness, via HSL.
function grade(c) {
  const t = cfg.temperature;
  c = [c[0] + t, c[1] + t * 0.15, c[2] - t].map(v => (v - 128) * cfg.contrast + 128);
  let [r, g, b] = c.map(v => Math.max(0, Math.min(255, v)) / 255);
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
    h /= 6;
  }
  s = Math.min(1, s * cfg.saturation);
  l = Math.min(1, l * cfg.brightness);
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
  const f = t => {
    t = (t + 1) % 1;
    return t < 1 / 6 ? p + (q - p) * 6 * t : t < 0.5 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p;
  };
  return s === 0 ? [l * 255, l * 255, l * 255] : [f(h + 1 / 3) * 255, f(h) * 255, f(h - 1 / 3) * 255];
}

function avg(cols) {
  const s = [0, 0, 0];
  for (const c of cols) c.forEach((v, i) => (s[i] += v));
  return s.map(v => v / cols.length);
}

// Weighted average: vivid, bright columns count more, so the result isn't a muddy gray.
function keyColor(cols) {
  if (cfg.colorMode === "natural") return avg(cols);
  const s = [0, 0, 0]; let wsum = 0;
  for (const c of cols) {
    const mx = Math.max(...c), mn = Math.min(...c);
    const w = 0.15 + (mx ? (mx - mn) / mx : 0) * (mx / 255);
    c.forEach((v, i) => (s[i] += v * w));
    wsum += w;
  }
  return s.map(v => v / wsum);
}

// Soften: average each zone with its neighbours (radius = blur setting).
function soften(cols) {
  const r = Math.round(cfg.blur);
  if (r <= 0) return cols;
  return cols.map((_, i) => {
    const s = [0, 0, 0]; let n = 0;
    for (let j = Math.max(0, i - r); j <= Math.min(cols.length - 1, i + r); j++) {
      cols[j].forEach((v, k) => (s[k] += v)); n++;
    }
    return s.map(v => v / n);
  });
}

function changed(a, b) {
  if (!a) return true;
  for (let i = 0; i < 3; i++) if (Math.abs(a[i] - b[i]) >= MIN_DELTA) return true;
  return false;
}

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");

async function glowImages(windowId, cols) {
  const c = imgCache.get(windowId);
  const now = Date.now();
  if (c && now - c.t < 1000 / cfg.glowFps) return c; // reuse: same URLs = no reload
  let win;
  try { win = await browser.windows.get(windowId); } catch (e) { return null; }
  const w = Math.max(200, win.width);
  canvas.width = w; canvas.height = 1;
  const g = ctx.createLinearGradient(0, 0, w, 0);
  cols.forEach((col, i) => {
    const x = i / (cols.length - 1);
    const edge = 1 - cfg.edgeFade * Math.pow(Math.abs(2 * x - 1), 2); // vignette toward the sides
    g.addColorStop(x, css(grade(col).map(v => v * edge)));
  });
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, 1);
  const url = canvas.toDataURL("image/png");
  const next = { cur: url, prev: c ? c.cur : url, t: now };
  imgCache.set(windowId, next);
  return next;
}

async function apply(windowId, cols) {
  const myGen = gen.get(windowId) || 0;
  cols = soften(cols);
  const key = grade(keyColor(cols));
  if (!changed(lastSent.get(windowId), key) && !cfg.gradient) return;
  lastSent.set(windowId, key);

  const frame = key;
  const toolbar = mix(key, [0, 0, 0], cfg.toolbarTint);
  const light = cfg.textColor === "dark" ? true : cfg.textColor === "light" ? false : lum(toolbar) > 0.55;
  const text = light ? "#111111" : "#ffffff";

  const theme = {
    colors: {
      frame: css(frame),
      frame_inactive: css(mix(frame, [0, 0, 0], 0.15)),
      tab_background_text: cfg.textColor === "auto" ? (lum(frame) > 0.55 ? "#111111" : "#ffffff") : text,
      tab_selected: css(toolbar),
      tab_text: text,
      tab_line: css(mix(key, [255, 255, 255], 0.35)),
      toolbar: css(toolbar),
      toolbar_text: text,
      icons: text,
      toolbar_field: light ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.30)",
      toolbar_field_text: text,
      toolbar_field_focus: light ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.5)",
      toolbar_field_text_focus: text,
      toolbar_top_separator: css(toolbar),
      toolbar_bottom_separator: css(toolbar),
      popup: css(mix(toolbar, [0, 0, 0], 0.3)),
      popup_text: "#ffffff",
      sidebar: css(mix(toolbar, [0, 0, 0], 0.3)),
      sidebar_text: "#ffffff"
    }
  };

  if (cfg.gradient) {
    const imgs = await glowImages(windowId, cols);
    if (imgs) {
      // First layer is drawn on top: new strip over the previous (already-decoded) one.
      theme.images = { additional_backgrounds: [imgs.cur, imgs.prev] };
      theme.properties = {
        additional_backgrounds_alignment: ["top", "top"],
        additional_backgrounds_tiling: ["repeat-y", "repeat-y"]
      };
      // Translucent bars let the glow through; the frame color matches the glow's average,
      // so while Firefox swaps the image the flash is barely visible.
      // Slight dark tint on the toolbar stands in for the old bottom fade.
      theme.colors.toolbar = light ? `rgba(255,255,255,${cfg.toolbarTint * 0.4})` : `rgba(0,0,0,${cfg.toolbarTint})`;
      theme.colors.tab_selected = light ? "rgba(255,255,255,0.20)" : "rgba(0,0,0,0.25)";
      theme.colors.toolbar_top_separator = "rgba(0,0,0,0)";
      theme.colors.toolbar_bottom_separator = "rgba(0,0,0,0)";
    }
  }

  if ((gen.get(windowId) || 0) !== myGen) return;
  try {
    await browser.theme.update(windowId, theme);
  } catch (e) {
    console.warn("[ambient-toolbar] theme.update failed:", e && e.message, e);
  }
}

function flush(windowId) {
  const cols = pending.get(windowId);
  pending.delete(windowId);
  if (!cols) { timers.delete(windowId); return; }
  apply(windowId, cols).finally(() => {
    timers.set(windowId, setTimeout(() => flush(windowId), FRAME_MS));
  });
}

function resetWindow(windowId) {
  gen.set(windowId, (gen.get(windowId) || 0) + 1);
  pending.delete(windowId);
  lastSent.delete(windowId);
  imgCache.delete(windowId);
  clearTimeout(timers.get(windowId));
  timers.delete(windowId);
  browser.theme.reset(windowId).catch(() => {});
}

browser.runtime.onMessage.addListener((msg, sender) => {
  if (!sender.tab) return;
  const windowId = sender.tab.windowId;
  if (msg.type === "reset") { if (sender.tab.active) resetWindow(windowId); return; }
  if (msg.type !== "colors" || !sender.tab.active || !cfg.enabled) return;
  pending.set(windowId, msg.cols);
  if (!timers.has(windowId)) flush(windowId);
});

// Switching tabs restores the normal theme; a YouTube tab repaints itself when shown.
browser.tabs.onActivated.addListener(({ windowId }) => resetWindow(windowId));
