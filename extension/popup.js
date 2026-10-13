// Settings panel, styled after Ambient Light for YouTube.
const pct = v => Math.round(v * 100) + "%";
const SECTIONS = [
  { title: "Ambient light", open: true, items: [
    { key: "gradient", type: "toggle", label: "Gradient glow", hint: "Off = solid colors (smoothest)" },
    { key: "colorMode", type: "select", label: "Color picking", options: { natural: "Natural", vivid: "Vivid" }, hint: "Natural matches Ambient light for YouTube" },
    { key: "skipBars", type: "toggle", label: "Remove black bars", hint: "Ignore letterbox bars at the top of the video" },
    { key: "blur", type: "range", label: "Blur", min: 0, max: 6, step: 1, fmt: v => v === 0 ? "Off" : v, hint: "Blends neighbouring colors together" },
    { key: "sampleArea", type: "range", label: "Edge size", min: 0.05, max: 1, step: 0.05, fmt: pct, hint: "How much of the video's top edge the colors come from" },
    { key: "edgeFade", type: "range", label: "Spread fade", min: 0, max: 1, step: 0.05, fmt: pct, hint: "Darkens the glow toward the left and right sides" },
    { key: "zones", type: "range", label: "Color zones", min: 4, max: 32, step: 1, fmt: v => v, hint: "Detail of the gradient across the header", adv: true }
  ]},
  { title: "Filters", open: true, items: [
    { key: "brightness", type: "range", label: "Brightness", min: 0.3, max: 1.4, step: 0.05, fmt: pct },
    { key: "saturation", type: "range", label: "Saturation", min: 0, max: 2.5, step: 0.05, fmt: pct },
    { key: "contrast", type: "range", label: "Contrast", min: 0.5, max: 1.8, step: 0.05, fmt: pct, adv: true },
    { key: "temperature", type: "range", label: "Color temperature", min: -50, max: 50, step: 1, fmt: v => v > 0 ? "+" + v + " warm" : v < 0 ? v + " cool" : "Neutral", adv: true }
  ]},
  { title: "Toolbar", open: false, items: [
    { key: "toolbarTint", type: "range", label: "Toolbar shade", min: 0, max: 0.7, step: 0.01, fmt: pct, hint: "Darkens the toolbar so the glow sits behind it" },
    { key: "textColor", type: "select", label: "Text & icons", options: { auto: "Auto", light: "Light", dark: "Dark" } }
  ]},
  { title: "Motion", open: false, items: [
    { key: "fadeMs", type: "range", label: "Fade in duration", min: 50, max: 2000, step: 50, fmt: v => v + "ms", hint: "How quickly the colors follow the video" },
    { key: "glowFps", type: "range", label: "Glow updates", min: 2, max: 14, step: 1, fmt: v => v + "/s", hint: "Lower this if the gradient flickers", adv: true }
  ]}
];

const els = {};
const save = (k, v) => browser.storage.local.set({ [k]: v });

// Tiny DOM helper (no innerHTML, as required for AMO review).
function h(tag, attrs = {}, ...kids) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") e.className = v; else e.setAttribute(k, v);
  }
  for (const c of kids) e.append(c);
  return e;
}
const toggle = () => { const i = h("input", { type: "checkbox" }); return [h("label", { class: "sw" }, i, h("span")), i]; };

function build() {
  const root = document.getElementById("sections");
  for (const sec of SECTIONS) {
    const d = h("details", {}, h("summary", {}, sec.title));
    d.open = sec.open;
    for (const it of sec.items) {
      const row = h("div", { class: "ctl" + (it.adv ? " adv" : "") });
      let input;
      if (it.type === "toggle") {
        const [sw, i] = toggle();
        input = i;
        row.append(h("div", { class: "top" }, h("span", {}, it.label), sw));
        input.addEventListener("input", () => save(it.key, input.checked));
      } else if (it.type === "select") {
        input = h("select");
        for (const [v, t] of Object.entries(it.options)) input.add(new Option(t, v));
        row.append(h("div", { class: "top" }, h("span", {}, it.label), input));
        input.addEventListener("input", () => save(it.key, input.value));
      } else {
        const val = h("span", { class: "val" });
        input = h("input", { type: "range", min: it.min, max: it.max, step: it.step });
        row.append(h("div", { class: "top" }, h("span", {}, it.label), val), input);
        input.addEventListener("input", () => {
          const v = Number(input.value);
          val.textContent = it.fmt(v);
          save(it.key, v);
        });
      }
      if (it.hint) row.append(h("div", { class: "hint" }, it.hint));
      els[it.key] = { it, input, row };
      d.append(row);
    }
    root.append(d);
  }
  const p = document.getElementById("presets");
  for (const name of Object.keys(AT_PRESETS)) {
    const b = h("button", { title: "Apply the " + name + " preset" }, name);
    b.addEventListener("click", () => {
      const c = { ...AT_DEFAULTS, ...AT_PRESETS[name], enabled: true };
      browser.storage.local.set(c);
      show(c);
    });
    p.append(b);
  }
}

function show(c) {
  document.getElementById("enabled").checked = c.enabled;
  for (const k in els) {
    const { it, input, row } = els[k];
    if (it.type === "toggle") input.checked = c[k];
    else if (it.type === "select") input.value = c[k];
    else { input.value = c[k]; row.querySelector(".val").textContent = it.fmt(Number(c[k])); }
  }
}

build();
browser.storage.local.get({ ...AT_DEFAULTS, uiAdvanced: false }).then(c => {
  show(c);
  document.getElementById("advanced").checked = c.uiAdvanced;
  document.body.classList.toggle("advanced", c.uiAdvanced);
});
document.getElementById("enabled").addEventListener("input", e => save("enabled", e.target.checked));
document.getElementById("advanced").addEventListener("input", e => {
  document.body.classList.toggle("advanced", e.target.checked);
  save("uiAdvanced", e.target.checked);
});
document.getElementById("importAL").addEventListener("click", () => {
  // File pickers close toolbar popups in Firefox, so importing happens in its own tab.
  browser.tabs.create({ url: browser.runtime.getURL("import.html") });
  window.close();
});
document.getElementById("reset").addEventListener("click", () => {
  browser.storage.local.set(AT_DEFAULTS);
  show(AT_DEFAULTS);
});
