# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Static HTML/CSS in `docs/` (index.html, privacy.html), served via GitHub Pages. No build step; keep it that way unless the user changes it. The browser extension itself lives in `extension/` and is out of focus for design work.

## Users

YouTube-heavy Firefox users, including fans of the "Ambient light for YouTube" add-on. They watch long sessions in Firefox and care about how the browser chrome looks around the video. Job: decide quickly whether to install, then install from addons.mozilla.org.

## Product Purpose

Ambient Toolbar for YouTube is a Firefox add-on that tints the tab bar and toolbar in real time to match the colors along the top of the playing video, so the glow continues from the page into the browser chrome. The website exists to show that effect and get visitors to install the add-on. Success is an install click-through to AMO.

## Positioning

It colors the browser's own toolbar and tab bar (not just the page), as a left-to-right gradient that follows the video's top edge, with flicker-free updates, black-bar handling and readable text switching. It is calibrated to blend with Ambient light for YouTube, but works on its own.

## Operating Context

Firefox 142+ desktop only. Runs entirely on-device, reading the video's colors live. Visitors judge it by seeing real screenshots of a tinted Firefox window. Settings include presets (Default, Recommended, Subtle, Vivid, Cinema, Gaming, Solid) and import/export of settings.

## Capabilities and Constraints

- Firefox 142+ only; no Chrome or Safari version exists. Do not imply otherwise.
- No data collected or sent anywhere; the site must not add trackers or analytics.
- Independent project: it pairs with, but is not affiliated with or endorsed by, Ambient light for YouTube. Do not imply endorsement.
- MIT licensed. Source and releases on GitHub (mhmd-ra/ambient-toolbar). Install link: https://addons.mozilla.org/firefox/addon/ambient-toolbar-for-youtube/

## Brand Commitments

Name: "Ambient Toolbar for YouTube". Existing icon at `docs/assets/icon.png`. No other binding visual or voice constraints were stated.

## Evidence on Hand

Real screenshots in `docs/assets/screenshots/` (ocean, liquids, gradient, witcher) and `docs/assets/settings.png`. Privacy page at `docs/privacy.html`. Absent and must not be fabricated: user counts, ratings, reviews, testimonials, press.

## Product Principles

1. Show the effect before explaining it; real screenshots are the proof.
2. Make the single next step (install on Firefox) obvious at all times.
3. Be honest about scope: Firefox only, independent, nothing collected.
4. Respect the audience's taste for polish; the page should feel as calm as the product.

## Accessibility & Inclusion

No product-specific standard established. Note the product auto-switches text/icon contrast for readability; the site should hold itself to at least WCAG AA.
