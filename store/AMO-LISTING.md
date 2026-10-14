# addons.mozilla.org listing

Copy these into the fields when you submit on addons.mozilla.org.

## Name
Ambient Toolbar for YouTube

## Add-on URL (slug)
ambient-toolbar-for-youtube

## Summary (max 250 characters)
Your Firefox toolbar glows with the colors of the YouTube video you're watching. It's like ambient light that reaches past the video and into the browser. Fully adjustable, flicker-free and private.

## Description
Ambient Toolbar tints your Firefox tab bar and toolbar in real time to match the YouTube video you're watching. It's the perfect companion to Ambient light for YouTube: that add-on puts a glow around the video, and this one carries it up into the browser.

<b>Features</b>
• Gradient glow: a left-to-right glow across the whole header that follows the colors along the top of the video
• Or Solid mode: the tab bar and toolbar fade smoothly to the video's main color
• Flicker-free updates and smooth color fading
• Keeps its color while paused, updates when you seek, and restores your theme when you leave the video or switch tabs
• Text and icons switch between light and dark automatically so they stay readable
• Ignores black letterbox bars
• Works on watch pages and Shorts

<b>Pairs with Ambient light for YouTube</b>
The default look is calibrated to blend with Ambient light's glow, and you can import its settings export (toolbar popup → Import / Export…). Recommended settings for both add-ons: https://github.com/mhmd-ra/ambient-toolbar/tree/main/presets Works on its own too.

<b>Make it yours</b>
Blur, edge size, spread fade, color zones, brightness, saturation, contrast, color temperature, toolbar shade, fade speed and glow update rate. Presets: Default, Recommended, Subtle, Vivid, Cinema, Gaming and Solid. Export your settings to back them up or share them. Turn on Advanced to see every option.

<b>Private</b>
Everything happens on your device. No data is collected or sent anywhere.

<b>Notes</b>
• DRM-protected videos (some movies and rentals) can't be sampled.
• If you use a custom Firefox theme, it's replaced while a video plays and restored afterwards.

Open source: https://github.com/mhmd-ra/ambient-toolbar
Independent project, not affiliated with YouTube, Google, or Ambient light for YouTube.

## Categories
Appearance; Photos, Music & Videos

## Tags
youtube, ambient light, theme, toolbar, color, dynamic theme

## Support / homepage
- Homepage: https://mhmd-ra.github.io/ambient-toolbar/
- Support site: https://github.com/mhmd-ra/ambient-toolbar/issues

## License
MIT

## Privacy policy
Paste the contents of PRIVACY.md (or link https://mhmd-ra.github.io/ambient-toolbar/privacy.html).

## Notes to reviewer
No build step, minification or remote code: the uploaded files are the source.
- content.js runs on youtube.com and draws the playing video into a small canvas (12×4 pixels by default) to read its colors. Nothing is stored or transmitted.
- background.js turns those colors into a theme with browser.theme.update(windowId, …) and resets it with browser.theme.reset(windowId).
- import.html opens in a tab from the popup. It reads a settings JSON file the user picks (local only), and Export saves the current settings as a JSON download (blob URL, no downloads permission). It's converted to our settings and saved with storage.local.
- To test: open any YouTube video and press play. The tab bar and toolbar take on the video's colors. The toolbar button opens the settings.

## Screenshots to upload
1. docs/assets/screenshots/ocean.jpg: "Underwater scene: the toolbar picks up the teal water."
2. docs/assets/screenshots/liquids.jpg: "Abstract liquids: warm reds carry across the tab bar."
3. docs/assets/screenshots/gradient.jpg: "Soft gradients: pink and violet across the whole header."
4. docs/assets/screenshots/witcher.jpg: "Games and films: subtle tones for darker scenes."
5. docs/assets/settings.png: "Settings panel: presets, filters, motion, and importing Ambient light settings."
