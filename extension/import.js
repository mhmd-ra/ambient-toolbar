const status = document.getElementById("status");
function say(msg, ok) { status.textContent = msg; status.className = ok ? "ok" : "err"; }

async function importText(text) {
  try {
    const data = JSON.parse(text);
    if (!data || typeof data !== "object") throw new Error("not a settings object");
    const c = { ...AT_DEFAULTS, ...atFromAmbientLight(data), enabled: true };
    await browser.storage.local.set(c);
    const pct = v => Math.round(v * 100) + "%";
    say("Imported ✓ Edge size " + pct(c.sampleArea) + ", Blur " + c.blur + ", Brightness " + pct(c.brightness) +
        ", Saturation " + pct(c.saturation) + ", Fade " + c.fadeMs + "ms. Refresh your YouTube tab.", true);
  } catch (e) {
    say("Couldn't import: " + e.message, false);
  }
}

document.getElementById("file").addEventListener("change", async e => {
  const f = e.target.files[0];
  if (f) await importText(await f.text());
  e.target.value = "";
});
document.getElementById("apply").addEventListener("click", () => importText(document.getElementById("paste").value));

const drop = document.getElementById("drop");
drop.addEventListener("dragover", e => { e.preventDefault(); drop.classList.add("over"); });
drop.addEventListener("dragleave", () => drop.classList.remove("over"));
drop.addEventListener("drop", async e => {
  e.preventDefault(); drop.classList.remove("over");
  const f = e.dataTransfer.files[0];
  if (f) await importText(await f.text());
});

document.getElementById("export").addEventListener("click", async () => {
  const c = await browser.storage.local.get(AT_DEFAULTS);
  const out = {};
  for (const k in AT_DEFAULTS) out[k] = c[k];
  const file = { ambientToolbar: out };
  const url = URL.createObjectURL(new Blob([JSON.stringify(file, null, 2)], { type: "application/json" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = "ambient-toolbar-settings.json";
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
  say("Exported ✓ Saved as ambient-toolbar-settings.json in your downloads.", true);
});
