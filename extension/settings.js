// Shared defaults (loaded by background, content script and popup/options page).
var AT_DEFAULTS = {
  enabled: true,
  // Effect
  gradient: true,       // left-to-right glow picture; false = solid colors
  zones: 12,            // number of color zones across the gradient
  blur: 3,              // softens the gradient by blending neighbouring zones
  edgeFade: 0,          // darkens the left/right ends of the gradient (vignette)
  sampleArea: 0.4,      // how much of the video (from the top) the colors come from
  colorMode: "natural", // natural = plain average (like Ambient light for YouTube); vivid = bright parts count more
  skipBars: true,       // ignore black letterbox bars at the top of the video
  // Color
  brightness: 0.6,      // the in-page glow fades into the page, so the toolbar is dimmer than the video
  contrast: 1.0,
  saturation: 1.0,
  temperature: 0,       // -50 cool .. +50 warm
  toolbarTint: 0.05,    // dark tint over the toolbar for readability
  textColor: "auto",    // auto | light | dark
  // Motion
  fadeMs: 350,          // color fade time constant
  glowFps: 12           // glow picture redraws per second
};

// Calibrated against Ambient light for YouTube's glow: at toolbar height it is ~60% as bright as the video.
var AT_AL_GLOW = { brightness: 0.6, saturation: 0.9 };

var AT_PRESETS = {
  Default: {},
  // The tested pair from presets/ (used for the screenshots), matched to Ambient light for YouTube.
  Recommended: { gradient: true, zones: 12, blur: 0, edgeFade: 0.2, sampleArea: 0.35, colorMode: "natural", skipBars: true, brightness: 0.6, contrast: 1, saturation: 1, temperature: 0, toolbarTint: 0, textColor: "auto", fadeMs: 350, glowFps: 14 },
  Subtle:  { brightness: 0.45, saturation: 0.85, contrast: 0.9, fadeMs: 800, blur: 3, toolbarTint: 0.35 },
  Vivid:   { colorMode: "vivid", brightness: 1.0, saturation: 1.7, contrast: 1.15, fadeMs: 250, blur: 0, toolbarTint: 0.12 },
  Cinema:  { brightness: 0.7, saturation: 1.1, contrast: 1.1, edgeFade: 0.6, temperature: 8, fadeMs: 600, blur: 2 },
  Gaming:  { colorMode: "vivid", brightness: 1.0, saturation: 1.5, fadeMs: 150, glowFps: 12, zones: 24, blur: 0 },
  Solid:   { gradient: false, saturation: 1.3, fadeMs: 400 }
};

// Convert an Ambient Light for YouTube settings export into our settings.
function atFromAmbientLight(al) {
  const n = (v, d) => (typeof v === "number" && isFinite(v) ? v : d);
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  return {
    ...AT_DEFAULTS,
    sampleArea: clamp(n(al.edge, 50) / 100, 0.05, 1),
    blur: clamp(Math.round(n(al.spread, 200) / 100 + n(al.blur, 0) / 20), 0, 6),
    brightness: clamp(AT_AL_GLOW.brightness * n(al.brightness, 100) / 100, 0.3, 1.4),
    saturation: clamp(AT_AL_GLOW.saturation * n(al.saturation, 100) / 100, 0, 2.5),
    contrast: clamp(n(al.contrast, 100) / 100, 0.5, 1.8),
    fadeMs: clamp(Math.round((100 + n(al.frameFading, 0) * 1000 / 60) / 50) * 50, 50, 2000),
    skipBars: al.detectHorizontalBarSizeEnabled !== false,
    ...exactBlock(al.ambientToolbar)
  };
}

// Optional "ambientToolbar" block in the file: exact values for this add-on (Ambient Light ignores it).
function exactBlock(b) {
  if (!b || typeof b !== "object") return {};
  const out = {};
  for (const k in AT_DEFAULTS) {
    if (k in b && typeof b[k] === typeof AT_DEFAULTS[k]) out[k] = b[k];
  }
  return out;
}
