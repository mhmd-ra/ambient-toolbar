<p align="center">
  <img src="docs/assets/icon.png" width="96" alt="Ambient Toolbar icon">
</p>

<h1 align="center">Ambient Toolbar for YouTube</h1>

<p align="center">
  A Firefox add-on that tints your tab bar and toolbar in real time to match the YouTube video you're watching.
  <br>
  <a href="https://addons.mozilla.org/firefox/addon/ambient-toolbar-for-youtube/"><b>Get it for Firefox</b></a> ·
  <a href="https://mhmd-ra.github.io/ambient-toolbar/">Website</a> ·
  <a href="https://github.com/mhmd-ra/ambient-toolbar/releases">Releases</a> ·
  <a href="https://github.com/mhmd-ra/ambient-toolbar/issues">Report a bug</a>
</p>

<p align="center">
  <img alt="Firefox 142+" src="https://img.shields.io/badge/Firefox-142%2B-FF7139?logo=firefoxbrowser&logoColor=white">
  <img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-blue">
  <img alt="No data collected" src="https://img.shields.io/badge/data%20collected-none-success">
</p>

<p align="center">
  <img src="docs/assets/screenshots/ocean.jpg" alt="Firefox tab bar and toolbar tinted teal to match an underwater YouTube video" width="760">
</p>

<table>
  <tr>
    <td><img src="docs/assets/screenshots/liquids.jpg" alt="Toolbar glowing red and amber with an abstract liquid video"></td>
    <td><img src="docs/assets/screenshots/gradient.jpg" alt="Toolbar glowing pink and violet with a soft color-gradient video"></td>
    <td><img src="docs/assets/screenshots/witcher.jpg" alt="Toolbar in muted grey-green tones with a dark forest game video"></td>
  </tr>
</table>

---

## Features

- 🌈 **Gradient glow:** a left-to-right glow across the whole header that follows the colors along the top of the video.
- 🎚️ **Fully adjustable:** blur, edge size, spread fade, brightness, saturation, contrast, color temperature and more, plus presets.
- ✨ **Flicker-free:** the glow is a 1-pixel strip with double buffering, so updates don't flash.
- ⏸️ **Smart:** keeps its color while paused, updates when you seek, and restores your theme when you leave the video or switch tabs.
- 🔤 **Readable:** text and icons switch between light and dark automatically.
- 🎬 **Black bars ignored:** letterboxed videos don't darken the toolbar.
- 🤝 **Matches Ambient light for YouTube:** the default look is calibrated to blend with its glow, and you can import its settings.
- 📺 **Watch pages and Shorts:** the muted previews on the home page are ignored.
- 🔒 **Private:** everything runs on your device. No data is collected or sent anywhere.

## Settings

Open the toolbar button, or go to **Add-ons → Ambient Toolbar → Options**. Changes apply live, even while paused. Turn on **Advanced** to see every option.

<img src="docs/assets/settings.png" alt="Settings panel" width="300" align="right">

**Presets:** Default, Recommended (the settings from the screenshots), Subtle, Vivid, Cinema, Gaming, Solid.

**Settings file:** popup → **Import / Export…** to back up or share your settings, or to import an Ambient light for YouTube export.

| Section | Setting | What it does |
|---|---|---|
| Ambient light | Gradient glow | Left-to-right glow picture; off = solid colors |
| | Color picking | Natural (plain average, like Ambient light for YouTube) or Vivid (bright parts count more) |
| | Remove black bars | Ignore letterbox bars at the top of the video |
| | Blur | Blends neighbouring colors together |
| | Edge size | How much of the video's top edge the colors come from |
| | Spread fade | Darkens the glow toward the left and right sides |
| | Color zones* | Detail of the gradient across the header |
| Filters | Brightness, Saturation | Overall look of the colors |
| | Contrast*, Color temperature* | Punchier colors; warmer or cooler tint |
| Toolbar | Toolbar shade | Darkens the toolbar so the glow sits behind it |
| | Text & icons | Auto, light or dark |
| Motion | Fade in duration | How quickly colors follow the video |
| | Glow updates* | Glow redraws per second; lower it if you see flicker |

<sub>* Advanced</sub>

<br clear="right">

## Works with Ambient light for YouTube

Ambient Toolbar is designed to pair with [Ambient light for YouTube](https://github.com/WesselKroos/youtube-ambilight), which adds the glow around the video itself. With both installed, the glow continues from the page up into the tab bar and toolbar. It also works fine on its own.

- **Matching out of the box:** the default settings are calibrated to blend with Ambient light's glow.
- **Import its settings:** open the toolbar popup → **Import…**, and choose an Ambient light settings export. Its edge size, spread, fading and black-bar settings are converted to matching toolbar settings.
- **Recommended pair:** [`presets/`](presets) has the settings used for the screenshots. Import `ambient-light-settings.json` into Ambient light, then either import `ambient-toolbar-settings.json` into Ambient Toolbar or just click its **Recommended** preset.

Ambient Toolbar is an independent project. It isn't affiliated with Ambient light for YouTube or its developer and doesn't use its code.

## Install

- **Firefox Add-ons (recommended):** [addons.mozilla.org](https://addons.mozilla.org/firefox/addon/ambient-toolbar-for-youtube/), with automatic updates.
- **GitHub Releases:** download the signed `.xpi` from [Releases](https://github.com/mhmd-ra/ambient-toolbar/releases) and drag it into a Firefox window.

Requires Firefox 142 or newer (desktop).

## How it works

Firefox doesn't let add-ons draw into the browser's toolbar, but it does let them change the window's theme.

1. **Sample:** `content.js` shrinks the top part of the playing `<video>` (skipping black bars) to a tiny canvas, 12×4 pixels by default, about 20 times a second, using `requestVideoFrameCallback`.
2. **Smooth:** colors are eased over time so scene cuts blend instead of jumping.
3. **Tint:** `background.js` grades the colors with your settings and calls `browser.theme.update(windowId, …)` for that window only.
   - **Solid mode:** only theme colors change, which repaints without flashing.
   - **Gradient mode:** the glow is a 1-pixel-tall strip repeated down the header (`repeat-y`). Each new strip is layered on top of the previous, already-loaded one, so Firefox never shows a blank frame.

## Development

```bash
git clone https://github.com/mhmd-ra/ambient-toolbar.git
cd ambient-toolbar
npm install
npm start        # launches Firefox with the add-on loaded (auto-reloads on save)
npm run lint     # Mozilla's add-on linter
npm run build    # creates dist/ambient_toolbar_for_youtube-<version>.zip
```

Or, without Node: open `about:debugging#/runtime/this-firefox`, click **Load Temporary Add-on…**, and choose `extension/manifest.json`.

```
extension/        the add-on itself (this is what gets packaged)
  manifest.json
  content.js      samples the video on youtube.com
  background.js   grades colors and updates the theme
  settings.js     defaults and presets (shared)
  popup.html/js   settings panel (toolbar popup + options page)
  import.html/js  import/export page (opens in a tab)
  icons/
presets/          matching settings files for Ambient light for YouTube and Ambient Toolbar
docs/             GitHub Pages website
store/            text for the addons.mozilla.org listing
```

## Known limitations

- DRM-protected videos (some movies and rentals) can't be sampled, so the toolbar stays unchanged.
- If you use a custom Firefox theme, it's replaced while a video plays and restored afterwards.
- Firefox limits how fast themes can update, so the glow is smooth but not as instant as an in-page effect.

## Privacy

No data is collected, stored or sent anywhere. See [PRIVACY.md](PRIVACY.md).

## Credits

Built with the help of [Claude](https://claude.ai) (Opus 5.5) by Anthropic, covering the code, the settings panel, the website and the docs.

## License

[MIT](LICENSE) © 2026 mhmd-ra. Not affiliated with YouTube, Google, or Ambient light for YouTube.
